import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders platform branding and production search metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html=await response.text();
  assert.doesNotMatch(html, developmentPreviewMeta);
  assert.match(html,/Venezuela Agro/);
  assert.match(html,/name="description"/);
  assert.match(html,/property="og:title"/);
  assert.match(html,/rel="canonical"/);
});

test("opens Mi Finca in device-local mode when no account session is available", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("local-farm-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/app", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Modo local activo/);
  assert.match(html, /Configura tu finca/);
  assert.doesNotMatch(html, /signin-with-chatgpt/);
});

test('learning guides remain readable if the content database is temporarily unavailable',async()=>{
 const workerUrl=new URL('../dist/server/index.js',import.meta.url);
 workerUrl.searchParams.set('learning-test',`${process.pid}-${Date.now()}`);
 const {default:worker}=await import(workerUrl.href);
 for(const [path,expected] of [['/aprende','Tu plataforma, paso a paso.'],['/aprende/trabajar-sin-internet','cada cinco minutos'],['/rubros','Maíz'],['/red','El campo tiene mucho que contar.'],['/fincas','Registra tu finca. Abre nuevas oportunidades.'],['/fincas/ejemplo-finca-comunidad','Ficha demostrativa'],['/fincas/ejemplo-finca-pollos','Proceso y duración'],['/red/ejemplo-publicacion-1','Compartir']]){
  const response=await worker.fetch(new Request(`http://localhost${path}`,{headers:{accept:'text/html'}}),{ASSETS:{fetch:async()=>new Response('Not found',{status:404})}},{waitUntil(){},passThroughOnException(){}});
  assert.equal(response.status,200,path);
  assert.ok((await response.text()).includes(expected),path);
 }
});


test('principal public pages and SEO endpoints stay available without a database connection',async()=>{
 const {default:worker}=await import(new URL('../dist/server/index.js',import.meta.url));
 for(const path of ['/tienda','/marketplace','/profesionales','/proyectos','/nosotros','/plataforma','/guia-institucional','/legal/privacidad','/legal/terminos','/legal/comercio','/robots.txt','/sitemap.xml']){
  const response=await worker.fetch(new Request(`http://localhost${path}`),{ASSETS:{fetch:async()=>new Response('missing',{status:404})}},{waitUntil(){},passThroughOnException(){}});
  assert.equal(response.status,200,path);const html=await response.text();
  if(path==='/tienda'){assert.match(html,/Elegir presentación/);assert.match(html,/Para mi negocio/);}
  if(path==='/robots.txt')assert.doesNotMatch(html,/Sitemap:/i);
  if(path==='/sitemap.xml')assert.doesNotMatch(html,/<loc>/);
 }
});


test('offline shell contains full farm controls and no authenticated account identity',async()=>{
 const {default:worker}=await import(new URL('../dist/server/index.js',import.meta.url));
 const response=await worker.fetch(new Request('http://localhost/app-local',{headers:{'oai-authenticated-user-id':'test-owner','oai-authenticated-user-email':'private@example.test'}}),{ASSETS:{fetch:async()=>new Response('missing',{status:404})}},{waitUntil(){},passThroughOnException(){}});
 const html=await response.text();assert.equal(response.status,200);assert.match(html,/Configura tu finca/);assert.match(html,/Sincronización/);assert.doesNotMatch(html,/private@example.test|test-owner/);
});

test('downloaded library shell and every required reference page render without private identity or no-store responses',async()=>{
 const {readFile}=await import('node:fs/promises');const manifest=JSON.parse(await readFile(new URL('../dist/client/offline-library-assets.json',import.meta.url),'utf8'));
 const {default:worker}=await import(new URL('../dist/server/index.js',import.meta.url));
 for(const path of manifest.pages){const response=await worker.fetch(new Request('http://localhost'+path,{headers:{'oai-authenticated-user-id':'private-test-owner','oai-authenticated-user-email':'private-test@example.test'}}),{ASSETS:{fetch:async()=>new Response('missing',{status:404})}},{waitUntil(){},passThroughOnException(){}});assert.equal(response.status,200,path);assert.doesNotMatch(response.headers.get('cache-control')||'',/private|no-store/,path);const html=await response.text();assert.doesNotMatch(html,/private-test-owner|private-test@example.test/,path);}
 assert.ok(manifest.assets.some(item=>item.path.endsWith('.js')));assert.ok(manifest.assets.some(item=>item.path.endsWith('.css')));assert.ok(manifest.assets.some(item=>item.path.endsWith('.webp')));assert.ok(manifest.bytes<20*1024*1024);assert.ok(manifest.assets.every(item=>!item.path.startsWith('/api/')));
});
