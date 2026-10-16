import { E as __toESM, b as require_react, l as usePathname } from "../index.js";
//#region components/offline-worker-registration.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/** Public app resources only. Never mounts account selection or synchronization. */
function OfflineWorkerRegistration() {
	const path = usePathname();
	const isLearning = path === "/juego-finca" || path.startsWith("/juego-finca/");
	(0, import_react.useEffect)(() => {
		if (!isLearning) navigator.serviceWorker?.register("/sw.js").catch(() => void 0);
	}, [isLearning]);
	return null;
}
//#endregion
export { OfflineWorkerRegistration };
