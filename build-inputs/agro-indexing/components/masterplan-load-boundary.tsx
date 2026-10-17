'use client';
import {Component,type ReactNode} from 'react';
/** A missing offline chunk must never take the existing 2D editor down. */
export class MasterplanLoadBoundary extends Component<{children:ReactNode;onReturn:()=>void},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<div role="alert" className="rounded-2xl border bg-white p-5"><p>No se pudo cargar la vista 360°. Tus datos siguen disponibles en 2D. Si estás sin conexión, prepara la aplicación cuando recuperes señal.</p><button type="button" className="mt-3 min-h-11 rounded-full border px-4" onClick={this.props.onReturn}>Volver a 2D</button></div>:this.props.children;}
}
