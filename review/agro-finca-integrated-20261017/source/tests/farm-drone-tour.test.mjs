import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../lib/farm-drone-tour.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022}}).outputText;
const {createFarmDroneTour, droneOrbitPose, interpolateCinematicPose, sampleDroneShots} = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

function fakeClock() {
  let now = 0, id = 0;
  const jobs = new Map(), archived = new Map();
  const add = (kind, callback, delay) => {
    const handle = ++id, job = {kind, callback, due: now + delay};
    jobs.set(handle, job); archived.set(handle, job); return handle;
  };
  return {
    scheduler: {
      now: () => now,
      requestAnimationFrame: callback => add('raf', callback, 10),
      cancelAnimationFrame: handle => jobs.delete(handle),
      setTimeout: (callback, delay) => add('timer', callback, delay),
      clearTimeout: handle => jobs.delete(handle),
    },
    advance(ms) {
      const end = now + ms;
      for (;;) {
        const next = [...jobs.entries()].filter(([, job]) => job.due <= end).sort((a, b) => a[1].due - b[1].due || a[0] - b[0])[0];
        if (!next) break;
        const [handle, job] = next; jobs.delete(handle); now = job.due; job.callback(now);
      }
      now = end;
    },
    count: kind => [...jobs.values()].filter(job => !kind || job.kind === kind).length,
    pending: () => [...jobs.keys()],
    invokeStale: handle => archived.get(handle)?.callback(now),
    jump(ms) {now += ms;const pending = [...jobs.entries()].filter(([, job]) => job.kind === 'raf');for (const [handle, job] of pending) {jobs.delete(handle);job.callback(now);}},
    now: () => now,
  };
}
const overview = {id: 'overview', label: 'Vista general', position: [60, 90, 80], target: [0, 0, 0]};
function setup(overrides = {}) {
  const clock = fakeClock(), writes = [], states = [];
  let pose = {position: [4, 5, 6], target: [1, 0, 1]};
  const tour = createFarmDroneTour({
    enabled: true, overview, scheduler: clock.scheduler,
    getPose: () => pose,
    setPose: next => {pose = next; writes.push({time: clock.now(), pose: structuredClone(next)});},
    onState: state => states.push(state), ...overrides,
  });
  return {tour, clock, writes, states, pose: () => pose, setManualPose: value => {pose = value;}};
}

const distance = pose => Math.hypot(...pose.position.map((value, i) => value - pose.target[i]));
const azimuth = pose => Math.atan2(pose.position[0] - pose.target[0], pose.position[2] - pose.target[2]);
const angleDelta = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
const near = (a, b, epsilon = 1e-8) => assert.ok(Math.abs(a - b) < epsilon, `${a} ≈ ${b}`);

test('opening view joins a continuous 360-degree orbit with fixed radius, elevation and target', () => {
  const f = setup();
  assert.equal(f.tour.getState().phase, 'dwelling');
  assert.equal(f.clock.count('raf'), 0);
  f.clock.advance(1199); assert.equal(f.writes.length, 0);
  f.clock.advance(1); assert.equal(f.tour.getState().phase, 'returning');
  f.clock.advance(3040); assert.equal(f.tour.getState().phase, 'orbiting');
  assert.equal(f.clock.count('raf'), 1); assert.equal(f.clock.count('timer'), 0);
  let previous = azimuth(f.pose()), accumulated = 0;
  for (let i = 0; i < 180; i++) {
    f.clock.advance(500);
    const next = azimuth(f.pose()), delta = angleDelta(previous, next);
    assert.ok(delta > 0, 'the camera keeps travelling in one direction, without stops or reversal');
    accumulated += delta; previous = next;
    near(distance(f.pose()), distance(overview));
    near(f.pose().position[1], overview.position[1]);
    assert.deepEqual(f.pose().target, overview.target);
    assert.equal(f.tour.getState().phase, 'orbiting');
    assert.equal(f.clock.count('raf'), 1);
  }
  near(accumulated, Math.PI * 2, .005);
  assert.ok(f.states.length < 6, 'no React state updates on every animation frame');
  f.tour.dispose(); assert.equal(f.clock.count(), 0);
});

