import json,sys,tempfile,threading,unittest,urllib.request,urllib.error
from pathlib import Path
from http.server import ThreadingHTTPServer
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'app'))
from server import Store,handler
from ollama_runtime import LocalChat
from local_assistant import ModelReply

class LocalChatHttpTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(self.tmp.name);self.calls=[]
  for pid in ['a','b']:
   self.store.mutate({'revision':self.store.revision(),'action':'create','entity':{'id':pid,'kind':'project','projectId':'','title':pid,'body':'','status':'pendiente','priority':'media','nextAction':''},'evidence':[]})
  def backend(req):self.calls.append(req);return ModelReply('Prueba',False,True)
  self.chat=LocalChat(self.store,backend)
  self.server=ThreadingHTTPServer(('127.0.0.1',0),handler(self.store,'test',self.chat));self.thread=threading.Thread(target=self.server.serve_forever);self.thread.start();self.base='http://127.0.0.1:'+str(self.server.server_port)
 def tearDown(self):self.server.shutdown();self.thread.join();self.server.server_close();self.tmp.cleanup()
 def post(self,path,body,token='test',origin=None):
  headers={'Content-Type':'application/json','X-Cerebro-Token':token}
  if origin:headers['Origin']=origin
  return json.load(urllib.request.urlopen(urllib.request.Request(self.base+path,data=json.dumps(body).encode(),headers=headers)))
 def test_write_requires_token_origin_and_exact_fields(self):
  for token,origin in [('',None),('test','https://invalid.example')]:
   with self.assertRaises(urllib.error.HTTPError) as ctx:self.post('/api/local-chat/permission',{'projectId':'a','enabled':True},token,origin)
   self.assertEqual(ctx.exception.code,403)
  with self.assertRaises(urllib.error.HTTPError) as ctx:self.post('/api/local-chat/send',{'projectId':'a','id':'1','text':'Hola','endpoint':'https://invalid.example'})
  self.assertEqual(ctx.exception.code,400);self.assertFalse(self.chat.view('a')['enabled']);self.assertEqual(self.calls,[])
 def test_grant_send_read_and_other_project_isolation(self):
  self.post('/api/local-chat/permission',{'projectId':'a','enabled':True})
  result=self.post('/api/local-chat/send',{'projectId':'a','id':'1','text':'Hola'})
  self.assertEqual(result['state'],'completed')
  self.post('/api/local-chat/send',{'projectId':'a','id':'1','text':'Hola'})
  self.assertEqual(len(self.calls),1)
  other=json.load(urllib.request.urlopen(self.base+'/api/local-chat/b'))
  self.assertEqual(other['turns'],[]);self.assertFalse(other['enabled'])
  self.post('/api/local-chat/permission',{'projectId':'a','enabled':False})
  with self.assertRaises(urllib.error.HTTPError):self.post('/api/local-chat/send',{'projectId':'a','id':'2','text':'Hola'})

 def test_session_http_requires_grants_token_and_exact_project(self):
  from types import SimpleNamespace
  self.chat.transcriber=SimpleNamespace(transcribe=lambda raw:{'transcript':'Hola'})
  with self.assertRaises(urllib.error.HTTPError):self.post('/api/local-chat/session-start',{'projectId':'a'})
  self.post('/api/local-chat/permission',{'projectId':'a','enabled':True})
  self.post('/api/local-chat/voice-permission',{'projectId':'a','enabled':True})
  with self.assertRaises(urllib.error.HTTPError):self.post('/api/local-chat/session-start',{'projectId':'a'},token='')
  sid=self.post('/api/local-chat/session-start',{'projectId':'a'})['sessionId']
  with self.assertRaises(urllib.error.HTTPError):self.post('/api/local-chat/send',{'projectId':'b','id':'s1','text':'Hola','source':'session_transcript','sessionId':sid})
  result=self.post('/api/local-chat/send',{'projectId':'a','id':'s1','text':'Hola','source':'session_transcript','sessionId':sid})
  self.assertEqual(result['state'],'completed');self.assertEqual(result['user']['source'],'session_transcript')
  with self.assertRaises(urllib.error.HTTPError):self.post('/api/local-chat/session-stop',{'projectId':'a','sessionId':None})
  self.post('/api/local-chat/session-stop',{'projectId':'a','sessionId':sid})
  with self.assertRaises(urllib.error.HTTPError):self.post('/api/local-chat/send',{'projectId':'a','id':'s2','text':'Hola','source':'session_transcript','sessionId':sid})

if __name__=='__main__':unittest.main()
