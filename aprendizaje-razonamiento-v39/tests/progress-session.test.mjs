import test from 'node:test';
import assert from 'node:assert/strict';
import {createProgressSession,ProgressSession,PROGRESS_LOCK} from '../dist/progress-session.mjs';
import {PROGRESS_KEY,PROGRESS_VERSION,MAX_PROGRESS_BYTES,loadProgress,saveProgress} from '../dist/local-progress.mjs';

const empty=()=>({stage:null,selectedActivities:{},states:{}});
const choice=(id='a')=>({stage:'3y',selectedActivities:{},states:{'3y:original':{phase:'active',shapes:new Set([id])}}});
const memory=(initial=null)=>{
 const data=new Map(initial===null?[]:[[PROGRESS_KEY,initial]]),calls=[];
 return {data,calls,getItem(k){calls.push(['get',k]);return data.get(k)??null;},setItem(k,v){calls.push(['set',k,v]);data.set(k,v);},removeItem(k){calls.push(['remove',k]);data.delete(k);}};
};
const wire=value=>{const s=memory();assert.ok(saveProgress(s,value).ok);return s.data.get(PROGRESS_KEY);};
const serialLocks=()=>{
 const queues=new Map(),calls=[];
 return {calls,request(name,options,callback){
  calls.push({name,options});
  const next=(queues.get(name)||Promise.resolve()).then(callback);
  queues.set(name,next.catch(()=>{}));
  return next;
 }};
};
const savedChoices=s=>[...loadProgress(s).snapshot.states['3y:original'].shapes];

test('constructor, synchronous empty inspect/reload, and only one local key',()=>{
 const storage=memory();storage.data.set('unrelated','keep');
 const session=createProgressSession(storage);
 assert.ok(session instanceof ProgressSession);
 assert.equal(storage.calls.length,1);
 assert.deepEqual(session.inspect(),{ok:false,status:'empty',coordination:'optimistic'});
 assert.deepEqual(session.reload(),{ok:false,status:'empty',coordination:'optimistic'});
 assert.deepEqual(session.save(empty()),{ok:true,status:'saved',coordination:'optimistic'});
 assert.deepEqual(session.clear(),{ok:true,status:'cleared',coordination:'optimistic'});
 assert.equal(storage.data.get('unrelated'),'keep');
 assert.ok(storage.calls.every(([,key])=>key===PROGRESS_KEY));
 assert.equal(storage.calls.filter(([operation])=>operation==='remove').length,1);
});

test('inspect/reload return independent snapshots without rewriting valid data',()=>{
 const raw=wire(choice()),storage=memory(raw),session=createProgressSession(storage);
 const first=session.inspect();assert.equal(first.status,'loaded');
 first.snapshot.states['3y:original'].shapes.clear();
 assert.deepEqual([...session.reload().snapshot.states['3y:original'].shapes],['a']);
 assert.equal(storage.data.get(PROGRESS_KEY),raw);
 assert.ok(storage.calls.every(([operation])=>operation==='get'));
});

test('stale tab cannot overwrite or delete another tab; only reload adopts latest',()=>{
 const storage=memory(wire(choice('a'))),a=createProgressSession(storage),b=createProgressSession(storage);
 assert.equal(a.save(choice('b')).status,'saved');const latest=storage.data.get(PROGRESS_KEY);
 assert.deepEqual(b.inspect(),{ok:false,status:'conflict',latestStatus:'loaded',change:'changed',coordination:'optimistic'});
 assert.equal(b.save(choice('c')).status,'conflict');
 assert.equal(b.clear().status,'conflict');
 assert.equal(storage.data.get(PROGRESS_KEY),latest);
 assert.deepEqual([...b.reload().snapshot.states['3y:original'].shapes],['b']);
 assert.equal(b.save(choice('c')).status,'saved');
 assert.deepEqual(savedChoices(storage),['c']);
 assert.equal(a.inspect().status,'conflict');
});