test('spherical joining preserves current heading and has a smooth velocity through entry and each loop seam', () => {
  const from = {position: [-25, 15, -40], target: [4, 0, 9]}, before = structuredClone([from, overview]);
  const sample = time => droneOrbitPose(from, overview, time, 3000, 90_000);
  assert.deepEqual(sample(0).target, from.target);
  for (let i = 0; i < 3; i++) near(sample(0).position[i], from.position[i]);
  assert.ok(Math.hypot(...sample(1).position.map((v, i) => v - from.position[i])) < .001);
  for (const time of [3000, 91_500, 181_500]) {
    const previous = sample(time - 1), current = sample(time), next = sample(time + 1);
    for (let i = 0; i < 3; i++) near(current.position[i] - previous.position[i], next.position[i] - current.position[i], .00006);
  }
  near(distance(sample(3000)), distance(overview));
  near(angleDelta(azimuth(from), azimuth(sample(3000))), Math.PI * 2 * 1500 / 90_000);
  assert.deepEqual([from, overview], before);
});

test('high-refresh RAF writes are bounded near 30 Hz during continuous playback', () => {
  const f = setup({transitionMs: 1000}); f.tour.play();
  f.clock.advance(1000);
  assert.ok(f.writes.length >= 20 && f.writes.length <= 31, `bounded writes: ${f.writes.length}`);
  assert.equal(f.tour.getState().phase, 'orbiting'); assert.equal(f.clock.count('raf'), 1);
  const count = f.writes.length; f.clock.advance(1000);
  assert.ok(f.writes.length - count >= 20 && f.writes.length - count <= 31);
  f.tour.dispose();
});

test('held touch cancels immediately and the 2s idle clock starts at the final gesture END', () => {
  const f = setup(); f.clock.advance(4000);
  const count = f.writes.length, stale = f.clock.pending()[0];
  f.tour.pointerStart(11); f.tour.pointerStart(12);
  assert.equal(f.clock.count(), 0); assert.equal(f.tour.getState().pointerCount, 2);
  f.clock.invokeStale(stale); f.clock.advance(30_000); assert.equal(f.writes.length, count);
  f.tour.pointerEnd(11); f.clock.advance(10_000); assert.equal(f.clock.count(), 0);
  const manualPose = {position: [33, 44, 55], target: [4, 5, 6]}; f.setManualPose(manualPose);
  f.tour.pointerEnd(12); assert.equal(f.tour.getState().phase, 'idle');
  f.clock.advance(1999); assert.equal(f.writes.length, count);
  f.clock.advance(1); assert.equal(f.tour.getState().phase, 'returning');
  assert.deepEqual(f.pose(), manualPose, 'no instant reset before smooth transition');
  f.clock.advance(10);
  assert.ok(Math.abs(f.pose().position[0] - manualPose.position[0]) < .01);
  f.clock.advance(3030); near(distance(f.pose()), distance(overview)); assert.equal(f.tour.getState().phase, 'orbiting');
  assert.ok(angleDelta(azimuth(manualPose), azimuth(f.pose())) > 0, 'resume from manual heading instead of resetting to the opening heading');
  f.tour.dispose();
});

test('wheel and keyboard activity debounce, and stale canceled timers cannot restart', () => {
  const f = setup(); f.tour.activity(); const old = f.clock.pending()[0];
  f.clock.advance(1500); f.tour.activity();
  f.clock.invokeStale(old); assert.equal(f.tour.getState().phase, 'idle');
  f.clock.advance(1999); assert.equal(f.clock.count('raf'), 0);
  f.tour.pointerStart('key:ArrowLeft'); f.clock.advance(20_000);
  assert.equal(f.clock.count(), 0); assert.equal(f.writes.length, 0);
  f.tour.pointerEnd('key:ArrowLeft'); f.clock.advance(2000);
  assert.equal(f.clock.count('raf'), 1); f.tour.dispose();
});

