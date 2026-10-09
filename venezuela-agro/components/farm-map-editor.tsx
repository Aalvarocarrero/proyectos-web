"use client";
import {placementAt,animalPlacementAt,type PlanPlacement,type AnimalPlanPlacement} from "@/lib/farm-tap-placement";
import {inside,edgeClearance,type Point} from "@/lib/illustrated-geometry";
import {FarmIllustratedScene} from "@/components/farm-illustrated-scene";
import {illustratedPlan} from "@/lib/illustrated-plan-adapter";
import {DemoGeographicMap} from "@/components/demo-geographic-map";
import {demoPlanAnimals} from "@/lib/demo-plan-animals";
import {aerialAreaName} from "@/lib/farm-aerial-presentation";
import {FarmAreaRecords} from "@/components/farm-area-records";
import {FARM_MAP_LAYERS,farmMapLayer} from "@/lib/farm-area-context";
import {Sheet,SheetContent,SheetHeader,SheetTitle as SheetPanelTitle,SheetDescription} from "@/components/ui/sheet";
import {FarmAreaIllustration} from "@/components/farm-area-illustration";
import {planAreaTone,planAreaLabel,planViewport} from "@/lib/farm-plan-presentation";
import {AgroCategoryIcon} from "@/components/agro-category-icon";
import { TechnicalDataTable } from "@/components/technical-data-table";

import { PrivateFarmLocator } from "@/components/private-farm-locator";
import { propertyOutlinePoints, areaOutlinePoints, formatSurveyCoordinate } from "@/lib/farm-outline-view";
import { getAreaOutline, hasCustomAreaOutline, validateSurveyVertices, type NormalizedSketchPolygon } from "@/lib/polygon-geometry";
import { PolygonSketchEditor } from "@/components/polygon-sketch-editor";
import { FarmRecordForm, FarmSaveButton } from "@/components/farm-record-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMemo, useState, useRef, useId, useEffect, useCallback, type KeyboardEvent, type PointerEvent } from "react";
import { Compass, FileText, Move, Plus, RotateCcw, Ruler, Scissors, Settings2, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  calculateSurveyMetrics,
  clampMapValue,
} from "@/lib/farm-geometry";
import type { FarmPayload, FarmRecordPayload } from "@/lib/farm-types";
type DisplayEntity<T> = {id:string;payload:T;updatedAt?:string};
import { cropNames } from "@/lib/agro-catalog";
import { VenezuelaStateMap } from "@/components/venezuela-state-map";

export const LAND_FEATURE_PRESETS = [
  { value: "Potrero", color: "#557347", shape: "Rectangular", help: "Pastoreo, rotación o descanso" },
  { value: "Cultivo", color: "#92a85b", shape: "Rectangular", help: "Lote agrícola identificado" },
  { value: "Laguna / agua", color: "#4f91a8", shape: "Ovalada", help: "Laguna, jagüey o reservorio" },
  { value: "Casa", color: "#b8754d", shape: "Rectangular", help: "Vivienda o casa principal" },
  { value: "Vaquera / corrales", color: "#815534", shape: "Rectangular", help: "Manejo de ganado" },
  { value: "Galpón", color: "#9a7659", shape: "Rectangular", help: "Aves, porcinos o resguardo" },
  { value: "Depósito", color: "#705849", shape: "Rectangular", help: "Insumos y herramientas" },
  { value: "Bosque / reserva", color: "#29442c", shape: "Irregular", help: "Protección y sombra" },
  { value: "Vías", color: "#a58a69", shape: "Rectangular", help: "Acceso y circulación" },
  { value: "Otro", color: "#7d6d5f", shape: "Irregular", help: "Uso personalizado" },
  { value: "Invernadero", color: "#7ea58b", shape: "Rectangular", help: "Cultivo bajo cubierta" },
  { value: "Tanque de agua", color: "#4f91a8", shape: "Circular", help: "Almacenamiento de agua" },
  { value: "Compostera", color: "#867348", shape: "Rectangular", help: "Preparación de materia orgánica" },
  { value: "Vivero", color: "#92a85b", shape: "Rectangular", help: "Plántulas y propagación" },
] as const;

export const CROP_PRESETS = [...cropNames, "Hortalizas", "Frutales", "Otro cultivo"];

type Layout = { x: number; y: number; width: number; height: number };
type DragState = {
  pointerId:number;
  id: string;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  boardWidth: number;
  boardHeight: number;
};
type PanState = { startClientX: number; startClientY: number; startX: number; startY: number; boardWidth: number; boardHeight: number };

