import tempfile,unittest,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'app'))
from codex_history import ConversationHistory
from codex_preview import CodexPreview
from test_codex_preview import Store
class HistoryTests(unittest.TestCase):
 def test_persistence_isolation_reset_and_dedupe(self):
  with tempfile.TemporaryDirectory() as d:
   path=Path(d)/'history.json';h=ConversationHistory(path);h.begin('a','one','Dato ZAFIRO',False);h.finish('one',{'state':'completed','text':'Entendido'})
   h=ConversationHistory(path);self.assertEqual(h.rows('a')[0]['user'],'Dato ZAFIRO');self.assertEqual(h.rows('b'),[])
   with self.assertRaises(ValueError):h.begin('a','one','Dato ZAFIRO',False)
   h.reset('a');self.assertEqual(h.rows('a'),[]);self.assertEqual(len(h.data['turns']),1)
 def test_pending_survives_restart_and_cannot_reset_or_resend(self):
  with tempfile.TemporaryDirectory() as d:
   path=Path(d)/'h.json';h=ConversationHistory(path);h.begin('a','x','Pregunta',False);h=ConversationHistory(path)
   with self.assertRaises(ValueError):h.reset('a')
   with self.assertRaises(ValueError):h.begin('a','y','Pregunta',False)
 def test_bounded_history_and_memory_exclusion(self):
  p=CodexPreview(Store());b={'projectId':'a','text':'Recuerda','includeMemory':False,'recordIds':[]}
  for i in range(8):
   p.history.begin('a',str(i),'Turno '+str(i),i==7);p.history.finish(str(i),{'state':'completed','text':'Respuesta '+str(i)})
  v=p.preview(b);self.assertEqual(len(v['history']),6);self.assertNotIn('Turno 7',v['payload']);self.assertNotIn('Turno 0',v['payload'])
  b['projectId']='b';self.assertEqual(p.preview(b)['history'],[])
 def test_sensitive_reply_not_retransmitted(self):
  p=CodexPreview(Store());p.history.begin('a','x','Pregunta',False);p.history.finish('x',{'state':'completed','text':'email@example.com'})
  self.assertEqual(p.preview({'projectId':'a','text':'Otra','includeMemory':False,'recordIds':[]})['history'],[])
