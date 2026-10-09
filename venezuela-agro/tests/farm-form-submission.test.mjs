import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {readFile} from 'node:fs/promises';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import {indexedDB,IDBKeyRange} from 'fake-indexeddb';
const root=fileURLToPath(new URL('..',import.meta.url));
const descriptors=new Map();
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};};
for(const [key,value]of Object.entries({indexedDB,IDBKeyRange,location:{pathname:'/app-local',origin:'https://test.invalid'},navigator:{onLine:false},sessionStorage:storage(),localStorage:storage(),window:new EventTarget()})){descriptors.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});}
const vite=await createServer({appType:'custom',configFile:false,root,cacheDir:'/tmp/agro-form-gate-tests',resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(async()=>{await vite.close();for(const[key,d]of descriptors){if(d)Object.defineProperty(globalThis,key,d);else delete globalThis[key];}});
const {createSubmissionGate}=await vite.ssrLoadModule('/lib/form-submission.ts');
const db=await vite.ssrLoadModule('/lib/offline-db.ts');
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('rapid repeated save while offline stores exactly one animal, retains it and resets a captured form',async()=>{
 const gate=createSubmissionGate();let release;const wait=new Promise(resolve=>release=resolve);let resets=0,writes=0;
 const form={reset(){resets++;}},event={currentTarget:form};
 const pending=gate.run(async()=>{const captured=event.currentTarget;await wait;writes++;await db.queueMutation({expectedOwner:'device-local',entityType:'farm-record',entityId:'animal-single-submit',action:'upsert',payload:{farmId:'synthetic-farm',recordType:'animal',category:'Bovino',title:'Animal de prueba',data:{purpose:'Reproducción'}}});captured.reset();});
 event.currentTarget=null;
 await assert.rejects(()=>gate.run(()=>{writes++;}),/guardado en curso/);
 release();await pending;assert.equal(writes,1);assert.equal(resets,1);
 const rows=await db.getCachedEntities('farm-record');assert.equal(rows.filter(r=>r.id==='animal-single-submit').length,1);assert.equal(await db.getPendingCount(),1);
 const reopened=await vite.ssrLoadModule('/lib/offline-db.ts?form-reopened=1');assert.equal((await reopened.getCachedEntities('farm-record')).filter(r=>r.id==='animal-single-submit').length,1);
});
test('failed local save releases the gate for a deliberate retry',async()=>{
 const gate=createSubmissionGate();await assert.rejects(()=>gate.run(()=>Promise.reject(new Error('Storage unavailable'))),/Storage unavailable/);assert.equal(gate.busy,false);assert.equal(await gate.run(async()=> 'saved'),'saved');
});
test('seven affected forms retain event form before awaits and expose inline saving/error feedback',async()=>{
 const dashboard=await read('components/farm-dashboard.tsx'),intelligence=await read('components/farm-intelligence.tsx'),form=await read('components/farm-record-form.tsx');
 assert.doesNotMatch(dashboard,/event.currentTarget.reset/);assert.doesNotMatch(intelligence,/event.currentTarget.reset/);
 assert.equal((dashboard.match(/<FarmRecordForm onSubmit=/g)||[]).length,6);assert.equal((intelligence.match(/<FarmRecordForm onSubmit=/g)||[]).length,2);
 assert.match(form,/gate.current.busy\|\|completed.current/);assert.match(form,/completed.current=true/);assert.match(form,/disabled=\{saving\|\|done\}/);assert.match(form,/role="alert"/);assert.match(form,/Guardando…/);
 assert.match(dashboard,/toast.success\(text/);assert.match(dashboard,/Animal guardado en este dispositivo/);assert.match(dashboard,/El cambio ya se guardó en este dispositivo/);
});
test('select portals and mobile sidebar are above backdrop, with bounded date controls',async()=>{
 const css=await read('app/globals.css');assert.match(css,/\[data-slot="dialog-overlay"\][^}]+z-index: 110/);assert.match(css,/\[data-slot="select-content"\][^}]+z-index: 130/);assert.match(css,/\[data-slot="sidebar"\]\[data-mobile="true"\] \{ z-index:111/);
 assert.match(css,/\.farm-record-form label[^}]+min-width: 0; max-width: 100%/);assert.match(css,/input\[type="date"\][^}]+width:100%[^}]+box-sizing:border-box/);
});
test('pending saves prevent dismissal and stale close; normal mobile navigation closes only its sheet',async()=>{
 const dashboard=await read('components/farm-dashboard.tsx'),intelligence=await read('components/farm-intelligence.tsx');
 assert.equal((dashboard.match(/if\(!recordSubmissionGate.current.busy\)set(?:Animal|Area|Weight|Production|Inventory)Dialog\(open\)/g)||[]).length,5);
 assert.match(intelligence,/onOpenChange=\{next=>\{if\(canDismiss\(\)\)setOpen\(next\);\}\}/);
 assert.match(dashboard,/void refreshSavedRecord\(\)/);assert.match(intelligence,/void \(async\(\)=>\{try\{await load\(\)/);
 assert.match(dashboard,/function FarmSidebarButton[\s\S]*useSidebar\(\)[\s\S]*setOpenMobile\(false\)/);
 const gate=createSubmissionGate();let release;const wait=new Promise(resolve=>release=resolve);let open=true;
 const work=gate.run(async()=>{await wait;open=false;});
 const dismiss=()=>{if(!gate.busy)open=false;};dismiss();assert.equal(open,true);
 release();await work;assert.equal(open,false);assert.equal(gate.busy,false);
});
