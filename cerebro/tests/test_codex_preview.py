import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'app'))
from codex_preview import CodexPreview
from codex_app_server import AppServerError
class Store:
 def project_memory(self,project,limit):
  if project not in ['a','b']:raise KeyError('missing')
  return {'records':[{'id':project+'1','at':'2026-01-01','type':'task','title':'Tarea','content':'Revisar pruebas'}, {'id':project+'2','at':'2026-01-01','type':'task','title':'Secreto','content':'api_key=synthetic'}, {'id':project+'3','at':'2026-01-01','type':'transcript','title':'Audio','content':'texto privado'}]}
class PreviewTests(unittest.TestCase):
 def setUp(self):self.p=CodexPreview(Store());self.body={'projectId':'a','text':'Revisa pruebas','includeMemory':False,'recordIds':[]}
 def test_inactive_never_sends(self):
  with self.assertRaises(AppServerError):self.p.send(self.body)
  self.assertFalse(self.p.status()['enabled'])
 def test_no_memory_default(self):
  r=self.p.preview(self.body);self.assertEqual(r['payload'],'Revisa pruebas');self.assertEqual(r['selected'],[])
 def test_exact_project_and_explicit_selection(self):
  self.body.update(includeMemory=True,recordIds=['a1']);r=self.p.preview(self.body);self.assertEqual([v['id'] for v in r['selected']],['a1']);self.assertEqual(len(r['candidates']),1)
  self.body['projectId']='b'
  with self.assertRaises(ValueError):self.p.preview(self.body)
 def test_reject_sensitive_text(self):
  self.body['text']='contacto prueba@example.com'
  with self.assertRaises(ValueError):self.p.preview(self.body)
 def test_memory_off_rejects_ids(self):
  self.body['recordIds']=['a1']
  with self.assertRaises(ValueError):self.p.preview(self.body)
 def test_digest_changes_with_project(self):
  a=self.p.preview(self.body);self.body['projectId']='b';self.assertNotEqual(a['digest'],self.p.preview(self.body)['digest'])
 def test_cancel_does_not_send(self):self.assertEqual(self.p.cancel('a'),{'state':'inactive','sent':False})

class SendingTests(unittest.TestCase):
 def setUp(self):
  from codex_app_server import AssistantEvent
  class Adapter:
   def __init__(self):self.calls=[]
   def connect(self,**kw):self.calls.append('connect')
   def turn(self,project,text,**kw):
    self.calls.append((project,text));yield AssistantEvent('delta','respuesta parcial',simulation=True);yield AssistantEvent('final_text','respuesta completa',simulation=True);yield AssistantEvent('completed',simulation=True)
   def close(self):self.calls.append('close')
   def cancel(self,p):self.calls.append(('cancel',p))
  self.a=Adapter();self.p=CodexPreview(Store(),self.a);self.b={'projectId':'a','text':'Pregunta ficticia','includeMemory':False,'recordIds':[]}
 def test_exact_preview_sent_and_complete_text(self):
  v=self.p.preview(self.b);r=self.p.send({'preview':self.b,'digest':v['digest'],'id':'one','reviewed':True})
  self.assertEqual(r['text'],'respuesta completa');self.assertTrue(r['simulation']);self.assertIn(('a',v['payload']),self.a.calls);self.assertEqual(self.a.calls[-1],'close')
 def test_stale_preview_never_connects(self):
  v=self.p.preview(self.b);self.b['text']='Otra pregunta'
  with self.assertRaises(ValueError):self.p.send({'preview':self.b,'digest':v['digest'],'id':'one','reviewed':True})
  self.assertEqual(self.a.calls,[])
 def test_unreviewed_never_connects(self):
  with self.assertRaises(ValueError):self.p.send({'preview':self.b,'digest':'x','id':'one','reviewed':False})
  self.assertEqual(self.a.calls,[])
 def test_unknown_result_preserved_no_retry(self):
  def fail(**kw):raise AppServerError('transport_error','Conexión incierta')
  self.a.connect=fail;v=self.p.preview(self.b);r=self.p.send({'preview':self.b,'digest':v['digest'],'id':'one','reviewed':True})
  self.assertEqual(r['state'],'uncertain');self.assertEqual(self.p.result('a')['id'],'one');self.assertEqual(self.a.calls,['close'])
 def test_cancel_routes_only_project(self):
  self.p.cancel('a');self.assertEqual(self.a.calls,[('cancel','a')])
