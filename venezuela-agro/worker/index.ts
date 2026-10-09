import {siteContentSecurityPolicy} from "@/lib/site-content-security";
import { PUBLIC_INDEXING_ENABLED,isPrivatePath } from "@/lib/indexing-policy";
/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      const imageResponse = await handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
      return secureResponse(imageResponse, url);
    }

    return secureResponse(await handler.fetch(request, env, ctx), url);
  },
};

function secureResponse(source: Response, url: URL) {
  const pathname=url.pathname;
  const response = new Response(source.body, source);
  if(!PUBLIC_INDEXING_ENABLED || isPrivatePath(pathname) || response.headers.get("cache-control")?.includes("private"))response.headers.set("x-robots-tag","noindex, nofollow");
  response.headers.set("x-content-type-options", "nosniff");
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  response.headers.set("x-frame-options", "DENY");
  response.headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=()");
  response.headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");
  response.headers.set("cross-origin-opener-policy", "same-origin");
  response.headers.set("content-security-policy", siteContentSecurityPolicy(url));
  if (pathname.startsWith("/api/security") || pathname === "/api/bootstrap" || pathname === "/api/sync") response.headers.set("cache-control", "no-store");
  return response;
}

export default worker;
