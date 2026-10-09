export type SurveyVertex = {
  id: string;
  easting: number;
  northing: number;
};

export type SurveyPlan = {
  version: 1;
  state: string;
  municipality: string;
  parish: string;
  sector: string;
  lot: string;
  northBoundary: string;
  eastBoundary: string;
  southBoundary: string;
  westBoundary: string;
  datum: string;
  utmZone: string;
  scaleDenominator: number;
  procedureType: string;
  applicationReference: string;
  fileReference: string;
  status: string;
  inspectionDate: string;
  technicalResponsible: string;
  sourceNote: string;
  observations: string;
  vertices: SurveyVertex[];
};

export type SurveySegment = {
  from: string;
  to: string;
  distanceM: number;
  azimuthDeg: number;
  bearing: string;
};

export type SurveyMetrics = {
  areaSqM: number;
  perimeterM: number;
  segments: SurveySegment[];
};

export function sanitizeSurveyVertices(vertices: SurveyVertex[]): SurveyVertex[] {
  const valid=vertices
    .filter(
      (vertex) =>
        vertex.id.trim().length > 0 &&
        Number.isFinite(vertex.easting) &&
        Number.isFinite(vertex.northing),
    )
    .map((vertex, index) => ({
      id: vertex.id.trim().slice(0, 24) || String(index + 1),
      easting: Number(vertex.easting),
      northing: Number(vertex.northing),
    }));
  const first=valid[0],last=valid[valid.length-1];
  if(valid.length>1&&first.easting===last.easting&&first.northing===last.northing)valid.pop();
  return valid.slice(0,200);
}

export function calculateSurveyMetrics(input: SurveyVertex[]): SurveyMetrics {
  const vertices = sanitizeSurveyVertices(input);
  if (vertices.length < 3) {
    return { areaSqM: 0, perimeterM: 0, segments: [] };
  }

  let signedDoubleArea = 0;
  let perimeterM = 0;
  const segments: SurveySegment[] = [];

  for (let index = 0; index < vertices.length; index += 1) {
    const current = vertices[index];
    const next = vertices[(index + 1) % vertices.length];
    signedDoubleArea += current.easting * next.northing - next.easting * current.northing;

    const deltaEast = next.easting - current.easting;
    const deltaNorth = next.northing - current.northing;
    const distanceM = Math.hypot(deltaEast, deltaNorth);
    const azimuthDeg = (Math.atan2(deltaEast, deltaNorth) * 180) / Math.PI;
    const normalizedAzimuth = (azimuthDeg + 360) % 360;
    perimeterM += distanceM;
    segments.push({
      from: current.id,
      to: next.id,
      distanceM,
      azimuthDeg: normalizedAzimuth,
      bearing: azimuthToBearing(normalizedAzimuth),
    });
  }

  return {
    areaSqM: Math.abs(signedDoubleArea) / 2,
    perimeterM,
    segments,
  };
}

export function azimuthToBearing(azimuth: number): string {
  const value = ((azimuth % 360) + 360) % 360;
  const format = (degrees: number) => `${degrees.toFixed(1)}°`;
  if (value <= 90) return `N ${format(value)} E`;
  if (value <= 180) return `S ${format(180 - value)} E`;
  if (value <= 270) return `S ${format(value - 180)} O`;
  return `N ${format(360 - value)} O`;
}

export function normalizeSurveyPolygon(
  input: SurveyVertex[],
  width = 100,
  height = 70,
  padding = 7,
): Array<{ id: string; x: number; y: number }> {
  const vertices = sanitizeSurveyVertices(input);
  if (vertices.length < 3) {
    return [
      { id: "1", x: padding, y: padding },
      { id: "2", x: width - padding, y: padding },
      { id: "3", x: width - padding, y: height - padding },
      { id: "4", x: padding, y: height - padding },
    ];
  }

  const eastings = vertices.map((vertex) => vertex.easting);
  const northings = vertices.map((vertex) => vertex.northing);
  const minEast = Math.min(...eastings);
  const maxEast = Math.max(...eastings);
  const minNorth = Math.min(...northings);
  const maxNorth = Math.max(...northings);
  const eastSpan = Math.max(1, maxEast - minEast);
  const northSpan = Math.max(1, maxNorth - minNorth);
  const availableWidth = width - padding * 2;
  const availableHeight = height - padding * 2;
  const scale = Math.min(availableWidth / eastSpan, availableHeight / northSpan);
  const renderedWidth = eastSpan * scale;
  const renderedHeight = northSpan * scale;
  const offsetX = (width - renderedWidth) / 2;
  const offsetY = (height - renderedHeight) / 2;

  return vertices.map((vertex) => ({
    id: vertex.id,
    x: offsetX + (vertex.easting - minEast) * scale,
    y: offsetY + (maxNorth - vertex.northing) * scale,
  }));
}

export function clampMapValue(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
