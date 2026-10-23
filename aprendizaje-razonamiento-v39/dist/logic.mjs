export const stages = [
 {id:'18m',label:'18–23 meses',title:'Descubrir juntos',mode:'Guía para el adulto',copy:'Atención compartida y turnos con objetos reales. El adulto consulta la propuesta y aparta la pantalla.',goal:'Compartir un turno de juego, siguiendo su iniciativa.',duration:'3–5 min de juego sin pantalla',support:'Juego presencial acompañado',kind:'offline',unit:'Mi turno, tu turno',transfer:'Haz rodar una pelota grande y blanda. Espera su respuesta y sigue su iniciativa, sin exigir que la devuelva.'},
 {id:'2y',label:'24–35 meses',title:'Imitar y explorar',mode:'Guía para el adulto',copy:'Una pequeña historia con objetos reales. Acompaña sin exigir terminar ni mantener la atención.',goal:'Imitar o inventar una secuencia breve durante el juego.',duration:'3–8 min de juego sin pantalla',support:'Juego presencial acompañado',kind:'offline',unit:'Dos pasos, muchas historias',transfer:'Saluda a un muñeco y arrópalo. Invita a imitar, cambiar la historia o elegir otro juego.'},
 {id:'3y',label:'3–5 años',title:'Encontrar una regla',mode:'3 propuestas para elegir',copy:'Un mismo objeto puede formar parte de grupos diferentes. Observa, compara y explica con ayuda.',goal:'Agrupar por una característica y explicar la elección.',duration:'3–8 min orientativos',support:'Un adulto lee y acompaña',kind:'interactive',unit:'Laboratorio de formas',transfer:'Busca con un adulto dos objetos grandes de la misma forma y distinto color. Agrúpalos de otra manera.'},
 {id:'5y',label:'6–8 años',title:'Construir una idea',mode:'2 juegos y 2 retos',copy:'Ordena una historia, busca qué cambió y conecta una prueba con su resultado.',goal:'Ordenar tres momentos y reconocer un cambio en la prueba.',duration:'5–10 min orientativos',support:'Apoyo lector si hace falta',kind:'interactive',unit:'El puente que cambió',transfer:'Dobla una hoja de dos maneras. ¿Qué cambia en su forma? Puedes dibujar tu idea sin hacer una prueba real.'},
 {id:'7y',label:'9–12 años',title:'Elegir con criterio',mode:'2 retos y una unidad guiada',copy:'Planea una salida ficticia y revisa una decisión cuando cambian los recursos.',goal:'Cubrir lo necesario dentro de un presupuesto ficticio.',duration:'8–15 min orientativos',support:'Con ayuda cuando la necesites',kind:'interactive',unit:'Una salida, varias soluciones',transfer:'Con un adulto, piensa qué llevarías a una salida real y qué ya tienes en casa. La historia no es una lista de seguridad completa.'},
 {id:'12y',label:'13–18 años',title:'Preguntar por la evidencia',mode:'2 propuestas para elegir',copy:'Distingue una opinión de una medida, limita una conclusión y propone una comparación más justa.',goal:'Separar un cambio observado de una explicación causal.',duration:'10–20 min orientativos',support:'Puedes conversar o usar papel',kind:'interactive',unit:'¿Qué podemos concluir?',transfer:'Busca una afirmación cotidiana y pregúntate: ¿qué se midió, qué falta y qué otra explicación podría haber? No hace falta seguir en pantalla.'}
];
export const sessionPhases = ['intro','active','paused','finished'];
export function nextSessionPhase(current,action){
 if(!sessionPhases.includes(current))throw new Error('Estado desconocido');
 const transitions={intro:{start:'active',finish:'finished'},active:{pause:'paused',finish:'finished'},paused:{resume:'active',finish:'finished'},finished:{restart:'intro'}};
 const next=transitions[current][action];if(!next)throw new Error('Transición no permitida');return next;
}
export const storyCards = [
 {id:'test',title:'Primera prueba',icon:'↘',text:'Lía coloca un coche de papel sobre su puente plano. El puente se hunde.'},
 {id:'change',title:'Una nueva idea',icon:'⌁',text:'Después de ver que se hunde, Lía dobla los bordes del mismo papel.'},
 {id:'retry',title:'Volver a probar',icon:'↗',text:'Con los bordes doblados, vuelve a usar el mismo coche. Esta vez el puente lo sostiene.'}
];
export const initialStoryOrder=['retry','test','change'];
export function moveStoryCard(order,id,direction){
 if(order.length!==3||new Set(order).size!==3||order.some(x=>!storyCards.some(c=>c.id===x)))throw new Error('Historia inválida');
 if(![-1,1].includes(direction)||!order.includes(id))throw new Error('Movimiento inválido');
 const next=[...order],i=next.indexOf(id),j=i+direction;if(j<0||j>=next.length)return next;
 [next[i],next[j]]=[next[j],next[i]];return next;
}
export function checkStory(order){return order.length===3&&order.every((id,i)=>id===storyCards[i].id);}
export const evidenceSources = [
 {id:'survey',title:'Una encuesta de opinión',tag:'Preferencia',body:'10 de las 12 personas que quisieron responder dicen que les gusta la nueva fuente.'},
 {id:'count',title:'Un recuento de botellas',tag:'Medida con límites',body:'Antes: 120 botellas y 200 asistentes. Después: 84 botellas y 140 asistentes. Se contó en dos recreos distintos; el segundo día llovió.'},
 {id:'poster',title:'El anuncio del fabricante',tag:'Afirmación comercial',body:'«Nuestra fuente hará que desaparezcan las botellas de un solo uso». No aporta datos de este colegio.'}
];
export const evidenceQuestions = [
 {id:'source',title:'¿Qué fuente permite comparar cuántas botellas se contaron?',options:[{id:'survey',label:'La encuesta de opinión'},{id:'count',label:'El recuento de botellas'},{id:'poster',label:'El anuncio del fabricante'}],answer:'count',explanation:'El recuento mide botellas. La encuesta mide opiniones y el anuncio hace una promesa. Una medida puede ser relevante y aun así tener límites.',hints:{survey:'Que una fuente guste no nos dice cuántas botellas se usaron. Busca una medida del fenómeno.',poster:'Una promesa sin datos no permite comparar. ¿Dónde están las observaciones?'}},
 {id:'claim',title:'Al tener en cuenta la asistencia, ¿qué conclusión sostienen estos datos?',options:[{id:'cause',label:'La fuente hizo que cada persona usara menos botellas.'},{id:'bounded',label:'Hubo menos botellas en total, pero la media fue igual: 0,6 por asistente en ambos recreos.'},{id:'never',label:'Las fuentes nunca reducen el uso de botellas.'}],answer:'bounded',explanation:'120 ÷ 200 = 0,6 y 84 ÷ 140 = 0,6. El total bajó junto con la asistencia. Dos observaciones no permiten atribuir un efecto a la fuente ni afirmar que nunca lo tenga.',hints:{cause:'Compara también la asistencia. ¿Qué pasa al dividir botellas entre asistentes?',never:'No observar una reducción por asistente en estos dos recreos no demuestra que sea imposible en otras condiciones.'}},
 {id:'next',title:'¿Qué ayudaría a investigar mejor la pregunta?',options:[{id:'likes',label:'Preguntar solo a quienes ya dicen que les gusta.'},{id:'repeat',label:'Repetir recuentos en días comparables, registrar asistencia y comparar botellas por asistente.'},{id:'advert',label:'Usar un anuncio con una promesa más clara.'}],answer:'repeat',explanation:'Repetir y comparar condiciones ayuda a investigar explicaciones alternativas. Es un diseño mejor, aunque por sí solo tampoco prueba una causa.',hints:{likes:'Elegir solo a quienes están a favor sesga la muestra y sigue midiendo preferencias.',advert:'Cambiar la promesa no añade observaciones. ¿Cómo podrías mejorar la comparación?'}}
];
export function checkEvidence(questionId,answer){const q=evidenceQuestions.find(q=>q.id===questionId);if(!q||!q.options.some(o=>o.id===answer))throw new Error('Respuesta desconocida');return {correct:q.answer===answer,feedback:q.answer===answer?q.explanation:q.hints[answer]};}
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
