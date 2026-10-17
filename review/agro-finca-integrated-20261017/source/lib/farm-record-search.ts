import type { FarmRecordPayload } from "./farm-types";

/** Search presentation only: never changes the private record or its category. */
export function farmRecordMatches(record: FarmRecordPayload, query: string): boolean {
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-VE");
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  const text = normalize([record.title, record.category, ...["tag", "species", "breed", "purpose", "location", "status", "notes", "objective"].map(key => typeof record.data[key] === "string" ? record.data[key] : "")].join(" "));
  return terms.every(term => text.includes(term));
}
export function inventoryAtMinimum(record: FarmRecordPayload): boolean {
  const quantity = record.data.quantity, minimum = record.data.minimum;
  return typeof quantity === "number" && Number.isFinite(quantity) && quantity >= 0 && typeof minimum === "number" && Number.isFinite(minimum) && minimum > 0 && quantity <= minimum;
}
