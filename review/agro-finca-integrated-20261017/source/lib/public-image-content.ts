import type {CompanyProduct, CompanyRecord} from './company';
import {listingContactSchema, readListingContact} from './listing-contact';
import {listingDetails, listingPhotos, marketplacePath, productAttributeFields, type MarketListing, type MarketPhoto} from './marketplace-details';
import {farmPhoto, type PublicFarm, type SocialPost} from './network-profile';
import {professionalImage, type ProfessionalRecord} from './professional-profile';
import type {SocialImageContent} from './social-image';
import type {StoreProduct} from './store-products';

/** Only published-profile fields belong here; never infer contacts from accounts or owners. */
function isPublicRecord(record: {demo?: boolean; status?: unknown}): boolean {
  return !record.demo && (record.status === undefined || record.status === 'active');
}
function publicContact(name: string, phone: unknown, record: {demo?: boolean; status?: unknown}): SocialImageContent['publicContact'] {
  if (!isPublicRecord(record)) return undefined;
  // Company names allow 140 characters; a fallback name must not drop a valid phone.
  const publicName = typeof name === 'string' ? name.trim() : '';
  if (publicName.length < 2 || publicName.length > 160) return undefined;
  const parsedPhone = listingContactSchema.shape.phone.safeParse(phone);
  return {name: publicName, ...(parsedPhone.success ? {phone: parsedPhone.data} : {})};
}

/** Explicit public projections: never spread records, contact envelopes, owner data or private farm data. */
export function marketplaceImageContent(listing: MarketListing, photo: MarketPhoto | undefined = listingPhotos(listing)[0]): SocialImageContent {
  const contact = isPublicRecord(listing) ? readListingContact(listing.contact, listing.contactProfile) : null;
  const attributes = listingDetails(listing).attributes;
  const facts = [
    ...productAttributeFields.map(([key, label]) => attributes[key] ? `${label}: ${attributes[key]}` : ''),
    listing.saleFormat ? `Presentación: ${listing.saleFormat}` : '',
    listing.supplyUnit ? `Unidad de venta: ${listing.supplyUnit}` : '',
    listing.minimumOrder ? `Pedido mínimo: ${listing.minimumOrder}` : '',
    listing.buyerType ? `Dirigido a: ${listing.buyerType}` : '',
    contact?.farmName ? `Finca o empresa: ${contact.farmName}` : '',
    contact?.contactHours ? `Atención: ${contact.contactHours}` : '',
    contact?.deliveryMode ? `Entrega: ${contact.deliveryMode}` : '',
  ].filter(Boolean);
  return {
    id: listing.id,
    title: listing.title,
    category: 'Mercado Agro',
    description: listing.description,
    detail: [listing.location, listing.priceCents != null ? `${listing.currency || 'USD'} ${(listing.priceCents / 100).toLocaleString('es-VE')}` : 'Precio por consultar'].filter(Boolean).join(' · '),
    publicContact: publicContact(contact?.responsibleName || listing.sellerName, contact?.phone, listing),
    facts,
    path: marketplacePath(listing),
    demo: listing.demo,
    photo,
  };
}

export function storeImageContent(product: StoreProduct): SocialImageContent {
  return {
    id: `tienda-${product.id}`,
    title: product.name,
    category: `Tienda · ${product.category}`,
    description: product.description,
    detail: `${product.stage} · Precio y existencia por confirmar`,
    publicContact: {name: 'Parcela Los Morochos'},
    path: `/tienda#producto-${encodeURIComponent(product.id)}`,
    photo: product.image ? {
      src: product.image,
      alt: product.imageAlt || `Imagen ilustrativa de ${product.name}`,
      caption: 'Fotografía ilustrativa. No representa inventario confirmado.',
      ...(product.imageCreditId ? {creditHref: `/creditos-fotograficos#producto-${product.imageCreditId}`} : {}),
    } : undefined,
  };
}

