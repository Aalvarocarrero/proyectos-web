import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const parse=text=>{const result=ts.parseConfigFileTextToJson('wrangler.production.jsonc',text);assert.equal(result.error,undefined);return result.config;};
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('future production builds and promotion packaging preserve the approved verified owner pair without credentials',()=>{
 const source=parse(read('wrangler.production.jsonc')),promotion=JSON.parse(read('deployment/wrangler.promotion.json'));
 for(const config of [source,promotion]){
  assert.equal(config.name,'venezuelaagro-staging');assert.equal(config.account_id,'5ce31d22b086645c67dab913699edd3f');assert.equal(config.keep_vars,true);
  assert.equal(config.vars.OWNER_ADMIN_EMAIL,'alvarojuniorcarrerovasquez@gmail.com');assert.equal(config.vars.OWNER_GOOGLE_SUBJECT,'113186509837584939227');
  assert.equal(config.vars.APP_ORIGIN,'https://venezuelaagro.com');assert.equal(config.vars.AUTH_ACCESS_POLICY,'public-production');
  assert.equal(config.d1_databases[0].database_id,'366a6aa3-454c-4f7e-96f6-e0586290811c');assert.equal(config.r2_buckets[0].bucket_name,'venezuelaagro-production-files');
  for(const name of ['GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','AUTH_SESSION_SECRET','TURNSTILE_SECRET_KEY'])assert.ok(!(name in config.vars));
 }
 assert.deepEqual(source.vars,promotion.vars);
 assert.match(read('deployment/verify.mjs'),/OWNER_ADMIN_EMAIL,'alvarojuniorcarrerovasquez@gmail.com'/);
 assert.match(read('deployment/verify.mjs'),/OWNER_GOOGLE_SUBJECT,'113186509837584939227'/);
 assert.match(read('deployment/promotion.sh'),/--keep-vars/);
 assert.doesNotMatch(read('deployment/promotion.sh'),/owner disabled/);
 const stage=read('scripts/stage-production-config.mjs');assert.match(stage,/OWNER_GOOGLE_SUBJECT,'113186509837584939227'/);assert.doesNotMatch(stage,/execSync|spawn\(|fetch\(/);
});
