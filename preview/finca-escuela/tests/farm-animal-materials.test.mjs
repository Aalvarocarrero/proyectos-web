import assert from 'node:assert/strict';
import test, {after} from 'node:test';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import * as THREE from 'three';
import {createServer} from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const vite = await createServer({root, configFile: false, appType: 'custom', resolve: {alias: {'@': root}}, server: {middlewareMode: true, hmr: false, ws: false, watch: null}});
after(() => vite.close());
const {createFarmAnimalMaterialDetail} = await vite.ssrLoadModule('/lib/farm-animal-materials.ts');
const assets = await vite.ssrLoadModule('/lib/farm-3d-assets.ts');
const scene = (material, uv = true) => {
  const geometry = new THREE.SphereGeometry(1, 8, 6);
  if (!uv) geometry.deleteAttribute('uv');
  return new THREE.Mesh(geometry, material);
};
const coat = () => new THREE.MeshStandardMaterial({name: 'Animal coat', map: new THREE.Texture(), color: '#d4baa7', roughness: .72});

test('coat detail preserves color, embedded map, shape and material identity', () => {
  const owned = [], enhance = createFarmAnimalMaterialDetail(resource => (owned.push(resource), resource));
  const material = coat(), model = scene(material), positions = model.geometry.attributes.position.array.slice(), map = material.map, color = material.color.clone();
  assert.equal(enhance(model, 'pig'), 1);
  assert.equal(model.material, material);
  assert.equal(material.map, map);
  assert.ok(material.color.equals(color));
  assert.deepEqual(model.geometry.attributes.position.array, positions);
  assert.equal(material.roughness, .8);
  assert.deepEqual(material.normalScale.toArray(), [.075, .075]);
  assert.equal(owned.length, 1);
  assert.equal(enhance(model, 'pig'), 0, 'repeat application is idempotent');
  assert.equal(owned.length, 1);
});

test('eyes, snout, hoof, horn, comb, beak and unknown materials stay authored', () => {
  const enhance = createFarmAnimalMaterialDetail(resource => resource);
  for (const name of ['black', 'white', 'Warm animal iris', 'Pig snout', 'Warm charcoal hoof keratin', 'Horn keratin', 'Comb carmine', 'Ochre beak and feet', 'Rabbit ear inner', 'Mallard green head', 'future imported coat']) {
    const material = coat(); material.name = name;
    assert.equal(enhance(scene(material), 'pig'), 0, name);
    assert.equal(material.normalMap, null);
    assert.equal(material.roughness, .72);
  }
});

test('authored normal, bump or roughness maps and missing UVs are never overwritten', () => {
  const enhance = createFarmAnimalMaterialDetail(() => {throw Error('no texture should be allocated');});
  for (const key of ['normalMap', 'bumpMap', 'roughnessMap']) {
    const material = coat(), existing = new THREE.Texture(); material[key] = existing;
    assert.equal(enhance(scene(material), 'cattle'), 0);
    assert.equal(material[key], existing);
    assert.equal(material.roughness, .72);
  }
  const material = coat();
  assert.equal(enhance(scene(material, false), 'cattle'), 0);
  const mixed = new THREE.Group(); mixed.add(scene(material), scene(material, false));
  assert.equal(enhance(mixed, 'cattle'), 0, 'a shared material must have UVs on every mesh');
  assert.equal(enhance(scene(new THREE.MeshBasicMaterial({name: 'Animal coat'})), 'cattle'), 0);
});

