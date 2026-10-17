import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { websiteContent } from "@/db/schema";
import { isAdminIdentity } from "@/lib/admin-access";
import { HOME_DEFAULTS, homeMutationSchema, parseHomeContent } from "@/lib/home-content";
import { readHomeDocument } from "@/lib/home-content-db";
import { readBoundedJson, RequestBodyError } from "@/lib/request-body";
import { rejectCrossSiteMutation } from "@/lib/security";

export const dynamic = "force-dynamic";
const respond = (data: unknown, status = 200) => NextResponse.json(data, {status, headers: {"cache-control": "private, no-store"}});
export async function GET() {
  if (!isAdminIdentity(await getChatGPTUser())) return respond({error: "forbidden"}, 403);
  try {
    const row = await readHomeDocument();
    return respond({content: parseHomeContent(row?.draftJson) ?? HOME_DEFAULTS, revision: row?.revision ?? null, publishedAt: row?.publishedAt ?? null});
  } catch { return respond({error: "content_storage_unavailable"}, 503); }
}
export async function POST(request: NextRequest) {
  const rejected = rejectCrossSiteMutation(request); if (rejected) return rejected;
  if (!isAdminIdentity(await getChatGPTUser())) return respond({error: "forbidden"}, 403);
  let input: unknown;
  try { input = await readBoundedJson(request, 16000); }
  catch (error) { return respond({error: error instanceof RequestBodyError ? error.code : "invalid_json"}, error instanceof RequestBodyError ? error.status : 400); }
  const parsed = homeMutationSchema.safeParse(input);
  if (!parsed.success) return respond({error: "invalid_content", details: parsed.error.flatten()}, 400);
  try {
    const db = await getDb(), revision = crypto.randomUUID(), now = new Date().toISOString();
    const command = parsed.data;
    let changed;
    if (command.action === "save") {
      const values = {draftJson: JSON.stringify(command.content), revision, updatedAt: now};
      changed = command.expectedRevision === null
        ? await db.insert(websiteContent).values({id: "home", ...values}).onConflictDoNothing().returning({id: websiteContent.id})
        : await db.update(websiteContent).set(values).where(and(eq(websiteContent.id, "home"), eq(websiteContent.revision, command.expectedRevision))).returning({id: websiteContent.id});
    } else {
      const row = await readHomeDocument();
      if (!row || row.revision !== command.expectedRevision) return respond({error: "content_changed_refresh_required"}, 409);
      const content = parseHomeContent(row.draftJson);
      if (!content) return respond({error: "invalid_content"}, 422);
      if (content.heroImage.startsWith("/api/home-media/")) {
        const { env } = await import("cloudflare:workers");
        const photo = env.BUCKET && await env.BUCKET.head(`website/home/${content.heroImage.split("/").pop()}`);
        if (!photo || photo.size <= 0) return respond({error: "image_unavailable"}, 422);
      }
      changed = await db.update(websiteContent).set({publishedJson: JSON.stringify(content), revision, updatedAt: now, publishedAt: now})
        .where(and(eq(websiteContent.id, "home"), eq(websiteContent.revision, command.expectedRevision))).returning({id: websiteContent.id});
    }
    if (!changed.length) return respond({error: "content_changed_refresh_required"}, 409);
    return respond({ok: true, revision, ...(command.action === "publish" ? {publishedAt: now} : {})});
  } catch { return respond({error: "content_storage_unavailable"}, 503); }
}
