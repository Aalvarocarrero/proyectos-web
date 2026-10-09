const products = {
  "roho-001": {
    name: "ROHO 001 Tabi Honey",
    detail: "Café + postal · 250 g",
    eyebrow: "Café de especialidad · Edición fundacional",
    description: "Una cosecha limitada que preserva la identidad de Pinchote y convierte su trazabilidad en parte esencial del producto.",
    category: "Café colombiano de especialidad",
    edition: "ROHO 001",
    variety: "Tabi · 100% arábica",
    process: "Honey",
    origin: "Pinchote, Santander, Colombia",
    format: "Grano entero · 250 g",
    includes: ["Café ROHO 001 de 250 g", "Bolsa numerada", "Postal de origen"],
    price: 48572,
    image: "./assets/roho-001.webp",
  },
  "kit-origen": {
    name: "Kit Origen",
    detail: "Café + postal + caja",
    eyebrow: "Kit de café de especialidad · Edición 001",
    description: "La primera experiencia de ROHO preparada para regalar, con el mismo café Tabi Honey y la historia de su territorio.",
    category: "Kit de café de especialidad",
    edition: "ROHO 001",
    variety: "Tabi · 100% arábica",
    process: "Honey",
    origin: "Pinchote, Santander, Colombia",
    format: "Café de 250 g · Kit de colección",
    includes: ["Café ROHO 001 de 250 g", "Postal de origen", "Caja de colección"],
    price: 59622,
    image: "./assets/kit-origen-v4-1200.webp",
  },
  "kit-camino": {
    name: "Kit Camino",
    detail: "Café + camiseta + postal + caja",
    eyebrow: "Kit de café de especialidad · Edición 001",
    description: "Una edición para vestir y compartir el origen, construida alrededor de la cosecha ROHO 001 Tabi Honey.",
    category: "Kit de café y objeto de marca",
    edition: "ROHO 001",
    variety: "Tabi · 100% arábica",
    process: "Honey",
    origin: "Pinchote, Santander, Colombia",
    format: "Café de 250 g · Kit de colección",
    includes: ["Café ROHO 001 de 250 g", "Camiseta ROHO", "Postal de origen", "Caja de colección"],
    price: 111622,
    image: "./assets/kit-camino-v4-1200.webp",
  },
  "kit-pausa": {
    name: "Kit Pausa",
    detail: "Café + taza + postal + caja",
    eyebrow: "Kit de café de especialidad · Edición 001",
    description: "El ritual más completo de la primera cosecha: café, objeto, relato y territorio reunidos en una sola experiencia.",
    category: "Kit de experiencia de café",
    edition: "ROHO 001",
    variety: "Tabi · 100% arábica",
    process: "Honey",
    origin: "Pinchote, Santander, Colombia",
    format: "Café de 250 g · Kit de colección",
    includes: ["Café ROHO 001 de 250 g", "Taza Two Way Cup", "Postal de origen", "Caja de colección"],
    price: 176622,
    image: "./assets/kit-pausa-v4-1200.webp",
  },
};

const harvests = {
  "ROHO 001": {
    location: "Pinchote, Santander",
    latitude: 6.53225,
    longitude: -73.17323,
    mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=-73.24%2C6.47%2C-73.11%2C6.59&layer=mapnik&marker=6.53225%2C-73.17323",
    mapUrl: "https://www.openstreetmap.org/?mlat=6.53225&mlon=-73.17323#map=13/6.53225/-73.17323",
    farm: "En validación",
    producer: "En validación",
    altitude: "En validación",
    roastDate: "Se publicará con el lanzamiento",
    cupping: "Perfil de catación en validación",
    plannedUnits: "40 bolsas numeradas",
  },
};

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const siteHeader = document.querySelector(".site-header");
const menuButton = document.getElementById("menuButton");
const mainMenu = document.getElementById("mainMenu");
const cartButton = document.getElementById("cartButton");
const cartDialog = document.getElementById("cartDialog");
const cartItems = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartSummary = document.getElementById("cartSummary");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const launchDialog = document.getElementById("launchDialog");
const productDialog = document.getElementById("productDialog");
const productDialogContent = document.getElementById("productDialogContent");
const toast = document.getElementById("toast");
let popupTimer;
let toastTimer;
let deferredInstallPrompt = null;

let cart = {};
try {
  cart = JSON.parse(sessionStorage.getItem("roho-cart") || "{}") || {};
} catch {
  cart = {};
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3200);
}

function setDialogState() {
  const hasOpenDialog = Boolean(document.querySelector("dialog[open]"));
  document.body.classList.toggle("dialog-open", hasOpenDialog);
}

function openDialog(dialog) {
  if (!dialog || dialog.open) return;
  dialog.showModal();
  setDialogState();
}

function closeDialog(dialog) {
  if (!dialog || !dialog.open) return;
  dialog.close();
  setDialogState();
}

function updateHeader() {
  siteHeader.classList.toggle("scrolled", window.scrollY > 28);
}

