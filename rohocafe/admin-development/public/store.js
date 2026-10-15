(() => {
  "use strict";
  const catalog = globalThis.RohoCatalog;
  const store = document.getElementById("tienda");
  const form = document.getElementById("storeFilters");
  const sort = document.getElementById("storeSort");
  const categoryList = document.getElementById("storeCategories");
  const grid = document.getElementById("storeGrid");
  const chips = document.getElementById("storeActiveFilters");
  const homeSections = [...document.querySelectorAll("#contenido > section")].filter((section) => section !== store);
  const text = catalog.texts || {};
  if (text.title && text.subtitle) {
    const title = document.getElementById("store-title"); title.replaceChildren(document.createTextNode(text.title),document.createElement('br'));
    const subtitle = document.createElement('em'); subtitle.textContent = text.subtitle; title.append(subtitle);
  }
  if (text.description) store.querySelector('.store-intro > div > p:last-child').textContent = text.description;
  if (text.notice) store.querySelector('.store-notice p').textContent = text.notice + " La selección no reserva unidades ni realiza pedidos. Las ventas y el envío aún no están habilitados.";
  if (globalThis.ROHO_CATALOG_UNAVAILABLE || !globalThis.ROHO_PUBLISHED_CATALOG) store.querySelector('.store-notice p').textContent = 'No pudimos cargar el catálogo actualizado. Recarga cuando tengas conexión. No se realizan pedidos desde esta página.';
  const validKeys = ["q", "category", "sort", ...catalog.facets.map(({ key }) => key)];
  let state = {};
  let wasStore = false;
  const escape = (text) => String(text).replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
  const price = new Intl.NumberFormat("es-CO", {style:"currency",currency:"COP",maximumFractionDigits:0});

  catalog.facets.forEach(({ key, label }) => {
    const field = document.createElement("label");
    field.textContent = label;
    const select = document.createElement("select");
    select.name = key;
    select.add(new Option("Todos", ""));
    catalog.facetValues(key).forEach((value) => select.add(new Option(value, value)));
    field.append(select);
    document.getElementById("storeFacetFields").append(field);
  });

  function syncUrl() {
    const params = new URLSearchParams();
    validKeys.forEach((key) => { if (state[key] && state[key] !== "featured") params.set(key, state[key]); });
    history.replaceState(null, "", `#tienda${params.size ? "?" + params.toString() : ""}`);
  }
  function render() {
    const results = catalog.filterProducts(state);
    categoryList.replaceChildren();
    [{id:"",label:"Todo el catálogo"}, ...catalog.categories.filter((category) => Object.values(catalog.products).some((p) => p.publicationStatus === "published" && p.categoryId === category.id))].forEach(({ id, label }) => {
      const button = document.createElement("button");
      button.type = "button";
      const count = Object.values(catalog.products).filter((p) => p.publicationStatus === "published" && (!id || p.categoryId === id)).length;
      button.textContent = `${label} (${count})`;
      button.setAttribute("aria-pressed", String((state.category || "") === id));
      button.addEventListener("click", () => { state.category = id; syncUrl(); render(); categoryList.querySelector('[aria-pressed="true"]')?.focus(); });
      categoryList.append(button);
    });
    for (const field of form.elements) if (field.name && field.value !== (state[field.name] || "")) field.value = state[field.name] || "";
    sort.value = state.sort || "featured";
    document.getElementById("storeCount").textContent = `${results.length} ${results.length === 1 ? "presentación" : "presentaciones"} · Prelanzamiento`;
    chips.replaceChildren();
    const labels = { q: "Búsqueda", category: "Categoría", ...Object.fromEntries(catalog.facets.map(({key,label})=>[key,label])) };
    Object.entries(state).filter(([key,value]) => value && key !== "sort").forEach(([key,value]) => {
      const text = key === "category" ? catalog.categories.find((c) => c.id === value)?.label || value : value;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `${labels[key]}: ${text} ×`;
      button.setAttribute("aria-label", `Quitar filtro ${labels[key]}: ${text}`);
      button.addEventListener("click", () => { delete state[key]; syncUrl(); render(); (form.elements[key] || form.elements.q).focus(); });
      chips.append(button);
    });
    grid.innerHTML = results.map((product) => `
      <article class="store-card">
        <button class="store-card-image" type="button" data-detail="${escape(product.id)}" aria-label="Ver ficha de ${escape(product.name)}">
          <img src="${escape(product.image)}" alt="${product.conceptImage ? "Imagen conceptual de " : "Empaque de "}${escape(product.name)}" width="1200" height="1200" loading="lazy" decoding="async" />
          <span>${product.conceptImage ? "Imagen conceptual" : escape(product.edition)}</span>
        </button>
        <div class="store-card-copy"><p class="store-card-category">${escape(catalog.categories.find((c) => c.id === product.categoryId)?.label || product.category)}</p>
          <h2><button type="button" data-detail="${escape(product.id)}">${escape(product.name)}</button></h2>
          <p class="store-card-detail">${escape(product.detail)}</p>
          <ul class="store-card-tags" aria-label="Características"><li>${escape(product.process)}</li><li>${escape(product.variety)}</li></ul>
          <p class="store-card-origin">${escape(product.origin)}</p>
          <div class="store-card-price"><small>Precio de referencia · COP</small><strong>${price.format(product.price)}</strong></div>
          <div class="store-card-actions"><button type="button" class="button button-red" data-select="${escape(product.id)}">Añadir a mi selección</button><button type="button" class="store-detail" data-detail="${escape(product.id)}">Ver ficha y origen ↗</button></div>
        </div>
      </article>`).join("");
    document.getElementById("storeEmpty").hidden = results.length !== 0;
  }
  function reset() { state = {}; syncUrl(); render(); }
  form.addEventListener("input", (event) => {
    if (!event.target.name) return;
    state[event.target.name] = event.target.value;
    syncUrl();
    // Preserve focus and selection in the search field while filtering.
    render();
  });
  form.addEventListener("submit", (event) => event.preventDefault());
  form.addEventListener("reset", (event) => { event.preventDefault(); reset(); });
  sort.addEventListener("change", () => { state.sort = sort.value; syncUrl(); render(); });
  document.getElementById("storeEmptyReset").addEventListener("click", () => { reset(); form.elements.q.focus(); });
  grid.addEventListener("click", (event) => {
    const detail = event.target.closest("[data-detail]");
    const select = event.target.closest("[data-select]");
    if (detail) { renderProductDetail(detail.dataset.detail); openDialog(document.getElementById("productDialog")); }
    if (select) addProduct(select.dataset.select);
  });
  function route() {
    const isStore = location.hash === "#tienda" || location.hash.startsWith("#tienda?");
    store.hidden = !isStore;
    homeSections.forEach((section) => { section.hidden = isStore; });
    document.querySelector("[data-store-nav]").toggleAttribute("aria-current", isStore);
    if (isStore) {
      document.querySelector("[data-store-nav]").setAttribute("aria-current", "page");
      const params = new URLSearchParams(location.hash.split("?")[1] || "");
      state = Object.fromEntries(validKeys.filter((key) => params.has(key)).map((key) => [key, params.get(key)]));
      render();
      document.title = "Tienda | Rohocafé · Café de origen";
      if (!wasStore) { window.scrollTo(0,0); document.getElementById("store-title").focus({preventScroll:true}); }
    } else {
      document.title = "Rohocafé | Café colombiano de especialidad";
      if (wasStore) {
        const destination = document.getElementById(location.hash.slice(1));
        if (destination) destination.scrollIntoView();
      }
    }
    wasStore = isStore;
  }
  if (window.matchMedia("(max-width: 720px)").matches) document.getElementById("storeFilterPanel").open = false;
  window.addEventListener("hashchange", route);
  route();
})();
