import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import {indexedDB,IDBKeyRange,IDBObjectStore} from 'fake-indexeddb';
const root=fileURLToPath(new URL('..',import.meta.url));
const names=['indexedDB','IDBKeyRange','location','navigator','sessionStorage','localStorage','window','fetch'];
const saved=Object.fromEntries(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
const session=new Map();const persistent=new Map();
for(const [name,value] of Object.entries({indexedDB,IDBKeyRange,location:{pathname:'/app-local',origin:'https://test.invalid'},navigator:{onLine:true},sessionStorage:{getItem:key=>session.get(key),setItem:(key,value)=>session.set(key,value)},localStorage:{getItem:key=>persistent.get(key),setItem:(key,value)=>persistent.set(key,value),removeItem:key=>persistent.delete(key)},window:new EventTarget()}))Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,watch:null}});
const db=await vite.ssrLoadModule('/lib/offline-db.ts');
const owner=await vite.ssrLoadModule('/lib/offline-owner.ts');
const reopenedOwner=await vite.ssrLoadModule('/lib/offline-owner.ts?reopened=1');
const cancelledOwner=await vite.ssrLoadModule('/lib/offline-owner.ts?reopened=2');
const fullCycleOwner=await vite.ssrLoadModule('/lib/offline-owner.ts?reopened=3');
const otherTab=await vite.ssrLoadModule('/lib/offline-db.ts?auditTab=2');
const {parseLocalBackup}=await vite.ssrLoadModule('/lib/backup-import.ts');
after(async()=>{await vite.close();for(const name of names){if(saved[name])Object.defineProperty(globalThis,name,saved[name]);else delete globalThis[name];}});
function open(name){return new Promise((resolve,reject)=>{const r=indexedDB.open(name,1);r.onupgradeneeded=()=>{const d=r.result;d.createObjectStore('entities',{keyPath:'key'}).createIndex('entityType','entityType');d.createObjectStore('outbox',{keyPath:'id'});d.createObjectStore('meta',{keyPath:'key'});};r.onerror=()=>reject(r.error);r.onsuccess=()=>resolve(r.result);});}
async function seed(name,entities=[],operations=[]){const d=await open(name);await new Promise((resolve,reject)=>{const tx=d.transaction(['entities','outbox'],'readwrite');for(const e of entities)tx.objectStore('entities').put(e);for(const op of operations)tx.objectStore('outbox').put(op);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});d.close();}
async function rows(name,store){const d=await open(name);const value=await new Promise((resolve,reject)=>{const r=d.transaction(store).objectStore(store).getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});d.close();return value;}
const entity=(id,title)=>({key:`farm-record:${id}`,id,entityType:'farm-record',payload:{farmId:'farm_test',recordType:'animal',category:'Bovino',title,data:{}},updatedAt:'2026-10-06T01:00:00Z',syncState:'pending'});
const op=(id,entityId,action='upsert',title=id)=>({id,entityType:'farm-record',entityId,action,payload:{farmId:'farm_test',recordType:'animal',category:'Bovino',title,data:{}},clientUpdatedAt:'2026-10-06T01:00:00Z'});
const local=owner.databaseNameForOwner('device-local');
test('legacy export and explicit recovery preserve originals, edits, deletion intent and pending-only recovery visibility',async()=>{
 await seed('los-morochos-offline',[entity('a','legacy a'),entity('b','legacy b'),entity('deleted','legacy deleted')],[op('legacy-a','a')]);
 await seed(local,[entity('b','current b')],[op('delete-current','deleted','delete')]);
 const before=await db.exportLocalBackup(true);
 assert.equal(await db.getLegacyRecordCount(),4);
 assert.equal(await db.recoverLegacyOnDevice(),1);
 assert.equal(await db.recoverLegacyOnDevice(),0);
 const current=await db.exportLocalBackup();
 assert.equal(current.owner,'device-local');assert.equal(current.entities.find(x=>x.id==='b').payload.title,'current b');assert.ok(!current.entities.some(x=>x.id==='deleted'));
 assert.ok(current.outbox.some(x=>x.action==='delete'&&x.entityId==='deleted'));
 const afterCopy=await db.exportLocalBackup(true);assert.deepEqual(afterCopy.entities,before.entities);assert.deepEqual(afterCopy.outbox,before.outbox);
});
test('route change during legacy recovery cannot copy data into an account database',async()=>{
 location.pathname='/app-local';await seed('los-morochos-offline',[entity('race-recovery','local only')]);
 const recovery=db.recoverLegacyOnDevice();
 await Promise.resolve();location.pathname='/app';owner.selectVerifiedDashboardOwner('account-recovery');
 await recovery;
 assert.ok((await rows(local,'entities')).some(x=>x.id==='race-recovery'));
 assert.equal((await rows(owner.databaseNameForOwner('account-recovery'),'entities')).length,0);
});
test('route change during session verification sends only the captured account outbox',async()=>{
 location.pathname='/app';owner.selectVerifiedDashboardOwner('account-sync');
 await seed(owner.databaseNameForOwner('account-sync'),[entity('owned','account')],[op('owned-op','owned')]);
 await seed(local,[entity('local-private','device')],[op('device-op','local-private')]);
 let verify;let sent;
 globalThis.fetch=async(url,options)=>{if(url==='/api/offline-session')return new Promise(resolve=>{verify=resolve;});if(url==='/api/sync'){sent=JSON.parse(options.body);assert.equal(options.headers['x-local-owner'],'account-sync');return new Response(JSON.stringify({accepted:['owned-op'],syncedAt:'2026-10-06T02:00:00Z'}));}throw new Error('Unexpected request');};
 const syncing=db.syncNow();await new Promise(resolve=>setImmediate(resolve));
 location.pathname='/app-local';verify(new Response(JSON.stringify({owner:'account-sync'})));await syncing;
 assert.deepEqual(sent.operations.map(x=>x.id),['owned-op']);
 assert.ok((await rows(local,'outbox')).some(x=>x.id==='device-op'));
});
test('an edit made while sync is in flight remains visible, queued, and exportable',async()=>{
 location.pathname='/app';owner.selectVerifiedDashboardOwner('account-edits');
 await seed(owner.databaseNameForOwner('account-edits'),[entity('changing','old')],[op('old-op','changing')]);
 let finish;
 let sends=0;globalThis.fetch=async url=>{if(url==='/api/offline-session')return new Response(JSON.stringify({owner:'account-edits'}));if(sends++===0)return new Promise(resolve=>{finish=resolve;});throw new Error('Next send interrupted');};
 const sending=db.syncNow();while(!finish)await new Promise(resolve=>setImmediate(resolve));
 await db.queueMutation({...op('new-op','changing','upsert','new'),clientUpdatedAt:'2026-10-06T03:00:00Z'});
 finish(new Response(JSON.stringify({accepted:['old-op'],syncedAt:'2026-10-06T02:00:00Z'})));await sending;
 const backup=await db.exportLocalBackup();assert.equal(backup.entities.find(x=>x.id==='changing').payload.title,'new');assert.deepEqual(backup.outbox.map(x=>x.id),['new-op']);
});


