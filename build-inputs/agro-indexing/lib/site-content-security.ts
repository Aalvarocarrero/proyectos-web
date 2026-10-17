import {agroAnalyticsPage} from './agro-analytics-policy';
/** Owner approved these exact hosts on 7 Oct2026. Private/preview routes keep self-only networking. */
export function siteContentSecurityPolicy(url:URL){
 const turnstile=url.pathname==="/auth/signin"?" https://challenges.cloudflare.com":"";
 const googleForm=url.pathname==="/auth/signin"||url.pathname==="/api/auth/google/start"?" https://accounts.google.com":"";
 const analytics=agroAnalyticsPage(url)!==null;
 const tag=analytics?' https://www.googletagmanager.com':'';
 const satellite=/^\/(?:app(?:-local)?|finca-demo)(?:\/|$)/.test(url.pathname)||/^\/assets\/satellite-zone-worker-[A-Za-z0-9_-]+\.js$/.test(url.pathname);
 const imagery=satellite?' https://earth-search.aws.element84.com https://e84-earth-search-sentinel-data.s3.us-west-2.amazonaws.com':'';
 const collection=analytics?' https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com':'';
 return `default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self' mailto:${googleForm}; object-src 'none'; img-src 'self' data: blob:${collection}; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'${tag}${turnstile}; frame-src 'self'${turnstile}; connect-src 'self'${collection}${imagery}; manifest-src 'self'; worker-src 'self' blob:; upgrade-insecure-requests`;
}
