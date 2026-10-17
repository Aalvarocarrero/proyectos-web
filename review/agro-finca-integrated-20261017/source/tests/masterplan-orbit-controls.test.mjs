import assert from 'node:assert/strict';
import test from 'node:test';
import { PerspectiveCamera, TOUCH, Vector3 } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Numeric tests of the installed Three.js controls. The DOM below only routes
// listeners; these tests do not emulate a browser or claim physical-device QA.
const WIDTH = 800;
const HEIGHT = 600;
const EPSILON = 1e-9;

function eventTarget() {
  const listeners = new Map();
  return {
    style: {},
    clientWidth: WIDTH,
    clientHeight: HEIGHT,
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    dispatch(type, event) {
      for (const listener of [...(listeners.get(type) ?? [])]) listener(event);
    },
    listenerCount(type) {
      return listeners.get(type)?.size ?? 0;
    },
    setPointerCapture() {},
    releasePointerCapture() {},
    getBoundingClientRect() {
      return { left: 0, top: 0, width: WIDTH, height: HEIGHT };
    },
  };
}

function touch(pointerId, x, y) {
  return {
    pointerId,
    pointerType: 'touch',
    pageX: x,
    pageY: y,
    clientX: x,
    clientY: y,
    preventDefault() {},
  };
}

function createControls(t) {
  const element = eventTarget();
  const document = eventTarget();
  element.ownerDocument = document;
  element.getRootNode = () => document;
  const camera = new PerspectiveCamera(42, WIDTH / HEIGHT, 0.1, 1000);
  camera.position.set(0, 60, 100);
  const controls = new OrbitControls(camera, element);
  controls.enableDamping = false;
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.enablePan = true;
  controls.screenSpacePanning = true;
  controls.touches.ONE = TOUCH.ROTATE;
  controls.touches.TWO = TOUCH.DOLLY_PAN;
  controls.minDistance = 25;
  controls.maxDistance = 300;
  controls.minPolarAngle = 0.12;
  controls.maxPolarAngle = Math.PI * 0.47;
  controls.update();
  camera.updateMatrixWorld();
  t.after(() => controls.dispose());

  function emit(type, id, x, y) {
    const receiver = type === 'pointerdown' || type === 'pointercancel' ? element : document;
    receiver.dispatch(type, touch(id, x, y));
    // A renderer normally refreshes the camera matrix between displayed frames.
    camera.updateMatrixWorld();
  }

  function beginPair() {
    emit('pointerdown', 1, 300, 300);
    emit('pointerdown', 2, 500, 300);
  }

  function synchronizedPair(left, right) {
    // Unit-test one shared touch snapshot: seed the other pointer's latest
    // position, then invoke the real registered pointermove callback. Native
    // pointer events arrive separately; those sequences are also tested below.
    controls._trackPointer(touch(1, ...left));
    emit('pointermove', 2, ...right);
  }

  return { camera, controls, element, document, emit, beginPair, synchronizedPair };
}

function near(actual, expected, tolerance = EPSILON, message = 'numeric values agree') {
  assert.ok(Math.abs(actual - expected) <= tolerance,
    `${message}: expected ${expected}, received ${actual}, tolerance ${tolerance}`);
}

function vectorNear(actual, expected, tolerance = EPSILON, message = 'vectors agree') {
  assert.ok(actual.distanceTo(expected) <= tolerance,
    `${message}: expected ${expected.toArray()}, received ${actual.toArray()}, tolerance ${tolerance}`);
}

function worldUnitsPerPixel(camera, controls) {
  return 2 * controls.getDistance() * Math.tan(camera.fov * Math.PI / 360) / HEIGHT;
}

function expectedPan(camera, unitsPerPixel, dx, dy) {
  const right = new Vector3().setFromMatrixColumn(camera.matrix, 0);
  const up = new Vector3().setFromMatrixColumn(camera.matrix, 1);
  return right.multiplyScalar(-dx * unitsPerPixel).addScaledVector(up, dy * unitsPerPixel);
}

