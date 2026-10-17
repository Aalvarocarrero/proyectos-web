import {deploymentTarget,parseAuthConfig,type AuthEnvironment} from "@/lib/auth/config";
import {isAccountAgnosticPage,isAdminPath,isPublicProductionRequest} from "@/lib/auth/route-policy";
import {cookieValue,verifyCsrf} from "@/lib/auth/csrf";
import {getSession} from "@/lib/auth/session";
import {siteContentSecurityPolicy} from "@/lib/site-content-security";
import { responseMustRemainNoindex } from "@/lib/indexing-policy";
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
    if (deploymentTarget() === "standalone") {
      try {
        // Reject alternate encoded routing before vinext decodes it; security and router use the same path.
        if (decodeURIComponent(url.pathname) !== url.pathname) return new Response("Noncanonical path", {status:400,headers:{"cache-control":"private, no-store"}});
        const config = parseAuthConfig(env as unknown as AuthEnvironment);
        if (url.origin !== config.origin) return secureResponse(new Response("Unavailable", {status:403,headers:{"cache-control":"private, no-store"}}),url);
        const sanitized = new Headers(request.headers);
        for (const key of [...sanitized.keys()]) if (key.toLowerCase().startsWith("oai-authenticated-")) sanitized.delete(key);
        request = new Request(request, {headers:sanitized});
        const authPath = (["GET","HEAD"].includes(request.method) && ["/auth/signin","/api/auth/csrf","/api/auth/google/callback"].includes(url.pathname))
          || (request.method === "POST" && ["/api/auth/google/start","/api/auth/logout"].includes(url.pathname));
        const loginAsset = ["GET","HEAD"].includes(request.method) && (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/_next/") || url.pathname === "/favicon.ico");
        const publicRequest = config.accessPolicy === "public-production" && isPublicProductionRequest(request);
        if (!authPath && !loginAsset && !publicRequest) {
          const user = await getSession(env.DB, config, cookieValue(request, "__Host-va_session"));
          if (!user) {
            const response = url.pathname.startsWith("/api/")
              ? Response.json({error:"authentication_required"}, {status:401})
              : new Response(null, {status:302,headers:{location:"/auth/signin?return_to="+encodeURIComponent(url.pathname+url.search)}});
            response.headers.set("cache-control", "private, no-store");
            return secureResponse(response,url);
          }
          if (isAdminPath(url.pathname) && user.googleOwnerAdmin !== true) {
            return secureResponse(new Response("Forbidden", {status:403,headers:{"cache-control":"private, no-store"}}),url);
          }
        }
        if (!["GET","HEAD","OPTIONS"].includes(request.method) && url.pathname !== "/api/auth/google/start") {
          if (!await verifyCsrf(request,config)) return secureResponse(Response.json({error:"csrf_rejected"},{status:403}),url);
        }
        // Worker-first routing must also serve Vite chunks and post-build offline
        // manifests, which are absent from vinext's source public-file manifest.
        // Authentication above runs before this lookup, including static HTML.
        if (["GET","HEAD"].includes(request.method)) {
          const asset=await env.ASSETS.fetch(request);
          if (asset.status!==404) return secureResponse(asset,url);
          await asset.body?.cancel();
        }
      } catch {
        return secureResponse(new Response("Authentication is not configured for this environment.",{status:503,headers:{"cache-control":"private, no-store"}}),url);
      }
    }

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

    let result = await handler.fetch(request, env, ctx);
    // These audited public documents contain no account data. Framework force-dynamic
    // may add no-store merely because public CMS data is read. Allow explicit offline
    // saving while requiring online revalidation. Never override a private response,
    // cookie-setting response, identity Vary, redirect/error, mutation, API or RSC payload.
    if (["GET", "HEAD"].includes(request.method) && result.status === 200 && url.search === "" && isAccountAgnosticPage(url.pathname)
      && /^text\/html(?:;|$)/i.test(result.headers.get("content-type") || "")
      && !/private/i.test(result.headers.get("cache-control") || "") && !result.headers.has("set-cookie")
      && !/(?:^|,)\s*(?:cookie|authorization|\*)\s*(?:,|$)/i.test(result.headers.get("vary") || "")) {
      result = new Response(result.body, result);
      result.headers.set("cache-control", "public, no-cache, must-revalidate");
    }
    // Never cache server-rendered personalized content or responses setting cookies.
    // Audited account-agnostic offline documents stay cacheable even after login.
    if ((/(?:^|;)\s*__Host-va_session=/.test(request.headers.get("cookie") || "") && !isAccountAgnosticPage(url.pathname)) || result.headers.has("set-cookie")) {
      const privateResult = new Response(result.body, result);
      privateResult.headers.set("cache-control", "private, no-store");
      return secureResponse(privateResult, url);
    }
    return secureResponse(result, url);
  },
};

function secureResponse(source: Response, url: URL) {
  const pathname=url.pathname;
  const response = new Response(source.body, source);
  response.headers.set("x-content-type-options", "nosniff");
  if (!response.headers.has("referrer-policy")) response.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  response.headers.set("x-frame-options", "DENY");
  response.headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=()");
  response.headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");
  response.headers.set("cross-origin-opener-policy", "same-origin");
  response.headers.set("content-security-policy", siteContentSecurityPolicy(url));
  // The CMS homepage reads only the public snapshot. Keep it eligible for the
  // explicitly downloaded offline library, while revalidating every online view.
  if (pathname === "/" && !response.headers.get("cache-control")?.includes("private")) response.headers.set("cache-control", "public, no-cache, must-revalidate");
  // These pages embed account props or personalized directory controls. Keep the
  // deliberately account-agnostic /app-local shell cacheable for offline use.
  if (/^\/(?:app|admin|marketplace\/publicar|empresas\/registro|profesionales|proyectos|red|fincas)(?:\/|$)/.test(pathname)) response.headers.set("cache-control", "private, no-store");
  // APIs may contain account identity, moderation queues, contact details or sync receipts.
  if (pathname.startsWith("/auth/")) response.headers.set("cache-control", "private, no-store");
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/media/")) response.headers.set("cache-control", "private, no-store");
  if(responseMustRemainNoindex(url,response.status,response.headers.get("cache-control"))) response.headers.set("x-robots-tag","noindex, nofollow");
  return response;
}

export default worker;
