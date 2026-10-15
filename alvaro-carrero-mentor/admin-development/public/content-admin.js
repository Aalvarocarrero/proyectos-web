(() => {
 'use strict';
 const stateNode=document.getElementById('content-state');if(!stateNode)return;
 let state=JSON.parse(stateNode.textContent),dirty=false,busy=false,conflict=false,language='es';
 const form=document.getElementById('content-form'),feedback=document.getElementById('feedback'),save=document.getElementById('save'),publish=document.getElementById('publish'),preview=document.getElementById('preview'),reload=document.getElementById('reload');
 const initial=Object.fromEntries(new FormData(form));
 const current=()=>Object.fromEntries(new FormData(form));
 function update() {
  form.querySelectorAll('textarea,select').forEach(field=>field.disabled=busy);
  document.querySelectorAll('[data-lang]').forEach(button=>button.disabled=busy);
  save.disabled=busy||conflict;
  publish.disabled=busy||dirty||conflict||state.version===0;
  preview.setAttribute('aria-disabled',String(busy||dirty||conflict));
  document.getElementById('save-state').textContent=busy?'Guardando…':conflict?'Hay una versión más reciente':dirty?'Cambios sin guardar':'Todo al día';
  document.getElementById('version-label').textContent=state.version?`Borrador v${state.version}`:'Contenido original';
  document.getElementById('publication-label').textContent=state.publishedVersion?`Publicación v${state.publishedVersion}`:'Aún sin publicación desde el panel';
  reload.hidden=!conflict;
 }
 form.addEventListener('input',event=>{
  const data=current();dirty=Object.keys(initial).some(key=>initial[key]!==data[key]);
  const field=event.target,count=Array.from(document.querySelectorAll('[data-count-for]')).find(node=>node.dataset.countFor===field.name);
  if(count)count.textContent=`${field.value.length} / ${field.maxLength}`;
  if(field.tagName==='SELECT')field.closest('.image-field').querySelector('img').src=field.value;
  feedback.textContent=dirty?'Guarda el borrador antes de previsualizar o publicar.':'No hay cambios pendientes.';
  update();
 });
 document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>{
  language=button.dataset.lang;
  document.querySelectorAll('[data-lang]').forEach(node=>node.setAttribute('aria-pressed',String(node===button)));
  document.querySelectorAll('[data-language]').forEach(node=>node.hidden=node.dataset.language!==language);
  preview.href=`/admin/preview?lang=${language}`;
 }));
 preview.addEventListener('click',event=>{if(busy||dirty||conflict){event.preventDefault();feedback.textContent='Guarda tus cambios antes de abrir la vista previa.';}});
 reload.addEventListener('click',()=>{if(!dirty||confirm('La recarga descartará los cambios locales sin guardar. ¿Continuar?'))location.reload();});
 async function mutate(action) {
  if(busy||conflict)return;
  const content=current();
  if(action==='publish' && (dirty||state.version===0))return;
  if(action==='publish'&&!confirm('¿Publicar el borrador guardado en español e inglés? La página de inicio mostrará estos cambios.'))return;
  if(action==='save')for(const [key,value] of Object.entries(content))content[key]=value.trim();
  busy=true;update();
  try {
   const response=await fetch(`/api/admin/content${action==='publish'?'/publish':''}`,{method:action==='save'?'PUT':'POST',credentials:'same-origin',headers:{'content-type':'application/json','x-alvaro-admin':'content-v1'},body:JSON.stringify({expectedVersion:state.version,...(action==='save'?{content}:{})})});
   let result;try{result=await response.json();}catch{throw new Error('Respuesta no válida. Vuelve a cargar antes de intentar publicar.');}
   if(!response.ok){
    if(response.status===409){conflict=true;throw new Error('Otro guardado cambió el contenido. Tus cambios siguen aquí; recarga para revisar la versión del servidor.');}
    if(response.status===401||response.status===403)throw new Error('La sesión no permite editar. Vuelve a abrir el panel con la cuenta autorizada.');
    if(response.status===400)throw new Error('Revisa los campos: todos son obligatorios y deben respetar su longitud y formato.');
    throw new Error('No se pudo confirmar el guardado. Tus cambios siguen aquí; recarga para comprobar el servidor antes de reintentar.');
   }
   state=result.state;
   for(const [key,value] of Object.entries(state.draft)){initial[key]=value;form.elements.namedItem(key).value=value;}
   dirty=false;
   feedback.textContent=action==='publish'?'Publicación confirmada. El inicio ya usa el borrador guardado.':'Borrador guardado. Puedes revisarlo en la vista previa privada.';
  }catch(error){feedback.textContent=error.message||'No se pudo conectar. Tus cambios siguen aquí.';}
  finally{busy=false;update();}
 }
 form.addEventListener('invalid',event=>{
  const group=event.target.closest('[data-language]');
  if(group&&group.hidden)document.querySelector(`[data-lang="${group.dataset.language}"]`).click();
 },true);
 form.addEventListener('submit',event=>{event.preventDefault();if(form.reportValidity())mutate('save');});
 publish.addEventListener('click',()=>mutate('publish'));
 window.addEventListener('beforeunload',event=>{if(dirty||busy){event.preventDefault();event.returnValue='';}});
 update();
})();
