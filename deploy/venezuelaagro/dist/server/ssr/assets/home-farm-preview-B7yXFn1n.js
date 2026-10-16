import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
//#region lib/home-farm-poster.json
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var home_farm_poster_default = {
	src: "/previews/finca-modelo-plan-ab2acb14cfee.svg",
	bytes: 11647
};
//#endregion
//#region lib/home-farm-preview.ts
/** Shared policy keeps downloads and playback independent: hide/pause never remounts the scene. */
function shouldLoadHomeFarmPreview(state) {
	return !state.loaded && !state.failed && state.pageVisible && (state.visible || state.requested) && (!state.constrained || state.requested);
}
function stopHomeFarmPreview(state) {
	return state.paused || !state.visible || !state.pageVisible || state.constrained && !state.requested;
}
/** Unknown browser preferences and ordinary loading never expose the 2D alternative. */
function homeFarmPreviewMode(state) {
	if (state.failed || state.chosen2D || state.preferencesKnown && state.constrained && !state.requested) return "2d";
	return state.ready ? "3d" : "loading";
}
//#endregion
//#region components/home-farm-preview.tsx
var import_jsx_runtime = require_jsx_runtime();
var Scene = (0, import_react.lazy)(() => import("./home-farm-scene-DdXtTljY.js"));
var PreviewBoundary = class extends import_react.Component {
	constructor(..._args) {
		super(..._args);
		this.state = { failed: false };
	}
	static getDerivedStateFromError() {
		return { failed: true };
	}
	componentDidCatch() {
		this.props.onUnavailable();
	}
	render() {
		return this.state.failed ? null : this.props.children;
	}
};
/** Stable, lightweight shell. The 2D poster is an alternative, never a 3D loading placeholder. */
function HomeFarmPreview() {
	const host = (0, import_react.useRef)(null);
	const [preferencesKnown, setPreferencesKnown] = (0, import_react.useState)(false), [chosen2D, setChosen2D] = (0, import_react.useState)(false);
	const [visible, setVisible] = (0, import_react.useState)(false), [pageVisible, setPageVisible] = (0, import_react.useState)(true);
	const [reducedMotion, setReducedMotion] = (0, import_react.useState)(false), [constrained, setConstrained] = (0, import_react.useState)(true), [requested, setRequested] = (0, import_react.useState)(false);
	const [loaded, setLoaded] = (0, import_react.useState)(false), [ready, setReady] = (0, import_react.useState)(false), [failed, setFailed] = (0, import_react.useState)(false), [paused, setPaused] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const media = window.matchMedia("(prefers-reduced-motion: reduce)");
		const connection = navigator.connection;
		const update = () => {
			setPreferencesKnown(true);
			setReducedMotion(media.matches);
			setConstrained(media.matches || Boolean(connection?.saveData) || [
				"slow-2g",
				"2g",
				"3g"
			].includes(connection?.effectiveType ?? ""));
		};
		const visibility = () => setPageVisible(document.visibilityState === "visible");
		update();
		visibility();
		media.addEventListener("change", update);
		connection?.addEventListener("change", update);
		document.addEventListener("visibilitychange", visibility);
		const element = host.current;
		const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver((entries) => setVisible(entries[0].isIntersecting), { threshold: .15 });
		if (element) observer?.observe(element);
		const visibilityFrame = observer ? 0 : requestAnimationFrame(() => setVisible(true));
		return () => {
			cancelAnimationFrame(visibilityFrame);
			observer?.disconnect();
			media.removeEventListener("change", update);
			connection?.removeEventListener("change", update);
			document.removeEventListener("visibilitychange", visibility);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!shouldLoadHomeFarmPreview({
			loaded,
			failed,
			pageVisible,
			visible,
			requested,
			constrained: constrained || chosen2D
		})) return;
		const timer = window.setTimeout(() => setLoaded(true), requested ? 0 : 800);
		return () => window.clearTimeout(timer);
	}, [
		visible,
		pageVisible,
		constrained,
		requested,
		loaded,
		failed,
		chosen2D
	]);
	(0, import_react.useEffect)(() => {
		if (!loaded || ready || failed || !pageVisible || !visible) return;
		const timer = window.setTimeout(() => setFailed(true), 2e4);
		return () => window.clearTimeout(timer);
	}, [
		loaded,
		ready,
		failed,
		pageVisible,
		visible
	]);
	const unavailable = (0, import_react.useCallback)(() => setFailed(true), []), didRender = (0, import_react.useCallback)(() => setReady(true), []);
	const mode = homeFarmPreviewMode({
		preferencesKnown,
		chosen2D,
		constrained,
		requested,
		ready,
		failed
	});
	const stopped = !ready || mode === "2d" || reducedMotion || stopHomeFarmPreview({
		paused,
		visible,
		pageVisible,
		constrained,
		requested
	});
	const start = () => {
		setChosen2D(false);
		setRequested(true);
		setPaused(false);
		if (typeof IntersectionObserver === "undefined") setVisible(true);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: host,
		className: "min-w-0",
		"data-home-farm-preview": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative aspect-[8/5] overflow-hidden rounded-[1.5rem] border border-white/20 bg-[#e4e9d7] shadow-2xl",
				children: [
					mode === "2d" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: home_farm_poster_default.src,
						alt: "Plano ilustrativo de Finca Horizonte: distribución de las áreas y animales de la finca ficticia de 10 hectáreas.",
						width: 800,
						height: 500,
						loading: "lazy",
						decoding: "async",
						className: "absolute inset-0 h-full w-full object-cover"
					}),
					mode === "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 flex items-center justify-center bg-[#e4e9d7] p-6 pb-20 text-center text-sm text-[#365026]",
						"aria-hidden": "true",
						children: "Preparando vista 3D…"
					}),
					loaded && !failed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `pointer-events-none absolute inset-0 ${mode === "3d" ? "" : "invisible"}`,
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewBoundary, {
							onUnavailable: unavailable,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
								fallback: null,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scene, {
									paused: stopped,
									onReady: didRender,
									onUnavailable: unavailable
								})
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-[#203e2d]/95 px-3 py-2 text-xs font-semibold text-white",
							children: mode === "2d" ? "Finca modelo · 10 ha · plano 2D" : "Finca modelo · 10 ha · 3D"
						}), !failed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: mode === "loading" || mode === "3d" && reducedMotion,
							onClick: mode === "3d" && !paused ? () => setPaused(true) : start,
							"aria-pressed": mode === "3d" ? !stopped : void 0,
							className: "min-h-11 rounded-full border border-[#365026]/20 bg-white px-4 py-2 text-xs font-bold text-[#29442c] shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
							children: mode === "loading" ? "Preparando 3D…" : mode === "2d" ? "Ver vista 3D" : reducedMotion ? "Vista sin movimiento" : paused ? "Reanudar giro" : "Pausar giro"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 min-h-10 text-xs leading-5 text-[#d3ddca]",
				role: "status",
				children: failed ? "Vista ligera 2D: no se pudo preparar el recorrido 3D en este navegador o conexión." : mode === "loading" ? "Preparando la vista 3D. Puedes seguir explorando la página." : mode === "2d" ? chosen2D ? "Plano ilustrativo 2D seleccionado." : reducedMotion ? "Vista 2D para respetar tu preferencia de movimiento reducido. Puedes abrir el 3D sin giro." : "Vista ligera 2D para ahorrar datos en tu conexión. Puedes abrir el 3D si lo deseas." : reducedMotion ? "Vista 3D fija para respetar tu preferencia de movimiento reducido." : "Vista de ejemplo. El giro se detiene al salir de esta sección o pestaña."
			}),
			failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "/finca-modelo",
				className: "inline-flex min-h-11 items-center text-xs text-white underline underline-offset-4",
				children: "Explorar finca modelo"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: mode === "2d" ? start : () => {
					setChosen2D(true);
					setRequested(false);
				},
				className: "min-h-11 text-left text-xs text-white underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
				children: mode === "2d" ? "Abrir vista 3D" : "También disponible en 2D"
			})
		]
	});
}
//#endregion
export { HomeFarmPreview };
