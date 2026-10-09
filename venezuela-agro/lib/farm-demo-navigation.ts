/** Navigation only: never copies examples into a real account or modifies practice data. */
export const demoSections = ["Resumen","Animales","Pesajes","Plano y potreros","Producción","Planificación y costos","Inventario","Mis publicaciones","Sincronización","Seguridad y privacidad","Configurar finca"] as const;
const viewSections:Record<string,string> = {overview:"Resumen",animals:"Animales",land:"Plano y potreros",production:"Producción",intelligence:"Planificación y costos",inventory:"Inventario",marketplace:"Mis publicaciones",sync:"Sincronización",security:"Seguridad y privacidad",settings:"Configurar finca"};
export function demoSectionFromSearch(search:string){const value=new URLSearchParams(search).get("area");return demoSections.find(section=>section===value)??"Resumen";}
export function demoLinkForView(view:string){return `/finca-demo?area=${encodeURIComponent(viewSections[view]??"Resumen")}`;}
export const farmLearningExamples:Record<string,{input:string;action:string;result:string}>={
 overview:{input:"Una finca ficticia con animales, áreas y movimientos.",action:"Abre sus módulos y revisa los datos de práctica.",result:"Reconoce qué información alimenta cada resumen."},
 animals:{input:"Cerdo de ejemplo con pesajes de 60, 70, 80 y 120 kg en fechas distintas.",action:"Abre su ficha y registra o edita un pesaje de práctica.",result:"Un animal conserva su historial; cada pesaje no crea otro animal."},
 land:{input:"Potreros, cultivos e instalaciones ficticias con superficie definida.",action:"Abre un área, revisa su uso y modifica su croquis de práctica.",result:"El plano refleja el área editada; el croquis no certifica linderos."},
 production:{input:"Un ciclo ficticio con categoría, objetivo y fechas.",action:"Edita el ciclo y guarda el ejemplo.",result:"Consulta el ciclo actualizado; no se crea una venta ni se vincula automáticamente a un terreno."},
 intelligence:{input:"Ingresos, gastos y supuestos ficticios de un escenario.",action:"Revisa o modifica un movimiento y sus valores.",result:"Compara el registro guardado y el resumen; un escenario no garantiza rentabilidad."},
 inventory:{input:"Un artículo ficticio con cantidad, unidad y nivel mínimo.",action:"Edita su cantidad o ubicación y guarda el ejemplo.",result:"La ficha conserva los datos nuevos; no modifica existencias reales."},
 marketplace:{input:"Un borrador ficticio con título, categoría y ubicación.",action:"Edita el borrador de práctica.",result:"Consulta el borrador guardado; no se publica ni se envía a revisión."},
 sync:{input:"Cambios ficticios guardados en la finca de práctica.",action:"Abre Sincronización y descarga una copia de la demostración.",result:"Obtienes un archivo de práctica; no equivale a respaldo central de tu cuenta."},
 security:{input:"Una demostración compartida en este navegador.",action:"Lee sus límites antes de introducir información.",result:"Identifica dónde practicar y dónde gestionar la seguridad real; aquí no se cambian permisos."},
 settings:{input:"Nombre, superficie y objetivo de una finca ficticia.",action:"Edita y guarda su configuración de ejemplo.",result:"La finca de práctica refleja los datos nuevos; tu finca real se conserva."}
};
export function learningExampleForView(view:string){return farmLearningExamples[view]??farmLearningExamples.overview;}
