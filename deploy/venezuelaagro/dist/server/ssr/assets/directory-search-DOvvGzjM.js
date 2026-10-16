//#region lib/directory-search.ts
/** Public search accepts the way people type on a phone, with or without accents. */
function normalizeDirectorySearch(value) {
	return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
}
function matchesDirectorySearch(values, query) {
	const search = normalizeDirectorySearch(query);
	return !search || normalizeDirectorySearch(values.filter((value) => value != null).join(" ")).includes(search);
}
//#endregion
export { matchesDirectorySearch as t };
