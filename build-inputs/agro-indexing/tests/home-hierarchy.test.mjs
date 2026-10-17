import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const page=await read('components/home-page-content.tsx');
const css=await read('app/globals.css');
const header=await read('components/site-header.tsx');

test('Mi Finca demonstration is the next full section after the hero, before competing pathways',()=>{
 const heroEnd=page.indexOf('</section>');
 const next=page.slice(heroEnd).match(/<section[^>]+>/)?.[0];
 assert.match(next,/id="mi-finca"/);
 assert.ok(page.indexOf('<HomeFarmPreview')<page.indexOf('home-routes-title'));
 assert.equal((page.match(/<HomeFarmPreview/g)||[]).length,1);
 assert.equal((page.match(/<h1 /g)||[]).length,1);
});
test('hero clearly describes the product and offers example before commitment, without prefetching 3D routes',()=>{
 const hero=page.slice(page.indexOf('<section'),page.indexOf('</section>'));
 assert.match(hero,/content.heroDescription/);
 assert.match(readFileSync(new URL('../lib/home-content.ts',import.meta.url),'utf8'),/animales, cultivos y cuentas con Mi Finca/);
 assert.match(hero,/className="button-primary" href="\/finca-modelo" prefetch=\{false\}/);
 assert.match(hero,/className="button-glass" href="\/app" prefetch=\{false\}/);
 assert.doesNotMatch(hero,/href="\/marketplace"/);
 assert.match(hero,/href="#mi-finca"/);
});
test('all core routes remain visible and mobile header labels the farm destination',()=>{
 for(const route of ['marketplace','red','aprende','profesionales','empresas'])assert.ok(page.includes(`href:'/${route}'`));
 for(const route of ['tienda','fincas','proyectos','nosotros','plataforma','guia-institucional'])assert.ok(page.includes(`href="/${route}`));
 assert.match(header,/<span[^>]*>Mi finca<\/span>/);
 assert.match(header,/desktopNavigation.map/);
 assert.match(header,/OFFICIAL_SOCIAL_LINKS.map/);
});
test('original image sources, production categories, provenance, footer and offline caveats survive',()=>{
 for(const asset of ['hero-apure-1200.webp','legado-familiar.webp','tecnologia-campo.webp','morochito-transparent.webp','photos/llaneros-apure.webp'])assert.ok(page.includes(asset));
 for(const value of ['productionAreas.map','marketplaceCategories.map','<PublicFooter','<PhotoCredit','Andrés Abelino Vásquez','Flor Elba Ibañez','tu finca empieza con tus propios datos','Prepara Mi Finca con internet','pendientes, conflictos y confirmaciones','No confirma inventario ni precio de venta','Sin suscripción para usar las herramientas actuales'])assert.ok(page.includes(value),value);
 assert.doesNotMatch(page,/testimonio|\+10\.000|miles de productores|garantizado/i);
});
test('responsive demonstration precedes details on phones and keyboard targets have visible focus',()=>{
 assert.match(css,/home-farm-layout > \[data-home-farm-preview\] \{ grid-column: 1; grid-row: 2;/);
 assert.match(css,/home-farm-details \{ grid-column: 1; grid-row: 3;/);
 assert.match(css,/home-page a:focus-visible/);
 assert.match(css,/home-route-link \{ min-height: 76px/);
 assert.match(css,/scroll-margin-top: 6\.5rem/);
});
test('mobile focus follows introduction, model, then primary actions; learning avoids doubled section padding',()=>{
 const intro=page.indexOf('className="home-farm-intro');
 const preview=page.indexOf('<HomeFarmPreview');
 const details=page.indexOf('className="home-farm-details');
 assert.ok(intro<preview&&preview<details);
 assert.match(page,/className="home-learning border-y/);
 assert.match(css,/:not\(\.home-routes\):not\(\.home-learning\):not\(\.home-closing\) \{ padding-top:/);
});
