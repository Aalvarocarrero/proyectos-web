import * as THREE from 'three';

/** Original deterministic detail: no downloads, canvas, measurements or saved record changes. */
export function createFarmSoilTexture(){
 const size=128,data=new Uint8Array(size*size*4);let seed=1709;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const grain=seed/4294967296,patch=Math.sin(x*Math.PI*2/size*3)*Math.cos(y*Math.PI*2/size*2),value=Math.round(158+patch*13+(grain-.5)*42),i=(y*size+x)*4;
  data[i]=Math.min(255,value+14);data[i+1]=value;data[i+2]=Math.max(0,value-20);data[i+3]=255;
 }
 const texture=new THREE.DataTexture(data,size,size);texture.name='original-soil-grain';texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;return texture;
}

/** Vertex tint varies leaves/boards while keeping material and draw-call budgets unchanged. */
export function addFarmSurfaceVariation(geometry:THREE.BufferGeometry,contrast=.12){
 const position=geometry.getAttribute('position'),colors=new Float32Array(position.count*3);
 for(let i=0;i<position.count;i++){
  const x=position.getX(i),y=position.getY(i),z=position.getZ(i),shade=1-contrast*.65+contrast*(.5+.5*Math.sin(x*17+y*11+z*23));
  colors[i*3]=shade;colors[i*3+1]=Math.min(1,shade+.018);colors[i*3+2]=shade*.98;
 }
 geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));return geometry;
}
