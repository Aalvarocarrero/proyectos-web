import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import worker from '../src/worker.js';
import {DEFAULT_CONTENT,FIELDS,IMAGE_ASSETS} from '../src/content-fields.mjs';
import {validateContent,validateCommand,authorizeAdmin} from '../src/content-service.mjs';
import {renderContent} from '../src/content-renderer.mjs';
const origin='https://alvaro-carrero-mentor.aalvarocarrero.chatgpt.site';
const admin='synthetic-site-admin',other='synthetic-other-site-user';
const clone=()=>({...DEFAULT_CONTENT});
function database() {
 const sql=new DatabaseSync(':memory:');
 // Synthetic disposable SQLite only. No preview, hosted or persistent database is connected.
 for(const filename of readdirSync('drizzle').filter(name=>name.endsWith('.sql')).sort())sql.exec(readFileSync('drizzle/'+filename,'utf8'));
 function prepare(query,args=[]) {return {query,args,bind(...values){return prepare(query,values);},async first(){return sql.prepare(query).get(...args)??null;},async all(){return {success:true,results:sql.prepare(query).all(...args)};},async run(){return {success:true,meta:{changes:sql.prepare(query).run(...args).changes}};}};}
 return {sql,prepare,async batch(statements){sql.exec('BEGIN');try{const results=statements.map(statement=>({success:true,meta:{changes:sql.prepare(statement.query).run(...statement.args).changes}}));sql.exec('COMMIT');return results;}catch(error){sql.exec('ROLLBACK');throw error;}}};
}
const assetService={async fetch(request){let path=new URL(request.url).pathname;if(path.endsWith('/'))path+='index.html';try{return new Response(readFileSync('public'+path),{headers:{'content-type':'text/html; charset=utf-8',etag:'"static"','cache-control':'public, max-age=3600'}});}catch{return new Response('Not found',{status:404});}}};
const environment=()=>({DB:database(),ASSETS:assetService,ALVARO_ADMIN_USER_IDS:admin});
function request(path='/api/admin/content',method='GET',body,headers={}) {return new Request(origin+path,{method,headers:{'oai-authenticated-user-id':admin,...(method==='GET'||method==='HEAD'?{}:{origin,'content-type':'application/json','x-alvaro-admin':'content-v1'}),...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});}
const save=(env,content=clone(),expectedVersion=0,headers={})=>worker.fetch(request('/api/admin/content','PUT',{expectedVersion,content},headers),env);
const publish=(env,expectedVersion)=>worker.fetch(request('/api/admin/content/publish','POST',{expectedVersion}),env);

test('exact site allowlist is required before all admin reads, preview, writes and unknown descendants',async()=>{
 const paths=['/admin','/admin/','/admin/preview','/admin/index.html','/api/admin','/api/admin/content','/api/admin/content/publish'];
 let touched=false;const DB={prepare(){touched=true;throw Error('unexpected database access');}};
 for(const path of paths){
  assert.equal((await worker.fetch(request(path),{DB})).status,503);
  assert.equal((await worker.fetch(request(path),{DB,ALVARO_ADMIN_USER_IDS:'*'})).status,503);
  assert.equal((await worker.fetch(request(path,'GET',undefined,{'oai-authenticated-user-id':''}),{DB,ALVARO_ADMIN_USER_IDS:admin})).status,401);
  assert.equal((await worker.fetch(request(path,'GET',undefined,{'oai-authenticated-user-id':other}),{DB,ALVARO_ADMIN_USER_IDS:admin})).status,403);
 }
 assert.equal(touched,false);
 const env=environment();
 for(const headers of [{'oai-authenticated-user-id':'','oai-authenticated-user-email':admin},{'oai-authenticated-user-id':'','OAI-Sites-Authorization':'Bearer synthetic-test'}])assert.equal((await save(env,clone(),0,headers)).status,401);
 assert.throws(()=>authorizeAdmin(request(),{ALVARO_ADMIN_USER_IDS:admin+', '}));
 assert.equal(authorizeAdmin(request(),{ALVARO_ADMIN_USER_IDS:admin+', '+other}),admin);
});

test('strict runtime contract rejects unknown/missing keys, wrong types, controls, unsafe images and overlong content',()=>{
 assert.deepEqual(validateContent(clone()),DEFAULT_CONTENT);
 assert.equal(FIELDS.length,42);
 const variants=[{...clone(),extra:'x'},{...clone(),'es.hero.title':5},{...clone(),'es.hero.title':' x '},{...clone(),'es.hero.title':''},{...clone(),'es.hero.title':'x'.repeat(161)},{...clone(),'es.about.image':'https://evil.test/track.jpg'},{...clone(),'es.about.image':'/assets/../private'},{...clone(),'es.about.image':'javascript:alert(1)'},{...clone(),'es.hero.title':'text\u0000'}];
 const missing=clone();delete missing['en.hero.title'];variants.push(missing);
 for(const value of variants)assert.throws(()=>validateContent(value));
 for(const value of [null,[],{expectedVersion:'0',content:clone()},{expectedVersion:-1,content:clone()},{expectedVersion:1.5,content:clone()},{expectedVersion:0,content:clone(),publish:true}])assert.throws(()=>validateCommand(value,'save'));
 assert.throws(()=>validateCommand({expectedVersion:0,content:clone()},'publish'));
 for(const path of IMAGE_ASSETS)assert.ok(readFileSync('public'+path).length>0);
});

test('draft saves survive independent requests and publish only the expected version',async()=>{
 const env=environment(),content={...clone(),'es.hero.title':'Cambio guardado\ncon intención.','en.hero.title':'Saved with intention.'};
 const original=await (await worker.fetch(new Request(origin+'/'),env)).text();
 let response=await save(env,content);assert.equal(response.status,200);
 let state=(await response.json()).state;assert.equal(state.version,1);assert.equal(state.published,null);
 state=(await (await worker.fetch(request(),env)).json()).state;assert.equal(state.draft['es.hero.title'],content['es.hero.title']);
 assert.equal(await (await worker.fetch(new Request(origin+'/'),env)).text(),original);
 const preview=await worker.fetch(request('/admin/preview?lang=es'),env),previewHTML=await preview.text();
 assert.equal(preview.status,200);assert.match(previewHTML,/Cambio guardado<br>con intención\./);assert.match(previewHTML,/Borrador privado · versión 1/);assert.match(preview.headers.get('cache-control'),/private, no-store/);assert.match(preview.headers.get('x-robots-tag'),/noindex/);
 assert.equal((await publish(env,0)).status,409);
 response=await publish(env,1);assert.equal(response.status,200);state=(await response.json()).state;assert.equal(state.version,2);assert.equal(state.publishedVersion,2);
 const publicES=await worker.fetch(new Request(origin+'/'),env),publicEN=await worker.fetch(new Request(origin+'/en/'),env);
 assert.match(await publicES.text(),/Cambio guardado<br>con intención\./);assert.match(await publicEN.text(),/Saved with intention\./);
 assert.equal(publicES.headers.get('etag'),null);assert.equal(publicES.headers.get('cache-control'),'no-store, max-age=0');
 response=await save(env,{...content,'es.hero.title':'Nuevo borrador privado'},2);assert.equal(response.status,200);
 assert.match(await (await worker.fetch(new Request(origin+'/'),env)).text(),/Cambio guardado/);
 assert.equal(env.DB.sql.prepare('SELECT count(*) n FROM content_revisions').get().n,3);
});

test('CAS stops parallel first writes and stale publish without duplicate audit records',async()=>{
 const env=environment();const results=await Promise.all([save(env,{...clone(),'es.hero.title':'Primero'}),save(env,{...clone(),'es.hero.title':'Segundo'})]);
 assert.deepEqual(results.map(result=>result.status).sort(),[200,409]);
 assert.equal(env.DB.sql.prepare('SELECT count(*) n FROM content_revisions').get().n,1);
 const race=await Promise.all([save(env,{...clone(),'es.hero.title':'Cambio posterior'},1),publish(env,1)]);
 assert.deepEqual(race.map(result=>result.status).sort(),[200,409]);
 assert.equal(env.DB.sql.prepare('SELECT count(*) n FROM content_revisions').get().n,2);
 const row=env.DB.sql.prepare('SELECT * FROM content_state').get();assert.equal(row.version,2);
 const audit=env.DB.sql.prepare('SELECT * FROM content_revisions ORDER BY version DESC LIMIT 1').get();assert.equal(audit.id,row.operation_id);assert.equal(audit.snapshot,row.draft);
 assert.equal((await publish(environment(),0)).status,409);
});

test('failed audit rolls back state and never reports successful publication',async()=>{
 const env=environment();await save(env);
 env.DB.sql.exec("CREATE TRIGGER reject_content_audit BEFORE INSERT ON content_revisions BEGIN SELECT RAISE(ABORT, 'synthetic failure'); END");
 const response=await publish(env,1);assert.equal(response.status,503);
 const row=env.DB.sql.prepare('SELECT * FROM content_state').get();assert.equal(row.version,1);assert.equal(row.published,null);
 assert.equal(env.DB.sql.prepare('SELECT count(*) n FROM content_revisions').get().n,1);
});

test('mutation guards reject cross-site, missing custom headers, methods, content types and oversized streams',async()=>{
 const env=environment();
 for(const headers of [{origin:'https://evil.test'},{origin:''},{'x-alvaro-admin':''},{'sec-fetch-site':'cross-site'},{'sec-fetch-site':'same-site'}])assert.equal((await save(env,clone(),0,headers)).status,403);
 assert.equal((await save(env,clone(),0,{'content-type':'application/jsonp'})).status,415);
 assert.equal((await worker.fetch(request('/api/admin/content','POST',{expectedVersion:0,content:clone()}),env)).status,405);
 assert.equal((await worker.fetch(request('/api/admin/content/publish','GET'),env)).status,405);
 assert.equal((await save(env,{...clone(),'es.hero.title':'x'.repeat(70000)})).status,413);
 assert.equal((await save(env,{...clone(),extra:'x'})).status,400);
 assert.equal((await worker.fetch(request('/api/admin/content/unknown'),env)).status,404);
 assert.equal(env.DB.sql.prepare('SELECT count(*) n FROM content_state').get().n,0);
});

test('published renderer escapes script/attribute payloads, updates accessible image and server SEO, preserves other language and links',()=>{
 const es=readFileSync('public/index.html','utf8'),en=readFileSync('public/en/index.html','utf8');
 assert.equal(renderContent(es,clone(),'es',origin),es);
 const content={...clone(),'es.hero.title':'<script>alert("x")</script>','es.about.image':'/assets/cuidado.webp','es.about.imageAlt':'Retrato "accesible" <img>','es.seo.title':'Título & "seguro"','es.seo.description':'Descripción " onclick="mal" <script>','es.seo.image':'/assets/progreso.webp'};
 const rendered=renderContent(es,content,'es',origin),doc=new JSDOM(rendered).window.document;
 assert.equal(doc.querySelector('#hero-title').textContent,content['es.hero.title']);assert.equal(doc.querySelector('#hero-title script'),null);
 assert.equal(doc.querySelector('[data-content-image]').getAttribute('src'),'/assets/cuidado.webp');assert.equal(doc.querySelector('[data-content-image]').getAttribute('alt'),content['es.about.imageAlt']);
 assert.equal(doc.title,content['es.seo.title']);assert.equal(doc.querySelector('meta[name=description]').content,content['es.seo.description']);
 assert.equal(doc.querySelector('meta[property="og:image"]').content,origin+'/assets/progreso.webp');assert.equal(doc.querySelector('meta[name=description]').hasAttribute('onclick'),false);
 assert.deepEqual([...doc.querySelectorAll('a')].map(node=>node.getAttribute('href')),[...new JSDOM(es).window.document.querySelectorAll('a')].map(node=>node.getAttribute('href')));
 assert.equal(renderContent(en,content,'en',origin),en);
});

test('all text slots are renderable and retain only the allowlisted element',()=>{
 for(const language of ['es','en']) {
  const source=readFileSync(language==='es'?'public/index.html':'public/en/index.html','utf8');
  for(const field of FIELDS.filter(item=>item.lang===language&&item.type==='text'&&!item.slot.startsWith('seo.')&&item.slot!=='about.imageAlt')) {
   const content={...clone(),[field.key]:'Texto de prueba & <seguro>\nOtra línea'};
   const document=new JSDOM(renderContent(source,content,language,origin)).window.document;
   const element=document.querySelector(`[data-content-field="${field.slot}"]`);assert.ok(element,field.key);assert.equal(element.innerHTML,'Texto de prueba &amp; &lt;seguro&gt;<br>Otra línea',field.key);
  }
 }
});

test('public fallback works without configuration, database, schema or valid published data; preview fails closed',async()=>{
 const expected=readFileSync('public/index.html','utf8');
 for(const DB of [undefined,{prepare(){throw Error('unavailable');}},database()])assert.equal(await (await worker.fetch(new Request(origin+'/'),{ASSETS:assetService,DB})).text(),expected);
 const env=environment();await save(env);await publish(env,1);
 env.DB.sql.prepare('UPDATE content_state SET published=?').run('{"unsafe":true}');
 assert.equal(await (await worker.fetch(new Request(origin+'/'),env)).text(),expected);
 const unconfigured=await worker.fetch(request('/admin/preview'),{ASSETS:assetService});assert.equal(unconfigured.status,503);assert.ok(!(await unconfigured.text()).includes('data-content-field'));
 const unavailable=await worker.fetch(request('/admin/preview'),{...environment(),ASSETS:undefined});assert.equal(unavailable.status,503);
 assert.equal((await worker.fetch(request('/admin/preview?lang=fr'),environment())).status,400);
 assert.equal((await worker.fetch(request('/admin/preview?lang=es&token=x'),environment())).status,400);
});

test('admin server renders all editable values safely, normal navigation and private headers; HEAD returns no content',async()=>{
 const env=environment();await save(env,{...clone(),'es.hero.title':'</textarea><script>bad()</script>'});
 const response=await worker.fetch(request('/admin'),env),html=await response.text(),document=new JSDOM(html).window.document;
 assert.equal(response.status,200);assert.match(response.headers.get('cache-control'),/private, no-store/);assert.match(response.headers.get('content-security-policy'),/frame-ancestors 'none'/);
 assert.equal(document.querySelectorAll('textarea,select').length,42);
 assert.equal(document.querySelector('[name="es.hero.title"]').value,'</textarea><script>bad()</script>');assert.equal(document.querySelectorAll('script:not([src]):not([type="application/json"])').length,0);
 assert.equal(document.querySelector('nav [aria-current=page]').getAttribute('href'),'/admin');
 for(const path of ['/admin','/admin/preview','/'])assert.equal(await (await worker.fetch(request(path,'HEAD'),env)).text(),'');
 const anonymous=await worker.fetch(request('/admin','GET',undefined,{'oai-authenticated-user-id':''}),env);
 const login=new JSDOM(await anonymous.text()).window.document.querySelector('a[target="_top"]');assert.equal(login.getAttribute('href'),'/signin-with-chatgpt?return_to=%2Fadmin');
});

test('built Worker is self-contained with the same protected behavior and runtime content renderer',async()=>{
 const source=readFileSync('dist/server/index.js','utf8');assert.doesNotMatch(source,/^import /m);
 const built=(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).default;
 const env=environment();
 assert.equal((await built.fetch(request('/admin'),{ASSETS:assetService})).status,503);
 const response=await built.fetch(request('/api/admin/content','PUT',{expectedVersion:0,content:{...clone(),'es.hero.title':'Versión compilada'}}),env);assert.equal(response.status,200);
 assert.equal((await built.fetch(request('/api/admin/content/publish','POST',{expectedVersion:1}),env)).status,200);
 assert.match(await (await built.fetch(new Request(origin+'/'),env)).text(),/Versión compilada/);
});

test('literal replacement metacharacters survive rendering and private previews have no relative assets',async()=>{
 const value='Literal $& $` $\' $$';
 const content={...clone(),'es.hero.title':value,'es.seo.title':value,'es.about.imageAlt':value};
 const rendered=new JSDOM(renderContent(readFileSync('public/index.html','utf8'),content,'es',origin)).window.document;
 assert.equal(rendered.querySelector('#hero-title').textContent,value);assert.equal(rendered.title,value);assert.equal(rendered.querySelector('[data-content-image]').alt,value);
 for(const language of ['es','en']) {
  const response=await worker.fetch(request(`/admin/preview?lang=${language}`),environment());
  const document=new JSDOM(await response.text()).window.document;
  for(const element of document.querySelectorAll('[src],link[href]')) {
   const path=element.getAttribute('src')??element.getAttribute('href');
   assert.match(path,/^(\/|https:\/\/)/,path);
  }
 }
});