test('prepared account survives closing the session and reopens only after explicit offline choice',async()=>{
 location.pathname='/app';navigator.onLine=true;owner.selectVerifiedDashboardOwner('account-reopen');
 globalThis.fetch=async()=>new Response(JSON.stringify({owner:'account-reopen'}));
 await seed(owner.databaseNameForOwner('account-reopen'),[entity('kept-after-close','My record')]);
 await owner.rememberOfflineWorkspace();
 session.clear();navigator.onLine=false;
 const opening=reopenedOwner.localOwner();assert.equal(reopenedOwner.offlineChoiceRequired(),true);
 reopenedOwner.chooseOfflineWorkspace(true);const restoredOwner=await opening;assert.equal(restoredOwner,'account-reopen');
 assert.equal((await rows(owner.databaseNameForOwner(restoredOwner),'entities'))[0].payload.title,'My record');
 navigator.onLine=true;globalThis.fetch=async()=>new Response(JSON.stringify({owner:'different-account'}));
 assert.equal(await reopenedOwner.verifySyncOwner(restoredOwner),false);assert.equal(persistent.has('venezuela-agro-trusted-offline-workspace'),false);
 assert.equal((await rows(owner.databaseNameForOwner(restoredOwner),'entities')).length,1,'account mismatch never deletes local records');
});
test('declining or interrupting offline workspace choice opens only the device workspace',async()=>{
 session.clear();persistent.set('venezuela-agro-trusted-offline-workspace',JSON.stringify({version:1,owner:'account-private'}));navigator.onLine=false;location.pathname='/app';
 const opening=cancelledOwner.localOwner();assert.equal(cancelledOwner.offlineChoiceRequired(),true);
 cancelledOwner.chooseOfflineWorkspace(false);assert.equal(await opening,'device-local');
});
test('new-origin import is local-only, idempotent, preserves current edits/deletions and never queues commercial sends',async()=>{
 location.pathname='/app';navigator.onLine=true;owner.selectVerifiedDashboardOwner('account-import');
 const incoming={format:'venezuela-agro-local-backup',version:1,exportedAt:'2026-10-06T00:00:00Z',origin:'https://old.invalid',owner:'account-from-old-origin',entities:[entity('imported-new','New'),entity('b','Do not overwrite'),entity('deleted','Do not resurrect'),{...entity('request-old','Old request'),key:'order:request-old',entityType:'order',payload:{customerName:'Example Person',phone:'+584121234567',items:[{id:'test-product',name:'Test product',quantity:1}],note:''}}],outbox:[op('incoming-delete','imported-deleted','delete')],meta:[]};
 const result=await db.importBackupToDevice(JSON.stringify(incoming));assert.equal(result.imported,2);assert.equal(result.skipped,2);assert.equal(result.deletions,1);
 assert.equal((await rows(owner.databaseNameForOwner('account-import'),'entities')).length,0);
 assert.equal((await rows(local,'entities')).find(x=>x.id==='b').payload.title,'current b');assert.ok(!(await rows(local,'entities')).some(x=>x.id==='deleted'));
 assert.ok(!(await rows(local,'outbox')).some(x=>x.entityType==='order'));
 const repeat=await db.importBackupToDevice(JSON.stringify(incoming));assert.equal(repeat.imported,0);assert.equal(repeat.deletions,0);
 const count=(await rows(local,'entities')).length;await assert.rejects(db.importBackupToDevice('{broken'));assert.equal((await rows(local,'entities')).length,count);
});

