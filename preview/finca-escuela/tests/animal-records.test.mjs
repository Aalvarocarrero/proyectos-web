import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({root,configFile:false,appType:'custom',resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(()=>vite.close());
const helpers=await vite.ssrLoadModule('/lib/animal-records.ts');
const {farmRecordPayloadSchema}=await vite.ssrLoadModule('/lib/sync-validation.ts');
const {parseLocalBackup}=await vite.ssrLoadModule('/lib/backup-import.ts');
const row=(id,type,data={},farmId='farm_a')=>({id,key:`farm-record:${id}`,entityType:'farm-record',payload:{farmId,recordType:type,category:'Bovino',title:id,data},updatedAt:'2026-10-13T00:00:00Z',syncState:'pending'});
const backup=(entities,outbox=[])=>JSON.stringify({format:'venezuela-agro-local-backup',version:1,owner:'owner_a',origin:'https://example.test',exportedAt:'2026-10-13T00:00:00Z',entities,outbox,meta:[]});

test('calendar dates reject rollovers, timestamps, unknown dates and non-leap centuries',()=>{
 for(const date of ['2024-02-29','2000-02-29','2026-10-13','0001-01-01'])assert.equal(helpers.isAnimalRecordDate(date),true);
 for(const date of ['2026-02-29','1900-02-29','2026-04-31','2026-00-01','2026-13-01','0000-01-01','2026-10-13T00:00:00Z','2026-1-01','',null,12])assert.equal(helpers.isAnimalRecordDate(date),false);
});

test('only explicit same-farm IDs form a dossier; dates are never inferred and input is unchanged',()=>{
 const animal=row('animal_a','animal');animal.payload.title='Same title';
 const records=[row('weight_b','weight',{animalId:'animal_a',measuredAt:'2026-10-13',weightKg:220}),row('weight_a','weight',{animalId:'animal_a',measuredAt:'2026-09-13',weightKg:200}),row('weight_legacy','weight',{animalId:'animal_a',weightKg:100}),row('health_a','health',{animalId:'animal_a',eventType:'vaccination',date:'2026-10-12'}),row('rep_a','reproduction',{animalId:'animal_a',eventType:'mating',date:'2026-10-11'}),row('foreign','health',{animalId:'animal_a'},'farm_b'),row('by_name','health',{group:'Same title'}),row('other_type','task',{animalId:'animal_a'})];
 const before=structuredClone(records),result=helpers.linkedAnimalRecords(animal,records);
 assert.deepEqual(result.weights.map(row=>row.id),['weight_a','weight_b','weight_legacy']);
 assert.deepEqual(result.history.map(row=>row.id),['weight_b','health_a','rep_a','weight_a','weight_legacy']);
 assert.equal(result.health[0],records[3]);assert.equal(helpers.animalRecordDate(records[2]),null);
 assert.equal(helpers.animalRecordEventLabel(records[3]),'Vacunación');
 assert.deepEqual(records,before);
});

test('typed linked events validate enum, date, link kind and text while retaining legacy and unknown data',()=>{
 for(const [type,events] of [['health',helpers.HEALTH_EVENT_TYPES],['reproduction',helpers.REPRODUCTION_EVENT_TYPES]])for(const event of events){
  const payload=row('event',type,{animalId:'animal_a',eventType:event.value,date:'2026-10-13',nextDate:'2026-11-13',custom:{untouched:true},event:'Legacy note',group:'Legacy group'}).payload;
  const result=farmRecordPayloadSchema.parse(payload);assert.deepEqual(result.data.custom,{untouched:true});assert.equal(result.data.group,'Legacy group');
  for(const patch of [{animalId:'../foreign'},{eventType:'unknown'},{date:'2026-02-29'},{date:''},{nextDate:'2026-02-31'},{notes:42},{professional:{bad:true}}])assert.equal(farmRecordPayloadSchema.safeParse({...payload,data:{...payload.data,...patch}}).success,false);
 }
 for(const type of ['animal','crop','task','area'])assert.equal(farmRecordPayloadSchema.safeParse(row('bad',type,{animalId:'animal_a'}).payload).success,false);
 for(const payload of [row('legacy','health',{event:'Vacunación',group:'Lote A',eventType:'legacy-unknown',date:'Sin confirmar'}).payload,row('weight','weight',{weightKg:12}).payload])assert.equal(farmRecordPayloadSchema.safeParse(payload).success,true);
 assert.equal(farmRecordPayloadSchema.safeParse(row('rep','reproduction',{eventType:'birth',date:'2026-10-13'}).payload).success,false);
});

test('old-client updates preserve identity and unknown fields without cross-farm/type carryover or restoring cleared placement',()=>{
 const old={farmId:'farm_a',recordType:'animal',data:{tag:'A-1',name:'Alba',birthDate:'2024-01-01',breed:'Test',custom:{v:1},areaId:'area_a',planPlacement:{areaId:'area_a'}}};
 assert.deepEqual(helpers.preserveAnimalRecordData({...old,data:{name:'New',tag:null}},old),{tag:null,name:'New',birthDate:'2024-01-01',breed:'Test',custom:{v:1}});
 assert.deepEqual(helpers.preserveAnimalRecordData({...old,farmId:'farm_b',data:{}},old),{});
 assert.deepEqual(helpers.preserveAnimalRecordData({...old,recordType:'health',data:{}},old),{});
});

test('backup graph rejects known cross-farm, wrong-kind and cross-owner animal links before import',()=>{
 const animal=row('animal_a','animal'),event=row('health_a','health',{animalId:'animal_a',eventType:'review',date:'2026-10-13'});
 assert.equal(parseLocalBackup(backup([animal,event])).entities.length,2);
 for(const patch of [{farmId:'farm_b'},{recordType:'task'},{ownerId:'owner_b'}])assert.throws(()=>parseLocalBackup(backup([{...animal,payload:{...animal.payload,...patch}},event])),/vínculo/);
 const wrongOwner={...event,payload:{...event.payload,ownerId:'owner_b'}};assert.throws(()=>parseLocalBackup(backup([animal,wrongOwner])),/vínculo/);
 const operation={id:'op_event',entityType:'farm-record',entityId:event.id,action:'upsert',payload:event.payload,clientUpdatedAt:event.updatedAt};
 assert.throws(()=>parseLocalBackup(backup([{...animal,payload:{...animal.payload,farmId:'farm_b'}}],[operation])),/vínculo/);
});

test('backup recovery preserves orphan IDs and old unlinked records without guessing or fabricating animals',()=>{
 const orphan=row('orphan','health',{animalId:'animal_deleted',eventType:'illness',date:'2026-10-13',custom:{retained:true}}),legacy=row('legacy','health',{event:'Consulta',group:'Unknown animal'});
 const restored=parseLocalBackup(backup([orphan,legacy]));assert.equal(restored.entities.length,2);assert.deepEqual(restored.entities[0].payload.data,orphan.payload.data);assert.equal(restored.entities[1].payload.data.animalId,undefined);
});

test('a backup pending edit from an old client preserves the cached animal identity and linked event fields',()=>{
 const animal=row('animal_a','animal',{tag:'A-1',custom:'keep'}),event=row('health_a','health',{animalId:'animal_a',eventType:'review',date:'2026-10-13',custom:'keep'});
 const operations=[animal,event].map(record=>({id:'op_'+record.id,entityType:'farm-record',entityId:record.id,action:'upsert',payload:{...record.payload,data:{notes:'Old client edit'}},clientUpdatedAt:record.updatedAt}));
 const restored=parseLocalBackup(backup([animal,event],operations));assert.equal(restored.outbox[0].payload.data.tag,'A-1');assert.equal(restored.outbox[1].payload.data.animalId,'animal_a');assert.equal(restored.outbox[1].payload.data.eventType,'review');assert.equal(restored.outbox[1].payload.data.custom,'keep');
});

test('backup self-reference cannot masquerade as a historical missing animal',()=>{
 const event=row('health_self','health',{animalId:'health_self',eventType:'review',date:'2026-10-13'});assert.throws(()=>parseLocalBackup(backup([event])),/vínculo/);
});
