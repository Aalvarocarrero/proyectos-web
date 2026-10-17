/** A camera-only aerial flight. It never writes farm data or owns OrbitControls. */
export type DroneTourVector = readonly [number, number, number];
export type DroneTourPose = {position: DroneTourVector; target: DroneTourVector};
export type DroneTourPoint = DroneTourPose & {id: string; label?: string};
export type DroneTourShot = DroneTourPoint & {durationMs:number};
export type DroneAerialFocus = {points: readonly DroneTourPoint[]; minimumHeight: number};
export type DroneTourMode = 'aerial' | 'cinematic';
export type DroneTourPhase = 'disabled' | 'paused' | 'suspended' | 'idle' | 'returning' | 'orbiting' | 'cinematic' | 'dwelling' | 'disposed';
export type DroneTourState = {
  phase: DroneTourPhase;
  mode: DroneTourMode;
  enabled: boolean;
  manualPaused: boolean;
  reducedMotion: boolean;
  /** True only while reduced motion is preventing playback (before opt-in). */
  motionBlocked: boolean;
  pointId: string | null;
  label: string | null;
  blockers: readonly string[];
  pointerCount: number;
};
export type DroneTourScheduler = {
  now: () => number;
  requestAnimationFrame: (callback: (time: number) => void) => number;
  cancelAnimationFrame: (handle: number) => void;
  setTimeout: (callback: () => void, delay: number) => number;
  clearTimeout: (handle: number) => void;
};
export type DroneTourOptions = {
  /** Pass true only for the read-only demonstration, never for a user's farm. */
  enabled: boolean;
  /** Panorama envelope; optional aerialFocus adds moderate exterior approaches. */
  overview: DroneTourPoint;
  aerialFocus?: DroneAerialFocus;
  mode?: DroneTourMode;
  shots?: readonly DroneTourShot[];
  /** null means no collision-safe return exists: yield the camera, never teleport. */
  getReturnPath?: (from:DroneTourPose,overview:DroneTourPoint,mode:DroneTourMode)=>readonly DroneTourShot[]|null;
  getPose: () => DroneTourPose;
  setPose: (pose: DroneTourPose) => void;
  onState?: (state: DroneTourState) => void;
  autoplay?: boolean;
  reducedMotion?: boolean;
  initialDwellMs?: number;
  idleMs?: number;
  transitionMs?: number;
  /** One full, uninterrupted revolution, including its broad detail pass. */
  orbitMs?: number;
  /** Camera writes are capped at ~30 Hz by default, independently of RAF Hz. */
  frameIntervalMs?: number;
  scheduler?: DroneTourScheduler;
};

const browserScheduler: DroneTourScheduler = {
  now: () => performance.now(),
  requestAnimationFrame: callback => globalThis.requestAnimationFrame(callback),
  cancelAnimationFrame: handle => globalThis.cancelAnimationFrame(handle),
  setTimeout: (callback, delay) => globalThis.setTimeout(callback, delay) as unknown as number,
  clearTimeout: handle => globalThis.clearTimeout(handle),
};
const TAU = Math.PI * 2;
function copyVector(vector: DroneTourVector): DroneTourVector {
  if (vector.length !== 3 || !vector.every(Number.isFinite)) throw new TypeError('Tour poses require three finite coordinates.');
  return [vector[0], vector[1], vector[2]];
}
function copyPose(pose: DroneTourPose): DroneTourPose {
  return {position: copyVector(pose.position), target: copyVector(pose.target)};
}
function copyPoint(point: DroneTourPoint): DroneTourPoint {
  return {...copyPose(point), id: point.id, label: point.label};
}
function duration(value: number | undefined, fallback: number, minimum = 0, maximum = 60_000): number {
  return value === undefined || !Number.isFinite(value) ? fallback : Math.min(maximum, Math.max(minimum, value));
}
function spherical(pose: DroneTourPose) {
  const x = pose.position[0] - pose.target[0], y = pose.position[1] - pose.target[1], z = pose.position[2] - pose.target[2];
  const radius = Math.hypot(x, y, z);
  return {radius, azimuth: Math.atan2(x, z), elevation: radius ? Math.asin(Math.max(-1, Math.min(1, y / radius))) : Math.PI / 4};
}

/**
 * Join the orbit from the CURRENT view, preserving heading instead of flying
 * through the parcel to a fixed opening pose. Radius/elevation/target settle
 * once; optional focus points add one broad approach per lap and lateral framing.
 * Smooth angular acceleration gives
 * the join and every 360° seam matching position AND velocity.
 */
