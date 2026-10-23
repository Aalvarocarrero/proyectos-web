import {learningScene} from './experience-art.mjs';
import {dashboardMarkup,bindDashboard} from './dashboard.mjs';
import {activityTitle,entriesFor} from './catalog.mjs';
export const WELCOME_KEY='education-facilitation-guide:welcome';
export const welcomeStages=[['18m','18–23 meses','Un turno contigo'],['2y','24–35 meses','Imitar juntos'],['3y','3–5 años','Mirar y probar'],['5y','6–8 años','Explorar con ayuda'],['7y','9–12 años','Comparar ideas'],['12y','13–18 años','Preguntar con razones']];
export function decodeWelcome(raw){
 if(raw===null)return {ok:true,value:null};
 try{if(typeof raw!=='string'||raw.length>160)throw Error();const p=JSON.parse(raw);if(!p||Object.keys(p).sort().join(',')!=='role,stage,version'||p.version!==1||!['adult','student'].includes(p.role)||!welcomeStages.some(s=>s[0]===p.stage)||(p.role==='student'&&!['7y','12y'].includes(p.stage)))throw Error();return {ok:true,value:p};}catch{return {ok:false,value:null};}
}
const art=()=>learningScene('home','welcome-art');
const stageArt=id=>learningScene(id);
const goalArt=a=>`<svg class="welcome-goal-art" viewBox="0 0 240 120" aria-hidden="true"><rect width="240" height="120" rx="24" fill="#e9eedf"/>${a.type==='guide'?'<circle cx="91" cy="67" r="34" fill="#bd654b"/><path d="M58 58 Q91 91 124 58" fill="none" stroke="#fffdf5" stroke-width="5"/><path d="M166 81 Q184 46 214 76" fill="none" stroke="#7c9370" stroke-width="8" stroke-linecap="round"/>':a.key.endsWith(':original')?'<rect x="40" y="61" width="39" height="39" rx="9" fill="#24604f"/><circle cx="142" cy="52" r="27" fill="#bd654b"/><path d="M173 99 L205 45 L234 99 Z" fill="#c19143"/>':a.id==='quantity'?'<path d="M30 70 Q58 54 84 70 L78 98 H37Z M108 70 Q136 54 162 70 L156 98 H115Z M182 70 Q210 54 236 70 L230 98 H189Z" fill="#729383"/><circle cx="56" cy="53" r="12" fill="#c19143"/><circle cx="134" cy="51" r="12" fill="#bd654b"/><circle cx="208" cy="53" r="12" fill="#24604f"/>':a.area==='Idiomas'||a.area==='Lenguaje'?'<path d="M34 22 H206 V78 H112 L82 101 V78 H34Z" fill="#215747"/><path d="M66 42 H172 M66 58 H147" stroke="#fffdf5" stroke-width="7"/>':a.area==='Pensamiento crítico'||a.area==='Filosofía'?'<path d="M38 22 H108 V98 H38Z M132 22 H202 V98 H132Z" fill="#fffdf7" stroke="#84977d" stroke-width="4"/><path d="M53 42 H92 M53 57 H87 M147 42 H185 M147 57 H178" stroke="#496d63" stroke-width="5"/><path d="M111 60 H129" stroke="#bd654b" stroke-width="6"/>':'<circle cx="75" cy="54" r="27" fill="#e4bc69" stroke="#215747" stroke-width="5"/><path d="M96 74 L125 100 M59 54 H91" stroke="#215747" stroke-width="7"/>'}</svg>`;
export function mountWelcome(root,{storage,getResume,openActivity,onHome}){
 let baseline=null,pref=null,message='',step=0,role='adult',band=null,demo=false,dashboardBand=undefined,resumeSignature='',catalogOpen=false;
 const window=document.defaultView,navigationViews=new Map(),navigationSession=window.crypto?.randomUUID?.()||String(Date.now());
 let navigationIndex=0,navigationSignature='',restoringNavigation=false;
 // History keeps only an opaque reference. Age, support and activity stay in this tab's memory.
 const rememberView=view=>{
  const signature=JSON.stringify(view);if(signature===navigationSignature)return;navigationSignature=signature;
  if(restoringNavigation)return;
  const id=navigationSession+':'+navigationIndex++;navigationViews.set(id,view);
  try{window.history[navigationIndex===1?'replaceState':'pushState']({educationView:id},'');}catch{/* Optional navigation support; activities remain usable. */}
 };
 const signature=()=>{const r=getResume();return r?r.key+':'+r.phase:'';};
 try{baseline=storage?.getItem(WELCOME_KEY)??null;const decoded=decodeWelcome(baseline);pref=decoded.value;if(!decoded.ok)message='No pudimos leer este inicio. Lo conservamos sin sustituirlo.';}catch{message='Puedes explorar sin guardar este inicio.';}
 if(pref){role=pref.role;band=pref.stage;}
 const library=document.querySelector('#all-proposals'),stageSection=document.querySelector('#etapas'),anchor=document.createComment('stage home');stageSection.before(anchor);
 const back=document.querySelector('#back-home');
 const setHome=()=>{document.body.classList.remove('guided-session','garden-focus');anchor.after(stageSection);back.hidden=true;library.open=false;onHome();document.body.classList.remove('garden-focus');step=0;catalogOpen=false;draw();root.querySelector('h1')?.focus();};
 back.addEventListener('click',setHome);
 const launch=key=>{document.body.classList.add('guided-session');back.after(stageSection);back.hidden=false;openActivity(key);rememberView({kind:'activity',key,step,role,band,catalogOpen,dashboardBand});};
 const mutate=value=>{
  try{if(!storage)throw Error();const now=storage.getItem(WELCOME_KEY);if(now!==baseline||!decodeWelcome(now).ok){message='Este inicio cambió en otra pestaña o no se puede leer. Recarga antes de guardarlo; tus juegos se conservan.';return;}
   if(value===null)storage.removeItem(WELCOME_KEY);else storage.setItem(WELCOME_KEY,JSON.stringify(value));
   const expected=value===null?null:JSON.stringify(value);if(storage.getItem(WELCOME_KEY)!==expected)throw Error();baseline=expected;pref=value;message=value?'Inicio recordado en este navegador. No cambia tus juegos.':'Preferencias del inicio borradas. Tus juegos y Luma se conservan.';
  }catch{message='No se pudo guardar este inicio. Puedes seguir en esta sesión; tus juegos no se borran.';}
 };
 const bind=(id,fn)=>root.querySelector('#'+id)?.addEventListener('click',fn);
 const render=()=>{draw();root.querySelector('[tabindex="-1"]')?.focus();};
 function draw(){
  resumeSignature=signature();root.dataset.experienceStage=band||'none';root.dataset.view=catalogOpen?'library':step===0?'home':'journey';
  const resume=getResume(),info=welcomeStages.find(s=>s[0]===band),young=['18m','2y'].includes(band),adult=!['7y','12y'].includes(band)||role==='adult';
  let content='';
  const navigation=`<nav class="experience-nav" aria-label="Navegación del aprendizaje"><button type="button" id="welcome-home" aria-current="${!catalogOpen?'page':'false'}">Mi espacio</button><button type="button" id="welcome-explore" aria-expanded="${catalogOpen}" aria-controls="experience-library">Biblioteca</button><button type="button" id="welcome-family-nav" aria-label="Guía para quien acompaña">Adultos</button></nav>`;
  if(step===0)content=catalogOpen?`<div class="library-heading"><p class="eyebrow">TU BIBLIOTECA · ACCESO LIBRE</p><h1 tabindex="-1">Un lugar para cada curiosidad.</h1><p>Explora por edad o por lo que te interesa. Cada propuesta explica su alcance.</p></div>`:`<div class="welcome-lead"><div class="welcome-introduction"><p class="eyebrow">DE 18 MESES A 18 AÑOS · A TU RITMO</p><h1 tabindex="-1">Un pequeño descubrimiento.<br><em>Una idea que te llevas.</em></h1><p>Un lugar para mirar, probar y pensar. Elige una etapa y encuentra una propuesta para hoy.</p><div class="controls">${resume?`<button type="button" class="action primary" id="welcome-continue">Continuar · ${activityTitle(resume)} <span aria-hidden="true">→</span></button>`:''}<button type="button" class="action ${resume?'secondary':'primary'}" id="welcome-begin">${resume?'Elegir otra actividad':'Elegir una etapa'} <span aria-hidden="true">→</span></button></div>${resume?`<p class="resume-note">${welcomeStages.find(s=>s[0]===resume.stage)?.[1]||''} · ${resume.phase==='paused'?'En pausa':'En curso'} · tu idea sigue aquí</p>`:'<p class="home-assurance">Sin perfiles infantiles. Sin anuncios. Con espacio para parar.</p>'}</div><div class="welcome-hero-scene">${art()}<span class="scene-caption">Mirar · probar · conversar</span></div></div><div class="experience-promise"><span><b>01</b> Encuentra tu etapa</span><span><b>02</b> Prueba una idea</span><span><b>03</b> Llévala fuera de pantalla</span></div>`;
  if(step===1)content=`<p class="eyebrow">CÓMO EXPLORAMOS · ACOMPAÑAMIENTO</p><h1 tabindex="-1">¿Quién explorará?</h1><p>Elige cómo presentar la actividad. Puedes cambiarlo después.</p><div class="welcome-choices"><button type="button" class="welcome-choice" data-role="adult"><strong>Con una persona adulta</strong><span>La persona adulta puede leer y acompañar.</span></button><button type="button" class="welcome-choice" data-role="student"><strong>Por mi cuenta</strong><span>Soy estudiante y puedo pedir ayuda.</span></button></div>`;
  if(step===2)content=`<p class="eyebrow">ELIGE TU ETAPA · EDAD ORIENTATIVA</p><h1 tabindex="-1">¿Qué edad aproximada tiene quien explora?</h1><p>Es solo para elegir propuestas. No pedimos fecha de nacimiento y puedes cambiar después.</p><div class="welcome-bands">${welcomeStages.map(([id,label,note])=>`<button type="button" class="welcome-choice age-choice" data-band="${id}">${stageArt(id)}<strong>${label}</strong><span>${note}</span></button>`).join('')}</div>`;
  if(step===3){
   const entries=entriesFor(band).sort((a,b)=>Number(a.id==='words')-Number(b.id==='words')||Number(a.id==='quantity')-Number(b.id==='quantity')),primary=entries.slice(0,1),extra=entries.slice(1);
   const card=(a,featured=false)=>`<button type="button" class="welcome-choice ${featured?'featured-choice':''}" data-welcome-route="${a.key}">${featured?stageArt(band):goalArt(a)}<span class="route-card-copy"><span class="route-area">${a.area}</span><strong>${activityTitle(a)}</strong>${featured?`<span class="route-goal">${a.cardPreview||a.goal}</span><span class="route-first">Primero: ${{'18m':'prepara una pelota grande y blanda.','2y':'prepara un muñeco y un espacio seguro.','3y':'mira las figuras; puedes señalar antes de elegir.','5y':'elige una flecha y observa dónde lleva.','7y':'mira qué necesita la salida antes de elegir.','12y':'lee una afirmación y consulta sus datos.'}[band]}</span>`:''}${a.age?`<span>${a.age}</span>`:''}<span class="route-call">${a.key===resume?.key?'Volver a esta propuesta':a.type==='guide'?'Ver la guía del adulto':'Empezar esta propuesta'} <span aria-hidden="true">→</span></span></span></button>`;
   content=`<p class="eyebrow">TU PROPUESTA · ${info[1]} · ${band==='3y'?'APOYO SEGÚN LA PROPUESTA':adult?'CON ADULTO':'CON APOYO SI LO NECESITAS'}</p><h1 tabindex="-1">${young?'Un momento juntos, fuera de la pantalla.':'¿Qué te apetece probar hoy?'}</h1>${young?`<div class="welcome-demo"><span class="caregiver-label">Para la persona adulta</span><div><p>${band==='18m'?'Adulto: una invitación breve con una pelota grande y blanda. El niño puede mirar, tocar o pasar.':'Adulto: saluda a un muñeco e invita a imitar o cambiar la historia.'}</p><button type="button" class="action secondary" id="welcome-demo">${demo?'Ocultar la guía':'Preparar el momento'}</button>${demo?`<div role="status" class="adult-layer"><p>${band==='18m'?'Prepara un espacio despejado y una pelota grande, blanda y adecuada. Hazla rodar suavemente una vez; espera sin pedir respuesta.':'Usa un muñeco y una tela grande adecuada, bajo supervisión. Saluda, cubre y descubre, e invita a imitar o cambiar la historia.'}</p><p>La compañía adulta se mantiene todo el tiempo. Sin piezas pequeñas, lectura, cuentas ni tarea en pantalla. Sigue el interés del niño y para si lo desea. Aparta la pantalla para la actividad física.</p></div>`:''}</div></div>`:`<p>${band==='3y'?'Una propuesta visual para probar; el apoyo está disponible.':'Empieza por una propuesta. Puedes cambiarla o parar cuando quieras.'}</p><ol class="welcome-map" aria-label="Tu próximo paso"><li>Elige</li><li>Prueba con ayuda</li><li>Llévalo fuera de pantalla</li></ol>`}<div class="welcome-choices">${primary.map(a=>card(a,true)).join('')}</div>${extra.length?`<details class="welcome-more"><summary>Ver otras propuestas de esta franja (${extra.length})</summary><div class="welcome-choices">${extra.map(a=>card(a)).join('')}</div></details>`:''}<details class="welcome-family"><summary>${young?'Guía completa para la persona adulta':'Ayuda, pausa y salida'}</summary><p>${young?'No hay juego autónomo en pantalla ni pasos que el pequeño deba completar. Sigue su iniciativa; puedes parar ahora.':'Ofrece una pista y espera. Se puede señalar, pedir ayuda, cambiar de propuesta o descansar. No hace falta acertar para que la conversación tenga valor.'}</p><p>Puedes cambiar de franja o volver al inicio en cualquier momento. No necesitas completar actividades para elegir otra edad. Estas sugerencias organizan la interfaz; no evalúan capacidades ni certifican resultados.</p></details><div class="controls"><button type="button" class="action secondary" id="welcome-remember">Recordar este inicio</button><button type="button" class="action secondary" id="welcome-band">Cambiar franja</button></div><p class="quiet">Recordar guarda solo franja y tipo de acompañamiento en este navegador compartido.</p>`;
  }
  root.innerHTML=navigation+content+`<section id="experience-library" ${step===0&&catalogOpen?'':'hidden'}>${step===0?dashboardMarkup(dashboardBand??band??resume?.stage??''):''}</section><div class="welcome-tools">${step>0?'<button type="button" class="action secondary" id="welcome-back">← Atrás</button>':''}<button type="button" class="action secondary" id="welcome-skip">${step?'Ver todas las propuestas':'Catálogo completo'}</button>${pref?'<button type="button" class="action secondary" id="welcome-reset">Olvidar preferencias del inicio</button>':''}</div><p id="welcome-status" role="status" aria-live="polite">${message}</p>`;
  if(step===0)bindDashboard(root,{band:dashboardBand??band??resume?.stage??'',onBand:value=>{dashboardBand=value;if(value){band=value;if(!['7y','12y'].includes(band))role='adult';message=pref&&pref.stage!==band?'Franja cambiada solo para esta sesión. Tu inicio recordado no cambia.':'';}draw();root.querySelector('#dashboard-band').focus();},launch,openDestination:target=>{
   if(target==='progress'){if(document.querySelector('#progress-options').getAttribute('aria-expanded')!=='true')document.querySelector('#progress-options').click();document.querySelector('#progress-options').focus();document.querySelector('#local-progress').scrollIntoView?.({block:'start'});return;}
   showCatalog();let destination;
   if(target==='companion'){const dock=document.querySelector('#activity-companion');if(dock)dock.open=true;destination=document.querySelector('#companion-title');}
   else if(target==='family')destination=document.querySelector('#principios h2');
   else destination=document.querySelector('#'+target+' h3');
   if(destination){destination.tabIndex=-1;destination.focus();destination.scrollIntoView?.({block:'start'});}
  }});
  bind('welcome-home',()=>{catalogOpen=false;step=0;render();});
  bind('welcome-explore',()=>{catalogOpen=true;step=0;render();});
  bind('welcome-family-nav',()=>{showCatalog();const heading=document.querySelector('#principios h2');heading.tabIndex=-1;heading.focus();heading.scrollIntoView?.({block:'start'});});
  bind('welcome-begin',()=>{catalogOpen=false;step=band?3:2;render();});bind('welcome-continue',()=>{const candidate=getResume();if(candidate)launch(candidate.key);else render();});
  root.querySelectorAll('[data-role]').forEach(b=>b.onclick=()=>{role=b.dataset.role;step=3;demo=false;message='';render();});
  root.querySelectorAll('[data-band]').forEach(b=>b.onclick=()=>{band=b.dataset.band;if(!['7y','12y'].includes(band)){role='adult';step=3;}else step=1;demo=false;message=pref&&(pref.stage!==band||pref.role!==role)?'Cambio solo en esta sesión. Pulsa «Recordar este inicio» si quieres conservarlo.':'';render();});
  root.querySelectorAll('[data-welcome-route]').forEach(b=>b.onclick=()=>launch(b.dataset.welcomeRoute));
  bind('welcome-demo',()=>{demo=!demo;draw();root.querySelector('#welcome-demo').focus();});
  bind('welcome-back',()=>{step=step===1?2:step===2?0:Math.max(0,step-1);demo=false;render();});bind('welcome-band',()=>{step=2;demo=false;render();});
  bind('welcome-remember',()=>{mutate({version:1,role,stage:band});render();});
  bind('welcome-reset',()=>{mutate(null);if(pref===null){band=null;role='adult';step=0;}render();});
  bind('welcome-skip',()=>{library.open=true;library.querySelector('summary').focus();library.scrollIntoView?.({block:'start'});});
  rememberView({kind:'welcome',step,role,band,catalogOpen,dashboardBand});
 }
 const showCatalog=()=>{document.body.classList.remove('guided-session','garden-focus');anchor.after(stageSection);back.hidden=true;library.open=true;draw();};
 document.addEventListener('click',event=>{const trigger=event.target.closest('#garden-library,#paused-catalog,#finished-catalog');if(document.body.classList.contains('guided-session')&&trigger){event.preventDefault();showCatalog();const target=trigger.id==='finished-catalog'?document.querySelector('#stage-buttons [aria-pressed="true"]'):document.querySelector('#stage-title');target?.focus();stageSection.scrollIntoView?.({block:'start'});}});
 document.querySelectorAll('a[href="#principios"],.explore-nav a').forEach(a=>a.addEventListener('click',()=>{if(document.body.classList.contains('guided-session'))showCatalog();library.open=true;}));
 document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();setHome();});
 window.addEventListener('popstate',event=>{
  const view=navigationViews.get(event.state?.educationView);if(!view)return;
  restoringNavigation=true;step=view.step;role=view.role;band=view.band;catalogOpen=view.catalogOpen;dashboardBand=view.dashboardBand;demo=false;
  if(view.kind==='activity')launch(view.key);
  else{document.body.classList.remove('guided-session','garden-focus');anchor.after(stageSection);back.hidden=true;library.open=false;onHome();draw();root.querySelector('h1')?.focus();}
  restoringNavigation=false;
 });
 draw();
 return {launch,refresh:()=>{if(step===0&&!document.body.classList.contains('guided-session')&&resumeSignature!==signature())draw();}};
}
