import * as THREE from 'three';
import type {LibraryAnimalSpecies, OwnFarmResource} from './farm-3d-assets';

type Surface = 'skin' | 'hair' | 'wool' | 'feather';
const DETAIL_SIZE = 64;
const profiles: Record<LibraryAnimalSpecies, {surface: Surface; strength: number; roughness: number}> = {
  pig: {surface: 'skin', strength: .075, roughness: .8},
  cattle: {surface: 'hair', strength: .13, roughness: .86},
  horse: {surface: 'hair', strength: .09, roughness: .76},
  goat: {surface: 'hair', strength: .14, roughness: .87},
  rabbit: {surface: 'hair', strength: .12, roughness: .9},
  sheep: {surface: 'wool', strength: .18, roughness: .96},
  hen: {surface: 'feather', strength: .1, roughness: .85},
  duck: {surface: 'feather', strength: .08, roughness: .82},
  rooster: {surface: 'feather', strength: .1, roughness: .85},
};

/** Original, periodic microrelief. No color pixels or third-party assets are used. */
function microNormal(surface: Surface) {
  const height = new Float32Array(DETAIL_SIZE * DETAIL_SIZE);
  const noise = (x: number, y: number) => {
    let n = Math.imul(x + 1, 374761393) ^ Math.imul(y + 1, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  };
  for (let y = 0; y < DETAIL_SIZE; y++) for (let x = 0; x < DETAIL_SIZE; x++) {
    const u = x * Math.PI * 2 / DETAIL_SIZE, v = y * Math.PI * 2 / DETAIL_SIZE;
    const grain = noise(x, y) - .5;
    height[y * DETAIL_SIZE + x] = surface === 'skin' ? grain * .18
      : surface === 'wool' ? .22 * Math.sin(u * 8 + Math.sin(v * 4)) * Math.cos(v * 8) + grain * .15
      : surface === 'feather' ? .17 * Math.sin(u * 16 + .65 * Math.sin(v * 4)) + grain * .07
      : .2 * Math.sin(u * 16 + .5 * Math.sin(v * 3)) + grain * .1;
  }
  const at = (x: number, y: number) => height[((y + DETAIL_SIZE) % DETAIL_SIZE) * DETAIL_SIZE + (x + DETAIL_SIZE) % DETAIL_SIZE];
  const pixels = new Uint8Array(DETAIL_SIZE * DETAIL_SIZE * 4);
  for (let y = 0; y < DETAIL_SIZE; y++) for (let x = 0; x < DETAIL_SIZE; x++) {
    const nx = at(x - 1, y) - at(x + 1, y), ny = at(x, y - 1) - at(x, y + 1);
    const length = Math.hypot(nx, ny, 1), i = (y * DETAIL_SIZE + x) * 4;
    pixels[i] = Math.round((nx / length * .5 + .5) * 255);
    pixels[i + 1] = Math.round((ny / length * .5 + .5) * 255);
    pixels[i + 2] = Math.round((1 / length * .5 + .5) * 255);
    pixels[i + 3] = 255;
  }
  const texture = new THREE.DataTexture(pixels, DETAIL_SIZE, DETAIL_SIZE, THREE.RGBAFormat);
  texture.name = `farm-animal-${surface}-micro-normal`;
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.flipY = false;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Create once per scene and apply to each loaded GLB before instanceFarmModel.
 * At most four shared 64² normal maps: 64 KiB base pixels, <86 KiB with mipmaps.
 * No added meshes, draws, per-frame work, requests, color changes, or geometry edits.
 * Keep the current illustrative anatomy; surface detail does not make a scan/rig.
 */
export function createFarmAnimalMaterialDetail(own: OwnFarmResource) {
  const textures = new Map<Surface, THREE.DataTexture>();
  const applied = new WeakSet<THREE.Material>();
  return (root: THREE.Object3D, species: LibraryAnimalSpecies) => {
    const profile = profiles[species];
    const candidates = new Map<THREE.MeshStandardMaterial, boolean>();
    root.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const hasUv = Boolean(object.geometry.getAttribute('uv'));
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        if (material instanceof THREE.MeshStandardMaterial) candidates.set(material, hasUv && candidates.get(material) !== false);
      }
    });
    let enhanced = 0;
    for (const [material, hasUv] of candidates) {
      // Explicit names protect eyes, wet noses, hoof/horn keratin and bill colors.
      const coat = material.name === 'Animal coat' || (species === 'cattle' && material.name === 'Dairy coat markings');
      const plumage = profile.surface === 'feather' && ['Bird plumage', 'Layered flight feather plumage'].includes(material.name);
      if ((!coat && !plumage) || !hasUv || applied.has(material) || material.normalMap || material.bumpMap || material.roughnessMap) continue;
      let texture = textures.get(profile.surface);
      if (!texture) {
        texture = own(microNormal(profile.surface));
        textures.set(profile.surface, texture);
      }
      material.normalMap = texture;
      material.normalScale.set(profile.strength, profile.strength);
      material.roughness = Math.max(material.roughness, profile.roughness);
      material.needsUpdate = true;
      applied.add(material);
      enhanced++;
    }
    return enhanced;
  };
}
