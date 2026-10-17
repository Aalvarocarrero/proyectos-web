"use client";
import {useState} from "react";
const prefix="venezuela-agro-first-start-v1:";
export function FarmFirstStart({owner,onContinue}:{owner:string;onContinue:()=>void}){
 const [dismissed,setDismissed]=useState(()=>{try{return localStorage.getItem(prefix+encodeURIComponent(owner))!==null;}catch{return false;}});
 function choose(value:string){try{localStorage.setItem(prefix+encodeURIComponent(owner),value);}catch{}setDismissed(true);onContinue();}
 if(dismissed)return null;
 return <section className="mb-6 rounded-2xl border border-[#4c6b3a]/25 bg-white p-5"><h2 className="text-xl font-bold">Conoce Mi Finca con ejemplos</h2><p className="mt-3 text-sm leading-7">Explora la finca modelo completa de 10 ha: recorrido 3D, plano 2D y todos sus registros. Tu práctica editable guardada se conserva. También puedes comenzar con tus propios datos.</p><ol className="mt-4 grid gap-3 text-sm leading-6 sm:grid-cols-3"><li className="rounded-xl bg-[#f3f6ee] p-3"><strong>1. Crea tu finca.</strong><br/>Escribe su nombre y la zona. Puedes completar el terreno después.</li><li className="rounded-xl bg-[#f3f6ee] p-3"><strong>2. Anota tu trabajo.</strong><br/>Agrega un animal, una siembra o una tarea cuando lo necesites.</li><li className="rounded-xl bg-[#f3f6ee] p-3"><strong>3. Prepárala sin señal.</strong><br/>Con internet, descarga lo básico y guarda una copia de tus registros.</li></ol><div className="mt-4 flex flex-wrap gap-3"><a href="/finca-modelo" className="button-dark">Mostrar ejemplos de 10 ha</a><button type="button" onClick={()=>choose("empty")} className="min-h-11 rounded-full border px-4 text-sm font-bold">Empezar mi finca vacía</button></div></section>;
}
