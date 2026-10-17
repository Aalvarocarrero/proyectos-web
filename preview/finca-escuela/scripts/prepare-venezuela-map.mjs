import { readFile, writeFile } from "node:fs/promises";

const [venezuelaInputPath, guyanaInputPath, outputPath] = process.argv.slice(2);
if (!venezuelaInputPath || !guyanaInputPath || !outputPath) {
  throw new Error("Uso: node scripts/prepare-venezuela-map.mjs <venezuela.geojson> <guyana.geojson> <salida.geojson>");
}

const venezuelaSource = JSON.parse(await readFile(venezuelaInputPath, "utf8"));
const guyanaSource = JSON.parse(await readFile(guyanaInputPath, "utf8"));
const tolerance = 0.035;
const disputedRegions = new Set([
  "barina-waini",
  "barima-waini",
  "pomeroon-supenaam",
  "essequibo islands-west demerara",
  "cuyuni-mazaruni",
  "potaro-siparuni",
  "upper takutu-upper essequibo",
]);

function distanceSquared(point, start, end) {
  let x = start[0];
  let y = start[1];
  let dx = end[0] - x;
  let dy = end[1] - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = end[0];
      y = end[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  dx = point[0] - x;
  dy = point[1] - y;
  return dx * dx + dy * dy;
}

function simplifyStep(points, first, last, squareTolerance, output) {
  let maxDistance = squareTolerance;
  let index = 0;
  for (let current = first + 1; current < last; current += 1) {
    const distance = distanceSquared(points[current], points[first], points[last]);
    if (distance > maxDistance) {
      index = current;
      maxDistance = distance;
    }
  }
  if (maxDistance > squareTolerance) {
    if (index - first > 1) simplifyStep(points, first, index, squareTolerance, output);
    output.push(points[index]);
    if (last - index > 1) simplifyStep(points, index, last, squareTolerance, output);
  }
}

function simplifyRing(ring) {
  const open = ring.length > 1 && ring[0][0] === ring.at(-1)[0] && ring[0][1] === ring.at(-1)[1] ? ring.slice(0, -1) : [...ring];
  if (open.length <= 4) return [...open, open[0]].map(roundPoint);
  const output = [open[0]];
  simplifyStep(open, 0, open.length - 1, tolerance * tolerance, output);
  output.push(open.at(-1));
  if (output.length < 3) return [...open.slice(0, 3), open[0]].map(roundPoint);
  output.push(output[0]);
  return output.map(roundPoint);
}

function roundPoint(point) {
  return [Number(point[0].toFixed(4)), Number(point[1].toFixed(4))];
}

function simplifyGeometry(geometry) {
  if (geometry.type === "Polygon") {
    return { type: "Polygon", coordinates: geometry.coordinates.map(simplifyRing) };
  }
  if (geometry.type === "MultiPolygon") {
    return { type: "MultiPolygon", coordinates: geometry.coordinates.map((polygon) => polygon.map(simplifyRing)) };
  }
  throw new Error(`Geometría no compatible: ${geometry.type}`);
}

const result = {
  type: "FeatureCollection",
  attribution: "Venezuela: geoBoundaries/OCHA Venezuela/INE (CC BY 3.0 IGO). Guyana: geoBoundaries/OpenStreetMap/Wambacher (ODbL 1.0).",
  source: "https://www.geoboundaries.org/",
  disputeNote: "La Guayana Esequiba se representa como contexto territorial disputado y no como un estado seleccionable. La referencia visual se basa en regiones administrativas y no sustituye cartografía oficial.",
  features: [
    ...venezuelaSource.features.map((feature) => ({
      type: "Feature",
      properties: {
        name: feature.properties.shapeName,
        iso: feature.properties.shapeISO,
        context: "venezuela",
      },
      geometry: simplifyGeometry(feature.geometry),
    })),
    ...guyanaSource.features.map((feature) => ({
      type: "Feature",
      properties: {
        name: feature.properties.shapeName,
        iso: feature.properties.shapeISO,
        context: disputedRegions.has(String(feature.properties.shapeName).toLowerCase()) ? "disputed" : "guyana",
      },
      geometry: simplifyGeometry(feature.geometry),
    })),
  ],
};

await writeFile(outputPath, JSON.stringify(result));
