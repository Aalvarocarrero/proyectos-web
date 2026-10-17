"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState, useRef } from "react";
import { formatMoney, type Currency } from "@/lib/exchange-rates";
import { summarizeFarmMoney, farmRecordCurrency } from "@/lib/farm-money";
import { CurrencyField } from "@/components/currency-field";
import { PriceConversion } from "@/components/price-conversion";
import { FarmMoneyValue, farmMoneyAmount } from "@/components/farm-record-money";
import { farmRecordPayloadSchema } from "@/lib/sync-validation";
import { toast } from "sonner";
import { FarmDraftDialog, FarmRecordForm, FarmSaveButton } from "@/components/farm-record-form";
import { createSubmissionGate, submitGuardedForm } from "@/lib/form-submission";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Calculator, CalendarHeart, Check, CircleDollarSign, ClipboardList, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createLocalId, getCachedEntities, queueMutation, subscribeOfflineChanges, syncNow, type CachedEntity } from "@/lib/offline-db";

import type { FarmRecordPayload as Payload } from "@/lib/farm-types";
import { HEALTH_EVENT_TYPES } from "@/lib/animal-records";
const sectors = ["Pollos de engorde", "Gallinas ponedoras", "Bovinos", "Porcinos", "Piscicultura", "Apicultura", "Cacao", "Café", "Maíz", "Piña", "Cítricos", "Hortalizas", "Otro"];

