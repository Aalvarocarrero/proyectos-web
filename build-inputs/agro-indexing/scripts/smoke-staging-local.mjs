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
assert.equal(built.name,'venezuelaagro-staging');
assert.equal(built.assets.run_worker_first,true);
assert.equal(built.assets.binding,'ASSETS');
const {workerOptions,main,externalWorkers}=unstable_getMiniflareWorkerOptions(configPath);
const origin=built.vars.APP_ORIGIN;
const secret='synthetic-local-only-secret-'.repeat(3);
const runtimeDate=process.env.STAGING_LOCAL_COMPATIBILITY_DATE??built.compatibility_date;
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
    bindings:{...workerOptions.bindings,GOOGLE_CLIENT_ID:'synthetic-client',GOOGLE_CLIENT_SECRET:'synthetic-client-secret',AUTH_SESSION_SECRET:secret,TURNSTILE_SECRET_KEY:'synthetic-turnstile',STAGING_ALLOWED_EMAILS:'tester@example.test'},
    outboundService:()=>new Response('External providers disabled in local smoke test',{status:503}),
  },...externalWorkers],
});
try {
  const request=(pathname,init={})=>mf.dispatchFetch(origin+pathname,{redirect:'manual',...init});
  for(const pathname of ['/','/learning/finca-escuela.html','/revision-precios.html','/offline-assets.json']){
    const result=await request(pathname,{headers:{'oai-authenticated-user-email':'tester@example.test','oai-authenticated-user-id':'forged'}});
    assert.equal(result.status,302,pathname);
    assert.equal(result.headers.get("cache-control"),"private, no-store",pathname);
    assert.ok(result.headers.get('location').startsWith('/auth/signin?return_to='),pathname);
    await result.text();
  }
  assert.equal((await request('/api/bootstrap')).status,401);
  const signIn=await request('/auth/signin');
  assert.equal(signIn.status,200);
  assert.match(await signIn.text(),/Entra con tu cuenta de Google/);
  const css=readdirSync(path.join(root,'dist/client/assets')).find(name=>name.endsWith('.css'));
  const style=await request('/assets/'+css);
  assert.equal(style.status,200,'login stylesheet must be served without a session');
  assert.match(style.headers.get('content-type'),/text\/css/);
  await style.text();
  const db=await mf.getD1Database('DB');
  for(const name of readdirSync(path.join(root,'drizzle')).filter(name=>name.endsWith('.sql')).sort()){
    for(const statement of readFileSync(path.join(root,'drizzle',name),'utf8').split('--> statement-breakpoint').map(value=>value.trim()).filter(Boolean))await db.prepare(statement).run();
  }
  const now=Date.now(),token=randomBytes(32).toString('base64url');
  const tokenHash=createHmac('sha256',secret).update('session\0'+token).digest('hex');
  await db.batch([
    db.prepare('INSERT INTO users (id,email,display_name,created_at,updated_at) VALUES (?,?,?,?,?)').bind('synthetic-tester','tester@example.test','Synthetic tester','local','local'),
    db.prepare('INSERT INTO auth_identities (provider,subject,user_id,created_at) VALUES (?,?,?,?)').bind('google','synthetic-google-subject','synthetic-tester','local'),
    db.prepare('INSERT INTO auth_sessions (token_hash,user_id,created_at,last_seen_at,expires_at) VALUES (?,?,?,?,?)').bind(tokenHash,'synthetic-tester',now,now,now+60000),
  ]);
  const headers={cookie:'__Host-va_session='+token};
  assert.equal((await request('/api/admin',{headers})).status,403,'tester access never grants administration');
  assert.equal((await request('/api/admin/home-content',{headers})).status,403,'CMS is disabled until owner administration is approved');
  for(const pathname of ['/learning/finca-escuela.html','/revision-precios.html','/offline-assets.json']){
    let result=await request(pathname,{headers});
    if([301,307,308].includes(result.status)){
      const target=new URL(result.headers.get('location'),origin);
      assert.equal(target.origin,origin);
      result=await request(target.pathname+target.search,{headers});
    }
    assert.equal(result.status,200,'authenticated static asset: '+pathname);
    await result.text();
  }
  assert.equal((await request('/api/sync',{method:'POST',headers,body:'{}'})).status,403,'mutation requires CSRF');
  await db.prepare('DELETE FROM auth_sessions').run();
  assert.equal((await request('/offline-assets.json',{headers})).status,302,'revoked session denied');
  console.log('PASS: compiled standalone Worker, forged Sites headers, login/CSS, gated static HTML, ten local migrations, authenticated assets, CSRF and revoked-session denial.');
  console.log('Synthetic-only local runtime; Google, Turnstile and remote Cloudflare were not contacted.');
} finally {await mf.dispose();}
