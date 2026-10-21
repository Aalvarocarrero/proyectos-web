import json, sys, tempfile, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'app'))
from server import Store
from ollama_runtime import LocalChat, complete_local
from local_assistant import ModelReply, ModelRequest
from unittest.mock import patch, MagicMock

class LocalChatTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory(); self.store=Store(self.tmp.name);self.calls=[]
  for pid in ['a','b']:
   self.store.mutate({'revision':self.store.revision(),'action':'create','entity':{'id':pid,'kind':'project','projectId':'','title':pid,'body':'PRIVATE MEMORY NOT SENT','status':'pendiente','priority':'media','nextAction':''},'evidence':[]})
  def backend(req):
   self.calls.append(req)
   return ModelReply('Respuesta de prueba',False,True)
  self.chat=LocalChat(self.store,backend)
 def tearDown(self): self.tmp.cleanup()
 def test_permission_persistence_revocation_and_scope(self):
  with self.assertRaises(ValueError): self.chat.send('a','1','Hola')
  self.chat.permission('a',True)
  self.assertFalse(self.chat.view('b')['enabled'])
  self.assertTrue(LocalChat(self.store).view('a')['enabled'])
  self.chat.permission('a',False)
  with self.assertRaises(ValueError):self.chat.send('a','1','Hola')
  self.assertEqual(self.calls,[])
 def test_response_roles_idempotency_and_no_memory(self):
  self.chat.permission('a',True); before=self.store.snapshot()
  result=self.chat.send('a','1','Hola')
  self.assertEqual(result['reply']['role'],'assistant');self.assertEqual(result['user']['role'],'user')
  self.assertEqual(result['state'],'completed');self.assertEqual(result['reply']['model'],'qwen3:4b')
  self.assertEqual(self.calls[0].text,'Hola');self.assertEqual(self.calls[0].project_id,'a')
  self.chat.send('a','1','Hola');self.assertEqual(len(self.calls),1)
  with self.assertRaises(ValueError):self.chat.send('b','1','Hola')
  with self.assertRaises(ValueError):self.chat.send('a','1','Diferente')
  self.assertEqual(self.chat.view('b')['turns'],[]);self.assertEqual(self.store.snapshot(),before)
  self.assertEqual(LocalChat(self.store).view('a')['turns'][0]['reply'],result['reply'])
 def test_failure_and_interrupted_intent_never_retry(self):
  self.chat.permission('a',True)
  def failure(req):raise RuntimeError('secret must not appear')
  self.chat.backend=failure;result=self.chat.send('a','fail','Hola')
  self.assertEqual(result['state'],'failed');self.assertNotIn('secret',json.dumps(result))
  self.chat.append({'kind':'intent','id':'pending','projectId':'a','model':'qwen3:4b','user':{'role':'user','text':'Hola'},'memorySent':False})
  restored=LocalChat(self.store,lambda req:self.fail('must not call'))
  self.assertEqual(restored.send('a','pending','Hola')['state'],'pending')
  with self.assertRaises(ValueError):restored.send('a','new','Hola')
 def test_invalid_and_nonexistent_project(self):
  for pid in ['missing','',None]:
   with self.assertRaises(ValueError):self.chat.permission(pid,True)
  with self.assertRaises(ValueError):self.chat.permission('a','true')
  self.chat.permission('a',True)
  for msg in ['', 'x'*6001, None]:
   with self.assertRaises(ValueError):self.chat.send('a','id',msg)
  self.assertEqual(self.chat.view('a')['turns'],[])
 def test_memory_is_opt_in_and_scoped(self):
  self.store.append_project_message('b','private-b','OTHER PROJECT SECRET')
  self.chat.permission('a',True)
  result=self.chat.send('a','memory','Resume el proyecto',True)
  self.assertTrue(result['memorySent']);self.assertIn('a',result['contextIds'])
  self.assertIn('PRIVATE MEMORY NOT SENT',self.calls[0].text)
  self.assertNotIn('OTHER PROJECT SECRET',self.calls[0].text)
  with self.assertRaises(ValueError):self.chat.send('a','memory','Resume el proyecto',False)
 def test_general_context_does_not_leak_to_other_projects(self):
  self.store.mutate({'revision':self.store.revision(),'action':'create','entity':{'id':'cerebro-contexto-general','kind':'project','projectId':'','title':'Contexto general','body':'','status':'pendiente','priority':'media','nextAction':''},'evidence':[]})
  self.store.mutate({'revision':self.store.revision(),'action':'create','entity':{'id':'general-note','kind':'instruction','projectId':'','title':'General','body':'GENERAL HISTORICAL TEXT','status':'pendiente','priority':'media','nextAction':''},'evidence':[]})
  self.assertTrue(any(r['recordId']=='general-note' for r in self.store.project_memory('cerebro-contexto-general')['records']))
  self.assertFalse(any(r['recordId']=='general-note' for r in self.store.project_memory('a')['records']))
 def test_transport_persists_final_answer_only(self):
  response=MagicMock();response.__enter__.return_value=response
  response.read.return_value=json.dumps({'done':True,'model':'qwen3:4b','message':{'role':'assistant','content':'reasoning preamble</think>Respuesta final.'}}).encode()
  opener=MagicMock();opener.open.return_value=response
  with patch('ollama_runtime.urllib.request.build_opener',return_value=opener):
   result=complete_local(ModelRequest('a','es-ES','Hola'))
  self.assertEqual(result.text,'Respuesta final.')
  request=opener.open.call_args.args[0]
  self.assertEqual(request.full_url,'http://127.0.0.1:11434/api/chat')
  self.assertTrue(json.loads(request.data)['think'])

if __name__=='__main__':unittest.main()
