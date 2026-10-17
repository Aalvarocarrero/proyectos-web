import type {DroneTourPoint,DroneTourPose,DroneTourShot,DroneTourVector} from './farm-drone-tour';

export type TourObstacle={min:DroneTourVector;max:DroneTourVector;subjectId?:string};
export type TourBarn={id:string;title:string;position:DroneTourVector;scale:DroneTourVector};
export type TourSubject={id:string;title:string;position:DroneTourVector;length:number;kind?:string;areaId?:string};
export type CinematicFarm={overview:DroneTourPoint;metre:number;obstacles:readonly TourObstacle[];barns:readonly TourBarn[];animals:readonly TourSubject[];crops:readonly TourSubject[]};
const vector=(x:number,y:number,z:number):DroneTourVector=>[x,y,z];
const distance=(a:DroneTourVector,b:DroneTourVector)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);

/** Exact segment-vs-expanded-box test, including endpoints and grazing contact.
 * Camera clearance is a conservative cube around its optical center.
 */
export function cinematicSegmentClear(from:DroneTourVector,to:DroneTourVector,obstacles:readonly TourObstacle[],clearance:number){
 if(![...from,...to].every(Number.isFinite)||Math.min(from[1],to[1])<clearance)return false;
 return !obstacles.some(box=>{let enter=0,exit=1;for(let axis=0;axis<3;axis++){const delta=to[axis]-from[axis],low=box.min[axis]-clearance,high=box.max[axis]+clearance;if(Math.abs(delta)<1e-9){if(from[axis]<low||from[axis]>high)return false;}else{const a=(low-from[axis])/delta,b=(high-from[axis])/delta;enter=Math.max(enter,Math.min(a,b));exit=Math.min(exit,Math.max(a,b));if(enter>exit)return false;}}return true;});
}

/** Return to the aerial staging position through a checked escape column.
 * The horizontal search also finds the open end of the known barn aisle.
 * If the manually moved camera is embedded in solid geometry, fail closed.
 */
export function cinematicReturnPath(from:DroneTourPose,overview:DroneTourPoint,obstacles:readonly TourObstacle[],metre:number):DroneTourShot[]|null{
 const margin=metre*.35,clearY=Math.max(overview.position[1],...obstacles.map(o=>o.max[1]+metre*4));
 if(!cinematicSegmentClear(from.position,from.position,obstacles,margin))return null;
 const candidates=[from.position];
 for(const radius of [2,4,8,16,32])for(let direction=0;direction<8;direction++){const angle=direction*Math.PI/4;candidates.push(vector(from.position[0]+Math.cos(angle)*metre*radius,from.position[1],from.position[2]+Math.sin(angle)*metre*radius));}
 for(const escape of candidates){const raised=vector(escape[0],clearY,escape[2]),above=vector(overview.position[0],clearY,overview.position[2]);
  if(![[from.position,escape],[escape,raised],[raised,above],[above,overview.position]].every(([a,b])=>cinematicSegmentClear(a,b,obstacles,margin)))continue;
  const steps=[escape,raised,above,overview.position].filter((p,i)=>i>0||distance(from.position,p)>.01).map((position,i)=>({id:'return-'+i,label:'Retomando la vista aérea',position,target:i===0?vector(position[0]+from.target[0]-from.position[0],position[1]+from.target[1]-from.position[1],position[2]+from.target[2]-from.position[2]):overview.target,durationMs:i===0?2000:2500}));
  let previous=from;return steps.filter(step=>{if(distance(previous.position,step.position)<.001&&distance(previous.target,step.target)<.001)return false;previous=step;return true;});
 }
 return null;
}

/** A bounded, illustrative flight based only on visible recorded subjects.
 * Below-roof shots are admitted only after the actual wall/post/roof volumes
 * prove the entire camera segment clear. Unavailable shots are simply skipped.
 */
