import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { d as sellerIdentity, p as hasListingPhoto, u as savedProductDetailsSchema } from "./marketplace-details-DR9jbXb7.js";
import { t as createLucideIcon } from "./createLucideIcon-OtKWZ-kp.js";
import { i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-CBD8GOFt.js";
import { n as MarketplacePhoto } from "./store-Ba5JeW6Y.js";
import { t as Input } from "./input-CcKdupPX.js";
import { t as PriceConversion } from "./price-conversion-B7Racnth.js";
import { i as market_example_photos_default } from "./image-share-CADXed1d.js";
import { t as MapPin } from "./map-pin-DX3uixQw.js";
import { t as Link } from "./link-BIjyqzpN.js";
import { t as Clock3 } from "./clock-3-D-26axeB.js";
import { t as useDirectoryFilters } from "./use-directory-filters-BQnZ7cZf.js";
import { t as matchesDirectorySearch } from "./directory-search-DOvvGzjM.js";
import { t as Search } from "./search-BzuNqXK0.js";
import { t as WifiOff } from "./wifi-off-DXR946Lj.js";
import { t as AgroCategoryIcon } from "./agro-category-icon-BvENtu1T.js";
import { r as marketplaceRootCategories, t as categoryMatches } from "./marketplace-categories-DbEPTFAD.js";
import { MarketplaceDetail, a as ListingPrice, i as marketplaceOwner, n as readMarketPreferences, o as listingUpdateLabel, r as writeMarketPreferences, t as followUpdates } from "./marketplace-detail-tQS5kfIf.js";
//#region node_modules/lucide-react/dist/esm/icons/sliders-horizontal.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var SlidersHorizontal = createLucideIcon("sliders-horizontal", [
	["path", {
		d: "M10 5H3",
		key: "1qgfaw"
	}],
	["path", {
		d: "M12 19H3",
		key: "yhmn1j"
	}],
	["path", {
		d: "M14 3v4",
		key: "1sua03"
	}],
	["path", {
		d: "M16 17v4",
		key: "1q0r14"
	}],
	["path", {
		d: "M21 12h-9",
		key: "1o4lsq"
	}],
	["path", {
		d: "M21 19h-5",
		key: "1rlt1p"
	}],
	["path", {
		d: "M21 5h-7",
		key: "1oszz2"
	}],
	["path", {
		d: "M8 10v4",
		key: "tgpxqk"
	}],
	["path", {
		d: "M8 12H3",
		key: "a7s4jb"
	}]
]);
//#endregion
//#region lib/marketplace-load-state.ts
/** Public content only. Bad responses never replace a valid local snapshot. */
function readPublishedMarketplaceRows(value) {
	if (!value || typeof value !== "object" || !Array.isArray(value.listings)) throw new Error("No se pudo leer la respuesta del mercado.");
	return value.listings.filter((row) => !!row && typeof row === "object" && [
		"id",
		"title",
		"description",
		"category",
		"location",
		"sellerName"
	].every((key) => typeof row[key] === "string") && row.status === "active" && !row.demo);
}
function marketplaceLoadMessage(state, hasSaved) {
	if (state === "loading") return "Comprobando publicaciones…";
	if (state === "error") return hasSaved ? "No pudimos actualizar. Conservamos la última consulta de este navegador; confirma disponibilidad con el anunciante." : "No pudimos cargar las ofertas. Puedes reintentar o explorar los ejemplos identificados como demostración.";
	if (state === "offline") return hasSaved ? "Sin conexión. Consulta guardada en este navegador; la disponibilidad puede haber cambiado." : "Sin conexión. No hay ofertas guardadas aquí. Los ejemplos no son ofertas reales.";
	return "Consulta actualizada. Precio, disponibilidad y entrega se acuerdan con el anunciante.";
}
function marketplaceCountLabel(count, examples) {
	return `${count} ${examples ? count === 1 ? "ejemplo" : "ejemplos" : count === 1 ? "oferta" : "ofertas"}`;
}
/** Collapse only explicit demos; never drop a real publication. */
function marketplacePreviewRows(rows, expanded) {
	if (expanded) return rows;
	let shown = 0;
	return rows.filter((row) => {
		if (!row.demo) return true;
		if (shown >= 2) return false;
		shown++;
		return true;
	});
}
/** An unavailable catalogue is different from a search with no matches. */
function marketplaceEmptyState(state, examples, hasPublished) {
	if (!examples && !hasPublished) {
		if (state === "loading") return {
			title: "Comprobando ofertas…",
			description: "Espera un momento mientras consultamos las publicaciones."
		};
		if (state === "error") return {
			title: "No pudimos cargar las ofertas.",
			description: "Usa Actualizar ofertas para volver a intentarlo. También puedes explorar las demostraciones."
		};
		if (state === "offline") return {
			title: "No hay ofertas guardadas en este dispositivo.",
			description: "Vuelve a conectarte para consultar publicaciones. Los ejemplos incluidos siguen disponibles."
		};
		return {
			title: "Todavía no hay ofertas publicadas.",
			description: "Puedes preparar un anuncio para revisión o explorar ejemplos de cada categoría."
		};
	}
	return {
		title: "No encontramos resultados.",
		description: "Prueba otra categoría o una búsqueda más amplia."
	};
}
//#endregion
//#region lib/marketplace-demo.ts
var demoMarketplaceListings = (/* @__PURE__ */ JSON.parse("[{\"id\":\"demo-bovinos\",\"sellerName\":\"Publicación demostrativa\",\"title\":\"6 novillas doble propósito · 285–320 kg por animal\",\"description\":\"Lote ficticio de 6 novillas, con edades ilustrativas de 18 a 22 meses y pesos individuales de 285 a 320 kg. La ficha muestra cómo separar peso, edad y cantidad; permite plantear una compra desde 1 animal. En una operación real habría que verificar identificación, pesaje, documentación y condiciones de traslado. No acredita salud ni desempeño productivo.\",\"category\":\"Bovinos\",\"location\":\"San Fernando, Apure · ubicación ilustrativa\",\"saleFormat\":\"Animales en pie · animal\",\"supplyUnit\":\"unidad\",\"minimumOrder\":\"1 animal\",\"buyerType\":\"Personas y empresas\",\"demo\":true,\"priceCents\":null,\"currency\":\"USD\"},{\"id\":\"demo-porcinos-engorde\",\"sellerName\":\"Publicación demostrativa\",\"title\":\"8 cerdos de engorde · 80–110 kg por animal\",\"description\":\"Supuesto de venta de 8 porcinos en pie, con pesos ilustrativos de 80 a 110 kg y compra mínima de 2 animales. El rango describe únicamente este ejemplo de engorde; no es un límite para la categoría. Una ficha real debería incluir pesaje individual, etapa de crianza, procedencia y requisitos de traslado, sin confundir cantidad de animales con kilogramos.\",\"category\":\"Porcinos\",\"location\":\"Acarigua, Portuguesa · ubicación ilustrativa\",\"saleFormat\":\"Porcinos en pie · animal\",\"supplyUnit\":\"unidad\",\"minimumOrder\":\"2 animales\",\"buyerType\":\"Personas y empresas\",\"demo\":true,\"priceCents\":null,\"currency\":\"USD\"},{\"id\":\"demo-aves-gallinas\",\"sellerName\":\"Publicación demostrativa\",\"title\":\"30 gallinas adultas · grupos de 10 aves\",\"description\":\"Ejemplo ficticio de 30 gallinas de 24 semanas de edad ilustrativa, organizadas en 3 grupos de 10. La unidad de venta es cada grupo, no la docena de huevos. Para una publicación real se detallarían identificación del lote, alojamiento y recogida; cualquier dato de postura o condición sanitaria requeriría respaldo. Este ejemplo no promete producción de huevos.\",\"category\":\"Aves\",\"location\":\"Villa de Cura, Aragua · ubicación ilustrativa\",\"saleFormat\":\"Grupo de aves vivas · grupo de 10 aves\",\"supplyUnit\":\"unidad\",\"minimumOrder\":\"1 grupo de 10 aves\",\"buyerType\":\"Personas y empresas\",\"demo\":true,\"priceCents\":null,\"currency\":\"USD\"},{\"id\":\"demo-equinos-yegua\",\"sellerName\":\"Publicación demostrativa\",\"title\":\"Yegua de 7 años · alzada ilustrativa de 1,48 m\",\"description\":\"Ficha ficticia de 1 yegua adulta. La edad de 7 años y la alzada de 1,48 m sirven para mostrar datos propios de un anuncio equino; la alzada se expresa en metros, no como peso. Una evaluación presencial y la revisión de identificación y antecedentes serían necesarias antes de negociar. No se atribuyen doma, temperamento, salud ni aptitud reproductiva.\",\"category\":\"Equinos\",\"location\":\"Calabozo, Guárico · ubicación ilustrativa\",\"saleFormat\":\"Animal individual · animal\",\"supplyUnit\":\"unidad\",\"minimumOrder\":\"1 animal\",\"buyerType\":\"Personas y empresas\",\"demo\":true,\"priceCents\":null,\"currency\":\"USD\"},{\"id\":\"demo-ovinos-corderos\",\"sellerName\":\"Publicación demostrativa\",\"title\":\"12 corderos en pie · 25–32 kg por animal\",\"description\":\"Lote hipotético de 12 corderos con pesos ilustrativos de 25 a 32 kg. La propuesta muestra una compra por grupos de 4 animales, con peso individual separado del número de cabezas. En una oferta real se revisarían edad, identificación, pesaje y traslado. No implica disponibilidad de animales ni certifica raza, estado sanitario o características reproductivas.\",\"category\":\"Ovinos y caprinos\",\"location\":\"Carora, Lara · ubicación ilustrativa\",\"saleFormat\":\"Grupo de animales en pie · grupo de 4 animales\",\"supplyUnit\":\"unidad\",\"minimumOrder\":\"1 grupo de 4 animales\",\"buyerType\":\"Personas y empresas\",\"demo\":true,\"priceCents\":null,\"currency\":\"USD\"},{\"id\":\"demo-piscicultura-cachama\",\"sellerName\":\"Publicación demostrativa\",\"title\":\"500 alevines de trucha arcoíris · lote ilustrativo por conteo\",\"description\":\"Ejemplo ficticio de 500 alevines de trucha arcoíris, presentados por conteo. La oferta real debe verificar procedencia, condiciones de transporte y necesidades de agua y manejo con apoyo técnico. No se promete disponibilidad, supervivencia ni aptitud para una finca concreta.\",\"category\":\"Piscicultura\",\"location\":\"Mérida, Venezuela · ubicación ilustrativa\",\"saleFormat\":\"Alevines por conteo\",\"supplyUnit\":\"unidad\",\"minimumOrder\":\"500 alevines\",\"buyerType\":\"Personas y empresas\",\"demo\":true,\"priceCents\":null,\"currency\":\"USD\",\"state\":\"Mérida\",\"municipality\":\"\"},{\"id\":\"demo-apicultura-extractor\",\"sellerName\":\"Publicación demostrativa\",\"title\":\"1 extractor de miel · equipo de referencia\",\"description\":\"Ejemplo ficticio de 1 extractor para explicar cómo presentar un equipo apícola. Antes de anunciar uno real, confirma capacidad, tipo de accionamiento, materiales, estado y fotografías del equipo ofrecido.\",\"category\":\"Apicultura\",\"location\":\"San Felipe, Yaracuy · ubicación ilustrativa\",\"saleFormat\":\"Equipo completo\",\"supplyUnit\":\"unidad\",\"minimumOrder\":\"1 equipo\",\"buyerType\":\"Personas y empresas\",\"demo\":true,\"priceCents\":null,\"currency\":\"USD\"},{\"id\":\"demo-carnicos-caja-bovina\",\"sellerName\":\"Publicación demostrativa\",\"title\":\"Carne bovina deshuesada · caja de 20 kg netos\",\"description\":\"Presentación ficticia de una caja con 4 paquetes de 5 kg netos de carne bovina deshuesada: 20 kg netos en total. El peso del embalaje queda fuera de esa cantidad. Una oferta real identificaría cortes, origen, lote, fechas, conservación y transporte refrigerado. No hay producto disponible ni certificación sanitaria validada en esta demostración.\",\"category\":\"Cárnicos\",\"location\":\"Barinas, Barinas · ubicación ilustrativa\",\"saleFormat\":\"Caja de producto empacado · caja de 20 kg netos\",\"supplyUnit\":\"caja\",\"minimumOrder\":\"1 caja de 20 kg netos\",\"buyerType\":\"Personas y empresas\",\"demo\":true,\"priceCents\":null,\"currency\":\"USD\"},{\"id\":\"demo-genetica-tanque\",\"sellerName\":\"Publicación demostrativa\",\"title\":\"1 tanque criogénico · características por confirmar\",\"description\":\"Ejemplo ficticio de 1 tanque para almacenamiento criogénico. La ficha real debe indicar capacidad, canastillas, estado y condiciones verificadas del recipiente ofrecido; la imagen muestra únicamente el tipo de equipo.\",\"category\":\"Genética y reproducción\",\"location\":\"Valera, Trujillo · ubicación ilustrativa\",\"saleFormat\":\"Equipo completo\",\"supplyUnit\":\"unidad\",\"minimumOrder\":\"1 equipo\",\"buyerType\":\"Personas y empresas\",\"demo\":true,\"priceCents\":null,\"currency\":\"USD\"},{\"id\":\"demo-hortalizas-tomate\",\"sellerName\":\"Publicación demostrativa\",\"title\":\"Tomate fresco · 10 cajas de 18 kg netos\",\"description\":\"Cosecha ficticia presentada en 10 cajas de 18 kg netos cada una, equivalentes a 180 kg de tomate. Se ilustra una compra mínima de 2 cajas, es decir, 36 kg netos. Una publicación real indicaría fecha de cosecha, tamaño, madurez y tipo de envase, además de acordar selección y recogida. Las cajas no representan existencias disponibles.\",\"category\":\"Verduras y hortalizas\",\"location\":\"Timotes, Mérida · ubicación ilustrativa\",\"saleFormat\":\"Cajas de producto fresco · caja de 18 kg netos\",\"supplyUnit\":\"caja\",\"minimumOrder\":\"2 cajas, equivalentes a 36 kg netos\",\"buyerType\":\"Personas y empresas\",\"demo\":true,\"priceCents\":null,\"currency\":\"USD\"},{\"id\":\"demo-frutas-pina\",\"sellerName\":\"Publicación demostrativa\",\"title\":\"120 piñas enteras · cajas de 12 frutas\",\"description\":\"Ejemplo hipotético de 120 piñas distribuidas en 10 cajas de 12 frutas. La venta se expresa por caja y por conteo; no se presupone que todas las piñas pesen lo mismo. En una oferta real habría que precisar variedad, tamaño, madurez y embalaje, y pesar el lote si la negociación fuera por kilogramo. Cantidades y lugar son ilustrativos.\",\"category\":\"Frutas\",\"location\":\"Guama, Yaracuy · ubicación ilustrativa\",\"saleFormat\":\"Cajas por conteo · caja de 12 frutas\",\"supplyUnit\":\"caja\",\"minimumOrder\":\"1 caja de 12 frutas\",\"buyerType\":\"Personas y empresas\",\"demo\":true,\"priceCents\":null,\"currency\":\"USD\"},{\"id\":\"demo-granos-maiz\",\"sellerName\":\"Publicación demostrativa\",\"title\":\"Maíz amarillo en grano · 1 t en 20 sacos\",\"description\":\"Lote ficticio de 1 tonelada de maíz amarillo, presentado en 20 sacos de 50 kg netos. La compra mínima ilustrativa de 4 sacos equivale a 200 kg. Un anuncio real detallaría uso previsto, cosecha, almacenamiento y resultados de calidad cuando existan. Este ejemplo no afirma humedad, pureza ni aptitud alimentaria verificadas.\",\"category\":\"Granos y forrajes\",\"location\":\"Turén, Portuguesa · ubicación ilustrativa\",\"saleFormat\":\"Grano ensacado · saco de 50 kg netos\",\"supplyUnit\":\"saco\",\"minimumOrder\":\"4 sacos, equivalentes a 200 kg netos\",\"buyerType\":\"Personas y empresas\",\"demo\":true,\"priceCents\":null,\"currency\":\"USD\"},{\"id\":\"demo-semillas\",\"sellerName\":\"Publicación demostrativa\",\"title\":\"1.000 semillas de cacao · paquetes de 100\",\"description\":\"Ejemplo ficticio de 1.000 semillas de cacao divididas en 10 paquetes de 100 unidades. La cantidad se expresa por conteo, sin confundir semillas con plantas establecidas. Una publicación real debería detallar origen, fecha de recolección, acondicionamiento y plazo de entrega. No se garantiza germinación, selección genética ni rendimiento del futuro cultivo.\",\"category\":\"Semillas y plantas\",\"location\":\"Carúpano, Sucre · ubicación ilustrativa\",\"saleFormat\":\"Semillas por conteo · paquete de 100 semillas\",\"supplyUnit\":\"unidad\",\"minimumOrder\":\"1 paquete de 100 semillas\",\"buyerType\":\"Personas y empresas\",\"demo\":true,\"priceCents\":null,\"currency\":\"USD\"},{\"id\":\"demo-nutricion-alimento\",\"sellerName\":\"Publicación demostrativa\",\"title\":\"Alimento para bovinos · 15 sacos de 40 kg\",\"description\":\"Presentación hipotética de 15 sacos cerrados de alimento para bovinos, de 40 kg netos cada uno: 600 kg en total. Una ficha real mostraría etiqueta, composición declarada, lote, fechas y condiciones de almacenamiento. La elección debe considerar especie, etapa y asesoría competente; esta tarjeta no formula una ración ni promete aumentos de peso o producción.\",\"category\":\"Nutrición animal\",\"location\":\"San Carlos, Cojedes · ubicación ilustrativa\",\"saleFormat\":\"Alimento ensacado · saco de 40 kg netos\",\"supplyUnit\":\"saco\",\"minimumOrder\":\"1 saco de 40 kg netos\",\"buyerType\":\"Personas y empresas\",\"demo\":true,\"priceCents\":null,\"currency\":\"USD\"},{\"id\":\"demo-veterinaria-envases\",\"sellerName\":\"Publicación demostrativa\",\"title\":\"Insumos veterinarios · caja ilustrativa de 12 envases\",\"description\":\"Maqueta ficticia de una caja con 12 envases de 100 mL, cerrados y etiquetados: 1,2 L de volumen nominal total. Ilustra campos para lote, vencimiento e instrucciones de almacenamiento del fabricante. No representa un producto disponible, no identifica principios activos ni indica tratamientos o dosis. Cualquier selección o uso real requiere revisión de un profesional veterinario y del etiquetado aplicable.\",\"category\":\"Vitaminas y medicinas\",\"location\":\"Maracay, Aragua · ubicación ilustrativa\",\"saleFormat\":\"Presentación cerrada de ejemplo · caja de 12 envases de 100 mL\",\"supplyUnit\":\"caja\",\"minimumOrder\":\"1 caja ilustrativa de 12 envases\",\"buyerType\":\"Personas y empresas\",\"demo\":true,\"priceCents\":null,\"currency\":\"USD\"},{\"id\":\"demo-fertilizantes-compost\",\"sellerName\":\"Publicación demostrativa\",\"title\":\"Compost para suelo · 25 sacos de 20 kg\",\"description\":\"Ejemplo ficticio de 500 kg de compost repartidos en 25 sacos de 20 kg netos. El mínimo ilustrativo de 5 sacos suma 100 kg. Una oferta real precisaría materias de origen, proceso, condiciones de almacenamiento y análisis disponible. La aplicación dependería del suelo y del cultivo; no se atribuyen certificación orgánica, composición garantizada ni efectos de control de plagas.\",\"category\":\"Fertilizantes y control\",\"location\":\"Mérida, Mérida · ubicación ilustrativa\",\"saleFormat\":\"Enmienda ensacada · saco de 20 kg netos\",\"supplyUnit\":\"saco\",\"minimumOrder\":\"5 sacos, equivalentes a 100 kg netos\",\"buyerType\":\"Personas y empresas\",\"demo\":true,\"priceCents\":null,\"currency\":\"USD\"},{\"id\":\"demo-maquinaria-rastra\",\"sellerName\":\"Publicación demostrativa\",\"title\":\"1 rastra de discos · equipo agrícola de ejemplo\",\"description\":\"Ejemplo ficticio de 1 rastra de discos. El anunciante debe verificar número de discos, ancho de trabajo, estado y requisitos del tractor antes de publicar su equipo. No se atribuyen especificaciones técnicas a la foto de referencia.\",\"category\":\"Maquinaria agrícola\",\"location\":\"Valle de la Pascua, Guárico · ubicación ilustrativa\",\"saleFormat\":\"Equipo completo\",\"supplyUnit\":\"unidad\",\"minimumOrder\":\"1 equipo\",\"buyerType\":\"Personas y empresas\",\"demo\":true,\"priceCents\":null,\"currency\":\"USD\"},{\"id\":\"demo-drone\",\"sellerName\":\"Publicación demostrativa\",\"title\":\"1 dron de inspección visual · equipo individual\",\"description\":\"Ejemplo ficticio de 1 dron para explicar una ficha de equipo de inspección visual. Antes de anunciar un equipo real, confirma modelo, estado, accesorios incluidos y condiciones de uso. La fotografía no representa un pulverizador ni acredita capacidad de carga u horas de funcionamiento.\",\"category\":\"Drones y tecnología\",\"location\":\"Barinas, Barinas · ubicación ilustrativa\",\"saleFormat\":\"Equipo individual · dron\",\"supplyUnit\":\"unidad\",\"minimumOrder\":\"1 dron de ejemplo\",\"buyerType\":\"Personas y empresas\",\"demo\":true,\"priceCents\":null,\"currency\":\"USD\"},{\"id\":\"demo-cercas-malla\",\"sellerName\":\"Publicación demostrativa\",\"title\":\"1 juego de herramientas de campo · palas, rastrillos y carretilla\",\"description\":\"Ejemplo ficticio de 1 conjunto de herramientas de campo. Para una oferta real, enumera las piezas incluidas y su estado con fotografías propias; confirma materiales y condiciones de entrega antes de negociar.\",\"category\":\"Herramientas y cercas\",\"location\":\"Barquisimeto, Lara · ubicación ilustrativa\",\"saleFormat\":\"Conjunto de herramientas\",\"supplyUnit\":\"unidad\",\"minimumOrder\":\"1 conjunto\",\"buyerType\":\"Personas y empresas\",\"demo\":true,\"priceCents\":null,\"currency\":\"USD\"},{\"id\":\"demo-finca-doce-hectareas\",\"sellerName\":\"Publicación demostrativa\",\"title\":\"Parcela rural ficticia · 12 ha de superficie declarada\",\"description\":\"Ejemplo de propiedad inexistente, con superficie declarada expresamente ficticia de 12 ha, equivalentes a 120.000 m². Sirve para mostrar una ficha por inmueble completo, sin dirección ni coordenadas reales. No acredita propietario, título, linderos, acceso, agua o permisos. Una negociación real requeriría identificar el inmueble y revisar documentos y medición antes de asumir esos datos.\",\"category\":\"Fincas y terrenos\",\"location\":\"Guárico, Venezuela · ubicación ilustrativa\",\"saleFormat\":\"Inmueble completo de ejemplo · inmueble\",\"supplyUnit\":\"unidad\",\"minimumOrder\":\"1 inmueble ficticio de 12 ha declaradas\",\"buyerType\":\"Personas y empresas\",\"demo\":true,\"priceCents\":null,\"currency\":\"USD\"},{\"id\":\"demo-servicios-revision-cercas\",\"sellerName\":\"Publicación demostrativa\",\"title\":\"Revisión de 1 km de cerca · visita de hasta 4 h\",\"description\":\"Servicio ficticio para recorrer hasta 1 km lineal de cerca durante una visita de hasta 4 horas y preparar un registro de tramos, postes y alambres que requieran atención. El alcance incluye observación y listado de materiales propuestos; no incluye reparaciones, materiales ni certificaciones. En un encargo real se acordarían acceso, recorrido y entrega del registro. No se atribuyen credenciales profesionales.\",\"category\":\"Servicios agropecuarios\",\"location\":\"San Juan de los Morros, Guárico · ubicación ilustrativa\",\"saleFormat\":\"Visita con alcance definido · visita de hasta 4 h\",\"supplyUnit\":\"unidad\",\"minimumOrder\":\"1 visita para revisar hasta 1 km lineal\",\"buyerType\":\"Personas y empresas\",\"demo\":true,\"priceCents\":null,\"currency\":\"USD\"}]")).map((row) => {
	const photo = market_example_photos_default.find((p) => p.id === row.id);
	const isCattle = row.id === "demo-bovinos", isPig = row.id === "demo-porcinos-engorde";
	return {
		...row,
		...isCattle ? {
			sellerName: "Productor bovino · ejemplo",
			demoSellerImage: photo?.src
		} : isPig ? {
			sellerName: "Granja porcina · ejemplo",
			demoSellerImage: photo?.src
		} : {},
		imageFit: photo && (photo.width / photo.height > 1.9 || photo.width / photo.height < 1.1) ? "contain" : "cover",
		imageUrl: photo?.src ?? null,
		imageAlt: photo?.alt ?? "",
		imageCreditHref: photo ? `/creditos-fotograficos#mercado-${row.id}` : void 0,
		...isCattle || isPig ? { demoDetails: savedProductDetailsSchema.parse({
			attributes: isCattle ? {
				age: "18–22 meses · ejemplo",
				weight: "285–320 kg por animal · ejemplo",
				size: "No declarado",
				color: "No declarado",
				breed: "No declarada"
			} : {
				age: "No declarada",
				weight: "80–110 kg por animal · ejemplo",
				size: "No declarado",
				color: "No declarado",
				breed: "No declarada"
			},
			publicLocation: {
				latitude: isCattle ? 7.85 : 9.5,
				longitude: isCattle ? -67.45 : -69.2,
				precision: "approximate",
				label: "Punto ficticio de demostración"
			}
		}) } : {},
		demoPhotos: photo ? [{
			src: photo.src,
			alt: photo.alt,
			creditHref: `/creditos-fotograficos#mercado-${row.id}`,
			caption: `Fotografía ilustrativa · ${photo.author} · ${photo.license}`,
			credit: {
				author: photo.author,
				license: photo.license,
				licenseUrl: photo.licenseUrl,
				source: photo.source,
				changes: photo.changes
			}
		}, ...isCattle ? [{
			src: "/photos/arreo-guarico.webp",
			alt: "Ganado en Guárico; foto documental de contexto de otros animales",
			caption: "Otra fotografía de contexto. No es el mismo lote ni acredita la ubicación del ejemplo.",
			creditHref: "/creditos-fotograficos"
		}] : []] : []
	};
});
//#endregion
//#region components/marketplace-saved-panel.tsx
var import_jsx_runtime = require_jsx_runtime();
function MarketplaceSavedPanel({ rows, onSelect }) {
	const [prefs, setPrefs] = (0, import_react.useState)({
		saved: [],
		following: []
	}), [message, setMessage] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		let active = true, readEpoch = 0;
		const load = () => {
			const epoch = ++readEpoch;
			marketplaceOwner().then((owner) => {
				if (active && epoch === readEpoch) setPrefs(readMarketPreferences(localStorage, owner));
			}).catch(() => {
				if (active && epoch === readEpoch) setPrefs({
					saved: [],
					following: []
				});
			});
		};
		load();
		window.addEventListener("focus", load);
		window.addEventListener("market-preferences-changed", load);
		return () => {
			active = false;
			window.removeEventListener("focus", load);
			window.removeEventListener("market-preferences-changed", load);
		};
	}, []);
	const saved = rows.filter((r) => prefs.saved.includes(r.id)), updates = followUpdates(prefs, rows);
	async function seen() {
		try {
			const owner = await marketplaceOwner(), latest = readMarketPreferences(localStorage, owner);
			latest.following = latest.following.map((f) => ({
				...f,
				seenIds: [...new Set([...f.seenIds, ...rows.filter((r) => !r.demo && sellerIdentity(r) === f.sellerKey).map((r) => r.id)])].slice(-200)
			}));
			writeMarketPreferences(localStorage, owner, latest);
			setPrefs(latest);
			setMessage("Novedades marcadas como vistas en este navegador.");
		} catch {
			setMessage("No pudimos guardar ese cambio.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		className: "mb-5 rounded-2xl border bg-white p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
				className: "cursor-pointer py-2 font-semibold",
				children: [
					"Mis guardados (",
					prefs.saved.length,
					") y novedades (",
					updates.length,
					")"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "my-3 text-xs leading-6",
				children: "Solo en este navegador y espacio de cuenta. Se comprueban anuncios nuevos al actualizar Mercado Agro. No se envían avisos externos."
			}),
			[...new Map([...updates, ...saved].map((row) => [row.id, row])).values()].map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "mb-2 block min-h-11 w-full rounded-xl bg-[#f3ebdd] p-3 text-left text-sm",
				onClick: () => onSelect(row),
				children: [
					updates.some((r) => r.id === row.id) ? "Nuevo · " : "",
					row.title,
					row.demo ? " · DEMO" : ""
				]
			}, row.id)),
			!saved.length && !updates.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm",
				children: "Todavía no hay anuncios guardados disponibles ni novedades. Puedes guardar una ficha o seguir a su vendedor."
			}),
			prefs.saved.length > saved.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs",
				children: "Algunos guardados no están en la consulta actual; podrían estar retirados o requerir conexión."
			}),
			updates.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => void seen(),
				className: "button-light mt-3",
				children: "Marcar novedades como vistas"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-2 text-xs",
				children: message
			})
		]
	});
}
//#endregion
//#region components/marketplace-browser.tsx
var demoListings = demoMarketplaceListings;
function marketplaceSource(listings, mode) {
	return mode === "examples" || mode === null && listings.length === 0 ? demoListings : listings.filter((row) => !row.demo && hasListingPhoto(row));
}
function MarketplaceBrowser({ initialCategory = "Todo" }) {
	const [listings, setListings] = (0, import_react.useState)([]);
	const [filters, changeFilters] = useDirectoryFilters({
		q: "",
		categoria: "Todo",
		contenido: ""
	}, `?categoria=${encodeURIComponent(initialCategory)}`);
	const query = filters.q, category = filters.categoria;
	const mode = filters.contenido === "examples" ? "examples" : filters.contenido === "published" ? "published" : null;
	const setQuery = (value) => changeFilters({ q: value });
	const setCategory = (value) => changeFilters({ categoria: value });
	const setMode = (value) => changeFilters({ contenido: value });
	const searchInput = (0, import_react.useRef)(null);
	function clearFilters() {
		changeFilters({
			q: "",
			categoria: "Todo"
		});
		searchInput.current?.focus({ preventScroll: true });
	}
	const [offline, setOffline] = (0, import_react.useState)(false);
	const [loadState, setLoadState] = (0, import_react.useState)("loading");
	const [refreshKey, setRefreshKey] = (0, import_react.useState)(0);
	const [expandedExamples, setExpandedExamples] = (0, import_react.useState)(false);
	const [selected, setSelected] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const syncSelection = () => {
			const id = new URL(location.href).searchParams.get("ejemplo");
			setSelected(id ? demoListings.find((row) => row.id === id) || null : null);
		};
		syncSelection();
		window.addEventListener("popstate", syncSelection);
		return () => window.removeEventListener("popstate", syncSelection);
	}, []);
	function selectListing(row) {
		setSelected(row);
		const url = new URL(location.href);
		if (row?.demo) url.searchParams.set("ejemplo", row.id);
		else url.searchParams.delete("ejemplo");
		history.replaceState(history.state, "", url);
	}
	(0, import_react.useEffect)(() => {
		let active = true;
		let request = null;
		async function load() {
			request?.abort();
			const controller = new AbortController();
			request = controller;
			const connected = navigator.onLine;
			setOffline(!connected);
			setLoadState(connected ? "loading" : "offline");
			if (!connected) {
				setListings([]);
				setSelected((row) => row?.demo ? row : null);
				return;
			}
			try {
				const response = await fetch("/api/marketplace", {
					cache: "no-store",
					signal: controller.signal
				});
				if (!response.ok) throw new Error("No se pudo actualizar el mercado.");
				const rows = readPublishedMarketplaceRows(await response.json());
				if (!active || controller.signal.aborted) return;
				setListings(rows);
				setLoadState("ready");
			} catch {
				if (!active || controller.signal.aborted) return;
				if (!navigator.onLine) {
					setListings([]);
					setSelected((row) => row?.demo ? row : null);
				}
				setOffline(!navigator.onLine);
				setLoadState(navigator.onLine ? "error" : "offline");
			}
		}
		load();
		const handleOnline = () => {
			load();
		};
		const handleOffline = () => {
			request?.abort();
			setListings([]);
			setSelected((row) => row?.demo ? row : null);
			setOffline(true);
			setLoadState("offline");
		};
		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);
		return () => {
			active = false;
			request?.abort();
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, [refreshKey]);
	const matching = (0, import_react.useMemo)(() => {
		return marketplaceSource(listings, mode).filter((listing) => {
			const inCategory = category === "Todo" || categoryMatches(listing.category, category);
			const inQuery = matchesDirectorySearch([
				listing.title,
				listing.description,
				listing.location,
				listing.category,
				listing.sellerName
			], query);
			return inCategory && inQuery;
		});
	}, [
		category,
		listings,
		query,
		mode
	]);
	const showingExamples = mode === "examples" || mode === null && listings.length === 0;
	const visible = marketplacePreviewRows(matching, expandedExamples);
	const hasPublications = marketplaceSource(listings, "published").length > 0;
	const emptyState = loadState === "offline" && !showingExamples ? {
		title: "Mercado Agro requiere conexión.",
		description: "El listado público no se descarga. Tus anuncios y borradores guardados están en Mi Finca; los ejemplos siguen disponibles."
	} : marketplaceEmptyState(loadState, showingExamples, hasPublications);
	const loadMessage = loadState === "offline" ? "Sin conexión. El mercado público no se descarga; consulta tus publicaciones guardadas en Mi Finca." : loadState === "error" && listings.length > 0 ? "No pudimos actualizar. La última consulta permanece solo en esta pestaña; confirma disponibilidad con el anunciante." : marketplaceLoadMessage(loadState, false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		id: "buscar-mercado",
		className: "scroll-mt-28",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "EXPLORA EL MERCADO"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display mt-2 text-3xl sm:text-4xl",
						children: "¿Qué necesita tu producción?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm leading-6 text-[#675f57]",
						children: "Busca por producto o zona y abre una ficha para revisar fotos, condiciones y contacto."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "market-load-status mb-6",
				role: "status",
				"aria-live": "polite",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold",
					children: loadMessage
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs leading-5 text-[#675f57]",
					children: "Las demostraciones están separadas de las ofertas publicadas."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "button-light shrink-0",
					disabled: loadState === "loading" || offline,
					onClick: () => setRefreshKey((key) => key + 1),
					children: loadState === "loading" ? "Actualizando…" : "Actualizar ofertas"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 flex flex-wrap gap-3",
				"aria-label": "Tipo de contenido del mercado",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-pressed": !showingExamples,
					onClick: () => setMode("published"),
					className: showingExamples ? "button-light" : "button-dark",
					children: [
						"Ofertas publicadas (",
						listings.filter((row) => !row.demo && hasListingPhoto(row)).length,
						")"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": showingExamples,
					onClick: () => setMode("examples"),
					className: showingExamples ? "button-dark" : "button-light",
					children: "Ejemplos por categoría"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketplaceSavedPanel, {
				rows: [...listings, ...demoListings],
				onSelect: selectListing
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				href: "/rubros",
				className: "mb-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#4c6b3a]",
				children: "Explorar todos los rubros del agro →"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-[1.6rem] border border-[#3e2a19]/10 bg-white p-4 shadow-[0_20px_60px_rgba(62,42,25,.06)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 lg:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "relative flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
									className: "absolute left-4 top-1/2 -translate-y-1/2 text-[#746b62]",
									size: 19
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "sr-only",
									children: "Buscar en Mercado Agro"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									ref: searchInput,
									type: "search",
									enterKeyHint: "search",
									"aria-describedby": "market-search-help",
									value: query,
									onChange: (event) => setQuery(event.target.value),
									placeholder: "Buscar animales, semillas, maquinaria, fincas…",
									className: "h-14 rounded-2xl border-0 bg-[#f3ebdd] pl-12 text-base shadow-none"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							href: "/marketplace/publicar",
							className: "button-dark min-h-14 shrink-0",
							children: "Publicar un producto"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						id: "market-search-help",
						className: "mt-3 text-xs leading-5 text-[#675f57]",
						children: "También puedes buscar por estado, municipio o anunciante, con o sin acentos."
					}),
					offline && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 flex items-center gap-2 rounded-xl bg-[#edf3e7] px-3 py-2 text-xs font-semibold text-[#365026]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { size: 15 }),
							" ",
							showingExamples ? "Ejemplos incluidos en la aplicación; no son ofertas disponibles." : "Conéctate para consultar las ofertas publicadas."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "group",
				"aria-label": "Filtrar por categoría",
				className: "mt-5 flex flex-wrap gap-2 pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					"aria-pressed": category === "Todo",
					onClick: () => setCategory("Todo"),
					className: `min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${category === "Todo" ? "border-[#3e2a19] bg-[#3e2a19] text-white" : "border-[#3e2a19]/12 bg-white"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgroCategoryIcon, {
						category: "Cultivos",
						size: 18,
						className: "mr-1 inline-block"
					}), " Todo"]
				}), marketplaceRootCategories.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					"aria-pressed": category === item.value,
					onClick: () => setCategory(item.value),
					className: `min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${category === item.value ? "border-[#3e2a19] bg-[#3e2a19] text-white" : "border-[#3e2a19]/12 bg-white"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgroCategoryIcon, {
							category: item.value,
							size: 18,
							className: "mr-1 inline-block"
						}),
						" ",
						item.value
					]
				}, item.value))]
			}),
			showingExamples && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-center gap-2 text-xs text-[#746b62]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { size: 14 }), "Vista demostrativa: estas tarjetas muestran la estructura; no son ofertas reales."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceConversion, { reference: true }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					role: "status",
					"aria-live": "polite",
					className: "text-sm text-[#675f57]",
					children: [
						marketplaceCountLabel(visible.length, showingExamples),
						showingExamples && visible.length < matching.length ? ` visibles de ${matching.length}` : "",
						category !== "Todo" ? ` · ${category}` : "",
						query.trim() ? ` · búsqueda: ${query.trim()}` : ""
					]
				}), (query || category !== "Todo") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 rounded-full border border-[#d7c8b2] px-4 text-sm font-semibold",
					onClick: clearFilters,
					children: "Limpiar filtros"
				})]
			}),
			showingExamples && matching.length > 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-expanded": expandedExamples,
				className: "mt-3 min-h-11 rounded-full border border-[#d7c8b2] px-4 text-sm font-semibold",
				onClick: () => setExpandedExamples((value) => !value),
				children: expandedExamples ? "Mostrar los dos principales" : `Explorar más ejemplos (${matching.length})`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
				children: visible.map((listing) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "relative min-w-0 [overflow-wrap:anywhere] overflow-hidden rounded-[1.6rem] border border-[#3e2a19]/10 bg-white text-left shadow-[0_20px_60px_rgba(62,42,25,.06)] transition hover:-translate-y-1 hover:border-[#4c6b3a]/35",
					"aria-label": `Abrir publicación: ${listing.title}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#e8dece]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketplacePhoto, {
							fit: listing.imageFit,
							src: listing.imageUrl || listing.imageDataUrl,
							alt: listing.imageAlt || `${listing.title} en ${listing.location}`
						}), listing.demo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute left-3 top-3 rounded-full bg-[#211d1a]/85 px-3 py-1 text-[.68rem] font-bold text-white backdrop-blur",
							children: "DEMOSTRACIÓN"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-5",
						children: [
							listing.demo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mb-3 text-xs leading-5 text-[#71685f]",
								children: ["Fotografía ilustrativa · oferta ficticia. ", listing.imageCreditHref && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: listing.imageCreditHref,
									className: "relative z-10 underline",
									children: "Fuente y licencia"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap items-start justify-between gap-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-[1_1_10rem]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#4c6b3a]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgroCategoryIcon, {
											category: listing.category,
											size: 18
										}), listing.category]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "mt-2 text-xl font-semibold leading-tight",
										children: listing.title
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingPrice, {
								listing,
								showUpdated: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 line-clamp-3 text-sm leading-6 text-[#71685f]",
								children: listing.description
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#5f574f]",
								children: [
									listing.saleFormat && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full bg-[#edf3e7] px-2.5 py-1",
										children: listing.saleFormat
									}),
									listing.supplyUnit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "rounded-full bg-[#f3ebdd] px-2.5 py-1",
										children: ["por ", listing.supplyUnit]
									}),
									listing.buyerType === "Solo empresas" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full bg-[#e9ddca] px-2.5 py-1",
										children: "Empresarial"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#3e2a19]/8 pt-4 text-xs text-[#746b62]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { size: 14 }),
										" ",
										listing.location
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { size: 14 }),
										" ",
										listingUpdateLabel(listing)
									]
								})]
							}),
							listing.demo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-haspopup": "dialog",
								"aria-label": `Ver detalles de ${listing.title}`,
								onClick: () => selectListing(listing),
								className: "stretched-card-action mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3e2a19]",
								children: "Ver detalles →"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								href: `/marketplace/${listing.id}`,
								"aria-label": `Ver detalles de ${listing.title}`,
								className: "stretched-card-action mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3e2a19]",
								children: "Ver detalles →"
							})
						]
					})]
				}, listing.id))
			}),
			visible.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 rounded-[1.6rem] border border-dashed border-[#3e2a19]/20 bg-white/60 px-5 py-10 text-center sm:p-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-lg font-semibold",
						children: emptyState.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-[#71685f]",
						children: emptyState.description
					}),
					(query || category !== "Todo") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "button-dark mt-5",
						onClick: clearFilters,
						children: "Ver todas las categorías"
					}),
					!showingExamples && !hasPublications && loadState !== "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex flex-wrap justify-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setMode("examples");
								clearFilters();
							},
							className: "button-light",
							children: "Explorar ejemplos"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							href: "/marketplace/publicar",
							className: "button-dark",
							children: "Preparar una publicación"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: Boolean(selected),
				onOpenChange: (open) => !open && selectListing(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
					className: "max-h-[92dvh] overflow-y-auto bg-[#f8f3ea] sm:max-w-6xl",
					children: selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
							className: "sr-only",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: selected.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: selected.demo ? "Anuncio ficticio para explorar las funciones del mercado." : selected.location })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketplaceDetail, {
							listing: selected,
							rows: selected.demo ? demoListings : listings,
							heading: false,
							onSelect: (row) => {
								selectListing(row);
								document.querySelector("[role=\"dialog\"]")?.scrollTo({
									top: 0,
									behavior: "smooth"
								});
							}
						}, selected.id),
						!selected.demo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							href: `/marketplace/${selected.id}`,
							className: "button-light",
							children: "Ver ficha permanente"
						})
					] })
				})
			})
		]
	});
}
//#endregion
export { MarketplaceBrowser };
