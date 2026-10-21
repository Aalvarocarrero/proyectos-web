import React, { useState } from 'react'
import { Scene } from './scene/Scene.tsx'

const projects = [
  {
    id: 'aurora-demo',
    name: 'Proyecto Aurora',
    status: 'pendiente',
    priority: 'alta',
    next: 'Revisar el prototipo de muestra',
    instruction: 'Conservar los originales de demostración sin resumir.',
    decision: 'La información de muestra pertenece solo a este proyecto ficticio.',
    task: 'Preparar el siguiente checkpoint de ejemplo.',
  },
  {
    id: 'boreal-demo',
    name: 'Taller Boreal',
    status: 'bloqueado',
    priority: 'media',
    next: 'Esperar una evidencia ficticia de prueba',
    instruction: 'No cambiar el estado sin una evidencia de demostración.',
    decision: 'El bloqueo de este fixture no afecta a ningún proyecto real.',
    task: 'Registrar una nota de prueba cuando se resuelva el bloqueo.',
  },
  {
    id: 'atlas-demo',
    name: 'Atlas de Muestra',
    status: 'en curso',
    priority: 'baja',
    next: 'Validar la navegación accesible',
    instruction: 'Usar únicamente datos sintéticos en esta previsualización.',
    decision: 'Mantener la lista disponible como alternativa al mapa radial.',
    task: 'Comprobar selección por teclado y móvil.',
  },
  {
    id: 'nube-demo',
    name: 'Nube de Prueba',
    status: 'preparado',
    priority: 'sin asignar',
    next: 'No hay ejecución real en la demostración',
    instruction: 'El contenido es inventado y no representa memoria del usuario.',
    decision: 'La vista web es solo visual y no guarda cambios.',
    task: 'Ninguna acción externa está conectada.',
  },
]

const points = [
  { x: 168, y: 122 }, { x: 792, y: 122 },
  { x: 168, y: 398 }, { x: 792, y: 398 },
]