export function createFarmCinematicTour(input:CinematicFarm):DroneTourShot[]{
 const {overview,metre,obstacles}=input,margin=metre*.35;
 const clearY=Math.max(metre*40, ...obstacles.map(box=>box.max[1]+metre*4));
 const shots:DroneTourShot[]=[];let previous:DroneTourPose=overview;
 const append=(candidates:DroneTourShot[])=>{
  let before=previous;const accepted:DroneTourShot[]=[];
  for(const shot of candidates){if(distance(before.position,shot.position)<.001&&distance(before.target,shot.target)<.001)continue;if(distance(shot.position,shot.target)<metre*.5||!cinematicSegmentClear(before.position,shot.position,obstacles,margin))return false;accepted.push(shot);before=shot;}
  shots.push(...accepted);if(accepted.length)previous=accepted.at(-1)!;return true;
 };
 const shot=(id:string,label:string,position:DroneTourVector,target:DroneTourVector,durationMs=4000):DroneTourShot=>({id,label,position,target,durationMs});
 const lift=(id:string,position:DroneTourVector,target:DroneTourVector)=>shot(id,'Vuelo entre áreas',vector(position[0],clearY,position[2]),target,3500);
 // The original shelter has an X-aligned open center aisle. Test actual solids
 // rather than assuming that any building labelled barn has an open doorway.
 const barnFallbacks:DroneTourShot[][]=[];
 const orderedBarns=[...input.barns].sort((a,b)=>Number(input.animals.some(animal=>animal.areaId===b.id&&animal.kind==='pig'))-Number(input.animals.some(animal=>animal.areaId===a.id&&animal.kind==='pig')));
 for(const barn of orderedBarns.slice(0,6)){
  const [x,y,z]=barn.position,[sx,sy]=barn.scale,eye=y+metre*2;
  const start=vector(x-sx*.76,eye,z),end=vector(x+sx*.76,eye,z),look=(offset:number)=>vector(x+sx*offset,y+metre*.9,z);
  const front=vector(start[0],clearY,z),highEnd=vector(end[0],clearY,z);
  const inner=vector(x-sx*.2,eye,z);let closeView:{animal:TourSubject;position:DroneTourVector;target:DroneTourVector}|undefined;
  for(const animal of input.animals.filter(a=>a.areaId===barn.id)){for(const height of [2,2.8,3.5]){const position=vector(inner[0],y+metre*height,inner[2]),target=vector(animal.position[0],animal.position[1]+animal.length*.28,animal.position[2]);if(position[1]+margin<y+sy*.48&&cinematicSegmentClear(inner,position,obstacles,margin)&&cinematicSegmentClear(position,target,obstacles.filter(o=>o.subjectId!==animal.id),metre*.03)){closeView={animal,position,target};break;}}if(closeView)break;}
  const sequence=[lift(barn.id+'-lift',previous.position,previous.target),shot(barn.id+'-approach','Aproximación · '+barn.title,front,look(0),4500),
   shot(barn.id+'-door','Descenso al acceso · '+barn.title,start,look(-.1),4000),
   shot(barn.id+'-aisle-a','Pasillo ilustrativo · '+barn.title,inner,look(.45),3000),
   ...(closeView?[shot(closeView.animal.id+'-interior-close','Animal de cerca · '+closeView.animal.title,closeView.position,closeView.target,3000)]:[]),
   shot(barn.id+'-aisle-b','Interior ilustrativo · '+barn.title,vector(x+sx*.25,eye,z),look(.9),3000),
   shot(barn.id+'-exit','Salida del galpón',end,look(1.4),3000),
   shot(barn.id+'-rise','Salida aérea · '+barn.title,highEnd,look(0),4000)];
  if(eye+margin<y+sy*.48&&append(sequence))break;
  // No verified clear passage: show the structure from outside, above its roof.
  const exterior=vector(x-sx*.85,Math.max(y+sy*.8,metre*7),z+sx*.7);
  barnFallbacks.push([lift(barn.id+'-lift',previous.position,previous.target),shot(barn.id+'-exterior','Vista exterior · '+barn.title,vector(exterior[0],clearY,exterior[2]),look(0)),shot(barn.id+'-roof','Cubierta y acceso · '+barn.title,exterior,look(0),8000),lift(barn.id+'-rise',exterior,look(0))]);
 }
 if(!shots.length)for(const fallback of barnFallbacks)if(append(fallback))break;
 let animalCount=0;const animalKinds=new Set<string>();
 for(const animal of input.animals){if(animalCount>=2)break;if(animal.kind&&animalKinds.has(animal.kind))continue;const [x,y,z]=animal.position,radius=Math.max(metre*4,animal.length*2.8),target=vector(x,y+animal.length*.28,z),height=y+Math.max(metre*2,animal.length*.9);
  for(let direction=0;direction<8;direction++){const angle=direction*Math.PI/4,near=vector(x+Math.cos(angle)*radius,height,z+Math.sin(angle)*radius),side=vector(x+Math.cos(angle+.35)*radius,height,z+Math.sin(angle+.35)*radius);
   if(!cinematicSegmentClear(near,target,obstacles.filter(o=>o.subjectId!==animal.id),metre*.03)||!cinematicSegmentClear(side,target,obstacles.filter(o=>o.subjectId!==animal.id),metre*.03))continue;
   if(append([lift(animal.id+'-lift',previous.position,previous.target),lift(animal.id+'-above',near,target),shot(animal.id+'-close','Animal de cerca · '+animal.title,near,target,4000),shot(animal.id+'-side','Detalle lateral · '+animal.title,side,target,3500),lift(animal.id+'-rise',side,target)])){animalCount++;if(animal.kind)animalKinds.add(animal.kind);break;}
  }
 }
 for(const crop of input.crops.slice(0,2)){const [x,y,z]=crop.position,target=vector(x,y,z),near=vector(x+metre*9,y+metre*8,z+metre*9);append([lift(crop.id+'-lift',previous.position,previous.target),lift(crop.id+'-above',near,target),shot(crop.id+'-crop','Cultivos · '+crop.title,near,target,4500),lift(crop.id+'-rise',near,target)]);}
 // The final segment returns to the exact starting camera/target, with zero
 // first and second derivative at the seam. Empty farms retain aerial mode.
 if(shots.length){const bridge=vector(overview.position[0],clearY,overview.position[2]);if(!append([shot('whole-farm-rise','Panorama de la finca',bridge,overview.target,4500),shot('whole-farm',overview.label??'Finca completa',overview.position,overview.target,5000)]))return [];}
 return shots;
}
