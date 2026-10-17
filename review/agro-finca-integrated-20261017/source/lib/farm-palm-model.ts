import * as THREE from 'three';
/** Original pinnate fronds and a gently bowed, ringed trunk, reused by instancing.
 * Unit crown radius and 0..1 height. Detail stays below 400 triangles per template. */
export function palmGeometries(){
 const trunk=new THREE.CylinderGeometry(.034,.059,.82,7,6);trunk.translate(0,.41,0);
 const trunkPositions=trunk.getAttribute('position');
 for(let i=0;i<trunkPositions.count;i++){const y=trunkPositions.getY(i),ring=1+.045*Math.cos(y/.82*Math.PI*12);trunkPositions.setXYZ(i,trunkPositions.getX(i)*ring+.024*Math.sin(y/.82*Math.PI*.7),y,trunkPositions.getZ(i)*ring);}trunk.computeVertexNormals();
 const positions:number[]=[],colors:number[]=[];
 for(let leaf=0;leaf<10;leaf++){
  const angle=leaf*Math.PI*2/10+.09*Math.sin(leaf*3),cos=Math.cos(angle),sin=Math.sin(angle),length=.85+.12*Math.sin(leaf*2.4),shade=leaf%3;
  const point=(t:number,side:number)=>{const reach=t*length;return [cos*reach-sin*side,.81+.17*Math.sin(Math.PI*t)-.15*t*t,sin*reach+cos*side];};
  const triangle=(a:number[],b:number[],c:number[])=>{positions.push(...a,...b,...c);for(let v=0;v<3;v++)colors.push(.14+shade*.022,.29+shade*.035,.075+shade*.014);};
  // A thin central rachis plus separated, downward folded leaflets. Gaps reveal sky.
  for(let segment=0;segment<4;segment++){const t=segment/4,u=(segment+1)/4;triangle(point(t,-.008),point(t,.008),point(u,0));}
  for(let i=0;i<12;i++){const t=.13+i*.065,width=.12*Math.sin(t*Math.PI);for(const side of [-1,1]){const tip=point(Math.min(1,t+.12),side*width);tip[1]-=.023;triangle(point(t,0),tip,point(t+.045,side*.009));}}
 }
 const fronds=new THREE.BufferGeometry();fronds.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));fronds.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));fronds.computeVertexNormals();return {trunk,fronds};
}
