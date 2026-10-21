import test from 'node:test';
import assert from 'node:assert/strict';
import {stages} from '../dist/logic.mjs';
import {extraActivities} from '../dist/activities.mjs';
import {facilitation,getFacilitation} from '../dist/facilitation.mjs';
test('original proposals and the new composition have specific adult support',()=>{
 const keys=[...stages.flatMap(s=>[`${s.id}:original`,...(extraActivities[s.id]?[`${s.id}:extra`]:[])]),'3y:quantity','5y:number-parts','7y:composition','12y:arguments','7y:balance','7y:biology-lab','7y:chemistry-lab'];
 assert.deepEqual(Object.keys(facilitation).sort(),keys.sort());
 for(const key of keys){const [stage,activity]=key.split(':');const g=getFacilitation(stage,activity);assert.deepEqual(Object.keys(g),['model','support','fade','observe']);for(const text of Object.values(g)){assert.equal(typeof text,'string');assert.ok(text.length>30);assert.doesNotMatch(text,/[<>]/);}}
});
test('unknown guide never silently shows another activity',()=>{assert.throws(()=>getFacilitation('18m','extra'));assert.throws(()=>getFacilitation('unknown'));});
test('higher reading or movement demands have explicit alternatives',()=>{
 assert.match(getFacilitation('3y','extra').fade,/No es necesario hacer palmas/);
 assert.match(getFacilitation('7y').support,/calculadora/);
 assert.match(getFacilitation('12y','extra').fade,/no hace falta realizar encuestas/i);
 assert.match(getFacilitation('18m').support,/no exijas/);
});
