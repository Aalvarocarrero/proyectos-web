import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFile} from 'node:fs/promises';
import {createServer} from 'vite';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false}});after(()=>vite.close());
const render=(Component,props={})=>renderToStaticMarkup(React.createElement(Component,props));
test('error and local-save feedback have distinct accessible semantics',async()=>{
 const {FormFeedback}=await vite.ssrLoadModule('/components/form-feedback.tsx');
 assert.match(render(FormFeedback,{message:'Revisa el correo',tone:'error'}),/role="alert"/);
 assert.match(render(FormFeedback,{message:'Guardado localmente',tone:'info'}),/role="status"/);
 assert.doesNotMatch(render(FormFeedback,{message:'Guardado localmente',tone:'info'}),/check-circle/);
 assert.equal(render(FormFeedback,{message:''}),'');
});
test('email mismatch and schema fields yield useful Spanish messages',async()=>{
 const {publicFormError}=await vite.ssrLoadModule('/lib/public-form-errors.ts');
 assert.equal(publicFormError(new Error('Confirma el mismo correo electrónico.'),'fallback'),'Confirma el mismo correo electrónico.');
 const invalid=Object.assign(new Error('internal schema data'),{issues:[{path:['profileDetails','email'],code:'invalid_string'}]});
 assert.match(publicFormError(invalid,'fallback'),/Revisa el correo/);
 assert.doesNotMatch(publicFormError(invalid,'fallback'),/internal schema/);
 assert.equal(publicFormError(new Error('unknown'),'safe fallback'),'safe fallback');
});
test('real public farm form explains review and required activities',async()=>{
 const {PublicFarmForm}=await vite.ssrLoadModule('/components/agro-network.tsx');
 const html=render(PublicFarmForm,{userId:'qa-only',name:'QA',onSave:async()=>false});
 assert.match(html,/Completa · Revisa · Envía/);
 assert.match(html,/Selecciona al menos una actividad/);
 assert.match(html,/aria-busy="false"/);
 assert.match(html,/no la publica/);
});
test('marketplace form shows required fields and accurate offline expectations',async()=>{
 const {ListingForm}=await vite.ssrLoadModule('/components/listing-form.tsx');
 const html=render(ListingForm,{sellerName:'QA',draftOwner:'local'});
 assert.match(html,/Título de la publicación \*/);
 assert.match(html,/Detalles útiles \*/);
 assert.match(html,/conexión, sesión y permisos de publicación/);
 assert.doesNotMatch(html,/pasará a revisión automáticamente/);
});
test('submission guards and own-operation receipts protect repeated clicks and pending results',async()=>{
 for (const file of ['company-manager.tsx','professional-manager.tsx','agro-network.tsx']) {
  const source=await readFile(`${root}/components/${file}`,'utf8');
  assert.match(source,/useRef/);
 }
 const professional=await readFile(`${root}/components/professional-manager.tsx`,'utf8');
 assert.match(professional,/getOperationStatus\(operation.id\)/);
 assert.doesNotMatch(professional,/result.ok\?"Perfil retirado/);
 const community=await readFile(`${root}/components/community-forms.tsx`,'utf8');
 assert.match(community,/defaultValue=\{defaultValue\}/);
 assert.match(community,/disabled=\{working\}/);
});
