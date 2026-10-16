import { C as validateSurveyVertices, S as validateNormalizedSketchPolygon, a as cropModelKind, b as getAreaOutline, f as edgeClearance, o as declaredPlanDimensions, p as inside, u as structureModelKind } from "./farm-plan-catalog-7z5TuNyx.js";
//#region lib/farm-animal-species.ts
/** Taxonomy only; unknown/ambiguous labels never silently become cattle. */
function animalModelSpecies(category, species) {
	const text = (species?.trim() || category).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
	if (/^(ave|aves|animal|animales|ovino\s*\/\s*caprino|equino|equinos|otro|otros)$/.test(text)) return;
	return [
		["buffalo", /\b(bufalo|bufala|bufalino|buffalo)\b/],
		["cattle", /\b(bovino|bovinos|vaca|toro|novilla|novillo|becerro|becerra|ternero)\b/],
		["pig", /\b(porcino|porcinos|cerdo|cerda|lechon|verraco)\b/],
		["rooster", /\bgallo\b/],
		["hen", /\b(gallina|pollo|pollita)\b/],
		["quail", /\bcodorniz\b/],
		["turkey", /\bpavo\b/],
		["duck", /\bpato\b/],
		["goose", /\bganso\b/],
		["donkey", /\b(burro|asno)\b/],
		["mule", /\bmula\b/],
		["horse", /\b(caballo|yegua|potro)\b/],
		["sheep", /\b(ovino|oveja|carnero|cordero)\b/],
		["goat", /\b(caprino|cabra|chivo)\b/],
		["rabbit", /\bconejo\b/],
		["shrimp", /\b(camaron|langostino)\b/],
		["fish", /\b(pez|tilapia|cachama|trucha|bagre|bocachico|coporo|alevines)\b/],
		["hive", /\b(colmena|nucleos)\b/],
		["bee", /\b(abejas|abeja|reinas)\b/],
		["worm", /\b(lombrices|lombriz)\b/]
	].find(([, pattern]) => pattern.test(text))?.[0];
}
var animalVisualLength = {
	cattle: 2.4,
	buffalo: 2.6,
	pig: 1.4,
	hen: .58,
	rooster: .68,
	quail: .35,
	duck: .65,
	goose: .85,
	turkey: .95,
	horse: 2.6,
	donkey: 1.9,
	mule: 2.2,
	sheep: 1.25,
	goat: 1.2,
	rabbit: .55,
	fish: .7,
	shrimp: .15,
	bee: .025,
	hive: .9,
	worm: .15
};
//#endregion
//#region lib/farm-scene-scale.ts
/** Relative model scale from declared surface, never a surveyed elevation or species size. */
function sceneUnitsPerMetre(outline, unit, areaSqM) {
	if (!Number.isFinite(areaSqM) || !areaSqM || areaSqM <= 0 || !Number.isFinite(unit) || unit <= 0 || outline.length < 3) return 1;
	let twice = 0;
	for (let i = 0; i < outline.length; i++) {
		const a = outline[i], b = outline[(i + 1) % outline.length];
		if (![
			a.x,
			a.y,
			b.x,
			b.y
		].every(Number.isFinite)) return 1;
		twice += a.x * b.y - b.x * a.y;
	}
	const value = Math.sqrt(Math.abs(twice) / 2 * unit * unit / areaSqM);
	return Number.isFinite(value) && value > 0 ? Math.min(10, Math.max(.005, value)) : 1;
}
/** Closed ring: includes every corner, excludes duplicate end point; bounded mobile instances. */
function fencePostPoints(outline, spacing, max = 640) {
	if (outline.length < 3 || !Number.isFinite(spacing) || spacing <= 0) return [];
	const lengths = outline.map((p, i) => Math.hypot(p.x - outline[(i + 1) % outline.length].x, p.y - outline[(i + 1) % outline.length].y));
	const perimeter = lengths.reduce((a, b) => a + b, 0);
	if (!Number.isFinite(perimeter) || perimeter <= 0) return [];
	const step = Math.max(spacing, perimeter / Math.max(outline.length, max - outline.length));
	const result = [];
	outline.forEach((p, i) => {
		const q = outline[(i + 1) % outline.length], n = Math.max(1, Math.ceil(lengths[i] / step));
		for (let j = 0; j < n; j++) result.push({
			x: p.x + (q.x - p.x) * j / n,
			y: p.y + (q.y - p.y) * j / n
		});
	});
	return result;
}
/** Remove gate intervals, including partial overlaps at either end of a fence span. */
function fenceWireSegments(a, b, gates) {
	const dx = b.x - a.x, dy = b.y - a.y, intervals = [];
	for (const g of gates) {
		let lo = 0, hi = 1, valid = true;
		for (const [origin, delta, min, max] of [[
			a.x,
			dx,
			g.x,
			g.maxX
		], [
			a.y,
			dy,
			g.y,
			g.maxY
		]]) if (Math.abs(delta) < 1e-12) {
			if (origin < min - 1e-9 || origin > max + 1e-9) {
				valid = false;
				break;
			}
		} else {
			const t1 = (min - origin) / delta, t2 = (max - origin) / delta;
			lo = Math.max(lo, Math.min(t1, t2));
			hi = Math.min(hi, Math.max(t1, t2));
		}
		if (valid && hi - lo > 1e-9) intervals.push([Math.max(0, lo), Math.min(1, hi)]);
	}
	intervals.sort((u, v) => u[0] - v[0]);
	let cursor = 0;
	const result = [], point = (t) => ({
		x: a.x + dx * t,
		y: a.y + dy * t
	});
	for (const [lo, hi] of intervals) {
		if (lo > cursor + 1e-9) result.push([point(cursor), point(lo)]);
		cursor = Math.max(cursor, hi);
	}
	if (cursor < .999999999) result.push([point(cursor), point(1)]);
	return result;
}
//#endregion
//#region lib/farm-boundary-vegetation.ts
/** Explicit demo planting, not botanical identification or a real-tree inventory. */
function boundaryPlantingView(data, layout, outline, viewport, demonstration) {
	const raw = data.boundaryPlanting;
	if (!demonstration || !raw || typeof raw !== "object" || Array.isArray(raw)) return [];
	const config = raw;
	if (config.version !== 1 || config.source !== "fictional-demo" || !Array.isArray(config.plants)) return [];
	const width = Number(config.layoutWidthM), height = Number(config.layoutHeightM);
	if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 || !Number.isFinite(viewport.scale) || viewport.scale <= 0) return [];
	const metre = Math.min(layout.width / width, layout.height / height);
	if (!Number.isFinite(metre) || metre <= 0) return [];
	return config.plants.slice(0, 96).flatMap((raw, index) => {
		if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
		const p = raw;
		if (![
			"x",
			"y",
			"heightM",
			"crownRadiusM"
		].every((k) => typeof p[k] === "number" && Number.isFinite(p[k])) || !["broadleaf", "palm"].includes(String(p.kind))) return [];
		const x = p.x, y = p.y, h = p.heightM, r = p.crownRadiusM;
		if (x <= 0 || x >= 100 || y <= 0 || y >= 100 || h < 3 || h > 12 || r < 1 || r > 4) return [];
		const position = {
			x: layout.x + layout.width * x / 100,
			y: layout.y + layout.height * y / 100
		};
		if (!inside(position, outline) || edgeClearance(position, outline) < r * metre) return [];
		return [{
			id: String(index),
			position: {
				x: viewport.x + position.x * viewport.scale,
				y: viewport.y + position.y * viewport.scale
			},
			kind: p.kind,
			heightM: h,
			crownRadiusM: r,
			planRadius: r * metre * viewport.scale,
			planHeight: h * metre * viewport.scale
		}];
	});
}
function distanceToOutline(p, outline) {
	return Math.min(...outline.map((a, i) => {
		const b = outline[(i + 1) % outline.length], dx = b.x - a.x, dy = b.y - a.y, t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
		return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
	}));
}
/** Clip again against the CURRENT plan: later edits may move a road, gate or animal. */
function visibleBoundaryPlants(areas, property, animals, physicalAreaSqM) {
	const result = [];
	let examined = 0, metre = .005;
	if (physicalAreaSqM) metre = sceneUnitsPerMetre(property, 1, physicalAreaSqM);
	else {
		let sampled = 0;
		outer: for (const area of areas) for (const plant of area.boundaryPlanting ?? []) {
			if (sampled++ >= 256) break outer;
			metre = Math.max(metre, plant.planRadius / plant.crownRadiusM);
		}
	}
	for (const area of areas) for (const plant of area.boundaryPlanting ?? []) {
		if (result.length >= 96 || examined++ >= 256) return result;
		const { position: p, planRadius: r } = plant, clearance = r * 1.25;
		if (!inside(p, property) || edgeClearance(p, property) < clearance) continue;
		if (areas.some((a) => a.id !== area.id && a.structureKind !== "fence" && (inside(p, a.outline) || distanceToOutline(p, a.outline) < clearance))) continue;
		if (areas.some((a) => a.waterTrough && Math.hypot(p.x - a.waterTrough.position.x, p.y - a.waterTrough.position.y) < clearance + Math.hypot(a.waterTrough.planWidth, a.waterTrough.planHeight) / 2)) continue;
		if (animals.some((a) => Math.hypot(p.x - a.position.x, p.y - a.position.y) < clearance + (a.species ? animalVisualLength[a.species] : 3.2) * metre / Math.SQRT2)) continue;
		if (result.some((q) => Math.hypot(p.x - q.position.x, p.y - q.position.y) < r + q.planRadius)) continue;
		result.push({
			...plant,
			id: area.id + "-" + plant.id
		});
	}
	return result;
}
//#endregion
//#region lib/farm-geometry.ts
function sanitizeSurveyVertices(vertices) {
	const valid = vertices.filter((vertex) => vertex.id.trim().length > 0 && Number.isFinite(vertex.easting) && Number.isFinite(vertex.northing)).map((vertex, index) => ({
		id: vertex.id.trim().slice(0, 24) || String(index + 1),
		easting: Number(vertex.easting),
		northing: Number(vertex.northing)
	}));
	const first = valid[0], last = valid[valid.length - 1];
	if (valid.length > 1 && first.easting === last.easting && first.northing === last.northing) valid.pop();
	return valid.slice(0, 200);
}
function calculateSurveyMetrics(input) {
	const vertices = sanitizeSurveyVertices(input);
	if (vertices.length < 3) return {
		areaSqM: 0,
		perimeterM: 0,
		segments: []
	};
	let signedDoubleArea = 0;
	let perimeterM = 0;
	const segments = [];
	for (let index = 0; index < vertices.length; index += 1) {
		const current = vertices[index];
		const next = vertices[(index + 1) % vertices.length];
		signedDoubleArea += current.easting * next.northing - next.easting * current.northing;
		const deltaEast = next.easting - current.easting;
		const deltaNorth = next.northing - current.northing;
		const distanceM = Math.hypot(deltaEast, deltaNorth);
		const normalizedAzimuth = (Math.atan2(deltaEast, deltaNorth) * 180 / Math.PI + 360) % 360;
		perimeterM += distanceM;
		segments.push({
			from: current.id,
			to: next.id,
			distanceM,
			azimuthDeg: normalizedAzimuth,
			bearing: azimuthToBearing(normalizedAzimuth)
		});
	}
	return {
		areaSqM: Math.abs(signedDoubleArea) / 2,
		perimeterM,
		segments
	};
}
function azimuthToBearing(azimuth) {
	const value = (azimuth % 360 + 360) % 360;
	const format = (degrees) => `${degrees.toFixed(1)}°`;
	if (value <= 90) return `N ${format(value)} E`;
	if (value <= 180) return `S ${format(180 - value)} E`;
	if (value <= 270) return `S ${format(value - 180)} O`;
	return `N ${format(360 - value)} O`;
}
function normalizeSurveyPolygon(input, width = 100, height = 70, padding = 7) {
	const vertices = sanitizeSurveyVertices(input);
	if (vertices.length < 3) return [
		{
			id: "1",
			x: padding,
			y: padding
		},
		{
			id: "2",
			x: width - padding,
			y: padding
		},
		{
			id: "3",
			x: width - padding,
			y: height - padding
		},
		{
			id: "4",
			x: padding,
			y: height - padding
		}
	];
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
		y: offsetY + (maxNorth - vertex.northing) * scale
	}));
}
function clampMapValue(value, min, max) {
	return Math.min(max, Math.max(min, value));
}
//#endregion
//#region lib/farm-outline-view.ts
function propertyOutlinePoints(vertices, sketch, preferSketch = false) {
	const survey = validateSurveyVertices(vertices), draft = validateNormalizedSketchPolygon(sketch);
	if (!preferSketch && survey.ok && survey.vertices.length >= 3) return {
		basis: "survey",
		points: normalizeSurveyPolygon(survey.vertices, 100, 70, 6)
	};
	if (draft.ok) return {
		basis: "sketch",
		points: normalizeSurveyPolygon(draft.polygon.vertices.map((p) => ({
			id: p.id,
			easting: p.x,
			northing: -p.y
		})), 100, 70, 6)
	};
	if (survey.ok && survey.vertices.length >= 3) return {
		basis: "survey",
		points: normalizeSurveyPolygon(survey.vertices, 100, 70, 6)
	};
	return {
		basis: "reference",
		points: normalizeSurveyPolygon([], 100, 70, 6)
	};
}
function areaOutlinePoints(outline, layout) {
	const scale = Math.min(layout.width, layout.height) / 100;
	const x = layout.x + (layout.width - 100 * scale) / 2, y = layout.y + (layout.height - 100 * scale) / 2;
	return outline.vertices.map((p) => ({
		id: p.id,
		x: x + p.x * scale,
		y: y + p.y * scale
	}));
}
/** Legacy backup values stay in storage; views never assume all old coordinates are numbers. */
function formatSurveyCoordinate(value) {
	if (typeof value === "number" && Number.isFinite(value)) return value.toLocaleString("es-VE", { maximumFractionDigits: 3 });
	if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return value;
	return "Pendiente de revisión";
}
//#endregion
//#region lib/farm-plan-presentation.ts
function planAreaTone(category) {
	return /agua|laguna|tanque|captacion/i.test(category) ? "#d8e5e5" : /potrero|cultivo|bosque|reserva|vivero|invernadero/i.test(category) ? "#dce5d4" : "#e6ddcf";
}
function planAreaLabel(width, height, index, customOutline = false, pixelsPerUnit = 4) {
	const label = String(index + 1);
	const pixels = Math.max(.01, pixelsPerUnit), availableWidth = Math.max(0, width * pixels - 6), availableHeight = Math.max(0, height * pixels - 6);
	const fontPixels = Math.min(12, availableHeight * .8, availableWidth / (label.length * .65));
	return {
		label,
		show: fontPixels >= 9,
		showIcon: !customOutline && availableWidth >= 40 && availableHeight >= 40,
		fontSize: fontPixels / pixels,
		iconSize: 16 / pixels,
		textOffset: (availableWidth >= 40 && availableHeight >= 40 && !customOutline ? 14 : fontPixels * .35) / pixels,
		iconOffset: 13 / pixels
	};
}
/** Uniform presentation transform for the normalized internal plan, not georeferencing. */
function planViewport(points) {
	const minX = Math.min(...points.map((p) => p.x)), maxX = Math.max(...points.map((p) => p.x)), minY = Math.min(...points.map((p) => p.y)), maxY = Math.max(...points.map((p) => p.y));
	const scale = Math.max(.01, Math.min((maxX - minX - 4) / 100, (maxY - minY - 4) / 70));
	return {
		scale,
		x: minX + (maxX - minX - 100 * scale) / 2,
		y: minY + (maxY - minY - 70 * scale) / 2
	};
}
function planAreaUse(category, title = "") {
	const normalize = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
	const classify = (value) => {
		if (/invernadero|casa de cultivo/.test(value)) return "greenhouse";
		if (/laguna|agua|reservorio/.test(value)) return "water";
		if (/bosque|reserva|arbol/.test(value)) return "forest";
		if (/corral|vaquera/.test(value)) return "corral";
		if (/galpon/.test(value)) return "barn";
		if (/deposito|almacen|bodega/.test(value)) return "storage";
		if (/casa|vivienda/.test(value)) return "house";
		if (/via|camino|acceso/.test(value)) return "road";
		if (/potrero|pastoreo/.test(value)) return "pasture";
		if (/cultivo|parcela de|siembra|huerto/.test(value)) return "crop";
		return "other";
	};
	const primary = classify(normalize(category));
	if ((primary === "crop" || primary === "other") && /invernadero|casa de cultivo/.test(normalize(title))) return "greenhouse";
	return primary === "other" ? classify(normalize(title)) : primary;
}
function planDetailLevel(width, height, pixelsPerUnit) {
	const short = Math.min(width, height) * pixelsPerUnit;
	return short < 12 ? "none" : short < 28 ? "simple" : "full";
}
//#endregion
//#region lib/farm-water-trough.ts
/** Explicit fixture accessories only; never infer water infrastructure on real land. */
function waterTroughView(data, layout, outline, viewport, demonstration) {
	const value = data.waterTrough;
	if (!demonstration || !value || typeof value !== "object" || Array.isArray(value)) return;
	const t = value;
	if (t.version !== 1 || t.source !== "fictional-demo" || ![
		"x",
		"y",
		"lengthM",
		"widthM",
		"heightM"
	].every((k) => typeof t[k] === "number" && Number.isFinite(t[k]))) return;
	const x = t.x, y = t.y, lengthM = t.lengthM, widthM = t.widthM, heightM = t.heightM, landLength = Number(data.lengthM), landWidth = Number(data.widthM);
	if (x <= 0 || x >= 100 || y <= 0 || y >= 100 || lengthM <= 0 || lengthM > 10 || widthM <= 0 || widthM > 5 || heightM <= 0 || heightM > 2 || !Number.isFinite(landLength) || landLength <= 0 || !Number.isFinite(landWidth) || landWidth <= 0) return;
	const point = {
		x: layout.x + layout.width * x / 100,
		y: layout.y + layout.height * y / 100
	}, pw = layout.width * lengthM / landLength, ph = layout.height * widthM / landWidth;
	if (!inside(point, outline) || edgeClearance(point, outline) < Math.hypot(pw, ph) / 2) return;
	return {
		position: {
			x: viewport.x + point.x * viewport.scale,
			y: viewport.y + point.y * viewport.scale
		},
		lengthM,
		widthM,
		heightM,
		planWidth: pw * viewport.scale,
		planHeight: ph * viewport.scale
	};
}
//#endregion
//#region lib/farm-aerial-presentation.ts
var normal = (value) => typeof value === "string" ? value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
function aerialDescriptor(category, title, data = {}) {
	const usage = normal(category) + (category === "Otro" ? " " + normal(data.usage) : "");
	let use = planAreaUse(category, title);
	if (/cabana/.test(usage)) use = "house";
	else if (/gallinero|porqueriza|establo|porcinera/.test(usage)) use = "barn";
	else if (/estanque|jaguey/.test(usage)) use = "water";
	else if (/tanque|captacion/.test(usage)) use = "tank";
	else if (/compost|lombric/.test(usage)) use = "compost";
	else if (/vivero|almacigo/.test(usage)) use = "nursery";
	else if (/invernadero|casa de cultivo/.test(usage)) use = "greenhouse";
	else if (category === "Otro" && data.usage) use = planAreaUse(String(data.usage));
	const crop = normal(data.crop);
	let vegetation = null;
	if (use === "forest") vegetation = "canopy";
	else if (use === "crop" || use === "nursery") {
		if (/cafe/.test(crop)) vegetation = "coffee";
		else if (/platano|cambur|banano/.test(crop)) vegetation = "banana";
		else if (/cacao|frutal|mango|aguacate|naranja|mandarina|limon|citric/.test(crop)) vegetation = "canopy";
		else if (/lechuga|acelga|espinaca|repollo|hortaliza.*hoja/.test(crop)) vegetation = "leafy";
	}
	return {
		use,
		vegetation
	};
}
function insidePolygon(point, vertices) {
	let inside = false;
	for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
		const a = vertices[i], b = vertices[j];
		if (a.y > point.y !== b.y > point.y && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
	}
	return inside;
}
function distanceToEdge(p, a, b) {
	const dx = b.x - a.x, dy = b.y - a.y, t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
	return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
}
/** A sampled interior circle keeps a compact facility symbol inside a concave saved outline. */
function aerialAnchor(layout, vertices) {
	if (!vertices || vertices.length < 3) return {
		x: layout.x + layout.width / 2,
		y: layout.y + layout.height / 2,
		radius: Math.min(layout.width, layout.height) * .65
	};
	let best = null;
	for (let r = 0; r < 13; r++) for (let c = 0; c < 13; c++) {
		const p = {
			x: layout.x + (c + .5) / 13 * layout.width,
			y: layout.y + (r + .5) / 13 * layout.height
		};
		if (!insidePolygon(p, vertices)) continue;
		const radius = Math.min(...vertices.map((a, i) => distanceToEdge(p, a, vertices[(i + 1) % vertices.length]))) * .9;
		if (!best || radius > best.radius) best = {
			...p,
			radius
		};
	}
	return best;
}
function seededVariation(id, index) {
	let hash = 2166136261;
	for (const char of id) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
	return ((hash >>> 0) + index * 2654435761 >>> 0) % 1e3 / 1e3;
}
function aerialAreaName(title, width, height, pixelsPerUnit, customOutline = false, category = "") {
	const w = width * pixelsPerUnit, h = height * pixelsPerUnit;
	if (customOutline || w < 60 || h < 55) return null;
	const plain = title.replace(/\s*·\s*ejemplo\b/gi, "").trim(), limit = Math.floor((w - 12) / 6.5);
	const labels = {
		"Otro": "Por definir",
		"Casa": "Casa",
		"Galpón": "Galpón",
		"Depósito": "Depósito",
		"Laguna / agua": "Laguna",
		"Vaquera / corrales": "Corral",
		"Bosque / reserva": "Bosque",
		"Vías": "Acceso",
		"Tanque de agua": "Tanque",
		"Compostera": "Compostera",
		"Invernadero": "Invernadero",
		"Vivero": "Vivero"
	};
	if (category === "Laguna / agua" && limit >= 6) return "Laguna";
	if (plain.length <= limit) return plain;
	const short = labels[category];
	if (!short) return null;
	if (short.length <= limit) return short;
	const words = short.split(" ");
	if (words.length === 2 && words.every((word) => word.length <= limit) && h >= 75) return words.join("\n");
	return null;
}
//#endregion
//#region lib/demo-plan-animals.ts
/** Explicit fictitious coordinates only; an organizational areaId alone never places an animal. */
function demoPlanAnimals(demonstration, area, records, layout, pixels, outline, preserveSmall = false) {
	if (!preserveSmall && Math.min(layout.width, layout.height) * pixels < 35) return [];
	return records.flatMap((record) => {
		const d = record.payload.data, p = Object.prototype.hasOwnProperty.call(d, "planPlacement") ? d.planPlacement : demonstration ? d.demoPlanPlacement : null;
		if (record.payload.recordType !== "animal" || record.payload.farmId !== area.payload.farmId || d.areaId !== area.id || !p || typeof p !== "object" || Array.isArray(p)) return [];
		const point = p;
		if (point.version !== 1 || !(point.source === "user-placed" || demonstration && point.source === "fictional-demo") || point.coordinateSpace !== "area-percent" || point.areaId !== area.id || typeof point.x !== "number" || typeof point.y !== "number" || !Number.isFinite(point.x) || !Number.isFinite(point.y) || point.x <= 0 || point.x >= 100 || point.y <= 0 || point.y >= 100) return [];
		const center = {
			x: layout.x + layout.width * point.x / 100,
			y: layout.y + layout.height * point.y / 100
		};
		if (outline && !insidePolygon(center, outline)) return [];
		const animal = /bovin|vaca/i.test(record.payload.category) ? "cattle" : /porcin|cerdo/i.test(record.payload.category) ? "pig" : /gallina/i.test(record.payload.category) ? "hen" : null;
		let radius = Math.min(center.x - layout.x, layout.x + layout.width - center.x, center.y - layout.y, layout.y + layout.height - center.y);
		if (outline) for (let i = 0; i < outline.length; i++) {
			const a = outline[i], b = outline[(i + 1) % outline.length], dx = b.x - a.x, dy = b.y - a.y, t = Math.max(0, Math.min(1, ((center.x - a.x) * dx + (center.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
			radius = Math.min(radius, Math.hypot(center.x - a.x - t * dx, center.y - a.y - t * dy));
		}
		const size = Math.min(48 / pixels, Math.min(layout.width, layout.height) * .35, radius * 1.4);
		if (!preserveSmall && size * pixels < 10) return [];
		return [{
			species: animalModelSpecies(record.payload.category, typeof d.species === "string" ? d.species : void 0),
			id: record.id,
			areaId: area.id,
			title: record.payload.title,
			category: record.payload.category,
			src: animal ? `/plan-vegetation/${animal}-256.png` : "",
			x: center.x - size / 2,
			y: center.y - size / 2,
			size
		}];
	});
}
//#endregion
//#region lib/illustrated-plan-adapter.ts
/** Pure presentation adapter: source shapes/positions and links are never rewritten. */
function illustratedPlan(layouts, viewport, records, demonstration) {
	const point = (p) => ({
		x: viewport.x + p.x * viewport.scale,
		y: viewport.y + p.y * viewport.scale
	});
	const areas = [], animals = [];
	for (const { area, layout: l } of layouts) {
		const d = aerialDescriptor(area.payload.category, area.payload.title, area.payload.data), custom = getAreaOutline(area.payload.data), outline = custom ? areaOutlinePoints(custom, l) : ["Laguna / agua", "Agua"].includes(area.payload.category) ? Array.from({ length: 32 }, (_, i) => ({
			x: l.x + l.width / 2 + Math.cos(i / 32 * Math.PI * 2) * l.width / 2,
			y: l.y + l.height / 2 + Math.sin(i / 32 * Math.PI * 2) * l.height / 2
		})) : [
			{
				x: l.x,
				y: l.y
			},
			{
				x: l.x + l.width,
				y: l.y
			},
			{
				x: l.x + l.width,
				y: l.y + l.height
			},
			{
				x: l.x,
				y: l.y + l.height
			}
		];
		const usage = String(area.payload.data.usage ?? area.payload.category).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
		let use = d.use === "storage" ? "barn" : d.use;
		if (/cabana/.test(usage)) use = "cabin";
		if (/gallinero/.test(usage)) use = "coop";
		const vegetation = d.vegetation === "canopy" ? "cacao" : d.vegetation === "leafy" ? "low" : d.vegetation ?? void 0;
		areas.push({
			id: area.id,
			title: area.payload.title,
			outline: outline.map(point),
			use,
			vegetation,
			boundaryPlanting: boundaryPlantingView(area.payload.data, l, outline, viewport, demonstration),
			waterTrough: waterTroughView(area.payload.data, l, outline, viewport, demonstration),
			cropKind: [
				"crop",
				"nursery",
				"greenhouse"
			].includes(use) ? cropModelKind(area.payload.data.crop) : void 0,
			structureKind: structureModelKind(area.payload.category, area.payload.data.usage),
			declaredDimensions: declaredPlanDimensions(area.payload.data),
			fenced: area.payload.data.fenced === true,
			linkedAnimalCount: records.filter((r) => r.payload.recordType === "animal" && r.payload.farmId === area.payload.farmId && r.payload.data.areaId === area.id).length
		});
		for (const animal of demoPlanAnimals(demonstration, area, records, l, 8, outline, true)) {
			const species = animal.src.includes("cattle") ? "cattle" : animal.src.includes("pig") ? "pig" : animal.src.includes("hen") ? "hen" : null;
			animals.push({
				species: animal.species,
				id: animal.id,
				areaId: area.id,
				title: animal.title,
				position: point({
					x: animal.x + animal.size / 2,
					y: animal.y + animal.size / 2
				}),
				category: animal.category,
				src: species ? `/plan-oblique/${species}-256.webp` : "",
				anchor: species === "cattle" ? {
					u: .61,
					v: .77
				} : species === "pig" ? {
					u: .65,
					v: .76
				} : {
					u: .48,
					v: .84
				}
			});
		}
	}
	return {
		areas,
		animals
	};
}
//#endregion
export { fencePostPoints as _, aerialDescriptor as a, animalModelSpecies as b, planAreaTone as c, areaOutlinePoints as d, formatSurveyCoordinate as f, visibleBoundaryPlants as g, clampMapValue as h, aerialAreaName as i, planDetailLevel as l, calculateSurveyMetrics as m, demoPlanAnimals as n, seededVariation as o, propertyOutlinePoints as p, aerialAnchor as r, planAreaLabel as s, illustratedPlan as t, planViewport as u, fenceWireSegments as v, animalVisualLength as x, sceneUnitsPerMetre as y };
