//#region lib/auth-fetch.ts
/** Adds standalone CSRF proof without changing hosted Sites requests or offline queues. */
var CSRF_TIMEOUT_MS = 1e4;
var csrfPending = null;
/** Cancel this wait, not the operation shared by other callers. */
function waitForSignal(operation, signal) {
	if (!signal) return operation;
	return new Promise((resolve, reject) => {
		const cleanup = () => signal.removeEventListener("abort", abort);
		const abort = () => {
			cleanup();
			reject(signal.reason ?? new DOMException("The request was aborted.", "AbortError"));
		};
		operation.then((value) => {
			cleanup();
			resolve(value);
		}, (error) => {
			cleanup();
			reject(error);
		});
		if (signal.aborted) {
			abort();
			return;
		}
		signal.addEventListener("abort", abort, { once: true });
	});
}
function getCsrfToken() {
	if (!csrfPending) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(new DOMException("The CSRF request timed out.", "TimeoutError")), CSRF_TIMEOUT_MS);
		csrfPending = waitForSignal((async () => {
			const response = await fetch("/api/auth/csrf", {
				cache: "no-store",
				credentials: "same-origin",
				signal: controller.signal
			});
			if (!response.ok) throw new Error("No se pudo verificar la sesión. Reconecta e inténtalo de nuevo.");
			const { token } = await response.json();
			if (typeof token !== "string" || !token) throw new Error("csrf_unavailable");
			return token;
		})(), controller.signal).finally(() => {
			clearTimeout(timer);
			csrfPending = null;
		});
	}
	return csrfPending;
}
async function authFetch(input, init) {
	const method = (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
	if ([
		"GET",
		"HEAD",
		"OPTIONS"
	].includes(method)) return fetch(input, init);
	const url = new URL(input instanceof Request ? input.url : String(input), location.origin);
	if (url.origin !== location.origin || !url.pathname.startsWith("/api/")) return fetch(input, init);
	const signal = init?.signal !== void 0 ? init.signal : input instanceof Request ? input.signal : void 0;
	signal?.throwIfAborted();
	const token = await waitForSignal(getCsrfToken(), signal);
	signal?.throwIfAborted();
	const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : void 0));
	headers.set("x-csrf-token", token);
	return fetch(input, {
		...init,
		headers,
		credentials: "same-origin"
	});
}
//#endregion
export { authFetch as t };
