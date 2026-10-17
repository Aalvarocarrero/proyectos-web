import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import {indexedDB as libraryIndexedDB} from 'fake-indexeddb';
import {readFileSync} from 'node:fs';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const vite = await createServer({appType:'custom', configFile:false, root, resolve:{alias:{'@':root}}, server:{middlewareMode:true,hmr:false,watch:null}});
after(() => vite.close());
const { latestPendingOperations } = await vite.ssrLoadModule('/lib/sync-reconciliation.ts');
const {databaseNameForOwner,localOwner,selectVerifiedDashboardOwner}=await vite.ssrLoadModule('/lib/offline-owner.ts');
const {legacyRecoveryCandidates}=await vite.ssrLoadModule('/lib/legacy-recovery.ts');
const operation = (id, entityId, action, date) => ({ id, entityType:'farm-record', entityId, action, payload:{title:id}, clientUpdatedAt:date });
test('an edit or delete made during synchronization remains the latest local intent', () => {
  const old = operation('old','animal','upsert','2026-10-05T01:00:00Z');
  const edit = operation('edit','animal','upsert','2026-10-05T01:01:00Z');
  const remove = operation('remove','animal','delete','2026-10-05T01:02:00Z');
  const other = operation('other','potrero','upsert','2026-10-05T01:00:00Z');
  assert.deepEqual(latestPendingOperations([edit,old,other]).map(x=>x.id), ['edit','other']);
  assert.deepEqual(latestPendingOperations([remove,edit,old]).map(x=>x.id), ['remove']);
});
const source = await readFile(new URL('../public/sw.js', import.meta.url),'utf8');
function worker(failedPath) {
 const listeners={},added=[],stores=new Map();let activated=false;
 const caches={open:async name=>{if(!stores.has(name))stores.set(name,new Map());const data=stores.get(name);return {put:async(path,response)=>{data.set(typeof path==='string'?path:path.url,response);added.push(path);},match:async path=>data.get(typeof path==='string'?path:path.url)?.clone(),delete:async path=>data.delete(path)};},keys:async()=>[...stores.keys()],delete:async name=>stores.delete(name),match:async path=>{const key=typeof path==='string'?path:new URL(path.url).pathname;for(const data of stores.values())if(data.has(key))return data.get(key).clone();}};
 const context={self:{location:{origin:'https://agro.test'},addEventListener:(type,cb)=>{const previous=listeners[type];listeners[type]=previous?event=>{previous(event);cb(event);}:cb;},skipWaiting:()=>{activated=true;},clients:{claim:async()=>{}}},caches,fetch:async request=>{const path=typeof request==='string'?request:new URL(request.url).pathname;if(path===failedPath)throw new Error('missing');return new Response(path==='/offline-assets.json'?JSON.stringify({revision:'morochos-v18',assets:['/assets/app.js','/assets/style.css']}):'resource');},URL,Response,AbortController,setTimeout,clearTimeout,indexedDB:libraryIndexedDB};
 vm.runInNewContext(source,context);
 return {listeners,added,stores,context,activated:()=>activated};
}
async function install(w){let pending;w.listeners.install({waitUntil:p=>pending=p});await pending;}
test('one missing optional image does not prevent service-worker installation',async()=>{
 const w=worker('/hero-apure-640.webp');await install(w);
 assert.equal(w.activated(),true);assert.ok(w.added.includes('/offline'));assert.ok(w.added.includes('/app-local'));assert.ok(w.added.includes('/assets/app.js'));assert.ok(w.added.includes('/offline-ready'));
});
test('missing essential fallback refuses activation rather than claiming offline readiness',async()=>{
 const w=worker('/offline');await assert.rejects(install(w));assert.equal(w.activated(),false);assert.ok(!w.added.includes('/offline-ready'));
});
test('a missing script refuses readiness and interrupted preparation can be retried',async()=>{
 const w=worker('/assets/app.js');await assert.rejects(install(w));assert.equal(w.activated(),false);
 w.context.fetch=async path=>new Response(path==='/offline-assets.json'?JSON.stringify({revision:'morochos-v18',assets:['/assets/app.js']}):'ok');await install(w);assert.equal(w.activated(),true);
});
test('API, authentication, non-GET and external requests are never intercepted',()=>{
 const w=worker();
 for(const [url,method] of [['https://agro.test/api/bootstrap','GET'],['https://agro.test/api/marketplace','GET'],['https://agro.test/signin-with-chatgpt','GET'],['https://agro.test/api/sync','POST'],['https://outside.test/a.js','GET']]){
  let intercepted=false;w.listeners.fetch({request:{url,method,mode:'navigate'},respondWith:()=>intercepted=true});assert.equal(intercepted,false,url);
 }
});
test('offline /app navigation serves the local-only shell rather than authenticated cached HTML',async()=>{
 const w=worker();await install(w);w.context.fetch=async()=>{throw new Error('offline');};let result;
 w.listeners.fetch({request:{url:'https://agro.test/app',method:'GET',mode:'navigate'},respondWith:p=>result=p});assert.equal(await (await result).text(),'resource');
 assert.ok(!w.added.includes('/app'));
});
test('activation drops old page/API caches and does not touch record storage',async()=>{
 const w=worker();w.stores.set('morochos-v16-pages',new Map());w.stores.set('morochos-v16-api',new Map());w.stores.set('unrelated',new Map());await install(w);let pending;w.listeners.activate({waitUntil:p=>pending=p});await pending;assert.ok(!w.stores.has('morochos-v16-pages'));assert.ok(!w.stores.has('morochos-v16-api'));assert.ok(w.stores.has('unrelated'));
});
test('no-store and redirected responses cannot be added to offline preparation',async()=>{
 const w=worker();w.context.fetch=async()=>new Response('{}',{headers:{'cache-control':'private, no-store'}});await assert.rejects(install(w));assert.equal(w.activated(),false);
});


