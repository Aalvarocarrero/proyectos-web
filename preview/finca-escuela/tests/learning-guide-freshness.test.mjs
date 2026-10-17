import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createServer} from 'vite';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,cacheDir:'/tmp/agro-learning-guide-freshness',resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(()=>vite.close());
const {platformGuides}=await vite.ssrLoadModule('/lib/platform-guides.ts');
const {learningAction}=await vite.ssrLoadModule('/lib/learning-action.ts');
const {primaryNavigation,navigationGroups}=await vite.ssrLoadModule('/lib/site-navigation.ts');
const read=path=>readFile(root+path,'utf8');
const guide=slug=>{const match=platformGuides.find(item=>item.slug===slug);assert.ok(match,slug);return match;};
const copy=slug=>JSON.stringify(guide(slug));
const xml=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

test('first-access guide names every current primary destination and purpose group',()=>{
 const first=copy('primeros-pasos-registro');
 for(const [label]of primaryNavigation)assert.ok(first.includes(label),label);
 for(const group of navigationGroups){assert.ok(first.includes(group.label),group.label);for(const [label]of group.links)assert.ok(first.includes(label),label);}
 for(const label of ['Accesibilidad','Conexión','Sincronización'])assert.ok(first.includes(label),label);
 assert.match(first,/no confirma el envío ni una copia central/);
});

test('offline and weighing instructions match header state and explicit animal selection',()=>{
 const offline=copy('trabajar-sin-internet'),weights=copy('registrar-animales-pesajes');
 assert.match(offline,/cabecera pública, junto a Mi finca/);
 assert.match(offline,/cero cambios pendientes no bastan/);
 assert.match(offline,/Instalar la app web no descarga por sí solo todos los contenidos/);
 assert.match(weights,/selección de Animal vacía/);assert.match(weights,/aunque hayas usado el buscador/);assert.match(weights,/botón de peso de una fila conserva/);
});

test('market guide preserves optional original price and qualifies visible conversions',()=>{
 const market=copy('publicar-vender-mercado-agro');
 for(const label of ['USD','VES','COP','EUR','Fuentes y otras monedas','Fecha de la tasa','Última consulta a la fuente','BCV','BCE','TRM Colombia'])assert.ok(market.includes(label),label);
 assert.match(market,/déjalo vacío/);assert.match(market,/no escribas cero/);assert.match(market,/si falta una tasa verificada/);assert.match(market,/El precio y la unidad originales no se cambian/);
});

test('professional and store guides explain real tariff controls and temporary request drafts',()=>{
 const professional=copy('perfil-profesional-agro'),store=copy('comprar-tienda-los-morochos');
 for(const label of ['Tarifas por modalidad (opcional)','Importe','Moneda','Precio por','¿Cómo se reserva tu servicio?','Precio a consultar'])assert.ok(professional.includes(label),label);
 assert.match(professional,/modalidades sin tarifa quedan a consultar/);
 for(const label of ['Para mi hogar','Para mi negocio','Elegir presentación','Editar corte y cantidad','Solicitar disponibilidad','Solicitar cotización empresarial','Convertir un importe recibido'])assert.ok(store.includes(label),label);
 assert.match(store,/recargar o salir puede perder ese texto/);assert.match(store,/no la multiplica por la cantidad/);assert.match(store,/conserva los datos si el guardado falla/);
});

test('Finca Escuela guide describes the actual six separate fictional learning routes',async()=>{
 const school=guide('finca-escuela-cultivos-animales');assert.equal(school.tutorial.targetHref,'/juego-finca');
 const text=copy(school.slug),template=await read('learning/farm-learning.template.html');
 for(const label of ['Cultivos','Animales','Cuaderno']){assert.ok(text.includes(label));assert.ok(template.includes(label));}
 for(const name of ['cilantro','maíz','tomate','bovinos','porcinos','aves'])assert.ok(text.includes(name),name);
 assert.match(text,/siete pasos/);assert.match(text,/maíz, nueve/);assert.match(text,/aves, ocho/);assert.match(text,/se refiere solo a ese cultivo/);assert.match(text,/separados de Mi Finca/);assert.match(text,/no publica, cobra ni sincroniza/);assert.match(text,/no indica medicamentos ni dosis/);
});

test('every SVG is truthful, lightweight, accessible and ends with its own process outcome',async()=>{
 for(const article of platformGuides){
  assert.equal(article.updatedAt,'2026-10-15');assert.ok(article.tutorial.result);
  const hero=await read('public'+article.tutorial.visual);assert.match(hero,/ESQUEMA DIDÁCTICO/);assert.match(hero,/No es una captura de pantalla/);assert.match(hero,/<title/);assert.match(hero,/<desc/);assert.ok(Buffer.byteLength(hero)<6500);
  for(let step=1;step<=article.sections.length;step++){
   const svg=await read(`public/guias/${article.slug}-paso-${step}.svg`);assert.match(svg,/Esquema orientativo · No es una captura ni un vídeo/);assert.match(svg,/<title/);assert.ok(Buffer.byteLength(svg)<2500);assert.doesNotMatch(svg,/Guardado local; envío al recuperar conexión/);
   if(step===article.sections.length)assert.ok(svg.includes(xml(article.tutorial.result)),article.slug);
  }
 }
 const page=await read('app/aprende/[slug]/page.tsx');assert.match(page,/no una captura de pantalla ni un vídeo/);const catalog=await read('components/learning-catalog.tsx');assert.match(catalog,/Esquema didáctico:/);
});


test('article action invitation separates fictional practice, platform tasks and technical articles',async()=>{
 const school=learningAction(guide('finca-escuela-cultivos-animales').tutorial);
 assert.match(school.description,/ficticias/);assert.match(school.description,/separadas de Mi Finca/);assert.match(school.description,/progreso local/);
 for(const article of platformGuides.filter(item=>item.tutorial.targetHref!=='/juego-finca')){
  const action=learningAction(article.tutorial);
  assert.equal(action.kicker,'CONTINÚA CON LA GUÍA');
  assert.match(action.description,/herramienta correspondiente/);
  assert.doesNotMatch(action.description,/Configura tu finca|sin señal|sincroniz/);
 }
 assert.equal(learningAction(undefined).kicker,'LLEVA EL REGISTRO');
 assert.match(learningAction(undefined).description,/Configura tu finca/);
 const page=await read('app/aprende/[slug]/page.tsx');assert.match(page,/learningAction\(article.tutorial\)/);assert.match(page,/\{action.description\}/);
});


test('Finca guide describes expanded cycles, distinct modes and repeat observation honestly',async()=>{
 const source=await readFile(new URL('../lib/platform-guides.ts',import.meta.url),'utf8');
 const guide=source.slice(source.indexOf('"slug": "finca-escuela-cultivos-animales"'));
 assert.doesNotMatch(guide,/actividades educativas de tres pasos/);
 for(const text of ['maíz, nueve','aves, ocho','Explorar muestra instrucciones breves','Profundizar añade explicaciones','Volver a observar','sin reiniciar el progreso']) assert.ok(guide.includes(text),text);
});