test('an interrupted import aborts its transaction and can be safely repeated',async()=>{
 const incoming={format:'venezuela-agro-local-backup',version:1,exportedAt:'2026-10-06T00:00:00Z',origin:'https://old.invalid',owner:'old-account',entities:[entity('rollback-test','Rollback test')],outbox:[],meta:[]};
 const original=IDBObjectStore.prototype.put;
 IDBObjectStore.prototype.put=function(...args){const request=original.apply(this,args);if(this.name==='entities' && args[0]?.id==='rollback-test')this.transaction.abort();return request;};
 try {await assert.rejects(db.importBackupToDevice(JSON.stringify(incoming)));} finally {IDBObjectStore.prototype.put=original;}
 assert.ok(!(await rows(local,'entities')).some(x=>x.id==='rollback-test'));
 assert.equal((await db.importBackupToDevice(JSON.stringify(incoming))).imported,1);
 assert.equal((await db.importBackupToDevice(JSON.stringify(incoming))).imported,0);
});

test('modeled complete offline loop preserves farm CRUD across close/reopen and interrupted reconnect',async()=>{
 location.pathname='/app';navigator.onLine=true;owner.selectVerifiedDashboardOwner('account-complete-cycle');
 globalThis.fetch=async()=>new Response(JSON.stringify({owner:'account-complete-cycle'}));
 await owner.rememberOfflineWorkspace();
 await db.queueMutation({id:'cycle-farm',entityType:'farm',entityId:'farm_cycle',action:'upsert',payload:{name:'Synthetic farm',location:'Test',areaSqM:10000,objective:''},clientUpdatedAt:'2026-10-06T01:00:00Z'});
 navigator.onLine=false;
 for(const [recordId,recordType,data] of [['animal_cycle','animal',{weight:100}],['weight_cycle','weight',{animalId:'animal_cycle',weight:110}],['inventory_cycle','inventory',{quantity:3}],['area_cycle','area',{areaSqM:1000}]])await db.queueMutation({id:'change_'+recordId,entityType:'farm-record',entityId:recordId,action:'upsert',payload:{farmId:'farm_cycle',recordType,title:recordId,category:'Test',data},clientUpdatedAt:'2026-10-06T02:00:00Z'});
 await db.queueMutation({id:'delete_inventory',entityType:'farm-record',entityId:'inventory_cycle',action:'delete',payload:{},clientUpdatedAt:'2026-10-06T03:00:00Z'});
 session.clear();const reopening=fullCycleOwner.localOwner();assert.equal(fullCycleOwner.offlineChoiceRequired(),true);fullCycleOwner.chooseOfflineWorkspace(true);const activeOwner=await reopening;
 const reopenedRows=await rows(owner.databaseNameForOwner(activeOwner),'entities');assert.equal(reopenedRows.length,4);assert.ok(!reopenedRows.some(row=>row.id==='inventory_cycle'));assert.equal(reopenedRows.find(row=>row.id==='weight_cycle').payload.data.weight,110);
 navigator.onLine=true;let posts=0;
 globalThis.fetch=async url=>{if(url==='/api/offline-session')return new Response(JSON.stringify({owner:activeOwner}));posts++;throw new Error('Interrupted network');};
 assert.equal((await db.syncNow()).ok,false);assert.equal(await db.getPendingCount(activeOwner),5);
 globalThis.fetch=async(url,options)=>{if(url==='/api/offline-session')return new Response(JSON.stringify({owner:activeOwner}));posts++;return new Response(JSON.stringify({accepted:JSON.parse(options.body).operations.map(op=>op.id),syncedAt:'2026-10-06T04:00:00Z'}));};
 assert.equal((await db.syncNow()).ok,true);assert.equal(await db.getPendingCount(activeOwner),0);assert.equal((await db.syncNow()).ok,true);assert.equal(posts,2,'empty retry does not send a second accepted batch');
 assert.equal((await db.exportLocalBackup()).entities.length,4);
});

