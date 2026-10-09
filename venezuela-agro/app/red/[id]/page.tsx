import { robotsPolicy } from "@/lib/indexing-policy";
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {demoPosts,demoPublicFarms,type PublicFarm,type SocialPost} from '@/lib/network-profile';
import {getPublicPost} from '@/lib/community-network-db';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {AgroNetwork} from '@/components/agro-network';
import {SiteHeader} from '@/components/site-header';
import {PublicFooter} from '@/components/public-footer';
export const dynamic='force-dynamic';
type Props={params:Promise<{id:string}>};
async function find(id:string,viewerId?:string):Promise<{farm:PublicFarm;post:SocialPost}|undefined>{const post=demoPosts.find(p=>p.id===id);if(post){const farm=demoPublicFarms.find(f=>f.id===post.farmId)!;return {post,farm};}return getPublicPost(id,viewerId);}
export async function generateMetadata({params}:Props):Promise<Metadata>{const item=await find((await params).id);return item?{robots:robotsPolicy(true,!!item.post.demo),title:`${item.farm.name} · Comunidad`,description:item.post.text.slice(0,160),alternates:{canonical:`/red/${item.post.id}`},openGraph:{title:item.farm.name,description:item.post.text.slice(0,160),type:'article'}}:{};}
export default async function Page({params}:Props){const user=await getChatGPTUser();const item=await find((await params).id,user?.id);if(!item)notFound();return <main className="min-h-screen bg-[#f3ebdd]"><SiteHeader/><section className="mx-auto max-w-4xl px-5 pb-16 pt-36 sm:px-8"><h1 className="font-display mb-8 text-3xl">Una publicación desde {item.farm.name}</h1><AgroNetwork cacheScope={`post:${item.post.id}`} userId={user?.id} name={user?.displayName} initial={{farms:[item.farm],mine:[],posts:[item.post]}}/></section><PublicFooter/></main>;}
