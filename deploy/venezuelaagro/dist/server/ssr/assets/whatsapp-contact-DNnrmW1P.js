import { d as stringType, l as objectType, o as enumType, r as booleanType } from "./types-O06YnHo2.js";
//#region lib/listing-contact.ts
var publicLink = (hosts) => stringType().trim().max(500).default("").refine((value) => {
	if (!value) return true;
	try {
		const url = new URL(value);
		return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password && (!hosts || hosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`)));
	} catch {
		return false;
	}
}, "Introduce un enlace completo y válido de esta plataforma (https://…).");
var listingContactSchema = objectType({
	responsibleName: stringType().trim().min(2, "Indica el nombre del responsable.").max(120),
	phone: stringType().trim().max(40).refine((value) => /^[+\d\s().-]+$/.test(value) && value.replace(/\D/g, "").length >= 7 && value.replace(/\D/g, "").length <= 15, "Introduce un teléfono válido, incluyendo el código de país."),
	farmName: stringType().trim().max(160).default(""),
	whatsapp: booleanType().default(false),
	advertiserType: enumType([
		"",
		"Productor agropecuario",
		"Finca familiar",
		"Cooperativa",
		"Distribuidor",
		"Profesional / servicios",
		"Otro"
	]).default(""),
	contactHours: stringType().trim().max(120).default(""),
	deliveryMode: enumType([
		"",
		"Retiro en finca",
		"Entrega a convenir",
		"Retiro o entrega"
	]).default(""),
	instagram: publicLink(["instagram.com"]),
	facebook: publicLink([
		"facebook.com",
		"fb.com",
		"fb.me"
	]),
	tiktok: publicLink(["tiktok.com"]),
	youtube: publicLink(["youtube.com", "youtu.be"]),
	googleBusiness: publicLink([
		"google.com",
		"maps.app.goo.gl",
		"g.page"
	]),
	website: publicLink()
});
function readListingContact(contact, profile) {
	if (profile) {
		const parsed = listingContactSchema.safeParse(profile);
		if (parsed.success) return parsed.data;
	}
	if (!contact?.startsWith("{")) return null;
	try {
		const parsed = listingContactSchema.safeParse(JSON.parse(contact));
		return parsed.success ? parsed.data : null;
	} catch {
		return null;
	}
}
function phoneDigits(phone) {
	const digits = phone.replace(/\D/g, "");
	return digits.length === 11 && digits.startsWith("0") ? `58${digits.slice(1)}` : digits;
}
//#endregion
//#region lib/whatsapp-contact.ts
function contextualContactMessage(context) {
	return `Hola, vengo de VenezuelaAgro.com. Estoy interesado en ${context.trim().replace(/\s+/g, " ") || "esta publicación"}.`;
}
function publicWhatsAppUrl(contact, context, suffix = "") {
	if (contact.demo || contact.enabled !== true || !contact.phone || !/^[+\d\s().-]+$/.test(contact.phone)) return null;
	const digits = phoneDigits(contact.phone);
	if (!/^[1-9]\d{9,14}$/.test(digits)) return null;
	return `https://wa.me/${digits}?text=${encodeURIComponent(contextualContactMessage(context) + suffix)}`;
}
//#endregion
export { readListingContact as a, phoneDigits as i, publicWhatsAppUrl as n, listingContactSchema as r, contextualContactMessage as t };
