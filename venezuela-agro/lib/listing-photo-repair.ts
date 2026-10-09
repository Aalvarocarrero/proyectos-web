import {readListingContact} from './listing-contact';
import {listingPayloadSchema} from './sync-validation';
/** Hydrated rows store structured contact in a legacy text column; preserve the full profile. */
export function photoRepairPayload(existing:Record<string,unknown>,imageDataUrl:string,photoContext:string){
 const contact=typeof existing.contact==='string'?existing.contact:'';
 const profile=readListingContact(contact,existing.contactProfile);
 return listingPayloadSchema.safeParse({...existing,imageDataUrl,photoContext,contact:profile?.phone??contact,...(profile?{contactProfile:profile}:{})});
}
