import test, {after, beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createServer} from 'vite';
const root=fileURLToPath(new URL('..',import.meta.url));
const sqlite=new DatabaseSync(':memory:');
sqlite.exec(readFileSync(root+'drizzle/0008_wild_sinister_six.sql','utf8'));
let beforeWrite=null, storageFailure=false;
const adapter={prepare(query){
 const bind=(values=[])=>({bind(...args){return bind(args);},async raw(){
  if(storageFailure)throw new Error('Injected storage outage');
  if(/^(update|insert)/i.test(query)&&beforeWrite){const hook=beforeWrite;beforeWrite=null;hook();}
  const statement=sqlite.prepare(query);statement.setReturnArrays(true);return statement.all(...values);
 },async all(){return {results:sqlite.prepare(query).all(...values)};}});return bind();
}};
const files=new Map();
globalThis.__homeEnv={DB:adapter,BUCKET:{async head(key){return files.has(key)?{size:files.get(key).bytes.length}:null;},async put(key,bytes,options){files.set(key,{bytes,options});},async get(key){const file=files.get(key);return file?{body:file.bytes,httpEtag:'synthetic',writeHttpMetadata(headers){headers.set('content-type',file.options.httpMetadata.contentType);}}:null;}}};
globalThis.__homeUser=null;
const vite=await createServer({root,configFile:false,appType:'custom',resolve:{alias:{'@':root}},plugins:[{name:'home-test-env',enforce:'pre',resolveId(id){if(id==='cloudflare:workers')return '\0home-env';if(id.endsWith('/app/chatgpt-auth')||id.endsWith('/app/chatgpt-auth.ts'))return '\0home-auth';},load(id){if(id==='\0home-env')return 'export const env=globalThis.__homeEnv;';if(id==='\0home-auth')return 'export async function getChatGPTUser(){return globalThis.__homeUser;}';}}],server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
const route=await vite.ssrLoadModule('/app/api/admin/home-content/route.ts');
const upload=await vite.ssrLoadModule('/app/api/admin/home-media/route.ts');
const media=await vite.ssrLoadModule('/app/api/home-media/[file]/route.ts');
const {HOME_DEFAULTS,homeContentSchema,parseHomeContent}=await vite.ssrLoadModule('/lib/home-content.ts');
const {readPublishedHome}=await vite.ssrLoadModule('/lib/home-content-db.ts');
after(async()=>{await vite.close();sqlite.close();delete globalThis.__homeEnv;delete globalThis.__homeUser;});
beforeEach(()=>{sqlite.exec('DELETE FROM website_content');files.clear();beforeWrite=null;storageFailure=false;globalThis.__homeUser={id:'test-admin',email:'alimentosparcelalosmorochos@gmail.com'};});
function request(body,headers={}){const req=new Request('https://home.test/api/admin/home-content',{method:'POST',headers:{'content-type':'application/json',origin:'https://home.test',...headers},body:typeof body==='string'?body:JSON.stringify(body)});Object.defineProperty(req,'nextUrl',{value:new URL(req.url)});return req;}
async function send(body,headers){const r=await route.POST(request(body,headers));return {status:r.status,...await r.json()};}
const save=(content=HOME_DEFAULTS,expectedRevision=null)=>send({action:'save',content,expectedRevision});
const publish=revision=>send({action:'publish',expectedRevision:revision});
const row=()=>sqlite.prepare('SELECT * FROM website_content').get();

test('anonymous and ordinary accounts cannot read, mutate or upload, and cross-site requests are blocked',async()=>{
 for(const user of [null,{id:'ordinary',email:'ordinary@example.test'}]){
  globalThis.__homeUser=user;
  assert.equal((await route.GET()).status,403);assert.equal((await save()).status,403);
  assert.equal((await upload.POST(request({dataUrl:'invalid'}))).status,403);
 }
 globalThis.__homeUser={id:'test-admin',email:'alimentosparcelalosmorochos@gmail.com'};
 assert.equal((await send({action:'save',content:HOME_DEFAULTS,expectedRevision:null},{origin:'https://evil.test'})).status,403);
 assert.equal(row(),undefined);
});
test('strict validation rejects oversized, HTML, unknown fields, unsafe image paths and malformed requests',async()=>{
 assert.equal(homeContentSchema.safeParse(HOME_DEFAULTS).success,true);
 for(const patch of [{heroTitle:''},{heroTitle:'<script>alert(1)</script>'},{heroTitle:'x'.repeat(91)},{heroImage:'https://evil.test/pixel'},{heroImage:'/api/home-media/../secret'},{unknown:'x'}])assert.equal((await save({...HOME_DEFAULTS,...patch})).status,400);
 assert.equal((await route.POST(request('broken json'))).status,400);
 assert.equal((await route.POST(request('x'.repeat(16001)))).status,413);
 assert.equal((await route.POST(request({}, {'content-type':'text/plain'}))).status,415);
 assert.equal(row(),undefined);
});
test('draft is persisted but public defaults remain until explicit publication; later drafts do not leak',async()=>{
 const content={...HOME_DEFAULTS,heroTitle:'Mi nueva portada'};
 const first=await save(content);assert.equal(first.status,200);assert.equal(row().published_json,null);
 assert.deepEqual(await readPublishedHome(),HOME_DEFAULTS);
 const get=await route.GET();assert.match(get.headers.get('cache-control'),/private, no-store/);assert.deepEqual((await get.json()).content,content);
 const published=await publish(first.revision);assert.equal(published.status,200);assert.ok(published.publishedAt);assert.deepEqual(await readPublishedHome(),content);
 await save({...content,heroTitle:'Borrador privado'},published.revision);
 assert.deepEqual(await readPublishedHome(),content);
});
test('first save and subsequent save use atomic compare-and-swap, including races',async()=>{
 const first=await save();assert.equal((await save({...HOME_DEFAULTS,heroTitle:'Overwrite'})).status,409);
 assert.equal((await save(HOME_DEFAULTS,crypto.randomUUID())).status,409);
 beforeWrite=()=>sqlite.prepare('UPDATE website_content SET revision=?').run(crypto.randomUUID());
 assert.equal((await save({...HOME_DEFAULTS,heroTitle:'Racing edit'},first.revision)).status,409);
 assert.equal(JSON.parse(row().draft_json).heroTitle,HOME_DEFAULTS.heroTitle);
});
test('publish rejects stale revision and a concurrent edit between read and update',async()=>{
 const first=await save();const second=await save({...HOME_DEFAULTS,heroTitle:'Newer'},first.revision);
 assert.equal((await publish(first.revision)).status,409);
 beforeWrite=()=>sqlite.prepare('UPDATE website_content SET revision=?, draft_json=?').run(crypto.randomUUID(),JSON.stringify({...HOME_DEFAULTS,heroTitle:'Raced'}));
 assert.equal((await publish(second.revision)).status,409);assert.equal(row().published_json,null);
});
test('missing, malformed or unavailable public content falls back; admin never reports a successful save on outage',async()=>{
 assert.deepEqual(await readPublishedHome(),HOME_DEFAULTS);assert.equal(parseHomeContent('{broken'),null);
 await save();sqlite.exec("UPDATE website_content SET published_json='broken'");assert.deepEqual(await readPublishedHome(),HOME_DEFAULTS);
 storageFailure=true;assert.deepEqual(await readPublishedHome(),HOME_DEFAULTS);assert.equal((await route.GET()).status,503);assert.equal((await save()).status,503);
});
test('upload validates bytes and only the currently published image is public',async()=>{
 assert.equal((await upload.POST(request({dataUrl:'data:image/png;base64,'+btoa('<script>no</script>')}))).status,400);
 const dataUrl='data:image/webp;base64,'+readFileSync(root+'public/hero-apure-1200.webp').toString('base64');
 const uploaded=await upload.POST(request({dataUrl}));assert.equal(uploaded.status,200);const {src}=await uploaded.json();
 const context={params:Promise.resolve({file:src.split('/').pop()})};
 const fetchImage=()=>media.GET(new Request('https://home.test'+src),context);
 assert.equal((await fetchImage()).status,200);
 const draft=await save({...HOME_DEFAULTS,heroImage:src});
 globalThis.__homeUser=null;assert.equal((await fetchImage()).status,404);
 globalThis.__homeUser={id:'test-admin',email:'alimentosparcelalosmorochos@gmail.com'};
 const published=await publish(draft.revision);assert.equal(published.status,200);
 globalThis.__homeUser=null;let image=await fetchImage();assert.equal(image.status,200);assert.equal(image.headers.get('x-content-type-options'),'nosniff');assert.match(image.headers.get('cache-control'),/must-revalidate/);
 globalThis.__homeUser={id:'test-admin',email:'alimentosparcelalosmorochos@gmail.com'};
 const reset=await save(HOME_DEFAULTS,published.revision);await publish(reset.revision);
 globalThis.__homeUser=null;assert.equal((await fetchImage()).status,404);
});
test('publish refuses a nonexistent uploaded image and retains the prior public snapshot',async()=>{
 const first=await save();const published=await publish(first.revision);
 const next=await save({...HOME_DEFAULTS,heroImage:`/api/home-media/${crypto.randomUUID()}.webp`},published.revision);
 assert.equal((await publish(next.revision)).status,422);assert.deepEqual(await readPublishedHome(),HOME_DEFAULTS);
});
test('preview and editor are explicitly protected, publication requires saved content and confirms its audience',()=>{
 const preview=readFileSync(root+'app/admin/home-preview/page.tsx','utf8');assert.match(preview,/if \(!isAdminIdentity\(await getChatGPTUser\(\)\)\) notFound/);assert.match(preview,/index: false, follow: false/);
 const editor=readFileSync(root+'components/home-content-editor.tsx','utf8');assert.match(editor,/window.confirm\("¿Publicar/);assert.match(editor,/disabled=\{busy \|\| dirty \|\| !document.revision\}/);assert.match(editor,/beforeunload/);
 const page=readFileSync(root+'app/page.tsx','utf8');assert.match(page,/readPublishedHome/);assert.match(page,/title: \{absolute: content.seoTitle\}/);assert.doesNotMatch(page,/draftJson/);
});

test('shared homepage renderer uses saved text and image while keeping default responsive sources and route targets',async()=>{
 const {HomePageContent}=await vite.ssrLoadModule('/components/home-page-content.tsx');
 const nodes=value=>!value||typeof value!=='object'?[]:Array.isArray(value)?value.flatMap(nodes):[value,...nodes(value.props?.children)];
 const original=nodes(HomePageContent({content:HOME_DEFAULTS}));
 assert.equal(original.filter(node=>node.type==='h1').length,1);
 assert.ok(original.some(node=>node.type==='source'&&node.props.type==='image/avif'));
 const image=`/api/home-media/${crypto.randomUUID()}.webp`;
 const changed=nodes(HomePageContent({content:{...HOME_DEFAULTS,heroTitle:'Portada personalizada',heroImage:image,heroImageAlt:'Descripción personalizada'}}));
 const title=changed.find(node=>node.type==='h1');assert.equal(title.props.children[0],'Portada personalizada');
 assert.equal(changed.some(node=>node.type==='source'),false);
 const hero=changed.find(node=>node.type==='img'&&node.props.src===image);assert.ok(hero);assert.equal(hero.props.srcSet,undefined);assert.equal(hero.props.alt,'Descripción personalizada');
 assert.ok(changed.some(node=>node.props?.href==='/finca-modelo'&&node.props.prefetch===false));
});
