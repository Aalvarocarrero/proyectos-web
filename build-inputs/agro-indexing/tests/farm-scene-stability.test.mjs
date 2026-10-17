import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({root,configFile:false,appType:'custom',resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(()=>vite.close());
const {retainFarmScene}=await vite.ssrLoadModule('/lib/farm-scene-stability.ts');
const {illustratedPlan}=await vite.ssrLoadModule('/lib/illustrated-plan-adapter.ts');
const fixture=JSON.parse(await readFile(root+'lib/farm-demo-fixture.json','utf8'));
const records=fixture.records;
function scene(rows=records){return {...illustratedPlan(rows.filter(r=>r.payload.recordType==='area').map(area=>({area,layout:{x:area.payload.data.mapX,y:area.payload.data.mapY,width:area.payload.data.mapWidth,height:area.payload.data.mapHeight}})),{x:0,y:0,scale:1},rows,true),boundary:[{x:0,y:0},{x:400,y:0},{x:400,y:250},{x:0,y:250}]};}
test('opening and closing dossier retains unchanged scene inputs',()=>{const initial=scene();assert.equal(retainFarmScene(initial,initial),initial);assert.equal(retainFarmScene(initial,scene(structuredClone(records))),initial);});
test('saved health, reproduction and dated weights do not rebuild scene or reset its camera',()=>{const initial=scene();for(const recordType of ['health','reproduction','weight']){const rows=structuredClone(records);rows.push({id:'test-history',payload:{farmId:rows[0].payload.farmId,recordType,title:'Fictional test',category:'Bovino',data:{animalId:rows.find(r=>r.payload.recordType==='animal').id,date:'2026-10-13',weightKg:420}}});assert.equal(retainFarmScene(initial,scene(rows)),initial);}});
test('visible animal identity or position changes replace animal scene input',()=>{const initial=scene();assert.ok(initial.animals.length);for(const field of ['title','position']){const next=structuredClone(initial);next.animals[0][field]=field==='title'?'Corrected visible name':{x:18,y:19};const retained=retainFarmScene(initial,next);assert.notEqual(retained.animals,initial.animals);assert.equal(retained.areas,initial.areas);assert.equal(retained.boundary,initial.boundary);}});
test('geometry, linked roster counts and boundary changes still reach the renderer',()=>{const initial=scene();for(const field of ['outline','linkedAnimalCount']){const next=structuredClone(initial);next.areas[0][field]=field==='outline'?[{x:1,y:2},{x:20,y:2},{x:20,y:30}]:999;const retained=retainFarmScene(initial,next);assert.notEqual(retained.areas,initial.areas);assert.equal(retained.animals,initial.animals);}const next=structuredClone(initial);next.boundary[0].x=1;assert.notEqual(retainFarmScene(initial,next).boundary,initial.boundary);});
test('map passes retained geometry and a separate dialog block into masterplan',async()=>{const source=await readFile(root+'components/farm-map-editor.tsx','utf8');assert.match(source,/const illustrated=retainFarmScene\(previousScene,nextScene\)/);assert.match(source,/propertyOutline=\{illustrated.boundary\} areas=\{illustrated.areas\} animals=\{illustrated.animals\}/);assert.match(source,/interactionBlocked=\{interactionBlocked\|\|contextOpen/);});
