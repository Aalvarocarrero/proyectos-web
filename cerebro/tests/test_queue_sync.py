import copy,sys,tempfile,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'app'))
from server import Store
from sync_local import sync,status
class QueueSyncTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.a=Store(Path(self.tmp.name)/'a');self.b=Store(Path(self.tmp.name)/'b')
 def tearDown(self):self.tmp.cleanup()
 def act(self,s,**kw):return s.mutate({'revision':s.revision(),**kw})
 def project(self,s,id):self.act(s,action='create',entity={'id':id,'kind':'project','projectId':'','title':'Ficción '+id,'body':'','status':'pendiente','priority':'media','nextAction':''})
 def entry(self):return dict(actionId='a1',type='external_send',state='pending',outcome='not_started',checkpoint='',idempotencyKey='mail-fixture-1',title='Envío ficticio, no ejecutar',projectId='p',evidence='')
 def test_queue_restart_and_unknown_guard(self):
  self.project(self.a,'p');e=self.entry();self.act(self.a,action='queue',entry=e);e.update(state='in_progress',outcome='unknown',checkpoint='Intento registrado');self.act(self.a,action='queue',entry=e);reloaded=Store(self.a.path);self.assertEqual(reloaded.doc,self.a.doc)
  e.update(checkpoint='Reintento ciego')
  with self.assertRaises(ValueError):self.act(self.a,action='queue',entry=e)
  e.update(state='blocked');self.act(self.a,action='queue',entry=e);e.update(state='completed',outcome='succeeded')
  with self.assertRaises(ValueError):self.act(self.a,action='queue',entry=e)
  e['evidence']='fixture: comprobación de proveedor ficticio';self.act(self.a,action='queue',entry=e)
 def test_queue_idempotent(self):
  self.project(self.a,'p');e=self.entry();self.act(self.a,action='queue',entry=e);self.assertTrue(self.act(self.a,action='queue',entry=e)['duplicate']);self.assertEqual(len(self.a.doc['actions']),1)
 def test_sync_disjoint_projects_and_ack(self):
  self.project(self.a,'p');self.project(self.b,'q');self.assertTrue(status(self.a)['outbox']);result=sync(self.a.path,self.b.path);self.assertFalse(result['left']['outbox']);self.assertTrue(result['left']['lastSync']);self.assertEqual({e['id']:e for e in Store(self.a.path).doc['events']},{e['id']:e for e in Store(self.b.path).doc['events']});sync(self.a.path,self.b.path)
 def test_divergent_updates_rejected_before_writes(self):
  self.project(self.a,'p');sync(self.a.path,self.b.path);self.a=Store(self.a.path);self.b=Store(self.b.path)
  for s,label in [(self.a,'uno'),(self.b,'dos')]:
   e=copy.deepcopy(s.doc['events'][0]['entity']);e['title']=label;self.act(s,action='update',entity=e)
  before=[s.log.read_bytes() for s in [self.a,self.b]]
  with self.assertRaises(ValueError):sync(self.a.path,self.b.path)
  self.assertEqual(before,[s.log.read_bytes() for s in [self.a,self.b]])
 def test_ledger_sync_does_not_execute_or_duplicate(self):
  self.project(self.a,'p');self.act(self.a,action='queue',entry=self.entry());sync(self.a.path,self.b.path);sync(self.a.path,self.b.path);self.assertEqual(len(Store(self.b.path).doc['actions']),1);self.assertEqual(Store(self.b.path).doc['actions'][0]['state'],'pending')
if __name__=='__main__':unittest.main()
