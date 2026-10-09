import {readdir,writeFile,readFile,stat} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const root='dist/client';
async function walk(dir,pattern){const out=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())out.push(...await walk(path,pattern));else if(pattern.test(path))out.push(path);}return out;}
const assets=(await walk(join(root,'assets'),/\.(js|css|woff2?)$/)).map(path=>'/'+path.slice(root.length+1)).sort();
if(!assets.some(path=>path.endsWith('.js')))throw new Error('Offline application scripts missing');
const shipped=(await walk('public',/\.(webp|png|svg|geojson)$/)).filter(path=>!path.startsWith('public/satellite-packs/')&&!path.startsWith('public/map-packs/')&&!path.startsWith('public/sticker-packs/')).concat(['public/map-context/venezuela-region-20261007-z6.pmtiles']).sort();
const staticHash=createHash('sha256');const libraryAssets=[];
for(const path of shipped){const bytes=await readFile(path);staticHash.update(path).update(bytes);libraryAssets.push({path:'/'+path.slice('public/'.length),bytes:bytes.byteLength});}
for(const path of assets)libraryAssets.push({path,bytes:(await stat(join(root,path.slice(1)))).size});
const bytes=libraryAssets.reduce((total,item)=>total+item.bytes,0);if(bytes>20*1024*1024)throw new Error('Public library exceeds declared 20 MiB budget');
const workerSource=await readFile('public/sw.js','utf8'),serverSource=await readFile('dist/server/index.js');
const fingerprint=createHash('sha256').update(JSON.stringify(assets)).update(workerSource).update(serverSource).update(staticHash.digest()).digest('hex').slice(0,12);
const version='morochos-v'+BigInt('0x'+fingerprint).toString();
await writeFile(join(root,'offline-assets.json'),JSON.stringify({version:1,revision:version,assets}));
await writeFile(join(root,'sw.js'),workerSource.replace(/const VERSION = "[^"]+";/,`const VERSION = "${version}";`));
const pages=['/stickers','/','/biblioteca-local','/plataforma','/tienda','/nosotros','/rubros','/guia-institucional','/legal/privacidad','/legal/terminos','/legal/comercio','/creditos-fotograficos'];
await writeFile(join(root,'offline-library-assets.json'),JSON.stringify({version:1,revision:version,bytes,assets:libraryAssets,pages}));
console.log(`Offline resource manifest: ${assets.length} scripts, styles and fonts`);
console.log(`Offline deployment fingerprint: ${version}`);
console.log(`Public library: ${libraryAssets.length} assets including matching code, ${bytes} bytes`);
