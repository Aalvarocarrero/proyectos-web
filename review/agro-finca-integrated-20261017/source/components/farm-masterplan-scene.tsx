'use client';
import {Component,Suspense,lazy,useState,type ReactNode} from 'react';
import FarmMasterplanVector from './farm-masterplan-vector';
import {FarmAssetPack} from './farm-asset-pack';
import type {MasterplanProps} from './farm-masterplan-webgl';
const WebGLScene=lazy(()=>import('./farm-masterplan-webgl'));
class SceneBoundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true};}render(){return this.state.failed?this.props.fallback:this.props.children;}}
export default function FarmMasterplanScene(props:MasterplanProps){const [unavailable,setUnavailable]=useState(false);const fallback=<><p role="status" className="mb-3 rounded-xl bg-[#fff4d6] p-3 text-sm">Vista ligera activada. Este navegador no pudo iniciar el motor 3D; puedes seguir explorando en 2D.</p><FarmMasterplanVector {...props}/></>;return <>{!props.readOnly&&<FarmAssetPack className="mb-4"/>}{unavailable?fallback:<SceneBoundary fallback={fallback}><Suspense fallback={<div role="status" className="rounded-2xl bg-[#e5ebdc] p-6"><p>Preparando recorrido 3D…</p><button type="button" className="mt-3 min-h-11 rounded-full border bg-white px-4" onClick={props.onReturn}>Abrir plano 2D</button></div>}><WebGLScene {...props} onUnavailable={()=>setUnavailable(true)}/></Suspense></SceneBoundary>}</>;}
