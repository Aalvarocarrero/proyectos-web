from pathlib import Path
out=Path('.ci-output');files=[p for p in out.rglob('*') if p.is_file()]
assert all(not p.is_symlink() for p in out.rglob('*'))
size=sum(p.stat().st_size for p in files)
assert size<=900*1024*1024,f'Refusing upload: {size} bytes exceeds 900 MiB budget'
print('Total artifacts and diagnostics:',size,'bytes; maximum 900 MiB; retention one day')
