import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { t as createLucideIcon } from "./createLucideIcon-OtKWZ-kp.js";
import { t as OfflineDownloadSize } from "./offline-download-size-Kf0EnICD.js";
//#region lib/offline-readiness.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var updateMessage = "Hay una versión nueva preparada o en descarga. Mantén internet; cuando termine, cierra todas las pestañas de VenezuelaAgro y vuelve a abrir para comprobarla.";
async function waitForActivation(worker) {
	if (worker.state === "activated") return true;
	if (worker.state === "redundant") return false;
	return new Promise((resolve) => {
		const finish = (ready) => {
			clearTimeout(timer);
			worker.removeEventListener("statechange", changed);
			resolve(ready);
		};
		const changed = () => {
			if (worker.state === "activated") finish(true);
			else if (worker.state === "redundant") finish(false);
		};
		const timer = setTimeout(() => finish(false), 3e4);
		worker.addEventListener("statechange", changed);
		changed();
	});
}
/** Public resources only; a readiness check never identifies or sends a workspace. */
async function checkOfflineReadiness(prepare = false, onProgress) {
	if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return {
		ready: false,
		error: "Este navegador no permite preparar la app sin conexión."
	};
	let expectedVersion;
	if (navigator.onLine) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), 5e3);
		try {
			const response = await fetch("/offline-assets.json", {
				cache: "no-store",
				signal: controller.signal
			});
			if (!response.ok) throw new Error();
			expectedVersion = (await response.json()).revision;
			if (!expectedVersion) throw new Error();
		} catch {
			return {
				ready: false,
				error: "No se pudo verificar la versión actual. Mantén la conexión y vuelve a comprobar."
			};
		} finally {
			clearTimeout(timer);
		}
	}
	let registration = await navigator.serviceWorker.getRegistration();
	if (!registration && prepare && navigator.onLine) registration = await navigator.serviceWorker.register("/sw.js");
	const worker = navigator.serviceWorker.controller ?? registration?.active ?? registration?.installing ?? registration?.waiting;
	if (!worker) return {
		ready: false,
		error: "La preparación inicial sigue pendiente. Mantén internet y pulsa preparar para reintentar."
	};
	const status = await new Promise((resolve) => {
		const channel = new MessageChannel();
		let settled = false;
		let timer;
		const finish = (status) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			channel.port1.close();
			resolve(status.ready && expectedVersion && status.version !== expectedVersion ? {
				ready: false,
				error: updateMessage
			} : status);
		};
		const arm = () => {
			clearTimeout(timer);
			timer = setTimeout(() => finish({
				ready: false,
				error: "La preparación dejó de responder. Conserva internet y vuelve a intentar; no borres tus datos."
			}), prepare ? 24e4 : 3e4);
		};
		channel.port1.onmessage = (event) => {
			const reply = event.data;
			if (reply?.type === "OFFLINE_PROGRESS" && typeof reply.status?.ready === "boolean") {
				arm();
				onProgress?.({
					...reply.status,
					ready: false
				});
			} else if (typeof reply?.ready === "boolean") finish(reply);
		};
		arm();
		try {
			worker.postMessage({ type: prepare ? "PREPARE_OFFLINE" : "OFFLINE_STATUS" }, [channel.port2]);
		} catch {
			finish({
				ready: false,
				error: "No se pudo comprobar la preparación. Recarga con internet e inténtalo de nuevo."
			});
		}
	});
	if (status.ready && !await waitForActivation(worker)) return {
		ready: false,
		error: updateMessage
	};
	return status;
}
//#endregion
//#region components/offline-preparation.tsx
var import_jsx_runtime = require_jsx_runtime();
/** Shareable public app preparation. No record storage, account selection or synchronization. */
function OfflinePreparation({ onReady }) {
	const [status, setStatus] = (0, import_react.useState)({ ready: false });
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [checking, setChecking] = (0, import_react.useState)(true);
	const current = (0, import_react.useRef)(0);
	const mounted = (0, import_react.useRef)(false);
	const running = (0, import_react.useRef)(false);
	const update = (0, import_react.useCallback)((next) => {
		setStatus(next);
		onReady?.(next.ready);
	}, [onReady]);
	const check = (0, import_react.useCallback)(async (prepare = false) => {
		if (running.current) return;
		running.current = true;
		const sequence = ++current.current;
		if (mounted.current) {
			setBusy(prepare);
			setChecking(!prepare);
		}
		try {
			const result = await checkOfflineReadiness(prepare, (next) => {
				if (mounted.current && sequence === current.current) update(next);
			});
			if (mounted.current && sequence === current.current) update(result);
		} catch {
			if (mounted.current && sequence === current.current) update({
				ready: false,
				error: "No se pudo preparar el dispositivo. Conecta y vuelve a intentar."
			});
		} finally {
			if (sequence === current.current) {
				running.current = false;
				if (mounted.current) {
					setBusy(false);
					setChecking(false);
				}
			}
		}
	}, [update]);
	(0, import_react.useEffect)(() => {
		mounted.current = true;
		const sequence = current;
		check();
		const refresh = () => {
			check();
		};
		const visible = () => {
			if (document.visibilityState === "visible") refresh();
		};
		navigator.serviceWorker?.addEventListener("controllerchange", refresh);
		document.addEventListener("visibilitychange", visible);
		return () => {
			mounted.current = false;
			running.current = false;
			++sequence.current;
			navigator.serviceWorker?.removeEventListener("controllerchange", refresh);
			document.removeEventListener("visibilitychange", visible);
		};
	}, [check]);
	const progress = status.total ? Math.floor(100 * (status.completed ?? 0) / status.total) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"aria-label": "Preparación del código sin conexión",
		"aria-busy": busy || checking,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-bold text-[#365026]",
				role: "status",
				"aria-live": "polite",
				children: checking ? "Comprobando la preparación de este dispositivo…" : busy ? status.phase === "verifying" ? "Verificando la descarga…" : "Preparando los recursos de la app…" : status.ready ? "Mi Finca y la finca modelo preparadas sin señal en este navegador" : "Comprueba la preparación antes de salir sin señal"
			}),
			busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("progress", {
				"aria-label": "Recursos de la aplicación preparados",
				className: "mt-2 h-2 w-full accent-[#4c6b3a]",
				value: status.total ? progress : void 0,
				max: 100
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs tabular-nums",
				children: status.total ? `${status.completed ?? 0} de ${status.total} recursos preparados` : "Leyendo el manifiesto de recursos…"
			})] }),
			status.ready && status.version && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 break-words text-xs text-[#71685f]",
				children: [
					"Versión ",
					status.version.replace("morochos-v", ""),
					" verificada"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfflineDownloadSize, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-[#71685f]",
				children: "Primero prepara lo necesario para abrir Mi Finca y llevar tus registros. La primera descarga requiere internet y debe terminar. Guarda las herramientas de Mi Finca y la finca modelo. Por ahora, la descarga básica también incluye las herramientas del plano 3D y el mapa nacional de referencia. Los modelos y texturas se preparan con «Descargar paquete 3D». No descarga el catálogo de Mercado ni la Comunidad de otras personas. Tus registros y publicaciones propias sincronizadas se guardan aparte, por cuenta; su tamaño depende de tus datos. La biblioteca de referencias es opcional y comparte parte del código básico. El navegador puede borrar la copia si falta espacio."
			}),
			status.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-[#8d372a]",
				role: "status",
				children: status.error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: busy || checking,
				onClick: () => void check(true),
				className: "mt-3 min-h-11 rounded-full bg-[#4c6b3a] px-4 py-3 text-sm font-bold text-white disabled:opacity-50",
				children: checking ? "Comprobando…" : busy ? "Preparando…" : status.error ? "Reintentar / comprobar sin señal" : "Preparar / comprobar sin señal"
			})
		]
	});
}
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Map = createLucideIcon("map", [
	["path", {
		d: "M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",
		key: "169xi5"
	}],
	["path", {
		d: "M15 5.764v15",
		key: "1pn4in"
	}],
	["path", {
		d: "M9 3.236v15",
		key: "1uimfh"
	}]
]);
//#endregion
export { OfflinePreparation as n, Map as t };
