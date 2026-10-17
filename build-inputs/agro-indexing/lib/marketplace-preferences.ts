import {z} from 'zod';
import {sellerIdentity,type MarketListing} from './marketplace-details';
const follow=z.object({sellerKey:z.string().max(400),sellerName:z.string().max(180),seenIds:z.array(z.string().max(160)).max(200)});
export const marketPreferencesSchema=z.object({saved:z.array(z.string().max(160)).max(300).default([]),following:z.array(follow).max(100).default([])});
export type MarketPreferences=z.infer<typeof marketPreferencesSchema>;
export function marketPreferenceKey(owner:string){return `venezuela-agro-market-preferences:v1:${encodeURIComponent(owner)}`;}
export function readMarketPreferences(storage:Pick<Storage,'getItem'>,owner:string):MarketPreferences{try{const raw=JSON.parse(storage.getItem(marketPreferenceKey(owner))||'{}');return marketPreferencesSchema.parse(raw);}catch{return {saved:[],following:[]};}}
export function writeMarketPreferences(storage:Pick<Storage,'setItem'|'getItem'>,owner:string,prefs:MarketPreferences){const text=JSON.stringify(marketPreferencesSchema.parse(prefs));storage.setItem(marketPreferenceKey(owner),text);if(storage.getItem(marketPreferenceKey(owner))!==text)throw new Error('storage_not_confirmed');}
export function followUpdates(prefs:MarketPreferences,rows:MarketListing[]){return rows.filter(row=>!row.demo&&prefs.following.some(f=>f.sellerKey===sellerIdentity(row)&&!f.seenIds.includes(row.id)));}
