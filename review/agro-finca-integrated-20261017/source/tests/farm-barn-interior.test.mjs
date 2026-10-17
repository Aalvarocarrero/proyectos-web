import assert from 'node:assert/strict';import test,{after} from 'node:test';import {createServer} from 'vite';import {fileURLToPath} from 'node:url';import * as THREE from 'three';
const root=fileURLToPath(new URL('..',import.meta.url)),vite=await createServer({root,configFile:false,appType:'custom',resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});after(()=>vite.close());const {createFarmBarnInterior,preserveFarmGroup}=await vite.ssrLoadModule('/lib/farm-barn-interior.ts');
test('original barn keeps detachable roof and visible interior without inferred inventory',()=>{const resources=[],{group,roof}=createFarmBarnInterior(r=>(resources.push(r),r)),box=new THREE.Box3().setFromObject(group);assert.ok(box.min.x>=-.501&&box.max.x<=.501);assert.ok(box.min.z>=-.371&&box.max.z<=.371);assert.ok(box.min.y>=-.036001&&box.max.y<.7);let triangles=0,meshes=0;group.traverse(o=>{assert.equal(o.userData.areaId,undefined);assert.equal(o.userData.animalId,undefined);if(o.isMesh){assert.ok(preserveFarmGroup(o));assert.ok(resources.includes(o.geometry));assert.ok(resources.includes(o.material));assert.ok([...o.geometry.attributes.position.array].every(Number.isFinite));triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;meshes++;}});assert.ok(triangles<1000);assert.ok(meshes<=7);roof.visible=false;assert.ok(group.children.some(o=>o.isMesh&&o.visible));roof.visible=true;assert.ok(roof.visible);assert.equal(preserveFarmGroup(new THREE.Mesh()),false);resources.forEach(r=>r.dispose());});

test('pig bedding and feeder stay low while posts, roof and exact collision volumes remain available',()=>{
 const resources=[],own=r=>(resources.push(r),r),normal=createFarmBarnInterior(own),small=createFarmBarnInterior(own,{smallLivestock:true});
 assert.equal(normal.solids.length,small.solids.length);assert.ok(small.solids.length>20);
 assert.ok(small.solids.some((box,i)=>box.max.y<normal.solids[i].max.y));
 assert.deepEqual(small.roof.children[0].geometry.attributes.position.array,normal.roof.children[0].geometry.attributes.position.array);
 for(const box of small.solids)assert.ok([...box.min.toArray(),...box.max.toArray()].every(Number.isFinite));
 for(const r of resources)r.dispose();
});