test('account namespaces are distinct and legacy storage is never a new account namespace',async()=>{
 assert.notEqual(databaseNameForOwner('owner-a'),databaseNameForOwner('owner-b'));
 assert.notEqual(databaseNameForOwner('owner-a'),databaseNameForOwner('device-local'));
 assert.notEqual(databaseNameForOwner('device-local'),'los-morochos-offline');
});
test('production offline manifest contains only same-origin code resources and includes every emitted chunk',async()=>{
 const {readdir}=await import('node:fs/promises');
 const manifest=JSON.parse(await readFile(new URL('../dist/client/offline-assets.json',import.meta.url),'utf8'));
 assert.ok(manifest.assets.length>0);assert.ok(manifest.assets.every(path=>path.startsWith('/assets/')&&/\.(js|css|woff2?)$/.test(path)));
 const files=await readdir(new URL('../dist/client/assets/',import.meta.url));
 for(const file of files.filter(f=>/\.(js|css|woff2?)$/.test(f)))assert.ok(manifest.assets.includes('/assets/'+file),file);
});


test('explicit legacy recovery preserves originals, current edits and pending deletions on repetition',async()=>{
 const legacy=[{key:'farm:a',id:'a',entityType:'farm',payload:{name:'Original'},updatedAt:'2026-10-01',syncState:'pending'},{key:'farm-record:b',id:'b',entityType:'farm-record',payload:{title:'Old'},updatedAt:'2026-10-01',syncState:'pending'}];
 const before=JSON.stringify(legacy);
 assert.equal(legacyRecoveryCandidates(legacy,[],[]).length,2);
 assert.equal(legacyRecoveryCandidates(legacy,['farm:a','farm-record:b'],[]).length,0,'repeated recovery does not duplicate');
 assert.equal(legacyRecoveryCandidates(legacy,['farm:a'],[{entityType:'farm-record',entityId:'b',action:'delete'}]).length,0,'pending deletion cannot be resurrected');
 assert.equal(legacyRecoveryCandidates(legacy,[],[{entityType:'farm',entityId:'a',action:'upsert'}]).length,1,'in-flight edits are protected');
 assert.equal(JSON.stringify(legacy),before,'the original recovery copy is unchanged');
});


test('offline public map fetch is served even with the empty fetch destination',async()=>{
 const w=worker();await install(w);w.context.fetch=async()=>{throw new Error('offline');};let result;
 w.listeners.fetch({request:{url:'https://agro.test/venezuela-states.geojson',method:'GET',mode:'cors',destination:''},respondWith:p=>result=p});
 // Match normal Request URL against the same-origin cache key in the test adapter.
 const cache=w.stores.get('morochos-v18-static');cache.set('https://agro.test/venezuela-states.geojson',cache.get('/venezuela-states.geojson'));
 assert.equal(await (await result).text(),'resource');
});


