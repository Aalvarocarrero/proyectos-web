import { and, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { userConsents, users } from "@/db/schema";
import { companyIdSchema, companySchema, COMPANY_MAX_REQUEST_BYTES } from "@/lib/company";
import { CompanyWriteError, findCompany, findOwnCompany, listCompanies, listOwnCompanies, saveCompany, withdrawCompany } from "@/lib/company-db";
import { CURRENT_POLICY_VERSION } from "@/lib/policy-version";
import { rejectCrossSiteMutation } from "@/lib/security";

export const dynamic = "force-dynamic";
const privateHeaders = { "cache-control": "private, no-store" };
const editSchema = z.object({ id: companyIdSchema, expectedRevision: z.string().min(1).max(100) });
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: privateHeaders });

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (id && !companyIdSchema.safeParse(id).success) return json({ error: "company_not_found" }, 404);
    if (request.nextUrl.searchParams.get("mine") === "1") {
      const user = await getChatGPTUser();
      if (!user) return json({ error: "authentication_required" }, 401);
      const expectedOwner = request.headers.get("x-local-owner");
      if (expectedOwner && expectedOwner !== user.id) return json({ error: "local_owner_mismatch" }, 409);
      if (id) { const company = await findOwnCompany(id, user.id); return company ? json({ owner: user.id, company, companies: [company] }) : json({ error: "company_not_found" }, 404); }
      return json({ owner: user.id, companies: await listOwnCompanies(user.id) });
    }
    if (id) { const company = await findCompany(id); return company ? json({ company, companies: [company] }) : json({ error: "company_not_found" }, 404); }
    return json({ companies: await listCompanies({ category: request.nextUrl.searchParams.get("categoria") || request.nextUrl.searchParams.get("category") || undefined, state: request.nextUrl.searchParams.get("estado") || request.nextUrl.searchParams.get("state") || undefined, query: request.nextUrl.searchParams.get("q") || undefined }) });
  } catch { return json({ error: "company_directory_unavailable" }, 503); }
}

async function readBody(request: NextRequest): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") throw new CompanyWriteError("json_required", 415);
  const statedLength = Number(request.headers.get("content-length") || 0);
  if (statedLength > COMPANY_MAX_REQUEST_BYTES) throw new CompanyWriteError("company_request_too_large", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new CompanyWriteError("invalid_company");
  let length = 0;
  let body = "";
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > COMPANY_MAX_REQUEST_BYTES) { await reader.cancel(); throw new CompanyWriteError("company_request_too_large", 413); }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
    return JSON.parse(body);
  } catch (error) {
    if (error instanceof CompanyWriteError) throw error;
    throw new CompanyWriteError("invalid_company");
  } finally { reader.releaseLock(); }
}

async function mutate(request: NextRequest, action: "create" | "edit" | "delete") {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const user = await getChatGPTUser();
  if (!user) return json({ error: "authentication_required" }, 401);
  if (request.headers.get("x-local-owner") !== user.id) return json({ error: "local_owner_mismatch" }, 409);
  try {
    const body = await readBody(request);
    const edit = action !== "create" ? editSchema.safeParse(body) : null;
    if (edit && !edit.success) return json({ error: "invalid_company_revision" }, 400);
    if (action === "delete" && edit?.success) { await withdrawCompany(edit.data.id, user.id, edit.data.expectedRevision); return json({ ok: true }); }
    const parsed = companySchema.safeParse(body);
    if (!parsed.success) return json({ error: "invalid_company", details: parsed.error.flatten() }, 400);
    const db = await getDb();
    const [contact] = await db.select({ phone: users.phoneE164 }).from(users).where(eq(users.id, user.id)).limit(1);
    const [consent] = await db.select().from(userConsents).where(and(eq(userConsents.userId, user.id), eq(userConsents.policyVersion, CURRENT_POLICY_VERSION), isNull(userConsents.revokedAt))).limit(1);
    if (!contact?.phone || !consent?.essentialAccepted) return json({ error: "account_contact_required" }, 403);
    if (!consent.publicContentAccepted) return json({ error: "public_content_consent_required" }, 403);
    const company = await saveCompany(parsed.data, user.id, edit?.success ? edit.data : undefined);
    return json({ ok: true, company }, action === "create" ? 201 : 200);
  } catch (error) {
    return error instanceof CompanyWriteError ? json({ error: error.code }, error.status) : json({ error: "company_save_unavailable" }, 503);
  }
}

export async function POST(request: NextRequest) { return mutate(request, "create"); }
export async function PATCH(request: NextRequest) { return mutate(request, "edit"); }
export async function DELETE(request: NextRequest) { return mutate(request, "delete"); }