test('late acknowledgement from another tab cannot overwrite a newer confirmed revision',async()=>{
 location.pathname='/app';navigator.onLine=true;owner.selectVerifiedDashboardOwner('race-owner');
 await db.queueMutation({id:'race_A',entityType:'farm',entityId:'race_entity',action:'upsert',payload:{name:'Old A',location:'',areaSqM:100,objective:''}});
 const replies=[];globalThis.fetch=async(url,options)=>{if(url==='/api/offline-session')return new Response(JSON.stringify({owner:'race-owner'}));return new Promise(resolve=>replies.push({resolve,operations:JSON.parse(options.body).operations}));};
 const first=db.syncNow(),late=otherTab.syncNow();while(replies.length<2)await new Promise(r=>setImmediate(r));
 replies[0].resolve(new Response(JSON.stringify({accepted:['race_A'],revisions:{race_A:'rev_A'},syncedAt:'2026-10-07T01:00:00Z'})));await first;
 await db.queueMutation({id:'race_B',entityType:'farm',entityId:'race_entity',action:'upsert',baseRevision:'rev_A',payload:{name:'New B',location:'',areaSqM:100,objective:''}});
 const newer=db.syncNow();while(replies.length<3)await new Promise(r=>setImmediate(r));replies[2].resolve(new Response(JSON.stringify({accepted:['race_B'],revisions:{race_B:'rev_B'},syncedAt:'2026-10-07T02:00:00Z'})));await newer;
 replies[1].resolve(new Response(JSON.stringify({accepted:['race_A'],revisions:{race_A:'rev_A'},syncedAt:'2026-10-07T01:00:00Z'})));await late;
 assert.equal((await db.getCachedEntity('farm','race_entity')).payload.name,'New B');assert.equal((await db.getCachedEntity('farm','race_entity')).serverRevision,'rev_B');
});
test('late bootstrap cannot replace a locally confirmed update or its conflict snapshot',async()=>{
 location.pathname='/app';navigator.onLine=true;owner.selectVerifiedDashboardOwner('hydrate-race');
 await seed(owner.databaseNameForOwner('hydrate-race'),[{key:'farm:hydrate_farm',id:'hydrate_farm',entityType:'farm',payload:{name:'Old'},updatedAt:'2026-10-07T00:00:00Z',serverRevision:'rev_old',syncState:'synced'}]);
 let release;globalThis.fetch=async(url,options)=>{if(url==='/api/bootstrap')return new Promise(resolve=>{release=resolve;});if(url==='/api/offline-session')return new Response(JSON.stringify({owner:'hydrate-race'}));return new Response(JSON.stringify({accepted:JSON.parse(options.body).operations.map(x=>x.id),revisions:{hydrate_edit:'rev_new'},syncedAt:'2026-10-07T01:00:00Z'}));};
 const hydration=db.hydrateFromServer();while(!release)await new Promise(r=>setImmediate(r));
 await db.queueMutation({id:'hydrate_edit',entityType:'farm',entityId:'hydrate_farm',action:'upsert',baseRevision:'rev_old',payload:{name:'New'}});await db.syncNow();
 release(new Response(JSON.stringify({user:{id:'hydrate-race'},farms:[{id:'hydrate_farm',name:'Old',revision:'rev_old'}]})));await hydration;
 assert.equal((await db.getCachedEntity('farm','hydrate_farm')).payload.name,'New');
 const snapshot=(await rows(owner.databaseNameForOwner('hydrate-race'),'meta')).find(x=>x.key==='server:farm:hydrate_farm');assert.equal(snapshot.value.revision,'rev_new');
});
test('queue drains past one hundred rejected records without starving later requests',async()=>{
 location.pathname='/app';navigator.onLine=true;owner.selectVerifiedDashboardOwner('large-queue');
 const ops=Array.from({length:130},(_,i)=>op('large_'+i,'entity_'+i));await seed(owner.databaseNameForOwner('large-queue'),[],ops);
 let attempts=0;globalThis.fetch=async(url,options)=>{if(url==='/api/offline-session')return new Response(JSON.stringify({owner:'large-queue'}));attempts++;const operations=JSON.parse(options.body).operations;return new Response(JSON.stringify({accepted:operations.filter(x=>Number(x.id.slice(6))>=100).map(x=>x.id),rejected:operations.filter(x=>Number(x.id.slice(6))<100).map(x=>({id:x.id,reason:'invalid_payload'})),syncedAt:'2026-10-07T01:00:00Z'}));};
 await db.syncNow();assert.ok(attempts>=2);const remaining=await rows(owner.databaseNameForOwner('large-queue'),'outbox');assert.equal(remaining.length,100);assert.ok(remaining.every(x=>x.blockedReason));
 assert.ok(parseLocalBackup(JSON.stringify(await db.exportLocalBackup())));
});

