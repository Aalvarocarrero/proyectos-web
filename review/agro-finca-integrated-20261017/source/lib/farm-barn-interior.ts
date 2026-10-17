import * as THREE from 'three';
import {addFarmSurfaceVariation} from './farm-landscape-detail';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
type Own=<T extends THREE.BufferGeometry|THREE.Material|THREE.Texture>(resource:T)=>T;
/** Original illustrative shelter. No stall count or furnishing is written into farm records. */
export function createFarmBarnInterior(own:Own,options:{smallLivestock?:boolean}={}){
 const feedScale=options.smallLivestock?.25:1;
 const group=new THREE.Group(),roof=new THREE.Group(),parts=new Map<string,THREE.BufferGeometry[]>(),roofParts:THREE.BufferGeometry[]=[],solids:THREE.Box3[]=[];group.name='inspectable-barn';group.userData.keepSceneGroup=true;roof.name='illustrative-barn-roof';
 const box=(color:string,x:number,y:number,z:number,w:number,h:number,d:number,rotation=0,isRoof=false)=>{const geometry=new THREE.BoxGeometry(w,h,d);geometry.rotateX(rotation);geometry.translate(x,y,z);geometry.computeBoundingBox();solids.push(geometry.boundingBox!.clone());if(isRoof){roofParts.push(geometry);return;}const list=parts.get(color)??[];list.push(geometry);parts.set(color,list);};
 box('#bcb9a5',0,-.018,0,.98,.036,.72);
 // Open entries, structural posts and low rails keep saved animals visible in a cutaway.
 for(const x of [-.43,0,.43])for(const z of [-.3,.3])box('#7b7563',x,.27,z,.024,.51,.024);
 for(const side of [-1,1]){box('#bcb9a5',0,.08,side*.315,.86,.12,.025);for(const y of [.2,.31])box('#929a86',0,y,side*.3,.88,.015,.012);box('#baa269',0,.045*feedScale,side*.21,.7,.018*feedScale,.15);box('#969c87',0,.08*feedScale,side*.1,.68,.075*feedScale,.052);box('#778461',0,.123*feedScale,side*.1,.62,.012*feedScale,.028);}
 for(const x of [-.43,.43])for(const side of [-1,1])box('#929a86',x,.21,side*.21,.016,.018,.18);
 const slope=.25;for(const side of [-1,1])box('#a79c83',0,.555,side*.18,1,.024,.37/Math.cos(slope),side*slope,true);
 // Raised seams keep the metal roof readable close up without texture downloads.
 for(let rib=0;rib<18;rib++)for(const side of [-1,1])box('#a79c83',-.47+rib*.055,.572,side*.18,.006,.007,.37/Math.cos(slope),side*slope,true);
 for(const [color,geometries]of parts){const geometry=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());if(!geometry)continue;const mesh=new THREE.Mesh(own(addFarmSurfaceVariation(geometry,.14)),own(new THREE.MeshStandardMaterial({color,vertexColors:true,roughness:.92})));mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);}
 const roofGeometry=mergeGeometries(roofParts,false);roofParts.forEach(g=>g.dispose());if(roofGeometry){const mesh=new THREE.Mesh(own(addFarmSurfaceVariation(roofGeometry,.09)),own(new THREE.MeshStandardMaterial({color:'#a5aaa2',vertexColors:true,roughness:.66,metalness:.28})));mesh.castShadow=mesh.receiveShadow=true;roof.add(mesh);}group.add(roof);group.userData.illustrative=true;return {group,roof,solids};
}
/** Keep dynamic/cutaway groups out of the static world-space material merge. */
export function preserveFarmGroup(object:THREE.Object3D){for(let parent:THREE.Object3D|null=object;parent;parent=parent.parent)if(parent.userData.keepSceneGroup||parent.userData.illustrative)return true;return false;}
