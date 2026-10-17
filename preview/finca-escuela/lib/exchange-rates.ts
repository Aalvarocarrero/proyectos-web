import { z } from 'zod';

export const currencies = ['USD', 'VES', 'COP', 'EUR'] as const;
export const currencySchema = z.enum(currencies);
export const currencyLabels: Record<typeof currencies[number],string> = {USD:'Dólares (USD)',VES:'Bolívares (VES)',COP:'Pesos colombianos (COP)',EUR:'Euros (EUR)'};
export const sourceCurrencies = ['VES','COP','EUR'] as const;
export type SourceCurrency = typeof sourceCurrencies[number];
export type Currency = typeof currencies[number];
export const RATE_REFRESH_MS = 60 * 60 * 1000;
export const RATE_STORAGE_KEY = 'venezuela-agro-official-rates-v1';
export const RATE_SOURCES = {
  VES: { name: 'Banco Central de Venezuela (BCV)', url: 'https://www.bcv.org.ve/', timeZone: 'America/Caracas' },
  EUR: { name: 'Banco Central Europeo (BCE)', url: 'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html', timeZone: 'Europe/Berlin' },
  COP: { name: 'Superintendencia Financiera de Colombia · TRM', url: 'https://www.datos.gov.co/Econom-a-y-Finanzas/Tasa-de-Cambio-Representativa-del-Mercado-TRM/32sa-8pi3', timeZone: 'America/Bogota' },
} as const;
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0,10) === value;
});
export const officialRateSchema = z.object({
  currency: z.enum(sourceCurrencies), perUsd: z.number().finite().positive().max(1_000_000_000),
  validFrom: day, validTo: day, fetchedAt: z.string().datetime(),
}).strict().refine(rate => rate.validTo >= rate.validFrom);
export type OfficialRate = z.infer<typeof officialRateSchema>;
export const rateSnapshotSchema = z.object({
  version: z.literal(1), rates: z.array(officialRateSchema).max(3),
}).strict().refine(snapshot => new Set(snapshot.rates.map(rate=>rate.currency)).size === snapshot.rates.length);
export type RateSnapshot = z.infer<typeof rateSnapshotSchema>;
export type RateResponse = RateSnapshot & { unavailable: SourceCurrency[] };
export const rateResponseSchema = z.object({version:z.literal(1),rates:z.array(officialRateSchema).max(3),unavailable:z.array(z.enum(sourceCurrencies)).max(3)}).strict().refine(value=>new Set(value.rates.map(rate=>rate.currency)).size===value.rates.length);

export function sourceDay(currency: SourceCurrency, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: RATE_SOURCES[currency].timeZone, year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(now);
  return ['year','month','day'].map(type=>parts.find(part=>part.type===type)!.value).join('-');
}
export function rateIsCurrent(rate: OfficialRate, now = new Date()) {
  const today = sourceDay(rate.currency, now);
  return rate.validFrom <= today && rate.validTo >= today;
}
/** Retain the visitor's selection unless it becomes the new original currency. */
export function conversionTarget(from: Currency|null, preferred: Currency): Currency {
  return preferred===from ? (from==='USD'?'VES':'USD') : preferred;
}
export function conversionRates(from: Currency, to: Currency, snapshot: RateSnapshot) {
  const required = [...new Set([from,to].filter(currency=>currency!=='USD'))];
  return required.map(currency=>snapshot.rates.find(rate=>rate.currency===currency));
}
export function convertPrice(amount: number, from: Currency, to: Currency, snapshot: RateSnapshot): number|null {
  if (!Number.isFinite(amount) || amount < 0 || !currencies.includes(from) || !currencies.includes(to)) return null;
  if (from === to) return amount;
  const required = conversionRates(from,to,snapshot);
  if (required.some(rate=>!rate)) return null;
  const base = from==='USD' ? 1 : snapshot.rates.find(rate=>rate.currency===from)!.perUsd;
  const target = to==='USD' ? 1 : snapshot.rates.find(rate=>rate.currency===to)!.perUsd;
  const result = amount / base * target;
  return Number.isFinite(result) ? result : null;
}
export function mergeRateSnapshots(previous: RateSnapshot, incoming: RateSnapshot): RateSnapshot {
  return {version:1,rates: sourceCurrencies.flatMap(currency=>{
    const next = incoming.rates.find(rate=>rate.currency===currency);
    const old = previous.rates.find(rate=>rate.currency===currency);
    // A failed or older observation must not relabel the last valid local copy.
    return next && (!old || next.fetchedAt >= old.fetchedAt) ? [next] : old ? [old] : [];
  })};
}
export function readRateSnapshot(storage: Pick<Storage,'getItem'>): RateSnapshot {
  try { return rateSnapshotSchema.parse(JSON.parse(storage.getItem(RATE_STORAGE_KEY)||'{}')); }
  catch { return {version:1,rates:[]}; }
}
export function saveRateSnapshot(storage: Pick<Storage,'setItem'>, snapshot: RateSnapshot) {
  storage.setItem(RATE_STORAGE_KEY,JSON.stringify(rateSnapshotSchema.parse(snapshot)));
}
export function formatMoney(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString('es-VE',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
}
export function formatRateDay(value: string) { return value.split('-').reverse().join('/'); }
export function formatRateConsultation(value: string) {
  return new Intl.DateTimeFormat('es-VE',{timeZone:'America/Caracas',dateStyle:'short',timeStyle:'short'}).format(new Date(value)) + ' (hora de Venezuela)';
}
