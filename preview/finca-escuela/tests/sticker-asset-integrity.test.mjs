import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { inflateRawSync, inflateSync } from 'node:zlib';

const root = fileURLToPath(new URL('..', import.meta.url));
const { items, packs } = JSON.parse(readFileSync(root + 'lib/sticker-assets.json', 'utf8'));
const mediaKeys = ['download', 'compactDownload', 'thumbnail'];
const sourceBytes = media => readFileSync(root + 'public' + media.src);
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

// PNG chunks and ZIP entries use the same standard CRC-32 polynomial.
const crcTable = Uint32Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  return crc >>> 0;
});
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

function paeth(left, above, upperLeft) {
  const prediction = left + above - upperLeft;
  const a = Math.abs(prediction - left);
  const b = Math.abs(prediction - above);
  const c = Math.abs(prediction - upperLeft);
  return a <= b && a <= c ? left : b <= c ? above : upperLeft;
}

// The reviewed PNGs are non-interlaced, 8-bit indexed or RGBA images. Decode
// their scanlines here so an opaque/blank replacement cannot pass on metadata.
function readPng(bytes, label) {
  assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), label);
  const chunks = [];
  let offset = 8;
  while (offset < bytes.length) {
    assert.ok(offset + 12 <= bytes.length, `${label}: truncated PNG chunk`);
    const length = bytes.readUInt32BE(offset);
    const end = offset + 12 + length;
    assert.ok(end <= bytes.length, `${label}: truncated PNG payload`);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    assert.equal(crc32(bytes.subarray(offset + 4, offset + 8 + length)), bytes.readUInt32BE(offset + 8 + length), `${label}: ${type} CRC`);
    chunks.push({ type, data });
    offset = end;
    if (type === 'IEND') break;
  }
  assert.equal(offset, bytes.length, `${label}: trailing PNG data`);
  assert.equal(chunks[0]?.type, 'IHDR', label);
  assert.equal(chunks.filter(chunk => chunk.type === 'IHDR').length, 1, label);
  assert.equal(chunks.at(-1)?.type, 'IEND', label);
  assert.equal(chunks.at(-1).data.length, 0, label);
  const header = chunks[0].data;
  assert.equal(header.length, 13, label);
  const width = header.readUInt32BE(0), height = header.readUInt32BE(4);
  assert.equal(width, 512, label);
  assert.equal(height, 512, label);
  assert.equal(header[8], 8, `${label}: expected reviewed 8-bit PNG`);
  assert.ok([3, 6].includes(header[9]), `${label}: expected indexed or RGBA PNG`);
  assert.deepEqual([...header.subarray(10)], [0, 0, 0], `${label}: expected non-interlaced standard PNG`);
  const channels = header[9] === 6 ? 4 : 1;
  const stride = width * channels;
  const compressed = chunks.filter(chunk => chunk.type === 'IDAT').map(chunk => chunk.data);
  assert.ok(compressed.length, `${label}: missing image data`);
  const filtered = inflateSync(Buffer.concat(compressed), { maxOutputLength: height * (stride + 1) });
  assert.equal(filtered.length, height * (stride + 1), label);
  const pixels = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = filtered[y * (stride + 1)];
    assert.ok(filter <= 4, `${label}: invalid PNG filter`);
    for (let x = 0; x < stride; x++) {
      const position = y * stride + x;
      const left = x >= channels ? pixels[position - channels] : 0;
      const above = y ? pixels[position - stride] : 0;
      const upperLeft = y && x >= channels ? pixels[position - stride - channels] : 0;
      const predictor = [0, left, above, Math.floor((left + above) / 2), paeth(left, above, upperLeft)][filter];
      pixels[position] = (filtered[y * (stride + 1) + x + 1] + predictor) & 255;
    }
  }
  const palette = chunks.find(chunk => chunk.type === 'PLTE')?.data;
  const transparency = chunks.find(chunk => chunk.type === 'tRNS')?.data;
  if (channels === 1) {
    assert.ok(palette?.length && palette.length % 3 === 0 && palette.length <= 768, `${label}: invalid palette`);
    assert.ok(transparency?.length && transparency.length <= palette.length / 3, `${label}: missing palette alpha`);
  }
  let transparent = 0, nearOpaque = 0;
  const bounds = [width, height, -1, -1];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const position = (y * width + x) * channels;
      if (channels === 1) assert.ok(pixels[position] < palette.length / 3, `${label}: palette index out of range`);
      const alpha = channels === 4 ? pixels[position + 3] : (transparency[pixels[position]] ?? 255);
      if (alpha === 0) transparent++;
      // Palette quantization can average fully opaque pixels down to 254.
      if (alpha >= 254) nearOpaque++;
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) assert.equal(alpha, 0, `${label}: nontransparent edge at ${x},${y}`);
      if (alpha) {
        bounds[0] = Math.min(bounds[0], x);
        bounds[1] = Math.min(bounds[1], y);
        bounds[2] = Math.max(bounds[2], x);
        bounds[3] = Math.max(bounds[3], y);
      }
    }
  }
  assert.ok(transparent > 0 && nearOpaque > 0, `${label}: must contain both transparent background and visible artwork`);
  return { width, height, bounds };
}

