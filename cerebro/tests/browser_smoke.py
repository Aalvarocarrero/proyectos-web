"""Optional UI test; requires already-installed Playwright + Chromium."""
import json,socket,subprocess,tempfile,time,urllib.request,sys
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
   browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);page=browser.new_page(viewport={'width':1360,'height':1050});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(f'http://127.0.0.1:{PORT}/');page.get_by_text('El registro está listo.',exact=False).wait_for();page.locator('#new-project').click();page.locator('[name=title]').fill('Observatorio · Proyecto ficticio');page.locator('[name=body]').fill('Fixture de demostración. Ningún proyecto ni dato real.');page.locator('[name=nextAction]').fill('Revisar fuentes y registrar el próximo checkpoint.');page.get_by_role('button',name='Guardar en disco').click();page.get_by_role('button',name='+ Añadir registro').wait_for()
   page.get_by_role('button',name='+ Añadir registro').click();page.locator('#kind').select_option('instruction');page.locator('[name=title]').fill('Conservar originales');page.locator('[name=body]').fill('Texto ficticio, literal.\n<script>window.pwned=true</script>');page.get_by_role('button',name='Guardar en disco').click();page.get_by_text('Original inmutable',exact=False).wait_for();assert page.evaluate('window.pwned') is None
   page.locator('#show-transcripts').click();page.locator('#content [name=id]').fill('browser-fragment');page.locator('#content [name=source]').fill('Prueba de interfaz');page.locator('#content [name=speaker]').fill('Hablante ficticio');page.locator('#content [name=original]').fill('Texto sin resumir.\nSegunda línea.');page.get_by_role('button',name='Persistir fragmento').click();page.get_by_text('Fragmento persistido en disco.',exact=True).wait_for();page.get_by_role('button',name='Derivar tarea en proyecto seleccionado').click();page.locator('[name=title]').fill('Revisar fragmento ficticio');page.get_by_role('button',name='Guardar en disco').click();page.get_by_text('Revisar fragmento ficticio',exact=True).wait_for()
   page.locator('#show-queue').click();page.get_by_label('Acción pendiente').fill('Preparar borrador ficticio');page.get_by_label('Intención previa').fill('Fixture visual: validar un checkpoint; ningún efecto externo.');page.get_by_role('button',name='Registrar intención y dejar pendiente').click();page.get_by_text('Intención persistida; todavía no se ha ejecutado.').wait_for()
   page.get_by_label('Acción pendiente').fill('Revisar documento independiente');page.get_by_label('Intención previa').fill('Fixture visual independiente y local.');page.get_by_role('button',name='Registrar intención y dejar pendiente').click()
   response=page.evaluate("""async()=>{const s=await (await fetch('/api/state')).json();const a={...s.document.actions[0],state:'blocked',outcome:'failed',checkpoint:'Reanudar después de comprobar el requisito faltante.',evidence:'fixture: requisito local pendiente'};delete a.id;delete a.at;const r=await fetch('/api/action',{method:'POST',headers:{'Content-Type':'application/json','X-Cerebro-Token':s.token},body:JSON.stringify({revision:s.revision,action:'queue',entry:a})});return {ok:r.ok,error:(await r.json()).error}}""");assert response['ok'],response
   page.evaluate('load()');page.get_by_text('Siguiente tarea independiente',exact=True).wait_for(timeout=5000);assert 'Revisar documento independiente' in page.locator('.recovery').inner_text()
   page.get_by_role('button',name='Observatorio · Proyecto ficticio',exact=True).click();page.locator('#search').fill('Conservar originales');page.get_by_role('heading',name='Resultados de búsqueda').wait_for();assert page.get_by_role('heading',name='Conservar originales').count()==1;page.locator('#search').fill('');page.locator('#backup').click();page.get_by_text('Respaldo local creado:',exact=False).wait_for()
   with page.expect_download() as download:page.locator('#export-json').click()
   result=json.loads(Path(download.value.path()).read_text());assert result['transcripts'][0]['original']=='Texto sin resumir.\nSegunda línea.';assert len(result['actions'])==3
   page.locator('#show-queue').click();assert 'Revisar documento independiente' in page.locator('.recovery').inner_text();page.screenshot(path=str(ROOT/'docs/captura-recuperacion-fixture.png'),full_page=True);page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth');assert not errors,errors
   browser.close()
  process.terminate();process.wait();process=subprocess.Popen([sys.executable,str(ROOT/'app/server.py'),'--data-dir',data,'--port',str(PORT)],stdout=subprocess.PIPE)
  for _ in range(50):
   try:
    restored=json.load(urllib.request.urlopen(f'http://127.0.0.1:{PORT}/api/state'));break
   except OSError:time.sleep(.1)
  assert restored['document']==result
  print('PASS: UI creación, inmutabilidad, XSS, transcripción, derivación, cola, búsqueda, respaldo, exportación, móvil y reinicio real.')
 finally:process.terminate();process.wait()
