import { E as __toESM, T as __exportAll, b as require_react, n as require_jsx_runtime } from "../index.js";
import { t as productPhotos } from "./product-photos-SgvyNbFN.js";
import { t as createLucideIcon } from "./createLucideIcon-ZIVktEBq.js";
import { c as DialogTrigger, i as DialogDescription, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-BB9AB3vt.js";
import { t as Download } from "./download-CtKUAd8o.js";
import { t as Share2 } from "./share-2-hETJIGMl.js";
import { t as inventory_example_photos_default } from "./inventory-example-photos-r3SAw7hC.js";
//#region ../venezuela-agro-auth/node_modules/lucide-react/dist/esm/icons/copy.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Copy = createLucideIcon("copy", [["rect", {
	width: "14",
	height: "14",
	x: "8",
	y: "8",
	rx: "2",
	ry: "2",
	key: "17jyea"
}], ["path", {
	d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
	key: "zix9uf"
}]]);
//#endregion
//#region lib/share-photo-replacements.ts
var photo = (src, alt) => ({
	src,
	alt,
	kind: "photo",
	fit: "contain"
});
var illustration = (name, alt) => ({
	src: `/share-photos/${name}-original.svg`,
	alt,
	kind: "illustration",
	fit: "contain"
});
var cattle = photo("/share-photos/cattle-cc0.webp", "Fotografía de referencia de ganado bovino; no corresponde a los animales de la oferta.");
var pigs = photo("/share-photos/farm-pigs-pexels.webp", "Fotografía de referencia de porcinos adultos; no acredita peso ni características de la oferta.");
var beef = photo("/share-photos/beef-pexels.webp", "Carne de res de referencia; corte y presentación por confirmar.");
var poultry = photo("/share-photos/chickens-free.webp", "Aves de corral adultas de referencia; no corresponden al lote de la oferta.");
var field = photo("/photos/campo-merida.webp", "Paisaje rural de referencia; no representa la propiedad anunciada.");
var nitrogen = photo("/share-photos/nitrogen-tank-pd.webp", "Tanque de nitrógeno líquido de referencia; no acredita contenido ni características de la oferta.");
var SHARE_PHOTO_REPLACEMENTS = {
	"/photos/market-examples/demo-bovinos.webp": cattle,
	"/products/bovinos.webp": cattle,
	"/photos/ordeno.webp": cattle,
	"/photos/market-examples/demo-porcinos-engorde.webp": pigs,
	"/products/porcinos.webp": pigs,
	"/photos/market-examples/demo-aves-gallinas.webp": poultry,
	"/products/aves.webp": poultry,
	"/photos/market-examples/demo-equinos-yegua.webp": photo("/share-photos/horse-pexels.webp", "Caballo de referencia; edad, sexo y alzada de la oferta no se deducen de esta foto."),
	"/photos/market-examples/demo-ovinos-corderos.webp": photo("/share-photos/sheep-free.webp", "Ovinos de referencia; no corresponden al lote de la oferta."),
	"/photos/market-examples/demo-apicultura-extractor.webp": illustration("extractor", "Ilustración original de un extractor de miel; equipo ficticio de referencia."),
	"/photos/market-examples/demo-carnicos-caja-bovina.webp": beef,
	"/products/res.webp": beef,
	"/products/cerdo.webp": photo("/share-photos/pork-free.webp", "Costillas de cerdo de referencia; corte y presentación por confirmar."),
	"/products/pescado.webp": photo("/share-photos/fish-pexels.webp", "Tilapias de referencia; especie y presentación disponibles por confirmar."),
	"/products/frutas.webp": photo("/photos/market-examples/demo-frutas-pina.webp", "Piñas ilustrativas; cosecha y variedad por confirmar."),
	"/products/hortalizas.webp": photo("/photos/market-examples/demo-hortalizas-tomate.webp", "Tomates ilustrativos; cosecha y variedad por confirmar."),
	"/photos/market-examples/demo-genetica-tanque.webp": nitrogen,
	"/products/genetica.webp": nitrogen,
	"/photos/market-examples/demo-granos-maiz.webp": photo("/share-photos/maize-grains-cc0.webp", "Granos de maíz de referencia; no corresponden a la cantidad ni al lote de la oferta."),
	"/photos/market-examples/demo-nutricion-alimento.webp": illustration("pellets", "Ilustración original de alimento peletizado, sin marca ni composición declarada."),
	"/photos/market-examples/demo-veterinaria-envases.webp": illustration("envases", "Ilustración original de envases vacíos de muestra; no son medicamentos."),
	"/photos/market-examples/demo-fertilizantes-compost.webp": photo("/share-photos/compost-free.webp", "Compost de referencia; no corresponde al producto ni la cantidad de la oferta."),
	"/photos/market-examples/demo-maquinaria-rastra.webp": illustration("rastra", "Ilustración original de una rastra de discos; equipo ficticio de referencia."),
	"/photos/market-examples/demo-cercas-malla.webp": photo("/share-photos/farm-tools-free.webp", "Pala, rastrillo y carretilla de referencia; no corresponden al equipo de la oferta."),
	"/photos/market-examples/demo-finca-doce-hectareas.webp": field,
	"/photos/market-examples/demo-servicios-revision-cercas.webp": photo("/share-photos/rural-fence-pd.webp", "Cerca rural de referencia; no representa el lugar del servicio."),
	"/photos/paramo-siembra.webp": field,
	"/photos/amanecer-trujillo.webp": field,
	"/photos/jornada.webp": field,
	"/photos/faena-arrozal.webp": photo("/share-photos/rice-cc0.webp", "Cultivo de arroz de referencia; no corresponde a la finca del ejemplo.")
};
//#endregion
//#region lib/site-photos.ts
/** Real contextual photographs. They do not depict or certify Parcela stock. */
var sitePhotos = [
	{
		"id": "vacas-llano",
		"src": "/photos/vacas-llano.webp",
		"title": "Vacas en el Llano.jpg",
		"author": "Carlos Santos",
		"license": "CC BY-SA 3.0",
		"source": "https://commons.wikimedia.org/wiki/File:Vacas_en_el_Llano.jpg",
		"licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
		"geography": "Barinas, Venezuela",
		"width": 1600,
		"height": 1067,
		"changes": "Reducción de tamaño y compresión WebP; el encuadre se adapta en pantalla. No se añadieron ni eliminaron elementos de la escena."
	},
	{
		"id": "campo-merida",
		"src": "/photos/campo-merida.webp",
		"title": "Campo de Mérida.JPG",
		"author": "Dal89",
		"license": "Public domain",
		"source": "https://commons.wikimedia.org/wiki/File:Campo_de_M%C3%A9rida.JPG",
		"licenseUrl": "https://commons.wikimedia.org/wiki/File:Campo_de_M%C3%A9rida.JPG",
		"geography": "Mérida, Venezuela",
		"width": 1600,
		"height": 902,
		"changes": "Reducción de tamaño y compresión WebP; el encuadre se adapta en pantalla. No se añadieron ni eliminaron elementos de la escena."
	},
	{
		"id": "ganado-guarico",
		"src": "/photos/ganado-guarico.webp",
		"title": "Ganado, Los Llanos, Guárico.JPG",
		"author": "Christiane Pelda",
		"license": "CC BY-SA 3.0",
		"source": "https://commons.wikimedia.org/wiki/File:Ganado%2C_Los_Llanos%2C_Gu%C3%A1rico.JPG",
		"licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
		"geography": "Guárico, Venezuela",
		"width": 1600,
		"height": 863,
		"changes": "Reducción de tamaño y compresión WebP; el encuadre se adapta en pantalla. No se añadieron ni eliminaron elementos de la escena."
	},
	{
		"id": "llanos-sunset",
		"src": "/photos/llanos-sunset.webp",
		"title": "Los Llanos Venezolanos.jpg",
		"author": "Fernando Flores",
		"license": "CC BY-SA 3.0",
		"source": "https://commons.wikimedia.org/wiki/File:Los_Llanos_Venezolanos.jpg",
		"licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
		"geography": "Hato El Cedral, Apure, Venezuela",
		"width": 1600,
		"height": 1066,
		"changes": "Reducción de tamaño y compresión WebP; el encuadre se adapta en pantalla. No se añadieron ni eliminaron elementos de la escena."
	},
	{
		"id": "llaneros-apure",
		"src": "/photos/llaneros-apure.webp",
		"title": "LLaneros en Apure, Venezuela.jpg",
		"author": "Byfreddygutierrez",
		"license": "CC BY-SA 4.0",
		"source": "https://commons.wikimedia.org/wiki/File:LLaneros_en_Apure%2C_Venezuela.jpg",
		"licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
		"geography": "Apure, Venezuela",
		"width": 1600,
		"height": 1067,
		"changes": "Reducción de tamaño y compresión WebP; el encuadre se adapta en pantalla. No se añadieron ni eliminaron elementos de la escena."
	},
	{
		"id": "arreo-guarico",
		"src": "/photos/arreo-guarico.webp",
		"title": "Arreo de ganado en época de sequía. San Juan de los Morros, estado Guárico.JPG",
		"author": "Bea.sb",
		"license": "CC BY-SA 3.0",
		"source": "https://commons.wikimedia.org/wiki/File:Arreo_de_ganado_en_%C3%A9poca_de_sequ%C3%ADa._San_Juan_de_los_Morros%2C_estado_Gu%C3%A1rico.JPG",
		"licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
		"geography": "San Juan de los Morros, Guárico, Venezuela",
		"width": 1600,
		"height": 1200,
		"changes": "Reducción de tamaño y compresión WebP; el encuadre se adapta en pantalla. No se añadieron ni eliminaron elementos de la escena."
	},
	{
		"id": "faena-arrozal",
		"src": "/photos/faena-arrozal.webp",
		"title": "FAENA EN EL ARROZAL.jpg",
		"author": "Playaelyaque",
		"license": "CC BY-SA 3.0",
		"source": "https://commons.wikimedia.org/wiki/File:FAENA_EN_EL_ARROZAL.jpg",
		"licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
		"geography": "Turén, Portuguesa, Venezuela",
		"width": 1600,
		"height": 1066,
		"changes": "Reducción de tamaño y compresión WebP; el encuadre se adapta en pantalla. No se añadieron ni eliminaron elementos de la escena."
	},
	{
		"id": "mercado-caracas",
		"src": "/photos/mercado-caracas.webp",
		"title": "Mercado de calle en Caracas.jpg",
		"author": "Periodismodepaz",
		"license": "CC BY 4.0",
		"source": "https://commons.wikimedia.org/wiki/File:Mercado_de_calle_en_Caracas.jpg",
		"licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
		"geography": "Caracas, Venezuela",
		"width": 1600,
		"height": 900,
		"changes": "Reducción de tamaño y compresión WebP; el encuadre se adapta en pantalla. No se añadieron ni eliminaron elementos de la escena."
	},
	{
		"id": "cosecha-papa",
		"src": "/photos/cosecha-papa.webp",
		"title": "Cosecha de papa semilla nativa, Plan Pueblo a Pueblo.jpg",
		"author": "Sr raleigh",
		"license": "CC BY-SA 4.0",
		"source": "https://commons.wikimedia.org/wiki/File:Cosecha_de_papa_semilla_nativa%2C_Plan_Pueblo_a_Pueblo.jpg",
		"licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
		"geography": "Trujillo, Venezuela",
		"width": 1600,
		"height": 900,
		"changes": "Reducción de tamaño y compresión WebP; el encuadre se adapta en pantalla. No se añadieron ni eliminaron elementos de la escena."
	},
	{
		"id": "ordeno",
		"src": "/photos/ordeno.webp",
		"title": "Ordeño manual.jpg",
		"author": "Carlos Santos Colorado",
		"license": "CC BY-SA 3.0",
		"source": "https://commons.wikimedia.org/wiki/File:Orde%C3%B1o_manual.jpg",
		"licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
		"geography": "Barinas, Venezuela",
		"width": 1600,
		"height": 1067,
		"changes": "Reducción de tamaño y compresión WebP; el encuadre se adapta en pantalla. No se añadieron ni eliminaron elementos de la escena."
	},
	{
		"id": "cowboys",
		"src": "/photos/cowboys.webp",
		"title": "Cowboys in Venezuela.JPG",
		"author": "Anagoria",
		"license": "CC BY 3.0",
		"source": "https://commons.wikimedia.org/wiki/File:Cowboys_in_Venezuela.JPG",
		"licenseUrl": "https://creativecommons.org/licenses/by/3.0/",
		"geography": "Hato El Frío, Venezuela",
		"width": 1600,
		"height": 1200,
		"changes": "Reducción de tamaño y compresión WebP; el encuadre se adapta en pantalla. No se añadieron ni eliminaron elementos de la escena."
	},
	{
		"id": "jornada",
		"src": "/photos/jornada.webp",
		"title": "SEGUIRÁ LA JORNADA.jpg",
		"author": "Playaelyaque",
		"license": "CC BY-SA 3.0",
		"source": "https://commons.wikimedia.org/wiki/File:SEGUIR%C3%81_LA_JORNADA.jpg",
		"licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
		"geography": "Portuguesa, Venezuela",
		"width": 1600,
		"height": 1067,
		"changes": "Reducción de tamaño y compresión WebP; el encuadre se adapta en pantalla. No se añadieron ni eliminaron elementos de la escena."
	},
	{
		"id": "paramo-siembra",
		"src": "/photos/paramo-siembra.webp",
		"title": "Siembra en Páramo Andino.jpg",
		"author": "TanyGab",
		"license": "CC BY-SA 3.0",
		"source": "https://commons.wikimedia.org/wiki/File:Siembra_en_P%C3%A1ramo_Andino.jpg",
		"licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
		"geography": "Mérida, Venezuela",
		"width": 1600,
		"height": 1200,
		"changes": "Reducción de tamaño y compresión WebP; el encuadre se adapta en pantalla. No se añadieron ni eliminaron elementos de la escena."
	},
	{
		"id": "amanecer-trujillo",
		"src": "/photos/amanecer-trujillo.webp",
		"title": "Amanecer en el sector productivo Mesa Arriba, Trujillo- Venezuela.jpg",
		"author": "Sr raleigh",
		"license": "CC BY-SA 4.0",
		"source": "https://commons.wikimedia.org/wiki/File:Amanecer_en_el_sector_productivo_Mesa_Arriba%2C_Trujillo-_Venezuela.jpg",
		"licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
		"geography": "Mesa Arriba, Carache, Trujillo, Venezuela",
		"width": 1600,
		"height": 900,
		"changes": "Reducción de tamaño y compresión WebP; el encuadre se adapta en pantalla. No se añadieron ni eliminaron elementos de la escena."
	}
];
//#endregion
//#region lib/market-example-photos.json
var market_example_photos_default = /* @__PURE__ */ JSON.parse("[{\"id\":\"demo-bovinos\",\"src\":\"/photos/market-examples/demo-bovinos.webp\",\"alt\":\"Bovinos Brahman en un pastizal de Australia; fotografía ilustrativa.\",\"author\":\"CSIRO\",\"license\":\"CC BY 3.0\",\"licenseUrl\":\"https://creativecommons.org/licenses/by/3.0/\",\"source\":\"https://www.scienceimage.csiro.au/image/10444\",\"changes\":\"Reducción y conversión a WebP; encuadre adaptable en la interfaz. La adaptación fotográfica conserva la licencia indicada.\",\"width\":640,\"height\":426,\"bytes\":75824,\"sha256\":\"160eb425f593a754c9af7b632d79195ee03489d257ad4cabe1817a388f4f15a8\"},{\"id\":\"demo-porcinos-engorde\",\"src\":\"/photos/market-examples/demo-porcinos-engorde.webp\",\"alt\":\"Cerdos Yorkshire vivos en un espacio exterior de Maryland; fotografía ilustrativa.\",\"author\":\"Mark Peters\",\"license\":\"CC BY 2.0\",\"licenseUrl\":\"https://creativecommons.org/licenses/by/2.0/\",\"source\":\"https://www.flickr.com/photos/28267496@N00/5048353439\",\"changes\":\"Reducción y conversión a WebP; encuadre adaptable en la interfaz. La adaptación fotográfica conserva la licencia indicada.\",\"width\":640,\"height\":426,\"bytes\":59168,\"sha256\":\"e0b1d393bc39077fef81942d27e4b49b16fde8e1165d820689088ae8ac3c716f\"},{\"id\":\"demo-aves-gallinas\",\"src\":\"/photos/market-examples/demo-aves-gallinas.webp\",\"alt\":\"Gallinas blancas vivas al aire libre; fotografía ilustrativa.\",\"author\":\"woodley wonderworks\",\"license\":\"CC BY 2.0\",\"licenseUrl\":\"https://creativecommons.org/licenses/by/2.0/\",\"source\":\"https://www.flickr.com/photos/wwworks/2606203797/\",\"changes\":\"Reducción y conversión a WebP; encuadre adaptable en la interfaz. La adaptación fotográfica conserva la licencia indicada.\",\"width\":640,\"height\":426,\"bytes\":48654,\"sha256\":\"460e3f9fe03ebb4d18ca43bed1ad0438598e29764467a19229282eeac5831aae\"},{\"id\":\"demo-equinos-yegua\",\"src\":\"/photos/market-examples/demo-equinos-yegua.webp\",\"alt\":\"Yegua Connemara en Finlandia; foto ilustrativa de otro animal. No acredita edad ni alzada del ejemplo. Marcas del fondo no son patrocinadores.\",\"author\":\"Satu Pitkänen; retouche Gilbertus\",\"license\":\"CC BY-SA 3.0\",\"licenseUrl\":\"https://creativecommons.org/licenses/by-sa/3.0/\",\"source\":\"https://commons.wikimedia.org/wiki/File:Connemara_mare.jpg\",\"changes\":\"Reducción y conversión a WebP; encuadre adaptable en la interfaz. La adaptación fotográfica conserva la licencia indicada.\",\"width\":700,\"height\":525,\"bytes\":53532,\"sha256\":\"a494b0d4c57fb8b5653515b61a66a6425bb0cc7c1de3755ecfee19fa8be1e6fd\"},{\"id\":\"demo-ovinos-corderos\",\"src\":\"/photos/market-examples/demo-ovinos-corderos.webp\",\"alt\":\"Tres corderos vivos; foto ilustrativa. No representa los 12 animales ni pesos del lote ficticio.\",\"author\":\"Robek\",\"license\":\"CC BY 2.5\",\"licenseUrl\":\"https://creativecommons.org/licenses/by/2.5/\",\"source\":\"https://commons.wikimedia.org/wiki/File:3_little_lambs.jpg\",\"changes\":\"Reducción y conversión a WebP; encuadre adaptable en la interfaz. La adaptación fotográfica conserva la licencia indicada.\",\"width\":960,\"height\":551,\"bytes\":90030,\"sha256\":\"6450da22c95c94bdbf6d1e16a8a21f55b6cac18de3aaa05bd637f13ac9b90dae\"},{\"id\":\"demo-piscicultura-cachama\",\"src\":\"/photos/market-examples/demo-piscicultura-cachama.webp\",\"alt\":\"Alevín de trucha arcoíris (Oncorhynchus mykiss), fotografiado en Gavins Point, Estados Unidos. Foto ilustrativa: no muestra un lote de 500 peces ni certifica sus características.\",\"author\":\"Sam Stukel / USFWS Mountain Prairie\",\"license\":\"Public domain (USFWS)\",\"licenseUrl\":\"https://commons.wikimedia.org/wiki/File:Rainbow_Trout_(Oncorhynchus_mykiss)_(51373013565).jpg#Licensing\",\"source\":\"https://www.flickr.com/photos/51986662@N05/51373013565\",\"changes\":\"Reducción y conversión a WebP; encuadre adaptable en la interfaz. La adaptación fotográfica conserva la licencia indicada.\",\"width\":960,\"height\":480,\"bytes\":19518,\"sha256\":\"2ca5457e9af5f24bc9a76c1e30a21261b90957a88f1db2581f116a8a38b6b528\"},{\"id\":\"demo-apicultura-extractor\",\"src\":\"/photos/market-examples/demo-apicultura-extractor.webp\",\"alt\":\"Extractor de miel. Fotografía ilustrativa de un equipo, no de una oferta disponible.\",\"author\":\"Shyamal L.\",\"license\":\"CC BY 4.0\",\"licenseUrl\":\"https://creativecommons.org/licenses/by/4.0/\",\"source\":\"https://commons.wikimedia.org/wiki/File:Honey_extractor.jpg\",\"changes\":\"Reducción y conversión a WebP; encuadre adaptable en la interfaz. La adaptación fotográfica conserva la licencia indicada.\",\"width\":616,\"height\":720,\"bytes\":56210,\"sha256\":\"814b614b157a203e54add82c3d3b0abcddc01e12a436d48742ebc34096afbbe1\"},{\"id\":\"demo-carnicos-caja-bovina\",\"src\":\"/photos/market-examples/demo-carnicos-caja-bovina.webp\",\"alt\":\"Cortes de carne de res cruda sobre una tabla; fotografía ilustrativa.\",\"author\":\"FotoosVanRobin\",\"license\":\"CC BY-SA 2.0\",\"licenseUrl\":\"https://creativecommons.org/licenses/by-sa/2.0/\",\"source\":\"https://www.flickr.com/photos/fotoosvanrobin/2405397605/\",\"changes\":\"Reducción y conversión a WebP; encuadre adaptable en la interfaz. La adaptación fotográfica conserva la licencia indicada.\",\"width\":640,\"height\":426,\"bytes\":52282,\"sha256\":\"90648ee613211e949063c6453ef9f2ce804eb8c98cab95254c4f816102d21475\"},{\"id\":\"demo-genetica-tanque\",\"src\":\"/photos/market-examples/demo-genetica-tanque.webp\",\"alt\":\"Recipientes criogénicos. Fotografía ilustrativa; características de una oferta real por verificar.\",\"author\":\"GOKLuLe 盧樂\",\"license\":\"CC BY-SA 3.0\",\"licenseUrl\":\"https://creativecommons.org/licenses/by-sa/3.0/\",\"source\":\"https://commons.wikimedia.org/wiki/File:Liquid_nitrogen_tank.jpg\",\"changes\":\"Reducción y conversión a WebP; encuadre adaptable en la interfaz. La adaptación fotográfica conserva la licencia indicada.\",\"width\":960,\"height\":720,\"bytes\":65208,\"sha256\":\"6316a6251bf2f79be5b683f5e2b590d09c03a7026a5ca5351bfe0d55e1474bcc\"},{\"id\":\"demo-hortalizas-tomate\",\"src\":\"/photos/market-examples/demo-hortalizas-tomate.webp\",\"alt\":\"Tomates frescos; foto ilustrativa del producto, no de sus cajas ni peso.\",\"author\":\"Amtsga\",\"license\":\"CC0 1.0\",\"licenseUrl\":\"https://creativecommons.org/publicdomain/zero/1.0/\",\"source\":\"https://commons.wikimedia.org/wiki/File:Ripe_tomatoes.JPG\",\"changes\":\"Reducción y conversión a WebP; encuadre adaptable en la interfaz. La adaptación fotográfica conserva la licencia indicada.\",\"width\":960,\"height\":720,\"bytes\":41224,\"sha256\":\"bdb03c9b168c66264da1539ce3b56d4e4a9639762c4282064fb4a326b12c4bc7\"},{\"id\":\"demo-frutas-pina\",\"src\":\"/photos/market-examples/demo-frutas-pina.webp\",\"alt\":\"Piñas enteras; foto ilustrativa del producto, no de sus cajas ni conteo.\",\"author\":\"ProjectManhattan\",\"license\":\"CC0 1.0\",\"licenseUrl\":\"https://creativecommons.org/publicdomain/zero/1.0/\",\"source\":\"https://commons.wikimedia.org/wiki/File:Nice_Pineapples.jpg\",\"changes\":\"Reducción y conversión a WebP; encuadre adaptable en la interfaz. La adaptación fotográfica conserva la licencia indicada.\",\"width\":442,\"height\":720,\"bytes\":102292,\"sha256\":\"3769a9724d3f0dae26806af4e739688ea3ba411eff25c99f7bed99e39d74204b\"},{\"id\":\"demo-granos-maiz\",\"src\":\"/photos/market-examples/demo-granos-maiz.webp\",\"alt\":\"Granos de maíz; fotografía ilustrativa de semillas, sin afirmar variedad, certificación o capacidad de germinación.\",\"author\":\"Rasbak\",\"license\":\"CC BY-SA 3.0\",\"licenseUrl\":\"https://creativecommons.org/licenses/by-sa/3.0/\",\"source\":\"https://commons.wikimedia.org/wiki/File:Zea_mays_seeds_closeup.jpg\",\"changes\":\"Reducción y conversión a WebP; encuadre adaptable en la interfaz. La adaptación fotográfica conserva la licencia indicada.\",\"width\":640,\"height\":426,\"bytes\":56200,\"sha256\":\"f27c0b3bc55c5fed7d79fd33def19ad88121f690fec7b5bbb2ddf867e8dcef0d\"},{\"id\":\"demo-semillas\",\"src\":\"/photos/market-examples/demo-semillas.webp\",\"alt\":\"Mazorcas de cacao abiertas con semillas visibles; fotografía ilustrativa.\",\"author\":\"Keith Weller / USDA ARS\",\"license\":\"Public domain (USDA ARS)\",\"licenseUrl\":\"https://commons.wikimedia.org/wiki/File:Cacao-pod-k4636-14.jpg#Licensing\",\"source\":\"https://commons.wikimedia.org/wiki/File:Cacao-pod-k4636-14.jpg\",\"changes\":\"Reducción y conversión a WebP; encuadre adaptable en la interfaz. La adaptación fotográfica conserva la licencia indicada.\",\"width\":640,\"height\":426,\"bytes\":35812,\"sha256\":\"191e0ba3c6fa952ea484dba275507cca7cb2dd38db67f8ae5b93af4c621ac19f\"},{\"id\":\"demo-nutricion-alimento\",\"src\":\"/photos/market-examples/demo-nutricion-alimento.webp\",\"alt\":\"Alimento bovino peletizado; foto ilustrativa del tipo de producto. No representa sacos cerrados ni garantiza composición.\",\"author\":\"Thamizhpparithi Maari\",\"license\":\"CC BY-SA 3.0\",\"licenseUrl\":\"https://creativecommons.org/licenses/by-sa/3.0/\",\"source\":\"https://commons.wikimedia.org/wiki/File:A_view_of_cattle_feed.JPG\",\"changes\":\"Reducción y conversión a WebP; encuadre adaptable en la interfaz. La adaptación fotográfica conserva la licencia indicada.\",\"width\":960,\"height\":720,\"bytes\":166524,\"sha256\":\"5ee60899ebc4d43ea518b65589211187b375ac02e41cb3eba17ffa7c4b7abaaf\"},{\"id\":\"demo-veterinaria-envases\",\"src\":\"/photos/market-examples/demo-veterinaria-envases.webp\",\"alt\":\"Detalle de envases veterinarios con tapa; fotografía ilustrativa, sin indicaciones de uso ni recomendación de tratamiento.\",\"author\":\"Jheemstra\",\"license\":\"CC BY-SA 3.0\",\"licenseUrl\":\"https://creativecommons.org/licenses/by-sa/3.0/\",\"source\":\"https://commons.wikimedia.org/wiki/File:Animal_medication_veterinary_pharmaceutical_bottles.JPG\",\"changes\":\"Reducción y conversión a WebP; encuadre adaptable en la interfaz. La adaptación fotográfica conserva la licencia indicada.\",\"width\":640,\"height\":426,\"bytes\":5604,\"sha256\":\"b228fe878f68cd0c089dcd09612246aeb6d23b33b121a6ab2154e0111284e7c4\"},{\"id\":\"demo-fertilizantes-compost\",\"src\":\"/photos/market-examples/demo-fertilizantes-compost.webp\",\"alt\":\"Compost a granel en Kew Gardens; foto contextual. No representa los sacos del ejemplo ni certifica composición o maduración.\",\"author\":\"Gossipguy\",\"license\":\"CC BY-SA 3.0\",\"licenseUrl\":\"https://creativecommons.org/licenses/by-sa/3.0/\",\"source\":\"https://commons.wikimedia.org/wiki/File:Compost_heap.jpg\",\"changes\":\"Reducción y conversión a WebP; encuadre adaptable en la interfaz. La adaptación fotográfica conserva la licencia indicada.\",\"width\":960,\"height\":356,\"bytes\":81728,\"sha256\":\"2bf16ac957f633c8673f605d00c9e8a2318f09c322974de4b5925f74d16caf60\"},{\"id\":\"demo-maquinaria-rastra\",\"src\":\"/photos/market-examples/demo-maquinaria-rastra.webp\",\"alt\":\"Rastra de discos. Fotografía ilustrativa de maquinaria agrícola, no de una oferta disponible.\",\"author\":\"N Chadwick\",\"license\":\"CC BY-SA 2.0\",\"licenseUrl\":\"https://creativecommons.org/licenses/by-sa/2.0/\",\"source\":\"https://commons.wikimedia.org/wiki/File:Disc_harrow%2C_Iford_-_geograph.org.uk_-_6927324.jpg\",\"changes\":\"Reducción y conversión a WebP; encuadre adaptable en la interfaz. La adaptación fotográfica conserva la licencia indicada.\",\"width\":960,\"height\":641,\"bytes\":139480,\"sha256\":\"ee41daa0ef0b46181939e7e10e0576105f44c4f4369b0c85a8c8227e35f70fce\"},{\"id\":\"demo-drone\",\"src\":\"/photos/market-examples/demo-drone.webp\",\"alt\":\"Dron en vuelo en un proyecto de cuenca del Servicio Forestal de Estados Unidos; foto ilustrativa. No representa un dron pulverizador ni acredita capacidades, accesorios u horas de uso.\",\"author\":\"Jamie Balke / USDA Forest Service - Northern Region\",\"license\":\"Public domain (USDA Forest Service)\",\"licenseUrl\":\"https://commons.wikimedia.org/wiki/File:Photos_of_Drone,_CGNF_(53251252750).jpg#Licensing\",\"source\":\"https://www.flickr.com/photos/fsnorthernregion/53251252750\",\"changes\":\"Recorte central para mostrar el dron. Reducción y conversión a WebP; encuadre adaptable en la interfaz. La adaptación fotográfica conserva la licencia indicada.\",\"width\":960,\"height\":640,\"bytes\":20746,\"sha256\":\"594536a1931d7b1807438347dfddbefc4dd10b15e867e0cd906d1325a06c7d1b\"},{\"id\":\"demo-cercas-malla\",\"src\":\"/photos/market-examples/demo-cercas-malla.webp\",\"alt\":\"Palas, rastrillos y otros útiles junto a una carretilla; fotografía ilustrativa de herramientas.\",\"author\":\"Das Ant\",\"license\":\"CC BY-SA 3.0\",\"licenseUrl\":\"https://creativecommons.org/licenses/by-sa/3.0/\",\"source\":\"https://commons.wikimedia.org/wiki/File:Gartengeraete.jpg\",\"changes\":\"Reducción y conversión a WebP; encuadre adaptable en la interfaz. La adaptación fotográfica conserva la licencia indicada.\",\"width\":640,\"height\":426,\"bytes\":43528,\"sha256\":\"73ee1d75c215f3b9192e8da0760b8d92026b3e430fafc10f4e24342dd8b21504\"},{\"id\":\"demo-finca-doce-hectareas\",\"src\":\"/photos/market-examples/demo-finca-doce-hectareas.webp\",\"alt\":\"Paisaje ganadero real de Guárico; fotografía contextual. No muestra una propiedad en venta ni acredita superficie, linderos, acceso o agua.\",\"author\":\"Christiane Pelda\",\"license\":\"CC BY-SA 3.0\",\"licenseUrl\":\"https://creativecommons.org/licenses/by-sa/3.0/\",\"source\":\"https://commons.wikimedia.org/wiki/File:Ganado%2C_Los_Llanos%2C_Gu%C3%A1rico.JPG\",\"changes\":\"Reducción y conversión a WebP; encuadre adaptable en la interfaz. La adaptación fotográfica conserva la licencia indicada.\",\"width\":960,\"height\":518,\"bytes\":58408,\"sha256\":\"3d8362ba3dadfb05152bc72d49231742e6ce95ebaa101086e4fdcce51969f6f4\"},{\"id\":\"demo-servicios-revision-cercas\",\"src\":\"/photos/market-examples/demo-servicios-revision-cercas.webp\",\"alt\":\"Cerca rural instalada; foto ilustrativa del objeto de revisión. No muestra personal ni trabajo realizado por Venezuela Agro.\",\"author\":\"Evelyn Simak\",\"license\":\"CC BY-SA 2.0\",\"licenseUrl\":\"https://creativecommons.org/licenses/by-sa/2.0/\",\"source\":\"https://commons.wikimedia.org/wiki/File:Stock_fence_separating_cattle_pasture_from_farm_road_-_geograph.org.uk_-_1348451.jpg\",\"changes\":\"Reducción y conversión a WebP; encuadre adaptable en la interfaz. La adaptación fotográfica conserva la licencia indicada.\",\"width\":640,\"height\":480,\"bytes\":67128,\"sha256\":\"6d33b1f6823c2169fdcb8e446512d17e89bea1fa6c8401907fe8dcbe3e7fca38\"}]");
//#endregion
//#region lib/social-image.ts
var socialImageFormats = [
	{
		id: "instagram-feed",
		label: "Cuadrada · publicación",
		width: 1080,
		height: 1080
	},
	{
		id: "instagram-story",
		label: "Vertical · historia",
		width: 1080,
		height: 1920
	},
	{
		id: "facebook",
		label: "Horizontal · publicación",
		width: 1200,
		height: 630
	},
	{
		id: "whatsapp-status",
		label: "WhatsApp · estado",
		width: 1080,
		height: 1920
	}
];
function socialImageFilename(content, format) {
	return `venezuela-agro-${content.id.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 100) || "imagen"}-${format.id}.png`;
}
function socialImageCredit(photo) {
	if (!photo) return void 0;
	if (photo.credit) return photo.credit;
	const known = [
		...productPhotos,
		...sitePhotos,
		...market_example_photos_default
	].find((row) => row.src === photo.src);
	if (known) return known;
	const inventory = inventory_example_photos_default.items.find((row) => row.src === photo.src);
	if (inventory) return {
		author: inventory.author,
		license: inventory.license,
		source: inventory.source_url,
		licenseUrl: inventory.license_url
	};
	if (photo.src === "/photo-cacao.webp") return {
		author: "Fotografía de contexto · Pexels",
		license: "Licencia Pexels",
		source: "https://www.pexels.com/search/cocoa%20farm/",
		licenseUrl: "https://www.pexels.com/license/"
	};
}
/** Remove links from pixels only. The original data/link and on-page credits are unchanged. */
function withoutImageUrls(value) {
	const contacts = [];
	return value.replace(/mailto:([^\s<>]+)/giu, "$1").replace(/tel:([+\d(). -]+)/giu, "$1").replace(/[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,63}/giu, (email) => `\uE000${contacts.push(email) - 1}\uE001`).replace(/(?:https?:\/\/|ftp:\/\/|www\.)[^\s<>()\[\]]+/giu, "").replace(/(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?\.)+[\p{L}]{2,63}(?::\d{1,5})?(?:[/?#][^\s<>]*)?/giu, "").replace(/\b(?:\d{1,3}\.){3}\d{1,3}(?::\d{1,5})?(?:[/?#][^\s<>()\[\]]*)?/g, "").replace(/\(\s*\)|\[\s*\]/g, "").replace(/\uE000(\d+)\uE001/g, (_, index) => contacts[Number(index)] || "").replace(/[ \t]{2,}/g, " ").replace(/^[ \t]+|[ \t]+$/gm, "").trim();
}
/** No metadata-only substitute: native apps may strip metadata and accompanying captions. */
function urlFreeSocialPhoto(photo) {
	if (!photo) return { omitted: false };
	const alternate = SHARE_PHOTO_REPLACEMENTS[photo.src];
	if (alternate) return {
		photo: alternate,
		omitted: false,
		replacement: alternate.kind
	};
	const credit = socialImageCredit(photo);
	const permitsLinkFree = credit && /^(?:CC0(?:\s|$)|Public domain(?:\s|$)|Licencia Pexels$)/i.test(credit.license);
	if (credit && !permitsLinkFree || !credit && photo.creditHref) return { omitted: true };
	return {
		photo,
		omitted: false
	};
}
function safeSocialImageSource(src, origin) {
	if (/^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(src)) return src;
	const source = new URL(src, origin);
	if (source.origin !== origin || !/^https?:$/.test(source.protocol)) throw new Error("same_origin_image_required");
	return source.href;
}
function wrapImageText(ctx, text, width) {
	const rows = [];
	for (const paragraph of text.split("\n")) {
		let row = "";
		for (const word of paragraph.split(/\s+/).filter(Boolean)) {
			if (row && ctx.measureText(`${row} ${word}`).width > width) {
				rows.push(row);
				row = "";
			}
			for (const char of row ? ` ${word}` : word) {
				if (row && ctx.measureText(row + char).width > width) {
					rows.push(row);
					row = "";
				}
				row += char;
			}
		}
		if (row) rows.push(row);
	}
	return rows;
}
function abortError() {
	return new DOMException("Image preparation cancelled", "AbortError");
}
async function loadImage(src, signal) {
	if (signal?.aborted) throw abortError();
	return new Promise((resolve, reject) => {
		const image = new Image();
		const cleanup = () => {
			clearTimeout(timer);
			signal?.removeEventListener("abort", cancel);
			image.onload = null;
			image.onerror = null;
		};
		const cancel = () => {
			cleanup();
			image.src = "";
			reject(abortError());
		};
		const timer = setTimeout(() => {
			cleanup();
			image.src = "";
			reject(/* @__PURE__ */ new Error("image_timeout"));
		}, 15e3);
		image.onload = () => {
			cleanup();
			if (image.naturalWidth) resolve(image);
			else reject(/* @__PURE__ */ new Error("image_unavailable"));
		};
		image.onerror = () => {
			cleanup();
			reject(/* @__PURE__ */ new Error("image_unavailable"));
		};
		signal?.addEventListener("abort", cancel, { once: true });
		image.src = src;
	});
}
async function buildSocialImage(content, format, signal) {
	const selection = urlFreeSocialPhoto(content.photo);
	if (selection.omitted) throw new Error("share_photo_needs_replacement");
	const image = selection.photo ? await loadImage(safeSocialImageSource(selection.photo.src, location.origin), signal) : void 0;
	if (signal?.aborted) throw abortError();
	const canvas = document.createElement("canvas");
	canvas.width = format.width;
	canvas.height = format.height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("canvas_unavailable");
	const w = canvas.width, h = canvas.height, pad = 42, wide = h < 800;
	const photoW = wide ? 420 : w, photoH = image ? wide ? h : Math.round(h * (h > w ? .4 : .31)) : 0;
	ctx.fillStyle = "#f3ebdd";
	ctx.fillRect(0, 0, w, h);
	if (image) {
		const scale = selection.photo?.fit === "contain" ? Math.min(photoW / image.naturalWidth, photoH / image.naturalHeight) : Math.max(photoW / image.naturalWidth, photoH / image.naturalHeight);
		ctx.save();
		ctx.beginPath();
		ctx.rect(0, 0, photoW, photoH);
		ctx.clip();
		ctx.drawImage(image, (photoW - image.naturalWidth * scale) / 2, (photoH - image.naturalHeight * scale) / 2, image.naturalWidth * scale, image.naturalHeight * scale);
		ctx.restore();
	}
	const x = wide && image ? photoW + 30 : pad, width = w - x - pad;
	const footerH = 112, contentBottom = h - footerH - 18;
	let y = image && !wide ? photoH + 37 : 38, shortened = false;
	const draw = (text, font, lineHeight, max, color, gap = 10) => {
		if (!text) return;
		const cleaned = withoutImageUrls(text);
		if (!cleaned) return;
		ctx.font = font;
		ctx.fillStyle = color;
		const all = wrapImageText(ctx, cleaned, width), count = Math.max(0, Math.min(max, Math.floor((contentBottom - y) / lineHeight) + 1));
		const rows = all.slice(0, count);
		if (all.length > rows.length) {
			shortened = true;
			if (rows.length) rows[rows.length - 1] = rows[rows.length - 1].slice(0, -2) + "…";
		}
		for (const row of rows) {
			ctx.fillText(row, x, y);
			y += lineHeight;
		}
		if (rows.length) y += gap;
	};
	draw("VENEZUELA AGRO", "bold 23px sans-serif", 29, 1, "#4c6b3a", 5);
	draw(content.category, "18px sans-serif", 24, 1, "#655c51", 14);
	draw(content.title, `bold ${wide ? 32 : 38}px sans-serif`, wide ? 38 : 45, 2, "#3e2a19", 12);
	draw(content.detail, "bold 24px sans-serif", 30, 2, "#4c6b3a", 12);
	draw(content.publicContact?.name ? `Publicado por: ${content.publicContact.name}` : void 0, "bold 22px sans-serif", 29, 2, "#3e2a19", 7);
	if (!content.demo && content.publicContact?.phone) draw(`Teléfono: ${content.publicContact.phone}`, "bold 26px sans-serif", 34, 1, "#365026", 14);
	const remainingLines = Math.max(1, Math.floor((contentBottom - y) / 29));
	draw(content.description, `${wide ? 21 : 23}px sans-serif`, 29, Math.min(content.facts?.length ? 4 : 9, remainingLines), "#655c51", 12);
	if (content.facts?.length) draw(content.facts.join(" · "), "20px sans-serif", 27, 4, "#655c51");
	ctx.fillStyle = "#e8efdf";
	ctx.fillRect(0, h - footerH, w, footerH);
	ctx.fillStyle = "#3e2a19";
	ctx.font = "bold 19px sans-serif";
	ctx.fillText(content.demo ? "DEMOSTRACIÓN · Datos ficticios · Sin oferta real" : "Consulta disponibilidad y condiciones con el anunciante", pad, h - footerH + 32, w - pad * 2);
	ctx.fillStyle = "#655c51";
	ctx.font = "18px sans-serif";
	if (shortened) ctx.fillText("Texto resumido para este formato. Consulta la ficha completa.", pad, h - footerH + 63, w - pad * 2);
	if (selection.replacement || socialImageCredit(content.photo)) ctx.fillText(selection.replacement === "illustration" ? "Ilustración de referencia; no representa un producto real." : "Fotografía de referencia; confirma la presentación y características.", pad, h - footerH + 91, w - pad * 2);
	if (signal?.aborted) throw abortError();
	return new Promise((resolve, reject) => canvas.toBlob((blob) => {
		if (signal?.aborted) reject(abortError());
		else if (blob?.size) resolve(blob);
		else reject(/* @__PURE__ */ new Error("image_export_failed"));
	}, "image/png"));
}
//#endregion
//#region lib/image-share.ts
function canShareImage(file, browser) {
	if (!file.size || !/^image\/(png|jpeg|webp)$/.test(file.type) || !browser.share || !browser.canShare) return false;
	try {
		return browser.canShare({ files: [file] });
	} catch {
		return false;
	}
}
function createImageShareController() {
	let pending = false;
	return { share(file, browser) {
		if (pending) return Promise.resolve("busy");
		if (!canShareImage(file, browser)) return Promise.resolve("unsupported");
		if (browser.userActivation?.isActive === false) return Promise.resolve("gesture-required");
		pending = true;
		const failure = (error) => {
			const name = typeof error === "object" && error !== null && "name" in error ? error.name : "";
			if (name === "AbortError") return "cancelled";
			if (name === "NotAllowedError") return "gesture-required";
			if (name === "InvalidStateError") return "busy";
			return "failed";
		};
		try {
			return Promise.resolve(browser.share({ files: [file] })).then(() => "opened", failure).finally(() => {
				pending = false;
			});
		} catch (error) {
			pending = false;
			return Promise.resolve(failure(error));
		}
	} };
}
var imageShareController = createImageShareController();
var imageShareMessages = {
	opened: "La imagen se entregó al menú del dispositivo. Revisa el destino y confirma allí el envío o la publicación.",
	cancelled: "Compartir cancelado. La imagen sigue lista por si quieres intentarlo de nuevo.",
	unsupported: "Este navegador no permite enviar este archivo al menú de compartir. Descarga la imagen y selecciónala desde la app que prefieras.",
	"gesture-required": "El navegador no permitió abrir el menú. Vuelve a tocar Compartir imagen; si sigue bloqueado, abre la web directamente en Safari o Chrome, o descarga la imagen.",
	busy: "Ya hay un menú de compartir abierto. Ciérralo antes de volver a intentarlo.",
	failed: "No se pudo abrir el menú con la imagen. Puedes volver a intentarlo o descargarla para adjuntarla desde la app."
};
//#endregion
//#region components/image-share.tsx
var image_share_exports = /* @__PURE__ */ __exportAll({
	ImageShareButton: () => ImageShareButton,
	ImageSharePanel: () => ImageSharePanel
});
var import_jsx_runtime = require_jsx_runtime();
function ImageShareButton({ content, label = "Compartir imagen", className = "button-light" }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, {
					size: 17,
					"aria-hidden": "true"
				}), label]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "bg-[#f8f3ea] sm:max-w-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Comparte una imagen" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Revisa la imagen y elige dónde enviarla. La publicación final siempre la confirmas tú." }),
				open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageSharePanel, { content })
			]
		})]
	});
}
function ImageSharePanel({ content }) {
	const [formatId, setFormatId] = (0, import_react.useState)("instagram-feed"), [retry, setRetry] = (0, import_react.useState)(0);
	const [prepared, setPrepared] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(""), [notice, setNotice] = (0, import_react.useState)(""), [sharing, setSharing] = (0, import_react.useState)(false), [link, setLink] = (0, import_react.useState)("");
	const mounted = (0, import_react.useRef)(true), shareLock = (0, import_react.useRef)(false), preparationEpoch = (0, import_react.useRef)(0);
	const selectId = (0, import_react.useId)(), statusId = (0, import_react.useId)();
	const format = socialImageFormats.find((item) => item.id === formatId);
	const contentKey = JSON.stringify(content), preparationKey = `${contentKey}:${formatId}:${retry}`;
	const ready = prepared?.key === preparationKey ? prepared : null;
	(0, import_react.useEffect)(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const controller = new AbortController(), epoch = ++preparationEpoch.current;
		let previewUrl;
		const data = JSON.parse(contentKey);
		Promise.resolve().then(() => {
			if (controller.signal.aborted) return;
			setPrepared(null);
			setError("");
			setNotice("");
			const target = new URL(data.path, location.origin);
			setLink(target.origin === location.origin ? target.href : "");
			return buildSocialImage(data, format, controller.signal);
		}).then((blob) => {
			if (!blob || controller.signal.aborted || preparationEpoch.current !== epoch) return;
			const file = new File([blob], socialImageFilename(data, format), { type: "image/png" });
			previewUrl = URL.createObjectURL(file);
			setPrepared({
				key: preparationKey,
				file,
				url: previewUrl,
				supported: canShareImage(file, navigator)
			});
		}).catch((cause) => {
			if (controller.signal.aborted || preparationEpoch.current !== epoch || cause?.name === "AbortError") return;
			setError(cause?.message === "share_photo_needs_replacement" ? "Esta fotografía requiere créditos. Necesita una alternativa autorizada para compartirla sin créditos ni URLs." : "No pudimos preparar la imagen. Revisa la conexión y vuelve a intentarlo.");
		});
		return () => {
			controller.abort();
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	}, [
		contentKey,
		format,
		preparationKey
	]);
	function share() {
		if (!ready || shareLock.current) return;
		shareLock.current = true;
		const epoch = preparationEpoch.current;
		setSharing(true);
		setNotice("");
		imageShareController.share(ready.file, navigator).then((status) => {
			if (mounted.current && preparationEpoch.current === epoch) setNotice(imageShareMessages[status]);
		}).finally(() => {
			shareLock.current = false;
			if (mounted.current) setSharing(false);
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 space-y-4",
		"data-image-share-panel": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: selectId,
				className: "block text-xs font-semibold",
				children: "Formato de la imagen"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				id: selectId,
				disabled: sharing,
				value: formatId,
				onChange: (event) => setFormatId(event.target.value),
				className: "h-12 w-full min-w-0 rounded-xl border bg-white px-3 text-sm",
				children: socialImageFormats.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
					value: item.id,
					children: [
						item.label,
						" · ",
						item.width,
						" × ",
						item.height
					]
				}, item.id))
			}),
			ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: ready.url,
				alt: `Imagen preparada: ${content.title}`,
				width: format.width,
				height: format.height,
				className: "max-h-64 w-full rounded-xl border bg-white object-contain"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "rounded-xl bg-white p-5 text-sm",
				children: error || "Preparando imagen PNG…"
			}),
			urlFreeSocialPhoto(content.photo).replacement && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "rounded-xl bg-[#eadfcd] p-3 text-xs leading-6",
				children: [
					"Para compartir sin créditos, esta versión usa una ",
					urlFreeSocialPhoto(content.photo).replacement === "illustration" ? "ilustración" : "fotografía",
					" de referencia alternativa. La fotografía original y sus créditos siguen en la ficha."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-6",
				children: "Conserva nombre, teléfono público y descripción cuando estén disponibles. El texto largo se resume para que sea legible; no se añaden créditos ni URLs a la imagen."
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "button-light",
				onClick: () => setRetry((value) => value + 1),
				children: "Reintentar imagen"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: share,
				disabled: !ready || sharing,
				"aria-describedby": statusId,
				className: "button-dark w-full disabled:opacity-50",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, {
					size: 18,
					"aria-hidden": "true"
				}), sharing ? "Menú de compartir abierto…" : "Compartir imagen"]
			}),
			ready && !ready.supported && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl bg-[#eadfcd] p-3 text-xs leading-6",
				children: imageShareMessages.unsupported
			}),
			ready && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				className: "button-light w-full",
				href: ready.url,
				download: ready.file.name,
				onClick: (event) => {
					if (sharing) {
						event.preventDefault();
						return;
					}
					setNotice("Descarga solicitada. Si el navegador abre la imagen, usa Guardar imagen. Después selecciónala en Fotos, Galería o Archivos desde la app.");
				},
				"aria-disabled": sharing,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
					size: 17,
					"aria-hidden": "true"
				}), "Descargar imagen PNG"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-6",
				children: "Elige WhatsApp u otra app en el menú del dispositivo. Para un estado o historia, elige ese destino si aparece; si no, guarda la imagen y selecciónala dentro de WhatsApp, Instagram, Facebook o TikTok. La web no puede elegir la app ni publicar automáticamente."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-6",
				children: "Se comparte el archivo que ves aquí. Envíalo solo si quieres que sus destinatarios lo vean. El sitio conserva su acceso privado."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				id: statusId,
				role: "status",
				"aria-live": "polite",
				className: "break-words text-sm leading-6 text-[#365026]",
				children: notice
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "rounded-xl border bg-white p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "min-h-11 cursor-pointer py-3 text-sm font-semibold",
						children: "Copiar enlace de la ficha"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-xs leading-6",
						children: "El enlace no adjunta la imagen ni concede acceso al sitio privado."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: link,
						"aria-label": "Enlace de la ficha",
						readOnly: true,
						onFocus: (event) => event.target.select(),
						className: "h-12 w-full min-w-0 rounded-lg border px-3 text-xs"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: !link || sharing,
						className: "button-light mt-3",
						onClick: () => {
							navigator.clipboard?.writeText(link).then(() => setNotice("Enlace copiado."), () => setNotice("No se pudo copiar. Selecciona el enlace para copiarlo manualmente."));
							if (!navigator.clipboard) setNotice("Selecciona el enlace para copiarlo manualmente.");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
							size: 16,
							"aria-hidden": "true"
						}), "Copiar enlace"]
					})
				]
			})
		]
	});
}
//#endregion
export { market_example_photos_default as i, ImageSharePanel as n, image_share_exports as r, ImageShareButton as t };
