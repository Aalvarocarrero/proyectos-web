import {ownRecord,denseValues} from './state-validation.mjs';
export const quantityActivity={id:'quantity',stage:'3y',key:'3y:quantity',area:'Matemáticas',type:'digital',kind:'interactive',label:'3–5 años · ayuda opcional',unit:'Una para cada cuenco',title:'Repartir y comparar',copy:'Mueve fichas grandes. Mira qué cuenco tiene una y cuál queda vacío.',goal:'Explorar un reparto uno a uno y observar qué cambia al añadir un cuenco o una ficha.',duration:'Una ronda o varias · sin reloj',support:'Puedes pedir ayuda a un adulto para leer o pulsar',transfer:'Con un adulto, reparte tarjetas grandes de cartón entre dos o tres lugares de una mesa despejada. Usa materiales adecuados a la edad, sin piezas pequeñas. También puedes señalar lugares sin usar objetos.'};
export const quantityRounds=[
 {bowls:2,total:2,title:'Dos cuencos',instruction:'Pon una ficha en cada cuenco.',change:'Hay 2 fichas y 2 cuencos.'},
 {bowls:3,total:2,title:'Un cuenco más',instruction:'Da una a cada cuenco que puedas.',change:'Añadimos un cuenco. Siguen siendo 2 fichas.'},
 {bowls:3,total:3,title:'Una ficha más',instruction:'Pon una ficha en cada cuenco.',change:'Añadimos una ficha. Ahora hay 3.'}
];
const names=['A','B','C'];
export const newQuantity=()=>({page:'guide',round:0,rounds:[{counts:[0,0,0],checked:false},null,null]});
export function validateQuantity(s){
 ownRecord(s,['page','round','rounds']);
 if(!['guide','play','close'].includes(s.page)||!Number.isInteger(s.round)||s.round<0||s.round>2||!Array.isArray(s.rounds)||s.rounds.length!==3)throw Error('Invalid quantity state');
 const descriptors=Object.getOwnPropertyDescriptors(s.rounds);
 if(Object.getPrototypeOf(s.rounds)!==Array.prototype||Reflect.ownKeys(s.rounds).length!==4||Object.keys(s.rounds).some(k=>!['0','1','2'].includes(k))||[0,1,2].some(i=>!descriptors[i]||!Object.hasOwn(descriptors[i],'value')))throw Error('Invalid quantity rounds');
 const rounds=s.rounds.map((r,i)=>{
  if(r===null)return null;
  ownRecord(r,['counts','checked']);const counts=denseValues(r.counts,[0,1,2,3],3,true),rule=quantityRounds[i];
  if(typeof r.checked!=='boolean'||counts.reduce((a,b)=>a+b,0)>rule.total||i===0&&counts[2]!==0)throw Error('Invalid quantity allocation');
  return {counts,checked:r.checked};
 });
 if(!rounds[0]||!rounds[s.round]||rounds[2]&&!rounds[1]||s.page==='guide'&&(s.round!==0||rounds[0].counts.some(Boolean)||rounds[0].checked||rounds[1]||rounds[2]))throw Error('Inconsistent quantity state');
 return {...s,rounds};
}
export function quantityResult(s){
 const rule=quantityRounds[s.round],counts=s.rounds[s.round].counts.slice(0,rule.bowls),reserve=rule.total-counts.reduce((a,b)=>a+b,0);
 return {counts,reserve,empty:counts.map((n,i)=>n===0?names[i]:null).filter(Boolean),oneEachPossible:rule.total>=rule.bowls,matched:reserve===0&&counts.every(n=>n<=1)};
}
export function moveQuantity(s,bowl,delta){
 if(s.page!=='play'||!Number.isInteger(bowl)||bowl<0||bowl>=quantityRounds[s.round].bowls||![1,-1].includes(delta))return false;
 const r=s.rounds[s.round];if(delta===1&&!quantityResult(s).reserve||delta===-1&&!r.counts[bowl])return false;
 r.counts[bowl]+=delta;r.checked=false;return true;
}
export function visitQuantity(s,direction){
 if(s.page!=='play'||![-1,1].includes(direction)||s.round+direction<0||s.round+direction>2)return false;
 const next=s.round+direction;
 if(!s.rounds[next])s.rounds[next]={counts:[...s.rounds[s.round].counts],checked:false};
 s.round=next;return true;
}
export function quantityFeedback(s){
 const r=quantityResult(s),rule=quantityRounds[s.round];
 if(r.matched)return rule.bowls===2?'Hay una en cada cuenco. No queda ninguna en la reserva.':rule.total===2?`Dos cuencos tienen una ficha cada uno. El cuenco ${r.empty[0]} queda vacío: falta una ficha para darle una también.`:'Hay una en cada uno de los tres cuencos.';
 if(r.counts.some(n=>n>1))return 'Hay un cuenco con más de una. Puedes devolver una ficha y darla a un cuenco vacío.';
 return r.reserve===1?'Queda una ficha en la reserva. Puedes darla a un cuenco vacío.':`Quedan ${r.reserve} fichas en la reserva. Prueba a dar una a cada cuenco.`;
}
export function quantityHint(s){const r=quantityResult(s);return r.matched?(r.empty.length?'Un cuenco queda vacío. Con dos fichas no hay una para los tres. Puedes probar con una ficha más.':'Hay una en cada cuenco. Puedes mirar tu reparto o probar otra ronda.'):'Busca un cuenco vacío. Puedes darle una ficha de la reserva o devolver una de otro cuenco.';}
const dots=n=>`<span class="quantity-dots" aria-hidden="true">${Array.from({length:n},()=>'<span class="quantity-token"></span>').join('')}</span>`;
const number=n=>n===0?'Ninguna ficha':n===1?'1 ficha':`${n} fichas`;
export function renderQuantity(root,state,{finish}){
 const s=state.quantity??=newQuantity(),rule=quantityRounds[s.round],r=quantityResult(s);
 const redraw=selector=>{renderQuantity(root,state,{finish});root.querySelector(selector)?.focus();};
 const recap=s.rounds.map((x,i)=>x?`<li>${quantityRounds[i].title}: ${x.counts.slice(0,quantityRounds[i].bowls).map((n,j)=>`${names[j]}: ${n}`).join(' · ')}. Reserva: ${quantityRounds[i].total-x.counts.reduce((a,b)=>a+b,0)}.</li>`:'').join('');
 root.innerHTML=`<section class="quantity-workshop" aria-labelledby="quantity-title"><p class="eyebrow">3–5 años · puedes pedir ayuda</p><h4 id="quantity-title" tabindex="-1">Una para cada cuenco</h4>${s.page==='guide'?`<p>Da una ficha. Mira qué queda.</p><p>Usa «Dar una» y «Devolver una».</p><div class="quantity-example" aria-label="Una ficha en un cuenco">${dots(1)}<span>Una ficha</span></div><button type="button" class="action primary" id="quantity-start">Quiero repartir</button>`:s.page==='close'?`<h5>Tu reparto queda aquí</h5><ul>${recap}</ul><p>Puedes volver a mirar o parar.</p><p><strong>Fuera de pantalla, con un adulto:</strong> reparte tarjetas grandes de cartón entre dos o tres lugares. Sin piezas pequeñas. También puedes señalar los lugares.</p><p>No hace falta completar las rondas.</p><div class="controls"><button type="button" class="action secondary" id="quantity-revisit">Volver a mi reparto</button><button type="button" class="action primary" id="quantity-finish">Terminar por hoy</button></div>`:`<h5>${rule.title}</h5><p>${rule.change}</p><p class="quantity-task"><strong>${rule.instruction}</strong></p><div class="quantity-reserve" role="group" aria-label="Reserva"><strong>Reserva: ${number(r.reserve)}</strong>${dots(r.reserve)}</div><div class="quantity-bowls">${r.counts.map((n,i)=>`<article class="quantity-bowl"><h5>Cuenco ${names[i]}</h5><div class="quantity-vessel">${dots(n)}</div><p>${number(n)}</p><div class="quantity-controls"><button type="button" class="action primary" data-quantity-give="${i}" aria-label="Dar una ficha al cuenco ${names[i]}" ${r.reserve?'':'disabled'}>Dar una <span aria-hidden="true">＋</span></button><button type="button" class="action secondary" data-quantity-return="${i}" aria-label="Devolver una ficha del cuenco ${names[i]} a la reserva" ${n?'':'disabled'}>Devolver una <span aria-hidden="true">−</span></button></div></article>`).join('')}</div><div class="controls"><button type="button" class="action primary" id="quantity-check">Mirar mi reparto</button><button type="button" class="action secondary" id="quantity-hint">Una pista</button></div><p id="quantity-feedback" role="status" tabindex="-1">${s.rounds[s.round].checked?quantityFeedback(s):''}</p><nav class="controls" aria-label="Rondas del reparto">${s.round>0?'<button type="button" class="action secondary" id="quantity-previous">Ver mi ronda anterior</button>':''}${s.round<2?`<button type="button" class="action secondary" id="quantity-next">${s.round===0?'Probar con un cuenco más':'Probar con una ficha más'}</button>`:''}<button type="button" class="action secondary" id="quantity-close">Llevar la idea fuera de pantalla</button></nav>`}<details class="quantity-adult"><summary>Ayuda para acompañar, si hace falta</summary><p>Lee una frase y espera. Puede señalar y otra persona pulsar. No hace falta decir los números. Puedes nombrar cada ficha una sola vez mientras la señalas.</p><p>Todas las fichas tienen el mismo tamaño. Comparamos cuántas hay, no lo grandes que parecen. En la ronda de tres cuencos y dos fichas, cualquiera puede quedar vacío: no hay un cuenco correcto. Dos fichas juntas no dan una a cada cuenco.</p><p>Al abrir una ronda nueva se copia el reparto anterior. Cada ronda conserva luego sus elecciones; volver a una ronda recupera ese reparto, no traslada fichas entre rondas. Puedes pasar aunque quede algo por probar.</p><p>Sin reloj, puntos o vidas. Esto no evalúa capacidades ni acredita que se domine contar. El juego físico requiere un adulto y materiales adecuados a la edad.</p></details><p class="quiet">Puedes pausar o terminar arriba.</p></section>`;
 const on=(id,fn)=>root.querySelector('#'+id)?.addEventListener('click',fn);
 on('quantity-start',()=>{s.page='play';redraw('#quantity-title');});
 for(const [attr,delta] of [['give',1],['return',-1]])root.querySelectorAll(`[data-quantity-${attr}]`).forEach(b=>b.onclick=()=>{const index=Number(b.dataset[attr==='give'?'quantityGive':'quantityReturn']);moveQuantity(s,index,delta);renderQuantity(root,state,{finish});const same=root.querySelector(`[data-quantity-${attr}="${index}"]`);(same.disabled?root.querySelector(`[data-quantity-${attr==='give'?'return':'give'}="${index}"]`):same)?.focus();root.querySelector('#quantity-feedback').textContent=`Cuenco ${names[index]}: ${number(s.rounds[s.round].counts[index])}. Reserva: ${number(quantityResult(s).reserve)}.`;});
 on('quantity-check',()=>{s.rounds[s.round].checked=true;redraw('#quantity-feedback');});
 on('quantity-hint',()=>{const f=root.querySelector('#quantity-feedback');f.textContent=quantityHint(s);f.focus();});
 on('quantity-next',()=>{visitQuantity(s,1);redraw('#quantity-title');});on('quantity-previous',()=>{visitQuantity(s,-1);redraw('#quantity-title');});
 on('quantity-close',()=>{s.page='close';redraw('#quantity-title');});on('quantity-revisit',()=>{s.page='play';redraw('#quantity-title');});on('quantity-finish',finish);
}
