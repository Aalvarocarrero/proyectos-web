// Read-only measurement of built bundles; no user records, APIs or network access.
import {readFileSync,statSync} from 'node:fs';
const core=JSON.parse(readFileSync('dist/client/offline-assets.json'));
const library=JSON.parse(readFileSync('dist/client/offline-library-assets.json'));
const sw=readFileSync('public/sw.js','utf8');
const literals=part=>[...part.matchAll(/["'](\/[^"']+)["']/g)].map(m=>m[1]);
const essential=literals(sw.match(/const ESSENTIAL = \[(.*?)\];/s)?.[1]||'').concat(literals(sw.match(/const FARM_DOCUMENTS=new Set\(\[(.*?)\]\)/s)?.[1]||''));
const paths=[...new Set([...core.assets,...essential])];let missing=[];const bytes=new Map();
for(const p of paths){try{const st=statSync('dist/client'+p);if(!st.isFile())throw Error();bytes.set(p,st.size)}catch{missing.push(p)}}
let overlap=0;for(const a of library.assets)if(bytes.has(a.path))overlap+=a.bytes;
const known=[...bytes.values()].reduce((a,b)=>a+b,0);
if(known!==core.download.knownBytes)throw Error('core manifest measurement mismatch');
console.log(JSON.stringify({revision:core.revision,core:{assetCount:bytes.size,knownBytes:known,unmeasuredHtml:missing},optionalLibrary:{assetCount:library.assets.length,knownBytes:library.bytes,sharedWithCoreBytes:overlap,additionalKnownBytes:library.bytes-overlap,htmlPages:library.pages.length},combinedKnownUniqueBytes:known+library.bytes-overlap,accountData:'Variable per account; not included in these public measurements. No third-party feeds requested.'},null,2));
