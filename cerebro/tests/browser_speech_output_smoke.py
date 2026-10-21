"""Local selection-only speech output: mocked lifecycle and strict localVoice gating."""
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
            page=browser.new_page(viewport={'width':1280,'height':900});errors=[];requests=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            page.on('request',lambda request:requests.append(request.url))
            page.add_init_script("""(()=>{
              window.__utterances=[];window.__cancelCalls=0;window.__mediaCalls=0;window.__speechEvents={};
              function FakeUtterance(text){this.text=text;window.__utterances.push(this)}
              Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:FakeUtterance});
              window.__testVoices=[{name:'Voz local de prueba',lang:'es-ES',localService:true,voiceURI:'local-fixture'},
                {name:'Voz remota excluida',lang:'es-ES',localService:false,voiceURI:'remote-fixture'}];
              Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>window.__testVoices.slice(),speak:utterance=>window.__spoken=utterance,
                cancel:()=>{window.__cancelCalls++},addEventListener:(name,handler)=>window.__speechEvents[name]=handler}});
              const md=navigator.mediaDevices||{};try{Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{...md,getUserMedia:async()=>{window.__mediaCalls++;throw Error('unexpected capture')}}})}catch{}
              window.SpeechRecognition=function(){throw Error('recognition must remain off')};
            })()""")
            page.goto(f'http://127.0.0.1:{PORT}/')
            page.evaluate("""async()=>{
              const mutate=async body=>{const s=await (await fetch('/api/state')).json();const response=await fetch('/api/action',{method:'POST',headers:{'Content-Type':'application/json','X-Cerebro-Token':s.token},body:JSON.stringify({revision:s.revision,...body})});if(!response.ok)throw Error(await response.text())};
              for(const [id,title] of [['voice-project-a','Proyecto Voz A · ficticio'],['voice-project-b','Proyecto Voz B · ficticio']])
                await mutate({action:'create',entity:{id,kind:'project',projectId:'',title,body:'Fixture ficticio; sin memoria real.',status:'pendiente',priority:'media',nextAction:'Revisar fixture'},evidence:[]});
              const s=await (await fetch('/api/state')).json();
              const response=await fetch('/api/action',{method:'POST',headers:{'Content-Type':'application/json','X-Cerebro-Token':s.token},body:JSON.stringify({revision:s.revision,action:'message',message:{id:'voice-note-fixture',projectId:'voice-project-a',text:'Solo léeme este fragmento sintético.'}})});
              if(!response.ok)throw Error(await response.text());
            }""")
            page.reload();page.locator('#projects').get_by_role('button',name='Proyecto Voz A · ficticio',exact=True).click()
            read=page.get_by_role('button',name='Leer selección');stop=page.get_by_role('button',name='Detener lectura')
            assert page.locator('[data-speech-voice] option').count()==1,(errors,page.evaluate('window.speechSynthesis.getVoices()'),page.locator('[data-speech-voice]').count(),page.locator('[data-speech-voice]').evaluate('e=>e.outerHTML'),page.evaluate('window.speechSynthesis.getVoices().filter(v=>v.localService===true)'),page.locator('#content').inner_text()[:500])
            assert 'Voz remota excluida' not in page.locator('[data-speech-voice]').inner_text()
            assert read.is_disabled() and stop.is_disabled()
            page.locator('.conversation-panel').evaluate("element=>{const label=document.createElement('p');label.textContent='CAPTURA SINTÉTICA · PROYECTOS FICTICIOS · SINTETIZADOR SIMULADO';label.style.cssText='padding:8px 10px;border:1px solid #9bb6ba;border-radius:8px;background:#e9f3f3;color:#173e48;font:700 12px system-ui;letter-spacing:.04em';element.prepend(label)}")
            (ROOT/'docs/captura-lectura-seleccion-fixture.png').parent.mkdir(exist_ok=True)
            page.locator('.conversation-panel').screenshot(path=str(ROOT/'docs/captura-lectura-seleccion-fixture.png'))
            page.evaluate("window.__testVoices=window.__testVoices.filter(v=>!v.localService);window.__speechEvents.voiceschanged()")
            assert page.locator('[data-speech-voice] option').count()==0 and read.is_disabled()
            assert 'Bloqueado' in page.locator('.speech-output-status').inner_text()
            page.evaluate("window.__testVoices=[{name:'Voz local de prueba',lang:'es-ES',localService:true,voiceURI:'local-fixture'}];window.__speechEvents.voiceschanged()")
            assert page.locator('[data-speech-voice] option').count()==1 and read.is_disabled()
            page.locator('.project-title h2').evaluate("element=>{const range=document.createRange();range.selectNodeContents(element);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range)}")
            assert read.is_disabled(), 'selection outside the message list must not be spoken'
            def select_saved_message():
                page.locator('.message-list .user-message p.original').evaluate("""element=>{
                  const range=document.createRange();range.selectNodeContents(element);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range)
                }""")
            select_saved_message();assert not read.is_disabled()
            read.focus();page.keyboard.press('Enter')
            assert page.evaluate("window.__spoken && window.__spoken.text==='Solo léeme este fragmento sintético.'")
            assert page.evaluate("window.__spoken.voice.voiceURI==='local-fixture'")
            page.evaluate("window.__spoken.onstart()")
            assert 'Leyendo selección' in page.locator('.speech-output-status').inner_text()
            stop.click()
            assert page.evaluate("window.__cancelCalls===1")
            assert 'Lectura detenida por la persona' in page.locator('.speech-output-status').inner_text()
            select_saved_message();read.click();page.evaluate("window.__spoken.onstart();window.__spoken.onend()")
            assert page.locator('.speech-output-status').get_attribute('data-state')=='ended'
            select_saved_message();read.click();page.evaluate("window.__spoken.onerror({error:'synthesis-failed'})")
            assert page.locator('.speech-output-status').get_attribute('data-state')=='error'
            select_saved_message();read.click();before=page.evaluate('window.__cancelCalls')
            page.locator('#show-network').click()
            assert page.evaluate('n=>window.__cancelCalls===n+1',before)
            page.locator('#projects').get_by_role('button',name='Proyecto Voz A · ficticio',exact=True).click();select_saved_message();read.click();before=page.evaluate('window.__cancelCalls')
            page.locator('#projects').get_by_role('button',name='Proyecto Voz B · ficticio',exact=True).click()
            assert page.evaluate('n=>window.__cancelCalls===n+1',before)
            page.locator('#projects').get_by_role('button',name='Proyecto Voz A · ficticio',exact=True).click();select_saved_message();read.click();before=page.evaluate('window.__cancelCalls')
            page.evaluate("window.dispatchEvent(new Event('pagehide'))")
            assert page.evaluate('n=>window.__cancelCalls===n+1',before)
            assert page.evaluate('window.__mediaCalls===0')
            assert all(url.startswith(f'http://127.0.0.1:{PORT}/') for url in requests),requests
            assert not errors,errors
            page.set_viewport_size({'width':390,'height':844})
            assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth')
            assert read.evaluate("e=>e.getBoundingClientRect().height>=44")
            browser.close()
        print('PASS: solo selección explícita, filtro localService=true, ciclo de vida mockeado, cancelación al detener/cambiar proyecto/vista/cerrar, sin micrófono ni red externa; audio real no probado.')
    finally:
        process.terminate();process.wait()
