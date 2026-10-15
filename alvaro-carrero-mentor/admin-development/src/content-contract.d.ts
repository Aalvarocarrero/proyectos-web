/** Version 1 of the fixed homepage CMS contract. Runtime validation is in content-service.mjs. */
export type ContentLanguage = 'es' | 'en';
export type TextSlot = 'hero.title' | 'hero.intro' | 'approach.title' | 'approach.body' | 'approach.details'
 | 'community.title' | 'community.body' | 'mentoring.title' | 'mentoring.body'
 | 'about.title' | 'about.body' | 'about.details' | 'about.imageAlt'
 | 'contact.title' | 'contact.body' | 'seo.title' | 'seo.description' | 'seo.socialTitle' | 'seo.socialDescription';
export type ImageSlot = 'about.image' | 'seo.image';
export type ImageAsset = '/assets/alvaro.jpg' | '/assets/claridad.webp' | '/assets/cuidado.webp'
 | '/assets/progreso.webp' | '/assets/crecimiento.webp' | '/assets/habitos.webp';
export type HomepageContent = Record<`${ContentLanguage}.${TextSlot}`,string> & Record<`${ContentLanguage}.${ImageSlot}`,ImageAsset>;
export type FieldDescriptor = {
 key: keyof HomepageContent; lang: ContentLanguage; slot: TextSlot | ImageSlot; label: string; group: string;
} & ({type:'text'; maxLength:number; default:string} | {type:'image'; default:ImageAsset});
export type SaveCommand = {expectedVersion:number; content:HomepageContent};
export type PublishCommand = {expectedVersion:number};
export type ContentState = {version:number; draft:HomepageContent; published:HomepageContent|null; publishedVersion:number|null; updatedAt:number|null};
export type MutationResponse = {ok:true; state:ContentState} | {ok:false; error:string};
