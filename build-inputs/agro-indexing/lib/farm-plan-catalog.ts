import {edgeClearance, interiorSlots, type Point} from './illustrated-geometry';
import type {PlanPlacement} from './farm-tap-placement';

/** Closed presentation catalog. These kinds are never stored instead of farm records. */
export type CropModelKind = 'tomato' | 'maize' | 'onion' | 'cilantro' | 'parsley' | 'soy';
export type StructureModelKind = 'house' | 'barn' | 'vaquera' | 'fence' | 'gate';
export type PlanCatalogSelection = Readonly<{crop?: CropModelKind}>;

export const PLAN_CROP_CATALOG: ReadonlyArray<Readonly<{
  kind: CropModelKind; label: string; detail: string; silhouette: string; visualHeight: number;
}>> = [
  {kind:'tomato',label:'Tomate',detail:'Ramas, hojas compuestas y frutos rojos',silhouette:'branched-fruiting',visualHeight:1.1},
  {kind:'maize',label:'Maíz',detail:'Tallo alto, hojas largas y espiga',silhouette:'upright-blades-tassel',visualHeight:1.85},
  {kind:'onion',label:'Cebolla',detail:'Bulbo y hojas tubulares',silhouette:'bulb-tubular-leaves',visualHeight:.95},
  {kind:'cilantro',label:'Cilantro',detail:'Mata abierta de hojas lobuladas',silhouette:'open-lobed-leaves',visualHeight:.64},
  {kind:'parsley',label:'Perejil',detail:'Mata baja de follaje rizado',silhouette:'compact-curled-leaves',visualHeight:.48},
  {kind:'soy',label:'Soya',detail:'Hojas de tres folíolos y vainas',silhouette:'trifoliate-pods',visualHeight:.9},
];

const normalize = (value: unknown) => typeof value === 'string'
  ? value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toLowerCase() : '';

/** Read only an explicit crop field: names of areas never establish botanical identity. */
export function cropModelKind(crop: unknown): CropModelKind | undefined {
  const value = normalize(crop);
  if (/^tomates?$/.test(value)) return 'tomato';
  if (/^maiz(?: blanco| amarillo| dulce)?$/.test(value)) return 'maize';
  if (/^cebolla(?: blanca| morada| roja| amarilla)?$/.test(value)) return 'onion';
  if (/^(cilantro|coriandro)$/.test(value)) return 'cilantro';
  if (/^perejil(?: rizado| liso)?$/.test(value)) return 'parsley';
  if (/^(soya|soja|soy|soybean)$/.test(value)) return 'soy';
  return undefined;
}

export function cropCatalogEntry(kind: CropModelKind) {
  const entry = PLAN_CROP_CATALOG.find(item => item.kind === kind);
  if (!entry) throw new Error('Unknown crop presentation kind');
  return entry;
}

/** Only the selected crop label enters the existing data.crop field. */
export function catalogCropLabel(selection?: PlanCatalogSelection): string | undefined {
  return selection?.crop ? cropCatalogEntry(selection.crop).label : undefined;
}

/** The explicit category wins; custom usage describes records categorized as Otro. */
export function structureModelKind(category: unknown, usage?: unknown): StructureModelKind | undefined {
  const categoryValue = normalize(category);
  const value = categoryValue === 'otro' || !categoryValue ? normalize(usage) : categoryValue;
  if (/^(casa|vivienda|casa principal)$/.test(value)) return 'house';
  if (/^(galpon|deposito)$/.test(value)) return 'barn';
  if (/^(vaquera|vaquera \/ corrales|vaquera\/corrales|establo)$/.test(value)) return 'vaquera';
  if (/^(cerca|cercas|cercado)$/.test(value)) return 'fence';
  if (/^(porton|portones|puerta de acceso)$/.test(value)) return 'gate';
  return undefined;
}

/** Declared measurements are labels, never a conversion from this dimensionless sketch. */
export function declaredPlanDimensions(data: Record<string, unknown>) {
  const dimensions: {lengthM?: number; widthM?: number; diameterM?: number} = {};
  for (const key of ['lengthM','widthM','diameterM'] as const) {
    const value = data[key];
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) dimensions[key] = value;
  }
  return Object.keys(dimensions).length ? dimensions : undefined;
}

/** Optional draft calculation from user-entered meters only, never map coordinates. */
export function measuredAreaFromDimensions(shape: string, data: Record<string, unknown>): number {
  const dimensions=declaredPlanDimensions(data);
  if (!dimensions) return 0;
  const {lengthM,widthM,diameterM}=dimensions;
  let value=0;
  if (shape==='Rectangular' && lengthM && widthM) value=lengthM*widthM;
  else if (shape==='Ovalada' && lengthM && widthM) value=Math.PI*lengthM*widthM/4;
  else if (shape==='Circular' && diameterM) value=Math.PI*(diameterM/2)**2;
  return Number.isFinite(value) ? value : 0;
}

/** Explicit v2 layout preserves small footprints and the inverse viewport offsets. */
export function exactPlanLayout(data: Record<string, unknown>) {
  if(data.mapLayoutVersion!==2)return undefined;
  const {mapX:x,mapY:y,mapWidth:width,mapHeight:height}=data;
  if(typeof x!=='number'||typeof y!=='number'||typeof width!=='number'||typeof height!=='number')return undefined;
  if(![x,y,width,height].every(Number.isFinite)||x< -100||x>200||y< -100||y>200||width<.05||width>200||height<.05||height>200)return undefined;
  return {x,y,width,height};
}

/** A new practice area must not inherit a fixture's survey, fence or placement. */
export function freshDemoAreaData(preset: string, placement?: PlanPlacement, selection?: PlanCatalogSelection, color='#7d6d5f') {
  const crop=catalogCropLabel(selection)??'';
  return {
    usage:preset,name:`${crop||preset} · ejemplo`,crop,cropVariety:'',color,
    areaSqM:null,lengthM:null,widthM:null,diameterM:null,
    mapWidth:placement?.width??12,mapHeight:placement?.height??8,
    ...(placement?{mapX:placement.x,mapY:placement.y}:{}),
    shape:preset==='Laguna / agua'?'Ovalada':'Rectangular',
    notes:'Área ficticia añadida para practicar. Sus medidas y ubicación las indicas tú.',
  };
}

/** Bounded illustrative rows. Slots are visual marks, never plant counts or spacing advice. */
export function cropIllustrationSlots(
  outline: ReadonlyArray<Point>, property: ReadonlyArray<Point>, footprintRadius: number, limit = 48,
): Point[] {
  if (!Number.isFinite(footprintRadius) || footprintRadius <= 0 || !Number.isFinite(limit) || limit <= 0) return [];
  if ([outline,property].some(points => points.length < 3 || points.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y)))) return [];
  // Visit the full bounded 18×18 grid before limiting marks. Cutting off the
  // generator early paints only the first rows at one edge of a large plot.
  const accepted=interiorSlots(outline,footprintRadius,324)
    .filter(point => edgeClearance(point,property) >= footprintRadius);
  const count=Math.min(64,Math.floor(limit));
  if(accepted.length<=count)return accepted;
  return Array.from({length:count},(_,index)=>accepted[Math.floor((index+.5)*accepted.length/count)]);
}
