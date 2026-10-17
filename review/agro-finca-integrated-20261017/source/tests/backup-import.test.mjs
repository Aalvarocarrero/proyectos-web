import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,watch:null}});
const {parseLocalBackup,MAX_BACKUP_BYTES}=await vite.ssrLoadModule('/lib/backup-import.ts');
after(()=>vite.close());
const backup=()=>({format:'venezuela-agro-local-backup',version:1,exportedAt:'2026-10-06T00:00:00Z',origin:'https://old.invalid',owner:'account-a',entities:[{key:'farm-record:a',id:'a',entityType:'farm-record',payload:{farmId:'farm_test',recordType:'animal',category:'Bovino',title:'Animal',data:{weight:100}},updatedAt:'2026-10-06T00:00:00Z',syncState:'pending'}],outbox:[],meta:[]});
test('accepts the versioned backup format without executing embedded text',()=>{const b=backup();b.entities[0].payload.title='<script>never execute</script>';assert.equal(parseLocalBackup(JSON.stringify(b)).entities.length,1);});
test('rejects unknown formats, versions, types, dates, keys and duplicate entities before writes',()=>{
 for(const change of [b=>b.version=9,b=>b.format='other',b=>b.entities[0].entityType='account',b=>b.entities[0].updatedAt='bad',b=>b.entities[0].key='farm-record:other',b=>b.entities.push(b.entities[0]),b=>b.outbox=[{id:'x',entityType:'cart',entityId:'a',action:'upsert',payload:{},clientUpdatedAt:'2026-10-06'}]]){const b=backup();change(b);assert.throws(()=>parseLocalBackup(JSON.stringify(b)));}
});
test('rejects prototype pollution keys recursively and leaves object prototypes untouched',()=>{
 for(const key of ['__proto__','prototype','constructor']){const b=backup();const json=JSON.stringify(b).replace('"title":"Animal"',`"title":"Animal","nested":{"${key}":{"polluted":true}}`);assert.throws(()=>parseLocalBackup(json),/insegura/);}
 assert.equal({}.polluted,undefined);
});
test('bounds bytes, depth, array sizes and malformed JSON',()=>{
 assert.throws(()=>parseLocalBackup('{broken'));
 assert.throws(()=>parseLocalBackup(' '.repeat(MAX_BACKUP_BYTES+1)),/15 MB/);
 const b=backup();let nested={};b.entities[0].payload.data=nested;for(let i=0;i<30;i++){nested.child={};nested=nested.child;}assert.throws(()=>parseLocalBackup(JSON.stringify(b)),/límites/);
 const oversized=backup();oversized.outbox=Array(20001).fill({});assert.throws(()=>parseLocalBackup(JSON.stringify(oversized)));
});

test('rejects malformed render-critical entity and upsert payloads before persistence',()=>{
 for(const patch of [{title:{bad:true}},{data:null},{recordType:'unrecognized'},{farmId:null}]){const b=backup();Object.assign(b.entities[0].payload,patch);assert.throws(()=>parseLocalBackup(JSON.stringify(b)),/incompatibles/);}
 const b=backup();b.outbox=[{id:'bad-operation',entityType:'farm-record',entityId:'x',action:'upsert',payload:{recordType:'animal',title:{bad:true},data:null},clientUpdatedAt:'2026-10-06T00:00:00Z'}];assert.throws(()=>parseLocalBackup(JSON.stringify(b)),/incompatibles/);
});
