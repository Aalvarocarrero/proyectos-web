import { c as numberType, d as stringType, f as unionType, l as objectType, m as ZodIssueCode, n as arrayType, o as enumType, r as booleanType, s as literalType } from "./types-O06YnHo2.js";
import { c as currencySchema } from "./exchange-rates-cDoWbx0h.js";
import { n as agroFamilies } from "./agro-catalog-DV8tudCB.js";
import { t as venezuelanStates } from "./venezuela-Cj1crq10.js";
//#region lib/professional-demo-portraits.ts
var professionalDemoPortraits = [
	{
		"id": "ejemplo-empresa",
		"src": "/profiles/fictional/ejemplo-empresa.webp",
		"width": 512,
		"height": 512,
		"bytes": 41848,
		"alt": "Retrato generado por IA de Servicios Campo Horizonte, equipo ficticio de demostración",
		"disclosure": "Imagen generada por IA · perfil 100 % ficticio"
	},
	{
		"id": "ejemplo-agronomia",
		"src": "/profiles/fictional/ejemplo-agronomia.webp",
		"width": 512,
		"height": 512,
		"bytes": 38348,
		"alt": "Retrato generado por IA de Marina Rivas, profesional ficticio de demostración",
		"disclosure": "Imagen generada por IA · perfil 100 % ficticio"
	},
	{
		"id": "ejemplo-veterinaria",
		"src": "/profiles/fictional/ejemplo-veterinaria.webp",
		"width": 512,
		"height": 512,
		"bytes": 31006,
		"alt": "Retrato generado por IA de Diego Salcedo, profesional ficticio de demostración",
		"disclosure": "Imagen generada por IA · perfil 100 % ficticio"
	},
	{
		"id": "ejemplo-drones",
		"src": "/profiles/fictional/ejemplo-drones.webp",
		"width": 512,
		"height": 512,
		"bytes": 36626,
		"alt": "Retrato generado por IA de Valeria Cedeño, profesional ficticio de demostración",
		"disclosure": "Imagen generada por IA · perfil 100 % ficticio"
	},
	{
		"id": "ejemplo-derecho",
		"src": "/profiles/fictional/ejemplo-derecho.webp",
		"width": 512,
		"height": 512,
		"bytes": 23698,
		"alt": "Retrato generado por IA de Gabriel Montes, profesional ficticio de demostración",
		"disclosure": "Imagen generada por IA · perfil 100 % ficticio"
	},
	{
		"id": "ejemplo-topografia",
		"src": "/profiles/fictional/ejemplo-topografia.webp",
		"width": 512,
		"height": 512,
		"bytes": 30436,
		"alt": "Retrato generado por IA de Lucía Valera, profesional ficticio de demostración",
		"disclosure": "Imagen generada por IA · perfil 100 % ficticio"
	},
	{
		"id": "ejemplo-acuicultura",
		"src": "/profiles/fictional/ejemplo-acuicultura.webp",
		"width": 512,
		"height": 512,
		"bytes": 27578,
		"alt": "Retrato generado por IA de Andrés Rivero, profesional ficticio de demostración",
		"disclosure": "Imagen generada por IA · perfil 100 % ficticio"
	},
	{
		"id": "ejemplo-avicultura",
		"src": "/profiles/fictional/ejemplo-avicultura.webp",
		"width": 512,
		"height": 512,
		"bytes": 25540,
		"alt": "Retrato generado por IA de Camila Figueroa, profesional ficticio de demostración",
		"disclosure": "Imagen generada por IA · perfil 100 % ficticio"
	},
	{
		"id": "ejemplo-apicultura",
		"src": "/profiles/fictional/ejemplo-apicultura.webp",
		"width": 512,
		"height": 512,
		"bytes": 36022,
		"alt": "Retrato generado por IA de Tomás Beltrán, profesional ficticio de demostración",
		"disclosure": "Imagen generada por IA · perfil 100 % ficticio"
	},
	{
		"id": "ejemplo-mecanica",
		"src": "/profiles/fictional/ejemplo-mecanica.webp",
		"width": 512,
		"height": 512,
		"bytes": 33236,
		"alt": "Retrato generado por IA de Rafael Suárez, profesional ficticio de demostración",
		"disclosure": "Imagen generada por IA · perfil 100 % ficticio"
	},
	{
		"id": "ejemplo-logistica",
		"src": "/profiles/fictional/ejemplo-logistica.webp",
		"width": 512,
		"height": 512,
		"bytes": 31748,
		"alt": "Retrato generado por IA de Sofía Méndez, profesional ficticio de demostración",
		"disclosure": "Imagen generada por IA · perfil 100 % ficticio"
	},
	{
		"id": "ejemplo-riego",
		"src": "/profiles/fictional/ejemplo-riego.webp",
		"width": 512,
		"height": 512,
		"bytes": 26908,
		"alt": "Retrato generado por IA de Mateo Paredes, profesional ficticio de demostración",
		"disclosure": "Imagen generada por IA · perfil 100 % ficticio"
	}
];
//#endregion
//#region lib/network-profile.ts
var url = stringType().trim().max(500).default("").refine((v) => {
	if (!v) return true;
	try {
		const u = new URL(v);
		return ["https:", "http:"].includes(u.protocol) && !u.username && !u.password;
	} catch {
		return false;
	}
}, "Usa un enlace completo https://…");
var socialFields = [
	["instagram", "Instagram"],
	["tiktok", "TikTok"],
	["facebook", "Facebook"],
	["youtube", "YouTube"],
	["linkedin", "LinkedIn"],
	["threads", "Threads"],
	["x", "X"],
	["pinterest", "Pinterest"],
	["telegram", "Telegram"],
	["website", "Sitio web"]
];
var publicSocialFields = socialFields.filter(([key]) => [
	"instagram",
	"tiktok",
	"facebook",
	"youtube",
	"website"
].includes(key));
var domains = {
	instagram: ["instagram.com"],
	tiktok: ["tiktok.com"],
	facebook: ["facebook.com", "fb.com"],
	youtube: ["youtube.com", "youtu.be"],
	linkedin: ["linkedin.com"],
	threads: ["threads.net", "threads.com"],
	x: ["x.com", "twitter.com"],
	pinterest: ["pinterest.com", "pin.it"],
	telegram: ["t.me", "telegram.me"]
};
var socialSchema = objectType(Object.fromEntries(socialFields.map(([key]) => [key, url.refine((value) => {
	if (!value || key === "website") return true;
	try {
		const host = new URL(value).hostname.toLowerCase();
		return domains[key]?.some((d) => host === d || host.endsWith("." + d)) || false;
	} catch {
		return false;
	}
}, "El enlace debe corresponder a esta red social.")])));
var publicFarmSchema = objectType({
	whatsapp: booleanType().optional(),
	name: stringType().trim().min(3).max(120),
	responsibleName: stringType().trim().min(3).max(120),
	phone: stringType().trim().min(7).max(40).refine((v) => /^[+\d\s().-]+$/.test(v) && v.replace(/\D/g, "").length >= 7 && v.replace(/\D/g, "").length <= 15, "Introduce un teléfono válido"),
	state: enumType(venezuelanStates),
	municipality: stringType().trim().max(100).default(""),
	description: stringType().trim().min(20).max(1200),
	rubrics: stringType().trim().min(3).max(500),
	purposes: arrayType(enumType([
		"Producción",
		"Venta de animales",
		"Venta de productos",
		"Visitas",
		"Capacitaciones",
		"Venta de la propiedad"
	])).min(1).max(6),
	productionProcess: stringType().trim().max(2e3).optional(),
	saleOptions: stringType().trim().max(1500).optional(),
	farmType: enumType([
		"Productora",
		"Turística",
		"Mixta",
		"Cultivos y cosechas",
		"Transformación de alimentos",
		"Propiedad en venta"
	]).optional(),
	visitConditions: stringType().trim().max(700).default(""),
	socials: socialSchema.default({}),
	imageDataUrl: stringType().max(65e4).regex(/^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/).optional(),
	imageKey: stringType().regex(/^marketplace\/public-farms\/(?:[a-zA-Z0-9_%.-]+\/){1,3}cover\.(webp|jpg|png)$/).optional(),
	actingUserId: stringType().max(160).optional()
});
var socialPostSchema = objectType({
	listingId: stringType().regex(/^[a-zA-Z0-9_-]{3,160}$/).optional(),
	farmId: stringType().min(3).max(160),
	text: stringType().trim().min(3).max(500),
	actingUserId: stringType().min(1).max(160)
});
var socialCommentSchema = objectType({
	postId: stringType().min(3).max(160),
	text: stringType().trim().min(2).max(500),
	actingUserId: stringType().min(1).max(160)
});
var socialReactionSchema = objectType({
	postId: stringType().min(3).max(160),
	liked: booleanType(),
	actingUserId: stringType().min(1).max(160)
});
function farmPhoto(f) {
	return f.imageKey ? `/api/media/${f.imageKey}` : f.demo ? f.demoImage || "/photo-cacao.webp" : null;
}
var demoPublicFarms = [
	{
		"id": "ejemplo-finca-comunidad",
		"name": "Cacao del Horizonte · ejemplo",
		"responsibleName": "Responsable demostrativo",
		"phone": "",
		"state": "Sucre",
		"municipality": "Zona de ejemplo",
		"description": "Una finca de ejemplo dedicada al cacao y al café: registro de cosechas, fermentación, secado y presentación de lotes para compradores.",
		"rubrics": "Cacao y café",
		"purposes": [
			"Producción",
			"Venta de productos",
			"Capacitaciones"
		],
		"visitConditions": "Visitas exclusivamente con cita confirmada. Datos e imágenes demostrativos.",
		"socials": {},
		"demo": true,
		"demoImage": "/photo-cacao.webp",
		"productionProcess": "Cosecha por lote → selección → fermentación y secado → pesaje → venta. Fechas, humedad y resultados se registran por el productor.",
		"saleOptions": "Grano por kg, sacos o toneladas; muestras de 200 g y 500 g. Condiciones y precio por confirmar.",
		"gallery": [{
			"src": "/photo-cacao.webp",
			"caption": "Instalaciones o cultivo: imagen ilustrativa de ejemplo"
		}]
	},
	{
		"id": "ejemplo-finca-pollos",
		"name": "Granja Alas del Llano · ejemplo",
		"responsibleName": "Responsable demostrativo",
		"phone": "",
		"state": "Barinas",
		"municipality": "Zona de ejemplo",
		"description": "Ejemplo de granja avícola con galpón ventilado, bebederos y comederos. Presenta sus lotes, instalaciones y formatos de entrega para familias, restaurantes y distribuidores.",
		"rubrics": "Pollos de engorde y aves",
		"purposes": [
			"Producción",
			"Venta de animales",
			"Venta de productos"
		],
		"visitConditions": "Visitas exclusivamente con cita confirmada. Datos e imágenes demostrativos.",
		"socials": {},
		"demo": true,
		"demoImage": "/demo-poultry.webp",
		"productionProcess": "Recepción del lote → registro de alimento, agua y peso → seguimiento sanitario → evaluación de salida. Ejemplo orientativo de 42–49 días; depende de genética, manejo y condiciones, no es garantía.",
		"saleOptions": "Pollo en pie por unidad o lote; entero beneficiado, despresado o cortes por kg; pedidos empresariales sujetos a disponibilidad y requisitos sanitarios.",
		"gallery": [{
			"src": "/demo-poultry.webp",
			"caption": "Instalaciones o cultivo: imagen ilustrativa de ejemplo"
		}, {
			"src": "/demo-poultry-product.webp",
			"caption": "Producto y formatos de venta: imagen generada de ejemplo, sin oferta real."
		}]
	},
	{
		"id": "ejemplo-finca-ganadera",
		"name": "Hato Camino Verde · ejemplo",
		"responsibleName": "Responsable demostrativo",
		"phone": "",
		"state": "Apure",
		"municipality": "Zona de ejemplo",
		"description": "Ejemplo de producción bovina con identificación individual, pesajes y visitas coordinadas. La ficha permite explicar procedencia, alimentación y disponibilidad de cada lote.",
		"rubrics": "Bovinos, leche y cárnicos",
		"purposes": [
			"Producción",
			"Venta de animales",
			"Venta de productos"
		],
		"visitConditions": "Visitas exclusivamente con cita confirmada. Datos e imágenes demostrativos.",
		"socials": {},
		"demo": true,
		"demoImage": "/photos/ordeno.webp",
		"productionProcess": "Identificación → controles y pesajes → evaluación del lote → acuerdo con el comprador. Documentación sanitaria y movilización se revisan antes de entregar.",
		"saleOptions": "Animales en pie por unidad o lote; cárnicos por cortes y kg cuando estén disponibles y habilitados.",
		"gallery": [{
			"src": "/photos/cosecha-papa.webp",
			"caption": "Bovinos en trabajo agrícola, Trujillo. Fotografía documental de contexto, no de esta finca demostrativa. Créditos fotográficos al pie del sitio."
		}]
	},
	{
		"id": "ejemplo-finca-turistica",
		"name": "Senderos de Montaña · ejemplo",
		"responsibleName": "Responsable demostrativo",
		"phone": "",
		"state": "Mérida",
		"municipality": "Zona de ejemplo",
		"description": "Una muestra de finca turística con recorridos de producción, talleres y degustaciones. La visita requiere reserva, confirmación y condiciones de acceso.",
		"rubrics": "Turismo rural, café y visitas",
		"purposes": [
			"Visitas",
			"Capacitaciones",
			"Venta de productos"
		],
		"visitConditions": "Visitas exclusivamente con cita confirmada. Datos e imágenes demostrativos.",
		"socials": {},
		"demo": true,
		"demoImage": "/photos/paramo-siembra.webp",
		"productionProcess": "Consulta → selección de experiencia → confirmación del grupo → visita. Horarios, accesibilidad y precio se acuerdan directamente.",
		"saleOptions": "Recorrido con reserva, talleres por grupo y productos disponibles en finca.",
		"gallery": [{
			"src": "/photos/paramo-siembra.webp",
			"caption": "Paisaje agrícola del páramo de Mérida. Foto documental de contexto, no de esta finca ficticia. Créditos fotográficos al pie del sitio."
		}]
	},
	{
		"id": "ejemplo-finca-venta",
		"name": "La Vega Productiva · ejemplo",
		"responsibleName": "Responsable demostrativo",
		"phone": "",
		"state": "Portuguesa",
		"municipality": "Zona de ejemplo",
		"description": "Ejemplo de propiedad rural en venta. La publicación puede detallar superficie declarada, accesos, agua, instalaciones y uso actual sin publicar documentos privados.",
		"rubrics": "Finca y terreno para venta",
		"purposes": ["Venta de la propiedad"],
		"visitConditions": "Visitas exclusivamente con cita confirmada. Datos e imágenes demostrativos.",
		"socials": {},
		"demo": true,
		"demoImage": "/photos/amanecer-trujillo.webp",
		"productionProcess": "Consulta → cita → revisión documental por las partes y profesionales competentes. El directorio no certifica títulos ni linderos.",
		"saleOptions": "Venta de la propiedad: precio referencial por consulta, negociación directa y revisión documental.",
		"gallery": [{
			"src": "/photos/paramo-siembra.webp",
			"caption": "Fotografía documental de contexto en Mérida. No corresponde a la propiedad de este ejemplo ficticio. Créditos fotográficos al pie del sitio."
		}]
	},
	{
		"id": "ejemplo-finca-vinedo",
		"name": "Arroz del Horizonte · ejemplo",
		"responsibleName": "Responsable demostrativo",
		"phone": "",
		"state": "Portuguesa",
		"municipality": "Zona de ejemplo",
		"description": "Ficha ficticia para explicar el seguimiento de un cultivo de arroz, su cosecha y acondicionamiento. La fotografía es documental de contexto en Turén; no acredita propiedad ni una oferta disponible.",
		"rubrics": "Arroz y cereales",
		"purposes": [
			"Producción",
			"Venta de productos",
			"Visitas"
		],
		"visitConditions": "Visitas exclusivamente con cita confirmada. Datos e imágenes demostrativos.",
		"socials": {},
		"demo": true,
		"demoImage": "/photos/faena-arrozal.webp",
		"productionProcess": "Identificación del lote → seguimiento del cultivo → cosecha → secado y acondicionamiento según el producto. Fechas y resultados se registran, no se garantizan.",
		"saleOptions": "Lotes de cereal con peso, humedad y condiciones revisados por las partes. Sin inventario ni precio real en esta demostración.",
		"gallery": [{
			"src": "/photos/faena-arrozal.webp",
			"caption": "Trabajo en un arrozal de Turén, Portuguesa. Fotografía de contexto; no corresponde a esta finca ficticia. Créditos fotográficos al pie del sitio."
		}]
	}
];
var demoPosts = [
	{
		"id": "ejemplo-publicacion-comunidad",
		"farmId": "ejemplo-finca-comunidad",
		"text": "Hoy registramos la cosecha por lote y preparamos muestras de cacao. Un ejemplo de cómo compartir tus procesos y conectar con compradores.",
		"authorName": "Cacao del Horizonte · ejemplo",
		"createdAt": "2026-10-04T00:00:00Z",
		"likes": 0,
		"liked": false,
		"comments": [{
			"id": "demo-comment-0",
			"text": "Ejemplo de comentario: ¿cómo puedo consultar la disponibilidad o reservar una visita?",
			"authorName": "Productor de ejemplo",
			"createdAt": "2026-10-04T00:00:00Z"
		}],
		"demo": true,
		"imageUrl": "/photo-cacao.webp"
	},
	{
		"id": "ejemplo-publicacion-1",
		"farmId": "ejemplo-finca-pollos",
		"text": "Nuestro lote avícola avanza: registramos peso, consumo y controles. ¿Prefieres comprar pollo en pie, entero o por cortes? Publicación demostrativa.",
		"authorName": "Granja Alas del Llano · ejemplo",
		"createdAt": "2026-10-04T00:00:00Z",
		"likes": 0,
		"liked": false,
		"comments": [{
			"id": "demo-comment-1",
			"text": "Ejemplo de comentario: ¿cómo puedo consultar la disponibilidad o reservar una visita?",
			"authorName": "Productor de ejemplo",
			"createdAt": "2026-10-04T00:00:00Z"
		}],
		"demo": true,
		"imageUrl": "/demo-poultry.webp"
	},
	{
		"id": "ejemplo-publicacion-2",
		"farmId": "ejemplo-finca-ganadera",
		"text": "Así organizamos los pesajes del rebaño y las consultas por lote. Compartir registros útiles ayuda a explicar lo que produce tu finca.",
		"authorName": "Hato Camino Verde · ejemplo",
		"createdAt": "2026-10-04T00:00:00Z",
		"likes": 0,
		"liked": false,
		"comments": [{
			"id": "demo-comment-2",
			"text": "Ejemplo de comentario: ¿cómo puedo consultar la disponibilidad o reservar una visita?",
			"authorName": "Productor de ejemplo",
			"createdAt": "2026-10-04T00:00:00Z"
		}],
		"demo": true
	},
	{
		"id": "ejemplo-publicacion-3",
		"farmId": "ejemplo-finca-turistica",
		"text": "Abrimos una muestra de recorrido de campo con cita previa. ¿Qué te gustaría aprender en una visita a una finca?",
		"authorName": "Senderos de Montaña · ejemplo",
		"createdAt": "2026-10-04T00:00:00Z",
		"likes": 0,
		"liked": false,
		"comments": [{
			"id": "demo-comment-3",
			"text": "Ejemplo de comentario: ¿cómo puedo consultar la disponibilidad o reservar una visita?",
			"authorName": "Productor de ejemplo",
			"createdAt": "2026-10-04T00:00:00Z"
		}],
		"demo": true,
		"imageUrl": "/photos/paramo-siembra.webp"
	},
	{
		"id": "ejemplo-publicacion-4",
		"farmId": "ejemplo-finca-venta",
		"text": "¿Buscas una propiedad rural? Esta ficha de ejemplo muestra cómo presentar accesos, agua e instalaciones y coordinar una visita.",
		"authorName": "La Vega Productiva · ejemplo",
		"createdAt": "2026-10-04T00:00:00Z",
		"likes": 0,
		"liked": false,
		"comments": [{
			"id": "demo-comment-4",
			"text": "Ejemplo de comentario: ¿cómo puedo consultar la disponibilidad o reservar una visita?",
			"authorName": "Productor de ejemplo",
			"createdAt": "2026-10-04T00:00:00Z"
		}],
		"demo": true,
		"imageUrl": "/photos/jornada.webp"
	},
	{
		"id": "ejemplo-publicacion-5",
		"farmId": "ejemplo-finca-vinedo",
		"text": "Cada cultivo tiene su historia. Comparte avances, fechas y procesos para que otros conozcan tu producción.",
		"authorName": "Arroz del Horizonte · ejemplo",
		"createdAt": "2026-10-04T00:00:00Z",
		"likes": 0,
		"liked": false,
		"comments": [{
			"id": "demo-comment-5",
			"text": "Ejemplo de comentario: ¿cómo puedo consultar la disponibilidad o reservar una visita?",
			"authorName": "Productor de ejemplo",
			"createdAt": "2026-10-04T00:00:00Z"
		}],
		"demo": true,
		"imageUrl": "/photos/faena-arrozal.webp"
	}
];
//#endregion
//#region lib/professional-profile.ts
var serviceModes = [
	"Presencial",
	"Remoto",
	"Presencial y remoto",
	"Visitas programadas",
	"Jornadas de campo",
	"Capacitación presencial o virtual"
];
var tariffUnits = [
	"sesión",
	"hora",
	"visita",
	"jornada",
	"curso",
	"proyecto",
	"hectárea"
];
var professionalTariffSchema = objectType({
	mode: enumType(serviceModes),
	amount: numberType().finite("Indica un importe válido.").positive("La tarifa debe ser mayor que cero.").max(2e7, "Revisa el importe de la tarifa.").refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-5, "Usa como máximo dos decimales."),
	currency: currencySchema,
	unit: enumType(tariffUnits)
}).strict();
var professionalTariffsSchema = arrayType(professionalTariffSchema).max(serviceModes.length).refine((rows) => new Set(rows.map((row) => row.mode)).size === rows.length, "Publica una sola tarifa por modalidad.").default([]);
/** Editing a historical profile must not depend on unrelated optional fields being valid. */
function professionalTariffsForEditing(details) {
	const value = details && typeof details === "object" && !Array.isArray(details) ? details.tariffs : void 0;
	const parsed = professionalTariffsSchema.safeParse(value);
	return parsed.success ? parsed.data : [];
}
var agroSectors = [...new Set([
	"Bovinos",
	"Porcinos",
	"Aves",
	"Equinos",
	"Piscicultura",
	"Apicultura",
	"Cacao",
	"Café",
	"Pastos y forrajes",
	"Suelos y riego",
	"Maquinaria y drones",
	"Gestión y comercialización",
	...agroFamilies.map((f) => f.name)
])];
var link = stringType().trim().max(500).default("").refine((v) => !v || (() => {
	try {
		const u = new URL(v);
		return ["http:", "https:"].includes(u.protocol) && !u.username && !u.password;
	} catch {
		return false;
	}
})(), "Usa un enlace completo https://…");
var professionalDetailsSchema = objectType({
	tariffs: professionalTariffsSchema,
	profileType: enumType(["Persona natural", "Empresa"]).default("Persona natural"),
	corporateName: stringType().trim().max(180).default(""),
	tradeName: stringType().trim().max(180).default(""),
	registrationBody: stringType().trim().max(180).default(""),
	registrationReference: stringType().trim().max(180).default(""),
	taxId: stringType().trim().max(80).default(""),
	responsibleName: stringType().trim().max(120).default(""),
	bookingProcess: stringType().trim().max(1200).default(""),
	availability: stringType().trim().max(500).default(""),
	socials: socialSchema.default({}),
	yearsExperience: numberType().int().min(0).max(80).default(0),
	careerStage: enumType([
		"Recién graduado",
		"En ejercicio",
		"Especialista",
		"Consultor / trayectoria avanzada"
	]).default("En ejercicio"),
	university: stringType().trim().max(180).default(""),
	degree: stringType().trim().max(180).default(""),
	graduationYear: stringType().regex(/^$|^(19|20)\d{2}$/).default(""),
	training: stringType().trim().max(1800).default(""),
	trajectory: stringType().trim().max(2400).default(""),
	projects: stringType().trim().max(2400).default(""),
	services: stringType().trim().max(1800).default(""),
	coverageStates: arrayType(enumType(venezuelanStates)).max(24).default([]),
	sectors: arrayType(stringType().trim().min(1).max(80)).max(40).default([]),
	email: unionType([literalType(""), stringType().email()]).default(""),
	whatsapp: booleanType().default(false),
	website: link,
	linkedin: link,
	instagram: link,
	imageKey: stringType().regex(/^marketplace\/(?:[a-zA-Z0-9_%.-]+\/){1,4}cover\.(webp|jpg|png)$/).optional(),
	imageDataUrl: stringType().max(65e4).regex(/^data:image\/(?:webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/).optional()
}).superRefine((d, ctx) => {
	if (d.profileType === "Empresa" && !d.corporateName) ctx.addIssue({
		code: ZodIssueCode.custom,
		path: ["corporateName"],
		message: "Escribe el nombre corporativo de la empresa."
	});
});
function professionalDetails(row) {
	if (row.details) return professionalDetailsSchema.parse(row.details);
	try {
		const parsed = JSON.parse(row.credentialNote);
		return professionalDetailsSchema.parse(parsed.details);
	} catch {
		return professionalDetailsSchema.parse({});
	}
}
function professionalCredential(row) {
	try {
		return JSON.parse(row.credentialNote).credentialNote || "";
	} catch {
		return row.credentialNote;
	}
}
function professionalKeywords(row) {
	const d = professionalDetails(row);
	return [...new Set([
		row.profession,
		...row.specialties.split(/[,;·]/),
		...d.sectors,
		row.state,
		...d.coverageStates,
		"agro venezolano"
	].map((x) => x.trim()).filter(Boolean))].slice(0, 24);
}
function professionalImage(row) {
	const key = professionalDetails(row).imageKey;
	return key ? `/api/media/${key}` : row.demo ? professionalDemoPortraits.find((photo) => photo.id === row.id)?.src ?? null : null;
}
//#endregion
export { socialFields as _, professionalImage as a, socialSchema as b, professionalTariffsForEditing as c, demoPosts as d, demoPublicFarms as f, socialCommentSchema as g, publicSocialFields as h, professionalDetailsSchema as i, serviceModes as l, publicFarmSchema as m, professionalCredential as n, professionalKeywords as o, farmPhoto as p, professionalDetails as r, professionalTariffSchema as s, agroSectors as t, tariffUnits as u, socialPostSchema as v, socialReactionSchema as y };
