import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url)),originals=new Map();
function install(name,value){if(!originals.has(name))originals.set(name,Object.getOwnPropertyDescriptor(globalThis,name));Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});}
const memory=new Map(),visits=[],successes=[];
install('sessionStorage',{getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value),removeItem:key=>memory.delete(key)});
const location={origin:'https://venezuelaagro.com',pathname:'/tienda',search:'',hash:'',assign:path=>visits.push(path)};
install('window',{location});install('location',location);
class FormDataMock{constructor(form){this.values=form.values;}get(key){return this.values[key]??null;}}
install('FormData',FormDataMock);
const vite=await createServer({appType:'custom',configFile:false,root,define:{__AUTH_DEPLOYMENT_TARGET__:JSON.stringify('standalone')},resolve:{alias:{'@':root}},plugins:[{name:'formal-order-hooks',enforce:'pre',transform(code,id){if(!id.includes('store-catalog.tsx?formal-test'))return;return code.replace("from 'react';","from 'virtual:formal-hooks';").replace("from '@/lib/offline-db';","from 'virtual:formal-db';").replace("from '@/lib/offline-owner';","from 'virtual:formal-owner';").replace("from 'sonner';","from 'virtual:formal-toast';");},resolveId(id){if(id.startsWith('virtual:formal-'))return '\0'+id;},load(id){if(id==='\0virtual:formal-hooks')return 'export const useState=v=>globalThis.__formalHooks.useState(v);export const useRef=v=>globalThis.__formalHooks.useRef(v);export const useEffect=(f,d)=>globalThis.__formalHooks.useEffect(f,d);export const useMemo=(f,d)=>globalThis.__formalHooks.useMemo(f,d);';if(id==='\0virtual:formal-db')return 'export const getCachedEntity=(...a)=>globalThis.__formalDb.getCachedEntity(...a);export const cacheEntity=(...a)=>globalThis.__formalDb.cacheEntity(...a);export const queueMutation=(...a)=>globalThis.__formalDb.queueMutation(...a);export const syncNow=()=>globalThis.__formalDb.syncNow();export const getOperationStatus=(...a)=>globalThis.__formalDb.getOperationStatus(...a);export const createLocalId=()=>"order-id";';if(id==='\0virtual:formal-owner')return 'export const selectVerifiedDashboardOwner=id=>globalThis.__formalDb.selectOwner(id);';if(id==='\0virtual:formal-toast')return 'export const toast={loading:()=>"toast",success:(...a)=>globalThis.__formalSuccess.push(a),error:()=>{},dismiss:()=>{}};';}}],server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(async()=>{await vite.close();for(const [key,value]of originals){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}delete globalThis.__formalHooks;delete globalThis.__formalDb;delete globalThis.__formalSuccess;});
const {StoreCatalog}=await vite.ssrLoadModule('/components/store-catalog.tsx?formal-test');
const helper=await vite.ssrLoadModule('/lib/formal-submission.ts');
globalThis.__formalSuccess=successes;
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const text=node=>typeof node==='string'?node:Array.isArray(node)?node.map(text).join(''):node?.props?text(node.props.children):'';
function nodes(node){if(!node||typeof node!=='object')return [];if(Array.isArray(node))return node.flatMap(nodes);return [node,...nodes(node.props?.children)];}
function harness(){let slots=[],cursor=0,tree,changed=false,effects=[];const hooks={useState(v){const i=cursor++;if(!(i in slots))slots[i]=typeof v==='function'?v():v;return [slots[i],n=>{const v=typeof n==='function'?n(slots[i]):n;if(!Object.is(v,slots[i])){slots[i]=v;changed=true;}}];},useRef(v){const i=cursor++;return slots[i]??=( {current:v});},useMemo(f,deps){const i=cursor++;if(!(i in slots)||deps.some((v,n)=>!Object.is(v,slots[i].deps[n])))slots[i]={value:f(),deps};return slots[i].value;},useEffect(f,deps){const i=cursor++;if(!(i in slots)||deps.some((v,n)=>!Object.is(v,slots[i]?.[n]))){slots[i]=deps;effects.push(f);}}};function render(){globalThis.__formalHooks=hooks;let count=0;do{changed=false;cursor=0;tree=StoreCatalog();assert.ok(++count<20);}while(changed);const run=effects;effects=[];for(const f of run)f();return tree;}const all=predicate=>nodes(tree).filter(predicate);const find=predicate=>{const n=all(predicate)[0];assert.ok(n);return n;};render();return {render,all,find,get tree(){return tree;}};}
function setup({fresh=true,status=200,owner='owner-a',reason='authentication_required'}={}){
 if(fresh){memory.clear();visits.length=0;successes.length=0;location.search='';}
 let receipt='pending',resultReason=reason,currentOwner=owner,currentStatus=status;const queued=[],selected=[];
 install('fetch',async url=>{assert.equal(url,'/api/account-menu');return Response.json({owner:currentOwner},{status:currentStatus});});
 globalThis.__formalDb={getCachedEntity:async()=>null,cacheEntity:async()=>{},queueMutation:async value=>{queued.push(value);return {id:'operation-id'};},selectOwner:value=>selected.push(value),syncNow:async()=>{if(!resultReason)receipt='confirmed';return {reason:resultReason};},getOperationStatus:async()=>({state:receipt})};
 const h=harness();const field=name=>h.find(n=>n.props?.name===name&&typeof n.props.onChange==='function');
 function add(){h.all(n=>typeof n.props?.onClick==='function'&&text(n).startsWith('Elegir presentación'))[0].props.onClick();h.render();const editor=h.find(n=>n.props?.draft&&n.props?.onSave),p=editor.props.draft.product;editor.props.onSave({id:p.id,name:p.name,quantity:2,measure:p.units[0],presentation:p.presentations[0],preparation:'Corte de prueba'});h.render();}
 function fill(values){for(const [name,value]of Object.entries(values)){field(name).props.onChange({currentTarget:{value}});h.render();}}
 const submit=()=>h.find(n=>n.type==='form'&&n.props.className.includes('store-request-form')).props.onSubmit({preventDefault(){},currentTarget:{values:Object.fromEntries(h.all(n=>n.props?.name&&typeof n.props.value==='string').map(n=>[n.props.name,n.props.value]))}});
 const login=()=>h.find(n=>n.type?.name==='FormalSubmissionNotice').props.onLogin();
 return {h,add,fill,field,submit,login,queued,selected,setSession:(status,owner)=>{currentStatus=status;currentOwner=owner;},setReason:value=>resultReason=value};
}
const contact={name:'Cliente de prueba',phone:'+584120000000',email:'cliente@example.test',note:'Conservar todo el borrador'};
test('missing session stops before queueing and login restores fields/cart without auto-submit',async()=>{
 const s=setup({status:401});await tick();s.h.render();s.add();s.fill(contact);await s.submit();s.h.render();assert.equal(s.queued.length,0);assert.equal(successes.length,0);assert.match(text(s.h.tree),/Necesitas iniciar sesión/);for(const [key,value]of Object.entries(contact))assert.equal(s.field(key).props.value,value);
 s.login();assert.equal(visits.length,1);assert.ok(!visits[0].includes('cliente'));const returnTo=new URL('https://app.test'+visits[0]).searchParams.get('return_to');assert.equal(returnTo,'/tienda?resume=order#solicitud');location.search='?resume=order';
 const next=setup({fresh:false,reason:undefined});await tick();next.h.render();assert.equal(next.queued.length,0);for(const [key,value]of Object.entries(contact))assert.equal(next.field(key).props.value,value);assert.equal(next.h.find(n=>n.type?.name==='Sheet').props.open,true);
 next.setReason(undefined);await next.submit();next.h.render();assert.equal(next.queued.length,1);assert.equal(next.queued[0].expectedOwner,'owner-a');assert.equal(next.queued[0].payload.customerName,contact.name);assert.equal(successes.length,1);assert.equal(helper.loadFormalDraft('order'),null);
});
test('sync401 keeps fields and exact pending operation; login with same account retries without duplicates',async()=>{
 const s=setup();await tick();s.h.render();s.add();s.fill(contact);await s.submit();s.h.render();assert.equal(s.queued.length,1);assert.equal(successes.length,0);assert.equal(s.field('name').props.value,contact.name);assert.match(text(s.h.tree),/servidor no ha confirmado/);
 s.login();location.search='?resume=order';const next=setup({fresh:false});await tick();next.h.render();next.setReason(undefined);await next.submit();next.h.render();assert.equal(next.queued.length,0,'saved pending operation must be reused');assert.equal(successes.length,1);
});
test('different account cannot adopt pending request and storage failure blocks navigation',async()=>{
 const s=setup();await tick();s.h.render();s.add();s.fill(contact);await s.submit();s.h.render();s.login();location.search='?resume=order';const next=setup({fresh:false,owner:'owner-b'});await tick();next.h.render();await next.submit();next.h.render();assert.equal(next.queued.length,0);assert.equal(next.selected.length,0);assert.match(text(next.h.tree),/cuenta original/);assert.equal(next.field('phone').props.value,contact.phone);
 visits.length=0;const original=sessionStorage.setItem;sessionStorage.setItem=()=>{};memory.clear();try{next.login();assert.equal(visits.length,0);}finally{sessionStorage.setItem=original;}
});
test('tab draft has a one-hour limit and safe login return paths never expose payload in URL',()=>{
 memory.clear();helper.saveFormalDraft('idea',{message:'contenido privado'});assert.deepEqual(helper.loadFormalDraft('idea'),{message:'contenido privado'});const key=[...memory.keys()][0],raw=JSON.parse(memory.get(key));raw.savedAt-=helper.FORMAL_DRAFT_TTL+1;memory.set(key,JSON.stringify(raw));assert.equal(helper.loadFormalDraft('idea'),null);
 assert.equal(helper.formalSubmissionReturnPath('idea','//evil.example'), '/?resume=idea');assert.equal(helper.formalSubmissionReturnPath('idea','/auth/signin'), '/?resume=idea');
});
