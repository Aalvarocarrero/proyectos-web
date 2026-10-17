import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const root = fileURLToPath(new URL('..', import.meta.url));
const vite = await createServer({ root, configFile: false, appType: 'custom', resolve: { alias: { '@': root } }, server: { middlewareMode: true, hmr: false, ws: false, watch: null } });
after(() => vite.close());
const { createFarmAnimalMotionPlan, farmAnimalMotionPose, MAX_FARM_MOVING_ANIMALS } = await vite.ssrLoadModule('/lib/farm-animal-motion.ts');
const { edgeClearance, inside } = await vite.ssrLoadModule('/lib/illustrated-geometry.ts');
const rectangle = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
const animal = (id = 'saved-animal', x = 10, y = 10, species = 'cattle') => ({ id, position: { x, y }, species });
const defaults = { animals: [animal()], enclosure: rectangle(0, 0, 30, 30), property: rectangle(-5, -5, 40, 40), unitsPerMetre: 1 };
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const displacement = pose => Math.hypot(pose.offset.x, pose.offset.y);
const distanceToRing = (p, ring) => Math.min(...ring.map((a, i) => { const b = ring[(i + 1) % ring.length], dx = b.x - a.x, dy = b.y - a.y; const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1))); return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy); }));

test('plans and poses are deterministic, preserve frozen inputs and never infer or reposition records', () => {
  const input = freeze(structuredClone(defaults)), before = JSON.stringify(input);
  const plans = createFarmAnimalMotionPlan(input);
  assert.equal(plans.length, 1);
  assert.deepEqual(plans, createFarmAnimalMotionPlan(input));
  assert.deepEqual(plans[0].origin, input.animals[0].position);
  assert.notEqual(plans[0].origin, input.animals[0].position);
  for (const time of [0, 7000, 11000, 19000, 100000]) assert.deepEqual(farmAnimalMotionPose(plans[0], time), farmAnimalMotionPose(plans[0], time));
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(createFarmAnimalMotionPlan({ ...input, animals: [] }), []);
  for (const species of [undefined, 'unknown', 'fish', 'shrimp', 'bee', 'hive', 'worm']) assert.deepEqual(createFarmAnimalMotionPlan({ ...input, animals: [{ ...animal(), species }] }), []);
});

test('hard cap is eight; exclusions and invalid duplicate identities stay stationary', () => {
  const animals = Array.from({ length: 20 }, (_, i) => animal(String(i), 5 + i * 7, 10));
  const input = { ...defaults, animals, enclosure: rectangle(0, 0, 150, 30), property: rectangle(0, 0, 150, 30) };
  assert.equal(createFarmAnimalMotionPlan({ ...input, maxAnimals: 500 }).length, MAX_FARM_MOVING_ANIMALS);
  assert.equal(createFarmAnimalMotionPlan({ ...input, maxAnimals: 2 }).length, 2);
  assert.equal(createFarmAnimalMotionPlan({ ...input, maxAnimals: 0 }).length, 0);
  const plans = createFarmAnimalMotionPlan({ ...input, excludedIds: ['0', '1'] });
  assert.ok(plans.every(p => p.id !== '0' && p.id !== '1'));
  assert.deepEqual(createFarmAnimalMotionPlan({ ...defaults, animals: [animal('duplicate', 8), animal('duplicate', 20)] }), []);
});

test('rest intervals, resets and loop boundaries are position/orientation continuous with zero endpoint velocity', () => {
  const [plan] = createFarmAnimalMotionPlan(defaults), zero = { offset: { x: 0, y: 0 }, yawDelta: 0, moving: false };
  for (const time of [0, -1, NaN, Infinity, plan.restMs / 2, plan.restMs, plan.cycleMs, plan.cycleMs * 10]) assert.deepEqual(farmAnimalMotionPose(plan, time), zero);
  const walking = farmAnimalMotionPose(plan, plan.restMs + plan.walkMs / 2);
  assert.equal(walking.moving, true);
  assert.ok(displacement(walking) > .8 && displacement(walking) <= .9 + 1e-9);
  for (const boundary of [plan.restMs, plan.cycleMs, plan.cycleMs + plan.restMs]) {
    const a = farmAnimalMotionPose(plan, boundary - .01), b = farmAnimalMotionPose(plan, boundary + .01);
    assert.ok(Math.hypot(a.offset.x - b.offset.x, a.offset.y - b.offset.y) < 1e-8);
    assert.ok(Math.abs(Math.sin(a.yawDelta - b.yawDelta)) < 1e-8);
    assert.ok(Math.cos(a.yawDelta - b.yawDelta) > .999999);
  }
  for (const time of [1e12, Number.MAX_VALUE]) { const pose = farmAnimalMotionPose(plan, time); assert.ok(Number.isFinite(pose.yawDelta)); assert.ok(displacement(pose) <= .9 + 1e-9); }
});

