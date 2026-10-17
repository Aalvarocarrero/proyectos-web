import { E as __toESM, T as __exportAll, b as require_react, n as require_jsx_runtime } from "../index.js";
import { n as publicWhatsAppUrl, t as contextualContactMessage } from "./whatsapp-contact-DNnrmW1P.js";
import { i as DialogDescription, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-CBD8GOFt.js";
import { t as MessageCircle } from "./message-circle-CD1XYnYY.js";
//#region components/contextual-whatsapp-contact.tsx
var contextual_whatsapp_contact_exports = /* @__PURE__ */ __exportAll({ ContextualWhatsAppContact: () => ContextualWhatsAppContact });
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function ContextualWhatsAppContact({ context, phone, enabled, demo = false, label = "Consultar por WhatsApp", unavailableMessage, className = "" }) {
	const [preview, setPreview] = (0, import_react.useState)(false), id = (0, import_react.useId)();
	const href = publicWhatsAppUrl({
		phone,
		enabled,
		demo
	}, context);
	const action = "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#176b3b] px-4 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-[#12562f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176b3b]";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `min-w-0 ${className}`,
		"data-contextual-contact": "whatsapp",
		children: [
			demo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: action,
				"aria-haspopup": "dialog",
				"aria-describedby": id,
				onClick: () => setPreview(true),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {
					size: 20,
					"aria-hidden": "true"
				}), "WhatsApp · Ejemplo"]
			}) : href ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				className: action,
				href,
				target: "_blank",
				rel: "noopener noreferrer",
				"aria-describedby": id,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {
					size: 20,
					"aria-hidden": "true"
				}), label]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				disabled: true,
				"aria-describedby": id,
				className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border bg-[#eee8dd] px-4 py-3 text-sm font-semibold text-[#5f574f]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {
					size: 20,
					"aria-hidden": "true"
				}), "WhatsApp no disponible"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				id,
				className: "mt-2 text-xs leading-5 text-[#5f574f]",
				children: demo ? "Vista previa del mensaje. Es una demostración sin destinatario real." : href ? "El mensaje incluye lo que estás viendo. Tú decides si lo envías en WhatsApp." : unavailableMessage || (!phone ? "Todavía no hay un teléfono público habilitado para WhatsApp." : !enabled ? "El responsable no ha habilitado WhatsApp para este contacto público." : "El teléfono público necesita un código de país válido.")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: preview,
				onOpenChange: setPreview,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[90dvh] overflow-y-auto bg-[#f8f3ea] sm:max-w-xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "WhatsApp · Mensaje de ejemplo" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Esta demostración no abre una conversación ni envía mensajes." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-xl bg-white p-4 text-sm leading-7",
							children: contextualContactMessage(context)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "button-light",
							onClick: () => setPreview(false),
							children: "Cerrar ejemplo"
						})
					]
				})
			})
		]
	});
}
//#endregion
export { contextual_whatsapp_contact_exports as n, ContextualWhatsAppContact as t };
