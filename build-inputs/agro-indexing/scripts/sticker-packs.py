"""Create deterministic, content-addressed ZIPs from reviewed sticker files."""
import hashlib
import io
import json
import sys
import zipfile
from pathlib import Path

README = '''Venezuela Agro · Imágenes del agro

Ilustraciones originales creadas con asistencia de IA, preparadas con edición gráfica.
PNG de 512 × 512 píxeles con transparencia y marca Venezuela Agro.
Descarga para uso personal. No se concede una licencia comercial o de redistribución.
La versión compacta reduce el tamaño visible de la ilustración, no necesariamente el peso del archivo.
El tamaño y la legibilidad finales dependen de la aplicación.
Este ZIP contiene imágenes; no instala un pack nativo de WhatsApp ni emojis de teclado.
Guarda una imagen en Fotos/Galería, utiliza Crear dentro de la bandeja de stickers de WhatsApp
y revisa el recorte antes de enviarla. Las opciones dependen de la versión de tu aplicación.
Ayuda oficial: https://faq.whatsapp.com/1056840314992666
'''


def build_packs(root, items):
    packs = []
    for key, pack_id, label in [('download', 'coleccion-completa', 'Colección completa'), ('compactDownload', 'coleccion-compacta', 'Colección compacta')]:
        members = [item for item in items if key in item]
        if not members:
            continue
        output = io.BytesIO()
        with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
            for name, raw in [(item['id'] + '.png', (root / 'public' / item[key]['src'].lstrip('/')).read_bytes()) for item in members] + [('LEEME.txt', README.encode())]:
                info = zipfile.ZipInfo(name, (2026, 10, 15, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                info.external_attr = 0o100644 << 16
                archive.writestr(info, raw)
        raw = output.getvalue()
        digest = hashlib.sha256(raw).hexdigest()
        relative = f'/sticker-packs/{pack_id}-{digest[:10]}.zip'
        (root / 'public' / relative.lstrip('/')).write_bytes(raw)
        packs.append({'id': pack_id, 'name': label, 'src': relative, 'bytes': len(raw), 'itemIds': [item['id'] for item in members]})
    return packs


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    path = root / 'lib/sticker-assets.json'
    catalog = json.loads(path.read_text())
    catalog['packs'] = build_packs(root, catalog['items'])
    path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(catalog['packs'], ensure_ascii=False))