test('swept body footprint stays inside concave enclosure and property with either winding at every phase', () => {
  const concave = [{ x: 0, y: 0 }, { x: 18, y: 0 }, { x: 18, y: 7 }, { x: 7, y: 7 }, { x: 7, y: 18 }, { x: 0, y: 18 }];
  for (const unitsPerMetre of [.22, 1, 2]) for (const reversed of [false, true]) {
    const enclosure = (reversed ? [...concave].reverse() : concave).map(p => ({ x: p.x * unitsPerMetre, y: p.y * unitsPerMetre }));
    const property = rectangle(-2 * unitsPerMetre, -2 * unitsPerMetre, 22 * unitsPerMetre, 22 * unitsPerMetre);
    const plans = createFarmAnimalMotionPlan({ animals: [animal('concave', 4 * unitsPerMetre, 6 * unitsPerMetre)], enclosure, property, unitsPerMetre });
    assert.equal(plans.length, 1);
    for (const plan of plans) for (let i = 0; i <= 2000; i++) {
      const pose = farmAnimalMotionPose(plan, plan.cycleMs * i / 1000), p = { x: plan.origin.x + pose.offset.x, y: plan.origin.y + pose.offset.y };
      assert.ok(edgeClearance(p, enclosure) + 1e-8 >= plan.footprintRadius);
      assert.ok(edgeClearance(p, property) + 1e-8 >= plan.footprintRadius);
      assert.ok(displacement(pose) <= .9 * unitsPerMetre + 1e-8);
    }
  }
  // Position is inside the L, but a rotating cattle body cannot clear the notch.
  assert.deepEqual(createFarmAnimalMotionPlan({ ...defaults, enclosure: concave, animals: [animal('near-notch', 6.7, 8)] }), []);
  assert.deepEqual(createFarmAnimalMotionPlan({ ...defaults, property: rectangle(0, 0, 11, 11) }), []);
});

test('buildings, troughs, thin barriers and stationary neighbours constrain the full route', () => {
  const blockedPolygons = [rectangle(12.3, 6, .05, 8), rectangle(4, 4, 2, 2)];
  const [plan] = createFarmAnimalMotionPlan({ ...defaults, blockedPolygons });
  assert.ok(plan && plan.radius * 2 < .9);
  for (let i = 0; i < 1000; i++) {
    const pose = farmAnimalMotionPose(plan, plan.cycleMs * i / 1000), p = { x: plan.origin.x + pose.offset.x, y: plan.origin.y + pose.offset.y };
    for (const obstacle of blockedPolygons) { assert.equal(inside(p, obstacle), false); assert.ok(distanceToRing(p, obstacle) >= plan.footprintRadius); }
  }
  assert.deepEqual(createFarmAnimalMotionPlan({ ...defaults, blockedPolygons: [rectangle(9, 9, 2, 2)] }), []);
  assert.deepEqual(createFarmAnimalMotionPlan({ ...defaults, animals: [animal(), animal('inspected', 12, 10)], excludedIds: ['inspected'] }), []);
  const plans = createFarmAnimalMotionPlan({ ...defaults, animals: [animal('one', 9, 10), animal('two', 14.1, 10)] });
  assert.equal(plans.length, 2);
  assert.ok(plans[0].footprintRadius + plans[1].footprintRadius + 2 * (plans[0].radius + plans[1].radius) < 5.1);
});

