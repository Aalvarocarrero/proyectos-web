import {cp,mkdir,rm,readFile,writeFile} from 'node:fs/promises';
import {resolveBuild,routePairs,privateOrigin,nonIndexedCategories} from '../config/site.mjs';
const config=resolveBuild();
await rm('dist',{recursive:true,force:true});
await mkdir('dist/server',{recursive:true});
await cp('public','dist/client',{recursive:true});
for(const [es,en,category] of routePairs){
 for(const [route,lang] of [[es,'es'],[en,'en']]){
  const file='dist/client'+route+'index.html';let html=await readFile(file,'utf8');
  html=html.replaceAll(privateOrigin,config.origin);
  html=html.replace(/<link rel="(?:canonical|alternate)"[^>]*>/g,'');
  const index=config.mode!=='private'&&!nonIndexedCategories.has(category);
  html=html.replace(/<meta name="robots"[^>]*>/g,`<meta name="robots" content="${index?'index,follow':'noindex,nofollow'}">`);
  html=html.replace(/<meta property="og:url"[^>]*>/g,'');
  const metadata=`<link rel="canonical" href="${config.origin}${route}"><link rel="alternate" hreflang="es" href="${config.origin}${es}"><link rel="alternate" hreflang="en" href="${config.origin}${en}"><link rel="alternate" hreflang="x-default" href="${config.origin}${es}"><meta property="og:url" content="${config.origin}${route}">`;
  html=html.replace('</head>',metadata+'</head>');
  if(!config.feedbackWrites&&category==='private-feedback'){
   html=html.replace('<script defer src="/feedback.js"></script>','');
   const notice=lang==='es'?'El envío de comentarios está temporalmente desactivado mientras preparamos el acceso y completamos la revisión de privacidad.':'Feedback submissions are temporarily disabled while we prepare access and complete the privacy review.';
   html=html.replace('<form class="fb-form"',`<p role="status" class="fb-noscript">${notice}</p><form class="fb-form"`);
  }
  if(['static-export','pages-export'].includes(config.mode)){
   html=html.replaceAll('Estado de esta versión privada de revisión','Privacidad y estado de los servicios').replaceAll('Status of this private review version','Privacy and service status').replaceAll('Esta versión privada permite revisar el proyecto y utilizar sus recursos gratuitos.','Esta web presenta el proyecto y permite utilizar sus recursos gratuitos.').replaceAll('This private version lets you review the project and use its free resources.','This website introduces the project and provides access to its free resources.').replaceAll('La web está alojada en Sites y conserva acceso privado.','Esta versión está preparada para alojamiento estático en Cloudflare Pages.').replaceAll('The website is hosted on Sites and remains private.','This version is prepared for static hosting on Cloudflare Pages.');
   if(config.mode==='pages-export')html=html.replaceAll('Esta versión está preparada para alojamiento estático en Cloudflare Pages.','Esta versión utiliza Cloudflare Pages y un backend de comentarios en D1 cuando está configurado.').replaceAll('This version is prepared for static hosting on Cloudflare Pages.','This version uses Cloudflare Pages and a D1 feedback backend when configured.');
   if(config.mode==='static-export')html=html.replace(/<section class="community-section"><h2>(Comentarios privados|Private feedback)<\/h2>.*?<\/section>/s,lang==='es'?'<section class="community-section"><h2>Comentarios privados</h2><p>El envío de comentarios está desactivado en esta versión estática. No se guardan respuestas ni datos de contacto mediante ese formulario. Antes de activarlo se definirán el acceso, la privacidad y el plazo de conservación. Los registros técnicos del proveedor de alojamiento pueden existir.</p></section>':'<section class="community-section"><h2>Private feedback</h2><p>Feedback submissions are disabled in this static version. That form does not store answers or contact details. Access, privacy and retention will be defined before activation. The hosting provider may retain technical logs.</p></section>');
  }
  await writeFile(file,html);
 }
}
const sitemapRoutes=routePairs.filter(([, ,category])=>!nonIndexedCategories.has(category)).flatMap(([es,en])=>[es,en]);
await writeFile('dist/client/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+sitemapRoutes.map(route=>`<url><loc>${config.origin}${route}</loc></url>`).join('')+'</urlset>');
await writeFile('dist/client/robots.txt',config.mode==='private'?'User-agent: *\nDisallow: /\n':`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /feedback/\nDisallow: /en/feedback/\nDisallow: /sesion/\nDisallow: /en/session/\nSitemap: ${config.origin}/sitemap.xml\n`);
let worker=await readFile('src/worker.js','utf8');
worker=worker.replace(`const ORIGIN='${privateOrigin}';`,`const ORIGIN='${config.origin}';`).replace('const FEEDBACK_WRITES_ENABLED=true;',`const FEEDBACK_WRITES_ENABLED=${config.feedbackWrites};`).replace('const PUBLIC_FEEDBACK=false;',`const PUBLIC_FEEDBACK=${config.mode!=='private'};`);
if(!worker.includes(`const ORIGIN='${config.origin}';`)||!worker.includes(`const FEEDBACK_WRITES_ENABLED=${config.feedbackWrites};`))throw Error('Worker configuration replacement failed');
await writeFile('dist/server/index.js',worker);
await mkdir('dist/.openai',{recursive:true});await cp('.openai/hosting.json','dist/.openai/hosting.json');
console.log(`Built ${config.mode}: ${config.origin}; feedback writes ${config.feedbackWrites?'private-only':'disabled'}`);
