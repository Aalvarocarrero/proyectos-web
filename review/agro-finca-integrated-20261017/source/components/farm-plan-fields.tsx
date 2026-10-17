"use client";
import {FarmLocationFields} from "@/components/farm-location-fields";

import { useFarmFormSaving } from "@/components/farm-record-form";
import { propertyOutlinePoints } from "@/lib/farm-outline-view";
import { PrivateFarmLocator } from "@/components/private-farm-locator";
import {referenceFromSurveyMetadata,type GeographicReference} from "@/lib/farm-geography";
import { PolygonSketchEditor } from "@/components/polygon-sketch-editor";
import { validateSurveyVertices, type NormalizedSketchPolygon } from "@/lib/polygon-geometry";
import { createLocalId } from "@/lib/offline-db";
import { useMemo, useState, useRef } from "react";
import { Calculator, Compass, MapPinned, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  calculateSurveyMetrics,
  type SurveyPlan,
  type SurveyVertex,
} from "@/lib/farm-geometry";
import type { FarmPayload } from "@/lib/farm-types";
import { VenezuelaStateMap } from "@/components/venezuela-state-map";

const EMPTY_SURVEY_VERTICES:SurveyVertex[]=[];

type DraftVertex = { rowKey:string; id: string; easting: string; northing: string };

