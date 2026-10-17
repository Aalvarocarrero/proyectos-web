import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import * as engine from '../lib/farm-learning-engine.mjs';

const {newGame,restoreGame,validProgress,readProgress,writeProgress,SAVE_KEY,PREVIOUS_SAVE_KEY,V2_SAVE_KEY,LEGACY_SAVE_KEY}=engine;
const keys=[SAVE_KEY,PREVIOUS_SAVE_KEY,V2_SAVE_KEY,LEGACY_SAVE_KEY];
const invalid=['','{broken','null','false','[]','{}','{"version":99,"stage":3}',...[-1,8,1.5,'2',null].map(stage=>JSON.stringify({version:4,stage}))];
const embedded={...newGame(),stage:5,name:'private',email:'private',decisions:{'pig-0':1,email:'private'}};
function storage(entries=[]) {
 const data=new Map(entries),writes=[];
 return {data,writes,getItem:key=>data.get(key)??null,setItem(key,value){writes.push([key,value]);data.set(key,value);}};
}

test('supported versions and integer stage bounds are validated without accepting arrays or primitives',()=>{
 for(const version of [1,2,3,4])for(let stage=0;stage<=7;stage++)assert.equal(validProgress({version,stage}),true);
 for(const raw of invalid){let value;try{value=JSON.parse(raw);}catch{value=undefined;}assert.equal(validProgress(value),false);}
 assert.equal(validProgress(Object.assign([],{version:4,stage:2})),false);
});

test('missing or entirely invalid local saves recover sanitized embedded progress without writes',()=>{
 for(const raw of [undefined,...invalid]){
  const s=storage(raw===undefined?[]:keys.map(key=>[key,raw]));
  assert.deepEqual(readProgress(s,embedded),restoreGame(embedded));
  assert.doesNotMatch(JSON.stringify(readProgress(s,embedded)),/private|email|name/);
  assert.deepEqual(s.writes,[]);
 }
 assert.deepEqual(readProgress(storage(),{version:99,stage:4}),newGame());
});

test('first valid local save wins, including intentional stage zero and older versions behind invalid keys',()=>{
 for(const [index,key] of keys.entries())for(const version of [1,2,3,4])for(const stage of [0,3]){
  const local={...newGame(),version,stage,email:'private'};
  const s=storage(keys.map((k,i)=>[k,i<index?'{broken':JSON.stringify(i===index?local:embedded)]));
  assert.deepEqual(readProgress(s,embedded),restoreGame(local),`${key}/${version}/${stage}`);
  assert.deepEqual(s.writes,[]);
 }
});

test('invalid current bytes are never overwritten even when a valid older save can be recovered',()=>{
 for(const raw of invalid){
  const s=storage([[SAVE_KEY,raw],[PREVIOUS_SAVE_KEY,JSON.stringify({...newGame(),version:3,stage:2})]]);
  const before=[...s.data];
  assert.equal(readProgress(s,embedded).stage,2);
  assert.throws(()=>writeProgress(s,embedded));
  assert.deepEqual([...s.data],before);assert.deepEqual(s.writes,[]);
 }
});

test('blocked reads recover embedded progress and prevent writes; blocked or unverifiable writes fail',()=>{
 let writes=0;
 const blocked={getItem(){throw Error('blocked');},setItem(){writes++;}};
 assert.deepEqual(readProgress(blocked,embedded),restoreGame(embedded));
 assert.throws(()=>writeProgress(blocked,embedded));assert.equal(writes,0);
 assert.throws(()=>writeProgress({getItem:()=>null,setItem(){throw Error('quota');}},embedded),/quota/);
 assert.throws(()=>writeProgress({getItem:()=>null,setItem(){}},embedded),/verificar/);
});

test('absent and valid current slots remain writable, preserving drafts and decisions while stripping private fields',()=>{
 const state={...newGame(),stage:6,email:'private'};
 state.drafts.cilantro={quantity:'3',unit:'manojos',destination:'compartir',name:'private'};
 state.decisions={'pig-0':1,'tomato-1':0,email:'private'};
 for(const existing of [undefined,...[1,2,3,4].map(version=>JSON.stringify({...newGame(),version}))]){
  const s=storage(existing===undefined?[]:[[SAVE_KEY,existing]]);
  writeProgress(s,state);assert.deepEqual(readProgress(s),restoreGame(state));assert.equal(s.writes.length,1);
  assert.equal(readProgress(s).drafts.cilantro.quantity,'3');assert.deepEqual(readProgress(s).decisions,{'pig-0':1,'tomato-1':0});
  assert.doesNotMatch(s.data.get(SAVE_KEY),/private|email|name/);
 }
});

test('copy UI uses embedded fallback and existing failure feedback without writing corrupt copy or original keys',async()=>{
 const ui=await readFile(new URL('../learning/farm-learning-ui.js',import.meta.url),'utf8');
 const setup=ui.slice(ui.indexOf('let embedded ='),ui.indexOf('function showFeedback'));
 for(const current of ['{broken',JSON.stringify(newGame())]){
  const s=storage([[`${SAVE_KEY}:copy:export-test`,current],[SAVE_KEY,JSON.stringify({...newGame(),stage:3})]]);
  const status={innerHTML:''};
  const context={...engine,localStorage:s,$:id=>id==='embedded-progress'?{textContent:JSON.stringify({id:'export-test',state:embedded})}:status,icon:()=>'',captureSessionDrafts:()=>{}};
  const result=runInNewContext(setup+';save();({state,saveWorks});',context);
  assert.equal(result.state.stage,current==='{broken'?5:0);
  assert.equal(result.saveWorks,current!=='{broken');
  assert.equal(s.data.get(SAVE_KEY),JSON.stringify({...newGame(),stage:3}));
  if(current==='{broken'){
   assert.equal(s.data.get(`${SAVE_KEY}:copy:export-test`),current);assert.deepEqual(s.writes,[]);
   assert.match(status.innerHTML,/No se pudo guardar. Descarga una copia/);
  }else assert.equal(s.writes[0][0],`${SAVE_KEY}:copy:export-test`);
 }
});
