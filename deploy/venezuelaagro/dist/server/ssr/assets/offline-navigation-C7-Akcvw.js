import { E as __toESM, b as require_react } from "../index.js";
//#region lib/offline-library-routes.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var OFFLINE_LIBRARY_ROOTS = [
	"/stickers",
	"/marketplace",
	"/profesionales",
	"/fincas",
	"/red",
	"/proyectos",
	"/aprende",
	"/rubros",
	"/tienda",
	"/plataforma",
	"/nosotros",
	"/guia-institucional",
	"/legal",
	"/creditos-fotograficos",
	"/biblioteca-local"
];
function isOfflineLibraryPath(path) {
	return path === "/" || OFFLINE_LIBRARY_ROOTS.some((root) => path === root || path.startsWith(root + "/"));
}
//#endregion
//#region lib/offline-document-navigation.ts
/** Same-document links belong to their own handler/browser (including Leaflet href="#"). */
function shouldUseOfflineDocumentNavigation(current, target) {
	if (target.origin !== current.origin) return false;
	if (target.pathname === current.pathname && target.search === current.search) return false;
	return isOfflineLibraryPath(target.pathname) || [
		"/app",
		"/app-local",
		"/finca-demo",
		"/finca-modelo"
	].includes(target.pathname);
}
//#endregion
//#region components/offline-navigation.tsx
/** Document navigation keeps offline fallback reliable even when navigator.onLine incorrectly remains true. Never cache RSC/private API responses. */
function OfflineNavigation() {
	(0, import_react.useEffect)(() => {
		const navigate = (event) => {
			if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
			const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
			if (!(target instanceof HTMLAnchorElement) || target.target === "_blank" || target.hasAttribute("download")) return;
			const url = new URL(target.href, location.href);
			if (!shouldUseOfflineDocumentNavigation(new URL(location.href), url)) return;
			event.preventDefault();
			event.stopPropagation();
			location.assign(url.href);
		};
		document.addEventListener("click", navigate, true);
		return () => document.removeEventListener("click", navigate, true);
	}, []);
	return null;
}
//#endregion
export { OfflineNavigation };