test('modal, focused controls, hidden tab, and offscreen blockers compose independently', () => {
  const f = setup(); f.clock.advance(4000); const count = f.writes.length;
  for (const reason of ['dialog', 'focus', 'document', 'offscreen']) f.tour.setBlocked(reason, true);
  assert.equal(f.clock.count(), 0);
  for (const reason of ['dialog', 'document', 'offscreen']) {
    f.tour.setBlocked(reason, false); f.clock.advance(5000);
    assert.equal(f.writes.length, count); assert.equal(f.clock.count(), 0);
  }
  f.tour.setBlocked('focus', false); f.clock.advance(1999);
  assert.equal(f.clock.count('raf'), 0); f.clock.advance(1);
  assert.equal(f.tour.getState().phase, 'returning');
  f.tour.dispose();
});

test('manual pause remains sticky after gestures, blockers, enabled changes, and idle', () => {
  const f = setup(); f.clock.advance(4000); f.tour.pause(); const count = f.writes.length;
  f.tour.pointerStart(1); f.tour.pointerEnd(1); f.tour.activity();
  f.tour.setBlocked('document', true); f.tour.setBlocked('document', false);
  f.tour.setEnabled(false); f.tour.setEnabled(true); f.clock.advance(60_000);
  assert.equal(f.tour.getState().phase, 'paused'); assert.equal(f.writes.length, count);
  assert.equal(f.clock.count(), 0); f.tour.play(); assert.equal(f.clock.count('raf'), 1);
  f.tour.dispose();
});

test('reduced motion suppresses autoplay; explicit Play opts in but never overrides other blockers', () => {
  const f = setup({reducedMotion: true});
  f.clock.advance(60_000); assert.equal(f.clock.count(), 0); assert.equal(f.writes.length, 0);
  assert.equal(f.tour.getState().phase, 'suspended');
  assert.equal(f.tour.getState().motionBlocked, true);
  f.tour.setBlocked('dialog', true); f.tour.play(); assert.equal(f.clock.count(), 0);
  assert.equal(f.tour.getState().motionBlocked, false, 'UI can show Pause after explicit opt-in');
  f.tour.setBlocked('dialog', false); f.clock.advance(2000); assert.equal(f.clock.count('raf'), 1);
  f.tour.setReducedMotion(false); f.tour.setReducedMotion(true);
  assert.equal(f.clock.count(), 0); assert.equal(f.tour.getState().phase, 'suspended');
  assert.equal(f.tour.getState().motionBlocked, true);
  f.tour.dispose();
});

test('real farms cannot start via Play, and autoplay false is an explicit initial pause', () => {
  const f = setup({enabled: false}); f.tour.play(); f.tour.activity(); f.clock.advance(60_000);
  assert.equal(f.tour.getState().phase, 'disabled'); assert.equal(f.clock.count(), 0);
  assert.equal(f.writes.length, 0); f.tour.dispose();
  const paused = setup({autoplay: false}); assert.equal(paused.tour.getState().phase, 'paused');
  assert.equal(paused.clock.count(), 0); paused.tour.play(); assert.equal(paused.clock.count('raf'), 1); paused.tour.dispose();
});

test('window blur clears swallowed pointer/key releases without bypassing visibility', () => {
  const f = setup(); f.tour.pointerStart(1); f.tour.pointerStart('key:ArrowLeft');
  f.tour.setBlocked('document', true); f.tour.releasePointers();
  f.clock.advance(6000); assert.equal(f.clock.count(), 0); assert.equal(f.tour.getState().pointerCount, 0);
  f.tour.setBlocked('document', false); f.clock.advance(2000);
  assert.equal(f.tour.getState().phase, 'returning'); f.tour.dispose();
});

