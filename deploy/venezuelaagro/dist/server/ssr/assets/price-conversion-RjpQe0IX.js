import { E as __toESM, T as __exportAll, b as require_react, n as require_jsx_runtime } from "../index.js";
import { _ as sourceCurrencies, a as convertPrice, d as formatRateDay, f as mergeRateSnapshots, g as saveRateSnapshot, h as readRateSnapshot, i as conversionTarget, l as formatMoney, m as rateResponseSchema, n as RATE_SOURCES, o as currencies, p as rateIsCurrent, r as conversionRates, s as currencyLabels, t as RATE_REFRESH_MS, u as formatRateConsultation, v as sourceDay } from "./exchange-rates-Dh445WGD.js";
//#region lib/exchange-rate-client.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var emptyState = {
	snapshot: {
		version: 1,
		rates: []
	},
	offline: false,
	busy: false,
	failed: [],
	storageWarning: false
};
/** One public request/cache per browser tab, activated by an open converter or visible price references.
* The same-origin endpoint receives normal cookies, never the amount/product.
* It sends no user information to the external official-rate providers. */
function createExchangeRateClient({ fetcher = (...args) => globalThis.fetch(...args), now = () => /* @__PURE__ */ new Date(), getStorage = () => localStorage, isOnline = () => navigator.onLine } = {}) {
	let state = emptyState, hydrated = false, lastAttempt = null, lastDay = "", request = null;
	const listeners = /* @__PURE__ */ new Set();
	let cleanup = null;
	const update = (patch) => {
		state = {
			...state,
			...patch
		};
		listeners.forEach((listener) => listener());
	};
	const dayKey = () => sourceCurrencies.map((currency) => sourceDay(currency, now())).join("|");
	function hydrate() {
		if (hydrated) return;
		hydrated = true;
		try {
			update({ snapshot: mergeRateSnapshots(state.snapshot, readRateSnapshot(getStorage())) });
		} catch {
			update({ storageWarning: true });
		}
	}
	function refresh(force = false) {
		hydrate();
		const offline = !isOnline();
		if (state.offline !== offline) update({ offline });
		if (offline) return Promise.resolve();
		if (request) return request;
		const cooldown = RATE_REFRESH_MS;
		if (!force && lastAttempt !== null && now().getTime() - lastAttempt < cooldown && lastDay === dayKey()) return Promise.resolve();
		lastAttempt = now().getTime();
		lastDay = dayKey();
		const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 16e3);
		update({ busy: true });
		request = (async () => {
			try {
				const response = await Promise.resolve().then(() => fetcher("/api/exchange-rates", {
					cache: "no-store",
					signal: controller.signal,
					credentials: "same-origin"
				}));
				if (!response.ok) throw new Error("unavailable");
				const value = rateResponseSchema.parse(await response.json());
				const snapshot = mergeRateSnapshots(state.snapshot, {
					version: 1,
					rates: value.rates
				});
				update({
					snapshot,
					failed: value.unavailable
				});
				try {
					saveRateSnapshot(getStorage(), snapshot);
					update({ storageWarning: false });
				} catch {
					update({ storageWarning: true });
				}
			} catch {
				update({ failed: [...sourceCurrencies] });
			} finally {
				clearTimeout(timeout);
				request = null;
				update({
					busy: false,
					offline: !isOnline()
				});
			}
		})();
		return request;
	}
	function subscribe(listener) {
		listeners.add(listener);
		if (listeners.size === 1) {
			hydrate();
			refresh();
			if (typeof window !== "undefined") {
				const online = () => {
					refresh(true);
				}, offline = () => update({ offline: true });
				const visible = () => {
					if (document.visibilityState === "visible") refresh();
				};
				const timer = setInterval(visible, 6e4);
				window.addEventListener("online", online);
				window.addEventListener("offline", offline);
				document.addEventListener("visibilitychange", visible);
				cleanup = () => {
					clearInterval(timer);
					window.removeEventListener("online", online);
					window.removeEventListener("offline", offline);
					document.removeEventListener("visibilitychange", visible);
				};
			}
		}
		return () => {
			listeners.delete(listener);
			if (!listeners.size) {
				cleanup?.();
				cleanup = null;
			}
		};
	}
	return {
		subscribe,
		refresh,
		getSnapshot: () => state,
		getServerSnapshot: () => emptyState
	};
}
var exchangeRateClient = createExchangeRateClient();
//#endregion
//#region components/price-conversion.tsx
var price_conversion_exports = /* @__PURE__ */ __exportAll({
	PriceConversion: () => PriceConversion,
	PriceReferenceSummary: () => PriceReferenceSummary
});
var import_jsx_runtime = require_jsx_runtime();
/** Read-only price presentation. Identity conversions need no exchange rate. */
function PriceReferenceSummary({ amount, currency, unit, allowNegative = false, snapshot, offline, busy, failed }) {
	const from = currencies.includes(currency) ? currency : null;
	const rows = ["USD", "VES"].map((target) => {
		const unsigned = from ? convertPrice(allowNegative ? Math.abs(amount) : amount, from, target, snapshot) : null;
		return {
			target,
			value: unsigned !== null && allowNegative && amount < 0 ? -unsigned : unsigned
		};
	});
	const needed = [...new Set(rows.flatMap(({ target }) => from && target !== from ? [from, target].filter((value) => value !== "USD") : []))];
	const rates = needed.map((value) => snapshot.rates.find((rate) => rate.currency === value));
	const outdated = rates.some((rate) => rate && !rateIsCurrent(rate));
	const failedUpdate = needed.some((value) => failed.includes(value));
	const hasEstimate = rows.some((row) => row.target !== from && row.value !== null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-visible-base-prices": true,
		"aria-label": "Equivalentes en dólares y bolívares",
		className: "min-w-0 space-y-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs font-semibold text-[#365026]",
				children: ["Referencia", unit ? ` por ${unit}` : ""]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "grid min-w-0 gap-2",
				"aria-live": "polite",
				"aria-atomic": "true",
				children: rows.map(({ target, value }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 rounded-lg bg-white/80 px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dt", {
						className: "text-xs text-[#675f57]",
						children: [currencyLabels[target], from === target ? " · original" : ""]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-1 text-sm font-bold leading-6",
						children: value !== null ? `${from === target ? "" : "≈ "}${formatMoney(value, target)}` : busy ? "Consultando tasa…" : "Sin tasa verificada"
					})]
				}, target))
			}),
			hasEstimate && (offline || outdated || failedUpdate) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-lg bg-[#fff0d5] px-3 py-2 text-xs leading-5 text-[#714811]",
				children: offline ? "Sin conexión: equivalencias estimadas con la última tasa guardada." : outdated ? "Tasa con fecha anterior: equivalencias estimadas." : "No se pudo actualizar: equivalencias estimadas con la última tasa guardada."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-1 text-xs leading-5 text-[#675f57]",
				children: needed.map((value, index) => {
					const rate = rates[index];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: RATE_SOURCES[value].url,
						target: "_blank",
						rel: "noreferrer",
						className: "underline",
						children: value === "VES" ? "BCV" : value === "EUR" ? "BCE" : "TRM Colombia"
					}), rate ? ` · ${formatRateDay(rate.validFrom)}${rate.validTo !== rate.validFrom ? ` al ${formatRateDay(rate.validTo)}` : ""}` : " · tasa verificada no disponible"] }, value);
				})
			}),
			from && from !== "USD" && from !== "VES" && hasEstimate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-5 text-[#675f57]",
				children: "Equivalencia entre monedas calculada a través del dólar con ambas fuentes."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-5 text-[#675f57]",
				children: "El precio original no cambia. Equivalencias informativas."
			})
		]
	});
}
/** Optional and public: sends neither listing price nor account information to rate providers. */
function PriceConversion({ amount = 1, currency = "USD", unit, reference = false, initiallyOpen = false, allowNegative = false, showBasePrices = false }) {
	const [open, setOpen] = (0, import_react.useState)(initiallyOpen), [targetPreference, setTarget] = (0, import_react.useState)(currency === "VES" ? "USD" : "VES");
	const id = (0, import_react.useId)();
	const active = open || showBasePrices;
	const { snapshot, offline, busy, failed, storageWarning } = (0, import_react.useSyncExternalStore)((0, import_react.useCallback)((listener) => active ? exchangeRateClient.subscribe(listener) : () => {}, [active]), exchangeRateClient.getSnapshot, exchangeRateClient.getServerSnapshot);
	const from = currencies.includes(currency) ? currency : null;
	const target = conversionTarget(from, targetPreference);
	const required = from ? conversionRates(from, target, snapshot) : [];
	const unsigned = from ? convertPrice(allowNegative ? Math.abs(amount) : amount, from, target, snapshot) : null;
	const converted = unsigned !== null && allowNegative && amount < 0 ? -unsigned : unsigned;
	const outdated = required.some((rate) => rate && !rateIsCurrent(rate));
	const unavailable = required.some((rate) => !rate) || required.some((rate) => rate && failed.includes(rate.currency));
	const estimate = offline || outdated || unavailable;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: `relative z-10 mt-3 min-w-0 [overflow-wrap:anywhere] rounded-xl text-[#3e2a19] border border-[#4c6b3a]/20 ${reference ? "bg-white p-4" : "bg-[#f3f6ee] p-3"}`,
		"aria-label": "Cambio oficial de referencia",
		"data-price-conversion": true,
		children: [
			showBasePrices && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceReferenceSummary, {
				amount,
				currency,
				unit,
				allowNegative,
				snapshot,
				offline,
				busy,
				failed
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				"aria-label": "Consultar euros o pesos",
				children: ["EUR", "COP"].map((value) => value === from ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "px-3 py-2 text-xs font-semibold",
					children: [value, " · moneda original"]
				}, value) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-controls": id,
					"aria-label": `Ver equivalente en ${currencyLabels[value]}`,
					onClick: () => {
						setTarget(value);
						setOpen(true);
					},
					className: "min-h-11 rounded-full border border-[#4c6b3a]/30 bg-white px-4 text-sm font-semibold text-[#365026]",
					children: value
				}, value))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setOpen((value) => !value),
				"aria-expanded": open,
				"aria-controls": id,
				className: "flex min-h-11 w-full items-center justify-between gap-3 text-left text-sm font-semibold text-[#365026]",
				children: [reference ? "Cambio de referencia · dólares, euros, bolívares y pesos" : showBasePrices ? "Fuentes y otras monedas" : "Ver precio aproximado en otra moneda", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": "true",
					children: open ? "−" : "+"
				})]
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				id,
				className: "mt-2 space-y-3 text-sm leading-6",
				children: [
					reference && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Consulta cuánto equivale 1 dólar. La tasa es diaria; puede mantenerse durante fines de semana y feriados." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block font-semibold",
						children: ["Ver en", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: target,
							onChange: (event) => setTarget(event.target.value),
							className: "mt-1 min-h-11 w-full min-w-0 rounded-lg border bg-white px-3",
							children: currencies.filter((value) => value !== from).map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value,
								children: currencyLabels[value]
							}, value))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						"aria-live": "polite",
						className: "font-bold text-[#3e2a19]",
						children: converted !== null ? `${formatMoney(amount, currency)} ≈ ${formatMoney(converted, target)}${unit ? ` por ${unit}` : ""}` : busy ? "Consultando la fuente oficial…" : "Conversión no disponible: falta una tasa oficial verificada."
					}),
					converted !== null && estimate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-lg bg-[#fff0d5] p-3 text-[#714811]",
						children: offline ? "Sin conexión. Este es un precio estimado con la última tasa consultada con internet." : outdated ? "La referencia tiene una fecha anterior. Este importe es solo estimado; revisa abajo la fecha de cada fuente." : "No pudimos actualizar la fuente oficial. Se muestra un estimado con la última tasa consultada."
					}),
					converted === null && offline && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-lg bg-[#fff0d5] p-3",
						children: "Sin conexión y sin una tasa guardada para estas monedas. Conservamos el precio original."
					}),
					required.map((rate, index) => rate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs leading-5 text-[#675f57]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: RATE_SOURCES[rate.currency].url,
									target: "_blank",
									rel: "noreferrer",
									className: "underline",
									children: RATE_SOURCES[rate.currency].name
								}),
								" · ",
								rate.currency === "EUR" ? `1 EUR = USD ${(1 / rate.perUsd).toLocaleString("es-VE", { maximumFractionDigits: 8 })}` : `1 USD = ${rate.currency} ${rate.perUsd.toLocaleString("es-VE", { maximumFractionDigits: 8 })}`
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								"Fecha de la tasa: ",
								formatRateDay(rate.validFrom),
								rate.validTo !== rate.validFrom ? ` al ${formatRateDay(rate.validTo)}` : "",
								"."
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								"Última consulta a la fuente: ",
								formatRateConsultation(rate.fetchedAt),
								"."
							] }),
							rate.currency === "COP" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								"Datos TRM: ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "https://creativecommons.org/licenses/by-sa/4.0/",
									target: "_blank",
									rel: "noreferrer",
									className: "underline",
									children: "CC BY-SA 4.0"
								}),
								". Conversión calculada por Venezuela Agro."
							] }),
							rate.currency === "EUR" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								"Referencia informativa del BCE, normalmente publicada en días laborables. Equivalencia calculada por Venezuela Agro; no es una cotización para ejecutar pagos. ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "https://www.ecb.europa.eu/services/using-our-site/disclaimer/html/index.en.html",
									target: "_blank",
									rel: "noreferrer",
									className: "underline",
									children: "Fuente gratuita y condiciones de reutilización"
								}),
								"."
							] })
						]
					}, rate.currency) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-[#8d372a]",
						children: [RATE_SOURCES[[...new Set([from, target].filter((value) => value && value !== "USD"))][index]]?.name || "Fuente oficial", ": no hay una tasa verificada disponible."]
					}, `missing-${index}`)),
					from && from !== "USD" && target !== "USD" && from !== target ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs",
						children: [
							"Equivalencia calculada a través del dólar usando ambas fuentes; no es una cotización directa ",
							from,
							"/",
							target,
							"."
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-[#675f57]",
						children: [reference ? "Consulta informativa." : "El importe conserva su moneda original.", " Confirma moneda, precio y condiciones antes de acordar la compra o el servicio. Los convertidores comparten una consulta automática por hora mientras hay precios visibles o un convertidor abierto y hay conexión. También se revisan al recuperar señal o cambiar la fecha oficial; las fuentes pueden retrasarse."]
					}),
					storageWarning && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-[#8d372a]",
						children: "El navegador no pudo guardar la tasa. Puede no estar disponible al cerrar o perder la conexión."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: busy || offline,
						onClick: () => void exchangeRateClient.refresh(true),
						className: "min-h-11 rounded-full border border-[#4c6b3a]/30 bg-white px-4 font-semibold disabled:opacity-50",
						children: busy ? "Consultando…" : "Consultar de nuevo"
					})
				]
			})
		]
	});
}
//#endregion
export { price_conversion_exports as n, PriceConversion as t };
