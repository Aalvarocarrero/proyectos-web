import Link from "next/link";
import { sitePhotos, type SitePhotoId } from "@/lib/site-photos";
export function PhotoCredit({id,dark=true}:{id:SitePhotoId;dark?:boolean}) {
 const photo=sitePhotos.find(item=>item.id===id)!;
 return <Link href={`/creditos-fotograficos#${id}`} className={`mt-5 inline-block text-[.68rem] leading-5 underline decoration-current/40 underline-offset-4 ${dark?"text-white/70 hover:text-white":"text-[#71685f] hover:text-[#3e2a19]"}`}>Foto de contexto · {photo.geography} · {photo.author} · Créditos</Link>;
}
