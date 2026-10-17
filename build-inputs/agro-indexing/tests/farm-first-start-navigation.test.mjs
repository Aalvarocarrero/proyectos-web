import assert from 'node:assert/strict';
import test, {after} from 'node:test';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';

const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({root,configFile:false,appType:'custom',server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
const {FarmFirstStart}=await vite.ssrLoadModule('/components/farm-first-start.tsx');
const savedStorage=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
after(async()=>{await vite.close();if(savedStorage)Object.defineProperty(globalThis,'localStorage',savedStorage);else delete globalThis.localStorage;});

for(const blocked of [false,true])test(`first-start model link is available with ${blocked?'unavailable':'empty'} storage and no continuation callback`,()=>{
 const reads=[];
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{
  getItem(key){reads.push(key);if(blocked)throw new Error('Storage blocked');return null;},
  setItem(){assert.fail('Opening examples must not save a first-start choice');},
  removeItem(){assert.fail('Opening examples must not delete a saved choice');},
  clear(){assert.fail('Opening examples must not clear any storage');},
 }});
 const html=renderToStaticMarkup(React.createElement(FarmFirstStart,{owner:'test owner@example.invalid',onContinue(){assert.fail('Model navigation must not need onContinue');}}));
 assert.match(html,/<a href="\/finca-modelo" class="button-dark">Mostrar ejemplos de 10 ha<\/a>/);
 assert.match(html,/recorrido 3D, plano 2D y todos sus registros/);
 assert.match(html,/práctica editable guardada se conserva/);
 assert.match(html,/<button[^>]*>Empezar mi finca vacía<\/button>/);
 assert.deepEqual(reads,['venezuela-agro-first-start-v1:test%20owner%40example.invalid']);
});

test('model navigation uses browser-native links without a storage or continuation event handler',async()=>{
 const source=await readFile(root+'components/farm-first-start.tsx','utf8');
 const modelLink=source.match(/<a\b[^>]*href="\/finca-modelo"[^>]*>/)?.[0];
 assert.ok(modelLink);
 assert.doesNotMatch(modelLink,/onClick|onMouseDown|onPointerDown/);
 assert.doesNotMatch(source,/window\.location|choose\("demo"\)|resetDemo|mutateDemo|loadDemo/);
 assert.match(source,/onClick=\{\(\)=>choose\("empty"\)\}/,'the separate empty-workspace choice retains its explicit continuation');
});
