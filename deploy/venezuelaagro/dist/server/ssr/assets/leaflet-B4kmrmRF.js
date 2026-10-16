//#region lib/map-label-presentation.ts
var MAP_PLACE_LABEL_STYLE = {
	labelProps: ["name:es", "name"],
	fill: "#20351a",
	stroke: "#fffef7",
	width: 3,
	font: "600 13px sans-serif"
};
/** Keep source filters/order, improve locality contrast, and identify only named administrative POIs. */
function readableMapLabelRules(rules, symbol) {
	return [...rules.map((rule) => rule.dataLayer === "places" ? {
		...rule,
		symbolizer: symbol()
	} : rule), {
		dataLayer: "pois",
		minzoom: 13,
		symbolizer: symbol(),
		filter: (_z, feature) => feature.props.kind === "administrative" && typeof feature.props.name === "string" && feature.props.name.trim().length > 0
	}];
}
//#endregion
//#region lib/offline-map-pack.ts
var MAP_PACK = {
	title: "Zona piloto de los Llanos",
	kind: "regional",
	id: "venezuela-public-pilot-osm-20261007-z14",
	path: "/map-packs/venezuela-public-pilot-20261007.pmtiles",
	bytes: 567939,
	sha256: "10044fa6c78d798d1d1130b659cdb7defcc6589e9864fe27284b93f3cfeeaf0d",
	bounds: [
		-68.4,
		9.3999566,
		-68.3000175,
		9.5
	],
	maxZoom: 14,
	date: "2026-10-07",
	source: "https://maps.protomaps.com/builds/",
	license: "https://www.openstreetmap.org/copyright"
};
var NATIONAL_MAP_PACK = {
	id: "venezuela-context-protomaps-20261007-z10",
	path: "/map-packs/venezuela-context-20261007-z10.pmtiles",
	bytes: 9790298,
	sha256: "6932fce5754d60a3c8674451d03a7523a8aa3324a912fa250a22f582732a487c",
	bounds: [
		-73.3809799,
		.621727,
		-59.51474,
		15.96134
	],
	maxZoom: 10,
	date: "2026-10-07",
	source: "https://maps.protomaps.com/builds/",
	license: "https://www.openstreetmap.org/copyright",
	title: "Contexto de Venezuela: ciudades y vías principales",
	kind: "national"
};
var REGIONAL_CONTEXT = {
	id: "regional-context-protomaps-20261007-z6",
	path: "/map-context/venezuela-region-20261007-z6.pmtiles",
	bytes: 2521390,
	sha256: "bce4d01c0ae0310c2111d1727ea1062091a6ba298a5c77a67b0d661650bd7514",
	bounds: [
		-92,
		-6,
		-39,
		25
	],
	maxZoom: 6,
	date: "2026-10-07",
	source: "https://maps.protomaps.com/builds/",
	license: "https://www.openstreetmap.org/copyright",
	title: "Contexto general de Venezuela y alrededores",
	kind: "regional"
};
var MAP_PACKS = [MAP_PACK, NATIONAL_MAP_PACK];
function registered(pack) {
	const known = [...MAP_PACKS, REGIONAL_CONTEXT].find((item) => item.id === pack.id);
	if (!known || known.path !== pack.path || known.bytes !== pack.bytes || known.sha256 !== pack.sha256) throw new Error("pack_not_registered");
	return known;
}
function generationKey(pack) {
	return pack.id === MAP_PACK.id ? "generation" : `generation:${pack.id}`;
}
function mapPackDatabaseName(owner) {
	if (!owner || owner.length > 220) throw new Error("workspace_required");
	return `venezuela-agro-map-pack-v1:${encodeURIComponent(owner)}`;
}
function open$1(owner) {
	return new Promise((resolve, reject) => {
		const r = indexedDB.open(mapPackDatabaseName(owner), 1);
		r.onupgradeneeded = () => r.result.createObjectStore("packs");
		r.onsuccess = () => resolve(r.result);
		r.onerror = () => reject(r.error);
	});
}
function request$1(r) {
	return new Promise((resolve, reject) => {
		r.onsuccess = () => resolve(r.result);
		r.onerror = () => reject(r.error);
	});
}
function done$1(tx) {
	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onabort = () => reject(tx.error ?? /* @__PURE__ */ new Error("storage_aborted"));
		tx.onerror = () => reject(tx.error ?? /* @__PURE__ */ new Error("storage_failed"));
	});
}
async function verifyMapPack(blob, pack = MAP_PACK) {
	pack = registered(pack);
	if (blob.size !== pack.bytes) throw new Error("pack_size_mismatch");
	if (Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", await blob.arrayBuffer())), (b) => b.toString(16).padStart(2, "0")).join("") !== pack.sha256) throw new Error("pack_hash_mismatch");
}
async function readMapPack(owner, pack = MAP_PACK) {
	pack = registered(pack);
	const db = await open$1(owner);
	try {
		const tx = db.transaction("packs", "readonly"), finished = done$1(tx);
		const value = await request$1(tx.objectStore("packs").get(pack.id));
		await finished;
		if (!value) return null;
		if (value.sha256 !== pack.sha256 || !(value.blob instanceof Blob)) return null;
		await verifyMapPack(value.blob, pack);
		return value;
	} finally {
		db.close();
	}
}
async function beginMapPack(owner, pack = MAP_PACK) {
	pack = registered(pack);
	const db = await open$1(owner);
	try {
		const tx = db.transaction("packs", "readwrite"), finished = done$1(tx), store = tx.objectStore("packs");
		const generation = Number(await request$1(store.get(generationKey(pack))) ?? 0) + 1;
		store.put(generation, generationKey(pack));
		await finished;
		return generation;
	} finally {
		db.close();
	}
}
async function commitMapPack(owner, blob, generation, signal, pack = MAP_PACK) {
	pack = registered(pack);
	await verifyMapPack(blob, pack);
	const db = await open$1(owner), tx = db.transaction("packs", "readwrite"), finished = done$1(tx);
	const cancel = () => {
		try {
			tx.abort();
		} catch {}
	};
	signal?.addEventListener("abort", cancel, { once: true });
	try {
		if (signal?.aborted || await request$1(tx.objectStore("packs").get(generationKey(pack))) !== generation) throw new Error("download_cancelled");
		const saved = {
			blob,
			downloadedAt: (/* @__PURE__ */ new Date()).toISOString(),
			sha256: pack.sha256
		};
		tx.objectStore("packs").put(saved, pack.id);
		await finished;
		return saved;
	} catch (error) {
		cancel();
		await finished.catch(() => void 0);
		throw error;
	} finally {
		signal?.removeEventListener("abort", cancel);
		db.close();
	}
}
async function clearMapPack(owner, pack = MAP_PACK) {
	pack = registered(pack);
	const db = await open$1(owner);
	try {
		const tx = db.transaction("packs", "readwrite"), finished = done$1(tx), store = tx.objectStore("packs");
		store.put(Number(await request$1(store.get(generationKey(pack))) ?? 0) + 1, generationKey(pack));
		store.delete(pack.id);
		await finished;
	} finally {
		db.close();
	}
}
async function fetchMapPack(signal, onProgress, pack = MAP_PACK) {
	pack = registered(pack);
	const response = await fetch(pack.path, {
		cache: "no-store",
		redirect: "error",
		signal
	});
	if (!response.ok || !response.body) throw new Error("download_unavailable");
	const reader = response.body.getReader(), chunks = [];
	let total = 0;
	try {
		while (true) {
			if (signal.aborted) throw new Error("download_cancelled");
			const result = await reader.read();
			if (result.done) break;
			total += result.value.byteLength;
			if (total > pack.bytes) throw new Error("download_too_large");
			chunks.push(new Uint8Array(result.value));
			onProgress(total);
		}
		const blob = new Blob(chunks, { type: "application/octet-stream" });
		await verifyMapPack(blob, pack);
		return blob;
	} finally {
		await reader.cancel().catch(() => void 0);
	}
}
//#endregion
//#region lib/offline-satellite-store.ts
var MAX_BYTES = 8 * 1024 * 1024;
function satelliteDatabaseName(owner) {
	if (!owner || owner.length > 220) throw new Error("workspace_required");
	return `venezuela-agro-satellite-v1:${encodeURIComponent(owner)}`;
}
function open(owner) {
	return new Promise((resolve, reject) => {
		const r = indexedDB.open(satelliteDatabaseName(owner), 1);
		r.onupgradeneeded = () => r.result.createObjectStore("packs");
		r.onsuccess = () => resolve(r.result);
		r.onerror = () => reject(r.error);
	});
}
function request(r) {
	return new Promise((resolve, reject) => {
		r.onsuccess = () => resolve(r.result);
		r.onerror = () => reject(r.error);
	});
}
function done(tx) {
	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onabort = () => reject(tx.error ?? /* @__PURE__ */ new Error("storage_aborted"));
		tx.onerror = () => reject(tx.error ?? /* @__PURE__ */ new Error("storage_failed"));
	});
}
function packCoversBounds(pack, bounds) {
	const [w, s, e, n] = bounds;
	return bounds.every(Number.isFinite) && w <= e && s <= n && w >= pack.bounds[0] && s >= pack.bounds[1] && e <= pack.bounds[2] && n <= pack.bounds[3];
}
async function beginSatelliteDownload(owner) {
	const db = await open(owner);
	try {
		const tx = db.transaction("packs", "readwrite"), finished = done(tx);
		const n = (await request(tx.objectStore("packs").get("generation")) ?? 0) + 1;
		tx.objectStore("packs").put(n, "generation");
		await finished;
		return n;
	} finally {
		db.close();
	}
}
async function readSatellitePack(owner, expected) {
	const db = await open(owner);
	try {
		const tx = db.transaction("packs", "readonly"), finished = done(tx);
		const value = await request(tx.objectStore("packs").get(expected.id));
		await finished;
		if (!value || value.pack.revision !== expected.revision || value.pack.sha256 !== expected.sha256 || !(value.blob instanceof Blob) || value.blob.size !== expected.bytes) return null;
		return {
			...value,
			pack: expected
		};
	} finally {
		db.close();
	}
}
async function clearSatellitePack(owner, id) {
	const db = await open(owner);
	try {
		const tx = db.transaction("packs", "readwrite"), finished = done(tx);
		const n = (await request(tx.objectStore("packs").get("generation")) ?? 0) + 1;
		tx.objectStore("packs").put(n, "generation");
		tx.objectStore("packs").delete(id);
		await finished;
	} finally {
		db.close();
	}
}
async function commitSatellitePack(owner, pack, blob, generation, signal) {
	if (blob.size !== pack.bytes || blob.size > MAX_BYTES || pack.width * pack.height > 2048 * 2048) throw new Error("pack_size_mismatch");
	if (Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", await blob.arrayBuffer())), (b) => b.toString(16).padStart(2, "0")).join("") !== pack.sha256) throw new Error("pack_hash_mismatch");
	const db = await open(owner), tx = db.transaction("packs", "readwrite"), finished = done(tx);
	const cancel = () => {
		try {
			tx.abort();
		} catch {}
	};
	signal?.addEventListener("abort", cancel, { once: true });
	try {
		const current = await request(tx.objectStore("packs").get("generation"));
		if (signal?.aborted || current !== generation) throw new Error("download_cancelled");
		const saved = {
			pack,
			blob,
			downloadedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		tx.objectStore("packs").put(saved, pack.id);
		await finished;
		return saved;
	} catch (error) {
		cancel();
		await finished.catch(() => void 0);
		throw error;
	} finally {
		signal?.removeEventListener("abort", cancel);
		db.close();
	}
}
async function fetchSatellitePack(pack, signal, onProgress) {
	if (!/^\/satellite-packs\/[a-z0-9-]+\.(png|jpg)$/.test(pack.path) || pack.bytes <= 0 || pack.bytes > MAX_BYTES) throw new Error("pack_not_available");
	const response = await fetch(pack.path, {
		cache: "no-store",
		signal,
		redirect: "error"
	});
	if (!response.ok || !response.body || !/^image\/(png|jpeg)(;|$)/i.test(response.headers.get("content-type") ?? "")) throw new Error("download_unavailable");
	const reader = response.body.getReader(), chunks = [];
	let total = 0;
	try {
		while (true) {
			if (signal.aborted) throw new Error("download_cancelled");
			const { done, value } = await reader.read();
			if (done) break;
			total += value.byteLength;
			if (total > pack.bytes || total > MAX_BYTES) throw new Error("download_too_large");
			chunks.push(new Uint8Array(value));
			onProgress(total);
		}
		if (total !== pack.bytes) throw new Error("download_incomplete");
		return new Blob(chunks, { type: response.headers.get("content-type").split(";")[0] });
	} finally {
		await reader.cancel().catch(() => void 0);
	}
}
//#endregion
//#region lib/satellite-packs.ts
/** Fixed public sample; no private farm coordinates were used to create it. */
var SATELLITE_SAMPLE = {
	id: "llanos-muestra-20260121",
	revision: "1f40baf8574e36c6",
	title: "Zona de muestra en los Llanos venezolanos",
	path: "/satellite-packs/llanos-muestra-20260121.png",
	bytes: 1768170,
	sha256: "1f40baf8574e36c6d81e7a8b39c4be71cf69d3abe0c146d86528218a6035859a",
	width: 1113,
	height: 1129,
	bounds: [
		-68.4,
		9.3999566,
		-68.3000175,
		9.5
	],
	acquiredAt: "2026-01-21T15:10:20.540Z",
	sourceUrl: "https://earth-search.aws.element84.com/v1/collections/sentinel-2-c1-l2a/items/S2C_T19PEL_20260121T150912_L2A",
	attribution: "Contains modified Copernicus Sentinel data 2026",
	resolutionM: 10,
	qualityNote: "Imagen histórica de unos 11 × 11 km. Puede presentar bruma; no permite distinguir cercas ni certificar linderos."
};
var SATELLITE_LICENSE = "https://sentinels.copernicus.eu/documents/247904/690755/Sentinel_Data_Legal_Notice";
//#endregion
export { readMapPack as _, commitSatellitePack as a, readSatellitePack as c, NATIONAL_MAP_PACK as d, REGIONAL_CONTEXT as f, fetchMapPack as g, commitMapPack as h, clearSatellitePack as i, MAP_PACK as l, clearMapPack as m, SATELLITE_SAMPLE as n, fetchSatellitePack as o, beginMapPack as p, beginSatelliteDownload as r, packCoversBounds as s, SATELLITE_LICENSE as t, MAP_PACKS as u, MAP_PLACE_LABEL_STYLE as v, readableMapLabelRules as y };