test('runtime owner follows cross-mode navigation and a newer verified account wins late session reads',async()=>{
 const names=['location','navigator','sessionStorage','fetch'];const saved=Object.fromEntries(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
 const values=new Map();
 try {
  Object.defineProperty(globalThis,'location',{configurable:true,value:{pathname:'/app-local'}});
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{onLine:true}});
  Object.defineProperty(globalThis,'sessionStorage',{configurable:true,value:{getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)}});
  Object.defineProperty(globalThis,'fetch',{configurable:true,writable:true,value:async()=>new Response(JSON.stringify({owner:'account-a'}))});
  assert.equal(await localOwner(),'device-local');
  location.pathname='/app';assert.equal(await localOwner(),'account-a');
  selectVerifiedDashboardOwner('account-b');assert.equal(await localOwner(),'account-b');
  location.pathname='/app-local';assert.equal(await localOwner(),'device-local');
  let finish;globalThis.fetch=()=>new Promise(resolve=>{finish=resolve;});
  location.pathname='/app';const older=localOwner();
  selectVerifiedDashboardOwner('account-b');
  finish(new Response(JSON.stringify({owner:'account-a'})));await older;
  assert.equal(await localOwner(),'account-b');
  assert.equal(values.get('venezuela-agro-last-local-owner'),'account-b');
 } finally {for(const name of names){if(saved[name])Object.defineProperty(globalThis,name,saved[name]);else delete globalThis[name];}}
});


test('repeated readiness checks verify actual resources and detect cache eviction',async()=>{
 const w=worker();await install(w);
 async function status(){let pending,result;w.listeners.message({data:{type:'OFFLINE_STATUS'},ports:[{postMessage:value=>result=value}],waitUntil:p=>pending=p});await pending;return result;}
 assert.equal((await status()).ready,true);assert.equal((await status()).ready,true);
 w.stores.get('morochos-v18-static').delete('/assets/app.js');assert.equal((await status()).ready,false);
});
test('production worker fingerprint matches its resource manifest and changes from v27',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../dist/client/offline-assets.json',import.meta.url),'utf8'));
 const worker=await readFile(new URL('../dist/client/sw.js',import.meta.url),'utf8');
 assert.match(manifest.revision,/^morochos-v[0-9]+$/);assert.notEqual(manifest.revision,'morochos-v17');assert.ok(worker.includes(`const VERSION = "${manifest.revision}";`));
});

test('account split requires connection and confirmed local source before authenticated request',()=>{
 const source=readFileSync(new URL('../components/farm-dashboard.tsx',import.meta.url),'utf8');
 const block=source.slice(source.indexOf('async function splitArea('),source.indexOf('\n  return (',source.indexOf('async function splitArea(')));
 assert.doesNotMatch(block,/queueMutation/);assert.match(block,/if\(!navigator.onLine\)/);assert.match(block,/assertAreaReadyForOnlineSplit/);assert.match(block,/splitDeviceLocalArea/);assert.match(block,/x-local-owner/);
});

async function libraryMessage(w,type){let pending,result;w.listeners.message({data:{type,generation:0},ports:[{postMessage:value=>result=value}],waitUntil:p=>pending=p});if(pending)await pending;return result;}
test('public route cold-start falls back to neutral library, never private directory HTML',async()=>{
 const w=worker();await install(w);w.context.fetch=async()=>{throw new Error('offline');};
 for(const path of ['/marketplace','/profesionales/persona','/fincas/finca','/red/publicacion','/proyectos','/aprende/guia']){let reply;w.listeners.fetch({request:{method:'GET',url:'https://agro.test'+path,mode:'navigate'},respondWith:r=>reply=r});assert.equal(await (await reply).text(),'resource');assert.ok(w.added.includes('/biblioteca-local'));}
 let reply;w.listeners.fetch({request:{method:'GET',url:'https://agro.test/api/offline-public',mode:'cors',destination:''},respondWith:r=>reply=r});assert.equal(reply,undefined);
});
test('public library readiness requires every declared resource, rejects private paths and clears only library caches',async()=>{
 const w=worker();await install(w);const fetch=w.context.fetch;
 w.context.fetch=async request=>request==='/offline-library-assets.json'?new Response(JSON.stringify({revision:'morochos-v18',bytes:10,assets:[{path:'/logo-morochos.webp',bytes:10},{path:'/assets/app.js',bytes:10}],pages:['/biblioteca-local','/legal/privacidad']})):fetch(request);
 assert.equal((await libraryMessage(w,'PREPARE_LIBRARY')).ready,true);
 [...w.stores].find(([name,data])=>name.startsWith('morochos-v18-library-')&&data.has('/library-ready'))[1].delete('/legal/privacidad');assert.equal((await libraryMessage(w,'LIBRARY_STATUS')).ready,false);
 w.context.fetch=async()=>new Response(JSON.stringify({revision:'morochos-v18',bytes:1,assets:[{path:'/api/media/private.webp',bytes:1}],pages:['/biblioteca-local']}));assert.equal((await libraryMessage(w,'PREPARE_LIBRARY')).ready,false);
 await libraryMessage(w,'CLEAR_LIBRARY');assert.equal([...w.stores.keys()].some(name=>name.startsWith('morochos-v18-library')),false);assert.ok(w.stores.get('morochos-v18-static').has('/app-local'));
});