test('external removal blocks stale recreation until explicit load of empty data',()=>{
 const storage=memory(wire(choice())),a=createProgressSession(storage),b=createProgressSession(storage);
 assert.equal(a.clear().status,'cleared');
 assert.deepEqual(b.save(choice('b')),{ok:false,status:'conflict',latestStatus:'empty',change:'removed',coordination:'optimistic'});
 assert.equal(b.clear().status,'conflict');assert.equal(storage.data.has(PROGRESS_KEY),false);
 assert.equal(b.reload().status,'empty');
 assert.equal(b.save(choice('c')).status,'saved');assert.deepEqual(savedChoices(storage),['c']);
});

test('initially empty stale tab cannot replace a newly created record',()=>{
 const storage=memory(),session=createProgressSession(storage),latest=wire(choice('b'));
 storage.data.set(PROGRESS_KEY,latest);
 assert.equal(session.save(empty()).status,'conflict');assert.equal(session.clear().status,'conflict');
 assert.equal(storage.data.get(PROGRESS_KEY),latest);
});

test('raw tokens are compared exactly and observed conflicts remain latched',()=>{
 const raw=wire(empty()),storage=memory(raw),session=createProgressSession(storage);
 storage.data.set(PROGRESS_KEY,` ${raw}`);
 assert.equal(session.inspect().status,'conflict');
 storage.data.set(PROGRESS_KEY,raw);
 assert.equal(session.save(choice()).status,'conflict');
 assert.equal(session.clear().status,'conflict');
 assert.equal(session.reload().status,'loaded');assert.equal(session.save(choice()).status,'saved');
});

test('corrupt, unsupported and oversized data are preserved until explicit clear',()=>{
 for(const [raw,status] of [['{','corrupt'],[JSON.stringify({version:99,snapshot:{}}),'unsupported-version'],[' '.repeat(MAX_PROGRESS_BYTES+1),'too-large']]){
  const storage=memory(raw),session=createProgressSession(storage);
  assert.equal(session.inspect().status,status);assert.equal(session.reload().status,status);
  assert.equal(session.save(empty()).status,status);assert.equal(storage.data.get(PROGRESS_KEY),raw);
  assert.equal(session.clear().status,'cleared');assert.equal(session.save(empty()).status,'saved');
 }
});

test('external corrupt data cannot be cleared by a stale tab without explicit reload',()=>{
 const storage=memory(),session=createProgressSession(storage);
 storage.data.set(PROGRESS_KEY,'broken');
 assert.deepEqual(session.inspect(),{ok:false,status:'conflict',latestStatus:'corrupt',change:'changed',coordination:'optimistic'});
 assert.equal(session.clear().status,'conflict');assert.equal(storage.data.get(PROGRESS_KEY),'broken');
 assert.equal(session.reload().status,'corrupt');assert.equal(session.clear().status,'cleared');
});

test('v1 record stays unchanged on inspect and migrates only after a valid save',()=>{
 const raw=JSON.stringify({version:1,snapshot:{stage:'3y',selectedActivities:{},states:{'3y:original':{phase:'paused',shapes:['a'],plan:[]}}}});
 const storage=memory(raw),session=createProgressSession(storage),restored=session.reload();
 assert.equal(restored.status,'loaded');assert.equal(storage.data.get(PROGRESS_KEY),raw);
 assert.equal(session.save(restored.snapshot).status,'saved');
 assert.equal(JSON.parse(storage.data.get(PROGRESS_KEY)).version,PROGRESS_VERSION);
 assert.deepEqual(savedChoices(storage),['a']);
});

test('invalid snapshot never touches storage or destroys a previous record',()=>{
 const raw=wire(empty()),storage=memory(raw),session=createProgressSession(storage);storage.calls.length=0;
 for(const value of [null,{...empty(),stage:'bad'},{get stage(){throw new Error('bad getter');}}])assert.equal(session.save(value).status,'invalid');
 assert.deepEqual(storage.calls,[]);assert.equal(storage.data.get(PROGRESS_KEY),raw);
});

