const VERSION = "morochos-v18";
const STATIC_CACHE = VERSION + "-static";
const PAGE_CACHE = VERSION + "-pages";
const API_CACHE = VERSION + "-api";
const LIBRARY_CACHE=VERSION+"-library";
function isLibraryCache(name){return /^morochos-v[0-9]+-library(?:-[a-zA-Z0-9-]+)?$/.test(name); }
const ESSENTIAL = ["/map-context/venezuela-region-20261007-z6.pmtiles","/plan-oblique/chicken-coop-256.webp","/plan-oblique/banana-plant-256.webp","/plan-oblique/pig-256.webp","/plan-oblique/hen-256.webp","/plan-oblique/greenhouse-256.webp","/plan-oblique/rural-house-256.webp","/plan-oblique/wood-cabin-256.webp","/plan-oblique/coffee-shrub-256.webp","/plan-oblique/cattle-256.webp","/plan-oblique/open-shed-256.webp","/plan-oblique/cacao-tree-256.webp","/plan-vegetation/cattle-256.png","/plan-vegetation/pig-256.png","/plan-vegetation/hen-256.png","/plan-vegetation/cacao-canopy-256.png","/plan-vegetation/coffee-shrub-256.png","/plan-vegetation/banana-plant-256.png","/plan-vegetation/low-crop-256.png","/inventory-examples/forrajes.webp","/inventory-examples/medicinas.webp","/inventory-examples/semillas.webp","/inventory-examples/fertilizantes.webp","/inventory-examples/sal.webp","/inventory-examples/herramientas.webp","/inventory-examples/combustible.webp","/inventory-examples/otros.webp","/finca-demo", "/biblioteca-local", "/offline", "/app-local", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/logo-morochos.webp", "/venezuela-states.geojson"];
const PRECACHE = ["/", "/plataforma", "/tienda", "/aprende", "/morochito-transparent.webp", "/hero-apure-640.webp"];
const PUBLIC_PAGES = new Set(["/finca-demo", "/stickers", "/biblioteca-local", "/legal/privacidad", "/legal/terminos", "/legal/comercio", "/creditos-fotograficos","/", "/offline", "/app-local", "/plataforma", "/tienda", "/aprende", "/nosotros", "/rubros", "/guia-institucional"]);
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

async function prepare() {
  // Do not rewrite a coherent private/app shell while downloading a public library.
  if(await coreReady())return;
  const cache=await caches.open(STATIC_CACHE),stageName=VERSION+"-core-repair",stage=await caches.open(stageName);
  try{
    const manifestResponse=await fetchWithTimeout("/offline-assets.json",20000);
    if(!cacheable(manifestResponse))throw new Error("Missing offline manifest");
    const manifest=await manifestResponse.json();
    if(manifest.revision!==VERSION||!Array.isArray(manifest.assets)||!manifest.assets.length||manifest.assets.some(path=>typeof path!=="string"||path.includes("..")||!/^\/assets\/[a-zA-Z0-9_./-]+\.(js|css|woff2?)$/.test(path)))throw new Error("Invalid offline resource manifest");
    const resources=[...ESSENTIAL,...manifest.assets];
    for(const path of resources)if(!await cache.match(path))await save(stage,path);
    const finalManifest=await fetchWithTimeout("/offline-assets.json",20000);
    if(!cacheable(finalManifest)||(await finalManifest.json()).revision!==VERSION)throw new Error("Deployment changed during preparation");
    for(const path of resources){const repaired=await stage.match(path);if(repaired)await cache.put(path,repaired);}
    if(!(await Promise.all(resources.map(path=>cache.match(path)))).every(Boolean))throw new Error("Incomplete app shell");
    await cache.put("/offline-ready",new Response(JSON.stringify({version:VERSION,assets:manifest.assets.length,resources,preparedAt:new Date().toISOString()}),{headers:{"content-type":"application/json"}}));
    await Promise.allSettled(PRECACHE.map(path=>save(cache,path)));
  }finally{await caches.delete(stageName);}
}

let preparation;
function prepareOnce() { if (!preparation) preparation=prepare().finally(()=>{preparation=null;}); return preparation; }
self.addEventListener("install", event => { event.waitUntil(prepareOnce().then(()=>self.skipWaiting())); });
self.addEventListener("activate", event => {
  event.waitUntil((async()=>{
    // Never migrate previous page/API caches: they could contain authenticated HTML.
    for(const key of await caches.keys()) if(/^morochos-v\d+-(static|pages|api|core-repair)$/.test(key) && ![STATIC_CACHE,PAGE_CACHE,API_CACHE,LIBRARY_CACHE].includes(key)) await caches.delete(key);
    await self.clients.claim();
  })());
});
const LIBRARY_ROUTES=["/stickers","/marketplace","/profesionales","/fincas","/red","/proyectos","/aprende","/rubros","/tienda","/plataforma","/nosotros","/guia-institucional","/legal","/creditos-fotograficos","/biblioteca-local"];
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
 const safeAsset=path=>typeof path==="string"&&!path.includes("..")&&!path.startsWith("//")&&!path.startsWith("/api/")&&(path==="/map-context/venezuela-region-20261007-z6.pmtiles"||/^\/[a-zA-Z0-9_./-]+\.(webp|png|svg|geojson)$/.test(path)||/^\/assets\/[a-zA-Z0-9_./-]+\.(js|css|woff2?)$/.test(path));
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
      if(event.data.type === "PREPARE_OFFLINE") await prepareOnce();
      const cache=await caches.open(STATIC_CACHE);
      const marker=await cache.match("/offline-ready");
      if(!marker){event.ports[0]?.postMessage({ready:false});return;}
      const status=await marker.json();
      const complete=Array.isArray(status.resources) && (await Promise.all(status.resources.map(path=>cache.match(path)))).every(Boolean);
      event.ports[0]?.postMessage(complete ? {ready:true,version:status.version,preparedAt:status.preparedAt,assets:status.assets} : {ready:false,error:"Faltan recursos locales. Conecta y vuelve a preparar este dispositivo."});
    } catch { event.ports[0]?.postMessage({ready:false,error:"No se pudo completar la preparación. Conserva la conexión e inténtalo de nuevo."}); }
  })());
});
self.addEventListener("fetch", event => {
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  // Authentication and all API data remain network-only. Local app records live in IndexedDB.
  if(url.pathname.startsWith("/api/") || /signin|signout|callback/.test(url.pathname))return;
  if(request.mode==="navigate"){
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
  if(!["script","style","image","font"].includes(request.destination) && url.pathname !== "/venezuela-states.geojson" && url.pathname !== "/map-context/venezuela-region-20261007-z6.pmtiles")return;
  event.respondWith((async()=>{
    const current=await caches.open(STATIC_CACHE);const cached=(await current.match(request)) || (await committedLibrary(request));if(cached)return cached;
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