launchDialog.addEventListener('focusin', (event) => {
  if (event.target.matches('input')) {
    window.clearTimeout(popupTimer);
    launchDialog.querySelector('.dialog-timer span').style.animationPlayState = 'paused';
  }
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

menuButton.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!expanded));
  mainMenu.classList.toggle("open", !expanded);
});

mainMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    mainMenu.classList.remove("open");
  });
});

document.addEventListener("click", (event) => {
  if (!mainMenu.contains(event.target) && !menuButton.contains(event.target)) {
    menuButton.setAttribute("aria-expanded", "false");
    mainMenu.classList.remove("open");
  }
});

function saveCart() {
  sessionStorage.setItem("roho-cart", JSON.stringify(cart));
}

function itemCount() {
  return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
}

function cartSubtotal() {
  return Object.entries(cart).reduce((sum, [id, quantity]) => {
    return sum + (products[id]?.price || 0) * quantity;
  }, 0);
}

function renderCart() {
  const entries = Object.entries(cart).filter(([id, quantity]) => products[id] && quantity > 0);
  cartItems.replaceChildren();

  entries.forEach(([id, quantity]) => {
    const product = products[id];
    const item = document.createElement("article");
    item.className = "cart-item";
    item.innerHTML = `
      <img src="${product.image}" alt="" width="82" height="96" />
      <div>
        <h3>${product.name}</h3>
        <p>${product.detail}</p>
        <strong>${currency.format(product.price)}</strong>
      </div>
      <div class="quantity-control" aria-label="Cantidad de ${product.name}">
        <button type="button" data-quantity="-1" data-product="${id}" aria-label="Restar una unidad">−</button>
        <span aria-live="polite">${quantity}</span>
        <button type="button" data-quantity="1" data-product="${id}" aria-label="Agregar una unidad">+</button>
      </div>
    `;
    cartItems.append(item);
  });

  const count = itemCount();
  cartCount.textContent = String(count);
  cartButton.setAttribute("aria-label", `Abrir carrito, ${count} ${count === 1 ? "producto" : "productos"}`);
  cartEmpty.hidden = entries.length > 0;
  cartSummary.hidden = entries.length === 0;
  cartItems.hidden = entries.length === 0;
  cartTotal.textContent = currency.format(cartSubtotal());
  saveCart();
}

function addProduct(id) {
  if (!products[id]) return;
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  showToast(`${products[id].name} se agregó a tu colección.`);
}

function renderProductDetail(id) {
  const product = products[id];
  if (!product) return;
  const harvest = harvests[product.edition];
  document.getElementById("productDialogEdition").textContent = `${product.edition} · ${harvest.location}`;
  productDialogContent.innerHTML = `
    <div class="product-detail-hero">
      <figure class="product-detail-media">
        <span>${product.edition} · Colección limitada</span>
        <img src="${product.image}" alt="${product.name}" width="1200" height="1200" />
      </figure>
      <section class="product-detail-copy">
        <p class="product-origin">${product.eyebrow}</p>
        <h2 id="productDialogTitle">${product.name}</h2>
        <p class="product-detail-lead">${product.description}</p>
        <ul class="coffee-tags" aria-label="Clasificación del producto">
          <li>${product.category}</li><li>${product.variety}</li><li>Proceso ${product.process}</li>
        </ul>
        <dl class="product-detail-specs">
          <div><dt>Cosecha</dt><dd>${product.edition}</dd></div>
          <div><dt>Origen</dt><dd>${product.origin}</dd></div>
          <div><dt>Variedad</dt><dd>${product.variety}</dd></div>
          <div><dt>Proceso</dt><dd>${product.process}</dd></div>
          <div><dt>Formato</dt><dd>${product.format}</dd></div>
          <div><dt>Disponibilidad</dt><dd>${harvest.plannedUnits}</dd></div>
        </dl>
        <div class="product-includes">
          <span>Esta presentación incluye</span>
          <ul>${product.includes.map((item) => `<li>${item}</li>`).join("")}</ul>
        </div>
        <div class="product-detail-buy">
          <div><small>Precio de referencia</small><strong>${currency.format(product.price)} <em>COP</em></strong></div>
          <button class="button button-red add-from-detail" type="button">Agregar a mi selección</button>
        </div>
      </section>
    </div>
    <section class="product-detail-origin" aria-label="Trazabilidad de ${product.name}">
      <article class="product-detail-map">
        <iframe title="Mapa de ${harvest.location}" src="${harvest.mapEmbed.replaceAll("&", "&amp;")}" loading="lazy" referrerpolicy="no-referrer"></iframe>
        <div><span>Territorio de esta cosecha</span><h3>${harvest.location}</h3><p>El punto identifica el municipio de origen. La ubicación exacta de la finca se publicará cuando sea validada con el productor.</p><a href="${harvest.mapUrl}" target="_blank" rel="noopener noreferrer">Abrir mapa ampliado <b aria-hidden="true">↗</b></a></div>
      </article>
      <article class="product-detail-producer">
        <img src="./assets/cosecha.webp" alt="Selección manual de café en el origen" width="1600" height="2000" loading="lazy" />
        <div><span>Finca y productor</span><h3>La persona detrás del lote.</h3><dl><div><dt>Finca</dt><dd>${harvest.farm}</dd></div><div><dt>Productor</dt><dd>${harvest.producer}</dd></div><div><dt>Altitud</dt><dd>${harvest.altitude}</dd></div></dl></div>
      </article>
      <article class="product-detail-proof">
        <span>Control de trazabilidad</span><h3>Lo confirmado y lo pendiente.</h3>
        <ul><li><i>Confirmado</i><strong>${product.variety}</strong></li><li><i>Confirmado</i><strong>${product.process}</strong></li><li><i>Por validar</i><strong>${harvest.cupping}</strong></li><li><i>Por publicar</i><strong>${harvest.roastDate}</strong></li></ul>
        <p>La ficha se actualizará por cosecha. Cada edición futura podrá mostrar otra finca, productor, variedad, proceso y ubicación.</p>
      </article>
    </section>
  `;
  productDialogContent.querySelector(".add-from-detail").addEventListener("click", () => addProduct(id));
}

