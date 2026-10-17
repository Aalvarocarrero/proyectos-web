import assert from 'node:assert/strict';import test,{after} from 'node:test';import {createServer} from 'vite';import {fileURLToPath} from 'node:url';import {Vector3,PerspectiveCamera} from 'three';import {readFile} from 'node:fs/promises';
const root=fileURLToPath(new URL('..',import.meta.url)),vite=await createServer({root,configFile:false,appType:'custom',server:{middlewareMode:true,hmr:false,ws:false,watch:null}});after(()=>vite.close());const {farmFitDistance,farmOrbitFitDistance,focusFarmPoint}=await vite.ssrLoadModule('/lib/farm-webgl-framing.ts');
test('actual projected 10ha corners fit portrait and desktop without sphere excess',()=>{for(const aspect of [326/360,390/440,1165/560]){const points=[-50,50].flatMap(x=>[-31.25,31.25].flatMap(z=>[0,2].map(y=>new Vector3(x,y,z)))),direction=new Vector3(.92,.93,1.05),distance=farmFitDistance(points,direction,aspect),camera=new PerspectiveCamera(42,aspect,.1,1600);camera.position.copy(direction.normalize().multiplyScalar(distance));camera.lookAt(0,0,0);camera.updateMatrixWorld();for(const p of points){const ndc=p.clone().project(camera);assert.ok(Math.abs(ndc.x)<1&&Math.abs(ndc.y)<1);}assert.ok(Math.max(...points.map(p=>{const n=p.clone().project(camera);return Math.max(Math.abs(n.x),Math.abs(n.y));}))>.75);}});
test('close-up targets saved coordinates, preserves scale and makes 2.4m animal discernible',()=>{const camera=new PerspectiveCamera(42,326/360,.1,1600),target=new Vector3(),point=new Vector3(24,.1,-12);camera.position.set(140,140,160);const before=point.clone();focusFarmPoint(camera,target,point,3,camera.aspect);camera.lookAt(target);camera.updateMatrixWorld();assert.deepEqual(point,before);assert.deepEqual(target,point);assert.ok(camera.position.y>point.y);const a=point.clone().add(new Vector3(-.3,0,0)).project(camera),b=point.clone().add(new Vector3(.3,0,0)).project(camera);assert.ok(Math.hypot((b.x-a.x)*326/2,(b.y-a.y)*360/2)>25);});
test('far foliage retains solid crown LOD and loaded ground preserves land-use tint',async()=>{const code=await readFile(new URL('../components/farm-masterplan-webgl.tsx',import.meta.url),'utf8');assert.match(code,/close\?zero:crownMatrices/);assert.match(code,/branchMesh.visible=leafMesh.visible=close/);assert.match(code,/updateVegetationLOD\(\);updateFarmSurroundingsLOD\(surroundings,camera\);try\{renderer.render/);assert.doesNotMatch(code,/material.color.lerp/);assert.match(code,/pasture:'#a8b98c'/);assert.match(code,/Animal de cerca/);assert.match(code,/cropFocusPoints.push/);assert.match(code,/catch\{failRef.current\(\);return;\}/);const css=await readFile(new URL('../app/globals.css',import.meta.url),'utf8');assert.match(css,/body:has\(\[data-masterplan-immersive\]\) \[data-social-control\]/);});

test('floating launcher exclusion covers the common editor including fallback and 2D',async()=>{const code=await readFile(new URL('../components/farm-map-editor.tsx',import.meta.url),'utf8');assert.match(code,/<section data-masterplan-immersive>/);});

test('automatic tour opens wide while manual-only detail presets and load status remain available',async()=>{const code=await readFile(new URL('../components/farm-masterplan-webgl.tsx',import.meta.url),'utf8');assert.match(code,/if\(initialDetail&&!autoTour\)focus\(initialDetail\)/);assert.match(code,/animales ubicados · \{assetStatus\}/);assert.match(code,/renderer.debug.onShaderError/);});


test('constant-radius aerial orbit frames every parcel corner at all headings on phones and desktop',()=>{
 const elevation=Math.PI/4;
 for(const aspect of [280/560,326/440,390/440,800/560,1440/560,2000/400]){
  const points=[-50,50].flatMap(x=>[-31.25,31.25].flatMap(z=>[0,2,8].map(y=>new Vector3(x,y,z))));
  const distance=farmOrbitFitDistance(points,aspect,elevation),camera=new PerspectiveCamera(42,aspect,.1,2000);
  for(let degrees=0;degrees<=720;degrees+=.5){
   const angle=degrees*Math.PI/180;
   camera.position.set(Math.sin(angle)*Math.cos(elevation),Math.sin(elevation),Math.cos(angle)*Math.cos(elevation)).multiplyScalar(distance);
   camera.lookAt(0,0,0);camera.updateMatrixWorld();
   for(const point of points){const projected=point.clone().project(camera);assert.ok(Math.abs(projected.x)<.85&&Math.abs(projected.y)<.85,`parcel inside frame with margin: aspect=${aspect}, angle=${degrees}`);}
  }
 }
});
