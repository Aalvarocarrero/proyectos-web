"""Command-room UI smoke with real local records and synthetic project fixtures."""
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
            page=browser.new_page(viewport={'width':1440,'height':1050});errors=[];requests=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            page.on('request',lambda req:requests.append(req.url))
            page.add_init_script("""(()=>{window.__mediaCalls=0;window.__speechConstructors=0;
              const md=navigator.mediaDevices||{};try{Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{...md,getUserMedia:async()=>{window.__mediaCalls++;throw Error('unexpected capture')}}})}catch{}
              window.SpeechRecognition=function(){window.__speechConstructors++};window.webkitSpeechRecognition=window.SpeechRecognition;
            })()""")
            page.goto(f'http://127.0.0.1:{PORT}/')
            page.evaluate("""async()=>{
              let s=await (await fetch('/api/state')).json();
              const mutate=async body=>{s=await (await fetch('/api/state')).json();const r=await fetch('/api/action',{method:'POST',headers:{'Content-Type':'application/json','X-Cerebro-Token':s.token},body:JSON.stringify({revision:s.revision,...body})});if(!r.ok)throw Error(await r.text())};
              await mutate({action:'create',entity:{id:'project-console-fixture',kind:'project',projectId:'',title:'Observatorio · Proyecto ficticio',body:'PREVISUALIZACIÓN · DATOS FICTICIOS',status:'probado',priority:'alta',nextAction:'Revisar fixture'},evidence:[]});
              for (const [id,title] of [['fixture-education','Aula · Proyecto ficticio'],['fixture-farm','Finca · Proyecto ficticio'],['fixture-office','Oficina · Proyecto ficticio'],['fixture-mentor','Mentoría · Proyecto ficticio']]) {
                await mutate({action:'create',entity:{id,kind:'project',projectId:'',title,body:'PREVISUALIZACIÓN · DATOS FICTICIOS',status:'pendiente',priority:'media',nextAction:'Revisar fixture'},evidence:[]});
              }
              const entry=(id,state,outcome,title)=>({actionId:id,type:'task',state,outcome,intent:'Fixture local sin efectos externos',checkpoint:'Sin ejecución real',dependsOn:[],idempotencyKey:'key-'+id,title,projectId:'project-console-fixture',evidence:''});
              await mutate({action:'queue',entry:entry('action-pending','pending','not_started','Tarea de demostración pendiente')});
              await mutate({action:'queue',entry:entry('action-blocked','pending','not_started','Tarea de demostración bloqueada')});
              const blocked={...entry('action-blocked','blocked','failed','Tarea de demostración bloqueada')};
              await mutate({action:'queue',entry:blocked});
            }""")
            page.reload();page.get_by_role('heading',name='Un espacio para pensar y continuar.').wait_for()
            assert page.locator('.cerebro-orb').count()==1
            assert page.locator('.network-edge').count()==5
            assert 'Q' in page.locator('.network-edge').first.get_attribute('d')
            assert page.locator('.network-edge').first.evaluate("e=>getComputedStyle(e).stroke")=='rgb(196, 210, 198)'
            assert page.locator('.brain-particle').count()==16
            assert page.get_by_text('Sin modelo conectado',exact=True).count()==1
            facts=page.locator('.command-fact').all_inner_texts()
            assert facts==['5\nproyectos en memoria','5\nregistros fechados','1\ntareas pendientes','1\nbloqueos registrados'],facts
            assert page.get_by_text('Analizando',exact=False).count()==0
            page.evaluate("()=>{const b=document.createElement('span');b.className='badge';b.textContent='PREVISUALIZACIÓN · DATOS FICTICIOS';document.querySelector('.command-deck-content').append(b);document.activeElement?.blur();document.querySelector('.skip-link')?.remove()}")
            page.screenshot(path=str(ROOT/'docs/captura-command-center-fixture.png'),full_page=True)
            selector=page.get_by_label('Selecciona un proyecto para abrir su conversación local');selector.focus();selector.press('ArrowDown');selector.press('Enter')
            page.get_by_role('button',name='Abrir proyecto').focus();page.keyboard.press('Enter')
            page.get_by_role('heading',name='Conversación local',exact=True).wait_for()
            assert page.locator('.conversation-project-name').inner_text()=='Observatorio · Proyecto ficticio'
            assert page.get_by_text('Sin modelo conectado',exact=True).count()==1
            assert page.get_by_role('button',name='Pulsar para hablar').is_disabled()
            assert page.get_by_role('button',name='Detener',exact=True).is_disabled()
            assert page.get_by_label('Transcripción de voz pendiente').evaluate('e=>e.readOnly')
            assert 'Micrófono apagado' in page.locator('.voice-console').inner_text()
            assert page.get_by_label('Transcripción de voz pendiente').get_attribute('placeholder').startswith('No disponible:')
            assert page.evaluate('window.__mediaCalls===0 && window.__speechConstructors===0')
            page.evaluate("()=>{document.activeElement?.blur();document.querySelector('.skip-link')?.remove()}")
            page.screenshot(path=str(ROOT/'docs/captura-conversacion-voz-pendiente-fixture.png'),full_page=True)
            page.set_viewport_size({'width':390,'height':844})
            assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth')
            assert page.locator('.voice-console button').first.evaluate("e=>e.getBoundingClientRect().height>=44")
            page.emulate_media(reduced_motion='reduce')
            assert page.locator('.orb-halo-one').evaluate("e=>parseFloat(getComputedStyle(e).animationDuration)")<=0.00001
            assert page.evaluate('window.__mediaCalls===0 && window.__speechConstructors===0')
            assert all(url.startswith(f'http://127.0.0.1:{PORT}/') for url in requests),requests
            assert not errors,errors
            browser.close()
        print('PASS: consola/orbe propios, métricas del almacén, conversación vinculada al proyecto, sin respuesta fingida, voz en preparación desactivada, micrófono/API de voz sin llamar, teclado, móvil y movimiento reducido.')
    finally:
        process.terminate();process.wait()
