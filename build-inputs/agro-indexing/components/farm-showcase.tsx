'use client';

import { ConnectionIndicator } from '@/components/connection-indicator';
import { FarmRecordValue, farmMoneyDetailClass } from '@/components/farm-record-money';
import { AnimalDossier } from '@/components/animal-dossier';
import { OfflinePreparation } from '@/components/offline-preparation';
import { FarmAssetPack } from '@/components/farm-asset-pack';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, BookOpen, Eye, Leaf, Map, Rotate3D, Search } from 'lucide-react';
import FarmMasterplanScene from '@/components/farm-masterplan-scene';
import { FarmIllustratedScene } from '@/components/farm-illustrated-scene';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createFarmShowcase, type ShowcaseRecord } from '@/lib/farm-showcase';
import { animalRecordEventLabel } from '@/lib/animal-records';
import type { FarmRecordPayload } from '@/lib/farm-types';

const button = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#365026]/25 bg-white px-4 py-2 text-sm font-semibold text-[#29442c] hover:bg-[#edf2e5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#365026]';
const typeLabels: Record<FarmRecordPayload['recordType'], string> = {
  area: 'Área', animal: 'Animal', crop: 'Cultivo', weight: 'Pesaje', inventory: 'Inventario', task: 'Tarea',
  'production-cycle': 'Ciclo productivo', finance: 'Finanzas', reproduction: 'Reproducción', health: 'Control sanitario', plan: 'Escenario', document: 'Documento',
};
const fieldLabels: Record<string, string> = {
  name: 'Nombre', usage: 'Uso', areaSqM: 'Superficie (m²)', shape: 'Forma', lengthM: 'Largo (m)', widthM: 'Ancho (m)', diameterM: 'Diámetro (m)',
  crop: 'Cultivo', cropVariety: 'Variedad', waterTrough: 'Bebedero del ejemplo', x: 'Posición horizontal (%)', y: 'Posición vertical (%)', heightM: 'Altura ilustrativa (m)', fenced: 'Con cerca', tag: 'Identificación', species: 'Especie', sex: 'Sexo', birthDate: 'Nacimiento',
  weightKg: 'Peso (kg)', breed: 'Raza', purpose: 'Propósito', status: 'Estado', notes: 'Notas del ejemplo', areaId: 'Área vinculada', animalId: 'Animal vinculado',
  animalTitle: 'Animal', measuredAt: 'Fecha del pesaje', objective: 'Objetivo', startDate: 'Inicio', endDate: 'Fin', quantity: 'Cantidad', unit: 'Unidad',
  minimum: 'Mínimo', location: 'Ubicación', kind: 'Tipo', amount: 'Monto de ejemplo', currency: 'Moneda original', date: 'Fecha', supplier: 'Proveedor', invoiceReference: 'Referencia',
  eventType: 'Tipo de evento', outcome: 'Resultado registrado', event: 'Evento', group: 'Grupo', nextDate: 'Próxima fecha de ejemplo', product: 'Producto', batch: 'Lote', professional: 'Responsable', days: 'Días',
  feedPerUnit: 'Alimento por unidad', waterPerUnitDay: 'Agua por unidad y día', areaPerUnit: 'Superficie por unidad', costPerUnit: 'Costo por unidad',
  expectedRevenue: 'Ingreso esperado del escenario', assumptionsReviewed: 'Supuestos revisados', totals: 'Totales del escenario',
  feed: 'Alimento', water: 'Agua', area: 'Superficie', variableCost: 'Costo variable', margin: 'Margen',
};
const hiddenFields = new Set(['mapLayoutVersion', 'mapX', 'mapY', 'mapWidth', 'mapHeight', 'color', 'typedAreaOutline', 'demoPlanPlacement', 'planPlacement']);
const primaryRecordTypes = ['area', 'animal', 'inventory', 'weight', 'production-cycle', 'plan'];
const cleanTitle = (title: string) => title.replace(/\s*·\s*ejemplo\b/gi, '').trim();
const number = (value: number) => value.toLocaleString('es-VE', { maximumFractionDigits: 2 });

function valueText(value: unknown, records: ShowcaseRecord[]): string {
  if (value === null || value === undefined || value === '') return 'Sin definir';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'number') return number(value);
  if (typeof value === 'string') return records.find(record => record.id === value)?.payload.title ?? value;
  if (Array.isArray(value)) return value.map(item => valueText(item, records)).join(' · ');
  if (typeof value === 'object') return Object.entries(value).map(([key, item]) => `${fieldLabels[key] ?? key}: ${valueText(item, records)}`).join('\n');
  return String(value);
}

