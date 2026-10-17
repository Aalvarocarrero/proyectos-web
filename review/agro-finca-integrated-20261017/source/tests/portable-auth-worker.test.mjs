import test,{after} from 'node:test';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({root,configFile:false,appType:'custom',server:{middlewareMode:true,hmr:false,ws:false,watch:null}});after(()=>vite.close());
const {isAccountAgnosticPage,isAdminPath,isPublicProductionRequest}=await vite.ssrLoadModule('/lib/auth/route-policy.ts');
const {cookieValue}=await vite.ssrLoadModule('/lib/auth/csrf.ts');
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const source=(await readFile(new URL('../worker/index.ts',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace('export default worker;','return worker;');
const compiled=ts.transpile(source,{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext});
function fixture(policy="private-staging", responseInit={}){
 let session=null,csrf=false,calls=[];
 const config={origin:'https://app.example',accessPolicy:policy};
 const handler={fetch:async(request)=>{calls.push(request);return new Response('ok',{...responseInit,headers:{'referrer-policy':'no-referrer',...responseInit.headers}})}};
 const names=['isAccountAgnosticPage','isAdminPath','isPublicProductionRequest','deploymentTarget','parseAuthConfig','cookieValue','verifyCsrf','getSession','siteContentSecurityPolicy','responseMustRemainNoindex','handleImageOptimization','DEFAULT_DEVICE_SIZES','DEFAULT_IMAGE_SIZES','handler'];
 const worker=new Function(...names,compiled)(isAccountAgnosticPage,isAdminPath,isPublicProductionRequest,()=> 'standalone',()=>config,cookieValue,async()=>csrf,async()=>session,()=>"default-src 'self'",()=>true,()=>new Response('image'),[],[],handler);
 return {setSession(value){session=value},setCsrf(value){csrf=value},calls,fetch(path,method='GET',extraHeaders={}){return worker.fetch(new Request(config.origin+path,{method,headers:{'oai-authenticated-user-id':'spoofed','oai-authenticated-user-email':'admin@example.test',...extraHeaders}}),{DB:{},ASSETS:{fetch:async(request)=>new Response('static asset',{status:/^\/(?:assets\/|learning\/|offline-(?:library-)?assets\.json)/.test(new URL(request.url).pathname)?200:404})}},{waitUntil(){}})}};
}
test('Worker refuses forged Sites headers and every unsafe unverified method',async()=>{
 const f=fixture();assert.equal((await f.fetch('/api/sync','POST')).status,401);assert.equal(f.calls.length,0);
 f.setSession({id:'verified'});
 for(const path of ['/api/sync','/anything'])assert.equal((await f.fetch(path,'POST')).status,403);
 for(const path of ['/%61pi/sync','/api/%73ync','/auth/%73ignin'])assert.equal((await f.fetch(path,'POST')).status,400);
 assert.equal(f.calls.length,0);
 f.setCsrf(true);assert.equal((await f.fetch('/api/sync','POST')).status,200);assert.equal(f.calls[0].headers.get('oai-authenticated-user-id'),null);assert.equal(f.calls[0].headers.get('oai-authenticated-user-email'),null);
});
test('Worker keeps callback no-referrer and private pages no-store without breaking offline shell',async()=>{
 const f=fixture();f.setSession({id:'verified'});
 assert.equal((await f.fetch('/api/auth/google/callback')).headers.get('referrer-policy'),'no-referrer');
 assert.equal((await f.fetch('/app')).headers.get('cache-control'),'private, no-store');
 assert.equal((await f.fetch('/app-local')).headers.get('cache-control'),null);
 assert.equal((await f.fetch('/offline-assets.json')).headers.get('cache-control'),null);
 f.setSession(null);assert.equal((await f.fetch('/')).headers.get('cache-control'),'private, no-store');
});

test('standalone gates static documents and downloads before handing them to the asset service',async()=>{
 const f=fixture();
 for(const path of ['/learning/finca-escuela.html','/revision-precios.html','/offline-assets.json','/stickers/collection.zip']){
  const response=await f.fetch(path);assert.equal(response.status,302,path);assert.ok(response.headers.get('location').startsWith('/auth/signin?return_to='));
 }
 assert.equal(f.calls.length,0);
 assert.equal((await f.fetch('/assets/login.css')).status,200);
 assert.equal(f.calls.length,0,'generated assets use the explicit ASSETS binding, not vinext routing');
 f.setSession({id:'verified'});
 assert.equal((await f.fetch('/learning/finca-escuela.html')).status,200);
 assert.equal((await f.fetch('/offline-assets.json')).status,200);
});

test('production anonymous public browsing and local-only shell remain open; private routes stay gated',async()=>{
 const f=fixture('public-production');
 for(const path of ['/','/tienda','/marketplace','/marketplace/published-id','/aprende/ganaderia','/profesionales','/empresas','/red','/app-local','/finca-demo','/biblioteca-local','/learning/finca-escuela.html','/offline-assets.json','/api/marketplace','/api/offline-public','/api/companies','/api/red','/api/home-media/published.webp','/api/media/marketplace/published.webp']){
  const response=await f.fetch(path);assert.equal(response.status,200,path);
 }
 for(const path of ['/app','/admin','/admin/home-preview','/marketplace/publicar','/empresas/registro','/unknown','/revision-precios.html'])assert.equal((await f.fetch(path)).status,302,path);
 for(const path of ['/api/bootstrap','/api/sync','/api/offline-session','/api/account-menu','/api/security/status','/api/admin','/api/admin/home-content','/api/companies?mine=1','/api/new-private','/api/bootstrap/file.png'])assert.equal((await f.fetch(path)).status,401,path);
 for(const path of ['/api/companies','/api/sync','/api/admin/home-content'])assert.equal((await f.fetch(path,'POST')).status,401,path);
 for(const path of ['/%61pi/bootstrap','/api/%61dmin','/admin%2fhome-preview'])assert.equal((await f.fetch(path)).status,400,path);
});
test('production owner grant is separate from login, applies to every admin method, and never bypasses CSRF',async()=>{
 const f=fixture('public-production');f.setSession({id:'ordinary',email:'alvarojuniorcarrerovasquez@gmail.com'});f.setCsrf(true);
 for(const path of ['/admin','/admin/home-preview','/api/admin','/api/admin/home-content','/api/admin/home-media'])for(const method of ['GET','POST','PATCH','DELETE'])assert.equal((await f.fetch(path,method)).status,403,path+' '+method);
 assert.equal((await f.fetch('/api/bootstrap')).status,200);
 f.setSession({id:'verified-owner',googleOwnerAdmin:true});
 for(const path of ['/admin','/api/admin','/api/admin/home-content','/api/admin/home-media'])assert.equal((await f.fetch(path)).status,200,path);
 f.setCsrf(false);assert.equal((await f.fetch('/api/admin/home-content','POST')).status,403);
 f.setCsrf(true);assert.equal((await f.fetch('/api/admin/home-content','POST')).status,200);
 assert.equal(f.calls.at(-1).headers.get('oai-authenticated-user-id'),null);
 f.setSession(null);assert.equal((await f.fetch('/api/admin/home-content','POST')).status,401,'expired/revoked session loses admin access');
});
test('production account-bearing server responses stay private and noindex while local shell is cacheable',async()=>{
 const f=fixture('public-production');
 assert.equal((await f.fetch('/app-local')).headers.get('cache-control'),null);
 assert.equal((await f.fetch('/')).headers.get('cache-control'),'public, no-cache, must-revalidate');
 assert.equal((await f.fetch('/api/red')).headers.get('cache-control'),'private, no-store');
 assert.equal((await f.fetch('/app-local','GET',{cookie:'__Host-va_session=opaque-token'})).headers.get('cache-control'),null);
 assert.equal((await f.fetch('/marketplace','GET',{cookie:'__Host-va_session=opaque-token'})).headers.get('cache-control'),'private, no-store');
 assert.equal((await f.fetch('/marketplace','GET',{cookie:'__Host-va_session=a; __Host-va_session=b'})).headers.get('cache-control'),'private, no-store');
 assert.equal((await f.fetch('/api/auth/unknown')).status,401);
});

test('only exact public library manifest reads bypass login; staging, mutations and similar paths stay protected',async()=>{
 const prod=fixture('public-production');
 for(const method of ['GET','HEAD']){
  const response=await prod.fetch('/offline-library-assets.json',method);assert.equal(response.status,200);assert.ok(!/private|no-store/.test(response.headers.get('cache-control')||''));
 }
 assert.equal((await prod.fetch('/offline-library-assets.json','GET',{cookie:'__Host-va_session=expired'})).status,200);
 assert.equal((await fixture().fetch('/offline-library-assets.json')).status,302);
 for(const method of ['POST','PUT','DELETE','PATCH'])assert.equal((await prod.fetch('/offline-library-assets.json',method)).status,302);
 for(const path of ['/private.json','/offline-library-assets.json/private','/offline-library-assets.json.bak'])assert.equal((await prod.fetch(path)).status,302);
 for(const path of ['/api/offline-library-assets.json','/api/bootstrap','/api/sync'])assert.equal((await prod.fetch(path)).status,401);
 assert.equal((await prod.fetch('/%6fffline-library-assets.json')).status,400);
});

test('audited HTML offline documents normalize framework no-store without normalizing private output',async()=>{
 const f=fixture('public-production',{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store, must-revalidate'}});
 for(const path of ['/aprende','/aprende/crear-plano-de-mi-finca','/plataforma','/tienda','/app-local','/biblioteca-local']){
  for(const headers of [{},{cookie:'__Host-va_session=opaque'}])assert.equal((await f.fetch(path,'GET',headers)).headers.get('cache-control'),'public, no-cache, must-revalidate');
 }
 for(const extra of [{'cache-control':'private, no-store'},{'set-cookie':'__Host-va_session=test; Secure; HttpOnly'},{vary:'Cookie'},{vary:'Accept-Encoding, Authorization'},{vary:'*'}]){
  const guarded=fixture('public-production',{headers:{'content-type':'text/html','cache-control':'no-store, must-revalidate',...extra}});
  assert.match((await guarded.fetch('/aprende')).headers.get('cache-control'),/no-store/);
 }
 for(const status of [302,401,403,500])assert.match((await fixture('public-production',{status,headers:{'content-type':'text/html','cache-control':'no-store'}}).fetch('/aprende')).headers.get('cache-control'),/no-store/);
 assert.match((await fixture('public-production',{headers:{'content-type':'text/x-component','cache-control':'no-store'}}).fetch('/aprende')).headers.get('cache-control'),/no-store/);
 for(const path of ['/api/offline-public','/api/account-menu','/app','/admin','/fincas','/red','/profesionales'])assert.match((await f.fetch(path)).headers.get('cache-control'),/private|no-store/);
 assert.equal((await f.fetch('/aprende','POST')).status,302);
 assert.match((await f.fetch('/aprende?preview=1')).headers.get('cache-control'),/no-store/);
});
