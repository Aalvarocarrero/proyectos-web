import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {addFarmSurfaceVariation} from './farm-landscape-detail';
import {cropCatalogEntry, type CropModelKind} from './farm-plan-catalog';
export type {CropModelKind} from './farm-plan-catalog';

type Own = <T extends THREE.BufferGeometry | THREE.Material | THREE.Texture>(value: T) => T;
type Position = [number, number, number];

/**
 * Original, deliberately schematic geometry. Grounded y=0, centered x/z; the
 * longest horizontal side is one visual unit, not one measured meter. Shapes
 * identify crops; plant count, maturity, varieties and yield are not inferred.
 * Buffers are merged per material for template cloning or InstancedMesh use.
 */
export function createCropModel(kind: CropModelKind, own: Own): THREE.Group {
  const entry = cropCatalogEntry(kind), group = new THREE.Group();
  const parts = new Map<string, THREE.BufferGeometry[]>();
  const features: Record<string, number> = {stems:0,leaflets:0,fruits:0,bulbs:0,blades:0,tassels:0,pods:0,trifoliateGroups:0};
  const stemColor = '#617844', leafColor = ({tomato:'#4b7139',maize:'#637e43',onion:'#688c79',cilantro:'#4e824b',parsley:'#34683d',soy:'#567843'} as const)[kind];

  const add = (geometry: THREE.BufferGeometry, color: string, at: Position = [0,0,0], scale: Position = [1,1,1], rotation: Position = [0,0,0]) => {
    geometry.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...at),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),new THREE.Vector3(...scale)));
    const list = parts.get(color) ?? []; list.push(geometry); parts.set(color,list);
  };
  const ball = (color: string, at: Position, scale: Position) => add(new THREE.SphereGeometry(1,8,5),color,at,scale);
  const stem = (from: Position, to: Position, radius = .015, color = stemColor) => {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to), direction = b.clone().sub(a);
    if (!direction.lengthSq()) return;
    const geometry = new THREE.CylinderGeometry(radius*.7,radius,direction.length(),5);
    geometry.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize()));
    add(geometry,color,a.add(b).multiplyScalar(.5).toArray() as Position); features.stems++;
  };
  // A folded, double-sided leaf reads from above and from low orbit angles.
  const leaf = (at: Position, length: number, width: number, yaw: number, lobes = 0, tilt = .25, color: string = leafColor) => {
    const positions: number[] = [], segments = lobes ? 10 : 6;
    for (let i=0;i<segments;i++) {
      const t=i/segments,u=(i+1)/segments;
      const w=(n:number)=>Math.sin(n*Math.PI)*width*(lobes ? .75+.25*Math.cos(n*Math.PI*lobes*2) : 1);
      const y=(n:number)=>Math.sin(n*Math.PI)*length*.13-n*n*length*.12;
      for (const side of [-1,1]) positions.push(
        0,y(t),t*length, side*w(t),0,t*length, side*w(u),0,u*length,
        0,y(t),t*length, side*w(u),0,u*length, 0,y(u),u*length,
      );
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3)); geometry.computeVertexNormals();
    add(geometry,color,at,[1,1,1],[tilt,yaw,0]); features.leaflets++;
  };
  const radial = (angle:number,radius:number,y:number):Position => [Math.sin(angle)*radius,y,Math.cos(angle)*radius];

  if (kind === 'tomato') {
    stem([0,0,0],[0,1.03,0],.026);
    for (let i=0;i<6;i++) {
      const angle=i*2.4,height=.27+i*.105,end=radial(angle,.32,height+.18);
      stem([0,height,0],end,.014);
      leaf(end,.3,.105,angle,3,.25);
      for (const side of [-1,1]) leaf(radial(angle,.18,height+.1),.21,.072,angle+side*.85,3,.22);
      if (i<4) {const at=radial(angle,.28,height+.02);ball('#cf4d30',at,[.105,.10,.105]);features.fruits++;leaf([at[0],at[1]+.10,at[2]],.07,.025,angle,0,0,stemColor);}
    }
  } else if (kind === 'maize') {
    stem([0,0,0],[0,1.65,0],.029);
    for (let i=0;i<8;i++) {
      const angle=i*Math.PI+.3,height=.3+i*.135;
      leaf([0,height,0],.67-i*.025,.067,angle,0,-.32);features.blades++;
    }
    for (const angle of [.6,3.6]) {const at=radial(angle,.085,.8);ball('#cab858',at,[.063,.23,.065]);leaf(radial(angle,.05,.61),.38,.065,angle,0,-1.08);features.fruits++;}
    for (let i=0;i<5;i++) {const angle=i*Math.PI*2/5;stem([0,1.5,0],radial(angle,.18,1.82-(i%2)*.07),.011,'#c2ad64');}
    features.tassels=1;
  } else if (kind === 'onion') {
    ball('#dfd4ba',[0,.14,0],[.2,.17,.19]);features.bulbs=1;
    ball('#b8c49a',[0,.29,0],[.07,.12,.07]);
    for (let i=0;i<7;i++) {
      const angle=i*2.4,r=.2+(i%2)*.06,height=.78+(i%3)*.09;
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0,.28,0),new THREE.Vector3(...radial(angle,r*.5,height*.68)),new THREE.Vector3(...radial(angle,r,height))]);
      add(new THREE.TubeGeometry(curve,7,.021,5,false),leafColor);features.blades++;
    }
  } else if (kind === 'cilantro') {
    for (let i=0;i<8;i++) {
      const angle=i*2.4,height=.35+(i%3)*.09,end=radial(angle,.22,height);
      stem([0,0,0],end,.012);
      for (let j=-1;j<=1;j++) leaf(end,.23,.088,angle+j*.7,3,.12);
    }
  } else if (kind === 'parsley') {
    for (let i=0;i<9;i++) {
      const angle=i*2.4,height=.21+(i%3)*.055,end=radial(angle,.22,height);
      stem([0,0,0],end,.015);
      for (let j=-1;j<=1;j++) {
        leaf(end,.21,.1,angle+j*.65,5,-.15);
        const p=radial(angle+j*.45,.3,height+.035);
        ball(j===0?'#387542':'#28603b',p,[.10,.065,.085]);
      }
    }
    // A small central crown keeps the curled rosette full rather than ring-shaped.
    for(const [x,z]of [[0,0],[-.09,.04],[.07,-.06]])ball('#387542',[x,.35,z],[.12,.08,.11]);
  } else {
    stem([0,0,0],[0,.85,0],.022);
    for (let i=0;i<5;i++) {
      const angle=i*2.4,height=.22+i*.105,end=radial(angle,.18,height+.1);
      stem([0,height,0],end,.012);
      for (let j=-1;j<=1;j++) leaf(end,j===0?.29:.23,.105,angle+j*1.0,0,.22);
      features.trifoliateGroups++;
      if (i<4) {const p=radial(angle,.13,height-.04);ball('#a69c52',p,[.036,.13,.037]);features.pods++;}
    }
  }

  // Make every part merge-compatible without UVs or index layout assumptions.
  for (const [color,geometries] of parts) {
    const compatible=geometries.map(g=>{const flat=g.index?g.toNonIndexed():g;flat.deleteAttribute('uv');if(flat!==g)g.dispose();return flat;});
    const merged=mergeGeometries(compatible,false);for (const geometry of compatible) geometry.dispose();
    if (!merged) throw new Error(`Unable to merge ${kind} crop geometry`);
    const mesh=new THREE.Mesh(own(addFarmSurfaceVariation(merged,.22)),own(new THREE.MeshStandardMaterial({color,vertexColors:true,roughness:.84,side:THREE.DoubleSide})));
    mesh.name=`${kind}-${color.slice(1)}`;mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);
  }
  const sourceBox=new THREE.Box3().setFromObject(group),size=sourceBox.getSize(new THREE.Vector3()),center=sourceBox.getCenter(new THREE.Vector3());
  const matrix=new THREE.Matrix4().makeScale(1/Math.max(size.x,size.z),entry.visualHeight/size.y,1/Math.max(size.x,size.z));
  matrix.multiply(new THREE.Matrix4().makeTranslation(-center.x,-sourceBox.min.y,-center.z));
  for (const child of group.children) (child as THREE.Mesh).geometry.applyMatrix4(matrix);
  const box=new THREE.Box3().setFromObject(group);
  group.name=`crop-${kind}`;
  group.userData={kind,illustrative:true,units:'visual-units',silhouette:entry.silhouette,features,
    bounds:{min:box.min.toArray(),max:box.max.toArray()},footprintRadius:Math.hypot(Math.max(Math.abs(box.min.x),Math.abs(box.max.x)),Math.max(Math.abs(box.min.z),Math.abs(box.max.z))),
    triangleCount:group.children.reduce((n,child)=>n+(child as THREE.Mesh).geometry.attributes.position.count/3,0),drawCalls:group.children.length};
  return group;
}

