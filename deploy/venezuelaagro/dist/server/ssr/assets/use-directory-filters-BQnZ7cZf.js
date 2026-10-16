import { E as __toESM, b as require_react } from "../index.js";
import { r as updateDirectoryFilters, t as readDirectoryFilters } from "./directory-filters-C0npapi5.js";
//#region hooks/use-directory-filters.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var changed = "agro-directory-filters";
function subscribe(notify) {
	window.addEventListener("popstate", notify);
	window.addEventListener(changed, notify);
	return () => {
		window.removeEventListener("popstate", notify);
		window.removeEventListener(changed, notify);
	};
}
var snapshot = () => window.location.search;
/** Replace, rather than push, while typing: Back returns to the previous page. */
function useDirectoryFilters(defaults, serverSearch = "") {
	const search = (0, import_react.useSyncExternalStore)(subscribe, snapshot, () => serverSearch);
	const filters = readDirectoryFilters(search, defaults);
	(0, import_react.useEffect)(() => {
		try {
			const url = new URL(window.location.href);
			url.searchParams.delete("ejemplo");
			sessionStorage.setItem(`agro-directory-return:${url.pathname}`, `${url.pathname}${url.search}`);
		} catch {}
	}, [search]);
	function changeFilters(changes) {
		const next = updateDirectoryFilters(window.location.href, defaults, changes);
		window.history.replaceState(window.history.state, "", next);
		window.dispatchEvent(new Event(changed));
	}
	return [filters, changeFilters];
}
//#endregion
export { useDirectoryFilters as t };
