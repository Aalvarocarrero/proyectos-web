import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {newGame,challengeTransition} from '../lib/farm-learning-engine.mjs';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
test('repeat soil observation changes review view, returns to full sample and preserves every saved progress field',async()=>{
 const source=await read('learning/farm-learning-challenges.js');
 const state=challengeTransition({...newGame(),stage:5},'moisture-inspect').state;
 const original=JSON.stringify(state);let focus=0;
 const note={focus:()=>focus++};const feedback={};const content={querySelector:()=>note};
 const context={state,challengeTransition,$:id=>id==='challenge-content'?content:feedback,icon:()=>'',cilantroDrawing:()=>'<g class="cilantro-test"/>'};
 const api=runInNewContext(source+'\nrenderChallenges=()=>{};({runChallenge,moistureMarkup})',context);
 api.runChallenge('moisture-inspect',{});
 assert.match(api.moistureMarkup(),/data-review="true"/);assert.match(api.moistureMarkup(),/Volver a la vista completa/);
 assert.match(feedback.textContent,/Tu progreso se conserva/);assert.equal(JSON.stringify(context.state),original);
 api.runChallenge('moisture-inspect',{});
 assert.match(api.moistureMarkup(),/data-review="false"/);assert.match(api.moistureMarkup(),/Volver a observar/);assert.equal(focus,2);
 assert.equal(JSON.stringify(context.state),original);
 const markup=api.moistureMarkup();assert.ok(markup.indexOf('</svg><button class="soil-reveal"')>0);assert.match(markup,/cilantro-test/);
});
test('mobile play keeps a bounded scene with separately scrolling decisions and a route back',async()=>{
 const html=await read('learning/farm-learning.template.html');
 assert.match(html,/height:100dvh;overflow:hidden/);assert.match(html,/grid-template-rows:auto minmax\(0,1fr\)/);
 assert.match(html,/\.lesson-card,body\[data-play\] \.module-task\{min-height:0;overflow:auto/);
 assert.match(html,/\.soil-reveal\{position:static;transform:none!important/);
 assert.match(html,/orientation:landscape/);assert.match(html,/prefers-reduced-motion:reduce/);
 assert.match(html,/class="text-button crop-back" data-page="cultivos"/);
 const ui=await read('learning/farm-learning-ui.js');assert.match(ui,/else delete document.body.dataset.play/);
 assert.match(ui,/sceneResponse\(document.querySelector\('\.scene'\), result.message\)/);
});
test('growth artwork distinguishes tomato flowers, green fruit, maize harvest and original cilantro leaves',async()=>{
 const source=await read('learning/farm-learning-species.js');
 assert.match(source,/id==='tomato'&&n===4/);assert.match(source,/id==='tomato'&&n===5/);assert.match(source,/id==='maize'&&n>=7/);
 assert.match(source,/sceneResponse\(\$\('module-scene'\),result.message\)/);
});
test('compact activity mode buttons dispatch the shared preserving callback and restore accessible focus/status',async()=>{
 const ui=await read('learning/farm-learning-ui.js'),depth=await read('learning/farm-learning-depth.js');
 const state=newGame();const api=runInNewContext(depth+'\n({playModeMarkup})',{state});
 assert.match(api.playModeMarkup(),/data-play-mode="explore" aria-pressed="true"/);
 state.mode='deepen';assert.match(api.playModeMarkup(),/data-play-mode="deepen" aria-pressed="true"/);
 let clicks=0,focus=0;const status={textContent:''};const target={focus:options=>{assert.equal(options.preventScroll,true);focus++;}};
 const nodes={'mode-deepen':{click:()=>clicks++},'mode-status':{textContent:'Modo cambiado. Tu avance se conserva.'},'module-page':{querySelector:s=>s==='.play-mode-status'?status:target}};
 const branch=ui.slice(ui.indexOf('  if (button.dataset.playMode)'),ui.indexOf('  if (button.dataset.page)'));
 const run=runInNewContext('(function(){'+branch+'})',{button:{dataset:{playMode:'deepen'}},activePage:'module',$:id=>nodes[id]});
 run();assert.equal(clicks,1);assert.equal(focus,1);assert.match(status.textContent,/avance se conserva/);
 const species=await read('learning/farm-learning-species.js');assert.match(species,/innerHTML=`\$\{playModeMarkup\(\)\}/);assert.match(ui,/mission.innerHTML = `\$\{playModeMarkup\(\)\}/);
});

test('progressive hints announce in place, update expanded state and retain focus',async()=>{
 const ui=await read('learning/farm-learning-ui.js');assert.match(ui,/id="hint-copy" aria-live="polite"/);
 const branch=ui.slice(ui.indexOf("  if (button.id === 'hint-button')"),ui.indexOf('  if (button.dataset.action)'));
 const attrs={};const copy={hidden:true,textContent:''};
 const button={id:'hint-button',lastChild:{textContent:''},setAttribute:(name,value)=>attrs[name]=String(value)};
 const context={button,hintLevel:0,hints:[['Busca una pista.','Prueba otra idea.']],state:{stage:0},document:{activeElement:button},$:id=>id==='hint-copy'?copy:null,persistHintLevel(){}};
 const run=runInNewContext('(function(){'+branch+'})',context);
 run();assert.equal(context.hintLevel,1);assert.equal(copy.hidden,false);assert.equal(copy.textContent,'Busca una pista.');assert.equal(attrs['aria-expanded'],'true');assert.equal(button.lastChild.textContent,'Dame otra pista');assert.equal(context.document.activeElement,button);
 run();assert.equal(copy.textContent,'Busca una pista. Prueba otra idea.');assert.equal(button.lastChild.textContent,'Ocultar pistas');
 run();assert.equal(copy.hidden,true);assert.equal(copy.textContent,'');assert.equal(attrs['aria-expanded'],'false');assert.equal(button.lastChild.textContent,'Necesito una pista');
});

test('hint level and mission focus survive a same-tab reload',async()=>{
 const ui=await read('learning/farm-learning-ui.js'),memory=ui.slice(ui.indexOf('let hintLevel=0;'),ui.indexOf('let embedded ='));
 const values=new Map(),sessionStorage={get fincaHint(){return values.get('fincaHint')},set fincaHint(value){values.set('fincaHint',String(value))}};
 assert.equal(runInNewContext(memory+'hintLevel=2;persistHintLevel();hintLevel',{sessionStorage}),2);
 assert.equal(runInNewContext(memory+'hintLevel',{sessionStorage}),2);
 const start=ui.indexOf('function restoreGameFocus(){'),restore=ui.slice(start,ui.indexOf('\n',start)),focused=[];
 const nodes={mission:{focus:options=>focused.push(['mission',options.preventScroll])},'hint-button':{focus:options=>focused.push(['hint',options.preventScroll])}};
 runInNewContext(restore+'restoreGameFocus()',{activePage:'huerto',hintLevel:2,$:id=>nodes[id]});
 runInNewContext(restore+'restoreGameFocus()',{activePage:'huerto',hintLevel:0,$:id=>nodes[id]});
 assert.deepEqual(focused,[['hint',true],['mission',true]]);
});
