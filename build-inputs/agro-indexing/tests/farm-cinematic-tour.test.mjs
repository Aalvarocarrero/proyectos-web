import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const source=await readFile(new URL('../lib/farm-cinematic-tour.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {cinematicSegmentClear,cinematicReturnPath,createFarmCinematicTour}=await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const overview={id:'overview',position:[40,40,40],target:[0,0,0]};
test('segment clearance rejects crossings and grazing contacts, including long jumps over narrow posts',()=>{
 const obstacles=[{min:[0,0,0],max:[1,4,1]}];
 assert.equal(cinematicSegmentClear([-10,2,.5],[10,2,.5],obstacles,.3),false);
 assert.equal(cinematicSegmentClear([-.3,2,-10],[-.3,2,10],obstacles,.3),false);
 assert.equal(cinematicSegmentClear([-2,5,.5],[2,5,.5],obstacles,.3),true);
 assert.equal(cinematicSegmentClear([2,.1,2],[2,1,2],[],.3),false);
 assert.equal(cinematicSegmentClear([NaN,2,2],[2,1,2],[],.3),false);
});
test('safe return exits under a roof before ascending and fails closed when embedded in a wall',()=>{
 const roof={min:[-5,4,-3],max:[5,4.5,3]},from={position:[0,2,0],target:[3,1,0]};
 const path=cinematicReturnPath(from,overview,[roof],1);assert.ok(path);assert.ok(path[0].position[1]===2,'escape sideways before ascent');
 let previous=from.position;for(const shot of path){assert.ok(cinematicSegmentClear(previous,shot.position,[roof],.35));previous=shot.position;}
 assert.deepEqual(previous,overview.position);
 assert.equal(cinematicReturnPath({position:[0,4.2,0],target:[1,4,0]},overview,[roof],1),null);
});
test('blocked barn aisle is skipped rather than flying through its door or fabricating an interior',()=>{
 const obstacles=[{min:[-3,0,-2],max:[3,5,2]}],shots=createFarmCinematicTour({overview,metre:1,obstacles,barns:[{id:'barn',title:'Barn',position:[0,0,0],scale:[5,8,5]}],animals:[],crops:[]});
 assert.ok(!shots.some(s=>s.id.includes('aisle')));assert.ok(shots.some(s=>s.id.includes('exterior')));
 let previous=overview.position;for(const shot of shots){assert.ok(cinematicSegmentClear(previous,shot.position,obstacles,.35));previous=shot.position;}
 assert.deepEqual(previous,overview.position);
});
test('empty farm has no invented cinematic subjects',()=>{
 assert.deepEqual(createFarmCinematicTour({overview,metre:1,obstacles:[],barns:[],animals:[],crops:[]}),[]);
});
