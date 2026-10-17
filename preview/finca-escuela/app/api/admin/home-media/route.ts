import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { isAdminIdentity } from "@/lib/admin-access";
import { rejectCrossSiteMutation } from "@/lib/security";
import { readBoundedJson, RequestBodyError } from "@/lib/request-body";
import { decodeUploadedImage, UploadedImageError } from "@/lib/uploaded-image";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  const rejected = rejectCrossSiteMutation(request); if (rejected) return rejected;
  if (!isAdminIdentity(await getChatGPTUser())) return NextResponse.json({error: "forbidden"}, {status: 403});
  try {
    const input = z.object({dataUrl: z.string().max(2800000)}).strict().safeParse(await readBoundedJson(request, 2800100));
    if (!input.success) return NextResponse.json({error: "invalid_image"}, {status: 400});
    const image = decodeUploadedImage(input.data.dataUrl, {maxBytes: 2_000_000, maxDimension: 2400, maxPixels: 5_760_000});
    const { env } = await import("cloudflare:workers");
    if (!env.BUCKET) return NextResponse.json({error: "storage_unavailable"}, {status: 503});
    const file = `${crypto.randomUUID()}.${image.extension}`;
    await env.BUCKET.put(`website/home/${file}`, image.bytes, {httpMetadata: {contentType: image.mime}});
    return NextResponse.json({src: `/api/home-media/${file}`, width: image.width, height: image.height}, {headers: {"cache-control": "private, no-store"}});
  } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : error instanceof UploadedImageError ? 400 : 503;
    return NextResponse.json({error: error instanceof RequestBodyError || error instanceof UploadedImageError ? error.code : "storage_unavailable"}, {status});
  }
}
