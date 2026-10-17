import test, {after, beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import {createElement} from 'react';

const root=fileURLToPath(new URL('..',import.meta.url));
const original=new Map();
function install(name,value){if(!original.has(name))original.set(name,Object.getOwnPropertyDescriptor(globalThis,name));Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});}
const vite=await createServer({appType:'custom',configFile:false,root,cacheDir:'/tmp/agro-formal-feedback-tests',resolve:{alias:{'@':root}},plugins:[{
 name:'formal-feedback-handler-tests',enforce:'pre',
 transform(code,id){
  if(!id.includes('?formal-feedback-test'))return;
  code=code.replace(/from (["'])react\1;/g,'from "virtual:formal-hooks";')
   .replace('from "@/lib/offline-db";','from "virtual:formal-db";')
   .replace('from "@/lib/offline-owner";','from "virtual:formal-owner";')
   .replace('from "next/navigation";','from "virtual:formal-navigation";');
  if(id.includes('community-forms.tsx'))code+='\nexport {QueuedForm};';
  return code;
 },
 resolveId(id){if(id.startsWith('virtual:formal-'))return '\0'+id;},
 load(id){
  if(id==='\0virtual:formal-hooks')return `export const useState=v=>globalThis.__formalHooks.useState(v);export const useRef=v=>globalThis.__formalHooks.useRef(v);export const useEffect=(f,d)=>globalThis.__formalHooks.useEffect(f,d);export const useCallback=(f,d)=>globalThis.__formalHooks.useMemo(()=>f,d);export const useId=()=>"formal-test-id";`;
  if(id==='\0virtual:formal-db')return `export const createLocalId=()=>"synthetic-feedback";export const queueMutation=(...a)=>globalThis.__formalDb.queueMutation(...a);export const syncNow=()=>globalThis.__formalDb.syncNow();export const getOperationStatus=(...a)=>globalThis.__formalDb.getOperationStatus(...a);export const subscribeOfflineChanges=()=>()=>{};`;
  if(id==='\0virtual:formal-owner')return 'export const selectVerifiedDashboardOwner=owner=>globalThis.__formalSelectedOwners.push(owner);';
  if(id==='\0virtual:formal-navigation')return 'export const usePathname=()=>window.location.pathname;';
 },
}],server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(async()=>{await vite.close();for(const [name,descriptor]of original){if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}});
const {OfflineSyncManager}=await vite.ssrLoadModule('/components/offline-sync-manager.tsx?formal-feedback-test');
const {IdeaInvitation}=await vite.ssrLoadModule('/components/idea-invitation.tsx?formal-feedback-test');
const {QueuedForm,FeedbackPanel}=await vite.ssrLoadModule('/components/community-forms.tsx?formal-feedback-test');
const drafts=await vite.ssrLoadModule('/lib/formal-submission.ts');
const values={area:'Sitio web',role:'Productor',message:'Necesito registrar mis cosechas.',contact:'prueba@example.invalid'};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const text=node=>typeof node==='string'?node:Array.isArray(node)?node.map(text).join(''):node?.props?text(node.props.children):'';
function nodes(node){if(!node||typeof node!=='object')return [];if(Array.isArray(node))return node.flatMap(nodes);return [node,...nodes(node.props?.children)];}
// Runs the production handlers with controlled hooks and browser APIs. Visual layout and Google OAuth need browser QA.
function harness(Component,props={}){
 const slots=[];let cursor=0,tree,changed=false,effects=[];
 const hooks={
  useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return [slots[i],next=>{const value=typeof next==='function'?next(slots[i]):next;if(!Object.is(value,slots[i])){slots[i]=value;changed=true;}}];},
  useRef(initial){const i=cursor++;if(!(i in slots))slots[i]={current:initial};return slots[i];},
  useMemo(factory,deps){const i=cursor++;if(!(i in slots)||!deps||deps.some((v,n)=>!Object.is(v,slots[i].deps?.[n])))slots[i]={value:factory(),deps};return slots[i].value;},
  useEffect(effect,deps){const i=cursor++;if(!(i in slots)||!deps||deps.some((v,n)=>!Object.is(v,slots[i]?.[n]))){slots[i]=deps;effects.push(effect);}},
 };
 function render(){globalThis.__formalHooks=hooks;let attempts=0;do{changed=false;cursor=0;tree=Component(props);assert.ok(++attempts<20);}while(changed);const pending=effects;effects=[];for(const effect of pending)effect();return tree;}
 const all=fn=>nodes(tree).filter(fn),find=fn=>{const found=all(fn)[0];assert.ok(found,'expected component element exists');return found;};
 const button=label=>find(n=>typeof n.props?.onClick==='function'&&text(n).trim()===label);
 render();return {render,all,find,button,get tree(){return tree;}};
}
let state;
beforeEach(()=>{
 const memory=new Map(),writes=[],syncs=[],statuses=new Map(),navigation=[],sessionCalls=[];
 state={memory,writes,syncs,statuses,navigation,sessionCalls,owner:'owner-a',result:{ok:false,reason:'authentication_required'},resets:0};
 install('__AUTH_DEPLOYMENT_TARGET__','standalone');install('__formalSelectedOwners',[]);
 install('sessionStorage',{getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value),removeItem:key=>memory.delete(key)});
 const location=new URL('https://venezuelaagro.com/mercado?vista=lista#participar');location.assign=href=>navigation.push(href);
 install('window',{location,sessionStorage,addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:true})});
 install('document',{body:{dataset:{}},addEventListener(){},removeEventListener(){},activeElement:null});
 install('requestAnimationFrame',()=>0);
 install('FormData',class{constructor(form){this.values=form.values;}get(key){return this.values[key]??null;}});
 install('fetch',async(path)=>{sessionCalls.push(path);assert.equal(path,'/api/account-menu');return state.owner?new Response(JSON.stringify({owner:state.owner}),{status:200}):new Response('',{status:401});});
 install('__formalDb',{
  queueMutation:async operation=>{const id=`operation-${writes.length+1}`;writes.push({...operation,id});statuses.set(id,{state:'pending'});return {...operation,id};},
  syncNow:async()=>{syncs.push(true);if(state.confirm)for(const id of statuses.keys())statuses.set(id,{state:'confirmed'});return state.result;},
  getOperationStatus:async id=>statuses.get(id)??{state:'unknown'},
 });
});
function idea(){const h=harness(IdeaInvitation);h.button('Compartir mi idea').props.onClick();h.render();for(const name of ['message','contact']){h.find(n=>n.props?.name===name).props.onChange({target:{value:values[name]}});h.render();}return h;}
function formSubmit(h){return h.find(n=>n.type==='form').props.onSubmit({preventDefault(){},currentTarget:formElement()});}
function formElement(){return {values:{...values},reset(){state.resets++;}};}
function feedback(){const h=harness(QueuedForm,{entityType:'feedback',success:'Comentario recibido.',build:form=>Object.fromEntries(Object.keys(values).map(key=>[key,form.get(key)])),children:Object.keys(values).map(name=>createElement(name==='message'?'textarea':'input',{key:name,name})),compact:true});h.render();h.find(n=>n.type==='form').props.ref.current=formElement();return h;}
function notice(h){return h.find(n=>n.type?.name==='FormalSubmissionNotice');}
function resultMessage(h){return h.find(n=>n.type?.name==='FormFeedback').props.message;}
function resume(kind){window.location.search=`?vista=lista&resume=${kind}`;}

test('idea requires a verified session before queueing, preserves text, and saves the explicit login return',async()=>{
 state.owner=null;const h=idea();await formSubmit(h);h.render();assert.equal(state.writes.length,0);assert.equal(state.syncs.length,0);assert.equal(notice(h).props.loginNeeded,true);assert.equal(h.find(n=>n.props?.name==='message').props.value,values.message);
 notice(h).props.onLogin();assert.deepEqual(drafts.loadFormalDraft('idea'),{message:values.message,contact:values.contact,operationId:null});const url=new URL(state.navigation[0],window.location);assert.equal(url.pathname,'/auth/signin');assert.equal(url.searchParams.get('return_to'),'/mercado?vista=lista&resume=idea#participar');
});

test('idea401 retains its account-bound operation and text without claiming receipt',async()=>{
 const h=idea();await formSubmit(h);h.render();assert.equal(state.writes.length,1);assert.equal(state.writes[0].expectedOwner,'owner-a');assert.equal(notice(h).props.loginNeeded,true);assert.match(text(h.tree),/no ha confirmado/);assert.doesNotMatch(text(h.tree),/Idea recibida\./);assert.equal(h.find(n=>n.props?.name==='message').props.value,values.message);
 notice(h).props.onLogin();const saved=drafts.loadFormalDraft('idea');assert.equal(saved.operationId,'operation-1');assert.equal(saved.expectedOwner,'owner-a');
});

test('returning to a queued idea opens the form, does not autosubmit, and reuses the exact operation',async()=>{
 drafts.saveFormalDraft('idea',{message:values.message,contact:values.contact,operationId:'prior-idea',expectedOwner:'owner-a'});state.statuses.set('prior-idea',{state:'pending'});resume('idea');const h=harness(IdeaInvitation);h.render();await tick();h.render();assert.equal(h.tree.props.open,true);assert.equal(state.syncs.length,0);assert.equal(state.writes.length,0);assert.equal(h.find(n=>n.props?.name==='message').props.value,values.message);
 state.result={ok:true};state.confirm=true;await formSubmit(h);h.render();assert.equal(state.writes.length,0);assert.equal(state.syncs.length,1);assert.match(text(h.tree),/Idea recibida\./);assert.equal(drafts.loadFormalDraft('idea'),null);
});

test('queued idea cannot be adopted by another account or replaced when status is unknown',async()=>{
 for(const otherAccount of [true,false]){
  state.writes.length=0;state.syncs.length=0;state.owner=otherAccount?'owner-b':'owner-a';drafts.saveFormalDraft('idea',{message:values.message,contact:values.contact,operationId:'unavailable-operation',expectedOwner:'owner-a'});resume('idea');const h=harness(IdeaInvitation);h.render();await tick();h.render();await formSubmit(h);h.render();assert.equal(state.writes.length,0);assert.equal(state.syncs.length,0);assert.doesNotMatch(text(h.tree),/Idea recibida\./);if(otherAccount)assert.match(text(h.tree),/cuenta original/);
 }
});

test('feedback preflight blocks anonymous queueing and login preserves all unfinished fields',async()=>{
 state.owner=null;const h=feedback();await formSubmit(h);h.render();assert.equal(state.writes.length,0);assert.equal(state.resets,0);assert.equal(notice(h).props.loginNeeded,true);notice(h).props.onLogin();assert.deepEqual(drafts.loadFormalDraft('feedback'),{fields:values,operationId:null});assert.match(state.navigation[0],/resume%3Dfeedback/);
});

test('feedback401 never resets; an explicit retry checks the same account-bound operation',async()=>{
 const h=feedback();await formSubmit(h);h.render();assert.equal(state.writes.length,1);assert.equal(state.writes[0].expectedOwner,'owner-a');assert.equal(state.resets,0);assert.match(resultMessage(h),/no ha confirmado/);notice(h).props.onLogin();assert.deepEqual(drafts.loadFormalDraft('feedback'),{fields:values,operationId:'operation-1',expectedOwner:'owner-a'});
 state.confirm=true;state.result={ok:true};await formSubmit(h);h.render();assert.equal(state.writes.length,1);assert.equal(state.resets,1);assert.equal(resultMessage(h),'Comentario recibido.');assert.equal(drafts.loadFormalDraft('feedback'),null);
});

test('feedback login return opens panel and restores a pending operation without sending it',async()=>{
 drafts.saveFormalDraft('feedback',{fields:values,operationId:'prior-feedback',expectedOwner:'owner-a'});state.statuses.set('prior-feedback',{state:'pending'});resume('feedback');const panel=harness(FeedbackPanel);await tick();panel.render();assert.equal(panel.tree.props.open,true);const h=feedback();assert.equal(state.syncs.length,0);assert.equal(state.writes.length,0);assert.equal(h.find(n=>n.type==='fieldset').props.disabled,true);for(const [name,value]of Object.entries(values))assert.equal(h.find(n=>n.props?.name===name).props.defaultValue,value);
 state.result={ok:true};state.confirm=true;await formSubmit(h);h.render();assert.equal(state.writes.length,0);assert.equal(state.syncs.length,1);assert.equal(resultMessage(h),'Comentario recibido.');
});

test('feedback never moves a resumed operation to another account and repeated checks never duplicate it',async()=>{
 drafts.saveFormalDraft('feedback',{fields:values,operationId:'prior-feedback',expectedOwner:'owner-a'});state.statuses.set('prior-feedback',{state:'pending'});resume('feedback');state.owner='owner-b';const h=feedback();await formSubmit(h);h.render();assert.equal(state.writes.length,0);assert.equal(state.syncs.length,0);assert.equal(state.resets,0);assert.match(resultMessage(h),/cuenta original/);notice(h).props.onLogin();assert.equal(drafts.loadFormalDraft('feedback').expectedOwner,'owner-a');
 state.owner='owner-a';state.result={ok:false,reason:'network'};await formSubmit(h);await formSubmit(h);h.render();assert.equal(state.writes.length,0);assert.equal(state.syncs.length,2);assert.equal(state.resets,0);
});

test('double submission while verifying login is locked synchronously',async()=>{
 const h=feedback();let release;install('fetch',()=>new Promise(resolve=>{release=resolve;}));const first=formSubmit(h),second=formSubmit(h);assert.equal(typeof release,'function');release(new Response(JSON.stringify({owner:'owner-a'})));await Promise.all([first,second]);assert.equal(state.writes.length,1);assert.equal(state.syncs.length,1);
});

test('failed draft persistence does not navigate away with the user text',async()=>{
 state.owner=null;const h=feedback();await formSubmit(h);h.render();sessionStorage.setItem=()=>{};notice(h).props.onLogin();h.render();assert.equal(state.navigation.length,0);assert.match(resultMessage(h),/no salimos del formulario/);assert.equal(state.resets,0);
});

test('Sites keeps its anonymous feedback flow, while generic auth failures never reset professional or project forms',async()=>{
 install('__AUTH_DEPLOYMENT_TARGET__','sites');state.result={ok:false,reason:'network'};const sites=feedback();await formSubmit(sites);sites.render();assert.equal(state.sessionCalls.length,0);assert.equal(state.writes.length,1);assert.equal(state.writes[0].expectedOwner,undefined);assert.equal(state.resets,1);assert.equal(sites.all(n=>n.type?.name==='FormalSubmissionNotice').length,0);
 for(const entityType of ['professional','project']){const h=harness(QueuedForm,{entityType,expectedOwner:'owner-a',success:'Recibido.',build:()=>({title:'Prueba'}),children:null});state.result={ok:false,reason:'account_changed'};const resets=state.resets;await formSubmit(h);h.render();assert.equal(state.resets,resets);assert.match(resultMessage(h),/Necesitas iniciar sesión/);}
});


test('already-confirmed feedback and idea use their persisted receipts without another sync',async()=>{
 for(const kind of ['feedback','idea']){
  drafts.saveFormalDraft(kind,kind==='feedback'?{fields:values,operationId:'confirmed-op',expectedOwner:'owner-a'}:{message:values.message,contact:values.contact,operationId:'confirmed-op',expectedOwner:'owner-a'});
  state.statuses.set('confirmed-op',{state:'confirmed'});resume(kind);const h=kind==='feedback'?feedback():harness(IdeaInvitation);await tick();h.render();await formSubmit(h);h.render();assert.equal(state.writes.length,0);assert.equal(state.syncs.length,0);assert.equal(drafts.loadFormalDraft(kind),null);
 }
});


function automaticSyncEvents(){
 const callbacks=new Map(),intervals=[];
 window.addEventListener=(name,fn)=>callbacks.set(name,fn);
 window.setInterval=fn=>{intervals.push(fn);return intervals.length;};window.clearInterval=()=>{};
 document.addEventListener=(name,fn)=>callbacks.set(name,fn);document.visibilityState='visible';
 install('navigator',{onLine:true,serviceWorker:{register:async()=>{},addEventListener:(name,fn)=>callbacks.set(name,fn),removeEventListener(){}}});
 harness(OfflineSyncManager);
 return {fire(){callbacks.get('online')();callbacks.get('visibilitychange')();callbacks.get('message')({data:{type:'TRY_SYNC'}});for(const callback of intervals)callback();}};
}

test('all automatic sync entry points pause on a standalone formal-login return, while explicit sync remains available',async()=>{
 for(const kind of ['order','idea','feedback']){
  state.syncs.length=0;resume(kind);const events=automaticSyncEvents();events.fire();await tick();assert.equal(state.syncs.length,0,kind+' must wait for review');
  await globalThis.__formalDb.syncNow();assert.equal(state.syncs.length,1,'explicit form sync is unaffected');
  window.location.search='?vista=lista';events.fire();assert.equal(state.syncs.length,5,'normal automatic sync resumes after leaving the return route');
 }
});

test('automatic sync behavior is unchanged for Sites and ordinary standalone routes',async()=>{
 for(const [target,query]of [['sites','?resume=feedback'],['standalone','?resume=other'],['standalone','']]){
  state.syncs.length=0;install('__AUTH_DEPLOYMENT_TARGET__',target);window.location.search=query;automaticSyncEvents().fire();await tick();assert.equal(state.syncs.length,5,target+' '+query);
 }
});
