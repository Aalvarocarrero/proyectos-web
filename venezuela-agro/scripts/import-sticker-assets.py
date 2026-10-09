"""Import only a reviewed, ready subset of the original sticker collection.
Usage: python3 scripts/import-sticker-assets.py READY_MANIFEST CATALOG_PLAN
The manifest must expose entries with ready=true and png512/thumbnail metadata.
This copies known generated assets; it is not an upload or general image decoder.
"""
import hashlib
import json
import re
import shutil
import sys
import zipfile
from pathlib import Path

root = Path(__file__).resolve().parents[1]
manifest = json.loads(Path(sys.argv[1]).read_text())
plan = json.loads(Path(sys.argv[2]).read_text())
families = {row['id']: row['displayName'] for row in plan['families']}
reviewed = [row for row in manifest['entries'] if row.get('ready') is True]
entries = []
pairs = {}
skipped_humans = []
for row in reviewed:
    human = row['family'].startswith('agricultores-') or row.get('characterVariant') is not None or row.get('containsHuman') is True
    if not human:
        entries.append(row)
        continue
    variant, pair_id = row.get('characterVariant'), row.get('pairId')
    if variant not in ('woman', 'man') or not isinstance(pair_id, str) or not pair_id:
        skipped_humans.append(row['id'])
        continue
    group = pairs.setdefault(pair_id, {})
    if variant in group:
        raise ValueError('Duplicate character variant in a pair')
    group[variant] = row
for pair_id, group in pairs.items():
    if set(group) == {'woman', 'man'}:
        if group['woman']['family'] != group['man']['family']:
            raise ValueError('Paired characters must use the same category')
        entries.extend([group['woman'], group['man']])
    else:
        skipped_humans.extend(row['id'] for row in group.values())
if not entries:
    raise SystemExit('No reviewed ready entries. No catalogue was changed.')
items = []
source_root = Path('/workspace/shared/agro-stickers').resolve()
for row in entries:
    if row.get('alphaVerified') is not True:
        raise ValueError('Ready sticker lacks transparency verification')
    sticker_id = row['id']
    if not re.fullmatch(r'[a-z0-9-]+', sticker_id):
        raise ValueError('Invalid sticker id')
    if row['family'] not in families:
        raise ValueError('Unknown ready category')
    converted = {}
    media_specs = [('png512','download','png','png'),('thumbnail','thumbnail','thumbs','webp')]
    if row.get('compactPng512'):
        media_specs.append(('compactPng512','compactDownload','compact','png'))
    for source_key, target_key, directory, extension in media_specs:
        meta = row[source_key]
        source = Path(meta['path']).resolve()
        if not source.is_relative_to(source_root) or source.suffix != '.' + extension:
            raise ValueError('Unexpected asset location or extension')
        raw = source.read_bytes()
        digest = hashlib.sha256(raw).hexdigest()
        if digest != meta['sha256'] or len(raw) != meta['bytes']:
            raise ValueError('Source bytes do not match reviewed manifest')
        relative = f'/sticker-packs/{directory}/{sticker_id}-{digest[:10]}.{extension}'
        target = root / 'public' / relative.lstrip('/')
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
        converted[target_key] = {'src': relative, 'width': meta['width'], 'height': meta['height'], 'bytes': len(raw)}
    items.append({'id': sticker_id, 'name': row['displayName'], 'familyId': row['family'], 'familyName': families[row['family']], 'aliases': row.get('aliases', []), **({'pairId': row['pairId'], 'characterVariant': row['characterVariant']} if row.get('characterVariant') else {}), **converted})
if len({item['id'] for item in items}) != len(items):
    raise ValueError('Duplicate ready sticker ids')
packs = []
readme = 'Venezuela Agro · Imágenes del agro\n\nIlustraciones originales creadas con asistencia de IA. PNG con transparencia y marca.\nDescarga para uso personal. No se concede una licencia comercial o de redistribución.\nEste ZIP contiene imágenes; no instala un pack nativo de WhatsApp. Usa Crear dentro de esa aplicación y revisa el resultado.\n'
for media_key, pack_id, label in [('download','coleccion-completa','Colección completa'),('compactDownload','coleccion-compacta','Colección compacta')]:
    members = [item for item in items if media_key in item]
    if not members:
        continue
    pack_hash = hashlib.sha256(json.dumps([item[media_key] for item in members], sort_keys=True).encode()).hexdigest()[:10]
    relative_zip = f'/sticker-packs/{pack_id}-{pack_hash}.zip'
    zip_path = root / 'public' / relative_zip.lstrip('/')
    with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as pack:
        for item in members:
            pack.write(root / 'public' / item[media_key]['src'].lstrip('/'), f"{item['id']}.png")
        pack.writestr('LEEME.txt', readme)
    with zipfile.ZipFile(zip_path) as pack:
        assert pack.testzip() is None
        assert len([name for name in pack.namelist() if name.endswith('.png')]) == len(members)
    packs.append({'id':pack_id,'name':label,'src':relative_zip,'bytes':zip_path.stat().st_size,'itemIds':[item['id'] for item in members]})
result = {'items': items, 'packs': packs}
(root / 'lib/sticker-assets.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'ready': len(items), 'unpairedOrSupersededHumansSkipped': skipped_humans, 'pngBytes': sum(i['download']['bytes'] for i in items), 'thumbnailBytes': sum(i['thumbnail']['bytes'] for i in items), 'packs': packs}))
