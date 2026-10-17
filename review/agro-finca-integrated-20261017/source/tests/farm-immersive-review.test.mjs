import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { Matrix4 } from 'three';

const root = fileURLToPath(new URL('..', import.meta.url));
const vite = await createServer({ root, configFile: false, appType: 'custom', resolve: { alias: { '@': root } },
  plugins: [{ name: 'immersive-review-contract', enforce: 'pre',
    transform(code, id) {
      if (!id.includes('farm-masterplan-webgl.tsx?immersive-review')) return;
      return code.replace("from 'react'", "from 'virtual:review-hooks'")
        .replace("from 'three'", "from 'virtual:review-engine'")
        .replace("from 'three/addons/controls/OrbitControls.js'", "from 'virtual:review-controls'")
        .replace("from '@/lib/farm-3d-assets'", "from 'virtual:review-models'")
        .replace("from '@/lib/farm-asset-queue'", "from 'virtual:review-assets'")
        .replace("from '@/lib/farm-drone-tour'", "from 'virtual:review-tour'");
    },
    resolveId(id) { if (id.startsWith('virtual:review-')) return '\0' + id; },
    load(id) {
      if (id === '\0virtual:review-hooks') return `export const useRef=v=>{const state=globalThis.__immersiveReview;const ref={current:state.refs.length===0?state.host:v};state.refs.push(ref);return ref;};export const useState=v=>[v,()=>{}];export const useEffect=f=>globalThis.__immersiveReview.effects.push(f);`;
      if (id === '\0virtual:review-engine') return `export * from 'three';export class WebGLRenderer{constructor(){this.domElement=globalThis.__immersiveReview.canvas();this.shadowMap={};globalThis.__immersiveReview.renderer=this;}setPixelRatio(){}setSize(){}render(scene,camera){scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);globalThis.__immersiveReview.rendered={scene,camera};this.shadowMap.needsUpdate=false;}dispose(){globalThis.__immersiveReview.disposed=true;}}`;
      if (id === '\0virtual:review-controls') return `import {OrbitControls as Actual} from 'three/addons/controls/OrbitControls.js';export class OrbitControls extends Actual{constructor(camera,element){super(camera,element);globalThis.__immersiveReview.controls=this;}dispose(){super.dispose();globalThis.__immersiveReview.controlsDisposed=true;}}`;
      if (id === '\0virtual:review-tour') return `export * from '/lib/farm-drone-tour.ts';import {createFarmDroneTour as actualTour} from '/lib/farm-drone-tour.ts';export const createFarmDroneTour=options=>{const state=globalThis.__immersiveReview;state.tourOptions=options;return state.tour=actualTour({...options,scheduler:state.tourScheduler});};`;
      if (id === '\0virtual:review-assets') return `export const runFarmAssetQueue=async tasks=>{globalThis.__immersiveReview.assetTasks=tasks;return globalThis.__immersiveReview.assetResult??[];};`;
      if (id === '\0virtual:review-models') return `export * from '/lib/farm-3d-assets.ts';import {instanceFarmModel as instanceActual} from '/lib/farm-3d-assets.ts';import {Group,Mesh,BoxGeometry,MeshStandardMaterial} from 'three';export const loadFarmModel=async()=>{const root=new Group();const mesh=new Mesh(new BoxGeometry(1,.5,.5),new MeshStandardMaterial());mesh.position.y=.25;root.add(mesh);return root;};export function instanceFarmModel(root,matrices,own){globalThis.__immersiveReview.detailInputMatrices=matrices.map(m=>m.clone());const result=instanceActual(root,matrices,own);result.name='review-loaded-detail';return result;}`;
    },
  }], server: { middlewareMode: true, hmr: false, ws: false, watch: null } });
after(() => vite.close());
const { default: Scene } = await vite.ssrLoadModule('/components/farm-masterplan-webgl.tsx?immersive-review');
const {createFarmShowcase}=await vite.ssrLoadModule('/lib/farm-showcase.ts');
const {sceneUnitsPerMetre}=await vite.ssrLoadModule('/lib/farm-scene-scale.ts');
const { exteriorSurfaceHeight } = await vite.ssrLoadModule('/lib/farm-surroundings.ts');
const sceneSource = await readFile(new URL('../components/farm-masterplan-webgl.tsx', import.meta.url), 'utf8');

