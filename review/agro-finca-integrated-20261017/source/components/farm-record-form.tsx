"use client";
import {createContext,useContext,useEffect,useRef,useState,useMemo,type FormEvent,type ReactNode,type ComponentProps} from "react";
import {Dialog,DialogClose} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {canDismissFarmDraft} from "@/lib/farm-workflow-validation";
import {createSubmissionGate} from "@/lib/form-submission";
const SavingContext=createContext(false);
const DraftContext=createContext<{setDirty:(value:boolean)=>void;setBusy:(value:boolean)=>void}|null>(null);
/** Covers Escape, backdrop and close-button dismissal, without persisting private drafts. */
export function FarmDraftDialog({onOpenChange,...props}:ComponentProps<typeof Dialog>){
 const draft=useRef({dirty:false,busy:false});
 const controls=useMemo(()=>({setDirty:(value:boolean)=>{draft.current.dirty=value;},setBusy:(value:boolean)=>{draft.current.busy=value;}}),[]);
 function change(open:boolean){
  if(!open && !canDismissFarmDraft(draft.current,()=>window.confirm("Tienes cambios sin guardar. ¿Descartarlos y cerrar?")))return;
  if(!open)draft.current.dirty=false;
  onOpenChange?.(open);
 }
 return <DraftContext.Provider value={controls}><Dialog {...props} onOpenChange={change}/></DraftContext.Provider>;
}
export function useFarmFormSaving(){return useContext(SavingContext);}
export function FarmSaveButton({children,...props}:ComponentProps<typeof Button>){
 const saving=useContext(SavingContext);
 return <Button {...props} className={["min-h-11",props.className].filter(Boolean).join(" ")} type="submit" disabled={saving||props.disabled}>{saving?"Guardando…":children}</Button>;
}
export function FarmRecordForm({onSubmit,children,className="space-y-5",onDraftStateChange}:{onDraftStateChange?:(dirty:boolean,busy:boolean)=>void;onSubmit:(event:FormEvent<HTMLFormElement>)=>void|Promise<void>;children:ReactNode;className?:string}){
 const draft=useContext(DraftContext);
 const dirty=useRef(false);
 const errorRef=useRef<HTMLParagraphElement>(null);
 const [edited,setEdited]=useState(false);
 const gate=useRef(createSubmissionGate()),completed=useRef(false),active=useRef(true);
 const [saving,setSaving]=useState(false),[done,setDone]=useState(false),[error,setError]=useState("");
 useEffect(()=>{if(error)errorRef.current?.focus();},[error]);
 useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 useEffect(()=>{
  function warn(event:BeforeUnloadEvent){if(dirty.current||gate.current.busy){event.preventDefault();event.returnValue="";}}
  window.addEventListener("beforeunload",warn);
  return()=>{window.removeEventListener("beforeunload",warn);if(draft){draft.setDirty(false);draft.setBusy(false);}};
 },[draft]);
 useEffect(()=>{onDraftStateChange?.(edited&&!done,saving);},[edited,done,saving,onDraftStateChange]);
 useEffect(()=>()=>{onDraftStateChange?.(false,false);},[onDraftStateChange]);
 function markEdited(event:FormEvent<HTMLFormElement>){if(event.target instanceof Element&&event.target.closest("[data-price-conversion]"))return;dirty.current=true;setEdited(true);draft?.setDirty(true);onDraftStateChange?.(true,gate.current.busy);}
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(gate.current.busy||completed.current)return;
  setSaving(true);setError("");draft?.setBusy(true);onDraftStateChange?.(dirty.current,true);
  try{await gate.current.run(()=>onSubmit(event));completed.current=true;dirty.current=false;draft?.setDirty(false);if(active.current)setDone(true);}
  catch(cause){if(active.current)setError(cause instanceof Error && /^(Revisa:|Espera:)/.test(cause.message)?cause.message:"No se pudo confirmar el guardado. Tus datos siguen en el formulario. Comprueba los registros y el almacenamiento antes de repetir.");}
  finally{draft?.setBusy(false);if(active.current)setSaving(false);}
 }
 return <SavingContext.Provider value={saving||done}><form onSubmit={submit} onInputCapture={markEdited} onChangeCapture={markEdited} className="farm-record-form" aria-busy={saving}>
  <fieldset disabled={saving||done} className={`min-w-0 border-0 p-0 ${className}`}>{children}</fieldset>
  {draft&&<DialogClose asChild><Button type="button" variant="outline" disabled={saving||done} className="mt-3 min-h-11 rounded-full">Cancelar</Button></DialogClose>}
  {edited&&!saving&&!done&&<p className="mt-3 text-xs leading-5 text-[#71685f]">Cambios sin guardar. Pulsa Guardar para conservarlos en este dispositivo.</p>}
  {done&&<p role="status" className="mt-3 rounded-xl bg-[#edf3e7] p-3 text-sm text-[#365026]">Guardado en este dispositivo. La sincronización se comprueba por separado.</p>}
  {saving&&<p role="status" className="mt-3 text-sm font-semibold text-[#365026]">Guardando en este dispositivo…</p>}
  {error&&<p ref={errorRef} tabIndex={-1} role="alert" className="mt-4 rounded-xl border border-[#b85a48]/30 bg-[#fff1ed] p-3 text-sm leading-6 text-[#803a2d]">{error}</p>}
 </form></SavingContext.Provider>;
}
