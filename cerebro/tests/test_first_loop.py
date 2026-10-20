"""Acceptance circuit: persist literal fragment, deduplicate, checkpoint, restart, resume safely."""
import copy,sys,tempfile,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'app'))
from server import Store
class FirstLoop(unittest.TestCase):
 def test_fragment_task_checkpoint_restart_resume_and_uncertain_effect(self):
  with tempfile.TemporaryDirectory() as root:
   path=Path(root)/'private';store=Store(path)
   def act(**kw):return store.mutate({'revision':store.revision(),**kw})
   project={'id':'fixture-project','kind':'project','projectId':'','title':'Proyecto ficticio','body':'','status':'pendiente','priority':'muy alta','nextAction':'Inspeccionar evidencia'}
   act(action='create',entity=project)
   fragment={'id':'stable-call-event-001','at':'2026-10-20T09:00:01+00:00','original':'Conservar literalmente esta frase.\nSin resumir.','source':'fixture manual','speaker':'Voz ficticia'}
   saved=act(action='transcript',fragment=fragment)['fragment']
   self.assertEqual(saved['original'],fragment['original'])
   self.assertTrue(act(action='transcript',fragment=fragment)['duplicate'])
   task={'id':'fixture-task','kind':'task','projectId':project['id'],'title':'Procesar fragmento de ejemplo','body':'Registrar seguimiento manual.','status':'pendiente','priority':'muy alta','nextAction':'Consultar fuente de prueba'}
   act(action='create',entity=task,evidence=['transcript:'+fragment['id']])
   q={'actionId':'fixture-action','type':'task','state':'pending','outcome':'not_started','intent':'Registrar y validar una evidencia ficticia','checkpoint':'','dependsOn':[],'idempotencyKey':'fixture-idem-001','title':task['title'],'projectId':project['id'],'evidence':''}
   act(action='queue',entry=q)
   q.update(state='in_progress',outcome='unknown',checkpoint='Checkpoint 1: fragmento revisado; continuar desde la consulta de evidencia')
   act(action='queue',entry=q)
   store=Store(path) # process restart; all committed journal records replay
   self.assertEqual(store.doc['transcripts'][0]['original'],fragment['original'])
   self.assertEqual(store.doc['events'][-1]['evidence'],['transcript:'+fragment['id']])
   latest=store.doc['actions'][-1]
   self.assertEqual(latest['checkpoint'],q['checkpoint']);self.assertEqual(latest['state'],'in_progress');self.assertEqual(latest['outcome'],'unknown')
   # Resume by moving uncertainty to blocked, with no execution/retry, then record verified evidence.
   q.update(state='blocked',checkpoint='Retomado tras reinicio: validar resultado antes de continuar')
   act2=lambda:store.mutate({'revision':store.revision(),'action':'queue','entry':q})
   act2();self.assertEqual(Store(path).doc['actions'][-1]['state'],'blocked')
   before=len(store.doc['actions']);store=Store(path)
   with self.assertRaisesRegex(ValueError,'Resultado incierto'):
    store.mutate({'revision':store.revision(),'action':'queue','entry':q|{'state':'in_progress','checkpoint':'Reintento no autorizado'}})
   self.assertEqual(len(Store(path).doc['actions']),before)
   self.assertEqual(len([x for x in Store(path).doc['transcripts'] if x['id']==fragment['id']]),1)
if __name__=='__main__':unittest.main()
