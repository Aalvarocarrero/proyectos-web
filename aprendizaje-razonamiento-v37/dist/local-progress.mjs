import {validateParts} from './number-parts.mjs';
import {validateQuantity} from './quantity-workshop.mjs';
import {validateBiologyLab} from './biology-lab.mjs';
import {validateChemistryLab} from './chemistry-lab.mjs';
import {validateLanguageScene} from './language-scene.mjs';
import {validateBalance} from './balance.mjs';
import {contextIds} from './language-context-data.mjs';
import {validateContext} from './language-context.mjs';
import {validateArgument} from './arguments.mjs';
import {validateComposition} from './composition.mjs';
import {validateExploration} from './exploration.mjs';
import {validateConstruction} from './construction.mjs';
import {scienceIds,scienceGames} from './science-games.mjs';
import {languageIds,concepts} from './languages.mjs';
// Anonymous, local-only progress. No clocks, identifiers, accounts or network.
import {stages,sessionPhases,shapes,supplies,initialStoryOrder,storyCards,evidenceQuestions} from './logic.mjs';
import {wordScenes} from './word-game.mjs';
import {extraActivities} from './activities.mjs';
import {unitPages,unitQuestions} from './comparison-unit.mjs';
import {directions,gardenLessons,newRoute,moveOne} from './garden-game.mjs';
export const PROGRESS_KEY='education-facilitation-guide:progress';
export const PROGRESS_VERSION=4;
export const MAX_PROGRESS_BYTES=32768;
const stageIds=stages.map(s=>s.id);
const activities=id=>['original',...(extraActivities[id]?['extra']:[]),...(id==='3y'?['quantity']:[]),...(id==='5y'?['number-parts','garden','words','reflection',...languageIds,...contextIds,...scienceIds]:[]),...(id==='7y'?['unit','composition','balance','biology-lab','chemistry-lab']:[]),...(id==='12y'?['arguments']:[])];
const fail=()=>{throw new Error('Invalid progress');};
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&(Object.getPrototypeOf(x)===Object.prototype||Object.getPrototypeOf(x)===null);
function keys(x,allowed){if(!object(x)||Object.keys(x).some(k=>!allowed.includes(k)))fail();return x;}
function choice(x,allowed){if(!allowed.includes(x))fail();return x;}
function integer(x,min,max){if(!Number.isInteger(x)||x<min||x>max)fail();return x;}
function bool(x){if(typeof x!=='boolean')fail();return x;}
function list(x,allowed,max,unique=false){if(!Array.isArray(x)||x.length>max)fail();x.forEach(v=>choice(v,allowed));if(unique&&new Set(x).size!==x.length)fail();return [...x];}
const fresh=()=>({phase:'intro',unitPage:'connect',unitAnswers:{},unitFeedback:{},unitHints:{},extraStep:0,extraChoice:null,extraCorrect:false,hintLevel:0,rule:'color',shapes:new Set(),plan:new Set(),planA:new Set(),comparingPlans:false,budget:8,challenge:false,story:[...initialStoryOrder],storyChecked:false,storyReason:false,storyChoice:null,evidenceStep:0,evidenceChoice:null,evidenceCorrect:false,evidenceDone:false,feedback:'',success:false});
const stateFields=Object.keys(fresh()).filter(k=>!['feedback','unitFeedback'].includes(k));
const routeFields=['commands','cursor','status','hint','guide','editIndex','undo'];
function route(raw,lesson,runtime=false,undo=false){
 keys(raw,[...(undo?['commands','cursor','status']:routeFields),...(runtime?['position','trail','message']:[])]);
 const out={commands:list(raw.commands,Object.keys(directions),12),cursor:integer(raw.cursor,0,12),status:choice(raw.status,['editing','moving','blocked','arrived'])};
 if(out.cursor>out.commands.length)fail();
 const rebuilt=newRoute();rebuilt.commands=[...out.commands];
 for(let i=0;i<out.cursor;i++){const before=rebuilt.cursor;moveOne(rebuilt,lesson);if(rebuilt.cursor===before)fail();}
 if(out.status==='blocked'||(out.status==='editing'&&out.cursor>0))moveOne(rebuilt,lesson);
 if(rebuilt.status!==out.status)fail();
 if(runtime){if(typeof raw.message!=='string')fail();if(JSON.stringify(raw.position)!==JSON.stringify(rebuilt.position)||JSON.stringify(raw.trail)!==JSON.stringify(rebuilt.trail))fail();}
 if(!undo){out.hint=integer(raw.hint??0,0,lesson.hints.length);out.guide=bool(raw.guide??false);out.editIndex=raw.editIndex??null;if(out.editIndex!==null)integer(out.editIndex,0,out.commands.length-1);out.undo=raw.undo==null?null:route(raw.undo,lesson,runtime,true);}
 return out;
}
function restoreRoute(raw,lesson,undo=false){const r=newRoute();r.commands=[...raw.commands];for(let i=0;i<raw.cursor;i++)moveOne(r,lesson);if(raw.status==='blocked'||(raw.status==='editing'&&raw.cursor>0))moveOne(r,lesson);if(!r.message&&r.commands.length)r.message='Camino listo para probar desde el inicio.';if(!undo){r.hint=raw.hint;r.guide=raw.guide;r.editIndex=raw.editIndex;r.undo=raw.undo?restoreRoute(raw.undo,lesson,true):null;}else {delete r.hint;delete r.guide;delete r.undo;}return r;}
function garden(raw,runtime){keys(raw,['page','routes','changeVisited','demoOpen','demoStep']);const out={page:choice(raw.page,[...gardenLessons.map(l=>l.id),'offscreen']),changeVisited:bool(raw.changeVisited),demoOpen:bool(raw.demoOpen??false),demoStep:integer(raw.demoStep??0,0,2),routes:{}};keys(raw.routes,gardenLessons.map(l=>l.id));for(const lesson of gardenLessons)out.routes[lesson.id]=route(raw.routes[lesson.id],lesson,runtime);return out;}
function wordState(raw){
 keys(raw,['page','scene','answers','recallShown','offscreen']);
 const out={page:choice(raw.page,['scene','recall','offscreen']),scene:integer(raw.scene,0,wordScenes.length-1),recallShown:bool(raw.recallShown),offscreen:choice(raw.offscreen,['untried','planned','tried']),answers:[]};
 if(!Array.isArray(raw.answers)||raw.answers.length!==wordScenes.length)fail();
 out.answers=raw.answers.map((a,i)=>{keys(a,['meaning','clue','checked','hint']);const scene=wordScenes[i];return {meaning:choice(a.meaning,[null,...scene.options.map(o=>o.id)]),clue:choice(a.clue,[null,...scene.fragments.map(f=>f.id)]),checked:bool(a.checked),hint:integer(a.hint,0,scene.hints.length)};});
 return out;
}
function state(raw,id,activity,runtime){
 keys(raw,[...stateFields,'garden','gardenFocus','words','language','science','construction','exploration','composition','argument','context','balance','contextScene','biologyLab','chemistryLab','quantity','numberParts',...(runtime?['feedback','unitFeedback']:[])]);
 const defaults=fresh(),s={};for(const k of stateFields)s[k]=Object.hasOwn(raw,k)?raw[k]:defaults[k];
 choice(s.phase,sessionPhases);choice(s.unitPage,unitPages.map(([id])=>id));
 keys(s.unitAnswers,Object.keys(unitQuestions));keys(s.unitHints,Object.keys(unitQuestions));
 s.unitAnswers={...s.unitAnswers};s.unitHints={...s.unitHints};
 for(const [key,value] of Object.entries(s.unitAnswers))choice(value,unitQuestions[key].options.map(([id])=>id));
 for(const [key,value] of Object.entries(s.unitHints))integer(value,0,unitQuestions[key].hints.length);
 const extra=extraActivities[id];integer(s.extraStep,0,extra?extra.steps.length-1:0);
 choice(s.extraChoice,[null,...(extra?.steps[s.extraStep].options.map(([id])=>id)||[])]);integer(s.hintLevel,0,extra?.steps[s.extraStep].hints.length??0);
 choice(s.rule,['color','shape']);
 for(const [key,allowed] of [['shapes',shapes.map(s=>s.id)],['plan',supplies.map(s=>s.id)],['planA',supplies.map(s=>s.id)]])s[key]=list((runtime||!Object.hasOwn(raw,key))&&s[key] instanceof Set?[...s[key]]:s[key],allowed,allowed.length,true);
 choice(s.budget,[5,8]);
 bool(s.comparingPlans);if(s.comparingPlans&&(s.budget!==8||!s.planA.length))fail();
 s.story=list(s.story,storyCards.map(c=>c.id),3,true);if(s.story.length!==3)fail();choice(s.storyChoice,[null,'paper','car']);
 integer(s.evidenceStep,0,evidenceQuestions.length-1);choice(s.evidenceChoice,[null,...evidenceQuestions[s.evidenceStep].options.map(o=>o.id)]);
 for(const k of ['extraCorrect','challenge','storyChecked','storyReason','evidenceCorrect','evidenceDone','success'])bool(s[k]);
 if(Object.hasOwn(raw,'contextScene')){if(id!=='5y'||!contextIds.includes(activity))fail();s.contextScene=validateLanguageScene(raw.contextScene);}
 if(Object.hasOwn(raw,'numberParts')){if(id!=='5y'||activity!=='number-parts')fail();s.numberParts=validateParts(raw.numberParts);}
 if(Object.hasOwn(raw,'quantity')){if(id!=='3y'||activity!=='quantity')fail();s.quantity=validateQuantity(raw.quantity);}
 if(Object.hasOwn(raw,'biologyLab')){if(id!=='7y'||activity!=='biology-lab')fail();s.biologyLab=validateBiologyLab(raw.biologyLab);}
 if(Object.hasOwn(raw,'chemistryLab')){if(id!=='7y'||activity!=='chemistry-lab')fail();s.chemistryLab=validateChemistryLab(raw.chemistryLab);}
 if(Object.hasOwn(raw,'balance')){if(id!=='7y'||activity!=='balance')fail();s.balance=validateBalance(raw.balance);}
 if(Object.hasOwn(raw,'context')){if(id!=='5y'||!contextIds.includes(activity))fail();s.context=validateContext(raw.context);}
 if(Object.hasOwn(raw,'argument')){if(id!=='12y'||activity!=='arguments')fail();s.argument=validateArgument(raw.argument);}
 if(Object.hasOwn(raw,'composition')){if(id!=='7y'||activity!=='composition')fail();s.composition=validateComposition(raw.composition);}
 if(Object.hasOwn(raw,'exploration')){if(!((id==='7y'&&activity==='extra')||(id==='2y'&&activity==='original')))fail();s.exploration=validateExploration(raw.exploration,id);}
 if(Object.hasOwn(raw,'construction')){if(activity!=='extra')fail();s.construction=validateConstruction(raw.construction,id);}
 if(Object.hasOwn(raw,'science')){if(id!=='5y'||!scienceIds.includes(activity))fail();const g=raw.science,steps=scienceGames[activity].steps;keys(g,['page','step','answers']);choice(g.page,['guide','play']);integer(g.step,0,steps.length-1);if(!Array.isArray(g.answers)||g.answers.length!==steps.length)fail();s.science={page:g.page,step:g.step,answers:g.answers.map((a,i)=>{keys(a,['choice','reason','checked']);choice(a.choice,[null,...steps[i].options.map(o=>o.id)]);choice(a.reason,[null,...steps[i].reasons.map(r=>r.id)]);bool(a.checked);if(a.checked&&(!a.choice||!a.reason))fail();return {...a};})};}
 if(Object.hasOwn(raw,'language')){if(id!=='5y'||!languageIds.includes(activity))fail();const l=raw.language;keys(l,['page','step','choice','checked']);s.language={page:choice(l.page,['guide','practice']),step:integer(l.step,0,concepts.length-1),choice:choice(l.choice,[null,...concepts.map(c=>c.id)]),checked:bool(l.checked)};if(l.checked&&!l.choice)fail();}
 if(Object.hasOwn(raw,'words')){if(id!=='5y'||activity!=='words')fail();s.words=wordState(raw.words);}
 if(Object.hasOwn(raw,'gardenFocus'))s.gardenFocus=bool(raw.gardenFocus);
 if(Object.hasOwn(raw,'garden')){if(id!=='5y'||activity!=='garden')fail();s.garden=garden(raw.garden,runtime);}
 return s;
}
function snapshot(raw,runtime=false){
 keys(raw,['stage','selectedActivities','states']);choice(raw.stage,[null,...stageIds]);keys(raw.selectedActivities,stageIds);
 const selectedActivities={};for(const [id,activity] of Object.entries(raw.selectedActivities))selectedActivities[id]=choice(activity,activities(id));
 const stateKeys=stageIds.flatMap(id=>activities(id).map(a=>`${id}:${a}`));keys(raw.states,stateKeys);
 const states={};for(const [key,value] of Object.entries(raw.states)){const [id,activity]=key.split(':');states[key]=state(value,id,activity,runtime);}
 if(raw.stage!==null){const key=`${raw.stage}:${selectedActivities[raw.stage]||'original'}`;if(!Object.hasOwn(states,key))states[key]=state(fresh(),raw.stage,selectedActivities[raw.stage]||'original',true);}
 return {stage:raw.stage,selectedActivities,states};
}
function restore(raw){for(const s of Object.values(raw.states)){s.shapes=new Set(s.shapes);s.plan=new Set(s.plan);s.planA=new Set(s.planA);s.feedback='';s.unitFeedback={};if(s.garden)for(const lesson of gardenLessons)s.garden.routes[lesson.id]=restoreRoute(s.garden.routes[lesson.id],lesson);}return raw;}
const result=status=>({ok:false,status});
function decode(text){
 if(text===null)return result('empty');
 if(typeof text!=='string')return result('corrupt');
 if(text.length>MAX_PROGRESS_BYTES||new TextEncoder().encode(text).length>MAX_PROGRESS_BYTES)return result('too-large');
 try{const doc=JSON.parse(text);if(!object(doc))return result('corrupt');if(Object.hasOwn(doc,'version')&&![1,2,3,PROGRESS_VERSION].includes(doc.version))return result('unsupported-version');keys(doc,['version','snapshot']);if(![1,2,3,PROGRESS_VERSION].includes(doc.version))return result('corrupt');return {ok:true,status:'loaded',snapshot:restore(snapshot(doc.snapshot))};}catch{return result('corrupt');}
}
/** Reads only our key. Never repairs, deletes or writes while loading. */
export function loadProgress(storage){try{if(!storage||typeof storage.getItem!=='function')return result('unavailable');return decode(storage.getItem(PROGRESS_KEY));}catch{return result('unavailable');}}
/** A failed/corrupt/future-version record is preserved until explicit clear. */
export function saveProgress(storage,value){
 let text;try{text=JSON.stringify({version:PROGRESS_VERSION,snapshot:snapshot(value,true)});if(new TextEncoder().encode(text).length>MAX_PROGRESS_BYTES)return result('too-large');}catch{return result('invalid');}
 const previous=loadProgress(storage);if(!previous.ok&&previous.status!=='empty')return result(previous.status);
 try{if(typeof storage.setItem!=='function')return result('unavailable');storage.setItem(PROGRESS_KEY,text);return {ok:true,status:'saved'};}catch{return result('unavailable');}
}
/** Explicit reset removes only this app's progress key. */
export function clearProgress(storage){try{if(!storage||typeof storage.removeItem!=='function')return result('unavailable');storage.removeItem(PROGRESS_KEY);return {ok:true,status:'cleared'};}catch{return result('unavailable');}}
