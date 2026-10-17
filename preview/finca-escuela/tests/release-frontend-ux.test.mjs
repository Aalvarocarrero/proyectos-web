import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(()=>vite.close());
const read=path=>readFile(root+path,'utf8');
const {normalizeDirectorySearch,matchesDirectorySearch}=await vite.ssrLoadModule('/lib/directory-search.ts');
const {marketplaceEmptyState}=await vite.ssrLoadModule('/lib/marketplace-load-state.ts');
const {demoSectionUrl,demoSectionFromSearch,demoSections}=await vite.ssrLoadModule('/lib/farm-demo-navigation.ts');

test('market and business search accept accents, casing and outer whitespace without mutating data',()=>{
 const values=['Café de Mérida','Productor de piña',null,undefined];
 assert.equal(normalizeDirectorySearch('  CAFÉ  '),'cafe');
 for(const query of ['cafe','MÉRIDA',' pina ','','   '])assert.equal(matchesDirectorySearch(values,query),true);
 assert.equal(matchesDirectorySearch(values,'no-existe'),false);
 assert.deepEqual(values,['Café de Mérida','Productor de piña',null,undefined]);
});

test('empty market distinguishes loading, failure, offline, genuinely empty and filtered content',()=>{
 assert.match(marketplaceEmptyState('loading',false,false).title,/Comprobando/);
 assert.match(marketplaceEmptyState('error',false,false).title,/No pudimos cargar/);
 assert.match(marketplaceEmptyState('offline',false,false).title,/No hay ofertas guardadas/);
 assert.match(marketplaceEmptyState('ready',false,false).title,/Todavía no hay ofertas/);
 for(const state of ['loading','ready','error','offline']){
  assert.match(marketplaceEmptyState(state,true,false).description,/búsqueda/);
  assert.match(marketplaceEmptyState(state,false,true).description,/búsqueda/);
 }
});

test('practice navigation is same-origin, whitelisted and preserves other query context',()=>{
 for(const section of demoSections){
  const relative=demoSectionUrl('https://example.test/finca-demo?source=guide#practice',section);
  const url=new URL(relative,'https://example.test');
  assert.equal(url.origin,'https://example.test');assert.equal(url.pathname,'/finca-demo');
  assert.equal(url.searchParams.get('source'),'guide');assert.equal(url.hash,'#practice');
  assert.equal(demoSectionFromSearch(url.search),section);
 }
 assert.equal(demoSectionFromSearch(new URL(demoSectionUrl('https://example.test/finca-demo','https://other.test'),'https://example.test').search),'Resumen');
});

test('unavailable company catalogue provides retry rather than asserting a known empty directory',async()=>{
 const {CompanyDirectory}=await vite.ssrLoadModule('/components/company-directory.tsx');
 const html=renderToStaticMarkup(React.createElement(CompanyDirectory,{companies:[],unavailable:true}));
 assert.match(html,/Directorio de empresas/);assert.match(html,/No se ha podido comprobar/);
 assert.match(html,/href="\/empresas"[^>]*>Volver a intentar/);
 assert.doesNotMatch(html,/0 empresas publicadas|El próximo aliado del campo/);
 const page=await read('app/empresas/page.tsx');assert.match(page,/<CompanyDirectory companies=\{companies\} unavailable=\{unavailable\}/);
});

test('filter resets return focus and preserve first-class search controls across directories',async()=>{
 for(const file of ['marketplace-browser','company-directory','professional-directory']){
  const source=await read(`components/${file}.tsx`);
  assert.match(source,/type="search"/);assert.match(source,/ref=\{searchInput\}/);
  assert.match(source,/searchInput.current\?\.focus\(\{preventScroll:true\}\)/);
 }
});

test('demo navigation uses browser history and protects unsaved practice forms',async()=>{
 const demo=await read('components/farm-demo-workspace.tsx');
 assert.match(demo,/history.pushState/);assert.match(demo,/addEventListener\("popstate",restoreSection\)/);
 assert.match(demo,/canDismissFarmDraft\(navigationDraft.current/);
 assert.match(demo,/<FarmDraftDialog open=\{!!editing\}/);assert.match(demo,/<FarmDraftDialog open=\{!!listing\}/);
 assert.match(demo,/ref=\{sectionHeading\} tabIndex=\{-1\}/);
 const form=await read('components/farm-record-form.tsx');
 assert.match(form,/onDraftStateChange\?\.\(true,gate.current.busy\)/);
});

test('canceling a main workspace navigation does not close the mobile menu or trigger synchronization',async()=>{
 const source=await read('components/farm-dashboard.tsx');
 assert.match(source,/if\(!changeView\(item.view\)\)event.preventDefault\(\)/);
 assert.match(source,/if\(!changeView\("sync"\)\)return;if\(initialReady/);
 assert.match(source,/aria-label="Cerrar aviso"/);
});

test('install guidance is dismissible with Escape and retains the automatic intro timing',async()=>{
 const source=await read('components/install-app-banner.tsx');
 assert.match(source,/event.key === "Escape" && !installing/);assert.match(source,/event.preventDefault\(\); void minimize\(true\)/);
 const {INSTALL_OFFER_DELAY_MS}=await vite.ssrLoadModule('/lib/install-guidance.ts');assert.ok(INSTALL_OFFER_DELAY_MS<=1000);
});

test('phone install introduction is compact until a deliberate tap, with a permanent touch close',async()=>{
 const banner=await read('components/install-app-banner.tsx'),css=await read('app/globals.css');
 assert.match(banner,/data-show-help=\{showHelp\}/);
 assert.match(banner,/sm:bottom-5 sm:left-auto sm:right-5 sm:mx-0 sm:max-w-sm/);
 assert.match(banner,/install-banner-close sticky top-0 z-20 flex min-h-11 min-w-11/);
 assert.match(banner,/aria-label="Minimizar aviso de instalación"/);
 assert.match(css,/@media \(max-width:639px\)/);
 assert.match(css,/install-banner\[data-show-help="false"\] \.install-banner-intro \{ display:none; \}/);
 assert.match(css,/\.install-banner-close \{ min-width:44px; min-height:44px; touch-action:manipulation; \}/);
 assert.match(css,/install-banner-action \{ margin-top:0; min-height:44px; width:100%/);
});
