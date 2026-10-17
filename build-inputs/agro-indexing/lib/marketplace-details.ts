import {contextualContactMessage,publicWhatsAppUrl} from './whatsapp-contact';
import { z } from 'zod';
import { listingPhotoUrl } from './listing-photo';
import { readListingContact, phoneDigits, type ListingContact } from './listing-contact';

export const productAttributeFields = [['age','Edad'],['size','Tamaño / medidas'],['weight','Peso'],['color','Color'],['breed','Raza / variedad']] as const;
export const publicProductLocationSchema=z.object({latitude:z.number().finite().min(-90).max(90),longitude:z.number().finite().min(-180).max(180),precision:z.enum(['approximate','exact']),label:z.string().trim().min(2).max(180)}).strict();
export const productDetailsSchema=z.object({ruralReference:z.string().trim().max(240).optional(),attributes:z.object({age:z.string().trim().max(100).default(''),size:z.string().trim().max(100).default(''),weight:z.string().trim().max(100).default(''),color:z.string().trim().max(100).default(''),breed:z.string().trim().max(100).default('')}).default({}),publicLocation:publicProductLocationSchema.nullable().optional()});
export const marketplaceImageInputSchema=z.string().max(700000).regex(/^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/);
const keySchema=z.string().max(700).regex(/^marketplace\/listing(?:-gallery-[0-4]|-seller)?\/[a-zA-Z0-9_%.-]+\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/cover\.(?:webp|jpg|png)$/);
export const savedProductDetailsSchema=productDetailsSchema.extend({galleryKeys:z.array(keySchema).max(5).default([]),sellerImageKey:keySchema.optional()});
export type ProductDetails=z.infer<typeof productDetailsSchema>;
export type SavedProductDetails=z.infer<typeof savedProductDetailsSchema>;
export type MarketPhoto={src:string;alt:string;creditHref?:string;caption?:string;credit?:{author:string;license:string;licenseUrl:string;source:string;changes?:string}};
export type MarketListing={id:string;sellerName:string;title:string;description:string;category:string;location:string;contact?:string|null;contactProfile?:unknown;priceCents?:number|null;currency?:string;imageKey?:string|null;imageUrl?:string|null;imageDataUrl?:string;imageAlt?:string;imageFit?:'cover'|'contain';imageCreditHref?:string;demo?:boolean;status?:string;serverUpdatedAt?:string;state?:string;municipality?:string;saleFormat?:string;supplyUnit?:string;minimumOrder?:string;buyerType?:string;demoDetails?:SavedProductDetails;demoPhotos?:MarketPhoto[];demoSellerImage?:string};
export function readProductDetails(contact?:string|null):SavedProductDetails {
 try {const raw=JSON.parse(contact||'{}');const parsed=savedProductDetailsSchema.safeParse(raw.productDetails);return parsed.success?parsed.data:savedProductDetailsSchema.parse({});}catch{return savedProductDetailsSchema.parse({});}
}
export function encodeListingEnvelope(profile:ListingContact|undefined,details:SavedProductDetails,legacyContact='') {return JSON.stringify({version:2,...profile,...(!profile?{legacyContact}:{}),productDetails:savedProductDetailsSchema.parse(details)});}
export function listingMediaBelongsTo(key:string,ownerId:string|null,listingId:string){const match=key.match(/^marketplace\/listing(?:-gallery-[0-4]|-seller)?\/([^/]+)\/([^/]+)\/[a-zA-Z0-9_-]+\/cover\.(?:webp|jpg|png)$/);return typeof ownerId==='string'&&!!match&&match[1]===encodeURIComponent(ownerId)&&match[2]===listingId;}
export function safeStoredProductDetails(contact:string|null|undefined,ownerId:string,listingId:string){const details=readProductDetails(contact);return {...details,galleryKeys:details.galleryKeys.filter(key=>listingMediaBelongsTo(key,ownerId,listingId)),...(details.sellerImageKey&&!listingMediaBelongsTo(details.sellerImageKey,ownerId,listingId)?{sellerImageKey:undefined}:{})};}
export function legacyListingContactText(contact?:string|null){try{const raw=JSON.parse(contact||'{}');if(raw?.version===2&&typeof raw.legacyContact==='string')return raw.legacyContact;}catch{}return contact||'';}
export function listingMediaKeys(contact?:string|null){const d=readProductDetails(contact);return [...d.galleryKeys,...(d.sellerImageKey?[d.sellerImageKey]:[])];}
export function listingDetails(listing:MarketListing){return listing.demo&&listing.demoDetails?listing.demoDetails:readProductDetails(listing.contact);}
export function listingPhotos(listing:MarketListing):MarketPhoto[]{
 if(listing.demo&&listing.demoPhotos?.length)return listing.demoPhotos;
 const main=listing.imageUrl||listing.imageDataUrl||listingPhotoUrl(listing.imageKey);
 return [...(main?[{src:main,alt:listing.imageAlt||listing.title,creditHref:listing.imageCreditHref}]:[]),...readProductDetails(listing.contact).galleryKeys.map((key,index)=>({src:listingPhotoUrl(key)!,alt:`${listing.title} · fotografía ${index+2}`}))].filter((p,i,rows)=>rows.findIndex(r=>r.src===p.src)===i);
}
export function sellerIdentity(listing:MarketListing){if(listing.demo)return `demo:${listing.id}`;const profile=readListingContact(listing.contact,listing.contactProfile);return profile?`public:${phoneDigits(profile.phone)}:${profile.farmName.trim().toLocaleLowerCase('es')}`:`listing:${listing.id}`;}
export function marketplacePath(listing:Pick<MarketListing,'id'|'demo'>){return listing.demo?`/marketplace?ejemplo=${encodeURIComponent(listing.id)}`:`/marketplace/${encodeURIComponent(listing.id)}`;}
export function availabilityMessage(title:string,offer?:{amount:string;currency:string;note?:string}){return `${contextualContactMessage(title)} ¿Está disponible?${offer?` Me gustaría consultar una oferta de ${offer.currency} ${offer.amount}${offer.note?`. ${offer.note}`:''}. Sujeta a confirmación de ambas partes.`:''}`;}
export function whatsappAvailabilityUrl(listing:Pick<MarketListing,'title'|'contact'|'contactProfile'|'demo'>,offer?:{amount:string;currency:string;note?:string}){if(listing.demo)return null;const profile=readListingContact(listing.contact,listing.contactProfile);return publicWhatsAppUrl({phone:profile?.phone,enabled:profile?.whatsapp,demo:listing.demo},listing.title,availabilityMessage(listing.title,offer).slice(contextualContactMessage(listing.title).length));}
export function relatedMarketplaceListings(listing:MarketListing,rows:MarketListing[],limit=6){return rows.filter(row=>row.id!==listing.id&&Boolean(row.demo)===Boolean(listing.demo)).sort((a,b)=>{const score=(r:MarketListing)=>(r.category===listing.category?4:0)+(sellerIdentity(r)!==sellerIdentity(listing)?2:0);return score(b)-score(a);}).slice(0,limit);}
