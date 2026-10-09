import {decoratePublicMetadata} from "@/lib/indexing-policy";
import type {Metadata} from 'next';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {networkSnapshot} from '@/lib/community-network-db';
import {demoPublicFarms,demoPosts} from '@/lib/network-profile';
import {SecurityCenter} from '@/components/security-center';
import {AgroNetwork} from '@/components/agro-network';
import {SiteHeader} from '@/components/site-header';
import {PublicFooter} from '@/components/public-footer';
export const dynamic='force-dynamic';
export const metadata:Metadata=decoratePublicMetadata("/red",{title:'Comunidad del agro venezolano',description:'Una comunidad para compartir avances, cosechas, jornadas y oportunidades de las fincas de Venezuela.',alternates:{canonical:'/red'}});
export default async function Page(){const user=await getChatGPTUser();let snapshot;try{snapshot=await networkSnapshot(user?.id);}catch{snapshot={farms:[],mine:[],posts:[]};}return <main className="min-h-screen bg-[#f3ebdd]"><SiteHeader/><header className="bg-[#365026] px-5 pb-16 pt-36 text-white sm:px-8 lg:pt-44"><div className="mx-auto max-w-6xl"><p className="section-kicker text-[#b7d79a]">COMUNIDAD VENEZUELA AGRO</p><h1 className="font-display mt-4 max-w-4xl text-5xl leading-tight sm:text-7xl">El campo tiene mucho que contar.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">Publicaciones breves, fincas visibles y conversaciones que ayudan a producir mejor. Comparte avances, encuentra oportunidades y conecta con otros productores.</p></div></header><section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">{user&&<SecurityCenter mode="gate" requirePublic/>}<AgroNetwork userId={user?.id} name={user?.displayName} initial={{...snapshot,farms:[...snapshot.farms,...demoPublicFarms],posts:[...snapshot.posts,...demoPosts]}}/></section><PublicFooter/></main>;}
