import { Phone, MapPin, ExternalLink, UserRound, Tractor } from "lucide-react";
import { legacyListingContactText } from "@/lib/marketplace-details";
import { readListingContact, phoneDigits } from "@/lib/listing-contact";
import { ListingWhatsAppContact } from "@/components/listing-whatsapp-contact";

export function ListingContactCard({ sellerName, contact, contactProfile, location, demo = false, productTitle = "anunciado" }: {
  sellerName: string; contact?: string | null; contactProfile?: unknown; location: string; demo?: boolean; productTitle?: string;
}) {
  const profile = demo ? null : readListingContact(contact, contactProfile);
  const links = profile ? [
    ["Instagram", profile.instagram], ["Facebook", profile.facebook], ["TikTok", profile.tiktok],
    ["YouTube", profile.youtube], ["Google Mi Negocio / Maps", profile.googleBusiness], ["Sitio web", profile.website],
  ].filter(([, href]) => href) : [];
  return <section aria-label="Datos de contacto del anunciante" className="mt-5 min-w-0 rounded-2xl border border-[#3e2a19]/10 bg-white p-4 text-sm sm:p-5">
    <h3 className="font-semibold text-[#3e2a19]">Contacto del anunciante</h3>
    <dl className="mt-4 grid min-w-0 gap-3 text-[#5f574f]">
      <div><dt className="flex items-center gap-2 text-xs text-[#71685f]"><UserRound size={15} /> Responsable</dt><dd className="mt-1 break-words font-semibold">{profile?.responsibleName || (demo ? "Nombre del responsable · ejemplo" : sellerName)}</dd></div>
      {(profile?.farmName || demo) && <div><dt className="flex items-center gap-2 text-xs text-[#71685f]"><Tractor size={15} /> Finca o negocio</dt><dd className="mt-1 break-words">{profile?.farmName || "Nombre de la finca · opcional"}</dd></div>}
      <div><dt className="flex items-center gap-2 text-xs text-[#71685f]"><MapPin size={15} /> Ubicación</dt><dd className="mt-1 break-words">{location}</dd></div>
      {profile?.advertiserType && <div><dt className="text-xs text-[#71685f]">Tipo de anunciante</dt><dd>{profile.advertiserType}</dd></div>}
      {profile?.contactHours && <div><dt className="text-xs text-[#71685f]">Horario de contacto</dt><dd className="break-words">{profile.contactHours}</dd></div>}
      {profile?.deliveryMode && <div><dt className="text-xs text-[#71685f]">Entrega</dt><dd>{profile.deliveryMode}</dd></div>}
    </dl>
    {profile && !demo ? <div className="mt-4 grid gap-2">
      <a href={`tel:+${phoneDigits(profile.phone)}`} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#3e2a19] px-3 py-3 font-semibold text-white"><Phone size={17} /> <span className="break-all">{profile.phone}</span></a>
    </div> : <p className="mt-4 break-words rounded-xl bg-[#f3ebdd] p-3 text-xs leading-6">{demo ? "Teléfono del responsable · obligatorio al publicar. Esta muestra no contiene datos personales reales." : legacyListingContactText(contact) || "Este anuncio anterior no tiene un teléfono público registrado."}</p>}
    <div className="mt-4"><ListingWhatsAppContact productTitle={productTitle} contact={contact} contactProfile={contactProfile} demo={demo}/></div>
    {links.length > 0 && <nav aria-label="Redes y enlaces del anunciante" className="mt-4 grid gap-2 sm:grid-cols-2">{links.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex min-h-11 min-w-0 items-center justify-between gap-2 rounded-xl border border-[#3e2a19]/10 px-3 py-2 text-xs font-semibold text-[#365026]"><span>{label}</span><ExternalLink size={14} className="shrink-0" /></a>)}</nav>}
    {demo && <p className="mt-3 text-xs leading-5 text-[#71685f]">El anunciante podrá añadir sus redes sociales, Google Mi Negocio, horario y modalidad de entrega.</p>}
  </section>;
}
