import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import {indexedDB,IDBKeyRange} from 'fake-indexeddb';
const root=fileURLToPath(new URL('..',import.meta.url));
const storage=()=>{const values=new Map();return{getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};};
const globals={indexedDB,IDBKeyRange,location:{pathname:'/app',origin:'https://synthetic.invalid'},navigator:{onLine:false},localStorage:storage(),sessionStorage:storage(),window:new EventTarget(),fetch:async()=>{throw new Error('Unexpected network call');}};
const originals=new Map(Object.keys(globals).map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
for(const[key,value]of Object.entries(globals))Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
const vite=await createServer({root,configFile:false,appType:'custom',resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
const db=await vite.ssrLoadModule('/lib/offline-db.ts'),owner=await vite.ssrLoadModule('/lib/offline-owner.ts');
after(async()=>{await vite.close();for(const[key,value]of originals){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}});
function account(id){location.pathname='/app';owner.selectVerifiedDashboardOwner(id);}
let sequence=0;
function write(id,type,data={},farmId='farm_a',extra={}){return db.queueMutation({id:`animal_op_${++sequence}`,entityType:'farm-record',entityId:id,action:'upsert',payload:{farmId,recordType:type,category:'Bovino',title:id,data},...extra});}
const health={animalId:'animal_a',eventType:'review',date:'2026-10-13'};
const eventRow=(id,animalId='animal_collision')=>({key:`farm-record:${id}`,id,entityType:'farm-record',payload:{farmId:'farm_a',recordType:'health',category:'Bovino',title:id,data:{...health,animalId}},syncState:'pending',updatedAt:'2026-10-13T00:00:00Z'});
function backup(entities,owner='source_owner'){return JSON.stringify({format:'venezuela-agro-local-backup',version:1,owner,origin:'https://synthetic.invalid',exportedAt:'2026-10-13T00:00:00Z',entities,outbox:[],meta:[]});}

test('local queue checks same-farm, animal type, account namespace and expected owner before committing',async()=>{
 account('animal_links_a');await write('animal_a','animal');await write('foreign_farm','animal',{},'farm_b');await write('not_animal','task');
 account('animal_links_b');await write('other_account','animal');account('animal_links_a');
 const before=await db.exportLocalBackup();
 for(const target of ['missing_animal','foreign_farm','not_animal','other_account'])await assert.rejects(write(`event_${target}`,'health',{...health,animalId:target}),/animal_not_available/);
 await assert.rejects(write('owner_changed','health',health,'farm_a',{expectedOwner:'animal_links_b'}),/account_changed/);
 const after=await db.exportLocalBackup();assert.deepEqual(after.entities,before.entities);assert.deepEqual(after.outbox,before.outbox);
 await write('health_valid','health',health,'farm_a',{expectedOwner:'animal_links_a'});assert.equal((await db.getCachedEntity('farm-record','health_valid')).payload.data.animalId,'animal_a');
});

test('local correction preserves unknown details and identity, checks stale snapshots, and never duplicates a record',async()=>{
 account('animal_corrections');await write('animal_a','animal',{tag:'A-1',name:'Alba',breed:'Criollo',birthDate:'2024-01-01',custom:{a:1}});
 await write('animal_a','animal',{status:'En producción'});
 const animal=await db.getCachedEntity('farm-record','animal_a');assert.equal(animal.payload.data.tag,'A-1');assert.deepEqual(animal.payload.data.custom,{a:1});
 await write('health_a','health',{...health,notes:'Original',custom:{preserved:true}});const original=await db.getCachedEntity('farm-record','health_a');
 await write('health_a','health',{notes:'Corrected'},'farm_a',{expectedLocalUpdatedAt:original.updatedAt,clientUpdatedAt:'2026-10-13T01:00:00Z'});
 await assert.rejects(write('health_a','health',{notes:'Stale'},'farm_a',{expectedLocalUpdatedAt:original.updatedAt}),/local_record_changed/);
 const copy=await db.exportLocalBackup(),event=copy.entities.find(row=>row.id==='health_a');assert.equal(event.payload.data.notes,'Corrected');assert.equal(event.payload.data.animalId,'animal_a');assert.deepEqual(event.payload.data.custom,{preserved:true});assert.equal(copy.outbox.filter(op=>op.entityId==='health_a').length,1);
});

test('animal deletion retains linked history; unchanged orphan edits work while new links and relinks fail',async()=>{
 account('animal_deleted');await write('animal_a','animal');await write('health_a','health',health);
 await db.queueMutation({entityType:'farm-record',entityId:'animal_a',action:'delete',payload:{}});
 assert.equal(await db.getCachedEntity('farm-record','animal_a'),undefined);assert.ok(await db.getCachedEntity('farm-record','health_a'));
 await write('health_a','health',{notes:'Retained history'});assert.equal((await db.getCachedEntity('farm-record','health_a')).payload.data.animalId,'animal_a');
 await assert.rejects(write('new_health','health',health),/animal_not_available/);
 await assert.rejects(write('health_a','health',{animalId:'unknown_animal'}),/animal_not_available/);
 await write('health_a','health',{animalId:null});assert.equal((await db.getCachedEntity('farm-record','health_a')).payload.data.animalId,null);
});

test('a linked animal cannot change farm or kind; normal deletion and unrelated records remain supported',async()=>{
 account('animal_move');await write('animal_a','animal');await write('weight_a','weight',{animalId:'animal_a',weightKg:200});
 for(const[type,farm]of [['animal','farm_b'],['task','farm_a']])await assert.rejects(write('animal_a',type,{},farm),/animal_has_linked_records/);
 assert.equal((await db.getCachedEntity('farm-record','animal_a')).payload.farmId,'farm_a');
 await write('independent','animal');await write('independent','animal',{},'farm_b');assert.equal((await db.getCachedEntity('farm-record','independent')).payload.farmId,'farm_b');
});

test('invalid typed events fail inside the local transaction without partial outbox writes',async()=>{
 account('animal_invalid');await write('animal_a','animal');const before=await db.exportLocalBackup();
 for(const patch of [{date:'2026-02-29'},{eventType:'bad'},{nextDate:'2026-04-31'}])await assert.rejects(write('invalid_event','health',{...health,...patch}),/invalid_animal_record_payload/);
 const after=await db.exportLocalBackup();assert.deepEqual(after.entities,before.entities);assert.deepEqual(after.outbox,before.outbox);
});

test('restore validates the actual destination graph when an incoming animal ID is protected by an existing record',async()=>{
 location.pathname='/app-local';owner.chooseOfflineWorkspace(false);
 await write('animal_collision','animal',{},'farm_b');
 const incomingAnimal={...eventRow('animal_collision'),payload:{farmId:'farm_a',recordType:'animal',category:'Bovino',title:'Animal',data:{}}};
 const before=await db.exportLocalBackup();await assert.rejects(db.importBackupToDevice(backup([incomingAnimal,eventRow('collision_event')])),/vínculo/);
 const after=await db.exportLocalBackup();assert.deepEqual(after.entities,before.entities);assert.deepEqual(after.outbox,before.outbox);
});

test('restore rejects an explicit foreign-owner target collision even within the same farm',async()=>{
 location.pathname='/app-local';owner.chooseOfflineWorkspace(false);
 await db.cacheEntity('farm-record','owned_collision',{farmId:'farm_a',recordType:'animal',category:'Bovino',title:'Existing owner',data:{},ownerId:'foreign_owner'});
 const event=eventRow('foreign_owner_event','owned_collision');await assert.rejects(db.importBackupToDevice(backup([event])),/vínculo/);
 assert.equal(await db.getCachedEntity('farm-record','foreign_owner_event'),undefined);
});

test('imported owner metadata is provenance, allowing local-only correction and re-export of recovered dossiers',async()=>{
 const animal={...eventRow('recovered_animal'),payload:{farmId:'farm_recovery',recordType:'animal',category:'Bovino',title:'Recovered',ownerId:'source_owner',data:{tag:'R-1'}}};
 const event={...eventRow('recovered_event','recovered_animal'),payload:{...eventRow('recovered_event','recovered_animal').payload,farmId:'farm_recovery',ownerId:'source_owner'}};
 await db.importBackupToDevice(backup([animal,event]));location.pathname='/app-local';owner.chooseOfflineWorkspace(false);
 await write('recovered_event','health',{notes:'Local correction'},'farm_recovery');assert.equal((await db.getCachedEntity('farm-record','recovered_event')).payload.data.animalId,'recovered_animal');
 const {parseLocalBackup}=await vite.ssrLoadModule('/lib/backup-import.ts');assert.ok(parseLocalBackup(JSON.stringify(await db.exportLocalBackup())));
});

test('pending-only target records also protect imports from known incompatible ID collisions',async()=>{
 location.pathname='/app-local';owner.chooseOfflineWorkspace(false);await write('pending_only_animal','animal',{},'farm_b');
 const database=await new Promise((resolve,reject)=>{const request=indexedDB.open(owner.databaseNameForOwner('device-local'));request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
 await new Promise((resolve,reject)=>{const tx=database.transaction('entities','readwrite');tx.objectStore('entities').delete('farm-record:pending_only_animal');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});database.close();
 await assert.rejects(db.importBackupToDevice(backup([eventRow('pending_only_event','pending_only_animal')])),/vínculo/);assert.equal(await db.getCachedEntity('farm-record','pending_only_event'),undefined);
});

test('an animal cannot be converted into a self-referencing history event',async()=>{
 account('no_self_reference');await write('self_animal','animal');await assert.rejects(write('self_animal','health',{...health,animalId:'self_animal'}),/animal_not_available/);assert.equal((await db.getCachedEntity('farm-record','self_animal')).payload.recordType,'animal');
});
