import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({root,configFile:false,appType:'custom',resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});after(()=>vite.close());
const {parseAuthConfig}=await vite.ssrLoadModule('/lib/auth/config.ts');
const {issueCsrf,verifyCsrf}=await vite.ssrLoadModule('/lib/auth/csrf.ts');
const {verifyTurnstile}=await vite.ssrLoadModule('/lib/auth/turnstile.ts');
const env={AUTH_MODE:'google',APP_ORIGIN:'https://staging.example.test',GOOGLE_CLIENT_ID:'fake-client',GOOGLE_CLIENT_SECRET:'synthetic-client-secret',AUTH_SESSION_SECRET:'a'.repeat(64),TURNSTILE_SITE_KEY:'synthetic-site',TURNSTILE_SECRET_KEY:'synthetic-turnstile',STAGING_ALLOWED_EMAILS:'tester@example.test'};
const config=parseAuthConfig(env);
test('configuration fails closed without exact HTTPS origin, secrets or private allowlist',()=>{
 for(const key of Object.keys(env))assert.throws(()=>parseAuthConfig({...env,[key]:''}));
 for(const origin of ['http://staging.example.test','https://staging.example.test/','https://bad.test/path','https://user@bad.test'])assert.throws(()=>parseAuthConfig({...env,APP_ORIGIN:origin}));
 assert.throws(()=>parseAuthConfig({...env,STAGING_ALLOWED_EMAILS:'*'}));assert.throws(()=>parseAuthConfig({...env,AUTH_MODE:'sites'}));
});
test('CSRF is same origin, signed, cookie matched and bound to current session',async()=>{
 const issued=await issueCsrf(new Request(config.origin),config);
 const headers={'origin':config.origin,'cookie':issued.cookie.split(';')[0],'x-csrf-token':issued.token};
 const req=(overrides={})=>new Request(config.origin+'/api/sync',{method:'POST',headers:{...headers,...overrides}});
 assert.equal(await verifyCsrf(req(),config),true);
 assert.equal(await verifyCsrf(req({'origin':'https://evil.test'}),config),false);
 assert.equal(await verifyCsrf(req({'origin':''}),config),false);
 assert.equal(await verifyCsrf(req({'sec-fetch-site':'cross-site'}),config),false);
 assert.equal(await verifyCsrf(req({'x-csrf-token':issued.token+'x'}),config),false);
 assert.equal(await verifyCsrf(req({'cookie':headers.cookie+'; __Host-va_session=new-session'}),config),false);
 const reused=await issueCsrf(new Request(config.origin,{headers:{cookie:headers.cookie}}),config);assert.equal(reused.token,issued.token);
});
test('Turnstile rejects failed, wrong host/action, oversized and unreachable verification',async()=>{
 const valid={success:true,hostname:'staging.example.test',action:'login'};
 const transport=result=>async()=>Response.json(result);
 assert.equal(await verifyTurnstile('token',config,transport(valid)),true);
 for(const bad of [{...valid,success:false},{...valid,hostname:'evil.test'},{...valid,action:'signup'},{}])assert.equal(await verifyTurnstile('token',config,transport(bad)),false);
 assert.equal(await verifyTurnstile('x'.repeat(2049),config,transport(valid)),false);
 assert.equal(await verifyTurnstile('token',config,async()=>{throw Error('network')}),false);
});
test('standalone edge strips Sites identity and protects mutation routes; standalone bootstrap does not provision',async()=>{
 const worker=await readFile(root+'worker/index.ts','utf8');
 assert.match(worker,/startsWith\("oai-authenticated-"\)/);assert.match(worker,/sanitized.delete\(key\)/);assert.match(worker,/await verifyCsrf\(request,config\)/);assert.match(worker,/await getSession/);
 const auth=await readFile(root+'app/chatgpt-auth.ts','utf8');assert.ok(auth.indexOf('deploymentTarget() === "standalone"')<auth.indexOf('requestHeaders.get(USER_ID_HEADER)'));
 const bootstrap=await readFile(root+'app/api/bootstrap/route.ts','utf8');assert.match(bootstrap,/deploymentTarget\(\) === "sites"\) await db/);
});

