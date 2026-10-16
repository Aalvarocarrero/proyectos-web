import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { a as professionalImage, l as serviceModes, r as professionalDetails } from "./professional-profile-Bdu_R75C.js";
import { t as venezuelanStates } from "./venezuela-Cj1crq10.js";
import { i as DialogDescription, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-BB9AB3vt.js";
import { n as ProfessionalTariffSummary } from "./professional-tariffs-CK20DPxg.js";
import { t as ProfileSocials } from "./profile-socials-CNv5AvhP.js";
import { t as MapPin } from "./map-pin-CLoB_NAM.js";
import { n as BriefcaseBusiness, t as ProfessionalProfileView } from "./professional-profile-view-DRCXT-k5.js";
import { t as ArrowUpRight } from "./arrow-up-right-4sSx04o4.js";
import { t as Link } from "./link-CTsUsqTe.js";
import { n as usePublicConnection, r as visibleDemoRows, t as publicFeedRows } from "./use-offline-snapshot-D9a2gB0u.js";
import { t as useDirectoryFilters } from "./use-directory-filters-BQnZ7cZf.js";
import { t as matchesDirectorySearch } from "./directory-search-DOvvGzjM.js";
//#region components/professional-directory.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function ProfessionalDirectory({ initial, examples }) {
	const online = usePublicConnection();
	const rows = publicFeedRows(initial, online);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [filters, changeFilters] = useDirectoryFilters({
		q: "",
		estado: "",
		modalidad: "",
		perfil: ""
	});
	const query = filters.q, state = filters.estado, mode = filters.modalidad, profileType = filters.perfil;
	const setQuery = (value) => changeFilters({ q: value }), setState = (value) => changeFilters({ estado: value }), setMode = (value) => changeFilters({ modalidad: value }), setProfileType = (value) => changeFilters({ perfil: value });
	const [moreExamples, setMoreExamples] = (0, import_react.useState)(false);
	const searchInput = (0, import_react.useRef)(null);
	function clearFilters() {
		changeFilters({
			q: "",
			estado: "",
			modalidad: "",
			perfil: ""
		});
		searchInput.current?.focus({ preventScroll: true });
	}
	const filtered = [...rows, ...publicFeedRows(examples, online)].filter((p) => {
		const d = professionalDetails(p);
		return (!profileType || d.profileType === profileType) && (!state || p.state === state || d.coverageStates.includes(state)) && (!mode || p.serviceMode === mode || d.tariffs.some((tariff) => tariff.mode === mode)) && matchesDirectorySearch([
			p.name,
			p.profession,
			p.specialties,
			p.state,
			...d.sectors,
			...d.coverageStates
		], query);
	});
	const visible = visibleDemoRows(filtered, moreExamples);
	const visibleSelected = selected && (online || selected.demo) ? selected : null;
	const sampleCount = filtered.filter((p) => p.demo).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		id: "buscar-profesionales",
		className: "scroll-mt-28",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "DIRECTORIO PROFESIONAL"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display mt-2 text-3xl sm:text-4xl",
						children: "Encuentra apoyo para tu finca."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm leading-6 text-[#675f57]",
						children: "Filtra por especialidad y cobertura. Revisa la experiencia y acuerda el servicio directamente."
					})
				]
			}),
			!online && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mb-5 rounded-xl border bg-white p-4 text-sm leading-6",
				children: "Sin conexión. El directorio profesional requiere internet y no se descarga. Las muestras ficticias siguen disponibles."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-7 grid gap-4 rounded-2xl border border-[#3e2a19]/10 bg-white p-5 shadow-[0_16px_40px_rgba(62,42,25,.04)] md:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm font-semibold",
						children: ["Profesión, nombre o rubro", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: searchInput,
							type: "search",
							enterKeyHint: "search",
							value: query,
							onChange: (e) => setQuery(e.target.value),
							placeholder: "Ej. veterinaria, cacao, drones",
							className: "mt-2 h-12 w-full rounded-xl border border-[#3e2a19]/15 bg-[#faf7ef] px-3 text-base"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm font-semibold",
						children: ["Estado de atención", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: state,
							onChange: (e) => setState(e.target.value),
							className: "mt-2 h-12 w-full rounded-xl border border-[#3e2a19]/15 bg-[#faf7ef] px-3 text-base",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Todos los estados"
							}), venezuelanStates.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm font-semibold",
						children: ["Tipo de perfil", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: profileType,
							onChange: (e) => setProfileType(e.target.value),
							className: "mt-2 h-12 w-full rounded-xl border border-[#3e2a19]/15 bg-[#faf7ef] px-3 text-base",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Todos los perfiles"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Persona natural",
									children: "Profesional independiente"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Empresa",
									children: "Empresa"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm font-semibold",
						children: ["Modalidad", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: mode,
							onChange: (e) => setMode(e.target.value),
							className: "mt-2 h-12 w-full rounded-xl border border-[#3e2a19]/15 bg-[#faf7ef] px-3 text-base",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Todas las modalidades"
							}), serviceModes.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))]
						})]
					})
				]
			}),
			(query || state || mode || profileType) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-[#d7c8b2] bg-[#f8f3ea] px-4 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex-1 text-sm text-[#675f57]",
					children: ["Filtros: ", [
						query.trim(),
						state,
						profileType,
						mode
					].filter(Boolean).join(" · ")]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 rounded-full px-3 text-sm font-bold text-[#365026] underline",
					onClick: clearFilters,
					children: "Limpiar filtros"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "status",
				"aria-live": "polite",
				className: "mb-4 text-xs text-[#71685f]",
				children: [
					filtered.filter((p) => !p.demo && !p.founder).length,
					" perfiles publicados · ",
					filtered.filter((p) => p.founder).length,
					" perfil impulsor · ",
					filtered.filter((p) => p.demo).length,
					" muestras ficticias, sin contratación."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-6 text-[#71685f]",
					children: sampleCount > 1 && !moreExamples ? `Mostramos 1 de ${sampleCount} ejemplos que coinciden. Los perfiles reales se muestran completos.` : "Las muestras ficticias no permiten contratar servicios."
				}), sampleCount > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-expanded": moreExamples,
					className: "button-light",
					onClick: () => setMoreExamples((value) => !value),
					children: moreExamples ? "Mostrar un solo ejemplo" : "Explorar más ejemplos"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
				children: visible.map((p) => {
					const photo = professionalImage(p), d = professionalDetails(p);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: `relative flex min-w-0 flex-col [overflow-wrap:anywhere] rounded-[1.6rem] border p-6 ${p.founder ? "border-[#4c6b3a]/25 bg-[#211d1a] text-white" : "border-[#3e2a19]/10 bg-white"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [photo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: photo,
									alt: p.demo ? `Retrato generado por IA de ${p.name}; perfil ficticio` : `Fotografía de ${p.name}`,
									width: 56,
									height: 56,
									loading: "lazy",
									className: "size-14 rounded-full object-cover"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex size-12 shrink-0 items-center justify-center rounded-full bg-[#e8f0df] text-[#365026]",
									children: p.founder ? "AC" : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BriefcaseBusiness, { size: 22 })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-[#e8f0df] px-3 py-1 text-xs font-semibold text-[#365026]",
									children: p.demo ? "Perfil ficticio de demostración" : p.founder ? "Perfil fundador" : "Perfil publicado"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-xs font-semibold",
								children: d.profileType === "Empresa" ? "Empresa" : "Profesional independiente · persona natural"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-5 break-words text-xl font-bold",
								children: p.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: `mt-2 text-sm font-semibold ${p.founder ? "text-[#b7d79a]" : "text-[#4c6b3a]"}`,
								children: p.profession
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: `mt-4 line-clamp-3 text-sm leading-6 ${p.founder ? "text-white/70" : "text-[#71685f]"}`,
								children: p.introduction
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-5 flex items-center gap-2 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { size: 15 }),
									p.state,
									" · ",
									p.serviceMode
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-xs leading-5",
								children: p.specialties
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm font-semibold",
								children: d.tariffs.length ? `${d.tariffs.length} ${d.tariffs.length === 1 ? "tarifa publicada" : "tarifas por modalidad"} · ver perfil` : "Precio a consultar"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfessionalTariffSummary, {
								tariffs: d.tariffs,
								mode,
								demo: p.demo,
								name: p.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4",
								children: [p.demo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-xs leading-5 text-[#71685f]",
									children: "Imagen generada por IA · perfil 100 % ficticio"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "relative z-10",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileSocials, {
										socials: {
											...d.socials,
											instagram: d.socials.instagram || d.instagram,
											website: d.socials.website || d.website
										},
										demo: p.demo
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setSelected(p),
								"aria-label": `Ver perfil completo de ${p.name}`,
								"aria-haspopup": "dialog",
								className: "stretched-card-action mt-5 flex min-h-12 items-center justify-between gap-3 rounded-xl bg-[#f3ebdd] px-4 py-3 text-sm font-semibold text-[#3e2a19]",
								children: ["Ver perfil completo", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { size: 17 })]
							})
						]
					}, p.id);
				})
			}),
			online && !filtered.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-dashed p-8 text-center text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No hay perfiles con estos filtros. Prueba otro estado o especialidad." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "button-dark mt-5",
					onClick: clearFilters,
					children: "Ver todos los perfiles"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!visibleSelected,
				onOpenChange: (open) => !open && setSelected(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[90dvh] overflow-y-auto bg-[#f8f3ea] p-5 sm:max-w-3xl sm:p-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "sr-only",
							children: ["Perfil de ", visibleSelected?.name]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "sr-only",
							children: "Trayectoria, servicios y contacto del profesional."
						}),
						visibleSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfessionalProfileView, { profile: visibleSelected }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							href: `/profesionales/${visibleSelected.id}`,
							className: "mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#4c6b3a]",
							children: ["Abrir página del perfil", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { size: 16 })]
						})] })
					]
				})
			})
		]
	});
}
//#endregion
export { ProfessionalDirectory };
