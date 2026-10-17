import { E as __toESM, T as __exportAll, b as require_react, n as require_jsx_runtime } from "../index.js";
import { o as currencies, s as currencyLabels } from "./exchange-rates-cDoWbx0h.js";
import { t as PriceConversion } from "./price-conversion-B7Racnth.js";
//#region components/currency-calculator.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
/** A local calculator for amounts supplied by the user; it never creates a product price. */
function CurrencyCalculator({ title = "Convertir un importe", description, compact = false }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [amount, setAmount] = (0, import_react.useState)(""), [currency, setCurrency] = (0, import_react.useState)("USD");
	const value = Number(amount);
	const valid = amount.trim() !== "" && Number.isFinite(value) && value > 0 && value <= 2e7;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		open,
		onToggle: (event) => setOpen(event.currentTarget.open),
		className: `relative z-10 min-w-0 [overflow-wrap:anywhere] rounded-2xl border border-[#4c6b3a]/20 bg-white text-[#3e2a19] ${compact ? "mt-3 p-3" : "mt-6 p-4 sm:p-5"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
				className: "min-h-11 cursor-pointer py-3 text-sm font-bold text-[#365026]",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-[#675f57]",
				children: description
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-sm font-semibold",
					children: ["Importe original", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "number",
						inputMode: "decimal",
						min: "0.01",
						max: "20000000",
						step: "0.01",
						value: amount,
						onChange: (event) => setAmount(event.target.value),
						placeholder: "Escribe el importe recibido",
						className: "mt-2 min-h-12 w-full min-w-0 rounded-md border bg-white px-3"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-sm font-semibold",
					children: ["Moneda original", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: currency,
						onChange: (event) => setCurrency(event.target.value),
						className: "mt-2 min-h-12 w-full min-w-0 rounded-md border bg-white px-3",
						children: currencies.map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: code,
							children: currencyLabels[code]
						}, code))
					})]
				})]
			}),
			open && valid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceConversion, {
				amount: value,
				currency,
				initiallyOpen: true
			}, currency) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-3 text-xs leading-6 text-[#675f57]",
				children: amount ? "Introduce un importe mayor que cero y de hasta 20.000.000." : "Introduce un importe para elegir a qué moneda convertirlo."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs leading-6 text-[#675f57]",
				children: "Este cálculo es informativo y no modifica tu solicitud ni confirma precios, disponibilidad o pagos."
			})
		]
	});
}
//#endregion
//#region components/quote-conversion.tsx
var quote_conversion_exports = /* @__PURE__ */ __exportAll({ QuoteConversion: () => QuoteConversion });
/** No amount is inferred, saved as a price, or included in a quote request. */
function QuoteConversion({ context, demo = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurrencyCalculator, {
		compact: true,
		title: "Convertir un importe recibido",
		description: `${context}: no hay un precio publicado para convertir. ${demo ? "Puedes probar con un importe ficticio; este ejemplo no ofrece una venta ni un servicio real." : "Si recibes una cotización, introduce su importe y moneda original para consultar una equivalencia."} Se convierte exactamente la cifra escrita, sin multiplicarla por cantidad ni asumir un precio por unidad. El cálculo no fija el precio de este producto o servicio.`
	});
}
//#endregion
export { quote_conversion_exports as n, CurrencyCalculator as r, QuoteConversion as t };
