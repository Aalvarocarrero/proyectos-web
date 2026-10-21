"""UI acceptance for project-isolated memory lookup and the real capability registry."""
import socket, subprocess, sys, tempfile, time, urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
probe=socket.socket();probe.bind(('127.0.0.1',0));PORT=probe.getsockname()[1];probe.close()

with tempfile.TemporaryDirectory() as data:
    process=subprocess.Popen([sys.executable,str(ROOT/'app/server.py'),'--data-dir',data,'--port',str(PORT)],stdout=subprocess.PIPE)
    try:
        for _ in range(60):
            try: urllib.request.urlopen(f'http://127.0.0.1:{PORT}/api/state').close(); break
            except OSError: time.sleep(.1)
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
            page=browser.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
            remote=[];page.on('request',lambda req:remote.append(req.url) if not req.url.startswith(f'http://127.0.0.1:{PORT}/') else None)
            page.goto(f'http://127.0.0.1:{PORT}/')
            page.evaluate("""async()=>{
              const s=await (await fetch('/api/state')).json();
              const send=async(entity)=>{const r=await fetch('/api/action',{method:'POST',headers:{'Content-Type':'application/json','X-Cerebro-Token':s.token},body:JSON.stringify({revision:(await (await fetch('/api/state')).json()).revision,action:'create',entity,evidence:[]})});if(!r.ok)throw Error(await r.text());};
              await send({id:'fixture-a',kind:'project',projectId:'',title:'Atlas · Fixture sintética',body:'PREVISUALIZACIÓN · DATOS FICTICIOS',status:'probado',priority:'alta',nextAction:'Revisar fixture'});
              await send({id:'fixture-b',kind:'project',projectId:'',title:'Nébula · Fixture sintética',body:'PREVISUALIZACIÓN · DATOS FICTICIOS',status:'pendiente',priority:'media',nextAction:'Revisar otra fixture'});
              await send({id:'task-a',kind:'task',projectId:'fixture-a',title:'Decisión · campaña de muestra',body:'Revisar métricas sintéticas de capacitación',status:'bloqueado',priority:'muy alta',nextAction:'Consultar evidencia de prueba'});
              await send({id:'task-b',kind:'task',projectId:'fixture-b',title:'Campaña confidencial ficticia Beta',body:'No debe aparecer en Atlas',status:'pendiente',priority:'alta',nextAction:'Siguiente paso Beta'});
            }""")
            page.reload();page.get_by_role('button',name='Atlas · Fixture sintética',exact=True).click()
            search=page.get_by_label('Texto a buscar en la memoria de este proyecto');search.fill('metricas')
            page.get_by_role('button',name='Consultar memoria local').focus();page.keyboard.press('Enter')
            page.get_by_role('heading',name='Decisión · campaña de muestra').first.wait_for()
            assert page.get_by_text('No debe aparecer en Atlas',exact=True).count()==0
            assert page.locator('.memory-result-count').inner_text().startswith('1 coincidencias')
            page.evaluate("()=>{const b=document.createElement('div');b.className='badge';b.textContent='PREVISUALIZACIÓN · DATOS FICTICIOS';document.querySelector('.hero-copy').append(b)}")
            page.evaluate("document.activeElement?.blur();document.querySelector('.skip-link')?.remove()");page.mouse.move(1,1)
            page.screenshot(path=str(ROOT/'docs/captura-memoria-consulta-fixture.png'),full_page=True)
            page.locator('#show-tools').focus();page.keyboard.press('Enter')
            page.get_by_role('heading',name='Herramientas multidisciplinares').wait_for()
            assert page.locator('.capability-area-card').count()==5
            assert page.locator('.capability-tool-card').count()>=8
            assert page.get_by_text('Micrófono apagado',exact=False).count()==1
            assert page.get_by_text('no_integrado',exact=True).count()==0
            assert page.get_by_text('PR en borrador',exact=False).count()==1
            assert page.get_by_role('button',name='Ejecutar simulación con datos sintéticos').count()==0
            page.evaluate("document.activeElement?.blur();document.querySelector('.skip-link')?.remove()");page.mouse.move(1,1)
            page.screenshot(path=str(ROOT/'docs/captura-capacidades-fixture.png'),full_page=True)
            page.set_viewport_size({'width':390,'height':844})
            assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth')
            assert page.locator('.capability-state').first.evaluate("e=>e.getBoundingClientRect().height>=30")
            page.locator('.capability-tool-card').first.focus();page.keyboard.press('Tab')
            assert not errors,errors
            assert remote==[],remote
            browser.close()
        print('PASS: búsqueda local por proyecto, aislamiento de registros, acentos, filtros visuales, panel de capacidades reales, teclado, móvil y cero solicitudes externas.')
    finally:
        process.terminate();process.wait()
