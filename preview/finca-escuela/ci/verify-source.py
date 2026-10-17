from pathlib import Path
import hashlib,json
manifest=json.loads(Path('ci/source-manifest.json').read_text())
for entry in manifest['source_files']:
    p=Path(entry['path'])
    assert p.is_file() and not p.is_symlink(),entry['path']
    assert hashlib.sha256(p.read_bytes()).hexdigest()==entry['sha256'], 'Source mismatch: '+entry['path']
print('Verified source snapshot',manifest['source_commit'])
