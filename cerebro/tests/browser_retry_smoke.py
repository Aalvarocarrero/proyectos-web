"""Real-browser regression for interrupted task and message submissions."""
import json,socket,subprocess,sys,tempfile,time,urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
probe=socket.socket();probe.bind(('127.0.0.1',0));PORT=probe.getsockname()[1];probe.close()
with tempfile.TemporaryDirectory() as data:
 process=subprocess.Popen([sys.executable,str(ROOT/'app/server.py'),'--data-dir',data,'--port',str(PORT)],stdout=subprocess.PIPE)
 try:
  for _ in range(50):
   try:urllib.request.urlopen(f'http://127.0.0.1:{PORT}/api/state').close();break
   except OSError:time.sleep(.1)
  with sync_playwright() as p:
   browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);page=browser.new_page();page.goto(f'http://127.0.0.1:{PORT}/')
   def project(title):
    page.locator('#new-project').click();page.locator('[name=title]').fill(title);page.locator('[name=body]').fill('Fixture aislado.');page.locator('[name=nextAction]').fill('Continuar prueba.');page.get_by_role('button',name='Guardar en disco').click();page.locator('#content').get_by_role('button',name='+ Añadir registro').wait_for()
   def select_project(title):page.locator('#projects').get_by_role('button',name=title,exact=True).click()
   def queue(title,intention):
    page.locator('#show-queue').click();page.get_by_label('Acción pendiente').fill(title);page.get_by_label('Intención previa').fill(intention)
   def state():return page.evaluate("async()=>await (await fetch('/api/state')).json()")['document']
   project('Proyecto ficticio A');project('Proyecto ficticio B')
   select_project('Proyecto ficticio A');queue('Tarea tras ACK perdido','Intención ficticia A')
   def persist_then_drop(route):route.fetch();route.abort()
   page.route('**/api/action',persist_then_drop);page.locator('#content form').first.evaluate('(f)=>f.requestSubmit()');page.locator('#notice.error').wait_for();page.unroute('**/api/action')
   saved=state()['actions'];assert len(saved)==1 and saved[0]['title']=='Tarea tras ACK perdido';lost_id=saved[0]['actionId']
   page.reload();select_project('Proyecto ficticio A');page.locator('#show-queue').click();assert page.get_by_label('Acción pendiente').input_value()=='Tarea tras ACK perdido';assert page.get_by_label('Intención previa').input_value()=='Intención ficticia A'
   page_id=page.evaluate("async()=>{const d=await (await fetch('/api/state')).json();return d.document.events.find(e=>e.entity.kind==='project').entity.id}")
   attempt=json.loads(page.evaluate("k=>localStorage.getItem(k)",'cerebro.queueAttempt.v1:'+page_id));assert attempt['actionId']==lost_id
   writes=[];page.on('request',lambda req:writes.append(req.url) if req.method=='POST' and req.url.endswith('/api/action') else None)
   page.locator('#content form').first.evaluate('(f)=>f.requestSubmit()');page.get_by_text('El servidor ya contiene esta tarea; se verificó su estado y no se volvió a enviar.',exact=True).wait_for();assert writes==[];assert len(state()['actions'])==1

   # A request lost before it reaches the server retains the same local identity across reload.
   queue('Tarea recuperable','Intención recuperable')
   page.route('**/api/action',lambda route:route.abort());page.locator('#content form').first.evaluate('(f)=>f.requestSubmit()');page.locator('#notice.error').wait_for();page.unroute('**/api/action')
   before_id=json.loads(page.evaluate("k=>localStorage.getItem(k)",'cerebro.queueAttempt.v1:'+page_id))['actionId'];assert len(state()['actions'])==1
   page.reload();select_project('Proyecto ficticio A');page.locator('#show-queue').click();assert page.get_by_label('Acción pendiente').input_value()=='Tarea recuperable'
   restored=json.loads(page.evaluate("k=>localStorage.getItem(k)",'cerebro.queueAttempt.v1:'+page_id));assert restored['actionId']==before_id
   page.locator('#content form').first.evaluate('(f)=>f.requestSubmit()');page.get_by_text('Intención persistida; todavía no se ha ejecutado.',exact=True).wait_for();actions=state()['actions'];assert len(actions)==2 and actions[-1]['actionId']==before_id

   # The same title and intent can be a distinct intentional task after the prior attempt succeeds.
   queue('Tarea recuperable','Intención recuperable')
   page.locator('#content form').first.evaluate('(f)=>{f.requestSubmit();f.requestSubmit()}');page.get_by_text('Intención persistida; todavía no se ha ejecutado.',exact=True).wait_for();actions=state()['actions'];assert len(actions)==3 and actions[-1]['actionId']!=before_id

   # Per-project storage keeps A's work out of B's form and restores B's own attempt.
   select_project('Proyecto ficticio B');queue('Tarea B pendiente','Intención solo B')
   page.route('**/api/action',lambda route:route.abort());page.locator('#content form').first.evaluate('(f)=>f.requestSubmit()');page.locator('#notice.error').wait_for();page.unroute('**/api/action')
   b_project_id=page.evaluate("async()=>{const d=await (await fetch('/api/state')).json();return d.document.events.filter(e=>e.entity.kind==='project').find(e=>e.entity.title==='Proyecto ficticio B').entity.id}")
   b_attempt=json.loads(page.evaluate("k=>localStorage.getItem(k)",'cerebro.queueAttempt.v1:'+b_project_id));select_project('Proyecto ficticio A');page.locator('#show-queue').click();assert page.get_by_label('Acción pendiente').input_value()=='';select_project('Proyecto ficticio B');page.locator('#show-queue').click();assert page.get_by_label('Acción pendiente').input_value()=='Tarea B pendiente';assert json.loads(page.evaluate("k=>localStorage.getItem(k)",'cerebro.queueAttempt.v1:'+b_project_id))['actionId']==b_attempt['actionId']

   # Message ACK loss is verified from project state after reload; it is not reposted.
   select_project('Proyecto ficticio A');message='Mensaje de fixture tras ACK perdido.';page.get_by_label('Mensaje de texto para este proyecto').fill(message)
   page.route('**/api/action',persist_then_drop);page.get_by_role('button',name='Guardar en memoria local').click();page.locator('#notice.error').wait_for();page.unroute('**/api/action')
   doc=state();assert len(doc['messages'])==1 and doc['messages'][0]['text']==message;message_id=doc['messages'][0]['id']
   page.reload();select_project('Proyecto ficticio A');field=page.get_by_label('Mensaje de texto para este proyecto');assert field.input_value()==message
   message_attempt=json.loads(page.evaluate("k=>localStorage.getItem(k)",'cerebro.messageAttempt.v1:'+page_id));assert message_attempt['actionId']==message_id
   writes.clear();page.get_by_role('button',name='Verificar mensaje ya guardado').click();page.get_by_text('El almacenamiento ya contiene este mensaje; se verificó sin reenviarlo.',exact=True).wait_for();assert writes==[];assert len(state()['messages'])==1
   # A fresh submission with identical text gets a new ID (no content-based deduplication).
   page.get_by_label('Mensaje de texto para este proyecto').fill(message);page.get_by_role('button',name='Guardar en memoria local').click();page.get_by_text('Mensaje guardado en la memoria local de este proyecto.',exact=True).wait_for();msgs=state()['messages'];assert len(msgs)==2 and msgs[0]['id']!=msgs[1]['id']
   assert not page.locator('#notice.error').count()
   browser.close()
  print('PASS: lost ACK + reload + verified retry, pre-save failure recovery, double submit, project-scoped task attempts, and distinct intentional duplicate tasks/messages.')
 finally:process.terminate();process.wait()
