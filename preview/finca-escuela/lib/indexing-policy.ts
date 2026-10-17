import type {Metadata} from "next";
import {SITE_ORIGIN} from "@/lib/site-identity";
/** Flip only after domain, HTTPS, auth callbacks and public access are explicitly approved and verified. */
export const PUBLIC_INDEXING_ENABLED=false;
export const PRODUCTION_DOMAIN_CANDIDATE="https://venezuelaagro.com";
export const PRIVATE_PATHS=["/finca-demo","/biblioteca-local","/app","/app-local","/admin","/offline","/marketplace/publicar","/empresas/registro","/signin-with-chatgpt","/signout-with-chatgpt","/callback"];
export function isPrivatePath(path:string){return PRIVATE_PATHS.some(prefix=>path===prefix||path.startsWith(prefix+"/"))||(path.startsWith("/api/")&&!path.startsWith("/api/media/"));}
export function indexingRobots(enabled:boolean,publicContent=true,demo=false):Metadata["robots"]{const allowed=enabled&&publicContent&&!demo;return {index:allowed,follow:allowed};}
export function robotsPolicy(publicContent=true,demo=false):Metadata["robots"]{return indexingRobots(PUBLIC_INDEXING_ENABLED,publicContent,demo);}
export function pageMetadata(path:string,title:string,description:string):Metadata{return {title,description,alternates:{canonical:path},robots:robotsPolicy(!isPrivatePath(path)),openGraph:{title,description,url:SITE_ORIGIN+path,siteName:"Venezuela Agro",locale:"es_VE",type:"website"},twitter:{card:"summary_large_image",title,description}};}
export const INDEXING_TAXONOMY=[
 ["/","Plataforma","Venezuela Agro: productores, mercado y gestión de fincas"],
 ["/stickers","Recursos creativos","Stickers originales del agro disponibles para descargar"],
 ["/plataforma","Herramientas","Mi Finca: gestión, instalación y trabajo local"],
 ["/tienda","Comercio","Productos de Parcela Los Morochos y cotizaciones"],
 ["/marketplace","Comercio","Mercado Agro: publicaciones revisadas"],
 ["/marketplace/[id]","Comercio","Detalle de una publicación activa real"],
 ["/rubros","Taxonomía agropecuaria","Cultivos, animales, productos, insumos y servicios"],
 ["/fincas","Directorio","Fincas de Venezuela"],["/fincas/[id]","Directorio","Ficha pública activa de una finca"],
 ["/empresas","Directorio","Empresas y proveedores del agro"],["/empresas/[id]","Directorio","Ficha pública de empresa"],
 ["/profesionales","Directorio","Profesionales y empresas del agro"],["/profesionales/[id]","Directorio","Perfil público activo de profesional o empresa"],
 ["/red","Comunidad","Comunidad del agro"],["/red/[id]","Comunidad","Publicación activa de una finca activa"],
 ["/proyectos","Colaboración","Proyectos y alianzas revisados"],
 ["/aprende","Conocimiento","Guías y artículos del agro"],["/aprende/[slug]","Conocimiento","Guía o artículo publicado"],
 ["/nosotros","Institucional","Historia de Parcela Los Morochos"],["/guia-institucional","Institucional","Guía institucional del productor"],
 ["/legal/privacidad","Legal","Privacidad"],["/legal/terminos","Legal","Términos de uso"],["/legal/comercio","Legal","Política comercial"],["/creditos-fotograficos","Créditos","Fotografía documental y licencias"],
] as const;
export function decoratePublicMetadata(path:string,metadata:Metadata):Metadata {
 const title=typeof metadata.title==="string"?metadata.title:"Venezuela Agro";
 const defaults=pageMetadata(path,title,metadata.description||"Herramientas, información y conexiones del agro venezolano.");
 return {...defaults,...metadata,robots:robotsPolicy(!isPrivatePath(path)),openGraph:{...defaults.openGraph,...metadata.openGraph,url:SITE_ORIGIN+path},twitter:{...defaults.twitter,...metadata.twitter}};
}