function Network({ selected, onSelect }) {
  return (
    <div className="network-frame">
      <svg className="network-map" viewBox="0 0 960 520" role="group" aria-label="Mapa radial ficticio de proyectos; usa también la lista accesible">
        <defs>
          <linearGradient id="link-glow" x1="0" x2="1">
            <stop offset="0" stopColor="#27d8ec" stopOpacity=".24" />
            <stop offset=".5" stopColor="#6be9f2" stopOpacity=".85" />
            <stop offset="1" stopColor="#27d8ec" stopOpacity=".24" />
          </linearGradient>
          <radialGradient id="core-fill">
            <stop offset="0" stopColor="#14354a" />
            <stop offset="1" stopColor="#071018" />
          </radialGradient>
        </defs>
        {points.map((point, index) => (
          <path key={`link-${projects[index].id}`} d={`M 480 260 Q ${(point.x + 480) / 2} ${point.y < 260 ? 150 : 370} ${point.x} ${point.y}`} className="network-link" />
        ))}
        <circle cx="480" cy="260" r="80" className="network-core-halo" />
        <circle cx="480" cy="260" r="61" fill="url(#core-fill)" stroke="#70eaf2" strokeOpacity=".7" />
        <text x="480" y="252" textAnchor="middle" className="core-title">JARVIS</text>
        <text x="480" y="277" textAnchor="middle" className="core-caption">SIN MODELO</text>
        {projects.map((project, index) => {
          const point = points[index]
          const active = selected.id === project.id
          return (
            <g
              key={project.id}
              className={`network-project ${active ? 'active' : ''}`}
              role="button"
              tabIndex="0"
              aria-pressed={active}
              aria-label={`${project.name}, fixture ficticio, estado ${project.status}, prioridad ${project.priority}. Abrir memoria de demostración.`}
              data-project-id={project.id}
              onClick={() => onSelect(project)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelect(project)
                }
              }}
            >
              <circle cx={point.x} cy={point.y} r="49" className="node-disc" />
              <circle cx={point.x} cy={point.y} r="38" className="node-core" />
              <text x={point.x} y={point.y - 1} textAnchor="middle" className="node-mark">{project.name.split(' ').map(word => word[0]).slice(0, 2).join('')}</text>
              <text x={point.x} y={point.y + 72} textAnchor="middle" className="node-name">{project.name}</text>
              <text x={point.x} y={point.y + 92} textAnchor="middle" className="node-status">{project.status} · demo</text>
            </g>
          )
        })}
      </svg>
      <ul className="project-list" aria-label="Lista accesible de proyectos ficticios">
        {projects.map(project => (
          <li key={project.id}>
            <button type="button" className={selected.id === project.id ? 'project-choice active' : 'project-choice'} aria-pressed={selected.id === project.id} onClick={() => onSelect(project)}>
              <span className="choice-mark" aria-hidden="true">{project.name.split(' ').map(word => word[0]).slice(0, 2).join('')}</span>
              <span className="choice-copy"><strong>{project.name}</strong><small>{project.status} · prioridad {project.priority} · ficticio</small></span>
              <span className="choice-chevron" aria-hidden="true">›</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MemoryPanel({ project }) {
  return (
    <section className="memory-panel" aria-labelledby="memory-title" aria-live="polite">
      <div className="panel-heading">
        <div><p className="eyebrow">MEMORIA AISLADA · FIXTURE</p><h2 id="memory-title">{project.name}</h2></div>
        <span className="demo-tag">FICTICIO</span>
      </div>
      <div className="memory-status"><span className={`status-dot ${project.status}`} />Estado: <strong>{project.status}</strong><span className="priority-label">Prioridad {project.priority}</span></div>
      <dl className="memory-records">
        <div><dt>Instrucción original</dt><dd>{project.instruction}</dd></div>
        <div><dt>Decisión</dt><dd>{project.decision}</dd></div>
        <div><dt>Siguiente acción</dt><dd>{project.next}</dd></div>
        <div><dt>Tarea de muestra</dt><dd>{project.task}</dd></div>
      </dl>
      <p className="memory-footnote">Este panel muestra contenido inventado. No lee ni modifica el almacén local de Cerebro.</p>
    </section>
  )
}

export default function App() {
  const [selected, setSelected] = useState(projects[0])
  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup"><span className="brand-mark" aria-hidden="true">J</span><div><p className="brand-name">J.A.R.V.I.S.</p><p className="brand-subtitle">INTERFAZ LOCAL · MEMORIA DE PROYECTOS</p></div></div>
        <span className="preview-label"><i aria-hidden="true" />PREVISUALIZACIÓN SINTÉTICA</span>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <div className="reactor-card"><Scene /><span className="reactor-caption">NÚCLEO VISUAL · INACTIVO</span></div>
        <div className="intro-copy">
          <p className="eyebrow">SISTEMA DE CONTINUIDAD DE PROYECTOS</p>
          <h1 id="page-title">Jarvis, en el centro.<br /><span>Los proyectos, conectados.</span></h1>
          <p className="lede">Una interfaz propia para explorar memorias por proyecto. Esta versión solo valida diseño y navegación con ejemplos ficticios.</p>
          <div className="capability-row" aria-label="Estado real de esta previsualización">
            <span className="status-pill synthetic">Demo visual</span>
            <span className="status-pill">Sin modelo conectado</span>
            <span className="status-pill">Micrófono apagado</span>
            <span className="status-pill">Ejecución no integrada</span>
          </div>
        </div>
      </section>

      <aside className="demo-banner" role="note"><strong>DEMOSTRACIÓN · DATOS FICTICIOS.</strong> Esta pantalla no se conecta al diario local, no guarda cambios, no llama proveedores y no ejecuta tareas.</aside>

      <section className="workspace" aria-label="Navegación de ejemplo y memoria del proyecto">
        <section className="network-panel" aria-labelledby="network-title">
          <div className="panel-heading"><div><p className="eyebrow">MAPA RADIAL</p><h2 id="network-title">Proyectos de demostración</h2></div><span className="panel-count">04 · FICTICIOS</span></div>
          <Network selected={selected} onSelect={setSelected} />
        </section>
        <div className="detail-stack">
          <MemoryPanel project={selected} />
          <section className="conversation-panel" aria-labelledby="conversation-title">
            <div className="panel-heading"><div><p className="eyebrow">CONVERSACIÓN</p><h2 id="conversation-title">JARVIS está desconectado</h2></div><span className="quiet-indicator">INACTIVO</span></div>
            <p>El chat con modelos y la entrada por voz no están habilitados en esta vista. No hay respuestas simuladas.</p>
            <div className="voice-controls" aria-label="Voz no disponible en esta previsualización">
              <button type="button" disabled aria-describedby="voice-status">Pulsar para hablar</button>
              <button type="button" disabled aria-describedby="voice-status">Detener</button>
            </div>
            <p id="voice-status" className="voice-status" role="status">Micrófono apagado · transcripción no disponible · sin audio real verificado.</p>
          </section>
        </div>
      </section>
      <footer className="footer-note">Interfaz visual aislada · fixture sintético · sin persistencia ni servicios externos.</footer>
    </main>
  )
}
