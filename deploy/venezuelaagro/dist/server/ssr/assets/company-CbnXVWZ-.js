import { c as numberType, d as stringType, f as unionType, l as objectType, m as ZodIssueCode, n as arrayType, o as enumType, r as booleanType, s as literalType } from "./types-O06YnHo2.js";
import { c as currencySchema } from "./exchange-rates-cDoWbx0h.js";
import { t as venezuelanStates } from "./venezuela-Cj1crq10.js";
//#region lib/company.ts
var companyCategories = [
	"Agrotienda e insumos",
	"Maquinaria y repuestos",
	"Riego y agua",
	"Tecnología agropecuaria",
	"Alimentos y transformación",
	"Alimentos para animales",
	"Ferretería y construcción",
	"Transporte y logística",
	"Servicios agropecuarios",
	"Veterinaria y salud animal",
	"Empaques y materiales",
	"Otra empresa agropecuaria"
];
var companyServiceModes = [
	"Presencial",
	"En línea",
	"Presencial y en línea",
	"Visitas y entregas"
];
var companyProductCategories = [
	"Maquinaria y repuestos",
	"Herramientas y cercas",
	"Riego y agua",
	"Tecnología agropecuaria",
	"Semillas y plantas",
	"Empaques y materiales",
	"Alimentos y cosechas",
	"Alimentos para animales",
	"Ferretería y construcción",
	"Servicios agropecuarios"
];
var COMPANY_CATALOG_NOTICE = "El catálogo admite productos y servicios de uso general. No publiques medicamentos, vacunas, plaguicidas, sustancias controladas ni otros productos regulados. Las empresas de salud animal pueden presentar sus servicios y datos de contacto.";
var COMPANY_MAX_IMAGE_LENGTH = 65e4;
var companyIdSchema = stringType().regex(/^[a-zA-Z0-9_-]{3,100}$/);
var companyImageKeySchema = stringType().max(240).regex(/^companies\/[a-zA-Z0-9_-]{3,100}\/[a-zA-Z0-9_-]{16,100}\/(?:logo|gallery-\d+|product-\d+)\.(?:webp|png|jpg)$/);
var imageDataUrl = stringType().max(COMPANY_MAX_IMAGE_LENGTH).regex(/^data:image\/(?:webp|jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/);
var optionalText = (maximum) => stringType().trim().max(maximum).default("");
var webLink = optionalText(500).refine((value) => {
	if (!value) return true;
	try {
		const url = new URL(value);
		return ["https:", "http:"].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password;
	} catch {
		return false;
	}
}, "Escribe un enlace completo https://…");
var socialLink = (hosts) => webLink.refine((value) => {
	if (!value) return true;
	try {
		const host = new URL(value).hostname.toLowerCase();
		return hosts.some((domain) => host === domain || host.endsWith(`.${domain}`));
	} catch {
		return false;
	}
}, "El enlace debe corresponder a esta red social.");
/** An additional submission guard. Human moderation remains required for every change. */
function hasRestrictedCompanyProduct(value) {
	const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
	return /\b(?:medicamentos?|medicinas?|farmacos?|antibioticos?|antiparasitarios?|ivermectina|ivermectin|vacunas?|plaguicidas?|pesticidas?|herbicidas?|fungicidas?|insecticidas?|agroquimicos?|cannabis|marihuana|armas?|municiones?|explosivos?)\b/.test(normalized);
}
var companyProductSchema = objectType({
	id: companyIdSchema,
	name: stringType().trim().min(3).max(140),
	description: optionalText(800),
	category: enumType(companyProductCategories),
	priceCents: numberType().int().min(0).max(1e11).nullable().default(null),
	currency: currencySchema.default("USD"),
	unit: stringType().trim().min(1).max(60).default("unidad"),
	availability: enumType([
		"Por confirmar",
		"Disponible",
		"Bajo pedido"
	]).default("Por confirmar"),
	imageKey: companyImageKeySchema.optional(),
	imageDataUrl: imageDataUrl.optional(),
	marketplaceId: unionType([literalType(""), stringType().regex(/^[a-zA-Z0-9_-]{3,160}$/)]).default("")
});
var companySchema = objectType({
	name: stringType().trim().min(3).max(140),
	legalName: optionalText(180),
	category: enumType(companyCategories),
	description: stringType().trim().min(30).max(2400),
	productsSummary: optionalText(800),
	state: enumType(venezuelanStates),
	municipality: optionalText(100),
	address: optionalText(300),
	coverageStates: arrayType(enumType(venezuelanStates)).max(24).default([]),
	contactName: optionalText(120),
	phone: stringType().trim().min(7).max(40).refine((value) => /^[+\d\s().-]+$/.test(value) && /^\d{7,15}$/.test(value.replace(/\D/g, "")), "Introduce un teléfono válido."),
	email: unionType([literalType(""), stringType().trim().email().max(254)]).default(""),
	website: webLink,
	instagram: socialLink(["instagram.com"]),
	facebook: socialLink(["facebook.com", "fb.com"]),
	whatsapp: booleanType().default(false),
	serviceMode: enumType(companyServiceModes).default("Presencial"),
	hours: optionalText(400),
	delivery: optionalText(700),
	logoKey: companyImageKeySchema.optional(),
	logoDataUrl: imageDataUrl.optional(),
	galleryKeys: arrayType(companyImageKeySchema).max(6).default([]),
	galleryDataUrls: arrayType(imageDataUrl).max(6).default([]),
	products: arrayType(companyProductSchema).max(12).default([])
}).superRefine((company, ctx) => {
	if (company.galleryKeys.length + company.galleryDataUrls.length > 6) ctx.addIssue({
		code: ZodIssueCode.custom,
		path: ["galleryDataUrls"],
		message: "Puedes guardar hasta seis fotografías en la galería."
	});
	const ids = /* @__PURE__ */ new Set();
	company.products.forEach((product, index) => {
		if (ids.has(product.id)) ctx.addIssue({
			code: ZodIssueCode.custom,
			path: [
				"products",
				index,
				"id"
			],
			message: "Cada producto debe tener un identificador diferente."
		});
		ids.add(product.id);
		if (hasRestrictedCompanyProduct(`${product.name} ${product.description} ${product.category}`)) ctx.addIssue({
			code: ZodIssueCode.custom,
			path: [
				"products",
				index,
				"name"
			],
			message: COMPANY_CATALOG_NOTICE
		});
	});
});
//#endregion
export { companyServiceModes as i, companyProductCategories as n, companySchema as r, companyCategories as t };
