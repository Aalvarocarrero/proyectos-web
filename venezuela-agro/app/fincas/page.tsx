import {decoratePublicMetadata} from "@/lib/indexing-policy";
import { PhotoCredit } from "@/components/photo-credit";
import type {Metadata} from 'next';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {networkSnapshot} from '@/lib/community-network-db';
import {demoPublicFarms,demoPosts} from '@/lib/network-profile';
import {AgroNetwork} from '@/components/agro-network';
import {SiteHeader} from '@/components/site-header';
import {PublicFooter} from '@/components/public-footer';
export const dynamic='force-dynamic';
export const metadata:Metadata=decoratePublicMetadata("/fincas",{title:'Directorio de fincas de Venezuela',description:'Conoce fincas por estado, producción, productos, visitas y capacitaciones. Registra tu ficha pública y conecta con Mercado Agro.',alternates:{canonical:'/fincas'}});
export default async function Page(){const user=await getChatGPTUser();let snapshot;try{snapshot=await networkSnapshot(user?.id);}catch{snapshot={farms:[],mine:[],posts:[]};}return <main className="min-h-screen bg-[#f3ebdd]"><SiteHeader/><header className="hero-photo-farms bg-[#211d1a] px-5 pb-16 pt-36 text-white sm:px-8 lg:pt-44"><div className="mx-auto max-w-6xl"><p className="section-kicker text-[#b7d79a]">FINCAS DE VENEZUELA</p><h1 className="font-display mt-4 max-w-4xl text-5xl leading-tight sm:text-7xl">Registra tu finca. Abre nuevas oportunidades.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">Un directorio para presentar tu producción, ofrecer productos y coordinar visitas y capacitaciones. Tu información privada permanece en Mi Finca.</p><PhotoCredit id="campo-merida" /></div></header><section className="mx-auto max-w-6xl px-5 py-12 sm:px-8"><AgroNetwork directory userId={user?.id} name={user?.displayName} initial={{...snapshot,farms:[...snapshot.farms,...demoPublicFarms],posts:[...snapshot.posts,...demoPosts]}}/></section><PublicFooter/></main>;}
