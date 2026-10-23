import {concepts} from './languages.mjs';
// UI-only ordering. Answers and persisted selections remain stable concept IDs.
const attempts=new WeakMap();
function shuffle(values,random){const out=[...values];for(let i=out.length-1;i>0;i--){const r=random();if(!Number.isFinite(r)||r<0||r>=1)throw Error('Invalid random sample');const j=Math.floor(r*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
export function createLanguageOrders(random=Math.random){
 const positions=shuffle(concepts.map((_,i)=>i),random);
 return concepts.map((correct,step)=>{const choices=shuffle(concepts.filter(c=>c.id!==correct.id),random);choices.splice(positions[step],0,correct);return choices;});
}
export function languageOptions(state,step){if(!Number.isInteger(step)||step<0||step>=concepts.length)throw Error('Unknown language step');if(!attempts.has(state))attempts.set(state,createLanguageOrders());return attempts.get(state)[step];}
export function retryLanguageOrder(state,step){const previous=languageOptions(state,step);attempts.get(state)[step]=[...previous.slice(1),previous[0]];}
