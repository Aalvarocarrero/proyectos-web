import React,{useEffect,useRef,useState} from 'react'
import {Segmenter,isUsableTranscript,RepeatGuard} from './sessionVad.js'
import {encodeWav} from './audioWav.js'
import {createNativeSpeech} from './nativeSpeech.js'
export default function ConversationSession({projectId,enabled,useMemory,onRuntime,onUpdate,onActive}){
 const current=useRef(null),serial=useRef(0),callbacks=useRef({onRuntime,onUpdate,onActive})
 callbacks.current={onRuntime,onUpdate,onActive}
 const [active,setActive]=useState(false),[status,setStatus]=useState('Sesión detenida. Micrófono apagado.')
 function report(phase,message,level=0){setStatus(message);callbacks.current.onRuntime?.({phase,level,micActive:Boolean(current.current?.stream?.active)})}
 async function json(path,body,s){const r=await fetch(path,{method:'POST',keepalive:path.endsWith('session-stop')||path.endsWith('/cancel'),headers:{'Content-Type':'application/json','X-Cerebro-Token':s.token},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw Error(data.error||'No se confirmó la operación.');return data}
 function release(s){if(!s)return;clearTimeout(s.timer);s.stream?.getTracks().forEach(t=>t.stop());if(s.node){s.node.port.onmessage=null;s.node.disconnect()}s.source?.disconnect();s.gain?.disconnect();s.ctx?.close().catch(()=>{});s.vad?.reset()}
 function interrupt(s){s.turn++;s.request?.abort();s.request=null;if(s.turnId){void json('/api/local-chat/cancel',{projectId,id:s.turnId},s).catch(()=>{});s.turnId=null}s.output?.stop();try{window.speechSynthesis.cancel()}catch{};s.speaking=false;s.lastAudioAt=performance.now()}
 function stop(message='Sesión detenida. Micrófono liberado.'){
  serial.current++;const s=current.current;current.current=null;try{window.speechSynthesis.cancel()}catch{}
  if(s){interrupt(s);release(s);if(s.sid)void json('/api/local-chat/session-stop',{projectId,sessionId:s.sid},s).catch(()=>{})}
  setActive(false);callbacks.current.onActive?.(false);report('idle',message)
 }
 useEffect(()=>{const hidden=()=>{if(document.hidden)stop('Sesión detenida al ocultar Jarvis.')};const leave=()=>stop();document.addEventListener('visibilitychange',hidden);window.addEventListener('pagehide',leave);window.addEventListener('cerebro-stop-audio',leave);return()=>{document.removeEventListener('visibilitychange',hidden);window.removeEventListener('pagehide',leave);window.removeEventListener('cerebro-stop-audio',leave);stop()}},[projectId])
 useEffect(()=>{if(!enabled&&current.current)stop('Permiso revocado; micrófono liberado.')},[enabled])
 async function segment(s,chunks){
  if(current.current!==s)return
  const turn=++s.turn,controller=new AbortController();s.request=controller
  const valid=()=>current.current===s&&turn===s.turn
  try{
   report('transcribing','Transcribiendo en este Mac…')
   const response=await fetch(`/api/local-chat/${encodeURIComponent(projectId)}/transcribe`,{method:'POST',signal:controller.signal,headers:{'Content-Type':'audio/wav','X-Cerebro-Token':s.token,'X-Cerebro-Audio-Consent':'session','X-Cerebro-Voice-Session':s.sid},body:encodeWav(chunks,s.ctx.sampleRate)})
   const result=await response.json();if(!response.ok)throw Error(result.error||'Falló Whisper.')
   if(!valid())return
   if(!isUsableTranscript(result.transcript,(s.speaking||performance.now()-(s.lastAudioAt||0)<8000)?s.lastSpoken:'')){report(s.speaking?'speaking':'listening','Audio de retorno o ruido descartado.');return}
   if(!s.repeat.accept(result.transcript,performance.now())){stop('Repetición detectada. Sesión detenida para evitar un bucle.');return}
   s.output?.stop();s.speaking=false
   report('thinking',`Tú: ${result.transcript}`)
   s.turnId=crypto.randomUUID()
   const r=await fetch('/api/local-chat/send',{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json','X-Cerebro-Token':s.token},body:JSON.stringify({projectId,id:s.turnId,text:result.transcript,useMemory,source:'session_transcript',sessionId:s.sid})})
   const answer=await r.json();if(!r.ok)throw Error(answer.error||'Falló el modelo local.')
   if(!valid())return
   s.turnId=null;callbacks.current.onUpdate?.()
   if(answer.state!=='completed')throw Error(answer.error||'Respuesta incompleta.')
   s.lastSpoken=answer.reply.text;s.lastAudioAt=performance.now();s.speaking=true
   await s.output.speak(answer.reply.text)

  }catch(e){if(valid()&&e.name!=='AbortError'){stop('Sesión detenida: '+e.message);callbacks.current.onUpdate?.()}}
 }
 async function start(){
  if(!enabled||current.current)return
  const epoch=++serial.current,s={turn:0,speaking:false,lastSpoken:'',token:'',sid:null,repeat:new RepeatGuard()};current.current=s
  setActive(true);callbacks.current.onActive?.(true);report('requesting','Solicitando micrófono para esta sesión…')
  try{
   s.output=createNativeSpeech({projectId,onState:event=>{if(current.current!==s)return;if(event.state==='speaking'){s.speaking=true;s.lastAudioAt=performance.now();report('speaking','Jarvis responde con Reed. Puedes interrumpir con otra frase.')}else if(event.state==='ended'){s.speaking=false;s.lastAudioAt=performance.now();report('listening','Escuchando. Habla cuando quieras.')}else if(event.state==='error'){stop('Sesión detenida: '+event.message)}}})
   s.token=(await(await fetch('/api/session')).json()).token
   if(serial.current!==epoch)return
   const session=await json('/api/local-chat/session-start',{projectId},s);s.sid=session.sessionId
   if(serial.current!==epoch){void json('/api/local-chat/session-stop',{projectId,sessionId:s.sid},s);return}
   s.stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true},video:false})
   if(serial.current!==epoch){release(s);return}
   s.ctx=new AudioContext();await s.ctx.audioWorklet.addModule(new URL('./sessionProcessor.js?no-inline',import.meta.url))
   if(serial.current!==epoch){release(s);return}
   s.vad=new Segmenter(s.ctx.sampleRate,{onStart:()=>{if(!s.speaking)interrupt(s);report('recording','Comprobando intervención…')},onEnd:chunks=>void segment(s,chunks),onLevel:level=>{const now=performance.now();if(current.current===s&&now-(s.lastMeter||0)>70){s.lastMeter=now;callbacks.current.onRuntime?.(previous=>({...previous,level}))}}})
   s.node=new AudioWorkletNode(s.ctx,'cerebro-session-capture');s.node.port.onmessage=e=>{if(current.current===s)s.vad.push(e.data,s.speaking)}
   s.source=s.ctx.createMediaStreamSource(s.stream);s.gain=s.ctx.createGain();s.gain.gain.value=0;s.source.connect(s.node);s.node.connect(s.gain);s.gain.connect(s.ctx.destination);await s.ctx.resume()
   if(serial.current!==epoch){release(s);return}
   s.stream.getTracks().forEach(track=>track.onended=()=>{if(current.current===s)stop('El dispositivo dejó de transmitir audio.')})
   s.timer=setTimeout(()=>stop('Sesión finalizada tras una hora.'),session.maxSeconds*1000)
   report('listening','Escuchando. El final de cada frase se detecta automáticamente.')
  }catch(e){if(current.current===s)stop(e.name==='NotAllowedError'?'Micrófono no autorizado; sigue disponible el texto.':'No se pudo iniciar: '+e.message);else release(s)}
 }
 return <section className="speech-panel" aria-label="Sesión conversacional local"><h3>Conversación por voz</h3><p>Al pulsar Conversar autorizas transcribir cada frase y enviarla automáticamente al modelo local de este proyecto. Responderá con Reed, voz local del Mac. La interrupción se confirma tras transcribir para no cortar la voz por su propio eco. No ejecuta acciones. Se detiene al ocultar Jarvis o cambiar de proyecto.</p><div className="session-controls"><button onClick={start} disabled={!enabled||active}>Conversar</button><button className="stop-session" onClick={()=>stop()} disabled={!active}>Detener sesión</button></div><p className="session-status" role="status">{active&&<i/>}{status}</p></section>
}
