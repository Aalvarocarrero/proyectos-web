import { getChatGPTUser } from "@/app/chatgpt-auth";
import { isAdminIdentity } from "@/lib/admin-access";
import { homeImagePath, parseHomeContent } from "@/lib/home-content";
import { readHomeDocument } from "@/lib/home-content-db";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, context: {params: Promise<{file: string}>}) {
  const { file } = await context.params;
  const src = `/api/home-media/${file}`;
  if (!homeImagePath.safeParse(src).success) return new Response("Not found", {status: 404});
  try {
    const row = await readHomeDocument();
    const published = parseHomeContent(row?.publishedJson)?.heroImage === src;
    // Even an uploaded-but-unsaved image is only visible to an authorized administrator.
    if (!published && !isAdminIdentity(await getChatGPTUser())) return new Response("Not found", {status: 404});
    const { env } = await import("cloudflare:workers");
    if (!env.BUCKET) return new Response("Storage unavailable", {status: 503});
    const object = await env.BUCKET.get(`website/home/${file}`);
    if (!object) return new Response("Not found", {status: 404});
    const headers = new Headers(); object.writeHttpMetadata(headers);
    headers.set("x-content-type-options", "nosniff"); headers.set("etag", object.httpEtag);
    headers.set("cache-control", published ? "public, no-cache, must-revalidate" : "private, no-store");
    return new Response(object.body, {headers});
  } catch { return new Response("Storage unavailable", {status: 503}); }
}
