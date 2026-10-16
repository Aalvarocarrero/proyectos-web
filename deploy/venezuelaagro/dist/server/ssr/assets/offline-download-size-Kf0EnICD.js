import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
//#region lib/farm-asset-pack.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var operations = /* @__PURE__ */ new Set();
var cancelled = () => ({
	ready: false,
	phase: "cancelled",
	error: "Descarga cancelada. La copia anterior se conserva."
});
async function message(prepare, onProgress, signal) {
	if (signal?.aborted) return cancelled();
	if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return {
		ready: false,
		phase: "error",
		error: "Este navegador no permite descargar el paquete sin conexión."
	};
	const registration = await navigator.serviceWorker.getRegistration();
	const worker = navigator.serviceWorker.controller ?? registration?.active;
	if (signal?.aborted) return cancelled();
	if (!worker) return {
		ready: false,
		phase: "error",
		error: "La aplicación se está preparando. Espera con internet y vuelve a intentar."
	};
	return new Promise((resolve) => {
		const channel = new MessageChannel();
		const requestId = globalThis.crypto.randomUUID();
		let settled = false;
		let timer;
		const finish = (status) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			signal?.removeEventListener("abort", cancel);
			channel.port1.close();
			if (status.diagnostic) console.warn("Paquete 3D: diagnóstico de descarga", status.diagnostic);
			resolve(status);
		};
		const stop = () => {
			try {
				if (prepare) worker.postMessage({
					type: "CANCEL_FARM_ASSETS",
					requestId
				});
			} catch {}
		};
		const cancel = () => {
			stop();
			finish(cancelled());
		};
		const armTimeout = () => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				stop();
				finish({
					ready: false,
					phase: "error",
					diagnostic: { code: "worker_timeout" },
					error: prepare ? "La descarga dejó de responder. Espera a que se actualice la aplicación, recarga y vuelve a intentar." : "El almacenamiento local no respondió. Puede seguir activa una versión anterior. Mantén internet, recarga y vuelve a comprobar."
				});
			}, prepare ? 24e4 : 3e4);
		};
		channel.port1.onmessage = (event) => {
			const reply = event.data;
			if (!reply || !["FARM_ASSETS_PROGRESS", "FARM_ASSETS_RESULT"].includes(reply.type) || typeof reply.status?.ready !== "boolean") return;
			if (reply.type === "FARM_ASSETS_PROGRESS") {
				armTimeout();
				onProgress?.(reply.status);
			} else finish(reply.status);
		};
		signal?.addEventListener("abort", cancel, { once: true });
		if (signal?.aborted) {
			cancel();
			return;
		}
		armTimeout();
		try {
			worker.postMessage({
				type: prepare ? "PREPARE_FARM_ASSETS" : "FARM_ASSETS_STATUS",
				requestId
			}, [channel.port2]);
		} catch {
			finish({
				ready: false,
				phase: "error",
				error: "No se pudo hablar con el almacenamiento local. Recarga y vuelve a comprobar."
			});
		}
	});
}
/** Checks hashes, file completeness, licenses and app shell locally, including when offline. */
async function getFarmAssetPackStatus() {
	try {
		return await message(false);
	} catch {
		return {
			ready: false,
			phase: "error",
			error: "No se pudo comprobar el almacenamiento local."
		};
	}
}
/** Call only after an explicit download / retry click. */
async function downloadFarmAssetPack(onProgress, signal) {
	const controller = new AbortController();
	const cancel = () => controller.abort();
	operations.add(controller);
	signal?.addEventListener("abort", cancel, { once: true });
	if (signal?.aborted) cancel();
	try {
		return await message(true, onProgress, controller.signal);
	} catch {
		return {
			ready: false,
			phase: "error",
			error: "No se pudo iniciar la descarga. Conecta y vuelve a intentar."
		};
	} finally {
		operations.delete(controller);
		signal?.removeEventListener("abort", cancel);
	}
}
function formatFarmPackBytes(bytes = 0) {
	return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}
//#endregion
//#region components/offline-download-size.tsx
var import_jsx_runtime = require_jsx_runtime();
/** Reads only a small manifest. Never starts or promises a package download. */
function OfflineDownloadSize({ pack = "core" }) {
	const [bytes, setBytes] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 6e3);
		fetch(pack === "core" ? "/offline-assets.json" : "/farm-3d/manifest.json", {
			cache: "no-store",
			signal: controller.signal
		}).then((response) => {
			if (!response.ok) throw new Error();
			return response.json();
		}).then((value) => {
			if (!value || typeof value !== "object") return;
			const manifest = value;
			const size = pack === "core" ? manifest.download?.knownBytes : manifest.totalBytes;
			if (typeof size === "number" && Number.isSafeInteger(size) && size > 0 && size < 1e8) setBytes(size);
		}).catch(() => void 0).finally(() => clearTimeout(timer));
		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [pack]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 text-xs leading-5 text-[#675f57]",
		children: bytes !== null ? `${pack === "core" ? "Archivos base" : "Modelos y texturas"}: ${formatFarmPackBytes(bytes)}${pack === "core" ? " sin comprimir, más las páginas de la app." : " sin comprimir, más un pequeño archivo de licencias."} La descarga real varía por compresión y archivos ya guardados.` : "Tamaño de descarga sin confirmar. Conecta para consultarlo antes de usar tus datos móviles."
	});
}
//#endregion
export { getFarmAssetPackStatus as i, downloadFarmAssetPack as n, formatFarmPackBytes as r, OfflineDownloadSize as t };