function eventTarget(extra = {}) {
  const events = new Map();
  return { ...extra,
    addEventListener(type, fn) { const list = events.get(type) ?? new Set(); list.add(fn); events.set(type, list); },
    removeEventListener(type, fn) { events.get(type)?.delete(fn); },
    emit(type, event = {}) { for (const fn of [...(events.get(type) ?? [])]) fn({ type, preventDefault() {}, ...event }); },
  };
}
const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
function mount(width = 390, height = 450, options = {}) {
  const keys = ['window', 'document', 'ResizeObserver', 'IntersectionObserver', 'requestAnimationFrame', 'cancelAnimationFrame', 'setTimeout', 'clearTimeout'];
  const saved = new Map(keys.map(key => [key, globalThis[key]]));
  const section = eventTarget({ contains: () => true }), motion = eventTarget({ matches: options.reducedMotion ?? false });
  const canvas = () => eventTarget({ clientWidth: width, clientHeight: height, style: {}, setAttribute() {}, remove() {},
    closest: () => section,ownerDocument:globalThis.document,getRootNode:()=>globalThis.document, setPointerCapture() {}, releasePointerCapture() {}, hasPointerCapture: () => false,
    getContext: () => ({ fillRect() {}, fillStyle: '' }), getBoundingClientRect: () => ({ left: 0, top: 0, width, height }) });
  const frames = new Map(), timers = new Map(); let frameId = 0, now = 0;
  const state = { refs: [], effects: [], frames, canvas, assetResult:options.assetResult, host: { clientWidth: width, clientHeight: height, appendChild() {}, closest: () => section } };
  state.tourScheduler = {now:()=>now,requestAnimationFrame:fn=>{frames.set(++frameId,fn);return frameId;},cancelAnimationFrame:id=>frames.delete(id),setTimeout:(fn,delay)=>{timers.set(++frameId,{fn,due:now+delay});return frameId;},clearTimeout:id=>timers.delete(id)};
  globalThis.__immersiveReview = state;
  Object.assign(globalThis, {
    window: eventTarget({ devicePixelRatio: 1, matchMedia: () => motion }),
    document: eventTarget({ hidden: false, createElement: canvas }),
    ResizeObserver: class { constructor(fn) {state.resize=fn;} observe() {} disconnect() {} },
    IntersectionObserver: class { constructor(fn) { state.intersect = fn; } observe() {} disconnect() {} },
    requestAnimationFrame: fn => { frames.set(++frameId, fn); return frameId; },
    cancelAnimationFrame: id => frames.delete(id),
    setTimeout: state.tourScheduler.setTimeout, clearTimeout: state.tourScheduler.clearTimeout,
  });
  const props = { propertyOutline: rect(0, 0, 100, 70), physicalAreaSqM: 100000,
    areas: [{ id: 'pasture', title: 'Saved pasture', use: 'pasture', outline: rect(10, 10, 10, 10) },
      { id: 'barn', title: 'Saved barn', use: 'barn', outline: rect(65, 10, 20, 20) }],
    animals: [{ id: 'saved-cow', areaId: 'pasture', title: 'Saved cow', species: 'cattle', category: 'Bovino', position: { x: 15, y: 15 }, src: '/plan-oblique/cattle-256.webp', anchor: { u: .5, v: .5 } }],
    ...options.props,tourMode:options.tourMode??'aerial',
    autoTour:options.autoTour??false,tourPaused:options.tourPaused??false,initialDetail:options.initialDetail,
    farmName: 'Review', surveyBased: false, onSelect() {}, onReturn() {}, onUnavailable() { throw Error('Unexpected fallback'); } };
  const before = JSON.stringify(props);
  Scene(props); const cleanup = state.effects[0]();
  const flush = (step = 50) => { now += step; for(const [id,job] of [...timers])if(job.due<=now){timers.delete(id);job.fn();} const current = [...frames.values()]; frames.clear(); for (const fn of current) fn(now); };
  flush();
  return { state, props, api: state.refs[1].current, motion, section, flush,
    moving: () => [...frames.values()].filter(fn => fn.name === 'moveAnimals').length,
    cleanup() { cleanup(); assert.equal(JSON.stringify(props), before); assert.equal(frames.size, 0); assert.equal(timers.size,0); assert.ok(state.disposed); assert.ok(state.controlsDisposed); for (const [key, value] of saved) { if (value === undefined) delete globalThis[key]; else globalThis[key] = value; } delete globalThis.__immersiveReview; },
  };
}
const matrixSnapshot = scene => scene.children.filter(o => o.isInstancedMesh).map(o => [o, Array.from(o.instanceMatrix.array)]);
const matricesEqual = snapshot => snapshot.every(([object, values]) => values.every((v, i) => v === object.instanceMatrix.array[i]));

