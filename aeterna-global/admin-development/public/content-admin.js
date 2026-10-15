const form=document.getElementById('editor'),status=document.getElementById('status');let pending=false,dirty=false;
form.addEventListener('input',()=>{dirty=true;});
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
async function submit(action){if(pending)return;if(action==='publish'&&!confirm('¿Publicar estos cambios en la portada? Los visitantes verán esta versión.'))return;
 pending=true;form.querySelectorAll('button').forEach(b=>b.disabled=true);status.textContent='Guardando…';
 try{const response=await fetch('/api/admin/content',{method:'POST',headers:{'Content-Type':'application/json','X-Content-Admin':'1'},body:JSON.stringify({action,expectedVersion:Number(form.dataset.version),content:Object.fromEntries(new FormData(form))})});const data=await response.json();if(!response.ok)throw Error(data.error||'No se pudo guardar.');form.dataset.version=String(data.version);dirty=false;status.textContent=action==='publish'?'Contenido publicado.':'Borrador guardado. La vista privada ya muestra estos cambios.';}catch(error){status.textContent=error.message;}finally{pending=false;form.querySelectorAll('button').forEach(b=>b.disabled=false);}
}
form.addEventListener('submit',e=>{e.preventDefault();submit('save');});document.getElementById('publish').addEventListener('click',()=>submit('publish'));