export function FarmMapEditor<T extends DisplayEntity<FarmRecordPayload>>({
  workspaceOwner,
  geographicContext=true,
  demonstration=false,
  farm,
  areas,
  records=[],
  onLinkRecord,
  totalArea,
  allocatedArea,
  onAddPreset,
  onPlaceAnimal,
  onRegisterAnimal,
  onMove,
  onOutlineChange,
  onSplit,
  onDelete,
  onOpen,
  onEditPlan,
}: {
  workspaceOwner?:string;
  geographicContext?:boolean;
  demonstration?:boolean;
  farm: DisplayEntity<FarmPayload>;
  areas: Array<T>;
  records?:Array<T>;
  onLinkRecord?:(record:T,areaId:string|null)=>Promise<void>;
  totalArea: number;
  allocatedArea: number;
  onAddPreset: (preset: string,placement?:PlanPlacement) => void;
  onPlaceAnimal?:(record:T,placement:AnimalPlanPlacement,area:T)=>Promise<void>;
  onRegisterAnimal?:()=>void;
  onMove: (record: T, layout: Layout) => Promise<void>;
  onOutlineChange: (record:T,outline:NormalizedSketchPolygon)=>Promise<void>;
  onSplit: (record: T) => Promise<void>;
  onDelete: (record: T) => Promise<void>;
  onOpen: (record: T) => void;
  onEditPlan: () => void;
}) {
  const [viewMode,setViewMode]=useState("illustrated");
  const chooseView=(value:string)=>{if(contextBusy)return;cancelAreaDrag();setPanDrag(null);setContextOpen(false);setViewMode(value);if(value!=="layout")setLayoutEditing(false);};
  const [visibleLayers,setVisibleLayers]=useState<string[]>(FARM_MAP_LAYERS.map(layer=>layer.id));
  const [contextOpen,setContextOpen]=useState(false);
  const legendControls=useRef(new globalThis.Map<string,HTMLButtonElement>());
  const contextTrigger=useRef<HTMLElement|null>(null);
  const nextAction=useRef<(()=>void)|null>(null);
  const [contextBusy,setContextBusy]=useState(false);
  const illustratedControl=useRef<HTMLButtonElement|null>(null),afterAddClose=useRef<(()=>void)|null>(null);
  const selectArea=(area:T)=>{if(contextBusy)return;setSelectedId(area.id);if(!layoutEditing){const control=legendControls.current.get(area.id);contextTrigger.current=control?.getClientRects().length?control:illustratedControl.current??(document.activeElement instanceof HTMLElement?document.activeElement:null);setContextOpen(true);}};
  const openRecord=(record:T)=>{if(contextBusy)return;if(contextOpen){nextAction.current=()=>onOpen(record);setContextOpen(false);}else onOpen(record);};
  const planSurface=useRef<SVGSVGElement>(null);
  const [canvasWidth,setCanvasWidth]=useState(640);
  const planResize=useRef<ResizeObserver|null>(null);
  const measurePlan=useCallback((element:SVGSVGElement|null)=>{planResize.current?.disconnect();planSurface.current=element;if(!element)return;const observer=new ResizeObserver(()=>setCanvasWidth(element.getBoundingClientRect().width||640));planResize.current=observer;observer.observe(element);},[]);
  useEffect(()=>()=>planResize.current?.disconnect(),[]);
  const drawingId=useId().replace(/[^a-zA-Z0-9_-]/g,"");
  const [editingOutline,setEditingOutline]=useState<T|null>(null);
  const [preferSketch,setPreferSketch]=useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(areas[0]?.id ?? null);
  const [draftLayouts, setDraftLayouts] = useState<Record<string, Layout>>({});
  const dragRef=useRef<DragState|null>(null);
  const latestLayout=useRef<Layout|null>(null);
  const movePending=useRef(false);
  const [mapError,setMapError]=useState("");
  const [zoom, setZoom] = useState(1);
  const [layoutEditing,setLayoutEditing]=useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panDrag, setPanDrag] = useState<PanState | null>(null);
  const surveyVertices = useMemo(() => farm.payload.surveyPlan?.vertices ?? [], [farm.payload.surveyPlan?.vertices]);
  const surveyMetrics = useMemo(() => {const valid=validateSurveyVertices(surveyVertices);return calculateSurveyMetrics(valid.ok?valid.vertices:[]);}, [surveyVertices]);
  const boundaryView=useMemo(()=>propertyOutlinePoints(surveyVertices,farm.payload.propertySketch,preferSketch),[surveyVertices,farm.payload.propertySketch,preferSketch]);
  const boundary=boundaryView.points;
  const layoutViewport=useMemo(()=>planViewport(boundary),[boundary]);
  const boundaryPoints = boundary.map((point) => `${point.x},${point.y}`).join(" ");
  const remaining = Math.max(0, totalArea - allocatedArea);
  const selected = areas.find((area) => area.id === selectedId&&(viewMode==="illustrated"||visibleLayers.includes(farmMapLayer(area.payload.category,area.payload.title,area.payload.data)))) ?? null;
  const layoutSourceKey=JSON.stringify(areas.map((area,index)=>[area.id,readLayout(area,index,totalArea)]));
  const [receivedLayoutSource,setReceivedLayoutSource]=useState(layoutSourceKey);
  // Reconcile committed previews before painting changed source coordinates.
  if(receivedLayoutSource!==layoutSourceKey){setReceivedLayoutSource(layoutSourceKey);setDraftLayouts(current=>{let changed=false;const next={...current};for(const [id,draft] of Object.entries(current)){const index=areas.findIndex(area=>area.id===id);const saved=index>=0?readLayout(areas[index],index,totalArea):null;if(!saved||["x","y","width","height"].every(key=>Math.abs(saved[key as keyof Layout]-draft[key as keyof Layout])<.011)){delete next[id];changed=true;}}return changed?next:current;});}
  const layouts = useMemo(()=>areas.map((area, index) => ({ area, layout: draftLayouts[area.id] ?? readLayout(area, index, totalArea) })),[areas,draftLayouts,totalArea]);

  const illustrated=useMemo(()=>illustratedPlan(layouts,layoutViewport,records,demonstration),[layouts,layoutViewport,records,demonstration]);

  const [addOpen,setAddOpen]=useState(false),[placement,setPlacement]=useState<{preset?:string;animal?:T}|null>(null),[placeError,setPlaceError]=useState(''),[animalDraft,setAnimalDraft]=useState<{record:T;value:AnimalPlanPlacement;areaTitle:string;areaSnapshot:string}|null>(null),[placing,setPlacing]=useState(false);
  const placeLock=useRef(false);
  function beginPlacement(value:{preset?:string;animal?:T}){if(placing)return;placeLock.current=false;setAddOpen(false);setPlaceError('');setPlacement(value);chooseView('illustrated');}
  function placeAt(point:Point){
   if(!placement||contextBusy)return;
   if(placement.preset){const value=placementAt(point,boundary,layoutViewport);if(!value){setPlaceError('Elige un punto más adentro del contorno, con espacio para este elemento.');return;}setPlacement(null);setPlaceError('');onAddPreset(placement.preset,{...value,preferSketch});return;}
   const animal=placement.animal;if(!animal)return;if(edgeClearance(point,boundary)<.9*layoutViewport.scale){setPlaceError("Elige un punto más adentro del contorno de la finca.");return;}
   const area=[...illustrated.areas].reverse().find(a=>inside(point,a.outline));const source=layouts.find(row=>row.area.id===area?.id);
   if(!area||!source){setPlaceError('Toca dentro de un área guardada, por ejemplo un potrero o galpón.');return;}
   const value=animalPlacementAt(point,area.id,area.outline,source.layout,layoutViewport);if(!value){setPlaceError('Elige un punto un poco más adentro de esta área.');return;}
   setPlacement(null);setPlaceError('');setAnimalDraft({record:animal,value,areaTitle:area.title,areaSnapshot:JSON.stringify(source.area.payload)});
  }
  async function confirmAnimal(){if(!animalDraft||!onPlaceAnimal||placeLock.current)return;placeLock.current=true;setPlacing(true);setPlaceError('');let saved=false;try{const currentArea=areas.find(a=>a.id===animalDraft.value.areaId);if(!currentArea||JSON.stringify(currentArea.payload)!==animalDraft.areaSnapshot)throw new Error('El área cambió. Cancela y vuelve a elegir el punto.');await onPlaceAnimal(animalDraft.record,animalDraft.value,currentArea);saved=true;setAnimalDraft(null);}catch(error){const message=error instanceof Error?error.message:'';setPlaceError(message==='local_record_changed_reopen_form'?'El animal cambió. Cancela y vuelve a abrir su ubicación.':message==='local_area_changed_reopen_form'?'El área cambió. Cancela y vuelve a elegir el punto.':message==='account_changed_reopen_form'?'La cuenta cambió. Cierra esta ficha y abre tu finca de nuevo.':message.startsWith('Revisa:')||message.startsWith('El área cambió')?message:'No se pudo guardar la ubicación. El registro anterior se conserva.');}finally{if(!saved)placeLock.current=false;setPlacing(false);}}

  function beginDrag(event: PointerEvent<SVGGElement>, area: T, layout: Layout) {
    if(!event.isPrimary || event.button!==0 || dragRef.current)return;
    setSelectedId(area.id);
    if(!layoutEditing || movePending.current) return;
    const board = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!board) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    latestLayout.current=layout;
    dragRef.current={
      pointerId:event.pointerId,
      id: area.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: layout.x,
      startY: layout.y,
      boardWidth: board.width,
      boardHeight: board.height,
    };
  }

  function continueDrag(event: PointerEvent<SVGGElement>) {
    const drag=dragRef.current;
    if (!drag || drag.pointerId!==event.pointerId) return;
    const target = layouts.find((item) => item.area.id === drag.id);
    if (!target) return;
    const nextX = clampMapValue(drag.startX + ((event.clientX - drag.startClientX) / drag.boardWidth) * (100 / zoom / layoutViewport.scale), 1, 99 - target.layout.width);
    const nextY = clampMapValue(drag.startY + ((event.clientY - drag.startClientY) / drag.boardHeight) * (70 / zoom / layoutViewport.scale), 1, 69 - target.layout.height);
    const preview={...target.layout,x:nextX,y:nextY};
    latestLayout.current=preview;
    setDraftLayouts((current) => ({ ...current, [drag.id]: preview }));
  }

  function cancelAreaDrag(event?:PointerEvent<SVGGElement>) {
    const drag=dragRef.current;if(event&&drag&&event.pointerId!==drag.pointerId)return;dragRef.current=null;latestLayout.current=null;
    if(drag)setDraftLayouts(current=>{const next={...current};delete next[drag.id];return next;});
  }
  async function persistLayout(area:T,next:Layout,previous:Layout) {
    if(movePending.current)return;
    if(next.x===previous.x&&next.y===previous.y){setDraftLayouts(current=>{const clean={...current};delete clean[area.id];return clean;});return;}
    movePending.current=true;setMapError("");
    try {await onMove(area,next);} catch {setDraftLayouts(current=>{const clean={...current};delete clean[area.id];return clean;});setMapError("No se pudo confirmar el movimiento. Revisa la ubicación guardada antes de repetir.");}
    finally {movePending.current=false;}
  }
  async function finishDrag(event:PointerEvent<SVGGElement>,area: T, fallback: Layout) {
    const drag=dragRef.current;if(drag?.id!==area.id || drag.pointerId!==event.pointerId)return;
    const finalLayout=latestLayout.current??fallback;
    dragRef.current=null;latestLayout.current=null;
    await persistLayout(area,finalLayout,{...fallback,x:drag.startX,y:drag.startY});
  }

  function moveWithKeyboard(event: KeyboardEvent<SVGGElement>, area: T, layout: Layout) {
    if(!layoutEditing&&["Enter"," "].includes(event.key)){event.preventDefault();selectArea(area);return;}
    if(!layoutEditing || movePending.current)return;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const movement = moves[event.key];
    if (!movement) return;
    event.preventDefault();
    const step = event.shiftKey ? 5 : 1;
    const next = {
      ...layout,
      x: clampMapValue(layout.x + movement[0] * step, 1, 99 - layout.width),
      y: clampMapValue(layout.y + movement[1] * step, 1, 69 - layout.height),
    };
    setDraftLayouts((current) => ({ ...current, [area.id]: next }));
    void persistLayout(area, next,layout);
  }

  function beginPan(event: PointerEvent<SVGRectElement>) {
    if (!layoutEditing || zoom <= 1) return;
    const board = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!board) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setPanDrag({ startClientX: event.clientX, startClientY: event.clientY, startX: pan.x, startY: pan.y, boardWidth: board.width, boardHeight: board.height });
  }

  function continuePan(event: PointerEvent<SVGRectElement>) {
    if (!panDrag) return;
    const limitX = (zoom - 1) * 50;
    const limitY = (zoom - 1) * 35;
    setPan({
      x: clampMapValue(panDrag.startX + ((event.clientX - panDrag.startClientX) / panDrag.boardWidth) * 100, -limitX, limitX),
      y: clampMapValue(panDrag.startY + ((event.clientY - panDrag.startClientY) / panDrag.boardHeight) * 70, -limitY, limitY),
    });
  }

  function changeZoom(next: number) {
    const safe = clampMapValue(next, 1, 3);
    setZoom(safe);
    if (safe === 1) setPan({ x: 0, y: 0 });
  }

  return (
    <section>
      {(geographicContext||demonstration)&&(demonstration?<DemoGeographicMap farm={farm.payload}/>:<PrivateFarmLocator farmId={farm.id} workspaceOwner={workspaceOwner} onConfigureReference={onEditPlan} reference={farm.payload.geographicReference} surveyPlan={farm.payload.surveyPlan}/>)}
      {viewMode!=="illustrated"&&<div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-2xl">{farm.payload.name}</h2><Button variant="outline" onClick={()=>chooseView("illustrated")}>Volver a mi finca ilustrada</Button></div>}
      <Dialog open={addOpen} onOpenChange={setAddOpen}><DialogContent className="bg-[#f8f3ea]" onCloseAutoFocus={event=>{event.preventDefault();illustratedControl.current?.focus({preventScroll:true});if(afterAddClose.current){const action=afterAddClose.current;afterAddClose.current=null;action();}}}><DialogHeader><DialogTitle>¿Qué quieres añadir?</DialogTitle><DialogDescription>Elige y toca el lugar en tu plano. Después confirmarás los datos.</DialogDescription></DialogHeader><div className="grid grid-cols-2 gap-2">{LAND_FEATURE_PRESETS.map(item=><button key={item.value} type="button" className="flex min-h-14 min-w-0 items-center gap-2 rounded-xl border bg-white p-3 text-left text-sm font-semibold" onClick={()=>beginPlacement({preset:item.value})}><AgroCategoryIcon category={item.value} size={22}/><span>{item.value}</span></button>)}</div>{onPlaceAnimal&&<details className="rounded-xl border p-3"><summary className="min-h-11 cursor-pointer py-3 font-semibold">Ubicar un animal registrado</summary><p className="mb-3 text-sm">Es una ubicación que tú indicas en el croquis, no seguimiento GPS.</p>{records.filter(r=>r.payload.recordType==="animal"&&r.payload.farmId===farm.id).map(animal=><button key={animal.id} type="button" className="mb-2 flex min-h-11 w-full items-center gap-2 rounded-xl border bg-white p-3 text-left text-sm" onClick={()=>beginPlacement({animal})}><AgroCategoryIcon category={animal.payload.category}/>{animal.payload.title}</button>)}{onRegisterAnimal&&<button type="button" className="min-h-11 rounded-full border px-4 text-sm font-semibold" onClick={()=>{afterAddClose.current=onRegisterAnimal;setAddOpen(false);}}>Registrar otro animal</button>}</details>}</DialogContent></Dialog>
      <Dialog open={!!animalDraft} onOpenChange={open=>{if(!placing&&!open){setAnimalDraft(null);setPlaceError('');}}}><DialogContent className="bg-[#f8f3ea]"><DialogHeader><DialogTitle>Ubicar {animalDraft?.record.payload.title}</DialogTitle><DialogDescription>Se vinculará a {animalDraft?.areaTitle} en el punto que elegiste. No es una ubicación GPS ni un movimiento físico confirmado.</DialogDescription></DialogHeader>{placeError&&<p role="alert">{placeError}</p>}<button type="button" disabled={placing} className="button-dark" onClick={()=>void confirmAnimal()}>{placing?'Guardando…':'Guardar ubicación'}</button></DialogContent></Dialog>
      {placeError&&!animalDraft&&<p role="alert" className="mb-3 rounded-xl bg-[#fff1ed] p-3 text-sm">{placeError}</p>}
      {editingOutline&&<AreaOutlineDialog key={editingOutline.id} record={editingOutline} onClose={()=>setEditingOutline(null)} onSave={outline=>onOutlineChange(editingOutline,outline)}/>}

      <Sheet open={contextOpen&&Boolean(selected)} onOpenChange={open=>{if(!contextBusy)setContextOpen(open);}}><SheetContent side="bottom" className="max-h-[85svh] rounded-t-3xl bg-[#f8f3ea]" onCloseAutoFocus={event=>{if(contextTrigger.current?.isConnected){event.preventDefault();contextTrigger.current.focus({preventScroll:true});}if(nextAction.current){event.preventDefault();const action=nextAction.current;nextAction.current=null;action();}}}><SheetHeader><SheetPanelTitle>{selected?.payload.title??"Área"}</SheetPanelTitle><SheetDescription>Ficha del área y registros de esta finca. Los vínculos se guardan solo cuando lo indicas.</SheetDescription></SheetHeader>{selected&&<><SelectedAreaCard busy={contextBusy} area={selected} hasLinkedRecords={records.some(r=>r.payload.farmId===selected.payload.farmId&&r.payload.data.areaId===selected.id)} onOpen={()=>openRecord(selected)} onEditOutline={()=>{nextAction.current=()=>setEditingOutline(selected);setContextOpen(false);}} onSplit={()=>{if(window.confirm(`¿Dividir “${selected.payload.title}”?`)){setContextOpen(false);void onSplit(selected);}}} onDelete={()=>{if(window.confirm(`¿Eliminar “${selected.payload.title}”? Sus otros registros se conservarán.`)){setContextOpen(false);void onDelete(selected);}}}/><FarmAreaRecords key={selected.id} area={selected} records={records} onOpen={openRecord} onLink={onLinkRecord} onBusyChange={setContextBusy}/></>}</SheetContent></Sheet>
      <Tabs value={viewMode} onValueChange={chooseView} className="mt-7">
        <TabsList className={`${viewMode==="illustrated"?"hidden":"grid"} h-auto group-data-[orientation=horizontal]/tabs:h-auto w-full grid-cols-2 gap-1 rounded-2xl bg-[#e6dac8] p-1 sm:w-fit`}>
          <TabsTrigger value="illustrated" className="min-h-11 min-w-0 rounded-full px-4">Vista ilustrada</TabsTrigger><TabsTrigger value="layout" className="min-h-11 min-w-0 rounded-full px-4">Plano técnico</TabsTrigger>

          <TabsTrigger value="technical" className="min-h-11 min-w-0 rounded-full px-4">Ficha técnica</TabsTrigger>
        </TabsList>

        <TabsContent value="illustrated" className="mt-5"><FarmIllustratedScene registerPrimaryControl={node=>{illustratedControl.current=node;}} farmName={farm.payload.name} onAdd={()=>{setPlacement(null);setAddOpen(true);}} placementWithinArea={Boolean(placement?.animal)} placementLabel={placement?.preset?`Ubicar ${placement.preset}`:placement?.animal?`Ubicar ${placement.animal.payload.title}`:undefined} onPlace={placeAt} onCancelPlace={()=>{setPlacement(null);setPlaceError('');}} propertyOutline={boundary} areas={illustrated.areas} animals={illustrated.animals} selectedId={selected?.id} onSelect={id=>{const area=areas.find(row=>row.id===id);if(area)selectArea(area);}} onOpen={id=>{const area=areas.find(row=>row.id===id);if(area)openRecord(area);}} onOrganize={()=>{setPlacement(null);setPlaceError('');chooseView("layout");setLayoutEditing(true);}} assetBase="/plan-oblique" registerAreaButton={(id,node)=>{if(node)legendControls.current.set(id,node);else legendControls.current.delete(id);}}/></TabsContent>
        <TabsContent value="layout" className="mt-5"><p className="mb-3 text-sm">{boundaryView.basis==="survey"?"Contorno según coordenadas registradas.":"Croquis orientativo; las posiciones no determinan metros ni ubicación geográfica."}</p>{farm.payload.propertySketch&&surveyVertices.length>=3&&<button type="button" className="min-h-11 underline" onClick={()=>setPreferSketch(!preferSketch)}>{preferSketch?"Ver coordenadas registradas":"Ver croquis orientativo"}</button>}
          <fieldset className="mb-4 rounded-2xl border bg-white p-4"><legend className="px-2 text-sm font-bold">Capas del plano</legend><div className="flex flex-wrap gap-2">{FARM_MAP_LAYERS.map(layer=><button type="button" key={layer.id} aria-pressed={visibleLayers.includes(layer.id)} onClick={()=>{cancelAreaDrag();setContextOpen(false);setVisibleLayers(current=>current.includes(layer.id)?current.filter(id=>id!==layer.id):[...current,layer.id]);}} className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${visibleLayers.includes(layer.id)?"bg-[#365026] text-white":"bg-white text-[#3e2a19]"}`}>{layer.label} · {areas.filter(area=>farmMapLayer(area.payload.category,area.payload.title,area.payload.data)===layer.id).length}</button>)}<button type="button" disabled={visibleLayers.length===FARM_MAP_LAYERS.length} className="min-h-11 rounded-full border px-4 text-sm font-semibold disabled:opacity-60" onClick={()=>setVisibleLayers(FARM_MAP_LAYERS.map(layer=>layer.id))}>{visibleLayers.length===FARM_MAP_LAYERS.length?"Todas las capas visibles":"Mostrar todas"}</button></div><p role="status" aria-live="polite" className="mt-3 text-sm font-semibold">{visibleLayers.length} de {FARM_MAP_LAYERS.length} capas visibles · {areas.filter(area=>visibleLayers.includes(farmMapLayer(area.payload.category,area.payload.title,area.payload.data))).length} de {areas.length} áreas en el plano.</p><p className="mt-2 text-xs leading-6">Ocultar una capa solo cambia esta vista. No elimina áreas ni registros.</p></fieldset>
          {visibleLayers.length===0&&<p role="status" className="mb-4 rounded-xl bg-white p-3 text-sm">Todas las capas están ocultas. Usa Mostrar todas para volver a ver el plano.</p>}
          {mapError&&<p role="alert" className="mb-4 rounded-xl bg-[#fff1ed] p-3 text-sm">{mapError}</p>}
          <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.28fr)_minmax(17rem,.72fr)]">
            <div className="overflow-hidden rounded-[1.7rem] border border-[#3e2a19]/8 bg-[#211d1a] p-3 text-white shadow-[0_20px_60px_rgba(33,29,26,.12)] sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
                <div><p className="text-sm font-bold">{farm.payload.name}</p><p className="mt-1 text-xs text-white/45">{formatHa(totalArea)} · {areas.length} elemento{areas.length === 1 ? "" : "s"}</p></div>
                <button type="button" aria-pressed={layoutEditing} onClick={()=>{cancelAreaDrag();setLayoutEditing(!layoutEditing);setPanDrag(null);}} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/7 px-3 py-2 text-xs text-white"><Move size={15} /> {layoutEditing?"Terminar de mover":"Mover elementos del plano"}</button>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-[#3e2a19]/15 bg-[#91ae6b]">
                <div className="flex flex-wrap items-center justify-end gap-1 border-b border-[#3e2a19]/15 bg-[#211d1a] p-2">
                  <button type="button" onClick={() => changeZoom(zoom - .5)} disabled={zoom <= 1} className="flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:bg-white/10 disabled:opacity-30" aria-label="Alejar plano"><ZoomOut size={16} /></button>
                  <span className="min-w-10 text-center text-[.68rem] font-bold text-white/70">{Math.round(zoom * 100)}%</span>
                  <button type="button" onClick={() => changeZoom(zoom + .5)} disabled={zoom >= 3} className="flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:bg-white/10 disabled:opacity-30" aria-label="Acercar plano"><ZoomIn size={16} /></button>
                  <button type="button" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:bg-white/10" aria-label="Restablecer vista"><RotateCcw size={15} /></button>
                </div>
                <svg ref={measurePlan} viewBox="0 0 100 70" style={{touchAction:layoutEditing?"none":"pan-y"}} className="aspect-[10/7] w-full select-none" role="group" aria-label="Plano interactivo de la finca; números vinculados a la leyenda">
                  <defs>
                    <pattern id={`${drawingId}-grid`} width="5" height="5" patternUnits="userSpaceOnUse"><path d="M 5 0 L 0 0 0 5" fill="none" stroke="#6b745c" strokeOpacity=".10" strokeWidth=".22" /></pattern>
                    <clipPath id={`${drawingId}-boundary`}><polygon points={boundaryPoints} /></clipPath>
                  </defs>
                  <rect width="100" height="70" fill="#91ae6b" />
                  <rect width="100" height="70" fill="transparent" className={zoom > 1 ? "cursor-move" : undefined} onPointerDown={beginPan} onPointerMove={continuePan} onPointerUp={() => setPanDrag(null)} onPointerCancel={() => setPanDrag(null)} />
                  <g transform={`translate(${pan.x} ${pan.y}) translate(${50 * (1 - zoom)} ${35 * (1 - zoom)}) scale(${zoom})`}>
                  <polygon points={boundaryPoints} fill="#a3bd78" stroke="#667259" strokeWidth={2} vectorEffect="non-scaling-stroke" pointerEvents="none" />
                  <g transform={`translate(${layoutViewport.x} ${layoutViewport.y}) scale(${layoutViewport.scale})`}>
                    {layouts.map(({ area, layout },index) => {
                      if(!visibleLayers.includes(farmMapLayer(area.payload.category,area.payload.title,area.payload.data)))return null;
                      const isSelected = area.id === selected?.id;
                      const outline=getAreaOutline(area.payload.data);
                      const label=planAreaLabel(layout.width,layout.height,index,Boolean(outline),canvasWidth/100*zoom*layoutViewport.scale);
                      const tone=planAreaTone(area.payload.category);
                      const clipId=`${drawingId}-area-${index}`;
                      const outlineVertices=outline?areaOutlinePoints(outline,layout):undefined;
                      const outlinePoints=outlineVertices?outlineVertices.map(p=>`${p.x},${p.y}`).join(" "):null;
                      const isWater = ["Laguna / agua", "Agua"].includes(area.payload.category);
                      const detailPixels=canvasWidth/100*zoom*layoutViewport.scale;
                      const areaName=aerialAreaName(area.payload.title,layout.width,layout.height,detailPixels,Boolean(outline),area.payload.category);
                      const nameLines=areaName?.split('\n')??[],nameWidth=Math.min(layout.width-8/detailPixels,(Math.max(0,...nameLines.map(line=>line.length))*6.5+10)/detailPixels);
                      const nameX=isWater?layout.x+(layout.width-nameWidth)/2:layout.x+4/detailPixels;
                      const nameY=isWater?layout.y+layout.height/2-8.5/detailPixels:layout.y+layout.height-(nameLines.length*17+4)/detailPixels;
                      return (
                        <g
                          key={area.id}
                          role="button"
                          tabIndex={0}
                          aria-label={layoutEditing?`Mover ${area.payload.title}. Usa las flechas del teclado para ajustar.`:`Seleccionar ${area.payload.title}. Activa Mover elementos para ajustar.`}
                          className="cursor-grab outline-none focus-visible:[filter:drop-shadow(0_0_2px_#fff)] active:cursor-grabbing"
                          onPointerDown={(event) => beginDrag(event, area, layout)}
                          onPointerMove={continueDrag}
                          onPointerUp={(event) => void finishDrag(event,area, layout)}
                          onPointerCancel={cancelAreaDrag}
                          onLostPointerCapture={cancelAreaDrag}
                          onKeyDown={(event) => moveWithKeyboard(event, area, layout)}
                          onClick={() => selectArea(area)}
                        >
                          <title>{`${index+1}. ${area.payload.title} · ${area.payload.category}`}</title>
                          <defs><clipPath id={clipId}>{outlinePoints?<polygon points={outlinePoints}/>:isWater?<ellipse cx={layout.x+layout.width/2} cy={layout.y+layout.height/2} rx={layout.width/2} ry={layout.height/2}/>:<rect x={layout.x} y={layout.y} width={layout.width} height={layout.height} rx={.6}/>}</clipPath></defs>
                          {outlinePoints?<polygon points={outlinePoints} fill={tone} stroke={isSelected?"#3e2a19":"#87927d"} strokeWidth={isSelected?2.2:1.2} vectorEffect="non-scaling-stroke"/>:isWater?<ellipse cx={layout.x+layout.width/2} cy={layout.y+layout.height/2} rx={layout.width/2} ry={layout.height/2} fill={tone} stroke={isSelected?"#3e2a19":"#87927d"} strokeWidth={isSelected?2.2:1.2} vectorEffect="non-scaling-stroke"/>:<rect x={layout.x} y={layout.y} width={layout.width} height={layout.height} rx={.6} fill={tone} stroke={isSelected?"#3e2a19":"#87927d"} strokeWidth={isSelected?2.2:1.2} vectorEffect="non-scaling-stroke"/>}
                          <g clipPath={`url(#${clipId})`} pointerEvents="none">
                           <FarmAreaIllustration recordId={area.id} data={area.payload.data} outlineVertices={outlineVertices} category={area.payload.category} title={area.payload.title} x={layout.x} y={layout.y} width={layout.width} height={layout.height} pixelsPerUnit={canvasWidth/100*zoom*layoutViewport.scale}/>
                           {demoPlanAnimals(demonstration,area,records,layout,detailPixels,outlineVertices).map(animal=><g key={animal.id} aria-label={`${animal.title}: posición indicada en el croquis`}>{animal.src?<image href={animal.src} x={animal.x} y={animal.y} width={animal.size} height={animal.size} preserveAspectRatio="xMidYMid meet"/>:<g transform={`translate(${animal.x},${animal.y})`}><AgroCategoryIcon category={animal.category} size={animal.size}/></g>}</g>)}
                           {areaName&&<g><rect x={nameX} y={nameY} width={nameWidth} height={nameLines.length*17/detailPixels} rx={3/detailPixels} fill="#fffff3" fillOpacity=".94"/><text x={isWater?layout.x+layout.width/2:nameX+5/detailPixels} y={nameY+12/detailPixels} textAnchor={isWater?"middle":undefined} fontSize={11/detailPixels} fontWeight="600" fill="#294024">{nameLines.map((line,index)=><tspan key={index} x={isWater?layout.x+layout.width/2:nameX+5/detailPixels} dy={index?17/detailPixels:0}>{line}</tspan>)}</text></g>}
                           {!areaName&&label.show&&layout.width*canvasWidth/100*zoom*layoutViewport.scale>=34&&layout.height*canvasWidth/100*zoom*layoutViewport.scale>=28&&<g><rect x={layout.x+layout.width/2-label.fontSize*(label.label.length*.38+.5)} y={layout.y+layout.height/2-label.fontSize*.7} width={label.fontSize*(label.label.length*.76+1)} height={label.fontSize*1.4} rx={label.fontSize*.35} fill="#fbf8ef" fillOpacity=".94"/><text x={layout.x+layout.width/2} y={layout.y+layout.height/2+label.fontSize*.35} textAnchor="middle" fill="#33412f" fontSize={label.fontSize} fontWeight="700">{label.label}</text></g>}
                          </g>
                        </g>
                      );
                    })}
                  </g>
                  {surveyVertices.length >= 3 && boundary.map((point) => <g key={point.id}><circle cx={point.x} cy={point.y} r=".8" fill="#667259" /><text x={point.x + 1.3} y={point.y - 1.2} fill="#33412f" fontSize="2.2" fontWeight="700">{point.id}</text></g>)}
                  </g>
                  {boundaryView.basis==="survey"&&<g aria-hidden="true"><path d="M92 15V6m0 0-2 3M92 6l2 3" stroke="#33412f" strokeWidth=".65" /><text x="92" y="4.5" textAnchor="middle" fill="#33412f" fontSize="2.8" fontWeight="700">N</text></g>}

                </svg>
                {!areas.length && <p className="p-4 text-center text-sm leading-6 text-white/80">Base verde ilustrativa. Agrega tu primer potrero, cultivo, laguna o instalación para organizar el plano.</p>}
              </div>
              <p className="mt-3 text-xs leading-6 text-white/70">Representación cenital orientativa, sin escala métrica. Vegetación y materiales ilustran el uso registrado; no indican cantidades, ocupación ni instalaciones verificadas. La base verde es ilustrativa. {demonstration?"Los animales visibles son registros del ejemplo con posiciones ficticias expresas.":"Los vínculos de registros no indican una posición física de animales."} Distribución ajustada proporcionalmente a la vista del contorno; no representa coordenadas de cada área. Los números enlazan con la leyenda. Las formas y posiciones guardadas se conservan.</p>
              <nav aria-label="Leyenda y selección de áreas" className="mt-3 grid gap-2 sm:grid-cols-2">{layouts.map(({area},index)=>visibleLayers.includes(farmMapLayer(area.payload.category,area.payload.title,area.payload.data))?<button type="button" ref={element=>{if(element)legendControls.current.set(area.id,element);else legendControls.current.delete(area.id);}} key={area.id} aria-pressed={area.id===selected?.id} onClick={()=>selectArea(area)} className={`flex min-h-11 min-w-0 items-center gap-3 rounded-xl border p-3 text-left ${area.id===selected?.id?"border-[#d6dfc9] bg-white/15":"border-white/15 bg-white/5"}`}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[#33412f]" style={{backgroundColor:planAreaTone(area.payload.category)}}>{index+1}</span><AgroCategoryIcon category={area.payload.category} size={18} className="shrink-0"/><span className="min-w-0 text-xs leading-5"><strong className="block break-words">{area.payload.title}</strong><span className="text-white/65">{area.payload.category} · {formatHa(Number(area.payload.data.areaSqM??0))}</span></span></button>:null)}</nav>
              <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                <DarkMetric label="Área total" value={formatHa(totalArea)} />
                <DarkMetric label="Distribuida" value={formatHa(allocatedArea)} />
                <DarkMetric label="Disponible" value={formatHa(remaining)} />
              </div>
              <p className="mt-4 px-1 text-xs leading-5 text-white/42">La ubicación interna es una herramienta de planificación. Ajusta los puntos con un levantamiento verificado antes de usar el plano para decisiones legales o de obra.</p>
            </div>

            <aside className="space-y-4">
              <div className="rounded-[1.6rem] border border-[#3e2a19]/8 bg-white p-5">
                <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold tracking-[.12em] text-[#4c6b3a]">AGREGAR</p><h2 className="mt-1 text-base font-bold">Elementos de la finca</h2></div><Plus size={20} className="text-[#4c6b3a]" /></div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {LAND_FEATURE_PRESETS.map((preset) => (
                    <button key={preset.value} type="button" onClick={() => onAddPreset(preset.value)} className="min-h-20 rounded-2xl border border-[#3e2a19]/8 bg-[#fbf8f2] p-3 text-left transition hover:-translate-y-0.5 hover:border-[#4c6b3a]/30 active:scale-[.98]">
                      <AgroCategoryIcon category={preset.value}/><span className="mt-2 block text-xs font-bold leading-4">{preset.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="hidden md:block">{selected ? (<>
                <SelectedAreaCard
                  busy={contextBusy}
                  area={selected}
                  hasLinkedRecords={records.some(r=>r.payload.farmId===selected.payload.farmId&&r.payload.data.areaId===selected.id)}
                  onOpen={() => openRecord(selected)}
                  onEditOutline={()=>setEditingOutline(selected)}
                  onSplit={() => {
                    if (window.confirm(`¿Dividir “${selected.payload.title}” en dos áreas iguales?`)) void onSplit(selected);
                  }}
                  onDelete={() => {
                    if (window.confirm(`¿Eliminar “${selected.payload.title}” del plano?`)) void onDelete(selected);
                  }}
                />
                <FarmAreaRecords key={selected.id} area={selected} records={records} onOpen={openRecord} onLink={onLinkRecord} onBusyChange={setContextBusy}/>
              </>) : (
                <div className="rounded-[1.6rem] border border-dashed border-[#3e2a19]/18 p-6 text-sm leading-6 text-[#71685f]"><Move className="mb-4 text-[#4c6b3a]" size={23} />Toca un elemento del plano para abrir sus datos, dividirlo o eliminarlo.</div>
              )}</div>
              {selected&&<button type="button" className="button-dark w-full md:hidden" onClick={event=>{contextTrigger.current=event.currentTarget;setContextOpen(true);}}>Ver ficha de {selected.payload.title}</button>}
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="technical" className="mt-5">
          <TechnicalPlanSheet geographicContext={geographicContext} farm={farm} metrics={surveyMetrics} onEdit={onEditPlan} />
        </TabsContent>
      </Tabs>
    </section>
  );
}

function TechnicalPlanSheet({ farm, metrics, onEdit,geographicContext }: { geographicContext:boolean; farm: DisplayEntity<FarmPayload>; metrics: ReturnType<typeof calculateSurveyMetrics>; onEdit: () => void }) {
  const plan = farm.payload.surveyPlan;
  const vertices = plan?.vertices ?? [];
  const checked=validateSurveyVertices(vertices);
  const technicalOutline=propertyOutlinePoints(checked.ok?checked.vertices:[],farm.payload.propertySketch);
  return (
    <div className="technical-plan-sheet min-w-0 max-w-full overflow-hidden rounded-[1.7rem] border border-[#3e2a19]/15 bg-white shadow-[0_18px_55px_rgba(62,42,25,.06)]">
      <div className="grid min-w-0 border-b-2 border-[#3e2a19] lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-xs font-bold tracking-[.18em] text-[#4c6b3a]">PLANO TÉCNICO DE GESTIÓN</p><h2 className="font-display mt-2 text-4xl">{farm.payload.name}</h2><p className="mt-2 text-sm text-[#71685f]">{territorialLocation(plan) || farm.payload.location || "Ubicación pendiente"}</p></div>
            <Button type="button" variant="outline" onClick={onEdit} className="rounded-full border-[#3e2a19]/15"><Settings2 /> Editar datos</Button>
          </div>
          <div className="mt-8 rounded-2xl border-2 border-[#3e2a19] bg-[#f7f2e8] p-4">
            <svg viewBox="0 0 100 70" className="aspect-[100/70] w-full" role="img" aria-label="Poligonal técnica de la propiedad">
              <defs><pattern id="technical-grid" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M 5 0 L 0 0 0 5" fill="none" stroke="#3e2a19" strokeOpacity=".08" strokeWidth=".2" /></pattern></defs>
              <rect width="100" height="70" fill="url(#technical-grid)" />
              <polygon points={technicalOutline.points.map((point) => `${point.x},${point.y}`).join(" ")} fill="#dfe9d5" stroke="#211d1a" strokeWidth=".75" strokeDasharray={vertices.length >= 3 ? undefined : "2 2"} />
              {vertices.length >= 3 && technicalOutline.points.map((point) => <g key={point.id}><circle cx={point.x} cy={point.y} r=".85" fill="#211d1a" /><text x={point.x + 1.4} y={point.y - 1.1} fill="#211d1a" fontSize="2.4" fontWeight="700">{point.id}</text></g>)}
              {technicalOutline.basis==="survey"&&<g><path d="M91 15V6m0 0-2 3M91 6l2 3" stroke="#211d1a" strokeWidth=".65" /><text x="91" y="4.5" textAnchor="middle" fill="#211d1a" fontSize="2.8" fontWeight="700">N</text></g>}
            </svg>
          </div>
        </div>
        <div className="border-t-2 border-[#3e2a19] bg-[#fbf8f2] p-5 lg:border-l-2 lg:border-t-0">
          <SheetTitle>Ubicación territorial</SheetTitle>
          <SheetRow label="Estado" value={plan?.state} />
          <SheetRow label="Municipio" value={plan?.municipality} />
          <SheetRow label="Parroquia" value={plan?.parish} />
          <SheetRow label="Sector" value={plan?.sector} />
          <SheetTitle className="mt-5">Datos técnicos</SheetTitle>
          <SheetRow label="Superficie" value={formatHa(farm.payload.areaSqM)} />
          <SheetRow label="Perímetro" value={metrics.perimeterM ? `${metrics.perimeterM.toLocaleString("es-VE", { maximumFractionDigits: 2 })} m` : undefined} />
          <SheetRow label="Datum" value={plan?.datum} />
          <SheetRow label="Huso UTM" value={plan?.utmZone} />
          <SheetRow label="Escala" value={plan?.scaleDenominator ? `1:${plan.scaleDenominator.toLocaleString("es-VE")}` : undefined} />
          <SheetRow label="Fecha de inspección" value={plan?.inspectionDate} />
          <SheetRow label="Responsable técnico" value={plan?.technicalResponsible} />
          <SheetRow label="Fuente" value={plan?.sourceNote} />
        </div>
      </div>

      <div className="grid min-w-0 border-b border-[#3e2a19]/15 bg-white lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="border-b border-[#3e2a19]/15 p-5 lg:border-b-0 lg:border-r">{geographicContext?<VenezuelaStateMap selectedState={plan?.state} compact />:<p className="text-sm">Ubicación geográfica sin definir en la demostración.</p>}</div>
        <div className="p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-[#4c6b3a]">Referencias del documento</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <LightMetric label="Lote" value={plan?.lot || "Pendiente"} />
            <LightMetric label="Procedimiento" value={plan?.procedureType || "Pendiente"} />
            <LightMetric label="Solicitud" value={plan?.applicationReference || "Pendiente"} />
            <LightMetric label="Expediente" value={plan?.fileReference || "Pendiente"} />
          </div>
          <p className="mt-4 text-xs leading-5 text-[#71685f]">El estado seleccionado se resalta automáticamente en negro. El mapa queda incluido en la copia offline del dispositivo.</p>
        </div>
      </div>

      <div className="grid min-w-0 lg:grid-cols-2">
        <div className="border-b border-[#3e2a19]/15 p-5 sm:p-7 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2"><Compass size={18} className="text-[#4c6b3a]" /><h3 className="text-sm font-bold uppercase tracking-[.12em]">Puntos de coordenadas</h3></div>
          <TechnicalDataTable label="Puntos de coordenadas" columns={["Lote","Vértice","Este","Norte"]} rows={vertices.map((vertex,index)=>({id:`${vertex.id}-${index}`,cells:[plan?.lot||"1",vertex.id,formatSurveyCoordinate(vertex.easting),formatSurveyCoordinate(vertex.northing)]}))} empty="Aún no se han registrado coordenadas."/>
        </div>
        <div className="p-5 sm:p-7">
          <div className="flex items-center gap-2"><Ruler size={18} className="text-[#4c6b3a]" /><h3 className="text-sm font-bold uppercase tracking-[.12em]">Distancias y rumbos</h3></div>
          <TechnicalDataTable label="Distancias y rumbos" columns={["Tramo","Distancia","Azimut","Rumbo"]} rows={metrics.segments.map((segment,index)=>({id:`${segment.from}-${segment.to}-${index}`,cells:[`${segment.from} → ${segment.to}`,`${segment.distanceM.toLocaleString("es-VE",{maximumFractionDigits:2})} m`,`${segment.azimuthDeg.toFixed(2)}°`,segment.bearing]}))} empty="Se calcularán al completar tres vértices."/>
        </div>
      </div>

      <div className="border-t border-[#3e2a19]/15 bg-white p-5 sm:p-7">
        <div className="flex items-center gap-2"><Compass size={18} className="text-[#4c6b3a]" /><h3 className="text-sm font-bold uppercase tracking-[.12em]">Colindancias cardinales</h3></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <LightMetric label="Norte" value={plan?.northBoundary || "Pendiente"} />
          <LightMetric label="Este" value={plan?.eastBoundary || "Pendiente"} />
          <LightMetric label="Sur" value={plan?.southBoundary || "Pendiente"} />
          <LightMetric label="Oeste" value={plan?.westBoundary || "Pendiente"} />
        </div>
      </div>

      {!checked.ok&&vertices.length>0&&<p className="m-5 rounded-lg bg-[#fff7e8] p-3 text-sm">Coordenadas anteriores conservadas: {checked.error} Revisa los datos antes de usar medidas calculadas.</p>}
      <div className="grid min-w-0 gap-4 border-t border-[#3e2a19]/15 bg-[#fbf8f2] p-5 sm:grid-cols-[1fr_auto] sm:items-start sm:p-7">
        <div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#4c6b3a]">Observaciones</p><p className="mt-2 text-sm leading-6 text-[#5f574f]">{plan?.observations || "Sin observaciones técnicas registradas."}</p></div>
        <div className="max-w-md rounded-xl border border-[#875d2c]/18 bg-[#fff7e8] p-4 text-xs leading-5 text-[#6b4a2f]"><FileText className="mb-2" size={17} />Documento de gestión interna. No sustituye un plano catastral, levantamiento topográfico ni certificación oficial.</div>
      </div>
      <footer className="flex flex-col gap-1 border-t-2 border-[#3e2a19] bg-[#211d1a] px-5 py-3 text-[.62rem] uppercase tracking-[.1em] text-white/60 sm:flex-row sm:items-center sm:justify-between"><span>Hoja digital 1/1 · Fuente: {plan?.sourceNote || (geographicContext?"datos del usuario":"datos ficticios de demostración")}</span><span>Actualizado {farm.updatedAt ? new Intl.DateTimeFormat("es-VE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(farm.updatedAt)) : "sin fecha registrada"}</span></footer>
    </div>
  );
}

function SelectedAreaCard({ area, onOpen, onSplit, onDelete, onEditOutline,hasLinkedRecords=false,busy=false }: {busy?:boolean;hasLinkedRecords?:boolean; onEditOutline:()=>void; area: DisplayEntity<FarmRecordPayload>; onOpen: () => void; onSplit: () => void; onDelete: () => void }) {
  const preset = featurePresetFor(area.payload.category);
  return (
    <div className="rounded-[1.6rem] border border-[#3e2a19]/8 bg-white p-5">
      <div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: `${preset.color}22` }}><AgroCategoryIcon category={preset.value}/></span><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[.1em] text-[#4c6b3a]">Seleccionado</p><h2 className="mt-1 truncate text-base font-bold">{area.payload.title}</h2><p className="mt-1 text-xs text-[#71685f]">{area.payload.category}{area.payload.data.crop ? ` · ${String(area.payload.data.crop)}` : ""}</p></div></div>
      <div className="mt-4 grid grid-cols-2 gap-2"><LightMetric label="Superficie" value={formatHa(Number(area.payload.data.areaSqM ?? 0))} /><LightMetric label="Forma" value={String(area.payload.data.shape || "Irregular")} /></div>
      <Button type="button" variant="outline" onClick={onEditOutline} disabled={busy} className="mt-4 w-full rounded-full border-[#3e2a19]/15">Editar contorno</Button>
      <Button type="button" variant="outline" onClick={onOpen} disabled={busy} className="mt-4 w-full rounded-full border-[#3e2a19]/15"><FileText /> Abrir ficha</Button>
      <p className="mt-2 text-xs text-[#6e6256]">{hasLinkedRecords?"Revisa y retira los vínculos de los registros antes de dividir. No se asignarán automáticamente a una mitad.":hasCustomAreaOutline(area.payload.data)?"La división automática está desactivada para contornos personalizados: no se duplicará el mismo polígono en dos áreas.":"La división conserva la superficie total. En una cuenta requiere conexión y cambios sincronizados; en el espacio local se guarda solo en este dispositivo."}</p><div className="mt-2 grid grid-cols-2 gap-2"><Button type="button" variant="outline" onClick={onSplit} disabled={busy||hasCustomAreaOutline(area.payload.data)||hasLinkedRecords} className="rounded-full border-[#3e2a19]/15"><Scissors /> Dividir</Button><Button type="button" variant="outline" onClick={onDelete} disabled={busy} className="rounded-full border-[#b42318]/20 text-[#9a2f24]"><Trash2 /> Eliminar</Button></div>
    </div>
  );
}

export function readLayout(area: DisplayEntity<FarmRecordPayload>, index: number, totalArea: number): Layout {
  const areaSqM = Math.max(1, Number(area.payload.data.areaSqM ?? 1));
  const relative = totalArea > 0 ? Math.sqrt(areaSqM / totalArea) : .2;
  const width = clampMapValue(Number(area.payload.data.mapWidth) || relative * 52, 8, 44);
  const height = clampMapValue(Number(area.payload.data.mapHeight) || width * (["Laguna / agua", "Agua"].includes(area.payload.category) ? .68 : .62), 5, 31);
  const defaultX = 9 + (index % 4) * 20;
  const defaultY = 9 + (Math.floor(index / 4) % 3) * 18;
  return {
    x: clampMapValue(Number(area.payload.data.mapX) || defaultX, 1, 99 - width),
    y: clampMapValue(Number(area.payload.data.mapY) || defaultY, 1, 69 - height),
    width,
    height,
  };
}

function featurePresetFor(category: string) {
  if (category === "Siembra") return LAND_FEATURE_PRESETS[1];
  if (category === "Agua") return LAND_FEATURE_PRESETS[2];
  if (category === "Instalaciones") return LAND_FEATURE_PRESETS[4];
  return LAND_FEATURE_PRESETS.find((preset) => preset.value === category) ?? LAND_FEATURE_PRESETS[9];
}

function territorialLocation(plan?: FarmPayload["surveyPlan"]): string {
  return [plan?.sector, plan?.parish, plan?.municipality, plan?.state].filter(Boolean).join(" · ");
}

function SheetTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`border-2 border-[#3e2a19] bg-[#e9ddca] px-3 py-2 text-[.68rem] font-bold uppercase tracking-[.14em] ${className}`}>{children}</p>;
}

function SheetRow({ label, value }: { label: string; value?: string }) {
  return <div className="grid min-w-0 grid-cols-[6.5rem_minmax(0,1fr)] border-x-2 border-b border-[#3e2a19] text-xs sm:grid-cols-[7.7rem_minmax(0,1fr)]"><span className="bg-white px-3 py-2 font-bold">{label}</span><span className="min-w-0 break-words border-l border-[#3e2a19] px-3 py-2">{value || "Pendiente"}</span></div>;
}

function DarkMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white/6 p-3 sm:p-4"><p className="text-[.62rem] uppercase tracking-[.08em] text-white/40">{label}</p><p className="mt-2 truncate text-xs font-bold sm:text-sm">{value}</p></div>;
}

function LightMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-[#f3ebdd] p-3"><p className="text-[.62rem] uppercase tracking-[.08em] text-[#837a71]">{label}</p><p className="mt-1 text-xs font-bold [overflow-wrap:anywhere]">{value}</p></div>;
}

function formatHa(squareMetres: number): string {
  return squareMetres>0&&squareMetres<100?`${squareMetres.toLocaleString("es-VE",{maximumFractionDigits:4})} m²`:`${(squareMetres / 10_000).toLocaleString("es-VE", { maximumFractionDigits: 2 })} ha`;
}



function AreaOutlineDialog({record,onClose,onSave}:{record:DisplayEntity<FarmRecordPayload>;onClose:()=>void;onSave:(outline:NormalizedSketchPolygon)=>Promise<void>}){
 const [value,setValue]=useState<NormalizedSketchPolygon|null>(()=>getAreaOutline(record.payload.data)??{version:1,coordinateSpace:"normalized-100",vertices:[{id:"p1",x:10,y:10},{id:"p2",x:90,y:10},{id:"p3",x:90,y:90},{id:"p4",x:10,y:90}]});
 const [saving,setSaving]=useState(false);
 const savingRef=useRef(false);
 return <Dialog open onOpenChange={open=>{if(!open&&!savingRef.current)onClose();}}><DialogContent className="max-h-[90svh] overflow-y-auto bg-[#f8f3ea] sm:max-w-3xl"><DialogHeader><DialogTitle>Contorno de {record.payload.title}</DialogTitle><DialogDescription>Cambia el croquis sin modificar la superficie declarada ni las coordenadas de la propiedad.</DialogDescription></DialogHeader><FarmRecordForm onSubmit={async()=>{if(!value)throw new Error("Revisa: dibuja al menos tres puntos.");savingRef.current=true;setSaving(true);try{await onSave(value);onClose();}finally{savingRef.current=false;setSaving(false);}}}><PolygonSketchEditor value={value} onChange={setValue} disabled={saving}/><FarmSaveButton className="rounded-full bg-[#3e2a19] text-white">Guardar contorno</FarmSaveButton></FarmRecordForm></DialogContent></Dialog>;
}
