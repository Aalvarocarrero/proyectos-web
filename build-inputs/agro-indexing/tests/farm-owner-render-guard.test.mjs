import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync(new URL('../components/farm-dashboard.tsx',import.meta.url),'utf8');
const start=source.indexOf('  const loadLocal = useCallback(async () => {');
const end=source.indexOf('  }, []);',start)+10;
const code=ts.transpileModule(source.slice(start,end).replace('const loadLocal =','globalThis.loadLocal ='),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
function harness(){
 let owner='owner-a',boundary='first',reads=0;const writes=[];let complete;
 const held=new Promise(resolve=>complete=resolve);const blocked={current:false};const context={};
 const names=['globalThis','useCallback','accountBlockedRef','workspaceOwnerRef','window','localOwner','getCachedEntities','getPendingCount','getLastSync','setFarms','setRecords','setListings','setPending','setLastSync'];
 new Function(...names,code)(context,f=>f,blocked,{current:'owner-a'},{localStorage:{getItem:()=>boundary}},async()=>owner,async()=>{reads++;await held;return [{ownerId:owner}];},async()=>0,async()=>null,...Array.from({length:5},()=>value=>writes.push(value)));
 return {run:context.loadLocal,finish:()=>complete(),writes,blocked,owner:v=>owner=v,boundary:v=>boundary=v,reads:()=>reads};
}
test('private rendered arrays reject late reads after a session boundary or owner change',async()=>{
 for(const change of [h=>h.boundary('second'),h=>h.owner('owner-b'),h=>h.blocked.current=true]){
  const h=harness(),pending=h.run();await Promise.resolve();change(h);h.finish();await pending;assert.equal(h.writes.length,0);
 }
});
test('same-account reads still populate and blocked views do not begin a read',async()=>{
 const h=harness(),pending=h.run();h.finish();await pending;assert.equal(h.writes.length,5);
 const locked=harness();locked.blocked.current=true;await locked.run();assert.equal(locked.reads(),0);assert.equal(locked.writes.length,0);
});
test('account boundary wraps the whole workspace, retains form component state, and resolves local workspace identity',()=>{
 assert.match(source,/<OfflineAccountBoundary ownerId=\{owner\}/);
 assert.match(source,/<FarmDashboardWorkspace \{\.\.\.props\} onWorkspaceOwner=\{setWorkspaceOwner\}/);
 assert.match(source,/workspaceOwnerRef.current = selectedOwner/);
 assert.match(source,/if \(syncInFlight.current \|\| accountBlockedRef.current\) return/);
});