test('four deterministic shared 64-square mipmapped data textures bound memory and distant aliasing', () => {
  const owned = [], enhance = createFarmAnimalMaterialDetail(resource => (owned.push(resource), resource));
  const maps = [];
  for (const species of assets.FARM_LIBRARY_MODELS) {
    const material = coat(); if (['hen', 'duck', 'rooster'].includes(species)) material.name = 'Bird plumage';
    enhance(scene(material), species); maps.push(material.normalMap);
  }
  assert.equal(owned.length, 4);
  assert.equal(new Set(maps).size, 4);
  assert.equal(owned.reduce((n, texture) => n + texture.image.data.byteLength, 0), 65536);
  for (const texture of owned) {
    assert.equal(texture.image.width, 64); assert.equal(texture.image.height, 64);
    assert.equal(texture.colorSpace, THREE.NoColorSpace);
    assert.equal(texture.wrapS, THREE.RepeatWrapping); assert.equal(texture.wrapT, THREE.RepeatWrapping);
    assert.equal(texture.minFilter, THREE.LinearMipmapLinearFilter);
    assert.equal(texture.generateMipmaps, true); assert.equal(texture.flipY, false);
    const pixels = texture.image.data;
    for (let i = 0; i < pixels.length; i += 4) {
      assert.equal(pixels[i + 3], 255);
      const normal = [pixels[i], pixels[i + 1], pixels[i + 2]].map(value => value / 255 * 2 - 1);
      assert.ok(Math.abs(Math.hypot(...normal) - 1) < .012);
      assert.ok(normal[2] > .8, 'microrelief is shallow');
    }
  }
  const independentlyOwned = [], anotherScene = createFarmAnimalMaterialDetail(resource => (independentlyOwned.push(resource), resource));
  anotherScene(scene(coat()), 'pig');
  assert.notEqual(independentlyOwned[0], owned[1]);
  assert.deepEqual(independentlyOwned[0].image.data, owned.find(texture => texture.name.includes('skin')).image.data);
});

test('actual nine bundled GLBs retain markings, anatomy, protected materials and instance budgets', async () => {
  const original = {fetch: globalThis.fetch, self: globalThis.self, createImageBitmap: globalThis.createImageBitmap, ProgressEvent: globalThis.ProgressEvent};
  globalThis.self = globalThis;
  globalThis.ProgressEvent = class {constructor(type, props) {Object.assign(this, {type}, props);}};
  // This checks parser/material integration; decoded pixel appearance is reviewed separately.
  globalThis.createImageBitmap = async blob => {
    const bytes = Buffer.from(await blob.arrayBuffer());
    return {width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), close() {}};
  };
  globalThis.fetch = async (input, options) => String(input).startsWith('blob:') ? original.fetch(input, options) : new Response(await readFile(root + 'public' + input));
  const owned = new Set(), own = resource => (owned.add(resource), resource), enhance = createFarmAnimalMaterialDetail(own);
  try {
    for (const species of assets.FARM_LIBRARY_MODELS) {
      const model = await assets.loadFarmModel(species, new AbortController().signal), before = [];
      model.traverse(object => {
        if (!object.isMesh) return;
        before.push({object, geometry: object.geometry, vertices: object.geometry.attributes.position.array.slice(), material: object.material, map: object.material.map, color: object.material.color.clone(), roughness: object.material.roughness});
      });
      const changed = enhance(model, species);
      assert.equal(changed, ['cattle', 'hen', 'duck', 'rooster'].includes(species) ? 2 : 1, species);
      for (const item of before) {
        assert.equal(item.object.geometry, item.geometry);
        assert.deepEqual(item.geometry.attributes.position.array, item.vertices);
        assert.equal(item.object.material, item.material); assert.equal(item.material.map, item.map);
        assert.ok(item.material.color.equals(item.color));
        if (!item.material.normalMap) assert.equal(item.material.roughness, item.roughness);
      }
      const batch = assets.instanceFarmModel(model, Array.from({length: 18}, () => new THREE.Matrix4()), own);
      assert.equal(batch.children.length, before.length, 'no additional material draws');
      assert.ok(batch.children.length <= 8);
      for (const mesh of batch.children) assert.equal(mesh.count, 18);
    }
    const generated = [...owned].filter(resource => resource.isDataTexture);
    assert.equal(generated.length, 4);
    let disposed = 0; for (const texture of generated) texture.addEventListener('dispose', () => disposed++);
    for (const resource of owned) {if (resource.isTexture) assets.closeFarmTexture(resource); resource.dispose();}
    assert.equal(disposed, 4, 'all generated maps participate in the scene resource owner');
  } finally {Object.assign(globalThis, original);}
});
