import type { SVGProps } from "react";

type BrandIconProps = SVGProps<SVGSVGElement> & { title?: string };

function BrandIcon({ title, children, ...props }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : undefined} {...props}>
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function InstagramIcon(props: BrandIconProps) {
  return <BrandIcon {...props}><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" /></BrandIcon>;
}

export function TikTokIcon(props: BrandIconProps) {
  return <BrandIcon {...props}><path d="M14.2 3v11.1a4.6 4.6 0 1 1-3.5-4.46v3.02a1.7 1.7 0 1 0 .7 1.44V3h2.8Zm0 0c.35 2.25 1.75 3.72 4.3 4.15v3.02a8.34 8.34 0 0 1-4.3-1.58" stroke="currentColor" strokeWidth="2.15" strokeLinecap="round" strokeLinejoin="round" /></BrandIcon>;
}

export function FacebookIcon(props: BrandIconProps) {
  return <BrandIcon {...props}><path d="M13.7 21v-8h2.75l.42-3.15H13.7V7.83c0-.91.26-1.53 1.58-1.53H17V3.5a23.5 23.5 0 0 0-2.45-.13c-2.43 0-4.1 1.46-4.1 4.16v2.32H7.7V13h2.75v8h3.25Z" fill="currentColor" /></BrandIcon>;
}

export function YouTubeIcon(props: BrandIconProps) {
  return <BrandIcon {...props}><path d="M21.2 7.15a2.55 2.55 0 0 0-1.8-1.8C17.82 4.92 12 4.92 12 4.92s-5.82 0-7.4.43a2.55 2.55 0 0 0-1.8 1.8A26.5 26.5 0 0 0 2.37 12a26.5 26.5 0 0 0 .43 4.85 2.55 2.55 0 0 0 1.8 1.8c1.58.43 7.4.43 7.4.43s5.82 0 7.4-.43a2.55 2.55 0 0 0 1.8-1.8c.43-1.58.43-4.85.43-4.85s0-3.27-.43-4.85Z" fill="currentColor" /><path d="m10 15.1 5-3.1-5-3.1v6.2Z" fill="currentColor" className="text-[#211d1a]" /></BrandIcon>;
}

export function ThreadsIcon(props: BrandIconProps) {
  return <BrandIcon {...props}><path d="M19.2 7.4C18.3 3.9 15.7 2.5 12 2.5c-5.6 0-8.5 3.5-8.5 9.5s2.9 9.5 8.5 9.5c4.1 0 7.4-2.1 7.4-5.7 0-3.2-2.6-5.1-6.4-5.1-2.8 0-4.3 1.1-4.3 2.9 0 1.6 1.3 2.6 3.1 2.6 2.8 0 4.3-2 4.3-5.3 0-3.1-1.5-4.8-4.2-4.8-1.8 0-3.1.8-3.7 2.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></BrandIcon>;
}