test('dispose removes all scheduling, rejects stale callbacks, and makes every action inert', () => {
  for (const time of [0, 4000, 6000]) {
    const f = setup(); f.clock.advance(time); const pending = f.clock.pending(), count = f.writes.length;
    f.tour.dispose(); f.tour.dispose();
    for (const id of pending) f.clock.invokeStale(id);
    f.tour.play(); f.tour.pause(); f.tour.activity(); f.tour.pointerStart(1); f.tour.pointerEnd(1);
    f.tour.releasePointers(); f.tour.setBlocked('document', false); f.tour.setEnabled(true); f.tour.setReducedMotion(false); f.tour.setOverview(overview);
    f.clock.advance(60_000); assert.equal(f.clock.count(), 0); assert.equal(f.writes.length, count);
    assert.equal(f.tour.getState().phase, 'disposed');
  }
});

test('responsive refit is smooth, preserves heading, and cannot override pause or reduced motion', () => {
  const f = setup(); f.clock.advance(5000); const before = structuredClone(f.pose());
  const portrait = {id: 'overview', label: 'Portrait', position: [120, 180, 160], target: [0, 0, 0]};
  f.tour.setOverview(portrait); assert.deepEqual(f.pose(), before);
  f.clock.advance(10); assert.ok(Math.hypot(...f.pose().position.map((v, i) => v - before.position[i])) < .01);
  f.clock.advance(3030); near(distance(f.pose()), distance(portrait));
  f.tour.pause(); const count = f.writes.length; f.tour.setOverview(overview); f.clock.advance(10_000);
  assert.equal(f.writes.length, count); assert.equal(f.clock.count(), 0);
  f.tour.dispose();
  const reduced = setup({reducedMotion: true}); reduced.tour.setOverview(portrait); reduced.clock.advance(10_000);
  assert.equal(reduced.writes.length, 0); assert.equal(reduced.clock.count(), 0); reduced.tour.dispose();
});

test('tour copies its overview and a long browser stall cannot teleport the camera', () => {
  const route = structuredClone(overview), f = setup({overview: route}); route.position[0] = 99999;
  f.clock.advance(6000); near(distance(f.pose()), distance(overview));
  const before = azimuth(f.pose()); f.clock.jump(30_000);
  const delta = angleDelta(before, azimuth(f.pose()));
  assert.ok(delta >= 0 && delta < .01, 'a stalled frame advances at most 80 ms');
  f.tour.dispose();
});

test('invalid camera coordinates fail closed without scheduling or writes', () => {
  const f = setup({getPose: () => ({position: [NaN, 0, 0], target: [0, 0, 0]})});
  f.clock.advance(3000); assert.equal(f.tour.getState().phase, 'suspended');
  assert.deepEqual(f.tour.getState().blockers, ['invalid-pose']);
  assert.equal(f.clock.count(), 0); assert.equal(f.writes.length, 0); f.tour.dispose();
});


