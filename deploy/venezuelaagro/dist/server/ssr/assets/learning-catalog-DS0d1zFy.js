import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { t as ArrowRight } from "./arrow-right-BK-E7gK8.js";
import { t as Link } from "./link-CTsUsqTe.js";
import { t as Search } from "./search-DIjj0o4I.js";
//#region lib/learning-search.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/** Accent-insensitive matching keeps searches natural on mobile keyboards. */
function normalize(value) {
	return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
}
function filterLearningArticles(articles, query, category = "") {
	const terms = normalize(query).split(/\s+/).filter(Boolean);
	return articles.filter((article) => (!category || article.category === category) && terms.every((term) => normalize([
		article.title,
		article.description,
		article.category,
		...article.keywords
	].join(" ")).includes(term)));
}
//#endregion
//#region components/learning-catalog.tsx
var import_jsx_runtime = require_jsx_runtime();
function LearningCatalog({ articles }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("");
	const search = (0, import_react.useRef)(null);
	const categories = [...new Set(articles.map((article) => article.category))];
	const matches = filterLearningArticles(articles, query, category);
	const tutorials = matches.filter((article) => article.tutorial);
	const library = matches.filter((article) => !article.tutorial);
	function clear() {
		setQuery("");
		setCategory("");
		search.current?.focus();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "learning-search rounded-2xl border border-[#3e2a19]/15 bg-white p-5 sm:p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-[1fr_16rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-sm font-semibold",
					htmlFor: "learning-search",
					children: ["¿Qué necesitas aprender?", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
							"aria-hidden": "true",
							size: 18,
							className: "pointer-events-none absolute left-3 top-3.5 text-[#675f57]"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: search,
							id: "learning-search",
							type: "search",
							value: query,
							onChange: (event) => setQuery(event.target.value),
							placeholder: "Buscar: pesaje, cacao, sin señal…",
							className: "min-h-12 w-full rounded-xl border border-[#3e2a19]/25 bg-white py-3 pl-10 pr-3 font-normal"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-sm font-semibold",
					htmlFor: "learning-category",
					children: ["Tema", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						id: "learning-category",
						value: category,
						onChange: (event) => setCategory(event.target.value),
						className: "mt-2 min-h-12 w-full rounded-xl border border-[#3e2a19]/25 bg-white px-3 font-normal",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Todos los temas"
						}), categories.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: item }, item))]
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					role: "status",
					"aria-live": "polite",
					"aria-atomic": "true",
					className: "text-sm text-[#675f57]",
					children: [
						matches.length,
						" ",
						matches.length === 1 ? "guía disponible" : "guías disponibles",
						query.trim() || category ? " con estos filtros" : " para consultar",
						"."
					]
				}), (query || category) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: clear,
					className: "min-h-11 px-3 text-sm font-bold text-[#365026] underline",
					children: "Limpiar filtros"
				})]
			})]
		}),
		!matches.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "my-8 rounded-2xl border border-dashed border-[#3e2a19]/25 p-7",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-xl font-semibold",
					children: "No encontramos una guía con esos filtros."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm leading-7 text-[#675f57]",
					children: "Prueba una palabra más corta, cambia el tema o vuelve a ver toda la biblioteca."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: clear,
					className: "button-dark mt-4",
					children: "Ver todas las guías"
				})
			]
		}),
		!!tutorials.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3",
			children: tutorials.map((article) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				id: article.slug,
				className: "scroll-mt-28 flex flex-col rounded-2xl border border-[#3e2a19]/10 bg-white p-5 sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: article.tutorial.visual,
						alt: `Esquema didáctico: ${article.tutorial.screen}`,
						width: 960,
						height: 640,
						loading: "lazy",
						decoding: "async",
						className: "mb-5 w-full rounded-xl border bg-[#f8f3ea]"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-bold text-[#365026]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							"aria-hidden": "true",
							children: [article.emoji, " "]
						}), article.category]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display mt-4 text-3xl leading-tight",
						children: article.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 flex-1 text-sm leading-7 text-[#675f57]",
						children: article.description
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#3e2a19]/10 pt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-[#675f57]",
							children: [article.readMinutes, " min de lectura"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							href: `/aprende/${article.slug}`,
							className: "inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#365026]",
							"aria-label": `Ver paso a paso: ${article.title}`,
							children: ["Ver paso a paso ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
								size: 16,
								"aria-hidden": "true"
							})]
						})]
					})
				]
			}, article.slug))
		}),
		!!library.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-12",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "section-kicker",
					children: "BIBLIOTECA DEL CAMPO"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display mt-3 text-3xl sm:text-4xl",
					children: "Conocimiento para producir mejor."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3",
					children: library.map((article) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						href: `/aprende/${article.slug}`,
						className: "flex flex-col rounded-2xl border border-[#3e2a19]/10 bg-white p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs font-semibold text-[#365026]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									"aria-hidden": "true",
									children: [article.emoji, " "]
								}), article.category]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display mt-4 text-2xl",
								children: article.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 flex-1 text-sm leading-7 text-[#675f57]",
								children: article.description
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mt-4 text-sm font-semibold",
								children: [
									"Leer guía · ",
									article.readMinutes,
									" min →"
								]
							})
						]
					}, article.slug))
				})
			]
		})
	] });
}
//#endregion
export { LearningCatalog };