/** A presentation of the current fixture; interaction changes only React view state. */
export function FarmShowcase() {
  const [model] = useState(createFarmShowcase);
  const [tourPaused,setTourPaused]=useState(false);
  const [view, setView] = useState<'masterplan' | 'illustrated'>('masterplan');
  const [selectedId, setSelectedId] = useState<string>();
  const [openRecordId, setOpenRecordId] = useState<string>();
  const [openAnimalId,setOpenAnimalId]=useState<string>();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const dossierAnimal=model.animalRecords.find(row=>row.id===openAnimalId&&row.payload.farmId===model.farm.id)??null;
  const openAnimal=(id:string)=>{if(model.animalRecords.some(row=>row.id===id&&row.payload.farmId===model.farm.id))setOpenAnimalId(id);};
  const record = model.records.find(row => row.id === openRecordId);
  const linked = record ? model.records.filter(row => row.payload.data.areaId === record.id || row.payload.data.animalId === record.id) : [];
  const groups = [
    { id: 'all', label: 'Todos', count: model.records.length },
    { id: 'area', label: 'Áreas', count: model.areaRecords.length },
    { id: 'animal', label: 'Animales', count: model.animalRecords.length },
    { id: 'crops', label: 'Cultivos', count: model.cropAreas.length },
    { id: 'inventory', label: 'Inventario', count: model.records.filter(row => row.payload.recordType === 'inventory').length },
    { id: 'weight', label: 'Pesajes', count: model.records.filter(row => row.payload.recordType === 'weight').length },
    { id: 'production-cycle', label: 'Ciclos productivos', count: model.records.filter(row => row.payload.recordType === 'production-cycle').length },
    { id: 'plan', label: 'Escenarios', count: model.records.filter(row => row.payload.recordType === 'plan').length },
    { id: 'other', label: 'Más registros', count: model.records.filter(row => !primaryRecordTypes.includes(row.payload.recordType)).length },
  ];
  const visibleRecords = useMemo(() => {
    const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const term = normalize(query.trim());
    return model.records.filter(row => {
      const matchesType = filter === 'all' || (filter === 'crops' ? model.cropAreas.some(area => area.id === row.id)
        : filter === 'other' ? !primaryRecordTypes.includes(row.payload.recordType) : row.payload.recordType === filter);
      return matchesType && (!term || normalize(`${row.payload.title} ${row.payload.category} ${String(row.payload.data.tag ?? '')}`).includes(term));
    });
  }, [model, filter, query]);
  const openArea = (id: string) => { setSelectedId(id); setOpenRecordId(id); };

  return <main className="min-h-screen bg-[#f2f2e7] pb-20 text-[#29442c]" data-farm-showcase-version={model.templateVersion} data-masterplan-immersive>
    <header className="border-b border-[#375437]/20 bg-[#203e2d] px-4 py-5 text-white sm:px-6">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#e4eddc]"><ArrowLeft className="size-4" aria-hidden="true" />VenezuelaAgro</Link>
        <nav aria-label="Explorar la vista previa" className="flex flex-wrap items-center gap-2">
          <ConnectionIndicator />
          <Link href="/marketplace" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#d9ebbb] px-5 text-sm font-semibold text-[#203e2d]">Mercado<ArrowUpRight className="size-4" aria-hidden="true" /></Link>
          <Link href="/finca-demo" className="inline-flex min-h-11 items-center rounded-full border border-white/30 px-4 py-2 text-sm font-semibold">Demostración editable guardada</Link>
        </nav>
      </div>
      <div className="mx-auto mt-5 max-w-[1440px]">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#c4d8b2]"><Eye className="size-4" aria-hidden="true" />Demostración de solo lectura</p>
        <h1 className="font-display mt-2 text-3xl leading-tight sm:text-5xl">Finca modelo · {number(model.farm.payload.areaSqM / 10000)} ha</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#d6e0cf]">Recorre Finca Horizonte y consulta cada área. Esta vista muestra la plantilla actual; tu demostración editable guardada conserva sus propios datos.</p>
        <div aria-label="Contenido de la finca modelo" className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
          {[`${model.areaRecords.length} áreas`, `${model.animalRecords.length} animales ubicados`, `${model.cropAreas.length} cultivos`, '400 × 250 m'].map(label => <span key={label} className="rounded-full border border-white/20 bg-white/5 px-3 py-2">{label}</span>)}
        </div>
      </div>
    </header>

    <div className="mx-auto max-w-[1440px] space-y-6 px-3 pt-5 sm:px-6">
      <section aria-label="Recorrido de la finca modelo">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Elegir vista del plano">
            <button type="button" className={button} aria-pressed={view === 'masterplan'} onClick={() => setView('masterplan')}><Rotate3D className="size-4" aria-hidden="true" />Recorrido 3D</button>
            <button type="button" className={button} aria-pressed={view === 'illustrated'} onClick={() => setView('illustrated')}><Map className="size-4" aria-hidden="true" />Plano ilustrado 2D</button>
          </div>
          <a href="#registros-modelo" className={button}><BookOpen className="size-4" aria-hidden="true" />Consultar registros</a>
        </div>
        {view === 'masterplan' ? <FarmMasterplanScene
          propertyOutline={model.boundary.points}
          areas={model.illustrated.areas}
          animals={model.illustrated.animals}
          animalRecords={model.animalRecords.map(row=>({id:row.id,title:row.payload.title,category:row.payload.category,areaId:typeof row.payload.data.areaId==='string'?row.payload.data.areaId:null}))}
          onOpenAnimal={openAnimal}
          farmName={model.farm.payload.name}
          physicalAreaSqM={model.farm.payload.areaSqM}
          surveyBased={model.boundary.basis === 'survey'}
          selectedId={selectedId}
          onSelect={openArea}
          onReturn={() => setView('illustrated')}
          returnLabel="Ver plano 2D"
          autoTour
          tourPaused={tourPaused}
          onTourPauseChange={setTourPaused}
          interactionBlocked={Boolean(record||dossierAnimal)}
          readOnly
        /> : <FarmIllustratedScene
            physicalAreaSqM={model.farm.payload.areaSqM}
          propertyOutline={model.boundary.points}
          areas={model.illustrated.areas}
          animals={model.illustrated.animals}
          farmName="Finca Horizonte · modelo de solo lectura"
          selectedId={selectedId}
          onSelect={openArea}
          onOpen={openArea}
          onOrganize={() => setView('masterplan')}
          assetBase="/plan-oblique"
          readOnly
        />}
        <p className="mt-3 px-1 text-xs leading-5 text-[#56644b]">Composición ficticia proporcional. Edificios, animales y vegetación son ilustrativos; no es un levantamiento 3D ni una imagen satelital. Las fechas y cantidades pertenecen al ejemplo.</p>
      </section>

      <details className="rounded-2xl border border-[#4c6b3a]/20 bg-white p-4">
        <summary className="cursor-pointer text-sm font-bold text-[#365026]">Preparar esta finca modelo sin conexión</summary>
        <div className="mt-4 space-y-4"><OfflinePreparation /><FarmAssetPack /></div>
      </details>
      <section id="registros-modelo" aria-labelledby="registros-modelo-title" className="scroll-mt-5 rounded-3xl border border-[#4c6b3a]/20 bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#59754b]">Explorar las fichas</p><h2 id="registros-modelo-title" className="font-display mt-1 text-2xl sm:text-3xl">Registros de la finca modelo</h2><p className="mt-2 text-sm leading-6 text-[#56644b]">{model.records.length} registros ficticios y {model.listings.length} borradores de productos de la plantilla {model.templateVersion}. Toca una ficha para consultar sus datos y vínculos.</p></div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#edf2e5] px-3 py-2 text-xs font-bold"><Leaf className="size-4" aria-hidden="true" />Solo consulta</span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filtrar registros">{groups.map(group => <button key={group.id} type="button" className={`${button} aria-pressed:bg-[#365026] aria-pressed:text-white`} aria-pressed={filter === group.id} onClick={() => setFilter(group.id)}>{group.label} · {group.count}</button>)}</div>
        <label className="mt-4 block max-w-xl text-sm font-semibold">Buscar por nombre, categoría o identificación<div className="mt-2 flex items-center gap-2 rounded-xl border border-[#365026]/25 px-3"><Search className="size-4 shrink-0 text-[#59754b]" aria-hidden="true" /><input className="min-h-11 w-full min-w-0 bg-transparent text-base font-normal outline-none focus-visible:underline" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Alba, tomate, potrero…" /></div></label>
        <p role="status" className="mt-3 text-xs text-[#56644b]">{visibleRecords.length} {visibleRecords.length === 1 ? 'ficha encontrada' : 'fichas encontradas'}</p>
        <div className="mt-3 grid max-h-[34rem] gap-2 overflow-y-auto rounded-2xl p-1 sm:grid-cols-2 lg:grid-cols-3">{visibleRecords.map(row => <button key={row.id} type="button" className="min-h-20 rounded-xl border border-[#365026]/15 bg-[#f7f8f1] p-4 text-left hover:border-[#365026]/50 hover:bg-[#edf2e5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#365026]" onClick={() => { if(row.payload.recordType==='animal'){openAnimal(row.id);return;}if (row.payload.recordType === 'area') setSelectedId(row.id); setOpenRecordId(row.id); }}><span className="block text-xs text-[#59754b]">{typeLabels[row.payload.recordType]} · {row.payload.category}</span><span className="mt-1 block break-words text-sm font-semibold">{cleanTitle(row.payload.title)}</span>{row.payload.recordType === 'area' && <span className="mt-1 block text-xs text-[#56644b]">{number(Number(row.payload.data.areaSqM ?? 0))} m²</span>}{row.payload.recordType === 'animal' && row.payload.data.tag ? <span className="mt-1 block text-xs text-[#56644b]">{String(row.payload.data.tag)}</span> : null}</button>)}</div>
        {visibleRecords.length === 0 && <p className="rounded-xl bg-[#f7f8f1] p-4 text-sm">No hay fichas con esta búsqueda. Prueba otro nombre o categoría.</p>}
      </section>
      <section aria-labelledby="productos-modelo-title" className="rounded-3xl border border-[#4c6b3a]/20 bg-white p-4 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[.12em] text-[#59754b]">Productos de ejemplo</p>
        <h2 id="productos-modelo-title" className="font-display mt-1 text-2xl sm:text-3xl">Borradores de productos · {model.listings.length}</h2>
        <p className="mt-2 text-sm leading-6 text-[#56644b]">Ejemplos ficticios en borrador. No son ofertas publicadas ni indican disponibilidad real.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{model.listings.map(listing => <article key={listing.id} className="rounded-2xl border border-[#365026]/15 bg-[#f7f8f1] p-4">
          <p className="text-xs font-semibold text-[#59754b]">{listing.payload.category}</p>
          <h3 className="mt-1 font-semibold">{listing.payload.title}</h3>
          <dl className="mt-3 space-y-2 text-sm text-[#56644b]"><div><dt className="font-semibold">Ubicación</dt><dd>{listing.payload.location}</dd></div><div><dt className="font-semibold">Estado</dt><dd>{listing.payload.status === 'draft' ? 'Borrador de ejemplo · solo lectura' : listing.payload.status || 'Sin definir'}</dd></div></dl>
        </article>)}</div>
      </section>
      <footer className="px-1 text-xs leading-6 text-[#56644b]">Plantilla de ejemplo {model.templateVersion} · datos de referencia: {model.asOf}. Para practicar cambios, abre la <Link className="font-semibold underline" href="/finca-demo">demostración editable guardada</Link>.</footer>
    </div>

    <AnimalDossier key={openAnimalId??'closed'} animal={dossierAnimal} records={model.records} demonstration readOnly onClose={()=>setOpenAnimalId(undefined)}/>
    <Dialog open={!!record} onOpenChange={open => { if (!open) setOpenRecordId(undefined); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle className="pr-12 text-left leading-7">{record ? cleanTitle(record.payload.title) : 'Ficha de ejemplo'}</DialogTitle><DialogDescription className="text-left">{record ? `${typeLabels[record.payload.recordType]} · ${record.payload.category} · ` : ''}Finca modelo de solo lectura</DialogDescription></DialogHeader>
        {record && <>
          <dl className="divide-y divide-[#365026]/10">{Object.entries(record.payload.data).filter(([key]) => !hiddenFields.has(key)).map(([key, value]) => <div key={key} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-4"><dt className={`text-sm font-semibold text-[#365026] ${farmMoneyDetailClass(record.payload.recordType,key)}`}>{fieldLabels[key] ?? key}</dt><dd className={`min-w-0 whitespace-pre-line break-words text-sm leading-6 text-[#56644b] ${farmMoneyDetailClass(record.payload.recordType,key)}`}>{key === "eventType" ? animalRecordEventLabel(record) : <FarmRecordValue record={record.payload} field={key} value={value} renderValue={item=>valueText(item,model.records)}/>}</dd></div>)}</dl>
          {linked.length > 0 && <section aria-label="Fichas vinculadas" className="rounded-xl bg-[#f3f6ed] p-3"><h3 className="font-semibold text-[#29442c]">Fichas vinculadas · {linked.length}</h3><div className="mt-3 flex flex-wrap gap-2">{linked.map(row => <button key={row.id} type="button" className={button} onClick={() => {if(row.payload.recordType==='animal')openAnimal(row.id);else setOpenRecordId(row.id);}}>{cleanTitle(row.payload.title)}</button>)}</div></section>}
        </>}
      </DialogContent>
    </Dialog>
  </main>;
}
