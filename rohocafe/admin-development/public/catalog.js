// Catalog source of truth. Prices are pre-existing reference prices, never live offers.
(() => {
const data = globalThis.ROHO_PUBLISHED_CATALOG || {products:{},harvests:{},categories:[],facets:[],texts:{}};
const { products, harvests, categories, facets, texts } = data;
const normalize = (value) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
function filterProducts(state = {}) {
  const query = normalize(state.q).trim();
  const result = Object.values(products).filter((product) => {
    if (product.publicationStatus !== "published") return false;
    if (state.category && product.categoryId !== state.category) return false;
    if (!facets.every(({ key }) => !state[key] || product[key] === state[key])) return false;
    const searchable = normalize([product.name, product.detail, product.category, product.description, ...facets.map(({ key }) => product[key]), ...product.includes].join(" "));
    return query.split(/\s+/).every((word) => searchable.includes(word));
  });
  if (state.sort === "price-asc") result.sort((a, b) => a.price - b.price);
  if (state.sort === "price-desc") result.sort((a, b) => b.price - a.price);
  if (state.sort === "name") result.sort((a, b) => a.name.localeCompare(b.name, "es"));
  return result;
}
function facetValues(key) {
  return [...new Set(Object.values(products).filter((p) => p.publicationStatus === "published").map((p) => p[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
}
globalThis.RohoCatalog = { schemaVersion: 1, products, harvests, categories, facets, texts, filterProducts, facetValues };
})();
