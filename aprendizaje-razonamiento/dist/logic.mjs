export const stages = [
 {id:'18m',label:'18–24 meses',title:'Descubrir juntos',mode:'Guía para el adulto',copy:'Juego presencial, atención compartida y turnos. El adulto consulta la idea y guarda la pantalla.'},
 {id:'2y',label:'2–3 años',title:'Imitar y explorar',mode:'Guía para el adulto',copy:'Pequeñas secuencias con objetos reales. Acompaña la iniciativa sin exigir terminar.'},
 {id:'3y',label:'3–5 años',title:'Encontrar una regla',mode:'Actividad disponible',copy:'Observar, comparar y explicar: un mismo objeto puede pertenecer a grupos diferentes.'},
 {id:'5y',label:'5–7 años',title:'Construir una idea',mode:'Próxima etapa',copy:'Historias, secuencias y causas y efectos. El módulo específico todavía no está implementado.'},
 {id:'7y',label:'7–11 años',title:'Elegir con criterio',mode:'Actividad disponible',copy:'Planear, comparar opciones y revisar una decisión cuando cambian los recursos.'},
 {id:'12y',label:'12–18 años',title:'Dar forma a tu camino',mode:'Próxima etapa',copy:'Argumentación, proyectos y decisiones con apoyo. El módulo específico todavía no está implementado.'}
];
export const shapes = [{id:'a',shape:'circle',color:'blue',name:'Círculo azul'},{id:'b',shape:'triangle',color:'blue',name:'Triángulo azul'},{id:'c',shape:'circle',color:'orange',name:'Círculo naranja'},{id:'d',shape:'triangle',color:'orange',name:'Triángulo naranja'}];
export function checkGrouping(ids,rule){
 if(!['color','shape'].includes(rule))throw new Error('Regla desconocida');
 const unique=[...new Set(ids)]; if(unique.some(id=>!shapes.some(s=>s.id===id)))throw new Error('Pieza desconocida');
 const expected=shapes.filter(s=>rule==='color'?s.color==='blue':s.shape==='circle').map(s=>s.id);
 const missing=expected.filter(id=>!unique.includes(id)); const extra=unique.filter(id=>!expected.includes(id));
 return {correct:missing.length===0&&extra.length===0,missing,extra};
}
export const supplies=[{id:'water',name:'Agua',cost:0,kind:'essential',icon:'💧',description:'Llenar una botella reutilizable en casa.'},{id:'fruit',name:'Fruta preparada',cost:2,kind:'food',icon:'🍎',description:'Una opción para la merienda ficticia.'},{id:'sandwich',name:'Bocadillo',cost:4,kind:'food',icon:'🥪',description:'Otra opción para la merienda ficticia.'},{id:'map',name:'Revisar la ruta',cost:0,kind:'essential',icon:'🗺️',description:'Comprobar el recorrido con un adulto.'},{id:'notebook',name:'Cuaderno',cost:3,kind:'optional',icon:'📓',description:'Para dibujar lo que encuentres.'},{id:'toy',name:'Juego nuevo',cost:6,kind:'optional',icon:'🪁',description:'Es opcional; también puedes jugar sin comprar.'}];
export function evaluatePlan(ids,budget=8){
 if(!Number.isFinite(budget)||budget<0)throw new Error('Presupuesto inválido');
 const unique=[...new Set(ids)]; if(unique.some(id=>!supplies.some(s=>s.id===id)))throw new Error('Opción desconocida');
 const selected=supplies.filter(s=>unique.includes(s.id)); const total=selected.reduce((n,s)=>n+s.cost,0);
 const missing=supplies.filter(s=>s.kind==='essential'&&!unique.includes(s.id)).map(s=>s.name);
 if(!selected.some(s=>s.kind==='food'))missing.push('Una merienda');
 return {total,remaining:budget-total,missing,overBudget:total>budget,ready:total<=budget&&missing.length===0};
}
