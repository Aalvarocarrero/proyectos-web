import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { t as Button } from "./button-D3WpGtsB.js";
import { t as Input } from "./input-Coa5XNOy.js";
import { t as CircleCheck } from "./circle-check-7KdtDT0-.js";
import { t as RotateCcw } from "./rotate-ccw-Bz9RMZRD.js";
//#region components/design-form-example.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
/** A deliberately memory-only example. No API, storage or queue operations. */
function DesignFormExample() {
	const [error, setError] = (0, import_react.useState)("");
	const [complete, setComplete] = (0, import_react.useState)(false);
	const input = (0, import_react.useRef)(null);
	function submit(event) {
		event.preventDefault();
		if ((input.current?.value.trim() ?? "").length < 3) {
			setComplete(false);
			setError("Escribe al menos 3 caracteres para identificar esta parcela.");
			input.current?.focus();
			return;
		}
		setError("");
		setComplete(true);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: submit,
		noValidate: true,
		"aria-describedby": "design-form-note",
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				id: "design-form-note",
				className: "text-sm leading-6 text-[#675f57]",
				children: "Ejemplo interactivo. Valida los campos en esta pantalla; no guarda registros, no envía información y se reinicia al salir."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					htmlFor: "design-parcel",
					className: "text-sm font-bold",
					children: ["Nombre de la parcela ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-normal",
						children: "(obligatorio)"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					ref: input,
					id: "design-parcel",
					name: "parcel",
					required: true,
					minLength: 3,
					maxLength: 80,
					placeholder: "Ej. Potrero El Samán",
					className: "mt-2",
					"aria-invalid": !!error,
					"aria-describedby": error ? "design-parcel-hint design-parcel-error" : "design-parcel-hint",
					onChange: () => {
						setError("");
						setComplete(false);
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					id: "design-parcel-hint",
					className: "mt-2 text-xs leading-5 text-[#675f57]",
					children: "Entre 3 y 80 caracteres. Usa un nombre fácil de reconocer."
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					id: "design-parcel-error",
					role: "alert",
					className: "mt-2 text-sm font-semibold text-[#b42318]",
					children: error
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Probar validación"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "reset",
					variant: "outline",
					onClick: () => {
						setError("");
						setComplete(false);
						input.current?.focus();
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { "aria-hidden": "true" }), "Reiniciar"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "status",
				"aria-live": "polite",
				"aria-atomic": "true",
				children: complete && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-start gap-2 rounded-xl border border-[#4c6b3a]/30 bg-[#edf2e7] p-4 text-sm leading-6 text-[#365026]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
						className: "mt-1 shrink-0",
						size: 18,
						"aria-hidden": "true"
					}), "Campos válidos. Esta es una demostración: no se ha guardado ni enviado nada."]
				})
			})
		]
	});
}
//#endregion
export { DesignFormExample };
