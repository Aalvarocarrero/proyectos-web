import test from 'node:test';import assert from 'node:assert/strict';import {extraActivities,checkActivityAnswer} from '../dist/activities.mjs';
for(const [stage,activity] of Object.entries(extraActivities)){
 test(`${stage}: two complete reasoning steps, explanatory answers and staged hints`,()=>{assert.equal(activity.steps.length,2);assert.ok(activity.goal&&activity.transfer);for(const [i,q] of activity.steps.entries()){assert.equal(q.hints.length,2);assert.equal(new Set(q.options.map(o=>o[0])).size,q.options.length);assert.equal(q.options.filter(o=>o[0]===q.answer).length,1);for(const [id] of q.options){const r=checkActivityAnswer(stage,i,id);assert.equal(r.correct,id===q.answer);assert.ok(r.feedback.length>40);}assert.throws(()=>checkActivityAnswer(stage,i,'unknown'));}});
}
test('new activity bounds reject invalid steps and stage',()=>{for(const args of [['18m',0,'circle'],['3y',-1,'circle'],['3y',2,'circle']])assert.throws(()=>checkActivityAnswer(...args));assert.equal(Object.keys(extraActivities).length,4);});

test('each distractor explains its own misconception with distinct actionable feedback',()=>{
 for(const [stage,activity] of Object.entries(extraActivities))for(const [step,q] of activity.steps.entries()){
  const wrong=q.options.filter(([id])=>id!==q.answer).map(([id])=>id);
  assert.deepEqual(Object.keys(q.feedback).sort(),[...wrong].sort());
  const messages=wrong.map(id=>checkActivityAnswer(stage,step,id).feedback);
  assert.equal(new Set(messages).size,messages.length);
  for(const message of messages){assert.ok(message.length>80);assert.match(message,/¿/);assert.notEqual(message,q.explanation);}
 }
});
