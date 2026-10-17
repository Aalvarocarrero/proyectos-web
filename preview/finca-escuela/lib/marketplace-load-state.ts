/** Public content only. Bad responses never replace a valid local snapshot. */
export function readPublishedMarketplaceRows(value: unknown): Record<string, unknown>[] {
  if (!value || typeof value !== 'object' || !Array.isArray((value as {listings?:unknown}).listings)) throw new Error('No se pudo leer la respuesta del mercado.');
  return ((value as {listings:unknown[]}).listings).filter((row): row is Record<string,unknown> => !!row && typeof row === 'object' && ['id','title','description','category','location','sellerName'].every(key => typeof (row as Record<string,unknown>)[key] === 'string') && (row as Record<string,unknown>).status === 'active' && !(row as Record<string,unknown>).demo);
}
export function marketplaceLoadMessage(state: 'loading'|'ready'|'error'|'offline', hasSaved: boolean) {
  if (state === 'loading') return 'Comprobando publicaciones…';
  if (state === 'error') return hasSaved ? 'No pudimos actualizar. Conservamos la última consulta de este navegador; confirma disponibilidad con el anunciante.' : 'No pudimos cargar las ofertas. Puedes reintentar o explorar los ejemplos identificados como demostración.';
  if (state === 'offline') return hasSaved ? 'Sin conexión. Consulta guardada en este navegador; la disponibilidad puede haber cambiado.' : 'Sin conexión. No hay ofertas guardadas aquí. Los ejemplos no son ofertas reales.';
  return 'Consulta actualizada. Precio, disponibilidad y entrega se acuerdan con el anunciante.';
}

export function marketplaceCountLabel(count:number, examples:boolean) {
 return `${count} ${examples ? (count===1 ? "ejemplo" : "ejemplos") : (count===1 ? "oferta" : "ofertas")}`;
}

/** Collapse only explicit demos; never drop a real publication. */
export function marketplacePreviewRows<T extends {demo?:boolean}>(rows:T[], expanded:boolean):T[]{
 if(expanded)return rows;let shown=0;return rows.filter(row=>{if(!row.demo)return true;if(shown>=2)return false;shown++;return true;});
}

/** An unavailable catalogue is different from a search with no matches. */
export function marketplaceEmptyState(state: 'loading'|'ready'|'error'|'offline', examples: boolean, hasPublished: boolean) {
 if (!examples && !hasPublished) {
  if (state === 'loading') return {title:'Comprobando ofertas…', description:'Espera un momento mientras consultamos las publicaciones.'};
  if (state === 'error') return {title:'No pudimos cargar las ofertas.', description:'Usa Actualizar ofertas para volver a intentarlo. También puedes explorar las demostraciones.'};
  if (state === 'offline') return {title:'No hay ofertas guardadas en este dispositivo.', description:'Vuelve a conectarte para consultar publicaciones. Los ejemplos incluidos siguen disponibles.'};
  return {title:'Todavía no hay ofertas publicadas.', description:'Puedes preparar un anuncio para revisión o explorar ejemplos de cada categoría.'};
 }
 return {title:'No encontramos resultados.', description:'Prueba otra categoría o una búsqueda más amplia.'};
}
