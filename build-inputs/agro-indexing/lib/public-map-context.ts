import {fetchMapPack,type MapPackDefinition} from './offline-map-pack';
/** Share verified, same-origin public cartography between the inline map and its dialog.
 * Memory only: this does not read private workspaces or promise offline persistence. */
const pending = new Map<string,Promise<Blob>>();
export function publicMapContext(pack:MapPackDefinition):Promise<Blob>{
 const prior=pending.get(pack.id);if(prior)return prior;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),180000);
 const request=fetchMapPack(controller.signal,()=>{},pack).catch(error=>{pending.delete(pack.id);throw error;}).finally(()=>clearTimeout(timer));
 pending.set(pack.id,request);return request;
}
