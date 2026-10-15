import {createHash} from 'node:crypto';import manifest from '../server/original-public-sha256.json' with {type:'json'};import test from 'node:test';import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';import {readFileSync,readdirSync,existsSync} from 'node:fs';
import config from '../server/content-config.json' with {type:'json'};
import template from '../server/home-template.mjs';
import {adminIdentity,validateContent,defaultsFor,loadState,saveState,renderContent,requireMutation} from '../server/content-service.mjs';
import {adminRequest,publicHome} from '../server/content-handler.mjs';
function database(){const db=new DatabaseSync(':memory:');for(const f of readdirSync(new URL('../drizzle',import.meta.url)).filter(f=>f.endsWith('.sql')))db.exec(readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8'));
 const wrap=(sql,values=[])=>({bind(...args){return wrap(sql,args)},async all(){return {results:db.prepare(sql).all(...values)}},async first(){return db.prepare(sql).get(...values)||null},async run(){return {success:true,meta:{changes:Number(db.prepare(sql).run(...values).changes)}}}});
 return {DB:{prepare:sql=>wrap(sql),async batch(statements){db.exec('BEGIN');try{const result=[];for(const s of statements)result.push(await s.run());db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;}}},db};}
const req=(path='/admin',id='owner',body)=>new Request('https://site.test'+path,{method:body?'POST':'GET',headers:{...(id?{'oai-authenticated-user-id':id}:{}),Origin:'https://site.test','X-Content-Admin':'1','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
const allowed=()=>({[config.adminEnv]:'["owner"]',AETERNA_TRUSTED_SITES_DISPATCH:'1'}),defaults=()=>defaultsFor(config);
test('default renderer preserves every byte, orbit scripts, imagery and existing markup',()=>{assert.equal(renderContent(template,defaults(),config),template);});
test('all fields bind exactly one original template fragment',()=>{for(const f of config.fields)assert.equal(template.split(f.original).length,2,f.key);});
test('all selectable images exist in the retained public assets',()=>{for(const path of config.imagePaths)assert.ok(existsSync(new URL('../public/'+path.replace(/^\//,''),import.meta.url)),path);});
test('identity fails closed for absent, malformed, empty, other and email-only identities',()=>{for(const env of [{},{[config.adminEnv]:'{}'},{[config.adminEnv]:'['},{[config.adminEnv]:'[]'},allowed()])assert.throws(()=>adminIdentity(req('/admin','other'),env,config));assert.throws(()=>adminIdentity(req('/admin',null),allowed(),config));assert.equal(adminIdentity(req(),allowed(),config),'owner');});
test('typed validation rejects extras, missing keys, external images and nonstrings',()=>{const d=defaults();assert.deepEqual(validateContent(d,config),d);for(const invalid of [{...d,extra:true},{...d,seoTitle:2},{...d,seoTitle:''},{...d,featureImage:'https://evil.test/x.jpg'}])assert.throws(()=>validateContent(invalid,config));delete d.seoTitle;assert.throws(()=>validateContent(d,config));});
test('HTML and attribute values are escaped, and dollar substitution remains literal',()=>{const d=defaults();d.heroTitle='<script>alert(1)</script> $&';d.seoDescription='" onload="evil $&';d.featureImageAlt='" onclick="bad $&';const output=renderContent(template,d,config);assert.ok(output.includes('&lt;script&gt;alert(1)&lt;/script&gt; $&'));assert.ok(output.includes('&quot; onload=&quot;evil'));assert.ok(!output.includes('alt="" onclick="bad'));});
test('changing an image removes obsolete responsive variants and preserves other imagery',()=>{const d=defaults();d.featureImage=config.imagePaths.find(x=>x!==d.featureImage);const output=renderContent(template,d,config);assert.ok(output.includes('src="'+d.featureImage+'"'));assert.ok(!output.includes(config.fields.find(f=>f.kind==='image').original));});
test('mutation requires exact same origin and custom header',()=>{assert.doesNotThrow(()=>requireMutation(req('/api/admin/content','owner',{})));for(const headers of [{Origin:'https://evil.test','X-Content-Admin':'1'},{Origin:'https://site.test'}])assert.throws(()=>requireMutation(new Request('https://site.test/api/admin/content',{method:'POST',headers})));});
test('persistent draft, publish, audit and stale-writer rejection use real SQLite',async()=>{const env=database(),d=defaults();d.heroTitle='Borrador';assert.equal((await loadState(env,config)).version,0);await saveState(env,config,'owner',0,d,'save');let state=await loadState(env,config);assert.equal(state.draft.heroTitle,'Borrador');assert.equal(state.published.heroTitle,defaults().heroTitle);await assert.rejects(saveState(env,config,'owner',0,d,'save'),e=>e.status===409);await saveState(env,config,'owner',1,d,'publish');state=await loadState(env,config);assert.equal(state.published.heroTitle,'Borrador');assert.equal(state.publishedVersion,2);assert.equal(env.db.prepare('SELECT count(*) as n FROM content_revisions').get().n,2);});
test('competing writes preserve one winner and one matching revision',async()=>{const env=database(),a=defaults(),b=defaults();a.heroTitle='A';b.heroTitle='B';const outcomes=await Promise.allSettled([saveState(env,config,'owner',0,a,'save'),saveState(env,config,'owner',0,b,'save')]);assert.equal(outcomes.filter(x=>x.status==='fulfilled').length,1);assert.equal(env.db.prepare('SELECT count(*) as n FROM content_revisions').get().n,1);});
test('protected preview shows saved draft while public homepage stays published',async()=>{const env={...database(),...allowed()},d=defaults();d.heroTitle='Private draft sentinel';await saveState(env,config,'owner',0,d,'save');assert.ok(!(await (await publicHome(env)).text()).includes('Private draft sentinel'));assert.equal((await adminRequest(req('/admin/preview'),env)).status,302);const preview=await publicHome(env,req('/?content-preview=1'));assert.equal(preview.status,200);assert.match(preview.headers.get('cache-control'),/no-store/);assert.ok((await preview.text()).includes('Private draft sentinel'));assert.equal((await adminRequest(req('/admin/preview',null),env)).status,401);assert.equal((await adminRequest(req('/admin/preview','other'),env)).status,403);});
test('public fallback survives absent or unavailable storage; admin never claims successful save',async()=>{assert.equal(await (await publicHome({})).text(),template);const env={DB:{prepare(){throw Error('unavailable')}},...allowed()};assert.equal(await (await publicHome(env)).text(),template);assert.equal((await adminRequest(req('/api/admin/content'),env)).status,503);assert.equal((await adminRequest(req('/api/admin/content','owner',{action:'save',expectedVersion:0,content:defaults()}),allowed())).status,503);});
test('admin round trip persists and publishes with strict action input',async()=>{const env={...database(),...allowed()},d=defaults();d.heroTitle='Published proof';let response=await adminRequest(req('/api/admin/content','owner',{action:'publish',expectedVersion:0,content:d}),env);assert.equal(response.status,200);assert.ok((await (await publicHome(env)).text()).includes('Published proof'));response=await adminRequest(req('/api/admin/content','owner',{action:'delete',expectedVersion:1,content:d}),env);assert.equal(response.status,400);});

test('public preview query fails closed and is never cached',async()=>{for(const id of [null,'other']){const response=await publicHome(allowed(),req('/?content-preview=1',id));assert.ok([401,403].includes(response.status));assert.match(response.headers.get('cache-control'),/no-store/);}});

test('every original public page and asset is retained byte-for-byte',()=>{for(const [path,sha] of Object.entries(manifest)){const data=path==='index.html'?Buffer.from(template):readFileSync(new URL('../public/'+path,import.meta.url));assert.equal(createHash('sha256').update(data).digest('hex'),sha,path);}});

import {publicMedia} from '../server/content-handler.mjs';
import {inspectImage} from '../server/image-validation.mjs';
import {readLimitedBody} from '../server/content-service.mjs';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
const uploadReq=(data=png,type='image/png',id='owner')=>new Request('https://site.test/api/admin/media',{method:'POST',headers:{'oai-authenticated-user-id':id,Origin:'https://site.test','X-Content-Admin':'1','Content-Type':type},body:data});
function bucket(){const objects=new Map();return {objects,async put(key,body,options){objects.set(key,{body:new Uint8Array(body),httpMetadata:options.httpMetadata});},async get(key){return objects.get(key)},async head(key){return objects.has(key)?{}:null},async delete(key){objects.delete(key)}};}
test('trusted Sites boundary must be configured; only one exact owner ID is accepted',()=>{
 assert.throws(()=>adminIdentity(req(),{[config.adminEnv]:'["owner"]'},config),e=>e.status===503);
 for(const ids of ['["owner","another"]','["alvarojuniorcarrerovasquez@gmail.com"]','[" owner "]'])assert.throws(()=>adminIdentity(req(),{...allowed(),[config.adminEnv]:ids},config),e=>e.status===503);
});
test('every expanded field renders changes without modifying immutable flows',()=>{
 for(const f of config.fields){const d=defaults();d[f.key]=f.kind==='image'?config.imagePaths.find(p=>p!==f.default):'Edited '+f.key+' $& <script>';
 const html=renderContent(template,d,config);assert.notEqual(html,template,f.key);assert.ok(html.includes(f.kind==='image'?d[f.key]:'Edited '+f.key+' $&amp; &lt;script&gt;'),f.key);for(const path of ['/maternity-gold-coast/','/booking-preview/','/quote-preview/','/menus/menu-world.js?v=5'])assert.ok(html.includes(path),path);}
});
test('legacy 11-field content and historical revisions hydrate additive defaults',async()=>{
 const env={...database(),...allowed()},old=Object.fromEntries(Object.entries(defaults()).slice(0,11));old.heroTitle='Original saved title';
 env.db.prepare('INSERT INTO content_state VALUES (1,1,?,?,1,?,?)').run(JSON.stringify(old),JSON.stringify(old),'legacy','2026-10-01');
 env.db.prepare('INSERT INTO content_revisions VALUES (1,?,?,?,?)').run(JSON.stringify(old),'publish','owner','2026-10-01');
 const state=await loadState(env,config);assert.equal(state.draft.heroTitle,old.heroTitle);assert.equal(state.draft.service9Title,defaults().service9Title);
 assert.equal((await adminRequest(req('/api/admin/restore','owner',{version:1,expectedVersion:1}),env)).status,200);
});
test('history lists persisted revisions and restoration changes only the draft',async()=>{
 const env={...database(),...allowed()},first={...defaults(),service1Title:'Older service'},second={...defaults(),service1Title:'Current public service'};
 await saveState(env,config,'owner',0,first,'save');await saveState(env,config,'owner',1,second,'publish');
 const history=await (await adminRequest(req('/api/admin/revisions'),env)).json();assert.equal(history.length,2);assert.equal(history[0].version,2);
 let response=await adminRequest(req('/api/admin/restore','owner',{version:1,expectedVersion:2}),env);assert.equal(response.status,200);
 const state=await loadState(env,config);assert.equal(state.draft.service1Title,'Older service');assert.equal(state.published.service1Title,'Current public service');assert.equal(state.publishedVersion,2);assert.equal(state.version,3);
 assert.equal(env.db.prepare('SELECT action FROM content_revisions WHERE version=3').get().action,'restore');
 assert.equal((await adminRequest(req('/api/admin/restore','owner',{version:1,expectedVersion:2}),env)).status,409);
 assert.equal((await adminRequest(req('/api/admin/restore','owner',{version:999,expectedVersion:3}),env)).status,404);
 assert.equal((await adminRequest(req('/api/admin/restore','owner',{version:0,expectedVersion:3}),env)).status,200);assert.deepEqual((await loadState(env,config)).draft,defaults());
});
test('image upload is owner-only, typed and private until referenced by a publication',async()=>{
 const env={...database(),...allowed(),BUCKET:bucket()};
 assert.equal((await adminRequest(uploadReq(png,'image/png','other'),env)).status,403);
 assert.equal((await adminRequest(uploadReq(png,'image/jpeg'),env)).status,400);
 const response=await adminRequest(uploadReq(),env);assert.equal(response.status,201);const image=await response.json();assert.equal(image.width,1);
 const request=new Request('https://site.test'+image.image);assert.equal((await publicMedia(request,env)).status,404);
 const privateResponse=await adminRequest(req(image.preview),env);assert.equal(privateResponse.status,200);assert.equal(privateResponse.headers.get('content-type'),'image/png');assert.match(privateResponse.headers.get('cache-control'),/no-store/);
 assert.equal((await adminRequest(req(image.preview,'other'),env)).status,403);
 const d={...defaults(),featureImage:image.image};await adminRequest(req('/api/admin/content','owner',{action:'save',expectedVersion:0,content:d}),env);assert.equal((await publicMedia(request,env)).status,404);
 const preview=await (await publicHome(env,req('/?content-preview=1'))).text();assert.ok(preview.includes(image.preview));
 await adminRequest(req('/api/admin/content','owner',{action:'publish',expectedVersion:1,content:d}),env);assert.equal((await publicMedia(request,env)).status,200);
 await adminRequest(req('/api/admin/content','owner',{action:'publish',expectedVersion:2,content:defaults()}),env);assert.equal((await publicMedia(request,env)).status,404);
});
test('missing media cannot be saved, published or restored',async()=>{
 const env={...database(),...allowed(),BUCKET:bucket()},d={...defaults(),featureImage:'/media/12345678-1234-1234-1234-123456789abc.png'};
 const response=await adminRequest(req('/api/admin/content','owner',{action:'save',expectedVersion:0,content:d}),env);assert.equal(response.status,400);assert.equal((await loadState(env,config)).version,0);
 const image=await(await adminRequest(uploadReq(),env)).json();d.featureImage=image.image;await saveState(env,config,'owner',0,d,'save');await env.BUCKET.delete(image.image.slice(7));
 assert.equal((await adminRequest(req('/api/admin/restore','owner',{version:1,expectedVersion:1}),env)).status,400);
});
test('failed media metadata insertion compensates the R2 upload',async()=>{
 const BUCKET=bucket(),env={...allowed(),BUCKET,DB:{prepare(){throw Error('write failed')}}};assert.equal((await adminRequest(uploadReq(),env)).status,503);assert.equal(BUCKET.objects.size,0);
});
test('image validation rejects SVG, mismatched magic, excessive dimensions and truncation',()=>{
 assert.equal(inspectImage(png.buffer.slice(png.byteOffset,png.byteOffset+png.byteLength),'image/png').width,1);
 for(const [bytes,type] of [[Buffer.from('<svg><script>alert(1)</script></svg>'),'image/svg+xml'],[png.subarray(0,35),'image/png'],[png,'image/webp']])assert.throws(()=>inspectImage(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),type));
 const huge=Buffer.from(png);huge.writeUInt32BE(7000,16);assert.throws(()=>inspectImage(huge.buffer.slice(huge.byteOffset,huge.byteOffset+huge.byteLength),'image/png'));
});
test('streamed body limit applies even without content-length',async()=>{
 await assert.rejects(readLimitedBody(new Request('https://site.test',{method:'POST',body:'abcdef'}),3),e=>e.status===413);
 assert.equal((await adminRequest(req('/api/admin/content','owner',{action:'save',expectedVersion:0,content:{...defaults(),heroBody:'x'.repeat(260000)}}),{...database(),...allowed()})).status,413);
});
test('expanded admin renders grouped controls, media previews and restore UI',async()=>{
 const response=await adminRequest(req(),{...database(),...allowed(),BUCKET:bucket()});assert.equal(response.status,200);const html=await response.text();assert.ok(html.includes('service9Details'));assert.ok(html.includes('Historial y restauración'));assert.ok(html.includes('data-upload="featureImage"'));assert.ok(!html.includes('src="assets/camera.jpg"'));
});
test('gallery overrides are escaped and injected before initialization',()=>{
 const d={...defaults(),portfolioText3:'</script><script>alert(1)</script>',portfolioImage2:'/assets/events-real.webp'};const html=renderContent(template,d,config);assert.ok(html.includes('href="/assets/events-real.webp" data-open-gallery='));assert.ok(html.indexOf('/content-gallery.js')<html.indexOf('/portfolio-init.js'));const serialized=html.match(/id="content-gallery-data">([\s\S]*?)<\/script>/)[1];assert.ok(!serialized.includes('<'));assert.equal(JSON.parse(serialized)[0].title,d.portfolioText3);
});
test('process numbering and hero accent wrapper survive edited text',()=>{
 const d={...defaults(),processText1:'Learn',heroTitle:'One\nTwo\nThree\nFour'};const html=renderContent(template,d,config);assert.ok(html.includes('<span>01</span>Learn'));assert.ok(html.includes('<span>Three<br>Four</span>'));
});