test('inspection switches, Escape and reset restore roofs, camera and recorded animal transforms', () => {
  const h = mount();
  try {
    const { scene, camera } = h.state.rendered, initial = camera.position.clone(), target = h.state.controls.target.clone();
    const roof = scene.getObjectByName('illustrative-barn-roof'); assert.ok(roof);
    h.api.inspectArea('barn'); h.api.cutaway(true); h.flush(); assert.equal(roof.visible, false);
    h.api.inspectArea('pasture'); h.flush(); assert.equal(roof.visible, true);
    h.section.emit('keydown', { key: 'Escape' }); h.flush();
    assert.ok(camera.position.distanceTo(initial) < 1e-8); assert.ok(h.state.controls.target.distanceTo(target) < 1e-8);
    assert.equal(h.moving(), 0);
    h.api.inspectArea('barn'); h.api.cutaway(true); h.api.reset(); h.flush();
    assert.equal(roof.visible, true); assert.ok(camera.position.distanceTo(initial) < 1e-8);
  } finally { h.cleanup(); }
});

test('nearby animal motion pauses on all visibility/accessibility guards and close restores saved matrices', () => {
  const h = mount();
  try {
    const snapshot = matrixSnapshot(h.state.rendered.scene);
    h.api.inspectArea('pasture'); assert.equal(h.moving(), 1);
    for (let i = 0; i < 220; i++) h.flush();
    assert.equal(matricesEqual(snapshot), false, 'a positioned animal actually moves');
    h.api.movement(false); assert.equal(h.moving(), 0);
    h.api.movement(true); assert.equal(h.moving(), 1);
    h.motion.matches = true; h.motion.emit('change'); assert.equal(h.moving(), 0);
    h.motion.matches = false; h.motion.emit('change'); assert.equal(h.moving(), 1);
    document.hidden = true; document.emit('visibilitychange'); assert.equal(h.moving(), 0);
    document.hidden = false; document.emit('visibilitychange'); assert.equal(h.moving(), 1);
    window.emit('blur'); assert.equal(h.moving(), 0); window.emit('focus'); assert.equal(h.moving(), 1);
    h.state.intersect([{ isIntersecting: false }]); assert.equal(h.moving(), 0);
    h.state.intersect([{ isIntersecting: true }]); assert.equal(h.moving(), 1);
    h.api.tourBlock(true); assert.equal(h.moving(), 0); h.api.tourBlock(false); assert.equal(h.moving(), 1);
    h.api.closeInspection(); h.flush(); assert.equal(h.moving(), 0); assert.equal(matricesEqual(snapshot), true);
  } finally { h.cleanup(); }
});

test('render clamps a near-horizontal camera above the exact exterior mesh surface', () => {
  const h = mount();
  try {
    const { camera } = h.state.rendered;
    for (const [x, z] of [[-165.78, -52.81], [167.26, -193.31], [60, 0], [120, 40]]) {
      camera.position.set(x, .1, z); h.state.controls.update(); h.flush();
      assert.ok(camera.position.y >= exteriorSurfaceHeight(x, z) + .499);
      assert.ok(camera.quaternion.toArray().every(Number.isFinite));
    }
  } finally { h.cleanup(); }
});

test('tall-phone landscape reaches full fog before the camera far plane', () => {
  const h = mount(280, 560);
  try { assert.ok(h.state.rendered.camera.far > h.state.rendered.scene.fog.far, 'terrain must dissolve into sky before far clipping'); }
  finally { h.cleanup(); }
});