export function FarmIntelligence({ farmId,ownerId,onOpenAnimal }: { farmId: string;ownerId?:string;onOpenAnimal?:(id:string)=>void }) {
  const [records, setRecords] = useState<Array<CachedEntity<Payload>>>([]);
  const [sector, setSector] = useState("Pollos de engorde");
  const [quantity, setQuantity] = useState(200);
  const [days, setDays] = useState(45);
  const [feedPerUnit, setFeedPerUnit] = useState(4.5);
  const [waterPerUnitDay, setWaterPerUnitDay] = useState(0.5);
  const [areaPerUnit, setAreaPerUnit] = useState(0.1);
  const [planCurrency,setPlanCurrency]=useState<Currency>("USD"),[summaryCurrency,setSummaryCurrency]=useState<Currency>("USD");
  const [costPerUnit, setCostPerUnit] = useState(0);
  const [expectedRevenue, setExpectedRevenue] = useState(0);
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);
  const submissionGate=useRef(createSubmissionGate());

  const load = useCallback(async () => setRecords((await getCachedEntities<Payload>("farm-record")).filter((item) => item.payload.farmId === farmId)), [farmId]);
  useEffect(() => {
    let active = true;
    void getCachedEntities<Payload>("farm-record").then((items) => { if (active) setRecords(items.filter((item) => item.payload.farmId === farmId)); });
    const unsubscribe = subscribeOfflineChanges(() => void load());
    return () => { active = false; unsubscribe(); };
  }, [farmId, load]);

  const totals = useMemo(() => ({
    feed: Math.max(0, quantity * feedPerUnit), water: Math.max(0, quantity * days * waterPerUnitDay),
    area: Math.max(0, quantity * areaPerUnit), variableCost: Math.max(0, quantity * costPerUnit),
    margin: expectedRevenue - Math.max(0, quantity * costPerUnit),
  }), [areaPerUnit, costPerUnit, days, expectedRevenue, feedPerUnit, quantity, waterPerUnitDay]);
  const finances = records.filter((item) => item.payload.recordType === "finance");
  const health = records.filter((item) => item.payload.recordType === "health");
  const animals = records.filter((item) => item.payload.recordType === "animal");
  const plans = records.filter((item) => item.payload.recordType === "plan");
  const financeTotals=summarizeFarmMoney(finances);
  const financeSummary=financeTotals.groups[summaryCurrency]??{income:0,cost:0,count:0};
  const chart = [{ name: "Ingresos", value: financeSummary.income, color: "#4c6b3a" }, { name: "Costos", value: financeSummary.cost, color: "#e5927c" }];

  async function savePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if(working)return; setWorking(true);
    const form = new FormData(event.currentTarget);
    try {
    await queueMutation({expectedOwner:ownerId, entityType: "farm-record", entityId: createLocalId("plan"), action: "upsert", payload: farmRecordPayloadSchema.parse({ farmId, recordType: "plan", category: sector, title: String(form.get("title") || `Plan ${sector}`), data: { currency:planCurrency, quantity, days, feedPerUnit, waterPerUnitDay, areaPerUnit, costPerUnit, expectedRevenue, totals, notes: String(form.get("notes") ?? ""), assumptionsReviewed: false } }) });
    setMessage("Escenario guardado en este dispositivo. Comprueba el respaldo en Sincronización.");
    void (async()=>{try{await load();if(navigator.onLine)await syncNow();}catch{setMessage("El escenario ya se guardó localmente. No lo repitas; comprueba los pendientes en Sincronización.");}})();
    } catch {setMessage("No se pudo guardar el escenario. Revisa los importes y conserva los datos antes de reintentar.");} finally {setWorking(false);}
  }

  async function saveFinance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement=event.currentTarget; const form = new FormData(formElement); setWorking(true);
    try{
    await queueMutation({expectedOwner:ownerId, entityType: "farm-record", entityId: createLocalId("finance"), action: "upsert", payload: farmRecordPayloadSchema.parse({ farmId, recordType: "finance", category: String(form.get("kind") ?? "Costo"), title: String(form.get("title") ?? "Movimiento"), data: { currency:String(form.get("currency")??"USD"), kind: String(form.get("kind") ?? "Costo"), amount: Number(form.get("amount") || 0), date: String(form.get("date") ?? ""), supplier: String(form.get("supplier") ?? ""), invoiceReference: String(form.get("invoiceReference") ?? ""), notes: String(form.get("notes") ?? "") } }) });
    setSummaryCurrency(String(form.get("currency")??"USD") as Currency);
    formElement.reset();
    const saved="Movimiento financiero guardado en este dispositivo. Comprueba el respaldo en Sincronización.";
    setMessage(saved);toast.success(saved,{duration:6500});
    void (async()=>{try{await load();if(navigator.onLine)await syncNow();}catch{setMessage("El registro ya se guardó localmente. No lo repitas; comprueba la vista y los pendientes.");}})();
    }finally{setWorking(false);}
  }

  async function saveHealth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement=event.currentTarget; const form = new FormData(formElement); setWorking(true);
    try{
    await queueMutation({expectedOwner:ownerId, entityType: "farm-record", entityId: createLocalId("health"), action: "upsert", payload: { farmId, recordType: "health", category: String(form.get("sector") ?? "General"), title: String(form.get("event") ?? "Control sanitario"), data: { animalId: String(form.get("animalId") ?? "") || null, eventType: String(form.get("eventType") ?? "other"), event: String(form.get("event") ?? ""), group: String(form.get("group") ?? ""), date: String(form.get("date") ?? ""), nextDate: String(form.get("nextDate") ?? ""), product: String(form.get("product") ?? ""), batch: String(form.get("batch") ?? ""), professional: String(form.get("professional") ?? ""), notes: String(form.get("notes") ?? "") } } });
    formElement.reset();
    const saved="Control sanitario guardado en este dispositivo. Comprueba el respaldo en Sincronización.";
    setMessage(saved);toast.success(saved,{duration:6500});
    void (async()=>{try{await load();if(navigator.onLine)await syncNow();}catch{setMessage("El registro ya se guardó localmente. No lo repitas; comprueba la vista y los pendientes.");}})();
    }finally{setWorking(false);}
  }

  return <div>
    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="section-kicker">PLANIFICACIÓN PRODUCTIVA</p><h1 className="font-display mt-3 text-4xl leading-none sm:text-6xl">Decidir con números.</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-[#5f574f]">Crea escenarios, registra costos y conserva controles sanitarios. Todos los coeficientes son editables porque clima, genética, manejo e instalaciones cambian el resultado.</p></div><div className="flex gap-2"><FinanceDialog canDismiss={()=>!submissionGate.current.busy} onSubmit={event=>submissionGate.current.run(()=>saveFinance(event))} working={working} /><HealthDialog animals={animals} canDismiss={()=>!submissionGate.current.busy} onSubmit={event=>submissionGate.current.run(()=>saveHealth(event))} working={working} /></div></div>
    {message && <p className="mt-6 flex gap-2 rounded-2xl bg-[#e8f0df] p-4 text-sm font-semibold text-[#365026]"><Check size={18} />{message}</p>}
    <div className="mt-8 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
      <form onSubmit={event=>void submitGuardedForm(event,submissionGate.current,()=>savePlan(event),()=>setMessage("Espera a que termine el guardado. Los campos del escenario se conservan."))} className="rounded-[1.8rem] border border-[#3e2a19]/10 bg-white p-5 sm:p-7">
        <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3e2a19] text-white"><Calculator /></div><div><h2 className="text-lg font-bold">Calculadora de escenario</h2><p className="text-xs text-[#71685f]">Ejemplo editable, no receta automática</p></div></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Nombre del plan"><Input name="title" defaultValue="Lote piloto 01" /></Field>
          <label className="text-sm font-semibold">Rubro<Select value={sector} onValueChange={setSector}><SelectTrigger className="mt-2 w-full bg-white"><SelectValue /></SelectTrigger><SelectContent>{sectors.map((item) => <SelectItem value={item} key={item}>{item}</SelectItem>)}</SelectContent></Select></label>
          <Field label={sector.includes("Cacao") || sector.includes("Café") || sector.includes("Maíz") || sector.includes("Piña") || sector.includes("Cítricos") || sector.includes("Hortalizas") ? "Plantas o superficie base" : "Cantidad de animales"}><Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} /></Field>
          <Field label="Duración del ciclo (días)"><Input type="number" min="1" value={days} onChange={(e) => setDays(Number(e.target.value))} /></Field>
          <Field label="Alimento/insumo por unidad (kg/ciclo)"><Input type="number" min="0" step="0.01" value={feedPerUnit} onChange={(e) => setFeedPerUnit(Number(e.target.value))} /></Field>
          <Field label="Agua por unidad/día (L)"><Input type="number" min="0" step="0.01" value={waterPerUnitDay} onChange={(e) => setWaterPerUnitDay(Number(e.target.value))} /></Field>
          <Field label="Área por unidad (m²)"><Input type="number" min="0" step="0.01" value={areaPerUnit} onChange={(e) => setAreaPerUnit(Number(e.target.value))} /></Field>
          <CurrencyField label="Moneda del escenario" value={planCurrency} onChange={setPlanCurrency}/>
          <div className="min-w-0"><Field label={`Costo variable por unidad (${planCurrency})`}><Input type="number" min="0" max="2000000000" step="0.01" value={costPerUnit} onChange={(e) => setCostPerUnit(Number(e.target.value))} /></Field><PriceConversion amount={costPerUnit} currency={planCurrency}/></div>
          <div className="min-w-0"><Field label={`Ingreso esperado total (${planCurrency})`}><Input type="number" min="0" max="2000000000" step="0.01" value={expectedRevenue} onChange={(e) => setExpectedRevenue(Number(e.target.value))} /></Field><PriceConversion amount={expectedRevenue} currency={planCurrency}/></div>
          <label className="text-sm font-semibold sm:col-span-2 lg:col-span-3">Notas y condiciones<Textarea name="notes" className="mt-2 min-h-24" placeholder="Genética, clima, tipo de galpón, sistema de riego, fuente del coeficiente…" /></label>
        </div>
        <div className="mt-6 grid min-w-0 gap-3 sm:grid-cols-2">
          {[["Insumo total", `${format(totals.feed)} kg`], ["Agua estimada", `${format(totals.water)} L`], ["Área estimada", `${format(totals.area)} m²`]].map(([label, value]) => <div key={label} className="min-w-0 rounded-xl bg-[#f3ebdd] p-3"><p className="text-[.7rem] font-bold uppercase tracking-wider text-[#71685f]">{label}</p><p className="mt-2 text-lg font-bold">{value}</p></div>)}
          <div className="min-w-0 rounded-xl bg-[#f3ebdd] p-3"><p className="text-[.7rem] font-bold uppercase tracking-wider text-[#71685f]">Costo variable</p><div className="mt-2"><FarmMoneyValue amount={totals.variableCost} currency={planCurrency}/></div></div>
          <div className="min-w-0 rounded-xl bg-[#f3ebdd] p-3"><p className="text-[.7rem] font-bold uppercase tracking-wider text-[#71685f]">Margen preliminar</p><div className="mt-2"><FarmMoneyValue amount={totals.margin} currency={planCurrency} allowNegative/></div></div>
        </div>
        <p className="mt-2 text-xs leading-6 text-[#675f57]">Cada importe tiene su conversión de referencia. Cambiar la moneda del escenario cambia la etiqueta de los importes escritos; no convierte ni modifica sus cifras.</p>
        <div className="mt-5 rounded-xl border border-[#e5927c]/30 bg-[#fff8f4] p-4 text-xs leading-6 text-[#6b4a2f]">Los valores iniciales son una demostración de interfaz. Revísalos con un veterinario, ingeniero agrónomo o técnico local antes de invertir. La plataforma no prescribe medicamentos, vitaminas ni dosis.</div>
        <Button type="submit" disabled={working} className="mt-6 rounded-full bg-[#3e2a19] text-white">{working && <Loader2 className="animate-spin" />}Guardar escenario</Button>
      </form>
      <div className="space-y-5">
        <section className="rounded-[1.8rem] border border-[#3e2a19]/10 bg-[#211d1a] p-5 text-white sm:p-7"><p className="text-xs font-bold tracking-[.14em] text-[#b7d79a]">PORTAFOLIO</p><div className="mt-4"><CurrencyField label="Ver registros en su moneda original" value={summaryCurrency} onChange={setSummaryCurrency}/><p className="mt-3 text-xs leading-6 text-white/75">{financeSummary.count} movimientos en {summaryCurrency}. Los totales de monedas distintas se consultan por separado y no se suman.</p>{financeTotals.legacyCount>0&&<p className="mt-2 text-xs leading-6 text-white/75">{financeTotals.legacyCount} registros antiguos conservan USD, la moneda indicada al crearlos.</p>}{financeTotals.invalidCount>0&&<p className="mt-2 text-xs leading-6 text-[#f3bc96]">{financeTotals.invalidCount} registros sin importe o moneda válidos no se incluyen en los totales.</p>}</div><div className="mt-4 grid grid-cols-2 gap-3"><Stat label="Planes" value={plans.length} /><Stat label="Controles" value={health.length} /><Stat label="Ingresos" value={formatMoney(financeSummary.income,summaryCurrency)}><PriceConversion amount={financeSummary.income} currency={summaryCurrency}/></Stat><Stat label="Costos" value={formatMoney(financeSummary.cost,summaryCurrency)}><PriceConversion amount={financeSummary.cost} currency={summaryCurrency}/></Stat></div><div className="mt-5 h-48"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chart} dataKey="value" innerRadius={48} outerRadius={72} paddingAngle={4}>{chart.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip formatter={value=>formatMoney(Number(value),summaryCurrency)} /></PieChart></ResponsiveContainer></div><div className="text-sm"><p className="text-center font-bold">Resultado registrado</p><FarmMoneyValue amount={financeSummary.income-financeSummary.cost} currency={summaryCurrency} allowNegative/></div></section>
        <section className="rounded-[1.8rem] border border-[#3e2a19]/10 bg-white p-5 sm:p-7"><div className="flex items-center gap-3"><ClipboardList className="text-[#4c6b3a]" /><h2 className="text-lg font-bold">Actividad por área</h2></div><div className="mt-4 h-48"><ResponsiveContainer width="100%" height="100%"><BarChart data={[{ name: "Planes", total: plans.length }, { name: "Sanidad", total: health.length }, { name: "Finanzas", total: finances.length }]}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="total" fill="#4c6b3a" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div></section>
      </div>
    </div>
    <details className="mt-6 rounded-2xl border bg-white p-5"><summary className="min-h-11 cursor-pointer py-3 font-bold">Movimientos y conversión opcional</summary><p className="mt-2 text-xs leading-6 text-[#675f57]">Se conserva cada importe original. Las equivalencias son referencias actuales; no recalculan la contabilidad histórica.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{finances.map(record=>{const currency=farmRecordCurrency(record.payload.data),amount=farmMoneyAmount(record.payload.data.amount);return <article key={record.id} className="min-w-0 rounded-xl border p-4"><h3 className="break-words font-semibold">{record.payload.title}</h3><p className="mt-2 text-xs">{String(record.payload.data.kind??"Costo")} · {String(record.payload.data.date||"Sin fecha")}</p>{currency&&amount!==null&&amount>=0?<><p className="mt-2 font-bold">{formatMoney(amount,currency)}</p><PriceConversion amount={amount} currency={currency}/></>:<p className="mt-2 text-sm">Importe o moneda pendiente de revisión.</p>}</article>;})}</div>{!finances.length&&<p className="mt-4 text-sm">Aún no hay movimientos registrados.</p>}</details>
    <section className="mt-6 rounded-2xl border border-[#3e2a19]/10 bg-white p-5"><h2 className="text-lg font-bold">Controles sanitarios guardados</h2><p className="mt-2 text-xs leading-6 text-[#71685f]">Los controles de grupo y los registros antiguos se conservan. Solo los animales que eliges explícitamente aparecen vinculados a su expediente.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{health.map(record=>{const animal=animals.find(row=>row.id===record.payload.data.animalId);return <article key={record.id} className="rounded-xl bg-[#f7f1e7] p-4"><p className="text-xs">{String(record.payload.data.date||"Sin fecha")}</p><h3 className="mt-1 break-words font-bold">{record.payload.title}</h3><p className="mt-2 break-words text-sm">{animal?.payload.title??(record.payload.data.animalId?"Animal ya no disponible · historial conservado":String(record.payload.data.group||"Control de grupo sin animal vinculado"))}</p>{animal&&onOpenAnimal&&<button type="button" className="mt-2 min-h-11 text-sm font-bold underline" onClick={()=>onOpenAnimal(animal.id)}>Abrir expediente</button>}{!!record.payload.data.notes&&<p className="mt-2 whitespace-pre-line break-words text-xs leading-6">{String(record.payload.data.notes)}</p>}</article>;})}</div>{!health.length&&<p className="mt-4 text-sm">Aún no hay controles sanitarios.</p>}</section>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="text-sm font-semibold">{label}<span className="mt-2 block">{children}</span></label>; }