function readWebpHeader(bytes, label) {
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', label);
  assert.equal(bytes.readUInt32LE(4) + 8, bytes.length, label);
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', label);
  assert.equal(bytes.toString('ascii', 12, 16), 'VP8X', `${label}: expected extended WebP header`);
  assert.equal(bytes.readUInt32LE(16), 10, label);
  assert.ok(bytes[20] & 0x10, `${label}: WebP alpha flag missing`);
  return { width: bytes.readUIntLE(24, 3) + 1, height: bytes.readUIntLE(27, 3) + 1 };
}

// Parse these small, single-disk non-ZIP64 archives with Node built-ins.
// Validate actual decompression/CRC and both local and central directory names.
function readZip(bytes, label) {
  let end = -1;
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65557); offset--) {
    if (bytes.readUInt32LE(offset) === 0x06054b50 && offset + 22 + bytes.readUInt16LE(offset + 20) === bytes.length) {
      end = offset;
      break;
    }
  }
  assert.ok(end >= 0, `${label}: missing ZIP end record`);
  assert.equal(bytes.readUInt16LE(end + 4), 0, label);
  assert.equal(bytes.readUInt16LE(end + 6), 0, label);
  const count = bytes.readUInt16LE(end + 10);
  assert.equal(bytes.readUInt16LE(end + 8), count, label);
  const directorySize = bytes.readUInt32LE(end + 12);
  const directoryStart = bytes.readUInt32LE(end + 16);
  assert.equal(directoryStart + directorySize, end, label);
  const members = new Map();
  let offset = directoryStart, nextLocalOffset = 0;
  const timestamps = new Set();
  for (let index = 0; index < count; index++) {
    assert.ok(offset + 46 <= end, `${label}: truncated central directory`);
    assert.equal(bytes.readUInt32LE(offset), 0x02014b50, label);
    const flags = bytes.readUInt16LE(offset + 8), method = bytes.readUInt16LE(offset + 10);
    assert.equal(flags & 0x9, 0, `${label}: unexpected encryption or data descriptor`);
    assert.ok([0, 8].includes(method), `${label}: unsupported ZIP compression`);
    const timestamp = bytes.readUInt32LE(offset + 12);
    timestamps.add(timestamp);
    const checksum = bytes.readUInt32LE(offset + 16);
    const compressedSize = bytes.readUInt32LE(offset + 20), size = bytes.readUInt32LE(offset + 24);
    const nameLength = bytes.readUInt16LE(offset + 28), extraLength = bytes.readUInt16LE(offset + 30), commentLength = bytes.readUInt16LE(offset + 32);
    assert.equal(bytes.readUInt16LE(offset + 34), 0, label);
    const nameBytes = bytes.subarray(offset + 46, offset + 46 + nameLength);
    const name = nameBytes.toString('utf8');
    assert.match(name, /^(?:[a-z0-9-]+\.png|LEEME\.txt)$/, `${label}: unsafe/unexpected ZIP name`);
    assert.ok(!members.has(name), `${label}: duplicate ZIP member ${name}`);
    const local = bytes.readUInt32LE(offset + 42);
    assert.equal(local, nextLocalOffset, `${label}: unexpected hidden or overlapping local entry`);
    assert.equal(bytes.readUInt32LE(local), 0x04034b50, label);
    assert.equal(bytes.readUInt16LE(local + 6), flags, label);
    assert.equal(bytes.readUInt16LE(local + 8), method, label);
    assert.equal(bytes.readUInt32LE(local + 10), timestamp, label);
    assert.equal(bytes.readUInt32LE(local + 14), checksum, label);
    assert.equal(bytes.readUInt32LE(local + 18), compressedSize, label);
    assert.equal(bytes.readUInt32LE(local + 22), size, label);
    const localNameLength = bytes.readUInt16LE(local + 26), localExtraLength = bytes.readUInt16LE(local + 28);
    assert.deepEqual(bytes.subarray(local + 30, local + 30 + localNameLength), nameBytes, label);
    const payloadStart = local + 30 + localNameLength + localExtraLength;
    const payloadEnd = payloadStart + compressedSize;
    assert.ok(payloadEnd <= directoryStart, `${label}: invalid ZIP payload bounds`);
    const compressed = bytes.subarray(payloadStart, payloadEnd);
    const raw = method === 8 ? inflateRawSync(compressed, { maxOutputLength: 1024 * 1024 }) : compressed;
    assert.equal(raw.length, size, `${label}: ${name} size`);
    assert.equal(crc32(raw), checksum, `${label}: ${name} CRC`);
    members.set(name, raw);
    nextLocalOffset = payloadEnd;
    offset += 46 + nameLength + extraLength + commentLength;
  }
  assert.equal(offset, end, label);
  assert.equal(nextLocalOffset, directoryStart, label);
  assert.equal(timestamps.size, 1, `${label}: ZIP entries must use one fixed timestamp`);
  return members;
}

