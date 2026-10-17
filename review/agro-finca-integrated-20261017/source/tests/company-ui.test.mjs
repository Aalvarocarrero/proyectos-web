import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false}});after(()=>vite.close());
const {companySchema}=await vite.ssrLoadModule('/lib/company.ts');
const c={...companySchema.parse({name:'Empresa ficticia QA',category:'Ferretería y construcción',description:'Ficha ficticia de pruebas locales, nunca inscrita en el directorio real.',state:'Apure',phone:'+584120000000'}),id:'demo-qa-only',status:'active',createdAt:'2026-10-11',updatedAt:'2026-10-11',logoUrl:null,galleryUrls:[],products:[]};
test('business directory has separate registration and complete accessible filters',async()=>{const {CompanyDirectory}=await vite.ssrLoadModule('/components/company-directory.tsx');const html=renderToStaticMarkup(React.createElement(CompanyDirectory,{companies:[c]}));assert.match(html,/Empresa ficticia QA/);assert.match(html,/empresa publicada/);assert.match(html,/\/empresas\/demo-qa-only/);assert.match(html,/type="search"/);assert.match(html,/Ubicación o cobertura/);assert.doesNotMatch(html,/undefined|null/);});
test('empty directory truthfully reports no businesses without inserting demos',async()=>{const {CompanyDirectory}=await vite.ssrLoadModule('/components/company-directory.tsx');const html=renderToStaticMarkup(React.createElement(CompanyDirectory,{companies:[]}));assert.match(html,/0 empresas publicadas/);assert.match(html,/después de que sus responsables las registren/);assert.match(html,/\/empresas\/registro/);});
test('profile renders own contact and marketplace links, with regulated-goods warning',async()=>{const {CompanyProfileView}=await vite.ssrLoadModule('/components/company-profile-view.tsx');const html=renderToStaticMarkup(React.createElement(CompanyProfileView,{company:{...c,products:[{id:'test-prod',name:'Herramienta demo',description:'Solo prueba',category:'Herramientas y cercas',unit:'unidad',availability:'Por confirmar',priceCents:1250,currency:'USD',marketplaceId:'listing-test'}]}}));assert.match(html,/12,50 USD/);assert.match(html,/\/marketplace\/listing-test/);assert.match(html,/href="tel:\+584120000000"/);assert.match(html,/No se admiten medicamentos regulados/);});
test('form has native validations, retained draft actions and image limits',async()=>{const {CompanyForm}=await vite.ssrLoadModule('/components/company-manager.tsx');const html=renderToStaticMarkup(React.createElement(CompanyForm,{company:null,userId:'test-owner',onSaved:async()=>{}}));for(const text of ['Guardar borrador','Recuperar borrador','960 px','Guardar y enviar a revisión','12 productos'])assert.match(html,new RegExp(text));assert.match(html,/name="phone"/);assert.match(html,/name="municipality"/);assert.match(html,/required=""/);assert.match(html,/image\/jpeg,image\/png,image\/webp/);});
test('veterinary example is editorial only with disabled contact and no fabricated prices',async()=>{const {veterinaryCompanyDemo:demo}=await vite.ssrLoadModule('/lib/company-demo.ts');const {CompanyProfileView}=await vite.ssrLoadModule('/components/company-profile-view.tsx');assert.equal(demo.demo,true);assert.equal(demo.id,'ejemplo-veterinaria');assert.equal(demo.phone,'');assert.equal(demo.email,'');assert.ok(demo.products.length>=4);assert.ok(demo.products.every(p=>p.priceCents===null&&!p.marketplaceId));const html=renderToStaticMarkup(React.createElement(CompanyProfileView,{company:demo}));assert.match(html,/EMPRESA FICTICIA/);assert.match(html,/Local de muestra creado con IA/);assert.match(html,/sin venta/);assert.match(html,/Crear la ficha de mi empresa/);assert.doesNotMatch(html,/href="(?:tel:|mailto:|https:\/\/wa\.me)/);});

test('company catalog supports all shared currencies, keeps original amounts and converts only stated prices',async()=>{
 const {CompanyForm}=await vite.ssrLoadModule('/components/company-manager.tsx');
 const {CompanyProfileView}=await vite.ssrLoadModule('/components/company-profile-view.tsx');
 const product={id:'test-euro',name:'Herramienta de prueba',description:'Solo prueba',category:'Herramientas y cercas',unit:'saco',availability:'Por confirmar',priceCents:1250,currency:'EUR',marketplaceId:''};
 for(const currency of ['USD','VES','COP','EUR']){
  const parsed=companySchema.parse({...c,products:[{...product,currency}]});
  assert.equal(parsed.products[0].priceCents,1250);assert.equal(parsed.products[0].currency,currency);
 }
 assert.equal(companySchema.safeParse({...c,products:[{...product,currency:'GBP'}]}).success,false);
 const profile=renderToStaticMarkup(React.createElement(CompanyProfileView,{company:{...c,products:[product]}}));
 assert.match(profile,/12,50 EUR/);assert.match(profile,/saco/);assert.match(profile,/Ver precio aproximado en otra moneda/);
 for(const variant of [{...c,products:[{...product,priceCents:null}]},{...c,demo:true,products:[product]}]){
  const html=renderToStaticMarkup(React.createElement(CompanyProfileView,{company:variant}));
  assert.doesNotMatch(html,/Ver precio aproximado en otra moneda/);
 }
 const form=renderToStaticMarkup(React.createElement(CompanyForm,{company:{...c,products:[product]},userId:'test-owner',onSaved:async()=>{}}));
 for(const currency of ['USD','VES','COP','EUR'])assert.match(form,new RegExp('value="'+currency+'"'));
 assert.match(form,/value="EUR" selected=""/);
});
