import assert from 'node:assert/strict';
import test,{after,beforeEach} from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const sqlite=new DatabaseSync(':memory:');for(const file of readdirSync(root+'drizzle').filter(file=>file.endsWith('.sql')).sort())sqlite.exec(readFileSync(root+'drizzle/'+file,'utf8'));
let beforeFarmWrite;
const adapter={prepare(query){const statement=sqlite.prepare(query);const before=()=>{if(beforeFarmWrite&&/^(?:insert into|update) "farm_records"/i.test(query)){const callback=beforeFarmWrite;beforeFarmWrite=null;callback();}};const bind=(values=[])=>({bind(...args){return bind(args);},async run(){before();return{success:true,meta:statement.run(...values)};},async all(){before();return{results:statement.all(...values)};},async raw(){before();statement.setReturnArrays(true);return statement.all(...values);}});return bind();}};
globalThis.__animalTestEnv={DB:adapter};globalThis.__animalTestUser=null;
const vite=await createServer({root,configFile:false,appType:'custom',resolve:{alias:{'@':root}},plugins:[{name:'animal-record-env',enforce:'pre',resolveId(id){if(id==='cloudflare:workers')return '\0animal-env';if(id.endsWith('/app/chatgpt-auth')||id.endsWith('/app/chatgpt-auth.ts'))return '\0animal-auth';},load(id){if(id==='\0animal-env')return 'export const env=globalThis.__animalTestEnv';if(id==='\0animal-auth')return 'export async function getChatGPTUser(){return globalThis.__animalTestUser}';}}],server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
const {POST}=await vite.ssrLoadModule('/app/api/sync/route.ts');
after(async()=>{await vite.close();sqlite.close();delete globalThis.__animalTestEnv;delete globalThis.__animalTestUser;});
const time='2026-10-13T00:00:00.000Z';let sequence=0;
const payload=(type,data={},farmId='farm_a')=>({farmId,recordType:type,category:'Bovino',title:'Synthetic record',data});
const health={animalId:'animal_a',eventType:'review',date:'2026-10-13'};
function seed(id,type,data={},farm='farm_a',owner='owner_a',deleted=0){sqlite.prepare('INSERT INTO farm_records(id,owner_id,farm_id,record_type,category,title,data_json,revision,client_updated_at,server_updated_at,deleted) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(id,owner,farm,type,'Bovino','Synthetic',JSON.stringify(data),'revision_'+id,time,time,deleted);}
function operation(id,type,data={},options={}){return{id:`sync_animal_${++sequence}`,entityType:'farm-record',entityId:id,action:'upsert',payload:payload(type,data,options.farmId),clientUpdatedAt:time,baseRevision:null,...options};}
async function send(operations,{owner=globalThis.__animalTestUser?.id??'device-local',origin='https://synthetic.test'}={}){const request=new Request('https://synthetic.test/api/sync',{method:'POST',headers:{origin,'content-type':'application/json','x-local-owner':owner},body:JSON.stringify({operations:Array.isArray(operations)?operations:[operations]})});Object.defineProperty(request,'nextUrl',{value:new URL(request.url)});const response=await POST(request);return{status:response.status,...await response.json()};}
const saved=id=>sqlite.prepare('SELECT * FROM farm_records WHERE id=?').get(id);
const data=id=>JSON.parse(saved(id).data_json);
beforeEach(()=>{
 beforeFarmWrite=null;sqlite.exec('DELETE FROM sync_receipts; DELETE FROM farm_records; DELETE FROM farms; DELETE FROM user_consents; DELETE FROM users;');
 for(const id of ['owner_a','owner_b'])sqlite.prepare('INSERT INTO users(id,email,created_at,updated_at) VALUES (?,?,?,?)').run(id,id+'@example.test',time,time);
 for(const[id,owner]of [['farm_a','owner_a'],['farm_other','owner_a'],['farm_b','owner_b']])sqlite.prepare('INSERT INTO farms(id,owner_id,name,revision,client_updated_at,server_updated_at) VALUES (?,?,?,?,?,?)').run(id,owner,'Synthetic farm','farm_v1',time,time);
 globalThis.__animalTestUser={id:'owner_a',email:'owner_a@example.test',displayName:'Synthetic owner'};seed('animal_a','animal',{tag:'A-1',name:'Alba',breed:'Criollo',custom:{preserved:true}});
});

test('actual sync stores linked typed health and reproduction, preserves unknown fields and replays without duplicates',async()=>{
 for(const[type,eventType]of [['health','vaccination'],['reproduction','pregnancy-check']]){
  const op=operation('event_'+type,type,{...health,eventType,professional:'Recorded name',outcome:'Recorded result',custom:{preserved:true}});
  const first=await send(op);assert.deepEqual(first.accepted,[op.id]);assert.equal(data(op.entityId).animalId,'animal_a');assert.deepEqual(data(op.entityId).custom,{preserved:true});
  sqlite.prepare("UPDATE sync_receipts SET receipt_status='pending' WHERE id=?").run(op.id);
  const replay=await send(op);assert.deepEqual(replay.accepted,[op.id]);assert.equal(replay.revisions[op.id],first.revisions[op.id]);
 }
 assert.equal(sqlite.prepare('SELECT count(*) n FROM farm_records').get().n,3);
});

test('new references reject foreign farm, owner, kind, deletion, missing ID and forged local owner',async()=>{
 seed('other_farm_animal','animal',{},'farm_other');seed('foreign_animal','animal',{},'farm_b','owner_b');seed('forged_same_farm','animal',{},'farm_a','owner_b');seed('not_animal','task');seed('deleted_animal','animal',{},'farm_a','owner_a',1);
 for(const animalId of ['other_farm_animal','foreign_animal','forged_same_farm','not_animal','deleted_animal','missing_animal']){
  const op=operation('event_'+animalId,'health',{...health,animalId});const result=await send(op);assert.equal(result.rejected[0].reason,'animal_not_available');assert.equal(saved(op.entityId),undefined);
 }
 const mismatch=await send(operation('owner_mismatch','health',health),{owner:'owner_b'});assert.equal(mismatch.status,409);assert.equal(mismatch.error,'local_owner_mismatch');
 globalThis.__animalTestUser=null;assert.equal((await send(operation('anonymous','health',health))).status,401);
});

test('server schema rejects malformed event dates and types while old unlinked records remain supported',async()=>{
 for(const patch of [{eventType:'guess'},{date:'2026-02-29'},{nextDate:'2026-04-31'},{animalId:'../bad'}]){
  const op=operation('invalid_'+sequence,'health',{...health,...patch});const result=await send(op);assert.equal(result.rejected[0].reason,'invalid_payload');assert.equal(saved(op.entityId),undefined);
 }
 const legacy=operation('legacy_health','health',{event:'Old visit',group:'A herd'});assert.deepEqual((await send(legacy)).accepted,[legacy.id]);assert.equal(data('legacy_health').animalId,undefined);
});

test('omitted identity and link fields from older clients are preserved and stale edits cannot erase corrections',async()=>{
 const animalEdit=operation('animal_a','animal',{status:'Active'},{baseRevision:'revision_animal_a'});const animalResult=await send(animalEdit);assert.deepEqual(animalResult.accepted,[animalEdit.id]);assert.equal(data('animal_a').tag,'A-1');assert.equal(data('animal_a').name,'Alba');assert.deepEqual(data('animal_a').custom,{preserved:true});
 seed('health_a','health',{...health,custom:'keep',notes:'Original'});
 const edit=operation('health_a','health',{notes:'Correction'},{baseRevision:'revision_health_a'});const result=await send(edit);assert.deepEqual(result.accepted,[edit.id]);assert.equal(data('health_a').animalId,'animal_a');assert.equal(data('health_a').eventType,'review');assert.equal(data('health_a').custom,'keep');
 const stale=await send(operation('health_a','health',{...health,notes:'Stale'},{baseRevision:'revision_health_a'}));assert.equal(stale.rejected[0].reason,'version_conflict');assert.equal(data('health_a').notes,'Correction');
 const unlink=operation('health_a','health',{animalId:null},{baseRevision:result.revisions[edit.id]});assert.deepEqual((await send(unlink)).accepted,[unlink.id]);assert.equal(data('health_a').animalId,null);
});

test('animal deletion keeps linked histories intact and only unchanged historical links can still be edited',async()=>{
 seed('health_a','health',health);const del=operation('animal_a','animal',{}, {action:'delete',payload:{},baseRevision:'revision_animal_a'});assert.deepEqual((await send(del)).accepted,[del.id]);assert.equal(saved('animal_a').deleted,1);assert.equal(saved('health_a').deleted,0);assert.equal(data('health_a').animalId,'animal_a');
 const edit=operation('health_a','health',{notes:'Historical correction'},{baseRevision:'revision_health_a'});assert.deepEqual((await send(edit)).accepted,[edit.id]);
 const fresh=await send(operation('new_after_delete','health',health));assert.equal(fresh.rejected[0].reason,'animal_not_available');
 const relink=await send(operation('health_a','health',{animalId:'missing_animal'},{baseRevision:saved('health_a').revision}));assert.equal(relink.rejected[0].reason,'animal_not_available');
});

test('linked animals cannot move farms or change record type; the original dossier is unchanged',async()=>{
 seed('weight_a','weight',{animalId:'animal_a',weightKg:250});const before=saved('animal_a');
 for(const[type,farmId]of [['animal','farm_other'],['task','farm_a']]){const result=await send(operation('animal_a',type,{},{farmId,baseRevision:before.revision}));assert.equal(result.rejected[0].reason,'animal_has_linked_records');assert.deepEqual(saved('animal_a'),before);}
});

test('a target deleted or moved after preflight cannot accept a new linked event in the final SQL write',async()=>{
 for(const update of ["UPDATE farm_records SET deleted=1 WHERE id='animal_a'","UPDATE farm_records SET farm_id='farm_other' WHERE id='animal_a'"]){
  sqlite.prepare("UPDATE farm_records SET deleted=0,farm_id='farm_a' WHERE id='animal_a'").run();beforeFarmWrite=()=>sqlite.exec(update);
  const op=operation('late_event_'+sequence,'health',health),result=await send(op);assert.equal(result.rejected[0].reason,'animal_not_available');assert.equal(saved(op.entityId),undefined);
 }
});

test('a linked history arriving after move preflight atomically prevents moving the animal',async()=>{
 beforeFarmWrite=()=>seed('late_weight','weight',{animalId:'animal_a',weightKg:210});
 const result=await send(operation('animal_a','animal',{},{farmId:'farm_other',baseRevision:'revision_animal_a'}));assert.equal(result.rejected[0].reason,'animal_has_linked_records');assert.equal(saved('animal_a').farm_id,'farm_a');assert.equal(saved('animal_a').revision,'revision_animal_a');assert.ok(saved('late_weight'));
});

test('a concurrent correction invalidates a merged old-client write without dropping the newer identity',async()=>{
 beforeFarmWrite=()=>sqlite.prepare("UPDATE farm_records SET data_json=?,revision='newer_revision' WHERE id='animal_a'").run(JSON.stringify({tag:'Newer tag',custom:{newer:true}}));
 const result=await send(operation('animal_a','animal',{status:'Old client'},{baseRevision:'revision_animal_a'}));assert.equal(result.rejected[0].reason,'version_conflict');assert.deepEqual(data('animal_a'),{tag:'Newer tag',custom:{newer:true}});
});

test('converting an unlinked animal into an event still enforces the linked-target atomic guard',async()=>{
 seed('convertible','animal');beforeFarmWrite=()=>sqlite.exec("UPDATE farm_records SET farm_id='farm_other' WHERE id='animal_a'");
 const result=await send(operation('convertible','health',health,{baseRevision:'revision_convertible'}));assert.equal(result.accepted.length,0);assert.equal(result.rejected.length,1);assert.equal(saved('convertible').record_type,'animal');assert.equal(saved('convertible').revision,'revision_convertible');
});

test('an animal cannot be converted into an event linked to its own record ID',async()=>{
 const result=await send(operation('animal_a','health',health,{baseRevision:'revision_animal_a'}));assert.equal(result.rejected[0].reason,'animal_not_available');assert.equal(saved('animal_a').record_type,'animal');assert.equal(saved('animal_a').revision,'revision_animal_a');
});
