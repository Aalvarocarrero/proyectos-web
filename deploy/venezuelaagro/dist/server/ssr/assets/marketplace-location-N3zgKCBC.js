import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { i as DialogDescription, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-BB9AB3vt.js";
import { d as NATIONAL_MAP_PACK, g as fetchMapPack, l as MAP_PACK, n as SATELLITE_SAMPLE, s as packCoversBounds, v as MAP_PLACE_LABEL_STYLE, y as readableMapLabelRules } from "./leaflet-B4kmrmRF.js";
//#region lib/public-map-context.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/** Share verified, same-origin public cartography between the inline map and its dialog.
* Memory only: this does not read private workspaces or promise offline persistence. */
var pending = /* @__PURE__ */ new Map();
function publicMapContext(pack) {
	const prior = pending.get(pack.id);
	if (prior) return prior;
	const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 18e4);
	const request = fetchMapPack(controller.signal, () => {}, pack).catch((error) => {
		pending.delete(pack.id);
		throw error;
	}).finally(() => clearTimeout(timer));
	pending.set(pack.id, request);
	return request;
}
//#endregion
//#region lib/marketplace-map-view.ts
/** Frame only the advertiser's actual coordinates, at the available map detail. */
function declaredPointView(point) {
	if (!point) return {
		center: [7, -66],
		zoom: 5
	};
	const detail = packCoversBounds(MAP_PACK, [
		point.longitude,
		point.latitude,
		point.longitude,
		point.latitude
	]);
	return {
		center: [point.latitude, point.longitude],
		zoom: detail ? MAP_PACK.maxZoom : NATIONAL_MAP_PACK.maxZoom
	};
}
//#endregion
//#region components/marketplace-location.tsx
var import_jsx_runtime = require_jsx_runtime();
function LocationCanvas({ point, onSelect, expanded = false }) {
	const element = (0, import_react.useRef)(null), map = (0, import_react.useRef)(null), select = (0, import_react.useRef)(onSelect), initialPoint = (0, import_react.useRef)(point);
	const [epoch, setEpoch] = (0, import_react.useState)(0), [message, setMessage] = (0, import_react.useState)("Cargando mapa de Venezuela…"), [mode, setMode] = (0, import_react.useState)("point"), [imageStatus, setImageStatus] = (0, import_react.useState)(""), [sample, setSample] = (0, import_react.useState)(false), [satelliteRequest, setSatelliteRequest] = (0, import_react.useState)(0);
	const satelliteAvailable = !!point && packCoversBounds(SATELLITE_SAMPLE, [
		point.longitude,
		point.latitude,
		point.longitude,
		point.latitude
	]);
	const focusPoint = () => {
		const view = declaredPointView(point);
		map.current?.setView(view.center, view.zoom, { animate: false });
	};
	const choosePoint = () => {
		setSample(false);
		setMode("point");
		focusPoint();
	};
	const chooseStreets = () => {
		setSample(false);
		setMode("map");
		focusPoint();
	};
	const chooseSatellite = () => {
		setSatelliteRequest((v) => v + 1);
		setSample(false);
		setImageStatus("Cargando imagen satelital histórica…");
		setMode("satellite");
		focusPoint();
	};
	(0, import_react.useEffect)(() => {
		select.current = onSelect;
	}, [onSelect]);
	(0, import_react.useEffect)(() => {
		let disposed = false;
		let resize;
		const controller = new AbortController();
		(async () => {
			try {
				const L = await import("./leaflet-src-CPpGQ6xW.js").then((m) => /* @__PURE__ */ __toESM(m.default, 1));
				if (disposed || !element.current) return;
				const p = initialPoint.current, view = declaredPointView(p), m = L.map(element.current, {
					scrollWheelZoom: false,
					minZoom: 3,
					maxZoom: 18
				}).setView(view.center, view.zoom);
				map.current = m;
				for (const [name, z] of [
					["market-base", 300],
					["market-satellite", 350],
					["market-boundaries", 370],
					["market-labels", 380]
				]) {
					m.createPane(name).style.zIndex = String(z);
					if (name !== "market-boundaries") m.getPane(name).style.pointerEvents = "none";
				}
				m.on("click", (e) => select.current?.(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5))));
				resize = new ResizeObserver(() => {
					if (!disposed) m.invalidateSize({ pan: false });
				});
				resize.observe(element.current);
				m.attributionControl.addAttribution("geoBoundaries / OCHA / INE · CC BY 3.0 IGO");
				setEpoch((v) => v + 1);
				fetch("/venezuela-states.geojson", { signal: controller.signal }).then((r) => {
					if (!r.ok) throw new Error();
					return r.json();
				}).then((geo) => {
					if (disposed) return;
					L.geoJSON(geo, {
						pane: "market-boundaries",
						style: {
							color: "#70825a",
							weight: 1.2,
							fillColor: "#dde8c8",
							fillOpacity: .08
						},
						onEachFeature: (f, layer) => {
							if (typeof f.properties?.name === "string") {
								const text = document.createElement("span");
								text.textContent = f.properties.name;
								layer.bindTooltip(text, {
									permanent: false,
									direction: "auto",
									className: "market-state-label"
								});
								layer.on("add", () => {
									const path = layer.getElement();
									path?.setAttribute("tabindex", "0");
									path?.setAttribute("aria-label", text.textContent ?? "Referencia territorial");
									path?.addEventListener("focus", () => layer.openTooltip());
									path?.addEventListener("blur", () => layer.closeTooltip());
								});
							}
						}
					}).addTo(m);
				}).catch(() => {
					if (!disposed) setMessage("No se pudo cargar el contorno estatal. La referencia declarada se conserva.");
				});
				try {
					const [blob, { leafletLayer, CenteredTextSymbolizer }, { PMTiles, FileSource }] = await Promise.all([
						publicMapContext(NATIONAL_MAP_PACK),
						import("./esm-DpsLY8Wc.js"),
						import("./dist-D6jSFrrm.js")
					]);
					if (disposed) return;
					const addPack = (data, pack) => {
						const [w, s, e, n] = pack.bounds;
						const options = {
							url: new PMTiles(new FileSource(new File([data], pack.id + ".pmtiles"))),
							bounds: L.latLngBounds([[s, w], [n, e]]),
							noWrap: true,
							maxDataZoom: pack.maxZoom,
							attribution: "© OpenStreetMap · Protomaps · ODbL",
							lang: "es"
						};
						const base = leafletLayer({
							...options,
							flavor: "light",
							pane: "market-base"
						}), labels = leafletLayer({
							...options,
							paintRules: [],
							labelRules: readableMapLabelRules(base.labelRules, () => new CenteredTextSymbolizer(MAP_PLACE_LABEL_STYLE)),
							pane: "market-labels"
						});
						base.labelRules = [];
						base.clearLayout();
						base.addTo(m);
						labels.addTo(m);
					};
					addPack(blob, NATIONAL_MAP_PACK);
					setMessage("Ciudades, nombres y vías principales del mapa nacional. El detalle termina en nivel 10; ampliar no añade calles ausentes.");
					if (p && packCoversBounds(MAP_PACK, [
						p.longitude,
						p.latitude,
						p.longitude,
						p.latitude
					])) try {
						const detail = await publicMapContext(MAP_PACK);
						if (!disposed) {
							addPack(detail, MAP_PACK);
							setMessage("Detalle de caminos y nombres hasta nivel 14 solo en la zona piloto de los Llanos; fuera de ella, contexto nacional hasta nivel 10.");
						}
					} catch {}
				} catch {
					if (!disposed) setMessage("Calles y nombres no disponibles en esta visita. Se conserva el contorno estatal si pudo cargar y el punto declarado. Reabre el mapa con conexión.");
				}
			} catch {
				if (!disposed) setMessage("No pudimos cargar el mapa. Las coordenadas declaradas siguen disponibles debajo.");
			}
		})();
		return () => {
			disposed = true;
			resize?.disconnect();
			controller.abort();
			map.current?.remove();
			map.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		let disposed = false;
		let clear;
		import("./leaflet-src-CPpGQ6xW.js").then((m) => /* @__PURE__ */ __toESM(m.default, 1)).then((L) => {
			const m = map.current;
			if (disposed || !m || !point) return;
			const label = document.createElement("span");
			label.textContent = point.label;
			const marker = L.circleMarker([point.latitude, point.longitude], {
				radius: 10,
				color: "#fff",
				weight: 3,
				fillColor: "#c9512c",
				fillOpacity: 1
			}).addTo(m).bindTooltip(label);
			clear = () => marker.remove();
		});
		return () => {
			disposed = true;
			clear?.();
		};
	}, [point, epoch]);
	(0, import_react.useEffect)(() => {
		if (mode !== "satellite" || !satelliteAvailable && !sample) return;
		let disposed = false;
		let raster;
		import("./leaflet-src-CPpGQ6xW.js").then((m) => /* @__PURE__ */ __toESM(m.default, 1)).then((L) => {
			const m = map.current;
			if (disposed || !m) return;
			const [w, s, e, n] = SATELLITE_SAMPLE.bounds;
			raster = L.imageOverlay(SATELLITE_SAMPLE.path, [[s, w], [n, e]], {
				pane: "market-satellite",
				alt: "Imagen histórica Sentinel de la zona pública de los Llanos",
				attribution: SATELLITE_SAMPLE.attribution
			});
			raster.on("load", () => {
				if (!disposed) setImageStatus("Imagen histórica del 21 de enero de 2026 · 10 m de resolución. Solo cubre el rectángulo de muestra.");
			});
			raster.on("error", () => {
				if (!disposed) setImageStatus("No se pudo cargar la imagen satelital. El mapa de calles permanece disponible.");
			});
			raster.addTo(m);
			if (sample) m.fitBounds([[s, w], [n, e]], {
				padding: [12, 12],
				animate: false
			});
			else if (point) m.setView([point.latitude, point.longitude], 14, { animate: false });
		});
		return () => {
			disposed = true;
			raster?.remove();
		};
	}, [
		mode,
		satelliteAvailable,
		sample,
		satelliteRequest,
		epoch,
		point
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: element,
			className: `relative z-0 w-full rounded-xl bg-[#e7eddf] ${expanded ? "h-[65dvh] min-h-80" : "h-96 sm:h-[28rem]"}`,
			role: "region",
			"aria-label": "Mapa desplazable de la ubicación pública"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex flex-wrap gap-2",
			role: "group",
			"aria-label": "Tipo de mapa del producto",
			children: [
				point && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: mode === "point" ? "button-dark" : "button-light",
					"aria-pressed": mode === "point",
					onClick: choosePoint,
					children: "Ver punto declarado"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: mode === "map" ? "button-dark" : "button-light",
					"aria-pressed": mode === "map",
					onClick: chooseStreets,
					children: "Calles"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: mode === "satellite" ? "button-dark" : "button-light",
					"aria-pressed": mode === "satellite",
					onClick: chooseSatellite,
					children: "Satélite"
				})
			]
		}),
		mode === "satellite" && !satelliteAvailable && !sample && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-3 rounded-xl border bg-[#f3ebdd] p-4 text-sm",
			"aria-label": "Cobertura satelital",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "status",
				children: [point ? "No hay imagen satelital alojada para este punto. Se conserva el punto declarado sobre el mapa." : "No hay un punto declarado para comprobar su cobertura satelital.", " La imagen disponible solo cubre una zona de muestra de unos 11 × 11 km en los Llanos."]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "button-light",
					onClick: () => {
						setImageStatus("Cargando imagen satelital histórica…");
						setSample(true);
					},
					children: "Ver muestra satelital de los Llanos"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "button-light",
					onClick: point ? choosePoint : chooseStreets,
					children: point ? "Volver al punto declarado" : "Volver al mapa"
				})]
			})]
		}),
		sample && mode === "satellite" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 rounded-xl bg-[#f3ebdd] p-3 text-sm font-semibold",
			children: "Zona pública de muestra. No representa la ubicación de este producto. Usa «Ver punto declarado» para regresar."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "status",
			className: "mt-2 text-xs leading-5",
			children: mode === "satellite" && (satelliteAvailable || sample) ? imageStatus : message
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-xs",
			children: [onSelect ? "Toca el mapa para colocar el punto público. " : "El punto lo declara el anunciante. ", "No es navegación vial. Cartografía de OpenStreetMap/Protomaps, 7 de octubre de 2026. Esta vista no garantiza disponibilidad sin conexión."]
		}),
		point && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-xs",
			children: [
				point.latitude.toFixed(5),
				", ",
				point.longitude.toFixed(5),
				" · ",
				point.precision === "approximate" ? "Ubicación aproximada" : "Punto exacto declarado"
			]
		})
	] });
}
function MarketplaceLocation({ point, location, demo = false, state, municipality, parish }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6 rounded-2xl border bg-white p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-lg font-semibold",
				children: "Ubicación del producto"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "my-3 text-sm leading-6",
				children: location
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "mb-3 grid gap-2 text-sm sm:grid-cols-3",
				children: [
					["Estado", state],
					["Municipio", municipality],
					["Parroquia", parish]
				].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "font-semibold",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: value || "No declarado" })] }, label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-xs",
				children: "Referencias declaradas; no se deducen del punto ni certifican límites administrativos."
			}),
			point ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationCanvas, { point }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setOpen(true),
				className: "button-light mt-3",
				children: "Abrir mapa más grande"
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl bg-[#f3ebdd] p-4 text-sm leading-6",
				children: "El anunciante no ha indicado un punto público. Consulta la zona y acuerda la visita antes de desplazarte."
			}),
			demo && point && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs font-semibold text-[#8c4d25]",
				children: "Punto ficticio para probar el mapa. No identifica una finca ni un producto disponible."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[94dvh] overflow-y-auto bg-[#f8f3ea] sm:max-w-5xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Ubicación · ", location] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: demo ? "Punto ficticio de demostración." : "Solo se muestra el punto que el anunciante eligió hacer público." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationCanvas, {
							point,
							expanded: true
						})
					]
				})
			})
		]
	});
}
//#endregion
export { MarketplaceLocation as n, LocationCanvas as t };