/** Compact original facility symbols, scaled in visual units just like crop templates. */
export function createPlanStructureModel(kind: 'vaquera' | 'fence' | 'gate', own: Own): THREE.Group {
  if(!['vaquera','fence','gate'].includes(kind))throw new Error('Unknown structure presentation kind');
  const group=new THREE.Group(),parts=new Map<string,THREE.BufferGeometry[]>();
  const box=(color:string,p:Position,size:Position,rotation:Position=[0,0,0])=>{
    const geometry=new THREE.BoxGeometry(...size);geometry.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...p),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),new THREE.Vector3(1,1,1)));
    const list=parts.get(color)??[];list.push(geometry);parts.set(color,list);
  };
  const rail=(from:Position,to:Position,width:number,color:string)=>{
    const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),direction=b.clone().sub(a);
    const geometry=new THREE.CylinderGeometry(width,width,direction.length(),5);
    geometry.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize()));geometry.translate(...a.add(b).multiplyScalar(.5).toArray() as Position);
    const list=parts.get(color)??[];list.push(geometry);parts.set(color,list);
  };
  if(kind==='vaquera'){
    box('#baaa84',[0,.03,0],[2,.06,1.5]);
    // Open-sided shelter plus a visibly separate handling lane and water trough.
    for(const x of [-.9,.15])for(const z of [-.6,.6])box('#81745a',[x,.58,z],[.09,1.12,.09]);
    const roofSpan=.7,roofAngle=.28;
    for(const side of [-1,1])box('#97785c',[-.37,1.17,side*.35],[1.3,.07,roofSpan/Math.cos(roofAngle)],[side*roofAngle,0,0]);
    for(const x of [.35,.92])for(const z of [-.6,0,.6])box('#81745a',[x,.4,z],[.07,.77,.07]);
    for(const x of [.35,.92])for(const y of [.25,.52,.74])rail([x,y,-.6],[x,y,.6],.021,'#827862');
    box('#7b8278',[.63,.18,.56],[.45,.25,.18]);box('#547d7a',[.63,.312,.56],[.37,.015,.12]);
  }else{
    const metal=kind==='gate',post=metal?'#646f68':'#8f7955',frame=metal?'#929b87':'#b49b71';
    for(const x of [-1,1])box(post,[x,.52,0],[.1,1.04,.12]);
    for(const height of metal?[.12,.42,.72,.96]:[.31,.7])box(frame,[0,height,0],[1.9,.06,.05]);
    if(metal){for(const x of [-.9,.9])box(frame,[x,.53,0],[.055,.88,.055]);rail([-.87,.16,0],[.87,.93,0],.026,frame);box('#464d46',[.89,.65,.05],[.16,.07,.1]);}
    else for(const x of [-.33,.33])box(post,[x,.49,0],[.08,.98,.08]);
  }
  for(const [color,geometries]of parts){const compatible=geometries.map(g=>{const flat=g.index?g.toNonIndexed():g;flat.deleteAttribute('uv');if(flat!==g)g.dispose();return flat;});const merged=mergeGeometries(compatible,false);for(const geometry of compatible)geometry.dispose();if(!merged)throw new Error(`Unable to merge ${kind} structure geometry`);const mesh=new THREE.Mesh(own(addFarmSurfaceVariation(merged,.15)),own(new THREE.MeshStandardMaterial({color,vertexColors:true,roughness:kind==='gate'?.65:.91,metalness:kind==='gate'?.32:0})));mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);}
  const source=new THREE.Box3().setFromObject(group),size=source.getSize(new THREE.Vector3()),center=source.getCenter(new THREE.Vector3()),scale=1/Math.max(size.x,size.z);
  const matrix=new THREE.Matrix4().makeScale(scale,scale,scale).multiply(new THREE.Matrix4().makeTranslation(-center.x,-source.min.y,-center.z));
  for(const child of group.children)(child as THREE.Mesh).geometry.applyMatrix4(matrix);
  const bounds=new THREE.Box3().setFromObject(group);group.name=`structure-${kind}`;
  group.userData={kind,illustrative:true,units:'visual-units',bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},footprintRadius:Math.hypot(size.x*scale/2,size.z*scale/2),triangleCount:group.children.reduce((n,child)=>n+(child as THREE.Mesh).geometry.attributes.position.count/3,0),drawCalls:group.children.length};
  return group;
}
