import { animalVisualLength, type AnimalModelSpecies } from './farm-animal-species';
import { edgeClearance, inside, type Point } from './illustrated-geometry';
import { validateSurveyVertices } from './polygon-geometry';

export const MAX_FARM_MOVING_ANIMALS = 8;
const MAX_ANIMALS = 128, MAX_OBSTACLES = 64, MAX_VERTICES = 200;
const WALKING_SPECIES = new Set<AnimalModelSpecies>([
  'cattle', 'buffalo', 'pig', 'hen', 'rooster', 'quail', 'duck', 'goose',
  'turkey', 'horse', 'donkey', 'mule', 'sheep', 'goat', 'rabbit',
]);

export type FarmMotionAnimal = Readonly<{
  id: string;
  position: Point;
  species?: AnimalModelSpecies;
}>;
export type FarmAnimalMotionOptions = Readonly<{
  /** Pass explicitly positioned animals in the selected enclosure only. */
  animals: ReadonlyArray<FarmMotionAnimal>;
  enclosure: ReadonlyArray<Point>;
  property: ReadonlyArray<Point>;
  /** Plan-coordinate units per metre, before the renderer's world transform. */
  unitsPerMetre: number;
  /** Include buildings, troughs, gates and other occupied footprints. */
  blockedPolygons?: ReadonlyArray<ReadonlyArray<Point>>;
  maxAnimals?: number;
  /** Selected/inspected animals remain stationary and still reserve their footprint. */
  excludedIds?: ReadonlyArray<string>;
}>;
export type FarmAnimalMotionPlan = Readonly<{
  id: string;
  species: AnimalModelSpecies;
  origin: Point;
  /** Same deterministic base yaw used by the existing animal renderer. */
  heading: number;
  /** Circle radius. Maximum displacement from the saved origin is twice this. */
  radius: number;
  footprintRadius: number;
  restMs: number;
  walkMs: number;
  cycleMs: number;
}>;
export type FarmAnimalMotionPose = Readonly<{
  offset: Point;
  /** Add to the saved model's base yaw. Plan y maps to world z. */
  yawDelta: number;
  moving: boolean;
}>;

function finitePoint(point: Point): boolean {
  return !!point && Number.isFinite(point.x) && Number.isFinite(point.y) &&
    Math.abs(point.x) <= 1e9 && Math.abs(point.y) <= 1e9;
}

function validRing(points: ReadonlyArray<Point>): boolean {
  if (!Array.isArray(points) || points.length < 3 || points.length > MAX_VERTICES + 1 || !points.every(finitePoint)) return false;
  // Reuse the bounded, exact simple-ring validator; these remain drawing points,
  // not a survey. Concavity and either winding are accepted without simplification.
  return validateSurveyVertices(points.map((p, i) => ({ id: String(i), easting: p.x, northing: p.y }))).ok;
}

function boundaryDistance(point: Point, polygon: ReadonlyArray<Point>): number {
  let distance = Infinity;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i], b = polygon[(i + 1) % polygon.length];
    const dx = b.x - a.x, dy = b.y - a.y, lengthSquared = dx * dx + dy * dy;
    const t = lengthSquared ? Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared)) : 0;
    distance = Math.min(distance, Math.hypot(point.x - a.x - t * dx, point.y - a.y - t * dy));
  }
  return distance;
}

function animalSeed(id: string): number {
  let seed = 7;
  for (const character of id) seed = (seed * 31 + character.charCodeAt(0)) >>> 0;
  return seed;
}

function animalFootprint(animal: FarmMotionAnimal, metre: number): number {
  // Circumscribes both centered library models and the current schematic models
  // at any yaw, with a small margin. This is visual clearance, not a measurement.
  const length = animal.species && Object.hasOwn(animalVisualLength, animal.species) ? animalVisualLength[animal.species] : 2.6;
  return (length * .75 + .12) * metre;
}

/**
 * Pure presentation plans. Never moves, creates or persists an animal record.
 * The entire swept disk (body + displacement) must fit both original outlines
 * and clear every obstacle, so concave notches cannot be crossed between frames.
 * Oversized/invalid geometry fails closed; planning is bounded and never per frame.
 */