const cinematicShots=[
 {id:'door',label:'Descenso',position:[20,5,10],target:[20,1,0],durationMs:1000},
 {id:'aisle',label:'Pasillo',position:[20,5,-10],target:[20,1,-20],durationMs:2000},
 {...overview,durationMs:1000},
];
test('cinematic mode follows distinct approach/detail/exit views, loops smoothly and keeps the aerial mode',()=>{
 const f=setup({mode:'cinematic',shots:cinematicShots,getReturnPath:()=>[]});f.tour.play();
 f.clock.advance(1040);assert.equal(f.tour.getState().phase,'cinematic');assert.equal(f.tour.getState().pointId,'aisle');
 f.clock.advance(3000);assert.equal(f.tour.getState().pointId,'door');
 f.tour.setMode('aerial');assert.equal(f.tour.getState().mode,'aerial');f.clock.advance(3040);assert.equal(f.tour.getState().phase,'orbiting');
 f.tour.pause();const count=f.writes.length;f.tour.setMode('cinematic');f.clock.advance(20_000);assert.equal(f.writes.length,count);assert.equal(f.tour.getState().phase,'paused');
 f.tour.play();f.clock.advance(100);assert.equal(f.tour.getState().phase,'cinematic');f.tour.dispose();
});
test('cinematic shot boundaries match camera position and zero velocity/acceleration without dwell timers',()=>{
 for(const end of [1000,3000,4000]){
  const center=sampleDroneShots(overview,cinematicShots,end).pose;
  const previous=sampleDroneShots(overview,cinematicShots,end-.1).pose;
  const next=sampleDroneShots(overview,cinematicShots,end===4000?.1:end+.1).pose;
  for(let axis=0;axis<3;axis++){near(previous.position[axis],center.position[axis],1e-7);near(next.position[axis],center.position[axis],1e-7);}
 }
 assert.deepEqual(interpolateCinematicPose(overview,cinematicShots[0],-1),{position:overview.position,target:overview.target});
});
test('cinematic safe return runs once before the route; an obstructed manual camera fails closed',()=>{
 const returns=[{...overview,id:'safe-return',durationMs:2000}],f=setup({mode:'cinematic',shots:cinematicShots,getReturnPath:()=>returns});f.tour.play();
 f.clock.advance(500);assert.equal(f.tour.getState().pointId,'safe-return');
 f.clock.advance(1800);assert.equal(f.tour.getState().phase,'cinematic');
 f.clock.advance(4000);assert.notEqual(f.tour.getState().pointId,'safe-return');f.tour.dispose();
 let blocked=true;const unsafe=setup({mode:'cinematic',shots:cinematicShots,getReturnPath:()=>blocked?null:[]});unsafe.tour.play();
 assert.equal(unsafe.tour.getState().phase,'suspended');assert.deepEqual(unsafe.tour.getState().blockers,['unsafe-camera']);assert.equal(unsafe.clock.count(),0);assert.equal(unsafe.writes.length,0);
 blocked=false;unsafe.tour.activity();unsafe.clock.advance(1999);assert.equal(unsafe.writes.length,0);unsafe.clock.advance(41);assert.equal(unsafe.tour.getState().phase,'cinematic');unsafe.tour.dispose();
});
test('cinematic mode yields for the whole gesture and respects reduced motion and dialog blockers',()=>{
 const f=setup({mode:'cinematic',shots:cinematicShots,getReturnPath:()=>[],reducedMotion:true});f.clock.advance(5000);assert.equal(f.writes.length,0);
 f.tour.play();f.clock.advance(500);f.tour.pointerStart(1);const count=f.writes.length;f.clock.advance(5000);assert.equal(f.writes.length,count);
 f.tour.pointerEnd(1);f.clock.advance(1999);assert.equal(f.writes.length,count);f.clock.advance(41);assert.ok(f.writes.length>count);
 f.tour.setBlocked('dialog',true);f.tour.setMode('aerial');f.tour.setMode('cinematic');f.clock.advance(5000);assert.equal(f.tour.getState().phase,'suspended');f.tour.dispose();
});

test('cinematic pauses and visibility interruptions resume the current shot instead of repeating the barn',()=>{
 const f=setup({mode:'cinematic',shots:cinematicShots,getReturnPath:()=>[]});f.tour.play();
 f.clock.advance(1440);const before=structuredClone(f.pose());
 f.tour.pause();f.clock.advance(30000);assert.deepEqual(f.pose(),before);
 f.tour.play();f.clock.advance(40);
 assert.ok(Math.hypot(...f.pose().position.map((v,i)=>v-before.position[i]))<2,'resume does not jump to the opening view');
 f.tour.setBlocked('hidden',true);f.clock.advance(30000);f.tour.setBlocked('hidden',false);f.clock.advance(2040);
 f.clock.advance(1800);assert.equal(f.tour.getState().pointId,'overview','the route continues to its exit after interruption');
 f.tour.dispose();
});

