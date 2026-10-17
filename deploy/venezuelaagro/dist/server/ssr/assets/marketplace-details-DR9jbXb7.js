import { c as numberType, d as stringType, l as objectType, n as arrayType, o as enumType } from "./types-O06YnHo2.js";
import { a as readListingContact, i as phoneDigits, n as publicWhatsAppUrl, t as contextualContactMessage } from "./whatsapp-contact-DNnrmW1P.js";
//#region lib/listing-photo.ts
/** Presence checks only. Upload decoding remains owned by the existing upload pipeline. */
function hasStoredListingPhoto(key) {
	return typeof key === "string" && key.trim().length > 0;
}
function hasListingPhoto(value) {
	return hasStoredListingPhoto(value.imageKey) || hasStoredListingPhoto(value.imageUrl) || hasStoredListingPhoto(value.imageDataUrl);
}
function listingPhotoUrl(key) {
	return hasStoredListingPhoto(key) ? `/api/media/${key.split("/").map(encodeURIComponent).join("/")}` : null;
}
//#endregion
//#region lib/marketplace-details.ts
var productAttributeFields = [
	["age", "Edad"],
	["size", "Tamaño / medidas"],
	["weight", "Peso"],
	["color", "Color"],
	["breed", "Raza / variedad"]
];
var publicProductLocationSchema = objectType({
	latitude: numberType().finite().min(-90).max(90),
	longitude: numberType().finite().min(-180).max(180),
	precision: enumType(["approximate", "exact"]),
	label: stringType().trim().min(2).max(180)
}).strict();
var productDetailsSchema = objectType({
	ruralReference: stringType().trim().max(240).optional(),
	attributes: objectType({
		age: stringType().trim().max(100).default(""),
		size: stringType().trim().max(100).default(""),
		weight: stringType().trim().max(100).default(""),
		color: stringType().trim().max(100).default(""),
		breed: stringType().trim().max(100).default("")
	}).default({}),
	publicLocation: publicProductLocationSchema.nullable().optional()
});
var marketplaceImageInputSchema = stringType().max(7e5).regex(/^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/);
var keySchema = stringType().max(700).regex(/^marketplace\/listing(?:-gallery-[0-4]|-seller)?\/[a-zA-Z0-9_%.-]+\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/cover\.(?:webp|jpg|png)$/);
var savedProductDetailsSchema = productDetailsSchema.extend({
	galleryKeys: arrayType(keySchema).max(5).default([]),
	sellerImageKey: keySchema.optional()
});
function readProductDetails(contact) {
	try {
		const raw = JSON.parse(contact || "{}");
		const parsed = savedProductDetailsSchema.safeParse(raw.productDetails);
		return parsed.success ? parsed.data : savedProductDetailsSchema.parse({});
	} catch {
		return savedProductDetailsSchema.parse({});
	}
}
function legacyListingContactText(contact) {
	try {
		const raw = JSON.parse(contact || "{}");
		if (raw?.version === 2 && typeof raw.legacyContact === "string") return raw.legacyContact;
	} catch {}
	return contact || "";
}
function listingDetails(listing) {
	return listing.demo && listing.demoDetails ? listing.demoDetails : readProductDetails(listing.contact);
}
function listingPhotos(listing) {
	if (listing.demo && listing.demoPhotos?.length) return listing.demoPhotos;
	const main = listing.imageUrl || listing.imageDataUrl || listingPhotoUrl(listing.imageKey);
	return [...main ? [{
		src: main,
		alt: listing.imageAlt || listing.title,
		creditHref: listing.imageCreditHref
	}] : [], ...readProductDetails(listing.contact).galleryKeys.map((key, index) => ({
		src: listingPhotoUrl(key),
		alt: `${listing.title} · fotografía ${index + 2}`
	}))].filter((p, i, rows) => rows.findIndex((r) => r.src === p.src) === i);
}
function sellerIdentity(listing) {
	if (listing.demo) return `demo:${listing.id}`;
	const profile = readListingContact(listing.contact, listing.contactProfile);
	return profile ? `public:${phoneDigits(profile.phone)}:${profile.farmName.trim().toLocaleLowerCase("es")}` : `listing:${listing.id}`;
}
function marketplacePath(listing) {
	return listing.demo ? `/marketplace?ejemplo=${encodeURIComponent(listing.id)}` : `/marketplace/${encodeURIComponent(listing.id)}`;
}
function availabilityMessage(title, offer) {
	return `${contextualContactMessage(title)} ¿Está disponible?${offer ? ` Me gustaría consultar una oferta de ${offer.currency} ${offer.amount}${offer.note ? `. ${offer.note}` : ""}. Sujeta a confirmación de ambas partes.` : ""}`;
}
function whatsappAvailabilityUrl(listing, offer) {
	if (listing.demo) return null;
	const profile = readListingContact(listing.contact, listing.contactProfile);
	return publicWhatsAppUrl({
		phone: profile?.phone,
		enabled: profile?.whatsapp,
		demo: listing.demo
	}, listing.title, availabilityMessage(listing.title, offer).slice(contextualContactMessage(listing.title).length));
}
function relatedMarketplaceListings(listing, rows, limit = 6) {
	return rows.filter((row) => row.id !== listing.id && Boolean(row.demo) === Boolean(listing.demo)).sort((a, b) => {
		const score = (r) => (r.category === listing.category ? 4 : 0) + (sellerIdentity(r) !== sellerIdentity(listing) ? 2 : 0);
		return score(b) - score(a);
	}).slice(0, limit);
}
//#endregion
export { marketplaceImageInputSchema as a, productDetailsSchema as c, sellerIdentity as d, whatsappAvailabilityUrl as f, listingPhotoUrl as h, listingPhotos as i, relatedMarketplaceListings as l, hasStoredListingPhoto as m, legacyListingContactText as n, marketplacePath as o, hasListingPhoto as p, listingDetails as r, productAttributeFields as s, availabilityMessage as t, savedProductDetailsSchema as u };
