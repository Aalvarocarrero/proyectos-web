import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { d as bounds, f as edgeClearance, g as outlineExceedsProperty, h as interiorSlots, m as interiorAnchor } from "./farm-plan-catalog-7z5TuNyx.js";
import { _ as fencePostPoints, g as visibleBoundaryPlants, x as animalVisualLength, y as sceneUnitsPerMetre } from "./illustrated-plan-adapter-v5jMuBYX.js";
import { t as FarmAssetPack } from "./farm-asset-pack-C3s4Y-70.js";
//#region lib/farm-masterplan-camera.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var INITIAL_CAMERA = {
	yaw: -25,
	tilt: 52,
	zoom: 1,
	panX: 0,
	panY: 0
};
function cameraLimits(c) {
	return {
		yaw: (c.yaw % 360 + 360) % 360,
		tilt: Math.max(2, Math.min(90, c.tilt)),
		zoom: Math.max(.55, Math.min(4, c.zoom)),
		panX: Math.max(-1200, Math.min(1200, c.panX)),
		panY: Math.max(-1200, Math.min(1200, c.panY))
	};
}
/** Orthographic 3D projection; presentation coordinates never persist to farm records. */
function project360(p, z, c, center, scale) {
	const yaw = c.yaw * Math.PI / 180, tilt = c.tilt * Math.PI / 180, x = p.x - center.x, y = p.y - center.y, rx = x * Math.cos(yaw) - y * Math.sin(yaw), ry = x * Math.sin(yaw) + y * Math.cos(yaw);
	return {
		x: 500 + c.panX + rx * scale * c.zoom,
		y: 330 + c.panY + (ry * Math.sin(tilt) - z * Math.cos(tilt)) * scale * c.zoom,
		depth: ry * Math.cos(tilt) + z * Math.sin(tilt)
	};
}
function gestureCamera(c, oldPoints, newPoints, mode, factor = 1) {
	if (!oldPoints.length || oldPoints.length !== newPoints.length) return c;
	const mid = (p) => ({
		x: p.reduce((s, q) => s + q.x, 0) / p.length,
		y: p.reduce((s, q) => s + q.y, 0) / p.length
	}), a = mid(oldPoints), b = mid(newPoints), dx = b.x - a.x, dy = b.y - a.y;
	if (newPoints.length >= 2) {
		const distance = (p) => Math.hypot(p[1].x - p[0].x, p[1].y - p[0].y), old = distance(oldPoints), next = distance(newPoints), angle = (p) => Math.atan2(p[1].y - p[0].y, p[1].x - p[0].x), delta = old > 2 && next > 2 ? Math.atan2(Math.sin(angle(newPoints) - angle(oldPoints)), Math.cos(angle(newPoints) - angle(oldPoints))) : 0;
		return cameraLimits({
			...c,
			yaw: c.yaw + delta * 180 / Math.PI,
			panX: c.panX + dx * factor,
			panY: c.panY + dy * factor,
			zoom: old > 2 ? c.zoom * distance(newPoints) / old : c.zoom
		});
	}
	return cameraLimits(mode === "pan" ? {
		...c,
		panX: c.panX + dx * factor,
		panY: c.panY + dy * factor
	} : {
		...c,
		yaw: c.yaw + dx * .45,
		tilt: c.tilt + dy * .25
	});
}
//#endregion
//#region components/farm-masterplan-vector.tsx
var import_jsx_runtime = require_jsx_runtime();
var tones = {
	pasture: "#78a951",
	crop: "#8fa451",
	forest: "#55784b",
	house: "#c2b589",
	barn: "#c1af7f",
	cabin: "#bca77d",
	coop: "#b8aa7b",
	greenhouse: "#92b69a",
	nursery: "#a0ab69",
	water: "#55939b",
	tank: "#adc6bc",
	compost: "#9c805b",
	corral: "#b8a175",
	road: "#ccbd96",
	other: "#a0af7f"
};
var buildings = new Set([
	"house",
	"barn",
	"cabin",
	"coop",
	"greenhouse",
	"tank"
]);
var button = "min-h-11 rounded-full border border-[#476442]/25 bg-white px-4 text-sm font-semibold text-[#29442c] disabled:opacity-40";
function FarmMasterplanScene$1({ propertyOutline, areas, animals, farmName, animalRecords, onOpenAnimal, onSelect, onReturn, surveyBased, physicalAreaSqM, draft = false }) {
	const [selectedId, setSelectedId] = (0, import_react.useState)(void 0);
	const [camera, setCamera] = (0, import_react.useState)(INITIAL_CAMERA), [mode, setMode] = (0, import_react.useState)("orbit"), [labels, setLabels] = (0, import_react.useState)(true);
	const pointers = (0, import_react.useRef)(/* @__PURE__ */ new Map()), start = (0, import_react.useRef)(null), moved = (0, import_react.useRef)(false), multi = (0, import_react.useRef)(false), startArea = (0, import_react.useRef)(null);
	const frame = (0, import_react.useMemo)(() => {
		const points = [...propertyOutline, ...areas.flatMap((a) => a.outline)];
		const b = points.length ? bounds(points) : {
			x: 0,
			y: 0,
			maxX: 100,
			maxY: 70
		};
		return {
			center: {
				x: (b.x + b.maxX) / 2,
				y: (b.y + b.maxY) / 2
			},
			span: Math.max(1, Math.hypot(b.maxX - b.x, b.maxY - b.y))
		};
	}, [propertyOutline, areas]);
	const metre = sceneUnitsPerMetre(propertyOutline, 1, physicalAreaSqM);
	const scale = 730 / frame.span, project = (p, z = 0) => project360(p, z, camera, frame.center, scale), pts = (points, z = 0) => points.map((p) => {
		const q = project(p, z);
		return `${q.x},${q.y}`;
	}).join(" ");
	const models = (0, import_react.useMemo)(() => areas.flatMap((area) => {
		const anchor = interiorAnchor(area.outline);
		if (!anchor) return [];
		const radius = Math.min(anchor.radius, edgeClearance(anchor.point, propertyOutline));
		if (radius <= 0) return [];
		if (area.cropKind) return [{
			key: area.id,
			area,
			point: anchor.point,
			radius: radius * .6,
			kind: "crop"
		}];
		if (buildings.has(area.use)) return [{
			key: area.id,
			area,
			point: anchor.point,
			radius: radius * .65,
			kind: "building"
		}];
		if ([
			"crop",
			"forest",
			"nursery"
		].includes(area.use) && area.vegetation && area.vegetation !== "low") {
			const r = Math.max(radius * .24, frame.span * .014);
			return interiorSlots(area.outline, r, 18).filter((p) => edgeClearance(p, propertyOutline) >= r).map((point, i) => ({
				key: `${area.id}-${i}`,
				area,
				point,
				radius: r * .82,
				kind: "tree"
			}));
		}
		return [];
	}).slice(0, 180), [
		areas,
		propertyOutline,
		frame.span
	]);
	const outside = (0, import_react.useMemo)(() => areas.filter((a) => outlineExceedsProperty(a.outline, propertyOutline)), [areas, propertyOutline]);
	const reset = () => {
		pointers.current.clear();
		start.current = null;
		setCamera(INITIAL_CAMERA);
	};
	function down(e) {
		if (e.button !== 0 && e.button !== 1) return;
		e.currentTarget.setPointerCapture(e.pointerId);
		pointers.current.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY
		});
		if (pointers.current.size === 1) {
			start.current = {
				x: e.clientX,
				y: e.clientY
			};
			moved.current = false;
			multi.current = false;
			startArea.current = e.target.closest("[data-area-id]")?.getAttribute("data-area-id") ?? null;
		} else {
			multi.current = true;
			moved.current = true;
		}
	}
	function move(e) {
		if (!pointers.current.has(e.pointerId)) return;
		const before = [...pointers.current.values()];
		pointers.current.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY
		});
		if (start.current && Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 5) moved.current = true;
		if (!moved.current) return;
		const after = [...pointers.current.values()], factor = 1e3 / e.currentTarget.getBoundingClientRect().width;
		setCamera((c) => gestureCamera(c, before, after, e.pointerType === "touch" ? "orbit" : e.shiftKey || e.buttons === 4 ? "pan" : mode, factor));
	}
	function up(e, cancel = false) {
		if (!pointers.current.has(e.pointerId)) return;
		pointers.current.delete(e.pointerId);
		if (cancel) moved.current = true;
		if (!cancel && !moved.current && !multi.current) {
			if (startArea.current) setSelectedId(startArea.current);
		}
		if (!pointers.current.size) start.current = null;
	}
	const objects = models.map((m) => ({
		key: m.key,
		depth: project(m.point).depth,
		draw: () => {
			const p = project(m.point), r = m.radius, h = r * (m.kind === "tree" ? 2.8 : 1.15);
			if (m.kind === "crop") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("image", {
				href: `/farm-3d/previews/crop-${m.area.cropKind}.webp`,
				x: p.x - r * scale * camera.zoom,
				y: p.y - r * scale * camera.zoom * 1.6,
				width: r * scale * camera.zoom * 2,
				height: r * scale * camera.zoom * 2
			});
			if (m.kind === "tree") {
				const top = project(m.point, h);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: p.x + r * scale * .3,
						cy: p.y,
						rx: r * scale * camera.zoom,
						ry: r * scale * camera.zoom * .3,
						fill: "#28452d",
						opacity: ".15"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: `M${p.x} ${p.y}L${top.x} ${top.y}`,
						stroke: "#816342",
						strokeWidth: Math.max(1, r * scale * camera.zoom * .18)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: top.x,
						cy: top.y,
						rx: r * scale * camera.zoom,
						ry: r * scale * camera.zoom * .9,
						fill: m.area.vegetation === "coffee" ? "#5a8043" : "#406c42"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: top.x - r * scale * camera.zoom * .3,
						cy: top.y - r * scale * camera.zoom * .28,
						rx: r * scale * camera.zoom * .7,
						ry: r * scale * camera.zoom * .63,
						fill: "#729350"
					})
				] });
			}
			const ground = [
				{
					x: m.point.x - r * .85,
					y: m.point.y - r * .6
				},
				{
					x: m.point.x + r * .85,
					y: m.point.y - r * .6
				},
				{
					x: m.point.x + r * .85,
					y: m.point.y + r * .6
				},
				{
					x: m.point.x - r * .85,
					y: m.point.y + r * .6
				}
			];
			const faces = ground.map((a, i) => {
				const b = ground[(i + 1) % 4];
				return {
					depth: (project(a).depth + project(b).depth) / 2,
					points: [
						project(a),
						project(b),
						project(b, h),
						project(a, h)
					],
					color: [
						"#ded0ac",
						"#c0af8a",
						"#ac9774",
						"#d0c19c"
					][i]
				};
			}).sort((a, b) => a.depth - b.depth);
			const ridge = [{
				x: m.point.x - r * .85,
				y: m.point.y
			}, {
				x: m.point.x + r * .85,
				y: m.point.y
			}];
			const roof = [{
				points: [
					project(ground[0], h),
					project(ground[1], h),
					project(ridge[1], h + r * .55),
					project(ridge[0], h + r * .55)
				],
				depth: project(ground[0]).depth,
				color: "#aa7254"
			}, {
				points: [
					project(ground[3], h),
					project(ground[2], h),
					project(ridge[1], h + r * .55),
					project(ridge[0], h + r * .55)
				],
				depth: project(ground[3]).depth,
				color: "#795644"
			}].sort((a, b) => a.depth - b.depth);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [faces.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
				points: f.points.map((p) => `${p.x},${p.y}`).join(" "),
				fill: m.area.use === "greenhouse" ? "#bad6ca" : f.color,
				stroke: "#655744",
				strokeWidth: ".5"
			}, i)), m.area.use === "tank" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
				points: pts(ground, h),
				fill: "#c7d8d0"
			}) : roof.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
				points: f.points.map((p) => `${p.x},${p.y}`).join(" "),
				fill: m.area.use === "greenhouse" ? "#b5d8c8" : f.color,
				stroke: "#655744",
				strokeWidth: ".6"
			}, i))] });
		}
	}));
	const vegetationObjects = (draft ? [] : visibleBoundaryPlants(areas, propertyOutline, animals, physicalAreaSqM)).map((tree) => {
		const p = project(tree.position), top = project(tree.position, tree.planHeight), r = tree.planRadius * scale * camera.zoom;
		return {
			key: tree.id,
			depth: p.depth,
			draw: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: `M${p.x} ${p.y}L${top.x} ${top.y}`,
				stroke: "#887151",
				strokeWidth: Math.max(1, r * .13)
			}), tree.kind === "palm" ? Array.from({ length: 8 }, (_, i) => {
				const angle = i * Math.PI / 4;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: `M${top.x} ${top.y}Q${top.x + Math.cos(angle) * r * .6} ${top.y + Math.sin(angle) * r * .6 - r * .2} ${top.x + Math.cos(angle) * r} ${top.y + Math.sin(angle) * r * .6}`,
					fill: "none",
					stroke: i % 2 ? "#427b34" : "#77a34a",
					strokeWidth: Math.max(1, r * .2)
				}, i);
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: top.x,
				cy: top.y,
				rx: r,
				ry: r * .8,
				fill: "#43743b"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: top.x - r * .25,
				cy: top.y - r * .2,
				rx: r * .65,
				ry: r * .6,
				fill: "#699348"
			})] })] })
		};
	});
	const animalObjects = animals.map((a) => ({
		key: a.id,
		depth: project(a.position).depth,
		draw: () => {
			const p = project(a.position), size = (a.species ? animalVisualLength[a.species] * metre : frame.span * .015) * scale * camera.zoom;
			return a.src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("image", {
				href: a.src,
				x: p.x - size * a.anchor.u,
				y: p.y - size * a.anchor.v,
				width: size,
				height: size
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				transform: `translate(${p.x},${p.y})`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("title", { children: [
						a.title,
						" · ",
						a.category ?? "Especie sin definir"
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						r: size * .32,
						fill: "#f1eedf",
						stroke: "#52634b"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						textAnchor: "middle",
						dominantBaseline: "central",
						fontSize: size * .24,
						fill: "#29442c",
						children: (a.category ?? "?").slice(0, 2)
					})
				]
			});
		}
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "min-w-0 rounded-3xl border border-[#4c6b3a]/20 bg-[#f7f8f1] p-3 sm:p-5",
		"aria-label": "Masterplan 360 grados",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-4 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-bold uppercase tracking-[.15em] text-[#59754b]",
						children: "Explora tu terreno"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl sm:text-3xl",
						children: "Masterplan 360°"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-[#56644b]",
						children: [
							farmName,
							" · ",
							areas.length,
							" ",
							draft ? "zonas propuestas" : "áreas guardadas"
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: button,
					onClick: onReturn,
					children: "Volver a 2D"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: button,
						"aria-pressed": mode === "orbit",
						onClick: () => setMode("orbit"),
						children: "Girar 360°"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: button,
						"aria-pressed": mode === "pan",
						onClick: () => setMode("pan"),
						children: "Desplazar"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: button,
						onClick: () => setCamera((c) => cameraLimits({
							...c,
							zoom: c.zoom / 1.2
						})),
						"aria-label": "Alejar masterplan",
						disabled: camera.zoom <= .55,
						children: "−"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: button,
						onClick: () => setCamera((c) => cameraLimits({
							...c,
							zoom: c.zoom * 1.2
						})),
						"aria-label": "Acercar masterplan",
						disabled: camera.zoom >= 4,
						children: "+"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: button,
						onClick: () => setCamera((c) => ({
							...c,
							tilt: 90
						})),
						children: "Vista aérea"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: button,
						onClick: reset,
						children: "Ver toda · Restablecer"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative overflow-hidden rounded-2xl border border-[#718465]/25 bg-[#e2e9d6]",
				style: { background: "radial-gradient(ellipse at 50% 45%, #f0f2dc 0%, #d6e0ce 75%)" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					viewBox: "0 0 1000 660",
					className: "block w-full select-none",
					style: {
						touchAction: "none",
						minHeight: 260,
						cursor: mode === "pan" ? "grab" : "move"
					},
					role: "img",
					"aria-label": draft ? "Vista tridimensional del borrador sin aplicar. Usa los controles para explorar." : "Vista tridimensional del plano guardado. Usa los controles o arrastra para girar; dos dedos para girar, desplazar y acercar.",
					onPointerDown: down,
					onPointerMove: move,
					onPointerUp: (e) => up(e),
					onPointerCancel: (e) => up(e, true),
					onLostPointerCapture: (e) => up(e, true),
					onWheel: (e) => {
						if (e.ctrlKey) return;
						setCamera((c) => cameraLimits({
							...c,
							zoom: c.zoom * Math.exp(-e.deltaY * .001)
						}));
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("title", { children: ["Masterplan interactivo de ", farmName] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("desc", { children: "Volúmenes y vegetación ilustrativos, sin alturas medidas. No es fotogrametría ni imagen satelital. Las áreas se consultan también en la lista inferior." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
							points: pts(propertyOutline, -frame.span * .013),
							fill: "#b0bc94",
							stroke: "#9da87f",
							strokeWidth: "2"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
							points: pts(propertyOutline),
							fill: "#75a14c",
							stroke: "#f9f3ce",
							strokeWidth: "3"
						}),
						areas.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
							"data-area-id": a.id,
							points: pts(a.outline),
							fill: a.structureKind === "fence" ? "none" : tones[a.use],
							stroke: a.id === selectedId ? "#fff5b5" : "#f4ecd0",
							strokeWidth: a.id === selectedId ? 3 : 1.5,
							style: { cursor: "pointer" }
						}, a.id)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
							pointerEvents: "none",
							children: areas.filter((a) => a.structureKind === "fence" || a.fenced || ["pasture", "corral"].includes(a.use)).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
								points: pts(a.outline, metre),
								fill: "none",
								stroke: "#82795f",
								strokeWidth: ".9"
							}), fencePostPoints(a.outline, 4 * metre, 160).map((point, index) => {
								const bottom = project(point), top = project(point, 1.5 * metre);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
									d: `M${bottom.x} ${bottom.y}L${top.x} ${top.y}`,
									stroke: "#806e4c",
									strokeWidth: "1.3"
								}, index);
							})] }, `fence-${a.id}`))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
							pointerEvents: "none",
							children: areas.filter((a) => a.waterTrough).map((a) => {
								const t = a.waterTrough, p = t.position;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
									points: pts([
										{
											x: p.x - t.planWidth / 2,
											y: p.y - t.planHeight / 2
										},
										{
											x: p.x + t.planWidth / 2,
											y: p.y - t.planHeight / 2
										},
										{
											x: p.x + t.planWidth / 2,
											y: p.y + t.planHeight / 2
										},
										{
											x: p.x - t.planWidth / 2,
											y: p.y + t.planHeight / 2
										}
									], t.heightM * metre),
									fill: "#428f9b",
									stroke: "#d9ded2",
									strokeWidth: "1"
								}, a.id + "-trough");
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
							pointerEvents: "none",
							children: [
								...objects,
								...vegetationObjects,
								...animalObjects
							].sort((a, b) => a.depth - b.depth).map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: o.draw() }, o.key))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
							points: pts(propertyOutline),
							fill: "none",
							stroke: "#fff9d7",
							strokeWidth: "2",
							pointerEvents: "none"
						}),
						labels && areas.slice(0, 30).map((a, i) => {
							const anchor = interiorAnchor(a.outline);
							if (!anchor) return null;
							const p = project(anchor.point);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
								"data-area-id": a.id,
								style: { cursor: "pointer" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									cx: p.x,
									cy: p.y,
									r: "15",
									fill: a.id === selectedId ? "#274e37" : "#fffbec",
									stroke: "#6d8059"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
									x: p.x,
									y: p.y + 4,
									textAnchor: "middle",
									fontSize: "12",
									fontWeight: "700",
									fill: a.id === selectedId ? "white" : "#29442c",
									children: i + 1
								})]
							}, a.id);
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-[#29442c]",
					children: [
						"Vista 3D ilustrativa · ",
						Math.round(camera.zoom * 100),
						"%"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-6 text-[#52634b]",
				children: "Un dedo o ratón para girar. Con dos dedos gira como un volante, desplaza y haz zoom. En ratón, usa Desplazar o Mayús + arrastrar."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "mt-3 rounded-xl border border-[#476442]/20 bg-white p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "min-h-11 cursor-pointer py-3 font-semibold",
						children: "Controles de vista y precisión"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-sm font-semibold",
							children: [
								"Giro · ",
								Math.round(cameraLimits(camera).yaw),
								"°",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "mt-2 block min-h-11 w-full",
									type: "range",
									min: "0",
									max: "360",
									value: cameraLimits(camera).yaw,
									onChange: (e) => setCamera((c) => ({
										...c,
										yaw: Number(e.target.value)
									}))
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-sm font-semibold",
							children: [
								"Inclinación · ",
								Math.round(camera.tilt),
								"°",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "mt-2 block min-h-11 w-full",
									type: "range",
									min: "2",
									max: "90",
									value: camera.tilt,
									onChange: (e) => setCamera((c) => ({
										...c,
										tilt: Number(e.target.value)
									}))
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-3 flex min-h-11 items-center gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: labels,
							onChange: (e) => setLabels(e.target.checked)
						}), "Mostrar números de las áreas"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm leading-6",
						children: [
							surveyBased ? "El contorno procede de las coordenadas registradas." : "El contorno procede del croquis orientativo.",
							" ",
							draft ? "Las posiciones corresponden solo a este borrador sin aplicar;" : "Las posiciones de las áreas son las del plano guardado;",
							" los edificios, alturas y árboles son ilustrativos. No representan un inventario de cada árbol ni un levantamiento topográfico 3D. La referencia satelital se consulta por separado en Ubicación y mapas: no se superpone sobre un croquis sin georreferenciación verificada."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs leading-5",
						children: "Esta vista no modifica tus registros. Funciona sin WebGL y, con la aplicación preparada, sin conexión."
					})
				]
			}),
			outside.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "status",
				className: "mt-3 rounded-xl bg-[#fff3cf] p-3 text-sm",
				children: [outside.length, " área(s) fuera del contorno. Revisa su posición en el plano técnico; aquí se conservan sus formas."]
			}),
			selectedId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"aria-label": "Detalle del recinto",
				className: "mt-4 rounded-2xl border bg-white p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-semibold",
							children: areas.find((a) => a.id === selectedId)?.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: button,
							onClick: () => setSelectedId(void 0),
							children: "Cerrar"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: button + " mt-3",
						onClick: () => onSelect(selectedId),
						children: "Abrir ficha del área"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs",
						children: "Animales vinculados por su registro. La vista ligera conserva el acceso a sus expedientes."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex max-h-52 flex-wrap gap-2 overflow-y-auto",
						"aria-label": "Animales del recinto",
						children: (animalRecords ?? animals.map((a) => ({
							id: a.id,
							title: a.title,
							category: a.category ?? "",
							areaId: a.areaId
						}))).filter((a) => a.areaId === selectedId).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: button + " max-w-full text-left",
							disabled: !onOpenAnimal,
							onClick: () => onOpenAnimal?.(a.id),
							children: [
								a.title,
								" · ",
								a.category,
								animals.some((p) => p.id === a.id) ? "" : " · sin posición"
							]
						}, a.id))
					}),
					!(animalRecords ?? animals).some((a) => a.areaId === selectedId) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm",
						children: "No hay animales vinculados a este recinto."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				"aria-label": "Áreas del masterplan",
				children: areas.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: button + " max-w-full text-left",
					"aria-pressed": a.id === selectedId,
					onClick: () => setSelectedId(a.id),
					children: [
						i + 1,
						". ",
						a.title
					]
				}, a.id))
			}),
			!areas.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm",
				children: "Todavía no hay áreas guardadas. Vuelve a 2D para añadirlas."
			})
		]
	});
}
//#endregion
//#region components/farm-masterplan-scene.tsx
var WebGLScene = (0, import_react.lazy)(() => import("./farm-masterplan-webgl-DA0OgueF.js"));
var SceneBoundary = class extends import_react.Component {
	constructor(..._args) {
		super(..._args);
		this.state = { failed: false };
	}
	static getDerivedStateFromError() {
		return { failed: true };
	}
	render() {
		return this.state.failed ? this.props.fallback : this.props.children;
	}
};
function FarmMasterplanScene(props) {
	const [unavailable, setUnavailable] = (0, import_react.useState)(false);
	const fallback = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		role: "status",
		className: "mb-3 rounded-xl bg-[#fff4d6] p-3 text-sm",
		children: "Vista ligera activada. Este navegador no pudo iniciar el motor 3D; puedes seguir explorando en 2D."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmMasterplanScene$1, { ...props })] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [!props.readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmAssetPack, { className: "mb-4" }), unavailable ? fallback : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SceneBoundary, {
		fallback,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "status",
				className: "rounded-2xl bg-[#e5ebdc] p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Preparando recorrido 3D…" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-3 min-h-11 rounded-full border bg-white px-4",
					onClick: props.onReturn,
					children: "Abrir plano 2D"
				})]
			}),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WebGLScene, {
				...props,
				onUnavailable: () => setUnavailable(true)
			})
		})
	})] });
}
//#endregion
export { FarmMasterplanScene as default };
