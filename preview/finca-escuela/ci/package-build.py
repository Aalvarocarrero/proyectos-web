from pathlib import Path
import hashlib,json,os,sys,tarfile,re
root=Path.cwd();out=root/'.ci-output';status=int(sys.argv[1])
assert (root/'dist/server/index.js').is_file(),'Missing server output'
assert (root/'dist/client/.vite/manifest.json').is_file(),'Missing client manifest'
# Vinext Node prerender configuration is not Worker runtime code and may contain
# build-only generated auth metadata. Exclude it without opening it.
omit={'dist/server/vinext-server.json','dist/server/ssr/vinext-server.json'}
files=[]
for p in sorted((root/'dist').rglob('*')):
    rel=p.relative_to(root).as_posix()
    assert not p.is_symlink(),'Symlink in build: '+rel
    if not p.is_file() or rel in omit:continue
    assert not any(x.startswith('.env') or x in {'.git','.wrangler','.sites-runtime'} for x in p.relative_to(root).parts)
    assert p.suffix not in {'.pem','.key','.sqlite','.db'}
    data=p.read_bytes()
    if b'\0' not in data:
        assert not re.search(rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|github_pat_[A-Za-z0-9_]{30,}|gh[pousr]_[A-Za-z0-9]{30,}',data), 'Credential-shaped output: '+rel
    files.append({'path':rel,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
report={'source_commit':'dc18fe3a645dff1ebf419131edea44e8c39a8457','github_commit':os.getenv('GITHUB_SHA'),'build':'complete','focused_tests':'passed','global_tests_exit':status,'ready_for_deployment':False,'review':'Further approval and source provenance reconciliation required; failed tests are not waived.','excluded_node_only_metadata':sorted(omit),'files':files}
(out/'BUILD-REVIEW.json').write_text(json.dumps(report,indent=2)+'\n')
with tarfile.open(out/'finca-review-build.tar.gz','w:gz') as t:
    for e in files:t.add(root/e['path'],arcname=e['path'],recursive=False)
    t.add(out/'BUILD-REVIEW.json',arcname='BUILD-REVIEW.json')
    t.add(root/'ci/source-manifest.json',arcname='SOURCE-MANIFEST.json')
print('Complete build packaged for review; global test exit:',status)
