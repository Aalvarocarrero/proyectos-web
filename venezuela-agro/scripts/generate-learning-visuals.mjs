import {createServer} from 'vite';
import {writeFile,mkdir} from 'node:fs/promises';
const vite=await createServer({appType:'custom',configFile:false,root:process.cwd(),resolve:{alias:{'@':process.cwd()}},server:{middlewareMode:true,hmr:false,watch:null}});
const {platformGuides}=await vite.ssrLoadModule('/lib/platform-guides.ts');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
await mkdir('public/guias',{recursive:true});
for(const guide of platformGuides){
 const g=guide.tutorial;
 const fields=g.fields.map(([label,value],i)=>{
  const y=202+i*65;
  return `<text x="94" y="${y}" font-size="14" fill="#6f665c">${escape(label)}</text><rect x="78" y="${y+9}" width="536" height="35" rx="9" fill="#f5f1e9" stroke="#e3dccf"/><text x="94" y="${y+32}" font-size="15" fill="#3e2a19">${escape(value)}</text>`;
 }).join('');
 const buttonY=203+g.fields.length*65;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640" role="img" aria-labelledby="title desc"><title id="title">${escape(g.screen)}</title><desc id="desc">Esquema didáctico de campos de Venezuela Agro. Datos de ejemplo.</desc><rect width="960" height="640" rx="24" fill="#ebe2d3"/><g font-family="system-ui, sans-serif"><rect x="42" y="38" width="876" height="562" rx="22" fill="#fffdf7"/><path d="M64 38H896Q918 38 918 60V96H42V60Q42 38 64 38" fill="#211d1a"/><circle cx="72" cy="67" r="4" fill="#b7d79a"/><text x="88" y="73" font-size="18" font-weight="600" fill="#fffdf7">Venezuela Agro</text><text x="735" y="73" font-size="12" fill="#b7d79a">GUÍA VISUAL</text><text x="78" y="145" font-family="Georgia,serif" font-size="27" fill="#3e2a19">${escape(g.screen)}</text><text x="78" y="171" font-size="12" fill="#6f665c">Completa tus datos · Los valores mostrados son ejemplos</text>${fields}<rect x="78" y="${buttonY}" width="240" height="38" rx="19" fill="#3e2a19"/><text x="198" y="${buttonY+25}" text-anchor="middle" font-size="13" fill="#fffdf7">Revisa y guarda tus datos</text><rect x="652" y="192" width="222" height="184" rx="16" fill="#edf1e5"/><circle cx="684" cy="222" r="11" fill="#4c6b3a"/><path d="M679 222l4 4 7-8" fill="none" stroke="white" stroke-width="2"/><text x="672" y="261" font-size="15" font-weight="600" fill="#3e2a19">Paso a paso</text><text x="672" y="290" font-size="13" fill="#5f574f">1. Elige el área</text><text x="672" y="315" font-size="13" fill="#5f574f">2. Completa los campos</text><text x="672" y="340" font-size="13" fill="#5f574f">3. Revisa el resultado</text><text x="652" y="419" font-size="12" fill="#5f574f">Misma plataforma en móvil,</text><text x="652" y="440" font-size="12" fill="#5f574f">tablet y computador.</text><text x="78" y="586" font-size="11" fill="#6f665c">Creado por Alimentos Parcela Los Morochos · Ilustración orientativa</text></g></svg>`;
 await writeFile(`public/guias/${guide.slug}.svg`,svg);
}
await vite.close();
console.log(`Generadas ${platformGuides.length} guías SVG ligeras.`);
const xml=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const lines=(text,max=50)=>{const out=[];let line='';for(const word of text.split(' ')){if((line+' '+word).length>max){out.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)out.push(line);return out;};
for(const guide of platformGuides){
 for(const [index,section] of guide.sections.entries()){
  const last=index===guide.sections.length-1;
  const labels=index===0?[['Área',guide.tutorial.screen],['Acción','Abre el formulario o la herramienta']]:last?[['Revisa','Comprueba tus datos antes de confirmar'],['Resultado','Guardado local; envío al recuperar conexión']]:guide.tutorial.fields.slice(0,3);
  const fields=labels.map(([label,value],i)=>`<text x="48" y="${180+i*73}" fill="#71685f" font-size="14">${xml(label)}</text><rect x="48" y="${192+i*73}" width="544" height="42" rx="10" fill="#f3ebdd"/>${lines(value,56).slice(0,1).map(t=>`<text x="62" y="${219+i*73}" font-size="14" fill="#3e2a19">${xml(t)}</text>`).join('')}`).join('');
  const heading=lines(section.heading,40).slice(0,2).map((t,i)=>`<text x="48" y="${122+i*27}" font-size="23" fill="#3e2a19">${xml(t)}</text>`).join('');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="510" viewBox="0 0 640 510"><title>${xml(section.heading)} · paso ${index+1}</title><rect width="640" height="510" rx="22" fill="#fbf8f2"/><path d="M22 0h596q22 0 22 22v44H0V22Q0 0 22 0" fill="#211d1a"/><g font-family="system-ui,sans-serif"><text x="30" y="41" font-size="18" fill="#fff">Venezuela Agro</text><text x="470" y="41" font-size="13" fill="#b7d79a">Paso ${index+1} de ${guide.sections.length}</text>${heading}${fields}<rect x="48" y="425" width="240" height="44" rx="22" fill="#3e2a19"/><text x="168" y="453" text-anchor="middle" fill="#fff" font-size="14">${last?'Revisar y guardar':'Continuar el proceso'}</text><text x="48" y="494" fill="#71685f" font-size="11">Esquema orientativo · Datos de muestra · No es un registro real</text></g></svg>`;
  await writeFile(`public/guias/${guide.slug}-paso-${index+1}.svg`,svg);
 }
}