export function postImageContent(post: SocialPost, farm: PublicFarm): SocialImageContent {
  const attachedPhoto = post.listing ? listingPhotos(post.listing)[0] : undefined;
  const demo = !!post.demo || !!post.listing?.demo;
  return {
    id: `comunidad-${post.id}`,
    title: post.authorName,
    category: 'Comunidad agropecuaria',
    description: post.text,
    detail: farm.state,
    publicContact: !demo && post.farmId === farm.id ? publicContact(farm.responsibleName, farm.phone, farm) : undefined,
    path: `/red/${encodeURIComponent(post.id)}`,
    demo,
    photo: post.imageUrl ? {
      src: post.imageUrl,
      alt: post.demo ? 'Imagen ilustrativa de la publicación de ejemplo' : `Imagen de la publicación de ${post.authorName}`,
      ...(post.demo ? {caption: post.imageUrl === '/demo-poultry.webp' ? 'Imagen generada por IA de una granja ficticia. No representa una oferta real.' : 'Imagen ilustrativa de una publicación ficticia. No representa una oferta real.'} : {}),
    } : attachedPhoto,
  };
}

export function farmImageContent(farm: PublicFarm): SocialImageContent {
  const image = farmPhoto(farm);
  return {
    id: `finca-${farm.id}`,
    title: farm.name,
    category: 'Directorio de fincas',
    description: farm.description,
    detail: [farm.state, farm.rubrics].filter(Boolean).join(' · '),
    publicContact: publicContact(farm.responsibleName, farm.phone, farm),
    path: `/fincas/${encodeURIComponent(farm.id)}`,
    demo: !!farm.demo,
    photo: image ? {
      src: image,
      alt: farm.demo ? `Imagen ilustrativa de ${farm.name}` : `Imagen de ${farm.name}`,
      ...(farm.demo ? {caption: image === '/demo-poultry.webp' ? 'Imagen generada por IA de una granja ficticia. No representa instalaciones ni una oferta real.' : farm.gallery?.find(photo => photo.src === image)?.caption || 'Imagen ilustrativa de una finca ficticia. No acredita propiedad ni una oferta disponible.'} : {}),
    } : undefined,
  };
}

export function professionalImageContent(profile: ProfessionalRecord): SocialImageContent {
  const image = professionalImage(profile);
  return {
    id: `profesional-${profile.id}`,
    title: profile.name,
    category: profile.profession,
    description: profile.introduction,
    detail: [profile.state, profile.serviceMode].filter(Boolean).join(' · '),
    publicContact: publicContact(profile.name, profile.contact, profile),
    path: `/profesionales/${encodeURIComponent(profile.id)}`,
    demo: !!profile.demo,
    photo: image ? {
      src: image,
      alt: profile.demo ? `Retrato generado por IA de ${profile.name}; identidad ficticia` : `Fotografía de ${profile.name}`,
      ...(profile.demo ? {caption: 'Imagen generada por IA · perfil 100 % ficticio. No permite contratar a una persona real.'} : {}),
    } : undefined,
  };
}

export function companyImageContent(company: CompanyRecord): SocialImageContent {
  const image = company.demo ? '/company-examples/veterinaria-ejemplo-local.webp' : company.logoUrl || company.galleryUrls[0];
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
      alt: company.demo ? 'Local veterinario ficticio generado con IA' : `Imagen de ${company.name}`,
      ...(company.demo ? {caption: 'Local de muestra creado con IA. No representa un establecimiento real.'} : {}),
    } : undefined,
  };
}

export function companyProductImageContent(company: CompanyRecord, product: CompanyProduct): SocialImageContent {
  const price = product.priceCents === null ? 'Consultar precio' : `${(product.priceCents / 100).toLocaleString('es-VE', {minimumFractionDigits: 2})} ${product.currency}`;
  return {
    id: `empresa-${company.id}-${product.id}`,
    title: product.name,
    category: product.category,
    description: product.description,
    detail: company.demo ? `${company.name} · Producto de ejemplo · sin venta` : `${company.name} · ${price} · ${product.availability}`,
    publicContact: publicContact(company.contactName || company.name, company.phone, company),
    facts: product.unit && !company.demo ? [`Unidad de venta: ${product.unit}`] : undefined,
    path: `/empresas/${encodeURIComponent(company.id)}#producto-${encodeURIComponent(product.id)}`,
    demo: !!company.demo,
    photo: product.imageUrl ? {
      src: product.imageUrl,
      alt: product.name,
      ...(company.demo ? {caption: product.imageUrl.startsWith('/company-examples/') ? 'Imagen ilustrativa creada con IA; producto de muestra.' : 'Fotografía contextual; no representa inventario ni una oferta real.'} : {}),
    } : undefined,
  };
}
