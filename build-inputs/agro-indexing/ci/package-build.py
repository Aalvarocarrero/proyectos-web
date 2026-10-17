from pathlib import Path
import hashlib,json,os,re,sys,tarfile
root=Path.cwd();out=root/'.ci-output';html_status=int(sys.argv[1]);test_status=int(sys.argv[2])
assert (root/'dist/server/index.js').is_file()
assert (root/'dist/client/.vite/manifest.json').is_file()
omit={'dist/server/vinext-server.json','dist/server/ssr/vinext-server.json'}
files=[]
for p in sorted((root/'dist').rglob('*')):
 rel=p.relative_to(root).as_posix()
 assert not p.is_symlink(),rel
 if not p.is_file() or rel in omit:continue
 assert not any(x.startswith('.env') or x in {'.git','.wrangler','.sites-runtime'} for x in p.relative_to(root).parts),rel
 assert p.suffix not in {'.pem','.key','.sqlite','.db'},rel
 data=p.read_bytes()
 if b'\0' not in data:assert not re.search(rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|github_pat_[A-Za-z0-9_]{30,}|gh[pousr]_[A-Za-z0-9]{30,}',data),rel
 files.append({'path':rel,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
report={'production_source_commit':'f6b3b5e','github_commit':os.getenv('GITHUB_SHA'),'build':'complete','production_html_exit':html_status,'global_tests_exit':test_status,'ready_for_deployment':False,'review':'Review only. Failures are not waived. No Cloudflare upload or deployment performed.','excluded_node_only_metadata':sorted(omit),'files':files}
(out/'BUILD-REVIEW.json').write_text(json.dumps(report,indent=2)+'\n')
with tarfile.open(out/'agro-review-build.tar.gz','w:gz') as t:
 for e in files:t.add(root/e['path'],arcname=e['path'],recursive=False)
 t.add(out/'BUILD-REVIEW.json',arcname='BUILD-REVIEW.json')
 t.add(root/'ci/source-manifest.json',arcname='SOURCE-MANIFEST.json')
print('Complete review-only build packaged; HTML/global exits:',html_status,test_status)
