import assert from 'node:assert/strict';import test,{after} from 'node:test';import {readFile} from 'node:fs/promises';import {fileURLToPath} from 'node:url';import {createServer} from 'vite';
const root=fileURLToPath(new URL('..',import.meta.url)),v=await createServer({root,configFile:false,appType:'custom',resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});after(()=>v.close());const {INITIAL_CAMERA,cameraLimits,project360,gestureCamera}=await v.ssrLoadModule('/lib/farm-masterplan-camera.ts');
test('360 projection completes a full orbit and leaves saved geometry unchanged',()=>{const point={x:17,y:33},before={...point},center={x:50,y:35};const a=project360(point,4,INITIAL_CAMERA,center,5),b=project360(point,4,{...INITIAL_CAMERA,yaw:335},center,5);for(const key of ['x','y','depth'])assert.ok(Math.abs(a[key]-b[key])<1e-9);assert.deepEqual(point,before);assert.notEqual(project360(point,4,{...INITIAL_CAMERA,yaw:100},center,5).x,a.x);});
test('camera clamps tilt zoom and pan while wrapping arbitrary turns',()=>{assert.deepEqual(cameraLimits({yaw:1081,tilt:-9,zoom:99,panX:99999,panY:-99999}),{yaw:1,tilt:2,zoom:4,panX:1200,panY:-1200});assert.equal(cameraLimits({...INITIAL_CAMERA,tilt:100,zoom:0}).tilt,90);assert.equal(cameraLimits({...INITIAL_CAMERA,zoom:0}).zoom,.55);});
test('single pointer orbits and pan mode moves without modifying orientation',()=>{const old=[{x:0,y:0}],next=[{x:20,y:10}];const a=gestureCamera(INITIAL_CAMERA,old,next,'orbit');assert.equal(a.yaw,344);assert.equal(a.tilt,54.5);assert.equal(a.panX,0);const b=gestureCamera(INITIAL_CAMERA,old,next,'pan',2);assert.equal(b.panX,40);assert.equal(b.panY,20);assert.equal(b.yaw,335);});
test('two fingers pinch and pan together, mismatched and degenerate contacts stay safe',()=>{const a=gestureCamera(INITIAL_CAMERA,[{x:0,y:0},{x:10,y:0}],[{x:5,y:6},{x:25,y:6}],'orbit');assert.equal(a.zoom,2);assert.equal(a.panX,10);assert.equal(a.panY,6);assert.equal(a.yaw,335);assert.equal(gestureCamera(INITIAL_CAMERA,[],[{x:1,y:1}],'orbit'),INITIAL_CAMERA);const b=gestureCamera(INITIAL_CAMERA,[{x:0,y:0},{x:0,y:0}],[{x:5,y:6},{x:25,y:6}],'orbit');assert.ok(Number.isFinite(b.zoom));});
test('3D is lazy, read-only, offline bundled, and explicitly not a satellite reconstruction',async()=>{const [editor,scene,offline]=await Promise.all(['components/farm-map-editor.tsx','components/farm-masterplan-vector.tsx','scripts/offline-assets.mjs'].map(p=>readFile(root+p,'utf8')));assert.match(editor,/lazy\(\(\)=>import\("@\/components\/farm-masterplan-scene"\)\)/);assert.match(editor,/useState\("masterplan"\)/);assert.match(editor,/value="masterplan"/);assert.match(editor,/viewMode==="masterplan"&&/);assert.match(scene,/sin WebGL/);assert.match(scene,/no se superpone sobre un croquis/);assert.match(scene,/No representan un inventario de cada árbol/);assert.match(scene,/slice\(0,180\)/);assert.doesNotMatch(scene,/fetch\(|queueMutation|localStorage|indexedDB|requestAnimationFrame/);assert.match(offline,/walk\(join\(root,'assets'\)/);});
test('3D accessible controls and interrupted drag suppress accidental selection',async()=>{const scene=await readFile(root+'components/farm-masterplan-vector.tsx','utf8');for(const text of ['Volver a 2D','Ver toda · Restablecer','Áreas del masterplan','onPointerCancel','onLostPointerCapture','type="range"','type="checkbox"'])assert.ok(scene.includes(text));assert.match(scene,/!cancel&&!moved.current&&!multi.current/);assert.match(scene,/startArea.current/);assert.match(scene,/touchAction:'none'/);});


test('two fingers genuinely twist yaw while translating and pinching the lightweight view',()=>{
 const c={...INITIAL_CAMERA,yaw:0};
 const next=gestureCamera(c,[{x:0,y:0},{x:100,y:0}],[{x:90,y:-80},{x:90,y:120}],'orbit');
 assert.equal(next.yaw,90);assert.equal(next.zoom,2);assert.equal(next.panX,40);assert.equal(next.panY,20);assert.equal(next.tilt,c.tilt);
});
test('lightweight touch twist wraps the signed angle rather than jumping at 180 degrees',()=>{
 const r=a=>[{x:0,y:0},{x:100*Math.cos(a*Math.PI/180),y:100*Math.sin(a*Math.PI/180)}];
 const c=gestureCamera({...INITIAL_CAMERA,yaw:10},r(179),r(-179),'orbit');
 assert.ok(Math.abs(c.yaw-12)<1e-9);
});
test('lightweight camera reaches overhead and retains its initial reset view',()=>{
 assert.equal(cameraLimits({...INITIAL_CAMERA,tilt:90}).tilt,90);
 const p=project360({x:10,y:10},0,{...INITIAL_CAMERA,tilt:90},{x:0,y:0},1),q=project360({x:10,y:10},99,{...INITIAL_CAMERA,tilt:90},{x:0,y:0},1);
 assert.ok(Math.abs(p.y-q.y)<1e-9);assert.equal(INITIAL_CAMERA.tilt,52);
});
