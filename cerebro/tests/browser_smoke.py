"""Optional UI test; requires already-installed Playwright + Chromium."""
import json,subprocess,tempfile,time,urllib.request,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory() as data:
 process=subprocess.Popen([sys.executable,str(ROOT/'app/server.py'),'--data-dir',data,'--port','18765'],stdout=subprocess.PIPE)
 try:
  for _ in range(50):
   try:urllib.request.urlopen('http://127.0.0.1:18765/api/state').close();break
   except OSError:time.sleep(.1)
  with sync_playwright() as p:
   browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);page=browser.new_page(viewport={'width':1360,'height':1050});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto('http://127.0.0.1:18765/');page.get_by_text('El registro está listo.',exact=False).wait_for();page.locator('#new-project').click();page.locator('[name=title]').fill('Observatorio · Proyecto ficticio');page.locator('[name=body]').fill('Fixture de demostración. Ningún proyecto ni dato real.');page.locator('[name=nextAction]').fill('Revisar fuentes y registrar el próximo checkpoint.');page.get_by_role('button',name='Guardar en disco').click();page.get_by_role('button',name='+ Añadir registro').wait_for()
   page.get_by_role('button',name='+ Añadir registro').click();page.locator('#kind').select_option('instruction');page.locator('[name=title]').fill('Conservar originales');page.locator('[name=body]').fill('Texto ficticio, literal.\n<script>window.pwned=true</script>');page.get_by_role('button',name='Guardar en disco').click();page.get_by_text('Original inmutable',exact=False).wait_for();assert page.evaluate('window.pwned') is None
   page.locator('#show-transcripts').click();page.locator('#content [name=id]').fill('browser-fragment');page.locator('#content [name=source]').fill('Prueba de interfaz');page.locator('#content [name=speaker]').fill('Hablante ficticio');page.locator('#content [name=original]').fill('Texto sin resumir.\nSegunda línea.');page.get_by_role('button',name='Persistir fragmento').click();page.get_by_text('Fragmento persistido en disco.',exact=True).wait_for();page.get_by_role('button',name='Derivar tarea en proyecto seleccionado').click();page.locator('[name=title]').fill('Revisar fragmento ficticio');page.get_by_role('button',name='Guardar en disco').click();page.get_by_text('Revisar fragmento ficticio',exact=True).wait_for()
   page.locator('#show-queue').click();page.get_by_label('Acción pendiente').fill('Preparar borrador ficticio');page.get_by_role('button',name='Añadir a cola').click();page.get_by_text('Acción en cola; no se ha ejecutado.').wait_for()
   page.get_by_role('button',name='Observatorio · Proyecto ficticio',exact=True).click();page.locator('#search').fill('Conservar originales');page.get_by_role('heading',name='Resultados de búsqueda').wait_for();assert page.get_by_role('heading',name='Conservar originales').count()==1;page.locator('#search').fill('');page.locator('#backup').click();page.get_by_text('Respaldo local creado:',exact=False).wait_for()
   with page.expect_download() as download:page.locator('#export-json').click()
   result=json.loads(Path(download.value.path()).read_text());assert result['transcripts'][0]['original']=='Texto sin resumir.\nSegunda línea.';assert len(result['actions'])==1
   page.screenshot(path=str(ROOT/'docs/captura-fixture.png'),full_page=True);page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth');assert not errors,errors
   browser.close()
  process.terminate();process.wait();process=subprocess.Popen([sys.executable,str(ROOT/'app/server.py'),'--data-dir',data,'--port','18765'],stdout=subprocess.PIPE)
  for _ in range(50):
   try:
    restored=json.load(urllib.request.urlopen('http://127.0.0.1:18765/api/state'));break
   except OSError:time.sleep(.1)
  assert restored['document']==result
  print('PASS: UI creación, inmutabilidad, XSS, transcripción, derivación, cola, búsqueda, respaldo, exportación, móvil y reinicio real.')
 finally:process.terminate();process.wait()
