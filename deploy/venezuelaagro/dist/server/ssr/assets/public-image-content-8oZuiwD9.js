import { a as professionalImage, p as farmPhoto } from "./professional-profile-Bdu_R75C.js";
import { a as readListingContact, r as listingContactSchema } from "./whatsapp-contact-D2hkSaZs.js";
import { i as listingPhotos, o as marketplacePath, r as listingDetails, s as productAttributeFields } from "./marketplace-details-Bh_zF0oZ.js";
//#region lib/public-image-content.ts
/** Only published-profile fields belong here; never infer contacts from accounts or owners. */
function isPublicRecord(record) {
	return !record.demo && (record.status === void 0 || record.status === "active");
}
function publicContact(name, phone, record) {
	if (!isPublicRecord(record)) return void 0;
	const publicName = typeof name === "string" ? name.trim() : "";
	if (publicName.length < 2 || publicName.length > 160) return void 0;
	const parsedPhone = listingContactSchema.shape.phone.safeParse(phone);
	return {
		name: publicName,
		...parsedPhone.success ? { phone: parsedPhone.data } : {}
	};
}
/** Explicit public projections: never spread records, contact envelopes, owner data or private farm data. */
function marketplaceImageContent(listing, photo = listingPhotos(listing)[0]) {
	const contact = isPublicRecord(listing) ? readListingContact(listing.contact, listing.contactProfile) : null;
	const attributes = listingDetails(listing).attributes;
	const facts = [
		...productAttributeFields.map(([key, label]) => attributes[key] ? `${label}: ${attributes[key]}` : ""),
		listing.saleFormat ? `Presentación: ${listing.saleFormat}` : "",
		listing.supplyUnit ? `Unidad de venta: ${listing.supplyUnit}` : "",
		listing.minimumOrder ? `Pedido mínimo: ${listing.minimumOrder}` : "",
		listing.buyerType ? `Dirigido a: ${listing.buyerType}` : "",
		contact?.farmName ? `Finca o empresa: ${contact.farmName}` : "",
		contact?.contactHours ? `Atención: ${contact.contactHours}` : "",
		contact?.deliveryMode ? `Entrega: ${contact.deliveryMode}` : ""
	].filter(Boolean);
	return {
		id: listing.id,
		title: listing.title,
		category: "Mercado Agro",
		description: listing.description,
		detail: [listing.location, listing.priceCents != null ? `${listing.currency || "USD"} ${(listing.priceCents / 100).toLocaleString("es-VE")}` : "Precio por consultar"].filter(Boolean).join(" · "),
		publicContact: publicContact(contact?.responsibleName || listing.sellerName, contact?.phone, listing),
		facts,
		path: marketplacePath(listing),
		demo: listing.demo,
		photo
	};
}
function storeImageContent(product) {
	return {
		id: `tienda-${product.id}`,
		title: product.name,
		category: `Tienda · ${product.category}`,
		description: product.description,
		detail: `${product.stage} · Precio y existencia por confirmar`,
		publicContact: { name: "Parcela Los Morochos" },
		path: `/tienda#producto-${encodeURIComponent(product.id)}`,
		photo: product.image ? {
			src: product.image,
			alt: product.imageAlt || `Imagen ilustrativa de ${product.name}`,
			caption: "Fotografía ilustrativa. No representa inventario confirmado.",
			...product.imageCreditId ? { creditHref: `/creditos-fotograficos#producto-${product.imageCreditId}` } : {}
		} : void 0
	};
}
function postImageContent(post, farm) {
	const attachedPhoto = post.listing ? listingPhotos(post.listing)[0] : void 0;
	const demo = !!post.demo || !!post.listing?.demo;
	return {
		id: `comunidad-${post.id}`,
		title: post.authorName,
		category: "Comunidad agropecuaria",
		description: post.text,
		detail: farm.state,
		publicContact: !demo && post.farmId === farm.id ? publicContact(farm.responsibleName, farm.phone, farm) : void 0,
		path: `/red/${encodeURIComponent(post.id)}`,
		demo,
		photo: post.imageUrl ? {
			src: post.imageUrl,
			alt: post.demo ? "Imagen ilustrativa de la publicación de ejemplo" : `Imagen de la publicación de ${post.authorName}`,
			...post.demo ? { caption: post.imageUrl === "/demo-poultry.webp" ? "Imagen generada por IA de una granja ficticia. No representa una oferta real." : "Imagen ilustrativa de una publicación ficticia. No representa una oferta real." } : {}
		} : attachedPhoto
	};
}
function farmImageContent(farm) {
	const image = farmPhoto(farm);
	return {
		id: `finca-${farm.id}`,
		title: farm.name,
		category: "Directorio de fincas",
		description: farm.description,
		detail: [farm.state, farm.rubrics].filter(Boolean).join(" · "),
		publicContact: publicContact(farm.responsibleName, farm.phone, farm),
		path: `/fincas/${encodeURIComponent(farm.id)}`,
		demo: !!farm.demo,
		photo: image ? {
			src: image,
			alt: farm.demo ? `Imagen ilustrativa de ${farm.name}` : `Imagen de ${farm.name}`,
			...farm.demo ? { caption: image === "/demo-poultry.webp" ? "Imagen generada por IA de una granja ficticia. No representa instalaciones ni una oferta real." : farm.gallery?.find((photo) => photo.src === image)?.caption || "Imagen ilustrativa de una finca ficticia. No acredita propiedad ni una oferta disponible." } : {}
		} : void 0
	};
}
function professionalImageContent(profile) {
	const image = professionalImage(profile);
	return {
		id: `profesional-${profile.id}`,
		title: profile.name,
		category: profile.profession,
		description: profile.introduction,
		detail: [profile.state, profile.serviceMode].filter(Boolean).join(" · "),
		publicContact: publicContact(profile.name, profile.contact, profile),
		path: `/profesionales/${encodeURIComponent(profile.id)}`,
		demo: !!profile.demo,
		photo: image ? {
			src: image,
			alt: profile.demo ? `Retrato generado por IA de ${profile.name}; identidad ficticia` : `Fotografía de ${profile.name}`,
			...profile.demo ? { caption: "Imagen generada por IA · perfil 100 % ficticio. No permite contratar a una persona real." } : {}
		} : void 0
	};
}
function companyImageContent(company) {
	const image = company.demo ? "/company-examples/veterinaria-ejemplo-local.webp" : company.logoUrl || company.galleryUrls[0];
	return {
		id: `empresa-${company.id}`,
		title: company.name,
		category: company.category,
		description: company.description,
		detail: company.state,
		publicContact: publicContact(company.contactName || company.name, company.phone, company),
		path: `/empresas/${encodeURIComponent(company.id)}`,
		demo: !!company.demo,
		photo: image ? {
			src: image,
			alt: company.demo ? "Local veterinario ficticio generado con IA" : `Imagen de ${company.name}`,
			...company.demo ? { caption: "Local de muestra creado con IA. No representa un establecimiento real." } : {}
		} : void 0
	};
}
function companyProductImageContent(company, product) {
	const price = product.priceCents === null ? "Consultar precio" : `${(product.priceCents / 100).toLocaleString("es-VE", { minimumFractionDigits: 2 })} ${product.currency}`;
	return {
		id: `empresa-${company.id}-${product.id}`,
		title: product.name,
		category: product.category,
		description: product.description,
		detail: company.demo ? `${company.name} · Producto de ejemplo · sin venta` : `${company.name} · ${price} · ${product.availability}`,
		publicContact: publicContact(company.contactName || company.name, company.phone, company),
		facts: product.unit && !company.demo ? [`Unidad de venta: ${product.unit}`] : void 0,
		path: `/empresas/${encodeURIComponent(company.id)}#producto-${encodeURIComponent(product.id)}`,
		demo: !!company.demo,
		photo: product.imageUrl ? {
			src: product.imageUrl,
			alt: product.name,
			...company.demo ? { caption: product.imageUrl.startsWith("/company-examples/") ? "Imagen ilustrativa creada con IA; producto de muestra." : "Fotografía contextual; no representa inventario ni una oferta real." } : {}
		} : void 0
	};
}
//#endregion
export { postImageContent as a, marketplaceImageContent as i, companyProductImageContent as n, professionalImageContent as o, farmImageContent as r, storeImageContent as s, companyImageContent as t };
