import test from 'node:test';import assert from 'node:assert/strict';
import {gardenLessons,newRoute,newGarden,addCommand,removeCommand,replaceCommand,clearCommands,undoEdit,previewNext,moveOne,resetRun,selectGardenPage,cellName} from '../dist/garden-game.mjs';
const build=(steps)=>{const r=newRoute();for(const s of steps)addCommand(r,s);return r;};
const runState=({commands,cursor,position,trail,status,message})=>structuredClone({commands,cursor,position,trail,status,message});
const freezeDeep=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freezeDeep);Object.freeze(value);}return value;};
test('one click means one cell; no autoplay and multiple valid routes',()=>{const r=build(['right','right']);assert.deepEqual(r.position,[0,3]);moveOne(r,gardenLessons[0]);assert.deepEqual(r.position,[1,3]);assert.equal(r.cursor,1);moveOne(r,gardenLessons[0]);assert.equal(r.status,'arrived');const snapshot=JSON.stringify(r);moveOne(r,gardenLessons[0]);assert.equal(JSON.stringify(r),snapshot);for(const steps of [['right','right','right','up','up'],['up','up','right','right','right']]){const alt=build(steps);for(const step of steps)moveOne(alt,gardenLessons[1]);assert.equal(alt.status,'arrived');}});
test('walls and edges stop before entry, keeping the blocked command highlighted',()=>{for(const [steps,lesson,position]of [[['left'],0,[0,3]],[['right','right'],2,[1,3]]]){const r=build(steps);steps.forEach(()=>moveOne(r,gardenLessons[lesson]));assert.equal(r.status,'blocked');assert.deepEqual(r.position,position);assert.equal(r.cursor,steps.length-1);const before=JSON.stringify(r);moveOne(r,gardenLessons[lesson]);assert.equal(JSON.stringify(r),before);assert.match(r.message,/piedra|tablero/);}});
test('editing, removing and rerunning preserve a reversible plan',()=>{const r=build(['right','right']);moveOne(r,gardenLessons[0]);removeCommand(r,1);assert.deepEqual(r.position,[0,3]);assert.deepEqual(r.commands,['right']);addCommand(r,'up');moveOne(r,gardenLessons[0]);resetRun(r);assert.deepEqual(r.commands,['right','up']);assert.equal(r.cursor,0);});
test('empty and unfinished routes explain next action; spare arrows do not force more moves',()=>{const r=newRoute();moveOne(r,gardenLessons[0]);assert.match(r.message,/Primero/);addCommand(r,'right');moveOne(r,gardenLessons[0]);assert.match(r.message,/acabaron/);const x=build(['right','right','up']);moveOne(x,gardenLessons[0]);moveOne(x,gardenLessons[0]);assert.equal(x.cursor,2);assert.match(x.message,/no hicieron falta/);});
test('all parts are freely available and new obstacle copies rather than mutates previous route',()=>{const g=newGarden();selectGardenPage(g,'offscreen');assert.equal(g.page,'offscreen');g.routes.plan.commands=['right','right','right','up','up'];selectGardenPage(g,'change');assert.deepEqual(g.routes.change.commands,g.routes.plan.commands);removeCommand(g.routes.change,1);assert.equal(g.routes.plan.commands.length,5);selectGardenPage(g,'plan');selectGardenPage(g,'change');assert.equal(g.routes.change.commands.length,4);const fresh=newGarden();selectGardenPage(fresh,'change');assert.match(fresh.routes.change.message,/ejemplo/);});
test('bounded board and unknown inputs are explicit and safe',()=>{const r=newRoute();for(let i=0;i<12;i++)assert.equal(addCommand(r,'right'),true);assert.equal(addCommand(r,'up'),false);assert.equal(r.commands.length,12);assert.match(r.message,/no es una puntuación/);assert.throws(()=>addCommand(r,'jump'));assert.throws(()=>removeCommand(r,-1));assert.throws(()=>selectGardenPage(newGarden(),'fake'));assert.equal(cellName([3,1]),'D2');});
test('every edit can undo to the exact mid-execution plan, cursor, trail and message',()=>{
 for(const edit of [r=>addCommand(r,'up'),r=>removeCommand(r,1),r=>replaceCommand(r,1,'up'),clearCommands]){
  const r=build(['right','right','right','up','up']);moveOne(r,gardenLessons[1]);moveOne(r,gardenLessons[1]);
  r.hint=2;r.guide=true;const before=runState(r);
  edit(r);assert.equal(r.cursor,0);assert.deepEqual(r.position,[0,3]);assert.deepEqual(r.trail,[[0,3]]);assert.equal(r.status,'editing');
  assert.deepEqual(r.undo,before);assert.notStrictEqual(r.undo.commands,r.commands);assert.notStrictEqual(r.undo.position,r.position);assert.notStrictEqual(r.undo.trail,r.trail);
  assert.equal(undoEdit(r),true);assert.deepEqual(runState(r),before);assert.equal(r.hint,2);assert.equal(r.guide,true);assert.equal(r.undo,null);
  const restored=structuredClone(r);assert.equal(undoEdit(r),false);assert.deepEqual(r,restored);
 }
});
test('undo retains only the latest edit without a nested history or redo',()=>{
 const r=newRoute();assert.equal(undoEdit(r),false);addCommand(r,'right');const one=runState(r);addCommand(r,'up');
 assert.deepEqual(r.undo,one);assert.equal(Object.hasOwn(r.undo,'undo'),false);assert.equal(undoEdit(r),true);assert.deepEqual(runState(r),one);assert.equal(undoEdit(r),false);
});
test('replacing a blocked arrow permits a new route and undo restores the blocked attempt',()=>{
 const r=build(['right','right','right','up','up']);moveOne(r,gardenLessons[2]);moveOne(r,gardenLessons[2]);const blocked=runState(r);
 assert.equal(r.status,'blocked');assert.equal(r.cursor,1);assert.equal(replaceCommand(r,r.cursor,'left'),true);assert.deepEqual(r.commands,['right','left','right','up','up']);
 moveOne(r,gardenLessons[2]);moveOne(r,gardenLessons[2]);assert.equal(r.status,'moving');assert.deepEqual(r.position,[0,3]);
 assert.equal(undoEdit(r),true);assert.deepEqual(runState(r),blocked);assert.equal(previewNext(r,gardenLessons[2]).reason,'wall');
});
test('clear is undoable even after arrival and an empty clear is a true no-op',()=>{
 const r=build(['right','right']);moveOne(r,gardenLessons[0]);moveOne(r,gardenLessons[0]);const arrived=runState(r);
 assert.equal(clearCommands(r),true);assert.deepEqual(r.commands,[]);assert.equal(r.status,'editing');assert.equal(r.cursor,0);
 const cleared=structuredClone(r);assert.equal(clearCommands(r),false);assert.deepEqual(r,cleared);assert.equal(undoEdit(r),true);assert.deepEqual(runState(r),arrived);
 const fresh=newRoute(),before=structuredClone(fresh);assert.equal(clearCommands(fresh),false);assert.deepEqual(fresh,before);
});
test('replay and execution neither create nor replace an edit snapshot',()=>{
 const fresh=newRoute();resetRun(fresh);moveOne(fresh,gardenLessons[0]);assert.equal(fresh.undo,null);
 const r=build(['right','right','up']),snapshot=structuredClone(r.undo),reference=r.undo;
 moveOne(r,gardenLessons[0]);moveOne(r,gardenLessons[0]);resetRun(r);moveOne(r,gardenLessons[0]);
 assert.strictEqual(r.undo,reference);assert.deepEqual(r.undo,snapshot);assert.equal(undoEdit(r),true);assert.deepEqual(runState(r),snapshot);
});
test('invalid edit arguments are rejected atomically, including inherited direction names',()=>{
 const r=build(['right','up']);moveOne(r,gardenLessons[1]);
 for(const direction of ['jump','constructor','__proto__','toString','',null,undefined,1,{},['up']]){
  for(const edit of [()=>addCommand(r,direction),()=>replaceCommand(r,0,direction)]){const before=structuredClone(r);assert.throws(edit,/Dirección desconocida/);assert.deepEqual(r,before);}
 }
 for(const index of [-1,2,99,0.5,NaN,Infinity,'0',null,undefined]){
  for(const edit of [()=>removeCommand(r,index),()=>replaceCommand(r,index,'left')]){const before=structuredClone(r);assert.throws(edit,/Paso desconocido/);assert.deepEqual(r,before);}
 }
 const before=structuredClone(r);assert.equal(replaceCommand(r,0,'right'),false);assert.deepEqual(r,before);
});
test('the twelve-arrow cap leaves the previous undo intact and replacement available',()=>{
 const r=build(Array(12).fill('right')),snapshot=structuredClone(r.undo);assert.equal(addCommand(r,'up'),false);assert.equal(r.commands.length,12);assert.deepEqual(r.undo,snapshot);
 const full=runState(r);assert.equal(replaceCommand(r,11,'up'),true);assert.equal(r.commands.length,12);assert.equal(undoEdit(r),true);assert.deepEqual(runState(r),full);
});
test('preview is pure, detached and reports the next zero-based arrow',()=>{
 const r=build(['right','up']);moveOne(r,gardenLessons[0]);const before=structuredClone(r);
 const preview=previewNext(freezeDeep(r),gardenLessons[0]);assert.deepEqual(preview,{from:[1,3],to:[1,2],blocked:false,reason:null,direction:'up',index:1});assert.deepEqual(r,before);
 preview.from[0]=99;preview.to[0]=99;assert.deepEqual(r,before);assert.deepEqual(previewNext(r,gardenLessons[0]).from,[1,3]);
});
test('preview describes edges and stones without consuming or unblocking their arrows',()=>{
 for(const [steps,lesson,reason,from,to,index]of [[['left'],gardenLessons[0],'edge',[0,3],[-1,3],0],[['right','right'],gardenLessons[2],'wall',[1,3],[2,3],1]]){
  const r=build(steps);for(let i=0;i<steps.length-1;i++)moveOne(r,lesson);const before=structuredClone(r);
  assert.deepEqual(previewNext(r,lesson),{from,to,blocked:true,reason,direction:steps[index],index});assert.deepEqual(r,before);
  moveOne(r,lesson);const blocked=structuredClone(r);assert.equal(previewNext(r,lesson).reason,reason);assert.deepEqual(r,blocked);
 }
});
test('preview returns null for unavailable moves and rejects bad lessons or commands without mutation',()=>{
 const empty=newRoute(),emptyBefore=structuredClone(empty);assert.equal(previewNext(empty,gardenLessons[0]),null);assert.deepEqual(empty,emptyBefore);
 const exhausted=build(['right']);moveOne(exhausted,gardenLessons[0]);const exhaustedBefore=structuredClone(exhausted);assert.equal(previewNext(exhausted,gardenLessons[0]),null);assert.deepEqual(exhausted,exhaustedBefore);
 const arrived=build(['right','right','up']);moveOne(arrived,gardenLessons[0]);moveOne(arrived,gardenLessons[0]);const arrivedBefore=structuredClone(arrived);assert.equal(previewNext(arrived,gardenLessons[0]),null);assert.deepEqual(arrived,arrivedBefore);
 for(const lesson of [null,undefined,{}, {...gardenLessons[0]}]){assert.throws(()=>previewNext(empty,lesson),/Tablero desconocido/);assert.deepEqual(empty,emptyBefore);}
 const invalid=newRoute();invalid.commands=['constructor'];const invalidBefore=structuredClone(invalid);assert.throws(()=>previewNext(invalid,gardenLessons[0]),/Dirección desconocida/);assert.throws(()=>moveOne(invalid,gardenLessons[0]),/Dirección desconocida/);assert.deepEqual(invalid,invalidBefore);
});
test('guide, edits, snapshots, previews and undo remain isolated to each lesson',()=>{
 const g=newGarden();addCommand(g.routes.plan,'right');addCommand(g.routes.plan,'right');moveOne(g.routes.plan,gardenLessons[1]);g.routes.plan.guide=true;
 const originalPlan=structuredClone(g.routes.plan),originalTry=structuredClone(g.routes.try);selectGardenPage(g,'change');assert.equal(g.routes.change.guide,false);assert.equal(g.routes.change.undo,null);
 replaceCommand(g.routes.change,1,'up');assert.notStrictEqual(g.routes.change.commands,g.routes.plan.commands);assert.notStrictEqual(g.routes.change.undo.commands,g.routes.plan.commands);
 previewNext(g.routes.change,gardenLessons[2]);moveOne(g.routes.change,gardenLessons[2]);clearCommands(g.routes.change);undoEdit(g.routes.change);g.routes.change.guide=true;
 assert.deepEqual(g.routes.plan,originalPlan);assert.deepEqual(g.routes.try,originalTry);
});
