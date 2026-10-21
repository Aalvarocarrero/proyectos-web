import json, sys, tempfile, unittest
from pathlib import Path
from urllib.request import urlopen

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'app'))
from server import Store
from capabilities import catalog


class ProjectMemoryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = Store(self.temp.name)
        self.make_project('p-a', 'Proyecto ficticio Alfa')
        self.make_project('p-b', 'Proyecto ficticio Beta')

    def tearDown(self):
        self.temp.cleanup()

    def act(self, **values):
        return self.store.mutate({'revision': self.store.revision(), **values})

    def make_project(self, identity, title):
        self.act(action='create', entity={'id': identity, 'kind': 'project', 'projectId': '', 'title': title,
            'body': 'Ficha sintética', 'status': 'pendiente', 'priority': 'alta', 'nextAction': 'Revisar la fixture'})

    def make_task(self, identity, project, title, body):
        self.act(action='create', entity={'id': identity, 'kind': 'task', 'projectId': project, 'title': title,
            'body': body, 'status': 'bloqueado', 'priority': 'muy alta', 'nextAction': 'Validar fuente sintética'}, evidence=[])

    def test_search_filters_exact_project_and_normalizes_accents(self):
        self.make_task('a-task', 'p-a', 'Decisión: campaña', 'Revisar MÉTRICAS ficticias')
        self.make_task('b-task', 'p-b', 'Campaña privada beta', 'Contenido que no debe cruzar proyectos')
        result = self.store.project_memory('p-a', 'metricas', kind='task')
        self.assertEqual(result['projectId'], 'p-a')
        self.assertEqual([row['recordId'] for row in result['records']], ['a-task'])
        self.assertNotIn('p-b', json.dumps(result))
        self.assertEqual(self.store.project_memory('p-a', 'beta')['records'], [])

    def test_actions_messages_and_explicit_transcripts_are_project_scoped(self):
        self.make_task('a-task', 'p-a', 'Tarea A', 'sintético')
        self.make_task('b-task', 'p-b', 'Tarea B', 'sintético')
        self.act(action='transcript', fragment={'id': 'frag-a', 'at': '2026-10-21T08:00:00+00:00',
            'original': 'Texto literal privado de fixture Alfa', 'source': 'fixture', 'speaker': 'Persona ficticia'})
        self.act(action='create', entity={'id': 'a-check', 'kind': 'checkpoint', 'projectId': 'p-a', 'title': 'Punto guardado',
            'body': 'Checkpoint de prueba', 'status': 'probado', 'priority': 'sin asignar', 'nextAction': ''}, evidence=['transcript:frag-a'])
        action = {'actionId':'act-a','type':'task','state':'pending','outcome':'not_started','intent':'Intención ficticia Alfa',
            'checkpoint':'Volver al paso sintético','dependsOn':[],'idempotencyKey':'key-a','title':'Acción A','projectId':'p-a','evidence':'evidencia sintética'}
        self.act(action='queue', entry=action)
        msg = {'id':'msg-a','projectId':'p-a','text':'Nota privada ficticia Alfa'}
        self.act(action='message', message=msg)
        records = self.store.project_memory('p-a')['records']
        kinds = {r['type'] for r in records}
        self.assertTrue({'action','message','transcript','checkpoint'} <= kinds)
        self.assertNotIn('Texto literal privado', json.dumps(self.store.project_memory('p-b')))
        self.assertNotIn('Nota privada ficticia', json.dumps(self.store.project_memory('p-b')))

    def test_limit_type_and_unknown_project(self):
        for index in range(4): self.make_task(f't-{index}', 'p-a', f'Tarea fixture {index}', 'texto')
        result = self.store.project_memory('p-a', limit=2)
        self.assertEqual(len(result['records']), 2)
        self.assertTrue(result['hasMore'])
        self.assertEqual(self.store.project_memory('p-a', kind='decision')['total'], 0)
        with self.assertRaises(KeyError): self.store.project_memory('missing')
        with self.assertRaises(ValueError): self.store.project_memory('p-a', limit=0)


class CapabilityRegistryTests(unittest.TestCase):
    def test_catalog_states_are_truthful_and_do_not_claim_live_voice_or_execution(self):
        result = catalog()
        states = {tool['id']: tool['state'] for tool in result['tools']}
        self.assertEqual(states['jarvis-local-interface'], 'probado_localmente')
        self.assertEqual(states['project-memory'], 'probado_localmente')
        self.assertEqual(states['provider-adapters'], 'preparado_sin_configurar')
        self.assertEqual(states['local-assistant-port'], 'preparado_sin_configurar')
        self.assertIn('desconectado', next(t for t in result['tools'] if t['id']=='local-assistant-port')['label'].lower())
        self.assertEqual(states['provider-simulation'], 'simulado')
        self.assertEqual(states['provider-live'], 'desactivado')
        self.assertEqual(states['voice'], 'pendiente')
        self.assertEqual(states['task-execution'], 'no_integrado')
        self.assertEqual(result['release']['state'], 'draft')
        self.assertIn('Micrófono apagado', next(t for t in result['tools'] if t['id']=='voice')['scope'])
        self.assertEqual(len(result['areas']), 5)


if __name__ == '__main__': unittest.main()
