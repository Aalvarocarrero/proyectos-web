import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {createServer} from 'vite';
import * as THREE from 'three';
import {readFile} from 'node:fs/promises';
const vite=await createServer({root:process.cwd(),configFile:false,server:{middlewareMode:true,hmr:false,ws:false,watch:null}});after(()=>vite.close());
const {refineFarmAnimalAnatomy}=await vite.ssrLoadModule('/lib/farm-animal-anatomy.ts');
const {farmAnimalDetailBudget,nearestFarmAnimalDetails}=await vite.ssrLoadModule('/lib/farm-animal-lod.ts');
const {createAnimalModel}=await vite.ssrLoadModule('/lib/farm-3d-models.ts');
test('adaptive detail reaches any nearby animal, never only the first eighteen records',()=>{
 assert.equal(farmAnimalDetailBudget(4,8),18);assert.equal(farmAnimalDetailBudget(undefined,4),18);assert.equal(farmAnimalDetailBudget(),48);assert.equal(farmAnimalDetailBudget(8,8),128);
 const animals=Array.from({length:101},(_,i)=>({id:String(i),distance:100-i}));
 for(const cap of [18,48,128]){const ids=nearestFarmAnimalDetails(animals,cap,90);assert.equal(ids.size,Math.min(cap,91));assert.ok(ids.has('100'));assert.ok(!ids.has('0'));}
 assert.equal(nearestFarmAnimalDetails([{id:'invalid',distance:NaN}],128,90).size,0);
});
test('correction is deterministic, idempotent and preserves original texture objects',()=>{
 for(const kind of ['pig','cattle']){const material=new THREE.MeshStandardMaterial({name:'Animal coat',map:new THREE.Texture(),metalness:.2}),root=new THREE.Mesh(new THREE.SphereGeometry(.3,12,8).translate(.7,.6,0),material),map=material.map;
 refineFarmAnimalAnatomy(root,kind);const first=root.geometry.attributes.position.array.slice();refineFarmAnimalAnatomy(root,kind);assert.deepEqual(root.geometry.attributes.position.array,first);assert.equal(material.map,map);assert.equal(material.metalness,0);for(const n of first)assert.ok(Number.isFinite(n));if(kind==='pig')assert.ok(material.color.r>material.color.g*1.2);
 }
});
test('offline pig and cattle retain species-defining anatomy and bounded material draws',()=>{
 for(const kind of ['pig','cattle']){const root=createAnimalModel(kind,r=>r);assert.equal(root.userData.legCount,4);assert.ok(root.userData.features.includes('cloven-hooves'));assert.ok(root.userData.features.includes(kind==='pig'?'flat-snout-two-nostrils':'long-sloping-face'));assert.ok(root.children.length<=7);}
});
test('LOD keeps both bindings, hides inactive instances during movement and changes on camera position',async()=>{
 const source=await readFile('components/farm-masterplan-webgl.tsx','utf8');assert.ok(source.includes('updateAnimalLOD();updateVegetationLOD()'));assert.ok(source.includes('if(binding.active===false)continue'));assert.ok(source.includes('binding.detail===selected.has(id)'));assert.ok(source.includes('animalLodCamera.distanceToSquared'));assert.ok(source.includes('mesh.count=0'));assert.ok(source.includes('binding.index=binding.mesh.count++'));assert.ok(!source.includes('animalBindings.set(id,[])'));assert.ok(!source.includes('detailedAnimals<18'));
});
