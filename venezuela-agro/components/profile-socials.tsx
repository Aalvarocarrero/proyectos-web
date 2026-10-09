import {Globe} from 'lucide-react';
import {InstagramIcon,TikTokIcon,FacebookIcon,YouTubeIcon} from '@/components/brand-icons';
import {publicSocialFields} from '@/lib/network-profile';
const icons={instagram:InstagramIcon,tiktok:TikTokIcon,facebook:FacebookIcon,youtube:YouTubeIcon,website:Globe};
export function ProfileSocials({socials,demo=false}:{socials:Record<string,string>;demo?:boolean}){
 return <div className="flex flex-wrap gap-2">{publicSocialFields.filter(([key])=>demo||socials[key]).map(([key,label])=>{const Icon=icons[key as keyof typeof icons];return demo?<span key={key} title={`${label} · ejemplo sin enlace`} className="flex min-h-11 items-center gap-2 rounded-xl border px-3 text-xs text-[#71685f]"><Icon className="size-4"/>{label}</span>:<a key={key} href={socials[key]} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm"><Icon className="size-4"/>{label}</a>})}</div>;
}
