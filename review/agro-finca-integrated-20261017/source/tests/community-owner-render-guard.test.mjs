import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';

const source=readFileSync(new URL('../components/agro-network.tsx',import.meta.url),'utf8');
const compile=code=>ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const tick=()=>new Promise(resolve=>setImmediate(resolve));

test('anonymous community stays public; once signed in the original boundary survives logout and account prop changes',()=>{
 const begin=source.indexOf('export function AgroNetwork('),end=source.indexOf('\nfunction accountBoundary()',begin);
 let hadAccount;
 function OfflineAccountBoundary(){}
 function AgroNetworkWorkspace(){}
 const exports={};
 vm.runInNewContext(compile(source.slice(begin,end)),{exports,OfflineAccountBoundary,AgroNetworkWorkspace,
  require:()=>({jsx:(type,props)=>({type,props})}),
  useState(initial){if(hadAccount===undefined)hadAccount=initial;return[hadAccount,value=>{hadAccount=value;}];},
 });
 const view=exports.AgroNetwork;
 const anonymous=view({initial:{farms:[],mine:[],posts:[]}});
 assert.equal(anonymous.type,AgroNetworkWorkspace,'anonymous browsing requires no account boundary');
 const signed=view({userId:'owner-a',initial:{farms:[],mine:[],posts:[]}});
 assert.equal(signed.type,OfflineAccountBoundary);assert.equal(signed.props.ownerId,'owner-a');
 assert.equal(signed.props.children.type,AgroNetworkWorkspace);assert.equal(signed.props.children.key,undefined);
 const loggedOut=view({initial:{farms:[],mine:[],posts:[]}});
 assert.equal(loggedOut.type,OfflineAccountBoundary);assert.equal(loggedOut.props.ownerId,null);
 assert.equal(loggedOut.props.children.type,AgroNetworkWorkspace,'same child type preserves the existing form tree');
 const switched=view({userId:'owner-b',initial:{farms:[],mine:[],posts:[]}});
 assert.equal(switched.type,OfflineAccountBoundary);assert.equal(switched.props.ownerId,'owner-b');
 assert.equal(switched.props.children.key,undefined,'an account change must lock instead of remounting away drafts');
});

function pendingHarness(){
 const begin=source.indexOf('  const update=async()=>{'),end=source.indexOf('\n  };',begin)+5;
 assert.ok(begin>0&&end>begin);
 let owner='owner-a',boundary='original',reads=0,release;
 const hold=new Promise(resolve=>{release=resolve;});const writes=[];
 const context={active:true,userId:'owner-a',accountBlockedRef:{current:false},accountBoundary:()=>boundary,localOwner:async()=>owner,
  getCachedEntities:async()=>{reads++;await hold;return[{id:'own',payload:{actingUserId:'owner-a',text:'Own draft'},syncState:'pending'},{id:'other',payload:{actingUserId:'owner-b',text:'Other draft'},syncState:'pending'}];},
  setPending:value=>writes.push(value),
 };
 vm.runInNewContext(compile(source.slice(begin,end).replace('const update=','globalThis.update=')),context);
 return{run:context.update,finish:release,writes,context,owner:value=>{owner=value;},boundary:value=>{boundary=value;},reads:()=>reads};
}

test('own community posts reject late reads after logout, owner change, blocking or effect cleanup',async()=>{
 for(const change of [h=>h.boundary('logged-out'),h=>h.owner('owner-b'),h=>{h.context.accountBlockedRef.current=true;},h=>{h.context.active=false;}]){
  const h=pendingHarness(),job=h.run();await tick();assert.equal(h.reads(),1);
  change(h);h.finish();await job;assert.equal(h.writes.length,0);
 }
});

test('same-owner pending reads retain only own records; blocked and different-account reads never begin',async()=>{
 const h=pendingHarness(),job=h.run();h.finish();await job;
 assert.equal(h.writes.length,1);assert.equal(h.writes[0].owner,'owner-a');
 assert.deepEqual(Array.from(h.writes[0].rows,row=>row.id),['own']);
 const locked=pendingHarness();locked.context.accountBlockedRef.current=true;await locked.run();assert.equal(locked.reads(),0);
 const other=pendingHarness();other.owner('owner-b');await other.run();assert.equal(other.reads(),0);
});

test('account locks pause refresh and mutations and reject late feed responses without deleting drafts',()=>{
 assert.match(source,/const accountBlocked=useOfflineAccountBlocked\(\)/);
 assert.match(source,/async function load\(\)\{if\(accountBlockedRef.current\)return;const boundary=accountBoundary\(\)/);
 assert.match(source,/if\(accountBlockedRef.current\|\|\(userId&&boundary!==accountBoundary\(\)\)\)return/);
 const save=source.slice(source.indexOf(' async function save('),source.indexOf('\n const farms=',source.indexOf(' async function save(')));
 assert.match(save,/if\(accountBlockedRef.current\)return false/);
 assert.match(save,/queueMutation\(\{expectedOwner:userId/);
 assert.match(save,/if\(accountBlockedRef.current\|\|boundary!==accountBoundary\(\)\)return true/);
 assert.doesNotMatch(source,/deleteDatabase|localStorage\.(setItem|removeItem|clear)|location\.reload|setPostText\(''\).*accountBlocked/);
});