test('a late local model inherits the paused pose and LOD never draws both representations', async () => {
  const h = mount();
  try {
    const { scene } = h.state.rendered;
    const fallbacks = scene.children.filter(o => o.userData.animalIds?.includes('saved-cow'));
    assert.ok(fallbacks.length);
    const base = new Matrix4(); fallbacks[0].getMatrixAt(0, base);
    h.api.inspectArea('pasture'); for (let i = 0; i < 220; i++) h.flush(); h.api.movement(false);
    const current = new Matrix4(); fallbacks[0].getMatrixAt(0, current);
    const delta = current.clone().multiply(base.clone().invert());
    await h.state.assetTasks.at(-1)(); h.flush();
    const loaded = scene.getObjectByName('review-loaded-detail'); assert.ok(loaded);
    const actual = new Matrix4(); loaded.children[0].getMatrixAt(0, actual);
    const expected = delta.multiply(h.state.detailInputMatrices[0]);
    for (let i = 0; i < 16; i++) assert.ok(Math.abs(actual.elements[i] - expected.elements[i]) < 1e-5, 'replacement preserves the paused world pose');
    assert.equal(h.moving(), 0);
    h.api.inspectAnimal('saved-cow'); assert.equal(h.state.renderer.shadowMap.needsUpdate, true);
    h.flush(); h.api.closeInspection(); h.flush();
    loaded.children[0].getMatrixAt(0, actual);
    for (let i = 0; i < 16; i++) assert.ok(Math.abs(actual.elements[i] - h.state.detailInputMatrices[0].elements[i]) < 1e-5);
    for (const fallback of fallbacks) {const matrix=new Matrix4();fallback.getMatrixAt(0,matrix);if(loaded.children[0].count>0)assert.equal(matrix.determinant(),0,'active GLB hides its fallback instance');else assert.ok(Math.abs(matrix.determinant())>0,'distance LOD restores the lightweight instance');}
  } finally { h.cleanup(); }
});


test('real 101-animal farm makes a continuous aerial detail pass, yields to touch and resumes from that heading',()=>{
 const model=createFarmShowcase(),before=JSON.stringify(model);
 const h=mount(390,450,{autoTour:true,initialDetail:'herds',props:{propertyOutline:model.boundary.points,areas:model.illustrated.areas,animals:model.illustrated.animals,physicalAreaSqM:model.farm.payload.areaSqM}});
 try{
  const {camera}=h.state.rendered,target=h.state.controls.target;
  assert.ok(target.length()<1e-8,'opening is the whole parcel, not the initial herd closeup');
  assert.ok(camera.position.y>80);
  const radius=camera.position.distanceTo(target),openingHeight=camera.position.y,azimuth=()=>Math.atan2(camera.position.x,camera.position.z);
  const delta=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
  for(let i=0;i<100;i++)h.flush();
  assert.equal(h.state.tour.getState().phase,'orbiting');
  let previous=azimuth(),travelled=0,minRadius=Infinity,maxTarget=0;
  for(let i=0;i<1800;i++){
   h.flush();const next=azimuth();travelled+=delta(previous,next);previous=next;
   const currentRadius=camera.position.distanceTo(target);minRadius=Math.min(minRadius,currentRadius);maxTarget=Math.max(maxTarget,target.length());
   assert.ok(currentRadius>radius*.65&&currentRadius<radius*1.1,'moderate approach retains farm context');
   assert.ok(camera.position.y>=openingHeight*.82-1e-6,'never descends into enclosures');
   assert.equal(h.state.tour.getState().mode,'aerial');
   assert.equal(h.state.tour.getState().pointId,'overview','the default flight never enters barn or animal shots');
   assert.ok(target.length()<radius*.15,'lateral framing stays within a broad aerial envelope');
  }
  assert.ok(Math.abs(travelled-Math.PI*2)<.01);
  assert.ok(minRadius<radius*.9,'approaches visibly instead of circling at fixed distance');assert.ok(maxTarget>1,'frames recorded points of interest');
  h.section.emit('pointerdown',{pointerId:7});h.api.orbit(.9);h.flush();
  const manual=camera.position.clone();for(let i=0;i<80;i++)h.flush();assert.ok(camera.position.distanceTo(manual)<1e-8);
  window.emit('pointerup',{pointerId:7});for(let i=0;i<39;i++)h.flush();assert.ok(camera.position.distanceTo(manual)<1e-8);
  h.flush();assert.equal(h.state.tour.getState().phase,'returning');
  for(let i=0;i<70;i++)h.flush();assert.ok(delta(Math.atan2(manual.x,manual.z),azimuth())>0);
  assert.equal(JSON.stringify(model),before,'aerial flight preserves all saved records and positions');
 }finally{h.cleanup();}
});

