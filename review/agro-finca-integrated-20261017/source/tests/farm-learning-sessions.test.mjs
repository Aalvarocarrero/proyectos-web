import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {newGame,restoreGame,learningMission,acknowledgeMission,MISSION_ENDS,SAVE_KEY,PREVIOUS_SAVE_KEY,V2_SAVE_KEY,LEGACY_SAVE_KEY,readProgress,writeProgress,transition,cycleTransition} from '../lib/farm-learning-engine.mjs';
import {buildLearningDocument} from '../scripts/build-farm-learning.mjs';

test('every path has exactly three finite missions with purposeful boundaries and explicit continuation',()=>{
 for(const [id,ends] of Object.entries(MISSION_ENDS)){
  let state=newGame();
  assert.equal(learningMission(state,id).index,0);
  for(const [index,end] of ends.entries()){
   if(id==='cilantro'){state.stage=end;if(end===7)state.record={crop:'Cilantro',quantity:3,unit:'manojos',destination:'cocina'};}
   else state.cycles[id].step=end;
   const m=learningMission(state,id);assert.equal(m.pending,true);assert.equal(m.index,index);assert.equal(m.completed,m.total);assert.equal(m.finished,index===2);
   state=restoreGame(JSON.parse(JSON.stringify(state)));assert.equal(learningMission(state,id).pending,true,'Reload preserves the checkpoint');
   const advanced=acknowledgeMission(state,id);assert.equal(advanced.ok,true);assert.equal(advanced.state.sessions[id],end);state=advanced.state;
   assert.equal(learningMission(state,id).pending,false);assert.equal(acknowledgeMission(state,id).ok,false);
  }
 }
 assert.equal(learningMission(newGame(),'unknown'),null);
});
test('v1 through v3 migrate into a separate verified v4 key without modifying original bytes',()=>{
 for(const [version,key] of [[1,LEGACY_SAVE_KEY],[2,V2_SAVE_KEY],[3,PREVIOUS_SAVE_KEY]]){
  const old={...newGame(),version,stage:4};delete old.sessions;old.cycles.maize={step:6,done:false};old.modules.maize.plots=[0,1,2,4];old.challenges.spacing.seeds=[0,2];
  const bytes=JSON.stringify(old),data=new Map([[key,bytes]]),storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
  const state=readProgress(storage);assert.equal(state.version,4);assert.equal(state.stage,4);assert.deepEqual(state.cycles,old.cycles);assert.deepEqual(state.modules,old.modules);assert.deepEqual(state.challenges,old.challenges);
  assert.equal(state.sessions.cilantro,2);assert.equal(state.sessions.maize,6);assert.equal(learningMission(state,'maize').pending,false);
  writeProgress(storage,state);assert.equal(data.get(key),bytes);assert.ok(data.has(SAVE_KEY));
  data.set(SAVE_KEY,'{broken');assert.equal(readProgress(storage).stage,4);
 }
});
test('checkpoint state is allowlisted, bounded by cleaned progress and has no personal fields',()=>{
 const s=restoreGame({...newGame(),stage:2,sessions:{cilantro:5,maize:3,name:'private',poultry:-1},cycles:{maize:{step:999}}});
 assert.deepEqual(s.sessions,newGame().sessions);assert.doesNotMatch(JSON.stringify(s),/private/);
 const invalidFinal=restoreGame({...newGame(),stage:7,record:null,sessions:{cilantro:7}});assert.equal(invalidFinal.stage,6);assert.equal(invalidFinal.sessions.cilantro,0);
});
test('replays reset only their own checkpoint and mode changes preserve every checkpoint',()=>{
 let s={...newGame(),stage:5,sessions:{...newGame().sessions,cilantro:5,maize:3}};s.cycles.maize.step=3;
 const mode=transition(s,'mode',{mode:'deepen'}).state;assert.deepEqual(mode.sessions,s.sessions);
 const cilantro=transition(s,'reset').state;assert.equal(cilantro.sessions.cilantro,0);assert.equal(cilantro.sessions.maize,3);
 const maize=cycleTransition(s,'maize','replay').state;assert.equal(maize.sessions.maize,0);assert.equal(maize.sessions.cilantro,5);
});
test('session UI has no ticking timer, collection fields or automatic continuation and retains offline save honesty',async()=>{
 const ui=await readFile(new URL('../learning/farm-learning-sessions.js',import.meta.url),'utf8'),html=await buildLearningDocument();
 for(const text of ['Terminar por ahora','Elegir seguir con la misión','Sin mirar la respuesta','Comparar mi explicación','Una observación fuera de pantalla','No se pudo guardar aquí','5–10 min','10–20 min'])assert.ok(ui.includes(text),text);
 assert.doesNotMatch(ui,/setInterval|setTimeout|Date\.now|fetch\(|<input|textarea/);
 for(const text of ['id="pause-dialog"','aria-labelledby="pause-title"','id="session-guidance-dialog"','Menores de 2 años: el adulto consulta la guía y la actividad se hace fuera de pantalla','no una prescripción por edad','no metas ni límites de salud','No recogemos edad ni datos personales'])assert.ok(html.includes(text),text);
 const main=await readFile(new URL('../learning/farm-learning-ui.js',import.meta.url),'utf8'),species=await readFile(new URL('../learning/farm-learning-species.js',import.meta.url),'utf8');
 assert.match(main,/sessionIsWaiting\('cilantro'\)/);assert.match(species,/sessionIsWaiting\(id\)/);
});
test('numeric record drafts survive normalization and replay without storing free text or personal fields',()=>{
 const s=newGame();s.stage=6;s.cycles.tomato.step=7;s.cycles.poultry.step=7;
 s.drafts={cilantro:{quantity:'3',unit:'kilogramos',destination:'compartir',name:'private'},tomato:{quantity:'2',unit:'kilogramos'},poultry:{quantity:'4',unit:'huevos'}};
 const restored=restoreGame(s);assert.deepEqual(restored.drafts.cilantro,{quantity:'3',unit:'kilogramos',destination:'compartir'});assert.deepEqual(restored.drafts.tomato,{quantity:'2',unit:'kilogramos'});assert.equal(restored.drafts.poultry.quantity,'4');assert.doesNotMatch(JSON.stringify(restored),/private/);
 const changed=restoreGame({...s,drafts:{cilantro:{quantity:'free text',unit:'secret',destination:'private'}}});assert.deepEqual(changed.drafts.cilantro,{quantity:'',unit:'manojos',destination:'cocina'});
 const reset=cycleTransition(restored,'tomato','replay').state;assert.equal(reset.drafts.tomato.quantity,'');assert.deepEqual(reset.drafts.cilantro,restored.drafts.cilantro);
 assert.equal(transition(restored,'reset').state.drafts.cilantro.quantity,'');
});
