import type { SurveyVertex } from "./farm-geometry";

/**
 * Drawing coordinates, not metres, hectares, UTM, latitude or longitude.
 * A sketch never replaces a declared area or SurveyPlan.vertices.
 */
export type NormalizedSketchVertex = { id: string; x: number; y: number };
export type NormalizedSketchPolygon = {
  version: 1;
  coordinateSpace: "normalized-100";
  vertices: NormalizedSketchVertex[];
};

export const MIN_POLYGON_VERTICES = 3;
export const MAX_POLYGON_VERTICES = 200;

export type PolygonValidationCode =
  | "invalid_format"
  | "vertex_count"
  | "invalid_vertex"
  | "duplicate_id"
  | "duplicate_point"
  | "zero_length_edge"
  | "overlapping_edges"
  | "intersecting_edges"
  | "zero_area";

export type PolygonValidationFailure = {
  ok: false; code: PolygonValidationCode; error: string; vertexIndices: number[];
};
export type PolygonValidationResult =
  | { ok: true; polygon: NormalizedSketchPolygon }
  | PolygonValidationFailure;
export type SurveyVertexValidationResult =
  | { ok: true; vertices: SurveyVertex[] }
  | PolygonValidationFailure;

type Point = { x: number; y: number };
type Dyadic = { significand: bigint; exponent: number };
const BIG_ZERO = BigInt(0);
const BIG_ONE = BigInt(1);