export function droneOrbitPose(from: DroneTourPose, overview: DroneTourPose, elapsedMs: number, transitionMs = 3000, orbitMs = 90_000, aerialFocus?: DroneAerialFocus): DroneTourPose {
  const elapsed = Math.max(0, elapsedMs), transition = Math.max(1, transitionMs);
  const t = Math.min(1, elapsed / transition), ease = t * t * (3 - 2 * t);
  const start = spherical(from), orbit = spherical(overview);
  // Integral of smoothstep: accelerate to steady angular velocity, never stop.
  const flightTime = elapsed < transition ? transition * (t ** 3 - t ** 4 / 2) : elapsed - transition / 2;
  const azimuth = start.azimuth + (flightTime % orbitMs) / orbitMs * TAU;
  const radius = start.radius + (orbit.radius - start.radius) * ease;
  const elevation = start.elevation + (orbit.elevation - start.elevation) * ease;
  const target: DroneTourVector = [
    from.target[0] + (overview.target[0] - from.target[0]) * ease,
    from.target[1] + (overview.target[1] - from.target[1]) * ease,
    from.target[2] + (overview.target[2] - from.target[2]) * ease,
  ];
  const horizontal = Math.cos(elevation) * radius;
  const position: [number,number,number] = [target[0] + Math.sin(azimuth) * horizontal, target[1] + Math.sin(elevation) * radius, target[2] + Math.cos(azimuth) * horizontal];
  if (!aerialFocus) return {target,position};
  if (!aerialFocus.points.length) {position[1]=from.position[1]*(1-ease)+Math.max(overview.position[1],aerialFocus.minimumHeight)*ease;return {target,position};}
  // Positive periodic weights avoid hard waypoint switches. Position and target
  // share a modest lateral drift, keeping the horizon-facing aerial attitude.
  const weights=aerialFocus.points.map(point=>Math.exp(4*Math.cos(azimuth-Math.atan2(point.target[0]-overview.target[0],point.target[2]-overview.target[2]))));
  const total=weights.reduce((sum,w)=>sum+w,0),focus=[0,0,0];
  aerialFocus.points.forEach((point,index)=>{for(let axis=0;axis<3;axis++)focus[axis]+=(point.target[axis]-overview.target[axis])*weights[index]/total;});
  const limit=orbit.radius*.22,length=Math.hypot(focus[0],focus[2]),bounded=limit/Math.hypot(limit,length);
  // A SINGLE long approach/reveal over a complete revolution, never a repeated
  // zoom in/out at each subject. Zoom is geometric; FOV is left untouched.
  const approach=.24*(1-Math.cos(azimuth-orbit.azimuth))/2,scale=1-approach*ease;
  for(const axis of [0,2])position[axis]=target[axis]+(position[axis]-target[axis])*scale+focus[axis]*bounded*.45*ease;
  // Entire stable trajectory lies above every registered roof/tree/animal.
  // Use a constant safe baseline before the smooth height modulation, rather
  // than clamping each frame (which would create a velocity kink).
  const safeHeight=Math.max(overview.position[1],aerialFocus.minimumHeight/.82);
  position[1]=from.position[1]*(1-ease)+ease*safeHeight*(1-approach*.75);
  return {position,target:[target[0]+focus[0]*bounded*.65*ease,target[1],target[2]+focus[2]*bounded*.65*ease]};
}

/** Quintic easing keeps position, velocity and acceleration continuous at shot boundaries. */
export function interpolateCinematicPose(from:DroneTourPose,to:DroneTourPose,progress:number):DroneTourPose{
 const t=Math.max(0,Math.min(1,progress)),ease=t*t*t*(t*(t*6-15)+10);
 const blend=(a:DroneTourVector,b:DroneTourVector):DroneTourVector=>[a[0]+(b[0]-a[0])*ease,a[1]+(b[1]-a[1])*ease,a[2]+(b[2]-a[2])*ease];
 return {position:blend(from.position,to.position),target:blend(from.target,to.target)};
}
export function sampleDroneShots(from:DroneTourPose,shots:readonly DroneTourShot[],elapsedMs:number){
 let elapsed=Math.max(0,elapsedMs),previous=from;
 for(const shot of shots){if(elapsed<shot.durationMs)return {pose:interpolateCinematicPose(previous,shot,elapsed/shot.durationMs),shot};elapsed-=shot.durationMs;previous=shot;}
 return {pose:copyPose(previous),shot:shots.at(-1)};
}
const copyAerialFocus=(focus:DroneAerialFocus|undefined):DroneAerialFocus|undefined=>{
 if(!focus)return undefined;
 if(!Number.isFinite(focus.minimumHeight)||focus.minimumHeight<0)throw new TypeError('Aerial focus requires a finite nonnegative clearance height.');
 return {minimumHeight:focus.minimumHeight,points:focus.points.slice(0,9).map(copyPoint)};
};
const copyShots=(shots:readonly DroneTourShot[])=>shots.map(shot=>({...copyPoint(shot),durationMs:duration(shot.durationMs,6000,500)}));

