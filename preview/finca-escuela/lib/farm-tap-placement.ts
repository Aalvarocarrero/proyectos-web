import {edgeClearance,inside,outlineExceedsProperty,type Point} from './illustrated-geometry';
export type PlanPlacement={x:number;y:number;width:number;height:number;preferSketch?:boolean};
export type AnimalPlanPlacement={version:1;source:'user-placed';coordinateSpace:'area-percent';areaId:string;x:number;y:number};
/** A visual footprint only. Never converts an illustration into a measured surface. */
export function placementAt(point:Point,property:ReadonlyArray<Point>,viewport:{x:number;y:number;scale:number}):PlanPlacement|null{
 if(!Number.isFinite(point.x)||!Number.isFinite(point.y)||viewport.scale<=0)return null;
 const radius=Math.min(edgeClearance(point,property)*.88,6*viewport.scale);
 if(radius<5*viewport.scale)return null;
 const width=radius*1.6/viewport.scale,height=radius*1.1/viewport.scale;
 const result={x:(point.x-viewport.x)/viewport.scale-width/2,y:(point.y-viewport.y)/viewport.scale-height/2,width,height};
 return result.x>=1&&result.y>=1&&result.x+width<=99&&result.y+height<=69?result:null;
}
export function placementFits(placement:PlanPlacement,property:ReadonlyArray<Point>,viewport:{x:number;y:number;scale:number}){
 const {x,y,width,height}=placement;if(![x,y,width,height].every(Number.isFinite)||width<8||height<5||x<1||y<1||x+width>99||y+height>69)return false;
 const points=[{x,y},{x:x+width,y},{x:x+width,y:y+height},{x,y:y+height}].map(p=>({x:viewport.x+p.x*viewport.scale,y:viewport.y+p.y*viewport.scale}));
 return !outlineExceedsProperty(points,property);
}
export function animalPlacementAt(point:Point,areaId:string,outline:ReadonlyArray<Point>,layout:PlanPlacement,viewport:{x:number;y:number;scale:number}):AnimalPlanPlacement|null{
 if(!inside(point,outline)||edgeClearance(point,outline)<.9*viewport.scale||layout.width<=0||layout.height<=0)return null;
 const x=((point.x-viewport.x)/viewport.scale-layout.x)/layout.width*100,y=((point.y-viewport.y)/viewport.scale-layout.y)/layout.height*100;
 if(!Number.isFinite(x)||!Number.isFinite(y)||x<=0||x>=100||y<=0||y>=100)return null;
 return {version:1,source:'user-placed',coordinateSpace:'area-percent',areaId,x,y};
}
export function isTap(start:{x:number;y:number;pointerId:number}|null,end:{x:number;y:number;pointerId:number}){return !!start&&start.pointerId===end.pointerId&&Math.hypot(start.x-end.x,start.y-end.y)<=8;}

export function validAnimalPlanPlacement(value:unknown):value is AnimalPlanPlacement{if(!value||typeof value!=="object"||Array.isArray(value))return false;const p=value as Record<string,unknown>;return p.version===1&&p.source==='user-placed'&&p.coordinateSpace==='area-percent'&&typeof p.areaId==='string'&&p.areaId.length>0&&p.areaId.length<=160&&typeof p.x==='number'&&typeof p.y==='number'&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>0&&p.x<100&&p.y>0&&p.y<100;}
/** A draft belongs to the workspace in which the user opened it. */
export function assertPlanDraftContext(opened:{owner:string;farmId:string}|null,current:{owner:string;farmId:string}){if(!opened||opened.owner!==current.owner||opened.farmId!==current.farmId)throw new Error('Revisa: la cuenta o finca cambió. Cierra esta ficha y vuelve a elegir el lugar.');}
