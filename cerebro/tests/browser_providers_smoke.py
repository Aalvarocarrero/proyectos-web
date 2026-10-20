"""Provider panel and simulation smoke test; requires existing Playwright + Chromium."""
import json, socket, subprocess, sys, tempfile, time, urllib.request
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
   browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
   page=browser.new_page(viewport={'width':1360,'height':1000});requests=[];simulation_payloads=[];page.on('request',lambda req:requests.append(req.url));page.on('request',lambda req:simulation_payloads.append(req.post_data) if '/api/providers/simulate' in req.url else None)
   page.goto(f'http://127.0.0.1:{PORT}/')
   nav=page.locator('#show-providers');nav.focus();nav.press('Enter')
   page.get_by_role('heading',name='Proveedores de IA · estado y preparación').wait_for()
   assert page.locator('.provider-card').count()==3
   assert page.locator('.provider-card .provider-state.disabled').count()==3
   for status in ['Desactivado','Preparado','Verificado realmente']:
    assert page.locator('.provider-state-legend').get_by_text(status,exact=True).count()==1
   assert 'Confirmar plan y saldo diario' in page.locator('.provider-card').filter(has_text='Cloudflare').inner_text()
   assert page.locator('#content input, #content textarea, #content select').count()==0
   assert page.get_by_role('button',name='Conectar',exact=False).count()==0
   before=page.evaluate("""async()=>({document:(await (await fetch('/api/state')).json()).document,localStorage:Object.keys(localStorage)})""")
   for card in page.locator('.provider-card').all():
    button=card.get_by_role('button',name='Ejecutar simulación con datos sintéticos');button.focus();button.press('Enter')
    card.get_by_text('SIMULACIÓN COMPLETADA · NO VERIFICADO',exact=True).wait_for()
    assert card.locator('.provider-state.disabled').inner_text()=='Desactivado'
    assert 'ni hubo conexión externa' in card.locator('.provider-simulation-result').inner_text()
   after=page.evaluate("""async()=>({document:(await (await fetch('/api/state')).json()).document,localStorage:Object.keys(localStorage)})""")
   assert after==before,(before,after)
   assert all(url.startswith(f'http://127.0.0.1:{PORT}/') for url in requests),requests
   assert [json.loads(payload) for payload in simulation_payloads]==[{'provider':'ollama'},{'provider':'cloudflare'},{'provider':'groq'}]
   page.set_viewport_size({'width':390,'height':844})
   assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth')
   page.evaluate("document.querySelector('.skip-link')?.remove();document.activeElement?.blur()");page.mouse.move(1,500)
   page.screenshot(path=str(ROOT/'docs/captura-proveedores-fixture.png'),full_page=True)
   browser.close()
  print('PASS: panel accesible por teclado, tres estados operativos distinguidos, requisitos bloqueantes, simulación sintética por proveedor, sin claves/memoria/persistencia/red externa, y móvil sin overflow.')
 finally:process.terminate();process.wait()
