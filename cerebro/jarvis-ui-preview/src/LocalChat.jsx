import React, {useEffect, useRef, useState} from 'react'

import VoiceInput from './VoiceInput.jsx'
import {createLocalSpeechOutput,getSpanishLocalVoices} from './localSpeech.js'

async function api(path, body) {
  const options = body ? {method: 'POST', headers: {'Content-Type': 'application/json', 'X-Cerebro-Token': (await (await fetch('/api/session')).json()).token}, body: JSON.stringify(body)} : undefined
  const response = await fetch(path, options)
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'No se confirmó la operación.')
  return result
}

export default function LocalChat({project}) {
  const [data, setData] = useState(null)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [useMemory,setUseMemory] = useState(false)
  const [source,setSource] = useState('typed_text')
  const [speechNotice,setSpeechNotice] = useState('')
  const speech=useRef(null)
  useEffect(()=>{const output=createLocalSpeechOutput({synthesis:window.speechSynthesis,Utterance:window.SpeechSynthesisUtterance,onState:s=>setSpeechNotice(s.message)});speech.current=output;return ()=>output.dispose()},[project.id])
  function readReply(text){const voice=getSpanishLocalVoices(window.speechSynthesis)[0];speech.current?.speak(text.split('</think>').at(-1).trim(),voice)}
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
    <p>Qwen3 4B responde a cada texto que envías. Sin servicios de pago ni ejecución de herramientas. El micrófono solo se activa al pulsar Hablar y conceder permiso. No recibe automáticamente la memoria ni las notas del proyecto.</p>
    <p>Los turnos y permisos se conservan en un diario local del asistente, separado de las notas y vinculado al ID de este proyecto. {data?.realConnectionVerified?'Hay respuestas reales verificadas en este proyecto.':'Aún no hay una respuesta real verificada en este proyecto.'}</p>
    {data && <button type="button" disabled={busy} onClick={permission}>{data.enabled?'Desactivar IA en este proyecto':'Autorizar IA local en este proyecto'}</button>}
    <ol className="message-list" aria-label={`Conversación IA de ${project.title}`}>
      {data?.turns.map(turn=><li key={turn.id}>
        <article className="stored-message" data-project-id={project.id}><span className="message-meta">Tú · {new Date(turn.at).toLocaleString()}</span><p>{turn.user.text}</p></article>
        {turn.reply && <article className="stored-message" data-project-id={project.id}><span className="message-meta">Jarvis · {turn.reply.model} · respuesta local</span><p>{turn.reply.text.split('</think>').at(-1).trim()}</p><button type="button" onClick={()=>readReply(turn.reply.text)}>Leer esta respuesta</button></article>}
        {turn.memorySent && <p>Contexto local utilizado: {turn.contextIds?.length || 0} referencias del proyecto seleccionado.</p>}
        {turn.state!=='completed' && <p role="status">{turn.error || 'Intento registrado; respuesta pendiente o interrumpida.'}</p>}
      </li>)}
    </ol>
    {data?.voiceAvailable && <button type="button" disabled={busy} onClick={voicePermission}>{data.voiceInputAllowed?'Desautorizar voz en este proyecto':'Autorizar voz local en este proyecto'}</button>}
    <VoiceInput projectId={project.id} available={Boolean(data?.voiceAvailable)} enabled={Boolean(data?.voiceInputAllowed)} disabled={busy} onDraft={draft=>{setText(draft);setSource('confirmed_transcript')}} />
    <form className="message-form" onSubmit={send}>
      <label htmlFor="local-model-message">{source==='confirmed_transcript'?'Revisa la transcripción; Preguntar confirma este texto':'Pregunta para el modelo local'}</label>
      <label><input type="checkbox" checked={useMemory} disabled={busy} onChange={e=>setUseMemory(e.target.checked)} />Consultar memoria de este proyecto, solo en el Mac</label>
      <textarea id="local-model-message" rows="3" maxLength="6000" required value={text} onChange={e=>setText(e.target.value)} disabled={busy} placeholder="Escribe tu pregunta en español…" />
      <button type="submit" className="primary" disabled={busy || !data?.enabled || !text.trim()}>{busy?'Procesando solicitud local…':'Preguntar a Jarvis'}</button>
    </form>
    <button type="button" onClick={check} disabled={busy}>Comprobar estado sin reenviar</button>
    <button type="button" onClick={retrySame} disabled={busy}>Recuperar el mismo intento pendiente</button>
    {speechNotice && <p role="status">{speechNotice}</p>}
    <button type="button" onClick={()=>speech.current?.stop()}>Detener voz de salida</button>
    {error && <p role="status">{error}</p>}
  </section>
}