test('invalid geometry, scales and over-budget input fail closed instead of sampling or ignoring obstacles', () => {
  for (const unitsPerMetre of [0, -1, NaN, Infinity]) assert.deepEqual(createFarmAnimalMotionPlan({ ...defaults, unitsPerMetre }), []);
  const badRings = [[], [{ x: 0, y: 0 }], rectangle(0, 0, 0, 10), [{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 10, y: 0 }], [{ x: 0, y: 0 }, { x: Infinity, y: 0 }, { x: 0, y: 10 }], Array.from({ length: 202 }, (_, i) => ({ x: i, y: i }))];
  for (const ring of badRings) for (const field of ['enclosure', 'property']) assert.deepEqual(createFarmAnimalMotionPlan({ ...defaults, [field]: ring }), []);
  assert.deepEqual(createFarmAnimalMotionPlan({ ...defaults, blockedPolygons: [[]] }), []);
  assert.deepEqual(createFarmAnimalMotionPlan({ ...defaults, blockedPolygons: Array(65).fill(rectangle(100, 100, 1, 1)) }), []);
  assert.deepEqual(createFarmAnimalMotionPlan({ ...defaults, animals: Array(129).fill(animal()) }), []);
  assert.deepEqual(createFarmAnimalMotionPlan({ ...defaults, animals: [animal('bad', NaN)] }), []);
  const ring = [...defaults.enclosure, defaults.enclosure[0]];
  assert.equal(createFarmAnimalMotionPlan({ ...defaults, enclosure: ring }).length, 1);
});

test('actual showcase plans use existing nearby animals and preserve all saved positions/counts', async () => {
  const { createFarmShowcase } = await vite.ssrLoadModule('/lib/farm-showcase.ts');
  const { sceneUnitsPerMetre } = await vite.ssrLoadModule('/lib/farm-scene-scale.ts');
  const model = createFarmShowcase(), before = JSON.stringify(model.records), unitsPerMetre = sceneUnitsPerMetre(model.boundary.points, 1, 100000);
  let movingEnclosures = 0;
  for (const area of model.illustrated.areas) {
    const animals = model.illustrated.animals.filter(a => a.areaId === area.id);
    if (!animals.length) continue;
    const t = area.waterTrough;
    const blockedPolygons = t ? [rectangle(t.position.x - t.planWidth / 2, t.position.y - t.planHeight / 2, t.planWidth, t.planHeight)] : [];
    const plans = createFarmAnimalMotionPlan({ animals, enclosure: area.outline, property: model.boundary.points, unitsPerMetre, blockedPolygons });
    if (plans.length) movingEnclosures++;
    assert.ok(plans.length <= 8);
    for (const plan of plans) {
      const saved = animals.find(a => a.id === plan.id);
      assert.ok(saved);
      assert.deepEqual(plan.origin, saved.position);
      for (let i = 0; i < 100; i++) {
        const pose = farmAnimalMotionPose(plan, plan.cycleMs * i / 100), p = { x: plan.origin.x + pose.offset.x, y: plan.origin.y + pose.offset.y };
        assert.ok(edgeClearance(p, area.outline) >= plan.footprintRadius);
        assert.ok(edgeClearance(p, model.boundary.points) >= plan.footprintRadius);
      }
    }
  }
  assert.equal(movingEnclosures, 9);
  assert.equal(model.illustrated.animals.length, 101);
  assert.equal(JSON.stringify(model.records), before);
});

test('clearance disks contain the actual schematic animal meshes at every root orientation', async () => {
  const { createAnimalModel } = await vite.ssrLoadModule('/lib/farm-3d-models.ts');
  const { animalVisualLength } = await vite.ssrLoadModule('/lib/farm-animal-species.ts');
  const { Box3, Vector3 } = await import('three');
  for (const species of ['cattle', 'buffalo', 'pig', 'hen', 'rooster', 'quail', 'duck', 'goose', 'turkey', 'horse', 'donkey', 'mule', 'sheep', 'goat', 'rabbit']) {
    const resources = [], model = createAnimalModel(species, resource => { resources.push(resource); return resource; });
    try {
      model.updateMatrixWorld(true);
      const size = new Box3().setFromObject(model).getSize(new Vector3()), factor = animalVisualLength[species] / Math.max(size.x, size.z);
      const [plan] = createFarmAnimalMotionPlan({ ...defaults, animals: [animal('footprint', 10, 10, species)] });
      model.traverse(object => {
        const positions = object.geometry?.attributes.position;
        if (!positions) return;
        for (let i = 0; i < positions.count; i++) {
          const vertex = new Vector3().fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld);
          assert.ok(Math.hypot(vertex.x, vertex.z) * factor <= plan.footprintRadius, species);
        }
      });
    } finally { resources.forEach(resource => resource.dispose()); }
  }
});

test('module owns no rendering loop, storage, mutation or network effects', async () => {
  const source = await readFile(new URL('../lib/farm-animal-motion.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /fetch\(|localStorage|indexedDB|requestAnimationFrame|setInterval\(|setTimeout\(|Math\.random\(|Date\.now\(|performance\.now\(|queueMutation/);
});