test('unreadable startup never assumes empty, even when access later recovers',()=>{
 const storage=memory(wire(choice()));const get=storage.getItem;let denied=true;
 storage.getItem=function(key){if(denied)throw new Error('blocked');return get.call(this,key);};
 const session=createProgressSession(storage);assert.equal(session.inspect().status,'unavailable');
 denied=false;const raw=storage.data.get(PROGRESS_KEY);
 assert.equal(session.save(empty()).status,'unavailable');assert.equal(session.clear().status,'unavailable');
 assert.equal(storage.data.get(PROGRESS_KEY),raw);
 assert.equal(session.reload().status,'loaded');assert.equal(session.save(empty()).status,'saved');
});

test('missing storage, denied getters and failed mutation methods return unavailable',()=>{
 for(const storage of [null,{}, {get getItem(){throw new Error('blocked');}}, {getItem:()=>({})}]){
  const session=createProgressSession(storage);
  for(const result of [session.inspect(),session.reload(),session.save(empty()),session.clear()])assert.equal(result.status,'unavailable');
 }
 for(const key of ['setItem','removeItem'])for(const getter of [false,true]){
  const raw=wire(empty()),storage=memory(raw),session=createProgressSession(storage);
  Object.defineProperty(storage,key,getter?{get(){throw new Error('blocked');}}:{value(){throw new Error('quota');}});
  assert.equal((key==='setItem'?session.save(choice()):session.clear()).status,'unavailable');
  assert.equal(storage.data.get(PROGRESS_KEY),raw);
 }
});

test('temporary read or write failure preserves baseline and can be retried',()=>{
 const storage=memory(wire(choice())),session=createProgressSession(storage),get=storage.getItem,set=storage.setItem;
 storage.getItem=()=>{throw Error('read blocked');};
 assert.equal(session.save(choice('b')).status,'unavailable');assert.equal(session.reload().status,'unavailable');
 storage.getItem=get;storage.setItem=()=>{throw Error('full');};
 assert.equal(session.save(choice('b')).status,'unavailable');
 storage.setItem=set;assert.equal(session.save(choice('b')).status,'saved');assert.deepEqual(savedChoices(storage),['b']);
});

test('read-back detects a non-cooperating writer without reverting its data',()=>{
 const storage=memory(),session=createProgressSession(storage),latest=wire(choice('c'));
 storage.setItem=function(key){this.data.set(key,latest);};
 const result=session.save(choice('b'));
 assert.equal(result.status,'conflict');assert.equal(result.latestStatus,'loaded');
 assert.equal(storage.data.get(PROGRESS_KEY),latest);assert.equal(session.clear().status,'conflict');
});

test('failed post-write verification is not reported saved or blindly retried',()=>{
 const storage=memory(),session=createProgressSession(storage),get=storage.getItem;
 storage.setItem=function(key,text){this.data.set(key,text);this.getItem=()=>{throw Error('denied');};};
 assert.equal(session.save(choice()).status,'unavailable');
 storage.getItem=get;
 assert.equal(session.inspect().status,'conflict');assert.equal(session.clear().status,'conflict');
 assert.equal(session.reload().status,'loaded');assert.deepEqual(savedChoices(storage),['a']);
});

test('shared Web Lock serializes simultaneous tabs so exactly one save wins',async()=>{
 const storage=memory(),locks=serialLocks(),a=createProgressSession(storage,{locks}),b=createProgressSession(storage,{locks});
 const first=a.save(choice('a')),second=b.save(choice('b'));
 assert.ok(first instanceof Promise);assert.ok(second instanceof Promise);
 assert.equal(storage.data.has(PROGRESS_KEY),false);
 const results=await Promise.all([first,second]);
 assert.deepEqual(results.map(result=>result.status),['saved','conflict']);
 assert.ok(results.every(result=>result.coordination==='locks'));
 assert.deepEqual(savedChoices(storage),['a']);
 assert.ok(locks.calls.every(call=>call.name===PROGRESS_LOCK&&call.options.mode==='exclusive'));
});

