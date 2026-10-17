import * as THREE from 'three';
import {palmGeometries} from './farm-palm-model';
import {inside,type Point} from './illustrated-geometry';

type Own=<T extends THREE.BufferGeometry|THREE.Material|THREE.Texture>(resource:T)=>T;
export type ExteriorPlant={x:number;z:number;kind:'tree'|'palm'|'shrub';radius:number;height:number;rotation:number};
export const SURROUNDINGS_LIMITS={trees:72,palms:20,shrubs:96,grass:420,attempts:1600,terrainRadius:5000,nearRadius:90} as const;
/** Undirected segment distance, valid outside and inside concave rings. */
export function boundaryDistance(point:Point,ring:ReadonlyArray<Point>){
 let distance=Infinity;for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((point.x-a.x)*dx+(point.y-a.y)*dy)/(dx*dx+dy*dy||1)));distance=Math.min(distance,Math.hypot(point.x-a.x-t*dx,point.y-a.y-t*dy));}return distance;
}
export const EXTERIOR_RADII=[90,102,118,140,168,200,240,290,350,430,530,680,900,1200,1700,2500,3500,SURROUNDINGS_LIMITS.terrainRadius];
const smooth=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
/** A flat collar protects every saved polygon; only the distant context has invented relief. */
export function exteriorHeight(x:number,z:number){const r=Math.hypot(x,z),fade=smooth((r-SURROUNDINGS_LIMITS.nearRadius)/85);return -.08+fade*(3.7+2.8*Math.sin(x*.023+z*.009)+2.5*Math.cos(z*.029-x*.007)+1.4*Math.sin(x*.041-z*.032));}
/** Matches the actual triangulated ground, so scenery never floats above an analytical approximation. */
export function exteriorSurfaceHeight(x:number,z:number){
 const angle=(Math.atan2(z,x)+Math.PI*2)%(Math.PI*2),segment=Math.floor(angle/(Math.PI*2/96)),a=segment*Math.PI*2/96,b=(segment+1)*Math.PI*2/96,det=Math.sin(b-a),u=(x*Math.sin(b)-z*Math.cos(b))/det,v=(z*Math.cos(a)-x*Math.sin(a))/det,r=u+v;
 if(r<=EXTERIOR_RADII[0])return -.08;
 const index=Math.max(0,EXTERIOR_RADII.findIndex((radius,i)=>i<EXTERIOR_RADII.length-1&&r<=EXTERIOR_RADII[i+1])),lo=EXTERIOR_RADII[index],hi=EXTERIOR_RADII[index+1],inner0={x:Math.cos(a)*lo,z:Math.sin(a)*lo},inner1={x:Math.cos(b)*lo,z:Math.sin(b)*lo},outer0={x:Math.cos(a)*hi,z:Math.sin(a)*hi},outer1={x:Math.cos(b)*hi,z:Math.sin(b)*hi};
 const sample=(p:typeof inner0,q:typeof inner0,s:typeof inner0)=>{const denom=(q.z-s.z)*(p.x-s.x)+(s.x-q.x)*(p.z-s.z),w0=((q.z-s.z)*(x-s.x)+(s.x-q.x)*(z-s.z))/denom,w1=((s.z-p.z)*(x-s.x)+(p.x-s.x)*(z-s.z))/denom;return {inside:w0>=-1e-6&&w1>=-1e-6&&w0+w1<=1+1e-6,height:w0*exteriorHeight(p.x,p.z)+w1*exteriorHeight(q.x,q.z)+(1-w0-w1)*exteriorHeight(s.x,s.z)};};
 const first=sample(inner0,outer0,inner1);return first.inside?first.height:sample(inner1,outer0,outer1).height;
}
export function exteriorPlants(property:ReadonlyArray<Point>,blocked:ReadonlyArray<ReadonlyArray<Point>>=[],metre=.25):ExteriorPlant[]{
 if(property.length<3||property.length>2048||property.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))return [];
 let seed=701;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const result:ExteriorPlant[]=[],count={tree:0,palm:0,shrub:0},limits={tree:SURROUNDINGS_LIMITS.trees,palm:SURROUNDINGS_LIMITS.palms,shrub:SURROUNDINGS_LIMITS.shrubs};
 const scale=Math.max(.08,Math.min(.65,metre));
 for(let attempt=0;attempt<SURROUNDINGS_LIMITS.attempts&&result.length<188;attempt++){
  const angle=random()*Math.PI*2,r=35+Math.pow(random(),1.6)*260,x=Math.cos(angle)*r,z=Math.sin(angle)*r,point={x,y:z};
  const pick=random(),kind=pick<.39?'tree':pick<.51?'palm':'shrub';if(count[kind]>=limits[kind])continue;
  const radius=scale*(kind==='tree'?2.4+random()*2:kind==='palm'?2.5+random():.65+random()*1.3);
  // Keep an open collar and road/gate approaches. Crown disks never spill into the owner plot.
  if(inside(point,property)||boundaryDistance(point,property)<radius*1.4+4||blocked.slice(0,96).some(ring=>inside(point,ring)||boundaryDistance(point,ring)<radius+4))continue;
  if(result.some(p=>Math.hypot(p.x-x,p.z-z)<radius+p.radius+1))continue;
  result.push({x,z,kind,radius,height:scale*(kind==='tree'?6+random()*5:kind==='palm'?9+random()*4:1+random()*1.5),rotation:random()*Math.PI*2});count[kind]++;
 }return result;
}
/** Longitude-periodic panorama. No photo, remote request, ownership claim, or moving sun. */
export function createFarmSky(own:Own){
 const width=512,height=256,data=new Uint8Array(width*height*4),horizon=new THREE.Color('#dce4d4'),zenith=new THREE.Color('#78a8c1'),lower=new THREE.Color('#c2ceb0'),color=new THREE.Color(),cloudColor=new THREE.Color('#f0f1e7');
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  // Equirectangular v=1 is the zenith; DataTexture rows start at the south pole.
  const altitude=y/(height-1)*2-1,longitude=x/width*Math.PI*2,t=smooth(Math.max(0,altitude));color.copy(altitude>=0?horizon:lower).lerp(altitude>=0?zenith:horizon,altitude>=0?t:smooth(altitude+1));
  const band=smooth((altitude-.045)/.16)*(1-smooth((altitude-.55)/.18));
  const cloud=Math.max(0,Math.sin(longitude*3+altitude*13)+.4*Math.sin(longitude*7-altitude*25)+.2*Math.cos(longitude*13+altitude*35)-.5)*band*.13;
  color.lerp(cloudColor,Math.min(.2,cloud));color.convertLinearToSRGB();const i=(y*width+x)*4;data[i]=Math.round(color.r*255);data[i+1]=Math.round(color.g*255);data[i+2]=Math.round(color.b*255);data[i+3]=255;
 }
 const sky=own(new THREE.DataTexture(data,width,height));sky.name='continuous-illustrative-sky';sky.mapping=THREE.EquirectangularReflectionMapping;sky.wrapS=THREE.RepeatWrapping;sky.minFilter=sky.magFilter=THREE.LinearFilter;sky.colorSpace=THREE.SRGBColorSpace;sky.needsUpdate=true;return sky;
}
/** Renderer-only scenery, deliberately separate from saved areas, picks, tours and inventory. */
export function createFarmSurroundings(property:ReadonlyArray<Point>,blocked:ReadonlyArray<ReadonlyArray<Point>>,metre:number,grass:THREE.Texture,own:Own,draft=false){
 const group=new THREE.Group();group.name='illustrative-exterior';group.userData.illustrative=true;
 if(property.length<3||property.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))return group;
 const green=own(new THREE.MeshStandardMaterial({color:'#75945a',map:grass,bumpMap:grass,bumpScale:.045,roughness:1,vertexColors:true}));
 const near=new THREE.Shape();for(let i=0;i<96;i++){const angle=i*Math.PI*2/96,x=Math.cos(angle)*SURROUNDINGS_LIMITS.nearRadius,z=Math.sin(angle)*SURROUNDINGS_LIMITS.nearRadius;if(i===0)near.moveTo(x,-z);else near.lineTo(x,-z);}near.closePath();const hole=new THREE.Path();property.forEach((p,i)=>{if(i===0)hole.moveTo(p.x,-p.y);else hole.lineTo(p.x,-p.y);});hole.closePath();near.holes.push(hole);
 const collarGeometry=own(new THREE.ShapeGeometry(near)),positions=collarGeometry.attributes.position,colors:number[]=[];for(let i=0;i<positions.count;i++){const shade=.87+.09*Math.sin(positions.getX(i)*.14+positions.getY(i)*.08);colors.push(shade,shade,shade);}collarGeometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));const collar=new THREE.Mesh(collarGeometry,green);collar.name='exterior-flat-collar';collar.rotation.x=-Math.PI/2;collar.position.y=-.08;collar.receiveShadow=true;group.add(collar);
 const radii=EXTERIOR_RADII,vertices:number[]=[],uv:number[]=[],terrainColors:number[]=[],indices:number[]=[],color=new THREE.Color();
 for(const radius of radii)for(let i=0;i<=96;i++){const angle=i*Math.PI*2/96,x=Math.cos(angle)*radius,z=Math.sin(angle)*radius;vertices.push(x,exteriorHeight(x,z),z);uv.push(x,-z);const shade=.87+.09*Math.sin(x*.14-z*.08);color.setRGB(shade,shade,shade);terrainColors.push(color.r,color.g,color.b);}
 for(let ring=0;ring<radii.length-1;ring++)for(let i=0;i<96;i++){const a=ring*97+i,b=a+97;indices.push(a,a+1,b,a+1,b+1,b);}
 const geometry=own(new THREE.BufferGeometry());geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setAttribute('color',new THREE.Float32BufferAttribute(terrainColors,3));geometry.setIndex(indices);geometry.computeVertexNormals();const terrain=new THREE.Mesh(geometry,green);terrain.name='exterior-meadow-relief';terrain.receiveShadow=false;group.add(terrain);
 // A visual overlay follows the exact perimeter. It is not a claim of a surveyed or built fence.
 const linePoints=property.flatMap((p,i)=>{const next=property[(i+1)%property.length];return [new THREE.Vector3(p.x,.16,p.y),new THREE.Vector3(next.x,.16,next.y)];});
 const boundary=new THREE.LineSegments(own(new THREE.BufferGeometry().setFromPoints(linePoints)),own(new THREE.LineBasicMaterial({color:'#e1f5b8',depthTest:true,toneMapped:false})));boundary.name='own-property-perimeter';group.add(boundary);
 const markerPoints:Point[]=[];for(let i=0;i<property.length&&markerPoints.length<256;i++){const a=property[i],b=property[(i+1)%property.length],steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/6));for(let j=0;j<steps&&markerPoints.length<256;j++)markerPoints.push({x:a.x+(b.x-a.x)*j/steps,y:a.y+(b.y-a.y)*j/steps});}
 const markers=new THREE.InstancedMesh(own(new THREE.CylinderGeometry(.105,.105,.16,6)),own(new THREE.MeshBasicMaterial({color:'#e1f5b8',toneMapped:false})),markerPoints.length),dummy=new THREE.Object3D();markers.name='own-property-markers';markerPoints.forEach((p,i)=>{dummy.position.set(p.x,.16,p.y);dummy.updateMatrix();markers.setMatrixAt(i,dummy.matrix);});group.add(markers);
 if(draft)return group;
 const plants=exteriorPlants(property,blocked,metre),bark=own(new THREE.MeshStandardMaterial({color:'#7b7054',roughness:1})),leaves=own(new THREE.MeshStandardMaterial({color:'#64834b',roughness:1})),crown=own(new THREE.IcosahedronGeometry(1,1)),trunk=own(new THREE.CylinderGeometry(.07,.1,1,5));
 const trees=plants.filter(p=>p.kind==='tree'),shrubs=plants.filter(p=>p.kind==='shrub'),palms=plants.filter(p=>p.kind==='palm');
 const instance=(name:string,geometry:THREE.BufferGeometry,material:THREE.Material,items:ExteriorPlant[],parts:number,place:(plant:ExteriorPlant,part:number)=>void)=>{if(!items.length)return;const mesh=new THREE.InstancedMesh(geometry,material,items.length*parts);mesh.name=name;items.forEach((plant,i)=>{for(let part=0;part<parts;part++){dummy.rotation.set(0,plant.rotation,0);place(plant,part);dummy.updateMatrix();mesh.setMatrixAt(i*parts+part,dummy.matrix);}});mesh.receiveShadow=false;mesh.castShadow=false;group.add(mesh);};
 instance('exterior-tree-trunks',trunk,bark,trees,1,p=>{dummy.position.set(p.x,exteriorSurfaceHeight(p.x,p.z)+p.height*.36,p.z);dummy.scale.set(p.radius,p.height*.72,p.radius);});
 instance('exterior-tree-crowns',crown,leaves,trees,3,(p,j)=>{dummy.position.set(p.x+Math.cos(j*2.4+p.rotation)*p.radius*.32,exteriorSurfaceHeight(p.x,p.z)+p.height*.73+j*p.radius*.1,p.z+Math.sin(j*2.4+p.rotation)*p.radius*.32);dummy.scale.set(p.radius*.74,p.radius*.84,p.radius*.74);});
 instance('exterior-shrubs',crown,leaves,shrubs,1,p=>{dummy.position.set(p.x,exteriorSurfaceHeight(p.x,p.z)+p.height*.44,p.z);dummy.scale.set(p.radius,p.height*.6,p.radius*.85);});
 const palm=palmGeometries();instance('exterior-palm-trunks',own(palm.trunk),bark,palms,1,p=>{dummy.position.set(p.x,exteriorSurfaceHeight(p.x,p.z),p.z);dummy.scale.set(p.radius,p.height,p.radius);});instance('exterior-palm-fronds',own(palm.fronds),own(new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide})),palms,1,p=>{dummy.position.set(p.x,exteriorSurfaceHeight(p.x,p.z),p.z);dummy.scale.set(p.radius,p.height,p.radius);});
 const grassGeometry=own(new THREE.BufferGeometry());grassGeometry.setAttribute('position',new THREE.Float32BufferAttribute([-.13,0,0,0,.7,0,.13,0,0,0,0,-.13,.025,.55,0,0,0,.13],3));grassGeometry.computeVertexNormals();const tufts:ExteriorPlant[]=[];for(let i=0;i<SURROUNDINGS_LIMITS.grass*3&&tufts.length<SURROUNDINGS_LIMITS.grass;i++){const angle=i*2.39996323,r=45+((i*37)%130),x=Math.cos(angle)*r,z=Math.sin(angle)*r;if(inside({x,y:z},property)||boundaryDistance({x,y:z},property)<3)continue;tufts.push({x,z,kind:'shrub',radius:.6,height:.6,rotation:angle});}
 instance('exterior-grass-tufts',grassGeometry,own(new THREE.MeshStandardMaterial({color:'#9aaa67',roughness:1,side:THREE.DoubleSide})),tufts,1,p=>{dummy.position.set(p.x,exteriorSurfaceHeight(p.x,p.z)+.01,p.z);dummy.scale.setScalar(.35+Math.abs(Math.sin(p.rotation))*.45);});
 return group;
}

/** Thin ground detail is sub-pixel in distant/overhead views; trunks and crowns stay instanced. */
export function updateFarmSurroundingsLOD(group:THREE.Group,camera:THREE.PerspectiveCamera){
 const grass=group.getObjectByName('exterior-grass-tufts'),shrubs=group.getObjectByName('exterior-shrubs');
 if(grass)grass.visible=camera.position.y<80;if(shrubs)shrubs.visible=camera.position.y<220;
}
