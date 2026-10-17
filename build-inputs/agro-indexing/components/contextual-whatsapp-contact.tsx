'use client';
import {useId,useState} from 'react';
import {MessageCircle} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {contextualContactMessage,publicWhatsAppUrl,type PublicWhatsAppContact} from '@/lib/whatsapp-contact';

type Props=PublicWhatsAppContact & {context:string;label?:string;unavailableMessage?:string;className?:string};
export function ContextualWhatsAppContact({context,phone,enabled,demo=false,label='Consultar por WhatsApp',unavailableMessage,className=''}:Props){
 const [preview,setPreview]=useState(false),id=useId();
 const href=publicWhatsAppUrl({phone,enabled,demo},context);
 const action='flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#176b3b] px-4 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-[#12562f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176b3b]';
 return <div className={`min-w-0 ${className}`} data-contextual-contact="whatsapp">
  {demo?<button type="button" className={action} aria-haspopup="dialog" aria-describedby={id} onClick={()=>setPreview(true)}><MessageCircle size={20} aria-hidden="true"/>WhatsApp · Ejemplo</button>:href?<a className={action} href={href} target="_blank" rel="noopener noreferrer" aria-describedby={id}><MessageCircle size={20} aria-hidden="true"/>{label}</a>:<button type="button" disabled aria-describedby={id} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border bg-[#eee8dd] px-4 py-3 text-sm font-semibold text-[#5f574f]"><MessageCircle size={20} aria-hidden="true"/>WhatsApp no disponible</button>}
  <p id={id} className="mt-2 text-xs leading-5 text-[#5f574f]">{demo?'Vista previa del mensaje. Es una demostración sin destinatario real.':href?'El mensaje incluye lo que estás viendo. Tú decides si lo envías en WhatsApp.':unavailableMessage||(!phone?'Todavía no hay un teléfono público habilitado para WhatsApp.':!enabled?'El responsable no ha habilitado WhatsApp para este contacto público.':'El teléfono público necesita un código de país válido.')}</p>
  <Dialog open={preview} onOpenChange={setPreview}><DialogContent className="max-h-[90dvh] overflow-y-auto bg-[#f8f3ea] sm:max-w-xl"><DialogTitle>WhatsApp · Mensaje de ejemplo</DialogTitle><DialogDescription>Esta demostración no abre una conversación ni envía mensajes.</DialogDescription><p className="rounded-xl bg-white p-4 text-sm leading-7">{contextualContactMessage(context)}</p><button type="button" className="button-light" onClick={()=>setPreview(false)}>Cerrar ejemplo</button></DialogContent></Dialog>
 </div>;
}
