import {decodeUploadedImage,UploadedImageError} from "@/lib/uploaded-image";
import { and, desc, eq, inArray, like, ne, or, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { companies, marketplaceListings } from "@/db/schema";
import {
  companyIdSchema, companyImageUrl, companyMediaKeys, companySchema,
  hasRestrictedCompanyProduct, type CompanyPayload, type CompanyRecord,
} from "@/lib/company";

type CompanyRow = typeof companies.$inferSelect;
export class CompanyWriteError extends Error {
  constructor(public code: string, public status = 400) { super(code); }
}

export function companyFromRow(row: CompanyRow, includeRevision = false): CompanyRecord {
  // Only validated fields leave the server; malformed historical JSON fails closed.
  const parsed = companySchema.parse(JSON.parse(row.profileJson));
  const { logoDataUrl, galleryDataUrls, products, ...profile } = parsed;
  void logoDataUrl; void galleryDataUrls;
  return {
    ...profile, id: row.id, name: row.name, category: row.category as CompanyRecord["category"],
    state: row.state as CompanyRecord["state"], municipality: row.municipality, description: row.description,
    status: row.status as CompanyRecord["status"], createdAt: row.createdAt, updatedAt: row.updatedAt,
    ...(includeRevision ? { revision: row.revision } : {}),
    logoUrl: companyImageUrl(profile.logoKey),
    galleryUrls: profile.galleryKeys.map(companyImageUrl).filter((value): value is string => !!value),
    products: products.map(({ imageDataUrl, ...product }) => { void imageDataUrl; return { ...product, imageUrl: companyImageUrl(product.imageKey) }; }),
  };
}

function companyProductIsAllowed(listing: typeof marketplaceListings.$inferSelect) {
  return !["Vitaminas y medicinas", "Fertilizantes y control"].includes(listing.category)
    && !hasRestrictedCompanyProduct(`${listing.category} ${listing.title} ${listing.description}`);
}

async function removeUnavailableMarketLinks(rows: CompanyRow[], includeRevision = false): Promise<CompanyRecord[]> {
  const records = rows.map(row => companyFromRow(row, includeRevision));
  const ids = [...new Set(records.flatMap(record => record.products.map(product => product.marketplaceId)).filter(Boolean))];
  if (!ids.length) return records;
  const db = await getDb();
  const available = await db.select().from(marketplaceListings).where(and(inArray(marketplaceListings.id, ids), eq(marketplaceListings.status, "active"), eq(marketplaceListings.deleted, false)));
  const links = new Map(available.filter(companyProductIsAllowed).map(row => [row.id, row.ownerId]));
  return records.map((record, index) => ({ ...record, products: record.products.map(product => ({ ...product, marketplaceId: links.get(product.marketplaceId) === rows[index].ownerId ? product.marketplaceId : "" })) }));
}

export async function listCompanies(filters: { category?: string; state?: string; query?: string; limit?: number } = {}): Promise<CompanyRecord[]> {
  const db = await getDb();
  const conditions: SQL[] = [eq(companies.status, "active")];
  if (filters.category && filters.category !== "Todas") conditions.push(eq(companies.category, filters.category));
  if (filters.state && filters.state !== "Todos") conditions.push(eq(companies.state, filters.state));
  if (filters.query?.trim()) {
    const match = `%${filters.query.trim().slice(0, 100)}%`;
    conditions.push(or(like(companies.name, match), like(companies.description, match), like(companies.municipality, match), like(companies.category, match))!);
  }
  const limit = Math.min(100, Math.max(1, Math.trunc(filters.limit || 100)));
  const rows = await db.select().from(companies).where(and(...conditions)).orderBy(desc(companies.updatedAt)).limit(limit);
  return removeUnavailableMarketLinks(rows);
}

export async function findCompany(id: string): Promise<CompanyRecord | null> {
  if (!companyIdSchema.safeParse(id).success) return null;
  const db = await getDb();
  const rows = await db.select().from(companies).where(and(eq(companies.id, id), eq(companies.status, "active"))).limit(1);
  return (await removeUnavailableMarketLinks(rows))[0] || null;
}

export async function listOwnCompanies(ownerId: string): Promise<CompanyRecord[]> {
  const db = await getDb();
  const rows = await db.select().from(companies).where(and(eq(companies.ownerId, ownerId), ne(companies.status, "deleted"))).orderBy(desc(companies.updatedAt)).limit(100);
  return rows.map(row => companyFromRow(row, true));
}

export async function findOwnCompany(id: string, ownerId: string): Promise<CompanyRecord | null> {
  if (!companyIdSchema.safeParse(id).success) return null;
  const db = await getDb();
  const [row] = await db.select().from(companies).where(and(eq(companies.id, id), eq(companies.ownerId, ownerId), ne(companies.status, "deleted"))).limit(1);
  return row ? companyFromRow(row, true) : null;
}

/** Request identifiers and ownership are checked before any upload or write. */
export async function saveCompany(payload: CompanyPayload, ownerId: string, edit?: { id: string; expectedRevision: string }): Promise<CompanyRecord> {
  const db = await getDb();
  const existing = edit ? await findOwnCompany(edit.id, ownerId) : null;
  if (edit && !existing) throw new CompanyWriteError("company_not_found", 404);
  if (edit && existing?.revision !== edit.expectedRevision) throw new CompanyWriteError("company_changed_refresh_required", 409);
  const previousKeys = new Set(existing ? companyMediaKeys(existing) : []);
  const submittedKeys = [payload.logoKey, ...payload.galleryKeys, ...payload.products.map(product => product.imageKey)].filter((key): key is string => !!key);
  if (submittedKeys.some(key => !previousKeys.has(key))) throw new CompanyWriteError("company_image_not_owned", 403);
  const links = [...new Set(payload.products.map(product => product.marketplaceId).filter(Boolean))];
  if (links.length) {
    const listings = await db.select().from(marketplaceListings).where(and(inArray(marketplaceListings.id, links), eq(marketplaceListings.ownerId, ownerId), eq(marketplaceListings.status, "active"), eq(marketplaceListings.deleted, false)));
    if (links.some(id => !listings.some(listing => listing.id === id && companyProductIsAllowed(listing)))) throw new CompanyWriteError("company_marketplace_link_unavailable", 422);
  }
  const id = existing?.id || crypto.randomUUID();
  const revision = crypto.randomUUID();
  const now = new Date().toISOString();
  const { logoDataUrl, galleryDataUrls, products, ...base } = payload;
  const profile = { ...base, galleryKeys: [...base.galleryKeys], products: products.map(({ imageDataUrl, ...product }) => { void imageDataUrl; return product; }) };
  const uploads: Array<{ slot: string; image: ReturnType<typeof decodeCompanyImage>; assign: (key: string) => void }> = [];
  if (logoDataUrl) uploads.push({ slot: "logo", image: decodeCompanyImage(logoDataUrl), assign: key => { profile.logoKey = key; } });
  galleryDataUrls.forEach((data, index) => uploads.push({ slot: `gallery-${index}`, image: decodeCompanyImage(data), assign: key => { profile.galleryKeys.push(key); } }));
  products.forEach((product, index) => { if (product.imageDataUrl) uploads.push({ slot: `product-${index}`, image: decodeCompanyImage(product.imageDataUrl), assign: key => { profile.products[index].imageKey = key; } }); });
  // All inputs, ownership, references and image headers are validated before uploading.
  const uploaded: string[] = [];
  let bucket: R2Bucket | undefined;
  try {
    if (uploads.length) {
      const { env } = await import("cloudflare:workers");
      bucket = (env as unknown as { BUCKET?: R2Bucket }).BUCKET;
      if (!bucket) throw new CompanyWriteError("company_storage_unavailable", 503);
      for (const upload of uploads) {
        const key = `companies/${id}/${revision}/${upload.slot}.${upload.image.extension}`;
        await bucket.put(key, upload.image.bytes, { httpMetadata: { contentType: upload.image.mime, cacheControl: "private, no-store" } });
        uploaded.push(key); upload.assign(key);
      }
    }
    const values = { name: profile.name, category: profile.category, state: profile.state, municipality: profile.municipality, description: profile.description, profileJson: JSON.stringify(profile), status: "pending", revision, updatedAt: now };
    let rows: CompanyRow[];
    if (edit) rows = await db.update(companies).set(values).where(and(eq(companies.id, edit.id), eq(companies.ownerId, ownerId), eq(companies.revision, edit.expectedRevision), ne(companies.status, "deleted"))).returning();
    else rows = await db.insert(companies).values({ ...values, id, ownerId, createdAt: now }).returning();
    if (!rows.length) throw new CompanyWriteError("company_changed_refresh_required", 409);
    return companyFromRow(rows[0], true);
  } catch (error) {
    // Immutable upload keys cannot affect the prior live revision. Orphans remain inaccessible.
    if (bucket && uploaded.length) await bucket.delete(uploaded).catch(() => undefined);
    if (error instanceof CompanyWriteError) throw error;
    throw new CompanyWriteError("company_save_unavailable", 503);
  }
}

export async function withdrawCompany(id: string, ownerId: string, expectedRevision: string): Promise<void> {
  const db = await getDb();
  const rows = await db.update(companies).set({ status: "deleted", revision: crypto.randomUUID(), updatedAt: new Date().toISOString() }).where(and(eq(companies.id, id), eq(companies.ownerId, ownerId), eq(companies.revision, expectedRevision), ne(companies.status, "deleted"))).returning({ id: companies.id });
  if (!rows.length) throw new CompanyWriteError("company_changed_refresh_required", 409);
}

/** Validate raster MIME/signature/dimensions; SVG and unbounded originals are not accepted. */
export function decodeCompanyImage(dataUrl: string): { bytes: Uint8Array; mime: string; extension: string } {
  try { return decodeUploadedImage(dataUrl,{maxBytes:487_500,maxDimension:2048,maxPixels:4_000_000}); }
  catch (error) { throw new CompanyWriteError(error instanceof UploadedImageError && error.code === "invalid_image_dimensions" ? "company_invalid_image_dimensions" : "company_invalid_image"); }
}
