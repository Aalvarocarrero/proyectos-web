import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { S as validateNormalizedSketchPolygon, p as inside } from "./farm-plan-catalog-7z5TuNyx.js";
import { h as readLocalZone } from "./farm-demo-navigation-DvOc9b68.js";
import FarmMasterplanScene from "./farm-masterplan-scene-DZlYBgPR.js";
//#region lib/aerial-color-proposals.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/** RGB heuristics only: no model, species identification, height or confidence percentages. */
function colorKind(r, g, b) {
	if (g > 45 && g > r * 1.12 && g > b * 1.06 && g - r > 12) return "green";
	if (b > 50 && b > r * 1.22 && g > r * 1.08 && Math.max(b, g) - r > 18) return "blue";
	return null;
}
function colorProposals(data, width, height, boundary) {
	if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 160 || height > 160 || data.length !== width * height * 4 || boundary.length < 3) return [];
	const kinds = new Int8Array(width * height), seen = new Uint8Array(width * height);
	for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
		const i = y * width + x;
		if (data[i * 4 + 3] < 200 || !inside({
			x: (x + .5) / width * 100,
			y: (y + .5) / height * 100
		}, boundary)) continue;
		const k = colorKind(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
		kinds[i] = k === "green" ? 1 : k === "blue" ? 2 : 0;
	}
	const result = [];
	for (let seed = 0; seed < kinds.length; seed++) {
		if (!kinds[seed] || seen[seed]) continue;
		const queue = [seed], cells = [];
		seen[seed] = 1;
		for (let j = 0; j < queue.length; j++) {
			const i = queue[j], x = i % width, y = Math.floor(i / width);
			cells.push(i);
			for (const next of [
				x > 0 ? i - 1 : -1,
				x < width - 1 ? i + 1 : -1,
				y > 0 ? i - width : -1,
				y < height - 1 ? i + width : -1
			]) if (next >= 0 && !seen[next] && kinds[next] === kinds[seed]) {
				seen[next] = 1;
				queue.push(next);
			}
		}
		if (cells.length < Math.max(10, width * height * .0025)) continue;
		const xs = cells.map((i) => i % width), ys = cells.map((i) => Math.floor(i / width)), x0 = Math.min(...xs) / width * 100, y0 = Math.min(...ys) / height * 100, x1 = (Math.max(...xs) + 1) / width * 100, y1 = (Math.max(...ys) + 1) / height * 100;
		result.push({
			id: `color-${seed}`,
			kind: kinds[seed] === 1 ? "green" : "blue",
			pixels: cells.length,
			outline: [
				{
					x: x0,
					y: y0
				},
				{
					x: x1,
					y: y0
				},
				{
					x: x1,
					y: y1
				},
				{
					x: x0,
					y: y1
				}
			],
			mask: cells.map((i) => `M${i % width / width * 100},${Math.floor(i / width) / height * 100}h${100 / width}v${100 / height}h${-100 / width}z`).join("")
		});
	}
	return result.sort((a, b) => b.pixels - a.pixels).slice(0, 20);
}
function indicativeScale(a, b, meters, width, height) {
	const pixels = Math.hypot((a.x - b.x) * width / 100, (a.y - b.y) * height / 100);
	return Number.isFinite(meters) && meters > 0 && pixels >= 10 ? meters / pixels : null;
}
//#endregion
//#region components/farm-aerial-proposal.tsx
var import_jsx_runtime = require_jsx_runtime();
var button = "min-h-11 rounded-full border border-[#476442]/30 bg-white px-4 py-2 text-sm font-semibold text-[#29442c] disabled:opacity-40";
function FarmAerialProposal({ owner, farmId, onReturn }) {
	const [source, setSource] = (0, import_react.useState)(null), [boundary, setBoundary] = (0, import_react.useState)([]), [line, setLine] = (0, import_react.useState)([]), [meters, setMeters] = (0, import_react.useState)(""), [mode, setMode] = (0, import_react.useState)("boundary"), [reviews, setReviews] = (0, import_react.useState)([]), [message, setMessage] = (0, import_react.useState)(""), [busy, setBusy] = (0, import_react.useState)(false), [preview, setPreview] = (0, import_react.useState)(false);
	const canvas = (0, import_react.useRef)(null), serial = (0, import_react.useRef)(0), url = (0, import_react.useRef)(null), mounted = (0, import_react.useRef)(true), tap = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
			serial.current++;
			if (url.current) URL.revokeObjectURL(url.current);
		};
	}, []);
	async function load(blob, label, attribution) {
		const n = ++serial.current;
		setBusy(true);
		setMessage("");
		try {
			if (![
				"image/png",
				"image/jpeg",
				"image/webp"
			].includes(blob.type) || blob.size > 12 * 1024 * 1024) throw new Error("Usa JPG, PNG o WebP de hasta 12 MB.");
			const bitmap = await createImageBitmap(blob);
			try {
				if (bitmap.width * bitmap.height > 24e6) throw new Error("Reduce la imagen a un máximo de 24 megapíxeles.");
				if (!mounted.current || n !== serial.current) return;
				const c = document.createElement("canvas"), ratio = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
				c.width = Math.round(bitmap.width * ratio);
				c.height = Math.round(bitmap.height * ratio);
				const ctx = c.getContext("2d");
				if (!ctx) throw new Error("Este navegador no pudo preparar la imagen.");
				ctx.drawImage(bitmap, 0, 0, c.width, c.height);
				const clean = await new Promise((resolve, reject) => c.toBlob((b) => b ? resolve(b) : reject(/* @__PURE__ */ new Error("No se pudo preparar la imagen.")), "image/png"));
				if (!mounted.current || n !== serial.current) return;
				const next = URL.createObjectURL(clean);
				if (url.current) URL.revokeObjectURL(url.current);
				url.current = next;
				canvas.current = c;
				setSource({
					url: next,
					width: c.width,
					height: c.height,
					label,
					attribution
				});
				setBoundary([]);
				setLine([]);
				setMeters("");
				setReviews([]);
				setPreview(false);
				setMode("boundary");
			} finally {
				bitmap.close();
			}
		} catch (error) {
			if (mounted.current && n === serial.current) setMessage(error instanceof Error ? error.message : "No se pudo abrir la imagen.");
		} finally {
			if (mounted.current && n === serial.current) setBusy(false);
		}
	}
	async function localSatellite() {
		if (!owner) return;
		const n = ++serial.current;
		setBusy(true);
		setMessage("");
		try {
			const zone = await readLocalZone(owner, farmId);
			if (!mounted.current || n !== serial.current) return;
			if (!zone) {
				setMessage("Primero guarda una imagen de tu zona en Ubicación y mapas. También puedes abrir una imagen propia aquí.");
				return;
			}
			await load(zone.blob, "Satélite guardado · " + zone.scene.acquiredAt.slice(0, 10), "Contains modified Copernicus Sentinel data " + new Date(zone.scene.acquiredAt).getUTCFullYear() + " · resolución original 10 m");
		} catch {
			if (mounted.current && n === serial.current) setMessage("No se pudo leer la imagen guardada. Tus registros se conservan.");
		} finally {
			if (mounted.current && n === serial.current) setBusy(false);
		}
	}
	function analyze() {
		if (!canvas.current || boundary.length < 3) return;
		const valid = validateNormalizedSketchPolygon({
			version: 1,
			coordinateSpace: "normalized-100",
			vertices: boundary.map((p, i) => ({
				...p,
				id: String(i)
			}))
		});
		if (!valid.ok) {
			setMessage(valid.error);
			return;
		}
		const small = document.createElement("canvas"), ratio = 128 / Math.max(canvas.current.width, canvas.current.height);
		small.width = Math.max(1, Math.round(canvas.current.width * ratio));
		small.height = Math.max(1, Math.round(canvas.current.height * ratio));
		const ctx = small.getContext("2d", { willReadFrequently: true });
		if (!ctx) {
			setMessage("No se pudo analizar esta imagen en el navegador.");
			return;
		}
		ctx.drawImage(canvas.current, 0, 0, small.width, small.height);
		const candidates = colorProposals(ctx.getImageData(0, 0, small.width, small.height).data, small.width, small.height, boundary);
		setReviews(candidates.map((candidate, i) => ({
			candidate,
			accepted: false,
			title: (candidate.kind === "green" ? "Posible vegetación" : "Posible agua o sombra") + " " + (i + 1)
		})));
		setMessage(candidates.length ? `${candidates.length} sugerencias por color. Revisa cada una antes de incluirla en el borrador.` : "No se encontraron zonas amplias con estos criterios de color. Esto no significa que no existan.");
		setPreview(false);
	}
	const scale = source && line.length === 2 ? indicativeScale(line[0], line[1], Number(meters), source.width, source.height) : null;
	const accepted = reviews.filter((r) => r.accepted), previewAreas = accepted.map((r) => ({
		id: r.candidate.id,
		title: r.title,
		outline: r.candidate.outline.map((p) => ({
			x: p.x,
			y: p.y * (source ? source.height / source.width : 1)
		})),
		use: r.candidate.kind === "green" ? "forest" : "water"
	}));
	function download() {
		const data = {
			format: "aerial-review-draft-v1",
			notice: "Borrador orientativo. Coordenadas porcentuales normalized-100. No georreferenciado. No importado al plano real. Envolventes rectangulares; revisar límites. Alturas desconocidas. No contiene animales.",
			source: source?.label,
			attribution: source?.attribution ?? null,
			boundary,
			indicativeMetersPerPixel: scale,
			imagePixels: source ? {
				width: source.width,
				height: source.height
			} : null,
			candidates: accepted.map((r) => ({
				title: r.title,
				kind: r.candidate.kind,
				outline: r.candidate.outline,
				heightMeters: null,
				reviewedByUser: true
			}))
		};
		const object = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })), a = document.createElement("a");
		a.href = object;
		a.download = "borrador-revisado-de-imagen.json";
		a.click();
		setTimeout(() => URL.revokeObjectURL(object), 1e3);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "min-w-0 rounded-3xl border border-[#4c6b3a]/20 bg-[#f7f8f1] p-4 sm:p-6",
		"aria-label": "Borrador local desde imagen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-bold uppercase tracking-widest text-[#59754b]",
					children: "Asistente de revisión · experimental"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Base desde una imagen"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: button,
					onClick: onReturn,
					children: "Volver al plano"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-6",
				children: "Trabaja con una imagen propia o el satélite ya guardado. El análisis ocurre en este navegador y no envía la imagen a un servicio externo. Este borrador no se guarda ni reemplaza tu plano."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "my-4 flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: button + " cursor-pointer",
					children: ["Abrir imagen propia", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						accept: "image/png,image/jpeg,image/webp",
						className: "mt-2 block max-w-full text-sm",
						disabled: busy,
						onChange: (e) => {
							const file = e.target.files?.[0];
							if (file) load(file, "Imagen propia");
							e.target.value = "";
						}
					})]
				}), owner && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: button,
					disabled: busy,
					onClick: () => void localSatellite(),
					children: "Usar satélite guardado"
				})]
			}),
			busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				children: "Preparando imagen local…"
			}),
			message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "my-3 rounded-xl bg-[#ecedd9] p-3 text-sm",
				children: message
			}),
			source && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-3 text-sm",
					children: [source.label, source.attribution && " · " + source.attribution]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: button,
							"aria-pressed": mode === "boundary",
							onClick: () => setMode("boundary"),
							children: "1. Marcar contorno"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: button,
							onClick: () => {
								setBoundary((b) => b.slice(0, -1));
								setReviews([]);
								setPreview(false);
							},
							children: "Deshacer punto"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: button,
							onClick: () => {
								setBoundary([]);
								setReviews([]);
								setPreview(false);
							},
							children: "Limpiar contorno"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: button,
							"aria-pressed": mode === "scale",
							onClick: () => {
								setMode("scale");
								setLine([]);
							},
							children: "2. Marcar distancia"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-sm",
					children: mode === "boundary" ? `Toca los vértices del terreno en orden. ${boundary.length} puntos; mínimo 3. Evita cruzar los lados.` : "Toca dos extremos de una distancia conocida. La escala es orientativa: una foto inclinada puede deformar las medidas."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					viewBox: `0 0 ${source.width} ${source.height}`,
					className: "block w-full rounded-xl border bg-white",
					style: { touchAction: "pan-y" },
					role: "img",
					"aria-label": "Imagen para trazar contorno y revisar sugerencias de color",
					onPointerDown: (e) => {
						tap.current = {
							x: e.clientX,
							y: e.clientY
						};
					},
					onPointerCancel: () => {
						tap.current = null;
					},
					onPointerUp: (e) => {
						const start = tap.current;
						tap.current = null;
						if (!start || Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) return;
						const ctm = e.currentTarget.getScreenCTM();
						if (!ctm) return;
						const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse()), point = {
							x: Math.max(0, Math.min(100, p.x / source.width * 100)),
							y: Math.max(0, Math.min(100, p.y / source.height * 100))
						};
						if (mode === "boundary") {
							setBoundary((b) => b.length < 32 ? [...b, point] : b);
							setReviews([]);
							setPreview(false);
						} else setLine((v) => v.length >= 2 ? [point] : [...v, point]);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("image", {
						href: source.url,
						width: source.width,
						height: source.height
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						transform: `scale(${source.width / 100} ${source.height / 100})`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
								points: boundary.map((p) => `${p.x},${p.y}`).join(" "),
								fill: "#fff6c3",
								fillOpacity: ".08",
								stroke: "#fff5a0",
								strokeWidth: ".5"
							}),
							reviews.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: r.candidate.mask,
								fill: r.candidate.kind === "green" ? "#b4e56d" : "#8be1f1",
								fillOpacity: r.accepted ? .7 : .35,
								pointerEvents: "none"
							}, r.candidate.id)),
							boundary.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: p.x,
								cy: p.y,
								r: ".9",
								fill: "#fff5a0"
							}, i)),
							line.length === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: line[0].x,
								y1: line[0].y,
								x2: line[1].x,
								y2: line[1].y,
								stroke: "#ffb366",
								strokeWidth: ".6"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
					className: "mt-3 rounded-xl border bg-white p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
							className: "min-h-11 cursor-pointer py-2 text-sm font-semibold",
							children: "Introducir puntos sin tocar la imagen"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs",
							children: "Coordenadas porcentuales de izquierda a derecha y de arriba abajo (0 a 100)."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-3 flex flex-wrap gap-2",
							onSubmit: (e) => {
								e.preventDefault();
								const f = new FormData(e.currentTarget), p = {
									x: Number(f.get("x")),
									y: Number(f.get("y"))
								};
								if (mode === "boundary") {
									setBoundary((b) => b.length < 32 ? [...b, p] : b);
									setReviews([]);
								} else setLine((v) => v.length >= 2 ? [p] : [...v, p]);
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "text-sm",
									children: ["X (%)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										name: "x",
										type: "number",
										min: "0",
										max: "100",
										step: ".1",
										required: true,
										className: "block min-h-11 w-24 rounded border px-2"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "text-sm",
									children: ["Y (%)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										name: "y",
										type: "number",
										min: "0",
										max: "100",
										step: ".1",
										required: true,
										className: "block min-h-11 w-24 rounded border px-2"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: button,
									type: "submit",
									children: "Añadir punto"
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-4 block text-sm font-semibold",
					children: ["Distancia marcada en metros (opcional)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "number",
						min: ".01",
						step: "any",
						value: meters,
						onChange: (e) => setMeters(e.target.value),
						className: "mt-2 block min-h-11 w-full rounded-xl border bg-white px-3",
						placeholder: "Ej.: 100"
					})]
				}),
				scale && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs",
					children: [
						"Escala orientativa: ",
						scale.toFixed(3),
						" m por píxel de esta copia. No acredita resolución, georreferenciación ni precisión topográfica."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: button + " mt-4",
					disabled: boundary.length < 3 || busy,
					onClick: analyze,
					children: "3. Sugerir zonas por color"
				}),
				!!reviews.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-3",
					children: reviews.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border bg-white p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex min-h-11 items-center gap-3 text-sm font-semibold",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: r.accepted,
										onChange: (e) => setReviews((rows) => rows.map((row) => row.candidate.id === r.candidate.id ? {
											...row,
											accepted: e.target.checked
										} : row))
									}),
									"Incluir zona ",
									i + 1,
									" en el borrador"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block text-sm",
								children: ["Nombre a revisar", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "mt-1 block min-h-11 w-full rounded border px-3",
									maxLength: 100,
									value: r.title,
									onChange: (e) => setReviews((rows) => rows.map((row) => row.candidate.id === r.candidate.id ? {
										...row,
										title: e.target.value
									} : row))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs",
								children: [r.candidate.kind === "green" ? "Tonos verdes compatibles con vegetación; también puede haber otros materiales." : "Tonos azulados: podría ser agua, sombra, cubierta u otro material.", " Comprobación visual pendiente; no hay porcentaje de certeza."]
							})
						]
					}, r.candidate.id))
				}),
				!!reviews.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: button,
						disabled: !accepted.length,
						onClick: () => setPreview(!preview),
						children: [
							"Ver borrador 360° · ",
							accepted.length,
							" zonas"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: button,
						disabled: !accepted.length,
						onClick: download,
						children: "Descargar borrador revisado"
					})]
				}),
				preview && !!accepted.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 rounded-xl bg-[#fff1d2] p-3 text-sm",
						children: "Vista separada del borrador. Cada zona se representa por un rectángulo envolvente, no por un lindero detectado. Puede incluir huecos u otras coberturas; revisa sus límites. No contiene animales ni alturas inferidas."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmMasterplanScene, {
						draft: true,
						propertyOutline: boundary.map((p) => ({
							x: p.x,
							y: p.y * (source.height / source.width)
						})),
						areas: previewAreas,
						animals: [],
						farmName: "Borrador desde imagen · sin aplicar",
						surveyBased: false,
						onSelect: (id) => setMessage("Zona seleccionada: " + (reviews.find((r) => r.candidate.id === id)?.title ?? "")),
						onReturn: () => setPreview(false)
					})]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 text-xs leading-6 text-[#52634b]",
				children: "Sugerencias por color, no reconocimiento con IA. Una imagen RGB no permite identificar con fiabilidad árboles individuales, especies, malezas, huecos, profundidad o alturas. Las dimensiones por sí solas no ubican la imagen. Para unirla al plano real hacen falta puntos de referencia o una ortofoto georreferenciada y revisar la correspondencia."
			})
		]
	});
}
//#endregion
export { FarmAerialProposal as default };
