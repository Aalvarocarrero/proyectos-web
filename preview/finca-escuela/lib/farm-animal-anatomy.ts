import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import type {LibraryAnimalSpecies} from './farm-3d-assets';

const smooth = (a: number, b: number, value: number) => THREE.MathUtils.smoothstep(value, a, b);
/** Bounded presentation correction for the bundled CC0 meshes, not breed/sex inference.
 * Operates once before instancing; applies identical spatial fields to all material
 * islands so eyes, markings and snout remain attached. Original assets stay immutable.
 */
export function refineFarmAnimalAnatomy(root: THREE.Object3D, species: LibraryAnimalSpecies) {
  if (root.userData.anatomyRevision === 2) return;
  const materials = new Set<THREE.Material>();
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    const materialName=Array.isArray(object.material)?'':object.material.name;
    if((species==='pig'||species==='cattle')&&materialName==='Animal coat'){
      const ears:THREE.BufferGeometry[]=[];
      for(const side of [-1,1]){
        const ear=new THREE.SphereGeometry(1,12,8);
        // Broad pinnae read as ears rather than the original tiny horn-like points.
        if(species==='pig'){const p=ear.attributes.position;for(let i=0;i<p.count;i++)p.setX(i,p.getX(i)*(1-.7*(p.getY(i)+1)/2));}
        ear.scale(species==='pig'?.13:.12,species==='pig'?.14:.025,species==='pig'?.033:.13);
        ear.rotateX(side*(species==='pig'?.72:.15));
        ear.translate(species==='pig'?.62:.80,species==='pig'?.73:1.35,side*(species==='pig'?.23:.29));ears.push(ear);
      }
      const source=object.geometry;
      const compatible=ears.map(ear=>source.index?ear:ear.toNonIndexed());
      // Keep only common attributes (the bundled meshes use POSITION/NORMAL/UV).
      const merged=mergeGeometries([source,...compatible],false);
      if(merged){object.geometry=merged;source.dispose();}
      for(const ear of new Set([...ears,...compatible]))ear.dispose();
    }
    const geometry = object.geometry, positions = geometry.getAttribute('position');
    if (species === 'pig' || species === 'cattle') {
      for (let i = 0; i < positions.count; i++) {
        let x = positions.getX(i), y = positions.getY(i);const z = positions.getZ(i);
        const eye=['black','white','Warm animal iris'].includes(materialName)&&(species==='pig'?x<.87&&y>.53:x<1.04&&y>1.29);
        if(eye){const cx=species==='pig'?.777: .920,cy=species==='pig'?.563:1.344;x=cx+(x-cx)*.68;y=cy+(y-cy)*.68;}
        let px = x, py = y, pz = z;
        if (species === 'pig') {
          // Short, strong legs, deeper barrel, and an elongated tapering face.
          py = y < .28 ? y * .72 : y - .0784;
          const barrel = (1 - smooth(.30, .67, x)) * smooth(.18, .40, y);
          pz *= 1 + .20 * barrel;
          const face = smooth(.63, .96, x);
          px += .115 * face;
          py -= .028 * face;
          // Broader nose disc remains visibly separate from the tapered bridge.
          pz *= 1 + .12 * smooth(.87, .96, x);
        } else {
          // A bovine face is long and slopes down from the poll, not a round ball.
          const face = smooth(.77, 1.18, x) * (1 - smooth(1.33, 1.49, y));
          px += .13 * face;
          py -= .12 * face;
          pz *= 1 + .07 * face;
        }
        positions.setXYZ(i, px, py, pz);
      }
      positions.needsUpdate = true;
      geometry.computeVertexNormals(); geometry.computeBoundingBox(); geometry.computeBoundingSphere();
    }
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (!(material instanceof THREE.MeshStandardMaterial) || materials.has(material)) continue;
      materials.add(material);
      // Embedded authored maps are preserved, tinted in linear space by Three.Color.
      if (species === 'pig' && material.name === 'Animal coat') material.color.set('#f0c3bb');
      if (species === 'pig' && material.name === 'Pig snout') material.color.set('#e3aaa3');
      // Biological surfaces are dielectric, including the old metallic eye defaults.
      material.metalness = 0;
      material.needsUpdate = true;
    }
  });
  root.userData.anatomyRevision = 2;
}
