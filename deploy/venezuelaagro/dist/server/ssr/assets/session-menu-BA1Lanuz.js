import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { u as getPendingCount } from "./offline-db-Co86AgBD.js";
import { l as prepareOfflineSignOut } from "./offline-account-boundary-hnu6xdcm.js";
import { n as chatGPTSignOutPath, r as isStandaloneAuth } from "./auth-paths-DyLjOkUj.js";
import { t as createLucideIcon } from "./createLucideIcon-OtKWZ-kp.js";
import { i as DialogDescription, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-CBD8GOFt.js";
import { t as Link } from "./link-BIjyqzpN.js";
//#region node_modules/lucide-react/dist/esm/icons/log-out.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var LogOut = createLucideIcon("log-out", [
	["path", {
		d: "m16 17 5-5-5-5",
		key: "1bji2h"
	}],
	["path", {
		d: "M21 12H9",
		key: "dn1m92"
	}],
	["path", {
		d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",
		key: "1uf3rs"
	}]
]);
//#endregion
//#region components/session-menu.tsx
var import_jsx_runtime = require_jsx_runtime();
function isSession(value) {
	if (!value || typeof value !== "object") return false;
	const session = value;
	return typeof session.owner === "string" && !!session.owner && session.owner !== "device-local" && typeof session.canAdmin === "boolean" && session.signOutPath === chatGPTSignOutPath("/");
}
var itemClass = "nav-link block w-full rounded-xl px-4 py-3 text-left text-base text-white/85 hover:bg-white/8 hover:text-white";
/** The server decides menu visibility; /admin and its API still authorize each request. */
function SessionMenu({ onNavigate = () => {}, variant = "menu", initialSession }) {
	const [session, setSession] = (0, import_react.useState)(() => isSession(initialSession) ? initialSession : null);
	const [checking, setChecking] = (0, import_react.useState)(false);
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const signingOutRef = (0, import_react.useRef)(false);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [warning, setWarning] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (initialSession && isSession(initialSession)) return;
		const controller = new AbortController();
		fetch("/api/account-menu", {
			cache: "no-store",
			signal: controller.signal
		}).then((response) => response.ok ? response.json() : null).then((value) => {
			if (!controller.signal.aborted) setSession(isSession(value) ? value : null);
		}).catch(() => void 0);
		return () => controller.abort();
	}, [initialSession]);
	async function reviewSignOut() {
		if (!session || checking) return;
		setChecking(true);
		try {
			const [accountPending, devicePending] = await Promise.all([getPendingCount(session.owner), getPendingCount("device-local")]);
			setWarning(accountPending + devicePending > 0 ? `Hay ${accountPending} cambios pendientes de esta cuenta y ${devicePending} del espacio local. Se conservarán en este navegador. Vuelve a entrar con la misma cuenta para revisar sus pendientes.` : "Tus registros guardados se conservarán en este navegador.");
		} catch {
			setWarning("No pudimos comprobar los cambios pendientes. No se borrarán los registros locales. Puedes cancelar y revisar Mi finca antes de salir.");
		} finally {
			setChecking(false);
			setReady(true);
		}
	}
	async function confirmStandaloneSignOut() {
		if (!session || signingOutRef.current) return;
		if (!navigator.onLine) {
			setWarning("Conéctate a internet para cerrar la sesión de forma segura.");
			return;
		}
		signingOutRef.current = true;
		setSigningOut(true);
		try {
			const csrfResponse = await fetch("/api/auth/csrf", {
				credentials: "same-origin",
				cache: "no-store"
			});
			if (!csrfResponse.ok) throw new Error("csrf");
			const csrf = await csrfResponse.json();
			if (typeof csrf?.token !== "string" || !csrf.token) throw new Error("csrf");
			if (!(await fetch("/api/auth/logout", {
				method: "POST",
				credentials: "same-origin",
				cache: "no-store",
				redirect: "error",
				headers: { "x-csrf-token": csrf.token }
			})).ok) throw new Error("logout");
			prepareOfflineSignOut();
			window.location.assign("/");
		} catch {
			setWarning("No pudimos confirmar el cierre de sesión. Tus registros siguen guardados. Comprueba tu conexión y vuelve a intentarlo.");
		} finally {
			signingOutRef.current = false;
			setSigningOut(false);
		}
	}
	if (!session) return null;
	const confirmation = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		role: "group",
		"aria-label": "Confirmar cierre de sesión",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-6",
				role: "status",
				children: warning
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-6 text-white/70",
				children: "Guarda cualquier formulario abierto antes de continuar. El acceso sin señal de esta cuenta se desactivará; necesitarás internet para volver a entrar. Cerrar sesión requiere conexión."
			}),
			isStandaloneAuth() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: confirmStandaloneSignOut,
				className: "block min-h-11 w-full rounded-lg bg-white px-3 py-3 text-center font-semibold text-[#211d1a] disabled:opacity-60",
				children: signingOut ? "Cerrando sesión…" : "Confirmar cierre de sesión"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: session.signOutPath,
				target: "_top",
				className: "block rounded-lg bg-white px-3 py-3 text-center font-semibold text-[#211d1a]",
				onClick: (event) => {
					if (!navigator.onLine) {
						event.preventDefault();
						setWarning("Conéctate a internet para cerrar la sesión de forma segura.");
						return;
					}
					prepareOfflineSignOut();
				},
				children: "Confirmar cierre de sesión"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => setReady(false),
				className: "min-h-11 w-full rounded-lg border border-white/25 px-3 py-2",
				children: "Cancelar y seguir aquí"
			})
		]
	});
	if (variant === "admin") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: reviewSignOut,
		disabled: checking,
		"aria-haspopup": "dialog",
		className: "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/25 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:opacity-60",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, {
			className: "size-4 shrink-0",
			"aria-hidden": "true"
		}), checking ? "Revisando…" : "Cerrar sesión"]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: ready,
		onOpenChange: (open) => {
			if (!signingOutRef.current) setReady(open);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "border-white/15 bg-[#211d1a] text-white",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "text-xl",
					children: "Cerrar sesión"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "text-white/70",
					children: "Revisa tus pendientes antes de salir de Venezuela Agro."
				}),
				confirmation
			]
		})
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 border-t border-white/15 pt-2",
		children: [session.canAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			href: "/admin",
			onClick: onNavigate,
			className: itemClass,
			children: "Administración"
		}), !ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: reviewSignOut,
			disabled: checking,
			className: itemClass,
			children: checking ? "Revisando pendientes…" : "Cerrar sesión"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4 py-3",
			children: confirmation
		})]
	});
}
//#endregion
export { SessionMenu };
