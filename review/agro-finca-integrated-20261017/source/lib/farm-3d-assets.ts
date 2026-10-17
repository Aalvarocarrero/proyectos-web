import * as THREE from 'three';
import {addFarmSurfaceVariation} from './farm-landscape-detail';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {refineFarmAnimalAnatomy} from './farm-animal-anatomy';
export type OwnFarmResource=<T extends THREE.BufferGeometry|THREE.Material|THREE.Texture>(resource:T)=>T;
// Versioned URLs are immutable: bump this folder when replacing resource bytes.
export const FARM_3D_ROOT='/farm-3d/v1/';
const abortIfNeeded=(signal:AbortSignal)=>{if(signal.aborted)throw new DOMException('Asset load cancelled','AbortError');};
export const FARM_LIBRARY_MODELS=['cattle','pig','hen','horse','goat','sheep','rabbit','duck','rooster'] as const;
export type LibraryAnimalSpecies=typeof FARM_LIBRARY_MODELS[number];
export function hasLibraryAnimal(species:string):species is LibraryAnimalSpecies{return (FARM_LIBRARY_MODELS as readonly string[]).includes(species);}
const MAX_MODEL_BYTES=2*1024*1024;
/** Only bundled self-contained GLBs. Imported files can never resolve third-party URLs. */
export function validateBundledGlb(bytes:ArrayBuffer){
 const view=new DataView(bytes);if(bytes.byteLength<24||bytes.byteLength>MAX_MODEL_BYTES||view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==bytes.byteLength||view.getUint32(16,true)!==0x4e4f534a)throw new Error('Invalid bundled model');
 const length=view.getUint32(12,true);if(length>bytes.byteLength-20)throw new Error('Invalid model metadata');
 const data=JSON.parse(new TextDecoder().decode(bytes.slice(20,20+length)));
 if((data.extensionsRequired?.length??0)>0||[...(data.buffers??[]),...(data.images??[])].some((item:{uri?:string})=>item.uri))throw new Error('External model dependencies are not allowed');
 return data;
}
export function closeFarmTexture(texture:THREE.Texture){(texture.image as {close?:()=>void}|undefined)?.close?.();}
export function disposeFarmModel(root:THREE.Object3D){const resources=new Set<THREE.BufferGeometry|THREE.Material|THREE.Texture>();root.traverse(object=>{if(!(object instanceof THREE.Mesh))return;resources.add(object.geometry);for(const material of Array.isArray(object.material)?object.material:[object.material]){resources.add(material);for(const value of Object.values(material))if(value instanceof THREE.Texture)resources.add(value);}});for(const item of resources){if(item instanceof THREE.Texture)closeFarmTexture(item);item.dispose();}}
export async function loadFarmModel(name:LibraryAnimalSpecies,signal:AbortSignal){
 const response=await fetch(`${FARM_3D_ROOT}${name}.glb`,{signal,credentials:'same-origin'});if(!response.ok)throw new Error('Model unavailable');const bytes=await response.arrayBuffer();validateBundledGlb(bytes);abortIfNeeded(signal);
 const result=await new GLTFLoader().parseAsync(bytes,'');if(signal.aborted){disposeFarmModel(result.scene);abortIfNeeded(signal);}refineFarmAnimalAnatomy(result.scene,name);return result.scene;
}
export async function loadFarmTexture(file:string,color:boolean,signal:AbortSignal){
 if(!/^(grass|bark)-(color|normal|arm)\.webp$|^leaves-ash\.webp$/.test(file))throw new Error('Unknown bundled texture');
 const response=await fetch(FARM_3D_ROOT+file,{signal,credentials:'same-origin'});if(!response.ok)throw new Error('Texture unavailable');const blob=await response.blob();if(blob.size>300000)throw new Error('Texture budget exceeded');abortIfNeeded(signal);
 const url=URL.createObjectURL(blob);let texture:THREE.Texture;try{texture=await new THREE.TextureLoader().loadAsync(url);}finally{URL.revokeObjectURL(url);}if(signal.aborted){texture.dispose();abortIfNeeded(signal);}
 texture.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;texture.anisotropy=4;return texture;
}
export async function loadFarmPbr(kind:'grass'|'bark',signal:AbortSignal){
 const loaded=await Promise.allSettled(['color','normal','arm'].map(role=>loadFarmTexture(`${kind}-${role}.webp`,role==='color',signal)));if(loaded.some(r=>r.status==='rejected')){for(const r of loaded)if(r.status==='fulfilled')r.value.dispose();throw new Error('Material unavailable');}return loaded.map(r=>(r as PromiseFulfilledResult<THREE.Texture>).value);
}
/** Shared geometry/materials: each material is drawn once for all positioned animals. */
export function instanceFarmModel(root:THREE.Object3D,matrices:THREE.Matrix4[],own:OwnFarmResource){
 root.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(root),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());const scale=1/Math.max(.001,size.x,size.z),normal=new THREE.Matrix4().makeScale(scale,scale,scale).multiply(new THREE.Matrix4().makeTranslation(-center.x,-box.min.y,-center.z));
 const group=new THREE.Group();root.traverse(object=>{if(!(object instanceof THREE.Mesh))return;const geometry=own(object.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(normal,object.matrixWorld)));const materials=Array.isArray(object.material)?object.material:[object.material];for(const material of materials){own(material);for(const value of Object.values(material))if(value instanceof THREE.Texture)own(value);}const mesh=new THREE.InstancedMesh(geometry,object.material,matrices.length);matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);object.geometry.dispose();});if(!group.children.length)throw new Error('Bundled model has no visible meshes');return group;
}
/** Branch geometry is original; the cutout leaves come from the licensed EZ-Tree atlas.
 * Unit height and bounded width make these generic display trees fit existing slots.
 */