test('actual tour respects inspection, manual pause, visibility and reduced motion through resize and replay',()=>{
 const h=mount(1440,560,{autoTour:true});
 try{
  for(let i=0;i<100;i++)h.flush();
  const {camera}=h.state.rendered;
  h.api.inspectArea('barn');h.flush();const inspected=camera.position.clone();
  for(let i=0;i<100;i++)h.flush();assert.ok(camera.position.distanceTo(inspected)<1e-8);assert.equal(h.state.tour.getState().phase,'suspended');
  h.api.closeInspection();for(let i=0;i<100;i++)h.flush();assert.equal(h.state.tour.getState().phase,'orbiting');
  h.api.tourPause();h.flush();const paused=camera.position.clone();
  h.state.host.clientWidth=280;h.state.host.clientHeight=560;h.state.resize();
  h.state.intersect([{isIntersecting:false}]);h.state.intersect([{isIntersecting:true}]);
  for(let i=0;i<200;i++)h.flush();assert.equal(h.state.tour.getState().phase,'paused');assert.ok(camera.position.distanceTo(paused)<1e-8);
  h.api.tourPlay();for(let i=0;i<80;i++)h.flush();assert.equal(h.state.tour.getState().phase,'orbiting');
  assert.ok(camera.position.distanceTo(h.state.controls.target)>paused.length()*1.3,'portrait viewport gets a larger all-heading fit');
  h.motion.matches=true;h.motion.emit('change');h.flush();const reduced=camera.position.clone();
  for(let i=0;i<100;i++)h.flush();assert.equal(h.state.tour.getState().motionBlocked,true);assert.ok(camera.position.distanceTo(reduced)<1e-8);
  h.api.tourPlay();for(let i=0;i<80;i++)h.flush();assert.equal(h.state.tour.getState().phase,'orbiting');
  document.hidden=true;document.emit('visibilitychange');h.flush();const hidden=camera.position.clone();
  for(let i=0;i<100;i++)h.flush();assert.ok(camera.position.distanceTo(hidden)<1e-8);
 }finally{h.cleanup();}
});

test('automatic scene starts still when reduced motion or explicit pause is already set',()=>{
 for(const option of [{reducedMotion:true},{tourPaused:true}]){
  const h=mount(390,450,{autoTour:true,...option});
  try{const camera=h.state.rendered.camera,before=camera.position.clone();for(let i=0;i<200;i++)h.flush();assert.ok(camera.position.distanceTo(before)<1e-8);assert.equal(h.state.frames.size,0);}
  finally{h.cleanup();}
 }
});


test('automatic renderer does not wire cinematic shots and retains explicit interior controls', () => {
  assert.doesNotMatch(sceneSource, /\bcreateFarmCinematicTour\b/);
  assert.doesNotMatch(sceneSource, /Cinemático · entrar y explorar/);
  assert.match(sceneSource, /onClick=\{\(\)=>api\.current\?\.inspectArea\(a\.id\)\}/);
  assert.match(sceneSource, /onClick=\{\(\)=>api\.current\?\.cutaway\(!roofOpen\)\}/);
});