document.querySelectorAll(".product-view-trigger").forEach((button) => {
  button.addEventListener("click", () => {
    renderProductDetail(button.dataset.product);
    openDialog(productDialog);
  });
});

document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", () => addProduct(button.dataset.product));
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-quantity]");
  if (!button) return;
  const id = button.dataset.product;
  const change = Number(button.dataset.quantity);
  cart[id] = Math.max(0, (cart[id] || 0) + change);
  if (cart[id] === 0) delete cart[id];
  renderCart();
});

cartButton.addEventListener("click", () => openDialog(cartDialog));

document.getElementById("emptyShopButton").addEventListener("click", () => {
  closeDialog(cartDialog);
  document.getElementById("coleccion").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("checkoutButton").addEventListener("click", () => {
  closeDialog(cartDialog);
  window.setTimeout(() => openNewsletter(false), 260);
  showToast("Completa tu correo para recibir prioridad de compra.");
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => {
    window.clearTimeout(popupTimer);
    closeDialog(document.getElementById(button.dataset.closeDialog));
  });
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog(dialog);
  });
  dialog.addEventListener("close", setDialogState);
});

function openNewsletter(autoClose = false) {
  if (launchDialog.open) return;
  openDialog(launchDialog);
  window.clearTimeout(popupTimer);
  const timerBar = launchDialog.querySelector(".dialog-timer span");
  timerBar.style.animation = "none";
  void timerBar.offsetWidth;
  timerBar.style.animation = autoClose ? "timer 20s linear forwards" : "none";
  timerBar.style.animationPlayState = 'running';
  if (autoClose) {
    popupTimer = window.setTimeout(() => closeDialog(launchDialog), 20000);
  }
}

document.getElementById("openNewsletter").addEventListener("click", () => openNewsletter(false));

document.querySelectorAll(".newsletter-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const email = input.value.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      input.setAttribute("aria-invalid", "true");
      input.focus();
      showToast("Escribe un correo electrónico válido.");
      return;
    }
    input.removeAttribute("aria-invalid");
    form.querySelector("button").textContent = "Solicitud preparada";
    form.querySelector("button").disabled = true;
    showToast("Tu solicitud está lista para la apertura de ROHO 001.");
    window.clearTimeout(popupTimer);
    if (form.closest("dialog")) window.setTimeout(() => closeDialog(launchDialog), 1200);
  });
});

window.setTimeout(() => {
  if (!document.querySelector("dialog[open]") && !sessionStorage.getItem("roho-popup-seen")) {
    sessionStorage.setItem("roho-popup-seen", "true");
    openNewsletter(true);
  }
}, 1400);

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.11, rootMargin: "0px 0px -24px" },
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  document.getElementById("installButton").classList.add("available");
});

async function installApp() {
  if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) {
    showToast("Rohocafé ya está instalada en este dispositivo.");
    return;
  }
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    return;
  }
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  showToast(isIOS ? "En iPhone o iPad: Compartir → Añadir a pantalla de inicio." : "Abre el menú del navegador y elige ‘Instalar aplicación’." );
}

document.getElementById("installButton").addEventListener("click", installApp);
document.getElementById("footerInstall").addEventListener("click", installApp);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

renderCart();

// A small, tactile collection selector with accessible state updates.
const collectionFilters = document.querySelectorAll('[data-filter]');
collectionFilters.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    collectionFilters.forEach((tab) => {
      const selected = tab === button;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-pressed', String(selected));
    });
    let count = 0;
    document.querySelectorAll('.product-card').forEach((card) => {
      const kit = card.classList.contains('product-card-kit');
      card.hidden = filter === 'coffee' ? kit : filter === 'kits' ? !kit : false;
      if (!card.hidden) count += 1;
    });
    const originCommerce = document.querySelector('.origin-commerce');
    if (originCommerce) originCommerce.hidden = filter === 'kits';
    document.getElementById('collectionCount').textContent = `${count} ${count === 1 ? 'presentación' : 'presentaciones'} · Un mismo origen`;
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    menuButton.setAttribute('aria-expanded', 'false');
    mainMenu.classList.remove('open');
  }
});
