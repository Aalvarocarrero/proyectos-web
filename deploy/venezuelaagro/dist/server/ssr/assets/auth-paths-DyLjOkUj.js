//#region lib/auth-paths.ts
/** Public routing only: safe for browser bundles, with no environment secrets. */
function isStandaloneAuth() {
	return true;
}
function safeRelativeReturnPath(value) {
	if (!value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(value)) return "/";
	try {
		const url = new URL(value, "https://app.local");
		if (url.origin !== "https://app.local") return "/";
		const pathname = decodeURIComponent(url.pathname).replace(/\/+$/, "") || "/";
		if (pathname.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(pathname) || [
			"/signin-with-chatgpt",
			"/signout-with-chatgpt",
			"/callback",
			"/auth",
			"/api/auth"
		].some((path) => pathname === path || pathname.startsWith(`${path}/`))) return "/";
		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return "/";
	}
}
function chatGPTSignInPath(returnTo) {
	return `${isStandaloneAuth() ? "/auth/signin" : "/signin-with-chatgpt"}?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}
/** Standalone logout is a CSRF-protected POST, never a navigation link. */
function chatGPTSignOutPath(returnTo = "/") {
	return isStandaloneAuth() ? "/api/auth/logout" : `/signout-with-chatgpt?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}
//#endregion
export { safeRelativeReturnPath as i, chatGPTSignOutPath as n, isStandaloneAuth as r, chatGPTSignInPath as t };
