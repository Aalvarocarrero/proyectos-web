import {languageFor} from './languages.mjs';
export function localVoice(voices,id){
 const language=languageFor(id);if(!language||!Array.isArray(voices))return null;
 return voices.find(voice=>{try{if(voice.localService!==true||typeof voice.lang!=='string')return false;const tag=Intl.getCanonicalLocales(voice.lang)[0];return language.id==='zh'?['zh-CN','zh-TW'].includes(tag):tag.split('-')[0]===language.id;}catch{return false;}})||null;
}
// Only fixed, reviewed vocabulary IDs enter this controller. Never accept arbitrary text.
export function createLocalSpeech({synthesis,Utterance,setTimer=setTimeout,clearTimer=clearTimeout}={}){
 let current=null,serial=0,startTimer=null,endTimer=null,listener=()=>{},last=null,phase='idle',message='';
 const supported=()=>{try{return !!synthesis&&typeof synthesis.getVoices==='function'&&typeof synthesis.speak==='function'&&typeof synthesis.cancel==='function'&&typeof Utterance==='function';}catch{return false;}};
 const voices=()=>{try{return supported()?Array.from(synthesis.getVoices()):[];}catch{return [];}};
 const emit=()=>listener({phase,message,last});
 const clear=()=>{clearTimer(startTimer);clearTimer(endTimer);startTimer=endTimer=null;};
 function stop(notify=true){serial++;clear();const had=!!current;let ok=true;try{const canStop=supported();if(had&&!canStop)ok=false;else if(canStop&&(had||synthesis.speaking||synthesis.pending))synthesis.cancel();}catch{ok=false;}if(ok)current=null;phase=ok?'idle':'error';message=ok?'Audio detenido.':'No se pudo confirmar la detención. Cierra esta página si el audio continúa.';if(notify)emit();return ok;}
 function availability(id){const voice=localVoice(voices(),id);return {voice,available:!!voice,reason:!supported()?'Este navegador no ofrece la síntesis necesaria. La actividad sigue disponible sin audio.':voice?'Voz local identificada por el navegador.':'No hay una voz local identificable para este idioma. Puedes completar la actividad sin audio.'};}
 function play(id,index){
  if(!stop(false)){emit();return false;}
  const language=languageFor(id);if(!language||!Number.isInteger(index)||index<0||index>=language.words.length){phase='error';message='Palabra no disponible para audio.';emit();return false;}
  const {voice,reason}=availability(id);if(!voice){phase='unavailable';message=reason;emit();return false;}
  const token=++serial;const fail=text=>{if(token!==serial)return;const stopped=stop(false);phase='error';message=stopped?text:'No se pudo confirmar la detención. Cierra esta página si el audio continúa.';emit();};
  try{
   // cancel before every explicit request; never queue or use the browser's default voice.
   synthesis.cancel();if(synthesis.paused){phase='error';message='El motor de voz está en pausa. Puedes seguir sin audio.';emit();return false;}
   const utterance=new Utterance(language.words[index]);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=1;utterance.pitch=1;utterance.volume=1;
   if(utterance.voice!==voice||voice.localService!==true){phase='error';message='No se pudo fijar una voz local. Audio desactivado para este intento.';emit();return false;}
   current=utterance;last={id,index};phase='starting';message='Preparando la voz…';
   utterance.onstart=()=>{if(token!==serial)return;clearTimer(startTimer);phase='speaking';message='Reproduciendo la palabra.';emit();};
   utterance.onend=()=>{if(token!==serial)return;serial++;clear();current=null;phase='idle';message='Reproducción terminada. Puedes repetir si quieres.';emit();};
   utterance.onerror=()=>fail('No se pudo reproducir con esa voz local. No se ha buscado otra voz ni un servicio externo.');
   startTimer=setTimer(()=>fail('La voz no comenzó a tiempo. Puedes volver a pulsar Escuchar o continuar sin audio.'),4000);
   endTimer=setTimer(()=>fail('La reproducción no terminó a tiempo y se ha solicitado detenerla.'),12000);
   emit();synthesis.speak(utterance);return true;
  }catch{fail('No se pudo iniciar la voz local. Puedes continuar sin audio.');return false;}
 }
 return {availability,play,stop,reset(){const stopped=stop(false);last=null;if(stopped){phase='idle';message='';}return stopped;},subscribe(fn){listener=fn;emit();return ()=>{listener=()=>{};};},get state(){return {phase,message,last};},refresh(){const active=!!current;stop(false);if(phase!=='error')message=active?'La lista de voces cambió. Audio detenido.':'';emit();},get synthesis(){return synthesis;}};
}
