import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createServer} from 'vite';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(()=>vite.close());
const {farmNumber,validateFarmDateRange,syncOutcomeMessage,canDismissFarmDraft,needsFarmAccountCheck}=await vite.ssrLoadModule('/lib/farm-workflow-validation.ts');
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
test('offline record numbers reject negative, NaN and overflowing values before creating mutations',()=>{
 for(const value of ['-1','NaN','Infinity','1e999','abc']) assert.throws(()=>farmNumber(value,'el peso'),/^Error: Revisa:/);
 assert.equal(farmNumber('12.35','el peso'),12.35);
 assert.equal(farmNumber(null,'el mínimo'),0);
 assert.equal(farmNumber('0','el inventario'),0);
 assert.throws(()=>farmNumber('0','el peso',0.01),/mayor que cero/);
 assert.equal(farmNumber('0.01','el peso',0.01),0.01);
});
test('production date range permits open-ended and same-day cycles, rejecting reversed dates',()=>{
 for(const dates of [['',''],['2026-10-12',''],['','2026-11-01'],['2026-10-12','2026-10-12'],['2026-10-12','2027-01-01']]) assert.doesNotThrow(()=>validateFarmDateRange(...dates));
 assert.throws(()=>validateFarmDateRange('2026-10-12','2026-10-11'),/cierre no puede ser anterior/);
});
test('sync outcomes give distinct recovery guidance without claiming a central backup',()=>{
 assert.match(syncOutcomeMessage('account_changed'),/Abre tu cuenta/);
 for(const reason of ['offline','network']) assert.match(syncOutcomeMessage(reason),/vuelve a intentar/);
 for(const reason of ['server','invalid_response']) assert.match(syncOutcomeMessage(reason),/no confirmó el respaldo/);
 assert.match(syncOutcomeMessage('more_pending'),/Quedan cambios/);
 assert.match(syncOutcomeMessage('conflict'),/necesitan revisión/);
});
test('onboarding is gated by local load and sync attempt, and storage errors offer safe retry',async()=>{
 const source=await read('components/farm-dashboard.tsx');
 assert.match(source,/initialReady && \(!farm \?/);
 assert.match(source,/No crees otra finca ni borres los datos del navegador/);
 assert.match(source,/setLoadAttempt\(value=>value\+1\)/);
 assert.match(source,/if \(syncInFlight.current\) return/);
 assert.match(source,/if \(!result.ok\) setSyncError/);
 assert.doesNotMatch(source,/"Todo guardado"/);
 assert.match(source,/farmRecords.filter\(\(record\) => record.payload.recordType === "animal"/);
});
test('all seven entry dialogs protect unsaved edits and keep explicit cancel plus unload recovery',async()=>{
 const dashboard=await read('components/farm-dashboard.tsx'),intelligence=await read('components/farm-intelligence.tsx'),form=await read('components/farm-record-form.tsx');
 assert.equal((dashboard.match(/<FarmDraftDialog open=\{open\}/g)||[]).length,5);
 assert.equal((intelligence.match(/<FarmDraftDialog open=\{open\}/g)||[]).length,2);
 assert.match(form,/canDismissFarmDraft\(draft.current,/);
 assert.match(form,/onInputCapture=\{markEdited\} onChangeCapture=\{markEdited\}/);
 assert.match(form,/addEventListener\("beforeunload",warn\)/);
 assert.match(form,/removeEventListener\("beforeunload",warn\)/);
 assert.match(form,/dirty.current=false/);
 assert.match(form,/>Cancelar<\/Button>/);
});

test('draft dismissal preserves edits on Cancel and never closes during a write',()=>{
 let confirmations=0;const no=()=>{confirmations++;return false;};
 assert.equal(canDismissFarmDraft({busy:true,dirty:true},no),false);
 assert.equal(confirmations,0);
 assert.equal(canDismissFarmDraft({busy:false,dirty:false},no),true);
 assert.equal(confirmations,0);
 assert.equal(canDismissFarmDraft({busy:false,dirty:true},no),false);
 assert.equal(confirmations,1);
 assert.equal(canDismissFarmDraft({busy:false,dirty:true},()=>true),true);
});

test('unknown empty account cannot offer creation; verified empty account and deliberate device workspace can',async()=>{
 const empty={localOnly:false,hasFarm:false,owner:'account-a',checkedOwner:null};
 assert.equal(needsFarmAccountCheck(empty),true);
 assert.equal(needsFarmAccountCheck({...empty,checkedOwner:'account-b'}),true);
 assert.equal(needsFarmAccountCheck({...empty,checkedOwner:'account-a'}),false);
 assert.equal(needsFarmAccountCheck({...empty,hasFarm:true}),false);
 assert.equal(needsFarmAccountCheck({...empty,localOnly:true,owner:'device-local'}),false);
 const source=await read('components/farm-dashboard.tsx');
 assert.match(source,/!farm \? \(needsAccountCheck \?/);
 assert.match(source,/if\(needsAccountCheck\)throw new Error/);
 assert.match(source,/No pudimos comprobar si ya tienes una finca en tu cuenta/);
 assert.match(source,/href="\/app-local"[^>]*>Continuar solo en este dispositivo/);
 assert.match(source,/espacio local separado que no se envía a tu cuenta/);
});
