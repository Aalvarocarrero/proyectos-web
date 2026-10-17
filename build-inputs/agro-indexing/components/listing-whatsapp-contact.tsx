'use client';

import {useId, useState} from 'react';
import {MessageCircle} from 'lucide-react';
import {Dialog, DialogContent, DialogDescription, DialogTitle} from '@/components/ui/dialog';
import {availabilityMessage, whatsappAvailabilityUrl} from '@/lib/marketplace-details';
import {readListingContact} from '@/lib/listing-contact';

type Props = {productTitle: string; contact?: string | null; contactProfile?: unknown; demo?: boolean};

export function ListingWhatsAppContact({productTitle, contact, contactProfile, demo = false}: Props) {
  const [preview, setPreview] = useState(false);
  const explanationId = useId();
  const profile = demo ? null : readListingContact(contact, contactProfile);
  const href = whatsappAvailabilityUrl({title: productTitle, contact, contactProfile, demo});
  const actionClass = 'flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#176b3b] px-4 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-[#12562f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176b3b]';
  return <div className="min-w-0" data-marketplace-contact="whatsapp">
    {demo ? <button type="button" className={actionClass} aria-haspopup="dialog" aria-describedby={explanationId} onClick={() => setPreview(true)}><MessageCircle size={21} aria-hidden="true" className="shrink-0"/>WhatsApp · Ejemplo</button>
      : href ? <a href={href} target="_blank" rel="noopener noreferrer" className={actionClass} aria-describedby={explanationId}><MessageCircle size={21} aria-hidden="true" className="shrink-0"/>Hablar con el vendedor por WhatsApp</a>
      : <button type="button" disabled aria-describedby={explanationId} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#3e2a19]/20 bg-[#eee8dd] px-4 py-3 text-sm font-semibold text-[#5f574f]"><MessageCircle size={21} aria-hidden="true" className="shrink-0"/>WhatsApp no disponible</button>}
    <p id={explanationId} className="mt-2 text-xs leading-5 text-[#5f574f]">{demo ? 'Mira el mensaje de ejemplo. No hay un vendedor real ni se envía nada.' : href ? 'Abre el mensaje de disponibilidad. Tú decides si lo envías en WhatsApp.' : !profile ? 'Este anunciante todavía no tiene un teléfono público registrado. Revisa sus datos de contacto.' : !profile.whatsapp ? 'El anunciante no habilitó WhatsApp. Puedes usar el teléfono de su ficha.' : 'El teléfono registrado necesita un código de país válido para abrir WhatsApp.'}</p>
    <Dialog open={preview} onOpenChange={setPreview}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto bg-[#f8f3ea] sm:max-w-xl">
        <DialogTitle>WhatsApp · Mensaje de ejemplo</DialogTitle>
        <DialogDescription>Así se prepara la consulta de disponibilidad en un anuncio real. Esta demostración no tiene destinatario.</DialogDescription>
        <p className="rounded-xl bg-white p-4 text-sm leading-7">{availabilityMessage(productTitle)}</p>
        <p className="text-xs leading-6 text-[#5f574f]">Cuando el vendedor registra su teléfono y habilita WhatsApp, este botón abre su conversación con el mensaje listo para revisar.</p>
        <button type="button" className="button-light" onClick={() => setPreview(false)}>Cerrar ejemplo</button>
      </DialogContent>
    </Dialog>
  </div>;
}
