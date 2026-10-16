import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { D as farmPayloadSchema, G as REPRODUCTION_EVENT_TYPES, O as farmRecordPayloadSchema, W as HEALTH_EVENT_TYPES, q as animalRecordEventLabel, x as deriveAreaSplit } from "./offline-db-BE3xVTyb.js";
import { o as currencies } from "./exchange-rates-Dh445WGD.js";
import { c as freshDemoAreaData } from "./farm-plan-catalog-7z5TuNyx.js";
import { i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-BB9AB3vt.js";
import { t as SiteImage } from "./site-image-BkHVDc6T.js";
import { t as Input } from "./input-Coa5XNOy.js";
import { t as PriceConversion } from "./price-conversion-RjpQe0IX.js";
import { t as inventory_example_photos_default } from "./inventory-example-photos-r3SAw7hC.js";
import { t as Textarea } from "./textarea-C9uNbx98.js";
import { t as matchesDirectorySearch } from "./directory-search-DOvvGzjM.js";
import { ConnectionIndicator } from "./connection-indicator-DpEs-ntT.js";
import { c as LAND_FEATURE_PRESETS, f as CurrencyField, i as demoSections, m as PolygonSketchEditor, n as demoSectionFromSearch, r as demoSectionUrl, s as FarmMapEditor } from "./farm-demo-navigation-BjKE4VPT.js";
import { S as summarizeFarmMoney, _ as FarmRecordValue, a as FarmDraftDialog, b as isFarmMoneyField, d as canDismissFarmDraft, g as FarmMoneyValue, n as AnimalDossier, o as FarmRecordForm, s as FarmSaveButton, v as farmMoneyAmount, x as farmRecordCurrency, y as farmMoneyDetailClass } from "./farm-illustrated-scene-BFNumxO0.js";
import { t as AgroCategoryIcon } from "./agro-category-icon-BvENtu1T.js";
import { t as VenezuelaAgroLogo } from "./venezuelaagro-logo-DvpF7I67.js";
import { t as farm_demo_fixture_default } from "./farm-demo-fixture-BJD6KUFv.js";
//#region lib/farm-demo-store.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var DEMO_DB_NAME = "venezuela-agro-demonstration-v1";
var EVENT = "venezuela-agro-demo-change";
var key = "workspace";
function initial() {
	return {
		version: 1,
		fixtureVersion: farm_demo_fixture_default.metadata.version,
		revision: 0,
		generation: 0,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		farms: structuredClone(farm_demo_fixture_default.farms),
		records: structuredClone(farm_demo_fixture_default.records),
		listings: structuredClone(farm_demo_fixture_default.listings)
	};
}
function open() {
	return new Promise((resolve, reject) => {
		const r = indexedDB.open(DEMO_DB_NAME, 1);
		r.onupgradeneeded = () => r.result.createObjectStore("demo");
		r.onsuccess = () => resolve(r.result);
		r.onerror = () => reject(r.error);
	});
}
function announce() {
	if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}
function subscribeDemo(callback) {
	window.addEventListener(EVENT, callback);
	return () => window.removeEventListener(EVENT, callback);
}
/** One transaction reads and writes the isolated demo. No outbox, identity or server API exists here. */
async function transaction(change) {
	const db = await open();
	return new Promise((resolve, reject) => {
		const tx = db.transaction("demo", "readwrite"), store = tx.objectStore("demo"), request = store.get(key);
		let result;
		let failure;
		request.onsuccess = () => {
			try {
				const existing = request.result;
				const state = existing ?? initial();
				result = change ? change(structuredClone(state)) : state;
				if (!existing || change) store.put(result, key);
			} catch (error) {
				failure = error;
				tx.abort();
			}
		};
		tx.oncomplete = () => {
			db.close();
			if (change) announce();
			resolve(structuredClone(result));
		};
		tx.onerror = tx.onabort = () => {
			db.close();
			reject(failure ?? tx.error ?? /* @__PURE__ */ new Error("No se pudo guardar la demostración en este dispositivo."));
		};
	});
}
var loadDemo = () => transaction();
async function resetDemo(expectedRevision) {
	return transaction((state) => {
		if (state.revision !== expectedRevision) throw new Error("Revisa: la demostración cambió en otra pestaña. Actualiza antes de restablecerla.");
		return {
			...initial(),
			revision: state.revision + 1,
			generation: state.generation + 1
		};
	});
}
async function mutateDemo(expectedRevision, change) {
	return transaction((state) => {
		if (state.revision !== expectedRevision) throw new Error("Revisa: la demostración cambió. Vuelve a abrir el registro antes de guardar.");
		change(state);
		validateState(state);
		state.revision++;
		state.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
		return state;
	});
}
function validateState(state) {
	if (state.farms.length > 1 || state.records.length > 2e3 || state.listings.length > 100) throw new Error("Revisa: se alcanzó el límite de ejemplos.");
	state.farms = state.farms.map((row) => ({
		...row,
		payload: normalizedDemoFarm(row.payload)
	}));
	state.records = state.records.map((row) => ({
		...row,
		payload: normalizedDemoRecord(row.payload)
	}));
	if (new Set(state.records.map((row) => row.id)).size !== state.records.length) throw new Error("Revisa: un identificador de ejemplo está repetido.");
	const farm = state.farms[0];
	if (state.records.some((r) => r.payload.farmId !== farm?.id)) throw new Error("Revisa: el registro no pertenece a la finca de demostración.");
	for (const row of state.records) if ([
		"weight",
		"health",
		"reproduction"
	].includes(row.payload.recordType) && row.payload.data.animalId && !state.records.some((a) => a.id === row.payload.data.animalId && a.payload.recordType === "animal" && a.payload.farmId === row.payload.farmId)) throw new Error("Revisa: el registro necesita un animal de la misma finca de demostración.");
	for (const row of state.records) if (["weight", "reproduction"].includes(row.payload.recordType) && !row.payload.data.animalId) throw new Error("Revisa: selecciona un animal de la demostración.");
	const allocated = state.records.filter((r) => r.payload.recordType === "area").reduce((n, r) => n + Number(r.payload.data.areaSqM ?? 0), 0);
	if (farm && allocated > farm.payload.areaSqM) throw new Error("Revisa: la suma de áreas supera la superficie de la finca ficticia.");
	for (const row of state.listings) {
		if (!row.payload.title.trim() || row.payload.title.length > 160 || row.payload.category.length > 80) throw new Error("Revisa: completa el título y la categoría del borrador.");
		row.payload.status = "draft";
	}
}
function normalizedDemoRecord(payload) {
	const row = farmRecordPayloadSchema.parse(payload);
	for (const value of Object.values(row.data)) {
		if (typeof value === "number" && (!Number.isFinite(value) || Math.abs(value) > 2e9)) throw new Error("Revisa: hay una cantidad fuera de rango.");
		if (typeof value === "string" && value.length > 3e3) throw new Error("Revisa: una nota es demasiado larga.");
	}
	const proportionalLayout = row.recordType === "area" && row.data.mapLayoutVersion === 2;
	if (proportionalLayout) for (const key of [
		"mapX",
		"mapY",
		"mapWidth",
		"mapHeight"
	]) {
		const value = row.data[key], minimum = key === "mapX" || key === "mapY" ? -100 : .05;
		if (typeof value !== "number" || !Number.isFinite(value) || value < minimum || value > 200) throw new Error(`Revisa: ${key} está fuera del rango del croquis proporcional.`);
	}
	for (const [key, value] of Object.entries(row.data)) if (typeof value === "number" && value < 0 && !(proportionalLayout && (key === "mapX" || key === "mapY"))) throw new Error(`Revisa: ${key} no puede ser negativo.`);
	if (row.recordType === "area" && Number(row.data.areaSqM ?? 0) <= 0) throw new Error("Revisa: el área debe ser mayor que cero.");
	if (row.recordType === "weight" && Number(row.data.weightKg ?? 0) <= 0) throw new Error("Revisa: el peso debe ser mayor que cero.");
	if (row.recordType === "plan") {
		const n = (k) => Number(row.data[k] ?? 0);
		const quantity = n("quantity"), days = n("days"), cost = n("costPerUnit");
		row.data.totals = {
			feed: quantity * n("feedPerUnit"),
			water: quantity * days * n("waterPerUnitDay"),
			area: quantity * n("areaPerUnit"),
			variableCost: quantity * cost,
			margin: n("expectedRevenue") - quantity * cost
		};
	}
	return row;
}
function normalizedDemoFarm(payload) {
	const farm = farmPayloadSchema.parse(payload);
	if (farm.areaSqM <= 0) throw new Error("Revisa: la superficie debe ser mayor que cero.");
	return farm;
}
function demoTemplate(type) {
	const record = farm_demo_fixture_default.records.find((r) => r.payload.recordType === type);
	if (!record) throw new Error("Tipo de ejemplo desconocido");
	const payload = structuredClone(record.payload);
	delete payload.data.areaId;
	delete payload.data.demoPlanPlacement;
	delete payload.data.planPlacement;
	delete payload.data.boundaryPlanting;
	delete payload.data.waterTrough;
	return payload;
}
function demoId() {
	return `practice_${crypto.randomUUID()}`;
}
function deleteDemoRecord(state, id) {
	const animal = state.records.find((r) => r.id === id)?.payload.recordType === "animal";
	state.records = state.records.filter((r) => r.id !== id && !(animal && [
		"weight",
		"health",
		"reproduction"
	].includes(r.payload.recordType) && r.payload.data.animalId === id));
}
function newDemoFarm() {
	return structuredClone(farm_demo_fixture_default.farms[0]);
}
function demoBackup(state) {
	return {
		format: "venezuela-agro-demo-backup",
		version: 1,
		exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
		workspace: state
	};
}
//#endregion
//#region components/farm-demo-workspace.tsx
var import_jsx_runtime = require_jsx_runtime();
var types = {
	Animales: ["animal"],
	Pesajes: ["weight"],
	"Plano y potreros": ["area"],
	Producción: ["production-cycle"],
	"Planificación y costos": [
		"plan",
		"finance",
		"health",
		"reproduction"
	],
	Inventario: ["inventory"]
};
var typeLabels = {
	animal: "Animal",
	weight: "Pesaje",
	area: "Área",
	task: "Tarea",
	"production-cycle": "Ciclo productivo",
	plan: "Escenario",
	finance: "Movimiento",
	health: "Control sanitario",
	reproduction: "Evento reproductivo",
	inventory: "Artículo"
};
var labels = {
	eventType: "Tipo de evento",
	outcome: "Resultado registrado",
	waterTrough: "Bebedero del ejemplo",
	tag: "Identificación",
	name: "Nombre",
	species: "Especie",
	sex: "Sexo",
	birthDate: "Fecha de nacimiento",
	weightKg: "Peso (kg)",
	breed: "Raza",
	purpose: "Objetivo",
	status: "Estado",
	animalId: "Animal",
	animalTitle: "Nombre del animal",
	measuredAt: "Fecha del pesaje",
	usage: "Uso",
	fenced: "Área cercada",
	areaSqM: "Superficie (m²)",
	shape: "Forma",
	lengthM: "Largo (m)",
	widthM: "Ancho (m)",
	diameterM: "Diámetro (m)",
	color: "Color",
	crop: "Cultivo",
	cropVariety: "Variedad",
	mapX: "Posición horizontal del croquis (unidades visuales)",
	mapY: "Posición vertical del croquis (unidades visuales)",
	mapWidth: "Ancho del croquis",
	mapHeight: "Alto del croquis",
	notes: "Notas",
	kind: "Tipo de movimiento",
	currency: "Moneda original",
	amount: "Monto",
	date: "Fecha",
	supplier: "Proveedor",
	invoiceReference: "Referencia",
	event: "Evento",
	group: "Grupo",
	nextDate: "Próxima fecha",
	product: "Producto",
	batch: "Lote",
	professional: "Responsable",
	quantity: "Cantidad",
	unit: "Unidad",
	minimum: "Nivel mínimo",
	location: "Ubicación",
	days: "Días",
	feedPerUnit: "Insumo por unidad (kg/ciclo)",
	waterPerUnitDay: "Agua por unidad/día (L)",
	areaPerUnit: "Área por unidad (m²)",
	costPerUnit: "Costo por unidad",
	expectedRevenue: "Ingreso esperado",
	assumptionsReviewed: "Supuestos revisados",
	objective: "Objetivo",
	startDate: "Fecha inicial",
	endDate: "Fecha final"
};
var dates = new Set([
	"birthDate",
	"measuredAt",
	"date",
	"nextDate",
	"startDate",
	"endDate",
	"dueDate"
]);
function readable(value) {
	if (value == null || value === "") return "Sin definir";
	if (typeof value === "boolean") return value ? "Sí" : "No";
	if (typeof value === "object") return Object.entries(value).map(([k, v]) => `${k}: ${readable(v)}`).join(" · ");
	return String(value);
}
function FarmDemoWorkspace() {
	const [state, setState] = (0, import_react.useState)(null), [section, setSection] = (0, import_react.useState)(() => typeof window === "undefined" ? "Resumen" : demoSectionFromSearch(window.location.search)), [message, setMessage] = (0, import_react.useState)(""), [error, setError] = (0, import_react.useState)(""), [editing, setEditing] = (0, import_react.useState)(null), [listing, setListing] = (0, import_react.useState)(null), [resetOpen, setResetOpen] = (0, import_react.useState)(false), [busy, setBusy] = (0, import_react.useState)(false);
	const lock = (0, import_react.useRef)(false), active = (0, import_react.useRef)(true), listingRevision = (0, import_react.useRef)(0), resetRevision = (0, import_react.useRef)(0);
	const sectionHeading = (0, import_react.useRef)(null);
	const navigationDraft = (0, import_react.useRef)({
		dirty: false,
		busy: false
	});
	const trackNavigationDraft = (0, import_react.useCallback)((dirty, busy) => {
		navigationDraft.current = {
			dirty,
			busy
		};
	}, []);
	const canLeaveSection = (0, import_react.useCallback)(() => {
		return !lock.current && !document.querySelector("[role=\"dialog\"][data-state=\"open\"], [role=\"alertdialog\"]") && canDismissFarmDraft(navigationDraft.current, () => window.confirm("Tienes cambios de práctica sin guardar. ¿Descartarlos y cambiar de sección?"));
	}, []);
	const focusSection = (0, import_react.useCallback)(() => {
		requestAnimationFrame(() => sectionHeading.current?.focus({ preventScroll: false }));
	}, []);
	function changeSection(next) {
		if (next === section || !demoSections.includes(next) || !canLeaveSection()) return;
		window.history.pushState(window.history.state, "", demoSectionUrl(window.location.href, next));
		setSection(next);
		focusSection();
	}
	(0, import_react.useEffect)(() => {
		const restoreSection = () => {
			const next = demoSectionFromSearch(window.location.search);
			if (next === section) return;
			if (!canLeaveSection()) {
				window.history.pushState(window.history.state, "", demoSectionUrl(window.location.href, section));
				return;
			}
			setSection(next);
			focusSection();
		};
		window.addEventListener("popstate", restoreSection);
		return () => window.removeEventListener("popstate", restoreSection);
	}, [
		section,
		canLeaveSection,
		focusSection
	]);
	const [dossierAnimalId, setDossierAnimalId] = (0, import_react.useState)(null);
	const [deleteFarmOpen, setDeleteFarmOpen] = (0, import_react.useState)(false), [settingsSession, setSettingsSession] = (0, import_react.useState)(0), [sketchSession, setSketchSession] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		active.current = true;
		navigator.serviceWorker?.register("/sw.js").catch(() => void 0);
		const reload = () => void loadDemo().then((s) => {
			if (active.current) setState(s);
		}).catch(() => {
			if (active.current) setError("No se pudo abrir la demostración. Comprueba el espacio del navegador; tus datos reales no se han cambiado.");
		});
		reload();
		const off = subscribeDemo(reload);
		window.addEventListener("focus", reload);
		return () => {
			active.current = false;
			off();
			window.removeEventListener("focus", reload);
		};
	}, []);
	async function perform(work) {
		if (lock.current) throw new Error("Espera: hay un cambio guardándose.");
		lock.current = true;
		setBusy(true);
		setError("");
		try {
			setState(await work());
			setMessage("Ejemplo guardado en este dispositivo. No se enviará ni publicará.");
		} catch (e) {
			setError(e instanceof Error ? e.message : "No se pudo confirmar el cambio.");
			throw e;
		} finally {
			lock.current = false;
			setBusy(false);
		}
	}
	const farm = state?.farms[0], records = (0, import_react.useMemo)(() => state?.records ?? [], [state?.records]);
	const areas = (0, import_react.useMemo)(() => records.filter((r) => r.payload.recordType === "area" && r.payload.farmId === farm?.id), [records, farm?.id]);
	const financeTotals = summarizeFarmMoney(records.filter((r) => r.payload.recordType === "finance"));
	const weightIndex = /* @__PURE__ */ new Map();
	for (const row of records) {
		if (row.payload.recordType !== "weight") continue;
		const id = String(row.payload.data.animalId), previous = weightIndex.get(id);
		if (!previous || String(row.payload.data.measuredAt) > String(previous.payload.data.measuredAt)) weightIndex.set(id, row);
	}
	const latestWeight = (id) => weightIndex.get(id);
	function openAnimal(id) {
		if (records.some((row) => row.id === id && row.payload.recordType === "animal" && row.payload.farmId === farm?.id)) setDossierAnimalId(id);
	}
	async function saveDossierRecord(payload, original) {
		if (!state || !farm || payload.farmId !== farm.id) throw new Error("Revisa: vuelve a abrir la finca ficticia.");
		await perform(() => mutateDemo(state.revision, (s) => {
			const old = original ? s.records.find((row) => row.id === original.id) : void 0;
			if (original && (!old || JSON.stringify(old.payload) !== JSON.stringify(original.payload))) throw new Error("Revisa: el registro cambió. Vuelve a abrirlo antes de guardar.");
			const normalized = normalizedDemoRecord(payload);
			if (old) old.payload = normalized;
			else s.records.push({
				id: demoId(),
				payload: normalized
			});
		}));
	}
	function add(type, preset, animalId, placement, catalog) {
		if (!state || !farm) return;
		const payload = demoTemplate(type);
		payload.farmId = farm.id;
		if (["health", "reproduction"].includes(type)) payload.data.animalId = "";
		if (type === "health") payload.data.eventType = "other";
		if ([
			"weight",
			"health",
			"reproduction"
		].includes(type) && animalId) {
			const animal = records.find((r) => r.id === animalId);
			payload.data.animalId = animalId;
			payload.data.animalTitle = animal?.payload.title ?? "";
		}
		if (type === "area") {
			payload.category = preset ?? "Potrero";
			payload.data = freshDemoAreaData(preset ?? "Potrero", placement, catalog, LAND_FEATURE_PRESETS.find((item) => item.value === preset)?.color);
		}
		payload.title = `Nuevo ${typeLabels[type].toLowerCase()} · ejemplo`;
		setEditing({
			row: {
				id: demoId(),
				payload
			},
			revision: state.revision
		});
	}
	async function saveRecord(event) {
		if (!editing || !state) return;
		const form = new FormData(event.currentTarget), old = editing.row.payload, data = { ...old.data };
		for (const [key, value] of Object.entries(data)) {
			if (key === "totals" || key === "typedAreaOutline" || key === "areaId" || key === "demoPlanPlacement" || key === "planPlacement" || key === "mapLayoutVersion" || key === "boundaryPlanting" || key === "waterTrough") continue;
			const raw = form.get(key);
			if (key === "animalId" || key === "eventType") data[key] = String(raw ?? "");
			else if (typeof value === "boolean") data[key] = raw === "on";
			else if (typeof value === "number" || value === null) data[key] = raw === "" ? null : Number(raw);
			else data[key] = String(raw ?? "");
		}
		if (old.recordType === "finance" || old.recordType === "plan") data.currency = String(form.get("currency") ?? "USD");
		if (old.recordType === "health" && !data.animalId) data.animalId = null;
		if (old.recordType === "weight" || old.recordType === "reproduction" || data.animalId) {
			const animal = records.find((r) => r.id === data.animalId && r.payload.recordType === "animal" && r.payload.farmId === old.farmId);
			if (!animal) throw new Error("Revisa: selecciona un animal de la demostración.");
			data.animalTitle = animal.payload.title;
		}
		const payload = normalizedDemoRecord({
			...old,
			title: String(form.get("title") ?? ""),
			category: String(form.get("category") ?? ""),
			data
		});
		await perform(() => mutateDemo(editing.revision, (s) => {
			if (s.records.length >= 2e3 && !s.records.some((r) => r.id === editing.row.id)) throw new Error("Revisa: la demostración admite hasta 2.000 registros.");
			const i = s.records.findIndex((r) => r.id === editing.row.id);
			if (i < 0) s.records.push({
				id: editing.row.id,
				payload
			});
			else s.records[i] = {
				id: editing.row.id,
				payload
			};
		}));
		setEditing(null);
	}
	async function remove(row) {
		if (!state) return;
		await perform(() => mutateDemo(state.revision, (s) => {
			deleteDemoRecord(s, row.id);
		}));
	}
	if (!state) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-4xl p-6",
		"aria-busy": !error,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl",
			children: error ? "No pudimos abrir la demostración" : "Cargando demostración…"
		}), error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "alert",
			className: "mt-4 text-sm leading-7",
			children: error
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "button-dark mt-5",
			onClick: () => window.location.reload(),
			children: "Volver a intentar"
		})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "status",
			className: "mt-4 text-sm",
			children: "Comprobamos los ejemplos guardados en este dispositivo."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-[#efe6d7] pb-32 text-[#3e2a19]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "border-b border-[#3e2a19]/15 bg-[#211d1a] p-4 text-white",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VenezuelaAgroLogo, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionIndicator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "rounded-full border border-white/40 px-4 py-3 text-sm font-bold",
							href: "/app",
							children: "Volver a mi finca real"
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-7xl p-4 sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-[#4c6b3a]/30 bg-[#e8efdf] p-4",
						role: "status",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Demostración editable · datos ficticios" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-6",
								children: "Practica con ejemplos y guárdalos solo en este navegador. Esta demostración es compartida por quienes usan este dispositivo: no introduzcas datos personales ni de tu finca real. No sincroniza, publica ni mezcla sus registros con tu cuenta."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs",
								children: "Datos y fechas de ejemplo, sin agenda real; fotografías ilustrativas de terceros."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						"aria-label": "Áreas de la demostración",
						className: "my-5 flex flex-wrap gap-2",
						children: demoSections.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => changeSection(name),
							"aria-pressed": section === name,
							className: `min-h-11 rounded-full border px-4 py-2 text-sm font-semibold ${section === name ? "bg-[#3e2a19] text-white" : "bg-white"}`,
							children: name
						}, name))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						ref: sectionHeading,
						tabIndex: -1,
						className: "font-display scroll-mt-6 flex items-center gap-3 text-3xl sm:text-5xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgroCategoryIcon, {
							category: section,
							size: 32
						}), section]
					}),
					(state.fixtureVersion ?? 1) < farm_demo_fixture_default.metadata.version && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "my-4 rounded-xl border bg-white p-4 text-sm leading-7",
						children: [
							"Hay un conjunto de ejemplos actualizado: una finca ficticia de 10 ha (400 × 250 m), seis lotes de cultivos distintos, veinte especies o tipos de animales y cercas exteriores e internas, con expedientes sanitarios y reproductivos ficticios. Conservamos tus cambios actuales. ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "/finca-modelo",
								className: "font-bold underline",
								children: "Ver la finca modelo actual sin reemplazar esta práctica"
							}),
							". Puedes cargar la composición nueva sin tocar tu finca real; esto reemplaza únicamente los cambios de esta demostración y se pedirá confirmación.",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: busy,
								onClick: () => {
									resetRevision.current = state.revision;
									setResetOpen(true);
								},
								className: "button-dark mt-3",
								children: "Cargar nuevo ejemplo de finca"
							})
						]
					}),
					!farm && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "my-5 rounded-xl bg-white p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Eliminaste la finca de demostración. Tus datos reales siguen intactos." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button-dark mt-3",
							disabled: busy,
							onClick: () => void perform(() => mutateDemo(state.revision, (s) => {
								s.farms = [newDemoFarm()];
							})).catch(() => void 0),
							children: "Crear finca ficticia vacía"
						})]
					}),
					message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						className: "my-4 rounded-xl bg-white p-4 text-sm",
						children: message
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "my-4 rounded-xl bg-[#fff1ed] p-4 text-sm",
						children: error
					}),
					section === "Resumen" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-5 text-xl font-bold",
							children: farm?.payload.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-6",
							children: farm?.payload.objective
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
							children: Object.entries(types).map(([name, allowed]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => changeSection(name),
								className: "min-w-0 rounded-2xl bg-white p-5 text-left",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: name }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 break-words text-3xl",
										children: records.filter((r) => allowed.includes(r.payload.recordType)).length
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm",
										children: "registros de ejemplo"
									})
								]
							}, name))
						})
					] }),
					section === "Planificación y costos" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "my-4 rounded-xl bg-white p-4 text-sm leading-7",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-bold",
								children: "Importes ficticios por moneda original"
							}),
							currencies.filter((currency) => financeTotals.groups[currency]).map((currency) => {
								const totals = financeTotals.groups[currency];
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									className: "mt-4 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
										className: "font-bold",
										children: [currency, " · moneda original"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 grid min-w-0 gap-3 md:grid-cols-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-semibold",
													children: "Ingresos de ejemplo"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmMoneyValue, {
													amount: totals.income,
													currency
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-semibold",
													children: "Costos/inversión"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmMoneyValue, {
													amount: totals.cost,
													currency
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-semibold",
													children: "Diferencia registrada"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmMoneyValue, {
													amount: totals.income - totals.cost,
													currency,
													allowNegative: true
												})]
											})
										]
									})]
								}, currency);
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs",
								children: "Las monedas se mantienen separadas. Los ejemplos antiguos conservan USD. No es una estimación de ganancia neta ni una recomendación productiva."
							})
						]
					}),
					["Animales", "Pesajes"].includes(section) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoAnimalHistories, {
						records,
						busy,
						onOpen: openAnimal,
						onEdit: (row) => setEditing({
							row: structuredClone(row),
							revision: state.revision
						}),
						onDelete: (row) => {
							remove(row).catch(() => void 0);
						},
						onAddWeight: (id) => add("weight", void 0, id)
					}),
					["Resumen", "Plano y potreros"].includes(section) && farm && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmMapEditor, {
						geographicContext: false,
						demonstration: true,
						interactionBlocked: Boolean(dossierAnimalId || editing || listing || resetOpen || deleteFarmOpen),
						onOpenAnimal: openAnimal,
						records,
						onLinkRecord: async (record, areaId) => {
							await perform(() => mutateDemo(state.revision, (s) => {
								const row = s.records.find((r) => r.id === record.id);
								if (!row || JSON.stringify(row.payload) !== JSON.stringify(record.payload)) throw new Error("Revisa: el registro cambió.");
								if (areaId && !s.records.some((r) => r.id === areaId && r.payload.recordType === "area" && r.payload.farmId === row.payload.farmId)) throw new Error("Revisa: el área ya no está disponible.");
								if (row.payload.data.areaId !== areaId) row.payload.data.planPlacement = null;
								row.payload.data.areaId = areaId;
							}));
						},
						farm: {
							...farm,
							updatedAt: state.updatedAt
						},
						areas,
						totalArea: farm.payload.areaSqM,
						allocatedArea: areas.reduce((n, r) => n + Number(r.payload.data.areaSqM ?? 0), 0),
						onAddPreset: (preset, placement, catalog) => add("area", preset, void 0, placement, catalog),
						onRegisterAnimal: () => add("animal"),
						onPlaceAnimal: async (record, placement, expectedArea) => {
							await perform(() => mutateDemo(state.revision, (s) => {
								const row = s.records.find((r) => r.id === record.id), area = s.records.find((r) => r.id === placement.areaId && r.payload.recordType === "area" && r.payload.farmId === record.payload.farmId);
								if (!row || !area || JSON.stringify(area.payload) !== JSON.stringify(expectedArea.payload) || JSON.stringify(row.payload) !== JSON.stringify(record.payload)) throw new Error("Revisa: el animal o el área cambió. Vuelve a elegir.");
								row.payload.data = {
									...row.payload.data,
									areaId: placement.areaId,
									planPlacement: placement
								};
							}));
						},
						onOpen: (row) => {
							if (row.payload.recordType === "animal") openAnimal(row.id);
							else setEditing({
								row: structuredClone(row),
								revision: state.revision
							});
						},
						onEditPlan: () => changeSection("Configurar finca"),
						onDelete: async (row) => {
							try {
								await remove(row);
							} catch {}
						},
						onMove: async (row, layout) => {
							await perform(() => mutateDemo(state.revision, (s) => {
								const area = s.records.find((r) => r.id === row.id);
								if (!area || JSON.stringify(area.payload) !== JSON.stringify(row.payload)) throw new Error("Revisa: el área cambió. Vuelve a abrirla.");
								area.payload.data = {
									...area.payload.data,
									mapX: layout.x,
									mapY: layout.y,
									mapWidth: layout.width,
									mapHeight: layout.height
								};
							}));
						},
						onOutlineChange: async (row, outline) => {
							await perform(() => mutateDemo(state.revision, (s) => {
								const area = s.records.find((r) => r.id === row.id);
								if (!area || JSON.stringify(area.payload) !== JSON.stringify(row.payload)) throw new Error("Revisa: el área cambió. Vuelve a abrirla.");
								area.payload.data.typedAreaOutline = outline;
								area.payload.data.shape = "Irregular";
							}));
						},
						onSplit: async (row) => {
							try {
								await perform(() => mutateDemo(state.revision, (s) => {
									const i = s.records.findIndex((r) => r.id === row.id);
									if (i < 0 || JSON.stringify(s.records[i].payload) !== JSON.stringify(row.payload)) throw new Error("Revisa: el área cambió. Vuelve a abrirla.");
									if (s.records.some((record) => record.payload.farmId === row.payload.farmId && record.payload.data.areaId === row.id)) throw new Error("Revisa los registros vinculados antes de dividir esta área.");
									if (Number(row.payload.data.areaSqM) < 2) throw new Error("Revisa: el área de ejemplo necesita al menos 2 m² para dividirse.");
									const [a, b] = deriveAreaSplit(row.payload);
									s.records[i] = {
										id: row.id,
										payload: a
									};
									s.records.push({
										id: demoId(),
										payload: b
									});
								}));
							} catch {}
						}
					}, farm.id + state.generation),
					types[section] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DemoSectionDetails, {
						technical: section === "Plano y potreros",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "my-5 flex flex-wrap gap-3",
								children: types[section].map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: "button-dark",
									type: "button",
									disabled: !farm,
									onClick: () => add(type),
									children: [
										"Agregar ",
										typeLabels[type].toLowerCase(),
										" de ejemplo"
									]
								}, type))
							}),
							section === "Plano y potreros" && farm && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-3 text-sm leading-6",
									children: "Croquis de ejemplo sin coordenadas geográficas. Los valores del dibujo no representan metros ni linderos certificados."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoSketchForm, {
									onDraftStateChange: trackNavigationDraft,
									revision: state.revision,
									value: farm.payload.propertySketch ?? null,
									onSave: async (value, revision) => {
										await perform(() => mutateDemo(revision, (s) => {
											s.farms[0].payload.propertySketch = value;
										}));
										setSketchSession((n) => n + 1);
									}
								}, state.generation + ":" + sketchSession)]
							}),
							section === "Inventario" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "my-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
								children: inventory_example_photos_default.items.map((photo) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "overflow-hidden rounded-2xl bg-white",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteImage, {
										src: photo.src,
										alt: photo.alt,
										width: photo.width,
										height: photo.height,
										className: "aspect-[3/2] w-full object-cover"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
												className: "flex items-center gap-2 font-bold",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgroCategoryIcon, { category: photo.category }), photo.category]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-2 text-sm",
												children: [records.filter((r) => r.payload.recordType === "inventory" && r.payload.category === photo.category).length, " artículos de ejemplo"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-2 text-xs leading-5",
												children: [
													photo.credit,
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
														className: "underline",
														href: photo.source_url,
														target: "_blank",
														rel: "noreferrer",
														children: "Fuente"
													}),
													" · ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
														className: "underline",
														href: photo.license_url,
														target: "_blank",
														rel: "noreferrer",
														children: "Licencia"
													})
												]
											})
										]
									})]
								}, photo.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-4 md:grid-cols-2",
								children: records.filter((r) => !["Animales", "Pesajes"].includes(section) && types[section].includes(r.payload.recordType)).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "min-w-0 rounded-2xl bg-white p-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "flex items-center gap-2 text-xs font-bold text-[#4c6b3a]",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgroCategoryIcon, { category: row.payload.category }),
												row.payload.category,
												" · ejemplo local"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "mt-2 break-words text-xl font-bold",
											children: row.payload.title
										}),
										row.payload.recordType === "animal" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-sm font-semibold",
											children: latestWeight(row.id) ? `Último pesaje: ${latestWeight(row.id)?.payload.data.weightKg} kg · ${latestWeight(row.id)?.payload.data.measuredAt}` : "Sin pesajes de ejemplo"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
											className: "mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm",
											children: Object.entries(row.payload.data).filter(([k]) => !["animalId", "typedAreaOutline"].includes(k)).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "contents",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
													className: `min-w-0 break-words font-semibold ${farmMoneyDetailClass(row.payload.recordType, k)}`,
													children: labels[k] ?? (k === "totals" ? "Totales calculados" : k)
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
													className: `min-w-0 whitespace-pre-line break-words ${farmMoneyDetailClass(row.payload.recordType, k)}`,
													children: k === "eventType" ? animalRecordEventLabel(row) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmRecordValue, {
														record: row.payload,
														field: k,
														value: v,
														renderValue: readable
													})
												})]
											}, k))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-5 flex flex-wrap gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "button-dark",
												onClick: () => setEditing({
													row: structuredClone(row),
													revision: state.revision
												}),
												children: "Editar ejemplo"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												disabled: busy,
												className: "min-h-11 rounded-full border px-4 text-sm font-bold",
												onClick: () => void remove(row).catch(() => void 0),
												children: row.payload.recordType === "animal" ? "Eliminar animal y sus pesajes de ejemplo" : "Eliminar ejemplo"
											})]
										})
									]
								}, row.id))
							}),
							!records.some((r) => types[section].includes(r.payload.recordType)) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rounded-xl bg-white p-5",
								children: "No quedan ejemplos en esta sección. Puedes agregar uno; no se restauran automáticamente los eliminados."
							})
						]
					}),
					section === "Mis publicaciones" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "my-4 text-sm leading-6",
							children: "Borradores ficticios para practicar. Editarlos no crea publicaciones ni solicitudes de revisión."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button-dark",
							onClick: () => {
								listingRevision.current = state.revision;
								setListing({
									id: demoId(),
									payload: {
										title: "Nuevo borrador ficticio",
										category: "Producto de ejemplo",
										location: "Sin ubicación real",
										status: "draft"
									}
								});
							},
							children: "Agregar borrador de ejemplo"
						}),
						state.listings.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "my-4 rounded-2xl bg-white p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-bold",
									children: row.payload.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-sm",
									children: [
										row.payload.category,
										" · ",
										row.payload.location,
										" · Borrador de ejemplo"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex flex-wrap gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "button-dark",
										onClick: () => {
											listingRevision.current = state.revision;
											setListing(structuredClone(row));
										},
										children: "Editar borrador"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "min-h-11 rounded-full border px-4",
										disabled: busy,
										onClick: () => void perform(() => mutateDemo(state.revision, (s) => {
											s.listings = s.listings.filter((r) => r.id !== row.id);
										})).catch(() => void 0),
										children: "Eliminar ejemplo"
									})]
								})
							]
						}, row.id))
					] }),
					section === "Sincronización" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 rounded-2xl bg-white p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-bold",
								children: "Solo práctica local"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 leading-7",
								children: "Los cambios de esta demostración se guardan en este navegador. No tienen pendientes de envío ni respaldo central. Al volver a la finca real, sus indicadores pertenecen únicamente a sus propios registros."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-sm",
								children: ["Último cambio local: ", new Date(state.updatedAt).toLocaleString("es-VE")]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "button-dark mt-4",
								onClick: () => {
									const url = URL.createObjectURL(new Blob([JSON.stringify(demoBackup(state), null, 2)], { type: "application/json" }));
									const a = document.createElement("a");
									a.href = url;
									a.download = "demostracion-ficticia-venezuela-agro.json";
									a.click();
									setTimeout(() => URL.revokeObjectURL(url), 1e3);
								},
								children: "Descargar copia de la demostración"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-xs",
								children: "Esta copia de práctica no se importa como finca real."
							})
						]
					}),
					section === "Seguridad y privacidad" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 rounded-2xl bg-white p-5 leading-7",
						children: "Este espacio no inicia sesión ni muestra datos privados de una cuenta. No introduzcas información real aquí. Restablecerlo afecta exclusivamente a los ejemplos; las opciones de seguridad de tu cuenta están en tu finca real."
					}),
					section === "Configurar finca" && farm && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 rounded-2xl bg-white p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoFarmSettings, {
							onDraftStateChange: trackNavigationDraft,
							farm,
							revision: state.revision,
							onSave: async (payload, revision) => {
								await perform(() => mutateDemo(revision, (s) => {
									s.farms[0].payload = payload;
								}));
								setSettingsSession((n) => n + 1);
							}
						}, state.generation + ":" + settingsSession), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "mt-5 min-h-11 rounded-full border px-4 text-sm font-bold",
							onClick: () => {
								resetRevision.current = state.revision;
								setDeleteFarmOpen(true);
							},
							children: "Eliminar finca ficticia y todos sus ejemplos"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-wrap gap-4 border-t border-[#3e2a19]/20 pt-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/app",
							className: "button-dark",
							children: "Abrir mi finca real"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								resetRevision.current = state.revision;
								setResetOpen(true);
							},
							className: "min-h-11 rounded-full border px-4 font-semibold",
							children: "Restablecer demostración"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimalDossier, {
				animal: records.find((row) => row.id === dossierAnimalId && row.payload.recordType === "animal" && row.payload.farmId === farm?.id) ?? null,
				records,
				demonstration: true,
				onClose: () => setDossierAnimalId(null),
				onSave: saveDossierRecord
			}, `${state.generation}:${dossierAnimalId}`),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmDraftDialog, {
				open: !!editing,
				onOpenChange: (open) => {
					if (!busy && !open) setEditing(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-2xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: [
						"Editar ",
						editing ? typeLabels[editing.row.payload.recordType] : "",
						" de ejemplo"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Solo se guarda en la demostración local. No introduzcas datos reales." })] }), editing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FarmRecordForm, {
						onSubmit: saveRecord,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block text-sm font-bold",
								children: ["Título", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									name: "title",
									required: true,
									maxLength: 160,
									defaultValue: editing.row.payload.title
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block text-sm font-bold",
								children: ["Categoría", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									name: "category",
									maxLength: 80,
									defaultValue: editing.row.payload.category
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoRecordFields, {
								row: editing.row,
								records
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmSaveButton, { children: "Guardar ejemplo" })
						]
					}, editing.row.id + editing.revision)]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmDraftDialog, {
				open: !!listing,
				onOpenChange: (open) => {
					if (!busy && !open) setListing(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Borrador ficticio" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "No se publica ni se envía a revisión." })] }), listing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FarmRecordForm, {
					onSubmit: async (event) => {
						const f = new FormData(event.currentTarget);
						await perform(() => mutateDemo(listingRevision.current, (s) => {
							const payload = {
								title: String(f.get("title")),
								category: String(f.get("category")),
								location: String(f.get("location")),
								status: "draft"
							};
							const row = s.listings.find((r) => r.id === listing.id);
							if (row) row.payload = payload;
							else s.listings.push({
								id: listing.id,
								payload
							});
						}));
						setListing(null);
					},
					children: [[
						"title",
						"category",
						"location"
					].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-sm font-bold",
						children: [k === "title" ? "Título" : k === "category" ? "Categoría" : "Ubicación", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							name: k,
							required: true,
							maxLength: 160,
							defaultValue: String(listing.payload[k] ?? "")
						})]
					}, k)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmSaveButton, { children: "Guardar borrador de ejemplo" })]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: deleteFarmOpen,
				onOpenChange: (open) => {
					if (!busy) setDeleteFarmOpen(open);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Eliminar solo la finca ficticia" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Se eliminarán sus animales, pesajes, áreas, inventario, ciclos, planes y borradores de práctica. La finca real no cambia. Puedes restablecer los ejemplos originales después." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					disabled: busy,
					className: "button-dark",
					onClick: () => void perform(() => mutateDemo(resetRevision.current, (s) => {
						s.farms = [];
						s.records = [];
						s.listings = [];
					})).then(() => setDeleteFarmOpen(false)).catch(() => void 0),
					children: "Eliminar finca de demostración"
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: resetOpen,
				onOpenChange: (open) => {
					if (!busy) setResetOpen(open);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Restablecer solo la demostración" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Se reemplazarán tus cambios de práctica por los ejemplos originales. Tus registros reales no cambian. Puedes descargar antes una copia en Sincronización." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					disabled: busy,
					className: "button-dark",
					onClick: () => void perform(() => resetDemo(resetRevision.current)).then(() => setResetOpen(false)).catch(() => void 0),
					children: busy ? "Restableciendo…" : "Restablecer ejemplos"
				})] })
			})
		]
	});
}
function DemoSectionDetails({ technical, children }) {
	return technical ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		className: "mt-5 rounded-2xl border border-[#4c6b3a]/20 bg-white p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
			className: "min-h-11 cursor-pointer py-3 font-semibold",
			children: "Contorno y fichas técnicas de práctica"
		}), children]
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function DemoRecordFields({ row, records }) {
	const [currency, setCurrency] = (0, import_react.useState)(farmRecordCurrency(row.payload.data) ?? "USD");
	const [moneyDraft, setMoneyDraft] = (0, import_react.useState)(() => ({ ...row.payload.data }));
	const entries = Object.entries(row.payload.data).filter(([k]) => ![
		"currency",
		"totals",
		"animalTitle",
		"typedAreaOutline",
		"areaId",
		"demoPlanPlacement",
		"planPlacement",
		"mapLayoutVersion",
		"waterTrough",
		"boundaryPlanting"
	].includes(k));
	const essential = row.payload.recordType === "area" ? ["areaSqM", ...[
		"Cultivo",
		"Invernadero",
		"Vivero"
	].includes(row.payload.category) ? ["crop"] : []] : row.payload.recordType === "animal" ? [
		"tag",
		"species",
		"sex",
		"purpose"
	] : entries.map(([k]) => k);
	const field = ([key, value]) => {
		const monetary = isFarmMoneyField(row.payload.recordType, key), preview = farmMoneyAmount(moneyDraft[key]);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `min-w-0 ${key === "notes" ? "sm:col-span-2" : ""}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block min-w-0 text-sm font-bold",
				children: [
					labels[key] ?? key,
					monetary ? ` (${currency})` : "",
					key === "animalId" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						name: key,
						defaultValue: String(value ?? ""),
						required: row.payload.recordType !== "health",
						className: "mt-2 min-h-11 w-full min-w-0 rounded-md border bg-white p-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: row.payload.recordType === "health" ? "Grupo sin animal vinculado" : "Selecciona un animal"
						}), records.filter((r) => r.payload.recordType === "animal" && r.payload.farmId === row.payload.farmId).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: r.id,
							children: r.payload.title
						}, r.id))]
					}) : key === "eventType" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						name: key,
						defaultValue: String(value),
						className: "mt-2 min-h-11 w-full rounded-md border bg-white p-2",
						children: (row.payload.recordType === "reproduction" ? REPRODUCTION_EVENT_TYPES : HEALTH_EVENT_TYPES).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: item.value,
							children: item.label
						}, item.value))
					}) : typeof value === "boolean" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: key,
						type: "checkbox",
						defaultChecked: value,
						className: "ml-3 size-5"
					}) : key === "notes" || key === "objective" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						name: key,
						defaultValue: String(value ?? ""),
						maxLength: 3e3
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						name: key,
						required: key === "areaSqM",
						min: key === "areaSqM" ? 1e-4 : monetary ? 0 : void 0,
						placeholder: key === "areaSqM" ? "Indica una superficie de práctica" : void 0,
						type: dates.has(key) ? "date" : typeof value === "number" || value === null ? "number" : "text",
						step: "any",
						defaultValue: value === null ? "" : String(value),
						onChange: monetary ? (event) => setMoneyDraft((current) => ({
							...current,
							[key]: event.target.value
						})) : void 0,
						maxLength: 3e3
					})
				]
			}), monetary && preview !== null && preview >= 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceConversion, {
				amount: preview,
				currency
			})]
		}, key);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		["finance", "plan"].includes(row.payload.recordType) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurrencyField, {
			value: currency,
			onChange: setCurrency
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs leading-6",
			children: "Cambiar la moneda etiqueta los importes escritos; las equivalencias no cambian los datos del ejemplo."
		})] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid min-w-0 gap-4 sm:grid-cols-2",
			children: entries.filter(([k]) => essential.includes(k)).map(field)
		}),
		entries.some(([k]) => !essential.includes(k)) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
			className: "rounded-xl border p-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
				className: "min-h-11 cursor-pointer py-3 font-semibold",
				children: "Más datos del ejemplo"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid min-w-0 gap-4 sm:grid-cols-2",
				children: entries.filter(([k]) => !essential.includes(k)).map(field)
			})]
		})
	] });
}
function DemoSketchForm({ value, onSave, revision, onDraftStateChange }) {
	const [draft, setDraft] = (0, import_react.useState)(value);
	const openedRevision = (0, import_react.useRef)(revision), changed = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		const warn = (event) => {
			if (changed.current) {
				event.preventDefault();
				event.returnValue = "";
			}
		};
		window.addEventListener("beforeunload", warn);
		return () => {
			window.removeEventListener("beforeunload", warn);
			onDraftStateChange(false, false);
		};
	}, [onDraftStateChange]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FarmRecordForm, {
		onSubmit: () => onSave(draft, openedRevision.current),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolygonSketchEditor, {
			value: draft,
			onChange: (value) => {
				changed.current = true;
				setDraft(value);
				onDraftStateChange(true, false);
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmSaveButton, { children: "Guardar croquis de ejemplo" })]
	});
}
function DemoFarmSettings({ farm: initialFarm, revision, onSave, onDraftStateChange }) {
	const [opened] = (0, import_react.useState)(() => ({
		farm: structuredClone(initialFarm),
		revision
	}));
	const farm = opened.farm;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FarmRecordForm, {
		onDraftStateChange,
		onSubmit: async (event) => {
			const f = new FormData(event.currentTarget);
			await onSave(normalizedDemoFarm({
				...farm.payload,
				name: String(f.get("name")),
				location: String(f.get("location")),
				areaSqM: Number(f.get("areaSqM")),
				boundaryShape: String(f.get("boundaryShape")),
				boundaryMeasurements: Object.fromEntries(Object.keys(farm.payload.boundaryMeasurements ?? {}).map((k) => [k, Number(f.get(k))])),
				objective: String(f.get("objective"))
			}), opened.revision);
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm font-bold",
				children: ["Nombre de la finca ficticia", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					name: "name",
					defaultValue: farm.payload.name,
					required: true,
					maxLength: 120
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm font-bold",
				children: ["Ubicación descriptiva de ejemplo", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					name: "location",
					defaultValue: farm.payload.location,
					maxLength: 180
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm font-bold",
				children: ["Superficie declarada (m²)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					name: "areaSqM",
					type: "number",
					min: 1,
					max: 2e9,
					defaultValue: farm.payload.areaSqM
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm font-bold",
				children: ["Forma de referencia", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					name: "boundaryShape",
					defaultValue: farm.payload.boundaryShape,
					className: "mt-2 min-h-11 w-full rounded-md border bg-white p-2",
					children: [
						"Irregular / polígono",
						"Rectángulo",
						"Triángulo",
						"Óvalo"
					].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: v }, v))
				})]
			}),
			Object.entries(farm.payload.boundaryMeasurements ?? {}).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm font-bold",
				children: [{
					northM: "Lado norte (m)",
					southM: "Lado sur (m)",
					eastM: "Lado este (m)",
					westM: "Lado oeste (m)"
				}[k] ?? k, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					name: k,
					type: "number",
					min: 0,
					max: 1e7,
					step: "any",
					defaultValue: v
				})]
			}, k)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm font-bold",
				children: ["Objetivo", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					name: "objective",
					defaultValue: farm.payload.objective,
					maxLength: 500
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmSaveButton, { children: "Guardar configuración de ejemplo" })
		]
	});
}
function DemoAnimalHistories({ records, busy, onEdit, onDelete, onAddWeight, onOpen }) {
	const [query, setQuery] = (0, import_react.useState)(""), [species, setSpecies] = (0, import_react.useState)("");
	const searchInput = (0, import_react.useRef)(null);
	const animals = records.filter((r) => r.payload.recordType === "animal");
	const availableSpecies = [...new Set(animals.map((row) => String(row.payload.data.species || row.payload.category)))].sort((a, b) => a.localeCompare(b, "es"));
	const matching = animals.filter((row) => (!species || String(row.payload.data.species || row.payload.category) === species) && matchesDirectorySearch([
		row.payload.title,
		row.payload.category,
		row.payload.data.tag,
		row.payload.data.species,
		row.payload.data.breed,
		row.payload.data.purpose
	], query));
	function clearFilters() {
		setQuery("");
		setSpecies("");
		searchInput.current?.focus({ preventScroll: true });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-4 text-sm leading-7",
				children: "Cada ficha corresponde a un animal. Los pesajes son mediciones de distintas fechas dentro de su historial, no animales repetidos. Cantidades y fechas son ficticias; no establecen pesos máximos ni una frecuencia técnica de pesaje."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-sm font-semibold",
					children: ["Buscar un animal de ejemplo", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						ref: searchInput,
						type: "search",
						enterKeyHint: "search",
						className: "mt-2 min-h-12",
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: "Nombre, identificación, raza o propósito"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-sm font-semibold",
					children: ["Especie", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "mt-2 min-h-12 w-full rounded-md border bg-white px-3",
						value: species,
						onChange: (event) => setSpecies(event.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Todas las especies"
						}), availableSpecies.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: name }, name))]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					role: "status",
					"aria-live": "polite",
					className: "text-sm",
					children: [
						matching.length,
						" de ",
						animals.length,
						" animales de ejemplo"
					]
				}), (query || species) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "button-light",
					onClick: clearFilters,
					children: "Limpiar filtros"
				})]
			}),
			matching.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-dashed p-6 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold",
					children: "No hay animales con estos filtros."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "button-dark mt-4",
					onClick: clearFilters,
					children: "Ver todos los animales"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-5 lg:grid-cols-2",
				children: matching.map((animal) => {
					const history = records.filter((r) => r.payload.recordType === "weight" && r.payload.data.animalId === animal.id).sort((a, b) => String(a.payload.data.measuredAt).localeCompare(String(b.payload.data.measuredAt)) || a.id.localeCompare(b.id));
					const latest = history.at(-1);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						"data-demo-animal": animal.id,
						className: "min-w-0 rounded-2xl bg-white p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-3 font-bold text-[#4c6b3a]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgroCategoryIcon, {
										category: String(animal.payload.data.species ?? animal.payload.category),
										size: 32
									}),
									animal.payload.category,
									" · animal ficticio"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-3 break-words text-xl font-bold",
								children: animal.payload.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-sm",
								children: ["Identificación: ", String(animal.payload.data.tag ?? "Sin código")]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm font-semibold",
								children: latest ? `Último pesaje: ${latest.payload.data.weightKg} kg · ${latest.payload.data.measuredAt}` : "Sin pesajes registrados"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
								className: "mt-4 grid grid-cols-2 gap-2 text-sm",
								children: [
									"species",
									"sex",
									"birthDate",
									"breed",
									"purpose",
									"status"
								].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "font-bold",
										children: labels[key]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "break-words",
										children: readable(animal.payload.data[key])
									})]
								}, key))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "button-dark",
										onClick: () => onOpen(animal.id),
										children: "Abrir expediente"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "min-h-11 rounded-full border px-4 text-sm",
										onClick: () => onEdit(animal),
										children: "Editar animal"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										disabled: busy,
										className: "min-h-11 rounded-full border px-4 text-sm",
										onClick: () => {
											if (window.confirm("¿Eliminar este animal y todo su historial ficticio de esta demostración?")) onDelete(animal);
										},
										children: "Eliminar animal e historial de ejemplo"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "mt-6 flex items-center gap-2 font-bold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgroCategoryIcon, { category: "Pesajes" }), "Historial de pesajes"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "mt-3 space-y-3",
								children: history.map((weight) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									"data-demo-weight": weight.id,
									className: "rounded-xl border-l-4 border-[#4c6b3a] bg-[#f5f1e8] p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
												className: "text-sm font-semibold",
												dateTime: String(weight.payload.data.measuredAt),
												children: String(weight.payload.data.measuredAt)
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [String(weight.payload.data.weightKg), " kg"] })]
										}),
										!!weight.payload.data.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 break-words text-xs leading-5",
											children: String(weight.payload.data.notes)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-2 flex flex-wrap gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "min-h-11 text-sm font-semibold underline",
												onClick: () => onEdit(weight),
												children: "Editar pesaje"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												disabled: busy,
												className: "min-h-11 text-sm underline",
												onClick: () => onDelete(weight),
												children: "Eliminar pesaje"
											})]
										})
									]
								}, weight.id))
							}),
							history.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm",
								children: "Sin mediciones. Agrega un pesaje para practicar."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "button-dark mt-4",
								onClick: () => onAddWeight(animal.id),
								children: "Agregar pesaje de este animal"
							})
						]
					}, animal.id);
				})
			})
		]
	});
}
//#endregion
export { FarmDemoWorkspace };
