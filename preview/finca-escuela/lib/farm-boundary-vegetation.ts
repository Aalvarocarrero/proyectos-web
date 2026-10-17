import {animalVisualLength,type AnimalModelSpecies} from './farm-animal-species';
import {sceneUnitsPerMetre} from './farm-scene-scale';
import {inside,edgeClearance,type Point} from './illustrated-geometry';
export type BoundaryPlant={id:string;position:Point;kind:'broadleaf'|'palm';heightM:number;crownRadiusM:number;planRadius:number;planHeight:number};
/** Explicit demo planting, not botanical identification or a real-tree inventory. */
export function boundaryPlantingView(data:Record<string,unknown>,layout:{x:number;y:number;width:number;height:number},outline:ReadonlyArray<Point>,viewport:{x:number;y:number;scale:number},demonstration:boolean):BoundaryPlant[]{
 const raw=data.boundaryPlanting;if(!demonstration||!raw||typeof raw!=='object'||Array.isArray(raw))return [];const config=raw as Record<string,unknown>;
 if(config.version!==1||config.source!=='fictional-demo'||!Array.isArray(config.plants))return [];
 const width=Number(config.layoutWidthM),height=Number(config.layoutHeightM);if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0||!Number.isFinite(viewport.scale)||viewport.scale<=0)return [];
 const metre=Math.min(layout.width/width,layout.height/height);if(!Number.isFinite(metre)||metre<=0)return [];
 return config.plants.slice(0,96).flatMap((raw,index)=>{if(!raw||typeof raw!=='object'||Array.isArray(raw))return [];const p=raw as Record<string,unknown>;
  if(!['x','y','heightM','crownRadiusM'].every(k=>typeof p[k]==='number'&&Number.isFinite(p[k]))||!['broadleaf','palm'].includes(String(p.kind)))return [];
  const x=p.x as number,y=p.y as number,h=p.heightM as number,r=p.crownRadiusM as number;if(x<=0||x>=100||y<=0||y>=100||h<3||h>12||r<1||r>4)return [];
  const position={x:layout.x+layout.width*x/100,y:layout.y+layout.height*y/100};if(!inside(position,outline)||edgeClearance(position,outline)<r*metre)return [];
  return [{id:String(index),position:{x:viewport.x+position.x*viewport.scale,y:viewport.y+position.y*viewport.scale},kind:p.kind as BoundaryPlant['kind'],heightM:h,crownRadiusM:r,planRadius:r*metre*viewport.scale,planHeight:h*metre*viewport.scale}];
 });
}
function distanceToOutline(p:Point,outline:ReadonlyArray<Point>){return Math.min(...outline.map((a,i)=>{const b=outline[(i+1)%outline.length],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}));}
type Area={id:string;outline:ReadonlyArray<Point>;use:string;structureKind?:string;boundaryPlanting?:BoundaryPlant[];waterTrough?:{position:Point;planWidth:number;planHeight:number}};
/** Clip again against the CURRENT plan: later edits may move a road, gate or animal. */
export function visibleBoundaryPlants(areas:ReadonlyArray<Area>,property:ReadonlyArray<Point>,animals:ReadonlyArray<{position:Point;species?:AnimalModelSpecies}>,physicalAreaSqM?:number):BoundaryPlant[]{
 const result:BoundaryPlant[]=[];let examined=0,metre=.005;if(physicalAreaSqM)metre=sceneUnitsPerMetre(property,1,physicalAreaSqM);else{let sampled=0;outer:for(const area of areas)for(const plant of area.boundaryPlanting??[]){if(sampled++>=256)break outer;metre=Math.max(metre,plant.planRadius/plant.crownRadiusM);}}
 for(const area of areas)for(const plant of area.boundaryPlanting??[]){if(result.length>=96||examined++>=256)return result;const {position:p,planRadius:r}=plant,clearance=r*1.25;
  if(!inside(p,property)||edgeClearance(p,property)<clearance)continue;
  if(areas.some(a=>a.id!==area.id&&a.structureKind!=='fence'&&(inside(p,a.outline)||distanceToOutline(p,a.outline)<clearance)))continue;
  if(areas.some(a=>a.waterTrough&&Math.hypot(p.x-a.waterTrough.position.x,p.y-a.waterTrough.position.y)<clearance+Math.hypot(a.waterTrough.planWidth,a.waterTrough.planHeight)/2))continue;
  if(animals.some(a=>Math.hypot(p.x-a.position.x,p.y-a.position.y)<clearance+(a.species?animalVisualLength[a.species]:3.2)*metre/Math.SQRT2))continue;
  if(result.some(q=>Math.hypot(p.x-q.position.x,p.y-q.position.y)<r+q.planRadius))continue;
  result.push({...plant,id:area.id+'-'+plant.id});
 }return result;
}
