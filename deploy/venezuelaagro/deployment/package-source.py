import json,hashlib,shutil,subprocess
from pathlib import Path
root=Path('/workspace/scratch/1cce691d0fde');repo=root/'agro-approved-v131-release';out=root/'agro-approved-v131-f6b3b5e';p=out/'deployment'
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip()=='f6b3b5ec1757702dcdc4f743df522faf6a8f5a1f'
assert not out.exists()
p.mkdir(parents=True)
shutil.copytree(repo/'dist',out/'dist')
for f in ['promotion.sh','verify.mjs']:shutil.copyfile(repo/'deployment'/f,p/f)
shutil.copyfile(root/'agro-two-controls-724c5ca/deployment/PRODUCTION-OWNER-PRESERVATION.md',p/'PRODUCTION-OWNER-PRESERVATION.md')
assert (repo/'deployment/wrangler.promotion.json').read_bytes()==(out/'dist/server/wrangler.promotion.json').read_bytes()
assert (repo/'deployment/wrangler.promotion.json').read_bytes()==(root/'agro-two-controls-724c5ca/dist/server/wrangler.promotion.json').read_bytes()
hashes={str(f.relative_to(out)):hashlib.sha256(f.read_bytes()).hexdigest() for f in sorted((out/'dist').rglob('*')) if f.is_file()}
(p/'dist-sha256.json').write_text(json.dumps(hashes,indent=2)+'\n')
measure=json.loads(subprocess.check_output(['node','scripts/measure-offline-scope.mjs'],cwd=repo,text=True));(p/'offline-size.json').write_text(json.dumps(measure,indent=2)+'\n')
for f in Path('/tmp').glob('agro-v131-*.log'):shutil.copyfile(f,p/f.name)
shutil.copyfile(root/'agro-v131-source-changes.patch',p/'source-changes.patch')
subprocess.run(['node','deployment/verify.mjs'],cwd=out,check=True)
print(out)
