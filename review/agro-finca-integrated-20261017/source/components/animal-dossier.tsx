"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Activity, Baby, Scale, Syringe, UserRound } from "lucide-react";
import { AgroCategoryIcon } from "@/components/agro-category-icon";
import { FarmDraftDialog, FarmRecordForm, FarmSaveButton } from "@/components/farm-record-form";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HEALTH_EVENT_TYPES, REPRODUCTION_EVENT_TYPES, animalRecordDate, animalRecordEventLabel, isValidAnimalRecordDate, linkedAnimalRecords } from "@/lib/animal-records";
import type { FarmRecordPayload } from "@/lib/farm-types";

type Row = { id: string; payload: FarmRecordPayload; syncState?: "synced" | "pending" };
type Section = "identity" | "weight" | "health" | "reproduction";
type Props<T extends Row> = {
  animal: T | null;
  records: T[];
  demonstration?: boolean;
  readOnly?: boolean;
  onClose: () => void;
  onSave?: (payload: FarmRecordPayload, original?: T) => Promise<void>;
};
const sections = [
  { key: "identity", label: "Datos", icon: UserRound },
  { key: "weight", label: "Pesajes", icon: Scale },
  { key: "health", label: "Sanidad", icon: Syringe },
  { key: "reproduction", label: "Reproducción", icon: Baby },
] as const;
const value = (input: unknown, fallback = "Sin registrar") => typeof input === "string" && input.trim() ? input : fallback;
function dateLabel(input: unknown) { return isValidAnimalRecordDate(input) ? new Intl.DateTimeFormat("es-VE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${input}T00:00:00Z`)) : "Sin fecha válida"; }

/** The same real-record UI is used for the isolated, clearly labelled demonstration. */
export function AnimalDossier<T extends Row>({ animal, records, demonstration = false, readOnly = false, onClose, onSave }: Props<T>) {
  const [section, setSection] = useState<Section>("identity");
  const [editor, setEditor] = useState<{ section: Section; animal: T; original?: T } | null>(null);
  const [message, setMessage] = useState("");
  const [returnFocus] = useState<HTMLElement | null>(() => typeof document !== "undefined" && document.activeElement instanceof HTMLElement ? document.activeElement : null);
  if (!animal) return null;
  const history = linkedAnimalRecords(animal, records);
  const data = animal.payload.data;
  const weights = history.weights.filter(row => isValidAnimalRecordDate(row.payload.data.measuredAt) && typeof row.payload.data.weightKg === "number" && Number.isFinite(row.payload.data.weightKg) && row.payload.data.weightKg > 0).sort((a, b) => String(a.payload.data.measuredAt).localeCompare(String(b.payload.data.measuredAt)) || a.id.localeCompare(b.id));
  const latest = weights.at(-1);
  const area = records.find(row => row.payload.recordType === "area" && row.payload.farmId === animal.payload.farmId && row.id === data.areaId);
  const rows = section === "weight" ? history.weights : section === "health" ? history.health : history.reproduction;
  return <FarmDraftDialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent onCloseAutoFocus={event => { if (returnFocus?.isConnected) { event.preventDefault(); returnFocus.focus({ preventScroll: true }); } }} className="max-h-[92svh] overflow-y-auto bg-[#f8f3ea] sm:max-w-3xl" data-animal-dossier={animal.id}>
      <DialogHeader>
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#4c6b3a]"><AgroCategoryIcon category={animal.payload.category} size={24} />{readOnly ? "Finca modelo · animal ficticio · solo lectura" : demonstration ? "Animal ficticio · demostración local" : "Expediente individual"}</div>
        <DialogTitle className="break-words font-display text-3xl">{animal.payload.title}</DialogTitle>
        <DialogDescription>{value(data.tag, "Sin código o arete")} · {value(data.species, animal.payload.category)}. {readOnly ? "Consulta los datos ficticios de la plantilla. Aquí no se crean ni cambian registros." : demonstration ? "Estos datos son ejemplos; no se envían a tu cuenta." : "Registros disponibles en este dispositivo, también sin señal."}</DialogDescription>
      </DialogHeader>
      {!readOnly && editor ? <AnimalRecordEditor key={`${editor.section}:${editor.original?.id ?? "new"}`} section={editor.section} animal={editor.animal} original={editor.original} onSave={async (payload, original) => { if (!onSave) throw new Error("Revisa: esta ficha solo permite consulta."); await onSave(payload, original); setEditor(null); setMessage(demonstration ? "Ejemplo guardado solo en la demostración." : "Guardado en este dispositivo. El respaldo central se comprueba por separado."); }} /> : <>
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-4">
          <div><p className="text-xs text-[#71685f]">Último pesaje con fecha</p><p className="mt-1 text-xl font-bold">{latest ? `${Number(latest.payload.data.weightKg).toLocaleString("es-VE")} kg` : "Sin pesajes"}</p>{latest && <p className="mt-1 text-xs">{dateLabel(latest.payload.data.measuredAt)}</p>}</div>
          <div><p className="text-xs text-[#71685f]">Área vinculada</p><p className="mt-1 break-words font-bold">{area?.payload.title ?? (data.areaId ? "Área ya no disponible" : "Sin asignar")}</p><p className="mt-1 text-xs">{demonstration || readOnly ? "Ubicación de ejemplo, sin seguimiento GPS" : "Ubicación indicada por ti, sin seguimiento GPS"}</p></div>
        </div>
        <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Secciones del expediente">{sections.map(item => <button key={item.key} type="button" onClick={() => { setSection(item.key); setMessage(""); }} aria-pressed={section === item.key} className={`flex min-h-11 items-center justify-center gap-2 rounded-full border px-3 text-sm font-bold ${section === item.key ? "bg-[#3e2a19] text-white" : "bg-white"}`}><item.icon size={17} />{item.label}</button>)}</nav>
        {message && <p role="status" className="rounded-xl bg-[#e8efdf] p-3 text-sm">{message}</p>}
        {section === "identity" ? <>
          <dl className="grid grid-cols-2 gap-4 rounded-2xl bg-white p-5">{[["Código / arete", value(data.tag)], ["Nombre", value(data.name, animal.payload.title)], ["Especie", value(data.species, animal.payload.category)], ["Raza", value(data.breed)], ["Sexo", value(data.sex, "Desconocido")], ["Nacimiento", isValidAnimalRecordDate(data.birthDate) ? dateLabel(data.birthDate) : "Sin fecha · edad desconocida"], ["Propósito", value(data.purpose)], ["Estado registrado", value(data.status)]].map(([label, content]) => <div key={label} className="min-w-0"><dt className="text-xs text-[#71685f]">{label}</dt><dd className="mt-1 break-words text-sm font-semibold">{content}</dd></div>)}</dl>
          {typeof data.weightKg === "number" && <p className="text-xs leading-6 text-[#71685f]">Peso inicial de la ficha: {data.weightKg.toLocaleString("es-VE")} kg. No tiene fecha de medición y no se incluye en la gráfica.</p>}
          {!readOnly && <button type="button" className="button-dark justify-self-start" onClick={() => setEditor({ section, animal: structuredClone(animal), original: structuredClone(animal) })}>Editar datos del animal</button>}
          <p className="text-xs leading-6 text-[#71685f]">Los registros se vinculan por identificador de animal y finca. Los controles antiguos de grupo se conservan aparte; un nombre parecido no crea un vínculo.</p>
        </> : <section aria-label={section === "weight" ? "Historial de pesajes" : section === "health" ? "Historial sanitario" : "Historial reproductivo"} className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 className="flex items-center gap-2 font-bold"><Activity size={18} />{section === "weight" ? "Evolución del peso" : section === "health" ? "Eventos sanitarios" : "Eventos reproductivos"}</h3>{!readOnly && <button type="button" className="button-dark" onClick={() => setEditor({ section, animal: structuredClone(animal) })}>Registrar {section === "weight" ? "pesaje" : "evento"}</button>}</div>
          {section === "weight" && <WeightGraph rows={weights} />}
          {section !== "weight" && <p className="mb-4 text-xs leading-6 text-[#71685f]">{section === "health" ? "Registra lo observado o indicado por el profesional. No se calculan tratamientos, dosis ni un puntaje de salud." : "Fechas y resultados registrados por ti. No se predicen preñez, partos ni calendarios reproductivos."}</p>}
          {rows.length ? <ol className="space-y-3">{[...rows].sort((a, b) => (animalRecordDate(b) ?? "").localeCompare(animalRecordDate(a) ?? "") || a.id.localeCompare(b.id)).map(row => <li key={row.id} className="rounded-2xl border border-[#3e2a19]/10 bg-white p-4" data-animal-history={row.id}><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-xs text-[#71685f]">{dateLabel(animalRecordDate(row))}</p><h4 className="mt-1 break-words font-bold">{section === "weight" ? `${String(row.payload.data.weightKg ?? "Sin dato")} kg` : animalRecordEventLabel(row)}</h4></div><span className="rounded-full bg-[#f3ebdd] px-2 py-1 text-[11px]">{demonstration ? "Ejemplo" : row.syncState === "synced" ? "Respaldado" : "Solo local / pendiente"}</span></div>{section !== "weight" && <p className="mt-2 break-words text-sm">{row.payload.title}</p>}{[...["product", "batch", "professional", "outcome"].map(key => [({ product: "Producto registrado", batch: "Lote", professional: "Responsable", outcome: "Resultado" } as Record<string, string>)[key], row.payload.data[key]]), ["Próxima fecha indicada", isValidAnimalRecordDate(row.payload.data.nextDate) ? dateLabel(row.payload.data.nextDate) : null]].map(([label, content]) => typeof content === "string" && content.trim() ? <p key={String(label)} className="mt-2 break-words text-xs"><strong>{String(label)}:</strong> {content}</p> : null)}{!!row.payload.data.notes && <p className="mt-2 whitespace-pre-line break-words text-sm">{String(row.payload.data.notes)}</p>}{!readOnly && <button type="button" className="mt-2 min-h-11 text-sm font-bold underline" onClick={() => setEditor({ section, animal: structuredClone(animal), original: structuredClone(row) })}>Corregir registro</button>}</li>)}</ol> : <p className="rounded-xl bg-white p-5 text-sm">Todavía no hay {section === "weight" ? "pesajes" : "eventos"} vinculados a este animal.</p>}
        </section>}
      </>}
    </DialogContent>
  </FarmDraftDialog>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block min-w-0 text-sm font-semibold">{label}<span className="mt-2 block [&_input]:min-h-11 [&_textarea]:min-h-24">{children}</span></label>; }
function AnimalRecordEditor<T extends Row>({ section, animal, original, onSave }: { section: Section; animal: T; original?: T; onSave: NonNullable<Props<T>["onSave"]> }) {
  const data = original?.payload.data ?? {};
  const eventTypes = section === "health" ? HEALTH_EVENT_TYPES : REPRODUCTION_EVENT_TYPES;
  async function save(event: FormEvent<HTMLFormElement>) {
    const form = new FormData(event.currentTarget);
    const read = (key: string) => String(form.get(key) ?? "").trim();
    let payload: FarmRecordPayload;
    if (section === "identity") {
      if (!read("title") || !read("species")) throw new Error("Revisa: completa el nombre de la ficha y la especie.");
      if (read("birthDate") && !isValidAnimalRecordDate(read("birthDate"))) throw new Error("Revisa: indica una fecha de nacimiento válida o déjala vacía si no la conoces.");
      const identity = Object.fromEntries(["tag", "name", "species", "breed", "sex", "birthDate", "purpose", "status"].map(key => [key, read(key)]));
      const oldBirthDate = animal.payload.data.birthDate;
      if (!identity.birthDate && typeof oldBirthDate === "string" && oldBirthDate && !isValidAnimalRecordDate(oldBirthDate)) identity.birthDate = oldBirthDate;
      payload = { ...animal.payload, title: read("title"), category: read("species"), data: { ...animal.payload.data, ...identity } };
    } else {
      const date = read("date");
      if (!isValidAnimalRecordDate(date)) throw new Error("Revisa: indica la fecha real del registro.");
      if (read("nextDate") && (!isValidAnimalRecordDate(read("nextDate")) || read("nextDate") < date)) throw new Error("Revisa: la próxima fecha debe ser igual o posterior al evento.");
      const title = section === "weight" ? `Pesaje · ${animal.payload.title}` : read("title");
      const shared = { ...data, animalId: animal.id, animalTitle: animal.payload.title, notes: read("notes") };
      if (section === "weight") {
        const weightKg = Number(read("weightKg"));
        if (!read("weightKg") || !Number.isFinite(weightKg) || weightKg <= 0) throw new Error("Revisa: introduce un peso mayor que cero.");
        payload = { farmId: animal.payload.farmId, recordType: "weight", category: animal.payload.category, title, data: { ...shared, measuredAt: date, weightKg } };
      } else {
        if (!title) throw new Error("Revisa: describe el evento registrado.");
        payload = { farmId: animal.payload.farmId, recordType: section, category: animal.payload.category, title, data: { ...shared, eventType: read("eventType"), date, professional: read("professional"), ...(section === "health" ? { event: title, nextDate: read("nextDate"), product: read("product"), batch: read("batch") } : { outcome: read("outcome") }) } };
      }
    }
    await onSave(payload, original);
  }
  return <FarmRecordForm onSubmit={save}>
    <p className="rounded-xl bg-white p-3 text-sm">{section === "identity" ? "Edita únicamente los datos que conoces. El historial mantiene el mismo identificador." : `Este registro quedará vinculado a ${animal.payload.title}.`}</p>
    <div className="grid gap-4 sm:grid-cols-2">
      {section === "identity" ? <>
        <Field label="Nombre de la ficha"><Input name="title" defaultValue={animal.payload.title} maxLength={160} required /></Field>
        {[...["tag", "name", "species", "breed", "purpose", "status"].map(key => [key, ({ tag: "Código / arete", name: "Nombre del animal", species: "Especie", breed: "Raza", purpose: "Propósito", status: "Estado registrado" } as Record<string, string>)[key]])].map(([key, label]) => <Field key={key} label={label}><Input name={key} defaultValue={value(data[key], "")} required={key === "species"} maxLength={key === "species" ? 80 : 160} /></Field>)}
        <Field label="Sexo"><select name="sex" defaultValue={value(data.sex, "Desconocido")} className="min-h-11 w-full rounded-md border bg-white px-3">{[...new Set(["Hembra", "Macho", "Desconocido", value(data.sex, "Desconocido")])].map(sex => <option key={sex}>{sex}</option>)}</select></Field>
        <Field label="Fecha de nacimiento (si la conoces)"><Input name="birthDate" type="date" defaultValue={isValidAnimalRecordDate(data.birthDate) ? data.birthDate : ""} />{typeof data.birthDate === "string" && data.birthDate && !isValidAnimalRecordDate(data.birthDate) && <span className="mt-2 block break-words text-xs font-normal">Dato anterior: {data.birthDate}. Se conserva si no indicas una fecha válida.</span>}</Field>
      </> : <>
        {section === "weight" ? <Field label="Peso (kg)"><Input name="weightKg" type="number" inputMode="decimal" min="0.001" step="any" required defaultValue={typeof data.weightKg === "number" ? data.weightKg : ""} /></Field> : <>
          <Field label="Tipo de evento"><select name="eventType" defaultValue={value(data.eventType, "other")} className="min-h-11 w-full rounded-md border bg-white px-3">{eventTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}</select></Field>
          <Field label="Descripción del evento"><Input name="title" required maxLength={160} defaultValue={original?.payload.title ?? ""} placeholder="Lo ocurrido o indicado por el responsable" /></Field>
        </>}
        <Field label={section === "weight" ? "Fecha de medición" : "Fecha del evento"}><Input name="date" type="date" required defaultValue={value(section === "weight" ? data.measuredAt : data.date, "")} /></Field>
        {section === "health" && <><Field label="Próxima fecha indicada (opcional)"><Input name="nextDate" type="date" defaultValue={value(data.nextDate, "")} /></Field><Field label="Producto registrado (opcional)"><Input name="product" maxLength={160} defaultValue={value(data.product, "")} /></Field><Field label="Lote del producto (opcional)"><Input name="batch" maxLength={160} defaultValue={value(data.batch, "")} /></Field></>}
        {section !== "weight" && <Field label="Profesional o responsable (opcional)"><Input name="professional" maxLength={160} defaultValue={value(data.professional, "")} /></Field>}
        {section === "reproduction" && <Field label="Resultado observado (opcional)"><Input name="outcome" maxLength={500} defaultValue={value(data.outcome, "")} placeholder="Sin resultado confirmado, si se desconoce" /></Field>}
        <div className="sm:col-span-2"><Field label="Observaciones"><Textarea name="notes" maxLength={3000} defaultValue={value(data.notes, "")} /></Field></div>
      </>}
    </div>
    <FarmSaveButton className="rounded-full bg-[#3e2a19] text-white">Guardar {section === "identity" ? "datos" : "registro"}</FarmSaveButton>
  </FarmRecordForm>;
}

function WeightGraph({ rows }: { rows: Row[] }) {
  if (rows.length < 2) return <p className="mb-4 rounded-xl bg-white p-4 text-xs leading-6">La gráfica aparecerá con dos pesajes válidos y fechados. No se estima un peso objetivo.</p>;
  const times = rows.map(row => Date.parse(`${row.payload.data.measuredAt}T00:00:00Z`));
  const values = rows.map(row => Number(row.payload.data.weightKg));
  const minT = Math.min(...times), maxT = Math.max(...times), minV = Math.min(...values), maxV = Math.max(...values);
  const points = rows.map((row, i) => ({ row, x: maxT === minT ? 160 : 24 + (times[i] - minT) / (maxT - minT) * 272, y: maxV === minV ? 75 : 124 - (values[i] - minV) / (maxV - minV) * 98 }));
  return <figure className="mb-4 overflow-hidden rounded-2xl bg-white p-4"><figcaption className="flex flex-wrap justify-between gap-2 text-xs"><span>Pesos medidos · kg</span><span>{minV.toLocaleString("es-VE")}–{maxV.toLocaleString("es-VE")} kg</span></figcaption><svg viewBox="0 0 320 150" role="img" aria-label={`Evolución de ${rows.length} pesajes entre ${dateLabel(rows[0].payload.data.measuredAt)} y ${dateLabel(rows.at(-1)?.payload.data.measuredAt)}; detalle en la lista`} className="mt-2 max-h-52 w-full"><path d="M24 15V125H300" fill="none" stroke="#d7dccd" /><polyline points={points.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#4c6b3a" strokeWidth="2.5" />{points.map(point => <circle key={point.row.id} cx={point.x} cy={point.y} r="3.5" fill="#4c6b3a"><title>{`${dateLabel(point.row.payload.data.measuredAt)}: ${String(point.row.payload.data.weightKg)} kg`}</title></circle>)}</svg><div className="flex justify-between gap-3 text-xs text-[#71685f]"><span>{dateLabel(rows[0].payload.data.measuredAt)}</span><span>{dateLabel(rows.at(-1)?.payload.data.measuredAt)}</span></div><p className="mt-2 text-[11px] text-[#71685f]">Escala entre pesos registrados. La línea solo conecta mediciones.</p></figure>;
}
