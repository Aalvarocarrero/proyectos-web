from pathlib import Path
import hashlib,json
root=Path.cwd()
for name,expected in json.loads((root/'ci/source-manifest.json').read_text()).items():
 p=root/name
 assert p.is_file() and not p.is_symlink(),name
 assert hashlib.sha256(p.read_bytes()).hexdigest()==expected,name
print('Source and CI manifest verified')