function Stat({ label, value, children }: { label: string; value: string | number; children?: React.ReactNode }) { return <div className="min-w-0 rounded-xl bg-white/7 p-3"><p className="text-xs text-white/45">{label}</p><p className="mt-1 break-words text-xl font-bold">{value}</p>{children}</div>; }
function format(value: number) { return Number.isFinite(value) ? value.toLocaleString("es-VE", { maximumFractionDigits: 2 }) : "0"; }

function FinanceDialog({ onSubmit, working, canDismiss }: { canDismiss:()=>boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void|Promise<void>; working: boolean }) {
  const [open,setOpen]=useState(false),[currency,setCurrency]=useState<Currency>("USD"),[amount,setAmount]=useState("");
  const preview=farmMoneyAmount(amount);
  return <FarmDraftDialog open={open} onOpenChange={next=>{if(canDismiss()){setOpen(next);if(!next){setAmount("");setCurrency("USD");}}}}><DialogTrigger asChild><Button className="rounded-full bg-[#3e2a19] text-white"><CircleDollarSign />Movimiento</Button></DialogTrigger><DialogContent className="bg-[#f3ebdd]"><DialogHeader><DialogTitle className="font-display text-3xl">Registrar dinero</DialogTitle><DialogDescription>Costos, compras, ventas e inversión por rubro.</DialogDescription></DialogHeader><FarmRecordForm onSubmit={async event=>{await onSubmit(event);setOpen(false);setAmount("");setCurrency("USD");}} className="grid gap-4"><label className="text-sm font-semibold">Tipo<select name="kind" className="mt-2 h-11 w-full rounded-md border bg-white px-3"><option>Costo</option><option>Ingreso</option><option>Inversión</option></select></label><Field label="Concepto"><Input name="title" required placeholder="Ej. Alimento lote 01" /></Field><CurrencyField value={currency} onChange={setCurrency}/><div className="min-w-0"><Field label="Monto en la moneda seleccionada"><Input name="amount" type="number" min="0" max="2000000000" step="0.01" required value={amount} onChange={event=>setAmount(event.target.value)}/></Field>{preview!==null&&preview>=0&&<PriceConversion amount={preview} currency={currency}/>}</div><Field label="Fecha"><Input name="date" type="date" required /></Field><Field label="Proveedor o cliente"><Input name="supplier" /></Field><Field label="Referencia de factura"><Input name="invoiceReference" placeholder="Número o ubicación del archivo" /></Field><Field label="Notas"><Textarea name="notes" /></Field><FarmSaveButton disabled={working} className="rounded-full bg-[#3e2a19] text-white">Guardar movimiento</FarmSaveButton></FarmRecordForm></DialogContent></FarmDraftDialog>;
}

