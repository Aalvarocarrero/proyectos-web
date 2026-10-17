import {SHARE_PHOTO_REPLACEMENTS} from './share-photo-replacements';
import {productPhotos} from './product-photos';
import {sitePhotos} from './site-photos';
import marketPhotos from './market-example-photos.json';
import inventoryPhotos from './inventory-example-photos.json';

export type SocialImageCredit = {author: string; license: string; source: string; licenseUrl: string; changes?: string};
export type SocialImageContent = {
  id: string; title: string; category: string; description?: string; detail?: string;
  path: string; demo?: boolean;
  publicContact?: {name: string; phone?: string}; facts?: string[];
  photo?: {src: string; alt: string; fit?: 'contain' | 'cover'; caption?: string; creditHref?: string; credit?: SocialImageCredit};
};
export const socialImageFormats = [
  {id: 'instagram-feed', label: 'Cuadrada · publicación', width: 1080, height: 1080},
  {id: 'instagram-story', label: 'Vertical · historia', width: 1080, height: 1920},
  {id: 'facebook', label: 'Horizontal · publicación', width: 1200, height: 630},
  {id: 'whatsapp-status', label: 'WhatsApp · estado', width: 1080, height: 1920},
] as const;
export type SocialImageFormat = typeof socialImageFormats[number];
export function socialImageFilename(content: SocialImageContent, format: SocialImageFormat) {
  return `venezuela-agro-${content.id.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 100) || 'imagen'}-${format.id}.png`;
}
export function socialImageCredit(photo?: SocialImageContent['photo']): SocialImageCredit | undefined {
  if (!photo) return undefined;
  if (photo.credit) return photo.credit;
  const known = [...productPhotos, ...sitePhotos, ...marketPhotos].find(row => row.src === photo.src);
  if (known) return known;
  const inventory = inventoryPhotos.items.find(row => row.src === photo.src);
  if (inventory) return {author: inventory.author, license: inventory.license, source: inventory.source_url, licenseUrl: inventory.license_url};
  if (photo.src === '/photo-cacao.webp') return {author: 'Fotografía de contexto · Pexels', license: 'Licencia Pexels', source: 'https://www.pexels.com/search/cocoa%20farm/', licenseUrl: 'https://www.pexels.com/license/'};
  return undefined;
}
/** Remove links from pixels only. The original data/link and on-page credits are unchanged. */
export function withoutImageUrls(value: string): string {
  const contacts: string[] = [];
  // Preserve ordinary contact text; only the mailto/tel protocol wrapper is removed.
  const protectedText = value.replace(/mailto:([^\s<>]+)/giu, '$1').replace(/tel:([+\d(). -]+)/giu, '$1')
    .replace(/[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,63}/giu, email => `\uE000${contacts.push(email) - 1}\uE001`);
  return protectedText
    .replace(/(?:https?:\/\/|ftp:\/\/|www\.)[^\s<>()\[\]]+/giu, '')
    .replace(/(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?\.)+[\p{L}]{2,63}(?::\d{1,5})?(?:[/?#][^\s<>]*)?/giu, '')
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}(?::\d{1,5})?(?:[/?#][^\s<>()\[\]]*)?/g, '')
    .replace(/\(\s*\)|\[\s*\]/g, '')
    .replace(/\uE000(\d+)\uE001/g, (_, index: string) => contacts[Number(index)] || '')
    .replace(/[ \t]{2,}/g, ' ').replace(/^[ \t]+|[ \t]+$/gm, '').trim();
}
/** No metadata-only substitute: native apps may strip metadata and accompanying captions. */
export function urlFreeSocialPhoto(photo?: SocialImageContent['photo']): {photo?: SocialImageContent['photo']; omitted: boolean; replacement?: 'photo' | 'illustration'} {
  if (!photo) return {omitted: false};
  const alternate = SHARE_PHOTO_REPLACEMENTS[photo.src];
  if (alternate) return {photo: alternate, omitted: false, replacement: alternate.kind};
  const credit = socialImageCredit(photo);
  // These documented licenses do not require source/license links for this use.
  const permitsLinkFree = credit && /^(?:CC0(?:\s|$)|Public domain(?:\s|$)|Licencia Pexels$)/i.test(credit.license);
  if ((credit && !permitsLinkFree) || (!credit && photo.creditHref)) return {omitted: true};
  return {photo, omitted: false};
}
/** Export pixels intentionally contain no source/license credits. Eligibility is checked first. */
export function socialImageAttribution(photo?: SocialImageContent['photo']): string[] { void photo; return []; }
export function safeSocialImageSource(src: string, origin: string): string {
  if (/^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(src)) return src;
  const source = new URL(src, origin);
  if (source.origin !== origin || !/^https?:$/.test(source.protocol)) throw new Error('same_origin_image_required');
  return source.href;
}
export function wrapImageText(ctx: Pick<CanvasRenderingContext2D, 'measureText'>, text: string, width: number): string[] {
  const rows: string[] = [];
  for (const paragraph of text.split('\n')) {
    let row = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      if (row && ctx.measureText(`${row} ${word}`).width > width) { rows.push(row); row = ''; }
      // URLs and unbroken user text must not overflow; credit URLs are never truncated.
      for (const char of (row ? ` ${word}` : word)) {
        if (row && ctx.measureText(row + char).width > width) { rows.push(row); row = ''; }
        row += char;
      }
    }
    if (row) rows.push(row);
  }
  return rows;
}
function abortError() { return new DOMException('Image preparation cancelled', 'AbortError'); }
async function loadImage(src: string, signal?: AbortSignal): Promise<HTMLImageElement> {
  if (signal?.aborted) throw abortError();
  return new Promise((resolve, reject) => {
    const image = new Image();
    const cleanup = () => { clearTimeout(timer); signal?.removeEventListener('abort', cancel); image.onload = null; image.onerror = null; };
    const cancel = () => { cleanup(); image.src = ''; reject(abortError()); };
    const timer = setTimeout(() => { cleanup(); image.src = ''; reject(new Error('image_timeout')); }, 15000);
    image.onload = () => { cleanup(); if (image.naturalWidth) resolve(image); else reject(new Error('image_unavailable')); };
    image.onerror = () => { cleanup(); reject(new Error('image_unavailable')); };
    signal?.addEventListener('abort', cancel, {once: true});
    image.src = src;
  });
}
export async function buildSocialImage(content: SocialImageContent, format: SocialImageFormat, signal?: AbortSignal): Promise<Blob> {
  const selection = urlFreeSocialPhoto(content.photo);
  // Never silently replace a photograph with an empty/text-only card.
  if (selection.omitted) throw new Error('share_photo_needs_replacement');
  const image = selection.photo ? await loadImage(safeSocialImageSource(selection.photo.src, location.origin), signal) : undefined;
  if (signal?.aborted) throw abortError();
  const canvas = document.createElement('canvas');
  canvas.width = format.width; canvas.height = format.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas_unavailable');
  const w = canvas.width, h = canvas.height, pad = 42, wide = h < 800;
  const photoW = wide ? 420 : w, photoH = image ? (wide ? h : Math.round(h * (h > w ? .40 : .31))) : 0;
  ctx.fillStyle = '#f3ebdd'; ctx.fillRect(0, 0, w, h);
  if (image) {
    const scale = selection.photo?.fit === 'contain' ? Math.min(photoW / image.naturalWidth, photoH / image.naturalHeight) : Math.max(photoW / image.naturalWidth, photoH / image.naturalHeight);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, photoW, photoH); ctx.clip();
    ctx.drawImage(image, (photoW - image.naturalWidth * scale) / 2, (photoH - image.naturalHeight * scale) / 2, image.naturalWidth * scale, image.naturalHeight * scale); ctx.restore();
  }
  const x = wide && image ? photoW + 30 : pad, width = w - x - pad;
  const footerH = 112, contentBottom = h - footerH - 18;
  let y = image && !wide ? photoH + 37 : 38, shortened = false;
  const draw = (text: string | undefined, font: string, lineHeight: number, max: number, color: string, gap = 10) => {
    if (!text) return;
    const cleaned = withoutImageUrls(text);
    if (!cleaned) return;
    ctx.font = font; ctx.fillStyle = color;
    const all = wrapImageText(ctx, cleaned, width), count = Math.max(0, Math.min(max, Math.floor((contentBottom - y) / lineHeight) + 1));
    const rows = all.slice(0, count);
    if (all.length > rows.length) { shortened = true; if (rows.length) rows[rows.length - 1] = rows[rows.length - 1].slice(0, -2) + '…'; }
    for (const row of rows) {ctx.fillText(row, x, y); y += lineHeight;}
    if (rows.length) y += gap;
  };
  draw('VENEZUELA AGRO', 'bold 23px sans-serif', 29, 1, '#4c6b3a', 5);
  draw(content.category, '18px sans-serif', 24, 1, '#655c51', 14);
  draw(content.title, `bold ${wide ? 32 : 38}px sans-serif`, wide ? 38 : 45, 2, '#3e2a19', 12);
  draw(content.detail, 'bold 24px sans-serif', 30, 2, '#4c6b3a', 12);
  // Public contacts are allocated before the layout-safe description excerpt.
  draw(content.publicContact?.name ? `Publicado por: ${content.publicContact.name}` : undefined, 'bold 22px sans-serif', 29, 2, '#3e2a19', 7);
  if (!content.demo && content.publicContact?.phone) draw(`Teléfono: ${content.publicContact.phone}`, 'bold 26px sans-serif', 34, 1, '#365026', 14);
  // Keep a useful description visible before optional attributes.
  const remainingLines = Math.max(1, Math.floor((contentBottom - y) / 29));
  draw(content.description, `${wide ? 21 : 23}px sans-serif`, 29, Math.min(content.facts?.length ? 4 : 9, remainingLines), '#655c51', 12);
  if (content.facts?.length) draw(content.facts.join(' · '), '20px sans-serif', 27, 4, '#655c51');
  ctx.fillStyle = '#e8efdf'; ctx.fillRect(0, h - footerH, w, footerH);
  ctx.fillStyle = '#3e2a19'; ctx.font = 'bold 19px sans-serif';
  ctx.fillText(content.demo ? 'DEMOSTRACIÓN · Datos ficticios · Sin oferta real' : 'Consulta disponibilidad y condiciones con el anunciante', pad, h - footerH + 32, w - pad * 2);
  ctx.fillStyle = '#655c51'; ctx.font = '18px sans-serif';
  if (shortened) ctx.fillText('Texto resumido para este formato. Consulta la ficha completa.', pad, h - footerH + 63, w - pad * 2);
  if (selection.replacement || socialImageCredit(content.photo)) ctx.fillText(selection.replacement === 'illustration' ? 'Ilustración de referencia; no representa un producto real.' : 'Fotografía de referencia; confirma la presentación y características.', pad, h - footerH + 91, w - pad * 2);
  if (signal?.aborted) throw abortError();
  return new Promise((resolve, reject) => canvas.toBlob(blob => {
    if (signal?.aborted) reject(abortError());
    else if (blob?.size) resolve(blob); else reject(new Error('image_export_failed'));
  }, 'image/png'));
}
