import {Globe} from 'lucide-react';
import {InstagramIcon,TikTokIcon,FacebookIcon,YouTubeIcon} from '@/components/brand-icons';
import {publicSocialFields,socialSchema} from '@/lib/network-profile';
const icons={instagram:InstagramIcon,tiktok:TikTokIcon,facebook:FacebookIcon,youtube:YouTubeIcon,website:Globe};
export function ProfileSocials({socials,demo=false}:{socials:Record<string,string>;demo?:boolean}){
 const safe=Object.fromEntries(publicSocialFields.map(([key])=>{const result=socialSchema.safeParse({[key]:socials[key]||''});return [key,result.success?result.data[key]:''];}));
 return <div className="flex flex-wrap gap-2">{publicSocialFields.filter(([key])=>demo||safe[key]).map(([key,label])=>{const Icon=icons[key as keyof typeof icons];return demo?<span key={key} title={`${label} · ejemplo sin enlace`} className="flex min-h-11 items-center gap-2 rounded-xl border px-3 text-xs text-[#71685f]"><Icon className="size-4"/>{label}</span>:<a key={key} href={safe[key]} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm"><Icon className="size-4"/>{label}</a>})}</div>;
}