test('stale bootstrap cannot resurrect a deletion acknowledged while cache remains missing',async()=>{
 location.pathname='/app';navigator.onLine=true;owner.selectVerifiedDashboardOwner('delete-hydration');
 await seed(owner.databaseNameForOwner('delete-hydration'),[{key:'farm:delete_farm',id:'delete_farm',entityType:'farm',payload:{name:'Old'},serverRevision:'rev_active',updatedAt:'2026-10-07T00:00:00Z',syncState:'synced'}]);
 await db.queueMutation({id:'delete_during_hydration',entityType:'farm',entityId:'delete_farm',action:'delete',baseRevision:'rev_active',payload:{}});
 let release;globalThis.fetch=async(url,options)=>{if(url==='/api/bootstrap')return new Promise(resolve=>{release=resolve;});if(url==='/api/offline-session')return new Response(JSON.stringify({owner:'delete-hydration'}));return new Response(JSON.stringify({accepted:['delete_during_hydration'],revisions:{delete_during_hydration:'rev_deleted'},syncedAt:'2026-10-07T01:00:00Z'}));};
 const hydration=db.hydrateFromServer();while(!release)await new Promise(r=>setImmediate(r));await db.syncNow();assert.equal(await db.getCachedEntity('farm','delete_farm'),undefined);
 release(new Response(JSON.stringify({user:{id:'delete-hydration'},farms:[{id:'delete_farm',name:'Old',revision:'rev_active',deleted:false}]})));await hydration;
 assert.equal(await db.getCachedEntity('farm','delete_farm'),undefined);assert.equal((await rows(owner.databaseNameForOwner('delete-hydration'),'meta')).find(x=>x.key==='server:farm:delete_farm').value.deleted,true);
});

test('device-local area split commits both halves and pending intents atomically; stale repeat cannot split twice',async()=>{
 location.pathname='/app-local';navigator.onLine=false;await owner.localOwner();
 const name=owner.databaseNameForOwner('device-local');
 const area={...entity('atomic_local_area','Potrero'),payload:{farmId:'farm_test',recordType:'area',category:'Potrero',title:'Potrero',data:{areaSqM:101.5,mapWidth:20,mapHeight:12}},updatedAt:'2026-10-07T00:00:00Z'};
 await seed(name,[area]);await db.splitDeviceLocalArea(area);
 const values=(await rows(name,'entities')).filter(r=>r.payload.farmId==='farm_test'&&r.payload.recordType==='area');
 assert.equal(values.length,2);assert.equal(values.reduce((n,r)=>n+r.payload.data.areaSqM,0),101.5);
 const pending=await rows(name,'outbox');assert.ok(values.every(r=>pending.some(o=>o.entityId===r.id)));
 await assert.rejects(db.splitDeviceLocalArea(area),/area_changed_refresh/);
 assert.equal((await rows(name,'entities')).filter(r=>r.payload.recordType==='area').length,2);
});
test('failed second local split write rolls back source, child and outbox; account space is never used',async()=>{
 location.pathname='/app-local';navigator.onLine=false;await owner.localOwner();
 const name=owner.databaseNameForOwner('device-local');
 const area={...entity('atomic_failure_area','Cultivo'),payload:{farmId:'farm_test',recordType:'area',category:'Cultivo',title:'Cultivo',data:{areaSqM:40}},updatedAt:'2026-10-07T01:00:00Z'};
 await seed(name,[area]);const before=JSON.stringify(await rows(name,'entities')),outBefore=JSON.stringify(await rows(name,'outbox'));
 const original=IDBObjectStore.prototype.add;IDBObjectStore.prototype.add=function(...args){if(this.name==='entities')throw new Error('injected_second_area_failure');return original.apply(this,args);};
 try{await assert.rejects(db.splitDeviceLocalArea(area),/injected_second_area_failure/);}finally{IDBObjectStore.prototype.add=original;}
 assert.equal(JSON.stringify(await rows(name,'entities')),before);assert.equal(JSON.stringify(await rows(name,'outbox')),outBefore);
 location.pathname='/app';navigator.onLine=true;owner.selectVerifiedDashboardOwner('account-no-local-split');
 await assert.rejects(db.splitDeviceLocalArea(area),/account_split_requires_connection/);
 assert.equal((await rows(owner.databaseNameForOwner('account-no-local-split'),'entities')).length,0);
});

