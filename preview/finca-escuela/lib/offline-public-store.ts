import {parseOfflinePublicSnapshot,OFFLINE_PUBLIC_MAX_BYTES,type OfflinePublicSnapshot} from '@/lib/offline-public-types';
export const PUBLIC_LIBRARY_DB='venezuela-agro-public-library-v1';
export const PUBLIC_RETENTION_MS=7*24*60*60*1000;
export type SavedPublicLibrary={snapshot:OfflinePublicSnapshot;downloadedAt:string;bytes:number};
function open(){return new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open(PUBLIC_LIBRARY_DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('library');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function request<T>(r:IDBRequest<T>){return new Promise<T>((resolve,reject)=>{r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function done(tx:IDBTransaction){return new Promise<void>((resolve,reject)=>{tx.oncomplete=()=>resolve();tx.onabort=()=>reject(tx.error??new Error('storage_aborted'));tx.onerror=()=>reject(tx.error??new Error('storage_failed'));});}
export function publicLibraryExpired(saved:SavedPublicLibrary,now=Date.now()){const time=Date.parse(saved.snapshot.generatedAt);return !Number.isFinite(time)||time>now+300000||now-time>PUBLIC_RETENTION_MS;}
export async function readPublicLibrary():Promise<SavedPublicLibrary|null>{const db=await open();try{const tx=db.transaction('library','readonly'),finished=done(tx);const row=await request(tx.objectStore('library').get('current')) as SavedPublicLibrary|undefined;await finished;if(!row)return null;return {...row,snapshot:parseOfflinePublicSnapshot(row.snapshot)};}finally{db.close();}}
export async function savePublicLibrary(value:unknown,now=Date.now(),signal?:AbortSignal,expectedGeneration?:number):Promise<SavedPublicLibrary>{
 const snapshot=parseOfflinePublicSnapshot(value);const bytes=new TextEncoder().encode(JSON.stringify(snapshot)).byteLength;
 if(bytes>OFFLINE_PUBLIC_MAX_BYTES)throw new Error('download_too_large');
 const saved={snapshot,downloadedAt:new Date(now).toISOString(),bytes};if(publicLibraryExpired(saved,now))throw new Error('invalid_snapshot_date');
 const db=await open();const tx=db.transaction('library','readwrite'),finished=done(tx);
 const cancel=()=>{try{tx.abort();}catch{}};signal?.addEventListener('abort',cancel,{once:true});
 try{const generation=await request(tx.objectStore('library').get('generation')) as number|undefined;if(signal?.aborted||(expectedGeneration!==undefined&&(generation??0)!==expectedGeneration))throw new Error('download_cancelled');
 const previous=await request(tx.objectStore('library').get('current')) as SavedPublicLibrary|undefined;
 if(previous&&Date.parse(previous.snapshot.generatedAt)>Date.parse(snapshot.generatedAt)){await finished;return previous;}
 tx.objectStore('library').put(saved,'current');await finished;return saved;
 }catch(error){try{tx.abort();}catch{}await finished.catch(()=>undefined);throw error;}finally{signal?.removeEventListener('abort',cancel);db.close();}
}
export async function clearPublicLibrary(){const db=await open();try{const tx=db.transaction('library','readwrite'),finished=done(tx);const generation=await request(tx.objectStore('library').get('generation')) as number|undefined;tx.objectStore('library').put((generation??0)+1,'generation');tx.objectStore('library').delete('current');await finished;}finally{db.close();}}
export async function beginPublicDownload():Promise<number>{const db=await open();try{const tx=db.transaction('library','readonly'),finished=done(tx);const generation=(await request(tx.objectStore('library').get('generation')) as number|undefined)??0;await finished;return generation;}finally{db.close();}}
export async function downloadPublicLibrary(signal?:AbortSignal,expectedGeneration?:number):Promise<SavedPublicLibrary>{
 const generation=expectedGeneration??await beginPublicDownload();if(generation!==await beginPublicDownload())throw new Error('download_cancelled');
 const controller=new AbortController(),cancel=()=>controller.abort();signal?.addEventListener('abort',cancel,{once:true});if(signal?.aborted)controller.abort();
 const timer=setTimeout(cancel,20000);
 try{const response=await fetch('/api/offline-public',{cache:'no-store',signal:controller.signal});if(!response.ok)throw new Error('download_unavailable');
 const body=await response.text();if(new TextEncoder().encode(body).byteLength>OFFLINE_PUBLIC_MAX_BYTES)throw new Error('download_too_large');
 if(controller.signal.aborted)throw new Error('download_cancelled');return await savePublicLibrary(JSON.parse(body),Date.now(),controller.signal,generation);
 }finally{clearTimeout(timer);signal?.removeEventListener('abort',cancel);}
}
