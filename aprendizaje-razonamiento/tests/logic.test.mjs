import test from 'node:test';import assert from 'node:assert/strict';import {checkGrouping,evaluatePlan,stages,supplies} from '../dist/logic.mjs';
test('six clearly separated stages',()=>assert.deepEqual(stages.map(s=>s.id),['18m','2y','3y','5y','7y','12y']));
test('color grouping recognizes exact answer',()=>assert.equal(checkGrouping(['a','b'],'color').correct,true));
test('shape grouping recognizes a changed rule',()=>assert.equal(checkGrouping(['a','c'],'shape').correct,true));
test('empty selection is not correct',()=>assert.equal(checkGrouping([],'color').correct,false));
test('extra and missing selections identified',()=>assert.deepEqual(checkGrouping(['a','c'],'color'),{correct:false,missing:['b'],extra:['c']}));
test('duplicates cannot change outcome',()=>assert.equal(checkGrouping(['a','a','b'],'color').correct,true));
test('bad shape and rule rejected',()=>{assert.throws(()=>checkGrouping(['x'],'shape'));assert.throws(()=>checkGrouping([],'other'));});
test('basic complete plan costs two',()=>assert.deepEqual(evaluatePlan(['water','map','fruit']),{total:2,remaining:6,missing:[],overBudget:false,ready:true}));
test('alternative complete plan allowed',()=>assert.equal(evaluatePlan(['water','map','sandwich','notebook']).ready,true));
test('exact budget is valid',()=>assert.equal(evaluatePlan(['water','map','fruit','toy']).ready,true));
test('overflow detected',()=>assert.equal(evaluatePlan(supplies.map(s=>s.id)).overBudget,true));
test('missing essentials detected even under budget',()=>assert.deepEqual(evaluatePlan([]).missing,['Agua','Revisar la ruta','Una merienda']));
test('challenge re-evaluates original choice',()=>{assert.equal(evaluatePlan(['water','map','sandwich','notebook'],8).ready,true);assert.equal(evaluatePlan(['water','map','sandwich','notebook'],5).ready,false);assert.equal(evaluatePlan(['water','map','fruit','notebook'],5).ready,true);});
test('duplicate products cannot inflate totals',()=>assert.equal(evaluatePlan(['fruit','fruit']).total,2));
test('invalid data rejected',()=>{assert.throws(()=>evaluatePlan(['unknown']));for(const b of [-1,NaN,Infinity])assert.throws(()=>evaluatePlan([],b));});
test('exhaustive 64 combinations obey invariant',()=>{for(let mask=0;mask<64;mask++){const ids=supplies.filter((_,i)=>mask&(1<<i)).map(x=>x.id);for(const b of [5,8]){const r=evaluatePlan(ids,b);assert.equal(r.ready,!r.overBudget&&r.missing.length===0);assert.equal(r.remaining,b-r.total);}}});

import {nextSessionPhase,sessionPhases,storyCards,initialStoryOrder,moveStoryCard,checkStory,evidenceQuestions,checkEvidence} from '../dist/logic.mjs';
test('approved product duration windows and age labels',()=>{
 assert.deepEqual(stages.map(s=>s.label),['18–23 meses','24–35 meses','3–5 años','6–8 años','9–12 años','13–18 años']);
 assert.deepEqual(stages.map(s=>s.duration),['3–5 min de juego sin pantalla','3–8 min de juego sin pantalla','3–8 min orientativos','5–10 min orientativos','8–15 min orientativos','10–20 min orientativos']);
});
test('under-three stages are adult guides with offscreen duration',()=>{for(const stage of stages.slice(0,2)){assert.equal(stage.kind,'offline');assert.match(stage.mode,/adulto/);assert.match(stage.duration,/sin pantalla/);}});
test('all four implemented stages have objectives, support, and transfer',()=>{assert.equal(stages.filter(s=>s.kind==='interactive').length,4);for(const s of stages){assert.ok(s.goal);assert.ok(s.support);assert.ok(s.transfer);assert.ok(s.unit);}});
test('session must be explicitly started, resumed or restarted',()=>{
 assert.equal(nextSessionPhase('intro','start'),'active');assert.equal(nextSessionPhase('active','pause'),'paused');assert.equal(nextSessionPhase('paused','resume'),'active');assert.equal(nextSessionPhase('finished','restart'),'intro');
 for(const state of ['intro','active','paused'])assert.equal(nextSessionPhase(state,'finish'),'finished');
 assert.throws(()=>nextSessionPhase('paused','start'));assert.throws(()=>nextSessionPhase('finished','resume'));assert.throws(()=>nextSessionPhase('active','restart'));assert.throws(()=>nextSessionPhase('missing','start'));
});
test('all unlisted state transitions reject',()=>{const allowed=new Set(['intro:start','intro:finish','active:pause','active:finish','paused:resume','paused:finish','finished:restart']);for(const s of sessionPhases)for(const a of ['start','pause','resume','finish','restart','timer']){if(!allowed.has(`${s}:${a}`))assert.throws(()=>nextSessionPhase(s,a));}});
test('story starts scrambled and can be correctly sequenced without dragging',()=>{assert.equal(checkStory(initialStoryOrder),false);let order=moveStoryCard(initialStoryOrder,'retry',1);order=moveStoryCard(order,'retry',1);assert.equal(checkStory(order),true);assert.deepEqual(initialStoryOrder,['retry','test','change']);});
test('story boundaries are no-ops and preserve IDs',()=>{const order=storyCards.map(c=>c.id);assert.deepEqual(moveStoryCard(order,'test',-1),order);assert.deepEqual(moveStoryCard(order,'retry',1),order);assert.notEqual(moveStoryCard(order,'retry',1),order);});
test('story rejects missing, duplicate or unknown cards and moves',()=>{for(const order of [[],['test','test','retry'],['test','change','missing']])assert.throws(()=>moveStoryCard(order,'test',1));assert.throws(()=>moveStoryCard(initialStoryOrder,'unknown',1));assert.throws(()=>moveStoryCard(initialStoryOrder,'test',0));});
test('only the exact causal story order is accepted',()=>{const permutations=[['test','change','retry'],['test','retry','change'],['change','test','retry'],['change','retry','test'],['retry','test','change'],['retry','change','test']];assert.equal(permutations.filter(checkStory).length,1);assert.equal(checkStory(['test','change']),false);});
test('evidence questions give meaningful feedback for every option',()=>{for(const q of evidenceQuestions){for(const option of q.options){const r=checkEvidence(q.id,option.id);assert.equal(r.correct,option.id===q.answer);assert.ok(r.feedback.length>35);}}});
test('evidence rejects unsupported answers and unknown question IDs',()=>{assert.throws(()=>checkEvidence('source','unknown'));assert.throws(()=>checkEvidence('unknown','count'));});
test('evidence does not infer causation from lower totals',()=>{assert.equal(checkEvidence('claim','cause').correct,false);assert.equal(checkEvidence('claim','bounded').correct,true);assert.equal(checkEvidence('claim','never').correct,false);assert.equal(120/200,84/140);});
