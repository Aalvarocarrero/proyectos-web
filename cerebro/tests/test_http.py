import sys,tempfile,threading,unittest,json,urllib.request,urllib.error
from pathlib import Path
from http.server import ThreadingHTTPServer
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'app'))
from server import Store,handler
class HttpTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.s=Store(self.tmp.name);self.server=ThreadingHTTPServer(('127.0.0.1',0),handler(self.s,'test-token'));self.thread=threading.Thread(target=self.server.serve_forever);self.thread.start();self.url='http://127.0.0.1:'+str(self.server.server_port)
 def tearDown(self):self.server.shutdown();self.thread.join();self.server.server_close();self.tmp.cleanup()
 def test_state_and_security(self):
  r=urllib.request.urlopen(self.url+'/api/state');d=json.load(r);self.assertEqual(d['document']['events'],[]);self.assertIn("frame-ancestors 'none'",r.headers['Content-Security-Policy'])
  request=urllib.request.Request(self.url+'/api/action',data=b'{}',headers={'Content-Type':'application/json'})
  with self.assertRaises(urllib.error.HTTPError) as ctx:urllib.request.urlopen(request)
  self.assertEqual(ctx.exception.code,403)
  request=urllib.request.Request(self.url+'/',headers={'Host':'evil.invalid'})
  with self.assertRaises(urllib.error.HTTPError) as ctx:urllib.request.urlopen(request)
  self.assertEqual(ctx.exception.code,403)
 def test_fragment_api_persists_and_rejects_invalid(self):
  payload={'revision':self.s.revision(),'action':'transcript','fragment':{'id':'http-fixture','at':'2026-10-20T12:00:00+00:00','original':'Literal <script>alert(1)</script>','source':'fixture','speaker':'Ficticio'}}
  req=urllib.request.Request(self.url+'/api/action',data=json.dumps(payload).encode(),headers={'Content-Type':'application/json','X-Cerebro-Token':'test-token'})
  result=json.load(urllib.request.urlopen(req));self.assertEqual(result['fragment']['persistence'],'persistido');self.assertEqual(Store(self.tmp.name).doc,self.s.doc)
  req=urllib.request.Request(self.url+'/api/action',data=b'[]',headers={'Content-Type':'application/json','X-Cerebro-Token':'test-token'})
  with self.assertRaises(urllib.error.HTTPError) as ctx:urllib.request.urlopen(req)
  self.assertEqual(ctx.exception.code,400)
 def test_provider_simulation_accepts_only_provider_name_and_does_not_mutate_store(self):
  before=self.s.snapshot()['document']
  request=urllib.request.Request(self.url+'/api/providers/simulate',data=json.dumps({'provider':'ollama'}).encode(),headers={'Content-Type':'application/json','X-Cerebro-Token':'test-token'})
  result=json.load(urllib.request.urlopen(request))
  self.assertEqual(result['providerStatus'],'desactivado');self.assertTrue(result['simulation']);self.assertFalse(result['realConnectionVerified'])
  self.assertEqual(self.s.snapshot()['document'],before)
  request=urllib.request.Request(self.url+'/api/providers/simulate',data=json.dumps({'provider':'groq','messages':[{'role':'user','content':'private'}]}).encode(),headers={'Content-Type':'application/json','X-Cerebro-Token':'test-token'})
  with self.assertRaises(urllib.error.HTTPError) as ctx:urllib.request.urlopen(request)
  self.assertEqual(ctx.exception.code,400);self.assertEqual(self.s.snapshot()['document'],before)
 def test_project_memory_and_capabilities_http_contract(self):
  project={'id':'fixture-http-a','kind':'project','projectId':'','title':'Ficticio Alfa','body':'','status':'pendiente','priority':'alta','nextAction':''}
  self.s.mutate({'revision':self.s.revision(),'action':'create','entity':project,'evidence':[]})
  task={'id':'fixture-http-task','kind':'task','projectId':'fixture-http-a','title':'Decisión sintética','body':'Café ficticio','status':'probado','priority':'muy alta','nextAction':'Revisar'}
  self.s.mutate({'revision':self.s.revision(),'action':'create','entity':task,'evidence':[]})
  data=json.load(urllib.request.urlopen(self.url+'/api/projects/fixture-http-a/memory?q=cafe&type=task'))
  self.assertEqual(data['projectId'],'fixture-http-a');self.assertEqual(data['total'],1);self.assertEqual(data['records'][0]['recordId'],'fixture-http-task')
  catalog=json.load(urllib.request.urlopen(self.url+'/api/capabilities'))
  self.assertEqual(catalog['release']['state'],'draft');self.assertEqual(next(t for t in catalog['tools'] if t['id']=='voice')['state'],'pendiente')
  for path,code in [('/api/projects/missing/memory',404),('/api/projects/fixture-http-a/memory?type=invalid',400),('/api/projects/fixture-http-a/memory?limit=201',400)]:
   with self.assertRaises(urllib.error.HTTPError) as ctx:urllib.request.urlopen(self.url+path)
   self.assertEqual(ctx.exception.code,code)
if __name__=='__main__':unittest.main()
