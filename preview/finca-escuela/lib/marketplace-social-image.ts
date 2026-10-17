import type {MarketListing, MarketPhoto} from './marketplace-details';
import {marketplaceImageContent} from './public-image-content';
import {buildSocialImage, socialImageFormats} from './social-image';
export const marketplaceSocialFormats=[{id:'instagram-feed',label:'Instagram · publicación',width:1080,height:1080},{id:'instagram-story',label:'Instagram · historia',width:1080,height:1920},{id:'facebook',label:'Facebook · publicación',width:1200,height:630},{id:'whatsapp-status',label:'WhatsApp · estado',width:1080,height:1920}] as const;
/** Compatibility entry point; all public surfaces now use the same credited PNG renderer. */
export async function buildMarketplaceSocialImage(listing: MarketListing, photo: MarketPhoto, format: typeof marketplaceSocialFormats[number]): Promise<Blob> {
 return buildSocialImage(marketplaceImageContent(listing, photo),socialImageFormats.find(value=>value.id===format.id)!);
}
