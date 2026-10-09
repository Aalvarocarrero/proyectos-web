import {createServer} from 'vite';
import {mkdir,writeFile} from 'node:fs/promises';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

const vite=await createServer({appType:'custom',configFile:false,root:process.cwd(),resolve:{alias:{'@':process.cwd()}},server:{middlewareMode:true,hmr:false,watch:null}});
const {marketplaceRootCategories}=await vite.ssrLoadModule('/lib/marketplace-categories.ts');
const done=['Bovinos','Semillas y plantas','Drones y tecnología'];
const {AgroCategoryIcon}=await vite.ssrLoadModule('/components/agro-category-icon.tsx');
const {AGRO_ICON_PATHS}=await vite.ssrLoadModule('/lib/agro-icon-paths.ts');
await mkdir('public/examples',{recursive:true});
for(const [i,c] of marketplaceRootCategories.filter(c=>!done.includes(c.value)).entries()){
 const icon=renderToStaticMarkup(React.createElement(AgroCategoryIcon,{category:c.value,size:120,color:'#4c6b3a',strokeWidth:1.8}));
 await writeFile(`public/examples/market-${i}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400"><title>Ilustración de ${c.value}</title><rect width="640" height="400" fill="#e9dfce"/><circle cx="320" cy="180" r="108" fill="#f8f3ea"/><g transform="translate(260 120)">${icon}</g><text x="320" y="330" text-anchor="middle" font-family="system-ui,sans-serif" font-size="24" fill="#3e2a19">${c.value}</text><text x="320" y="365" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" fill="#71685f">Ejemplo demostrativo · Venezuela Agro</text></svg>`);
}
await mkdir('public/icons/agro',{recursive:true});
const manifest={version:1,brand:'Venezuela Agro',provenance:'Original project-authored SVG geometry; no Apple emoji or SF Symbols assets',viewBox:'0 0 24 24',strokeWidth:1.8,icons:[]};
for(const [id,paths] of Object.entries(AGRO_ICON_PATHS)){const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#4c6b3a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><title>Venezuela Agro · ${id}</title>${paths.map(d=>`<path d="${d}"/>`).join('')}</svg>`;await writeFile(`public/icons/agro/${id}.svg`,svg);manifest.icons.push({id,src:`/icons/agro/${id}.svg`});}
await writeFile('public/icons/agro/manifest.json',JSON.stringify(manifest,null,2));
await vite.close();
