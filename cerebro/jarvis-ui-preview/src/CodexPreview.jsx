import VoiceInput from './VoiceInput.jsx'
import React,{useRef,useState,useEffect} from 'react'

export default function CodexPreview({project,voiceAvailable,voiceAllowed,localSessionActive,onRead}){
 const [voiceMode,setVoiceMode]=useState(false)
 const [text,setText]=useState(''),[memory,setMemory]=useState(false),[ids,setIds]=useState([]),[preview,setPreview]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false)
 const [reply,setReply]=useState(null),[sending,setSending]=useState(false),[reviewed,setReviewed]=useState(false),[resetConfirm,setResetConfirm]=useState(false)
 const request=useRef(null),generation=useRef(0)
 function cancel(){generation.current++;request.current?.abort();request.current=null;setBusy(false);setPreview(null)}
 useEffect(()=>()=>{generation.current++;request.current?.abort()},[project.id])
 function invalidate(){cancel();setReviewed(false);setError('')}
 async function prepare(event){
  event.preventDefault();cancel();const seq=generation.current,controller=new AbortController();request.current=controller;setBusy(true);setError('')
  try{
   const session=await fetch('/api/session',{signal:controller.signal}).then(r=>r.json())
   const r=await fetch('/api/codex/preview',{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json','X-Cerebro-Token':session.token},body:JSON.stringify({projectId:project.id,text,includeMemory:memory,recordIds:ids})})
   const result=await r.json();if(!r.ok)throw new Error(result.error)
   if(seq===generation.current)setPreview(result)
  }catch(e){if(e.name!=='AbortError'&&seq===generation.current)setError(e.message)}finally{if(seq===generation.current)setBusy(false)}
 }
 async function post(path,body){
  const session=await fetch('/api/session').then(r=>r.json())
  const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json','X-Cerebro-Token':session.token},body:JSON.stringify(body)});const value=await r.json();if(!r.ok)throw new Error(value.error);return value
 }
 const pendingKey=`cerebro.codex.pending:${project.id}`
 async function send(){
  if(localStorage.getItem(pendingKey)){setError('Existe un intento pendiente. Comprueba su estado; no se reenvía.');return}
  const id=crypto.randomUUID();localStorage.setItem(pendingKey,id);setSending(true);setError('')
  try{const result=await post('/api/codex/send',{preview:{projectId:project.id,text,includeMemory:memory,recordIds:ids},digest:preview.digest,id,reviewed});setReply(result);setPreview(null);setReviewed(false);await check();if(['completed','failed','interrupted'].includes(result.state))localStorage.removeItem(pendingKey)}catch(e){setError(e.message+' Comprueba el estado antes de intentar otra vez.')}finally{setSending(false)}
 }
 async function check(){try{const result=await fetch(`/api/codex/result/${encodeURIComponent(project.id)}`).then(r=>r.json());setReply(result);if(result.id===localStorage.getItem(pendingKey)&&['completed','failed','interrupted'].includes(result.state))localStorage.removeItem(pendingKey)}catch(e){setError(e.message)}}
 async function stop(){window.dispatchEvent(new Event('cerebro-stop-audio'));try{await post('/api/codex/cancel',{projectId:project.id});setError('Detención solicitada. Comprueba el estado; no se reenvía.')}catch(e){setError(e.message)}}
 useEffect(()=>{check()},[project.id])
 async function reset(){try{await post('/api/codex/reset',{projectId:project.id});invalidate();setResetConfirm(false);await check()}catch(e){setError(e.message)}}
 useEffect(()=>{if(!sending)return;const timer=setInterval(check,700);return()=>clearInterval(timer)},[sending,project.id])
 useEffect(()=>{const stopHidden=()=>{if(document.hidden)post('/api/codex/cancel',{projectId:project.id}).catch(()=>{})};document.addEventListener('visibilitychange',stopHidden);return()=>{document.removeEventListener('visibilitychange',stopHidden);post('/api/codex/cancel',{projectId:project.id}).catch(()=>{})}},[project.id])
 return <details><summary>Codex · texto con OpenAI</summary>
 <p>Destino previsto: OpenAI. Solo se envía al pulsar Enviar, tras revisar la vista previa. Ollama sigue disponible para conversar en el Mac. Audio y ejecución de herramientas excluidos.</p>
 <label><input type="checkbox" checked={voiceMode} disabled={sending||localSessionActive} onChange={e=>setVoiceMode(e.target.checked)}/>Usar voz local para preparar texto de Codex</label>
 {voiceMode&&<><p>Whisper transcribe solo en el Mac. Revisa el texto: al enviarlo, ese texto y los fragmentos elegidos saldrán a OpenAI. El audio no sale. Sin envío automático ni escucha continua.</p><VoiceInput projectId={project.id} enabled={voiceAllowed} available={voiceAvailable} disabled={sending||localSessionActive} onDraft={draft=>{invalidate();setText(draft)}}/><p>Si Hablar está desactivado, autoriza voz local en este proyecto usando el control del asistente local.</p></>}
 <form onSubmit={prepare}><fieldset disabled={sending}>
 <label>Texto escrito para Codex<textarea rows="3" maxLength="2000" value={text} onChange={e=>{invalidate();setText(e.target.value)}} required/></label>
 <label><input type="checkbox" checked={memory} onChange={e=>{invalidate();setMemory(e.target.checked);setIds([])}}/>Preparar fragmentos de este proyecto (opcional)</label>
 <p>Máximo 2.000 caracteres de pregunta y 3.000 de contexto. No se incluyen transcripciones ni historial completo. Se añaden hasta seis turnos anteriores de Codex de este proyecto, con un máximo de 6.000 caracteres, visibles en la vista previa. Revisa que no haya datos personales sensibles.</p>
 <button disabled={busy||!text.trim()}>Preparar vista previa local</button>
 <button type="button" onClick={cancel}>Cancelar preparación</button>
 </fieldset></form>
 {preview&&<div>
 {preview.candidates.length>0&&<fieldset><legend>Selecciona hasta cinco referencias y vuelve a preparar</legend>{preview.candidates.map(row=><label key={row.id}><input type="checkbox" checked={ids.includes(row.id)} disabled={sending||(!ids.includes(row.id)&&ids.length>=5)} onChange={e=>{setReviewed(false);setIds(old=>e.target.checked?[...old,row.id]:old.filter(id=>id!==row.id));setPreview(old=>({...old,digest:null}))}}/>{row.text}</label>)}</fieldset>}
 <p>{preview.warning} {preview.excludedSensitive} referencias excluidas por posible contenido sensible.</p>
 <p>{preview.hasMore?'Solo se revisaron las 200 referencias más recientes.':''}</p>
 {preview.digest?<><h3>Contenido exacto preparado · {project.title}</h3><pre style={{whiteSpace:'pre-wrap'}}>{preview.payload}</pre><p>{preview.contextChars} caracteres de contexto. Todavía no enviado.</p></>:<p>Selección modificada: vuelve a preparar para actualizar el contenido.</p>}
 </div>}
 <p>La conversación conserva los turnos localmente por proyecto y envía solo el historial reciente mostrado. Al desmarcar memoria se omiten los turnos que utilizaron referencias. No es el historial completo ni una conexión con esta conversación de ChatGPT.</p>
 <label><input type="checkbox" checked={resetConfirm} disabled={sending} onChange={e=>setResetConfirm(e.target.checked)}/>Quiero iniciar una conversación nueva en este proyecto y archivar la actual</label>
 <button type="button" disabled={sending||!resetConfirm} onClick={reset}>Nueva conversación de Codex</button>
 {reply?.conversation?.length>0&&<details><summary>Historial local de esta conversación ({reply.conversation.length} turnos)</summary>{reply.conversation.map(turn=><article key={turn.id}><p>Tú: {turn.user}</p><p>Codex: {turn.text}</p><p>{turn.state}</p></article>)}</details>}
 <label><input type="checkbox" checked={reviewed} disabled={sending} onChange={e=>setReviewed(e.target.checked)}/>Revisé el contenido y no contiene claves ni datos personales sensibles</label>
 <button type="button" disabled={sending||!preview?.enabled||!preview?.digest||!reviewed} onClick={send}>{sending?'Codex está respondiendo…':'Enviar contenido revisado a Codex'}</button>
 <button type="button" onClick={stop}>Detener Codex</button><button type="button" onClick={check}>Comprobar estado sin reenviar</button>
 {reply&&<article aria-live="polite"><p>Codex / OpenAI · {reply.state} {reply.simulation?'· prueba simulada':''}</p><p>{reply.text}</p>{reply.state==='completed'&&reply.text&&<button type="button" onClick={()=>onRead?.(reply.text)}>Leer respuesta de Codex con voz del Mac</button>}{reply.error&&<p>{reply.error}</p>}</article>}
 {error&&<p role="alert">{error}</p>}
 </details>
}