// Read every actual scene mesh, including invisible LOD meshes and each instance.
// This deliberately does not trust the renderer's obstacle tags or route metadata.
function meshGeometryMaximumHeight(scene) {
  scene.updateMatrixWorld(true);
  let maximum = -Infinity, meshes = 0, instances = 0;
  const instance = new Matrix4(), world = new Matrix4();
  scene.traverse(object => {
    if (!object.isMesh) return;
    object.geometry.computeBoundingBox();
    const bounds = object.geometry.boundingBox;
    if (!bounds || bounds.isEmpty()) return;
    meshes++;
    const include = matrix => { maximum = Math.max(maximum, bounds.clone().applyMatrix4(matrix).max.y); };
    if (object.isInstancedMesh) {
      for (let i = 0; i < object.count; i++) {
        object.getMatrixAt(i, instance);
        include(world.multiplyMatrices(object.matrixWorld, instance));
        instances++;
      }
    } else include(object.matrixWorld);
  });
  assert.ok(meshes > 0 && instances > 0 && Number.isFinite(maximum), 'checks real mesh and instance geometry');
  return maximum;
}

test('real 101-animal fixture ignores legacy cinematic mode and stays above all geometry for three aerial laps', () => {
  const model = createFarmShowcase(), before = JSON.stringify(model);
  assert.equal(model.illustrated.animals.length, 101);
  const h = mount(390, 450, { autoTour: true, tourMode: 'cinematic', initialDetail: 'animals', props: {
    propertyOutline: model.boundary.points, areas: model.illustrated.areas,
    animals: model.illustrated.animals, physicalAreaSqM: model.farm.payload.areaSqM,
  } });
  try {
    const { scene, camera } = h.state.rendered;
    assert.equal(h.state.tourOptions.mode, 'aerial', 'legacy prop cannot select a cinematic controller');
    assert.equal(Object.hasOwn(h.state.tourOptions, 'shots'), false, 'no automatic interior route is wired');
    const points = [...model.boundary.points, ...model.illustrated.areas.flatMap(area => area.outline)];
    const span = Math.max(1, Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x)),
      Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y)));
    const metre = sceneUnitsPerMetre(model.boundary.points, 100 / span, model.farm.payload.areaSqM);
    const minimumHeight = meshGeometryMaximumHeight(scene) + metre * 4;
    assert.ok(h.state.tourOptions.aerialFocus.minimumHeight >= minimumHeight - 1e-5, 'declared envelope includes every mesh plus four metres');
    const roofs = [];
    scene.traverse(object => { if (object.name === 'illustrative-barn-roof') roofs.push(object); });
    assert.ok(roofs.length > 0, 'the real fixture includes roofs that must never open automatically');
    let sampledFrames = 0;
    const assertAerialView = () => {
      const state = h.state.tour.getState();
      assert.equal(state.mode, 'aerial');
      assert.equal(state.pointId, 'overview', 'automatic flight never selects an aisle, interior or animal shot');
      assert.notEqual(state.phase, 'cinematic');
      assert.ok(camera.position.y >= minimumHeight - 1e-5,
        `actual OrbitControls camera ${camera.position.y} must clear the complete mesh envelope ${minimumHeight}`);
      assert.ok([...camera.position.toArray(), ...camera.quaternion.toArray()].every(Number.isFinite));
      assert.ok(roofs.every(roof => roof.visible), 'automatic flight leaves every barn roof closed');
      sampledFrames++;
    };
    const tick = (count = 1) => { for (let i = 0; i < count; i++) { h.flush(); assertAerialView(); } };
    const azimuth = () => Math.atan2(camera.position.x, camera.position.z);
    const delta = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
    const lapFrames = h.state.tourOptions.orbitMs / 50;
    assertAerialView();
    for (const [width, height] of [[390, 450], [1440, 560], [280, 560]]) {
      h.api.tourPause();
      const paused = camera.position.clone();
      h.state.host.clientWidth = width; h.state.host.clientHeight = height; h.state.resize();
      h.api.tourMode('cinematic');
      tick(40);
      assert.equal(h.state.tour.getState().phase, 'paused', 'legacy mode and resize cannot override explicit pause');
      assert.ok(camera.position.distanceTo(paused) < 1e-8, 'resizing a paused tour preserves the actual camera');
      h.api.tourPlay(); tick(100);
      assert.equal(h.state.tour.getState().phase, 'orbiting');
      let previous = azimuth(), travelled = 0;
      for (let i = 0; i < lapFrames; i++) {
        if (i === 600 || i === 1200) {
          h.api.tourPause();
          const stopped = camera.position.clone();
          h.api.tourMode('cinematic'); tick(20);
          assert.equal(h.state.tour.getState().phase, 'paused');
          assert.ok(camera.position.distanceTo(stopped) < 1e-8);
          h.api.tourPlay();
        }
        tick();
        const next = azimuth(); travelled += delta(previous, next); previous = next;
      }
      assert.ok(Math.abs(travelled - Math.PI * 2) < .01, `completes a full aerial lap at ${width} × ${height}`);
      assert.equal(h.state.tour.getState().phase, 'orbiting');
    }
    assert.ok(sampledFrames > lapFrames * 3, 'checks three complete laps plus opening, returns and pause frames');
    assert.equal(JSON.stringify(model), before, 'aerial flight preserves all saved records and animal positions');
  } finally { h.cleanup(); }
});

