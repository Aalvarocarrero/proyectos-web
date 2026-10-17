import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {newGame, transition, restoreGame, readProgress, writeProgress, EXPECTED_ACTIONS, SAVE_KEY, LEGACY_SAVE_KEY, challengeTransition, freshChallenges, freshModules, moduleTransition, maizeIsBlock, MODULE_IDS, CYCLE_PLANS, freshCycles, cycleTransition, freshSessions, freshLearningDrafts, GAME_VERSION, V2_SAVE_KEY} from '../lib/farm-learning-engine.mjs';
import {buildLearningDocument} from '../scripts/build-farm-learning.mjs';

test('complete cilantro pathway requires every learning action and a valid fictional record',()=>{
  let state=newGame();
  for(const action of EXPECTED_ACTIONS.slice(0,6)) {const result=transition(state,action);assert.equal(result.ok,true,action);assert.equal(result.state.stage,state.stage+1);state=result.state;}
  for(const payload of [{quantity:2,unit:'manojos',destination:'cocina'},{quantity:3,unit:'kilogramos',destination:'cocina'},{quantity:3,unit:'manojos',destination:'real-person'}]) {const r=transition(state,'save-record',payload);assert.equal(r.ok,false);assert.equal(r.state.stage,6);}
  const done=transition(state,'save-record',{quantity:'3',unit:'manojos',destination:'compartir'});assert.equal(done.state.stage,7);assert.equal(done.state.record.simulated,true);assert.equal(done.state.record.quantity,3);
});
test('wrong answers and out-of-order/repeated actions teach without changing progress',()=>{
  let state=newGame();const first=transition(state,'prepare');assert.equal(transition(first.state,'prepare').ok,false);
  for(const action of ['harvest','flood','choose-dark','water-again','sow']) {const r=transition(state,action);assert.equal(r.ok,false);assert.deepEqual(r.state,state);assert.ok(r.message.length>20);}
  state={...state,stage:2};assert.match(transition(state,'flood').message,/aire/);assert.equal(transition(state,'flood').state.stage,2);
});
test('restore rejects corrupt state, removes unknown personal fields, and repairs invalid completed records',()=>{
  for(const value of [null,{},true,{version:1,stage:-1},{version:1,stage:8},{version:1,stage:1.5},{version:99,stage:2}])assert.deepEqual(restoreGame(value),newGame());
  assert.deepEqual(restoreGame({version:1,stage:4,mode:'explore',name:'child',email:'x@example.com',age:8}),{version:GAME_VERSION,stage:4,mode:'explore',record:null,challenges:freshChallenges(),modules:freshModules(),cycles:freshCycles(),sessions:{...freshSessions(),cilantro:2},drafts:freshLearningDrafts(),decisions:{}});
  assert.equal(restoreGame({version:1,stage:7,record:{crop:'Cilantro',quantity:3,unit:'kg'}}).stage,6);
  const forged={version:1,stage:7,mode:'deepen',record:{crop:'Cilantro',quantity:3,unit:'manojos',destination:'cocina',name:'remove',simulated:false}};
  assert.deepEqual(restoreGame(forged).record,{crop:'Cilantro',quantity:3,unit:'manojos',destination:'cocina',simulated:true});
});
test('local persistence is verified and denied storage does not fabricate success',()=>{
  const values=new Map(),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
  let state=transition(newGame(),'prepare').state;writeProgress(storage,state);assert.deepEqual(readProgress(storage),state);assert.equal(values.size,1);assert.ok(values.has(SAVE_KEY));
  assert.throws(()=>writeProgress({getItem:()=>null,setItem:()=>{}},state));
  assert.throws(()=>writeProgress({setItem:()=>{throw Error('quota');}},state));
  assert.deepEqual(readProgress({getItem:()=>'{invalid'}),newGame());assert.deepEqual(readProgress({getItem:()=>{throw Error('denied');}}),newGame());
});
test('mode change preserves progress and reset is scoped to fictional game state',()=>{
  const state={...newGame(),stage:5};const more=transition(state,'mode',{mode:'deepen'});assert.equal(more.state.stage,5);assert.equal(more.state.mode,'deepen');assert.equal(transition(more.state,'reset').state.stage,0);assert.equal(transition(more.state,'reset').state.mode,'deepen');
});
test('delivered HTML matches source and remains self-contained below 210 KB',async()=>{
  const html=await readFile(new URL('../public/learning/finca-escuela.html',import.meta.url),'utf8');assert.equal(html,await buildLearningDocument());assert.ok(Buffer.byteLength(html)<210000);
  assert.doesNotMatch(html,/<script[^>]+src=|<link[^>]+href=|<img[^>]+src=["']https?:|@import|url\(https?:|fetch\(|XMLHttpRequest|sendBeacon|WebSocket|serviceWorker/);
  assert.match(html,/connect-src 'none'/);assert.match(html,/prefers-reduced-motion/);assert.match(html,/aria-live="polite"/);assert.match(html,/type="number"/);assert.doesNotMatch(html,/<input[^>]+type=["'](?:email|tel|password)/);
});
test('offline export embeds only allowlisted progress and reports download uncertainty honestly',async()=>{
  const ui=await readFile(new URL('../learning/farm-learning-ui.js',import.meta.url),'utf8');assert.match(ui,/state: restoreGame\(state\)/);assert.match(ui,/removeAttribute\('open'\)/);assert.match(ui,/Confirma que el navegador lo haya guardado/);assert.match(ui,/URL.revokeObjectURL/);assert.match(ui,/No se pudo guardar/);
});
test('downloaded HTML and notebook use actual newline bytes, not a literal backslash-n',async()=>{
  const ui=await readFile(new URL('../learning/farm-learning-ui.js',import.meta.url),'utf8');
  const prefix=ui.match(/downloadBlob\(('.*?') \+ copy\.outerHTML/)[1];
  assert.equal(runInNewContext(prefix),'<!doctype html>\n');
  const recordTemplate=ui.match(/const content = (`VenezuelaAgro[\s\S]*?`);/)[1];
  const text=runInNewContext(recordTemplate,{state:{record:{destination:'cocina'}}});
  assert.ok(text.includes('\nCultivo: Cilantro\nCantidad: 3\n'));assert.ok(!text.includes('\\n'));assert.equal(text.split('\n').length,12);
});
test('animal activities and agronomy limitations are visible and contain no dosing schedule',async()=>{
  const html=await readFile(new URL('../public/learning/finca-escuela.html',import.meta.url),'utf8');assert.match(html,/Bovinos/);assert.match(html,/Porcinos/);assert.match(html,/Aves de corral/);assert.doesNotMatch(html,/ruta completa de ganadería aún está en preparación/);assert.match(html,/no indica medicamentos, dosis ni calendarios de vacunación/);assert.match(html,/tiempo acelerado/);assert.match(html,/supervisión/);assert.match(html,/no se mezclan con los registros reales/);assert.doesNotMatch(html,/\d\s*(?:mg\/kg|ml\/kg)/);
});

test('hosted learning route suppresses unrelated overlays and real-account services',async()=>{
  const files=await Promise.all(['components/public-workspace-controls.tsx','components/account-services.tsx','components/connection-indicator.tsx','components/offline-worker-registration.tsx'].map(path=>readFile(new URL('../'+path,import.meta.url),'utf8')));
  for(const text of files)assert.match(text,/juego-finca/);
  assert.match(files[0],/pathname === "\/juego-finca".*return null/);
  assert.match(files[1],/path==="\/juego-finca".*return null/);
  assert.match(files[2],/path === "\/juego-finca".*return null/);
  assert.match(files[3],/if\(!isLearning\)navigator.serviceWorker/);
  assert.match(files[0],/pathname === "\/admin" \|\| pathname.startsWith\("\/admin\/"\)/);
});


test('v1 progress migrates to v4 without overwriting the legacy save',()=>{
 const legacy={version:1,stage:7,mode:'deepen',record:{crop:'Cilantro',quantity:3,unit:'manojos',destination:'cocina',simulated:true}};
 const data=new Map([[LEGACY_SAVE_KEY,JSON.stringify(legacy)]]),storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
 const restored=readProgress(storage);assert.equal(restored.version,GAME_VERSION);assert.equal(restored.stage,7);assert.equal(restored.mode,'deepen');assert.deepEqual(restored.record,legacy.record);assert.deepEqual(restored.challenges,freshChallenges());
 writeProgress(storage,restored);assert.equal(data.get(LEGACY_SAVE_KEY),JSON.stringify(legacy));assert.ok(data.has(SAVE_KEY));
 data.set(SAVE_KEY,'{broken');assert.equal(readProgress(storage).stage,7);
});
test('soil challenge gates decisions on inspection and gives different answers for the two fictional samples',()=>{
 let state=newGame();assert.equal(challengeTransition(state,'moisture-decide',{choice:'water'}).ok,false);
 state=challengeTransition(state,'moisture-inspect').state;assert.equal(challengeTransition(state,'moisture-decide',{choice:'wait'}).ok,false);
 state=challengeTransition(state,'moisture-decide',{choice:'water'}).state;assert.equal(state.challenges.moisture.round,1);assert.equal(state.challenges.moisture.inspected,false);
 state=challengeTransition(state,'moisture-inspect').state;assert.equal(challengeTransition(state,'moisture-decide',{choice:'water'}).ok,false);
 state=challengeTransition(state,'moisture-decide',{choice:'wait'}).state;assert.equal(state.challenges.moisture.done,true);assert.equal(state.challenges.moisture.round,2);assert.equal(state.stage,0);
 const again=challengeTransition(state,'challenge-replay',{name:'moisture'}).state;assert.equal(again.challenges.moisture.round,0);assert.equal(again.challenges.moisture.done,true);
});
test('spacing challenge allows reversible placement, bounds count and tests every three-seed arrangement',()=>{
 for(let a=0;a<7;a++)for(let b=a+1;b<7;b++)for(let c=b+1;c<7;c++){
  let state=newGame();for(const index of [a,b,c])state=challengeTransition(state,'spacing-toggle',{index}).state;
  assert.equal(challengeTransition(state,'spacing-check').ok,b-a>=2&&c-b>=2,[a,b,c].join(','));
 }
 let state=newGame();for(const index of [0,2,4])state=challengeTransition(state,'spacing-toggle',{index}).state;
 assert.equal(challengeTransition(state,'spacing-toggle',{index:6}).ok,false);state=challengeTransition(state,'spacing-toggle',{index:2}).state;assert.deepEqual(state.challenges.spacing.seeds,[0,4]);
 assert.equal(challengeTransition(state,'spacing-toggle',{index:-1}).ok,false);assert.equal(challengeTransition(state,'spacing-check').ok,false);
});
test('cattle challenge requires all three observations and a safe next action; replay still requires a decision',()=>{
 let state=newGame();assert.equal(challengeTransition(state,'cattle-decide',{choice:'tell-adult'}).ok,false);
 for(const zone of ['water','shade','gate'])state=challengeTransition(state,'cattle-observe',{zone}).state;
 assert.equal(challengeTransition(state,'cattle-decide',{choice:'enter-alone'}).ok,false);
 state=challengeTransition(state,'cattle-decide',{choice:'tell-adult'}).state;assert.equal(state.challenges.cattle.done,true);assert.equal(state.challenges.cattle.recorded,true);
 state=challengeTransition(state,'challenge-replay',{name:'cattle'}).state;assert.equal(state.challenges.cattle.done,true);assert.equal(state.challenges.cattle.recorded,false);
 for(const zone of ['water','shade','gate'])state=challengeTransition(state,'cattle-observe',{zone}).state;
 assert.equal(state.challenges.cattle.recorded,false);assert.equal(challengeTransition(state,'cattle-decide',{choice:'enter-alone'}).ok,false);
});
test('challenge restore is allowlisted and crop replay preserves explored challenges',()=>{
 const state=restoreGame({version:2,stage:4,challenges:{moisture:{round:99,inspected:true,name:'remove'},spacing:{seeds:[-1,0,0,2,4,6,99],done:true},cattle:{observed:['gate','gate','water','email'],done:false}}});
 assert.equal(state.challenges.moisture.round,0);assert.deepEqual(state.challenges.spacing.seeds,[0,2,4]);assert.deepEqual(state.challenges.cattle.observed,['gate','water']);assert.equal(JSON.stringify(state).includes('remove'),false);
 assert.equal(transition(state,'reset').state.challenges.spacing.done,true);assert.equal(transition(state,'reset').state.stage,0);
});
test('new controls provide guided goals, progressive hints, real challenges, glossary and reduced-motion support',async()=>{
 const html=await buildLearningDocument();for(const token of ['id="current-goal"','id="road-dialog"','id="glossary-dialog"','id="challenge-content"','aria-controls="hint-copy"','No necesitas arrastrar','prefers-reduced-motion','no es una certificación','data-lab-action="spacing-toggle"'])assert.ok(html.includes(token),token);
 assert.match(html,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);assert.match(html,/LEGACY_SAVE_KEY/);
  assert.match(html,/@media\(max-width:480px\)\{\.tools\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);assert.match(html,/nav-button,\.mode-switch button,\.text-button\{min-height:44px\}/);assert.doesNotMatch(html,/fetch\(|sendBeacon|XMLHttpRequest/);
});

test('v2 complete progress migrates without overwriting any earlier key',()=>{
 const old={...newGame(),version:2,stage:7,mode:'deepen',record:{crop:'Cilantro',quantity:3,unit:'manojos',destination:'compartir',simulated:true},challenges:{moisture:{round:2,inspected:false,done:true},spacing:{seeds:[0,2,4],done:true},cattle:{observed:['water','shade','gate'],done:true,recorded:true}}};delete old.modules;
 const oldJson=JSON.stringify(old),data=new Map([[V2_SAVE_KEY,oldJson],[LEGACY_SAVE_KEY,JSON.stringify({version:1,stage:1})]]),storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
 let migrated=readProgress(storage);assert.equal(migrated.version,GAME_VERSION);assert.equal(migrated.stage,7);assert.deepEqual(migrated.record,old.record);assert.equal(migrated.challenges.cattle.recorded,true);assert.deepEqual(migrated.modules,freshModules());
 writeProgress(storage,migrated);assert.equal(data.get(V2_SAVE_KEY),oldJson);assert.ok(data.has(LEGACY_SAVE_KEY));assert.ok(data.has(SAVE_KEY));
 data.set(SAVE_KEY,'{broken');assert.equal(readProgress(storage).stage,7);
});
test('maize activity tests every six-position arrangement and gates pollination decisions',()=>{
 const choose=(arr,k,start=0,prefix=[])=>k===0?[prefix]:arr.slice(start).flatMap((x,i)=>choose(arr,k-1,start+i+1,[...prefix,x]));
 const combos=choose(Array.from({length:12},(_,i)=>i),6);assert.equal(combos.length,924);let passed=0;
 for(const plots of combos){const m={...newGame(),modules:{...freshModules(),maize:{step:0,done:false,plots,seen:[]}}};const r=moduleTransition(m,'maize','check');assert.equal(r.ok,maizeIsBlock(plots));if(r.ok)passed++;}assert.equal(passed,7);
 let state=newGame();for(const index of [0,1,2,4,5,6])state=moduleTransition(state,'maize','plot',{index}).state;
 assert.equal(moduleTransition(state,'maize','plot',{index:7}).ok,false);state=moduleTransition(state,'maize','check').state;
 assert.equal(moduleTransition(state,'maize','decide',{choice:'wind'}).ok,false);
 for(const choice of ['tassel','silk'])state=moduleTransition(state,'maize','inspect',{choice}).state;
 assert.equal(moduleTransition(state,'maize','decide',{choice:'roots'}).ok,false);state=moduleTransition(state,'maize','decide',{choice:'wind'}).state;
 assert.equal(moduleTransition(state,'maize','record',{choice:'yield'}).ok,false);state=moduleTransition(state,'maize','record',{choice:'pollen'}).state;assert.equal(state.modules.maize.step,3);assert.equal(state.modules.maize.done,true);
});
test('tomato activity requires support, selective picking and a unit-correct count',()=>{
 let state=newGame();assert.equal(moduleTransition(state,'tomato','pick',{index:1}).ok,false);assert.equal(moduleTransition(state,'tomato','support',{choice:'tight'}).ok,false);
 state=moduleTransition(state,'tomato','support',{choice:'fit'}).state;assert.equal(state.modules.tomato.supported,true);
 assert.equal(moduleTransition(state,'tomato','pick',{index:0}).ok,false);assert.equal(moduleTransition(state,'tomato','check').ok,false);
 for(const index of [1,4])state=moduleTransition(state,'tomato','pick',{index}).state;
 assert.equal(moduleTransition(state,'tomato','pick',{index:1}).ok,false);state=moduleTransition(state,'tomato','check').state;
 for(const payload of [{quantity:3,unit:'frutos'},{quantity:2,unit:'kilogramos'},{quantity:NaN,unit:'frutos'}])assert.equal(moduleTransition(state,'tomato','record',payload).ok,false);
 state=moduleTransition(state,'tomato','record',{quantity:'2',unit:'frutos'}).state;assert.equal(state.modules.tomato.step,3);
});
test('bovine activity requires complete observation, safe reporting and factual record',()=>{
 let state=newGame();assert.equal(moduleTransition(state,'bovine','check').ok,false);
 for(const choice of ['water','shade','gate'])state=moduleTransition(state,'bovine','inspect',{choice}).state;
 state=moduleTransition(state,'bovine','check').state;assert.equal(moduleTransition(state,'bovine','decide',{choice:'enter'}).ok,false);
 state=moduleTransition(state,'bovine','decide',{choice:'notify'}).state;assert.equal(moduleTransition(state,'bovine','record',{choice:'diagnosis'}).ok,false);
 state=moduleTransition(state,'bovine','record',{choice:'facts'}).state;assert.equal(state.modules.bovine.step,3);
});
test('pig activity is a reversible resource plan with welfare and behavior decisions',()=>{
 let state=newGame();assert.equal(moduleTransition(state,'pig','resource',{choice:'sealed'}).ok,false);assert.equal(moduleTransition(state,'pig','check').ok,false);
 for(const choice of ['water','shelter','explore'])state=moduleTransition(state,'pig','resource',{choice}).state;
 state=moduleTransition(state,'pig','resource',{choice:'water'}).state;assert.equal(state.modules.pig.resources.length,2);assert.equal(moduleTransition(state,'pig','check').ok,false);state=moduleTransition(state,'pig','resource',{choice:'water'}).state;
 state=moduleTransition(state,'pig','check').state;assert.equal(moduleTransition(state,'pig','decide',{choice:'punish'}).ok,false);state=moduleTransition(state,'pig','decide',{choice:'exploration'}).state;
 assert.equal(moduleTransition(state,'pig','record',{choice:'treatment'}).ok,false);state=moduleTransition(state,'pig','record',{choice:'resources'}).state;assert.equal(state.modules.pig.step,3);
});
test('poultry activity gates ordered hygiene route, egg recognition and unit-correct record',()=>{
 let state=newGame();assert.equal(moduleTransition(state,'poultry','visit',{choice:'wash'}).ok,false);assert.equal(moduleTransition(state,'poultry','visit',{choice:'kiss'}).ok,false);
 for(const choice of ['rules','observe','leave','wash'])state=moduleTransition(state,'poultry','visit',{choice}).state;
 state=moduleTransition(state,'poultry','check').state;assert.equal(moduleTransition(state,'poultry','egg',{index:1}).ok,false);assert.equal(moduleTransition(state,'poultry','check').ok,false);
 for(const index of [0,2,3,5])state=moduleTransition(state,'poultry','egg',{index}).state;
 assert.equal(moduleTransition(state,'poultry','egg',{index:0}).ok,false);state=moduleTransition(state,'poultry','check').state;
 assert.equal(moduleTransition(state,'poultry','record',{quantity:4,unit:'kilogramos'}).ok,false);state=moduleTransition(state,'poultry','record',{quantity:4,unit:'huevos'}).state;assert.equal(state.modules.poultry.step,3);
});
test('per-module replay preserves all other work and retains explored flag',()=>{
 let state={...newGame(),stage:5};state.modules.tomato={step:3,done:true,supported:true,picked:[1,4]};state.modules.pig={step:2,done:false,resources:['water','shelter','explore']};
 const reset=moduleTransition(state,'tomato','replay').state;assert.equal(reset.stage,5);assert.deepEqual(reset.modules.pig,state.modules.pig);assert.equal(reset.modules.tomato.step,0);assert.equal(reset.modules.tomato.done,true);assert.equal(reset.modules.tomato.supported,false);assert.deepEqual(reset.modules.tomato.picked,[]);
 assert.equal(transition(reset,'reset').state.modules.tomato.done,true);assert.deepEqual(moduleTransition(reset,'unknown','check').state,reset);
});
test('schema3 strips unknown module fields and validates all stored choices',()=>{
 const s=restoreGame({...newGame(),childName:'remove-me',modules:{maize:{step:99,plots:[-1,0,0,1,2,3,4,5,7,99],seen:['name','silk'],name:'remove-me'},tomato:{step:1,picked:[1,1,4,9]},bovine:{seen:['water','email']},pig:{resources:['medication','water']},poultry:{sequence:['rules','wash','observe'],eggs:[0,0,2,3,5,9]},email:'remove-me'}});
 assert.equal(s.modules.maize.step,0);assert.deepEqual(s.modules.maize.plots,[0,1,2,3,4,5]);assert.deepEqual(s.modules.maize.seen,['silk']);assert.deepEqual(s.modules.tomato.picked,[1,4]);assert.deepEqual(s.modules.bovine.seen,['water']);assert.deepEqual(s.modules.poultry.sequence,['rules']);assert.equal(JSON.stringify(s).includes('remove-me'),false);
});
test('initial hub exposes crops and animals with full simulated cycles and bundled code compiles',async()=>{
 const html=await buildLearningDocument();for(const item of ['id="skip-content"','id="inicio-page"','id="cultivos-page"','id="animales-page"','id="module-page"','data-page="animales"','moduleTransition','PREVIOUS_SAVE_KEY','maizeIsBlock','module-record-form','CICLO SIMULADO · PASO A PASO','No es una cosecha o producción real'])assert.ok(html.includes(item),item);
 assert.doesNotMatch(html,/coach-symbol/);assert.match(html,/class="coach-copy"><small>TU OBJETIVO AHORA<\/small><strong id="module-goal"/);
 for(const id of MODULE_IDS)assert.ok(html.includes(id));
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(s=>s.trim()!=='null');assert.equal(scripts.length,1);assert.doesNotThrow(()=>new Function(scripts[0]));
});
test('each species UI renders every stage with functional actions and bounded illustration markup',async()=>{
 const source=await readFile(new URL('../learning/farm-learning-depth.js',import.meta.url),'utf8')+'\n'+await readFile(new URL('../learning/farm-learning-species.js',import.meta.url),'utf8');
 const nodes=new Map(),context={MODULE_IDS,CYCLE_PLANS,state:newGame(),icon:name=>`<svg data-icon="${name}"></svg>`,$:id=>{if(!nodes.has(id))nodes.set(id,{style:{},dataset:{},setAttribute(){}});return nodes.get(id);}};
 const api=runInNewContext(source+'\n({moduleBody,renderModule,renderSpeciesHub,speciesNotebook,setActive:id=>{activeModule=id;}})',context);
 api.renderSpeciesHub();assert.match(nodes.get('animales-cards').innerHTML,/Bovinos[\s\S]*Porcinos[\s\S]*Aves de corral/);
 for(const id of MODULE_IDS){api.setActive(id);for(let step=0;step<=CYCLE_PLANS[id].length;step++){context.state.cycles[id].step=step;api.renderModule();const scene=nodes.get('module-scene').innerHTML,task=nodes.get('module-task').innerHTML;assert.doesNotMatch(scene+task,/undefined|NaN/);assert.ok(scene.length>500);assert.match(task,step===CYCLE_PLANS[id].length?/Volver a practicar/:/data-module-action=|module-record-form/);}}
 assert.match(api.speciesNotebook(),/Mis recorridos de cultivos y animales/);
});


test('full cycles gate every phase, survive reload, reject retries and finish all five pathways',()=>{
 const inputs={
 maize:{0:[...([0,1,2,4,5,6].map(index=>['plot',{index} ])),['check',{}]],1:[['inspect',{choice:'tassel'}],['inspect',{choice:'silk'}],['decide',{choice:'wind'}]],2:[['record',{choice:'pollen'}]]},
 tomato:{0:[['support',{choice:'fit'}]],1:[['pick',{index:1}],['pick',{index:4}],['check',{}]],2:[['record',{quantity:2,unit:'frutos'}]]},
 bovine:{0:[...(['water','shade','gate'].map(choice=>['inspect',{choice}])),['check',{}]],1:[['decide',{choice:'notify'}]],2:[['record',{choice:'facts'}]]},
 pig:{0:[...(['water','shelter','explore'].map(choice=>['resource',{choice}])),['check',{}]],1:[['decide',{choice:'exploration'}]],2:[['record',{choice:'resources'}]]},
 poultry:{0:[...(['rules','observe','leave','wash'].map(choice=>['visit',{choice}])),['check',{}]],1:[...([0,2,3,5].map(index=>['egg',{index}])),['check',{}]],2:[['record',{quantity:4,unit:'huevos'}]]}
 };
 let state=newGame();
 for(const id of MODULE_IDS){
  assert.ok(CYCLE_PLANS[id].length>=8);
  for(const [step,phase] of CYCLE_PLANS[id].entries()){
   assert.equal(state.cycles[id].step,step);
   const wrong=cycleTransition(state,id,'cycle-choice',{choice:'guess'});assert.equal(wrong.ok,false);assert.deepEqual(wrong.state,state);
   const actions=phase.practice===undefined?[['cycle-choice',{choice:'careful'}]]:inputs[id][phase.practice];
   for(const [action,payload] of actions){const result=cycleTransition(state,id,action,payload);assert.equal(result.ok,true,`${id}/${step}/${action}: ${result.message}`);state=restoreGame(JSON.parse(JSON.stringify(result.state)));}
   assert.equal(state.cycles[id].step,step+1);assert.equal(state.cycles[id].done,step+1===CYCLE_PLANS[id].length);
  }
  assert.equal(cycleTransition(state,id,'cycle-choice',{choice:'careful'}).ok,false);
 }
 for(const id of MODULE_IDS)assert.equal(state.cycles[id].done,true);
 const previous=JSON.parse(JSON.stringify(state));state=cycleTransition(state,'maize','replay').state;
 assert.equal(state.cycles.maize.step,0);assert.equal(state.cycles.maize.done,true);
 for(const id of MODULE_IDS.filter(id=>id!=='maize'))assert.deepEqual(state.cycles[id],previous.cycles[id]);
 assert.deepEqual(transition(state,'reset').state.cycles,state.cycles);
});
test('older short activity achievements migrate honestly; malformed cycle data is stripped',()=>{
 const old={...newGame(),modules:{...freshModules(),maize:{step:3,done:true,plots:[0,1,2,4,5,6],seen:['tassel','silk']}}};delete old.cycles;
 const migrated=restoreGame(old);assert.equal(migrated.modules.maize.done,true);assert.equal(migrated.cycles.maize.done,false);assert.equal(migrated.cycles.maize.step,0);
 const corrupt=restoreGame({...newGame(),cycles:{maize:{step:999,done:true,name:'private'},tomato:{step:1.1},bovine:{step:2,done:false,email:'private'}}});
 assert.equal(corrupt.cycles.maize.step,0);assert.equal(corrupt.cycles.tomato.step,0);assert.equal(corrupt.cycles.bovine.step,2);assert.doesNotMatch(JSON.stringify(corrupt),/private/);
});
test('brand tokens, categorized inventory and accelerated time limitations are explicit',async()=>{
 const html=await buildLearningDocument();for(const token of ['--forest:#3e2a19','--green:#4c6b3a','--cream:#f3ebdd','cultivos-inventory','animales-inventory','Catálogo · sin ciclo','No es exhaustivo','Tiempo simulado','sin esperas reales','Necesito una pista','Ver las etapas del ciclo','Selecciona la semilla','Nacimiento y cuidado temprano'])assert.ok(html.includes(token),token);
});

test('both modes render distinct content in all five species at every stage and after completion',async()=>{
 const depth=await readFile(new URL('../learning/farm-learning-depth.js',import.meta.url),'utf8');
 const source=await readFile(new URL('../learning/farm-learning-species.js',import.meta.url),'utf8');
 const nodes=new Map(),context={MODULE_IDS,CYCLE_PLANS,state:newGame(),icon:()=>'<svg></svg>',$:id=>{if(!nodes.has(id))nodes.set(id,{style:{},dataset:{},setAttribute(){}});return nodes.get(id);}};
 const api=runInNewContext(depth+'\n'+source+'\n({renderModule,depthPrompts,setActive:id=>{activeModule=id;}})',context);
 for(const id of MODULE_IDS){
  assert.equal(api.depthPrompts[id].length,CYCLE_PLANS[id].length+1);
  api.setActive(id);
  for(let step=0;step<=CYCLE_PLANS[id].length;step++){
   context.state.cycles[id].step=step;const before=JSON.stringify(context.state);
   context.state.mode='explore';api.renderModule();const brief=nodes.get('module-task').innerHTML;
   assert.doesNotMatch(brief,/depth-study|Comparar mi razonamiento/);
   context.state.mode='deepen';api.renderModule();const extended=nodes.get('module-task').innerHTML;
   assert.match(extended,/Profundizar · comprende la decisión/);assert.match(extended,/Antes de seguir, razona/);
   for(const text of api.depthPrompts[id][step])assert.ok(extended.includes(text),`${id}/${step}: ${text}`);
   assert.notEqual(brief,extended);assert.doesNotMatch(extended,/undefined|NaN/);
   context.state.mode=JSON.parse(before).mode;assert.equal(JSON.stringify(context.state),before);
  }
 }
});

test('cilantro displays explanations and distinct reflection in all seven steps plus completed state',async()=>{
 const depth=await readFile(new URL('../learning/farm-learning-depth.js',import.meta.url),'utf8');
 const ui=await readFile(new URL('../learning/farm-learning-ui.js',import.meta.url),'utf8');
 const lessonSetup=ui.slice(ui.indexOf('const lessons ='),ui.indexOf('let embedded ='));
 const render=ui.slice(ui.indexOf('function render()'),ui.indexOf('function recordMarkup()'));
 const nodes=new Map(),context={state:newGame(),selectedTool:'prepare',EXPECTED_ACTIONS,icon:()=>'<svg></svg>',document:{querySelectorAll:()=>[]},toolForStage:()=> 'prepare',recordMarkup:()=>'',renderRoad(){},renderPlants(){},renderNotebook(){},renderChallenges(){},renderSpeciesHub(){},renderModule(){},$:id=>{if(!nodes.has(id))nodes.set(id,{style:{},dataset:{},setAttribute(){}});return nodes.get(id);}};
 const api=runInNewContext(depth+'\n'+lessonSetup+'\n'+render+'\n({render,depthPrompts})',context);
 for(let stage=0;stage<=7;stage++){
  context.state.stage=stage;context.state.mode='explore';api.render();const brief=nodes.get('mission-content').innerHTML;
  assert.doesNotMatch(brief,/depth-study|Comparar mi razonamiento/);
  context.state.mode='deepen';api.render();const extended=nodes.get('mission-content').innerHTML;
  assert.match(extended,/Profundizar · comprende la decisión/);
  for(const text of api.depthPrompts.cilantro[stage])assert.ok(extended.includes(text),`cilantro/${stage}`);
  assert.notEqual(brief,extended);assert.doesNotMatch(extended,/undefined|NaN/);
 }
});

test('mode controls apply globally, announce changes and preserve partial forms and all progress',async()=>{
 const ui=await readFile(new URL('../learning/farm-learning-ui.js',import.meta.url),'utf8');
 const depth=await readFile(new URL('../learning/farm-learning-depth.js',import.meta.url),'utf8');
 const html=await buildLearningDocument();
 assert.ok(html.indexOf('id="learning-mode"')<html.indexOf('id="inicio-page"'));
 assert.equal((html.match(/id="mode-deepen"/g)||[]).length,1);
 assert.match(html,/role="group" aria-label="Nivel de detalle"/);
 assert.match(html,/id="mode-status" role="status" aria-live="polite" aria-atomic="true"/);
 const handlers={},nodes=new Map();
 const get=id=>{if(!nodes.has(id))nodes.set(id,{dataset:{},value:'',addEventListener:(name,fn)=>handlers[id]=fn});return nodes.get(id);};
 const form=()=>({elements:{quantity:{value:'2'},unit:{value:'kilogramos'}}});
 nodes.set('module-record-form',form());get('quantity').value='3';get('unit').value='manojos';get('destination').value='compartir';
 const state={...newGame(),stage:6};state.modules.maize.plots=[0,1];state.cycles.pig={step:CYCLE_PLANS.pig.length,done:true};state.challenges.moisture.done=true;
 const context={state,transition,$:get,save(){},render(){for(const key of ['quantity','unit','destination'])get(key).value='';nodes.set('module-record-form',{elements:{quantity:{value:''},unit:{value:'frutos'}}});}};
 const forms=ui.slice(ui.indexOf('function moduleFormValues()'),ui.indexOf('function focusMission()'));
 const binding=ui.slice(ui.indexOf("for (const mode of ['explore','deepen'])"),ui.indexOf("$('skip-content').addEventListener"));
 const api=runInNewContext(depth+'\n'+forms+'\n'+binding+'\n({renderMode})',context);
 const before=JSON.stringify(state);
 for(const mode of ['deepen','explore']){
  handlers['mode-'+mode]();api.renderMode();
  assert.equal(context.state.mode,mode);assert.equal(JSON.stringify({...context.state,mode:'explore'}),before);
  assert.equal(get('quantity').value,'3');assert.equal(get('unit').value,'manojos');assert.equal(get('destination').value,'compartir');
  assert.equal(get('module-record-form').elements.quantity.value,'2');assert.equal(get('module-record-form').elements.unit.value,'kilogramos');
  assert.match(get('mode-status').textContent,/Modo cambiado/);assert.match(get('mode-status').textContent,/avance se conserva/);
  assert.equal(get('mode-example').hidden,mode==='explore');
  assert.match(get('mode-title').textContent,mode==='deepen'?/Profundizar/:/Explorar/);
 }
});