function HealthDialog({ onSubmit, working, canDismiss,animals }: { animals:CachedEntity<Payload>[];canDismiss:()=>boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void|Promise<void>; working: boolean }) {
  const [open,setOpen]=useState(false);
  return <FarmDraftDialog open={open} onOpenChange={next=>{if(canDismiss())setOpen(next);}}><DialogTrigger asChild><Button variant="outline" className="rounded-full bg-white"><CalendarHeart />Sanidad</Button></DialogTrigger><DialogContent className="bg-[#f3ebdd]"><DialogHeader><DialogTitle className="font-display text-3xl">Control sanitario</DialogTitle><DialogDescription>Registra lo que indicó o aplicó el profesional. La plataforma no calcula dosis.</DialogDescription></DialogHeader><FarmRecordForm onSubmit={async event=>{await onSubmit(event);setOpen(false);}} className="grid gap-4"><Field label="Rubro"><Input name="sector" required placeholder="Bovinos, porcinos, aves…" /></Field><Field label="Tipo de evento"><select name="eventType" defaultValue="other" className="min-h-11 w-full rounded-md border bg-white px-3">{HEALTH_EVENT_TYPES.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select></Field><Field label="Evento"><Input name="event" required maxLength={160} placeholder="Lo observado o indicado por el responsable" /></Field><Field label="Vincular a un animal (opcional)"><select name="animalId" className="min-h-11 w-full rounded-md border bg-white px-3"><option value="">Control de grupo, lote o cultivo</option>{animals.map(animal=><option key={animal.id} value={animal.id}>{animal.payload.title} · {String(animal.payload.data.tag||"Sin código")}</option>)}</select></Field><Field label="Grupo, lote o cultivo (si corresponde)"><Input name="group" maxLength={160} /></Field><div className="grid grid-cols-2 gap-3"><Field label="Fecha"><Input name="date" type="date" required /></Field><Field label="Próxima fecha"><Input name="nextDate" type="date" /></Field></div><Field label="Producto indicado"><Input name="product" /></Field><Field label="Lote del producto"><Input name="batch" /></Field><Field label="Profesional responsable"><Input name="professional" /></Field><Field label="Observaciones"><Textarea name="notes" /></Field><FarmSaveButton disabled={working} className="rounded-full bg-[#3e2a19] text-white">Guardar control</FarmSaveButton></FarmRecordForm></DialogContent></FarmDraftDialog>;
}