test('locked stale clear cannot delete a newer simultaneous save',async()=>{
 const storage=memory(wire(choice('a'))),locks=serialLocks(),a=createProgressSession(storage,{locks}),b=createProgressSession(storage,{locks});
 const results=await Promise.all([a.save(choice('b')),b.clear()]);
 assert.deepEqual(results.map(result=>result.status),['saved','conflict']);assert.deepEqual(savedChoices(storage),['b']);
});

test('locked removal prevents a simultaneously queued stale save from recreating progress',async()=>{
 const storage=memory(wire(choice())),locks=serialLocks(),a=createProgressSession(storage,{locks}),b=createProgressSession(storage,{locks});
 const results=await Promise.all([a.clear(),b.save(choice('b'))]);
 assert.deepEqual(results.map(result=>result.status),['cleared','conflict']);
 assert.equal(results[1].change,'removed');assert.equal(storage.data.has(PROGRESS_KEY),false);
});

test('queued saves clone at invocation and successive same-tab writes retain order',async()=>{
 const storage=memory(),locks=serialLocks(),session=createProgressSession(storage,{locks}),value=choice('a');
 const first=session.save(value);
 value.states['3y:original'].shapes=new Set(['b']);
 const second=session.save(value);
 value.stage=null;value.states['3y:original'].shapes.clear();
 assert.equal((await first).status,'saved');assert.equal((await second).status,'saved');
 const writes=storage.calls.filter(([operation])=>operation==='set').map(([,key,raw])=>loadProgress({getItem:()=>raw}).snapshot);
 assert.deepEqual(writes.map(v=>[...v.states['3y:original'].shapes]),[['a'],['b']]);
 assert.equal(writes[1].stage,'3y');
});

test('inspect/reload remain synchronous with locks; reload cancels obsolete queued mutations',async()=>{
 const storage=memory(wire(choice())),locks=serialLocks(),session=createProgressSession(storage,{locks});
 assert.equal(session.inspect().status,'loaded');
 const save=session.save(choice('b')),clear=session.clear();
 assert.equal(session.reload().status,'loaded');
 assert.deepEqual((await Promise.all([save,clear])).map(result=>result.status),['superseded','superseded']);
 assert.deepEqual(savedChoices(storage),['a']);
 assert.equal((await session.save(choice('c'))).status,'saved');
});

test('successful locked clear invalidates snapshots queued before the UI resets',async()=>{
 const storage=memory(wire(choice())),locks=serialLocks(),session=createProgressSession(storage,{locks});
 const before=session.save(choice('b')),clear=session.clear(),stale=session.save(choice('c'));
 assert.deepEqual((await Promise.all([before,clear,stale])).map(result=>result.status),['saved','cleared','superseded']);
 assert.equal(storage.data.has(PROGRESS_KEY),false);
 assert.equal((await session.save(choice('a'))).status,'saved');
 assert.deepEqual(savedChoices(storage),['a']);
});

test('lock rejection/throw never silently falls back to an uncoordinated write',async()=>{
 for(const locks of [{request(){return Promise.reject(Error('denied'));}},{request(){throw Error('denied');}},{get request(){throw Error('denied');}}]){
  const storage=memory(wire(choice())),session=createProgressSession(storage,{locks}),raw=storage.data.get(PROGRESS_KEY);
  for(const pending of [session.save(choice('b')),session.clear()]){
   const result=await pending;assert.equal(result.status,'unavailable');assert.equal(result.coordination,'locks');
  }
  assert.equal(storage.data.get(PROGRESS_KEY),raw);assert.ok(storage.calls.every(([operation])=>operation==='get'));
 }
});

test('only codec version and snapshot are persisted, with no lock/session metadata',()=>{
 const storage=memory(),session=createProgressSession(storage);
 assert.equal(session.save(choice()).status,'saved');
 const document=JSON.parse(storage.data.get(PROGRESS_KEY));
 assert.deepEqual(Object.keys(document),['version','snapshot']);
 assert.equal(storage.data.size,1);
 for(const forbidden of ['timestamp','clientId','sessionId','tabId','revision'])assert.equal(storage.data.get(PROGRESS_KEY).includes(forbidden),false);
});