export function createFarmAnimalMotionPlan(options: FarmAnimalMotionOptions): FarmAnimalMotionPlan[] {
  const { animals, enclosure, property, unitsPerMetre: metre, blockedPolygons = [], excludedIds = [] } = options;
  if (!Number.isFinite(metre) || metre <= 0 || metre > 1e6 || !Array.isArray(animals) ||
      animals.length > MAX_ANIMALS || !Array.isArray(blockedPolygons) || blockedPolygons.length > MAX_OBSTACLES ||
      !Array.isArray(excludedIds) || excludedIds.length > MAX_ANIMALS ||
      !validRing(enclosure) || !validRing(property) || !blockedPolygons.every(validRing)) return [];
  const cap = Math.min(MAX_FARM_MOVING_ANIMALS, Math.max(0, Math.floor(Number.isFinite(options.maxAnimals) ? options.maxAnimals! : MAX_FARM_MOVING_ANIMALS)));
  if (!cap) return [];
  const excluded = new Set(excludedIds), ids = new Set<string>(), duplicates = new Set<string>();
  const positioned = animals.filter(animal => animal && typeof animal.id === 'string' && animal.id.length > 0 && animal.id.length <= 200 && finitePoint(animal.position));
  for (const animal of positioned) {
    if (ids.has(animal.id)) duplicates.add(animal.id);
    ids.add(animal.id);
  }
  const plans: FarmAnimalMotionPlan[] = [];
  for (const animal of positioned) {
    if (plans.length >= cap) break;
    if (!animal.species || !WALKING_SPECIES.has(animal.species) || excluded.has(animal.id) || duplicates.has(animal.id)) continue;
    const origin = animal.position, footprintRadius = animalFootprint(animal, metre);
    let available = Math.min(edgeClearance(origin, enclosure), edgeClearance(origin, property)) - footprintRadius;
    for (const obstacle of blockedPolygons) {
      available = Math.min(available, (inside(origin, obstacle) ? 0 : boundaryDistance(origin, obstacle)) - footprintRadius);
    }
    // A stationary/inspected animal also occupies space. Earlier movers reserve
    // their complete swept disk, keeping simultaneous plans mutually disjoint.
    for (const neighbour of positioned) {
      if (neighbour === animal) continue;
      const planned = plans.find(plan => plan.id === neighbour.id);
      available = Math.min(available, Math.hypot(origin.x - neighbour.position.x, origin.y - neighbour.position.y) -
        footprintRadius - animalFootprint(neighbour, metre) - (planned ? planned.radius * 2 : 0));
    }
    const numericalMargin = Number.EPSILON * Math.max(1, Math.abs(origin.x), Math.abs(origin.y)) * 64;
    const displacement = Math.min(.9 * metre, available - Math.max(.08 * metre, numericalMargin));
    if (!Number.isFinite(displacement) || displacement < .15 * metre) continue;
    const seed = animalSeed(animal.id), restMs = 3500 + seed % 3500, walkMs = 12000 + (seed >>> 8) % 6000;
    plans.push(Object.freeze({ id: animal.id, species: animal.species, origin: Object.freeze({ ...origin }),
      heading: (seed % 360) * Math.PI / 180, radius: displacement / 2, footprintRadius,
      restMs, walkMs, cycleMs: restMs + walkMs }));
  }
  return plans;
}

/**
 * O(1) root-only wandering/rest pose; no skeleton or gait animation is implied.
 * Starts and rests at zero offset. Position and physical orientation are continuous
 * across cycle boundaries, with zero endpoint velocity. The renderer owns elapsed
 * time, visibility, reduced-motion and pause guards, and can reset by using time 0.
 */
export function farmAnimalMotionPose(plan: FarmAnimalMotionPlan, elapsedMs: number): FarmAnimalMotionPose {
  const rest: FarmAnimalMotionPose = { offset: { x: 0, y: 0 }, yawDelta: 0, moving: false };
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0 || !Number.isFinite(plan.cycleMs) || plan.cycleMs <= 0) return rest;
  const time = elapsedMs % plan.cycleMs;
  if (time <= plan.restMs) return rest;
  const progress = Math.max(0, Math.min(1, (time - plan.restMs) / plan.walkMs));
  const eased = progress * progress * (3 - 2 * progress), angle = eased * Math.PI * 2;
  const forward = plan.radius * Math.sin(angle), sideways = plan.radius * (1 - Math.cos(angle));
  const cos = Math.cos(plan.heading), sin = Math.sin(plan.heading);
  return { offset: { x: forward * cos + sideways * sin, y: -forward * sin + sideways * cos },
    yawDelta: -angle, moving: true };
}