test('all 76 reviewed stickers and both ZIPs have unique IDs, paths, correct bytes and content hashes', () => {
  assert.equal(items.length, 76);
  assert.equal(new Set(items.map(item => item.id)).size, items.length);
  assert.deepEqual(packs.map(pack => pack.id).sort(), ['coleccion-compacta', 'coleccion-completa']);
  const paths = new Set(), imageHashes = new Set();
  for (const media of [...items.flatMap(item => mediaKeys.map(key => item[key])), ...packs]) {
    assert.ok(media, 'Every reviewed item needs complete, compact and thumbnail files');
    assert.match(media.src, /^\/sticker-packs\/(?:png\/|compact\/|thumbs\/)?[a-z0-9-]+-[a-f0-9]{10}\.(?:png|webp|zip)$/);
    assert.ok(!paths.has(media.src), `Duplicate asset path: ${media.src}`);
    paths.add(media.src);
    const raw = sourceBytes(media);
    assert.equal(raw.length, media.bytes, media.src);
    const digest = sha256(raw);
    assert.equal(basename(media.src).match(/-([a-f0-9]{10})\.[^.]+$/)[1], digest.slice(0, 10), media.src);
    if (!media.src.endsWith('.zip')) {
      assert.ok(!imageHashes.has(digest), `Duplicate image bytes: ${media.src}`);
      imageHashes.add(digest);
    }
  }
});

test('PNG pixels preserve transparency and padding; compact artwork is smaller; thumbnail headers match', () => {
  for (const item of items) {
    const full = readPng(sourceBytes(item.download), item.download.src);
    const compact = readPng(sourceBytes(item.compactDownload), item.compactDownload.src);
    for (const [image, media] of [[full, item.download], [compact, item.compactDownload]]) {
      assert.equal(image.width, media.width, media.src);
      assert.equal(image.height, media.height, media.src);
      assert.ok(media.bytes < 102400, `${media.src}: exceeds the reviewed PNG size budget`);
    }
    assert.ok(compact.bounds[2] - compact.bounds[0] < full.bounds[2] - full.bounds[0], `${item.id}: compact width must shrink`);
    assert.ok(compact.bounds[3] - compact.bounds[1] < full.bounds[3] - full.bounds[1], `${item.id}: compact height must shrink`);
    const thumbnail = readWebpHeader(sourceBytes(item.thumbnail), item.thumbnail.src);
    assert.deepEqual(thumbnail, { width: 256, height: 256 }, item.thumbnail.src);
    assert.deepEqual(thumbnail, { width: item.thumbnail.width, height: item.thumbnail.height }, item.thumbnail.src);
  }
});

test('ZIP membership, CRCs and extracted PNG bytes match all 76 current catalog sources exactly', () => {
  const allIds = items.map(item => item.id).sort();
  for (const pack of packs) {
    assert.equal(new Set(pack.itemIds).size, pack.itemIds.length, pack.id);
    assert.deepEqual([...pack.itemIds].sort(), allIds, pack.id);
    const members = readZip(sourceBytes(pack), pack.src);
    assert.deepEqual([...members.keys()].sort(), [...allIds.map(id => `${id}.png`), 'LEEME.txt'].sort(), pack.id);
    const key = pack.id === 'coleccion-compacta' ? 'compactDownload' : 'download';
    for (const item of items) assert.deepEqual(members.get(`${item.id}.png`), sourceBytes(item[key]), `${pack.id}: ${item.id}`);
    const readme = members.get('LEEME.txt').toString('utf8');
    assert.match(readme, /Venezuela Agro/);
    assert.match(readme, /uso personal/);
    assert.match(readme, /no instala un pack nativo de WhatsApp/);
    assert.match(readme, /compacta/);
  }
});

