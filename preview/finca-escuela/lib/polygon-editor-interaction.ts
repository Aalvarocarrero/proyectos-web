import type { NormalizedSketchPolygon, NormalizedSketchVertex } from "./polygon-geometry";

export type SketchPosition = { x: number; y: number };
export type SketchDraft = {
  value: NormalizedSketchPolygon | null;
  initial: NormalizedSketchPolygon | null;
  history: Array<NormalizedSketchPolygon | null>;
};

export function cloneSketch(value: NormalizedSketchPolygon | null): NormalizedSketchPolygon | null {
  return value ? { ...value, vertices: value.vertices.map((point) => ({ ...point })) } : null;
}

export function sameSketch(a: NormalizedSketchPolygon | null, b: NormalizedSketchPolygon | null): boolean {
  if (a === b) return true;
  return a !== null && b !== null && a.version === b.version && a.coordinateSpace === b.coordinateSpace &&
    a.vertices.length === b.vertices.length && a.vertices.every((point, index) => {
      const other = b.vertices[index];
      return point.id === other.id && point.x === other.x && point.y === other.y;
    });
}

export function createSketchDraft(value: NormalizedSketchPolygon | null): SketchDraft {
  return { value: cloneSketch(value), initial: cloneSketch(value), history: [] };
}

export function commitSketchDraft(draft: SketchDraft, value: NormalizedSketchPolygon | null): SketchDraft {
  if (sameSketch(draft.value, value)) return draft;
  return { ...draft, value: cloneSketch(value), history: [...draft.history, cloneSketch(draft.value)].slice(-100) };
}

export function undoSketchDraft(draft: SketchDraft): SketchDraft {
  if (!draft.history.length) return draft;
  return { ...draft, value: cloneSketch(draft.history[draft.history.length - 1]), history: draft.history.slice(0, -1) };
}

export function resetSketchDraft(draft: SketchDraft): SketchDraft {
  return { ...draft, value: cloneSketch(draft.initial), history: [] };
}

/** Deleted and undone IDs remain reserved for this editor session. */
export function createSketchVertexIdAllocator(seed: readonly NormalizedSketchVertex[] = []) {
  const used = new Set(seed.map((point) => point.id));
  let sequence = 0;
  return (current: readonly NormalizedSketchVertex[] = []): string => {
    for (const point of current) used.add(point.id);
    let id: string;
    do { id = `sketch-v${++sequence}`; } while (used.has(id));
    used.add(id);
    return id;
  };
}

export function clampSketchPosition(point: SketchPosition): SketchPosition {
  return {
    x: Math.max(0, Math.min(100, point.x)),
    y: Math.max(0, Math.min(100, point.y)),
  };
}

/** The inverse SVG CTM accounts for letterboxing, transforms, and page zoom. */
export function clientToSketchPosition(
  svg: Pick<SVGSVGElement, "getScreenCTM" | "createSVGPoint">,
  clientX: number,
  clientY: number,
): SketchPosition | null {
  try {
    const matrix = svg.getScreenCTM();
    if (!matrix) return null;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const local = point.matrixTransform(matrix.inverse());
    if (!Number.isFinite(local.x) || !Number.isFinite(local.y)) return null;
    // Keep out-of-board positions for a drag's grab offset. Append/move clamp
    // the actual vertex, so grabbing near an edge can still reach 0 or 100.
    return { x: local.x, y: local.y };
  } catch {
    return null;
  }
}

export function moveSketchVertex(value: NormalizedSketchPolygon, id: string, position: SketchPosition): NormalizedSketchPolygon {
  if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) return value;
  const safe = clampSketchPosition(position);
  return { ...value, vertices: value.vertices.map((point) => point.id === id ? { ...point, ...safe } : point) };
}

export function appendSketchVertex(value: NormalizedSketchPolygon | null, id: string, position: SketchPosition): NormalizedSketchPolygon | null {
  if ((value?.vertices.length ?? 0) >= 200 || !Number.isFinite(position.x) || !Number.isFinite(position.y)) return value;
  return {
    version: 1, coordinateSpace: "normalized-100",
    vertices: [...(value?.vertices ?? []), { id, ...clampSketchPosition(position) }],
  };
}

export function insertSketchMidpoint(value: NormalizedSketchPolygon, edgeStartId: string, id: string): NormalizedSketchPolygon {
  const index = value.vertices.findIndex((point) => point.id === edgeStartId);
  if (index < 0 || value.vertices.length < 3 || value.vertices.length >= 200) return value;
  const start = value.vertices[index], end = value.vertices[(index + 1) % value.vertices.length];
  const point = { id, x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  return { ...value, vertices: [...value.vertices.slice(0, index + 1), point, ...value.vertices.slice(index + 1)] };
}

export function removeSketchVertex(value: NormalizedSketchPolygon, id: string): NormalizedSketchPolygon {
  if (value.vertices.length <= 3) return value;
  return { ...value, vertices: value.vertices.filter((point) => point.id !== id) };
}

export type SketchTap = { pointerId: number; startX: number; startY: number; moved: boolean };

/** Once a gesture moves, returning to its starting point must not become a tap. */
export function trackSketchTap(tap: SketchTap, pointerId: number, clientX: number, clientY: number): SketchTap {
  if (tap.pointerId !== pointerId || tap.moved) return tap;
  return { ...tap, moved: Math.hypot(clientX - tap.startX, clientY - tap.startY) > 8 };
}

export function sketchKeyboardPosition(point: SketchPosition, key: string, shiftKey = false): SketchPosition | null {
  const direction: Record<string, SketchPosition> = {
    ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
    ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
  };
  const move = direction[key];
  if (!move) return null;
  const step = shiftKey ? 5 : 1;
  return clampSketchPosition({ x: point.x + move.x * step, y: point.y + move.y * step });
}
