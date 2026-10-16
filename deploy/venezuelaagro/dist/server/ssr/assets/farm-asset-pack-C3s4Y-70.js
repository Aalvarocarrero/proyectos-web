import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { i as getFarmAssetPackStatus, n as downloadFarmAssetPack, r as formatFarmPackBytes, t as OfflineDownloadSize } from "./offline-download-size-Kf0EnICD.js";
//#region components/farm-asset-pack.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
/** Small enough for the phone's plan controls; download is always an explicit action. */
function FarmAssetPack({ className = "" }) {
	const [status, setStatus] = (0, import_react.useState)({
		ready: false,
		phase: "checking"
	});
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [checking, setChecking] = (0, import_react.useState)(false);
	const abort = (0, import_react.useRef)(null);
	const mounted = (0, import_react.useRef)(false);
	const generation = (0, import_react.useRef)(0);
	const descriptionId = (0, import_react.useId)();
	const check = (0, import_react.useCallback)(async () => {
		if (abort.current) return;
		const current = ++generation.current;
		if (mounted.current) setChecking(true);
		const result = await getFarmAssetPackStatus();
		if (mounted.current && generation.current === current && !abort.current) {
			setStatus(result);
			setChecking(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		mounted.current = true;
		const sequence = generation;
		check();
		const visible = () => {
			if (document.visibilityState === "visible") check();
		};
		document.addEventListener("visibilitychange", visible);
		navigator.serviceWorker?.addEventListener("controllerchange", check);
		return () => {
			mounted.current = false;
			++sequence.current;
			abort.current?.abort();
			document.removeEventListener("visibilitychange", visible);
			navigator.serviceWorker?.removeEventListener("controllerchange", check);
		};
	}, [check]);
	async function download() {
		if (abort.current) return;
		const controller = new AbortController();
		const current = ++generation.current;
		abort.current = controller;
		setChecking(false);
		setBusy(true);
		setStatus({
			ready: false,
			phase: "checking"
		});
		const result = await downloadFarmAssetPack((next) => {
			if (mounted.current && generation.current === current) setStatus(next);
		}, controller.signal);
		if (abort.current === controller) abort.current = null;
		if (mounted.current && generation.current === current) {
			setStatus(result);
			setBusy(false);
		}
	}
	const total = status.totalFiles ?? 0;
	const completed = status.completedFiles ?? 0;
	const progress = status.totalBytes ? Math.min(100, Math.floor(100 * (status.completedBytes ?? 0) / status.totalBytes)) : 0;
	const label = busy ? status.phase === "verifying" ? "Verificando archivos y licencias…" : status.phase === "checking" ? "Comprobando la versión…" : "Descargando modelos 3D…" : checking ? "Comprobando la copia local…" : status.ready ? "Paquete 3D listo sin conexión" : "Modelos 3D sin conexión";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: `rounded-2xl border border-[#4c6b3a]/20 bg-white/95 p-3 text-xs text-[#365026] ${className}`,
		"aria-label": "Paquete local de modelos 3D",
		"aria-describedby": descriptionId,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-bold",
				role: "status",
				"aria-live": "polite",
				children: label
			}),
			total > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 tabular-nums",
				children: [
					completed,
					" de ",
					total,
					" archivos verificados · ",
					formatFarmPackBytes(status.completedBytes),
					" / ",
					formatFarmPackBytes(status.totalBytes)
				]
			}),
			busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("progress", {
				"aria-label": "Modelos 3D descargados y verificados",
				className: "mt-2 h-2 w-full accent-[#4c6b3a]",
				value: progress,
				max: 100
			}),
			status.ready && status.version && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 break-words text-[11px]",
				children: [
					"Versión ",
					status.version.slice(0, 12),
					" · licencias guardadas"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfflineDownloadSize, { pack: "3d" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				id: descriptionId,
				className: "mt-2 leading-relaxed text-[#71685f]",
				children: "Opcional: descarga los modelos y texturas si vas a usar la vista 3D sin señal. Puedes llevar tus registros sin descargar este paquete. Abrir el plano por primera vez no descarga todo el paquete. El navegador puede borrar esta copia si falta espacio."
			}),
			status.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 leading-relaxed text-[#8d372a]",
				role: "status",
				children: status.error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => abort.current?.abort(),
					className: "min-h-11 rounded-full border px-4 py-2 font-bold",
					children: "Cancelar descarga"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => void download(),
					className: "min-h-11 rounded-full bg-[#4c6b3a] px-4 py-2 font-bold text-white",
					children: status.ready ? "Actualizar paquete" : status.phase === "error" || status.phase === "cancelled" ? "Reintentar descarga" : "Descargar paquete 3D"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: checking,
					onClick: () => void check(),
					className: "min-h-11 rounded-full border px-3 py-2 font-bold disabled:opacity-50",
					children: "Comprobar copia"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					className: "inline-flex min-h-11 items-center px-2 py-2 underline",
					href: "/farm-3d/manifest.json",
					target: "_blank",
					rel: "noreferrer",
					children: "Fuentes y licencias"
				})]
			})
		]
	});
}
//#endregion
export { FarmAssetPack as t };
