import test from 'node:test';import assert from 'node:assert/strict';
import {newComposition,validateComposition,putPiece,undoComposition,nextComposition,compositionDifference} from '../dist/composition.mjs';
import {newConstruction,validateConstruction} from '../dist/construction.mjs';
import {newExploration,validateExploration} from '../dist/exploration.mjs';
import {saveProgress,loadProgress} from '../dist/local-progress.mjs';
test('composition accepts different layouts, retains original and reverses a real edit',()=>{for(const index of [0,4,8]){const s=newComposition();assert.equal(nextComposition(s),false);putPiece(s,index);assert.equal(nextComposition(s),true);const initial=[...s.original];s.tool='leaf';putPiece(s,(index+1)%9);assert.equal(compositionDifference(s),1);assert.deepEqual(s.original,initial);assert.equal(undoComposition(s),true);assert.deepEqual(s.cells,initial);assert.equal(nextComposition(s),false);s.reason='space';assert.equal(nextComposition(s),true);assert.equal(s.page,2);assert.deepEqual(validateComposition(s),s);}});
test('editing invalidates a previous intention; no-op preserves undo; arrays are independent',()=>{const s=newComposition();putPiece(s,0);const undo=s.undo;assert.equal(putPiece(s,0),false);assert.equal(s.undo,undo);nextComposition(s);s.reason='focus';s.tool='empty';putPiece(s,0);assert.equal(s.reason,null);assert.equal(s.original[0],'book');assert.equal(nextComposition(s),false);assert.throws(()=>putPiece(s,9));});
test('studio validators reject sparse arrays, inherited fields and accessors without invoking them',()=>{
 const sparse=Array(9);sparse[0]='book';assert.throws(()=>validateComposition({...newComposition(),cells:sparse}));const c=newConstruction();c.items=Array(2);assert.throws(()=>validateConstruction(c,'3y'));
 for(const [state,validate] of [[newComposition(),validateComposition],[newConstruction(),x=>validateConstruction(x,'3y')],[newExploration('7y'),x=>validateExploration(x,'7y')]]){
  assert.throws(()=>validate(Object.create(state)));let invoked=false;const bad={...state};Object.defineProperty(bad,'page',{enumerable:true,get(){invoked=true;return 0;}});assert.throws(()=>validate(bad));assert.equal(invoked,false);
 }
 const inherited=Array(9);Object.setPrototypeOf(inherited,{0:'book'});assert.throws(()=>validateComposition({...newComposition(),cells:inherited}));
 for(const key of ['original','undo']){const s=newComposition();s[key]=Array(9);assert.throws(()=>validateComposition(s));}
 assert.throws(()=>validateComposition({...newComposition(),tool:'toString'}));assert.throws(()=>validateComposition({...newComposition(),reason:'__proto__'}));assert.throws(()=>validateExploration(Object.assign(Object.create({hint:false}),{open:true,page:0,left:'a',right:'b',revealed:false}),'7y'));
});
test('composition round-trips with undo, rejects invalid save without replacing data, preserves v23/v24 states',()=>{
 let raw=null;const store={getItem:()=>raw,setItem:(_,v)=>raw=v};const s=newComposition();putPiece(s,0);nextComposition(s);s.tool='star';putPiece(s,4);const snapshot={stage:'7y',selectedActivities:{'7y':'composition'},states:{'7y:composition':{composition:s},'3y:extra':{construction:newConstruction()},'2y:original':{exploration:newExploration('2y')}}};assert.equal(saveProgress(store,snapshot).ok,true);assert.deepEqual(loadProgress(store).snapshot.states['7y:composition'].composition,s);const before=raw;s.cells=Array(9);assert.equal(saveProgress(store,snapshot).status,'invalid');assert.equal(raw,before);assert.equal(loadProgress(store).ok,true);delete snapshot.states['7y:composition'];snapshot.selectedActivities['7y']='original';assert.equal(saveProgress(store,snapshot).ok,true);
});