test('standalone denies implicit email admin grants and noncanonical route encodings',async()=>{
 const admin=await readFile(root+'lib/admin-access.ts','utf8');assert.match(admin,/if \(isStandaloneAuth\(\)\) return !!user\?\.id && user\.googleOwnerAdmin === true/);
 const worker=await readFile(root+'worker/index.ts','utf8');assert.match(worker,/decodeURIComponent\(url.pathname\) !== url.pathname/);assert.match(worker,/if \(!\["GET","HEAD","OPTIONS"\].includes\(request.method\)/);
 assert.match(worker,/if \(!response.headers.has\("referrer-policy"\)\)/);
 const {siteContentSecurityPolicy}=await vite.ssrLoadModule('/lib/site-content-security.ts');
 assert.match(siteContentSecurityPolicy(new URL(config.origin+'/auth/signin')),/form-action 'self' mailto: https:\/\/accounts.google.com;/);
 assert.doesNotMatch(siteContentSecurityPolicy(new URL(config.origin+'/')),/accounts.google.com/);
});

test('public production requires explicit mode and exact production origin; owner grant defaults empty',()=>{
 assert.equal(parseAuthConfig(env).accessPolicy,'private-staging');
 assert.throws(()=>parseAuthConfig({...env,STAGING_ALLOWED_EMAILS:undefined}));
 const production={...env,AUTH_ACCESS_POLICY:'public-production',APP_ORIGIN:'https://venezuelaagro.com',STAGING_ALLOWED_EMAILS:undefined};
 const parsed=parseAuthConfig(production);assert.equal(parsed.ownerAdmin,undefined);assert.deepEqual(parsed.allowedEmails,[]);
 for(const bad of [{AUTH_ACCESS_POLICY:'public'},{APP_ORIGIN:env.APP_ORIGIN},{OWNER_ADMIN_EMAIL:'owner@example.test'},{OWNER_GOOGLE_SUBJECT:'12345'},{OWNER_ADMIN_EMAIL:'*',OWNER_GOOGLE_SUBJECT:'12345'}])assert.throws(()=>parseAuthConfig({...production,...bad}));
 assert.deepEqual(parseAuthConfig({...production,OWNER_ADMIN_EMAIL:' Owner@Example.test ',OWNER_GOOGLE_SUBJECT:'12345'}).ownerAdmin,{email:'owner@example.test',subject:'12345'});
 assert.throws(()=>parseAuthConfig({...env,OWNER_ADMIN_EMAIL:'owner@example.test',OWNER_GOOGLE_SUBJECT:'12345'}),'staging cannot acquire an owner grant');
});

test('staging compiled policy refuses a production runtime opt-in',async()=>{
 const server=await createServer({root,configFile:false,appType:'custom',define:{__AUTH_ACCESS_POLICY__:JSON.stringify('private-staging')},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
 try{const mod=await server.ssrLoadModule('/lib/auth/config.ts');assert.throws(()=>mod.parseAuthConfig({...env,AUTH_ACCESS_POLICY:'public-production',APP_ORIGIN:'https://venezuelaagro.com'}),/auth_build_policy_mismatch/);}finally{await server.close();}
});
test('offline document cache exemptions have no server identity imports',async()=>{
 const {isAccountAgnosticPage}=await vite.ssrLoadModule('/lib/auth/route-policy.ts');
 const files=['app/layout.tsx','app/page.tsx','app/app-local/page.tsx','app/offline/page.tsx','app/biblioteca-local/page.tsx','app/finca-demo/page.tsx','app/finca-modelo/page.tsx','app/modelos-finca/page.tsx','app/juego-finca/page.tsx','app/tienda/page.tsx','app/plataforma/page.tsx','app/aprende/page.tsx','app/aprende/[slug]/page.tsx','app/stickers/page.tsx','app/rubros/page.tsx','app/nosotros/page.tsx','app/guia-institucional/page.tsx','app/creditos-fotograficos/page.tsx','app/legal/privacidad/page.tsx','app/legal/terminos/page.tsx','app/legal/comercio/page.tsx'];
 for(const file of files)assert.doesNotMatch(await readFile(root+file,'utf8'),/getChatGPTUser|requireChatGPTUser|next\/headers/,file);
 for(const path of ['/app','/admin','/marketplace','/profesionales','/red','/api/bootstrap'])assert.equal(isAccountAgnosticPage(path),false);
});
