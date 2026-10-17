'use client';
import {requiresFormalSession} from '@/lib/formal-submission';
export function FormalSubmissionNotice({onLogin,loginNeeded=false}:{onLogin:()=>void;loginNeeded?:boolean}){
 if(!requiresFormalSession())return null;
 return <div className="rounded-xl border border-[#4c6b3a]/25 bg-[#edf3e7] p-4 text-sm leading-6" role={loginNeeded?'alert':undefined}>
  <p>Las cotizaciones y los comentarios formales requieren una sesión de Google. Puedes preparar el borrador antes de entrar. Los enlaces de WhatsApp disponibles permiten contactar sin cuenta en Venezuela Agro.</p>
  <button type="button" onClick={onLogin} className="mt-2 inline-flex min-h-11 items-center font-semibold underline">Entrar y volver a este formulario</button>
  <p className="mt-1 text-xs">Al continuar, guardaremos el borrador solo en esta pestaña durante una hora. Volver de Google no lo envía automáticamente.</p>
 </div>;
}
