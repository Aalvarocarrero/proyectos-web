import { c as numberType, d as stringType, l as objectType, n as arrayType, o as enumType, s as literalType } from "./types-nz7Y6Ylx.js";
//#region lib/exchange-rates.ts
var currencies = [
	"USD",
	"VES",
	"COP",
	"EUR"
];
var currencySchema = enumType(currencies);
var currencyLabels = {
	USD: "Dólares (USD)",
	VES: "Bolívares (VES)",
	COP: "Pesos colombianos (COP)",
	EUR: "Euros (EUR)"
};
var sourceCurrencies = [
	"VES",
	"COP",
	"EUR"
];
var RATE_REFRESH_MS = 3600 * 1e3;
var RATE_STORAGE_KEY = "venezuela-agro-official-rates-v1";
var RATE_SOURCES = {
	VES: {
		name: "Banco Central de Venezuela (BCV)",
		url: "https://www.bcv.org.ve/",
		timeZone: "America/Caracas"
	},
	EUR: {
		name: "Banco Central Europeo (BCE)",
		url: "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html",
		timeZone: "Europe/Berlin"
	},
	COP: {
		name: "Superintendencia Financiera de Colombia · TRM",
		url: "https://www.datos.gov.co/Econom-a-y-Finanzas/Tasa-de-Cambio-Representativa-del-Mercado-TRM/32sa-8pi3",
		timeZone: "America/Bogota"
	}
};
var day = stringType().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
	const parsed = /* @__PURE__ */ new Date(`${value}T00:00:00Z`);
	return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
});
var officialRateSchema = objectType({
	currency: enumType(sourceCurrencies),
	perUsd: numberType().finite().positive().max(1e9),
	validFrom: day,
	validTo: day,
	fetchedAt: stringType().datetime()
}).strict().refine((rate) => rate.validTo >= rate.validFrom);
var rateSnapshotSchema = objectType({
	version: literalType(1),
	rates: arrayType(officialRateSchema).max(3)
}).strict().refine((snapshot) => new Set(snapshot.rates.map((rate) => rate.currency)).size === snapshot.rates.length);
var rateResponseSchema = objectType({
	version: literalType(1),
	rates: arrayType(officialRateSchema).max(3),
	unavailable: arrayType(enumType(sourceCurrencies)).max(3)
}).strict().refine((value) => new Set(value.rates.map((rate) => rate.currency)).size === value.rates.length);
function sourceDay(currency, now = /* @__PURE__ */ new Date()) {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: RATE_SOURCES[currency].timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(now);
	return [
		"year",
		"month",
		"day"
	].map((type) => parts.find((part) => part.type === type).value).join("-");
}
function rateIsCurrent(rate, now = /* @__PURE__ */ new Date()) {
	const today = sourceDay(rate.currency, now);
	return rate.validFrom <= today && rate.validTo >= today;
}
/** Retain the visitor's selection unless it becomes the new original currency. */
function conversionTarget(from, preferred) {
	return preferred === from ? from === "USD" ? "VES" : "USD" : preferred;
}
function conversionRates(from, to, snapshot) {
	return [...new Set([from, to].filter((currency) => currency !== "USD"))].map((currency) => snapshot.rates.find((rate) => rate.currency === currency));
}
function convertPrice(amount, from, to, snapshot) {
	if (!Number.isFinite(amount) || amount < 0 || !currencies.includes(from) || !currencies.includes(to)) return null;
	if (from === to) return amount;
	if (conversionRates(from, to, snapshot).some((rate) => !rate)) return null;
	const base = from === "USD" ? 1 : snapshot.rates.find((rate) => rate.currency === from).perUsd;
	const target = to === "USD" ? 1 : snapshot.rates.find((rate) => rate.currency === to).perUsd;
	const result = amount / base * target;
	return Number.isFinite(result) ? result : null;
}
function mergeRateSnapshots(previous, incoming) {
	return {
		version: 1,
		rates: sourceCurrencies.flatMap((currency) => {
			const next = incoming.rates.find((rate) => rate.currency === currency);
			const old = previous.rates.find((rate) => rate.currency === currency);
			return next && (!old || next.fetchedAt >= old.fetchedAt) ? [next] : old ? [old] : [];
		})
	};
}
function readRateSnapshot(storage) {
	try {
		return rateSnapshotSchema.parse(JSON.parse(storage.getItem("venezuela-agro-official-rates-v1") || "{}"));
	} catch {
		return {
			version: 1,
			rates: []
		};
	}
}
function saveRateSnapshot(storage, snapshot) {
	storage.setItem(RATE_STORAGE_KEY, JSON.stringify(rateSnapshotSchema.parse(snapshot)));
}
function formatMoney(amount, currency) {
	return `${currency} ${amount.toLocaleString("es-VE", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	})}`;
}
function formatRateDay(value) {
	return value.split("-").reverse().join("/");
}
function formatRateConsultation(value) {
	return new Intl.DateTimeFormat("es-VE", {
		timeZone: "America/Caracas",
		dateStyle: "short",
		timeStyle: "short"
	}).format(new Date(value)) + " (hora de Venezuela)";
}
//#endregion
export { sourceCurrencies as _, convertPrice as a, currencySchema as c, formatRateDay as d, mergeRateSnapshots as f, saveRateSnapshot as g, readRateSnapshot as h, conversionTarget as i, formatMoney as l, rateResponseSchema as m, RATE_SOURCES as n, currencies as o, rateIsCurrent as p, conversionRates as r, currencyLabels as s, RATE_REFRESH_MS as t, formatRateConsultation as u, sourceDay as v };
