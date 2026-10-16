const VERSION = "morochos-v33800833767489";
const STATIC_CACHE = VERSION + "-static";
const PAGE_CACHE = VERSION + "-pages";
const API_CACHE = VERSION + "-api";
const LIBRARY_CACHE=VERSION+"-library";
function isLibraryCache(name){return /^morochos-v[0-9]+-library(?:-[a-zA-Z0-9-]+)?$/.test(name); }
const FARM_DOCUMENTS=new Set(["/farm-3d/manifest.json","/licenses/ez-tree.txt","/licenses/ez-tree-textures.md"]);
const ESSENTIAL = ["/finca-modelo",...FARM_DOCUMENTS,"/map-context/venezuela-region-20261007-z6.pmtiles","/plan-oblique/chicken-coop-256.webp","/plan-oblique/banana-plant-256.webp","/plan-oblique/pig-256.webp","/plan-oblique/hen-256.webp","/plan-oblique/greenhouse-256.webp","/plan-oblique/rural-house-256.webp","/plan-oblique/wood-cabin-256.webp","/plan-oblique/coffee-shrub-256.webp","/plan-oblique/cattle-256.webp","/plan-oblique/open-shed-256.webp","/plan-oblique/cacao-tree-256.webp","/plan-vegetation/cattle-256.png","/plan-vegetation/pig-256.png","/plan-vegetation/hen-256.png","/plan-vegetation/cacao-canopy-256.png","/plan-vegetation/coffee-shrub-256.png","/plan-vegetation/banana-plant-256.png","/plan-vegetation/low-crop-256.png","/inventory-examples/forrajes.webp","/inventory-examples/medicinas.webp","/inventory-examples/semillas.webp","/inventory-examples/fertilizantes.webp","/inventory-examples/sal.webp","/inventory-examples/herramientas.webp","/inventory-examples/combustible.webp","/inventory-examples/otros.webp","/finca-demo", "/biblioteca-local", "/offline", "/app-local", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/logo-morochos.webp", "/venezuela-states.geojson"];
const PRECACHE = ["/", "/plataforma", "/tienda", "/aprende", "/morochito-transparent.webp", "/hero-apure-640.webp"];
const PUBLIC_PAGES = new Set(["/finca-modelo","/modelos-finca","/finca-demo", "/stickers", "/biblioteca-local", "/legal/privacidad", "/legal/terminos", "/legal/comercio", "/creditos-fotograficos","/", "/offline", "/app-local", "/plataforma", "/tienda", "/aprende", "/nosotros", "/rubros", "/guia-institucional"]);
function cacheable(response) {
  return response.ok && !response.redirected && !/no-store|private/i.test(response.headers.get("cache-control") || "");
}
async function save(cache, path,signal) {
 const controller=new AbortController();let timer,rejectCancellation;
 const cancellation=new Promise((_,reject)=>{rejectCancellation=reject;});
 const cancel=()=>{controller.abort();rejectCancellation(new Error("Resource download cancelled"));};
 signal?.addEventListener("abort",cancel,{once:true});
 timer=setTimeout(cancel,path==="/map-context/venezuela-region-20261007-z6.pmtiles"?180000:20000);
 try {
  if(signal?.aborted){cancel();await cancellation;}
  await Promise.race([cancellation,(async()=>{const response=await fetch(path,{signal:controller.signal,cache:"no-store"});if(!cacheable(response))throw new Error("Resource unavailable: "+path);await cache.put(path,response);})()]);
 } finally {clearTimeout(timer);signal?.removeEventListener("abort",cancel);}
}

let coreProgress={ready:false,phase:"idle",completed:0,total:0,version:VERSION};
const corePorts=new Set();
function reportCore(update){coreProgress={...coreProgress,...update};for(const port of corePorts)try{port.postMessage({type:"OFFLINE_PROGRESS",status:coreProgress});}catch{/* Closed page. */}}
async function prepare() {
  // Do not rewrite a coherent private/app shell while downloading a public library.
  if(await coreReady()){reportCore({ready:true,phase:"ready"});return;}
  reportCore({ready:false,phase:"checking",completed:0,total:0});
  const cache=await caches.open(STATIC_CACHE),stageName=VERSION+"-core-repair",stage=await caches.open(stageName);
  try{
    const manifestResponse=await fetchWithTimeout("/offline-assets.json",20000);
    if(!cacheable(manifestResponse))throw new Error("Missing offline manifest");
    const manifest=await manifestResponse.json();
    if(manifest.revision!==VERSION||!Array.isArray(manifest.assets)||!manifest.assets.length||manifest.assets.some(path=>typeof path!=="string"||path.includes("..")||!/^\/assets\/[a-zA-Z0-9_./-]+\.(js|css|woff2?)$/.test(path)))throw new Error("Invalid offline resource manifest");
    const resources=[...ESSENTIAL,...manifest.assets];
    reportCore({phase:"downloading",total:resources.length});
    for(const [index,path] of resources.entries()){if(!await cache.match(path)){const existingCode=await committedCoreCode(path);if(existingCode)await stage.put(path,existingCode);else await save(stage,path);}reportCore({completed:index+1});}
    reportCore({phase:"verifying"});
    const finalManifest=await fetchWithTimeout("/offline-assets.json",20000);
    if(!cacheable(finalManifest)||(await finalManifest.json()).revision!==VERSION)throw new Error("Deployment changed during preparation");
    for(const path of resources){const repaired=await stage.match(path);if(repaired)await cache.put(path,repaired);}
    if(!(await Promise.all(resources.map(path=>cache.match(path)))).every(Boolean))throw new Error("Incomplete app shell");
    await cache.put("/offline-ready",new Response(JSON.stringify({version:VERSION,assets:manifest.assets.length,resources,preparedAt:new Date().toISOString()}),{headers:{"content-type":"application/json"}}));
    reportCore({ready:true,phase:"ready"});
    await Promise.allSettled(PRECACHE.map(path=>save(cache,path)));
  }finally{await caches.delete(stageName);}
}

let preparation;
function prepareOnce() { if (!preparation) preparation=prepare().catch(error=>{reportCore({ready:false,phase:"error"});throw error;}).finally(()=>{preparation=null;}); return preparation; }
// Existing tabs keep their matching worker and lazy bundles until they close.
// A first installation can claim the page; updates use the normal waiting lifecycle.
self.addEventListener("install", event => { event.waitUntil(prepareOnce().then(()=>{if(!self.registration?.active)return self.skipWaiting();})); });
self.addEventListener("activate", event => {
  event.waitUntil((async()=>{
    // Never migrate previous page/API caches: they could contain authenticated HTML.
    for(const key of await caches.keys()) if(/^morochos-v\d+-(static|pages|api|core-repair)$/.test(key) && ![STATIC_CACHE,PAGE_CACHE,API_CACHE,LIBRARY_CACHE].includes(key)) await caches.delete(key);
    await self.clients.claim();
  })());
});
const LIBRARY_ROUTES=["/modelos-finca","/stickers","/marketplace","/profesionales","/fincas","/red","/proyectos","/aprende","/rubros","/tienda","/plataforma","/nosotros","/guia-institucional","/legal","/creditos-fotograficos","/biblioteca-local"];
function libraryRoute(path){return path==="/"||LIBRARY_ROUTES.some(root=>path===root||path.startsWith(root+"/"));}
let libraryPreparation,libraryController,libraryAttempt=0;
async function publicGeneration(){return new Promise((resolve,reject)=>{const request=indexedDB.open("venezuela-agro-public-library-v1",1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains("library"))request.result.createObjectStore("library");};request.onerror=()=>reject(request.error);request.onsuccess=()=>{const db=request.result,tx=db.transaction("library","readonly"),read=tx.objectStore("library").get("generation");read.onsuccess=()=>resolve(read.result??0);read.onerror=()=>reject(read.error);tx.oncomplete=()=>db.close();};});}
async function coreReady(){const cache=await caches.open(STATIC_CACHE),marker=await cache.match("/offline-ready");if(!marker)return false;const state=await marker.json();return state.version===VERSION&&Array.isArray(state.resources)&&(await Promise.all(state.resources.map(path=>cache.match(path)))).every(Boolean);}
async function committedLibrary(path,complete=false,currentOnly=false){
 for(const name of (await caches.keys()).reverse()){
  if(!isLibraryCache(name)||(currentOnly&&!name.startsWith(LIBRARY_CACHE+"-")))continue;
  const cache=await caches.open(name),marker=await cache.match("/library-ready");if(!marker)continue;
  const status=await marker.json();if(!Array.isArray(status.resources))continue;
  if(complete&&!(await Promise.all(status.resources.map(item=>cache.match(item)))).every(Boolean))continue;
  if(path){const response=await cache.match(path);if(response)return response;}else return {cache,name,status};
 }
}
async function prepareLibrary(generation){
 const controller=new AbortController();libraryController=controller;
 const name=LIBRARY_CACHE+"-"+Date.now()+"-"+(++libraryAttempt);let committed=false;
 try{
 if(generation!==await publicGeneration())throw new Error("cancelled");
 if(!await coreReady())await prepareOnce();
 const response=await fetchWithTimeout("/offline-library-assets.json",20000,controller.signal);if(!cacheable(response))throw new Error("Manifest unavailable");const manifest=await response.json();
 const safeAsset=path=>typeof path==="string"&&!path.includes("..")&&!path.startsWith("//")&&!path.startsWith("/api/")&&(FARM_DOCUMENTS.has(path)||path==="/map-context/venezuela-region-20261007-z6.pmtiles"||/^\/[a-zA-Z0-9_./-]+\.(webp|png|svg|geojson)$/.test(path)||safeFarmAsset(path)||/^\/assets\/[a-zA-Z0-9_./-]+\.(js|css|woff2?)$/.test(path));
 if(manifest.revision!==VERSION||!Array.isArray(manifest.assets)||manifest.assets.length>500||!Array.isArray(manifest.pages)||manifest.pages.some(path=>!PUBLIC_PAGES.has(path))||!Number.isFinite(manifest.bytes)||manifest.bytes<0||manifest.bytes>20*1024*1024||manifest.assets.some(item=>!safeAsset(item.path)||!Number.isFinite(item.bytes)||item.bytes<0))throw new Error("Invalid public manifest");
 const resources=[...manifest.pages,...manifest.assets.map(item=>item.path)];const cache=await caches.open(name),core=await caches.open(STATIC_CACHE);
 for(const path of resources){if(controller.signal.aborted)throw new Error("cancelled");const compiled=path.startsWith("/assets/")?await core.match(path):null;if(compiled)await cache.put(path,compiled);else await save(cache,path,controller.signal);}
 const currentManifest=await fetchWithTimeout("/offline-library-assets.json",20000,controller.signal);if(!cacheable(currentManifest)||(await currentManifest.json()).revision!==VERSION)throw new Error("deployment_changed");
 if(controller.signal.aborted||generation!==await publicGeneration()||!await coreReady())throw new Error("cancelled");
 await cache.put("/library-ready",new Response(JSON.stringify({version:VERSION,resources,bytes:manifest.bytes,preparedAt:new Date().toISOString()}),{headers:{"content-type":"application/json"}}));
 if(controller.signal.aborted||generation!==await publicGeneration())throw new Error("cancelled");
 committed=true;
 for(const old of await caches.keys())if(isLibraryCache(old)&&old!==name){const prior=await caches.open(old);if(await prior.match("/library-ready"))await caches.delete(old);}
 }finally{if(!committed)await caches.delete(name);libraryController=null;}
}
async function libraryStatus(){const library=await committedLibrary(null,true,true);if(!library)return {ready:false};return await coreReady()?{ready:true,version:library.status.version,resources:library.status.resources.length,bytes:library.status.bytes,preparedAt:library.status.preparedAt}:{ready:false,error:"Falta código de la aplicación. Conecta y vuelve a preparar el dispositivo."};}
self.addEventListener("message",event=>{
 if(event.data?.type==="CANCEL_LIBRARY"){libraryController?.abort();return;}
 if(!["PREPARE_LIBRARY","LIBRARY_STATUS","CLEAR_LIBRARY"].includes(event.data?.type))return;
 event.waitUntil((async()=>{try{
 if(event.data.type==="CLEAR_LIBRARY"){libraryController?.abort();if(libraryPreparation)await libraryPreparation.catch(()=>undefined);for(const name of await caches.keys())if(isLibraryCache(name))await caches.delete(name);event.ports[0]?.postMessage({ready:false,cleared:true});return;}
 if(event.data.type==="PREPARE_LIBRARY"){if(!libraryPreparation)libraryPreparation=prepareLibrary(event.data.generation).finally(()=>{libraryPreparation=null;});await libraryPreparation;}
 event.ports[0]?.postMessage(await libraryStatus());
 }catch{event.ports[0]?.postMessage({ready:false,error:"La biblioteca no terminó de descargarse. La copia anterior y tus datos privados se conservan."});}})());
});
self.addEventListener("message", event => {
  if (!["OFFLINE_STATUS", "PREPARE_OFFLINE"].includes(event.data?.type)) return;
  event.waitUntil((async()=>{
    try {
      if(event.data.type === "PREPARE_OFFLINE"){const port=event.ports[0];if(port){corePorts.add(port);port.postMessage({type:"OFFLINE_PROGRESS",status:coreProgress});}try{await prepareOnce();}finally{corePorts.delete(port);}}
      const cache=await caches.open(STATIC_CACHE);
      const marker=await cache.match("/offline-ready");
      if(!marker){event.ports[0]?.postMessage({ready:false});return;}
      const status=await marker.json();
      const complete=Array.isArray(status.resources) && (await Promise.all(status.resources.map(path=>cache.match(path)))).every(Boolean);
      event.ports[0]?.postMessage(complete && status.version===VERSION ? {ready:true,phase:"ready",version:status.version,preparedAt:status.preparedAt,assets:status.assets,completed:status.resources.length,total:status.resources.length} : {ready:false,error:"Faltan recursos locales. Conecta y vuelve a preparar este dispositivo."});
    } catch { event.ports[0]?.postMessage({ready:false,error:"No se pudo completar la preparación. Conserva la conexión e inténtalo de nuevo."}); }
  })());
});
// Public 3D resources have their own explicitly downloaded, content-verified pack.
// No owner identifier, farm record, API response or external download belongs here.
const FARM_MANIFEST = "/farm-3d/manifest.json";
const FARM_PACK_PREFIX = "morochos-farm-pack-v1-";
const FARM_PACK_MARKER = "/farm-3d/pack-ready";
const FARM_MAX_BYTES = 32 * 1024 * 1024;
const FARM_NOTICES = new Set([...FARM_DOCUMENTS].filter(path=>path!==FARM_MANIFEST));
const safeFarmAsset = path => typeof path==="string" && /^\/farm-3d\/v1\/[a-z0-9][a-z0-9-]*\.(glb|webp)$/.test(path);
const farmDigest = async bytes => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)),byte=>byte.toString(16).padStart(2,"0")).join("");
function farmManifest(value) {
 if(!value || value.version!==1 || !Array.isArray(value.assets) || !value.assets.length || value.assets.length>256 || !Array.isArray(value.notices) || value.notices.some(path=>!FARM_NOTICES.has(path)) || new Set(value.notices).size!==value.notices.length)throw new Error("invalid_manifest");
 const paths=new Set();let bytes=0;
 for(const item of value.assets){
  if(!item || !safeFarmAsset(item.path) || paths.has(item.path) || !Number.isSafeInteger(item.bytes) || item.bytes<1 || item.bytes>8*1024*1024 || !/^[a-f0-9]{64}$/.test(item.sha256) || typeof item.license!=="string" || !item.license.trim() || typeof item.creator!=="string" || !item.creator.trim() || typeof item.source!=="string" || !/^https:\/\//.test(item.source) || typeof item.licenseUrl!=="string" || !/^https:\/\//.test(item.licenseUrl))throw new Error("invalid_manifest");
  paths.add(item.path);bytes+=item.bytes;
 }
 if(bytes!==value.totalBytes || bytes>FARM_MAX_BYTES)throw new Error("invalid_manifest");
 return value;
}
function farmCheckCancelled(signal){if(signal?.aborted)throw new Error("cancelled");}
function farmFailure(code,path,httpStatus){const error=new Error(code);error.farmDiagnostic={code,path,httpStatus,deployment:VERSION};return error;}
async function farmFetch(path,limit,signal){
 if(path!=="/offline-assets.json" && path!==FARM_MANIFEST && !safeFarmAsset(path) && !FARM_NOTICES.has(path))throw farmFailure("invalid_path",undefined);
 const controller=new AbortController(),cancel=()=>controller.abort();let timedOut=false;
 signal?.addEventListener("abort",cancel,{once:true});
 const timer=setTimeout(()=>{timedOut=true;cancel();},45000);
 try{
  farmCheckCancelled(signal);
  // A private Site's access cookie is needed even for its generic static resources.
  // Credentials stay same-origin; URLs are fixed/validated and redirects are refused.
  const response=await fetch(path,{signal:controller.signal,cache:"no-store",credentials:"same-origin",redirect:"error"});
  if(!response.ok)throw farmFailure("http",path,response.status);
  if(response.redirected || (response.url && new URL(response.url,self.location.origin).origin!==self.location.origin))throw farmFailure("origin",path);
  // "private" permits this browser's explicitly requested cache of generic files;
  // it does not authorize caching any API, record or unlisted route. no-store forbids it.
  if(/(?:^|,)\s*no-store(?:\s|,|$)/i.test(response.headers.get("cache-control") || ""))throw farmFailure("cache_policy",path);
  const reader=response.body?.getReader(),chunks=[];let length=0;
  if(reader){try{while(true){farmCheckCancelled(signal);const chunk=await reader.read();if(chunk.done)break;length+=chunk.value.byteLength;if(length>limit){await reader.cancel();throw new Error("invalid_bytes");}chunks.push(chunk.value);}}finally{reader.releaseLock();}}
  else{const bytes=new Uint8Array(await response.arrayBuffer());length=bytes.byteLength;chunks.push(bytes);}
  if(length>limit)throw new Error("invalid_bytes");
  farmCheckCancelled(signal);const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  return {bytes,response:new Response(bytes,{headers:{"content-type":response.headers.get("content-type") || (path.endsWith(".glb")?"model/gltf-binary":path.endsWith(".webp")?"image/webp":"text/plain; charset=utf-8")}})};
 }catch(error){
  if(signal?.aborted)throw new Error("cancelled");
  if(error.farmDiagnostic)throw error;
  throw farmFailure(timedOut?"timeout":error.message==="invalid_bytes"?"invalid_bytes":"network_or_redirect",path);
 }finally{clearTimeout(timer);signal?.removeEventListener("abort",cancel);}
}
function farmJson(bytes,path){try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw farmFailure("invalid_json",path);}}
async function farmDeployment(signal){const {bytes}=await farmFetch("/offline-assets.json",1024*1024,signal);if(farmJson(bytes,"/offline-assets.json").revision!==VERSION)throw farmFailure("deployment_changed","/offline-assets.json");}
async function farmPackInCache(name,verify=true){
 try{
  const cache=await caches.open(name),marker=await cache.match(FARM_PACK_MARKER),document=await cache.match(FARM_MANIFEST);
  if(!marker || !document)return null;
  const index=await marker.json(),raw=await document.arrayBuffer(),manifest=farmManifest(JSON.parse(new TextDecoder().decode(raw)));
  if(index.schema!==1 || index.deployment!==VERSION || index.version!==await farmDigest(raw) || !Array.isArray(index.notices) || index.notices.length!==manifest.notices.length || new Set(index.notices.map(item=>item.path)).size!==manifest.notices.length || index.notices.some(item=>!manifest.notices.includes(item.path) || !Number.isSafeInteger(item.bytes) || item.bytes<1 || item.bytes>1024*1024 || !/^[a-f0-9]{64}$/.test(item.sha256)))return null;
  if(verify)for(const item of [...manifest.assets,...index.notices]){const response=await cache.match(item.path);if(!response)return null;const data=await response.arrayBuffer();if(data.byteLength!==item.bytes || await farmDigest(data)!==item.sha256)return null;}
  return {cache,index,manifest};
 }catch{return null;}
}
// Concurrent model loads share one verification pass, but later checks always read
// the actual cache again, so eviction cannot be hidden behind a remembered flag.
let farmReadCheck=null;
async function committedFarmPack(path,verify=true){
 const find=async()=>{for(const name of (await caches.keys()).reverse()){if(!name.startsWith(FARM_PACK_PREFIX))continue;const pack=await farmPackInCache(name,verify);if(pack)return pack;}return null;};
 if(!farmReadCheck){const pending=find();farmReadCheck=pending;void pending.finally(()=>{if(farmReadCheck===pending)farmReadCheck=null;}).catch(()=>undefined);}
 const pack=await farmReadCheck;if(!pack)return null;
 if(!path)return pack;
 if(path!==FARM_MANIFEST && !pack.manifest.assets.some(item=>item.path===path) && !pack.manifest.notices.includes(path))return null;
 return (await pack.cache.match(path)) || null;
}
let farmJob=null,farmAttempt=0;
function farmProgress(job,update){job.progress={...job.progress,...update};for(const port of job.ports.values())try{port.postMessage({type:"FARM_ASSETS_PROGRESS",status:job.progress});}catch{/* A closed page cannot cancel another page's report. */}}
async function farmAssetStatus(includeProgress=true){
 if(includeProgress && farmJob)return {...farmJob.progress,phase:farmJob.progress.phase,ready:false};
 const pack=await committedFarmPack(null,true);
 if(!pack)return {ready:false,phase:"idle",completedFiles:0,totalFiles:0,completedBytes:0,totalBytes:0};
 const base={version:pack.index.version,deployment:pack.index.deployment,preparedAt:pack.index.preparedAt,completedFiles:pack.manifest.assets.length,totalFiles:pack.manifest.assets.length,completedBytes:pack.manifest.totalBytes,totalBytes:pack.manifest.totalBytes,licensesReady:true};
 return await coreReady()?{...base,ready:true,phase:"ready"}:{...base,ready:false,phase:"error",error:"Los modelos están guardados, pero falta código de la aplicación. Conecta y vuelve a descargar."};
}
async function prepareFarmPack(job){
 const signal=job.controller.signal,name=FARM_PACK_PREFIX+Date.now()+"-"+(++farmAttempt);let committed=false;
 try{
  await farmDeployment(signal);
  const document=await farmFetch(FARM_MANIFEST,1024*1024,signal),manifest=farmManifest(farmJson(document.bytes,FARM_MANIFEST)),version=await farmDigest(document.bytes);
  farmProgress(job,{phase:"downloading",version,deployment:VERSION,totalFiles:manifest.assets.length,totalBytes:manifest.totalBytes});
  if(!await coreReady())await prepareOnce();
  farmCheckCancelled(signal);
  const cache=await caches.open(name),notices=[];
  await cache.put(FARM_MANIFEST,document.response);
  for(const item of manifest.assets){
   farmCheckCancelled(signal);const result=await farmFetch(item.path,item.bytes,signal);
   if(result.bytes.byteLength!==item.bytes || await farmDigest(result.bytes)!==item.sha256)throw farmFailure("invalid_bytes",item.path);
   farmCheckCancelled(signal);await cache.put(item.path,result.response);farmCheckCancelled(signal);
   farmProgress(job,{completedFiles:job.progress.completedFiles+1,completedBytes:job.progress.completedBytes+item.bytes});
  }
  farmProgress(job,{phase:"verifying"});
  for(const path of manifest.notices){const result=await farmFetch(path,1024*1024,signal);if(!result.bytes.byteLength)throw new Error("unavailable");notices.push({path,bytes:result.bytes.byteLength,sha256:await farmDigest(result.bytes)});farmCheckCancelled(signal);await cache.put(path,result.response);}
  // Re-read deployment and exact manifest after the download. Changed filenames, hashes,
  // license declarations or a rolling deployment cannot publish a mixed pack.
  await farmDeployment(signal);
  const current=await farmFetch(FARM_MANIFEST,1024*1024,signal);
  if(await farmDigest(current.bytes)!==version)throw new Error("deployment_changed");
  if(!await coreReady())throw new Error("shell_missing");
  for(const item of [...manifest.assets,...notices]){farmCheckCancelled(signal);const response=await cache.match(item.path);if(!response)throw new Error("evicted");const bytes=await response.arrayBuffer();if(bytes.byteLength!==item.bytes || await farmDigest(bytes)!==item.sha256)throw new Error("invalid_bytes");}
  farmCheckCancelled(signal);
  const preparedAt=new Date().toISOString();
  await cache.put(FARM_PACK_MARKER,new Response(JSON.stringify({schema:1,version,deployment:VERSION,preparedAt,notices}),{headers:{"content-type":"application/json"}}));
  farmCheckCancelled(signal);
  if(!await farmPackInCache(name,true))throw new Error("evicted");
  farmCheckCancelled(signal);committed=true;farmReadCheck=null;
  farmProgress(job,{ready:true,phase:"ready",licensesReady:true,preparedAt});
  // Keep the old coherent copy until the new marker and actual contents are verified.
  for(const old of await caches.keys())if(old!==name && old.startsWith(FARM_PACK_PREFIX)){try{const prior=await caches.open(old);if(await prior.match(FARM_PACK_MARKER))await caches.delete(old);}catch{/* Cleanup failure does not invalidate a verified pack. */}}
  return job.progress;
 }finally{if(!committed)await caches.delete(name);}
}
function farmPackError(error){
 const code=error?.farmDiagnostic?.code || error?.message,path=error?.farmDiagnostic?.path;
 if(error?.name==="QuotaExceededError")return "No hay espacio suficiente. Libera espacio en el dispositivo y vuelve a intentar.";
 if(code==="deployment_changed")return "La versión cambió durante la descarga. Espera a que termine la actualización, recarga la aplicación y vuelve a intentar.";
 if(code==="invalid_path")return "La ruta solicitada no pertenece al paquete público permitido.";
 if(code==="invalid_manifest" || code==="invalid_bytes")return "Un recurso no pasó la verificación"+(path?": "+path:"")+". La descarga no se marcó como completa; vuelve a intentar.";
 if(code==="http")return "No se pudo descargar "+path+" (HTTP "+error.farmDiagnostic.httpStatus+"). Comprueba que tienes acceso al sitio y vuelve a intentar.";
 if(code==="cache_policy")return "El servidor no permite guardar "+path+" sin conexión. No se guardó una copia privada ni se marcó como completo.";
 if(code==="origin")return "Se rechazó una redirección al descargar "+path+". Recarga el sitio y comprueba tu acceso.";
 if(code==="network_or_redirect")return "No se pudo acceder a "+path+". Puede faltar conexión o acceso al sitio; una redirección tampoco está permitida. Recarga y reintenta.";
 if(code==="invalid_json")return "El servidor no devolvió un manifiesto válido en "+path+". Recarga el sitio y comprueba tu acceso.";
 if(code==="timeout")return "Se agotó el tiempo al descargar "+path+". Comprueba la conexión y vuelve a intentar.";
 if(code==="shell_missing")return "Falta código de la aplicación. Mantén la conexión para completar su actualización y vuelve a intentar.";
 if(code==="evicted")return "El navegador eliminó parte de la descarga antes de terminar. Libera espacio y vuelve a intentar.";
 return "No se pudo completar el paquete 3D. La copia anterior se conserva; conecta y vuelve a intentar.";
}
self.addEventListener("message",event=>{
 const type=event.data?.type,port=event.ports?.[0];
 if(type==="CANCEL_FARM_ASSETS"){if(farmJob && farmJob.ports.has(event.data.requestId))farmJob.controller.abort();return;}
 if(type!=="FARM_ASSETS_STATUS" && type!=="PREPARE_FARM_ASSETS")return;
 event.waitUntil((async()=>{
  if(type==="FARM_ASSETS_STATUS"){try{port?.postMessage({type:"FARM_ASSETS_RESULT",status:await farmAssetStatus()});}catch{port?.postMessage({type:"FARM_ASSETS_RESULT",status:{ready:false,phase:"error",error:"No se pudo comprobar el almacenamiento local."}});}return;}
  if(!port || typeof event.data.requestId!=="string" || event.data.requestId.length>100)return;
  if(farmJob?.controller.signal.aborted)await farmJob.promise;
  if(!farmJob){
   const job={controller:new AbortController(),ports:new Map(),progress:{ready:false,phase:"checking",completedFiles:0,totalFiles:0,completedBytes:0,totalBytes:0}};farmJob=job;
   job.promise=prepareFarmPack(job).catch(async error=>{const cancelled=job.controller.signal.aborted;const prior=await farmAssetStatus(false).catch(()=>({ready:false}));return {...job.progress,...prior,phase:cancelled?"cancelled":"error",diagnostic:cancelled?undefined:{...error.farmDiagnostic,code:error.farmDiagnostic?.code || error.name || "unknown",deployment:VERSION,phase:job.progress.phase},error:cancelled?"Descarga cancelada. La copia anterior se conserva.":farmPackError(error)};}).finally(()=>{if(farmJob===job)farmJob=null;});
  }
  const job=farmJob;job.ports.set(event.data.requestId,port);
  port.postMessage({type:"FARM_ASSETS_PROGRESS",status:job.progress});
  const status=await job.promise;port.postMessage({type:"FARM_ASSETS_RESULT",status});
 })());
});

