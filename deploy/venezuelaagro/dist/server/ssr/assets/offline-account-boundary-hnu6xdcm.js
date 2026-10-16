import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { t as chatGPTSignInPath } from "./auth-paths-DyLjOkUj.js";
//#region lib/offline-owner.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var KEY = "venezuela-agro-last-local-owner";
var SIGN_OUT_KEY = "venezuela-agro-session-boundary";
var seenSignOut = readSignOutBoundary();
function readSignOutBoundary() {
	try {
		return localStorage.getItem(SIGN_OUT_KEY);
	} catch {
		return null;
	}
}
var TRUST_KEY = "venezuela-agro-trusted-offline-workspace";
var choiceOwner = null;
var resolveChoice = null;
function announceChoice() {
	if (typeof window !== "undefined") window.dispatchEvent(new Event("venezuela-agro-offline-choice"));
}
function offlineChoiceRequired() {
	return choiceOwner !== null;
}
function subscribeOfflineChoice(callback) {
	window.addEventListener("venezuela-agro-offline-choice", callback);
	return () => window.removeEventListener("venezuela-agro-offline-choice", callback);
}
function trustedOwner() {
	try {
		const record = JSON.parse(localStorage.getItem(TRUST_KEY) || "null");
		return record?.version === 1 && typeof record.owner === "string" && record.owner.length < 220 && record.owner !== "device-local" ? record.owner : null;
	} catch {
		return null;
	}
}
function reconcileTrustedOwner(owner) {
	try {
		if (trustedOwner() && trustedOwner() !== owner) localStorage.removeItem(TRUST_KEY);
	} catch {}
}
function chooseOfflineWorkspace(useSaved) {
	const owner = useSaved && choiceOwner ? choiceOwner : "device-local";
	const resolver = resolveChoice;
	resolveChoice = null;
	choiceOwner = null;
	try {
		sessionStorage.setItem(KEY, owner);
	} catch {}
	resolver?.(owner);
	announceChoice();
}
async function rememberOfflineWorkspace() {
	const owner = await localOwner();
	if (owner === "device-local") throw new Error("El espacio local ya se puede reabrir sin cuenta. Para preparar una cuenta, ábrela primero con internet.");
	if (!navigator.onLine || !await verifySyncOwner(owner)) throw new Error("Reconecta y verifica la cuenta antes de preparar su acceso sin señal.");
	localStorage.setItem(TRUST_KEY, JSON.stringify({
		version: 1,
		owner
	}));
	if (trustedOwner() !== owner) throw new Error("El navegador no permitió guardar este acceso. Usa una copia descargada.");
	return owner;
}
function forgetOfflineWorkspace() {
	localStorage.removeItem(TRUST_KEY);
}
var ownerPromise = null;
var ownerMode = "";
var ownerRevision = 0;
function databaseNameForOwner(owner) {
	return `los-morochos-offline-v2:${encodeURIComponent(owner)}`;
}
async function resolveOwner(revision) {
	if (location.pathname === "/app-local") return "device-local";
	if (navigator.onLine) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), 4500);
		try {
			const response = await fetch("/api/offline-session", {
				cache: "no-store",
				signal: controller.signal
			});
			if (!response.ok) throw new Error("session_unavailable");
			const result = await response.json();
			if (!result.owner) throw new Error("session_unavailable");
			try {
				if (revision === ownerRevision) {
					sessionStorage.setItem(KEY, result.owner);
					reconcileTrustedOwner(result.owner);
				}
			} catch {}
			return result.owner;
		} catch {} finally {
			clearTimeout(timer);
		}
	}
	try {
		const active = sessionStorage.getItem(KEY);
		if (active) return active;
	} catch {}
	const saved = trustedOwner();
	if (saved && revision === ownerRevision) {
		choiceOwner = saved;
		announceChoice();
		return new Promise((resolve) => {
			resolveChoice = resolve;
		});
	}
	return "device-local";
}
/** Forget access hints only, never IndexedDB records, attachments, or queued changes. */
function prepareOfflineSignOut() {
	if (resolveChoice) chooseOfflineWorkspace(false);
	try {
		sessionStorage.removeItem(KEY);
	} catch {}
	try {
		localStorage.removeItem(TRUST_KEY);
	} catch {}
	try {
		localStorage.setItem(SIGN_OUT_KEY, String(Date.now()) + Math.random());
	} catch {}
	seenSignOut = readSignOutBoundary();
	ownerRevision++;
	ownerPromise = null;
	ownerMode = "";
}
function reconcileSignOutBoundary() {
	const current = readSignOutBoundary();
	if (current === seenSignOut) return;
	seenSignOut = current;
	if (resolveChoice) chooseOfflineWorkspace(false);
	try {
		sessionStorage.removeItem(KEY);
	} catch {}
	ownerRevision++;
	ownerPromise = null;
	ownerMode = "";
}
function localOwner() {
	reconcileSignOutBoundary();
	const mode = location.pathname === "/app-local" ? "device" : "session";
	if (mode !== ownerMode) {
		if (resolveChoice) chooseOfflineWorkspace(false);
		ownerMode = mode;
		ownerPromise = null;
		ownerRevision++;
	}
	return ownerPromise ??= resolveOwner(ownerRevision);
}
async function verifySyncOwner(owner) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 4500);
	try {
		const response = await fetch("/api/offline-session", {
			cache: "no-store",
			signal: controller.signal
		});
		if (!response.ok) return false;
		const current = (await response.json()).owner;
		if (typeof current !== "string") return false;
		reconcileTrustedOwner(current);
		return current === owner;
	} finally {
		clearTimeout(timer);
	}
}
/** A server-rendered account change starts a new namespace, never adopts device records. */
function selectVerifiedDashboardOwner(owner) {
	if (owner === "device-local" || location.pathname === "/app-local") return;
	reconcileSignOutBoundary();
	if (resolveChoice) chooseOfflineWorkspace(false);
	reconcileTrustedOwner(owner);
	ownerMode = "session";
	ownerRevision++;
	ownerPromise = Promise.resolve(owner);
	try {
		sessionStorage.setItem(KEY, owner);
	} catch {}
}
//#endregion
//#region components/offline-account-boundary.tsx
var import_jsx_runtime = require_jsx_runtime();
var BOUNDARY_KEY = "venezuela-agro-session-boundary";
var OfflineAccountBlocked = (0, import_react.createContext)(null);
/** Portalled dialogs retain this context; keep their drafts mounted but hidden/inert. */
function useOfflineAccountBlocked() {
	return (0, import_react.useContext)(OfflineAccountBlocked)?.blocked ?? false;
}
function readBoundary() {
	try {
		return localStorage.getItem(BOUNDARY_KEY);
	} catch {
		return;
	}
}
/** Locks the originally mounted account view without removing drafts or its component tree. */
function OfflineAccountBoundary({ ownerId, localOnly = false, children }) {
	const original = (0, import_react.useRef)(null);
	const current = (0, import_react.useRef)({
		ownerId,
		localOnly
	});
	current.current = {
		ownerId,
		localOnly
	};
	const acceptedBoundary = (0, import_react.useRef)(readBoundary());
	const observedBoundary = (0, import_react.useRef)(acceptedBoundary.current);
	if (!original.current && ownerId !== null) {
		original.current = {
			ownerId,
			localOnly: localOnly && ownerId === "device-local"
		};
		acceptedBoundary.current = readBoundary();
		observedBoundary.current = acceptedBoundary.current;
	}
	const retainedChildren = (0, import_react.useRef)(children);
	const mounted = (0, import_react.useRef)(false);
	const attempt = (0, import_react.useRef)(0);
	const request = (0, import_react.useRef)(null);
	const checkingRef = (0, import_react.useRef)(false);
	const [locked, setLocked] = (0, import_react.useState)(false);
	const [checking, setChecking] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)("");
	const sameView = !original.current || ownerId === original.current.ownerId && (localOnly && ownerId === "device-local") === original.current.localOnly;
	const exempt = sameView && !!original.current?.localOnly;
	const blocked = !!original.current && !exempt && (locked || !sameView || readBoundary() !== acceptedBoundary.current);
	const hidden = blocked || !original.current;
	if (!blocked && sameView) retainedChildren.current = children;
	(0, import_react.useEffect)(() => {
		mounted.current = true;
		const invalidate = () => {
			attempt.current++;
			request.current?.abort();
			request.current = null;
			checkingRef.current = false;
			setChecking(false);
			setLocked(true);
			setMessage("");
		};
		const check = () => {
			if (!mounted.current || !original.current || original.current.localOnly) return;
			const next = readBoundary();
			if (next === observedBoundary.current) return;
			observedBoundary.current = next;
			invalidate();
		};
		const storage = (event) => {
			if (event.key !== BOUNDARY_KEY && event.key !== null) return;
			check();
		};
		const visible = () => {
			if (document.visibilityState === "visible") check();
		};
		window.addEventListener("storage", storage);
		window.addEventListener("focus", check);
		document.addEventListener("visibilitychange", visible);
		check();
		return () => {
			mounted.current = false;
			attempt.current++;
			request.current?.abort();
			window.removeEventListener("storage", storage);
			window.removeEventListener("focus", check);
			document.removeEventListener("visibilitychange", visible);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (sameView) return;
		attempt.current++;
		request.current?.abort();
		request.current = null;
		checkingRef.current = false;
		setChecking(false);
		setLocked(true);
		setMessage("Esta vista pertenece a la cuenta original. Abre la otra cuenta en una pestaña nueva.");
	}, [sameView]);
	async function verifyOriginalAccount() {
		if (checkingRef.current || exempt || !original.current) return;
		const originalOwner = original.current.ownerId;
		const originalLocalOnly = original.current.localOnly;
		checkingRef.current = true;
		setChecking(true);
		setMessage("");
		const serial = ++attempt.current;
		const boundary = readBoundary();
		observedBoundary.current = boundary;
		const controller = new AbortController();
		request.current = controller;
		const timer = setTimeout(() => controller.abort(), 1e4);
		try {
			if (boundary === void 0) throw new Error("storage_unavailable");
			const response = await fetch("/api/account-menu", {
				cache: "no-store",
				credentials: "same-origin",
				signal: controller.signal
			});
			if (!response.ok) throw new Error("session_unavailable");
			const session = await response.json();
			controller.signal.throwIfAborted();
			if (!mounted.current || serial !== attempt.current) return;
			if (readBoundary() !== boundary) throw new Error("session_changed");
			if ((session && typeof session === "object" && "owner" in session ? session.owner : void 0) !== originalOwner || current.current.ownerId !== originalOwner || (current.current.localOnly && current.current.ownerId === "device-local") !== originalLocalOnly) {
				setMessage("La sesión abierta no coincide con la cuenta original. Inicia sesión con esa cuenta para recuperar esta vista.");
				return;
			}
			selectVerifiedDashboardOwner(originalOwner);
			acceptedBoundary.current = boundary;
			observedBoundary.current = boundary;
			setLocked(false);
			setMessage("");
		} catch {
			if (mounted.current && serial === attempt.current) {
				setLocked(true);
				setMessage("No pudimos verificar la cuenta original. Conéctate, inicia sesión con esa cuenta y vuelve a comprobar.");
			}
		} finally {
			clearTimeout(timer);
			if (serial === attempt.current) {
				request.current = null;
				checkingRef.current = false;
				if (mounted.current) setChecking(false);
			}
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(OfflineAccountBlocked.Provider, {
		value: {
			blocked,
			checking,
			message,
			verify: verifyOriginalAccount
		},
		children: [
			blocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `[data-radix-popper-content-wrapper], [data-slot="select-content"], [data-slot="popover-content"], [data-slot="dropdown-menu-content"], [data-slot="context-menu-content"], [data-slot="tooltip-content"] { display: none !important; visibility: hidden !important; pointer-events: none !important; }` }),
			blocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfflineAccountLockPanel, {}),
			!original.current && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "p-6",
				children: "Comprobando el espacio de esta cuenta…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				hidden,
				inert: hidden,
				"aria-hidden": hidden || void 0,
				style: hidden ? { display: "none" } : void 0,
				"data-offline-account-view": "",
				children: retainedChildren.current
			})
		]
	});
}
function focusLockPanel(node) {
	node?.focus({ preventScroll: true });
}
/** Render inside an already-open modal to keep its focus trap and original draft nodes intact. */
function OfflineAccountLockPanel({ withinModal = false }) {
	const state = (0, import_react.useContext)(OfflineAccountBlocked);
	if (!state?.blocked) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		style: { pointerEvents: "auto" },
		ref: focusLockPanel,
		tabIndex: -1,
		role: "alert",
		"data-offline-account-lock": "",
		className: withinModal ? "p-3 outline-none" : "mx-auto my-8 max-w-2xl rounded-2xl border bg-white p-6 text-[#3e2a19] outline-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xl font-bold",
				children: "La sesión cambió en este navegador"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-6",
				children: "Ocultamos esta vista para proteger la cuenta original. Los registros guardados siguen en el dispositivo; los formularios abiertos se mantienen en esta pestaña, pero sus cambios sin guardar todavía no tienen copia."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6",
				children: "No cierres ni recargues esta pestaña si tienes cambios sin guardar. Inicia sesión con la cuenta original en una pestaña nueva y después compruébala aquí."
			}),
			state.message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm",
				role: "status",
				children: state.message
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: chatGPTSignInPath("/app"),
					target: "_blank",
					rel: "noopener noreferrer",
					className: "button-light",
					children: "Abrir inicio de sesión en otra pestaña"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => void state.verify(),
					disabled: state.checking,
					className: "button-dark",
					children: state.checking ? "Comprobando…" : "Comprobar mi cuenta"
				})]
			})
		]
	});
}
//#endregion
export { databaseNameForOwner as a, offlineChoiceRequired as c, selectVerifiedDashboardOwner as d, subscribeOfflineChoice as f, chooseOfflineWorkspace as i, prepareOfflineSignOut as l, OfflineAccountLockPanel as n, forgetOfflineWorkspace as o, verifySyncOwner as p, useOfflineAccountBlocked as r, localOwner as s, OfflineAccountBoundary as t, rememberOfflineWorkspace as u };
