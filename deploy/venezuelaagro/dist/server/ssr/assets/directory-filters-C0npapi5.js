//#region lib/directory-filters.ts
/** Only public search filters belong in the URL. Preserve unrelated route parameters. */
function readDirectoryFilters(search, defaults) {
	const params = new URLSearchParams(search);
	return Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [key, params.get(key) ?? fallback]));
}
function updateDirectoryFilters(href, defaults, changes) {
	const url = new URL(href);
	for (const [key, value] of Object.entries(changes)) {
		if (!(key in defaults) || value === void 0) continue;
		if (value === defaults[key] || !value) url.searchParams.delete(key);
		else url.searchParams.set(key, value);
	}
	return `${url.pathname}${url.search}${url.hash}`;
}
/** Never turn a stored browsing preference into an external or unrelated destination. */
function safeDirectoryReturn(value, path) {
	if (!value) return path;
	try {
		const url = new URL(value, "https://directory.invalid");
		return url.origin === "https://directory.invalid" && url.pathname === path ? `${url.pathname}${url.search}` : path;
	} catch {
		return path;
	}
}
//#endregion
export { safeDirectoryReturn as n, updateDirectoryFilters as r, readDirectoryFilters as t };
