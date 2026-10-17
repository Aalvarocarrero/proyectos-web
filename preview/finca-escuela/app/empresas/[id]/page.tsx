import {DirectoryReturnLink} from "@/components/directory-return-link";
import {notFound} from 'next/navigation';
import {SiteHeader} from '@/components/site-header';
import {PublicFooter} from '@/components/public-footer';
import {CompanyProfileView} from '@/components/company-profile-view';
import {veterinaryCompanyDemo} from '@/lib/company-demo';
import {findCompany} from '@/lib/company-db';
import {robotsPolicy} from '@/lib/indexing-policy';
export const dynamic='force-dynamic';
type Props={params:Promise<{id:string}>};
async function loadCompany(id:string){return id===veterinaryCompanyDemo.id?veterinaryCompanyDemo:findCompany(id);}
export async function generateMetadata({params}:Props){const c=await loadCompany((await params).id);return {title:c?`${c.name} · Empresas Venezuela Agro`:'Empresa no disponible',description:c?.description.slice(0,160),robots:robotsPolicy(!!c,!!c?.demo)};}
export default async function CompanyPage({params}:Props){const c=await loadCompany((await params).id);if(!c)notFound();return <main className="interior-page min-h-screen bg-[#f3ebdd]"><SiteHeader/><section className="mx-auto max-w-5xl px-5 pb-20 pt-32 sm:px-8"><DirectoryReturnLink href="/empresas" className="mb-6 inline-flex min-h-11 items-center text-sm font-semibold text-[#4c6b3a]">← Volver a Empresas</DirectoryReturnLink><article className="rounded-[2rem] bg-white p-5 sm:p-9"><CompanyProfileView company={c}/></article></section><PublicFooter/></main>;}
