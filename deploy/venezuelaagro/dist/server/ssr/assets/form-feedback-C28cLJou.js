import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { t as createLucideIcon } from "./createLucideIcon-ZIVktEBq.js";
import { t as CircleCheck } from "./circle-check-7KdtDT0-.js";
import { t as Info } from "./info-DdI7MQkT.js";
//#region ../venezuela-agro-auth/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var CircleAlert = createLucideIcon("circle-alert", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["line", {
		x1: "12",
		x2: "12",
		y1: "8",
		y2: "12",
		key: "1pkeuh"
	}],
	["line", {
		x1: "12",
		x2: "12.01",
		y1: "16",
		y2: "16",
		key: "4dfq90"
	}]
]);
//#endregion
//#region components/form-feedback.tsx
var import_jsx_runtime = require_jsx_runtime();
/** Errors are announced and focused; saved locally is deliberately not a published success. */
function FormFeedback({ message, tone = "info" }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (message && tone === "error") ref.current?.focus();
	}, [message, tone]);
	if (!message) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		tabIndex: -1,
		role: tone === "error" ? "alert" : "status",
		"aria-atomic": "true",
		className: `flex min-w-0 items-start gap-3 rounded-2xl border p-4 text-sm leading-6 outline-offset-4 ${tone === "error" ? "border-red-200 bg-red-50 text-red-900" : tone === "success" ? "border-[#4c6b3a]/25 bg-[#e8f0df] text-[#365026]" : "border-[#3e2a19]/15 bg-[#faf7ef] text-[#514534]"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(tone === "error" ? CircleAlert : tone === "success" ? CircleCheck : Info, {
			size: 20,
			className: "mt-0.5 shrink-0",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: message })]
	});
}
function PublicFormGuide({ local = true }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "rounded-2xl border border-[#4c6b3a]/20 bg-[#e8f0df]/60 p-4 sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-semibold text-[#365026]",
				children: "Completa · Revisa · Envía"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-[#514534]",
				children: "Los campos con * son obligatorios. Incluye solo datos que quieras hacer públicos. Enviar una solicitud no la publica: primero pasa por revisión."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-5 text-[#71685f]",
				children: local ? "Al guardar sin conexión, el envío puede quedar pendiente en este dispositivo. Consulta su estado en Mi Finca → Sincronización." : "El envío necesita conexión. Puedes guardar y recuperar un borrador en esta pestaña antes de enviarlo."
			})
		]
	});
}
//#endregion
export { PublicFormGuide as n, FormFeedback as t };