function snapshot(camera, controls) {
  return {
    position: camera.position.clone(),
    target: controls.target.clone(),
    distance: controls.getDistance(),
    azimuth: controls.getAzimuthalAngle(),
    polar: controls.getPolarAngle(),
  };
}

function unchanged(camera, controls, before) {
  vectorNear(camera.position, before.position, EPSILON, 'camera does not jump');
  vectorNear(controls.target, before.target, EPSILON, 'target does not jump');
  near(controls.getDistance(), before.distance);
  near(controls.getAzimuthalAngle(), before.azimuth);
  near(controls.getPolarAngle(), before.polar);
}

test('one touch orbits both axes without panning or zooming', (t) => {
  const { camera, controls, element, emit } = createControls(t);
  const before = snapshot(camera, controls);
  emit('pointerdown', 1, 400, 300);
  emit('pointermove', 1, 436, 318);
  near(controls.getAzimuthalAngle(), before.azimuth - 2 * Math.PI * 36 / HEIGHT);
  near(controls.getPolarAngle(), before.polar - 2 * Math.PI * 18 / HEIGHT);
  near(controls.getDistance(), before.distance);
  vectorNear(controls.target, before.target);
  assert.ok(camera.position.distanceTo(before.position) > 1, 'camera actually orbits');
  assert.equal(element.style.touchAction, 'none', 'canvas owns touch gestures');
});

test('two-finger translation pans in both axes without net dolly or orbit', (t) => {
  const { camera, controls, emit, beginPair } = createControls(t);
  const before = snapshot(camera, controls);
  const pixel = worldUnitsPerPixel(camera, controls);
  const expected = expectedPan(camera, pixel, 60, 30);
  beginPair();
  for (let step = 1; step <= 60; step++) {
    emit('pointermove', 1, 300 + step, 300 + step / 2);
    emit('pointermove', 2, 500 + step, 300 + step / 2);
  }
  near(controls.getDistance(), before.distance);
  near(controls.getAzimuthalAngle(), before.azimuth);
  near(controls.getPolarAngle(), before.polar);
  assert.ok(controls.target.length() > pixel * 60, 'centroid motion produces substantial pan');
  // Each native event temporarily changes the separation until the other finger
  // catches up. Bound the resulting integration error to a quarter screen pixel.
  vectorNear(controls.target, expected, pixel * 0.25, 'pan follows the touch centroid');
  vectorNear(camera.position.clone().sub(before.position), controls.target);
});

test('synchronized symmetric pinch changes distance with exactly fixed target', (t) => {
  const { camera, controls, beginPair, synchronizedPair } = createControls(t);
  const before = snapshot(camera, controls);
  beginPair();
  synchronizedPair([220, 300], [580, 300]);
  near(controls.getDistance(), before.distance * 200 / 360);
  vectorNear(controls.target, before.target, EPSILON, 'fixed centroid produces no pan');
  near(controls.getAzimuthalAngle(), before.azimuth);
  near(controls.getPolarAngle(), before.polar);
  synchronizedPair([300, 300], [500, 300]);
  unchanged(camera, controls, before);
});

test('sequential symmetric pinch keeps centroid drift below a quarter screen pixel', (t) => {
  const { camera, controls, emit, beginPair } = createControls(t);
  const before = snapshot(camera, controls);
  beginPair();
  for (let step = 1; step <= 80; step++) {
    emit('pointermove', 1, 300 - step, 300);
    emit('pointermove', 2, 500 + step, 300);
  }
  near(controls.getDistance(), before.distance * 200 / 360);
  near(controls.getAzimuthalAngle(), before.azimuth);
  near(controls.getPolarAngle(), before.polar);
  // OrbitControls integrates each finger independently. Its intermediate
  // centroid moves by 0.5 px before the opposite event restores it; the changed
  // camera distance leaves a tiny residual (~0.20 final screen pixels here).
  vectorNear(controls.target, before.target, worldUnitsPerPixel(camera, controls) * 0.25,
    'sequential-event pan residue remains subpixel');
});