test('activation retains coherent prior public library while private app always uses current shell',async()=>{
 const w=worker();await install(w);w.stores.set('morochos-v17-library',new Map([['/app-local',new Response('unsafe old private shell')],['/old-bundle.js',new Response('old matching code')]]));let work;w.listeners.activate({waitUntil:p=>work=p});await work;assert.ok(w.stores.has('morochos-v17-library'));
 w.context.fetch=async()=>{throw new Error('offline');};let reply;w.listeners.fetch({request:{method:'GET',url:'https://agro.test/app',mode:'navigate'},respondWith:p=>reply=p});assert.equal(await (await reply).text(),'resource');
});
test('library readiness refuses evicted required application code even if public images remain',async()=>{
 const w=worker();await install(w);const fetch=w.context.fetch;w.context.fetch=async request=>request==='/offline-library-assets.json'?new Response(JSON.stringify({revision:'morochos-v18',bytes:20,assets:[{path:'/logo-morochos.webp',bytes:10},{path:'/assets/app.js',bytes:10}],pages:['/biblioteca-local']})):fetch(request);
 assert.equal((await libraryMessage(w,'PREPARE_LIBRARY')).ready,true);assert.ok([...w.stores].some(([name,data])=>name.startsWith('morochos-v18-library-')&&data.has('/assets/app.js')));
 w.stores.get('morochos-v18-static').delete('/assets/style.css');assert.equal((await libraryMessage(w,'LIBRARY_STATUS')).ready,false);
});
test('failed replacement leaves prior committed library and never serves unfinished staging',async()=>{
 const w=worker();await install(w);const fetch=w.context.fetch;let broken=false;
 w.context.fetch=async request=>{if(request==='/offline-library-assets.json')return new Response(JSON.stringify({revision:'morochos-v18',bytes:10,assets:[{path:'/logo-morochos.webp',bytes:10}],pages:['/biblioteca-local','/nosotros']}));if(broken&&request==='/nosotros')throw new Error('interrupted');return fetch(request);};
 assert.equal((await libraryMessage(w,'PREPARE_LIBRARY')).ready,true);const original=[...w.stores.keys()].find(name=>name.startsWith('morochos-v18-library-'));broken=true;assert.equal((await libraryMessage(w,'PREPARE_LIBRARY')).ready,false);assert.ok(w.stores.has(original));assert.equal([...w.stores.keys()].filter(name=>name.startsWith('morochos-v18-library-')).length,1);
});
test('core repair stages missing files and refuses a mid-download deployment without replacing the existing shell',async()=>{
 const w=worker();await install(w);const core=w.stores.get('morochos-v18-static');core.set('/app-local',new Response('existing shell'));core.delete('/assets/app.js');let manifests=0;const policies=[];
 w.context.fetch=async(path,options)=>{if(path==='/offline-assets.json'){policies.push(options.cache);return new Response(JSON.stringify({revision:++manifests===1?'morochos-v18':'morochos-v19',assets:['/assets/app.js','/assets/style.css']}));}return new Response('new generation candidate');};
 let pending,result;w.listeners.message({data:{type:'PREPARE_OFFLINE'},ports:[{postMessage:value=>result=value}],waitUntil:p=>pending=p});await pending;assert.equal(result.ready,false);assert.equal(await core.get('/app-local').clone().text(),'existing shell');assert.equal(core.has('/assets/app.js'),false);assert.deepEqual(policies,['no-store','no-store']);
});
test('private app shows safe offline fallback instead of an incomplete cached shell',async()=>{const w=worker();await install(w);const core=w.stores.get('morochos-v18-static');core.set('/app-local',new Response('incomplete farm UI'));core.set('/offline',new Response('safe offline guidance'));core.delete('/assets/app.js');w.context.fetch=async()=>{throw new Error('offline');};let response;w.listeners.fetch({request:{method:'GET',url:'https://agro.test/app',mode:'navigate'},respondWith:p=>response=p});assert.equal(await(await response).text(),'safe offline guidance');});
test('regional preparation deadline remains active through a stalled cache body',async()=>{const w=worker(),timers=[];let bodyStarted=false,signal;w.context.setTimeout=(fn,ms)=>{timers.push({fn,ms});return timers.length;};w.context.clearTimeout=()=>{};w.context.fetch=async(_path,options)=>{signal=options.signal;return new Response('known public response');};const pending=w.context.save({put:async()=>{bodyStarted=true;await new Promise(()=>{});}},'/map-context/venezuela-region-20261007-z6.pmtiles');const rejected=assert.rejects(pending,/cancelled/);await new Promise(resolve=>setImmediate(resolve));assert.equal(bodyStarted,true);assert.equal(timers[0].ms,180000);timers[0].fn();await rejected;assert.equal(signal.aborted,true);});
test('explicit preparation cancellation interrupts a stalled cache body without waiting for deadline',async()=>{const w=worker(),controller=new AbortController();let bodyStarted=false;const pending=w.context.save({put:async()=>{bodyStarted=true;await new Promise(()=>{});}},'/map-context/venezuela-region-20261007-z6.pmtiles',controller.signal);const rejected=assert.rejects(pending,/cancelled/);await new Promise(resolve=>setImmediate(resolve));assert.equal(bodyStarted,true);controller.abort();await rejected;});

