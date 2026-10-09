#!/usr/bin/env python3
"""Verifica la integridad del paquete local con Python 3, sin red ni dependencias."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parent
manifest = json.loads((root / 'MANIFIESTO.json').read_text(encoding='utf-8'))
errors = []
for entry in manifest['files']:
    relative = Path(entry['path'])
    if relative.is_absolute() or '..' in relative.parts:
        errors.append(f"Ruta no válida: {entry['path']}")
        continue
    path = root / relative
    if not path.is_file():
        errors.append(f"Falta: {entry['path']}")
        continue
    data = path.read_bytes()
    if len(data) != entry['bytes'] or hashlib.sha256(data).hexdigest() != entry['sha256']:
        errors.append(f"No coincide: {entry['path']}")
if errors:
    print('\n'.join(errors))
    raise SystemExit(1)
print(f"Correcto: {len(manifest['files'])} archivos coinciden con el manifiesto.")
