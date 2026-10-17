import {MAP_PACK,NATIONAL_MAP_PACK,type MapPackDefinition,type SavedMapPack} from './offline-map-pack';
import {packCoversBounds} from './offline-satellite-store';
export type StoredCartography={owner:string;pack:MapPackDefinition;saved:SavedMapPack;persisted?:boolean};
/** Pure view selection. It never assigns a map zone to a farm or requests remote coordinates. */
export function selectCartography(entries:Record<string,StoredCartography|undefined>,owner:string|undefined,view:[number,number,number,number]|null){
 const pilot=entries[MAP_PACK.id]?.owner===owner?entries[MAP_PACK.id]:undefined,national=entries[NATIONAL_MAP_PACK.id]?.owner===owner?entries[NATIONAL_MAP_PACK.id]:undefined;
 if(pilot&&view&&packCoversBounds(pilot.pack,view))return pilot;
 if(national&&view){const [w,s,e,n]=view,[pw,ps,pe,pn]=national.pack.bounds;if(w<=pe&&e>=pw&&s<=pn&&n>=ps)return national;}
 if(pilot&&view){const [w,s,e,n]=view,[pw,ps,pe,pn]=pilot.pack.bounds;if(w<=pe&&e>=pw&&s<=pn&&n>=ps)return pilot;}
 return undefined;
}