export function FarmPlanFields({
  disabled=false,
  areaUnit,
  onAreaUnitChange,
  boundaryShape,
  onBoundaryShapeChange,
  defaultArea,
  defaultMeasurements = {},
  defaultSurveyPlan,
  defaultPropertySketch,
  defaultGeographicReference,
}: {
  disabled?:boolean;
  areaUnit: string;
  onAreaUnitChange: (value: string) => void;
  boundaryShape: NonNullable<FarmPayload["boundaryShape"]>;
  onBoundaryShapeChange: (value: string) => void;
  defaultArea?: number;
  defaultMeasurements?: Record<string, number>;
  defaultSurveyPlan?: SurveyPlan;
  defaultPropertySketch?:NormalizedSketchPolygon|null;
  defaultGeographicReference?:GeographicReference|null;
  initiallyOpenCoordinates?: boolean;
}) {
  const referenceControl=useRef<HTMLSelectElement>(null);
  const focusReference=()=>{referenceControl.current?.scrollIntoView({block:"center",behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});referenceControl.current?.focus({preventScroll:true});};
  const formBusy=useFarmFormSaving();
  const [vertices, setVertices] = useState<DraftVertex[]>(() => {
    if (defaultSurveyPlan?.vertices?.length) {
      return defaultSurveyPlan.vertices.map((vertex) => ({
        rowKey:createLocalId("vertex"),
        id: vertex.id,
        easting: typeof vertex.easting==="number"||typeof vertex.easting==="string"?String(vertex.easting):"",
        northing: typeof vertex.northing==="number"||typeof vertex.northing==="string"?String(vertex.northing):"",
      }));
    }
    return Array.from({ length: 4 }, (_, index) => ({ rowKey:createLocalId("vertex"), id: String(index + 1), easting: "", northing: "" }));
  });
  const [declaredArea,setDeclaredArea]=useState<number|undefined>(defaultArea===undefined?undefined:defaultArea*(areaUnit==="ha"?10000:1));
  const [datum,setDatum]=useState(defaultSurveyPlan?.datum??""),[utmZone,setUtmZone]=useState(defaultSurveyPlan?.utmZone??"");
  const [geoMode,setGeoMode]=useState(defaultGeographicReference?.source??"");
  const [geoFirst,setGeoFirst]=useState(defaultGeographicReference?.source==="wgs84-point"?String(defaultGeographicReference.latitude):defaultGeographicReference?.source==="regven-utm19n-point"?String(defaultGeographicReference.easting):"");
  const [geoSecond,setGeoSecond]=useState(defaultGeographicReference?.source==="wgs84-point"?String(defaultGeographicReference.longitude):defaultGeographicReference?.source==="regven-utm19n-point"?String(defaultGeographicReference.northing):"");
  const [propertySketch,setPropertySketch]=useState<NormalizedSketchPolygon|null>(defaultPropertySketch??null);
  const [lot,setLot]=useState(defaultSurveyPlan?.lot??"1");
  const [selectedState, setSelectedState] = useState(defaultSurveyPlan?.state ?? "");

  const draftVertices = useMemo<SurveyVertex[]>(()=>{
    if(vertices.every(vertex=>!vertex.easting.trim()&&!vertex.northing.trim()))return [];
    return vertices.map(vertex=>({id:vertex.id,easting:vertex.easting.trim()?Number(vertex.easting):NaN,northing:vertex.northing.trim()?Number(vertex.northing):NaN}));
  },[vertices]);
  const checkedVertices=useMemo(()=>validateSurveyVertices(draftVertices),[draftVertices]);
  const validVertices=checkedVertices.ok?checkedVertices.vertices:EMPTY_SURVEY_VERTICES;
  const metrics = useMemo(() => calculateSurveyMetrics(checkedVertices.ok?checkedVertices.vertices:[]), [checkedVertices]);
  const polygonView=useMemo(()=>propertyOutlinePoints(checkedVertices.ok?checkedVertices.vertices:[],propertySketch),[checkedVertices,propertySketch]);
  const polygon=polygonView.points;
  const enteredCoordinates=vertices.some(vertex=>vertex.easting.trim()||vertex.northing.trim());
  const partialCoordinate=enteredCoordinates?vertices.findIndex(vertex=>!vertex.easting.trim()||!vertex.northing.trim()):-1;
  const geoReferencePreview=useMemo<GeographicReference|undefined>(()=>{
    if(geoMode==="regven-utm19n-survey")return {version:1,source:geoMode};
    if(!geoFirst.trim()||!geoSecond.trim())return undefined;
    if(geoMode==="wgs84-point")return {version:1,source:geoMode,latitude:Number(geoFirst),longitude:Number(geoSecond)};
    if(geoMode==="regven-utm19n-point")return {version:1,source:geoMode,easting:Number(geoFirst),northing:Number(geoSecond)};
    return undefined;
  },[geoMode,geoFirst,geoSecond]);
  const geoSurveyPreview=useMemo(()=>({...defaultSurveyPlan,datum,utmZone,vertices:validVertices}) as SurveyPlan,[defaultSurveyPlan,datum,utmZone,validVertices]);
  const automaticReference=referenceFromSurveyMetadata(geoSurveyPreview);
  const measurement = (name: string) => defaultMeasurements[name] || undefined;

  function updateVertex(index: number, field: keyof DraftVertex, value: string) {
    setVertices((current) => current.map((vertex, vertexIndex) => vertexIndex === index ? { ...vertex, [field]: value } : vertex));
  }

  function addVertex() {
    setVertices(current=>{
      if(current.length>=201)return current;
      let number=Math.max(0,...current.map(vertex=>/^\d{1,6}$/.test(vertex.id)?Number(vertex.id):0))+1;
      while(current.some(vertex=>vertex.id===String(number)))number++;
      const next={rowKey:createLocalId("vertex"),id:String(number),easting:"",northing:""};
      const first=current[0],last=current[current.length-1];
      const hasClosure=current.length>3&&first.easting.trim()&&first.northing.trim()&&Number(first.easting)===Number(last.easting)&&Number(first.northing)===Number(last.northing);
      return hasClosure?[...current.slice(0,-1),next,last]:[...current,next];
    });
  }

  function removeVertex(index: number) {
    setVertices((current) => current.filter((_, vertexIndex) => vertexIndex !== index));
  }

  return (
    <fieldset disabled={disabled||formBusy} className="farm-plan-fields min-w-0 max-w-full [min-inline-size:0] rounded-[1.6rem] border border-[#3e2a19]/10 bg-[#fbf8f2] p-4 sm:p-6">
      <legend className="px-2 text-sm font-bold text-[#3e2a19]">Contorno y coordenadas de la propiedad</legend>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,.72fr)]">
        <div className="min-w-0">
          <div className="grid min-w-0 gap-4">
            <label className="text-sm font-semibold">Forma del perímetro
              <Select value={boundaryShape} onValueChange={onBoundaryShapeChange}>
                <SelectTrigger className="mt-2 h-12 w-full bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>{["Irregular / polígono", "Rectángulo", "Triángulo", "Óvalo"].map((shape) => <SelectItem key={shape} value={shape}>{shape}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,.8fr)] gap-3">
              <label className="text-sm font-semibold">Superficie
                <Input
                  name="area"
                  type="number"
                  min={areaUnit==="ha"?0.0001:1}
                  step="any"
                  inputMode="decimal"
                  required={metrics.areaSqM <= 0 && boundaryShape === "Irregular / polígono"}
                  value={declaredArea===undefined?"":areaUnit==="ha"?declaredArea/10000:declaredArea}
                  onChange={event=>setDeclaredArea(event.target.value===""?undefined:Number(event.target.value)*(areaUnit==="ha"?10000:1))}
                  className="mt-2 h-12 bg-white"
                  placeholder={metrics.areaSqM > 0 ? "Si se deja vacía, usar estimación" : "Superficie declarada"}
                />
              </label>
              <label className="text-sm font-semibold">Unidad
                <Select value={areaUnit} onValueChange={onAreaUnitChange}>
                  <SelectTrigger className="mt-2 h-12 w-full bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="ha">ha</SelectItem><SelectItem value="m2">m²</SelectItem></SelectContent>
                </Select>
              </label>
            </div>
          </div>

          {declaredArea!==undefined&&metrics.areaSqM>0&&Math.abs(declaredArea-metrics.areaSqM)>.01&&<p role="status" className="mt-3 rounded-lg bg-[#fff7e8] p-3 text-xs leading-6">Se conservará la superficie que indicaste. La estimación por coordenadas es {(metrics.areaSqM/10000).toLocaleString("es-VE",{maximumFractionDigits:4})} ha y es diferente; revisa ambas antes de guardar.</p>}
          {boundaryShape === "Irregular / polígono" && <div className="mt-5">
            <details><summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold">Croquis opcional sin coordenadas geográficas</summary><PolygonSketchEditor disabled={disabled||formBusy} value={propertySketch} onChange={setPropertySketch} label="Croquis orientativo de la propiedad"/>
            <p className="mt-3 text-xs leading-6 text-[#71685f]">Este croquis permite tantos quiebres como necesites, entre 3 y 200 puntos. No representa metros ni reemplaza tus coordenadas de levantamiento.</p></details>
            <details className="mt-4"><summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold">Medidas anteriores por orientación (opcionales)</summary><p className="mb-3 text-xs">Estas referencias no definen los lados de un polígono irregular.</p><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <BoundaryInput name="northM" label="Norte (m)" value={measurement("northM")}/><BoundaryInput name="eastM" label="Este (m)" value={measurement("eastM")}/><BoundaryInput name="southM" label="Sur (m)" value={measurement("southM")}/><BoundaryInput name="westM" label="Oeste (m)" value={measurement("westM")}/>
            </div></details>
          </div>}
          {boundaryShape === "Rectángulo" && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <BoundaryInput name="northM" label="Norte (m)" value={measurement("northM")} required />
              <BoundaryInput name="eastM" label="Este (m)" value={measurement("eastM")} required />
              <BoundaryInput name="southM" label="Sur (m)" value={measurement("southM")} required />
              <BoundaryInput name="westM" label="Oeste (m)" value={measurement("westM")} required />
            </div>
          )}
          {boundaryShape === "Triángulo" && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <BoundaryInput name="baseM" label="Base (m)" value={measurement("baseM")} required />
              <BoundaryInput name="heightM" label="Altura (m)" value={measurement("heightM")} required />
              <BoundaryInput name="thirdSideM" label="Tercer lado (m)" value={measurement("thirdSideM")} />
            </div>
          )}
          {boundaryShape === "Óvalo" && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <BoundaryInput name="majorDiameterM" label="Diámetro mayor (m)" value={measurement("majorDiameterM")} required />
              <BoundaryInput name="minorDiameterM" label="Diámetro menor (m)" value={measurement("minorDiameterM")} required />
            </div>
          )}
        </div>

        <div className="min-w-0 rounded-2xl bg-[#211d1a] p-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-[.68rem] font-bold tracking-[.14em] text-[#b7d79a]">VISTA PREVIA</p><p className="mt-1 text-sm font-semibold">Poligonal de gestión</p></div>
            <Compass className="text-[#b7d79a]" size={21} />
          </div>
          <svg viewBox="0 0 100 70" className="mt-4 aspect-[100/70] w-full rounded-xl bg-[#15130f]" role="img" aria-label={polygonView.basis==="survey"?"Vista previa de coordenadas":polygonView.basis==="sketch"?"Vista previa del croquis orientativo":"Contorno pendiente"}>
            <defs><pattern id="plan-grid-preview" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M 5 0 L 0 0 0 5" fill="none" stroke="#fff" strokeOpacity=".05" strokeWidth=".25" /></pattern></defs>
            <rect width="100" height="66" fill="url(#plan-grid-preview)" />
            <polygon points={polygon.map((point) => `${point.x},${point.y}`).join(" ")} fill={polygonView.basis!=="reference"?"#4c6b3a":"none"} fillOpacity=".5" stroke="#dfeecf" strokeWidth=".7" strokeDasharray={polygonView.basis!=="reference"?undefined:"2 2"} />
            {validVertices.length >= 3 && polygon.map((point) => <g key={point.id}><circle cx={point.x} cy={point.y} r="1.2" fill="#f3ebdd" /><text x={point.x + 1.8} y={point.y - 1.5} fill="#fff" fontSize="2.6" fontWeight="700">{point.id}</text></g>)}
            {polygonView.basis==="survey"&&<g><path d="M91 16V6m0 0-2.2 3M91 6l2.2 3" stroke="#f3ebdd" strokeWidth=".7" /><text x="91" y="4.5" textAnchor="middle" fill="#f3ebdd" fontSize="3" fontWeight="700">N</text></g>}
          </svg>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <PlanMetric label="Vértices" value={String(validVertices.length)} />
            <PlanMetric label="Superficie" value={metrics.areaSqM > 0 ? `${(metrics.areaSqM / 10_000).toLocaleString("es-VE", { maximumFractionDigits: 2 })} ha` : "Pendiente"} />
            <PlanMetric label="Perímetro" value={metrics.perimeterM > 0 ? `${metrics.perimeterM.toLocaleString("es-VE", { maximumFractionDigits: 1 })} m` : "Pendiente"} />
          </div>
        </div>
      </div>

      <section className="mt-5 rounded-xl border bg-white p-4">
        <FarmLocationFields state={selectedState} onStateChange={setSelectedState} plan={defaultSurveyPlan}/>
        <label className="block text-sm font-semibold">Fuente de la ubicación privada
          <select ref={referenceControl} name="geographicReferenceMode" value={geoMode} onChange={event=>{setGeoMode(event.target.value as typeof geoMode);setGeoFirst("");setGeoSecond("");}} className="mt-2 min-h-11 w-full min-w-0 rounded-lg border bg-white px-3">
            <option value="">Selecciona y confirma el sistema de tus coordenadas</option><option value="wgs84-point">Un punto: latitud y longitud WGS84</option><option value="regven-utm19n-point">Un punto: REGVEN / UTM19N</option><option value="regven-utm19n-survey">Contorno: vértices del plano REGVEN / UTM19N</option>
          </select>
        </label>
        <p className="mt-2 text-xs leading-6">Elige el sistema indicado en tu fuente. Al confirmar la fuente, el mapa se ajusta automáticamente cuando los puntos están completos. Otros sistemas requieren una opción compatible o coordenadas WGS84; no se deducen de un croquis ni del estado. Un punto no define linderos.</p>
        {geoMode&&geoMode!=="regven-utm19n-survey"&&<div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="min-w-0 text-xs font-semibold">{geoMode==="wgs84-point"?"Latitud (grados decimales)":"Este (metros)"}<Input name="geographicFirst" type="number" step="any" value={geoFirst} onChange={event=>setGeoFirst(event.target.value)} className="mt-2 min-h-11" required/></label><label className="min-w-0 text-xs font-semibold">{geoMode==="wgs84-point"?"Longitud (grados decimales)":"Norte (metros)"}<Input name="geographicSecond" type="number" step="any" value={geoSecond} onChange={event=>setGeoSecond(event.target.value)} className="mt-2 min-h-11" required/></label></div>}
        {geoMode==="regven-utm19n-survey"&&<p className="mt-3 text-sm leading-6">Se usarán los puntos Este/Norte que registres abajo. Esta opción confirma datum REGVEN y huso19 Norte; revisa ambos datos en tu levantamiento.</p>}

      </section>
      <Accordion type="multiple" defaultValue={["coordinates"]} className="mt-5">
        <AccordionItem value="coordinates">
          <AccordionTrigger className="no-underline hover:no-underline">
            <span className="flex min-w-0 items-center gap-3"><MapPinned size={18} className="shrink-0 text-[#4c6b3a]" /><span className="min-w-0"><span className="block font-bold">Plano por coordenadas: Lote, Vértice, Este y Norte</span><span className="mt-1 block text-xs font-normal text-[#71685f]">Empieza por el vértice 1 o conserva la primera etiqueta de tu documento.</span></span></span>
          </AccordionTrigger>
          <AccordionContent forceMount>
            <p className="mb-3 text-sm leading-6">Copia Lote, Vértice, Este y Norte desde tu documento. Las coordenadas proyectadas se expresan en metros; no introduzcas aquí posiciones X/Y del croquis ni grados de latitud/longitud. Conserva las etiquetas y el orden originales. El último lado vuelve al primer vértice.</p>
            <label className="mb-4 block text-sm font-semibold">Lote del plano<Input name="planLot" value={lot} onChange={event=>setLot(event.target.value)} className="mt-2 min-h-11"/></label>
            <div className="space-y-3">{vertices.map((vertex,index)=><div key={vertex.rowKey} className="survey-coordinate-row grid min-w-0 gap-3 rounded-xl border bg-[#fbf8f2] p-3">
              <div className="min-w-0 text-xs font-semibold">Lote<p className="mt-2 min-h-11 rounded-lg border bg-white px-3 py-3 [overflow-wrap:anywhere]">{lot||"Sin indicar"}</p></div>
              <label className="min-w-0 text-xs font-semibold">Vértice<Input aria-label={`Nombre del vértice ${index+1}`} value={vertex.id} onChange={event=>updateVertex(index,"id",event.target.value)} className="mt-2 min-h-11 min-w-0 bg-white"/></label>
              <label className="min-w-0 text-xs font-semibold">Este (m)<Input aria-label={`Coordenada Este del vértice ${vertex.id}`} type="number" step="any" inputMode="decimal" value={vertex.easting} onChange={event=>updateVertex(index,"easting",event.target.value)} className="mt-2 min-h-11 min-w-0 bg-white"/></label>
              <label className="min-w-0 text-xs font-semibold">Norte (m)<Input aria-label={`Coordenada Norte del vértice ${vertex.id}`} type="number" step="any" inputMode="decimal" value={vertex.northing} onChange={event=>updateVertex(index,"northing",event.target.value)} className="mt-2 min-h-11 min-w-0 bg-white"/></label>
              <button type="button" onClick={()=>removeVertex(index)} disabled={vertices.length<=3} className="min-h-11 min-w-11 self-end rounded-full border text-[#8d372a] disabled:opacity-30" aria-label={`Eliminar vértice ${vertex.id}`}><Trash2 size={16} className="mx-auto"/></button>
            </div>)}</div>
            {partialCoordinate>=0&&<p role="status" className="my-3 text-sm text-[#8d372a]">Completa ambas coordenadas del punto {partialCoordinate+1} o elimina esa fila. No se descartará automáticamente.</p>}
            {!checkedVertices.ok&&enteredCoordinates&&<p role="status" className="my-3 text-sm text-[#8d372a]">{checkedVertices.error}</p>}
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="outline" onClick={addVertex} disabled={vertices.length >= 201} className="rounded-full border-[#3e2a19]/15"><Plus /> Agregar vértice</Button>
              <p className="flex items-start gap-2 text-xs leading-5 text-[#71685f]"><Calculator className="mt-0.5 shrink-0 text-[#4c6b3a]" size={15} /> Al completar tres o más puntos, calculamos superficie, perímetro, distancias, azimut y rumbo automáticamente.</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="technical">
          <AccordionTrigger className="no-underline hover:no-underline">
            <span className="flex items-center gap-3"><Compass size={18} className="text-[#4c6b3a]" /><span><span className="block font-bold">Ficha territorial y técnica</span><span className="mt-1 block text-xs font-normal text-[#71685f]">Campos editables equivalentes a los de un plano poligonal, sin datos del ejemplo.</span></span></span>
          </AccordionTrigger>
          <AccordionContent forceMount className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
              <VenezuelaStateMap selectedState={selectedState} onSelect={setSelectedState} compact />
              <div className="grid content-start gap-4 sm:grid-cols-2">





                <PlanInput name="planNorthBoundary" label="Colindancia norte" value={defaultSurveyPlan?.northBoundary} placeholder="Referencia o propietario colindante" />
                <PlanInput name="planEastBoundary" label="Colindancia este" value={defaultSurveyPlan?.eastBoundary} placeholder="Referencia o propietario colindante" />
                <PlanInput name="planSouthBoundary" label="Colindancia sur" value={defaultSurveyPlan?.southBoundary} placeholder="Referencia o propietario colindante" />
                <PlanInput name="planWestBoundary" label="Colindancia oeste" value={defaultSurveyPlan?.westBoundary} placeholder="Referencia o propietario colindante" />
                <label className="text-sm font-semibold">Datum del documento<Input name="planDatum" value={datum} onChange={event=>setDatum(event.target.value)} placeholder="Ej. REGVEN; deja vacío si no lo conoces" className="mt-2 min-h-11 bg-white"/></label>
                <label className="text-sm font-semibold">Huso UTM del documento<Input name="planUtmZone" value={utmZone} onChange={event=>setUtmZone(event.target.value)} placeholder="Ej. 19N" className="mt-2 min-h-11 bg-white"/></label>
                <PlanInput name="planScale" label="Escala 1:" value={defaultSurveyPlan?.scaleDenominator ? String(defaultSurveyPlan.scaleDenominator) : ""} placeholder="Ej. 2500" inputMode="numeric" />
                <PlanInput name="planProcedure" label="Tipo de procedimiento" value={defaultSurveyPlan?.procedureType} placeholder="Opcional" />
                <PlanInput name="planApplication" label="Referencia de solicitud" value={defaultSurveyPlan?.applicationReference} placeholder="Opcional" />
                <PlanInput name="planFile" label="Referencia de expediente" value={defaultSurveyPlan?.fileReference} placeholder="Opcional" />
                <PlanInput name="planStatus" label="Estado del trámite" value={defaultSurveyPlan?.status} placeholder="Opcional" />
                <label className="text-sm font-semibold">Fecha de inspección
                  <Input name="planInspectionDate" type="date" defaultValue={defaultSurveyPlan?.inspectionDate} className="mt-2 h-11 bg-white" />
                </label>
                <PlanInput name="planTechnicalResponsible" label="Responsable técnico" value={defaultSurveyPlan?.technicalResponsible} placeholder="Solo si deseas registrarlo" />
                <PlanInput name="planSource" label="Fuente de los datos" value={defaultSurveyPlan?.sourceNote ?? "Datos registrados por el usuario"} placeholder="Origen de las coordenadas o medición" />
              </div>
            </div>
            <label className="block text-sm font-semibold">Observaciones técnicas
              <Textarea name="planObservations" defaultValue={defaultSurveyPlan?.observations} className="mt-2 min-h-24 bg-white" placeholder="Accesos, linderos, servidumbres, referencias o notas de campo." />
            </label>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {geoMode===""&&automaticReference&&<button type="button" onClick={()=>setGeoMode("regven-utm19n-survey")} className="mt-4 min-h-11 rounded-full bg-[#4c6b3a] px-4 py-2 text-sm font-semibold text-white">Confirmar REGVEN / UTM19N del plano y ubicar mi finca</button>}
      <PrivateFarmLocator onConfigureReference={focusReference} reference={geoReferencePreview} surveyPlan={geoSurveyPreview}/>

      <input type="hidden" name="propertySketchJson" value={propertySketch?JSON.stringify(propertySketch):""} readOnly/>
      <input type="hidden" name="planVerticesDraftJson" value={JSON.stringify(vertices.map(({id,easting,northing})=>({id,easting,northing})))} readOnly/>
      <input type="hidden" name="planVerticesJson" value={JSON.stringify(validVertices)} readOnly />
      <input type="hidden" name="planComputedArea" value={metrics.areaSqM > 0 ? String(metrics.areaSqM) : ""} readOnly />
      <input type="hidden" name="planState" value={selectedState} readOnly />
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#edf3e7] p-4 text-xs leading-5 text-[#365026]">
        <ShieldCheck className="mt-0.5 shrink-0" size={16} />
        <p>Este plano sirve para organizar la finca. No lleva sellos oficiales y no sustituye un levantamiento topográfico, documento catastral ni certificación de un organismo competente.</p>
      </div>
    </fieldset>
  );
}

function BoundaryInput({ name, label, value, required = false }: { name: string; label: string; value?: number; required?: boolean }) {
  return <label className="text-xs font-semibold text-[#5f574f]">{label}<Input name={name} type="number" min="0" step="0.01" inputMode="decimal" required={required} defaultValue={value} className="mt-2 h-11 bg-white text-base md:text-sm" /></label>;
}

function PlanInput({ name, label, value, placeholder, inputMode }: { name: string; label: string; value?: string; placeholder?: string; inputMode?: "numeric" | "decimal" }) {
  return <label className="text-sm font-semibold">{label}<Input name={name} defaultValue={value} inputMode={inputMode} className="mt-2 h-11 bg-white" placeholder={placeholder} /></label>;
}

function PlanMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white/6 px-2 py-3"><p className="text-[.6rem] uppercase tracking-[.08em] text-white/40">{label}</p><p className="mt-1 truncate text-[.7rem] font-bold text-white">{value}</p></div>;
}