// Hashed build files can outlive a document during an update. Only exact public
// code paths from committed core manifests may cross generations, never HTML/API.
async function committedCoreCode(path){
 if(!/^\/assets\/[a-zA-Z0-9_./-]+\.(js|css|woff2?)$/.test(path)||path.includes(".."))return null;
 for(const name of (await caches.keys()).reverse()){
  if(!/^morochos-v[0-9]+-static$/.test(name)||name===STATIC_CACHE)continue;
  const cache=await caches.open(name),marker=await cache.match("/offline-ready");if(!marker)continue;
  try{const state=await marker.json();if(state.version+"-static"!==name||!Array.isArray(state.resources)||!state.resources.includes(path))continue;const response=await cache.match(path);if(response)return response;}catch{/* Incomplete index is not a committed build. */}
 }
 return null;
}

self.addEventListener("fetch", event => {
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  // Authentication and all API data remain network-only. Local app records live in IndexedDB.
  if(url.pathname.startsWith("/api/") || /signin|signout|callback/.test(url.pathname))return;
  if(request.mode==="navigate"&&!FARM_DOCUMENTS.has(url.pathname)){
    event.respondWith((async()=>{
      try {
        const response=await fetchWithTimeout(request,4500);
        if(cacheable(response) && PUBLIC_PAGES.has(url.pathname) && !url.search) {
          const cache=await caches.open(PAGE_CACHE);await cache.put(url.pathname,response.clone());
        }
        return response;
      } catch {
        if(url.pathname==="/app" || url.pathname==="/app-local"){const current=await caches.open(STATIC_CACHE);return (await coreReady() && await current.match("/app-local")) || current.match("/offline");}
        const current=await caches.open(STATIC_CACHE),pages=await caches.open(PAGE_CACHE);
        return (PUBLIC_PAGES.has(url.pathname) && ((await pages.match(url.pathname)) || (await current.match(url.pathname)) || (await committedLibrary(url.pathname,true)))) || (libraryRoute(url.pathname) && await current.match("/biblioteca-local")) || current.match("/offline");
      }
    })());return;
  }
  // Optional satellite packs are committed separately per workspace, never duplicated here.
  if(url.pathname.startsWith("/satellite-packs/"))return;
  if(url.pathname.startsWith("/map-packs/"))return;
  if(url.pathname.startsWith("/sticker-packs/"))return;
  const farmDetail=FARM_DOCUMENTS.has(url.pathname)||safeFarmAsset(url.pathname);
  if(!farmDetail && !["script","style","image","font"].includes(request.destination) && url.pathname !== "/venezuela-states.geojson" && url.pathname !== "/map-context/venezuela-region-20261007-z6.pmtiles")return;
  event.respondWith((async()=>{
    // Only a fully committed pack takes precedence over incidental render-time caching.
    const pack=farmDetail&&!url.search?await committedFarmPack(url.pathname,true):null;if(pack)return pack;
    const current=await caches.open(STATIC_CACHE);const cached=(await current.match(request)) || (!url.search && await committedCoreCode(url.pathname)) || (await committedLibrary(request));if(cached)return cached;
    const response=await fetch(request);
    if(cacheable(response)){const cache=await caches.open(STATIC_CACHE);await cache.put(request,response.clone());}
    return response;
  })());
});
self.addEventListener("sync", event=>{
  if(event.tag!=="morochos-sync")return;
  event.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(clients=>clients.forEach(client=>client.postMessage({type:"TRY_SYNC"}))));
});
async function fetchWithTimeout(request,milliseconds,signal){
 const controller=new AbortController(),cancel=()=>controller.abort();if(signal?.aborted)controller.abort();signal?.addEventListener("abort",cancel,{once:true});const timer=setTimeout(cancel,milliseconds);
 try{return await fetch(request,{signal:controller.signal,cache:"no-store"});}finally{clearTimeout(timer);signal?.removeEventListener("abort",cancel);}
}
