import type {PlacedAnimal} from '../components/farm-illustrated-scene';
import type {Point} from './illustrated-geometry';
/** Camera targets only: all positions/counts remain the explicit saved records. */
export function herdFrames(animals:ReadonlyArray<PlacedAnimal>,metre:number,unit:number){
 const groups=new Map<string,PlacedAnimal[]>();
 for(const animal of animals.slice(0,128)){const list=groups.get(animal.areaId)??[];list.push(animal);groups.set(animal.areaId,list);}
 return [...groups].map(([areaId,members])=>{const xs=members.map(a=>a.position.x),ys=members.map(a=>a.position.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);return {areaId,count:members.length,members,point:{x:(minX+maxX)/2,y:(minY+maxY)/2} as Point,width:Math.max(metre*22,Math.hypot(maxX-minX,maxY-minY)*unit*1.25+metre*8)};});
}