test('account split readiness rejects pending source or parent and stale local cards',async()=>{
 location.pathname='/app';navigator.onLine=true;owner.selectVerifiedDashboardOwner('account-split-ready');
 const name=owner.databaseNameForOwner('account-split-ready');
 const farm={key:'farm:split_farm',id:'split_farm',entityType:'farm',payload:{name:'Finca',areaSqM:100},updatedAt:'2026-10-07T00:00:00Z',syncState:'synced',serverRevision:'farm-r1'};
 const area={...entity('ready_area','Potrero'),payload:{farmId:'split_farm',recordType:'area',category:'Potrero',title:'Potrero',data:{areaSqM:40}},syncState:'synced',serverRevision:'area-r1'};
 await seed(name,[farm,area]);await db.assertAreaReadyForOnlineSplit(area,'account-split-ready',farm);
 await seed(name,[{...farm,syncState:'pending'}]);await assert.rejects(db.assertAreaReadyForOnlineSplit(area,'account-split-ready',farm),/area_pending_sync/);
 await seed(name,[farm,{...area,serverRevision:'area-r2'}]);await assert.rejects(db.assertAreaReadyForOnlineSplit(area,'account-split-ready',farm),/area_pending_sync/);
 await seed(name,[area],[{...op('pending-split-area','ready_area'),baseRevision:'area-r1'}]);await assert.rejects(db.assertAreaReadyForOnlineSplit(area,'account-split-ready',farm),/area_pending_sync/);
});

test('account offline split guard has no network calls or storage writes',async()=>{
 location.pathname='/app';owner.selectVerifiedDashboardOwner('account-offline-split');navigator.onLine=false;
 const name=owner.databaseNameForOwner('account-offline-split'),before=JSON.stringify(await rows(name,'entities'));
 let calls=0;globalThis.fetch=async()=>{calls++;throw new Error('unexpected network');};
 await assert.rejects(db.assertAreaReadyForOnlineSplit(entity('offline_area','Area'),'account-offline-split',entity('unused','Farm')),/account_split_requires_connection/);
 assert.equal(calls,0);assert.equal(JSON.stringify(await rows(name,'entities')),before);assert.deepEqual(await rows(name,'outbox'),[]);
});

test('old and newer concurrent hydrations cannot display only one half of a confirmed split',async()=>{
 location.pathname='/app';navigator.onLine=true;owner.selectVerifiedDashboardOwner('split-hydrate-race');
 const area={...entity('split_hydrate_source','Area'),payload:{farmId:'split_farm',recordType:'area',category:'Potrero',title:'Area',data:{areaSqM:100}},serverRevision:'before_split',syncState:'synced'};
 await seed(owner.databaseNameForOwner('split-hydrate-race'),[area]);
 const responses=[];globalThis.fetch=async url=>url==='/api/offline-session'?new Response(JSON.stringify({owner:'split-hydrate-race'})):new Promise(resolve=>responses.push(resolve));
 const old=db.hydrateFromServer();while(responses.length<1)await new Promise(r=>setImmediate(r));
 const newer=otherTab.hydrateFromServer();while(responses.length<2)await new Promise(r=>setImmediate(r));
 responses[0](new Response(JSON.stringify({user:{id:'split-hydrate-race'},records:[{id:area.id,...area.payload,revision:'before_split'}]})));await old;
 responses[1](new Response(JSON.stringify({user:{id:'split-hydrate-race'},records:[{id:area.id,...area.payload,title:'Area A',data:{areaSqM:50},revision:'split_first'},{id:'split_hydrate_child',...area.payload,title:'Area B',data:{areaSqM:50},revision:'split_second'}]})));await newer;
 const actual=await db.getCachedEntities('farm-record');assert.equal(actual.length,2);assert.equal(actual.reduce((n,r)=>n+r.payload.data.areaSqM,0),100);assert.equal(actual.find(r=>r.id===area.id).serverRevision,'split_first');
});

