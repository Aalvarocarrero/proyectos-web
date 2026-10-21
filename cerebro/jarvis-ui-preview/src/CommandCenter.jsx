import React from 'react'
import {Scene} from './scene/Scene.tsx'
const names={idle:'EN ESPERA',listening:'ESCUCHANDO',recording:'ESCUCHANDO',transcribing:'TRANSCRIBIENDO',thinking:'PROCESANDO',speaking:'RESPONDIENDO',error:'REVISAR ESTADO',requesting:'PERMISO DE MICRÓFONO'}
export default function CommandCenter({projects,selectedId,onSelect,phase='idle',level=0,micActive=false,onPanel}){
 const points=projects.map((p,i)=>{const a=-Math.PI/2+2*Math.PI*i/Math.max(1,projects.length);return {p,x:600+420*Math.cos(a),y:330+230*Math.sin(a)}})
 return <section className="command-center" aria-label="Jarvis y Cerebro unidos">
  <div className="hud-corner tl"/><div className="hud-corner tr"/><div className="hud-corner bl"/><div className="hud-corner br"/>
  <header className="hud-heading"><div><h1>J.A.R.V.I.S.</h1><p>CEREBRO PERSONAL / USUARIO LOCAL</p></div><span className={'phase-tag phase-'+phase}><i/>{names[phase]||'EN ESPERA'}</span></header>
  <div className="neural-field">
   <div className="main-reactor"><Scene phase={phase} level={level}/></div>
   <svg className="neural-arms" viewBox="0 0 1200 660" role="group" aria-label="Brazos de proyectos">
    <defs><radialGradient id="neural-node"><stop stopColor="#0d3443"/><stop offset="1" stopColor="#020b13"/></radialGradient></defs>
    <ellipse cx="600" cy="330" rx="225" ry="187" className="orbit-track"/><ellipse cx="600" cy="330" rx="270" ry="213" className="orbit-track secondary"/>
    {points.map(({p,x,y},i)=>{const active=p.id===selectedId;const dx=x-600,dy=y-330;return <g key={p.id} className={active?'neural-project selected':'neural-project'} role="button" tabIndex="0" aria-pressed={active} aria-label={`Abrir ${p.title}`} onClick={()=>onSelect(p.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(p.id)}}}>
      <path d={`M ${600+dx*.36} ${330+dy*.36} C ${600+dx*.65-dy*.12} ${330+dy*.35+dx*.12}, ${x-dx*.08} ${y-dy*.12}, ${x} ${y}`} className="neural-link"/>
      <path d={`M ${x} ${y} q ${dx>0?32:-32} -23 ${dx>0?64:-64} -17 M ${x} ${y} q ${dx>0?28:-28} 26 ${dx>0?55:-55} 25`} className="neural-twig"/>
      <circle cx={x} cy={y} r="23" fill="url(#neural-node)"/><circle cx={x} cy={y} r="29" className="node-reticle"/>
      <text x={x} y={y+4} className="node-index">{String(i+1).padStart(2,'0')}</text>
      <text x={x} y={y+47} className="neural-title">{p.title.split(' · ')[0].slice(0,25)}</text>
    </g>})}
   </svg>
   <div className="core-identity"><span>JARVIS</span><small>MEMORIA / {projects.length} PROYECTOS</small></div>
   <div className="hud-system-rail"><span>MOTORES CONFIGURADOS</span><p><i/>CEREBRO</p><p><i/>OLLAMA · QWEN3</p><p><i/>WHISPER · ESPAÑOL</p><p className="dim">AGENTES / SIN EJECUCIÓN</p></div>
   <div className="hud-signal"><span>ENTRADA</span><div><i style={{height:`${Math.round(level*100)}%`}}/></div><small>{Math.round(level*100)}%</small></div>
  </div>
  <footer className="hud-bottom"><span>LOCAL / 127.0.0.1</span><nav aria-label="Ramas del proyecto"><button onClick={()=>onPanel('chat')}>CONVERSACIÓN</button><button onClick={()=>onPanel('memory')}>MEMORIA + TAREAS</button><button onClick={()=>onPanel('notes')}>NOTAS</button><button onClick={()=>onPanel('agents')}>AGENTES</button></nav><span>MICRÓFONO / {micActive?'SESIÓN ACTIVA':'APAGADO'}</span></footer>
 </section>
}
