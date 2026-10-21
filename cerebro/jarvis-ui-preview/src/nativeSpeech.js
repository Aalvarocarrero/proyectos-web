// One bounded playback at a time. Cancel always clears queued browser speech too.
export function createNativeSpeech({projectId,onState,fetcher=fetch,AudioClass=Audio,urlAPI=URL,synthesis=globalThis.speechSynthesis,timers=globalThis}){
 let generation=0,active=null
 function stop(){generation++;if(active){active.controller.abort();timers.clearTimeout(active.timer);if(active.audio){active.audio.onended=null;active.audio.onerror=null;active.audio.pause();active.audio.removeAttribute('src');active.audio.load()}if(active.url)urlAPI.revokeObjectURL(active.url);active=null}try{synthesis?.cancel()}catch{}}
 async function speak(text){
  stop();const id=generation,s={controller:new AbortController()};active=s
  try{
   if(typeof text!=='string'||!text.trim()||text.length>1200)throw Error('La respuesta excede el límite de lectura; usa el texto.')
   onState?.({state:'preparing'})
   const token=(await(await fetcher('/api/session',{signal:s.controller.signal})).json()).token
   const r=await fetcher('/api/local-chat/speak',{method:'POST',signal:s.controller.signal,headers:{'Content-Type':'application/json','X-Cerebro-Token':token},body:JSON.stringify({projectId,text})})
   if(!r.ok)throw Error((await r.json()).error||'Falló la voz local')
   const blob=await r.blob();if(id!==generation)return false
   s.url=urlAPI.createObjectURL(blob);s.audio=new AudioClass(s.url)
   const finish=()=>{if(id!==generation)return;stop();onState?.({state:'ended'})}
   s.audio.onended=finish
   s.audio.onerror=()=>{if(id===generation){stop();onState?.({state:'error',message:'Falló la reproducción local.'})}}
   s.timer=timers.setTimeout(()=>{if(id===generation){stop();onState?.({state:'error',message:'Lectura detenida por límite de duración.'})}},45000)
   await s.audio.play();if(id!==generation){s.audio.pause();return false}
   onState?.({state:'speaking'});return true
  }catch(e){if(id===generation){stop();if(e.name!=='AbortError')onState?.({state:'error',message:e.message})}return false}
 }
 return {speak,stop,dispose:stop}
}
