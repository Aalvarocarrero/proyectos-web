import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-CBD8GOFt.js";
import { t as ContextualWhatsAppContact } from "./contextual-whatsapp-contact-CQpLkS3Q.js";
import { t as AgroCategoryIcon } from "./agro-category-icon-BvENtu1T.js";
//#region components/project-example.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var projectExampleFields = [
	["Nombre del proyecto", "Huerto piloto comunitario · ejemplo ficticio"],
	["Rubro", "Hortalizas · planificación de un proyecto"],
	["Estado", "Lara · contexto hipotético, sin ubicación real"],
	["Contacto", "Sin contacto operativo. Un proyecto real necesita los datos de su responsable."],
	["Objetivo", "Comparar alternativas para un huerto piloto de 500 m² antes de decidir una inversión. La superficie es un supuesto didáctico, no una propiedad ni una instalación disponible."],
	["Qué tiene hoy", "Un equipo ficticio de 3 personas y una lista de preguntas sobre suelo, agua, acceso y organización. No hay infraestructura, títulos ni permisos acreditados en esta muestra."],
	["Qué necesita", "Una visita técnica por acordar, evaluación del agua y suelo, y un presupuesto basado en condiciones locales. No se propone una receta de cultivo."],
	["Aporte a la comunidad", "Explorar formación y colaboración entre productores. El ejemplo no promete puestos de trabajo, cosechas ni ingresos."],
	["Colaboración solicitada", "Orientación para definir viabilidad, responsables y próximos pasos. No es una solicitud activa de dinero ni una oferta de inversión."]
];
function ProjectExample() {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-10 rounded-2xl border border-[#4c6b3a]/20 bg-white p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "flex items-center gap-3 text-xl font-bold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgroCategoryIcon, { category: "Planificación" }), "Cómo se presenta un proyecto"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-7",
				children: "Revisa una propuesta totalmente ficticia para entender los campos. Está separada de los proyectos publicados y no completa ni envía tu formulario."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "button-light mt-4",
				type: "button",
				onClick: () => setOpen(true),
				children: "Ver proyecto de ejemplo"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Proyecto ficticio de demostración" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "No es una iniciativa activa ni permite contactar, donar o invertir." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
							className: "grid gap-4",
							children: projectExampleFields.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 border-b pb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-sm font-bold",
									children: label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "mt-1 break-words text-sm leading-7",
									children: value
								})]
							}, label))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextualWhatsAppContact, {
							context: "el proyecto Huerto piloto comunitario · ejemplo ficticio",
							demo: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button-dark",
							type: "button",
							onClick: () => setOpen(false),
							children: "Cerrar ejemplo"
						})
					]
				})
			})
		]
	});
}
//#endregion
export { ProjectExample };
