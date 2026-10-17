import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { G as REPRODUCTION_EVENT_TYPES, K as animalRecordDate, W as HEALTH_EVENT_TYPES, X as linkedAnimalRecords, Y as isValidAnimalRecordDate, q as animalRecordEventLabel, w as isTap } from "./offline-db-Co86AgBD.js";
import { c as currencySchema, l as formatMoney } from "./exchange-rates-cDoWbx0h.js";
import { _ as project, d as bounds, f as edgeClearance, g as outlineExceedsProperty, h as interiorSlots, m as interiorAnchor, p as inside, v as unproject } from "./farm-plan-catalog-7z5TuNyx.js";
import { t as createLucideIcon } from "./createLucideIcon-OtKWZ-kp.js";
import { i as DialogDescription, n as DialogClose, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-CBD8GOFt.js";
import { t as Button } from "./button-B3HvdP1w.js";
import { t as Input } from "./input-CcKdupPX.js";
import { t as PriceConversion } from "./price-conversion-B7Racnth.js";
import { t as Textarea } from "./textarea-B0uyVTVX.js";
import { g as visibleBoundaryPlants } from "./illustrated-plan-adapter-v5jMuBYX.js";
import { t as AgroCategoryIcon } from "./agro-category-icon-BvENtu1T.js";
import { t as UserRound } from "./user-round-CDFoQGdx.js";
//#region lib/farm-money.ts
/** Historical finance/planning forms were explicitly USD. Missing currency preserves that meaning. */
function farmRecordCurrency(data) {
	if (data.currency === void 0) return "USD";
	const parsed = currencySchema.safeParse(data.currency);
	return parsed.success ? parsed.data : null;
}
function summarizeFarmMoney(records) {
	const groups = {};
	let legacyCount = 0, invalidCount = 0;
	for (const { payload: { data } } of records) {
		const currency = farmRecordCurrency(data), amount = typeof data.amount === "number" ? data.amount : typeof data.amount === "string" && data.amount.trim() !== "" ? Number(data.amount) : NaN;
		if (!currency || !Number.isFinite(amount) || amount < 0) {
			invalidCount++;
			continue;
		}
		const group = groups[currency] ?? {
			income: 0,
			cost: 0,
			count: 0
		};
		if (data.kind === "Ingreso") group.income += amount;
		else group.cost += amount;
		group.count++;
		groups[currency] = group;
		if (data.currency === void 0) legacyCount++;
	}
	return {
		groups,
		legacyCount,
		invalidCount
	};
}
//#endregion
//#region components/farm-record-money.tsx
var import_jsx_runtime = require_jsx_runtime();
/** Empty and malformed records must never acquire an invented zero price. */
function farmMoneyAmount(value) {
	const amount = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
	return Number.isFinite(amount) ? amount : null;
}
function isFarmMoneyField(recordType, field) {
	return recordType === "finance" && field === "amount" || recordType === "plan" && ["costPerUnit", "expectedRevenue"].includes(field);
}
/** Monetary controls need the whole record width on phones and two-card tablets. */
function farmMoneyDetailClass(recordType, field) {
	return isFarmMoneyField(recordType, field) || recordType === "plan" && field === "totals" ? "col-span-full lg:col-span-1" : "";
}
/** Read-only equivalent next to the actual original amount, including explicit signed results. */
function FarmMoneyValue({ amount, currency, allowNegative = false }) {
	const numeric = farmMoneyAmount(amount);
	const valid = numeric !== null && (allowNegative || numeric >= 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 break-words",
		"data-farm-money": true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: numeric === null ? String(amount ?? "Sin importe") : formatMoney(numeric, currency || "Moneda sin definir") }), valid && currency ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceConversion, {
			amount: numeric,
			currency,
			allowNegative
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs",
			children: "Importe o moneda pendiente de revisión."
		})]
	});
}
var totalLabels = {
	feed: "Insumo total (kg)",
	water: "Agua estimada (L)",
	area: "Área estimada (m²)",
	variableCost: "Costo variable",
	margin: "Margen preliminar"
};
/** Only known monetary fields use currency; counts, weights, dates and areas stay as recorded. */
function FarmRecordValue({ record, field, value, renderValue = (value) => String(value ?? "Sin definir") }) {
	const currency = farmRecordCurrency(record.data);
	if (isFarmMoneyField(record.recordType, field)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmMoneyValue, {
		amount: value,
		currency
	});
	if (record.recordType === "plan" && field === "totals" && value && typeof value === "object" && !Array.isArray(value)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
		className: "space-y-3",
		children: Object.entries(value).map(([key, amount]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
				className: "text-xs font-semibold",
				children: totalLabels[key] ?? key
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: key === "variableCost" || key === "margin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmMoneyValue, {
				amount,
				currency,
				allowNegative: key === "margin"
			}) : renderValue(amount) })]
		}, key))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: renderValue(value) });
}
//#endregion
//#region lib/farm-workflow-validation.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/** UI validation before an offline mutation. Server/ownership validation remains authoritative. */
function farmNumber(value, label, minimum = 0) {
	const raw = String(value ?? "").trim();
	const number = raw === "" ? 0 : Number(raw);
	if (!Number.isFinite(number) || number < minimum) throw new Error(`Revisa: ${label} debe ser un número ${minimum > 0 ? "mayor que cero" : "igual o mayor que cero"}.`);
	return number;
}
function validateFarmDateRange(start, end) {
	if (start && end && end < start) throw new Error("Revisa: la fecha de cierre no puede ser anterior a la fecha de inicio.");
}
function syncOutcomeMessage(reason) {
	if (reason === "account_changed") return "La cuenta cambió o no se pudo verificar. Tus cambios siguen en este dispositivo. Abre tu cuenta con internet antes de sincronizar.";
	if (reason === "offline" || reason === "network") return "No se pudo conectar. Tus registros locales se conservan; vuelve a intentar cuando tengas señal.";
	if (reason === "server" || reason === "invalid_response") return "El servidor no confirmó el respaldo. Tus registros locales se conservan; intenta sincronizar más tarde.";
	if (reason === "more_pending") return "Quedan cambios por enviar. Pulsa Sincronizar de nuevo para continuar.";
	return "Hay cambios que necesitan revisión. Abre Sincronización para consultar los pendientes antes de volver a guardarlos.";
}
/** Called before dismissing a record editor; busy saves never ask or dismiss. */
function canDismissFarmDraft(draft, confirmDiscard) {
	if (draft.busy) return false;
	return !draft.dirty || confirmDiscard();
}
/** An empty cache is not proof that an account has no existing farm. */
function needsFarmAccountCheck(input) {
	return !input.localOnly && !input.hasFarm && input.checkedOwner !== input.owner;
}
//#endregion
//#region lib/form-submission.ts
/** Synchronous guard lives outside React render timing and may be shared across reopened dialogs. */
function createSubmissionGate() {
	let busy = false;
	return {
		get busy() {
			return busy;
		},
		async run(save) {
			if (busy) throw new Error("Espera: hay un guardado en curso. No vuelvas a pulsar Guardar.");
			busy = true;
			try {
				return await save();
			} finally {
				busy = false;
			}
		}
	};
}
/** Prevent native navigation even when a repeated submission is rejected by the gate. */
async function submitGuardedForm(event, gate, save, onError) {
	event.preventDefault();
	try {
		await gate.run(save);
	} catch (error) {
		onError(error);
	}
}
//#endregion
//#region components/farm-record-form.tsx
var SavingContext = (0, import_react.createContext)(false);
var DraftContext = (0, import_react.createContext)(null);
/** Covers Escape, backdrop and close-button dismissal, without persisting private drafts. */
function FarmDraftDialog({ onOpenChange, ...props }) {
	const draft = (0, import_react.useRef)({
		dirty: false,
		busy: false
	});
	const controls = (0, import_react.useMemo)(() => ({
		setDirty: (value) => {
			draft.current.dirty = value;
		},
		setBusy: (value) => {
			draft.current.busy = value;
		}
	}), []);
	function change(open) {
		if (!open && !canDismissFarmDraft(draft.current, () => window.confirm("Tienes cambios sin guardar. ¿Descartarlos y cerrar?"))) return;
		if (!open) draft.current.dirty = false;
		onOpenChange?.(open);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DraftContext.Provider, {
		value: controls,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			...props,
			onOpenChange: change
		})
	});
}
function useFarmFormSaving() {
	return (0, import_react.useContext)(SavingContext);
}
function FarmSaveButton({ children, ...props }) {
	const saving = (0, import_react.useContext)(SavingContext);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		...props,
		className: ["min-h-11", props.className].filter(Boolean).join(" "),
		type: "submit",
		disabled: saving || props.disabled,
		children: saving ? "Guardando…" : children
	});
}
function FarmRecordForm({ onSubmit, children, className = "space-y-5", onDraftStateChange }) {
	const draft = (0, import_react.useContext)(DraftContext);
	const dirty = (0, import_react.useRef)(false);
	const errorRef = (0, import_react.useRef)(null);
	const [edited, setEdited] = (0, import_react.useState)(false);
	const gate = (0, import_react.useRef)(createSubmissionGate()), completed = (0, import_react.useRef)(false), active = (0, import_react.useRef)(true);
	const [saving, setSaving] = (0, import_react.useState)(false), [done, setDone] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (error) errorRef.current?.focus();
	}, [error]);
	(0, import_react.useEffect)(() => {
		active.current = true;
		return () => {
			active.current = false;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		function warn(event) {
			if (dirty.current || gate.current.busy) {
				event.preventDefault();
				event.returnValue = "";
			}
		}
		window.addEventListener("beforeunload", warn);
		return () => {
			window.removeEventListener("beforeunload", warn);
			if (draft) {
				draft.setDirty(false);
				draft.setBusy(false);
			}
		};
	}, [draft]);
	(0, import_react.useEffect)(() => {
		onDraftStateChange?.(edited && !done, saving);
	}, [
		edited,
		done,
		saving,
		onDraftStateChange
	]);
	(0, import_react.useEffect)(() => () => {
		onDraftStateChange?.(false, false);
	}, [onDraftStateChange]);
	function markEdited(event) {
		if (event.target instanceof Element && event.target.closest("[data-price-conversion]")) return;
		dirty.current = true;
		setEdited(true);
		draft?.setDirty(true);
		onDraftStateChange?.(true, gate.current.busy);
	}
	async function submit(event) {
		event.preventDefault();
		if (gate.current.busy || completed.current) return;
		setSaving(true);
		setError("");
		draft?.setBusy(true);
		onDraftStateChange?.(dirty.current, true);
		try {
			await gate.current.run(() => onSubmit(event));
			completed.current = true;
			dirty.current = false;
			draft?.setDirty(false);
			if (active.current) setDone(true);
		} catch (cause) {
			if (active.current) setError(cause instanceof Error && /^(Revisa:|Espera:)/.test(cause.message) ? cause.message : "No se pudo confirmar el guardado. Tus datos siguen en el formulario. Comprueba los registros y el almacenamiento antes de repetir.");
		} finally {
			draft?.setBusy(false);
			if (active.current) setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SavingContext.Provider, {
		value: saving || done,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			onInputCapture: markEdited,
			onChangeCapture: markEdited,
			className: "farm-record-form",
			"aria-busy": saving,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("fieldset", {
					disabled: saving || done,
					className: `min-w-0 border-0 p-0 ${className}`,
					children
				}),
				draft && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						disabled: saving || done,
						className: "mt-3 min-h-11 rounded-full",
						children: "Cancelar"
					})
				}),
				edited && !saving && !done && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs leading-5 text-[#71685f]",
					children: "Cambios sin guardar. Pulsa Guardar para conservarlos en este dispositivo."
				}),
				done && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "mt-3 rounded-xl bg-[#edf3e7] p-3 text-sm text-[#365026]",
					children: "Guardado en este dispositivo. La sincronización se comprueba por separado."
				}),
				saving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "mt-3 text-sm font-semibold text-[#365026]",
					children: "Guardando en este dispositivo…"
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					ref: errorRef,
					tabIndex: -1,
					role: "alert",
					className: "mt-4 rounded-xl border border-[#b85a48]/30 bg-[#fff1ed] p-3 text-sm leading-6 text-[#803a2d]",
					children: error
				})
			]
		})
	});
}
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Activity = createLucideIcon("activity", [["path", {
	d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
	key: "169zse"
}]]);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Scale = createLucideIcon("scale", [
	["path", {
		d: "M12 3v18",
		key: "108xh3"
	}],
	["path", {
		d: "m19 8 3 8a5 5 0 0 1-6 0zV7",
		key: "zcdpyk"
	}],
	["path", {
		d: "M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1",
		key: "1yorad"
	}],
	["path", {
		d: "m5 8 3 8a5 5 0 0 1-6 0zV7",
		key: "eua70x"
	}],
	["path", {
		d: "M7 21h10",
		key: "1b0cd5"
	}]
]);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Baby = createLucideIcon("baby", [
	["path", {
		d: "M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5",
		key: "1u7htd"
	}],
	["path", {
		d: "M15 12h.01",
		key: "1k8ypt"
	}],
	["path", {
		d: "M19.38 6.813A9 9 0 0 1 20.8 10.2a2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1",
		key: "11xh7x"
	}],
	["path", {
		d: "M9 12h.01",
		key: "157uk2"
	}]
]);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Syringe = createLucideIcon("syringe", [
	["path", {
		d: "m18 2 4 4",
		key: "22kx64"
	}],
	["path", {
		d: "m17 7 3-3",
		key: "1w1zoj"
	}],
	["path", {
		d: "M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5",
		key: "1exhtz"
	}],
	["path", {
		d: "m9 11 4 4",
		key: "rovt3i"
	}],
	["path", {
		d: "m5 19-3 3",
		key: "59f2uf"
	}],
	["path", {
		d: "m14 4 6 6",
		key: "yqp9t2"
	}]
]);
//#endregion
//#region components/animal-dossier.tsx
var sections = [
	{
		key: "identity",
		label: "Datos",
		icon: UserRound
	},
	{
		key: "weight",
		label: "Pesajes",
		icon: Scale
	},
	{
		key: "health",
		label: "Sanidad",
		icon: Syringe
	},
	{
		key: "reproduction",
		label: "Reproducción",
		icon: Baby
	}
];
var value = (input, fallback = "Sin registrar") => typeof input === "string" && input.trim() ? input : fallback;
function dateLabel(input) {
	return isValidAnimalRecordDate(input) ? new Intl.DateTimeFormat("es-VE", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		timeZone: "UTC"
	}).format(/* @__PURE__ */ new Date(`${input}T00:00:00Z`)) : "Sin fecha válida";
}
/** The same real-record UI is used for the isolated, clearly labelled demonstration. */
function AnimalDossier({ animal, records, demonstration = false, readOnly = false, onClose, onSave }) {
	const [section, setSection] = (0, import_react.useState)("identity");
	const [editor, setEditor] = (0, import_react.useState)(null);
	const [message, setMessage] = (0, import_react.useState)("");
	const [returnFocus] = (0, import_react.useState)(() => typeof document !== "undefined" && document.activeElement instanceof HTMLElement ? document.activeElement : null);
	if (!animal) return null;
	const history = linkedAnimalRecords(animal, records);
	const data = animal.payload.data;
	const weights = history.weights.filter((row) => isValidAnimalRecordDate(row.payload.data.measuredAt) && typeof row.payload.data.weightKg === "number" && Number.isFinite(row.payload.data.weightKg) && row.payload.data.weightKg > 0).sort((a, b) => String(a.payload.data.measuredAt).localeCompare(String(b.payload.data.measuredAt)) || a.id.localeCompare(b.id));
	const latest = weights.at(-1);
	const area = records.find((row) => row.payload.recordType === "area" && row.payload.farmId === animal.payload.farmId && row.id === data.areaId);
	const rows = section === "weight" ? history.weights : section === "health" ? history.health : history.reproduction;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmDraftDialog, {
		open: true,
		onOpenChange: (open) => {
			if (!open) onClose();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			onCloseAutoFocus: (event) => {
				if (returnFocus?.isConnected) {
					event.preventDefault();
					returnFocus.focus({ preventScroll: true });
				}
			},
			className: "max-h-[92svh] overflow-y-auto bg-[#f8f3ea] sm:max-w-3xl",
			"data-animal-dossier": animal.id,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#4c6b3a]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgroCategoryIcon, {
						category: animal.payload.category,
						size: 24
					}), readOnly ? "Finca modelo · animal ficticio · solo lectura" : demonstration ? "Animal ficticio · demostración local" : "Expediente individual"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "break-words font-display text-3xl",
					children: animal.payload.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
					value(data.tag, "Sin código o arete"),
					" · ",
					value(data.species, animal.payload.category),
					". ",
					readOnly ? "Consulta los datos ficticios de la plantilla. Aquí no se crean ni cambian registros." : demonstration ? "Estos datos son ejemplos; no se envían a tu cuenta." : "Registros disponibles en este dispositivo, también sin señal."
				] })
			] }), !readOnly && editor ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimalRecordEditor, {
				section: editor.section,
				animal: editor.animal,
				original: editor.original,
				onSave: async (payload, original) => {
					if (!onSave) throw new Error("Revisa: esta ficha solo permite consulta.");
					await onSave(payload, original);
					setEditor(null);
					setMessage(demonstration ? "Ejemplo guardado solo en la demostración." : "Guardado en este dispositivo. El respaldo central se comprueba por separado.");
				}
			}, `${editor.section}:${editor.original?.id ?? "new"}`) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3 rounded-2xl bg-white p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-[#71685f]",
							children: "Último pesaje con fecha"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xl font-bold",
							children: latest ? `${Number(latest.payload.data.weightKg).toLocaleString("es-VE")} kg` : "Sin pesajes"
						}),
						latest && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs",
							children: dateLabel(latest.payload.data.measuredAt)
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-[#71685f]",
							children: "Área vinculada"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 break-words font-bold",
							children: area?.payload.title ?? (data.areaId ? "Área ya no disponible" : "Sin asignar")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs",
							children: demonstration || readOnly ? "Ubicación de ejemplo, sin seguimiento GPS" : "Ubicación indicada por ti, sin seguimiento GPS"
						})
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
					"aria-label": "Secciones del expediente",
					children: sections.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							setSection(item.key);
							setMessage("");
						},
						"aria-pressed": section === item.key,
						className: `flex min-h-11 items-center justify-center gap-2 rounded-full border px-3 text-sm font-bold ${section === item.key ? "bg-[#3e2a19] text-white" : "bg-white"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { size: 17 }), item.label]
					}, item.key))
				}),
				message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "rounded-xl bg-[#e8efdf] p-3 text-sm",
					children: message
				}),
				section === "identity" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
						className: "grid grid-cols-2 gap-4 rounded-2xl bg-white p-5",
						children: [
							["Código / arete", value(data.tag)],
							["Nombre", value(data.name, animal.payload.title)],
							["Especie", value(data.species, animal.payload.category)],
							["Raza", value(data.breed)],
							["Sexo", value(data.sex, "Desconocido")],
							["Nacimiento", isValidAnimalRecordDate(data.birthDate) ? dateLabel(data.birthDate) : "Sin fecha · edad desconocida"],
							["Propósito", value(data.purpose)],
							["Estado registrado", value(data.status)]
						].map(([label, content]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs text-[#71685f]",
								children: label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1 break-words text-sm font-semibold",
								children: content
							})]
						}, label))
					}),
					typeof data.weightKg === "number" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs leading-6 text-[#71685f]",
						children: [
							"Peso inicial de la ficha: ",
							data.weightKg.toLocaleString("es-VE"),
							" kg. No tiene fecha de medición y no se incluye en la gráfica."
						]
					}),
					!readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "button-dark justify-self-start",
						onClick: () => setEditor({
							section,
							animal: structuredClone(animal),
							original: structuredClone(animal)
						}),
						children: "Editar datos del animal"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-6 text-[#71685f]",
						children: "Los registros se vinculan por identificador de animal y finca. Los controles antiguos de grupo se conservan aparte; un nombre parecido no crea un vínculo."
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-label": section === "weight" ? "Historial de pesajes" : section === "health" ? "Historial sanitario" : "Historial reproductivo",
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 flex flex-wrap items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "flex items-center gap-2 font-bold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { size: 18 }), section === "weight" ? "Evolución del peso" : section === "health" ? "Eventos sanitarios" : "Eventos reproductivos"]
							}), !readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "button-dark",
								onClick: () => setEditor({
									section,
									animal: structuredClone(animal)
								}),
								children: ["Registrar ", section === "weight" ? "pesaje" : "evento"]
							})]
						}),
						section === "weight" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeightGraph, { rows: weights }),
						section !== "weight" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-4 text-xs leading-6 text-[#71685f]",
							children: section === "health" ? "Registra lo observado o indicado por el profesional. No se calculan tratamientos, dosis ni un puntaje de salud." : "Fechas y resultados registrados por ti. No se predicen preñez, partos ni calendarios reproductivos."
						}),
						rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "space-y-3",
							children: [...rows].sort((a, b) => (animalRecordDate(b) ?? "").localeCompare(animalRecordDate(a) ?? "") || a.id.localeCompare(b.id)).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-2xl border border-[#3e2a19]/10 bg-white p-4",
								"data-animal-history": row.id,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-start justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-[#71685f]",
											children: dateLabel(animalRecordDate(row))
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "mt-1 break-words font-bold",
											children: section === "weight" ? `${String(row.payload.data.weightKg ?? "Sin dato")} kg` : animalRecordEventLabel(row)
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full bg-[#f3ebdd] px-2 py-1 text-[11px]",
											children: demonstration ? "Ejemplo" : row.syncState === "synced" ? "Respaldado" : "Solo local / pendiente"
										})]
									}),
									section !== "weight" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 break-words text-sm",
										children: row.payload.title
									}),
									[...[
										"product",
										"batch",
										"professional",
										"outcome"
									].map((key) => [{
										product: "Producto registrado",
										batch: "Lote",
										professional: "Responsable",
										outcome: "Resultado"
									}[key], row.payload.data[key]]), ["Próxima fecha indicada", isValidAnimalRecordDate(row.payload.data.nextDate) ? dateLabel(row.payload.data.nextDate) : null]].map(([label, content]) => typeof content === "string" && content.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 break-words text-xs",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [String(label), ":"] }),
											" ",
											content
										]
									}, String(label)) : null),
									!!row.payload.data.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 whitespace-pre-line break-words text-sm",
										children: String(row.payload.data.notes)
									}),
									!readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "mt-2 min-h-11 text-sm font-bold underline",
										onClick: () => setEditor({
											section,
											animal: structuredClone(animal),
											original: structuredClone(row)
										}),
										children: "Corregir registro"
									})
								]
							}, row.id))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "rounded-xl bg-white p-5 text-sm",
							children: [
								"Todavía no hay ",
								section === "weight" ? "pesajes" : "eventos",
								" vinculados a este animal."
							]
						})
					]
				})
			] })]
		})
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block min-w-0 text-sm font-semibold",
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mt-2 block [&_input]:min-h-11 [&_textarea]:min-h-24",
			children
		})]
	});
}
function AnimalRecordEditor({ section, animal, original, onSave }) {
	const data = original?.payload.data ?? {};
	const eventTypes = section === "health" ? HEALTH_EVENT_TYPES : REPRODUCTION_EVENT_TYPES;
	async function save(event) {
		const form = new FormData(event.currentTarget);
		const read = (key) => String(form.get(key) ?? "").trim();
		let payload;
		if (section === "identity") {
			if (!read("title") || !read("species")) throw new Error("Revisa: completa el nombre de la ficha y la especie.");
			if (read("birthDate") && !isValidAnimalRecordDate(read("birthDate"))) throw new Error("Revisa: indica una fecha de nacimiento válida o déjala vacía si no la conoces.");
			const identity = Object.fromEntries([
				"tag",
				"name",
				"species",
				"breed",
				"sex",
				"birthDate",
				"purpose",
				"status"
			].map((key) => [key, read(key)]));
			const oldBirthDate = animal.payload.data.birthDate;
			if (!identity.birthDate && typeof oldBirthDate === "string" && oldBirthDate && !isValidAnimalRecordDate(oldBirthDate)) identity.birthDate = oldBirthDate;
			payload = {
				...animal.payload,
				title: read("title"),
				category: read("species"),
				data: {
					...animal.payload.data,
					...identity
				}
			};
		} else {
			const date = read("date");
			if (!isValidAnimalRecordDate(date)) throw new Error("Revisa: indica la fecha real del registro.");
			if (read("nextDate") && (!isValidAnimalRecordDate(read("nextDate")) || read("nextDate") < date)) throw new Error("Revisa: la próxima fecha debe ser igual o posterior al evento.");
			const title = section === "weight" ? `Pesaje · ${animal.payload.title}` : read("title");
			const shared = {
				...data,
				animalId: animal.id,
				animalTitle: animal.payload.title,
				notes: read("notes")
			};
			if (section === "weight") {
				const weightKg = Number(read("weightKg"));
				if (!read("weightKg") || !Number.isFinite(weightKg) || weightKg <= 0) throw new Error("Revisa: introduce un peso mayor que cero.");
				payload = {
					farmId: animal.payload.farmId,
					recordType: "weight",
					category: animal.payload.category,
					title,
					data: {
						...shared,
						measuredAt: date,
						weightKg
					}
				};
			} else {
				if (!title) throw new Error("Revisa: describe el evento registrado.");
				payload = {
					farmId: animal.payload.farmId,
					recordType: section,
					category: animal.payload.category,
					title,
					data: {
						...shared,
						eventType: read("eventType"),
						date,
						professional: read("professional"),
						...section === "health" ? {
							event: title,
							nextDate: read("nextDate"),
							product: read("product"),
							batch: read("batch")
						} : { outcome: read("outcome") }
					}
				};
			}
		}
		await onSave(payload, original);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FarmRecordForm, {
		onSubmit: save,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl bg-white p-3 text-sm",
				children: section === "identity" ? "Edita únicamente los datos que conoces. El historial mantiene el mismo identificador." : `Este registro quedará vinculado a ${animal.payload.title}.`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: section === "identity" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Nombre de la ficha",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							name: "title",
							defaultValue: animal.payload.title,
							maxLength: 160,
							required: true
						})
					}),
					[...[
						"tag",
						"name",
						"species",
						"breed",
						"purpose",
						"status"
					].map((key) => [key, {
						tag: "Código / arete",
						name: "Nombre del animal",
						species: "Especie",
						breed: "Raza",
						purpose: "Propósito",
						status: "Estado registrado"
					}[key]])].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							name: key,
							defaultValue: value(data[key], ""),
							required: key === "species",
							maxLength: key === "species" ? 80 : 160
						})
					}, key)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Sexo",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							name: "sex",
							defaultValue: value(data.sex, "Desconocido"),
							className: "min-h-11 w-full rounded-md border bg-white px-3",
							children: [...new Set([
								"Hembra",
								"Macho",
								"Desconocido",
								value(data.sex, "Desconocido")
							])].map((sex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: sex }, sex))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
						label: "Fecha de nacimiento (si la conoces)",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							name: "birthDate",
							type: "date",
							defaultValue: isValidAnimalRecordDate(data.birthDate) ? data.birthDate : ""
						}), typeof data.birthDate === "string" && data.birthDate && !isValidAnimalRecordDate(data.birthDate) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-2 block break-words text-xs font-normal",
							children: [
								"Dato anterior: ",
								data.birthDate,
								". Se conserva si no indicas una fecha válida."
							]
						})]
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					section === "weight" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Peso (kg)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							name: "weightKg",
							type: "number",
							inputMode: "decimal",
							min: "0.001",
							step: "any",
							required: true,
							defaultValue: typeof data.weightKg === "number" ? data.weightKg : ""
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Tipo de evento",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							name: "eventType",
							defaultValue: value(data.eventType, "other"),
							className: "min-h-11 w-full rounded-md border bg-white px-3",
							children: eventTypes.map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: type.value,
								children: type.label
							}, type.value))
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Descripción del evento",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							name: "title",
							required: true,
							maxLength: 160,
							defaultValue: original?.payload.title ?? "",
							placeholder: "Lo ocurrido o indicado por el responsable"
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: section === "weight" ? "Fecha de medición" : "Fecha del evento",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							name: "date",
							type: "date",
							required: true,
							defaultValue: value(section === "weight" ? data.measuredAt : data.date, "")
						})
					}),
					section === "health" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Próxima fecha indicada (opcional)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								name: "nextDate",
								type: "date",
								defaultValue: value(data.nextDate, "")
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Producto registrado (opcional)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								name: "product",
								maxLength: 160,
								defaultValue: value(data.product, "")
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Lote del producto (opcional)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								name: "batch",
								maxLength: 160,
								defaultValue: value(data.batch, "")
							})
						})
					] }),
					section !== "weight" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Profesional o responsable (opcional)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							name: "professional",
							maxLength: 160,
							defaultValue: value(data.professional, "")
						})
					}),
					section === "reproduction" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Resultado observado (opcional)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							name: "outcome",
							maxLength: 500,
							defaultValue: value(data.outcome, ""),
							placeholder: "Sin resultado confirmado, si se desconoce"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "sm:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Observaciones",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								name: "notes",
								maxLength: 3e3,
								defaultValue: value(data.notes, "")
							})
						})
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FarmSaveButton, {
				className: "rounded-full bg-[#3e2a19] text-white",
				children: ["Guardar ", section === "identity" ? "datos" : "registro"]
			})
		]
	});
}
function WeightGraph({ rows }) {
	if (rows.length < 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mb-4 rounded-xl bg-white p-4 text-xs leading-6",
		children: "La gráfica aparecerá con dos pesajes válidos y fechados. No se estima un peso objetivo."
	});
	const times = rows.map((row) => Date.parse(`${row.payload.data.measuredAt}T00:00:00Z`));
	const values = rows.map((row) => Number(row.payload.data.weightKg));
	const minT = Math.min(...times), maxT = Math.max(...times), minV = Math.min(...values), maxV = Math.max(...values);
	const points = rows.map((row, i) => ({
		row,
		x: maxT === minT ? 160 : 24 + (times[i] - minT) / (maxT - minT) * 272,
		y: maxV === minV ? 75 : 124 - (values[i] - minV) / (maxV - minV) * 98
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "mb-4 overflow-hidden rounded-2xl bg-white p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figcaption", {
				className: "flex flex-wrap justify-between gap-2 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pesos medidos · kg" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					minV.toLocaleString("es-VE"),
					"–",
					maxV.toLocaleString("es-VE"),
					" kg"
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 320 150",
				role: "img",
				"aria-label": `Evolución de ${rows.length} pesajes entre ${dateLabel(rows[0].payload.data.measuredAt)} y ${dateLabel(rows.at(-1)?.payload.data.measuredAt)}; detalle en la lista`,
				className: "mt-2 max-h-52 w-full",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M24 15V125H300",
						fill: "none",
						stroke: "#d7dccd"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
						points: points.map((p) => `${p.x},${p.y}`).join(" "),
						fill: "none",
						stroke: "#4c6b3a",
						strokeWidth: "2.5"
					}),
					points.map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: point.x,
						cy: point.y,
						r: "3.5",
						fill: "#4c6b3a",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: `${dateLabel(point.row.payload.data.measuredAt)}: ${String(point.row.payload.data.weightKg)} kg` })
					}, point.row.id))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between gap-3 text-xs text-[#71685f]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: dateLabel(rows[0].payload.data.measuredAt) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: dateLabel(rows.at(-1)?.payload.data.measuredAt) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[11px] text-[#71685f]",
				children: "Escala entre pesos registrados. La línea solo conecta mediciones."
			})
		]
	});
}
//#endregion
//#region lib/illustrated-sprite-contact.ts
var SPRITE_CONTACTS = {
	"rural-house": {
		alpha: [
			8,
			42,
			251,
			208
		],
		anchor: {
			x: 130 / 256,
			y: 171 / 256
		},
		footprint: [
			[22, 170],
			[178, 206],
			[240, 164],
			[86, 135]
		].map(([x, y]) => ({
			x: x / 256,
			y: y / 256
		}))
	},
	"open-shed": {
		alpha: [
			14,
			61,
			247,
			205
		],
		anchor: {
			x: 131 / 256,
			y: 170 / 256
		},
		footprint: [
			[22, 171],
			[176, 203],
			[239, 170],
			[90, 137]
		].map(([x, y]) => ({
			x: x / 256,
			y: y / 256
		}))
	},
	"wood-cabin": {
		alpha: [
			13,
			34,
			247,
			227
		],
		anchor: {
			x: 130 / 256,
			y: 177 / 256
		},
		footprint: [
			[23, 174],
			[145, 219],
			[234, 177],
			[108, 136]
		].map(([x, y]) => ({
			x: x / 256,
			y: y / 256
		}))
	},
	"chicken-coop": {
		alpha: [
			7,
			41,
			250,
			210
		],
		anchor: {
			x: 133 / 256,
			y: 169 / 256
		},
		footprint: [
			[22, 165],
			[132, 208],
			[246, 172],
			[132, 139]
		].map(([x, y]) => ({
			x: x / 256,
			y: y / 256
		}))
	},
	greenhouse: {
		alpha: [
			13,
			23,
			246,
			233
		],
		anchor: {
			x: 129 / 256,
			y: 178 / 256
		},
		footprint: [
			[16, 201],
			[130, 231],
			[244, 151],
			[129, 126]
		].map(([x, y]) => ({
			x: x / 256,
			y: y / 256
		}))
	},
	"cacao-tree": {
		alpha: [
			5,
			8,
			251,
			247
		],
		anchor: {
			x: .5,
			y: .95
		},
		footprint: [
			{
				x: .46,
				y: .93
			},
			{
				x: .54,
				y: .93
			},
			{
				x: .54,
				y: .97
			},
			{
				x: .46,
				y: .97
			}
		]
	},
	"banana-plant": {
		alpha: [
			9,
			10,
			249,
			248
		],
		anchor: {
			x: .5,
			y: .96
		},
		footprint: [
			{
				x: .44,
				y: .92
			},
			{
				x: .56,
				y: .92
			},
			{
				x: .56,
				y: .97
			},
			{
				x: .44,
				y: .97
			}
		]
	},
	"coffee-shrub": {
		alpha: [
			9,
			18,
			247,
			248
		],
		anchor: {
			x: .5,
			y: .96
		},
		footprint: [
			{
				x: .44,
				y: .92
			},
			{
				x: .56,
				y: .92
			},
			{
				x: .56,
				y: .97
			},
			{
				x: .44,
				y: .97
			}
		]
	}
};
function spriteLayout(asset, ground, visibleWidth) {
	const m = SPRITE_CONTACTS[asset], side = visibleWidth * 256 / (m.alpha[2] - m.alpha[0]), x = ground.x - side * m.anchor.x, y = ground.y - side * m.anchor.y;
	return {
		imageBox: {
			x,
			y,
			width: side,
			height: side
		},
		visibleBox: {
			x: x + side * m.alpha[0] / 256,
			y: y + side * m.alpha[1] / 256,
			width: side * (m.alpha[2] - m.alpha[0]) / 256,
			height: side * (m.alpha[3] - m.alpha[1]) / 256
		},
		footprint: m.footprint.map((p) => ({
			x: x + p.x * side,
			y: y + p.y * side
		})),
		ground,
		side
	};
}
/** Contact shadow follows the visible ground footprint, not a detached ellipse beyond the front edge. */
function footprintPath(points) {
	return points.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join("") + "Z";
}
/** A complete upright cylinder. y=ground contact center; no projected-ground clipping. */
function tankGeometry(p, r) {
	const height = r * 1.45, ry = r * .38, top = p.y - height;
	return {
		body: `M${p.x - r},${top}L${p.x - r},${p.y}A${r},${ry} 0 0 0 ${p.x + r},${p.y}L${p.x + r},${top}Z`,
		top: {
			cx: p.x,
			cy: top,
			rx: r,
			ry
		},
		base: {
			cx: p.x,
			cy: p.y,
			rx: r,
			ry
		},
		bounds: {
			x: p.x - r,
			y: top - ry,
			width: r * 2,
			height: height + ry * 2
		}
	};
}
function overlaps(a, b, gap = 0) {
	return a.x < b.x + b.width + gap && a.x + a.width + gap > b.x && a.y < b.y + b.height + gap && a.y + a.height + gap > b.y;
}
//#endregion
//#region components/farm-illustrated-scene.tsx
var assetForUse = {
	house: "rural-house",
	barn: "open-shed",
	cabin: "wood-cabin",
	coop: "chicken-coop",
	greenhouse: "greenhouse"
};
var colors = {
	pasture: "#74ae4c",
	crop: "#8d9860",
	forest: "#537b40",
	house: "#aeb277",
	barn: "#b0a375",
	cabin: "#a8ad74",
	coop: "#b0a071",
	greenhouse: "#99ad6c",
	nursery: "#999d61",
	water: "#43818a",
	tank: "#9cac80",
	compost: "#988c5b",
	corral: "#ad9167",
	road: "#c9ad78",
	other: "#96ad71"
};
var camera = {
	origin: {
		x: 0,
		y: 0
	},
	scale: 1,
	pan: {
		x: 0,
		y: 0
	}
};
var pts = (v) => v.map((p) => {
	const q = project(p, camera);
	return `${q.x},${q.y}`;
}).join(" ");
var FarmIllustratedScene = (0, import_react.memo)(function FarmIllustratedScene({ physicalAreaSqM, readOnly = false, propertyOutline, areas, animals = [], selectedId, onSelect, onOpen, onOrganize, assetBase, farmName, onAdd, placementLabel, placementWithinArea, onPlace, onCancelPlace, registerPrimaryControl, registerAreaButton }) {
	const uid = (0, import_react.useId)().replace(/[^\w-]/g, ""), [zoom, setZoom] = (0, import_react.useState)(1), [viewportWidth, setViewportWidth] = (0, import_react.useState)(640);
	const observer = (0, import_react.useRef)(null);
	const measure = (0, import_react.useCallback)((node) => {
		observer.current?.disconnect();
		if (!node) return;
		observer.current = new ResizeObserver(() => setViewportWidth(node.clientWidth || 640));
		observer.current.observe(node);
	}, []);
	(0, import_react.useEffect)(() => () => observer.current?.disconnect(), []);
	const valid = propertyOutline.length >= 3;
	const frame = (0, import_react.useMemo)(() => valid ? bounds(propertyOutline.map((p) => project(p, camera))) : {
		x: 0,
		y: 0,
		maxX: 100,
		maxY: 100
	}, [propertyOutline, valid]);
	const w = Math.max(1, frame.maxX - frame.x), h = Math.max(1, frame.maxY - frame.y), pad = Math.max(w, h) * .08;
	const instances = (0, import_react.useMemo)(() => areas.flatMap((a) => {
		const anchor = interiorAnchor(a.outline);
		if (!anchor) return [];
		anchor.radius = Math.min(anchor.radius, edgeClearance(anchor.point, propertyOutline));
		if (anchor.radius <= 0) return [];
		const asset = assetForUse[a.use];
		if (asset) return [{
			key: a.id,
			asset,
			point: anchor.point,
			size: anchor.radius * 1.8,
			areaId: a.id
		}];
		if ([
			"crop",
			"forest",
			"nursery"
		].includes(a.use) && a.vegetation && a.vegetation !== "low") {
			const asset = {
				cacao: "cacao-tree",
				banana: "banana-plant",
				coffee: "coffee-shrub",
				low: "coffee-shrub"
			}[a.vegetation], radius = Math.max(anchor.radius * .22, Math.min(w, h) * .012);
			return interiorSlots(a.outline, radius, 24).filter((p) => edgeClearance(p, propertyOutline) >= radius).map((point, i) => ({
				key: `${a.id}-${i}`,
				asset,
				point,
				size: radius * 2.65,
				areaId: a.id
			}));
		}
		return [];
	}).slice(0, 300).sort((a, b) => project(a.point, camera).y - project(b.point, camera).y), [
		areas,
		w,
		h,
		propertyOutline
	]);
	const elevated = (0, import_react.useMemo)(() => {
		const objects = [];
		for (const i of instances) {
			const p = project(i.point, camera);
			let size = i.size, layout = spriteLayout(i.asset, p, size);
			const area = areas.find((a) => a.id === i.areaId);
			if (!area) continue;
			for (let n = 0; n < 8 && (outlineExceedsProperty(layout.footprint.map((p) => unproject(p, camera)), area.outline) || outlineExceedsProperty(layout.footprint.map((p) => unproject(p, camera)), propertyOutline)); n++) {
				size *= .8;
				layout = spriteLayout(i.asset, p, size);
			}
			if (outlineExceedsProperty(layout.footprint.map((p) => unproject(p, camera)), area.outline) || outlineExceedsProperty(layout.footprint.map((p) => unproject(p, camera)), propertyOutline)) continue;
			objects.push({
				key: i.key,
				depth: p.y,
				box: layout.visibleBox,
				draw: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					pointerEvents: "none",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: footprintPath(layout.footprint),
						fill: "#233e20",
						opacity: ".18"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("image", {
						href: `${assetBase}/${i.asset}-256.webp`,
						...layout.imageBox
					})]
				})
			});
		}
		for (const a of areas.filter((a) => a.use === "tank")) {
			const anchor = interiorAnchor(a.outline);
			if (!anchor) continue;
			const r = Math.min(anchor.radius, edgeClearance(anchor.point, propertyOutline)) * .5;
			if (r <= 0) continue;
			const p = project(anchor.point, camera), t = tankGeometry(p, r);
			objects.push({
				key: a.id + "-tank",
				depth: p.y,
				box: t.bounds,
				draw: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					pointerEvents: "none",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
							...t.base,
							fill: "#28462b",
							opacity: ".18"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: t.body,
							fill: "#98bac0",
							stroke: "#496d72",
							strokeWidth: w * .0015
						}),
						[.35, .7].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: `M${p.x - r},${p.y - r * 1.45 * n}a${r},${r * .38} 0 0 0 ${r * 2},0`,
							fill: "none",
							stroke: "#73979d",
							strokeWidth: w * .001
						}, n)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
							...t.top,
							fill: "#d5e4e2",
							stroke: "#496d72",
							strokeWidth: w * .0015
						})
					]
				})
			});
		}
		for (const tree of visibleBoundaryPlants(areas, propertyOutline, animals, physicalAreaSqM)) {
			const p = project(tree.position, camera), r = tree.planRadius, h = tree.planHeight, top = {
				x: p.x,
				y: p.y - h
			}, box = {
				x: p.x - r,
				y: top.y - r,
				width: r * 2,
				height: h + r * 2
			};
			objects.push({
				key: tree.id,
				depth: p.y,
				box,
				draw: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					pointerEvents: "none",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: `M${p.x} ${p.y}L${top.x} ${top.y}`,
						stroke: "#8b7654",
						strokeWidth: r * .16
					}), tree.kind === "palm" ? Array.from({ length: 8 }, (_, i) => {
						const angle = i * Math.PI / 4;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: `M${top.x} ${top.y}Q${top.x + Math.cos(angle) * r * .6} ${top.y + Math.sin(angle) * r * .6 - r * .2} ${top.x + Math.cos(angle) * r} ${top.y + Math.sin(angle) * r * .6}`,
							fill: "none",
							stroke: i % 2 ? "#437c34" : "#75a34a",
							strokeWidth: r * .24
						}, i);
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: top.x,
						cy: top.y,
						rx: r,
						ry: r * .8,
						fill: "#43743b"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: top.x - r * .25,
						cy: top.y - r * .2,
						rx: r * .65,
						ry: r * .6,
						fill: "#699348"
					})] })]
				})
			});
		}
		for (const animal of animals) {
			const area = areas.find((a) => a.id === animal.areaId);
			if (!area) continue;
			const clearance = Math.min(edgeClearance(animal.position, area.outline), edgeClearance(animal.position, propertyOutline));
			if (clearance <= 0) continue;
			const p = project(animal.position, camera), size = Math.min(w * .026, clearance * 1.4), box = {
				x: p.x - size * animal.anchor.u,
				y: p.y - size * animal.anchor.v,
				width: size,
				height: size
			};
			objects.push({
				key: animal.id,
				depth: p.y,
				box,
				draw: animal.src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("image", {
					href: animal.src,
					...box,
					pointerEvents: "none"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
					transform: `translate(${box.x},${box.y})`,
					pointerEvents: "none",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgroCategoryIcon, {
						category: animal.category ?? "Animal",
						size
					})
				})
			});
		}
		return objects.sort((a, b) => a.depth - b.depth || a.key.localeCompare(b.key));
	}, [
		instances,
		areas,
		animals,
		propertyOutline,
		assetBase,
		w,
		physicalAreaSqM
	]);
	const visualFrame = (0, import_react.useMemo)(() => ({
		x: Math.min(frame.x - pad, ...elevated.map((o) => o.box.x - pad * .2)),
		y: Math.min(frame.y - pad * 1.8, ...elevated.map((o) => o.box.y - pad * .2)),
		maxX: Math.max(frame.maxX + pad, ...elevated.map((o) => o.box.x + o.box.width + pad * .2)),
		maxY: Math.max(frame.maxY + pad * 1.2, ...elevated.map((o) => o.box.y + o.box.height + pad * .2))
	}), [
		frame,
		pad,
		elevated
	]);
	const pixels = viewportWidth / (visualFrame.maxX - visualFrame.x) * zoom;
	const suppressPlacementClick = (0, import_react.useRef)(false);
	const tapStart = (0, import_react.useRef)(null), [ghost, setGhost] = (0, import_react.useState)(null), [placementNotice, setPlacementNotice] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setGhost(null);
		setPlacementNotice("");
		tapStart.current = null;
	}, [placementLabel]);
	const propose = (point) => {
		setGhost(point);
		if (!inside(point, propertyOutline)) {
			setPlacementNotice("Toca dentro del contorno de tu finca.");
			return;
		}
		setPlacementNotice("");
		onPlace?.(point);
	};
	const labels = (0, import_react.useMemo)(() => {
		const aliases = {
			pasture: "Potrero",
			crop: "Cultivo",
			forest: "Bosque",
			house: "Casa",
			barn: "Galpón",
			cabin: "Cabaña",
			coop: "Gallinero",
			greenhouse: "Invernadero",
			nursery: "Vivero",
			water: "Laguna",
			tank: "Tanque",
			compost: "Compostera",
			corral: "Corral",
			road: "Acceso",
			other: "Por definir"
		}, placed = [];
		for (const a of [...areas].sort((a, b) => Number(b.id === selectedId) - Number(a.id === selectedId))) {
			const anchor = interiorAnchor(a.outline);
			if (!anchor) continue;
			const plain = a.title.replace(/\s*·\s*ejemplo/gi, "").trim(), text = plain.length <= 20 ? plain : aliases[a.use];
			for (const name of [text, /dep[oó]sito/i.test(a.title) ? "Depósito" : a.use === "road" && /servicio/i.test(a.title) ? "Servicio" : aliases[a.use]]) {
				const width = (name.length * 6.4 + 12) / pixels, height = 20 / pixels;
				let found = false;
				for (const dy of [
					.7,
					-.6,
					0,
					1.4,
					-1.4,
					1.8,
					-1.8
				]) {
					const p = project({
						x: anchor.point.x,
						y: anchor.point.y + anchor.radius * dy
					}, camera);
					if (![
						{
							x: p.x - width / 2,
							y: p.y - height / 2
						},
						{
							x: p.x + width / 2,
							y: p.y - height / 2
						},
						{
							x: p.x + width / 2,
							y: p.y + height / 2
						},
						{
							x: p.x - width / 2,
							y: p.y + height / 2
						}
					].every((c) => (Math.abs(dy) > 1 || inside(unproject(c, camera), a.outline)) && inside(unproject(c, camera), propertyOutline))) continue;
					if (placed.some((l) => Math.abs(l.point.x - p.x) < (l.width + width) / 2 + 3 / pixels && Math.abs(l.point.y - p.y) < (l.height + height) / 2 + 3 / pixels)) continue;
					if (elevated.some((o) => !instances.some((i) => i.key === o.key && [
						"cacao-tree",
						"coffee-shrub",
						"banana-plant"
					].includes(i.asset)) && overlaps(o.box, {
						x: p.x - width / 2,
						y: p.y - height / 2,
						width,
						height
					}, 2 / pixels))) continue;
					placed.push({
						area: a,
						point: p,
						text: name,
						width,
						height
					});
					found = true;
					break;
				}
				if (found) break;
			}
		}
		return placed;
	}, [
		areas,
		propertyOutline,
		elevated,
		instances,
		pixels,
		selectedId
	]);
	const outside = (0, import_react.useMemo)(() => areas.filter((a) => outlineExceedsProperty(a.outline, propertyOutline)), [areas, propertyOutline]);
	const selected = areas.find((a) => a.id === selectedId);
	if (!valid) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Mi finca ilustrada",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Define el contorno de tu finca para comenzar." }), !readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: onOrganize,
			children: "Dibujar finca"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Mi finca ilustrada",
		className: "farm-illustrated min-w-0 rounded-3xl border border-[#4c6b3a]/20 bg-white p-3 sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-4 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl sm:text-3xl",
					children: "Mi finca ilustrada"
				}), farmName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-[#56644b]",
					children: farmName
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [onAdd && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						ref: registerPrimaryControl,
						type: "button",
						className: "min-h-11 rounded-full bg-[#365026] px-5 text-sm font-semibold text-white",
						onClick: onAdd,
						children: "Añadir"
					}), !readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 rounded-full border border-[#365026]/30 px-4 text-sm font-semibold text-[#365026]",
						onClick: onOrganize,
						children: "Organizar"
					})]
				})]
			}),
			placementLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 rounded-xl bg-[#e8efdf] p-3 text-sm",
				role: "status",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: placementLabel }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Toca dentro del plano para elegir el lugar. Aún no se guarda nada." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 rounded-full border px-3",
							onClick: () => {
								const target = placementWithinArea ? (areas.find((a) => a.id === selectedId) ?? areas[0])?.outline : propertyOutline;
								const a = target ? interiorAnchor(target) : null;
								if (a) propose(a.point);
								else setPlacementNotice("Añade primero un potrero, galpón u otra área.");
							},
							children: "Elegir punto interior"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 rounded-full border px-3",
							onClick: onCancelPlace,
							children: "Cancelar"
						})]
					}),
					placementNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						children: placementNotice
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: measure,
				className: "farm-illustrated-viewport",
				style: {
					overflow: "auto",
					background: "#82ad60",
					borderRadius: 18
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					viewBox: `${visualFrame.x} ${visualFrame.y} ${visualFrame.maxX - visualFrame.x} ${visualFrame.maxY - visualFrame.y}`,
					onClickCapture: (event) => {
						if (suppressPlacementClick.current) {
							suppressPlacementClick.current = false;
							event.preventDefault();
							event.stopPropagation();
						}
					},
					onPointerDown: (event) => {
						suppressPlacementClick.current = false;
						if (placementLabel && event.isPrimary && event.button === 0) tapStart.current = {
							x: event.clientX,
							y: event.clientY,
							pointerId: event.pointerId
						};
					},
					onPointerCancel: () => {
						tapStart.current = null;
					},
					onPointerUp: (event) => {
						const start = tapStart.current;
						tapStart.current = null;
						if (!placementLabel || !isTap(start, {
							x: event.clientX,
							y: event.clientY,
							pointerId: event.pointerId
						})) return;
						const matrix = event.currentTarget.getScreenCTM();
						if (!matrix) return;
						const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
						suppressPlacementClick.current = true;
						propose(unproject({
							x: p.x,
							y: p.y
						}, camera));
					},
					style: {
						width: `${zoom * 100}%`,
						display: "block"
					},
					role: "img",
					"aria-label": "Vista ilustrada de las áreas guardadas",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("clipPath", {
								id: `${uid}-property`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", { points: pts(propertyOutline) })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pattern", {
								id: `${uid}-grass`,
								width: w * .03,
								height: w * .03,
								patternUnits: "userSpaceOnUse",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									cx: w * .007,
									cy: w * .013,
									r: w * 8e-4,
									fill: "#d1d69d",
									opacity: ".35"
								})
							}),
							areas.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("clipPath", {
								id: `${uid}-${a.id}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", { points: pts(a.outline) })
							}, a.id))
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
							x: visualFrame.x,
							y: visualFrame.y,
							width: visualFrame.maxX - visualFrame.x,
							height: visualFrame.maxY - visualFrame.y,
							fill: "#82ad60"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
							x: visualFrame.x,
							y: visualFrame.y,
							width: visualFrame.maxX - visualFrame.x,
							height: visualFrame.maxY - visualFrame.y,
							fill: `url(#${uid}-grass)`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
							points: pts(propertyOutline),
							fill: "#7ca856",
							stroke: "#ece9bf",
							strokeWidth: w * .002
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: areas.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
							clipPath: `url(#${uid}-${a.id})`,
							children: [
								a.structureKind !== "fence" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
									points: pts(a.outline),
									fill: colors[a.use]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
									points: pts(a.outline),
									fill: `url(#${uid}-grass)`
								})] }),
								a.use === "water" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
									opacity: ".32",
									children: [
										.3,
										.5,
										.7
									].map((t) => {
										const b = bounds(a.outline), p = project({
											x: b.x + (b.maxX - b.x) * t,
											y: b.y + (b.maxY - b.y) * t
										}, camera);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
											cx: p.x,
											cy: p.y,
											rx: (b.maxX - b.x) * .18,
											ry: (b.maxY - b.y) * .035,
											fill: "none",
											stroke: "#d2ece8",
											strokeWidth: w * .001
										}, t);
									})
								}),
								["crop", "nursery"].includes(a.use) && (!a.vegetation || a.vegetation === "low") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
									opacity: ".45",
									children: Array.from({ length: 12 }, (_, i) => {
										const b = bounds(a.outline), a1 = project({
											x: b.x + (b.maxX - b.x) * i / 12,
											y: b.y
										}, camera), a2 = project({
											x: b.x + (b.maxX - b.x) * i / 12,
											y: b.maxY
										}, camera);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
											d: `M${a1.x} ${a1.y}L${a2.x} ${a2.y}`,
											stroke: "#4c713c",
											strokeWidth: w * .003
										}, i);
									})
								})
							]
						}, a.id)) }),
						areas.filter((a) => a.use === "corral" || a.use === "pasture" || a.structureKind === "fence" || a.fenced).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
							pointerEvents: "none",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
								points: pts(a.outline),
								fill: "none",
								stroke: "#d8cc9e",
								strokeWidth: w * .002
							}), a.outline.flatMap((p, i) => {
								const q = a.outline[(i + 1) % a.outline.length], count = Math.min(12, Math.max(1, Math.ceil(Math.hypot(q.x - p.x, q.y - p.y) / (w * .04))));
								return Array.from({ length: count }, (_, j) => {
									const ground = project({
										x: p.x + (q.x - p.x) * j / count,
										y: p.y + (q.y - p.y) * j / count
									}, camera);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
										d: `M${ground.x} ${ground.y}v${-w * .01}`,
										stroke: "#70583b",
										strokeWidth: w * .002
									}, `${i}-${j}`);
								});
							})]
						}, a.id)),
						areas.filter((a) => a.use === "compost").map((a) => {
							const anchor = interiorAnchor(a.outline);
							if (!anchor) return null;
							const p = project(anchor.point, camera), r = anchor.radius * .65;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
								pointerEvents: "none",
								children: [
									-.5,
									0,
									.5
								].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
									cx: p.x + t * r,
									cy: p.y + t * r * .11,
									rx: r * .25,
									ry: r * .6,
									fill: "#66513a"
								}, t))
							}, a.id);
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
							pointerEvents: "none",
							children: areas.filter((a) => a.waterTrough).map((a) => {
								const t = a.waterTrough, p = project(t.position, camera);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
									x: p.x - t.planWidth / 2,
									y: p.y - t.planHeight / 2,
									width: t.planWidth,
									height: t.planHeight,
									rx: t.planHeight * .15,
									fill: "#428f9b",
									stroke: "#d9ded2",
									strokeWidth: Math.min(t.planHeight * .15, w * .001)
								}, a.id + "-trough");
							})
						}),
						elevated.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: o.draw }, o.key)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
							points: pts(propertyOutline),
							fill: "none",
							stroke: "#fff3bc",
							strokeWidth: w * .0025,
							pointerEvents: "none"
						}),
						areas.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
							points: pts(a.outline),
							fill: a.structureKind === "fence" ? "none" : "transparent",
							pointerEvents: a.structureKind === "fence" ? "stroke" : void 0,
							stroke: a.id === selectedId ? "#f8edb9" : "transparent",
							strokeWidth: w * .003,
							onClick: () => {
								if (!placementLabel) onSelect(a.id);
							},
							style: { cursor: "pointer" }
						}, a.id)),
						ghost && placementLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: project(ghost, camera).x,
							cy: project(ghost, camera).y,
							r: 8 / pixels,
							fill: "none",
							stroke: inside(ghost, propertyOutline) ? "#fffbd0" : "#a33624",
							strokeWidth: 3 / pixels,
							pointerEvents: "none"
						}),
						labels.map(({ area, point, text, width, height }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
							pointerEvents: "none",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
								x: point.x - width / 2,
								y: point.y - height / 2,
								width,
								height,
								rx: 3 / pixels,
								fill: area.id === selectedId ? "#234b34" : "#fffdf0",
								fillOpacity: ".94"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
								x: point.x,
								y: point.y + 4 / pixels,
								textAnchor: "middle",
								fontSize: 12 / pixels,
								fontWeight: "600",
								fill: area.id === selectedId ? "white" : "#29442c",
								children: text
							})]
						}, area.id))
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 inline-flex max-w-full flex-wrap items-center gap-1 rounded-full border border-[#4c6b3a]/25 bg-[#f3f6ed] p-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "flex size-11 items-center justify-center rounded-full text-xl font-semibold text-[#29442c] hover:bg-white focus-visible:outline-2",
						"aria-label": "Alejar finca",
						onClick: () => setZoom((z) => Math.max(1, z - .25)),
						children: "−"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "flex size-11 items-center justify-center rounded-full text-xl font-semibold text-[#29442c] hover:bg-white focus-visible:outline-2",
						"aria-label": "Acercar finca",
						onClick: () => setZoom((z) => Math.min(3, z + .25)),
						children: "+"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 rounded-full px-4 text-sm font-semibold text-[#29442c] hover:bg-white",
						onClick: () => setZoom(1),
						children: "Ver toda"
					})
				]
			}),
			outside.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "status",
				className: "mt-3 rounded-xl border border-[#9b733f]/30 bg-[#fff8df] p-3 text-sm",
				children: [outside.length, " área(s) quedan fuera del contorno en esta distribución. Sus formas se conservan; revisa su ubicación en Plano técnico."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs leading-5 text-[#56644b]",
				children: "Ilustración del diseño guardado. Toca un área para abrir su ficha."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				open: placementLabel ? true : void 0,
				className: "mt-3 rounded-xl border border-[#4c6b3a]/20 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
						className: "min-h-11 cursor-pointer py-3 text-sm font-semibold",
						children: ["Áreas y detalles · ", areas.length]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-xs leading-5 text-[#56644b]",
						children: "El pasto y la vegetación son ilustrativos; no indican cantidad de plantas. No es una imagen satelital."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"aria-label": "Áreas de la finca",
						className: "mt-3 flex max-h-48 flex-wrap gap-2 overflow-auto",
						children: areas.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							ref: (node) => registerAreaButton?.(a.id, node),
							onClick: () => {
								if (placementLabel) {
									const anchor = interiorAnchor(a.outline);
									if (anchor) propose(anchor.point);
								} else onSelect(a.id);
							},
							"aria-pressed": a.id === selectedId,
							className: "min-h-11 max-w-full rounded-xl border border-[#4c6b3a]/25 bg-[#f3f6ed] px-3 py-2 text-left text-sm text-[#29442c] aria-pressed:bg-[#365026] aria-pressed:text-white",
							children: [
								a.title,
								outside.some((row) => row.id === a.id) ? " · Revisar ubicación" : "",
								a.linkedAnimalCount ? ` · ${a.linkedAnimalCount} ${a.linkedAnimalCount === 1 ? "animal vinculado" : "animales vinculados"}` : ""
							]
						}, a.id))
					}),
					selected && !placementLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "mt-4 min-h-11 max-w-full rounded-full bg-[#3e2a19] px-5 py-2 text-sm text-white",
						onClick: () => onOpen(selected.id),
						children: ["Abrir ficha de ", selected.title]
					})
				]
			})
		]
	});
});
//#endregion
export { summarizeFarmMoney as S, FarmRecordValue as _, FarmDraftDialog as a, isFarmMoneyField as b, useFarmFormSaving as c, canDismissFarmDraft as d, farmNumber as f, FarmMoneyValue as g, validateFarmDateRange as h, Activity as i, createSubmissionGate as l, syncOutcomeMessage as m, AnimalDossier as n, FarmRecordForm as o, needsFarmAccountCheck as p, Scale as r, FarmSaveButton as s, FarmIllustratedScene as t, submitGuardedForm as u, farmMoneyAmount as v, farmRecordCurrency as x, farmMoneyDetailClass as y };
