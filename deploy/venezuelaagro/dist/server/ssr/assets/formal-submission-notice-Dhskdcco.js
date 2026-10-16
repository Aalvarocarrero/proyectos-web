import { n as require_jsx_runtime } from "../index.js";
import { i as safeRelativeReturnPath, r as isStandaloneAuth, t as chatGPTSignInPath } from "./auth-paths-DyLjOkUj.js";
var PREFIX = "venezuela-agro-formal-draft:";
var FormalSubmissionAuthError = class extends Error {
	constructor(code = "authentication_required") {
		super(code);
		this.code = code;
		this.name = "FormalSubmissionAuthError";
	}
};
function requiresFormalSession() {
	return isStandaloneAuth();
}
/** UI preflight only. The server still authenticates and checks every operation. */
async function requireFormalSubmissionSession(expectedOwner) {
	if (!requiresFormalSession()) return null;
	const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 6e3);
	try {
		const response = await fetch("/api/account-menu", {
			cache: "no-store",
			credentials: "same-origin",
			signal: controller.signal
		});
		if (response.status === 401) throw new FormalSubmissionAuthError();
		if (!response.ok) throw new Error("submission_session_unavailable");
		const session = await response.json();
		if (typeof session?.owner !== "string" || !session.owner) throw new FormalSubmissionAuthError();
		if (expectedOwner && session.owner !== expectedOwner) throw new FormalSubmissionAuthError("submission_account_mismatch");
		return session.owner;
	} finally {
		clearTimeout(timer);
	}
}
function formalSubmissionNeedsLogin(result) {
	return result?.reason === "authentication_required" || result?.reason === "account_changed";
}
function isFormalSubmissionAuthError(error) {
	return error instanceof FormalSubmissionAuthError;
}
function formalSubmissionError(error) {
	return error instanceof FormalSubmissionAuthError && error.code === "submission_account_mismatch" ? "Esta solicitud pertenece a otra sesión. Vuelve a entrar con la cuenta original; el borrador se conserva y no se ha vuelto a enviar." : "Necesitas iniciar sesión para enviar. Conservamos tu borrador; el servidor no ha confirmado el envío.";
}
/** Only invoked for an explicit login handoff, never auto-submitted or moved between account queues. */
function saveFormalDraft(kind, payload) {
	try {
		const data = JSON.stringify({
			version: 1,
			savedAt: Date.now(),
			payload
		});
		if (data.length > 8e4) return false;
		sessionStorage.setItem(PREFIX + kind, data);
		return sessionStorage.getItem(PREFIX + kind) === data;
	} catch {
		return false;
	}
}
function loadFormalDraft(kind) {
	try {
		const raw = sessionStorage.getItem(PREFIX + kind);
		if (!raw) return null;
		const data = JSON.parse(raw);
		if (data.version !== 1 || typeof data.savedAt !== "number" || Date.now() - data.savedAt < 0 || Date.now() - data.savedAt > 36e5) {
			sessionStorage.removeItem(PREFIX + kind);
			return null;
		}
		return data.payload;
	} catch {
		return null;
	}
}
function clearFormalDraft(kind) {
	try {
		sessionStorage.removeItem(PREFIX + kind);
	} catch {}
}
function formalSubmissionReturnPath(kind, path) {
	const url = new URL(safeRelativeReturnPath(path), "https://app.local");
	url.searchParams.set("resume", kind);
	return url.pathname + url.search + url.hash;
}
function formalSubmissionLoginPath(kind, path) {
	return chatGPTSignInPath(formalSubmissionReturnPath(kind, path));
}
//#endregion
//#region components/formal-submission-notice.tsx
var import_jsx_runtime = require_jsx_runtime();
function FormalSubmissionNotice({ onLogin, loginNeeded = false }) {
	if (!requiresFormalSession()) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-[#4c6b3a]/25 bg-[#edf3e7] p-4 text-sm leading-6",
		role: loginNeeded ? "alert" : void 0,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Las cotizaciones y los comentarios formales requieren una sesión de Google. Puedes preparar el borrador antes de entrar. Los enlaces de WhatsApp disponibles permiten contactar sin cuenta en Venezuela Agro." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onLogin,
				className: "mt-2 inline-flex min-h-11 items-center font-semibold underline",
				children: "Entrar y volver a este formulario"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs",
				children: "Al continuar, guardaremos el borrador solo en esta pestaña durante una hora. Volver de Google no lo envía automáticamente."
			})
		]
	});
}
//#endregion
export { formalSubmissionLoginPath as a, loadFormalDraft as c, saveFormalDraft as d, formalSubmissionError as i, requireFormalSubmissionSession as l, FormalSubmissionAuthError as n, formalSubmissionNeedsLogin as o, clearFormalDraft as r, isFormalSubmissionAuthError as s, FormalSubmissionNotice as t, requiresFormalSession as u };
