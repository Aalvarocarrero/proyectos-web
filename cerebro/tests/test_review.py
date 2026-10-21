import copy,json,sys,tempfile,unittest,urllib.request,urllib.error
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'app'))
from server import Store
from sync_local import status,acknowledge
from import_shared import adapt
import test_http
class SecurityReview(unittest.TestCase):
 setUp=test_http.HttpTests.setUp
 tearDown=test_http.HttpTests.tearDown
 def request_code(self,path='/',payload=None,headers=None):
  req=urllib.request.Request(self.url+path,data=payload,headers=headers or {})
  try:
   with urllib.request.urlopen(req) as r:return r.status
  except urllib.error.HTTPError as e:return e.code
 def test_origin_write_content_type_and_traversal(self):
  headers={'Content-Type':'application/json','X-Cerebro-Token':'test-token','Origin':'https://foreign.invalid'}
  body=json.dumps({'revision':self.s.revision(),'action':'backup'}).encode()
  self.assertEqual(self.request_code('/api/action',body,headers),403)
  self.assertEqual(self.request_code('/api/state',headers={'Origin':'null'}),403)
  self.assertEqual(self.request_code('/api/state',headers={'Sec-Fetch-Site':'cross-site'}),403)
  headers['Origin']=self.url
  self.assertEqual(self.request_code('/api/action',body,headers),200)
  headers['Content-Type']='text/plain'
  self.assertEqual(self.request_code('/api/action',body,headers),400)
  for path in ['/../app/server.py','/%2e%2e/app/server.py','/api/../../journal.jsonl','/app/server.py']:
   self.assertEqual(self.request_code(path),404)
 def test_malformed_evidence_is_400_without_writing(self):
  e={'id':'p','kind':'project','projectId':'','title':'Ficticio','body':'','status':'pendiente','priority':'media','nextAction':''}
  body=json.dumps({'revision':self.s.revision(),'action':'create','entity':e,'evidence':[123]}).encode()
  self.assertEqual(self.request_code('/api/action',body,{'Content-Type':'application/json','X-Cerebro-Token':'test-token'}),400)
  self.assertFalse(self.s.doc['events'])
class PersistenceReview(unittest.TestCase):
 def test_fsync_failure_freezes_writes_and_restart_reconciles(self):
  with tempfile.TemporaryDirectory() as tmp:
   s=Store(tmp);fragment={'id':'failure-fixture','at':'2026-10-20T00:00:00+00:00','original':'Original','source':'fixture','speaker':'ficticio'}
   with patch('server.os.fsync',side_effect=OSError('fixture IO failure')):
    with self.assertRaises(OSError):s.mutate({'revision':s.revision(),'action':'transcript','fragment':fragment})
   self.assertTrue(s.snapshot()['storageWarning'])
   with self.assertRaises(OSError):s.mutate({'revision':s.revision(),'action':'backup'})
   restored=Store(tmp);self.assertEqual(restored.doc['transcripts'][0]['original'],'Original')
   result=restored.mutate({'revision':restored.revision(),'action':'transcript','fragment':fragment});self.assertTrue(result['duplicate'])
 def test_import_rejects_dangling_transcript_reference(self):
  with tempfile.TemporaryDirectory() as tmp:
   s=Store(tmp);d=copy.deepcopy(s.doc);d['events']=[{'id':'e','at':'2026-10-20T00:00:00+00:00','op':'create','entity':{'id':'p','kind':'project','projectId':'','title':'Ficticio','body':'','status':'pendiente','priority':'media','nextAction':''},'evidence':['transcript:missing']}]
   with self.assertRaises(ValueError):s.mutate({'revision':s.revision(),'action':'import','document':d})
   self.assertFalse(s.log.exists())
 def test_outbox_distinguishes_ids_from_different_streams(self):
  with tempfile.TemporaryDirectory() as tmp:
   s=Store(tmp);e={'id':'entity','kind':'project','projectId':'','title':'Ficticio','body':'','status':'pendiente','priority':'media','nextAction':''}
   result=s.mutate({'revision':s.revision(),'action':'create','entity':e});acknowledge(s,'fixture-peer')
   s.mutate({'revision':s.revision(),'action':'transcript','fragment':{'id':result['eventId'],'at':'2026-10-20T00:00:00Z','original':'Original','source':'fixture','speaker':'ficticio'}})
   self.assertEqual(status(s)['outbox'],['transcripts:'+result['eventId']])
class SnapshotReview(unittest.TestCase):
 def fixture(self):
  return {'schema_version':'1.0','title':'Corte ficticio','exported_at':'2026-10-20T00:00:00Z','source_url':'https://example.invalid/source','user_instructions':['Repetición literal.','Repetición literal.'], 'schedule':{'timezone':'Etc/UTC','starts_on':'2026-10-21','enabled_verified':False,'continuous_compute':False,'slots':[{'time':'08:00','focus':'Ficción'}]},'projects':[{'id':'fiction','name':'Proyecto ficticio','category':'example','canonical_url':'https://example.invalid/project','state':'Estado histórico mixto; no verificado ahora.','last_progress_and_evidence':'Texto original\ncon salto','pending':'Pendiente ficticio','blockers':'Resultado desconocido','next_action':'Revisar evidencia','evidence_urls':['https://example.invalid/project']}]}
 def test_snapshot_lossless_roundtrip_restart_and_dedup(self):
  d=self.fixture();original=json.dumps(d,ensure_ascii=False,indent=2);adapted=adapt(d,'2026-10-20T01:00:00Z',original,['fiction'])
  self.assertEqual([x['original'] for x in adapted['transcripts']],d['user_instructions']);self.assertNotEqual(adapted['transcripts'][0]['id'],adapted['transcripts'][1]['id'])
  source=json.loads(adapted['events'][0]['entity']['body']);self.assertEqual(source['payload'],d);self.assertEqual(source['originalInputText'],original);self.assertFalse(source['provenance']['libraryOriginalRecovered'])
  self.assertEqual(next(e['entity'] for e in adapted['events'] if e['entity']['kind']=='project')['status'],'sin verificar')
  with tempfile.TemporaryDirectory() as tmp:
   s=Store(tmp);s.mutate({'revision':s.revision(),'action':'import','document':adapted});restored=Store(tmp)
   self.assertEqual(restored.doc,adapted);self.assertEqual(restored.mutate({'revision':restored.revision(),'action':'import','document':adapted})['imported'],0)
 def test_types_invalid_and_import_never_executes(self):
  d=self.fixture();d['projects'][0]['evidence_urls']='not a list'
  with self.assertRaises(ValueError):adapt(d,'2026-10-20T01:00:00Z')
  d=self.fixture()
  with tempfile.TemporaryDirectory() as tmp:
   marker=Path(tmp)/'should-not-exist';d['user_instructions'][0]=f"__import__('pathlib').Path({str(marker)!r}).touch()"
   doc=adapt(d,'2026-10-20T01:00:00Z');s=Store(Path(tmp)/'store');s.mutate({'revision':s.revision(),'action':'import','document':doc});self.assertFalse(marker.exists())
if __name__=='__main__':unittest.main()
