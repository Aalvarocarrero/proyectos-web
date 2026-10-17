import {readdir,writeFile,readFile,stat} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const root='dist/client';
async function walk(dir,pattern){const out=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())out.push(...await walk(path,pattern));else if(pattern.test(path))out.push(path);}return out;}
const assets=(await walk(join(root,'assets'),/\.(js|css|woff2?)$/)).map(path=>'/'+path.slice(root.length+1)).sort();
if(!assets.some(path=>path.endsWith('.js')))throw new Error('Offline application scripts missing');
// Build-time provenance check: the downloadable pack cannot advertise missing or changed files.
const farmManifest=JSON.parse(await readFile('public/farm-3d/manifest.json','utf8'));
const farmNotices=new Set(['/licenses/ez-tree.txt','/licenses/ez-tree-textures.md']);
if(farmManifest.version!==1||!Array.isArray(farmManifest.assets)||!farmManifest.assets.length||!Array.isArray(farmManifest.notices)||farmManifest.notices.some(path=>!farmNotices.has(path)))throw new Error('Invalid farm 3D manifest');
let farmBytes=0;const farmPaths=new Set();
for(const item of farmManifest.assets){
 if(!/^\/farm-3d\/v1\/[a-z0-9][a-z0-9-]*\.(glb|webp)$/.test(item.path)||farmPaths.has(item.path))throw new Error('Unsafe or duplicate farm asset path');
 const bytes=await readFile('public'+item.path);
 if(bytes.length!==item.bytes||createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw new Error('Farm resource integrity failed: '+item.path);
 farmPaths.add(item.path);farmBytes+=bytes.length;
}
if(farmBytes!==farmManifest.totalBytes||farmBytes>32*1024*1024)throw new Error('Farm 3D manifest size mismatch');
for(const path of farmManifest.notices)if(!(await stat('public'+path)).size)throw new Error('Empty farm license notice');
const shipped=(await walk('public',/\.(webp|png|svg|geojson|glb)$/)).filter(path=>!path.startsWith('public/satellite-packs/')&&!path.startsWith('public/map-packs/')&&!path.startsWith('public/sticker-packs/')).concat(['public/map-context/venezuela-region-20261007-z6.pmtiles','public/farm-3d/manifest.json','public/licenses/ez-tree.txt','public/licenses/ez-tree-textures.md']).sort();
const staticHash=createHash('sha256');const libraryAssets=[];
for(const path of shipped){const bytes=await readFile(path);staticHash.update(path).update(bytes);libraryAssets.push({path:'/'+path.slice('public/'.length),bytes:bytes.byteLength});}
for(const path of assets)libraryAssets.push({path,bytes:(await stat(join(root,path.slice(1)))).size});
const bytes=libraryAssets.reduce((total,item)=>total+item.bytes,0);if(bytes>20*1024*1024)throw new Error('Public library exceeds declared 20 MiB budget');
const workerSource=await readFile('public/sw.js','utf8'),serverSource=await readFile('dist/server/index.js');
const fingerprint=createHash('sha256').update(JSON.stringify(assets)).update(workerSource).update(serverSource).update(staticHash.digest()).digest('hex').slice(0,12);
const version='morochos-v'+BigInt('0x'+fingerprint).toString();
// Report measured bytes, never invent an exact total for server-rendered pages.
const essentialSection=workerSource.match(/const ESSENTIAL = \[(.*?)\];/s)?.[1]||'';
const essentialPaths=[...new Set([...essentialSection.matchAll(/["'](\/[^"']+)["']/g)].map(match=>match[1]).concat([...farmNotices],'/farm-3d/manifest.json'))];
let knownBytes=0,unmeasuredPages=0;
for(const path of [...new Set([...assets,...essentialPaths])]){
 try{const info=await stat(path.startsWith('/assets/')?join(root,path.slice(1)):'public'+path);if(!info.isFile())throw new Error();knownBytes+=info.size;}catch{unmeasuredPages++;}
}
await writeFile(join(root,'offline-assets.json'),JSON.stringify({version:1,revision:version,assets,download:{knownBytes,unmeasuredPages,includes3dEngine:true}}));
await writeFile(join(root,'sw.js'),workerSource.replace(/const VERSION = "[^"]+";/,`const VERSION = "${version}";`));
const pages=['/finca-modelo','/stickers','/','/biblioteca-local','/plataforma','/tienda','/nosotros','/rubros','/guia-institucional','/legal/privacidad','/legal/terminos','/legal/comercio','/creditos-fotograficos'];
await writeFile(join(root,'offline-library-assets.json'),JSON.stringify({version:1,revision:version,bytes,assets:libraryAssets,pages}));
console.log(`Offline resource manifest: ${assets.length} scripts, styles and fonts`);
console.log(`Offline deployment fingerprint: ${version}`);
console.log(`Public library: ${libraryAssets.length} assets including matching code, ${bytes} bytes`);
