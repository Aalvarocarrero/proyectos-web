import { z } from "zod";
import { currencySchema } from "./exchange-rates";
import { venezuelanStates } from "@/lib/venezuela";

export const companyCategories = [
  "Agrotienda e insumos", "Maquinaria y repuestos", "Riego y agua", "Tecnología agropecuaria",
  "Alimentos y transformación", "Alimentos para animales", "Ferretería y construcción", "Transporte y logística", "Servicios agropecuarios",
  "Veterinaria y salud animal", "Empaques y materiales", "Otra empresa agropecuaria",
] as const;
export const companyServiceModes = ["Presencial", "En línea", "Presencial y en línea", "Visitas y entregas"] as const;
export const companyProductCategories = [
  "Maquinaria y repuestos", "Herramientas y cercas", "Riego y agua", "Tecnología agropecuaria",
  "Semillas y plantas", "Empaques y materiales", "Alimentos y cosechas", "Alimentos para animales", "Ferretería y construcción", "Servicios agropecuarios",
] as const;
export const COMPANY_CATALOG_NOTICE = "El catálogo admite productos y servicios de uso general. No publiques medicamentos, vacunas, plaguicidas, sustancias controladas ni otros productos regulados. Las empresas de salud animal pueden presentar sus servicios y datos de contacto.";
export const COMPANY_MAX_IMAGE_LENGTH = 650_000;
export const COMPANY_MAX_REQUEST_BYTES = 8 * 1024 * 1024;
export const companyIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{3,100}$/);
export const companyImageKeySchema = z.string().max(240).regex(/^companies\/[a-zA-Z0-9_-]{3,100}\/[a-zA-Z0-9_-]{16,100}\/(?:logo|gallery-\d+|product-\d+)\.(?:webp|png|jpg)$/);
const imageDataUrl = z.string().max(COMPANY_MAX_IMAGE_LENGTH).regex(/^data:image\/(?:webp|jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/);
const optionalText = (maximum: number) => z.string().trim().max(maximum).default("");
const webLink = optionalText(500).refine(value => {
  if (!value) return true;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password; }
  catch { return false; }
}, "Escribe un enlace completo https://…");
const socialLink = (hosts: string[]) => webLink.refine(value => {
  if (!value) return true;
  try { const host = new URL(value).hostname.toLowerCase(); return hosts.some(domain => host === domain || host.endsWith(`.${domain}`)); }
  catch { return false; }
}, "El enlace debe corresponder a esta red social.");

/** An additional submission guard. Human moderation remains required for every change. */
export function hasRestrictedCompanyProduct(value: string): boolean {
  const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return /\b(?:medicamentos?|medicinas?|farmacos?|antibioticos?|antiparasitarios?|ivermectina|ivermectin|vacunas?|plaguicidas?|pesticidas?|herbicidas?|fungicidas?|insecticidas?|agroquimicos?|cannabis|marihuana|armas?|municiones?|explosivos?)\b/.test(normalized);
}

export const companyProductSchema = z.object({
  id: companyIdSchema,
  name: z.string().trim().min(3).max(140),
  description: optionalText(800),
  category: z.enum(companyProductCategories),
  priceCents: z.number().int().min(0).max(100_000_000_000).nullable().default(null),
  currency: currencySchema.default("USD"),
  unit: z.string().trim().min(1).max(60).default("unidad"),
  availability: z.enum(["Por confirmar", "Disponible", "Bajo pedido"]).default("Por confirmar"),
  imageKey: companyImageKeySchema.optional(),
  imageDataUrl: imageDataUrl.optional(),
  marketplaceId: z.union([z.literal(""), z.string().regex(/^[a-zA-Z0-9_-]{3,160}$/)]).default(""),
});

export const companySchema = z.object({
  name: z.string().trim().min(3).max(140),
  legalName: optionalText(180),
  category: z.enum(companyCategories),
  description: z.string().trim().min(30).max(2400),
  productsSummary: optionalText(800),
  state: z.enum(venezuelanStates),
  municipality: optionalText(100),
  address: optionalText(300),
  coverageStates: z.array(z.enum(venezuelanStates)).max(24).default([]),
  contactName: optionalText(120),
  phone: z.string().trim().min(7).max(40).refine(value => /^[+\d\s().-]+$/.test(value) && /^\d{7,15}$/.test(value.replace(/\D/g, "")), "Introduce un teléfono válido."),
  email: z.union([z.literal(""), z.string().trim().email().max(254)]).default(""),
  website: webLink,
  instagram: socialLink(["instagram.com"]),
  facebook: socialLink(["facebook.com", "fb.com"]),
  whatsapp: z.boolean().default(false),
  serviceMode: z.enum(companyServiceModes).default("Presencial"),
  hours: optionalText(400),
  delivery: optionalText(700),
  logoKey: companyImageKeySchema.optional(),
  logoDataUrl: imageDataUrl.optional(),
  galleryKeys: z.array(companyImageKeySchema).max(6).default([]),
  galleryDataUrls: z.array(imageDataUrl).max(6).default([]),
  products: z.array(companyProductSchema).max(12).default([]),
}).superRefine((company, ctx) => {
  if (company.galleryKeys.length + company.galleryDataUrls.length > 6) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["galleryDataUrls"], message: "Puedes guardar hasta seis fotografías en la galería." });
  const ids = new Set<string>();
  company.products.forEach((product, index) => {
    if (ids.has(product.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["products", index, "id"], message: "Cada producto debe tener un identificador diferente." });
    ids.add(product.id);
    if (hasRestrictedCompanyProduct(`${product.name} ${product.description} ${product.category}`)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["products", index, "name"], message: COMPANY_CATALOG_NOTICE });
  });
});

export type CompanyInput = z.input<typeof companySchema>;
export type CompanyPayload = z.output<typeof companySchema>;
export type CompanyProduct = Omit<z.output<typeof companyProductSchema>, "imageDataUrl"> & { imageUrl?: string | null };
export type CompanyRecord = Omit<CompanyPayload, "logoDataUrl" | "galleryDataUrls" | "products"> & {
  id: string;
  demo?: boolean;
  status: "pending" | "active" | "rejected" | "deleted";
  revision?: string;
  createdAt: string;
  updatedAt: string;
  logoUrl: string | null;
  galleryUrls: string[];
  products: CompanyProduct[];
};
export type Company = CompanyRecord;

export function companyImageUrl(key: string | null | undefined): string | null {
  return key && companyImageKeySchema.safeParse(key).success ? `/api/media/${key.split("/").map(encodeURIComponent).join("/")}` : null;
}

export function companyMediaKeys(company: Pick<CompanyRecord, "logoKey" | "galleryKeys" | "products">): string[] {
  return [...new Set([company.logoKey, ...company.galleryKeys, ...company.products.map(product => product.imageKey)].filter((key): key is string => typeof key === "string" && !!key))];
}
