import { readBoundedJson, RequestBodyError } from "@/lib/request-body";
import { NextRequest, NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { AreaSplitError, areaSplitRequestSchema, atomicAreaSplit } from "@/lib/atomic-area-split";
import { rejectCrossSiteMutation } from "@/lib/security";

export const dynamic = "force-dynamic";
const privateHeaders = { "cache-control": "private, no-store" };

/** Account splits are online-only and bypass the ordinary single-record outbox. */
export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "authentication_required" }, { status: 401, headers: privateHeaders });
  if (request.headers.get("x-local-owner") !== user.id) {
    return NextResponse.json({ error: "local_owner_mismatch" }, { status: 409, headers: privateHeaders });
  }
  let body: unknown;
  try { body = await readBoundedJson(request, 4096); }
  catch (error) { return NextResponse.json({ error: error instanceof RequestBodyError && error.status === 413 ? "area_split_too_large" : error instanceof RequestBodyError && error.status === 415 ? "json_required" : "invalid_area_split" }, {status: error instanceof RequestBodyError ? error.status : 400, headers: privateHeaders}); }
  const parsed = areaSplitRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_area_split" }, { status: 400, headers: privateHeaders });
  try {
    const { env } = await import("cloudflare:workers");
    // Keep preflight checks, the transaction, and any replay read sequentially consistent.
    const result = await atomicAreaSplit(env.DB.withSession("first-primary"), user.id, parsed.data);
    return NextResponse.json(result, { headers: privateHeaders });
  } catch (error) {
    if (error instanceof AreaSplitError) {
      return NextResponse.json({ error: error.message,
        ...(error.serverRevision !== undefined ? { serverRevision: error.serverRevision } : {}),
      }, { status: error.status, headers: privateHeaders });
    }
    return NextResponse.json({ error: "area_split_failed" }, { status: 500, headers: privateHeaders });
  }
}
