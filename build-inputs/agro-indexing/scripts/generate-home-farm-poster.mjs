/** Small, honest 2D fallback derived from the same published farm fixture as the 3D scene. */
import {createServer} from 'vite';
import {writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({root,configFile:false,appType:'custom',resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
try {
 const {createFarmShowcase}=await vite.ssrLoadModule('/lib/farm-showcase.ts');
 const model=createFarmShowcase();
 const points=model.boundary.points, xs=points.map(p=>p.x),ys=points.map(p=>p.y);
 const minX=Math.min(...xs), minY=Math.min(...ys), w=Math.max(...xs)-minX,h=Math.max(...ys)-minY;
 const project=p=>`${(70+(p.x-minX)/w*660).toFixed(1)},${(65+(p.y-minY)/h*380).toFixed(1)}`;
 const tones={pasture:'#a8b98c',crop:'#91774b',forest:'#638059',house:'#d8b58e',barn:'#bfa382',coop:'#c4ae88',greenhouse:'#9cbdb1',nursery:'#a4b76d',compost:'#987b54',tank:'#aac8c6',water:'#448a93',road:'#e0d2ae',corral:'#b7ab8c',other:'#a7b383'};
 // Broad land uses first, access roads second, installations on top. Boundary
 // fences are outlines, never filled parcels: a full-farm fill hides the plan.
 const layer=a=>a.structureKind==='fence'?4:a.structureKind==='gate'?5:a.use==='road'?1:['house','barn','coop','tank','greenhouse','nursery','compost','corral','other'].includes(a.use)?2:0;
 const polygons=[...model.illustrated.areas].sort((a,b)=>layer(a)-layer(b)).map(a=>{
  if(a.structureKind==='gate'){
   const x=a.outline.map(p=>p.x),y=a.outline.map(p=>p.y),left=Math.min(...x),right=Math.max(...x),top=Math.min(...y),bottom=Math.max(...y);
   const [from,to]=right-left>bottom-top?[{x:left,y:(top+bottom)/2},{x:right,y:(top+bottom)/2}]:[{x:(left+right)/2,y:top},{x:(left+right)/2,y:bottom}];
   return `<path data-kind="gate" d="M${project(from)}L${project(to)}" fill="none" stroke="#775633" stroke-width="3" stroke-linecap="round"/>`;
  }
  const fence=a.structureKind==='fence';
  return `<polygon${fence?' data-kind="fence"':''} points="${a.outline.map(project).join(' ')}" fill="${fence?'none':tones[a.use]??'#b8bc99'}" stroke="${fence?'#6c7144':'#f6f2de'}" stroke-width="${fence?'2':'1.5'}"${fence?' stroke-dasharray="5 3"':''}/>`;
 }).join('');
 const dots=model.illustrated.animals.map(a=>{const [x,y]=project(a.position).split(',');return `<circle cx="${x}" cy="${y}" r="1.7" fill="#493e2a"/>`;}).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><title>Plano 2D de Finca Horizonte, ejemplo ficticio de 10 hectáreas</title><rect width="800" height="500" fill="#e4e9d7"/><path d="M0 50Q220 10 800 85M0 475Q350 430 800 490" fill="none" stroke="#d0dbc2" stroke-width="36"/><polygon points="${points.map(project).join(' ')}" fill="#b9c49b" stroke="#557a3f" stroke-width="5"/>${polygons}${dots}<text x="70" y="35" fill="#365026" font-family="sans-serif" font-size="15" letter-spacing="2">FINCA HORIZONTE · 10 HA</text><text x="70" y="478" fill="#52634b" font-family="sans-serif" font-size="12">Plano de ejemplo · vista ligera 2D</text></svg>`;
 const hash=createHash('sha256').update(svg).digest('hex').slice(0,12);
 const src=`/previews/finca-modelo-plan-${hash}.svg`;
 await writeFile(root+'public'+src,svg);
 await writeFile(root+'lib/home-farm-poster.json',JSON.stringify({src,bytes:Buffer.byteLength(svg)},null,2)+'\n');
 console.log(`${src}: ${Buffer.byteLength(svg)} bytes; ${model.illustrated.areas.length} areas, ${model.illustrated.animals.length} animals from fixture v${model.templateVersion}`);
} finally {await vite.close();}