test('first preparation includes the read-only model and it reopens from its own document offline',async()=>{
 const w=worker();await install(w);assert.ok(w.added.includes('/finca-modelo'));
 w.stores.get('morochos-v18-static').set('/finca-modelo',new Response('read-only model document'));
 w.context.fetch=async()=>{throw new Error('offline');};let response;
 w.listeners.fetch({request:{method:'GET',url:'https://agro.test/finca-modelo',mode:'navigate'},respondWith:p=>response=p});
 assert.equal(await(await response).text(),'read-only model document');
});
test('an update waits instead of replacing the worker of open tabs and their lazy bundles',async()=>{
 const w=worker();w.context.self.registration={active:{scriptURL:'https://agro.test/sw.js'}};
 await install(w);assert.equal(w.activated(),false,'old clients must close before activation');
});
test('explicit preparation streams counted progress and never calls an incomplete shell ready',async()=>{
 const w=worker();let pending;const replies=[];
 w.listeners.message({data:{type:'PREPARE_OFFLINE'},ports:[{postMessage:value=>replies.push(value)}],waitUntil:p=>pending=p});await pending;
 const progress=replies.filter(value=>value.type==='OFFLINE_PROGRESS').map(value=>value.status);
 assert.ok(progress.some(value=>value.phase==='downloading'&&value.completed>0&&value.completed<=value.total));
 assert.equal(progress.filter(value=>value.ready).every(value=>value.completed===value.total),true);
 assert.equal(replies.at(-1).ready,true);assert.equal(replies.at(-1).completed,replies.at(-1).total);
});
test('read-only model registers app resources without mounting account or sync services',async()=>{
 const layout=await readFile(new URL('../app/layout.tsx',import.meta.url),'utf8');
 const registration=await readFile(new URL('../components/offline-worker-registration.tsx',import.meta.url),'utf8');
 const services=await readFile(new URL('../components/account-services.tsx',import.meta.url),'utf8');
 assert.match(layout,/<OfflineWorkerRegistration\s*\/>/);assert.match(registration,/serviceWorker\?\.register/);
 assert.doesNotMatch(registration,/syncNow|offline-db|offline-owner/);assert.match(services,/path==="\/finca-modelo"/);
});
test('a still-active worker serves exact immutable chunks from a committed newer build only',async()=>{
 const w=worker();await install(w);
 w.stores.set('morochos-v19-static',new Map([
  ['/offline-ready',new Response(JSON.stringify({version:'morochos-v19',resources:['/assets/new-lazy.js','/app-local']}))],
  ['/assets/new-lazy.js',new Response('newer immutable lazy code')],['/app-local',new Response('must not cross generations')],
 ]));
 w.stores.set('morochos-v20-core-repair',new Map([['/assets/uncommitted.js',new Response('uncommitted')]]));
 assert.equal(await(await w.context.committedCoreCode('/assets/new-lazy.js')).text(),'newer immutable lazy code');
 for(const path of ['/app-local','/api/private.js','/assets/new-lazy.js?x=1','/assets/uncommitted.js'])assert.equal(await w.context.committedCoreCode(path),null,path);
});
test('preparing an update reuses matching immutable code but downloads fresh neutral documents',async()=>{
 const w=worker();w.stores.set('morochos-v17-static',new Map([
  ['/offline-ready',new Response(JSON.stringify({version:'morochos-v17',resources:['/assets/app.js','/app-local']}))],
  ['/assets/app.js',new Response('same hashed code')],['/app-local',new Response('old neutral document')],
 ]));
 await install(w);const core=w.stores.get('morochos-v18-static');
 assert.equal(await core.get('/assets/app.js').clone().text(),'same hashed code');
 assert.equal(await core.get('/app-local').clone().text(),'resource');
});
