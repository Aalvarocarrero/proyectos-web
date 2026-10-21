import React, { useEffect, useRef, useState } from 'react'
import LocalChat from './LocalChat.jsx'
import { Scene } from './scene/Scene.tsx'
import { createLocalSpeechOutput, getSelectedProjectText, getSpanishLocalVoices } from './localSpeech.js'

const TYPE_NAMES = {
  project: 'Proyecto', instruction: 'Instrucción original', decision: 'Decisión',
  task: 'Tarea', checkpoint: 'Checkpoint', blocker: 'Bloqueo', source: 'Fuente',
  action: 'Acción registrada', message: 'Mensaje local', transcript: 'Transcripción vinculada',
}
const MEMORY_TYPES = ['all', 'instruction', 'decision', 'task', 'checkpoint', 'blocker', 'source', 'action', 'message', 'transcript']
const projectAttemptKey = projectId => `cerebro.jarvis.messageAttempts.v1:${projectId}`

function readAttempts(projectId) {
  try {
    const stored = localStorage.getItem(projectAttemptKey(projectId))
    const raw = stored === null ? [] : JSON.parse(stored)
    if (!Array.isArray(raw) || raw.some(item => !item || item.projectId !== projectId || typeof item.id !== 'string' || typeof item.text !== 'string')) throw new Error('Formato de intento no válido')
    return raw
  } catch {
    throw new Error('No se pudo leer el registro de recuperación local; se conserva intacto y se bloquea un nuevo envío.')
  }
}

function writeAttempts(projectId, attempts) {
  const key = projectAttemptKey(projectId)
  if (attempts.length) localStorage.setItem(key, JSON.stringify(attempts))
  else localStorage.removeItem(key)
}

async function requestJson(url, options) {
  const response = await fetch(url, options)
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || 'El almacén local no confirmó la operación.')
  return result
}

function memoryUrl(projectId, query = '', type = 'all') {
  const params = new URLSearchParams({ limit: '200', type })
  if (query.trim()) params.set('q', query.trim())
  return `/api/projects/${encodeURIComponent(projectId)}/memory?${params}`
}

