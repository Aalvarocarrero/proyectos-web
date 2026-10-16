import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { t as venezuelanStates } from "./venezuela-Cj1crq10.js";
import { t as MapPin } from "./map-pin-CLoB_NAM.js";
import { t as ArrowUpRight } from "./arrow-up-right-4sSx04o4.js";
import { t as Link } from "./link-CTsUsqTe.js";
import { t as Building2 } from "./building-2-BNaf1wUO.js";
import { t as useDirectoryFilters } from "./use-directory-filters-BQnZ7cZf.js";
import { t as matchesDirectorySearch } from "./directory-search-DOvvGzjM.js";
import { t as Search } from "./search-DIjj0o4I.js";
import { t as companyCategories } from "./company-D3GlpNfY.js";
//#region components/company-directory.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function CompanyDirectory({ companies, unavailable = false }) {
	const [filters, changeFilters] = useDirectoryFilters({
		q: "",
		rubro: "",
		estado: ""
	});
	const query = filters.q, category = filters.rubro, state = filters.estado;
	const setQuery = (value) => changeFilters({ q: value }), setCategory = (value) => changeFilters({ rubro: value }), setState = (value) => changeFilters({ estado: value });
	const searchInput = (0, import_react.useRef)(null);
	function clearFilters() {
		changeFilters({
			q: "",
			rubro: "",
			estado: ""
		});
		searchInput.current?.focus({ preventScroll: true });
	}
	const rows = companies.filter((c) => (!category || c.category === category) && (!state || c.state === state || c.coverageStates.some((s) => s === state)) && matchesDirectorySearch([
		c.name,
		c.description,
		c.productsSummary,
		c.municipality,
		c.state,
		c.category,
		...c.products.map((p) => p.name)
	], query));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "buscar-empresas",
		className: "scroll-mt-28",
		"aria-label": "Directorio de empresas",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 rounded-2xl border border-[#3e2a19]/10 bg-white p-5 shadow-[0_16px_40px_rgba(62,42,25,.04)] md:grid-cols-[1.4fr_1fr_1fr]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { size: 16 }), "¿Qué necesitas para producir?"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: searchInput,
							type: "search",
							enterKeyHint: "search",
							value: query,
							onChange: (e) => setQuery(e.target.value),
							placeholder: "Empresa, producto o municipio",
							className: "mt-2 h-12 w-full rounded-xl border border-[#3e2a19]/15 bg-[#faf7ef] px-3 text-base"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm font-semibold",
						children: ["Rubro", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: category,
							onChange: (e) => setCategory(e.target.value),
							className: "mt-2 h-12 w-full rounded-xl border border-[#3e2a19]/15 bg-[#faf7ef] px-3 text-base",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Todos los rubros"
							}), companyCategories.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm font-semibold",
						children: ["Ubicación o cobertura", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: state,
							onChange: (e) => setState(e.target.value),
							className: "mt-2 h-12 w-full rounded-xl border border-[#3e2a19]/15 bg-[#faf7ef] px-3 text-base",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Toda Venezuela"
							}), venezuelanStates.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "status",
				"aria-live": "polite",
				"aria-atomic": "true",
				className: "my-5 text-sm text-[#71685f]",
				children: [unavailable ? "No se ha podido comprobar el directorio." : `${rows.length} ${rows.length === 1 ? "empresa publicada" : "empresas publicadas"}`, (query || category || state) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "ml-4 min-h-11 underline",
					onClick: clearFilters,
					children: "Limpiar filtros"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-5 md:grid-cols-2 xl:grid-cols-3",
				children: rows.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "flex min-w-0 flex-col rounded-[1.7rem] border border-[#3e2a19]/10 bg-white p-6 [overflow-wrap:anywhere]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-4",
							children: [c.logoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: c.logoUrl,
								alt: `Logo de ${c.name}`,
								width: 72,
								height: 72,
								loading: "lazy",
								className: "size-18 rounded-2xl border object-contain p-1"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-18 items-center justify-center rounded-2xl bg-[#e8efdf] text-[#47623b]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { size: 32 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-[#f3ebdd] px-3 py-2 text-xs",
								children: c.category
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-6 text-2xl font-bold",
							children: c.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 line-clamp-3 text-sm leading-7 text-[#71685f]",
							children: c.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-5 flex items-center gap-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { size: 16 }),
								c.municipality ? `${c.municipality}, ` : "",
								c.state
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-xs text-[#71685f]",
							children: [
								c.products.length,
								" productos en catálogo · ",
								c.serviceMode
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-6",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							href: `/empresas/${c.id}`,
							className: "mt-auto flex min-h-12 items-center justify-between rounded-xl bg-[#e8efdf] px-4 text-sm font-semibold text-[#365026]",
							children: ["Conocer la empresa", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { size: 18 })]
						})
					]
				}, c.id))
			}),
			!rows.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-[2rem] border border-dashed border-[#4c6b3a]/30 bg-[#ece5d6] px-6 py-12 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, {
						className: "mx-auto text-[#4c6b3a]",
						size: 38
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display mt-5 text-3xl",
						children: unavailable ? "El directorio no está disponible por ahora." : companies.length ? "Probemos otra búsqueda." : "El próximo aliado del campo puede ser tu empresa."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-4 max-w-lg text-sm leading-7 text-[#71685f]",
						children: unavailable ? "No pudimos consultar las empresas. Vuelve a intentarlo; esta respuesta no significa que no existan registros." : companies.length ? "No encontramos empresas con esa combinación. Cambia el rubro, el estado o las palabras de búsqueda." : "Este directorio está listo para recibir solicitudes. Las empresas aparecerán aquí después de que sus responsables las registren y pasen por revisión."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-wrap justify-center gap-3",
						children: [unavailable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/empresas",
							className: "button-dark",
							children: "Volver a intentar"
						}) : companies.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "button-dark",
							onClick: clearFilters,
							children: "Ver todas las empresas"
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							href: "/empresas/registro",
							className: "button-light",
							children: "Registrar mi empresa"
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { CompanyDirectory };
