"""Prepare the 18 reviewed animal/crop/tool illustrations, without regenerating art.

Usage: python3 scripts/prepare-sticker-expansion.py MASTERS_DIR LOGO_PNG REVIEW_DIR
Requires Pillow, NumPy and SciPy. Source hashes are pinned in the review manifest.
Run scripts/sticker-packs.py afterwards. Original masters stay outside the Site.
"""
from pathlib import Path
import hashlib
import io
import json
import sys

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'docs/qa/STICKER-EXPANSION-2026-10-15.json'


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def normalized_art(path):
    """Discard disconnected alpha speckles; preserve all substantial art parts."""
    image = Image.open(path).convert('RGBA')
    alpha = np.asarray(image.getchannel('A'))
    labels, count = ndimage.label(alpha > 16, structure=np.ones((3, 3)))
    sizes = np.bincount(labels.ravel(), minlength=count + 1)
    kept = sizes >= 64
    kept[0] = False
    # Restore original antialiasing adjacent to the retained silhouette.
    mask = ndimage.binary_dilation(kept[labels], iterations=2)
    image.putalpha(Image.fromarray(np.where(mask, alpha, 0).astype(np.uint8)))
    return image.crop(image.getbbox())


def branded_art(art, logo):
    art.thumbnail((448, 366), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (512, 512))
    group_height = art.height + 10 + 98
    top = (512 - group_height) // 2
    canvas.alpha_composite(art, ((512 - art.width) // 2, top))
    plaque_top = top + art.height + 10
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((34, plaque_top, 477, plaque_top + 97), radius=19,
                           fill=(34, 29, 24, 255), outline=(248, 247, 242, 255), width=4)
    mark = logo.copy()
    mark.thumbnail((414, 82), Image.Resampling.LANCZOS)
    canvas.alpha_composite(mark, ((512 - mark.width) // 2,
                                 plaque_top + (98 - mark.height) // 2))
    return canvas.crop(canvas.getbbox())


def encode(art, item_id, key, directory, span, size, extension):
    fitted = art.copy()
    fitted.thumbnail((span, span), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (size, size))
    canvas.alpha_composite(fitted, ((size - fitted.width) // 2, (size - fitted.height) // 2))
    output = io.BytesIO()
    if extension == 'png':
        canvas.quantize(colors=256, method=Image.Quantize.FASTOCTREE,
                        dither=Image.Dither.NONE).save(output, format='PNG', optimize=True)
    else:
        canvas.save(output, format='WEBP', quality=85, method=6)
    raw = output.getvalue()
    if extension == 'png':
        assert len(raw) < 102400, f'{item_id}: PNG exceeds 100 KiB'
    path = f'/sticker-packs/{directory}/{item_id}-{digest(raw)[:10]}.{extension}'
    (ROOT / 'public' / path.lstrip('/')).write_bytes(raw)
    return {'src': path, 'width': size, 'height': size, 'bytes': len(raw)}, digest(raw)


def main():
    masters, logo_path, review = map(Path, sys.argv[1:4])
    review.mkdir(parents=True, exist_ok=True)
    manifest = json.loads(MANIFEST.read_text())
    assert digest(logo_path.read_bytes()) == manifest['sourceLogoSha256'], 'Official logo changed'
    for entry in manifest['items']:
        assert digest((masters / entry['sourceFile']).read_bytes()) == entry['sourceSha256'], entry['id']
    logo = Image.open(logo_path).convert('RGBA')
    logo.putdata([(248, 247, 242, a) if r > g * 1.25 and r > b * 1.5 else (30, 126, 26, a)
                  for r, g, b, a in list(logo.getdata())])
    logo = logo.crop(logo.getchannel('A').point(lambda value: 255 if value > 16 else 0).getbbox())
    additions = []
    for entry in manifest['items']:
        art = branded_art(normalized_art(masters / entry['sourceFile']), logo)
        art.save(review / (entry['id'] + '.png'))
        item = {key: entry[key] for key in ['id', 'name', 'familyId', 'familyName', 'aliases']}
        entry['outputs'] = {}
        for key, directory, span, size, extension in [
            ('download', 'png', 480, 512, 'png'),
            ('compactDownload', 'compact', 312, 512, 'png'),
            ('thumbnail', 'thumbs', 240, 256, 'webp'),
        ]:
            item[key], sha = encode(art, item['id'], key, directory, span, size, extension)
            entry['outputs'][key] = {'src': item[key]['src'], 'sha256': sha, 'bytes': item[key]['bytes']}
        additions.append(item)
    catalog_path = ROOT / 'lib/sticker-assets.json'
    catalog = json.loads(catalog_path.read_text())
    ids = {item['id'] for item in additions}
    catalog['items'] = additions + [item for item in catalog['items'] if item['id'] not in ids]
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
    manifest['composition'] = {'canvas': 512, 'completeVisibleBox': 480, 'compactVisibleBox': 312,
                               'illustrationFit': [448, 366], 'plaque': [444, 98],
                               'cleanup': 'Discard disconnected alpha components below 64 source pixels; retain original antialiasing within two pixels of retained components.'}
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps([{key: item[key] for key in ['id', 'download', 'compactDownload']}
                      for item in additions], ensure_ascii=False))


if __name__ == '__main__':
    main()