test('manual movement invalidates saved cinematic progress and requests a safe return',()=>{
 let returns=0;const f=setup({mode:'cinematic',shots:cinematicShots,getReturnPath:()=>{returns++;return [];}});f.tour.play();f.clock.advance(1400);
 f.tour.pause();f.setManualPose({position:[20,20,20],target:[0,0,0]});f.tour.play();assert.equal(returns,2);
 f.tour.dispose();
});

test('unchanged overview notifications do not restart the cinematic timeline',()=>{
 const f=setup({mode:'cinematic',shots:cinematicShots,getReturnPath:()=>[]});f.tour.play();
 for(let i=0;i<32;i++){f.clock.advance(100);f.tour.setOverview(structuredClone(overview),structuredClone(cinematicShots));}
 assert.equal(f.tour.getState().pointId,'overview');f.tour.dispose();
});

const aerialFocus={minimumHeight:36,points:[
 {id:'herd',label:'Rebaño',position:[0,0,0],target:[25,0,20]},
 {id:'home',label:'Casa',position:[0,0,0],target:[-35,0,10]},
 {id:'crop',label:'Cultivo',position:[0,0,0],target:[0,0,-30]},
]};
test('aerial detail pass stays high, advances continuously and uses one broad approach per revolution',()=>{
 const sample=t=>droneOrbitPose(overview,overview,t,3000,90000,aerialFocus);
 let previous=sample(3000),minimum=Infinity,maximum=0,turn=0;
 for(let t=3040;t<=183000;t+=40){
  const pose=sample(t),radius=Math.hypot(pose.position[0],pose.position[2]);
  minimum=Math.min(minimum,radius);maximum=Math.max(maximum,radius);
  assert.ok(pose.position[1]>=aerialFocus.minimumHeight,'never descend into houses, corrals or crops');
  assert.ok(pose.position[1]>=overview.position[1]*.82-1e-8,'moderate descent retains aerial panorama');
  assert.ok(Math.hypot(...pose.target)<30,'target framing remains bounded to the farm');
  assert.ok(Math.hypot(...pose.position.map((v,i)=>v-previous.position[i]))<.5,'no sudden camera jumps');
  const delta=angleDelta(Math.atan2(previous.position[0],previous.position[2]),Math.atan2(pose.position[0],pose.position[2]));
  assert.ok(delta>0,'continuous lateral orbit, never stops or reverses');turn+=delta;previous=pose;
 }
 assert.ok(minimum<maximum*.85,'visible, moderate approach rather than fixed-height hovering');
 near(turn,Math.PI*4,.01);
 for(const time of [3000,91500,181500])for(const key of ['position','target'])for(let axis=0;axis<3;axis++){
  const a=sample(time-1)[key][axis],b=sample(time)[key][axis],c=sample(time+1)[key][axis];near(b-a,c-b,.00008);
 }
 assert.ok(Math.hypot(...sample(46500).target)>1,'subject-aware framing is not always the origin');
});
test('aerial safety envelope clears tall structures throughout the entire periodic route',()=>{
 const focus={...aerialFocus,minimumHeight:130};
 for(let t=3000;t<=933000;t+=137){const pose=droneOrbitPose(overview,overview,t,3000,90000,focus);assert.ok(pose.position[1]>=130-1e-8);}
 const from={position:[22,160,18],target:[0,0,0]};
 assert.deepEqual(droneOrbitPose(from,overview,0,3000,90000,focus).target,from.target);
 for(let axis=0;axis<3;axis++)near(droneOrbitPose(from,overview,0,3000,90000,focus).position[axis],from.position[axis]);
});
test('aerial focus preserves pause, manual restart, resize and reduced-motion contracts',()=>{
 const f=setup({aerialFocus});f.tour.play();f.clock.advance(27000);const before=structuredClone(f.pose());
 f.tour.pause();f.clock.advance(60000);assert.deepEqual(f.pose(),before);f.tour.play();f.clock.advance(40);
 assert.ok(Math.hypot(...f.pose().position.map((v,i)=>v-before.position[i]))<.5);
 f.tour.setBlocked('hidden',true);const count=f.writes.length;f.clock.advance(60000);assert.equal(f.writes.length,count);
 f.tour.setBlocked('hidden',false);f.clock.advance(2040);
 f.tour.pointerStart(1);const manual={position:[30,90,50],target:[1,0,2]};f.setManualPose(manual);f.tour.pointerEnd(1);f.clock.advance(2000);assert.deepEqual(f.pose(),manual);
 f.clock.advance(40);assert.ok(Math.hypot(...f.pose().position.map((v,i)=>v-manual.position[i]))<.1);
 f.tour.pause();f.tour.setOverview({...overview,position:[120,180,160]},[],aerialFocus);const paused=structuredClone(f.pose());f.clock.advance(60000);assert.deepEqual(f.pose(),paused);f.tour.dispose();
 const reduced=setup({aerialFocus,reducedMotion:true});reduced.clock.advance(100000);assert.equal(reduced.writes.length,0);reduced.tour.dispose();
});
test('empty aerial subjects retain the original panorama without invented focus points',()=>{
 assert.deepEqual(droneOrbitPose(overview,overview,45000,3000,90000,{points:[],minimumHeight:50}),droneOrbitPose(overview,overview,45000));
});
test('aerial complete laps and return paths stay clear of roof, tree and animal volumes',async()=>{
 const source=await readFile(new URL('../lib/farm-cinematic-tour.ts',import.meta.url),'utf8');
 const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
 const {cinematicSegmentClear,cinematicReturnPath}=await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
 const obstacles=[{min:[-40,0,-30],max:[-20,12,30]},{min:[14,0,8],max:[34,30,32]},{min:[-5,0,-35],max:[5,3,-25]}];
 let previous=droneOrbitPose(overview,overview,3000,3000,90000,aerialFocus).position;
 for(let t=3040;t<=273000;t+=40){const current=droneOrbitPose(overview,overview,t,3000,90000,aerialFocus).position;assert.equal(cinematicSegmentClear(previous,current,obstacles,.35),true);previous=current;}
 const manual={position:[50,4,50],target:[25,0,20]},returns=cinematicReturnPath(manual,overview,obstacles,1);assert.ok(returns?.length);previous=manual.position;
 for(const shot of returns){assert.equal(cinematicSegmentClear(previous,shot.position,obstacles,.35),true);previous=shot.position;}
 assert.deepEqual(previous,overview.position);
 assert.equal(cinematicReturnPath({position:[20,2,20],target:[0,0,0]},overview,obstacles,1),null);
});
test('aerial configuration is copied and does not change from external mutation',()=>{
 const input=structuredClone(aerialFocus),f=setup({aerialFocus:input});input.minimumHeight=99999;input.points[0].target[0]=99999;
 f.tour.play();f.clock.advance(5000);assert.ok(f.pose().position[1]<200);f.tour.dispose();
 assert.throws(()=>setup({aerialFocus:{points:[],minimumHeight:NaN}}),TypeError);
});

test('aerial height envelope also holds during joining, with high geometry and an empty farm',()=>{
 for(const points of [[],[{id:'barn',position:[0,0,0],target:[20,0,-10]}]]){
  const focus={minimumHeight:120,points},from={position:[10,125,10],target:[8,120,8]};
  for(let t=0;t<=183000;t+=40){
   const pose=droneOrbitPose(from,overview,t,3000,90000,focus);
   assert.ok(pose.position[1]>=120-1e-8,`height ${pose.position[1]} at ${t}`);
  }
 }
});
