import {and,desc,eq,isNotNull,ne} from 'drizzle-orm';
import {getDb} from '@/db';
import {marketplaceListings} from '@/db/schema';
import {listingPhotoUrl} from './listing-photo';
export function publicMarketplaceRow(row:typeof marketplaceListings.$inferSelect) {
 return {id:row.id,sellerName:row.sellerName,title:row.title,description:row.description,category:row.category,
  priceCents:row.priceCents,currency:row.currency,location:row.location,state:row.state,municipality:row.municipality,
  shortIntro:row.shortIntro,photoContext:row.photoContext,saleFormat:row.saleFormat,supplyUnit:row.supplyUnit,
  minimumOrder:row.minimumOrder,buyerType:row.buyerType,seoTitle:row.seoTitle,seoDescription:row.seoDescription,
  imageAlt:row.imageAlt,contact:row.contact,imageKey:row.imageKey,status:row.status,
  clientUpdatedAt:row.clientUpdatedAt,serverUpdatedAt:row.serverUpdatedAt,deleted:row.deleted,
  imageUrl:listingPhotoUrl(row.imageKey)};
}
export async function getPublishedMarketplaceListing(id:string){if(!/^[a-zA-Z0-9_-]{3,160}$/.test(id))return null;const db=await getDb();const [row]=await db.select().from(marketplaceListings).where(and(eq(marketplaceListings.id,id),eq(marketplaceListings.status,'active'),eq(marketplaceListings.deleted,false),isNotNull(marketplaceListings.imageKey),ne(marketplaceListings.imageKey,''))).limit(1);return row?publicMarketplaceRow(row):null;}
export async function getMarketplaceSuggestions(id:string){const db=await getDb();const rows=await db.select().from(marketplaceListings).where(and(ne(marketplaceListings.id,id),eq(marketplaceListings.status,'active'),eq(marketplaceListings.deleted,false),isNotNull(marketplaceListings.imageKey),ne(marketplaceListings.imageKey,''))).orderBy(desc(marketplaceListings.serverUpdatedAt)).limit(100);return rows.map(publicMarketplaceRow);}
