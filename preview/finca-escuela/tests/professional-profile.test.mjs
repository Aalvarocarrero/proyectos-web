import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false}});
after(()=>vite.close());
const {professionalDetailsSchema,professionalDetails,professionalCredential,professionalSeo}=await vite.ssrLoadModule('/lib/professional-profile.ts');
const base={id:'professional-test',name:'Profesional de prueba',profession:'Agronomía',state:'Apure',municipality:'El Nula',specialties:'Cacao, suelos',serviceMode:'Visitas programadas',introduction:'Asesoría en suelos y cultivos para productores del campo.',contact:'+58 412 1234567',credentialNote:'Registro declarado'};
test('preserves old professional credentials and accepts graduates with zero years',()=>{
 assert.equal(professionalCredential(base),'Registro declarado');
 assert.equal(professionalDetails(base).yearsExperience,0);
 const d=professionalDetailsSchema.parse({yearsExperience:0,careerStage:'Recién graduado',coverageStates:['Apure','Táchira']});
 const row={...base,credentialNote:JSON.stringify({credentialNote:'Título declarado',details:d})};
 assert.equal(professionalDetails(row).careerStage,'Recién graduado');assert.equal(professionalCredential(row),'Título declarado');
 assert.equal(professionalDetailsSchema.safeParse({yearsExperience:-1}).success,false);
 assert.equal(professionalDetailsSchema.safeParse({website:'javascript:alert(1)'}).success,false);
});
test('builds search metadata from declared profile content',()=>{
 const seo=professionalSeo({...base,details:professionalDetailsSchema.parse({coverageStates:['Táchira'],sectors:['Cacao']})});
 assert.match(seo.title,/Agronomía en Apure/);assert.ok(seo.keywords.includes('Táchira'));assert.equal(seo.keywords.filter(x=>x==='Cacao').length,1);assert.ok(seo.description.length<=160);
});
test('demo profiles render full sections without fabricated phone contacts',async()=>{
 const {professionalExamples}=await vite.ssrLoadModule('/lib/professional-examples.ts');
 const {ProfessionalProfileView}=await vite.ssrLoadModule('/components/professional-profile-view.tsx');
 assert.equal(professionalExamples.filter(p=>p.demo).length,12);
 for(const p of professionalExamples.filter(p=>p.demo)){
  const html=renderToStaticMarkup(React.createElement(ProfessionalProfileView,{profile:p}));
  for(const section of ['Perfil ficticio de demostración','Formación académica','Proyectos y participación','Contactar al profesional'])assert.ok(html.includes(section));
  assert.doesNotMatch(html,/href="tel:/);
 }
 const html=renderToStaticMarkup(React.createElement(ProfessionalProfileView,{profile:{...base,details:professionalDetailsSchema.parse({whatsapp:true,email:'prueba@example.com'})}}));
 assert.match(html,/tel:\+584121234567/);assert.match(html,/wa.me\/584121234567/);assert.match(html,/mailto:prueba@example.com/);
});
test('expanded sync payload is validated while legacy queue entries still work',async()=>{
 const {professionalPayloadSchema}=await vite.ssrLoadModule('/lib/sync-validation.ts');
 assert.equal(professionalPayloadSchema.safeParse(base).success,true);
 assert.equal(professionalPayloadSchema.safeParse({...base,profileDetails:{yearsExperience:0}}).success,true);
 assert.equal(professionalPayloadSchema.safeParse({...base,contact:'not a phone',profileDetails:{}}).success,false);
});
test('founder profession uses readable contrast on its dark card without altering ordinary cards',async()=>{
 const {ProfessionalDirectory}=await vite.ssrLoadModule('/components/professional-directory.tsx');
 const html=renderToStaticMarkup(React.createElement(ProfessionalDirectory,{initial:[{...base,founder:true}],examples:[]}));
 assert.match(html,/<p class="mt-2 text-sm font-semibold text-\[#b7d79a\]">Agronomía<\/p>/);
 const regular=renderToStaticMarkup(React.createElement(ProfessionalDirectory,{initial:[base],examples:[]}));
 assert.match(regular,/<p class="mt-2 text-sm font-semibold text-\[#4c6b3a\]">Agronomía<\/p>/);
 const luminance=hex=>{const rgb=hex.match(/\w\w/g).map(c=>parseInt(c,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];};
 assert.ok((luminance('b7d79a')+.05)/(luminance('211d1a')+.05)>=4.5);
});