test('all 20 human pairs, including professionals, contain exactly one woman and one man', () => {
  const humans = items.filter(item => item.characterVariant || item.pairId || item.familyId.startsWith('agricultores-') || item.familyId === 'profesionales');
  assert.equal(humans.length, 40);
  const pairs = new Map();
  for (const item of humans) {
    assert.ok(item.pairId, item.id);
    assert.ok(['woman', 'man'].includes(item.characterVariant), item.id);
    const members = pairs.get(item.pairId) ?? [];
    members.push(item);
    pairs.set(item.pairId, members);
  }
  assert.equal(pairs.size, 20);
  for (const [pairId, members] of pairs) {
    assert.deepEqual(members.map(item => item.characterVariant).sort(), ['man', 'woman'], pairId);
    assert.equal(new Set(members.map(item => item.familyId)).size, 1, pairId);
    assert.equal(new Set(members.map(item => item.familyName)).size, 1, pairId);
  }
});

test('the eight new crop stickers have their exact reviewed identities and unique search aliases', () => {
  const expectedIds = [];
  for (const crop of ['apio', 'perejil', 'cilantro', 'fresa']) {
    for (const [variant, suffix, occupation, legacy] of [['woman', 'mujer', 'cosechadora', 'agricultora'], ['man', 'hombre', 'cosechador', 'agricultor']]) {
      const pairId = `agricultores-cosecha-agricultor-con-${crop}`;
      const id = `${pairId}--${suffix}`;
      expectedIds.push(id);
      const matches = items.filter(item => item.id === id);
      assert.equal(matches.length, 1, id);
      const item = matches[0];
      assert.equal(item.name, `${occupation[0].toUpperCase()}${occupation.slice(1)} de ${crop === 'apio' ? 'apio criollo' : crop}`, id);
      assert.equal(item.familyId, 'agricultores-cosecha', id);
      assert.equal(item.pairId, pairId, id);
      assert.equal(item.characterVariant, variant, id);
      const expectedAliases = [crop, occupation, suffix, legacy, ...(crop === 'apio' ? ['arracacha'] : [])];
      assert.equal(new Set(item.aliases).size, item.aliases.length, `${id}: duplicate aliases`);
      assert.deepEqual([...item.aliases].sort(), expectedAliases.sort(), id);
    }
  }
  const additions = items.filter(item => /^agricultores-cosecha-agricultor-con-(apio|perejil|cilantro|fresa)--/.test(item.id));
  assert.deepEqual(additions.map(item => item.id).sort(), expectedIds.sort());
});

test('the new 18 nonhuman illustrations match their reviewed composition manifest', () => {
  const manifest = JSON.parse(readFileSync(root + 'docs/qa/STICKER-EXPANSION-2026-10-15.json', 'utf8'));
  assert.equal(manifest.items.length, 18);
  assert.deepEqual(manifest.items.map(item => item.id).sort(), [
    'animales-cerdo', 'animales-cabra', 'animales-conejo', 'animales-pato', 'animales-tilapia', 'animales-abeja',
    'cultivos-maiz', 'cultivos-yuca', 'cultivos-cacao', 'cultivos-cafe', 'cultivos-platano', 'cultivos-aguacate',
    'herramientas-machete', 'herramientas-pala', 'herramientas-rastrillo', 'herramientas-regadera', 'herramientas-carretilla', 'herramientas-botas-de-trabajo',
  ].sort());
  assert.equal(items.filter(item => !item.characterVariant).length, 36);
  for (const reviewed of manifest.items) {
    const item = items.find(item => item.id === reviewed.id);
    assert.ok(item, reviewed.id);
    assert.equal(item.name, reviewed.name);
    assert.equal(item.familyId, reviewed.familyId);
    assert.equal(item.characterVariant, undefined);
    assert.equal(item.pairId, undefined);
    assert.equal(new Set(item.aliases).size, item.aliases.length);
    assert.match(reviewed.sourceSha256, /^[a-f0-9]{64}$/);
    for (const key of mediaKeys) {
      assert.equal(item[key].src, reviewed.outputs[key].src);
      assert.equal(item[key].bytes, reviewed.outputs[key].bytes);
      assert.equal(sha256(sourceBytes(item[key])), reviewed.outputs[key].sha256);
    }
  }
});

test('published v124 and v125 ZIP links remain byte-identical for already-open pages', () => {
  const previous = JSON.parse(readFileSync(root + 'docs/qa/STICKER-LEGACY-PACKS-2026-10-15.json', 'utf8'));
  assert.equal(previous.length, 4);
  for (const pack of previous) {
    assert.equal(sourceBytes(pack).length, pack.bytes, pack.src);
    assert.equal(sha256(sourceBytes(pack)), pack.sha256, pack.src);
  }
});
