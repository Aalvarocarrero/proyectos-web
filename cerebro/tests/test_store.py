import sys,tempfile,unittest,json,copy
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'app'))
from server import Store,validate_document,markdown
class StoreTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.s=Store(self.tmp.name)
 def tearDown(self):self.tmp.cleanup()
 def act(self,**kw):return self.s.mutate({'revision':self.s.revision(),**kw})
 def record(self,id='p',kind='project',**kw):return dict(id=id,kind=kind,projectId='' if kind=='project' else 'p',title='Proyecto ficticio',body='Texto literal\ncon saltos',status='pendiente',priority='sin asignar',nextAction='',**kw)
 def frag(self,id='f'):return dict(id=id,at='2026-10-20T08:00:00+00:00',original='Repetir esto.\nExactamente.',source='fixture',speaker='Persona ficticia')
 def test_restart(self):
  self.act(action='create',entity=self.record());self.act(action='transcript',fragment=self.frag());other=Store(self.tmp.name);self.assertEqual(self.s.doc,other.doc)
 def test_transcript_dedup_and_legitimate_repeat(self):
  self.act(action='transcript',fragment=self.frag());self.assertTrue(self.act(action='transcript',fragment=self.frag())['duplicate']);self.act(action='transcript',fragment=self.frag('f2'));self.assertEqual(len(self.s.doc['transcripts']),2)
 def test_transcript_collision(self):
  self.act(action='transcript',fragment=self.frag());f=self.frag();f['original']='Alterado'
  with self.assertRaises(ValueError):self.act(action='transcript',fragment=f)
 def test_cut_recovers_committed_data(self):
  self.act(action='transcript',fragment=self.frag());self.s.log.write_bytes(self.s.log.read_bytes()+b'{"transcripts":[');other=Store(self.tmp.name);self.assertEqual(other.doc,self.s.doc);self.assertTrue(list(Path(self.tmp.name).glob('interrupted-*')))
 def test_complete_corruption_fails_closed(self):
  self.s.log.write_text('{bad}\n')
  with self.assertRaises(ValueError):Store(self.tmp.name)
 def test_immutable_instruction(self):
  self.act(action='create',entity=self.record());r=self.record('i','instruction');self.act(action='create',entity=r);r['body']='Changed'
  with self.assertRaises(ValueError):self.act(action='update',entity=r)
 def test_stale_revision(self):
  with self.assertRaises(ValueError):self.s.mutate({'revision':'stale','action':'backup'})
 def test_import_idempotent_and_collision(self):
  self.act(action='create',entity=self.record());d=copy.deepcopy(self.s.doc);self.assertEqual(self.act(action='import',document=d)['imported'],0);d['events'][0]['entity']['title']='Changed'
  with self.assertRaises(ValueError):self.act(action='import',document=d)
 def test_invalid_import_atomic(self):
  before=copy.deepcopy(self.s.doc);d=copy.deepcopy(before);d['events']=[{}]
  with self.assertRaises(ValueError):self.act(action='import',document=d)
  self.assertEqual(before,self.s.doc);self.assertEqual(self.s.doc, before)
  self.assertEqual(len(self.s.doc['events']), 0)
 def test_derive_requires_persisted_fragment(self):
  self.act(action='create',entity=self.record())
  with self.assertRaises(ValueError):self.act(action='create',entity=self.record('t','task'),evidence=['transcript:f'])
  self.act(action='transcript',fragment=self.frag());self.act(action='create',entity=self.record('t','task'),evidence=['transcript:f'])
 def test_markdown_roundtrip(self):
  import base64,re
  self.act(action='transcript',fragment=self.frag());md=markdown(self.s.doc);d=json.loads(base64.b64decode(re.search('CEREBRO_JSON_BASE64:(.*?) -->',md)[1]));self.assertEqual(d,self.s.doc)
 def test_backup(self):
  self.act(action='transcript',fragment=self.frag());name=self.act(action='backup')['backup'];self.assertEqual(json.loads((Path(self.tmp.name)/'backups'/name).read_text()),self.s.doc)
if __name__=='__main__':unittest.main()
