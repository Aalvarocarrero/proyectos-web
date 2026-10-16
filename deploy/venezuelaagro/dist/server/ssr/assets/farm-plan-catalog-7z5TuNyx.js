var BIG_ZERO = BigInt(0);
var BIG_ONE = BigInt(1);
var fail = (code, error, vertexIndices = []) => ({
	ok: false,
	code,
	error,
	vertexIndices
});
function isObject(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
function samePoint(a, b) {
	return a.x === b.x && a.y === b.y;
}
function asDyadic(value) {
	const view = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(8));
	view.setFloat64(0, value);
	const bits = view.getBigUint64(0);
	const sign = bits >> BigInt(63) ? -BIG_ONE : BIG_ONE;
	const exponent = Number(bits >> BigInt(52) & BigInt(2047));
	const fraction = bits & BigInt(0xfffffffffffff);
	return exponent === 0 ? {
		significand: sign * fraction,
		exponent: -1074
	} : {
		significand: sign * (fraction | BigInt(4503599627370496)),
		exponent: exponent - 1075
	};
}
function exactOrientation(a, b, c) {
	const values = [
		a.x,
		a.y,
		b.x,
		b.y,
		c.x,
		c.y
	].map(asDyadic);
	const exponent = Math.min(...values.map((value) => value.exponent));
	const [ax, ay, bx, by, cx, cy] = values.map((value) => value.significand << BigInt(value.exponent - exponent));
	const determinant = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
	return determinant > BIG_ZERO ? 1 : determinant < BIG_ZERO ? -1 : 0;
}
function orientation(a, b, c) {
	const left = (b.x - a.x) * (c.y - a.y);
	const right = (b.y - a.y) * (c.x - a.x);
	const determinant = left - right;
	const uncertainty = 8 * Number.EPSILON * (Math.abs(left) + Math.abs(right));
	if (Number.isFinite(determinant) && Math.abs(determinant) > uncertainty) return determinant > 0 ? 1 : -1;
	return exactOrientation(a, b, c);
}
function onSegment(a, b, point) {
	return point.x >= Math.min(a.x, b.x) && point.x <= Math.max(a.x, b.x) && point.y >= Math.min(a.y, b.y) && point.y <= Math.max(a.y, b.y);
}
function segmentsMeet(a, b, c, d) {
	if (Math.max(a.x, b.x) < Math.min(c.x, d.x) || Math.max(c.x, d.x) < Math.min(a.x, b.x) || Math.max(a.y, b.y) < Math.min(c.y, d.y) || Math.max(c.y, d.y) < Math.min(a.y, b.y)) return false;
	const abc = orientation(a, b, c), abd = orientation(a, b, d);
	const cda = orientation(c, d, a), cdb = orientation(c, d, b);
	if (abc === 0 && onSegment(a, b, c)) return true;
	if (abd === 0 && onSegment(a, b, d)) return true;
	if (cda === 0 && onSegment(c, d, a)) return true;
	if (cdb === 0 && onSegment(c, d, b)) return true;
	return abc * abd < 0 && cda * cdb < 0;
}
function hasNonzeroArea(vertices) {
	const values = vertices.flatMap((point) => [asDyadic(point.x), asDyadic(point.y)]);
	const exponent = Math.min(...values.map((value) => value.exponent));
	const integers = values.map((value) => value.significand << BigInt(value.exponent - exponent));
	let doubleArea = BIG_ZERO;
	for (let index = 0; index < vertices.length; index += 1) {
		const next = (index + 1) % vertices.length;
		doubleArea += integers[index * 2] * integers[next * 2 + 1] - integers[next * 2] * integers[index * 2 + 1];
	}
	return doubleArea !== BIG_ZERO;
}
/**
* Validate the whole outline without dropping, reordering, rounding, clamping
* or renaming any vertex. Only an exact repeated closing vertex is removed.
* Concave outlines and either winding are accepted; holes are not this format.
*/
function validateNormalizedSketchPolygon(input) {
	if (!isObject(input) || input.version !== 1 || input.coordinateSpace !== "normalized-100" || !Array.isArray(input.vertices) || Object.keys(input).some((key) => ![
		"version",
		"coordinateSpace",
		"vertices"
	].includes(key))) return fail("invalid_format", "El contorno debe ser un croquis versión 1 en coordenadas de 0 a 100.");
	if (input.vertices.length < 3 || input.vertices.length > 201) return fail("vertex_count", "El contorno necesita entre 3 y 200 puntos.");
	const vertices = [];
	for (let index = 0; index < input.vertices.length; index += 1) {
		const vertex = input.vertices[index];
		if (!isObject(vertex) || typeof vertex.id !== "string" || vertex.id.length < 1 || vertex.id.length > 64 || vertex.id.trim().length === 0 || typeof vertex.x !== "number" || !Number.isFinite(vertex.x) || vertex.x < 0 || vertex.x > 100 || typeof vertex.y !== "number" || !Number.isFinite(vertex.y) || vertex.y < 0 || vertex.y > 100 || Object.keys(vertex).some((key) => ![
			"id",
			"x",
			"y"
		].includes(key))) return fail("invalid_vertex", `Completa el punto ${index + 1} con un identificador y coordenadas numéricas de 0 a 100.`, [index]);
		vertices.push({
			id: vertex.id,
			x: vertex.x,
			y: vertex.y
		});
	}
	const validated = validateSimpleRingVertices(vertices);
	if (!validated.ok) return validated;
	return {
		ok: true,
		polygon: {
			version: 1,
			coordinateSpace: "normalized-100",
			vertices: validated.vertices
		}
	};
}
function validateSimpleRingVertices(input) {
	const vertices = [...input];
	const first = vertices[0], last = vertices[vertices.length - 1];
	if (first.id === last.id && samePoint(first, last)) vertices.pop();
	if (vertices.length < 3 || vertices.length > 200) return fail("vertex_count", "El contorno necesita entre 3 y 200 puntos distintos.");
	const ids = /* @__PURE__ */ new Map();
	for (let index = 0; index < vertices.length; index += 1) {
		const vertex = vertices[index], previous = ids.get(vertex.id);
		if (previous !== void 0) return fail("duplicate_id", "Cada punto necesita un identificador distinto.", [previous, index]);
		ids.set(vertex.id, index);
		const next = (index + 1) % vertices.length;
		if (samePoint(vertex, vertices[next])) return fail("zero_length_edge", "Dos puntos consecutivos coinciden. Corrige el lado de longitud cero.", [index, next]);
		for (let other = 0; other < index; other += 1) if (samePoint(vertex, vertices[other])) return fail("duplicate_point", "Hay puntos repetidos en el contorno.", [other, index]);
	}
	if (!hasNonzeroArea(vertices)) return fail("zero_area", "El contorno no encierra una superficie válida. Revisa el orden de los puntos y evita líneas o cruces.");
	for (let index = 0; index < vertices.length; index += 1) {
		const previous = vertices[(index + vertices.length - 1) % vertices.length];
		const current = vertices[index], next = vertices[(index + 1) % vertices.length];
		if (orientation(previous, current, next) === 0 && (onSegment(previous, current, next) || onSegment(current, next, previous))) return fail("overlapping_edges", "Dos lados consecutivos se superponen. Corrige los puntos del contorno.", [
			(index + vertices.length - 1) % vertices.length,
			index,
			(index + 1) % vertices.length
		]);
		for (let other = index + 1; other < vertices.length; other += 1) {
			if (other === index + 1 || index === 0 && other === vertices.length - 1) continue;
			if (segmentsMeet(current, next, vertices[other], vertices[(other + 1) % vertices.length])) return fail("intersecting_edges", "Los lados del contorno no pueden cruzarse, tocarse ni superponerse entre sí.", [
				index,
				(index + 1) % vertices.length,
				other,
				(other + 1) % vertices.length
			]);
		}
	}
	return {
		ok: true,
		vertices
	};
}
/**
* Strict validation for a populated metric survey, independent from the sketch
* format. Nothing is coerced or filtered. The successful result preserves all
* input rows, IDs and numeric values, including an explicit closing row; a
* temporary canonical ring is used only for geometric checks.
*/
function validateSurveyVertices(input) {
	if (!Array.isArray(input) || input.length < 3 || input.length > 201) return fail("vertex_count", "El plano por coordenadas necesita entre 3 y 200 puntos completos, o ninguna coordenada.");
	const vertices = [];
	for (let index = 0; index < input.length; index += 1) {
		const vertex = input[index];
		if (!isObject(vertex) || typeof vertex.id !== "string" || vertex.id.length < 1 || vertex.id.length > 24 || vertex.id.trim().length === 0 || typeof vertex.easting !== "number" || !Number.isFinite(vertex.easting) || typeof vertex.northing !== "number" || !Number.isFinite(vertex.northing) || Object.keys(vertex).some((key) => ![
			"id",
			"easting",
			"northing"
		].includes(key))) return fail("invalid_vertex", `Completa el punto ${index + 1} con su identificador y las dos coordenadas numéricas.`, [index]);
		vertices.push({
			id: vertex.id,
			easting: vertex.easting,
			northing: vertex.northing
		});
	}
	const ring = vertices.map((vertex) => ({
		id: vertex.id,
		x: vertex.easting,
		y: vertex.northing
	}));
	if (ring.length > 1 && samePoint(ring[0], ring[ring.length - 1])) {
		const closure = ring[ring.length - 1];
		if (ring.slice(1, -1).some((vertex) => vertex.id === closure.id)) return fail("duplicate_id", "La etiqueta de cierre coincide con otro vértice distinto del primero.");
		ring.pop();
		if (ring.length > 1 && samePoint(ring[0], ring[ring.length - 1])) return fail("duplicate_point", "El plano repite más de una fila de cierre. Conserva solo la que figure en tu documento.");
	}
	const result = validateSimpleRingVertices(ring);
	return result.ok ? {
		ok: true,
		vertices
	} : result;
}
function canonicalizeNormalizedSketchPolygon(input) {
	const result = validateNormalizedSketchPolygon(input);
	if (!result.ok) throw new Error(result.error);
	return result.polygon;
}
/** Presence is deliberately broader than validity: invalid custom data must not
* fall back to the old rectangular splitter and be silently damaged. */
function hasCustomAreaOutline(data) {
	return Object.prototype.hasOwnProperty.call(data, "typedAreaOutline") && data.typedAreaOutline !== void 0;
}
function getAreaOutline(data) {
	const result = validateNormalizedSketchPolygon(data.typedAreaOutline);
	return result.ok ? result.polygon : null;
}
//#endregion
//#region lib/illustrated-geometry.ts
var project = (p, c, z = 0) => ({
	x: c.pan.x + c.scale * (c.origin.x + p.x + .18 * p.y),
	y: c.pan.y + c.scale * (c.origin.y + .11 * p.x + .68 * p.y - z)
});
var unproject = (p, c) => {
	const x = (p.x - c.pan.x) / c.scale - c.origin.x, y = (p.y - c.pan.y) / c.scale - c.origin.y;
	return {
		x: (.68 * x - .18 * y) / .6602,
		y: (y - .11 * x) / .6602
	};
};
function inside(p, polygon) {
	let yes = false;
	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const a = polygon[i], b = polygon[j];
		if (a.y > p.y !== b.y > p.y && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) yes = !yes;
	}
	return yes;
}
function edgeClearance(p, polygon) {
	if (!inside(p, polygon)) return 0;
	return Math.min(...polygon.map((a, i) => {
		const b = polygon[(i + 1) % polygon.length], dx = b.x - a.x, dy = b.y - a.y, t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
		return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
	}));
}
function bounds(points) {
	return {
		x: Math.min(...points.map((p) => p.x)),
		y: Math.min(...points.map((p) => p.y)),
		maxX: Math.max(...points.map((p) => p.x)),
		maxY: Math.max(...points.map((p) => p.y))
	};
}
/** Conservative disk footprints cannot cross a concave boundary. Bounded grid work. */
function interiorSlots(polygon, radius, limit = 48) {
	if (polygon.length < 3 || radius <= 0) return [];
	const b = bounds(polygon), step = Math.max(radius * 2.8, (b.maxX - b.x) / 18, (b.maxY - b.y) / 18), slots = [];
	for (let y = b.y + radius; y < b.maxY - radius && slots.length < limit; y += step) for (let x = b.x + radius; x < b.maxX - radius && slots.length < limit; x += step) {
		const p = {
			x,
			y
		};
		if (edgeClearance(p, polygon) >= radius) slots.push(p);
	}
	return slots;
}
/** Sampled pole of inaccessibility. It may return null for invalid/degenerate polygons. */
function interiorAnchor(polygon) {
	if (polygon.length < 3) return null;
	const b = bounds(polygon);
	let best = null, radius = 0;
	for (let yi = 1; yi < 20; yi++) for (let xi = 1; xi < 20; xi++) {
		const p = {
			x: b.x + (b.maxX - b.x) * xi / 20,
			y: b.y + (b.maxY - b.y) * yi / 20
		}, r = edgeClearance(p, polygon);
		if (r > radius) {
			best = p;
			radius = r;
		}
	}
	return best ? {
		point: best,
		radius
	} : null;
}
/** Flag placement that crosses a concave property; never clip or rewrite its saved outline. */
function outlineExceedsProperty(outline, property) {
	const onBoundary = (p) => property.some((a, i) => {
		const b = property[(i + 1) % property.length], dx = b.x - a.x, dy = b.y - a.y, t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
		return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy) < 1e-7;
	});
	const contains = (p) => inside(p, property) || onBoundary(p);
	const orient = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
	return outline.some((a, i) => {
		const b = outline[(i + 1) % outline.length];
		if (!contains(a) || !contains({
			x: (a.x + b.x) / 2,
			y: (a.y + b.y) / 2
		})) return true;
		return property.some((c, j) => {
			const d = property[(j + 1) % property.length];
			const opposite = (u, v, tolerance) => u > tolerance && v < -tolerance || u < -tolerance && v > tolerance;
			return opposite(orient(a, b, c), orient(a, b, d), 1e-7 * Math.max(1, Math.hypot(b.x - a.x, b.y - a.y))) && opposite(orient(c, d, a), orient(c, d, b), 1e-7 * Math.max(1, Math.hypot(d.x - c.x, d.y - c.y)));
		});
	});
}
//#endregion
//#region lib/farm-plan-catalog.ts
var PLAN_CROP_CATALOG = [
	{
		kind: "tomato",
		label: "Tomate",
		detail: "Ramas, hojas compuestas y frutos rojos",
		silhouette: "branched-fruiting",
		visualHeight: 1.1
	},
	{
		kind: "maize",
		label: "Maíz",
		detail: "Tallo alto, hojas largas y espiga",
		silhouette: "upright-blades-tassel",
		visualHeight: 1.85
	},
	{
		kind: "onion",
		label: "Cebolla",
		detail: "Bulbo y hojas tubulares",
		silhouette: "bulb-tubular-leaves",
		visualHeight: .95
	},
	{
		kind: "cilantro",
		label: "Cilantro",
		detail: "Mata abierta de hojas lobuladas",
		silhouette: "open-lobed-leaves",
		visualHeight: .64
	},
	{
		kind: "parsley",
		label: "Perejil",
		detail: "Mata baja de follaje rizado",
		silhouette: "compact-curled-leaves",
		visualHeight: .48
	},
	{
		kind: "soy",
		label: "Soya",
		detail: "Hojas de tres folíolos y vainas",
		silhouette: "trifoliate-pods",
		visualHeight: .9
	}
];
var normalize = (value) => typeof value === "string" ? value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLowerCase() : "";
/** Read only an explicit crop field: names of areas never establish botanical identity. */
function cropModelKind(crop) {
	const value = normalize(crop);
	if (/^tomates?$/.test(value)) return "tomato";
	if (/^maiz(?: blanco| amarillo| dulce)?$/.test(value)) return "maize";
	if (/^cebolla(?: blanca| morada| roja| amarilla)?$/.test(value)) return "onion";
	if (/^(cilantro|coriandro)$/.test(value)) return "cilantro";
	if (/^perejil(?: rizado| liso)?$/.test(value)) return "parsley";
	if (/^(soya|soja|soy|soybean)$/.test(value)) return "soy";
}
function cropCatalogEntry(kind) {
	const entry = PLAN_CROP_CATALOG.find((item) => item.kind === kind);
	if (!entry) throw new Error("Unknown crop presentation kind");
	return entry;
}
/** Only the selected crop label enters the existing data.crop field. */
function catalogCropLabel(selection) {
	return selection?.crop ? cropCatalogEntry(selection.crop).label : void 0;
}
/** The explicit category wins; custom usage describes records categorized as Otro. */
function structureModelKind(category, usage) {
	const categoryValue = normalize(category);
	const value = categoryValue === "otro" || !categoryValue ? normalize(usage) : categoryValue;
	if (/^(casa|vivienda|casa principal)$/.test(value)) return "house";
	if (/^(galpon|deposito)$/.test(value)) return "barn";
	if (/^(vaquera|vaquera \/ corrales|vaquera\/corrales|establo)$/.test(value)) return "vaquera";
	if (/^(cerca|cercas|cercado)$/.test(value)) return "fence";
	if (/^(porton|portones|puerta de acceso)$/.test(value)) return "gate";
}
/** Declared measurements are labels, never a conversion from this dimensionless sketch. */
function declaredPlanDimensions(data) {
	const dimensions = {};
	for (const key of [
		"lengthM",
		"widthM",
		"diameterM"
	]) {
		const value = data[key];
		if (typeof value === "number" && Number.isFinite(value) && value > 0) dimensions[key] = value;
	}
	return Object.keys(dimensions).length ? dimensions : void 0;
}
/** Optional draft calculation from user-entered meters only, never map coordinates. */
function measuredAreaFromDimensions(shape, data) {
	const dimensions = declaredPlanDimensions(data);
	if (!dimensions) return 0;
	const { lengthM, widthM, diameterM } = dimensions;
	let value = 0;
	if (shape === "Rectangular" && lengthM && widthM) value = lengthM * widthM;
	else if (shape === "Ovalada" && lengthM && widthM) value = Math.PI * lengthM * widthM / 4;
	else if (shape === "Circular" && diameterM) value = Math.PI * (diameterM / 2) ** 2;
	return Number.isFinite(value) ? value : 0;
}
/** Explicit v2 layout preserves small footprints and the inverse viewport offsets. */
function exactPlanLayout(data) {
	if (data.mapLayoutVersion !== 2) return void 0;
	const { mapX: x, mapY: y, mapWidth: width, mapHeight: height } = data;
	if (typeof x !== "number" || typeof y !== "number" || typeof width !== "number" || typeof height !== "number") return void 0;
	if (![
		x,
		y,
		width,
		height
	].every(Number.isFinite) || x < -100 || x > 200 || y < -100 || y > 200 || width < .05 || width > 200 || height < .05 || height > 200) return void 0;
	return {
		x,
		y,
		width,
		height
	};
}
/** A new practice area must not inherit a fixture's survey, fence or placement. */
function freshDemoAreaData(preset, placement, selection, color = "#7d6d5f") {
	const crop = catalogCropLabel(selection) ?? "";
	return {
		usage: preset,
		name: `${crop || preset} · ejemplo`,
		crop,
		cropVariety: "",
		color,
		areaSqM: null,
		lengthM: null,
		widthM: null,
		diameterM: null,
		mapWidth: placement?.width ?? 12,
		mapHeight: placement?.height ?? 8,
		...placement ? {
			mapX: placement.x,
			mapY: placement.y
		} : {},
		shape: preset === "Laguna / agua" ? "Ovalada" : "Rectangular",
		notes: "Área ficticia añadida para practicar. Sus medidas y ubicación las indicas tú."
	};
}
/** Bounded illustrative rows. Slots are visual marks, never plant counts or spacing advice. */
function cropIllustrationSlots(outline, property, footprintRadius, limit = 48) {
	if (!Number.isFinite(footprintRadius) || footprintRadius <= 0 || !Number.isFinite(limit) || limit <= 0) return [];
	if ([outline, property].some((points) => points.length < 3 || points.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y)))) return [];
	const accepted = interiorSlots(outline, footprintRadius, 324).filter((point) => edgeClearance(point, property) >= footprintRadius);
	const count = Math.min(64, Math.floor(limit));
	if (accepted.length <= count) return accepted;
	return Array.from({ length: count }, (_, index) => accepted[Math.floor((index + .5) * accepted.length / count)]);
}
//#endregion
export { validateSurveyVertices as C, validateNormalizedSketchPolygon as S, project as _, cropModelKind as a, getAreaOutline as b, freshDemoAreaData as c, bounds as d, edgeClearance as f, outlineExceedsProperty as g, interiorSlots as h, cropIllustrationSlots as i, measuredAreaFromDimensions as l, interiorAnchor as m, catalogCropLabel as n, declaredPlanDimensions as o, inside as p, cropCatalogEntry as r, exactPlanLayout as s, PLAN_CROP_CATALOG as t, structureModelKind as u, unproject as v, hasCustomAreaOutline as x, canonicalizeNormalizedSketchPolygon as y };
