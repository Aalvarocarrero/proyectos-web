import {FIELDS,DEFAULT_CONTENT} from './content-fields.mjs';
import {validateContent} from './content-service.mjs';
export const escapeHtml = value => String(value).replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const escapePattern = value => value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
/** Modify only explicit homepage slots. Unchanged fields preserve the original rich typography. */
export function renderContent(html,content,language,origin) {
 const valid=validateContent(content);
 for(const field of FIELDS.filter(field=>field.lang===language)) {
  const value=valid[field.key];
  if(value===DEFAULT_CONTENT[field.key])continue;
  const text=escapeHtml(value);
  if(field.slot==='seo.title')html=html.replace(/<title>[^]*?<\/title>/,()=>`<title>${text}</title>`);
  else if(field.slot==='seo.description')html=html.replace(/<meta name="description" content="[^"]*">/,()=>`<meta name="description" content="${text}">`);
  else if(field.slot==='seo.socialTitle')html=html.replace(/<meta property="og:title" content="[^"]*">/,()=>`<meta property="og:title" content="${text}">`);
  else if(field.slot==='seo.socialDescription')html=html.replace(/<meta property="og:description" content="[^"]*">/,()=>`<meta property="og:description" content="${text}">`);
  else if(field.slot==='seo.image')html=html.replace(/<meta property="og:image" content="[^"]*">/,()=>`<meta property="og:image" content="${escapeHtml(origin+value)}">`);
  else if(field.slot==='about.image'||field.slot==='about.imageAlt') {
   const attribute=field.slot==='about.image'?'src':'alt';
   html=html.replace(/<img data-content-image="about.image"[^>]*>/,tag=>tag.replace(new RegExp(`${attribute}="[^"]*"`),()=>`${attribute}="${text}"`));
  } else {
   const pattern=new RegExp(`(<(h1|h2|p)[^>]* data-content-field="${escapePattern(field.slot)}"[^>]*>)[^]*?(<\\/\\2>)`);
   html=html.replace(pattern,(_whole,open,_tag,close)=>open+text.replace(/\n/g,'<br>')+close);
  }
 }
 return html;
}
export function previewDocument(html,version,language) {
 const label=language==='en'?`Private draft · version ${version}. Changes are not published.`:`Borrador privado · versión ${version}. Los cambios no están publicados.`;
 return html.replace(/<meta name="robots"[^>]*>/g,'<meta name="robots" content="noindex,nofollow,noarchive">').replace('<body>',`<body><aside aria-label="Vista previa privada" style="position:relative;z-index:999;background:#262f2a;color:#fff;padding:16px;text-align:center;font:14px system-ui">${label} <a href="/admin" style="color:#fff;text-decoration:underline">Volver al panel</a></aside>`);
}
