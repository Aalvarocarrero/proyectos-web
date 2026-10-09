import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},plugins:[{name:'example-hooks',enforce:'pre',transform(code,id){if(id.endsWith('/components/public-farm-examples.tsx'))return code.replace('import {useState} from "react";','const useState=()=>[globalThis.__selectedExample??null,()=>{}];');}}],server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(async()=>{await vite.close();delete globalThis.__selectedExample;});
const {PublicFarmExamples}=await vite.ssrLoadModule('/components/public-farm-examples.tsx');
const {Dialog}=await vite.ssrLoadModule('/components/ui/dialog.tsx');
const {publicFarmSchema}=await vite.ssrLoadModule('/lib/network-profile.ts');
const examples=JSON.parse(await readFile(root+'lib/public-registration-examples.json','utf8'));
test('six examples cover the current farm-type enum and intentionally fail only missing real phone',()=>{assert.deepEqual(new Set(examples.map(e=>e.payload.farmType)),new Set(['Productora','Turística','Mixta','Cultivos y cosechas','Transformación de alimentos','Propiedad en venta']));for(const e of examples){assert.equal(e.demo,true);assert.equal(e.previewOnly,true);assert.equal(e.payload.phone,'');assert.deepEqual(e.payload.socials,{});const result=publicFarmSchema.safeParse(e.payload);assert.equal(result.success,false);assert.deepEqual(new Set(result.error.issues.map(i=>i.path[0])),new Set(['phone']));}});
test('selection cards render all six choices without registering public data',()=>{globalThis.__selectedExample=null;const html=renderToStaticMarkup(React.createElement(PublicFarmExamples));for(const e of examples)assert.ok(html.includes(e.payload.farmType));assert.equal((html.match(/Ver ficha de ejemplo/g)||[]).length,6);assert.match(html,/no completa ni envía tu formulario/);assert.doesNotMatch(html,/<form|href="tel:|href="mailto:/);});
function nodes(node){if(!node||typeof node!=='object')return [];if(Array.isArray(node))return node.flatMap(nodes);return [node,...nodes(node.props?.children)];}
test('each selected preview exposes full fields with no operational contact or submission control',()=>{for(const example of examples){globalThis.__selectedExample=example.id;const tree=PublicFarmExamples();const content=nodes(tree).find(n=>n.type?.name==='DialogContent');assert.ok(content);const html=renderToStaticMarkup(React.createElement(Dialog,{open:true},content.props.children));for(const label of ['Responsable','Teléfono público','Proceso de producción','Productos y formas de venta','Actividades públicas','Condiciones de visitas','Foto o logo','Redes y sitio web'])assert.ok(html.includes(label));assert.match(html,/Sin teléfono de ejemplo/);assert.doesNotMatch(html,/<form|type="submit"|href="tel:|href="mailto:/);}});
test('preview source has no persistence, real-form mutation, automatic fill or network path',async()=>{const source=await readFile(root+'components/public-farm-examples.tsx','utf8');assert.doesNotMatch(source,/queueMutation|syncNow|fetch\(|localStorage|indexedDB|onSave|FormData|dispatchEvent/);});
