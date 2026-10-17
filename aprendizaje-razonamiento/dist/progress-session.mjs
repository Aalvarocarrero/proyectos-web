// One anonymous baseline per tab. No identifiers, timestamps or network calls.
import {PROGRESS_KEY,loadProgress,saveProgress} from './local-progress.mjs';

export const PROGRESS_LOCK=`${PROGRESS_KEY}:write`;
const unread=Symbol('unread');
const unavailable=()=>({ok:false,status:'unavailable'});
const decode=raw=>loadProgress({getItem:()=>raw});

/**
 * Protects this tab's saved baseline until the user explicitly calls reload().
 * inspect/reload are synchronous. save/clear return promises with Web Locks,
 * otherwise synchronous results with coordination:'optimistic'. Web Locks only
 * coordinate participating writers on this origin. Without them localStorage
 * has no atomic compare-and-set: the check and read-back are best effort, and an
 * exactly simultaneous writer may still win. Identical raw values (including
 * unobserved changes away and back) are deliberately indistinguishable.
 */
export class ProgressSession {
 #storage;
 #baseline=unread;
 #conflict=false;
 #generation=0;
 #request=null;
 #lockFault=false;

 constructor(storage,{locks}={}){
  this.#storage=storage;
  try{if(locks&&typeof locks.request==='function')this.#request=locks.request.bind(locks);}catch{this.#lockFault=true;}
  const current=this.#read();
  if(current.ok)this.#baseline=current.raw;
 }

 #result(value){return {...value,coordination:this.#request||this.#lockFault?'locks':'optimistic'};}
 #read(){
  try{
   const get=this.#storage?.getItem;
   if(typeof get!=='function')return unavailable();
   const raw=get.call(this.#storage,PROGRESS_KEY);
   return raw===null||typeof raw==='string'?{ok:true,raw}:unavailable();
  }catch{return unavailable();}
 }
 #changed(raw){
  this.#conflict=true;
  return this.#result({ok:false,status:'conflict',latestStatus:decode(raw).status,change:raw===null?'removed':'changed'});
 }
 #check(current){
  if(!current.ok||this.#baseline===unread)return this.#result(unavailable());
  if(this.#conflict||current.raw!==this.#baseline)return this.#changed(current.raw);
  return this.#result(decode(current.raw));
 }

 /** Observes changes without adopting or writing them. Conflict is latched. */
 inspect(){return this.#check(this.#read());}

 /** Explicitly adopts exactly one read and invalidates already queued writes. */
 reload(){
  this.#generation++;
  const current=this.#read();
  if(!current.ok)return this.#result(unavailable());
  this.#baseline=current.raw;
  this.#conflict=false;
  return this.#result(decode(current.raw));
 }

 #run(operation){
  const generation=this.#generation;
  const guarded=()=>generation===this.#generation?operation():this.#result({ok:false,status:'superseded'});
  // A lock failure never silently weakens a requested coordinated write.
  if(this.#lockFault)return this.#result(unavailable());
  if(!this.#request)return guarded();
  try{return Promise.resolve(this.#request(PROGRESS_LOCK,{mode:'exclusive'},guarded)).catch(()=>this.#result(unavailable()));}
  catch{return Promise.resolve(this.#result(unavailable()));}
 }

 #mutate(kind,text){
  const current=this.#read(),checked=this.#check(current);
  if(checked.status==='conflict'||checked.status==='unavailable')return checked;
  // Never repair or replace unreadable/future records implicitly.
  if(kind==='save'&&!checked.ok&&checked.status!=='empty')return checked;
  try{
   const method=this.#storage?.[kind==='save'?'setItem':'removeItem'];
   if(typeof method!=='function')return this.#result(unavailable());
   if(kind==='save')method.call(this.#storage,PROGRESS_KEY,text);
   else method.call(this.#storage,PROGRESS_KEY);
  }catch{return this.#result(unavailable());}
  const after=this.#read(),expected=kind==='save'?text:null;
  // Do not claim success after a denied verification read or a rival write.
  // Keep the previous baseline on uncertain outcomes; reload resolves them.
  if(!after.ok)return this.#result(unavailable());
  if(after.raw!==expected)return this.#changed(after.raw);
  this.#baseline=expected;
  // Snapshots queued while a deletion was waiting still contain pre-clear UI
  // state. They must not resurrect it after that deletion succeeds.
  if(kind==='clear')this.#generation++;
  return this.#result({ok:true,status:kind==='save'?'saved':'cleared'});
 }

 save(value){
  // The codec validates and serializes now, before any lock wait. Mutable UI
  // objects cannot silently change the snapshot of an already queued save.
  let text;
  const encoded=saveProgress({getItem:()=>null,setItem:(_key,raw)=>{text=raw;}},value);
  if(!encoded.ok)return this.#result(encoded);
  return this.#run(()=>this.#mutate('save',text));
 }

 /** Baseline-checked deletion also invalidates already queued mutations. */
 clear(){return this.#run(()=>this.#mutate('clear'));}
}

export const createProgressSession=(storage,options)=>new ProgressSession(storage,options);
