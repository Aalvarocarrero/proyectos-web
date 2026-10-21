import React,{useEffect,useRef,useState} from 'react'
import {encodeWav} from './audioWav.js'

export default function VoiceInput({projectId,enabled,available,onDraft,disabled}) {
  const [stage,setStage]=useState('idle'),[notice,setNotice]=useState('Micrófono apagado. Pulsa Hablar para una captura puntual de hasta 30 segundos.')
  const current=useRef(null),generation=useRef(0),request=useRef(null)
  function release(session){
    if(!session)return
    clearTimeout(session.timer);session.stream?.getTracks().forEach(track=>track.stop())
    if(session.node){session.node.port.onmessage=null;session.node.disconnect()}
    session.source?.disconnect();session.gain?.disconnect()
    if(session.context?.state!=='closed')session.context?.close().catch(()=>{})
  }
  function cancel(){generation.current++;release(current.current);current.current=null;request.current?.abort();request.current=null}
  useEffect(()=>{
    setStage('idle');setNotice('Micrófono apagado. Pulsa Hablar para una captura puntual de hasta 30 segundos.');const leave=()=>cancel();window.addEventListener('pagehide',leave)
    return ()=>{window.removeEventListener('pagehide',leave);cancel()}
  },[projectId,enabled])
  useEffect(()=>{if(!enabled){setStage('idle');setNotice('Micrófono apagado; autoriza voz para este proyecto.')}},[enabled])
  async function finish(transcribe=true){
    const session=current.current;current.current=null
    const id=++generation.current
    release(session)
    if(!transcribe || !session){setStage('idle');setNotice('Captura cancelada; micrófono liberado.');return}
    setStage('transcribing');setNotice('Micrófono liberado. Transcribiendo en este Mac…')
    try{
      const wav=encodeWav(session.chunks,session.context.sampleRate);session.chunks=[]
      const controller=new AbortController();request.current=controller
      const token=(await (await fetch('/api/session',{signal:controller.signal})).json()).token
      const response=await fetch(`/api/local-chat/${encodeURIComponent(projectId)}/transcribe`,{method:'POST',signal:controller.signal,headers:{'Content-Type':'audio/wav','X-Cerebro-Token':token,'X-Cerebro-Audio-Consent':'one-shot'},body:wav})
      const result=await response.json();if(!response.ok)throw new Error(result.error||'Falló la transcripción local.')
      if(id!==generation.current)return
      if(result.projectId!==projectId)throw new Error('La transcripción pertenece a otro proyecto.')
      onDraft(result.transcript);setNotice('Transcripción local lista. Revisa el texto y pulsa Preguntar a Jarvis para confirmarlo. Audio descartado.')
    }catch(e){if(id===generation.current)setNotice(e.name==='AbortError'?'Transcripción cancelada.':e.message)}
    finally{if(id===generation.current){request.current=null;setStage('idle')}}
  }
  async function begin(){
    if(!enabled||!available||disabled||stage!=='idle')return
    const id=++generation.current;setStage('requesting');setNotice('Solicitando permiso puntual al micrófono…')
    const session={chunks:[]};current.current=session
    try{
      session.stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true},video:false})
      if(id!==generation.current){release(session);return}
      session.context=new AudioContext()
      await session.context.audioWorklet.addModule(new URL('./captureProcessor.js?no-inline',import.meta.url))
      if(id!==generation.current){release(session);return}
      session.node=new AudioWorkletNode(session.context,'cerebro-local-capture')
      session.source=session.context.createMediaStreamSource(session.stream);session.gain=session.context.createGain();session.gain.gain.value=0
      session.node.port.onmessage=event=>{if(id===generation.current){if(event.data.ended)finish(true);else session.chunks.push(event.data)}}
      session.source.connect(session.node);session.node.connect(session.gain);session.gain.connect(session.context.destination)
      await session.context.resume()
      if(id!==generation.current){release(session);return}
      session.timer=setTimeout(()=>finish(true),30000)
      setStage('recording');setNotice('Grabando solo este turno. Pulsa Terminar y transcribir; límite de 30 segundos.')
    }catch(e){release(session);if(id===generation.current){current.current=null;setStage('idle');setNotice(e.name==='NotAllowedError'?'Permiso de micrófono no concedido. Puedes seguir por texto.':'No se pudo iniciar el micrófono: '+e.message)}}
  }
  return <section className="speech-panel" aria-label="Entrada de voz local">
    <h3>Hablar con Jarvis</h3>
    <p className="speech-note">Whisper base transcribe en el Mac. No se envía audio a servicios externos. La captura termina al detenerla, cambiar de proyecto o salir. Revisa siempre la transcripción.</p>
    <div className="speech-actions">
      <button type="button" onClick={begin} disabled={!enabled||!available||disabled||stage!=='idle'}>Hablar</button>
      <button type="button" onClick={()=>finish(true)} disabled={stage!=='recording'}>Terminar y transcribir</button>
      <button type="button" onClick={()=>{cancel();setStage('idle');setNotice('Cancelado; micrófono liberado.')}} disabled={stage==='idle'}>Cancelar captura</button>
    </div>
    <p role="status">{available?notice:'El transcriptor local no está configurado en este servidor.'}</p>
  </section>
}
