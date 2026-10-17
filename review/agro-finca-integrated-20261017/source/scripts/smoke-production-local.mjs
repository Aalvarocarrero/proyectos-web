// Local-only compiled-Worker acceptance. Synthetic credentials and ephemeral D1/R2.
// Outbound provider traffic is explicitly disabled. Does not inspect remote state.
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHmac,randomBytes} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Miniflare} from 'miniflare';
import {unstable_getMiniflareWorkerOptions} from 'wrangler';

const root=fileURLToPath(new URL('..',import.meta.url));
const configPath=path.join(root,'dist/server/wrangler.json');
const built=JSON.parse(readFileSync(configPath,'utf8'));
assert.equal(built.vars.AUTH_ACCESS_POLICY,'public-production');
assert.equal(built.vars.APP_ORIGIN,'https://venezuelaagro.com');
assert.equal(built.workers_dev,false);
assert.equal(built.assets.run_worker_first,true);
assert.equal(built.assets.binding,'ASSETS');
const {workerOptions,main,externalWorkers}=unstable_getMiniflareWorkerOptions(configPath);
const origin=built.vars.APP_ORIGIN;
const secret='synthetic-local-only-secret-'.repeat(3);
const runtimeDate=process.env.PRODUCTION_LOCAL_COMPATIBILITY_DATE??built.compatibility_date;
if(runtimeDate!==built.compatibility_date)console.log(`Local runtime compatibility override: ${runtimeDate}; deployment artifact remains ${built.compatibility_date}. This is not exact-runtime parity.`);
const serverDirectory=path.dirname(main);
const modules=[main,...readdirSync(serverDirectory,{recursive:true}).filter(name=>/\.(?:js|mjs)$/.test(name)).map(name=>path.join(serverDirectory,name)).filter(name=>name!==main)];
const mf=new Miniflare({
  cf:false,
  workers:[{
    ...workerOptions,
    compatibilityDate:runtimeDate,
    modules:modules.map(filename=>({type:'ESModule',path:filename})),
    modulesRoot:serverDirectory,
    bindings:{...workerOptions.bindings,GOOGLE_CLIENT_ID:'synthetic-client',GOOGLE_CLIENT_SECRET:'synthetic-client-secret',AUTH_SESSION_SECRET:secret,TURNSTILE_SITE_KEY:'synthetic-site',TURNSTILE_SECRET_KEY:'synthetic-turnstile',OWNER_ADMIN_EMAIL:'owner@example.test',OWNER_GOOGLE_SUBJECT:'synthetic-owner'},
    outboundService:()=>new Response('External providers disabled in local smoke test',{status:503}),
  },...externalWorkers],
});
try {
  const request=(pathname,init={})=>mf.dispatchFetch(origin+pathname,{redirect:'manual',...init});
  const db=await mf.getD1Database('DB');
  // Ephemeral test-only schema. Never connects to or migrates an external database.
  for(const name of readdirSync(path.join(root,'drizzle')).filter(name=>name.endsWith('.sql')).sort())
    for(const statement of readFileSync(path.join(root,'drizzle',name),'utf8').split('--> statement-breakpoint').map(value=>value.trim()).filter(Boolean))await db.prepare(statement).run();
  for(const pathname of ['/','/app-local','/api/marketplace','/api/companies','/api/offline-public','/offline-assets.json','/offline-library-assets.json','/auth/signin']){
    const result=await request(pathname,{headers:{'oai-authenticated-user-id':'owner','oai-authenticated-user-email':'owner@example.test'}});
    assert.equal(result.status,200,pathname);assert.match(result.headers.get('x-robots-tag'),/noindex/,pathname);
    const body=await result.text();if(pathname==='/')assert.match(body,/<link[^>]*rel="canonical"[^>]*href="https:\/\/venezuelaagro\.com\/?"/);
  }
  for(const pathname of ['/api/bootstrap','/api/sync','/api/admin','/api/admin/home-content','/api/companies?mine=1'])assert.equal((await request(pathname)).status,401,pathname);
  for(const pathname of ['/app','/admin','/revision-precios.html'])assert.equal((await request(pathname)).status,302,pathname);
  assert.equal((await mf.dispatchFetch('https://wrong.example/',{redirect:'manual'})).status,403);
  const headersByUser={};
  for(const user of ['owner','ordinary']){
    const now=Date.now(),token=randomBytes(32).toString('base64url');
    const tokenHash=createHmac('sha256',secret).update('session\0'+token).digest('hex');
    await db.batch([
      db.prepare('INSERT INTO users (id,email,display_name,created_at,updated_at) VALUES (?,?,?,?,?)').bind(user,user+'@example.test',user,'local','local'),
      db.prepare('INSERT INTO auth_identities (provider,subject,user_id,created_at) VALUES (?,?,?,?)').bind('google','synthetic-'+user,user,'local'),
      db.prepare('INSERT INTO auth_sessions (token_hash,user_id,created_at,last_seen_at,expires_at) VALUES (?,?,?,?,?)').bind(tokenHash,user,now,now,now+60000),
    ]);
    headersByUser[user]={cookie:'__Host-va_session='+token};
  }
  const ordinary=headersByUser.ordinary,owner=headersByUser.owner;
  for(const pathname of ['/api/admin','/api/admin/home-content','/admin'])assert.equal((await request(pathname,{headers:ordinary})).status,403,pathname);
  const account=await request('/api/account-menu',{headers:owner});assert.equal(account.status,200);assert.equal((await account.json()).canAdmin,true);
  assert.equal((await request('/api/account-menu',{headers:ordinary})).status,200);
  const home=await request('/api/admin/home-content',{headers:owner});assert.equal(home.status,200);const document=await home.json();
  assert.equal((await request('/api/admin/home-content',{method:'POST',headers:owner,body:'{}'})).status,403,'missing CSRF');
  const proof=await request('/api/auth/csrf',{headers:owner});const csrf=await proof.json();
  const csrfCookie=proof.headers.get('set-cookie').split(';')[0];
  const writeHeaders={...owner,cookie:owner.cookie+'; '+csrfCookie,origin,'content-type':'application/json','x-csrf-token':csrf.token};
  const saved=await request('/api/admin/home-content',{method:'POST',headers:writeHeaders,body:JSON.stringify({action:'save',expectedRevision:document.revision,content:document.content})});assert.equal(saved.status,200);const savedBody=await saved.json();
  const published=await request('/api/admin/home-content',{method:'POST',headers:writeHeaders,body:JSON.stringify({action:'publish',expectedRevision:savedBody.revision})});assert.equal(published.status,200);
  for(const headers of [{},owner]){
    const manifest=await request('/offline-library-assets.json',{headers});assert.equal(manifest.status,200);assert.ok(!/private|no-store/.test(manifest.headers.get('cache-control')||''));
    const data=await manifest.json();assert.equal(data.version,1);assert.ok(data.assets.length>0);assert.ok(data.assets.every(asset=>typeof asset.path==='string'&&!asset.path.startsWith('/api/')&&Number.isFinite(asset.bytes)));
    assert.equal((await request('/offline-library-assets.json',{method:'HEAD',headers})).status,200);
    for(const asset of data.assets){
      const result=await request(asset.path,{method:'HEAD',headers});assert.equal(result.status,200,asset.path);assert.ok(!/private|no-store/.test(result.headers.get('cache-control')||''),'library asset must be cacheable: '+asset.path);
    }
    for(const pathname of new Set([...data.pages,'/aprende','/finca-demo','/offline','/app-local'])){
      const result=await request(pathname,{headers});assert.equal(result.status,200,pathname);assert.ok(!/private|no-store/.test(result.headers.get('cache-control')||''),'offline document must be cacheable: '+pathname);
    }
  }
  const localShell=await request('/app-local',{headers:owner});assert.equal(localShell.status,200);assert.ok(!/private|no-store/.test(localShell.headers.get('cache-control')||''),'account-agnostic shell still supports offline download after login');
  assert.equal((await request('/api/bootstrap',{headers:owner})).headers.get('cache-control'),'private, no-store');
  assert.equal((await request('/api/account-menu',{headers:{cookie:owner.cookie+'; '+owner.cookie}})).status,401,'ambiguous session cookie rejected at edge');
  await db.prepare('UPDATE auth_sessions SET expires_at=0').run();
  assert.equal((await request('/api/admin',{headers:owner})).status,401);
  console.log('PASS: compiled production Worker; public browsing/local shell; canonical/noindex; spoofed headers; protected/private APIs; owner-only CMS save/publish; CSRF; duplicate cookies; expiry.');
  console.log('Synthetic-only ephemeral D1 and disabled outbound providers; no deployment or live integration claim.');
} finally {await mf.dispose();}
