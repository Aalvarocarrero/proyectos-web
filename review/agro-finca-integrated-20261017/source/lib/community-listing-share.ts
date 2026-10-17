import {z} from 'zod';
const PREFIX='VENEZUELA_AGRO_POST_V1:';
const bodySchema=z.object({version:z.literal(1),text:z.string().min(3).max(500),listingId:z.string().regex(/^[a-zA-Z0-9_-]{3,160}$/).optional()});
/** Wrap every new post, including plain text, so user text cannot become an attachment. */
export function encodeCommunityListingShare(text:string,listingId?:string){return PREFIX+JSON.stringify(bodySchema.parse({version:1,text,...(listingId?{listingId}:{})}));}
export function readCommunityListingShare(body:string):{text:string;listingId?:string}{if(body.startsWith(PREFIX)){try{const result=bodySchema.safeParse(JSON.parse(body.slice(PREFIX.length)));if(result.success)return {text:result.data.text,...(result.data.listingId?{listingId:result.data.listingId}:{})};}catch{}}return {text:body};}