test('one two-touch update simultaneously pans and pinches without switching modes', (t) => {
  const { camera, controls, beginPair, synchronizedPair } = createControls(t);
  const before = snapshot(camera, controls);
  const expected = expectedPan(camera, worldUnitsPerPixel(camera, controls), 40, 20);
  beginPair();
  // Centroid moves (400, 300) -> (440, 320), separation grows 200 -> 280.
  synchronizedPair([300, 320], [580, 320]);
  near(controls.getDistance(), before.distance * 200 / 280);
  vectorNear(controls.target, expected, EPSILON, 'same update applies centroid pan');
  assert.ok(controls.target.length() > 1);
  assert.ok(controls.getDistance() < before.distance);
  near(controls.getAzimuthalAngle(), before.azimuth);
  near(controls.getPolarAngle(), before.polar);
});

test('native pointer sequence combines pan and pinch continuously', (t) => {
  const { camera, controls, emit, beginPair } = createControls(t);
  const before = snapshot(camera, controls);
  beginPair();
  let previousDistance = before.distance;
  let previousTarget = controls.target.clone();
  for (let step = 1; step <= 40; step++) {
    emit('pointermove', 1, 300, 300 + step / 2);
    emit('pointermove', 2, 500 + 2 * step, 300 + step / 2);
    assert.ok(controls.getDistance() < previousDistance, 'every paired update zooms in');
    assert.ok(controls.target.distanceTo(previousTarget) > 0.01, 'every paired update also pans');
    previousDistance = controls.getDistance();
    previousTarget = controls.target.clone();
  }
  near(controls.getDistance(), before.distance * 200 / 280);
  near(controls.getAzimuthalAngle(), before.azimuth);
  near(controls.getPolarAngle(), before.polar);
  assert.ok(controls.target.x < -1, 'rightward centroid translates target left');
  assert.ok(controls.target.y > 0.5, 'downward centroid produces vertical screen-space pan');
});

for (const endType of ['pointerup', 'pointercancel']) {
  test(`${endType} rebases a remaining finger and a later pinch without stale jumps`, (t) => {
    const { camera, controls, document, emit, beginPair } = createControls(t);
    beginPair();
    emit('pointermove', 1, 310, 310);
    emit('pointermove', 2, 550, 330);
    const beforeLift = snapshot(camera, controls);
    emit(endType, 2, 550, 330);
    unchanged(camera, controls, beforeLift);
    emit('pointermove', 1, 310, 310);
    unchanged(camera, controls, beforeLift);
    emit('pointermove', 1, 312, 310);
    near(controls.getAzimuthalAngle(), beforeLift.azimuth - 2 * Math.PI * 2 / HEIGHT,
      EPSILON, 'remaining finger resumes from its latest coordinates');
    vectorNear(controls.target, beforeLift.target);
    near(controls.getDistance(), beforeLift.distance);

    const beforeNewFinger = snapshot(camera, controls);
    emit('pointerdown', 3, 720, 420);
    emit('pointermove', 3, 720, 420);
    unchanged(camera, controls, beforeNewFinger);
    emit('pointermove', 3, 722, 420);
    assert.ok(controls.getDistance() < beforeNewFinger.distance, 'new pinch uses its new baseline');
    assert.ok(controls.target.distanceTo(beforeNewFinger.target) < 1, 'small move cannot cause stale pan');

    emit(endType, 3, 722, 420);
    emit(endType, 1, 312, 310);
    assert.equal(document.listenerCount('pointermove'), 0, 'last lift removes document listener');
    assert.equal(document.listenerCount('pointerup'), 0);
    assert.deepEqual(controls._pointers, [], 'no active stale pointers');
    assert.deepEqual(controls._pointerPositions, {}, 'no stale pointer coordinates');
    const beforeRestart = snapshot(camera, controls);
    emit('pointermove', 1, 50, 50);
    unchanged(camera, controls, beforeRestart);
    emit('pointerdown', 4, 100, 100);
    emit('pointermove', 4, 100, 100);
    unchanged(camera, controls, beforeRestart);
    emit('pointermove', 4, 102, 100);
    near(controls.getAzimuthalAngle(), beforeRestart.azimuth - 2 * Math.PI * 2 / HEIGHT);
  });
}
