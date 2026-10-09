"use client";
import {useState} from "react";
const prefix="venezuela-agro-first-start-v1:";
export function FarmFirstStart({owner,onContinue}:{owner:string;onContinue:()=>void}){
 const [dismissed,setDismissed]=useState(()=>{try{return localStorage.getItem(prefix+encodeURIComponent(owner))!==null;}catch{return false;}});
 function choose(value:string){try{localStorage.setItem(prefix+encodeURIComponent(owner),value);}catch{}setDismissed(true);onContinue();}
 if(dismissed)return null;
 return <section className="mb-6 rounded-2xl border border-[#4c6b3a]/25 bg-white p-5"><h2 className="text-xl font-bold">Conoce Mi Finca con ejemplos</h2><p className="mt-3 text-sm leading-7">Explora una finca ficticia completa: puedes editar y eliminar sus ejemplos en un espacio de práctica separado. O comienza directamente con tus propios datos.</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={()=>{choose("demo");window.location.assign("/finca-demo");}} className="button-dark">Explorar demostración editable</button><button type="button" onClick={()=>choose("empty")} className="min-h-11 rounded-full border px-4 text-sm font-bold">Empezar mi finca vacía</button></div></section>;
}
