import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createSchematicAnimal} from './farm-schematic-animals';
import type {AnimalModelSpecies} from './farm-animal-species';
export type {AnimalModelSpecies} from './farm-animal-species';
type Own=<T extends THREE.BufferGeometry|THREE.Material|THREE.Texture>(value:T)=>T;
/** Anatomical presentation symbols, not animal measurements or inferred records. */
export function createAnimalModel(species:AnimalModelSpecies,own:Own){
 if(!['cattle','pig','hen'].includes(species))return createSchematicAnimal(species,own);
 const parts=new Map<string,THREE.BufferGeometry[]>(),group=new THREE.Group();group.name=`animal-${species}`;group.userData.species=species;group.userData.legCount=0;
 const add=(g:THREE.BufferGeometry,color:string,p:[number,number,number],scale:[number,number,number]=[1,1,1],rotation:[number,number,number]=[0,0,0])=>{const matrix=new THREE.Matrix4().compose(new THREE.Vector3(...p),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),new THREE.Vector3(...scale));g.applyMatrix4(matrix);const list=parts.get(color)??[];list.push(g);parts.set(color,list);};
 const ball=(color:string,p:[number,number,number],scale:[number,number,number])=>add(new THREE.SphereGeometry(1,10,6),color,p,scale);
 const leg=(color:string,x:number,z:number,h:number,r=.065)=>{group.userData.legCount++;add(new THREE.CylinderGeometry(r,r*.85,h,7),color,[x,h/2,z]);};
 if(species==='hen'){
  ball('#eee4cd',[0,.52,0],[.48,.48,.34]);ball('#eee4cd',[.32,.85,0],[.2,.26,.19]);ball('#c1b398',[-.06,.58,.3],[.3,.3,.055]);ball('#c1b398',[-.06,.58,-.3],[.3,.3,.055]);
  add(new THREE.ConeGeometry(.1,.24,6),'#c78c2f',[.56,.86,0],[1,1,1],[0,0,-Math.PI/2]);for(const x of [.18,.29,.4])ball('#b64e36',[x,1.08,0],[.065,.12,.05]);for(const z of [-.18,.18])ball('#302d24',[.39,.93,z],[.025,.03,.018]);
  for(const z of [-.15,.15]){leg('#c39145',-.02,z,.26,.025);add(new THREE.BoxGeometry(.2,.025,.09),'#c39145',[.055,.02,z]);}for(let i=0;i<3;i++)ball('#67664b',[-.48-i*.045,.72+i*.08,(i-1)*.09],[.23,.38,.07]);
 }else{
  const pig=species==='pig',coat=pig?'#c8897f':'#d9d4c5',dark=pig?'#675047':'#38352e',muzzle=pig?'#b9726d':'#77716b';
  group.userData.features=pig?['barrel-body','short-legs','cloven-hooves','flat-snout-two-nostrils','broad-ears','curled-tail']:['deep-barrel','long-sloping-face','broad-muzzle','lateral-ears','cloven-hooves','coat-markings','tufted-tail'];
  const tube=(color:string,a:[number,number,number],b:[number,number,number],r:number,r2=r)=>{const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av),g=new THREE.CylinderGeometry(r2,r,d.length(),8);g.applyMatrix4(new THREE.Matrix4().compose(av.clone().add(bv).multiplyScalar(.5),new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()),new THREE.Vector3(1,1,1)));add(g,color,[0,0,0]);};
  // Connected shoulder/rump volumes; the pig stands substantially lower than cattle.
  ball(coat,[0,pig?.63:1.03,0],[pig?.79:.91,pig?.38:.46,pig?.36:.35]);
  for(const x of [-.52,.45])ball(coat,[x,pig?.62:1.05,0],[.32,pig?.35:.45,pig?.34:.34]);
  if(pig){
   ball(coat,[.68,.63,0],[.36,.29,.28]);
   ball(coat,[.91,.55,0],[.3,.19,.21]);
   // Flat oval snout perpendicular to travel, with two recessed dark nostrils.
   add(new THREE.CylinderGeometry(.16,.18,.105,16),muzzle,[1.16,.52,0],[1,1,.91],[0,0,-Math.PI/2]);
   for(const z of [-.068,.068])ball(dark,[1.215,.535,z],[.013,.034,.025]);
   for(const side of [-1,1]){
    ball('#252723',[.87,.70,.232*side],[.019,.021,.012]);
    add(new THREE.ConeGeometry(.17,.31,3),coat,[.63,.91,.22*side],[1,1,.6],[side*.45,0,.18]);
    add(new THREE.ConeGeometry(.12,.23,3),muzzle,[.655,.92,.247*side],[1,1,.6],[side*.45,0,.18]);
   }
   const curve=new THREE.CatmullRomCurve3(Array.from({length:17},(_,i)=>{const a=i/16*Math.PI*2.3;return new THREE.Vector3(-.76-i*.009,.71+Math.sin(a)*.085,Math.cos(a)*.08);}));
   add(new THREE.TubeGeometry(curve,18,.018,5,false),coat,[0,0,0]);
  }else{
   ball(coat,[.66,1.14,0],[.3,.40,.26]);
   ball(coat,[.87,1.29,0],[.26,.32,.21]);
   add(new THREE.SphereGeometry(1,10,6),coat,[1.03,1.10,0],[.33,.19,.19],[0,0,-.42]);
   ball(muzzle,[1.24,.98,0],[.15,.13,.21]);
   for(const side of [-1,1]){
    ball('#252723',[1.01,1.35,.187*side],[.021,.025,.015]);
    ball(dark,[1.355,1.015,.102*side],[.012,.028,.043]);
    add(new THREE.SphereGeometry(1,10,6),coat,[.79,1.48,.31*side],[.19,.055,.115],[side*.22,0,side*.15]);
    ball(dark,[-.39,1.15,.284*side],[.30,.27,.082]);
    ball(dark,[.17,1.06,.308*side],[.25,.31,.063]);
   }
   tube(coat,[-.86,1.15,0],[-1.0,.48,.035],.021,.016);ball(dark,[-1.01,.4,.035],[.06,.12,.053]);
  }
  for(const x of [-.52,.48])for(const side of [-1,1]){
   const z=(pig?.24:.23)*side,kneeY=pig?.21:.39,topY=pig?.54:.96;
   group.userData.legCount++;
   tube(coat,[x,.09,z],[x-.045,kneeY,z],pig?.06:.043,pig?.074:.058);
   tube(coat,[x-.045,kneeY,z],[x,topY,z],pig?.074:.058,pig?.115:.095);
   // Split toes, rather than a single square platform.
   for(const toe of [-1,1])ball(dark,[x+.023,.055,z+toe*.035],[pig?.085:.078,.055,.031]);
  }

 }
 for(const [color,geometries]of parts){const merged=mergeGeometries(geometries,false);for(const g of geometries)g.dispose();if(!merged)continue;const mesh=new THREE.Mesh(own(merged),own(new THREE.MeshStandardMaterial({color,roughness:.88})));mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);}return group;
}
/** A shared uneven crown silhouette avoids identical perfect spheres without per-tree meshes. */
export function crownGeometry(){const geometry=new THREE.SphereGeometry(1,14,10),positions=geometry.attributes.position;for(let i=0;i<positions.count;i++){const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i),r=1+.09*Math.sin(x*13+y*9+z*7)+.045*Math.cos(z*21-y*15);positions.setXYZ(i,x*r,y*r,z*r);}geometry.computeVertexNormals();return geometry;}
