import test from 'node:test';
import assert from 'node:assert/strict';
import {newConstruction,evaluateConstruction,validateConstruction} from '../dist/construction.mjs';
import {saveProgress,loadProgress} from '../dist/local-progress.mjs';
test('patterns accept both authored motifs and require three groups after a changed rule',()=>{
 for(const variant of [0,1]){const s={...newConstruction(),variant};const a=variant?'triangle':'circle',b=variant?'circle':'triangle';s.items=[a,b,a,b,a,b];assert.equal(evaluateConstruction('3y',s).correct,true);s.page=1;assert.equal(evaluateConstruction('3y',s).correct,false);s.items=[a,a,b,a,a,b,a,a,b];assert.equal(evaluateConstruction('3y',s).correct,true);s.page=2;s.tested=true;assert.deepEqual(validateConstruction(s,'3y'),s);}
});
test('robot tries actual steps, rejects boundaries and preserves a trace at the new obstruction',()=>{
 const s=newConstruction();s.items=['right','right','down'];assert.deepEqual(evaluateConstruction('5y',s).trace,['A1','B1','C1','C2']);assert.equal(evaluateConstruction('5y',s).correct,true);s.page=1;assert.deepEqual(evaluateConstruction('5y',s).trace,['A1']);assert.equal(evaluateConstruction('5y',s).correct,false);s.items=['down','right','right'];assert.equal(evaluateConstruction('5y',s).correct,true);s.items=['left'];assert.equal(evaluateConstruction('5y',s).correct,false);s.items=[];assert.equal(evaluateConstruction('5y',s).correct,false);
});
test('construction codec is optional, bounded, rejects injected content and verifies closure',()=>{
 for(const stage of ['3y','5y']){let raw=null;const store={getItem:()=>raw,setItem:(_,v)=>raw=v};const construction=newConstruction();const value={stage,selectedActivities:{[stage]:'extra'},states:{[`${stage}:extra`]:{phase:'active',construction}}};assert.equal(saveProgress(store,value).ok,true);assert.deepEqual(loadProgress(store).snapshot.states[`${stage}:extra`].construction,construction);for(const mutate of [s=>s.items=['<script>'],s=>s.page=2,s=>s.personal='name',s=>s.items=Array(20).fill('circle'),s=>s.open='yes']){const invalid=newConstruction();mutate(invalid);value.states[`${stage}:extra`].construction=invalid;assert.equal(saveProgress(store,value).status,'invalid');}delete value.states[`${stage}:extra`].construction;assert.equal(saveProgress(store,value).ok,true);assert.equal(loadProgress(store).snapshot.states[`${stage}:extra`].construction,undefined);}
});
