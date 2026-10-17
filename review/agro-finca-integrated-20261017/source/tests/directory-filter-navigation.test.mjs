import test,{after} from 'node:test';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,watch:null}});
after(()=>vite.close());
const {readDirectoryFilters,updateDirectoryFilters,safeDirectoryReturn}=await vite.ssrLoadModule('/lib/directory-filters.ts');
const defaults={q:'',categoria:'Todo',contenido:''};
test('filters restore accents and categories without dropping route context',()=>{
 assert.deepEqual(readDirectoryFilters('?q=caf%C3%A9&categoria=Cultivos&ejemplo=demo',defaults),{q:'café',categoria:'Cultivos',contenido:''});
 assert.equal(updateDirectoryFilters('https://test.invalid/marketplace?ejemplo=demo#buscar',defaults,{q:'café',categoria:'Cultivos'}),'/marketplace?ejemplo=demo&q=caf%C3%A9&categoria=Cultivos#buscar');
});
test('reset removes all filters while preserving unrelated parameters and anchors',()=>{
 assert.equal(updateDirectoryFilters('https://test.invalid/marketplace?q=cafe&categoria=Cultivos&contenido=examples&ejemplo=demo#buscar',defaults,defaults),'/marketplace?ejemplo=demo#buscar');
 assert.equal(updateDirectoryFilters('https://test.invalid/marketplace',defaults,{unexpected:'value'}),'/marketplace');
});
test('return navigation cannot be redirected outside its directory',()=>{
 for(const value of [null,'https://evil.test/marketplace?q=x','//evil.test/marketplace','/admin','javascript:alert(1)'])assert.equal(safeDirectoryReturn(value,'/marketplace'),'/marketplace');
 assert.equal(safeDirectoryReturn('/marketplace?q=cacao&categoria=Cultivos#old','/marketplace'),'/marketplace?q=cacao&categoria=Cultivos');
});
test('all three directories keep filters and detail pages offer a safe return',async()=>{
 for(const component of ['marketplace-browser','company-directory','professional-directory']){
  const code=await readFile(root+`components/${component}.tsx`,'utf8');assert.match(code,/useDirectoryFilters/);assert.match(code,/Limpiar filtros/);assert.match(code,/searchInput.current\?\.focus/);
 }
 for(const route of ['marketplace','empresas','profesionales'])assert.match(await readFile(root+`app/${route}/[id]/page.tsx`,'utf8'),/<DirectoryReturnLink/);
 const hook=await readFile(root+'hooks/use-directory-filters.ts','utf8');assert.match(hook,/popstate/);assert.match(hook,/replaceState\(window.history.state/);assert.match(hook,/delete\("ejemplo"\)/);
});
test('company form checks the existing schema before any submission',async()=>{
 const code=await readFile(root+'components/company-manager.tsx','utf8');assert.match(code,/companySchema.safeParse\(collect\(form\)\)/);assert.ok(code.indexOf('const validation=')<code.indexOf("method:company?'PATCH':'POST'"));assert.match(code,/submitLock.current=false;reportDraftState\(\);return/);
});
test('demo company profiles gate all outbound commercial actions even with contact data',async()=>{
 const {CompanyProfileView}=await vite.ssrLoadModule('/components/company-profile-view.tsx');
 const {veterinaryCompanyDemo}=await vite.ssrLoadModule('/lib/company-demo.ts');
 const company={...veterinaryCompanyDemo,phone:'+58 414 1234567',whatsapp:true,email:'company@example.com',website:'https://example.com',instagram:'https://instagram.com/example',facebook:'https://facebook.com/example',products:[{...veterinaryCompanyDemo.products[0],marketplaceId:'real-listing'}]};
 const render=demo=>renderToStaticMarkup(React.createElement(CompanyProfileView,{company:{...company,demo}}));
 const hrefs=html=>[...html.matchAll(/href="([^"]+)"/g)].map(match=>match[1]);
 const demoLinks=hrefs(render(true)),realLinks=hrefs(render(false));
 for(const prefix of ['tel:','mailto:','https://wa.me/','https://example.com','https://instagram.com/example','https://facebook.com/example','/marketplace/real-listing']){
  assert.equal(demoLinks.some(href=>href.startsWith(prefix)),false,`Demo leaked ${prefix}`);
  assert.equal(realLinks.some(href=>href.startsWith(prefix)),true,`Real profile lost ${prefix}`);
 }
 assert.match(render(true),/WhatsApp · Ejemplo/);
});
