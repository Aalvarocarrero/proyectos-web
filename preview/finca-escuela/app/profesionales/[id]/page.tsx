import {DirectoryReturnLink} from "@/components/directory-return-link";
import { robotsPolicy } from "@/lib/indexing-policy";
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findProfessional } from '@/lib/professional-db';
import { professionalSeo,professionalImage,professionalDetails } from '@/lib/professional-profile';
import { ProfessionalProfileView } from '@/components/professional-profile-view';
import { SiteHeader } from '@/components/site-header';
import { PublicFooter } from '@/components/public-footer';
export const dynamic='force-dynamic';
type Props={params:Promise<{id:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata> {
 const p=await findProfessional((await params).id);if(!p)return {title:'Perfil no disponible',robots:{index:false}};
 const seo=professionalSeo(p),image=professionalImage(p);
 return { ...seo, alternates:{canonical:`/profesionales/${p.id}`},robots:robotsPolicy(true,!!p.demo),openGraph:{title:seo.title,description:seo.description,type:'profile',images:image?[{url:image,alt:`Fotografía de ${p.name}`}]:[]},twitter:{card:image?'summary_large_image':'summary',title:seo.title,description:seo.description} };
}
export default async function ProfessionalPage({params}:Props) {
 const p=await findProfessional((await params).id);if(!p)notFound();
 const d=professionalDetails(p),seo=professionalSeo(p);
 const jsonLd={'@context':'https://schema.org','@type':'ProfilePage',name:seo.title,description:seo.description,mainEntity:{'@type':d.profileType==='Empresa'?'Organization':'Person',name:d.corporateName||p.name,jobTitle:p.profession,description:p.introduction,image:professionalImage(p)||undefined,knowsAbout:seo.keywords,alumniOf:d.university?{'@type':'CollegeOrUniversity',name:d.university}:undefined,hasOccupation:{'@type':'Occupation',name:p.profession,occupationLocation:[p.state,...d.coverageStates].map(name=>({'@type':'AdministrativeArea',name}))},sameAs:[...Object.values(d.socials),d.linkedin,d.instagram,d.website].filter(Boolean)}};
 return <main className="interior-page min-h-screen bg-[#f3ebdd]"><SiteHeader/><section className="mx-auto max-w-4xl px-5 pb-16 pt-32 sm:px-8"><DirectoryReturnLink href="/profesionales" className="mb-6 inline-block min-h-11 text-sm font-semibold text-[#4c6b3a]">← Volver a profesionales</DirectoryReturnLink><h1 className="sr-only">{p.name} · {p.profession}</h1><article className="min-w-0 rounded-3xl bg-white p-5 sm:p-9"><ProfessionalProfileView profile={p}/></article>{!p.demo&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,'\\u003c')}}/>}</section><PublicFooter/></main>;
}
