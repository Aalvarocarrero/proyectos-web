export const OFFLINE_LIBRARY_ROOTS=['/stickers','/marketplace','/profesionales','/fincas','/red','/proyectos','/aprende','/rubros','/tienda','/plataforma','/nosotros','/guia-institucional','/legal','/creditos-fotograficos','/biblioteca-local'];
export function isOfflineLibraryPath(path:string){return path==='/'||OFFLINE_LIBRARY_ROOTS.some(root=>path===root||path.startsWith(root+'/'));}