/**
 * One cancellable RAF while flying; no RAF while idle, hidden or paused.
 * Wire pointerStart in capture phase, before mouse/touch controls change the
 * camera; pointerEnd on up/cancel/lost capture; activity on wheel/manual views.
 * Do not wire OrbitControls' change to activity: tour poses also emit it.
 */
export function createFarmDroneTour(options: DroneTourOptions) {
  const scheduler = options.scheduler ?? browserScheduler;
  let aerialFocus=copyAerialFocus(options.aerialFocus);
  let overview = copyPoint(options.overview),shots=copyShots(options.shots??[]),mode:DroneTourMode=options.mode??'aerial',current:DroneTourPoint=overview;
  const idleMs = duration(options.idleMs, 2000), transitionMs = duration(options.transitionMs, 3000, 1);
  const initialDwellMs = duration(options.initialDwellMs, 1200);
  const orbitMs = duration(options.orbitMs, 90_000, 30_000, 300_000);
  const frameIntervalMs = Math.min(1000, duration(options.frameIntervalMs, 1000 / 30, 1));
  const blockers = new Set<string>(), pointers = new Set<number | string>();
  let enabled = options.enabled === true, manualPaused = options.autoplay === false;
  let reducedMotion = options.reducedMotion === true, motionOptIn = false, disposed = false;
  let phase: DroneTourPhase = 'disabled';
  let frame: number | null = null, timer: number | null = null, generation = 0, lastState = '';

  // Keep progress across pause, dialogs and visibility changes. A manual camera
  // move or a new route invalidates this snapshot and uses the checked return.
  let flight: {from:DroneTourPose;returns:DroneTourShot[];destination:DroneTourPose;route:DroneTourShot[];mode:DroneTourMode;elapsed:number;pose:DroneTourPose}|null=null;
  const samePose=(a:DroneTourPose,b:DroneTourPose)=>[...a.position,...a.target].every((value,index)=>Math.abs(value-[...b.position,...b.target][index])<1e-6);

  function getState(): DroneTourState {
    return {phase, mode, enabled, manualPaused, reducedMotion, motionBlocked: reducedMotion && !motionOptIn,
      pointId: current.id, label: current.label ?? null, blockers: [...blockers].sort(), pointerCount: pointers.size};
  }
  function emit() {
    const state = getState(), signature = JSON.stringify(state);
    if (signature !== lastState) {lastState = signature; options.onState?.(state);}
  }
  function cancelScheduled() {
    generation++;
    if (frame !== null) scheduler.cancelAnimationFrame(frame);
    if (timer !== null) scheduler.clearTimeout(timer);
    frame = timer = null;
  }
  function passivePhase(): DroneTourPhase | null {
    if (disposed) return 'disposed';
    if (!enabled) return 'disabled';
    if (manualPaused) return 'paused';
    if ((reducedMotion && !motionOptIn) || blockers.size || pointers.size) return 'suspended';
    return null;
  }
  function valid(token: number) {return token === generation && passivePhase() === null;}

  function fly() {
    cancelScheduled();
    if (passivePhase()) {reconcile(); return;}
    let from: DroneTourPose;
    try {from = copyPose(options.getPose());}
    catch {blockers.add('invalid-pose'); reconcile(); return;}
    const resumed=flight&&flight.mode===mode&&samePose(from,flight.pose)?flight:null;
    const returnPath=resumed?.returns??(options.getReturnPath?.(from,overview,mode)??(options.getReturnPath?null:[]));
    if(returnPath===null){blockers.add('unsafe-camera');reconcile();return;}
    const returns=copyShots(returnPath),returnDuration=returns.reduce((total,shot)=>total+shot.durationMs,0);
    if(resumed)from=resumed.from;
    const token = generation, destination = resumed?.destination??copyPose(overview),route=resumed?.route??copyShots(shots),routeDuration=route.reduce((total,shot)=>total+shot.durationMs,0),flightMode=mode;
    const orbitStart=returns.at(-1)??from;
    current=overview;
    let previousTime = scheduler.now(), elapsed = resumed?.elapsed??0, lastWrite = -Infinity;
    phase = 'returning';
    emit();
    if (!valid(token)) return;
    const step = () => {
      // A canceled callback may already be queued. It must not erase a newer
      // handle, move the camera, or revive a paused/unmounted tour.
      if (!valid(token)) return;
      frame = null;
      const now = scheduler.now();
      // A busy phone or a suspended browser must not catch up with a big jump.
      elapsed += Math.min(80, Math.max(0, now - previousTime));
      previousTime = now;
      if (now - lastWrite >= frameIntervalMs - .5) {
        lastWrite = now;
        let next:DroneTourPose,nextPhase:DroneTourPhase,nextPoint:DroneTourPoint=overview;
        if(elapsed<returnDuration){const sample=sampleDroneShots(from,returns,elapsed);next=sample.pose;nextPoint=sample.shot??overview;nextPhase='returning';}
        else if(flightMode==='cinematic'&&routeDuration){const sample=sampleDroneShots(destination,route,(elapsed-returnDuration)%routeDuration);next=sample.pose;nextPoint=sample.shot??overview;nextPhase='cinematic';}
        else {next=droneOrbitPose(orbitStart,destination,elapsed-returnDuration,transitionMs,orbitMs,aerialFocus);nextPhase=elapsed-returnDuration>=transitionMs?'orbiting':'returning';}
        options.setPose(next);
        flight={from,returns,destination,route,mode:flightMode,elapsed,pose:copyPose(options.getPose())};
        if(valid(token)&&(phase!==nextPhase||current.id!==nextPoint.id)){phase=nextPhase;current=nextPoint;emit();}
      }
      if (!valid(token)) return;
      if((flightMode==='aerial'||!routeDuration)&&elapsed>=returnDuration+transitionMs&&phase!=='orbiting'){phase='orbiting';emit();}
      if (valid(token)) frame = scheduler.requestAnimationFrame(step);
    };
    frame = scheduler.requestAnimationFrame(step);
  }
  function reconcile(delay = idleMs, initial = false) {
    cancelScheduled();
    const passive = passivePhase();
    if (passive) {phase = passive; emit(); return;}
    const token = generation;
    phase = initial ? 'dwelling' : 'idle'; emit();
    if (!valid(token)) return;
    timer = scheduler.setTimeout(() => {
      if (!valid(token)) return;
      timer = null; fly();
    }, delay);
  }

  const controller = {
    getState,
    /** Immediately yields the camera. Each held contact requires its own end. */
    pointerStart(id: number | string) {
      if (disposed || pointers.has(id)) return;
      blockers.delete('unsafe-camera');pointers.add(id); reconcile();
    },
    pointerEnd(id: number | string) {
      if (disposed || !pointers.delete(id)) return;
      // The idle clock begins after the LAST release, never at pointerdown.
      reconcile();
    },
    releasePointers() {
      if (disposed || !pointers.size) return;
      pointers.clear(); reconcile();
    },
    activity() {if (!disposed){blockers.delete('unsafe-camera');reconcile();}},
    setBlocked(reason: string, blocked: boolean) {
      if (disposed || blockers.has(reason) === blocked) return;
      if (blocked) blockers.add(reason); else blockers.delete(reason);
      reconcile();
    },
    /** Refit after resizing without a heading reset or overriding any pause. */
    setOverview(value: DroneTourPoint,route?:readonly DroneTourShot[],focus?:DroneAerialFocus) {
      if (disposed) return;
      const nextOverview=copyPoint(value),nextShots=route?copyShots(route):shots;
      if(samePose(overview,nextOverview)&&JSON.stringify(shots)===JSON.stringify(nextShots)&&JSON.stringify(aerialFocus)===JSON.stringify(focus??aerialFocus))return;
      aerialFocus=focus?copyAerialFocus(focus):aerialFocus;
      flight=null;overview=nextOverview;shots=nextShots;
      if (phase === 'orbiting' || phase === 'returning' || phase === 'cinematic') fly();
      else emit();
    },
    setMode(value:DroneTourMode){
      if(disposed||mode===value)return;
      mode=value;blockers.delete('unsafe-camera');
      if(phase==='orbiting'||phase==='cinematic'||phase==='returning')fly();else reconcile();
    },
    setEnabled(value: boolean) {
      if (disposed || enabled === value) return;
      enabled = value; reconcile(initialDwellMs, true);
    },
    setReducedMotion(value: boolean) {
      if (disposed || reducedMotion === value) return;
      reducedMotion = value; motionOptIn = false; reconcile();
    },
    pause() {
      if (disposed) return;
      manualPaused = true; reconcile();
    },
    /** Explicit Play can opt into animation with prefers-reduced-motion. */
    play() {
      if (disposed) return;
      blockers.delete('unsafe-camera');manualPaused = false; motionOptIn = true;
      if (passivePhase()) reconcile(); else fly();
    },
    dispose() {
      if (disposed) return;
      disposed = true; flight=null; cancelScheduled(); pointers.clear(); blockers.clear();
      phase = 'disposed'; emit();
    },
  };
  reconcile(initialDwellMs, true);
  return controller;
}

export type FarmDroneTour = ReturnType<typeof createFarmDroneTour>;
