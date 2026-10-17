import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import {PerspectiveCamera,Vector3} from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({root,configFile:false,appType:'custom',server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(()=>vite.close());
const {installMasterplanTouch,MASTERPLAN_MIN_POLAR,MASTERPLAN_MAX_POLAR,setMasterplanView}=await vite.ssrLoadModule('/lib/farm-masterplan-touch.ts');
const WIDTH=800,HEIGHT=600,EPS=1e-9;
// DOM routing only: the camera and OrbitControls are the installed Three.js.
// No private state injection or synchronized-finger shortcuts. Touch events are
// dispatched separately, through capture/target/bubble order just like a canvas.
function target(){const listeners=new Map(),captures=new Set();return {style:{},clientWidth:WIDTH,clientHeight:HEIGHT,
 addEventListener(type,fn,options){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push({fn,capture:options===true||options?.capture===true});},
 removeEventListener(type,fn,options){const capture=options===true||options?.capture===true;listeners.set(type,(listeners.get(type)||[]).filter(x=>x.fn!==fn||x.capture!==capture));},
 dispatch(type,event){for(const capture of [true,false])for(const x of [...(listeners.get(type)||[])])if(x.capture===capture)x.fn(event);},
 setPointerCapture(id){captures.add(id);},hasPointerCapture(id){return captures.has(id);},releasePointerCapture(id){captures.delete(id);},
 listenerCount(type){return listeners.get(type)?.length||0;},captureCount(){return captures.size;},getBoundingClientRect(){return {left:0,top:0,width:WIDTH,height:HEIGHT};}};}
function setup(t){const element=target(),document=target(),window=target();element.ownerDocument=document;element.getRootNode=()=>document;document.defaultView=window;
 const camera=new PerspectiveCamera(42,WIDTH/HEIGHT,2,1600);camera.position.set(0,60,100);const controls=new OrbitControls(camera,element);
 Object.assign(controls,{enableDamping:false,minDistance:25,maxDistance:600,minPolarAngle:MASTERPLAN_MIN_POLAR,maxPolarAngle:MASTERPLAN_MAX_POLAR,screenSpacePanning:false});controls.update();
 const touch=installMasterplanTouch(element,camera,controls);t.after(()=>{touch.dispose();controls.dispose();});
 const emit=(type,id,x,y,pointerType='touch')=>{const e={pointerId:id,pointerType,clientX:x,clientY:y,pageX:x,pageY:y,button:0,buttons:type==='pointerup'?0:1,preventDefault(){}};element.dispatch(type,e);document.dispatch(type,e);camera.updateMatrixWorld();};
 const pair=()=>{emit('pointerdown',1,300,300);emit('pointerdown',2,500,300);};
 return {element,document,window,camera,controls,touch,emit,pair};}
const near=(a,b,message='numbers agree')=>assert.ok(Math.abs(a-b)<EPS,`${message}: ${a} versus ${b}`);
const vectorNear=(a,b,message='vectors agree')=>assert.ok(a.distanceTo(b)<EPS,`${message}: ${a.toArray()} versus ${b.toArray()}`);
const snapshot=({camera,controls})=>({position:camera.position.clone(),target:controls.target.clone(),distance:controls.getDistance(),azimuth:controls.getAzimuthalAngle(),polar:controls.getPolarAngle()});
function unchanged(c,b){vectorNear(c.camera.position,b.position,'camera does not jump');vectorNear(c.controls.target,b.target,'target does not jump');near(c.controls.getDistance(),b.distance);near(c.controls.getAzimuthalAngle(),b.azimuth);near(c.controls.getPolarAngle(),b.polar);}
function expectedPan(c,dx,dy){c.camera.updateMatrix();const right=new Vector3().setFromMatrixColumn(c.camera.matrix,0),up=new Vector3().crossVectors(c.camera.up,right),pixel=2*c.controls.getDistance()*Math.tan(c.camera.fov*Math.PI/360)/HEIGHT;return right.multiplyScalar(-dx*pixel).addScaledVector(up,dy*pixel);}

test('dedicated touch handling preserves one-finger orbit without native double integration',(t)=>{const c=setup(t),before=snapshot(c);c.emit('pointerdown',1,400,300);assert.equal(c.controls.enabled,false);c.emit('pointermove',1,436,318);near(c.controls.getAzimuthalAngle(),before.azimuth-2*Math.PI*36/HEIGHT);near(c.controls.getPolarAngle(),before.polar-2*Math.PI*18/HEIGHT);near(c.controls.getDistance(),before.distance);vectorNear(c.controls.target,before.target);assert.deepEqual(c.controls._pointers,[]);c.emit('pointerup',1,436,318);assert.equal(c.controls.enabled,true);});

test('sequential two-finger twist genuinely rotates azimuth with fixed target, elevation and distance',(t)=>{const c=setup(t),before=snapshot(c);c.pair();for(let step=1;step<=90;step++){const a=step*Math.PI/180;c.emit('pointermove',1,400-100*Math.cos(a),300-100*Math.sin(a));c.emit('pointermove',2,400+100*Math.cos(a),300+100*Math.sin(a));}near(c.controls.getAzimuthalAngle(),before.azimuth+Math.PI/2);near(c.controls.getPolarAngle(),before.polar);near(c.controls.getDistance(),before.distance);vectorNear(c.controls.target,before.target);assert.ok(c.camera.position.distanceTo(before.position)>10);});

test('twist continues through both angle wrap boundaries and a full turn without jumps',(t)=>{const c=setup(t),before=snapshot(c);c.pair();for(let step=1;step<=400;step++){const a=step*Math.PI/180;c.emit('pointermove',1,400-100*Math.cos(a),300-100*Math.sin(a));c.emit('pointermove',2,400+100*Math.cos(a),300+100*Math.sin(a));near(c.controls.getDistance(),before.distance);vectorNear(c.controls.target,before.target);}near(c.controls.getAzimuthalAngle(),40*Math.PI/180);});

test('sequential centered pinch leaves exactly zero net pan or twist, even in large steps',(t)=>{const c=setup(t),before=snapshot(c);c.pair();c.emit('pointermove',1,220,300);c.emit('pointermove',2,580,300);near(c.controls.getDistance(),before.distance*200/360);near(c.controls.getAzimuthalAngle(),before.azimuth);near(c.controls.getPolarAngle(),before.polar);vectorNear(c.controls.target,before.target);c.emit('pointermove',2,500,300);c.emit('pointermove',1,300,300);unchanged(c,before);});

test('two-finger translation has no zoom/orbit residue after sequential events',(t)=>{const c=setup(t),before=snapshot(c),pan=expectedPan(c,60,30);c.pair();c.emit('pointermove',1,360,330);c.emit('pointermove',2,560,330);near(c.controls.getDistance(),before.distance);near(c.controls.getAzimuthalAngle(),before.azimuth);near(c.controls.getPolarAngle(),before.polar);vectorNear(c.controls.target,pan);});

test('one gesture combines twist, translation and pinch without switching modes',(t)=>{const c=setup(t),before=snapshot(c),pan=expectedPan(c,40,20);c.pair();c.emit('pointermove',1,440,180);c.emit('pointermove',2,440,460);near(c.controls.getDistance(),before.distance*200/280);near(c.controls.getAzimuthalAngle(),before.azimuth+Math.PI/2);near(c.controls.getPolarAngle(),before.polar);vectorNear(c.controls.target,pan);});

for(const end of ['pointerup','pointercancel','lostpointercapture'])test(`${end} safely rebases 2→1→2 contacts and ignores stale events`,(t)=>{const c=setup(t);c.pair();c.emit('pointermove',1,310,310);c.emit('pointermove',2,550,330);const lift=snapshot(c);c.emit(end,2,550,330);unchanged(c,lift);c.emit('pointermove',1,310,310);unchanged(c,lift);c.emit('pointermove',1,312,310);near(c.controls.getAzimuthalAngle(),lift.azimuth-2*Math.PI*2/HEIGHT);const restart=snapshot(c);c.emit('pointerdown',3,720,420);c.emit('pointermove',3,720,420);unchanged(c,restart);c.emit('pointermove',3,722,420);assert.ok(c.controls.getDistance()<restart.distance);assert.ok(c.controls.target.distanceTo(restart.target)<1);c.emit(end,3,722,420);c.emit(end,1,312,310);assert.equal(c.controls.enabled,true);assert.equal(c.element.captureCount(),0);const stopped=snapshot(c);c.emit('pointermove',1,999,999);unchanged(c,stopped);});

test('third finger pauses movement and rebases the surviving pair without a jump',(t)=>{const c=setup(t);c.pair();const before=snapshot(c);c.emit('pointerdown',3,100,100);c.emit('pointermove',1,320,320);c.emit('pointermove',2,520,320);unchanged(c,before);c.emit('pointerup',3,100,100);c.emit('pointermove',1,320,320);c.emit('pointermove',2,520,320);unchanged(c,before);c.emit('pointermove',1,321,320);c.emit('pointermove',2,521,320);assert.ok(c.controls.target.length()>0);});

test('coincident contacts rebase scale and orientation rather than exploding',(t)=>{const c=setup(t);c.emit('pointerdown',1,400,300);c.emit('pointerdown',2,400,300);c.emit('pointermove',2,402,300);c.emit('pointermove',2,430,300);for(const n of [...c.camera.position.toArray(),...c.controls.target.toArray()])assert.ok(Number.isFinite(n));near(c.controls.getDistance(),Math.hypot(60,100));c.emit('pointermove',2,440,300);near(c.controls.getDistance(),Math.hypot(60,100)*30/40);});

test('near-horizon pan stays above terrain across repeated gestures',(t)=>{const c=setup(t);c.emit('pointerdown',1,400,300);c.emit('pointermove',1,400,-10000);c.emit('pointerup',1,400,-10000);near(c.controls.getPolarAngle(),MASTERPLAN_MAX_POLAR);for(let i=0;i<12;i++){c.pair();c.emit('pointermove',1,300,3300);c.emit('pointermove',2,500,3300);c.emit('pointerup',1,300,3300);c.emit('pointerup',2,500,3300);assert.ok(c.camera.position.y>0);near(c.controls.target.y,0);}});

test('vertical one-finger orbit reaches the aerial view and cannot go underground',(t)=>{const c=setup(t);c.emit('pointerdown',1,400,300);c.emit('pointermove',1,400,10000);near(c.controls.getPolarAngle(),MASTERPLAN_MIN_POLAR);c.emit('pointermove',1,400,-10000);near(c.controls.getPolarAngle(),MASTERPLAN_MAX_POLAR);assert.ok(c.camera.position.y>0);});

test('aerial preset preserves center and scale; initial preset restores exact opening viewpoint',(t)=>{const c=setup(t);setMasterplanView(c.camera,c.controls,'initial',190);const initial=snapshot(c);c.controls.target.set(20,0,-40);c.camera.position.add(new Vector3(20,0,-40));c.controls.update();const before=snapshot(c);setMasterplanView(c.camera,c.controls,'aerial',190);near(c.controls.getPolarAngle(),MASTERPLAN_MIN_POLAR);vectorNear(c.controls.target,before.target);near(c.controls.getDistance(),before.distance);setMasterplanView(c.camera,c.controls,'initial',190);unchanged(c,initial);});

test('blur and disposal release contacts, restore native controls and remove touch listeners',(t)=>{const c=setup(t);c.pair();c.window.dispatch('blur',{});assert.equal(c.controls.enabled,true);assert.equal(c.element.captureCount(),0);const before=snapshot(c);c.emit('pointermove',1,0,0);unchanged(c,before);c.pair();c.touch.dispose();assert.equal(c.controls.enabled,true);assert.equal(c.element.captureCount(),0);assert.equal(c.element.listenerCount('pointermove'),0);assert.equal(c.element.listenerCount('lostpointercapture'),0);assert.equal(c.window.listenerCount('blur'),0);});

test('mouse orbit and wheel remain available after a completed touch gesture',(t)=>{const c=setup(t);c.pair();c.emit('pointerup',2,500,300);c.emit('pointerup',1,300,300);const before=snapshot(c);c.emit('pointerdown',5,400,300,'mouse');c.emit('pointermove',5,420,300,'mouse');c.emit('pointerup',5,420,300,'mouse');assert.notEqual(c.controls.getAzimuthalAngle(),before.azimuth);c.element.dispatch('wheel',{clientX:400,clientY:300,deltaY:-80,deltaMode:0,preventDefault(){}});assert.ok(c.controls.getDistance()<before.distance);});
