export const COMPANION_KEY='education-facilitation-guide:companion';
export const companionShapes=['round','leaf','square'];
export const companionColors=['forest','plum','ocean'];
export function decodeCompanion(raw){
 if(raw===null)return {ok:true,value:null};
 try{if(typeof raw!=='string'||raw.length>256)throw Error();const v=JSON.parse(raw);if(!v||Array.isArray(v)||Object.keys(v).sort().join(',')!=='color,shape,version,visible'||v.version!==1||!companionShapes.includes(v.shape)||!companionColors.includes(v.color)||typeof v.visible!=='boolean')throw Error();return {ok:true,value:v};}catch{return {ok:false,value:null};}
}
export function mountCompanion(root,getHint,storage){
 let baseline=null,pref=null,editing=false,message='',optionsOpen=false;
 try{baseline=storage.getItem(COMPANION_KEY);const decoded=decodeCompanion(baseline);pref=decoded.value;if(!decoded.ok)message='No pudimos leer la apariencia guardada. Puedes probar en esta sesión; conservaremos el dato anterior.';}catch{message='El guardado no está disponible; puedes probar en esta sesión.';}
 const read=()=>{try{return {ok:true,raw:storage.getItem(COMPANION_KEY)}}catch{return {ok:false}}};
 const save=value=>{
  const current=read();pref=value;
  if(!current.ok){message='Apariencia solo en esta sesión; no se pudo guardar.';return;}
  if(current.raw!==baseline||!decodeCompanion(current.raw).ok){message='El guardado cambió o no se puede leer. Esta apariencia solo se usa aquí. Recarga la página para cargar el último guardado.';return;}
  try{const raw=JSON.stringify(value);storage.setItem(COMPANION_KEY,raw);if(storage.getItem(COMPANION_KEY)!==raw)throw Error();baseline=raw;message='Apariencia guardada en este navegador. No contiene datos personales.';}catch{message='Apariencia solo en esta sesión; no se pudo confirmar el guardado.';}
 };
 const draw=()=>{
  const figure=pref||{version:1,shape:'round',color:'forest',visible:false};
  const visible=figure.visible;
  const label=document.querySelector('#companion-launcher-label');if(label)label.textContent='Ayuda opcional · pistas para esta actividad';
  const mini=document.querySelector('#activity-companion .companion-mini');if(mini){mini.hidden=!visible;mini.className='companion-mini '+figure.shape+' '+figure.color;}
  root.innerHTML=`<div class="companion-head"><div><p class="eyebrow">CUANDO LO NECESITES</p><h2 id="companion-title" tabindex="-1">Pistas para esta actividad</h2></div>${visible?`<div class="companion-figure ${figure.shape} ${figure.color}" aria-hidden="true"><span>• •</span><span>⌣</span></div>`:''}</div><p class="quiet">Una sugerencia para el paso que estás probando. Puedes cerrar la ayuda y seguir a tu ritmo.</p>${editing?`<form id="companion-form"><fieldset><legend>Elige su apariencia, sin fotos ni nombres</legend><label for="companion-shape">Forma</label><select id="companion-shape">${[['round','Redonda'],['leaf','Hoja'],['square','Cuadrada suave']].map(([id,label])=>`<option value="${id}" ${figure.shape===id?'selected':''}>${label}</option>`).join('')}</select><label for="companion-color">Color</label><select id="companion-color">${[['forest','Bosque'],['plum','Ciruela'],['ocean','Océano']].map(([id,label])=>`<option value="${id}" ${figure.color===id?'selected':''}>${label}</option>`).join('')}</select></fieldset><div class="controls"><button type="button" class="action primary" id="companion-save">Usar esta apariencia</button><button type="button" class="action secondary" id="companion-cancel">Cancelar</button></div></form>`:`<div class="controls"><button type="button" class="action primary" id="companion-hint">Dame una pista</button></div><p id="companion-message" role="status" aria-live="polite" aria-atomic="true">${message}</p><details id="companion-options" ${optionsOpen?'open':''}><summary>Luma y otras opciones</summary><p class="quiet">Luma es un personaje opcional con pistas fijas. No conversa ni interpreta emociones. Un adulto acompaña a los pequeños.</p><div class="controls">${visible?'<button type="button" class="action secondary" id="companion-gesture">Reconocer una estrategia que probé</button><button type="button" class="action secondary" id="companion-hide">Ocultar personaje</button>': '<button type="button" class="action secondary" id="companion-show">Mostrar a Luma</button>'}<button type="button" class="action secondary" id="companion-edit">${pref?'Personalizar':'Personalizar esta muestra'}</button>${pref?'<button type="button" class="action secondary" id="companion-forget">Olvidar apariencia</button>':''}</div></details>`}<button type="button" class="action secondary" id="companion-close" ${root.closest('#activity-companion')?'':'hidden'}>Volver a la actividad</button>`;
  root.querySelector('#companion-options')?.addEventListener('toggle',e=>{optionsOpen=e.target.open;});
  const on=(id,fn)=>root.querySelector('#'+id)?.addEventListener('click',fn);
  const redraw=()=>{draw();root.querySelector('#companion-title').focus();};
  on('companion-edit',()=>{editing=true;draw();root.querySelector('#companion-shape').focus();});
  root.querySelector('form')?.addEventListener('submit',e=>e.preventDefault());
  on('companion-cancel',()=>{editing=false;redraw();});
  on('companion-save',()=>{save({version:1,shape:root.querySelector('#companion-shape').value,color:root.querySelector('#companion-color').value,visible:true});editing=false;redraw();});
  on('companion-hide',()=>{save({...figure,visible:false});redraw();});
  on('companion-show',()=>{save({...figure,visible:true});redraw();});
  on('companion-gesture',()=>{root.querySelector('#companion-message').textContent='Puedes reconocer una estrategia que probaste: observar, comparar o pedir ayuda. No hace falta acertar. En las historias no hay emociones correctas.';if(!document.defaultView.matchMedia?.('(prefers-reduced-motion: reduce)').matches)root.querySelector('.companion-figure')?.animate?.([{transform:'rotate(-4deg)'},{transform:'rotate(0deg)'}],{duration:250});});
  on('companion-hint',()=>{root.querySelector('#companion-message').textContent=getHint();});
  const close=()=>{const dock=root.closest('#activity-companion');if(dock){dock.open=false;dock.querySelector('summary').focus();}};
  on('companion-close',close);root.onkeydown=null;const dock=root.closest('#activity-companion');if(dock)dock.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();close();}};
  on('companion-forget',()=>{const current=read();if(current.ok&&current.raw===baseline&&decodeCompanion(current.raw).ok){try{storage.removeItem(COMPANION_KEY);baseline=null;pref=null;message='Apariencia olvidada. El progreso de las actividades se conserva.';}catch{message='No se pudo borrar la apariencia.';}}else message='No se ha borrado: el guardado cambió o no está disponible. Recarga para revisar.';redraw();});
 };
 draw();
 return {refresh:draw};
}
