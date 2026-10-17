import assert from 'node:assert/strict';import test,{after} from 'node:test';import {createServer} from 'vite';import {fileURLToPath} from 'node:url';import {readFile} from 'node:fs/promises';
const root=fileURLToPath(new URL('..',import.meta.url));const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,watch:null}});const lib=await vite.ssrLoadModule('/lib/offline-library-worker.ts');
const originals=Object.fromEntries(['navigator','MessageChannel','setTimeout','clearTimeout','fetch'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));let timeout;const channels=[];
class Channel{constructor(){this.port1={closed:false,onmessage:null,close(){this.closed=true;}};this.port2={postMessage:value=>{if(!this.port1.closed)this.port1.onmessage?.({data:value});}};channels.push(this);}}
Object.defineProperty(globalThis,'MessageChannel',{value:Channel,configurable:true});const realTimer=globalThis.setTimeout;globalThis.setTimeout=(callback,ms,...rest)=>ms===120000?(timeout=callback,12345678):realTimer(callback,ms,...rest);
after(async()=>{for(const [key,value]of Object.entries(originals)){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}await vite.close();});
let posts=[],registration;function setup(){posts=[];registration={active:{postMessage:(data,ports)=>posts.push({data,port:ports?.[0]})}};Object.defineProperty(globalThis,'navigator',{value:{serviceWorker:{getRegistration:async()=>registration}},configurable:true});}
test('already-aborted or aborted registration never starts resource preparation',async()=>{setup();const c=new AbortController();c.abort();assert.equal((await lib.libraryResources(true,c.signal,0)).ready,false);assert.equal(posts.length,0);const delayed=new AbortController();let resolve;navigator.serviceWorker.getRegistration=()=>new Promise(r=>resolve=r);const job=lib.libraryResources(true,delayed.signal,0);delayed.abort();resolve(registration);await job;assert.equal(posts.length,0);});
test('active cancellation settles immediately, closes port and tells worker to cancel',async()=>{setup();const c=new AbortController();const job=lib.libraryResources(true,c.signal,4);await Promise.resolve();assert.equal(posts[0].data.generation,4);c.abort();assert.equal((await job).ready,false);assert.equal(posts.at(-1).data.type,'CANCEL_LIBRARY');assert.equal(channels.at(-1).port1.closed,true);});
test('timeout cancels download instead of silently leaving it running',async()=>{setup();const job=lib.libraryResources(true,undefined,0);await Promise.resolve();timeout();assert.equal((await job).ready,false);assert.equal(posts.at(-1).data.type,'CANCEL_LIBRARY');assert.equal(channels.at(-1).port1.closed,true);});
test('public cleanup waits for explicit worker acknowledgement',async()=>{setup();let complete=false;const job=lib.removeLibraryResources().then(()=>complete=true);await Promise.resolve();assert.equal(complete,false);assert.equal(posts[0].data.type,'CLEAR_LIBRARY');posts[0].port.postMessage({ready:false,cleared:true});await job;assert.equal(complete,true);});

function onlineSetup(core={ready:true,version:'new'},library={ready:true,version:'new'}){
 setup();navigator.onLine=true;globalThis.fetch=async()=>({ok:true,json:async()=>({revision:'new'})});
 registration.active.postMessage=(data,ports)=>{posts.push({data,port:ports?.[0]});queueMicrotask(()=>ports?.[0]?.postMessage(data.type==='OFFLINE_STATUS'?core:library));};
}
test('old active worker is detected before it downloads a newer library manifest',async()=>{
 onlineSetup({ready:true,version:'old'});const result=await lib.libraryResources(true,undefined,7);
 assert.equal(result.ready,false);assert.equal(result.code,'update_required');assert.match(result.error,/cierra todas las pestañas/);assert.match(result.error,/registros se conservan/);
 assert.deepEqual(posts.map(row=>row.data.type),['OFFLINE_STATUS']);
});
test('waiting or installing update provides guidance without taking over or preparing old bundles',async()=>{
 for(const state of ['waiting','installing']){onlineSetup();registration[state]={};const result=await lib.libraryResources(true,undefined,1);assert.equal(result.code,'update_required');assert.equal(posts.length,0);}
});
test('first installation without an active worker asks to wait and sends no preparation',async()=>{
 onlineSetup();registration.active=null;registration.installing={};const result=await lib.libraryResources(true);assert.equal(result.ready,false);assert.match(result.error,/todavía se está preparando/);assert.equal(posts.length,0);
});
test('new matching worker completes library preparation and preserves the generation',async()=>{
 onlineSetup();const result=await lib.libraryResources(true,undefined,9);assert.equal(result.ready,true);assert.equal(result.version,'new');
 assert.deepEqual(posts.map(row=>row.data.type),['OFFLINE_STATUS','PREPARE_LIBRARY']);assert.equal(posts[1].data.generation,9);
});
test('failed replies still reveal an explicit version mismatch',async()=>{
 onlineSetup({ready:false,version:'old'});assert.equal((await lib.libraryResources(true)).code,'update_required');assert.equal(posts.length,1);
 onlineSetup(undefined,{ready:false,version:'old',error:'generic'});assert.equal((await lib.libraryResources(true)).code,'update_required');
});
test('network failure and genuine same-version resource failure remain distinct from an update',async()=>{
 onlineSetup();globalThis.fetch=async()=>{throw new Error('network');};const network=await lib.libraryResources(true);assert.equal(network.ready,false);assert.match(network.error,/verificar la versión/);assert.equal(posts.length,0);
 onlineSetup(undefined,{ready:false,error:'La biblioteca no terminó de descargarse.'});const resources=await lib.libraryResources(true);assert.equal(resources.ready,false);assert.equal(resources.code,undefined);assert.match(resources.error,/no terminó/);
});
test('cancelling during version preflight never starts a library download',async()=>{
 onlineSetup();registration.active.postMessage=(data,ports)=>posts.push({data,port:ports?.[0]});const controller=new AbortController();const job=lib.libraryResources(true,controller.signal,2);
 for(let i=0;i<5&&!posts.length;i++)await Promise.resolve();assert.equal(posts[0].data.type,'OFFLINE_STATUS');controller.abort();const result=await job;
 assert.equal(result.ready,false);assert.match(result.error,/cancelada/i);assert.equal(posts.length,1);assert.equal(channels.at(-1).port1.closed,true);
});
test('offline library displays safe preparation guidance rather than replacing it with generic failure',async()=>{
 const source=await readFile(root+'components/offline-library.tsx','utf8');assert.match(source,/if\(!ready.ready\)\{setMessage\(ready.error\|\|/);assert.doesNotMatch(source,/throw new Error\(ready.error/);
});
