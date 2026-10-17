import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createServer} from 'vite';
import * as THREE from 'three';
const root=fileURLToPath(new URL('..',import.meta.url)),vite=await createServer({root,configFile:false,appType:'custom',resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});after(()=>vite.close());
const {createFarmSoilTexture,addFarmSurfaceVariation}=await vite.ssrLoadModule('/lib/farm-landscape-detail.ts');
test('original soil detail is deterministic, mipmapped, opaque and only 64 KiB resident base pixels',()=>{
 const a=createFarmSoilTexture(),b=createFarmSoilTexture();assert.equal(a.image.data.length,65536);assert.deepEqual(a.image.data,b.image.data);assert.equal(a.image.width,128);assert.equal(a.generateMipmaps,true);assert.equal(a.minFilter,THREE.LinearMipmapLinearFilter);assert.equal(a.wrapS,THREE.RepeatWrapping);assert.equal(a.colorSpace,THREE.SRGBColorSpace);assert.ok(new Set(a.image.data).size>40);for(let i=3;i<a.image.data.length;i+=4)assert.equal(a.image.data[i],255);a.dispose();b.dispose();
});
test('surface shading adds finite reusable vertex colors without altering topology or positions',()=>{
 const geometry=new THREE.BoxGeometry(1,2,3),positions=geometry.attributes.position.array.slice(),index=geometry.index.array.slice();assert.equal(addFarmSurfaceVariation(geometry),geometry);assert.deepEqual(geometry.attributes.position.array,positions);assert.deepEqual(geometry.index.array,index);assert.equal(geometry.attributes.color.count,geometry.attributes.position.count);assert.ok([...geometry.attributes.color.array].every(n=>Number.isFinite(n)&&n>.7&&n<1.15));geometry.dispose();
});
test('renderer separates dry ground from vegetation and preserves local detail budgets',async()=>{
 const source=await readFile(root+'components/farm-masterplan-webgl.tsx','utf8');assert.match(source,/map:\['pasture','forest','nursery','other'\]\.includes\(area.use\)\?grass:soilTexture/);assert.match(source,/cropCount<192/);assert.match(source,/grassPoints.length>=1200/);assert.match(source,/sun.position.set\(-60,110,-40\)/);assert.match(source,/new THREE.DirectionalLight\('#fff4e6',2.2\)/);
});
