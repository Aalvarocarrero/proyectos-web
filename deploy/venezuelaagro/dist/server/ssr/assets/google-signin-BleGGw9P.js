import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { i as safeRelativeReturnPath } from "./auth-paths-DyLjOkUj.js";
//#region components/google-signin.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var TOKEN_REFRESH_MS = 240 * 1e3;
var SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
function GoogleSignIn({ siteKey, returnTo }) {
	const container = (0, import_react.useRef)(null);
	const submittingRef = (0, import_react.useRef)(false);
	const tokenCreatedAt = (0, import_react.useRef)(0);
	const [csrfToken, setCsrfToken] = (0, import_react.useState)("");
	const [turnstileToken, setTurnstileToken] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [attempt, setAttempt] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const controller = new AbortController();
		let widget;
		let tokenTimeout;
		let script = document.querySelector(`script[src="${SCRIPT_URL}"]`);
		function fail(message) {
			if (controller.signal.aborted) return;
			tokenCreatedAt.current = 0;
			window.clearTimeout(tokenTimeout);
			setTurnstileToken("");
			setError(message);
		}
		function render() {
			if (controller.signal.aborted || widget !== void 0 || !container.current || !window.turnstile) return;
			try {
				widget = window.turnstile.render(container.current, {
					sitekey: siteKey,
					action: "login",
					theme: "light",
					size: "flexible",
					"response-field": false,
					callback: (token) => {
						if (controller.signal.aborted || submittingRef.current) return;
						tokenCreatedAt.current = Date.now();
						window.clearTimeout(tokenTimeout);
						setTurnstileToken(token);
						setError("");
						tokenTimeout = window.setTimeout(() => fail("La verificación venció. Vuelve a intentarlo."), TOKEN_REFRESH_MS);
					},
					"expired-callback": () => fail("La verificación venció. Vuelve a intentarlo."),
					"error-callback": () => fail("No pudimos completar la verificación. Comprueba tu conexión y vuelve a intentarlo."),
					"timeout-callback": () => fail("La verificación tardó demasiado. Vuelve a intentarlo.")
				});
			} catch {
				fail("No pudimos iniciar la verificación. Vuelve a intentarlo.");
			}
		}
		const scriptError = () => fail("No pudimos cargar la verificación. Comprueba tu conexión y vuelve a intentarlo.");
		fetch("/api/auth/csrf", {
			credentials: "same-origin",
			cache: "no-store",
			signal: controller.signal
		}).then(async (response) => {
			if (!response.ok) throw new Error("csrf");
			return response.json();
		}).then((value) => {
			if (typeof value?.token !== "string" || !value.token) throw new Error("csrf");
			if (!controller.signal.aborted) setCsrfToken(value.token);
		}).catch(() => {
			if (!controller.signal.aborted) {
				setCsrfToken("");
				setError("No pudimos preparar el acceso seguro. Vuelve a intentarlo.");
			}
		});
		if (!script) {
			script = document.createElement("script");
			script.src = SCRIPT_URL;
			script.async = true;
			script.defer = true;
			script.addEventListener("load", render);
			script.addEventListener("error", scriptError);
			document.head.appendChild(script);
		} else {
			script.addEventListener("load", render);
			script.addEventListener("error", scriptError);
			render();
		}
		const timeout = window.setTimeout(() => {
			if (widget === void 0) scriptError();
		}, 15e3);
		return () => {
			controller.abort();
			window.clearTimeout(timeout);
			window.clearTimeout(tokenTimeout);
			tokenCreatedAt.current = 0;
			script?.removeEventListener("load", render);
			script?.removeEventListener("error", scriptError);
			if (widget !== void 0) window.turnstile?.remove(widget);
			if (!window.turnstile) script?.remove();
		};
	}, [siteKey, attempt]);
	(0, import_react.useEffect)(() => {
		const onPageShow = (event) => {
			if (event.persisted) {
				submittingRef.current = false;
				setSubmitting(false);
				setCsrfToken("");
				setTurnstileToken("");
				setAttempt((value) => value + 1);
			}
		};
		window.addEventListener("pageshow", onPageShow);
		return () => window.removeEventListener("pageshow", onPageShow);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		method: "post",
		action: "/api/auth/google/start",
		className: "space-y-5",
		onSubmit: (event) => {
			if (!csrfToken || !turnstileToken || submittingRef.current || !navigator.onLine) {
				event.preventDefault();
				if (!navigator.onLine) setError("Conéctate a internet para entrar con Google.");
				return;
			}
			const tokenAge = Date.now() - tokenCreatedAt.current;
			if (!tokenCreatedAt.current || tokenAge < 0 || tokenAge >= TOKEN_REFRESH_MS) {
				event.preventDefault();
				tokenCreatedAt.current = 0;
				setTurnstileToken("");
				setError("La verificación venció. Vuelve a intentarlo.");
				return;
			}
			submittingRef.current = true;
			setSubmitting(true);
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "hidden",
				name: "csrfToken",
				value: csrfToken
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "hidden",
				name: "turnstileToken",
				value: turnstileToken
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "hidden",
				name: "returnTo",
				value: safeRelativeReturnPath(returnTo)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: container,
				"aria-label": "Verificación de seguridad",
				className: "min-h-16"
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "text-sm text-red-800",
					children: error
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: submitting,
					className: "min-h-11 underline",
					onClick: () => {
						setError("");
						setCsrfToken("");
						setTurnstileToken("");
						setAttempt((value) => value + 1);
					},
					children: "Volver a intentar"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "submit",
				disabled: !csrfToken || !turnstileToken || submitting,
				className: "min-h-12 w-full rounded-xl bg-[#211d1a] px-5 py-3 font-semibold text-white disabled:opacity-50",
				children: submitting ? "Abriendo Google…" : "Continuar con Google"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("noscript", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Activa JavaScript para completar la verificación de seguridad e iniciar sesión." }) })
		]
	});
}
//#endregion
export { GoogleSignIn };
