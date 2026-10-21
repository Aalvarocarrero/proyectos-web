import CodexPreview from './CodexPreview.jsx'
import {installedVoices,selectedVoice,chooseVoice} from './voicePreference.js'
import React, {useEffect, useRef, useState} from 'react'

import ConversationSession from './ConversationSession.jsx'
import VoiceInput from './VoiceInput.jsx'
import {createNativeSpeech} from './nativeSpeech.js'

async function api(path, body) {
  const options = body ? {method: 'POST', headers: {'Content-Type': 'application/json', 'X-Cerebro-Token': (await (await fetch('/api/session')).json()).token}, body: JSON.stringify(body)} : undefined
  const response = await fetch(path, options)
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'No se confirmó la operación.')
  return result
}

export default function LocalChat({project,onRuntime}) {
  const [voice,setVoice]=useState(selectedVoice)
  const [sessionActive,setSessionActive]=useState(false)
  const [data, setData] = useState(null)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [useMemory,setUseMemory] = useState(false)
  const [source,setSource] = useState('typed_text')
  const [speechNotice,setSpeechNotice] = useState('')
  const speech=useRef(null)
  useEffect(()=>{if(!sessionActive)onRuntime?.({phase:busy?'thinking':'idle',level:0})},[busy,sessionActive,onRuntime])
  useEffect(()=>{if(!busy&&!sessionActive)return;let active=true;const tick=setInterval(()=>api(`/api/local-chat/${encodeURIComponent(project.id)}`).then(r=>{if(active)setData(r)}).catch(()=>{}),600);return()=>{active=false;clearInterval(tick)}},[busy,sessionActive,project.id])
  useEffect(()=>{const output=createNativeSpeech({projectId:project.id,onState:s=>{setSpeechNotice(s.message||({preparing:'Preparando voz en este Mac…',speaking:'Leyendo con la voz seleccionada.',ended:'Lectura finalizada.'}[s.state]||''));onRuntime?.({phase:s.state==='speaking'?'speaking':'idle',level:0})}});speech.current=output;const stop=()=>output.stop();window.addEventListener('cerebro-stop-audio',stop);const hidden=()=>{if(document.hidden)stop()};document.addEventListener('visibilitychange',hidden);return()=>{output.dispose();window.removeEventListener('cerebro-stop-audio',stop);document.removeEventListener('visibilitychange',hidden)}},[project.id])
  function readReply(text){window.dispatchEvent(new Event('cerebro-stop-audio'));speech.current?.speak(text.split('</think>').at(-1).trim())}
  const key = `cerebro.localChat.pending:${project.id}`
  async function refresh() {setData(await api(`/api/local-chat/${encodeURIComponent(project.id)}`))}
  useEffect(() => {let active=true; api(`/api/local-chat/${encodeURIComponent(project.id)}`).then(r=>{if(active)setData(r)}).catch(e=>{if(active)setError(e.message)}); return ()=>{active=false}}, [project.id])
  async function permission() {
    setBusy(true);setError('')
    try {setData(await api('/api/local-chat/permission', {projectId:project.id, enabled:!data.enabled}))}
    catch(e){setError(e.message)} finally{setBusy(false)}
  }
  async function voicePermission(){setBusy(true);setError('');try{setData(await api('/api/local-chat/voice-permission',{projectId:project.id,enabled:!data.voiceInputAllowed}))}catch(e){setError(e.message)}finally{setBusy(false)}}
  async function send(event) {
    event.preventDefault();setError('');setBusy(true)
    try {
      if (localStorage.getItem(key)) throw new Error('Hay un intento sin confirmar: pulsa Comprobar estado antes de enviar otro.')
      const body={projectId:project.id,id:crypto.randomUUID(),text:text.trim(),useMemory,source,transcriptConfirmed:source==='confirmed_transcript'}
      localStorage.setItem(key,JSON.stringify(body))
      const result=await api('/api/local-chat/send',body)
      localStorage.removeItem(key)
      if(result.state==='completed'){setText('');setSource('typed_text')}
      else setError(result.error || 'Intento pendiente: no se reenvía automáticamente.')
      await refresh()
    }catch(e){setError(e.message)}finally{setBusy(false)}
  }
  async function check() {
    setBusy(true);setError('')
    try {
      const result=await api(`/api/local-chat/${encodeURIComponent(project.id)}`);setData(result)
      const pending=JSON.parse(localStorage.getItem(key)||'null')
      if(pending){
        const saved=result.turns.find(t=>t.id===pending.id)
        if(saved && saved.state!=='pending'){localStorage.removeItem(key);setError('Resultado recuperado sin reenviar.')}
        else if(!saved){setError('El servidor no contiene ese intento. Puedes reenviar explícitamente su misma identidad; el borrador se conserva.')}
        else setError('Intento registrado aún pendiente o interrumpido. No se reenvía; requiere revisión del diario.')
      }
    }catch(e){setError(e.message)}finally{setBusy(false)}
  }
  async function retrySame() {
    setBusy(true);setError('')
    try {
      const pending=JSON.parse(localStorage.getItem(key)||'null')
      if(!pending){setError('No hay intento pendiente en este navegador.');return}
      if(pending.projectId!==project.id)throw new Error('El intento pertenece a otro proyecto.')
      const current=await api(`/api/local-chat/${encodeURIComponent(project.id)}`)
      const saved=current.turns.find(t=>t.id===pending.id)
      if(saved){setData(current);setError('El intento ya está registrado; no se reenvió.');if(saved.state!=='pending')localStorage.removeItem(key);return}
      const result=await api('/api/local-chat/send',pending)
      if(result.state!=='pending')localStorage.removeItem(key)
      await refresh()
    }catch(e){setError(e.message)}finally{setBusy(false)}
  }
  return <section className="conversation-panel" aria-label="Asistente local de texto">
    <div className="panel-heading"><div><p className="eyebrow">JARVIS · IA EN ESTE MAC</p><h2>Conversar con Qwen3</h2></div><span className="quiet-indicator">{data?.enabled?'AUTORIZADO EN ESTE PROYECTO':'DESACTIVADO EN ESTE PROYECTO'}</span></div>
    <p>Qwen3 4B responde a cada texto que envías. Sin servicios de pago ni ejecución de herramientas. La voz se inicia con Conversar o Hablar y requiere permiso del proyecto. No recibe automáticamente la memoria ni las notas del proyecto.</p>
    <details><summary>Persistencia y límites</summary><p>Los turnos y permisos se conservan en un diario local del asistente, separado de las notas y vinculado al ID de este proyecto. {data?.realConnectionVerified?'Hay respuestas reales verificadas en este proyecto.':'Aún no hay una respuesta real verificada en este proyecto.'}</p></details>
    {data && <button type="button" disabled={busy||sessionActive} onClick={permission}>{data.enabled?'Desactivar IA en este proyecto':'Autorizar IA local en este proyecto'}</button>}
    <CodexPreview key={project.id} project={project} voiceAvailable={Boolean(data?.voiceAvailable)} voiceAllowed={Boolean(data?.voiceInputAllowed)} localSessionActive={sessionActive} onRead={readReply}/>
    <ol className="message-list" aria-label={`Conversación IA de ${project.title}`}>
      {data?.turns.map(turn=><li key={turn.id}>
        <article className="stored-message" data-project-id={project.id}><span className="message-meta">Tú · {new Date(turn.at).toLocaleString()}</span><p>{turn.user.text}</p></article>
        {turn.reply && <article className="stored-message" data-project-id={project.id}><span className="message-meta">Jarvis · {turn.reply.model} · respuesta local</span><p>{turn.reply.text.split('</think>').at(-1).trim()}</p><button type="button" onClick={()=>readReply(turn.reply.text)}>Leer esta respuesta</button></article>}
        {turn.memorySent && <p>Contexto local utilizado: {turn.contextIds?.length || 0} referencias del proyecto seleccionado.</p>}
        {turn.state!=='completed' && <p role="status">{turn.error || 'Intento registrado; respuesta pendiente o interrumpida.'}</p>}
      </li>)}
    </ol>
    <label>Voz española de este Mac <select value={voice} disabled={busy||sessionActive} onChange={e=>{window.dispatchEvent(new Event('cerebro-stop-audio'));try{chooseVoice(e.target.value);setVoice(e.target.value);setSpeechNotice('Voz seleccionada. Se usará en la próxima lectura; no se reproduce una muestra.')}catch{setError('No se pudo guardar la selección de voz.')}}}>{installedVoices.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
    <p>Velocidad y tono normales. Paulina conserva la opción femenina anterior.</p>
    {data?.voiceAvailable && <button type="button" disabled={busy||sessionActive} onClick={voicePermission}>{data.voiceInputAllowed?'Desautorizar voz en este proyecto':'Autorizar voz local en este proyecto'}</button>}
    <ConversationSession projectId={project.id} enabled={Boolean(data?.enabled&&data?.voiceInputAllowed&&data?.voiceAvailable&&data?.nativeVoice&&!busy)} useMemory={useMemory} onRuntime={onRuntime} onUpdate={refresh} onActive={value=>{if(value)speech.current?.stop();setSessionActive(value)}}/>
    <details><summary>Captura puntual con revisión</summary><VoiceInput projectId={project.id} available={Boolean(data?.voiceAvailable)} enabled={Boolean(data?.voiceInputAllowed)} disabled={busy||sessionActive} onDraft={draft=>{setText(draft);setSource('confirmed_transcript')}} /></details>
    {data?.live?.text && <p className="runtime-caption" aria-live="polite">Jarvis · respuesta en curso: {data.live.text}</p>}
    <form className="message-form" onSubmit={send}>
      <label htmlFor="local-model-message">{source==='confirmed_transcript'?'Revisa la transcripción; Preguntar confirma este texto':'Pregunta para el modelo local'}</label>
      <label><input type="checkbox" checked={useMemory} disabled={busy||sessionActive} onChange={e=>setUseMemory(e.target.checked)} />Consultar memoria de este proyecto, solo en el Mac</label>
      <textarea id="local-model-message" rows="3" maxLength="6000" required value={text} onChange={e=>setText(e.target.value)} disabled={busy||sessionActive} placeholder="Escribe tu pregunta en español…" />
      <button type="submit" className="primary" disabled={busy || sessionActive || !data?.enabled || !text.trim()}>{busy?'Procesando solicitud local…':'Preguntar a Jarvis'}</button>
    </form>
    <button type="button" onClick={check} disabled={busy||sessionActive}>Comprobar estado sin reenviar</button>
    <button type="button" onClick={retrySame} disabled={busy||sessionActive}>Recuperar el mismo intento pendiente</button>
    {speechNotice && <p role="status">{speechNotice}</p>}
    <button type="button" onClick={()=>window.dispatchEvent(new Event('cerebro-stop-audio'))}>Detener toda voz y sesión</button>
    {error && <p role="status">{error}</p>}
  </section>
}
