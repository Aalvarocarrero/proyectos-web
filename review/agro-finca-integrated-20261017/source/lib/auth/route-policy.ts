/** Standalone public access is allowlisted. Unknown routes and every data mutation require a session. */
const PUBLIC_PAGES = new Set([
  '/', '/tienda', '/stickers', '/plataforma', '/aprende', '/rubros', '/fincas', '/empresas',
  '/profesionales', '/proyectos', '/red', '/marketplace', '/nosotros', '/guia-institucional',
  '/legal/privacidad', '/legal/terminos', '/legal/comercio', '/creditos-fotograficos',
  '/app-local', '/offline', '/biblioteca-local', '/finca-demo', '/finca-modelo', '/modelos-finca', '/juego-finca',
  '/robots.txt', '/sitemap.xml', '/manifest.webmanifest', '/offline-assets.json', '/offline-library-assets.json', '/sw.js',
]);
const PUBLIC_READ_APIS = new Set(['/api/marketplace', '/api/community', '/api/red', '/api/companies', '/api/exchange-rates', '/api/offline-public']);
export function isAdminPath(path: string): boolean {
  return /^\/(?:admin|api\/admin)(?:\/|$)/.test(path);
}
export function isPublicProductionRequest(request: Request): boolean {
  if (!['GET', 'HEAD'].includes(request.method)) return false;
  const url = new URL(request.url), path = url.pathname;
  if (isAdminPath(path) || /^\/(?:app|marketplace\/publicar|empresas\/registro)(?:\/|$)/.test(path)) return false;
  if (PUBLIC_PAGES.has(path)) return true;
  if (/^\/(?:aprende|marketplace|fincas|empresas|profesionales|red)\/[A-Za-z0-9_-]+$/.test(path)) return true;
  // These handlers separately filter published records. Private media is checked by owner/admin in the handler.
  if (/^\/api\/(?:media|home-media)\//.test(path)) return true;
  if (PUBLIC_READ_APIS.has(path)) return !(path === '/api/companies' && url.searchParams.getAll('mine').includes('1'));
  // Assets are public source files, never database uploads. No arbitrary .html exemption or API suffix bypass.
  if (/^\/(?:assets|_next|licenses|sticker-packs|inventory-examples|share-photos|map-packs|plan-vegetation|profiles|plan-oblique|guias|products|map-context|learning|institutions|previews|examples|farm-3d|satellite-packs|icons|photos|company-examples)\//.test(path)) return true;
  return /^\/[A-Za-z0-9_-]+\.(?:avif|webp|png|jpg|jpeg|svg|ico|geojson)$/.test(path);
}

/** Audited offline documents never embed a server account. Session controls fetch separately, no-store. */
const ACCOUNT_AGNOSTIC_PAGES = new Set(['/', '/tienda', '/plataforma', '/aprende', '/stickers', '/rubros', '/nosotros', '/guia-institucional', '/creditos-fotograficos', '/legal/privacidad', '/legal/terminos', '/legal/comercio', '/app-local', '/offline', '/biblioteca-local', '/finca-demo', '/finca-modelo', '/modelos-finca', '/juego-finca']);
export function isAccountAgnosticPage(path: string): boolean {
  return ACCOUNT_AGNOSTIC_PAGES.has(path) || /^\/aprende\/[A-Za-z0-9_-]+$/.test(path);
}
