import {phoneDigits} from './listing-contact';

/** Only explicitly published, opted-in contact data belongs here. Never use account or order phones. */
export type PublicWhatsAppContact = {phone?: string | null; enabled?: boolean; demo?: boolean};
export function contextualContactMessage(context: string) {
 const subject=context.trim().replace(/\s+/g,' ') || 'esta publicación';
 return `Hola, vengo de VenezuelaAgro.com. Estoy interesado en ${subject}.`;
}
export function publicWhatsAppUrl(contact: PublicWhatsAppContact, context: string, suffix = '') {
 if(contact.demo || contact.enabled !== true || !contact.phone || !/^[+\d\s().-]+$/.test(contact.phone)) return null;
 const digits=phoneDigits(contact.phone);
 if(!/^[1-9]\d{9,14}$/.test(digits)) return null;
 return `https://wa.me/${digits}?text=${encodeURIComponent(contextualContactMessage(context)+suffix)}`;
}