const fail = (
  code: PolygonValidationCode,
  error: string,
  vertexIndices: number[] = [],
): PolygonValidationFailure => ({ ok: false, code, error, vertexIndices });

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function samePoint(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

// Binary floating-point inputs are dyadic rationals. Use their exact integer
// determinant only when ordinary arithmetic cannot reliably distinguish a
// collinear/touching edge from a very narrow but valid outline. No tolerance
// silently merges nearby vertices, and even subnormal finite values are safe.
function asDyadic(value: number): Dyadic {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setFloat64(0, value);
  const bits = view.getBigUint64(0);
  const sign = bits >> BigInt(63) ? -BIG_ONE : BIG_ONE;
  const exponent = Number((bits >> BigInt(52)) & BigInt(0x7ff));
  const fraction = bits & BigInt(0xfffffffffffff);
  return exponent === 0
    ? { significand: sign * fraction, exponent: -1074 }
    : { significand: sign * (fraction | BigInt(0x10000000000000)), exponent: exponent - 1075 };
}

function exactOrientation(a: Point, b: Point, c: Point): number {
  const values = [a.x, a.y, b.x, b.y, c.x, c.y].map(asDyadic);
  const exponent = Math.min(...values.map((value) => value.exponent));
  const [ax, ay, bx, by, cx, cy] = values.map(
    (value) => value.significand << BigInt(value.exponent - exponent),
  );
  const determinant = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  return determinant > BIG_ZERO ? 1 : determinant < BIG_ZERO ? -1 : 0;
}

function orientation(a: Point, b: Point, c: Point): number {
  const left = (b.x - a.x) * (c.y - a.y);
  const right = (b.y - a.y) * (c.x - a.x);
  const determinant = left - right;
  const uncertainty = 8 * Number.EPSILON * (Math.abs(left) + Math.abs(right));
  if (Number.isFinite(determinant) && Math.abs(determinant) > uncertainty) {
    return determinant > 0 ? 1 : -1;
  }
  return exactOrientation(a, b, c);
}

function onSegment(a: Point, b: Point, point: Point): boolean {
  return point.x >= Math.min(a.x, b.x) && point.x <= Math.max(a.x, b.x) &&
    point.y >= Math.min(a.y, b.y) && point.y <= Math.max(a.y, b.y);
}

function segmentsMeet(a: Point, b: Point, c: Point, d: Point): boolean {
  if (Math.max(a.x, b.x) < Math.min(c.x, d.x) ||
      Math.max(c.x, d.x) < Math.min(a.x, b.x) ||
      Math.max(a.y, b.y) < Math.min(c.y, d.y) ||
      Math.max(c.y, d.y) < Math.min(a.y, b.y)) return false;
  const abc = orientation(a, b, c), abd = orientation(a, b, d);
  const cda = orientation(c, d, a), cdb = orientation(c, d, b);
  if (abc === 0 && onSegment(a, b, c)) return true;
  if (abd === 0 && onSegment(a, b, d)) return true;
  if (cda === 0 && onSegment(c, d, a)) return true;
  if (cdb === 0 && onSegment(c, d, b)) return true;
  return abc * abd < 0 && cda * cdb < 0;
}

function hasNonzeroArea(vertices: Point[]): boolean {
  // This exact shoelace sum is bounded to 200 vertices. It only decides whether
  // area exists; no metric area is inferred from a normalized sketch.
  const values = vertices.flatMap((point) => [asDyadic(point.x), asDyadic(point.y)]);
  const exponent = Math.min(...values.map((value) => value.exponent));
  const integers = values.map((value) => value.significand << BigInt(value.exponent - exponent));
  let doubleArea = BIG_ZERO;
  for (let index = 0; index < vertices.length; index += 1) {
    const next = (index + 1) % vertices.length;
    doubleArea += integers[index * 2] * integers[next * 2 + 1] -
      integers[next * 2] * integers[index * 2 + 1];
  }
  return doubleArea !== BIG_ZERO;
}

/**
 * Validate the whole outline without dropping, reordering, rounding, clamping
 * or renaming any vertex. Only an exact repeated closing vertex is removed.
 * Concave outlines and either winding are accepted; holes are not this format.
 */
export function validateNormalizedSketchPolygon(input: unknown): PolygonValidationResult {
  if (!isObject(input) || input.version !== 1 || input.coordinateSpace !== "normalized-100" ||
      !Array.isArray(input.vertices) ||
      Object.keys(input).some((key) => !["version", "coordinateSpace", "vertices"].includes(key))) {
    return fail("invalid_format", "El contorno debe ser un croquis versión 1 en coordenadas de 0 a 100.");
  }
  // One extra row is allowed solely for an explicitly repeated closing vertex.
  if (input.vertices.length < MIN_POLYGON_VERTICES || input.vertices.length > MAX_POLYGON_VERTICES + 1) {
    return fail("vertex_count", "El contorno necesita entre 3 y 200 puntos.");
  }
  const vertices: NormalizedSketchVertex[] = [];
  for (let index = 0; index < input.vertices.length; index += 1) {
    const vertex: unknown = input.vertices[index];
    if (!isObject(vertex) || typeof vertex.id !== "string" ||
        vertex.id.length < 1 || vertex.id.length > 64 || vertex.id.trim().length === 0 ||
        typeof vertex.x !== "number" || !Number.isFinite(vertex.x) || vertex.x < 0 || vertex.x > 100 ||
        typeof vertex.y !== "number" || !Number.isFinite(vertex.y) || vertex.y < 0 || vertex.y > 100 ||
        Object.keys(vertex).some((key) => !["id", "x", "y"].includes(key))) {
      return fail("invalid_vertex", `Completa el punto ${index + 1} con un identificador y coordenadas numéricas de 0 a 100.`, [index]);
    }
    vertices.push({ id: vertex.id, x: vertex.x, y: vertex.y });
  }

  const validated = validateSimpleRingVertices(vertices);
  if (!validated.ok) return validated;
  return { ok: true, polygon: { version: 1, coordinateSpace: "normalized-100", vertices: validated.vertices } };
}

function validateSimpleRingVertices(input: NormalizedSketchVertex[]):
  { ok: true; vertices: NormalizedSketchVertex[] } | PolygonValidationFailure {
  const vertices = [...input];
  const first = vertices[0], last = vertices[vertices.length - 1];
  if (first.id === last.id && samePoint(first, last)) vertices.pop();
  if (vertices.length < MIN_POLYGON_VERTICES || vertices.length > MAX_POLYGON_VERTICES) {
    return fail("vertex_count", "El contorno necesita entre 3 y 200 puntos distintos.");
  }
  const ids = new Map<string, number>();
  for (let index = 0; index < vertices.length; index += 1) {
    const vertex = vertices[index], previous = ids.get(vertex.id);
    if (previous !== undefined) {
      return fail("duplicate_id", "Cada punto necesita un identificador distinto.", [previous, index]);
    }
    ids.set(vertex.id, index);
    const next = (index + 1) % vertices.length;
    if (samePoint(vertex, vertices[next])) {
      return fail("zero_length_edge", "Dos puntos consecutivos coinciden. Corrige el lado de longitud cero.", [index, next]);
    }
    for (let other = 0; other < index; other += 1) {
      if (samePoint(vertex, vertices[other])) {
        return fail("duplicate_point", "Hay puntos repetidos en el contorno.", [other, index]);
      }
    }
  }
  if (!hasNonzeroArea(vertices)) {
    return fail("zero_area", "El contorno no encierra una superficie válida. Revisa el orden de los puntos y evita líneas o cruces.");
  }
  for (let index = 0; index < vertices.length; index += 1) {
    const previous = vertices[(index + vertices.length - 1) % vertices.length];
    const current = vertices[index], next = vertices[(index + 1) % vertices.length];
    // Adjacent edges may continue along a straight boundary, but may not turn
    // back and overlap each other beyond their single shared endpoint.
    if (orientation(previous, current, next) === 0 &&
        (onSegment(previous, current, next) || onSegment(current, next, previous))) {
      return fail("overlapping_edges", "Dos lados consecutivos se superponen. Corrige los puntos del contorno.", [
        (index + vertices.length - 1) % vertices.length, index, (index + 1) % vertices.length,
      ]);
    }
    for (let other = index + 1; other < vertices.length; other += 1) {
      if (other === index + 1 || (index === 0 && other === vertices.length - 1)) continue;
      if (segmentsMeet(current, next, vertices[other], vertices[(other + 1) % vertices.length])) {
        return fail("intersecting_edges", "Los lados del contorno no pueden cruzarse, tocarse ni superponerse entre sí.", [
          index, (index + 1) % vertices.length, other, (other + 1) % vertices.length,
        ]);
      }
    }
  }
  return { ok: true, vertices };
}

/**
 * Strict validation for a populated metric survey, independent from the sketch
 * format. Nothing is coerced or filtered. The successful result preserves all
 * input rows, IDs and numeric values, including an explicit closing row; a
 * temporary canonical ring is used only for geometric checks.
 */
export function validateSurveyVertices(input: unknown): SurveyVertexValidationResult {
  if (!Array.isArray(input) || input.length < MIN_POLYGON_VERTICES || input.length > MAX_POLYGON_VERTICES + 1) {
    return fail("vertex_count", "El plano por coordenadas necesita entre 3 y 200 puntos completos, o ninguna coordenada.");
  }
  const vertices: SurveyVertex[] = [];
  for (let index = 0; index < input.length; index += 1) {
    const vertex: unknown = input[index];
    if (!isObject(vertex) || typeof vertex.id !== "string" ||
        vertex.id.length < 1 || vertex.id.length > 24 || vertex.id.trim().length === 0 ||
        typeof vertex.easting !== "number" || !Number.isFinite(vertex.easting) ||
        typeof vertex.northing !== "number" || !Number.isFinite(vertex.northing) ||
        Object.keys(vertex).some((key) => !["id", "easting", "northing"].includes(key))) {
      return fail("invalid_vertex", `Completa el punto ${index + 1} con su identificador y las dos coordenadas numéricas.`, [index]);
    }
    vertices.push({ id: vertex.id, easting: vertex.easting, northing: vertex.northing });
  }
  // Official survey tables may name the repeated closing row 0, 1 or another marker.
  // Preserve that row verbatim; remove it only from the temporary geometry ring.
  const ring=vertices.map(vertex=>({id:vertex.id,x:vertex.easting,y:vertex.northing}));
  if(ring.length>1&&samePoint(ring[0],ring[ring.length-1])){
    const closure=ring[ring.length-1];
    if(ring.slice(1,-1).some(vertex=>vertex.id===closure.id))return fail("duplicate_id","La etiqueta de cierre coincide con otro vértice distinto del primero.");
    ring.pop();
    if(ring.length>1&&samePoint(ring[0],ring[ring.length-1]))return fail("duplicate_point","El plano repite más de una fila de cierre. Conserva solo la que figure en tu documento.");
  }
  const result = validateSimpleRingVertices(ring);
  return result.ok ? { ok: true, vertices } : result;
}

export function canonicalizeNormalizedSketchPolygon(input: unknown): NormalizedSketchPolygon {
  const result = validateNormalizedSketchPolygon(input);
  if (!result.ok) throw new Error(result.error);
  return result.polygon;
}

/** Presence is deliberately broader than validity: invalid custom data must not
 * fall back to the old rectangular splitter and be silently damaged. */
export function hasCustomAreaOutline(data: Record<string, unknown>): boolean {
  return Object.prototype.hasOwnProperty.call(data, "typedAreaOutline") && data.typedAreaOutline !== undefined;
}

export function getAreaOutline(data: Record<string, unknown>): NormalizedSketchPolygon | null {
  const result = validateNormalizedSketchPolygon(data.typedAreaOutline);
  return result.ok ? result.polygon : null;
}