test('legacy automatic mode still allows explicit barn inspection and cutaway, then restores aerial playback', () => {
  const h = mount(390, 450, { autoTour: true, tourMode: 'cinematic' });
  try {
    for (let i = 0; i < 100; i++) h.flush();
    const { scene, camera } = h.state.rendered, roof = scene.getObjectByName('illustrative-barn-roof');
    const aerialPosition = camera.position.clone();
    h.api.inspectArea('barn'); h.api.cutaway(true); h.flush();
    assert.equal(roof.visible, false, 'only explicit inspection opens the roof');
    assert.equal(h.state.tour.getState().phase, 'suspended');
    assert.ok(h.state.tour.getState().blockers.includes('inspection'));
    const inspected = camera.position.clone();
    h.api.tourMode('cinematic');
    for (let i = 0; i < 100; i++) h.flush();
    assert.ok(camera.position.distanceTo(inspected) < 1e-8, 'automatic camera yields throughout inspection');
    assert.equal(h.state.tour.getState().mode, 'aerial');
    h.api.closeInspection(); h.flush();
    assert.equal(roof.visible, true);
    assert.ok(camera.position.distanceTo(aerialPosition) < 1e-8, 'close returns to the pre-inspection aerial pose');
    for (let i = 0; i < 100; i++) h.flush();
    assert.equal(h.state.tour.getState().phase, 'orbiting');
    assert.equal(h.state.tour.getState().pointId, 'overview');
  } finally { h.cleanup(); }
});

test('manual camera inside a barn cannot auto-climb through its roof and explicit overview restores aerial flight', () => {
  const h = mount(390, 450, { autoTour: true, tourMode: 'cinematic' });
  try {
    const { scene, camera } = h.state.rendered, barn = scene.getObjectByName('inspectable-barn');
    const roof = barn.getObjectByName('illustrative-barn-roof');
    const minimumHeight = h.state.tourOptions.aerialFocus.minimumHeight;
    for (const returnToOverview of ['reset', 'aerial']) {
      for (let i = 0; i < 100; i++) h.flush();
      assert.equal(h.state.tour.getState().phase, 'orbiting');
      h.section.emit('wheel');
      camera.position.set(0, .26, 0); barn.localToWorld(camera.position);
      h.state.controls.target.set(0, .22, .12); barn.localToWorld(h.state.controls.target);
      h.state.controls.update(); h.flush();
      assert.ok(camera.position.y < minimumHeight, 'manual camera is below the automatic aerial envelope');
      assert.ok(barn.worldToLocal(camera.position.clone()).y < .45, 'actual camera is under the barn roof');
      const position = camera.position.clone(), target = h.state.controls.target.clone();
      const assertStill = () => {
        assert.ok(camera.position.distanceTo(position) < 1e-8, 'no automatic climb or escape through the roof');
        assert.ok(h.state.controls.target.distanceTo(target) < 1e-8, 'no automatic retargeting');
        assert.equal(roof.visible, true, 'manual entry does not open a roof');
      };
      for (let i = 0; i < 100; i++) { h.flush(); assertStill(); }
      assert.equal(h.state.tour.getState().phase, 'suspended');
      assert.deepEqual(h.state.tour.getState().blockers, ['unsafe-camera'], 'the return-path safety guard blocks playback');
      assert.equal(h.state.frames.size, 0, 'unsafe automatic return schedules no animation frames');
      h.api.tourPlay();
      for (let i = 0; i < 100; i++) { h.flush(); assertStill(); }
      assert.equal(h.state.tour.getState().phase, 'suspended', 'Play cannot bypass camera safety');
      assert.deepEqual(h.state.tour.getState().blockers, ['unsafe-camera']);
      assert.equal(h.state.frames.size, 0);
      h.api[returnToOverview](); h.flush();
      assert.ok(camera.position.y >= minimumHeight, `${returnToOverview} explicitly restores a safe overview`);
      const overview = camera.position.clone();
      h.api.tourPlay();
      for (let i = 0; i < 100; i++) {
        h.flush();
        assert.ok(camera.position.y >= minimumHeight - 1e-8);
      }
      assert.equal(h.state.tour.getState().phase, 'orbiting');
      assert.equal(h.state.tour.getState().mode, 'aerial');
      assert.equal(h.state.tour.getState().pointId, 'overview');
      assert.deepEqual(h.state.tour.getState().blockers, []);
      assert.ok(camera.position.distanceTo(overview) > .1, 'aerial flight really resumes after explicit recovery');
    }
  } finally { h.cleanup(); }
});


