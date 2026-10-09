import {ProfileSocials} from "@/components/profile-socials";
import {publicSocialFields} from "@/lib/network-profile";
import { MapPin, Phone, Mail, GraduationCap, BriefcaseBusiness, ArrowUpRight } from "lucide-react";
import { professionalDetails, professionalCredential, professionalKeywords, professionalImage, type ProfessionalRecord } from "@/lib/professional-profile";
import { phoneDigits } from "@/lib/listing-contact";

export function ProfessionalProfileView({profile:p}:{profile:ProfessionalRecord}) {
 const d=professionalDetails(p), image=professionalImage(p);
 const sections=[['Reservas y proceso de atención',d.bookingProcess],['Horarios y disponibilidad',d.availability],['Servicios que ofrece',d.services],['Trayectoria',d.trajectory],['Proyectos y participación',d.projects],['Formación complementaria',d.training]];
 const phone=/^[+\d\s().-]+$/.test(p.contact)&&phoneDigits(p.contact).length>=7;
 return <div className="min-w-0 [overflow-wrap:anywhere]">
  {p.demo && <p className="mb-5 rounded-xl bg-[#eadfcd] p-4 text-sm leading-6">Perfil ficticio de demostración. Todos los datos, formación, experiencia y proyectos son inventados. Imagen generada por IA · perfil 100 % ficticio. No permite contratar ni contactar a una persona real.</p>}
  <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
   {image?<img src={image} alt={p.demo?`Retrato generado por IA de ${p.name}; identidad ficticia`:`Fotografía de ${p.name}`} width={160} height={160} loading="lazy" className="size-28 shrink-0 rounded-2xl object-cover sm:size-40"/>:<div aria-label="Sin fotografía de perfil" className="flex size-28 shrink-0 items-center justify-center rounded-2xl bg-[#e8f0df] text-3xl font-bold text-[#365026]">{p.founder?'AC':<BriefcaseBusiness size={40}/>}</div>}
   <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wider text-[#4c6b3a]">{p.demo?'Muestra de la plataforma':p.founder?'Perfil fundador':'Perfil publicado'}</p><h2 className="mt-2 break-words text-2xl font-bold sm:text-3xl">{p.name}</h2><p className="mt-2 break-words font-semibold text-[#4c6b3a]">{p.profession}</p><p className="mt-2 flex items-start gap-2 text-sm"><MapPin size={16} className="mt-1 shrink-0"/>{[p.municipality,p.state].filter(Boolean).join(', ')}</p></div>
  </div>
  {d.profileType==="Empresa"&&<section className="mt-6 rounded-2xl border bg-white p-5"><h3 className="font-bold">Empresa · {d.tradeName||d.corporateName}</h3><p className="mt-2 text-sm">Razón social: {d.corporateName}</p>{d.responsibleName&&<p className="mt-2 text-sm">Responsable: {d.responsibleName}</p>}{[d.taxId,d.registrationBody,d.registrationReference].filter(Boolean).length>0&&<p className="mt-2 break-words text-sm">Registro declarado: {[d.taxId,d.registrationBody,d.registrationReference].filter(Boolean).join(" · ")}</p>}<p className="mt-3 text-xs">Datos declarados por la empresa; no representan una verificación registral.</p></section>}
  <p className="mt-6 whitespace-pre-line break-words text-base leading-7 text-[#5f574f]">{p.introduction}</p>
  <dl className="mt-6 grid gap-4 rounded-2xl bg-[#f3ebdd] p-5 sm:grid-cols-2">
   <div><dt className="text-xs text-[#71685f]">Modalidad de atención</dt><dd className="mt-1 font-semibold">{p.serviceMode}</dd></div>
   <div><dt className="text-xs text-[#71685f]">Etapa profesional</dt><dd className="mt-1 font-semibold">{d.careerStage}{!p.founder && ` · ${d.yearsExperience===0?'Inicio de trayectoria':`${d.yearsExperience} años de experiencia`}`}</dd></div>
   <div className="sm:col-span-2"><dt className="text-xs text-[#71685f]">Estados de cobertura</dt><dd className="mt-1 break-words font-semibold">{[p.state,...d.coverageStates].filter((x,i,a)=>a.indexOf(x)===i).join(' · ')}</dd></div>
  </dl>
  <section className="mt-7"><h3 className="flex items-center gap-2 text-lg font-bold"><GraduationCap size={21}/> Formación académica</h3><p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-[#5f574f]">{[d.degree,d.university,d.graduationYear&&`Año de graduación: ${d.graduationYear}`].filter(Boolean).join('\n')||'Formación por completar por el profesional.'}</p>{professionalCredential(p)&&<p className="mt-3 break-words text-sm leading-6">Respaldo declarado: {professionalCredential(p)}</p>}<p className="mt-2 text-xs text-[#71685f]">La publicación del perfil no equivale a certificar títulos ni habilitaciones.</p></section>
  {sections.map(([title,text])=><section key={title} className="mt-7"><h3 className="text-lg font-bold">{title}</h3><p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-[#5f574f]">{text||'El profesional podrá completar esta información.'}</p></section>)}
  <section className="mt-7"><h3 className="text-lg font-bold">Especialidades y rubros</h3><div className="mt-3 flex flex-wrap gap-2">{professionalKeywords(p).map(tag=><span key={tag} className="max-w-full break-words rounded-full bg-[#e8f0df] px-3 py-2 text-xs font-semibold text-[#365026]">{tag}</span>)}</div></section>
  {p.demo&&d.profileType==="Persona natural"&&<p className="mt-6 text-xs leading-6 text-[#71685f]">Razón social, nombre comercial y RIF de empresa: no aplican a esta persona ficticia. Registro profesional de ejemplo: {d.registrationBody} · {d.registrationReference}. No constituye una habilitación real.</p>}
  <section className="mt-7"><h3 className="mb-3 text-lg font-bold">Redes y sitio web</h3><ProfileSocials socials={{...d.socials,instagram:d.socials.instagram||d.instagram,website:d.socials.website||d.website}} demo={p.demo}/></section>
  <section className="mt-8 rounded-2xl border border-[#3e2a19]/10 p-5"><h3 className="text-lg font-bold">Contactar al profesional</h3>{p.demo?<p className="mt-3 text-sm leading-6 text-[#71685f]">Contactos de demostración, sin enlaces operativos: {p.contact}. Correo de ejemplo: {d.email||"No disponible en esta muestra"}. No envíes solicitudes a estos datos.</p>:<div className="mt-4 grid gap-3 sm:grid-cols-2">
   {phone?<a className="button-dark min-w-0 break-all" href={`tel:+${phoneDigits(p.contact)}`}><Phone size={16}/>{p.contact}</a>:p.contact?<p className="break-words rounded-xl bg-[#f3ebdd] p-3 text-sm">{p.contact}</p>:null}
   {phone&&d.whatsapp&&<a className="button-light" href={`https://wa.me/${phoneDigits(p.contact)}`} target="_blank" rel="noopener noreferrer">WhatsApp <ArrowUpRight size={16}/></a>}
   {d.email&&<a className="flex min-h-11 min-w-0 items-center gap-2 break-all rounded-xl bg-[#f3ebdd] p-3 text-sm" href={`mailto:${d.email}`}><Mail size={16} className="shrink-0"/>{d.email}</a>}
   {publicSocialFields.map(([key,label])=>[label,d.socials[key]||(key==="instagram"?d.instagram:key==="website"?d.website:"")]).filter(([,url])=>url).map(([label,url])=><a key={label} className="button-light" href={url} target="_blank" rel="noopener noreferrer">{label}<ArrowUpRight size={16}/></a>)}
  </div>}</section>
 </div>;
}