test('legacy empty revisions retain complete split under concurrent hydrations',async()=>{
 location.pathname='/app';navigator.onLine=true;owner.selectVerifiedDashboardOwner('legacy-split-hydrate-race');
 const area={...entity('split_hydrate_source','Area'),payload:{farmId:'split_farm',recordType:'area',category:'Potrero',title:'Area',data:{areaSqM:100}},serverRevision:'',syncState:'synced'};
 await seed(owner.databaseNameForOwner('legacy-split-hydrate-race'),[area]);
 const responses=[];globalThis.fetch=async url=>url==='/api/offline-session'?new Response(JSON.stringify({owner:'legacy-split-hydrate-race'})):new Promise(resolve=>responses.push(resolve));
 const old=db.hydrateFromServer();while(responses.length<1)await new Promise(r=>setImmediate(r));
 const newer=otherTab.hydrateFromServer();while(responses.length<2)await new Promise(r=>setImmediate(r));
 responses[0](new Response(JSON.stringify({user:{id:'legacy-split-hydrate-race'},records:[{id:area.id,...area.payload,revision:''}]})));await old;
 responses[1](new Response(JSON.stringify({user:{id:'legacy-split-hydrate-race'},records:[{id:area.id,...area.payload,title:'Area A',data:{areaSqM:50},revision:'split_first'},{id:'split_hydrate_child',...area.payload,title:'Area B',data:{areaSqM:50},revision:'split_second'}]})));await newer;
 const actual=await db.getCachedEntities('farm-record');assert.equal(actual.length,2);assert.equal(actual.reduce((n,r)=>n+r.payload.data.areaSqM,0),100);assert.equal(actual.find(r=>r.id===area.id).serverRevision,'split_first');
});

test('photo repair rejects a stale local snapshot without replacing the newer record or its outbox',async()=>{
 location.pathname='/app-local';owner.chooseOfflineWorkspace(false);const item=entity('photo-repair-race','newer local data');await seed(local,[item],[op('photo-repair-original','photo-repair-race')]);const beforeEntities=await rows(local,'entities'),beforeOutbox=await rows(local,'outbox');await assert.rejects(db.queueMutation({expectedOwner:'device-local',expectedLocalUpdatedAt:'2000-01-01T00:00:00Z',entityType:'farm-record',entityId:item.id,action:'upsert',payload:{...item.payload,title:'stale edit'}}),/local_record_changed_reopen_form/);assert.deepEqual(await rows(local,'entities'),beforeEntities);assert.deepEqual(await rows(local,'outbox'),beforeOutbox);
});

test('explicit local area links preserve old-client omission, reject foreign farms and retain records on unlink',async()=>{location.pathname='/app-local';owner.chooseOfflineWorkspace(false);const area={...entity('area-context-local','Area'),payload:{farmId:'farm_test',recordType:'area',category:'Potrero',title:'Area',data:{areaSqM:100}}};await seed(local,[area]);const payload={farmId:'farm_test',recordType:'animal',category:'Bovino',title:'Animal enlazado',data:{areaId:area.id}};await db.queueMutation({expectedOwner:'device-local',entityType:'farm-record',entityId:'context-animal',action:'upsert',payload});await db.queueMutation({expectedOwner:'device-local',entityType:'farm-record',entityId:'context-animal',action:'upsert',payload:{...payload,data:{notes:'Older prepared client'}}});let current=(await rows(local,'entities')).find(r=>r.id==='context-animal');assert.equal(current.payload.data.areaId,area.id);await assert.rejects(db.queueMutation({expectedOwner:'device-local',entityType:'farm-record',entityId:'context-animal',action:'upsert',payload:{...payload,recordType:'area',data:{areaSqM:1}}}),/area_cannot_reference_area/);await assert.rejects(db.queueMutation({expectedOwner:'device-local',entityType:'farm-record',entityId:'wrong-farm-link',action:'upsert',payload:{...payload,farmId:'different_farm'}}),/area_not_available/);await assert.rejects(db.splitDeviceLocalArea(area),/area_has_linked_records/);await db.queueMutation({expectedOwner:'device-local',entityType:'farm-record',entityId:'context-animal',action:'upsert',payload:{...payload,data:{areaId:null}}});current=(await rows(local,'entities')).find(r=>r.id==='context-animal');assert.equal(current.payload.data.areaId,null);assert.equal(current.payload.title,'Animal enlazado');});

 test('online split preflight also blocks a locally pending area assignment',async()=>{location.pathname='/app';navigator.onLine=true;owner.selectVerifiedDashboardOwner('pending-area-assignment');const name=owner.databaseNameForOwner('pending-area-assignment');const farm={key:'farm:pending_link_farm',id:'pending_link_farm',entityType:'farm',payload:{name:'Finca',areaSqM:100},updatedAt:'2026-10-07T00:00:00Z',syncState:'synced',serverRevision:'farm-r1'};const area={...entity('pending_link_area','Potrero'),payload:{farmId:farm.id,recordType:'area',category:'Potrero',title:'Potrero',data:{areaSqM:40}},syncState:'synced',serverRevision:'area-r1'};const animal={...entity('pending_link_animal','Animal'),payload:{farmId:farm.id,recordType:'animal',category:'Bovino',title:'Animal',data:{areaId:area.id}},syncState:'pending'};await seed(name,[farm,area,animal]);const before=await rows(name,'entities');await assert.rejects(db.assertAreaReadyForOnlineSplit(area,'pending-area-assignment',farm),/area_has_linked_records/);assert.deepEqual(await rows(name,'entities'),before);});
