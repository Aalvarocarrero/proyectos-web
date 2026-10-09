"use client";
import {createContext,useContext,useEffect,useRef,useState,type FormEvent,type ReactNode,type ComponentProps} from "react";
import {Button} from "@/components/ui/button";
import {createSubmissionGate} from "@/lib/form-submission";
const SavingContext=createContext(false);
export function useFarmFormSaving(){return useContext(SavingContext);}
export function FarmSaveButton({children,...props}:ComponentProps<typeof Button>){
 const saving=useContext(SavingContext);
 return <Button {...props} type="submit" disabled={saving||props.disabled}>{saving?"Guardando…":children}</Button>;
}
export function FarmRecordForm({onSubmit,children,className="space-y-5"}:{onSubmit:(event:FormEvent<HTMLFormElement>)=>void|Promise<void>;children:ReactNode;className?:string}){
 const gate=useRef(createSubmissionGate()),completed=useRef(false),active=useRef(true);
 const [saving,setSaving]=useState(false),[done,setDone]=useState(false),[error,setError]=useState("");
 useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(gate.current.busy||completed.current)return;
  setSaving(true);setError("");
  try{await gate.current.run(()=>onSubmit(event));completed.current=true;if(active.current)setDone(true);}
  catch(cause){if(active.current)setError(cause instanceof Error && /^(Revisa:|Espera:)/.test(cause.message)?cause.message:"No se pudo confirmar el guardado. Tus datos siguen en el formulario. Comprueba los registros y el almacenamiento antes de repetir.");}
  finally{if(active.current)setSaving(false);}
 }
 return <SavingContext.Provider value={saving||done}><form onSubmit={submit} className="farm-record-form" aria-busy={saving}>
  <fieldset disabled={saving||done} className={`min-w-0 border-0 p-0 ${className}`}>{children}</fieldset>
  {saving&&<p role="status" className="mt-3 text-sm font-semibold text-[#365026]">Guardando en este dispositivo…</p>}
  {error&&<p role="alert" className="mt-4 rounded-xl border border-[#b85a48]/30 bg-[#fff1ed] p-3 text-sm leading-6 text-[#803a2d]">{error}</p>}
 </form></SavingContext.Provider>;
}
