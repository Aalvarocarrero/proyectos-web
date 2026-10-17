import {createLocalSpeech} from './local-speech.mjs';
import {languageFor} from './languages.mjs';
const sessions=new WeakMap();
function session(doc){
 if(sessions.has(doc))return sessions.get(doc);
 const win=doc.defaultView;let synthesis,Utterance;try{synthesis=win.speechSynthesis;Utterance=win.SpeechSynthesisUtterance;}catch{}
 const engine=createLocalSpeech({synthesis,Utterance,setTimer:win.setTimeout.bind(win),clearTimer:win.clearTimeout.bind(win)});
 const value={engine,dispose:null};sessions.set(doc,value);
 doc.addEventListener('click',event=>{if(!event.target.closest('.language-audio')&&['starting','speaking'].includes(engine.state.phase))engine.stop();},true);
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden)engine.stop();});win.addEventListener('pagehide',()=>engine.stop());win.addEventListener('hashchange',()=>engine.stop());
 return value;
}
export function stopLanguageAudio(doc){const active=sessions.get(doc);if(active){active.dispose?.();active.dispose=null;active.engine.reset();}}
export function mountLanguageAudio(root,id,indices){
 const doc=root.ownerDocument,{engine}=session(doc),language=languageFor(id),win=doc.defaultView;
 const panel=doc.createElement('section');panel.className='language-audio';panel.setAttribute('aria-label','Escuchar palabras · '+language.name);
 panel.innerHTML=`<p><strong>Voz sintética del dispositivo</strong> · ${language.name}</p><p class="quiet">Opcional. Solo usamos voces que el navegador identifica como locales. No es una grabación de un locutor ni una pronunciación certificada.</p><p id="speech-availability"></p><div class="controls">${indices.map(i=>`<button type="button" class="action secondary" data-speech-word="${i}">Escuchar <span lang="${language.id}">${language.words[i]}</span> · ${language.name}</button>`).join('')}<button type="button" class="action secondary" id="speech-repeat" disabled>Repetir la última palabra</button><button type="button" class="action secondary" id="speech-stop" disabled>Detener audio</button></div><p id="speech-state" aria-live="off"></p><p id="speech-error" role="status" aria-live="polite"></p><details><summary>Si no se oye</summary><p>Revisa el volumen y las voces instaladas del dispositivo. En Safari/iOS pueden no estar disponibles o aparecer más tarde. No descargamos voces ni activamos servicios externos. La selección local depende de lo que declara el navegador; la pronunciación aún requiere escucha y revisión humana.</p><button type="button" class="action secondary" id="speech-refresh">Revisar voces disponibles</button></details>`;
 root.append(panel);let disposed=false;
 const draw=()=>{if(disposed)return;const a=engine.availability(id),s=engine.state;panel.querySelector('#speech-availability').textContent=a.reason+(a.voice?' Variante: '+a.voice.lang+(a.voice.lang.toLowerCase()==='zh-cn'?' · mandarín de China continental.':a.voice.lang.toLowerCase()==='zh-tw'?' · mandarín de Taiwán.':'.'):'');panel.querySelectorAll('[data-speech-word]').forEach(b=>b.disabled=!a.available);panel.querySelector('#speech-repeat').disabled=!a.available||s.last?.id!==id;panel.querySelector('#speech-stop').disabled=!['starting','speaking'].includes(s.phase);panel.querySelector('#speech-state').textContent=s.message;const error=['error','unavailable'].includes(s.phase)?s.message:'';if(panel.querySelector('#speech-error').textContent!==error)panel.querySelector('#speech-error').textContent=error;};
 const speak=index=>{if(doc.hidden||!panel.isConnected)return;engine.play(id,index);};
 panel.querySelectorAll('[data-speech-word]').forEach(b=>b.addEventListener('click',()=>speak(Number(b.dataset.speechWord))));
 panel.querySelector('#speech-repeat').onclick=()=>{if(engine.state.last?.id===id)speak(engine.state.last.index);};panel.querySelector('#speech-stop').onclick=()=>engine.stop();
 const refresh=()=>{engine.refresh();draw();};panel.querySelector('#speech-refresh').onclick=refresh;
 const unsubscribe=engine.subscribe(draw),synth=engine.synthesis;
 synth?.addEventListener?.('voiceschanged',refresh);
 // One bounded retry also handles implementations that never emit voiceschanged.
 const timeout=win.setTimeout(draw,2000);
 sessions.get(doc).dispose=()=>{disposed=true;unsubscribe();win.clearTimeout(timeout);synth?.removeEventListener?.('voiceschanged',refresh);};
}
