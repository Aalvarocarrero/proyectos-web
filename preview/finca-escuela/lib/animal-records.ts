/** Stable, explicitly selected event types. Labels are presentation only. */
export const HEALTH_EVENT_TYPES = [
  { value: "vaccination", label: "Vacunación" },
  { value: "deworming", label: "Desparasitación" },
  { value: "illness", label: "Enfermedad" },
  { value: "review", label: "Revisión" },
  { value: "other", label: "Otro" },
] as const;
export const REPRODUCTION_EVENT_TYPES = [
  { value: "mating", label: "Monta" },
  { value: "insemination", label: "Inseminación" },
  { value: "pregnancy-check", label: "Diagnóstico de gestación" },
  { value: "birth", label: "Parto" },
  { value: "other", label: "Otro" },
] as const;
export type HealthEventType = typeof HEALTH_EVENT_TYPES[number]["value"];
export type ReproductionEventType = typeof REPRODUCTION_EVENT_TYPES[number]["value"];
export const ANIMAL_HISTORY_TYPES = ["weight", "health", "reproduction"] as const;
export function isAnimalHistoryType(value: unknown): value is typeof ANIMAL_HISTORY_TYPES[number] {
  return ANIMAL_HISTORY_TYPES.some(type => type === value);
}

/** Calendar dates have no timezone and must not silently roll into another month. */
export function isAnimalRecordDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return day <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}
export const isValidAnimalRecordDate = isAnimalRecordDate;

type RecordData = { farmId: unknown; recordType: unknown; data?: unknown };
function objectData(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

/** Omission by an older client cannot erase an identity, link, or unknown detail.
 * Explicit null/empty values still replace data. Area placement retains its own
 * move/clear semantics. Callers must compare revisions before merging server data.
 */
export function preserveAnimalRecordData(current: RecordData, previous?: RecordData): Record<string, unknown> | undefined {
  const data = objectData(current.data), old = objectData(previous?.data);
  if (!data || !old || current.farmId !== previous?.farmId || current.recordType !== previous?.recordType
    || (current.recordType !== "animal" && !isAnimalHistoryType(current.recordType))) return data;
  const retained = { ...old };
  delete retained.areaId;
  delete retained.planPlacement;
  return { ...retained, ...data };
}

export type AnimalLinkTarget = { farmId: unknown; recordType: unknown; ownerId?: unknown; deleted?: unknown };
/** A pre-existing missing/deleted target remains historical. Known foreign or
 * wrong-kind targets never become valid, even for an unchanged link.
 */
export function assertAnimalLinkTarget(target: AnimalLinkTarget | undefined, farmId: unknown, owner: string | undefined, unchanged: boolean): void {
  if (target && (target.recordType !== "animal" || target.farmId !== farmId
    || (typeof target.ownerId === "string" && owner !== undefined && target.ownerId !== owner))) throw new Error("animal_not_available");
  if ((!target || target.deleted === true) && !unchanged) throw new Error("animal_not_available");
}

type AnimalRecordRow = { id: string; payload: { farmId: string; recordType: string; title?: string; data: Record<string, unknown> } };
export function animalRecordDate(record: AnimalRecordRow): string | null {
  const value = record.payload.data[record.payload.recordType === "weight" ? "measuredAt" : "date"];
  return isAnimalRecordDate(value) ? value : null;
}
export function animalRecordEventLabel(record: AnimalRecordRow): string {
  const { recordType, data, title } = record.payload;
  if (recordType === "weight") return "Pesaje";
  const options = recordType === "health" ? HEALTH_EVENT_TYPES : recordType === "reproduction" ? REPRODUCTION_EVENT_TYPES : [];
  return options.find(option => option.value === data.eventType)?.label
    ?? (typeof data.event === "string" && data.event.trim() ? data.event : title || "Registro");
}
export function linkedAnimalRecords<T extends AnimalRecordRow>(animal: AnimalRecordRow, records: readonly T[]): { weights: T[]; health: T[]; reproduction: T[]; history: T[] } {
  const history = animal.payload.recordType === "animal" ? records.filter(record => record.payload.farmId === animal.payload.farmId
    && isAnimalHistoryType(record.payload.recordType) && record.payload.data.animalId === animal.id) : [];
  const compare = (a: T, b: T, direction: number) => {
    const first = animalRecordDate(a), second = animalRecordDate(b);
    if (!first || !second) return first ? -1 : second ? 1 : a.id.localeCompare(b.id);
    return direction * first.localeCompare(second) || a.id.localeCompare(b.id);
  };
  history.sort((a, b) => compare(a, b, -1));
  return {
    weights: history.filter(record => record.payload.recordType === "weight").sort((a, b) => compare(a, b, 1)),
    health: history.filter(record => record.payload.recordType === "health"),
    reproduction: history.filter(record => record.payload.recordType === "reproduction"),
    history,
  };
}
