import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { q as animalRecordEventLabel } from "./offline-db-Co86AgBD.js";
import { t as createLucideIcon } from "./createLucideIcon-OtKWZ-kp.js";
import { i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-CBD8GOFt.js";
import { t as BookOpen } from "./book-open-DMB1qHG5.js";
import { t as ArrowUpRight } from "./arrow-up-right-CFz5Ndmb.js";
import { t as Link } from "./link-BIjyqzpN.js";
import { t as Search } from "./search-BzuNqXK0.js";
import { ConnectionIndicator } from "./connection-indicator-CTUOm752.js";
import { t as FarmAssetPack } from "./farm-asset-pack-C3s4Y-70.js";
import FarmMasterplanScene from "./farm-masterplan-scene-DZlYBgPR.js";
import { _ as FarmRecordValue, n as AnimalDossier, t as FarmIllustratedScene, y as farmMoneyDetailClass } from "./farm-illustrated-scene-CuJXQ7h-.js";
import { n as OfflinePreparation, t as Map } from "./map-C4cK7kop.js";
import { t as createFarmShowcase } from "./farm-showcase-DiJbFLMk.js";
//#region node_modules/lucide-react/dist/esm/icons/arrow-left.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ArrowLeft = createLucideIcon("arrow-left", [["path", {
	d: "m12 19-7-7 7-7",
	key: "1l729n"
}], ["path", {
	d: "M19 12H5",
	key: "x3x0zl"
}]]);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Eye = createLucideIcon("eye", [["path", {
	d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
	key: "1nclc0"
}], ["circle", {
	cx: "12",
	cy: "12",
	r: "3",
	key: "1v7zrd"
}]]);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Leaf = createLucideIcon("leaf", [["path", {
	d: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z",
	key: "nnexq3"
}], ["path", {
	d: "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",
	key: "mt58a7"
}]]);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Rotate3d = createLucideIcon("rotate-3d", [
	["path", {
		d: "m15.194 13.707 3.814 1.86-1.86 3.814",
		key: "16shm9"
	}],
	["path", {
		d: "M16.47214 7.52786 A 5 10 0 1 0 13 21.79796",
		key: "1245p8"
	}],
	["path", {
		d: "M21.79796 11 A 10 5 0 1 0 19 15.57071",
		key: "1i40ks"
	}]
]);
//#endregion
//#region components/farm-showcase.tsx
var import_jsx_runtime = require_jsx_runtime();
var button = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#365026]/25 bg-white px-4 py-2 text-sm font-semibold text-[#29442c] hover:bg-[#edf2e5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#365026]";
var typeLabels = {
	area: "Área",
	animal: "Animal",
	crop: "Cultivo",
	weight: "Pesaje",
	inventory: "Inventario",
	task: "Tarea",
	"production-cycle": "Ciclo productivo",
	finance: "Finanzas",
	reproduction: "Reproducción",
	health: "Control sanitario",
	plan: "Escenario",
	document: "Documento"
};
var fieldLabels = {
	name: "Nombre",
	usage: "Uso",
	areaSqM: "Superficie (m²)",
	shape: "Forma",
	lengthM: "Largo (m)",
	widthM: "Ancho (m)",
	diameterM: "Diámetro (m)",
	crop: "Cultivo",
	cropVariety: "Variedad",
	waterTrough: "Bebedero del ejemplo",
	x: "Posición horizontal (%)",
	y: "Posición vertical (%)",
	heightM: "Altura ilustrativa (m)",
	fenced: "Con cerca",
	tag: "Identificación",
	species: "Especie",
	sex: "Sexo",
	birthDate: "Nacimiento",
	weightKg: "Peso (kg)",
	breed: "Raza",
	purpose: "Propósito",
	status: "Estado",
	notes: "Notas del ejemplo",
	areaId: "Área vinculada",
	animalId: "Animal vinculado",
	animalTitle: "Animal",
	measuredAt: "Fecha del pesaje",
	objective: "Objetivo",
	startDate: "Inicio",
	endDate: "Fin",
	quantity: "Cantidad",
	unit: "Unidad",
	minimum: "Mínimo",
	location: "Ubicación",
	kind: "Tipo",
	amount: "Monto de ejemplo",
	currency: "Moneda original",
	date: "Fecha",
	supplier: "Proveedor",
	invoiceReference: "Referencia",
	eventType: "Tipo de evento",
	outcome: "Resultado registrado",
	event: "Evento",
	group: "Grupo",
	nextDate: "Próxima fecha de ejemplo",
	product: "Producto",
	batch: "Lote",
	professional: "Responsable",
	days: "Días",
	feedPerUnit: "Alimento por unidad",
	waterPerUnitDay: "Agua por unidad y día",
	areaPerUnit: "Superficie por unidad",
	costPerUnit: "Costo por unidad",
	expectedRevenue: "Ingreso esperado del escenario",
	assumptionsReviewed: "Supuestos revisados",
	totals: "Totales del escenario",
	feed: "Alimento",
	water: "Agua",
	area: "Superficie",
	variableCost: "Costo variable",
	margin: "Margen"
};
var hiddenFields = new Set([
	"mapLayoutVersion",
	"mapX",
	"mapY",
	"mapWidth",
	"mapHeight",
	"color",
	"typedAreaOutline",
	"demoPlanPlacement",
	"planPlacement"
]);
var primaryRecordTypes = [
	"area",
	"animal",
	"inventory",
	"weight",
	"production-cycle",
	"plan"
];
var cleanTitle = (title) => title.replace(/\s*·\s*ejemplo\b/gi, "").trim();
var number = (value) => value.toLocaleString("es-VE", { maximumFractionDigits: 2 });
function valueText(value, records) {
	if (value === null || value === void 0 || value === "") return "Sin definir";
	if (typeof value === "boolean") return value ? "Sí" : "No";
	if (typeof value === "number") return number(value);
	if (typeof value === "string") return records.find((record) => record.id === value)?.payload.title ?? value;
	if (Array.isArray(value)) return value.map((item) => valueText(item, records)).join(" · ");
	if (typeof value === "object") return Object.entries(value).map(([key, item]) => `${fieldLabels[key] ?? key}: ${valueText(item, records)}`).join("\n");
	return String(value);
}
/** A presentation of the current fixture; interaction changes only React view state. */
function FarmShowcase() {
	const [model] = (0, import_react.useState)(createFarmShowcase);
	const [tourPaused, setTourPaused] = (0, import_react.useState)(false);
	const [view, setView] = (0, import_react.useState)("masterplan");
	const [selectedId, setSelectedId] = (0, import_react.useState)();
	const [openRecordId, setOpenRecordId] = (0, import_react.useState)();
	const [openAnimalId, setOpenAnimalId] = (0, import_react.useState)();
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [query, setQuery] = (0, import_react.useState)("");
	const dossierAnimal = model.animalRecords.find((row) => row.id === openAnimalId && row.payload.farmId === model.farm.id) ?? null;
	const openAnimal = (id) => {
		if (model.animalRecords.some((row) => row.id === id && row.payload.farmId === model.farm.id)) setOpenAnimalId(id);
	};
	const record = model.records.find((row) => row.id === openRecordId);
	const linked = record ? model.records.filter((row) => row.payload.data.areaId === record.id || row.payload.data.animalId === record.id) : [];
	const groups = [
		{
			id: "all",
			label: "Todos",
			count: model.records.length
		},
		{
			id: "area",
			label: "Áreas",
			count: model.areaRecords.length
		},
		{
			id: "animal",
			label: "Animales",
			count: model.animalRecords.length
		},
		{
			id: "crops",
			label: "Cultivos",
			count: model.cropAreas.length
		},
		{
			id: "inventory",
			label: "Inventario",
			count: model.records.filter((row) => row.payload.recordType === "inventory").length
		},
		{
			id: "weight",
			label: "Pesajes",
			count: model.records.filter((row) => row.payload.recordType === "weight").length
		},
		{
			id: "production-cycle",
			label: "Ciclos productivos",
			count: model.records.filter((row) => row.payload.recordType === "production-cycle").length
		},
		{
			id: "plan",
			label: "Escenarios",
			count: model.records.filter((row) => row.payload.recordType === "plan").length
		},
		{
			id: "other",
			label: "Más registros",
			count: model.records.filter((row) => !primaryRecordTypes.includes(row.payload.recordType)).length
		}
	];
	const visibleRecords = (0, import_react.useMemo)(() => {
		const normalize = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
		const term = normalize(query.trim());
		return model.records.filter((row) => {
			return (filter === "all" || (filter === "crops" ? model.cropAreas.some((area) => area.id === row.id) : filter === "other" ? !primaryRecordTypes.includes(row.payload.recordType) : row.payload.recordType === filter)) && (!term || normalize(`${row.payload.title} ${row.payload.category} ${String(row.payload.data.tag ?? "")}`).includes(term));
		});
	}, [
		model,
		filter,
		query
	]);
	const openArea = (id) => {
		setSelectedId(id);
		setOpenRecordId(id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-[#f2f2e7] pb-20 text-[#29442c]",
		"data-farm-showcase-version": model.templateVersion,
		"data-masterplan-immersive": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "border-b border-[#375437]/20 bg-[#203e2d] px-4 py-5 text-white sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						href: "/",
						className: "inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#e4eddc]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
							className: "size-4",
							"aria-hidden": "true"
						}), "VenezuelaAgro"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						"aria-label": "Explorar la vista previa",
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionIndicator, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								href: "/marketplace",
								className: "inline-flex min-h-11 items-center gap-2 rounded-full bg-[#d9ebbb] px-5 text-sm font-semibold text-[#203e2d]",
								children: ["Mercado", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, {
									className: "size-4",
									"aria-hidden": "true"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								href: "/finca-demo",
								className: "inline-flex min-h-11 items-center rounded-full border border-white/30 px-4 py-2 text-sm font-semibold",
								children: "Demostración editable guardada"
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto mt-5 max-w-[1440px]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#c4d8b2]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, {
								className: "size-4",
								"aria-hidden": "true"
							}), "Demostración de solo lectura"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "font-display mt-2 text-3xl leading-tight sm:text-5xl",
							children: [
								"Finca modelo · ",
								number(model.farm.payload.areaSqM / 1e4),
								" ha"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 max-w-3xl text-sm leading-6 text-[#d6e0cf]",
							children: "Recorre Finca Horizonte y consulta cada área. Esta vista muestra la plantilla actual; tu demostración editable guardada conserva sus propios datos."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"aria-label": "Contenido de la finca modelo",
							className: "mt-4 flex flex-wrap gap-2 text-sm font-semibold",
							children: [
								`${model.areaRecords.length} áreas`,
								`${model.animalRecords.length} animales ubicados`,
								`${model.cropAreas.length} cultivos`,
								"400 × 250 m"
							].map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full border border-white/20 bg-white/5 px-3 py-2",
								children: label
							}, label))
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-[1440px] space-y-6 px-3 pt-5 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						"aria-label": "Recorrido de la finca modelo",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4 flex flex-wrap items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									role: "group",
									"aria-label": "Elegir vista del plano",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: button,
										"aria-pressed": view === "masterplan",
										onClick: () => setView("masterplan"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rotate3d, {
											className: "size-4",
											"aria-hidden": "true"
										}), "Recorrido 3D"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: button,
										"aria-pressed": view === "illustrated",
										onClick: () => setView("illustrated"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, {
											className: "size-4",
											"aria-hidden": "true"
										}), "Plano ilustrado 2D"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: "#registros-modelo",
									className: button,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
										className: "size-4",
										"aria-hidden": "true"
									}), "Consultar registros"]
								})]
							}),
							view === "masterplan" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmMasterplanScene, {
								propertyOutline: model.boundary.points,
								areas: model.illustrated.areas,
								animals: model.illustrated.animals,
								animalRecords: model.animalRecords.map((row) => ({
									id: row.id,
									title: row.payload.title,
									category: row.payload.category,
									areaId: typeof row.payload.data.areaId === "string" ? row.payload.data.areaId : null
								})),
								onOpenAnimal: openAnimal,
								farmName: model.farm.payload.name,
								physicalAreaSqM: model.farm.payload.areaSqM,
								surveyBased: model.boundary.basis === "survey",
								selectedId,
								onSelect: openArea,
								onReturn: () => setView("illustrated"),
								returnLabel: "Ver plano 2D",
								autoTour: true,
								tourPaused,
								onTourPauseChange: setTourPaused,
								interactionBlocked: Boolean(record || dossierAnimal),
								readOnly: true
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmIllustratedScene, {
								physicalAreaSqM: model.farm.payload.areaSqM,
								propertyOutline: model.boundary.points,
								areas: model.illustrated.areas,
								animals: model.illustrated.animals,
								farmName: "Finca Horizonte · modelo de solo lectura",
								selectedId,
								onSelect: openArea,
								onOpen: openArea,
								onOrganize: () => setView("masterplan"),
								assetBase: "/plan-oblique",
								readOnly: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 px-1 text-xs leading-5 text-[#56644b]",
								children: "Composición ficticia proporcional. Edificios, animales y vegetación son ilustrativos; no es un levantamiento 3D ni una imagen satelital. Las fechas y cantidades pertenecen al ejemplo."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "rounded-2xl border border-[#4c6b3a]/20 bg-white p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
							className: "cursor-pointer text-sm font-bold text-[#365026]",
							children: "Preparar esta finca modelo sin conexión"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfflinePreparation, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmAssetPack, {})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						id: "registros-modelo",
						"aria-labelledby": "registros-modelo-title",
						className: "scroll-mt-5 rounded-3xl border border-[#4c6b3a]/20 bg-white p-4 sm:p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-bold uppercase tracking-[.12em] text-[#59754b]",
										children: "Explorar las fichas"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										id: "registros-modelo-title",
										className: "font-display mt-1 text-2xl sm:text-3xl",
										children: "Registros de la finca modelo"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-sm leading-6 text-[#56644b]",
										children: [
											model.records.length,
											" registros ficticios y ",
											model.listings.length,
											" borradores de productos de la plantilla ",
											model.templateVersion,
											". Toca una ficha para consultar sus datos y vínculos."
										]
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-2 rounded-full bg-[#edf2e5] px-3 py-2 text-xs font-bold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leaf, {
										className: "size-4",
										"aria-hidden": "true"
									}), "Solo consulta"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-5 flex flex-wrap gap-2",
								role: "group",
								"aria-label": "Filtrar registros",
								children: groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: `${button} aria-pressed:bg-[#365026] aria-pressed:text-white`,
									"aria-pressed": filter === group.id,
									onClick: () => setFilter(group.id),
									children: [
										group.label,
										" · ",
										group.count
									]
								}, group.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mt-4 block max-w-xl text-sm font-semibold",
								children: ["Buscar por nombre, categoría o identificación", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex items-center gap-2 rounded-xl border border-[#365026]/25 px-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
										className: "size-4 shrink-0 text-[#59754b]",
										"aria-hidden": "true"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "min-h-11 w-full min-w-0 bg-transparent text-base font-normal outline-none focus-visible:underline",
										type: "search",
										value: query,
										onChange: (event) => setQuery(event.target.value),
										placeholder: "Alba, tomate, potrero…"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								role: "status",
								className: "mt-3 text-xs text-[#56644b]",
								children: [
									visibleRecords.length,
									" ",
									visibleRecords.length === 1 ? "ficha encontrada" : "fichas encontradas"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 grid max-h-[34rem] gap-2 overflow-y-auto rounded-2xl p-1 sm:grid-cols-2 lg:grid-cols-3",
								children: visibleRecords.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "min-h-20 rounded-xl border border-[#365026]/15 bg-[#f7f8f1] p-4 text-left hover:border-[#365026]/50 hover:bg-[#edf2e5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#365026]",
									onClick: () => {
										if (row.payload.recordType === "animal") {
											openAnimal(row.id);
											return;
										}
										if (row.payload.recordType === "area") setSelectedId(row.id);
										setOpenRecordId(row.id);
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "block text-xs text-[#59754b]",
											children: [
												typeLabels[row.payload.recordType],
												" · ",
												row.payload.category
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-1 block break-words text-sm font-semibold",
											children: cleanTitle(row.payload.title)
										}),
										row.payload.recordType === "area" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-1 block text-xs text-[#56644b]",
											children: [number(Number(row.payload.data.areaSqM ?? 0)), " m²"]
										}),
										row.payload.recordType === "animal" && row.payload.data.tag ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-1 block text-xs text-[#56644b]",
											children: String(row.payload.data.tag)
										}) : null
									]
								}, row.id))
							}),
							visibleRecords.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rounded-xl bg-[#f7f8f1] p-4 text-sm",
								children: "No hay fichas con esta búsqueda. Prueba otro nombre o categoría."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						"aria-labelledby": "productos-modelo-title",
						className: "rounded-3xl border border-[#4c6b3a]/20 bg-white p-4 sm:p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-bold uppercase tracking-[.12em] text-[#59754b]",
								children: "Productos de ejemplo"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								id: "productos-modelo-title",
								className: "font-display mt-1 text-2xl sm:text-3xl",
								children: ["Borradores de productos · ", model.listings.length]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-6 text-[#56644b]",
								children: "Ejemplos ficticios en borrador. No son ofertas publicadas ni indican disponibilidad real."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 grid gap-3 sm:grid-cols-2",
								children: model.listings.map((listing) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "rounded-2xl border border-[#365026]/15 bg-[#f7f8f1] p-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-semibold text-[#59754b]",
											children: listing.payload.category
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "mt-1 font-semibold",
											children: listing.payload.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
											className: "mt-3 space-y-2 text-sm text-[#56644b]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "font-semibold",
												children: "Ubicación"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: listing.payload.location })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "font-semibold",
												children: "Estado"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: listing.payload.status === "draft" ? "Borrador de ejemplo · solo lectura" : listing.payload.status || "Sin definir" })] })]
										})
									]
								}, listing.id))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
						className: "px-1 text-xs leading-6 text-[#56644b]",
						children: [
							"Plantilla de ejemplo ",
							model.templateVersion,
							" · datos de referencia: ",
							model.asOf,
							". Para practicar cambios, abre la ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								className: "font-semibold underline",
								href: "/finca-demo",
								children: "demostración editable guardada"
							}),
							"."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimalDossier, {
				animal: dossierAnimal,
				records: model.records,
				demonstration: true,
				readOnly: true,
				onClose: () => setOpenAnimalId(void 0)
			}, openAnimalId ?? "closed"),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!record,
				onOpenChange: (open) => {
					if (!open) setOpenRecordId(void 0);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-2xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "pr-12 text-left leading-7",
						children: record ? cleanTitle(record.payload.title) : "Ficha de ejemplo"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
						className: "text-left",
						children: [record ? `${typeLabels[record.payload.recordType]} · ${record.payload.category} · ` : "", "Finca modelo de solo lectura"]
					})] }), record && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
						className: "divide-y divide-[#365026]/10",
						children: Object.entries(record.payload.data).filter(([key]) => !hiddenFields.has(key)).map(([key, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: `text-sm font-semibold text-[#365026] ${farmMoneyDetailClass(record.payload.recordType, key)}`,
								children: fieldLabels[key] ?? key
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: `min-w-0 whitespace-pre-line break-words text-sm leading-6 text-[#56644b] ${farmMoneyDetailClass(record.payload.recordType, key)}`,
								children: key === "eventType" ? animalRecordEventLabel(record) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmRecordValue, {
									record: record.payload,
									field: key,
									value,
									renderValue: (item) => valueText(item, model.records)
								})
							})]
						}, key))
					}), linked.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						"aria-label": "Fichas vinculadas",
						className: "rounded-xl bg-[#f3f6ed] p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "font-semibold text-[#29442c]",
							children: ["Fichas vinculadas · ", linked.length]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: linked.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: button,
								onClick: () => {
									if (row.payload.recordType === "animal") openAnimal(row.id);
									else setOpenRecordId(row.id);
								},
								children: cleanTitle(row.payload.title)
							}, row.id))
						})]
					})] })]
				})
			})
		]
	});
}
//#endregion
export { FarmShowcase };
