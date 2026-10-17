import {productionEnv} from './fixtures/production-worker.mjs';
import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders platform branding and production search metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("https://venezuelaagro.com/", {
      headers: { accept: "text/html" },
    }),
    productionEnv(),
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
    new Request("https://venezuelaagro.com/app-local", { headers: { accept: "text/html" } }),
    productionEnv(),
    { waitUntil() {}, passThroughOnException() {} },
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Modo local activo/);
  assert.match(response.headers.get('x-robots-tag') || '', /noindex/);
  assert.match(html, /Configura tu finca/);
  assert.doesNotMatch(html, /signin-with-chatgpt/);
});

test('account farm remains protected and noindex without a session',async()=>{
 const {default:worker}=await import(new URL('../dist/server/index.js',import.meta.url));
 const response=await worker.fetch(new Request('https://venezuelaagro.com/app'),productionEnv(),{waitUntil(){},passThroughOnException(){}});
 assert.equal(response.status,302);
 assert.match(response.headers.get('location')||'',/^\/auth\/signin\?return_to=/);
 assert.match(response.headers.get('x-robots-tag')||'',/noindex/);
});

test('learning guides remain readable if the content database is temporarily unavailable',async()=>{
 const workerUrl=new URL('../dist/server/index.js',import.meta.url);
 workerUrl.searchParams.set('learning-test',`${process.pid}-${Date.now()}`);
 const {default:worker}=await import(workerUrl.href);
 for(const [path,expected] of [['/aprende','Tu plataforma, paso a paso.'],['/aprende/trabajar-sin-internet','En modo local no se confirma un respaldo de cuenta.'],['/rubros','Maíz'],['/red','El campo tiene mucho que contar.'],['/fincas','Registra tu finca. Abre nuevas oportunidades.'],['/fincas/ejemplo-finca-comunidad','Ficha demostrativa'],['/fincas/ejemplo-finca-pollos','Proceso y duración'],['/red/ejemplo-publicacion-1','Compartir']]){
  const response=await worker.fetch(new Request(`https://venezuelaagro.com${path}`,{headers:{accept:'text/html'}}),productionEnv(),{waitUntil(){},passThroughOnException(){}});
  assert.equal(response.status,200,path);
  const html=await response.text();
  assert.ok(html.includes(expected),path);
  if(path==='/aprende/trabajar-sin-internet') {
   for(const guidance of ['Guardar escribe primero en el dispositivo.', 'al volver la señal, al regresar a la aplicación y periódicamente mientras está abierta.', 'comprueba pendientes, conflictos y confirmaciones.', 'Con conexión o cero cambios pendientes no bastan para demostrar que exista una copia central.']) assert.ok(html.includes(guidance),guidance);
  }
 }
});


test('principal public pages and SEO endpoints stay available without a database connection',async()=>{
 const {default:worker}=await import(new URL('../dist/server/index.js',import.meta.url));
 for(const path of ['/tienda','/marketplace','/profesionales','/proyectos','/nosotros','/plataforma','/guia-institucional','/legal/privacidad','/legal/terminos','/legal/comercio','/robots.txt','/sitemap.xml']){
  const response=await worker.fetch(new Request(`https://venezuelaagro.com${path}`),productionEnv(),{waitUntil(){},passThroughOnException(){}});
  assert.equal(response.status,200,path);const html=await response.text();
  if(path==='/tienda'){assert.match(html,/Elegir presentación/);assert.match(html,/Para mi negocio/);}
  if(path==='/robots.txt')assert.match(html,/Sitemap: https:\/\/venezuelaagro\.com\/sitemap\.xml/);
  if(path==='/sitemap.xml')assert.match(html,/<loc>https:\/\/venezuelaagro\.com/);
 }
});


test('offline shell contains full farm controls and no authenticated account identity',async()=>{
 const {default:worker}=await import(new URL('../dist/server/index.js',import.meta.url));
 const response=await worker.fetch(new Request('https://venezuelaagro.com/app-local',{headers:{'oai-authenticated-user-id':'test-owner','oai-authenticated-user-email':'private@example.test'}}),productionEnv(),{waitUntil(){},passThroughOnException(){}});
 const html=await response.text();assert.equal(response.status,200);assert.match(html,/Configura tu finca/);assert.match(html,/Sincronización/);assert.doesNotMatch(html,/private@example.test|test-owner/);
});

test('downloaded library shell and every required reference page render without private identity or no-store responses',async()=>{
 const {readFile}=await import('node:fs/promises');const manifest=JSON.parse(await readFile(new URL('../dist/client/offline-library-assets.json',import.meta.url),'utf8'));
 const {default:worker}=await import(new URL('../dist/server/index.js',import.meta.url));
 for(const path of manifest.pages){const response=await worker.fetch(new Request('https://venezuelaagro.com'+path,{headers:{'oai-authenticated-user-id':'private-test-owner','oai-authenticated-user-email':'private-test@example.test'}}),productionEnv(),{waitUntil(){},passThroughOnException(){}});assert.equal(response.status,200,path);assert.doesNotMatch(response.headers.get('cache-control')||'',/private|no-store/,path);const html=await response.text();assert.doesNotMatch(html,/private-test-owner|private-test@example.test/,path);}
 assert.ok(manifest.assets.some(item=>item.path.endsWith('.js')));assert.ok(manifest.assets.some(item=>item.path.endsWith('.css')));assert.ok(manifest.assets.some(item=>item.path.endsWith('.webp')));assert.ok(manifest.bytes<20*1024*1024);assert.ok(manifest.assets.every(item=>!item.path.startsWith('/api/')));
});

test('home market category links preserve exact labels independently of emoji width',async()=>{
 const workerUrl=new URL('../dist/server/index.js',import.meta.url);workerUrl.searchParams.set('market-links',`${process.pid}-${Date.now()}`);
 const {default:worker}=await import(workerUrl.href);
 const response=await worker.fetch(new Request('https://venezuelaagro.com/',{headers:{accept:'text/html'}}),productionEnv(),{waitUntil(){},passThroughOnException(){}});
 const html=await response.text();const categories=[...html.matchAll(/href="\/marketplace\?categoria=([^"&]+)"/g)].map(match=>decodeURIComponent(match[1]));
 assert.equal(categories.length,12);assert.ok(categories.includes('Herramientas y cercas'));
 assert.ok(categories.every(value=>value===value.trim()&&!/\p{Extended_Pictographic}/u.test(value)));
 for(const value of ['Bovinos','Cárnicos','Genética y reproducción','Verduras y hortalizas','Frutas','Semillas y plantas','Vitaminas y medicinas','Nutrición animal','Maquinaria agrícola','Drones y tecnología','Herramientas y cercas','Fincas y terrenos'])assert.ok(categories.includes(value),value);
});
