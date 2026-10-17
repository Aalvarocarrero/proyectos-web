'use client';
/* eslint-disable @next/next/no-img-element -- Already optimized 11.6 KB vector; lazy, fixed dimensions, no image proxy. */

import {Component,Suspense,lazy,useCallback,useEffect,useRef,useState,type ReactNode} from 'react';

import poster from '@/lib/home-farm-poster.json';
import {homeFarmPreviewMode,shouldLoadHomeFarmPreview,stopHomeFarmPreview} from '@/lib/home-farm-preview';

const Scene=lazy(()=>import('./home-farm-scene'));
type Connection=EventTarget&{saveData?:boolean;effectiveType?:string};
class PreviewBoundary extends Component<{children:ReactNode;onUnavailable:()=>void},{failed:boolean}> {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(){this.props.onUnavailable();}
 render(){return this.state.failed?null:this.props.children;}
}

/** Stable, lightweight shell. The 2D poster is an alternative, never a 3D loading placeholder. */
export function HomeFarmPreview(){
 const host=useRef<HTMLDivElement>(null);
 const [preferencesKnown,setPreferencesKnown]=useState(false),[chosen2D,setChosen2D]=useState(false);
 const [visible,setVisible]=useState(false),[pageVisible,setPageVisible]=useState(true);
 const [reducedMotion,setReducedMotion]=useState(false),[constrained,setConstrained]=useState(true),[requested,setRequested]=useState(false);
 const [loaded,setLoaded]=useState(false),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[paused,setPaused]=useState(false);
 useEffect(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection=(navigator as Navigator&{connection?:Connection}).connection;
  const update=()=>{setPreferencesKnown(true);setReducedMotion(media.matches);setConstrained(media.matches||Boolean(connection?.saveData)||['slow-2g','2g','3g'].includes(connection?.effectiveType??''));};
  const visibility=()=>setPageVisible(document.visibilityState==='visible');
  update();visibility();media.addEventListener('change',update);connection?.addEventListener('change',update);document.addEventListener('visibilitychange',visibility);
  const element=host.current;
  const observer=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting),{threshold:0.15});
  if(element)observer?.observe(element);
  const visibilityFrame=observer?0:requestAnimationFrame(()=>setVisible(true));
  return()=>{cancelAnimationFrame(visibilityFrame);observer?.disconnect();media.removeEventListener('change',update);connection?.removeEventListener('change',update);document.removeEventListener('visibilitychange',visibility);};
 },[]);
 useEffect(()=>{
  // Never prefetch Three.js, models or textures on initial load or while offscreen.
  if(!shouldLoadHomeFarmPreview({loaded,failed,pageVisible,visible,requested,constrained:constrained||chosen2D}))return;
  const timer=window.setTimeout(()=>setLoaded(true),requested?0:800);
  return()=>window.clearTimeout(timer);
 },[visible,pageVisible,constrained,requested,loaded,failed,chosen2D]);
 useEffect(()=>{
  // A stalled module/GPU must not leave a permanent loading state. Hidden tabs do not consume the budget.
  if(!loaded||ready||failed||!pageVisible||!visible)return;
  const timer=window.setTimeout(()=>setFailed(true),20000);
  return()=>window.clearTimeout(timer);
 },[loaded,ready,failed,pageVisible,visible]);
 const unavailable=useCallback(()=>setFailed(true),[]),didRender=useCallback(()=>setReady(true),[]);
 const mode=homeFarmPreviewMode({preferencesKnown,chosen2D,constrained,requested,ready,failed});
 const stopped=!ready||mode==='2d'||reducedMotion||stopHomeFarmPreview({paused,visible,pageVisible,constrained,requested});
 const start=()=>{setChosen2D(false);setRequested(true);setPaused(false);if(typeof IntersectionObserver==='undefined')setVisible(true);};
 return <div ref={host} className="min-w-0" data-home-farm-preview>
  <div className="relative aspect-[8/5] overflow-hidden rounded-[1.5rem] border border-white/20 bg-[#e4e9d7] shadow-2xl">
   {mode==='2d'&&<img src={poster.src} alt="Plano ilustrativo de Finca Horizonte: distribución de las áreas y animales de la finca ficticia de 10 hectáreas." width={800} height={500} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover"/>}
   {mode==='loading'&&<div className="absolute inset-0 flex items-center justify-center bg-[#e4e9d7] p-6 pb-20 text-center text-sm text-[#365026]" aria-hidden="true">Preparando vista 3D…</div>}
   {loaded&&!failed&&<div className={`pointer-events-none absolute inset-0 ${mode==='3d'?'':'invisible'}`} aria-hidden="true"><PreviewBoundary onUnavailable={unavailable}><Suspense fallback={null}><Scene paused={stopped} onReady={didRender} onUnavailable={unavailable}/></Suspense></PreviewBoundary></div>}
   <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
    <span className="rounded-full bg-[#203e2d]/95 px-3 py-2 text-xs font-semibold text-white">{mode==='2d'?'Finca modelo · 10 ha · plano 2D':'Finca modelo · 10 ha · 3D'}</span>
    {!failed&&<button type="button" disabled={mode==='loading'||(mode==='3d'&&reducedMotion)} onClick={mode==='3d'&&!paused?()=>setPaused(true):start} aria-pressed={mode==='3d'?!stopped:undefined} className="min-h-11 rounded-full border border-[#365026]/20 bg-white px-4 py-2 text-xs font-bold text-[#29442c] shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{mode==='loading'?'Preparando 3D…':mode==='2d'?'Ver vista 3D':reducedMotion?'Vista sin movimiento':paused?'Reanudar giro':'Pausar giro'}</button>}
   </div>
  </div>
  <p className="mt-3 min-h-10 text-xs leading-5 text-[#d3ddca]" role="status">{failed?'Vista ligera 2D: no se pudo preparar el recorrido 3D en este navegador o conexión.':mode==='loading'?'Preparando la vista 3D. Puedes seguir explorando la página.':mode==='2d'?(chosen2D?'Plano ilustrativo 2D seleccionado.':reducedMotion?'Vista 2D para respetar tu preferencia de movimiento reducido. Puedes abrir el 3D sin giro.':'Vista ligera 2D para ahorrar datos en tu conexión. Puedes abrir el 3D si lo deseas.'):reducedMotion?'Vista 3D fija para respetar tu preferencia de movimiento reducido.':'Vista de ejemplo. El giro se detiene al salir de esta sección o pestaña.'}</p>
  {failed?<a href="/finca-modelo" className="inline-flex min-h-11 items-center text-xs text-white underline underline-offset-4">Explorar finca modelo</a>:<button type="button" onClick={mode==='2d'?start:()=>{setChosen2D(true);setRequested(false);}} className="min-h-11 text-left text-xs text-white underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{mode==='2d'?'Abrir vista 3D':'También disponible en 2D'}</button>}
 </div>;
}
