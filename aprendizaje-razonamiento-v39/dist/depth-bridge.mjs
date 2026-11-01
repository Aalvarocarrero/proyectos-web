// Presentation stays in memory, outside saved game schemas. No depth bundle until requested.
const views=new WeakMap();
export function mountOptionalDepth(host,collection,key){
 if(!host)return;let view=views.get(key);if(!view){view={enabled:false,angle:false};views.set(key,view);}
 host.className='depth-explorer';
 host.innerHTML='<button type="button" class="action secondary" data-depth-toggle aria-expanded="false">Vista con profundidad · opcional</button><div data-depth-panel hidden></div><p data-depth-status role="status"></p>';
 const toggle=host.querySelector('[data-depth-toggle]'),panel=host.querySelector('[data-depth-panel]'),status=host.querySelector('[data-depth-status]');
 async function draw(){panel.hidden=!view.enabled;toggle.setAttribute('aria-expanded',String(view.enabled));toggle.textContent=view.enabled?'Cerrar vista con profundidad':'Vista con profundidad · opcional';if(!view.enabled)return;status.textContent='Preparando otra vista de las mismas fichas…';try{const {renderDepth}=await import('./depth-view.mjs');if(!host.isConnected||!view.enabled)return;renderDepth(panel,collection,view);status.textContent='Son las mismas fichas actuales. Cambiar de vista no añade ni mueve fichas.';}catch{status.textContent='Esta vista no está disponible. Puedes seguir usando las bandejas y sus controles de arriba.';}}
 toggle.onclick=()=>{view.enabled=!view.enabled;draw();};draw();
}