function Network({ projects, selectedId, onSelect }) {
  const positions = projects.map((project, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index / Math.max(projects.length, 1))
    return { project, x: 480 + 325 * Math.cos(angle), y: 260 + 175 * Math.sin(angle) }
  })
  return (
    <div className="network-frame">
      <svg className="network-map" viewBox="0 0 960 520" role="group" aria-label="Mapa radial de proyectos guardados; la lista ofrece una alternativa accesible">
        <defs>
          <linearGradient id="link-glow" x1="0" x2="1">
            <stop offset="0" stopColor="#27d8ec" stopOpacity=".20" />
            <stop offset=".5" stopColor="#6be9f2" stopOpacity=".82" />
            <stop offset="1" stopColor="#27d8ec" stopOpacity=".20" />
          </linearGradient>
          <radialGradient id="core-fill">
            <stop offset="0" stopColor="#14354a" />
            <stop offset="1" stopColor="#071018" />
          </radialGradient>
        </defs>
        {positions.map(({ project, x, y }) => (
          <path key={`link-${project.id}`} d={`M 480 260 Q ${(x + 480) / 2 + (y < 260 ? -22 : 22)} ${(y + 260) / 2} ${x} ${y}`} className="network-link" />
        ))}
        <circle cx="480" cy="260" r="80" className="network-core-halo" />
        <circle cx="480" cy="260" r="61" fill="url(#core-fill)" stroke="#70eaf2" strokeOpacity=".7" />
        <text x="480" y="252" textAnchor="middle" className="core-title">JARVIS</text>
        <text x="480" y="277" textAnchor="middle" className="core-caption">MEMORIA LOCAL</text>
        {positions.map(({ project, x, y }, index) => {
          const active = selectedId === project.id
          const open = () => onSelect(project.id)
          return (
            <g key={project.id} className={`network-project ${active ? 'active' : ''}`} role="button" tabIndex="0"
              aria-pressed={active} aria-label={`${project.title}. Estado ${project.status}, prioridad ${project.priority}. Abrir su memoria local.`}
              data-project-id={project.id} onClick={open} onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open() }
                if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key) && positions.length > 1) {
                  event.preventDefault()
                  const next = (index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : positions.length - 1)) % positions.length
                  document.querySelector(`[data-project-id="${CSS.escape(positions[next].project.id)}"]`)?.focus()
                }
              }}>
              <circle cx={x} cy={y} r="49" className="node-disc" />
              <circle cx={x} cy={y} r="38" className="node-core" />
              <text x={x} y={y - 1} textAnchor="middle" className="node-mark">{project.title.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').slice(0, 2).toLocaleUpperCase()}</text>
              <text x={x} y={y + 72} textAnchor="middle" className="node-name">{project.title.length > 18 ? `${project.title.slice(0, 17)}…` : project.title}</text>
              <text x={x} y={y + 92} textAnchor="middle" className="node-status">{project.status} · {project.priority}</text>
            </g>
          )
        })}
      </svg>
      <ul className="project-list" aria-label="Lista de proyectos guardados">
        {projects.map(project => (
          <li key={project.id}>
            <button type="button" className={selectedId === project.id ? 'project-choice active' : 'project-choice'} aria-pressed={selectedId === project.id} onClick={() => onSelect(project.id)}>
              <span className="choice-mark" aria-hidden="true">{project.title.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').slice(0, 2).toLocaleUpperCase()}</span>
              <span className="choice-copy"><strong>{project.title}</strong><small>{project.status} · prioridad {project.priority}</small></span>
              <span className="choice-chevron" aria-hidden="true">›</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MemoryPanel({ project, memory, loading, query, setQuery, type, setType, onSearch }) {
  return (
    <section className="memory-panel" aria-labelledby="memory-title">
      <div className="panel-heading">
        <div><p className="eyebrow">MEMORIA DEL ALMACÉN LOCAL · ID AISLADO</p><h2 id="memory-title">{project.title}</h2></div>
        <span className="demo-tag live-tag">ALMACÉN REAL</span>
      </div>
      <div className="memory-status"><span className={`status-dot ${project.status.replace(' ', '-')}`} />Estado: <strong>{project.status}</strong><span className="priority-label">Prioridad {project.priority}</span></div>
      {project.nextAction && <p className="next-action"><strong>Siguiente acción:</strong> {project.nextAction}</p>}
      <form className="memory-search" onSubmit={onSearch} role="search">
        <label><span>Buscar en la memoria de este proyecto</span><input value={query} onChange={event => setQuery(event.target.value)} maxLength="300" aria-label={`Buscar solo en ${project.title}`} placeholder="Texto, evidencia o estado…" /></label>
        <label className="memory-type-label"><span>Tipo de registro</span><select value={type} onChange={event => setType(event.target.value)} aria-label="Filtrar tipo de memoria">
          {MEMORY_TYPES.map(value => <option key={value} value={value}>{value === 'all' ? 'Todos' : TYPE_NAMES[value]}</option>)}
        </select></label>
        <button type="submit">Buscar</button>
      </form>
      {loading && <p role="status" className="memory-loading">Leyendo memoria local…</p>}
      {!loading && memory && <>
        <div className="memory-records" aria-live="polite">
          {memory.records.length === 0 && <p className="memory-empty">No hay registros que coincidan en este proyecto.</p>}
          {memory.records.map(record => (
            <article className="memory-record" key={`${record.type}:${record.id}`} data-record-id={record.recordId} data-project-id={project.id}>
              <div className="record-heading"><span>{TYPE_NAMES[record.type] || record.type}</span><time dateTime={record.at}>{new Date(record.at).toLocaleString()}</time></div>
              <h3>{record.title}</h3>
              {record.content && <p className="record-content">{record.content}</p>}
              <div className="record-meta"><span>{record.status}</span>{record.priority && <span>Prioridad {record.priority}</span>}{record.outcome && <span>Resultado: {record.outcome}</span>}</div>
              {record.nextAction && <p className="record-next"><strong>Siguiente:</strong> {record.nextAction}</p>}
              {!!record.evidence?.length && <ul className="record-evidence" aria-label="Evidencias del registro">{record.evidence.map((value, index) => <li key={`${record.id}-evidence-${index}`}>{/^https?:\/\//i.test(value) ? <a href={value} target="_blank" rel="noopener noreferrer">{value}</a> : value}</li>)}</ul>}
            </article>
          ))}
        </div>
        {memory.hasMore && <p className="memory-footnote">Se muestran los primeros {memory.limit} registros de {memory.total}; ajusta la búsqueda para acotar resultados.</p>}
      </>}
      <p className="memory-footnote">El servidor local filtra por el ID de proyecto seleccionado; instrucciones originales y cronología se muestran desde el diario.</p>
    </section>
  )
}

function LocalSpeechPanel({ projectId }) {
  const [voices, setVoices] = useState([])
  const [voiceId, setVoiceId] = useState('')
  const [selection, setSelection] = useState('')
  const [state, setState] = useState({ state: 'idle', message: 'Selecciona texto de un mensaje o registro y pulsa Leer selección.' })
  const outputRef = useRef(null)
  const voiceKey = voice => voice.voiceURI || `${voice.name}:${voice.lang}`
  const selectedVoice = voices.find(voice => voiceKey(voice) === voiceId) || voices[0] || null

  useEffect(() => {
    const synthesis = window.speechSynthesis
    const Utterance = window.SpeechSynthesisUtterance
    setState(synthesis && typeof Utterance === 'function'
      ? { state: 'idle', message: 'Selecciona texto de un mensaje o registro y pulsa Leer selección.' }
      : { state: 'unavailable', message: 'Este navegador no ofrece SpeechSynthesis.' })
    const output = createLocalSpeechOutput({ synthesis, Utterance, onState: setState })
    outputRef.current = output
    const refreshVoices = () => {
      const next = getSpanishLocalVoices(synthesis)
      setVoices(next)
      setVoiceId(current => next.some(voice => voiceKey(voice) === current) ? current : (next[0] ? voiceKey(next[0]) : ''))
    }
    const refreshSelection = () => setSelection(getSelectedProjectText(window.getSelection(), projectId))
    const onPageHide = () => output.stop('Lectura cancelada al cerrar la vista.')
    refreshVoices()
    refreshSelection()
    document.addEventListener('selectionchange', refreshSelection)
    synthesis?.addEventListener?.('voiceschanged', refreshVoices)
    window.addEventListener('pagehide', onPageHide)
    return () => {
      document.removeEventListener('selectionchange', refreshSelection)
      synthesis?.removeEventListener?.('voiceschanged', refreshVoices)
      window.removeEventListener('pagehide', onPageHide)
      output.dispose()
      if (outputRef.current === output) outputRef.current = null
    }
  }, [projectId])

  const supported = typeof window !== 'undefined' && Boolean(window.speechSynthesis) && typeof window.SpeechSynthesisUtterance === 'function'
  const canRead = supported && voices.length > 0 && Boolean(selection) && state.state !== 'queued' && state.state !== 'speaking'
  const voiceIndex = selectedVoice ? voices.indexOf(selectedVoice) : -1
  return (
    <section className="speech-panel" aria-labelledby="speech-title">
      <div className="panel-heading"><div><p className="eyebrow">SALIDA TTS · SELECCIÓN EXPLÍCITA</p><h3 id="speech-title">Lectura en voz alta</h3></div><span className="quiet-indicator">NO GENERA RESPUESTAS</span></div>
      <div className="voice-state-grid" aria-label="Estados independientes de voz y modelo">
        <p><strong>Entrada STT</strong><span>Captura puntual en Hablar, si el proyecto tiene permiso. Sin escucha permanente.</span></p>
        <p><strong>Modelo</strong><span>Qwen3 local · estado y respuestas en el panel de IA del proyecto.</span></p>
        <p><strong>Interrupción</strong><span>Sin escucha activa · Detener cancela solo la lectura.</span></p>
      </div>
      <p className="speech-note">Solo leerá el fragmento que selecciones dentro de un registro de este proyecto. Se listan voces españolas que el navegador declara locales (`localService=true`); esa etiqueta no verifica por sí sola el procesamiento sin conexión.</p>
      <label className="speech-voice-label" htmlFor="jarvis-local-voice">Voz española reportada local por el navegador</label>
      <select id="jarvis-local-voice" className="speech-voice-select" value={voiceIndex < 0 ? '' : String(voiceIndex)} onChange={event => setVoiceId(voices[Number(event.target.value)] ? voiceKey(voices[Number(event.target.value)]) : '')} disabled={!supported || !voices.length}>
        {!voices.length && <option value="">No hay voz española local disponible</option>}
        {voices.map((voice, index) => <option key={`${voiceKey(voice)}:${index}`} value={String(index)}>{voice.name} · {voice.lang}</option>)}
      </select>
      <div className="speech-actions">
        <button type="button" className="primary" disabled={!canRead} onClick={() => outputRef.current?.speak(getSelectedProjectText(window.getSelection(), projectId), selectedVoice)}>Leer selección</button>
        <button type="button" disabled={!outputRef.current?.active()} onClick={() => outputRef.current?.stop('Lectura detenida por la persona.')}>Detener lectura</button>
      </div>
      <p className="speech-output-status" data-state={state.state} role="status" aria-live="polite">{!voices.length && supported ? 'Bloqueado: el navegador no ofrece voces españolas con localService=true.' : state.message}</p>
      <p className="speech-note">El panel Hablar permite una captura puntual con Whisper local. Se requiere permiso por proyecto y revisar la transcripción.</p>
    </section>
  )
}

function ConversationPanel({ project, messages, attempts, busy, onSend, onRetry, messageText, setMessageText, notice }) {
  return (
    <section className="conversation-panel" aria-labelledby="conversation-title">
      <div className="panel-heading"><div><p className="eyebrow">CONVERSACIÓN LOCAL · TEXTO</p><h2 id="conversation-title">{project.title}</h2></div><span className="quiet-indicator">NOTAS LOCALES</span></div>
      <p>Los mensajes se guardan en el almacén local y quedan vinculados al ID de este proyecto. Estas son notas; las respuestas de IA se muestran en el panel de conversación Qwen3.</p>
      <ol className="message-list" aria-label={`Mensajes guardados de ${project.title}`} aria-live="polite">
        {messages.map(message => <li key={message.recordId} className="stored-message" data-project-id={project.id}><span className="message-meta">Tú · {new Date(message.at).toLocaleString()}</span><p>{message.content}</p></li>)}
        {!messages.length && <li className="message-empty">Aún no hay mensajes guardados en este proyecto.</li>}
      </ol>
      {attempts.length > 0 && <section className="pending-attempts" aria-labelledby="pending-attempts-title">
        <h3 id="pending-attempts-title">Intentos locales sin confirmación</h3>
        <p>Comprueba el almacén antes de reenviar. No se reintenta automáticamente.</p>
        {attempts.map(attempt => <article key={attempt.id} className="pending-attempt">
          <p>{attempt.text}</p><span>Intento {attempt.id.slice(0, 8)} · resultado pendiente de verificar</span>
          <button type="button" disabled={busy === attempt.id} onClick={() => onRetry(attempt)}>{busy === attempt.id ? 'Comprobando…' : 'Comprobar y reintentar este intento'}</button>
        </article>)}
      </section>}
      <form className="message-form" onSubmit={onSend}>
        <label htmlFor="jarvis-message">Mensaje nuevo para guardar en este proyecto</label>
        <textarea id="jarvis-message" name="message" rows="3" maxLength="12000" required value={messageText} onChange={event => setMessageText(event.target.value)} placeholder="Escribe una nota o instrucción para añadir a la memoria…" />
        <button className="primary" type="submit" disabled={Boolean(busy) || !messageText.trim()}>Guardar mensaje nuevo</button>
      </form>
      {notice && <p className="message-notice" role="status" aria-live="polite">{notice}</p>}
      <LocalSpeechPanel projectId={project.id} />
    </section>
  )
}

export default function App() {
  const [projects, setProjects] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [memory, setMemory] = useState(null)
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingMemory, setLoadingMemory] = useState(false)
  const [error, setError] = useState('')
  const [searchText, setSearchText] = useState('')
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [messageText, setMessageText] = useState('')
  const [attempts, setAttempts] = useState([])
  const [busy, setBusy] = useState('')
  const [messageNotice, setMessageNotice] = useState('')
  const [session, setSession] = useState(null)
  const project = projects.find(item => item.id === selectedId) || null

  useEffect(() => {
    let active = true
    Promise.all([requestJson('/api/projects'), requestJson('/api/session')]).then(([catalog, currentSession]) => {
      if (!active) return
      setProjects(catalog.projects)
      setSession(currentSession)
      setSelectedId(catalog.projects[0]?.id || '')
      setLoadingProjects(false)
    }).catch(reason => { if (active) { setError(reason.message); setLoadingProjects(false) } })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!selectedId) { setMemory(null); setAttempts([]); return undefined }
    let active = true
    setLoadingMemory(true)
    setError('')
    try { setAttempts(readAttempts(selectedId)) } catch (reason) { setAttempts([]); setError(reason.message) }
    requestJson(memoryUrl(selectedId)).then(result => {
      if (active) setMemory(result)
    }).catch(reason => { if (active) setError(reason.message) }).finally(() => { if (active) setLoadingMemory(false) })
    return () => { active = false }
  }, [selectedId])

  useEffect(() => {
    if (!selectedId || !memory || memory.projectId !== selectedId) return
    const savedIds = new Set(memory.records.filter(record => record.type === 'message').map(record => record.recordId))
    let current
    try { current = readAttempts(selectedId) } catch (reason) { setError(reason.message); return }
    const resolved = current.filter(attempt => savedIds.has(attempt.id))
    const pending = current.filter(attempt => !savedIds.has(attempt.id))
    if (resolved.length) {
      try { writeAttempts(selectedId, pending) } catch { /* report when next write occurs */ }
      setAttempts(pending)
      setMessageNotice('El almacén confirmó tras recargar que el mensaje ya estaba guardado; no se reenvió.')
    }
  }, [memory, selectedId])

  function selectProject(projectId) {
    if (projectId === selectedId) return
    setSelectedId(projectId)
    setQuery(''); setSearchText(''); setType('all'); setMessageText(''); setMessageNotice(''); setMemory(null)
  }

  async function onSearch(event) {
    event.preventDefault()
    if (!project) return
    setLoadingMemory(true); setError('')
    try {
      const result = await requestJson(memoryUrl(project.id, searchText, type))
      if (result.projectId !== project.id) throw new Error('El servidor devolvió una memoria de otro proyecto.')
      setQuery(searchText.trim()); setMemory(result)
    } catch (reason) { setError(reason.message) } finally { setLoadingMemory(false) }
  }

  function savePending(projectId, next) {
    writeAttempts(projectId, next)
    setAttempts(next)
  }

  async function postAttempt(attempt) {
    setBusy(attempt.id); setError('')
    try {
      await requestJson('/api/messages', {method: 'POST', headers: {'Content-Type': 'application/json', 'X-Cerebro-Token': session.token}, body: JSON.stringify({id: attempt.id, projectId: attempt.projectId, text: attempt.text})})
    } catch (reason) {
      setError(`No se confirmó el guardado. El intento quedó guardado localmente; comprueba el estado antes de reintentar. (${reason.message})`)
      setBusy('')
      return
    } finally { setBusy('') }
    const remaining = readAttempts(attempt.projectId).filter(item => item.id !== attempt.id)
    try { savePending(attempt.projectId, remaining) } catch { setError('El servidor confirmó el mensaje, pero no se pudo limpiar el registro de recuperación del navegador.') }
    if (attempt.projectId === selectedId && messageText.trim() === attempt.text) setMessageText('')
    if (attempt.projectId === selectedId) setMessageNotice('Mensaje guardado en la memoria local de este proyecto.')
    try {
      const latest = await requestJson(memoryUrl(attempt.projectId))
      if (latest.projectId === selectedId) setMemory(latest)
    } catch { setError('El servidor confirmó el mensaje; no se pudo refrescar el panel. Usa Buscar o vuelve a seleccionar el proyecto.') }
  }

  async function onSend(event) {
    event.preventDefault()
    if (!project || !session || !messageText.trim()) return
    try {
      const attempt = {id: crypto.randomUUID(), projectId: project.id, text: messageText.trim(), createdAt: new Date().toISOString()}
      const next = [...readAttempts(project.id), attempt]
      savePending(project.id, next)
      await postAttempt(attempt)
    } catch (reason) { setError(`No se envió nada porque no se pudo guardar la identidad del intento en este navegador: ${reason.message}`) }
  }

  async function onRetry(attempt) {
    if (!session || busy) return
    setBusy(attempt.id); setError('')
    try {
      const latest = await requestJson(memoryUrl(attempt.projectId))
      if (latest.records.some(record => record.type === 'message' && record.recordId === attempt.id)) {
        savePending(attempt.projectId, readAttempts(attempt.projectId).filter(item => item.id !== attempt.id))
        if (attempt.projectId === selectedId) setMemory(latest)
        setMessageNotice('El almacén ya contenía este intento. Se verificó sin reenviarlo.')
        setBusy('')
        return
      }
      setBusy('')
      await postAttempt(attempt)
    } catch (reason) {
      setError(`No se pudo comprobar el intento; sigue pendiente y no se reenvió. (${reason.message})`)
      setBusy('')
    }
  }

  const messages = memory?.projectId === selectedId ? memory.records.filter(record => record.type === 'message').slice().reverse() : []

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand-lockup" href="/" aria-label="Volver a Cerebro local">
          <span className="brand-mark" aria-hidden="true">J</span><span><span className="brand-name">J.A.R.V.I.S.</span><span className="brand-subtitle">CONECTADO AL CEREBRO LOCAL</span></span>
        </a>
        <span className="preview-label"><i aria-hidden="true" />ALMACÉN LOCAL · {projects.length} PROYECTOS</span>
      </header>
      <section className="intro" aria-labelledby="page-title">
        <div className="reactor-card"><Scene /><span className="reactor-caption">NÚCLEO VISUAL · IA LOCAL OPCIONAL</span></div>
        <div className="intro-copy">
          <p className="eyebrow">CONTINUIDAD POR IDENTIDAD DE PROYECTO</p>
          <h1 id="page-title">Jarvis, en el centro.<br /><span>La memoria, local y conectada.</span></h1>
          <p className="lede">El mapa y cada panel leen los proyectos guardados en el servidor local. Escribir una nota requiere pulsar Guardar; su intento queda identificable para recuperar un corte.</p>
          <div className="capability-row" aria-label="Capacidades reales de esta vista">
            <span className="status-pill">Memoria local conectada</span><span className="status-pill">Qwen3 local · permiso por proyecto</span>
            <span className="status-pill">Micrófono solo al pulsar Hablar</span><span className="status-pill">Ejecución no integrada</span>
          </div>
        </div>
      </section>
      <aside className="demo-banner connected-banner" role="note"><strong>CONEXIÓN LOCAL ACTIVA.</strong> El servidor entrega solo el catálogo de proyectos y la memoria del ID seleccionado. Las escrituras son notas de texto explícitas; no ejecutan agentes.</aside>
      {error && <p className="error-banner" role="alert">{error}</p>}
      {loadingProjects && <p role="status">Conectando con el almacén local…</p>}
      {!loadingProjects && projects.length === 0 && <section className="demo-banner" role="status">Este almacén aún no contiene proyectos. Vuelve a Cerebro y crea o importa un proyecto.</section>}
      {!loadingProjects && project && <section className="workspace" aria-label="Mapa, memoria y conversación del almacén local">
        <section className="network-panel" aria-labelledby="network-title">
          <div className="panel-heading"><div><p className="eyebrow">MAPA RADIAL · DATOS DEL ALMACÉN</p><h2 id="network-title">Proyectos</h2></div><span className="panel-count">{projects.length} · LOCALES</span></div>
          <Network projects={projects} selectedId={selectedId} onSelect={selectProject} />
        </section>
        <div className="detail-stack">
          <LocalChat key={project.id} project={project} />
          <MemoryPanel project={project} memory={memory?.projectId === project.id ? memory : null} loading={loadingMemory} query={searchText} setQuery={setSearchText} type={type} setType={setType} onSearch={onSearch} />
          <ConversationPanel project={project} messages={messages} attempts={attempts} busy={busy} onSend={onSend} onRetry={onRetry} messageText={messageText} setMessageText={setMessageText} notice={messageNotice} />
        </div>
      </section>}
      <footer className="footer-note">Jarvis visual conectado a Cerebro · memoria local filtrada por ID · IA local opcional · sin ejecución automática.</footer>
    </main>
  )
}
