/** Same bundled geometry for every animal; choose closest detailed instances.
 * Conservative defaults keep weak/unknown devices bounded. No records are removed.
 */
export function farmAnimalDetailBudget(memoryGiB?:number,threads?:number){
 if((memoryGiB!==undefined&&memoryGiB<=4)||(threads!==undefined&&threads<=4))return 18;
 if(memoryGiB!==undefined&&memoryGiB>=8&&threads!==undefined&&threads>=8)return 128;
 return 48;
}
export function nearestFarmAnimalDetails(entries:ReadonlyArray<{id:string;distance:number}>,budget:number,maxDistance:number){
 return new Set(entries.filter(e=>Number.isFinite(e.distance)&&e.distance<=maxDistance).toSorted((a,b)=>a.distance-b.distance||a.id.localeCompare(b.id)).slice(0,Math.max(0,Math.min(128,budget))).map(e=>e.id));
}
