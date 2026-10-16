import { E as __toESM, b as require_react } from "../index.js";
//#region lib/demo-presentation.ts
/** Limit only fictional samples after normal filtering. Real and founder rows always remain. */
function visibleDemoRows(rows, expanded = false) {
	if (expanded) return [...rows];
	let sampleShown = false;
	return rows.filter((row) => {
		if (!row.demo) return true;
		if (sampleShown) return false;
		sampleShown = true;
		return true;
	});
}
//#endregion
//#region hooks/use-offline-snapshot.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function subscribeConnection(callback) {
	window.addEventListener("online", callback);
	window.addEventListener("offline", callback);
	return () => {
		window.removeEventListener("online", callback);
		window.removeEventListener("offline", callback);
	};
}
/** Public feeds are online-only. Only built-in, explicitly labelled demos remain offline. */
function publicFeedRows(rows, online) {
	return online ? rows : rows.filter((row) => row.demo === true);
}
/** No localStorage or IndexedDB feed snapshot is read, written, or deleted. */
function usePublicConnection() {
	return (0, import_react.useSyncExternalStore)(subscribeConnection, () => navigator.onLine, () => true);
}
//#endregion
export { usePublicConnection as n, visibleDemoRows as r, publicFeedRows as t };
