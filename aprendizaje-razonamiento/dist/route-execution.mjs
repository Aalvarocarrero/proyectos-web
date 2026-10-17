// Execution traces are session-only; no additional progress or personal data.
const trials=new WeakMap();
export const routePrograms={vague:null,clear:['right','right','down'],reverse:['down','down','right'],blocked:['right','right','down'],around:['down','right','right'],short:['down','right']};
export function executeRoute(choice,blocked=false,limit=3){
 const program=routePrograms[choice];let x=0,y=0;const path=['A1'];
 if(!program)return {path,status:'El mensaje no indica pasos. No podemos adivinar por dónde ir.',arrived:false};
 for(const command of program.slice(0,limit)){
  const nx=x+(command==='right'?1:0),ny=y+(command==='down'?1:0),cell=String.fromCharCode(65+nx)+(ny+1);
  if(blocked&&cell==='B1')return {path,status:'B1 está bloqueada: el personaje permanece en '+path.at(-1)+'. Revisa el mensaje.',arrived:false};
  x=nx;y=ny;path.push(cell);
 }
 const arrived=path.at(-1)==='C2';return {path,arrived,status:arrived?'Llegamos a C2 siguiendo el mensaje.':path.length<=program.length?'Quedan instrucciones por ejecutar.':'El mensaje termina en '+path.at(-1)+', lejos de C2. Puedes revisarlo.'};
}
export function mountRouteExecution(root,state){
 let trial=trials.get(state);if(!trial||trial.step!==state.extraStep){trial={step:state.extraStep,choice:null,count:0,previous:null,executed:null};trials.set(state,trial);}
 const panel=document.createElement('section');panel.className='route-execution';panel.setAttribute('aria-label','Laboratorio de mensajes');
 panel.innerHTML='<h4>Prueba lo que dice el mensaje</h4><p>Elige un mensaje y ejecuta sus instrucciones. Cambia de versión para comparar sus consecuencias. Al recargar, la ejecución vuelve al inicio.</p><div class="controls"><button class="action primary" id="route-step" type="button">Ejecutar un paso</button><button class="action secondary" id="route-reset" type="button">Volver a A1</button><button class="action secondary" id="route-pass" type="button">Pasar esta idea</button></div><p id="route-trace" role="status" aria-live="polite"></p><p id="route-previous"></p>';
 root.querySelector('.scenario').append(panel);
 const label=choice=>root.querySelector(`[data-extra-answer="${choice}"]`)?.textContent.trim()||'';
 const archive=()=>{if(trial.executed)trial.previous=trial.executed;trial.executed=null;trial.count=0;};
 const draw=()=>{
  const result=trial.executed||{path:['A1'],status:trial.choice?'Mensaje seleccionado, todavía sin ejecutar.':'Elige un mensaje para empezar.'};
  panel.querySelector('#route-trace').textContent=(trial.executed?'Ejecución actual: ':'Borrador en A1: ')+(trial.choice?'«'+label(trial.choice)+'». ':'')+result.path.join(' → ')+'. '+result.status;
  panel.querySelector('#route-previous').textContent=trial.previous?'Última ejecución anterior: «'+trial.previous.label+'». '+trial.previous.path.join(' → ')+'. '+trial.previous.status:'';
  root.querySelectorAll('.route-grid span').forEach(cell=>{const at=cell.textContent.slice(0,2);cell.classList.toggle('route-visited',result.path.includes(at));cell.classList.toggle('route-current',result.path.at(-1)===at);});
 };
 const select=()=>{if(trial.choice!==state.extraChoice){archive();trial.choice=state.extraChoice;}};
 const run=count=>{select();if(trial.choice){trial.count=count;trial.executed={...executeRoute(trial.choice,state.extraStep===1,count),label:label(trial.choice)};}draw();};
 root.querySelectorAll('[data-extra-answer]').forEach(button=>button.addEventListener('click',()=>{select();draw();}));
 panel.querySelector('#route-step').onclick=()=>run(Math.min(3,trial.count+1));
 panel.querySelector('#route-reset').onclick=()=>{select();archive();draw();};
 root.querySelector('#check-extra').addEventListener('click',()=>run(3));
 panel.querySelector('#route-pass').onclick=()=>{if(state.extraStep===0)root.querySelector('#next-extra').click();else document.querySelector('#finish-session').click();};
 select();draw();
}
