/** Public routing only: safe for browser bundles, with no environment secrets. */
export function isStandaloneAuth(): boolean {
  return typeof __AUTH_DEPLOYMENT_TARGET__ !== "undefined" && __AUTH_DEPLOYMENT_TARGET__ === "standalone";
}

export function safeRelativeReturnPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(value)) return "/";
  try {
    const url = new URL(value, "https://app.local");
    if (url.origin !== "https://app.local") return "/";
    // Decode for comparison only, to exclude escaped auth routes and separators too.
    const pathname = decodeURIComponent(url.pathname).replace(/\/+$/, "") || "/";
    if (pathname.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(pathname)
      || ["/signin-with-chatgpt", "/signout-with-chatgpt", "/callback", "/auth", "/api/auth"].some(path => pathname === path || pathname.startsWith(`${path}/`))) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return "/"; }
}

export function chatGPTSignInPath(returnTo: string): string {
  return `${isStandaloneAuth() ? "/auth/signin" : "/signin-with-chatgpt"}?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}

/** Standalone logout is a CSRF-protected POST, never a navigation link. */
export function chatGPTSignOutPath(returnTo = "/"): string {
  return isStandaloneAuth() ? "/api/auth/logout" : `/signout-with-chatgpt?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}