export function naturalTreeGeometry(){
 const branchParts:THREE.BufferGeometry[]=[],leaves:number[]=[],uv:number[]=[];
 const branch=(a:THREE.Vector3,b:THREE.Vector3,r1:number,r2:number)=>{const d=b.clone().sub(a),g=new THREE.CylinderGeometry(r2,r1,d.length(),6,1);g.applyMatrix4(new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(.5),new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()),new THREE.Vector3(1,1,1)));branchParts.push(g);};
 branch(new THREE.Vector3(),new THREE.Vector3(.015,.84,0),.026,.009);
 for(let level=0;level<4;level++)for(let j=0;j<5;j++){const angle=j*Math.PI*2/5+level*1.71+.1*Math.sin(j*3+level),y=.3+level*.16,reach=(.2+(3-level)*.025)*(.88+.12*Math.sin(j*2+level)**2),start=new THREE.Vector3(0,y,0),end=new THREE.Vector3(Math.cos(angle)*reach,y+.16,Math.sin(angle)*reach);branch(start,end,.009,.0025);
  for(let card=0;card<3;card++){const axis=angle+card*Math.PI/3,origin=end.clone().add(new THREE.Vector3(Math.cos(axis)*.05,-.02,Math.sin(axis)*.05)),right=new THREE.Vector3(Math.cos(axis)*.2,0,Math.sin(axis)*.2),up=new THREE.Vector3(-Math.sin(axis)*.07,.3,Math.cos(axis)*.07),points=[origin.clone().sub(right),origin.clone().add(right),origin.clone().add(right).add(up),origin.clone().sub(right).add(up)];for(const k of [0,1,2,0,2,3]){leaves.push(...points[k].toArray());uv.push(...[[0,0],[1,0],[1,1],[0,1]][k]);}}
 }
 const foliage=new THREE.BufferGeometry();foliage.setAttribute('position',new THREE.Float32BufferAttribute(leaves,3));foliage.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));foliage.computeVertexNormals();foliage.scale(.6,.8,.6);addFarmSurfaceVariation(foliage,.16);for(const part of branchParts)part.scale(.6,.8,.6);return {branches:branchParts,foliage};
}