test('near-view shadow framing retains the approved sunlight direction and restores the broad overview',()=>{
 const h=mount();
 try{
  const {scene}=h.state.rendered,sun=scene.children.find(o=>o.isDirectionalLight),original=sun.position.clone().sub(sun.target.position);
  const broad=sun.shadow.camera.right-sun.shadow.camera.left;
  h.api.focus('animals');h.flush();
  assert.ok(sun.shadow.camera.right-sun.shadow.camera.left<broad,'same map resolution is concentrated around the close subject');
  assert.ok(sun.position.clone().sub(sun.target.position).distanceTo(original)<1e-8,'sun direction is unchanged');
  h.api.reset();h.flush();assert.equal(sun.shadow.camera.right-sun.shadow.camera.left,broad);
 }finally{h.cleanup();}
});


test('home preview waits for assets and a rendered frame, then resumes its controlled pause without rebuilding', async () => {
  let rendered=0;
  const h=mount(640,400,{autoTour:true,props:{preview:true,onPreviewReady:()=>{rendered++;}}});
  try {
    const scene=h.state.rendered.scene;
    assert.equal(rendered,0,'basic first frame stays covered');
    await Promise.resolve();
    assert.equal(rendered,0,'settled assets alone do not reveal a stale frame');
    h.flush();
    assert.equal(rendered,1);
    h.props.tourPaused=true;h.state.effects[3]();
    assert.equal(h.state.tour.getState().manualPaused,true);
    h.flush(1000);assert.equal(rendered,1);
    h.props.tourPaused=false;h.state.effects[3]();
    assert.equal(h.state.tour.getState().manualPaused,false);
    h.flush(1500);assert.equal(h.state.rendered.scene,scene);
    h.state.intersect([{isIntersecting:false}]);
    assert.ok(h.state.tour.getState().blockers.includes('offscreen'));
    h.state.intersect([{isIntersecting:true}]);
    assert.equal(h.state.rendered.scene,scene);
  } finally {h.props.tourPaused=false;h.cleanup();}
});


test('home preview reveals usable procedural materials after its bounded budget if assets stall', () => {
  let rendered=0;
  const h=mount(390,244,{autoTour:true,tourPaused:true,assetResult:new Promise(()=>{}),props:{preview:true,interactionBlocked:true,onPreviewReady:()=>{rendered++;}}});
  try {
    const camera=h.state.rendered.camera,position=camera.position.clone();
    assert.equal(rendered,0);
    h.flush(2499);assert.equal(rendered,0);
    h.flush(1);assert.equal(rendered,1);
    assert.ok(camera.position.distanceTo(position)<1e-8,'camera stays still behind the placeholder');
    h.flush(5000);assert.equal(rendered,1,'readiness is notified only once');
  } finally {h.cleanup();}
});

test('unmounting a still-loading home preview cancels its material reveal timer', () => {
  let rendered=0;
  const h=mount(390,244,{autoTour:true,assetResult:new Promise(()=>{}),props:{preview:true,onPreviewReady:()=>{rendered++;}}});
  assert.equal(rendered,0);
  h.cleanup();
  assert.equal(rendered,0);
});
