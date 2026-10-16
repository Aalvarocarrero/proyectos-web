import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
//#region components/learning-form-preview.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var Listing = (0, import_react.lazy)(() => import("./listing-form-jy8c_mFj.js").then((n) => n.n).then((m) => ({ default: m.ListingForm })));
var Professional = (0, import_react.lazy)(() => import("./community-forms-DQzipyaL.js").then((n) => n.r).then((m) => ({ default: m.ProfessionalForm })));
function LearningFormPreview({ kind }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		onToggle: (e) => setOpen(e.currentTarget.open),
		className: "mt-7 rounded-2xl border bg-white p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
				className: "cursor-pointer text-sm font-semibold",
				children: "Explorar el formulario real · muestra sin envío"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs leading-6 text-[#71685f]",
				children: "Esta vista utiliza los mismos campos de la plataforma. Está deshabilitada para evitar crear registros de prueba. Para guardar tus datos, usa el botón que abre el área correspondiente."
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 max-h-[60dvh] overflow-y-auto overscroll-contain rounded-xl bg-[#f8f3ea] p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("fieldset", {
					disabled: true,
					className: "min-w-0 pointer-events-none",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
						fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Cargando formulario…" }),
						children: kind === "listing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Listing, { sellerName: "Nombre del responsable" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Professional, { name: "Tu nombre profesional" })
					})
				})
			})
		]
	});
}
//#endregion
export { LearningFormPreview };
