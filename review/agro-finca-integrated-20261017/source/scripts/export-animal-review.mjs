// CPU inspection input of exact Three geometry/material values, not a browser screenshot.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createServer} from 'vite';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const directory=process.argv[2]??'/tmp/farm-animal-review';await mkdir(directory,{recursive:true});
const vite=await createServer({root:process.cwd(),configFile:false,server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
const {refineFarmAnimalAnatomy}=await vite.ssrLoadModule('/lib/farm-animal-anatomy.ts');
const {createAnimalModel}=await vite.ssrLoadModule('/lib/farm-3d-models.ts');
globalThis.self=globalThis;globalThis.ProgressEvent=class{constructor(type,props){Object.assign(this,{type},props);}};
globalThis.createImageBitmap=async blob=>({width:256,height:256,png:Buffer.from(await blob.arrayBuffer()).toString('base64'),close(){}});
async function save(root,name){root.updateMatrixWorld(true);const meshes=[];root.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone().applyMatrix4(o.matrixWorld),m=o.material;meshes.push({name:m.name,positions:Array.from(g.attributes.position.array),indices:g.index?Array.from(g.index.array):null,uv:g.attributes.uv?Array.from(g.attributes.uv.array):null,color:m.color.toArray(),roughness:m.roughness,png:m.map?.image?.png});});await writeFile(`${directory}/${name}.json`,JSON.stringify(meshes));}
try{for(const species of ['pig','cattle']){const bytes=await readFile(`public/farm-3d/v1/${species}.glb`),root=(await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')).scene;await save(root,`${species}-before`);refineFarmAnimalAnatomy(root,species);await save(root,`${species}-after`);await save(createAnimalModel(species,r=>r),`${species}-fallback`);}}finally{await vite.close();}
