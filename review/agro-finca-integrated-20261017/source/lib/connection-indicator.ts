export type ConnectionIndicatorInput={online:boolean|null;pending:number|null;mode:'local'|'account'|'demo'|'unknown'};
export function connectionIndicator({online,pending,mode}:ConnectionIndicatorInput){
 const network=online===null?'Comprobando conexión':online?'Con conexión':'Sin conexión';
 const networkDetail=online===null?'Todavía no se ha comprobado la conexión del navegador.':online?'El navegador detecta red. No garantiza acceso al servidor ni que tus cambios estén sincronizados.':'Sin conexión · modo local. Solo están disponibles los datos y recursos preparados en este navegador.';
 const short=online===false?'Sin conexión · modo local':network;
 const detail=mode==='demo'?'Demostración: no consulta ni modifica tus registros reales.':mode==='local'?'Estás trabajando en este dispositivo, sin respaldo central confirmado.':mode==='account'?'Espacio de la cuenta seleccionada. El respaldo solo se confirma al recibir respuesta del servidor.':'Todavía no se ha comprobado el espacio de trabajo.';
 const queue=mode==='demo'?'Sin cola de registros reales.':pending===null?'No se pudo comprobar la cola local.':pending>0?`${pending} cambio${pending===1?'':'s'} pendiente${pending===1?'':'s'} de sincronizar`:'No se detectan cambios pendientes en este espacio. Esto no acredita una copia de seguridad.';
 return {short,network,networkDetail,detail,queue,pending:mode==='demo'?0:pending};
}
