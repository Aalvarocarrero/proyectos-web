import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import {indexedDB,IDBKeyRange} from 'fake-indexeddb';

// Every database and endpoint in this suite is synthetic and process-local.
const root=fileURLToPath(new URL('..',import.meta.url));
const storage=()=>{const values=new Map();return{getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};};
const globals={indexedDB,IDBKeyRange,location:{pathname:'/app',origin:'https://synthetic.invalid'},navigator:{onLine:false},localStorage:storage(),sessionStorage:storage(),window:new EventTarget(),fetch:async()=>{throw new Error('Unexpected network call');}};
const originals=new Map(Object.keys(globals).map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
for(const [key,value] of Object.entries(globals))Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
const db=await vite.ssrLoadModule('/lib/offline-db.ts'),owner=await vite.ssrLoadModule('/lib/offline-owner.ts');
const {parseLocalBackup}=await vite.ssrLoadModule('/lib/backup-import.ts');
after(async()=>{await vite.close();for(const[key,value]of originals){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}});
function account(id){location.pathname='/app';owner.selectVerifiedDashboardOwner(id);}
async function record(id,type,data={}){return db.queueMutation({id:`operation_${id}`,entityType:'farm-record',entityId:id,action:'upsert',payload:{farmId:'roundtrip_farm',recordType:type,category:'Prueba',title:id,data}});}

test('full exported farm restores linked records and deletion intents locally without adopting source identity or transmitting',async()=>{
 account('roundtrip-source');navigator.onLine=false;
 await db.queueMutation({id:'operation_farm',entityType:'farm',entityId:'roundtrip_farm',action:'upsert',payload:{name:'Finca sintética',location:'Prueba',areaSqM:10000,objective:''}});
 await record('roundtrip_area','area',{areaSqM:2500});
 await record('roundtrip_animal','animal',{areaId:'roundtrip_area',tag:'SYN-001',weightKg:250});
 await record('roundtrip_weight','weight',{animalId:'roundtrip_animal',weightKg:260,measuredAt:'2026-10-12'});
 await record('roundtrip_removed','inventory',{quantity:2,unit:'kg'});
 await db.queueMutation({id:'operation_delete',entityType:'farm-record',entityId:'roundtrip_removed',action:'delete',payload:{}});
 const exported=await db.exportLocalBackup();
 assert.equal(parseLocalBackup(JSON.stringify(exported)).entities.length,4);
 const serialized=JSON.stringify(exported);
 account('roundtrip-other-account');
 let requests=0;globalThis.fetch=async()=>{requests++;throw new Error('No network permitted');};
 assert.deepEqual(await db.importBackupToDevice(serialized),{imported:4,skipped:0,deletions:1});
 assert.equal(requests,0);
 assert.equal((await db.exportLocalBackup()).entities.length,0,'restore never writes into the active account');
 location.pathname='/app-local';owner.chooseOfflineWorkspace(false);
 const restored=await db.exportLocalBackup();
 assert.equal(restored.owner,'device-local');
 assert.equal(restored.entities.length,4);
 assert.ok(restored.entities.every(row=>row.syncState==='pending'));
 assert.equal(restored.entities.find(row=>row.id==='roundtrip_animal').payload.data.areaId,'roundtrip_area');
 assert.equal(restored.entities.find(row=>row.id==='roundtrip_weight').payload.data.animalId,'roundtrip_animal');
 assert.ok(!restored.entities.some(row=>row.id==='roundtrip_removed'));
 assert.ok(restored.outbox.some(row=>row.entityId==='roundtrip_removed'&&row.action==='delete'));
 assert.ok(restored.outbox.every(row=>!exported.outbox.some(old=>old.id===row.id)),'restored intents have new local operation IDs');
 assert.equal(restored.meta.some(row=>row.key==='lastSync'),false,'restore does not import a central-backup claim');
 const again=await db.importBackupToDevice(serialized);assert.equal(again.imported,0);assert.equal(again.deletions,0);
 account('roundtrip-source');
 const unchanged=await db.exportLocalBackup();assert.deepEqual(unchanged.entities,exported.entities);assert.deepEqual(unchanged.outbox,exported.outbox);
});

test('malformed acknowledgement preserves queued writes and retry resends the same idempotency IDs',async()=>{
 account('retry-malformed');navigator.onLine=false;
 await db.queueMutation({id:'stable_retry_id',entityType:'farm',entityId:'retry_farm',action:'upsert',payload:{name:'Prueba',location:'',areaSqM:100,objective:''}});
 navigator.onLine=true;
 const sent=[];let valid=false;
 globalThis.fetch=async(url,options)=>{
  if(url==='/api/offline-session')return new Response(JSON.stringify({owner:'retry-malformed'}));
  assert.equal(url,'/api/sync');const operations=JSON.parse(options.body).operations;sent.push(operations.map(op=>op.id));
  return new Response(valid?JSON.stringify({accepted:operations.map(op=>op.id),revisions:{stable_retry_id:'revision-confirmed'},syncedAt:'2026-10-12T00:00:00Z'}):'{invalid');
 };
 assert.equal((await db.syncNow()).reason,'invalid_response');
 assert.equal(await db.getPendingCount(),1);
 assert.equal((await db.getCachedEntity('farm','retry_farm')).syncState,'pending');
 valid=true;assert.equal((await db.syncNow()).ok,true);
 assert.deepEqual(sent,[['stable_retry_id'],['stable_retry_id']]);
 assert.equal((await db.getOperationStatus('stable_retry_id')).state,'confirmed');
 assert.equal(await db.getPendingCount(),0);
 await db.syncNow();assert.equal(sent.length,2,'confirmed retry does not repost the accepted write');
});

test('verified-account mismatch sends neither account queue and preserves both owners separately',async()=>{
 for(const id of ['boundary-a','boundary-b']){account(id);await db.queueMutation({id:`write_${id}`,expectedOwner:id,entityType:'farm',entityId:`farm_${id}`,action:'upsert',payload:{name:id,location:'',areaSqM:100,objective:''}});}
 account('boundary-a');let writes=0;
 globalThis.fetch=async(url)=>{if(url==='/api/offline-session')return new Response(JSON.stringify({owner:'boundary-b'}));writes++;throw new Error('Forbidden cross-account send');};
 assert.equal((await db.syncNow()).reason,'account_changed');assert.equal(writes,0);
 for(const id of ['boundary-a','boundary-b']){account(id);const copy=await db.exportLocalBackup();assert.equal(copy.entities.length,1);assert.equal(copy.entities[0].payload.name,id);assert.equal(copy.outbox.length,1);}
});

test('bootstrap outage, invalid JSON and wrong-owner responses preserve an existing local draft exactly',async()=>{
 account('hydrate-failure');navigator.onLine=true;
 await db.queueMutation({id:'hydrate_draft',entityType:'farm',entityId:'hydrate_keep',action:'upsert',payload:{name:'Conservar borrador',location:'',areaSqM:100,objective:''}});
 const before=await db.exportLocalBackup();
 for(const response of [()=>{throw new Error('Synthetic timeout');},()=>new Response('Unavailable',{status:503}),()=>new Response('{broken'),()=>new Response(JSON.stringify({user:{id:'foreign-owner'},farms:[{id:'foreign_farm',name:'Foreign',revision:'foreign_revision'}]}))]){
  globalThis.fetch=async url=>{assert.equal(url,'/api/bootstrap');return response();};
  await db.hydrateFromServer();
  const after=await db.exportLocalBackup();assert.deepEqual(after.entities,before.entities);assert.deepEqual(after.outbox,before.outbox);assert.deepEqual(after.meta,before.meta);
 }
});

test('late bootstrap after account navigation writes only to its captured owner, never the newly active account',async()=>{
 account('hydrate-captured-a');navigator.onLine=true;
 let reply;globalThis.fetch=async url=>{assert.equal(url,'/api/bootstrap');return new Promise(resolve=>reply=resolve);};
 const pending=db.hydrateFromServer();while(!reply)await new Promise(resolve=>setImmediate(resolve));
 account('hydrate-active-b');
 reply(new Response(JSON.stringify({user:{id:'hydrate-captured-a'},farms:[{id:'captured_farm',name:'A only',location:'',areaSqM:100,objective:'',revision:'r1'}]})));
 await pending;
 assert.equal((await db.getCachedEntities('farm')).length,0);
 account('hydrate-captured-a');assert.equal((await db.getCachedEntities('farm'))[0].payload.name,'A only');
});

test('bootstrap reports offline, HTTP, JSON, malformed collection and account mismatch distinctly without claiming success',async()=>{
 account('hydrate-outcomes');navigator.onLine=false;
 let requests=0;globalThis.fetch=async()=>{requests++;throw new Error('Unexpected offline fetch');};
 assert.deepEqual(await db.hydrateFromServer(),{status:'offline'});assert.equal(requests,0);
 navigator.onLine=true;
 for(const [response,expected]of [
  [()=>{throw new Error('Interrupted');},{status:'error',reason:'network'}],
  [()=>new Response('Failed',{status:503}),{status:'error',reason:'server'}],
  [()=>new Response('Session expired',{status:401}),{status:'account_changed'}],
  [()=>new Response('Access denied',{status:403}),{status:'account_changed'}],
  [()=>new Response('{bad'),{status:'error',reason:'invalid_response'}],
  [()=>new Response('null'),{status:'error',reason:'invalid_response'}],
  [()=>new Response(JSON.stringify({user:{id:'hydrate-outcomes'},farms:{bad:true}})),{status:'error',reason:'invalid_response'}],
  [()=>new Response(JSON.stringify({user:{id:'hydrate-outcomes'},farms:[{id:'missing-revision'}]})),{status:'error',reason:'invalid_response'}],
  [()=>new Response(JSON.stringify({user:{id:'other-account'},farms:[]})),{status:'account_changed'}],
  [()=>new Response(JSON.stringify({user:{id:'hydrate-outcomes'},farms:[],records:[],listings:[]})),{status:'success'}],
 ]){globalThis.fetch=async()=>response();assert.deepEqual(await db.hydrateFromServer(),expected);assert.equal((await db.getCachedEntities('farm')).length,0);}
 assert.equal(await db.getLastSync(),null,'successful download does not create a sync acknowledgement');
});

test('legacy nullable and empty revisions still hydrate without schema migration',async()=>{
 account('hydrate-legacy-revisions');navigator.onLine=true;
 globalThis.fetch=async()=>new Response(JSON.stringify({user:{id:'hydrate-legacy-revisions'},farms:[{id:'legacy_empty',name:'Legacy',revision:''}],entities:[{entityType:'farm',id:'legacy_null',revision:null,payload:{name:'Nullable legacy',areaSqM:100}}]}));
 assert.deepEqual(await db.hydrateFromServer(),{status:'success'});
 const farms=await db.getCachedEntities('farm');assert.equal(farms.length,2);assert.equal(farms.find(row=>row.id==='legacy_empty').serverRevision,'');assert.equal(farms.find(row=>row.id==='legacy_null').serverRevision,null);
});

test('an upstream rate-limit response preserves anonymous intent and retries the same id only after another sync call',async()=>{
 location.pathname='/app-local';navigator.onLine=true;
 const operation=await db.queueMutation({id:'upstream_limited_feedback',entityType:'feedback',entityId:'upstream_limited_entity',action:'upsert',payload:{area:'Otro',role:'Ensayo',message:'Sugerencia sintética para probar un límite externo.',contact:''}});
 const before=await db.exportLocalBackup();let limited=true;const sent=[];
 globalThis.fetch=async(url,options)=>{
  if(url==='/api/offline-session')return new Response(JSON.stringify({owner:'device-local'}));
  assert.equal(url,'/api/sync');const operations=JSON.parse(options.body).operations;sent.push(operations.map(item=>item.id));
  if(limited)return new Response(JSON.stringify({error:'rate_limited'}),{status:429,headers:{'retry-after':'60'}});
  return new Response(JSON.stringify({accepted:operations.map(item=>item.id),syncedAt:'2026-10-14T00:00:00Z'}));
 };
 const result=await db.syncNow();assert.equal(result.ok,false);assert.equal(sent.length,1,'one sync call must not spin on429');
 const after=await db.exportLocalBackup();assert.deepEqual(after.entities,before.entities);assert.deepEqual(after.outbox,before.outbox);
 assert.equal((await db.getOperationStatus(operation.id)).state,'pending');
 limited=false;await db.syncNow();assert.equal((await db.getOperationStatus(operation.id)).state,'confirmed');
 assert.ok(sent[0].includes(operation.id));assert.ok(sent[1].includes(operation.id));
});
