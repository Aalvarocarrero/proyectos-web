/** Presence checks only. Upload decoding remains owned by the existing upload pipeline. */
export function hasStoredListingPhoto(key:unknown):key is string{return typeof key==="string"&&key.trim().length>0;}
export function hasListingPhoto(value:{imageKey?:unknown;imageUrl?:unknown;imageDataUrl?:unknown}){return hasStoredListingPhoto(value.imageKey)||hasStoredListingPhoto(value.imageUrl)||hasStoredListingPhoto(value.imageDataUrl);}
export function listingPhotoUrl(key:unknown){return hasStoredListingPhoto(key)?`/api/media/${key.split('/').map(encodeURIComponent).join('/')}`:null;}
