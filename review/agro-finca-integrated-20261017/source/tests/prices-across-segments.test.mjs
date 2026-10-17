import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(()=>vite.close());
const {professionalDetailsSchema,professionalTariffSchema,professionalDetails,serviceModes,tariffUnits}=await vite.ssrLoadModule('/lib/professional-profile.ts');
const {farmRecordPayloadSchema,professionalPayloadSchema}=await vite.ssrLoadModule('/lib/sync-validation.ts');
const {farmRecordCurrency,summarizeFarmMoney}=await vite.ssrLoadModule('/lib/farm-money.ts');
const sample={mode:'Presencial',amount:12.50,currency:'EUR',unit:'sesión'};
const base={id:'professional-test',name:'Profesional de prueba',profession:'Agronomía',state:'Apure',municipality:'El Nula',specialties:'Cacao, suelos',serviceMode:'Visitas programadas',introduction:'Asesoría en suelos y cultivos para productores del campo.',contact:'+58 412 1234567',credentialNote:'Registro declarado'};
test('optional tariffs preserve old profiles and survive the existing credential envelope',()=>{
 assert.deepEqual(professionalDetails(base).tariffs,[]);
 const details=professionalDetailsSchema.parse({tariffs:[sample]});
 const row={...base,credentialNote:JSON.stringify({credentialNote:'Declarado',details})};
 assert.deepEqual(professionalDetails(row).tariffs,[sample]);
 assert.deepEqual(professionalPayloadSchema.parse({...base,profileDetails:details}).profileDetails.tariffs,[sample]);
});
test('tariffs validate all six real modalities, four currencies and supported service units',()=>{
 assert.equal(serviceModes.length,6);
 for(const mode of serviceModes)for(const currency of ['USD','EUR','COP','VES'])for(const unit of tariffUnits)assert.ok(professionalTariffSchema.safeParse({...sample,mode,currency,unit}).success);
 for(const amount of [-1,0,NaN,Infinity,20_000_001,.001])assert.equal(professionalTariffSchema.safeParse({...sample,amount}).success,false);
 for(const patch of [{currency:'GBP'},{mode:'Inventado'},{unit:'inventada'},{amount:''},{amount:'12.50'}])assert.equal(professionalTariffSchema.safeParse({...sample,...patch}).success,false);
 assert.equal(professionalDetailsSchema.safeParse({tariffs:[sample,sample]}).success,false);
});
test('published tariffs show the unchanged original amount and an optional converter; absent prices are explicit',async()=>{
 const {ProfessionalTariffs,ProfessionalTariffFields,tariffsToDraft}=await vite.ssrLoadModule('/components/professional-tariffs.tsx');
 const html=renderToStaticMarkup(React.createElement(ProfessionalTariffs,{tariffs:[sample]}));
 assert.match(html,/EUR 12,50/);assert.match(html,/por sesión/);assert.match(html,/Presencial/);assert.match(html,/otra moneda/);
 assert.match(renderToStaticMarkup(React.createElement(ProfessionalTariffs,{tariffs:[]})),/Precio a consultar/);
 const editor=renderToStaticMarkup(React.createElement(ProfessionalTariffFields,{value:tariffsToDraft([sample]),onChange(){}}));
 assert.equal((editor.match(/type="checkbox"/g)||[]).length,6);assert.equal((editor.match(/type="number"/g)||[]).length,1);
 assert.match(editor,/value="EUR" selected/);assert.match(editor,/value="12.5"/);
});
test('farm sums never combine currencies and legacy records retain their original USD meaning',()=>{
 const records=[{kind:'Ingreso',amount:100},{kind:'Costo',amount:10,currency:'USD'},{kind:'Ingreso',amount:200,currency:'EUR'},{kind:'Costo',amount:20,currency:'EUR'},{kind:'Costo',amount:30000,currency:'COP'},{kind:'Costo',amount:NaN,currency:'VES'},{amount:500,currency:'GBP'}].map(data=>({payload:{data}}));
 const before=structuredClone(records),summary=summarizeFarmMoney(records);
 assert.deepEqual(summary.groups.USD,{income:100,cost:10,count:2});assert.deepEqual(summary.groups.EUR,{income:200,cost:20,count:2});assert.deepEqual(summary.groups.COP,{income:0,cost:30000,count:1});
 assert.equal(summary.legacyCount,1);assert.equal(summary.invalidCount,2);assert.deepEqual(records,before);assert.equal(farmRecordCurrency({}),'USD');assert.equal(farmRecordCurrency({currency:'GBP'}),null);
});
test('sync rejects invalid original financial currency and amounts without requiring migration',()=>{
 const payload={farmId:'farm-test',recordType:'finance',title:'Prueba',data:{amount:10}};
 assert.ok(farmRecordPayloadSchema.safeParse(payload).success);
 for(const currency of ['USD','EUR','COP','VES'])assert.equal(farmRecordPayloadSchema.parse({...payload,data:{amount:10,currency}}).data.currency,currency);
 for(const data of [{amount:-1},{amount:NaN},{amount:Infinity},{amount:'10'},{amount:10,currency:'JPY'},{amount:3_000_000_000}])assert.equal(farmRecordPayloadSchema.safeParse({...payload,data}).success,false);
 for(const recordType of ['finance','plan'])assert.equal(farmRecordPayloadSchema.safeParse({...payload,recordType,data:{costPerUnit:-1,amount:-1,expectedRevenue:Infinity}}).success,false);
});
test('store calculator starts empty, has four source currencies and never invents a catalog price',async()=>{
 const {CurrencyCalculator}=await vite.ssrLoadModule('/components/currency-calculator.tsx');
 const html=renderToStaticMarkup(React.createElement(CurrencyCalculator,{description:'Usa el importe de tu cotización.'}));
 assert.match(html,/value=""/);for(const currency of ['USD','EUR','COP','VES'])assert.match(html,new RegExp(`value="${currency}"`));
 assert.match(html,/no modifica tu solicitud/);
 const store=await readFile(root+'components/store-catalog.tsx','utf8');assert.match(store,/Convertir una cotización/);
 const {storeProducts}=await vite.ssrLoadModule('/lib/store-products.ts');assert.ok(storeProducts.every(product=>!('price' in product)&&!('priceCents' in product)));
});

test('legacy profile editor ignores invalid unrelated details and safely loads only valid tariffs',async()=>{
 const {professionalTariffsForEditing}=await vite.ssrLoadModule('/lib/professional-profile.ts');
 for(const details of [undefined,null,'legacy',[],{yearsExperience:'unknown'}, {tariffs:'invalid'}, {tariffs:[{...sample,amount:-1}]}])assert.deepEqual(professionalTariffsForEditing(details),[]);
 assert.deepEqual(professionalTariffsForEditing({yearsExperience:'unknown',website:'invalid',tariffs:[sample]}),[sample]);
 const {ProfessionalForm}=await vite.ssrLoadModule('/components/community-forms.tsx');
 const html=renderToStaticMarkup(React.createElement(ProfessionalForm,{name:base.name,initial:{id:base.id,payload:{...base,profileDetails:{yearsExperience:'unknown',tariffs:[sample]}},serverRevision:'r1'}}));
 assert.match(html,/Tarifas por modalidad/);assert.match(html,/value="12.5"/);assert.match(html,/value="EUR" selected/);
});
