import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
const {checkOfflineReadiness}=await vite.ssrLoadModule('/lib/offline-readiness.ts');
const saved=new Map(['navigator','fetch','MessageChannel'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
after(async()=>{await vite.close();for(const[key,value]of saved){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}});
const set=(name,value)=>Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});
class Channel{constructor(){this.port1={close(){},onmessage:null};this.port2={postMessage:value=>queueMicrotask(()=>this.port1.onmessage?.({data:value}))};}}
function setup({state='activated',version='morochos-v18',offline=false,workerMissing=false}={}){
 const worker=new EventTarget();Object.assign(worker,{state,postMessage(_request,[port]){port.postMessage({type:'OFFLINE_PROGRESS',status:{ready:true,phase:'ready',completed:3,total:3,version}});port.postMessage({ready:true,phase:'ready',completed:3,total:3,version});}});
 const registration=state==='activated'?{active:worker}:{installing:worker};
 let registerCalls=0;
 set('navigator',{onLine:!offline,serviceWorker:{controller:state==='activated'?worker:null,getRegistration:async()=>workerMissing?undefined:registration,register:async()=>{registerCalls++;return registration;}}});
 set('fetch',async()=>new Response(JSON.stringify({revision:'morochos-v18'})));set('MessageChannel',Channel);
 return {worker,registerCalls:()=>registerCalls};
}
test('first installation streams progress but cannot report ready before activation',async()=>{
 const {worker}=setup({state:'installing'}),progress=[];let completed=false;
 const result=checkOfflineReadiness(true,value=>progress.push(value)).then(value=>{completed=true;return value;});
 await new Promise(resolve=>setImmediate(resolve));assert.equal(completed,false);assert.ok(progress.length);assert.equal(progress[0].ready,false);
 worker.state='activated';worker.dispatchEvent(new Event('statechange'));assert.equal((await result).ready,true);
});
test('failed initial installation never reports ready after becoming redundant',async()=>{
 const {worker}=setup({state:'installing'});const result=checkOfflineReadiness(true);await new Promise(resolve=>setImmediate(resolve));worker.state='redundant';worker.dispatchEvent(new Event('statechange'));assert.equal((await result).ready,false);
});
test('old active build asks to close every tab and reopen instead of claiming the new deployment ready',async()=>{
 setup({version:'morochos-v17'});const result=await checkOfflineReadiness();assert.equal(result.ready,false);assert.match(result.error,/cierra todas las pestañas/);
});
test('offline local verification needs neither version fetch nor account access',async()=>{
 setup({offline:true});set('fetch',()=>{throw new Error('Network forbidden');});assert.equal((await checkOfflineReadiness()).ready,true);
});
test('an explicit retry can register the first worker without waiting for account services',async()=>{
 const setupResult=setup({workerMissing:true});assert.equal((await checkOfflineReadiness(true)).ready,true);assert.equal(setupResult.registerCalls(),1);
});
