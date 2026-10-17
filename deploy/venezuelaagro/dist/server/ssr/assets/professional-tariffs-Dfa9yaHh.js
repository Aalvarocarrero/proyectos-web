import { E as __toESM, T as __exportAll, b as require_react, n as require_jsx_runtime } from "../index.js";
import { l as formatMoney, o as currencies, s as currencyLabels } from "./exchange-rates-cDoWbx0h.js";
import { l as serviceModes, s as professionalTariffSchema, u as tariffUnits } from "./professional-profile-k05LGMn7.js";
import { t as PriceConversion } from "./price-conversion-B7Racnth.js";
import { t as QuoteConversion } from "./quote-conversion-CU6_PsGb.js";
//#region components/professional-tariffs.tsx
var professional_tariffs_exports = /* @__PURE__ */ __exportAll({
	ProfessionalTariffFields: () => ProfessionalTariffFields,
	ProfessionalTariffSummary: () => ProfessionalTariffSummary,
	ProfessionalTariffs: () => ProfessionalTariffs,
	tariffsToDraft: () => tariffsToDraft
});
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function tariffsToDraft(tariffs) {
	return tariffs.map((tariff) => ({
		...tariff,
		amount: String(tariff.amount)
	}));
}
function ProfessionalTariffFields({ value, onChange }) {
	const [expanded, setExpanded] = (0, import_react.useState)(value.length > 0);
	function update(mode, patch) {
		onChange(value.map((row) => row.mode === mode ? {
			...row,
			...patch
		} : row));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		open: expanded,
		onToggle: (event) => setExpanded(event.currentTarget.open),
		className: "sm:col-span-2 min-w-0 rounded-2xl border bg-white p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
				className: "min-h-11 cursor-pointer py-3 text-sm font-semibold",
				children: "Tarifas por modalidad (opcional)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-[#675f57]",
				children: "Activa solo las modalidades para las que quieras publicar un costo. Indica el importe original y qué incluye; las demás quedan a consultar."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 space-y-3",
				children: serviceModes.map((mode, index) => {
					const tariff = value.find((row) => row.mode === mode);
					const valid = tariff ? professionalTariffSchema.safeParse({
						...tariff,
						amount: tariff.amount.trim() ? Number(tariff.amount) : NaN
					}) : null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "min-w-0 rounded-xl border p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-11 items-center gap-3 text-sm font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								className: "size-5",
								checked: !!tariff,
								onChange: (event) => onChange(event.target.checked ? [...value, {
									mode,
									amount: "",
									currency: "USD",
									unit: mode === "Jornadas de campo" ? "jornada" : mode === "Visitas programadas" ? "visita" : mode === "Capacitación presencial o virtual" ? "curso" : "sesión"
								}] : value.filter((row) => row.mode !== mode))
							}), mode]
						}), tariff && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid gap-3 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "text-sm font-semibold",
									children: ["Importe", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										name: `tariff-amount-${index}`,
										type: "number",
										inputMode: "decimal",
										min: "0.01",
										max: "20000000",
										step: "0.01",
										required: true,
										value: tariff.amount,
										onChange: (event) => update(mode, { amount: event.target.value }),
										className: "mt-2 min-h-12 w-full rounded-md border bg-white px-3"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "text-sm font-semibold",
									children: ["Moneda", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										name: `tariff-currency-${index}`,
										value: tariff.currency,
										onChange: (event) => update(mode, { currency: event.target.value }),
										className: "mt-2 min-h-12 w-full rounded-md border bg-white px-3",
										children: currencies.map((currency) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: currency,
											children: currencyLabels[currency]
										}, currency))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "text-sm font-semibold",
									children: ["Precio por", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										name: `tariff-unit-${index}`,
										value: tariff.unit,
										onChange: (event) => update(mode, { unit: event.target.value }),
										className: "mt-2 min-h-12 w-full rounded-md border bg-white px-3",
										children: tariffUnits.map((unit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: unit }, unit))
									})]
								}),
								valid?.success && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "sm:col-span-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceConversion, {
										amount: valid.data.amount,
										currency: valid.data.currency,
										unit: valid.data.unit
									})
								})
							]
						})]
					}, mode);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-xs leading-6 text-[#675f57]",
				children: "Las tarifas son declaradas por ti y se publican tras revisión. Detalla traslados, materiales, impuestos y condiciones en «¿Cómo se reserva tu servicio?». El acuerdo y cualquier pago se coordinan directamente."
			})
		]
	});
}
function ProfessionalTariffs({ tariffs, demo = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-7 rounded-2xl border bg-white p-4 sm:p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "text-lg font-bold",
			children: "Tarifas por modalidad"
		}), !tariffs.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm leading-6 text-[#675f57]",
			children: "Precio a consultar. Este perfil no ha publicado tarifas."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteConversion, {
			context: "Servicio profesional",
			demo
		})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs leading-6 text-[#675f57]",
			children: demo ? "Importes ficticios de demostración, sin contratación." : "Importes publicados por el profesional. Confirma alcance, traslados, materiales e impuestos antes de acordar el servicio."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 space-y-4",
			children: tariffs.map((tariff) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "rounded-xl border p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "text-sm font-semibold",
						children: tariff.mode
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-lg font-bold text-[#365026]",
						children: [
							formatMoney(tariff.amount, tariff.currency),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm font-normal",
								children: ["por ", tariff.unit]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceConversion, {
						amount: tariff.amount,
						currency: tariff.currency,
						unit: tariff.unit
					})
				]
			}, tariff.mode))
		})] })]
	});
}
/** The selected modality (or first published one), never a minimum across currencies. */
function ProfessionalTariffSummary({ tariffs, mode, demo = false, name }) {
	const tariff = mode ? tariffs.find((row) => row.mode === mode) : tariffs[0];
	if (!tariff) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteConversion, {
		context: `${mode || "Servicio"} de ${name}`,
		demo
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative z-10 mt-3 min-w-0 rounded-xl bg-[#f8f3ea] p-3 text-[#3e2a19]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs leading-5",
				children: [tariff.mode, demo ? " · tarifa ficticia" : ""]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 font-bold",
				children: [
					formatMoney(tariff.amount, tariff.currency),
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-sm font-normal",
						children: ["por ", tariff.unit]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceConversion, {
				amount: tariff.amount,
				currency: tariff.currency,
				unit: tariff.unit
			})
		]
	});
}
//#endregion
export { tariffsToDraft as a, professional_tariffs_exports as i, ProfessionalTariffSummary as n, ProfessionalTariffs as r, ProfessionalTariffFields as t };
