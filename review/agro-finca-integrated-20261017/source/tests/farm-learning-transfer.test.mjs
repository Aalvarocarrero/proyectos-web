import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {newGame,restoreGame,TRANSFER_CASES,decideTransfer,transition,cycleTransition,writeProgress,readProgress} from '../lib/farm-learning-engine.mjs';
test('18 transfer cases explain both decisions, allow reconsideration and never advance a mission',()=>{
 assert.equal(Object.keys(TRANSFER_CASES).length,6);
 for(const [id,cases] of Object.entries(TRANSFER_CASES)){
  assert.equal(cases.length,3);
  cases.forEach((item,index)=>{
   assert.equal(item.choices.length,2);assert.equal(new Set(item.choices).size,2);
   let s=newGame();
   for(const choice of [1-item.answer,item.answer]){
    const r=decideTransfer(s,id,index,choice);assert.equal(r.ok,true);assert.equal(r.matched,choice===item.answer);assert.equal(r.message,item.effects[choice]);assert.ok(r.message.length>45);s=r.state;
    assert.equal(s.stage,0);assert.deepEqual(s.cycles,newGame().cycles);assert.deepEqual(s.sessions,newGame().sessions);assert.equal(s.decisions[id+'-'+index],choice);
   }
  });
 }
});
test('v4 optional decision evidence is bounded, preserves older saves and survives mode, replay and roundtrip',()=>{
 const old=newGame();delete old.decisions;assert.deepEqual(restoreGame(old).decisions,{});
 let s=decideTransfer(old,'poultry',2,0).state;s=decideTransfer(s,'cilantro',1,1).state;
 assert.deepEqual(restoreGame({...s,decisions:{...s.decisions,name:'private','pig-0':'1','tomato-99':0,'bovine-0':false}}).decisions,s.decisions);
 for(const updated of [transition(s,'mode',{mode:'deepen'}).state,transition(s,'reset').state,cycleTransition(s,'poultry','replay').state])assert.deepEqual(updated.decisions,s.decisions);
 const data=new Map(),storage={setItem:(k,v)=>data.set(k,v),getItem:k=>data.get(k)};writeProgress(storage,s);assert.deepEqual(readProgress(storage),s);
 for(const args of [['bad',0,0],['pig',-1,0],['pig',0,3],['pig','0',0]])assert.equal(decideTransfer(s,...args).ok,false);
});
test('core decisions precede lengthy explanations; transfer is optional at checkpoints and recorded in the notebook',async()=>{
 const read=path=>readFile(new URL('../learning/'+path,import.meta.url),'utf8');
 const ui=await read('farm-learning-ui.js'),species=await read('farm-learning-species.js'),session=await read('farm-learning-sessions.js');
 assert.ok(ui.includes("${action}${depthMarkup('cilantro'"));assert.ok(species.includes('${body.action}${depthMarkup('));
 assert.ok(session.includes("state.mode==='deepen'?transferMarkup(id,m.index):''"));assert.ok(session.indexOf('class="session-save"')<session.indexOf('data-session-action="finish"'));assert.ok(session.indexOf('data-session-action="finish"')<session.indexOf('transferMarkup(id,m.index)'));assert.ok(ui.includes('transferNotebook()'));assert.ok(ui.includes('handleTransfer(button)'));
});

test('transfer updates checkpoint persistence status without replacing the focused choice',async()=>{
 const depth=await readFile(new URL('../learning/farm-learning-depth.js',import.meta.url),'utf8');
 assert.ok(depth.includes("card.closest('.session-recap').querySelector('.session-save').textContent=$('save-status').textContent"));
});
