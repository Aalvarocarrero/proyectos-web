import html from '../../server/admin.html?raw';
export const dynamic='force-dynamic';
export function GET() { return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Frame-Options':'SAMEORIGIN','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; img-src 'self' blob:; style-src 'self'; script-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com"}}); }
