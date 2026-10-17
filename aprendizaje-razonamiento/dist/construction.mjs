// Bounded original construction tasks. Only symbolic choices are persisted.
export const newConstruction=()=>({open:true,page:0,variant:0,items:[],tested:false,hint:false});
const tokens={circle:'Círculo',triangle:'Triángulo',right:'Derecha',down:'Abajo',left:'Izquierda',up:'Arriba'};
export const constructionLimit=(stage,page)=>stage==='3y'?(page===0?6:9):6;
export function constructionRule(s){const a=s.variant?'triangle':'circle',b=s.variant?'circle':'triangle';return s.page===0?[a,b]:[a,a,b];}
export function evaluateConstruction(stage,s){
 if(stage==='3y'){
  const rule=constructionRule(s),expected=Array.from({length:rule.length*3},(_,i)=>rule[i%rule.length]);
  const mismatch=s.items.findIndex((x,i)=>x!==expected[i]);
  return {correct:mismatch<0&&s.items.length===expected.length,trace:[],message:mismatch>=0?`Mira la posición ${mismatch+1}. Allí empieza o continúa el grupo ${rule.map(x=>tokens[x]).join(', ')}. Puedes quitar la última pieza y probar otra vez.`:s.items.length<expected.length?`Tu comienzo sigue la regla. Completa tres grupos: faltan ${expected.length-s.items.length} piezas.`:'Has construido tres grupos que repiten la misma regla. Puedes señalar dónde empieza cada grupo.'};
 }
 let x=0,y=0;const trace=['A1'];
 for(const [i,item] of s.items.entries()){
  const [dx,dy]={right:[1,0],down:[0,1],left:[-1,0],up:[0,-1]}[item];const nx=x+dx,ny=y+dy;
  if(nx<0||nx>2||ny<0||ny>2)return {correct:false,trace,message:`El paso ${i+1} sale del tablero desde ${trace.at(-1)}. Revisa esa dirección; el robot se queda en la última casilla válida.`};
  if(s.page>0&&nx===1&&ny===0)return {correct:false,trace,message:`El paso ${i+1} intenta entrar en B1, ahora bloqueada. Tu mensaje anterior necesita una revisión. Prueba un primer paso hacia abajo.`};
  x=nx;y=ny;trace.push(`${'ABC'[x]}${y+1}`);
 }
 const correct=x===2&&y===1;
 return {correct,trace,message:correct?'El mensaje lleva de A1 a C2. Otra persona puede seguirlo sin adivinar. Puede haber más de un camino.':`El mensaje termina en ${trace.at(-1)}. La meta es C2. Mira qué dirección o paso falta; puedes revisar el plan.`};
}
export function validateConstruction(raw,stage){
 const keys=['open','page','variant','items','tested','hint'];
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).some(k=>!keys.includes(k))||!['3y','5y'].includes(stage)||!Number.isInteger(raw.page)||raw.page<0||raw.page>2||![0,1].includes(raw.variant)||['open','tested','hint'].some(k=>typeof raw[k]!=='boolean')||!Array.isArray(raw.items)||raw.items.length>constructionLimit(stage,raw.page)||raw.items.some(x=>!(stage==='3y'?['circle','triangle']:['right','down','left','up']).includes(x)))throw new Error('Invalid construction');
 const copy={...raw,items:[...raw.items]};
 if(copy.page===2&&(!copy.tested||!evaluateConstruction(stage,copy).correct))throw new Error('Invalid construction closure');
 return copy;
}
export function renderConstruction(root,st,stage,{examples,finish}){
 const s=st.construction,pattern=stage==='3y',result=evaluateConstruction(stage,s),rule=pattern?constructionRule(s):[],limit=constructionLimit(stage,s.page);
 const labels=pattern?['circle','triangle']:['right','down','left','up'];
 const hint=pattern?`Señala este grupo: ${rule.map(x=>tokens[x]).join(', ')}. Después vuelve al comienzo del grupo. El adulto puede hacerlo con gestos.`:s.page===0?'Desde A1 puedes ir primero a la derecha o hacia abajo. Cuenta los cambios de columna hasta C y de fila hasta 2.':'B1 impide salir de A1 hacia la derecha. Baja a A2 y busca cómo llegar a C2.';
 root.innerHTML=`<section class="construction" aria-labelledby="construction-title"><p class="eyebrow">${pattern?'3–5 años · un adulto lee y acompaña':'6–8 años · con adulto'} · sin reloj ni puntuación</p><h4 id="construction-title" tabindex="-1">${s.page===2?'Lo que has construido':pattern?'Un taller de reglas':'Un mensaje que mueve al robot'}</h4><ol class="construction-steps" aria-label="Recorrido"><li ${s.page===0?'aria-current="step"':''}>Construir</li><li ${s.page===1?'aria-current="step"':''}>Cambiar una condición</li><li ${s.page===2?'aria-current="step"':''}>Contarlo fuera de pantalla</li></ol>${s.page===2?`<p>${pattern?'Elegiste un grupo, lo repetiste y lo revisaste cuando pasó de dos a tres piezas.':'Escribiste un mensaje, comprobaste dónde llegaba y lo revisaste cuando apareció un bloqueo.'}</p><p>${pattern?'Con un adulto, inventa una pareja de gestos y repítela. Después añade un gesto al grupo. Podéis parar cuando queráis.':'En papel, dibuja otro destino y explica un camino a otra persona. Deja que lo siga y pregunte lo que no entienda.'}</p><p><strong>Tu construcción:</strong> ${s.items.map(x=>tokens[x]).join(' · ')}.</p><p>No hay que escribir ni grabar una explicación. Puedes hablar, señalar o dibujar.</p><button type="button" class="action primary" id="construction-finish">Terminar por hoy</button>`:`<p>${pattern?(s.page===0?'Elige tu grupo de dos piezas. Construye una fila que lo repita tres veces.':'La regla cambia: ahora se repite dos veces la primera pieza antes de la otra. Conservamos tu fila para que puedas revisarla.'):(s.page===0?'El robot empieza en A1 y quiere llegar a C2. Construye un mensaje con hasta seis pasos. Cada botón añade una casilla de movimiento.':'Ahora B1 está bloqueada. El robot vuelve a A1. Conservamos tu mensaje: pruébalo y cambia lo necesario para llegar a C2.')}</p>${pattern?`${s.page===0?`<fieldset><legend>Tu grupo para repetir</legend><div class="controls">${[0,1].map(v=>`<button type="button" class="action secondary" data-construction-variant="${v}" aria-pressed="${s.variant===v}">${v?'Triángulo · Círculo':'Círculo · Triángulo'}</button>`).join('')}</div></fieldset>`:''}<p class="construction-rule"><strong>Regla actual:</strong> ${rule.map(x=>tokens[x]).join(' · ')}</p>`:`<div class="route-grid construction-grid" aria-label="Tablero de tres columnas A, B, C y tres filas 1, 2, 3">${['A1','B1','C1','A2','B2','C2','A3','B3','C3'].map(c=>`<span class="${s.tested&&result.trace.includes(c)?'route-visited':''}">${c}${c==='A1'?' · Inicio':c==='C2'?' · Meta':s.page===1&&c==='B1'?' · Bloqueada':''}${s.tested&&result.trace.at(-1)===c?' · Robot':''}</span>`).join('')}</div>`}<p id="construction-count">${s.items.length} de ${limit} ${pattern?'piezas':'pasos posibles'}</p><ol class="construction-items" aria-label="${pattern?'Tu fila':'Tu mensaje'}">${s.items.map(x=>`<li>${pattern?`<span aria-hidden="true">${x==='circle'?'●':'▲'}</span> `:''}${tokens[x]}</li>`).join('')}</ol>${!s.items.length?'<p>Tu construcción está vacía. Añade una pieza para empezar.</p>':''}<div class="controls" aria-label="Añadir a la construcción">${labels.map(x=>`<button type="button" class="action secondary" data-construction-add="${x}" ${s.items.length===limit?'disabled':''}>Añadir ${tokens[x].toLowerCase()}</button>`).join('')}</div><div class="controls"><button type="button" class="action secondary" id="construction-undo" ${s.items.length?'':'disabled'}>Quitar el último</button><button type="button" class="action secondary" id="construction-clear" ${s.items.length?'':'disabled'}>Vaciar esta construcción</button><button type="button" class="action primary" id="construction-test">${pattern?'Revisar mi fila':'Probar mi mensaje'}</button><button type="button" class="action secondary" id="construction-hint">Una pista para este paso</button></div><p id="construction-hint-text" role="status">${s.hint?hint:''}</p><p id="construction-feedback" role="status" tabindex="-1">${s.tested?result.message:''}</p>${!pattern&&s.tested?`<p>Recorrido observado: ${result.trace.join(' → ')}.</p>`:''}${s.tested&&result.correct?`<button type="button" class="action primary" id="construction-next">${s.page===0?'Probar una condición nueva':'Contar lo que cambió'}</button>`:''}`}
 <div class="controls"><button type="button" class="action secondary" id="construction-examples">Volver a los ejemplos guiados</button></div><p class="quiet">Puedes pausar o terminar arriba. No necesitas completar el taller.</p></section>`;
 const redraw=(focusId)=>{renderConstruction(root,st,stage,{examples,finish});root.querySelector(focusId)?.focus();};
 const edit=()=>{s.tested=false;};
 root.querySelectorAll('[data-construction-add]').forEach(b=>b.onclick=()=>{if(s.items.length>=limit)return;s.items.push(b.dataset.constructionAdd);edit();redraw(s.items.length===limit?'#construction-test':`[data-construction-add="${b.dataset.constructionAdd}"]`);});
 root.querySelectorAll('[data-construction-variant]').forEach(b=>b.onclick=()=>{s.variant=Number(b.dataset.constructionVariant);edit();redraw(`[data-construction-variant="${s.variant}"]`);});
 const on=(id,fn)=>{const b=root.querySelector('#'+id);if(b)b.onclick=fn;};
 on('construction-undo',()=>{s.items.pop();edit();redraw(s.items.length?'#construction-undo':'#construction-test');});
 on('construction-clear',()=>{s.items=[];edit();redraw('[data-construction-add]');});
 on('construction-test',()=>{s.tested=true;redraw('#construction-feedback');});
 on('construction-hint',()=>{s.hint=true;root.querySelector('#construction-hint-text').textContent=hint;});
 on('construction-next',()=>{s.page++;s.hint=false;if(s.page===1)s.tested=false;redraw('#construction-title');});
 on('construction-examples',()=>{s.open=false;examples();root.querySelector('#open-construction')?.focus();});
 on('construction-finish',finish);
}