test('animal placement survives legacy local edit and rejects reposition into deleted area',async()=>{location.pathname='/app-local';owner.chooseOfflineWorkspace(false);const area={...entity('placement-local-area','Area'),payload:{farmId:'farm_test',recordType:'area',category:'Potrero',title:'Area',data:{areaSqM:100}}};await seed(local,[area]);const position={version:1,source:'user-placed',coordinateSpace:'area-percent',areaId:area.id,x:50,y:50},payload={farmId:'farm_test',recordType:'animal',category:'Bovino',title:'Animal',data:{areaId:area.id,planPlacement:position}};await db.queueMutation({expectedOwner:'device-local',entityType:'farm-record',entityId:'placed-local-animal',action:'upsert',payload});await db.queueMutation({expectedOwner:'device-local',entityType:'farm-record',entityId:'placed-local-animal',action:'upsert',payload:{...payload,data:{notes:'older client'}}});let current=(await rows(local,'entities')).find(r=>r.id==='placed-local-animal');assert.deepEqual(current.payload.data.planPlacement,position);await db.queueMutation({expectedOwner:'device-local',entityType:'farm-record',entityId:area.id,action:'delete',payload:{}});await assert.rejects(db.queueMutation({expectedOwner:'device-local',entityType:'farm-record',entityId:'placed-local-animal',action:'upsert',payload:{...payload,data:{...payload.data,planPlacement:{...position,x:60}}}}),/area_not_available/);await db.queueMutation({expectedOwner:'device-local',entityType:'farm-record',entityId:'placed-local-animal',action:'upsert',payload:{...payload,data:{areaId:null}}});current=(await rows(local,'entities')).find(r=>r.id==='placed-local-animal');assert.equal(current.payload.data.planPlacement,null);assert.equal(current.payload.data.areaId,null);});
test('animal placement target revision is checked inside the local transaction',async()=>{location.pathname='/app-local';owner.chooseOfflineWorkspace(false);const area={...entity('placement-race-area','Area'),updatedAt:'2026-10-08T00:00:00.000Z',payload:{farmId:'farm_test',recordType:'area',category:'Potrero',title:'Area',data:{areaSqM:100}}};await seed(local,[area]);const payload={farmId:'farm_test',recordType:'animal',category:'Bovino',title:'Animal',data:{areaId:area.id,planPlacement:{version:1,source:'user-placed',coordinateSpace:'area-percent',areaId:area.id,x:50,y:50}}};await assert.rejects(db.queueMutation({expectedOwner:'device-local',expectedAreaUpdatedAt:'older',entityType:'farm-record',entityId:'placement-race-animal',action:'upsert',payload}),/local_area_changed_reopen_form/);assert.ok(!(await rows(local,'entities')).some(r=>r.id==='placement-race-animal'));await db.queueMutation({expectedOwner:'device-local',expectedAreaUpdatedAt:area.updatedAt,entityType:'farm-record',entityId:'placement-race-animal',action:'upsert',payload});assert.ok((await rows(local,'entities')).some(r=>r.id==='placement-race-animal'));});
