export const COMPANION_KEY='education-facilitation-guide:companion';
export const companionShapes=['round','leaf','square'];
export const companionColors=['forest','plum','ocean'];
export function decodeCompanion(raw){
 if(raw===null)return {ok:true,value:null};
 try{if(typeof raw!=='string'||raw.length>256)throw Error();const v=JSON.parse(raw);if(!v||Array.isArray(v)||Object.keys(v).sort().join(',')!=='color,shape,version,visible'||v.version!==1||!companionShapes.includes(v.shape)||!companionColors.includes(v.color)||typeof v.visible!=='boolean')throw Error();return {ok:true,value:v};}catch{return {ok:false,value:null};}
}
export function mountCompanion(root,getHint,storage){
 let baseline=null,pref=null,editing=false,message='';
 try{baseline=storage.getItem(COMPANION_KEY);const decoded=decodeCompanion(baseline);pref=decoded.value;if(!decoded.ok)message='No pudimos leer la apariencia guardada. Puedes probar en esta sesión; conservaremos el dato anterior.';}catch{message='El guardado no está disponible; puedes probar en esta sesión.';}
 const read=()=>{try{return {ok:true,raw:storage.getItem(COMPANION_KEY)}}catch{return {ok:false}}};
 const save=value=>{
  const current=read();pref=value;
  if(!current.ok){message='Apariencia solo en esta sesión; no se pudo guardar.';return;}
  if(current.raw!==baseline||!decodeCompanion(current.raw).ok){message='El guardado cambió o no se puede leer. Esta apariencia solo se usa aquí. Recarga la página para cargar el último guardado.';return;}
  try{const raw=JSON.stringify(value);storage.setItem(COMPANION_KEY,raw);if(storage.getItem(COMPANION_KEY)!==raw)throw Error();baseline=raw;message='Apariencia guardada en este navegador. No contiene datos personales.';}catch{message='Apariencia solo en esta sesión; no se pudo confirmar el guardado.';}
 };
 const draw=()=>{
  const figure=pref||{shape:'round',color:'forest'};
  root.innerHTML=`<div class="companion-head"><div><p class="eyebrow">ACOMPAÑANTE OPCIONAL</p><h2 id="companion-title" tabindex="-1">Un personaje para explorar contigo</h2></div>${pref?.visible?`<div class="companion-figure ${figure.shape} ${figure.color}" aria-hidden="true"><span>• •</span><span>⌣</span></div>`:''}</div><p class="quiet">Es un personaje digital con pistas escritas y fijas. No es una persona, no conversa ni interpreta emociones. Un adulto sigue siendo quien acompaña a los pequeños.</p>${editing?`<form id="companion-form"><fieldset><legend>Elige su apariencia, sin fotos ni nombres</legend><label for="companion-shape">Forma</label><select id="companion-shape">${[['round','Redonda'],['leaf','Hoja'],['square','Cuadrada suave']].map(([id,label])=>`<option value="${id}" ${figure.shape===id?'selected':''}>${label}</option>`).join('')}</select><label for="companion-color">Color</label><select id="companion-color">${[['forest','Bosque'],['plum','Ciruela'],['ocean','Océano']].map(([id,label])=>`<option value="${id}" ${figure.color===id?'selected':''}>${label}</option>`).join('')}</select></fieldset><div class="controls"><button type="button" class="action primary" id="companion-save">Usar esta apariencia</button><button type="button" class="action secondary" id="companion-cancel">Cancelar</button></div></form>`:`<div class="controls">${pref?.visible?'<button type="button" class="action primary" id="companion-hint">Una pista para mi actividad</button><button type="button" class="action secondary" id="companion-hide">Ocultar personaje</button>':pref?'<button type="button" class="action secondary" id="companion-show">Mostrar personaje</button>':''}<button type="button" class="action secondary" id="companion-edit">${pref?'Personalizar':'Crear acompañante'}</button>${pref?'<button type="button" class="action secondary" id="companion-forget">Olvidar apariencia</button>':''}</div>`}<p id="companion-message" role="status" aria-live="polite" aria-atomic="true">${message}</p>`;
  const on=(id,fn)=>root.querySelector('#'+id)?.addEventListener('click',fn);
  const redraw=()=>{draw();root.querySelector('#companion-title').focus();};
  on('companion-edit',()=>{editing=true;draw();root.querySelector('#companion-shape').focus();});
  root.querySelector('form')?.addEventListener('submit',e=>e.preventDefault());
  on('companion-cancel',()=>{editing=false;redraw();});
  on('companion-save',()=>{save({version:1,shape:root.querySelector('#companion-shape').value,color:root.querySelector('#companion-color').value,visible:true});editing=false;redraw();});
  on('companion-hide',()=>{save({...pref,visible:false});redraw();});
  on('companion-show',()=>{save({...pref,visible:true});redraw();});
  on('companion-hint',()=>{root.querySelector('#companion-message').textContent=getHint();root.querySelector('.companion-figure')?.animate?.([{transform:'rotate(-4deg)'},{transform:'rotate(0deg)'}],{duration:document.defaultView.matchMedia?.('(prefers-reduced-motion: reduce)').matches?0:250});});
  on('companion-forget',()=>{const current=read();if(current.ok&&current.raw===baseline&&decodeCompanion(current.raw).ok){try{storage.removeItem(COMPANION_KEY);baseline=null;pref=null;message='Apariencia olvidada. El progreso de las actividades se conserva.';}catch{message='No se pudo borrar la apariencia.';}}else message='No se ha borrado: el guardado cambió o no está disponible. Recarga para revisar.';redraw();});
 };
 draw();
}
