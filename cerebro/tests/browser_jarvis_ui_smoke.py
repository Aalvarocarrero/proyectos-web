"""Real local-store integration: projects, isolated memory, durable notes and recovery."""
import json, os, socket, subprocess, sys, tempfile, time, urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
UI = ROOT / "jarvis-ui-preview"
if not (UI / "node_modules" / "vite").exists():
    raise RuntimeError("Instala las dependencias fijadas de jarvis-ui-preview antes de esta prueba; no se instalarán automáticamente.")
subprocess.run(["npm", "run", "build"], cwd=UI, check=True, stdout=subprocess.DEVNULL)

def free_port():
    sock=socket.socket(); sock.bind(("127.0.0.1",0)); port=sock.getsockname()[1]; sock.close(); return port

PORT=free_port()

def seed_store(data_dir):
    sys.path.insert(0,str(ROOT/"app"))
    from server import Store
    store=Store(data_dir)
    def create(entity):
        store.mutate({"revision":store.revision(),"action":"create","entity":entity,"evidence":[]})
    create({"id":"project-fixture-a","kind":"project","projectId":"","title":"Aula ficticia Alfa","body":"Descripción sintética A","status":"probado","priority":"muy alta","nextAction":"Revisar fixture A"})
    create({"id":"project-fixture-b","kind":"project","projectId":"","title":"Boreal ficticio Beta","body":"Descripción sintética B","status":"bloqueado","priority":"alta","nextAction":"Resolver fixture B"})
    create({"id":"instruction-fixture-a","kind":"instruction","projectId":"project-fixture-a","title":"Instrucción original A","body":"Original sintético exclusivo del proyecto Alfa.","status":"probado","priority":"muy alta","nextAction":""})
    create({"id":"task-fixture-a","kind":"task","projectId":"project-fixture-a","title":"Tarea A","body":"Texto de búsqueda café privado A","status":"en curso","priority":"alta","nextAction":"Comprobar A"})
    create({"id":"decision-fixture-b","kind":"decision","projectId":"project-fixture-b","title":"Decisión solo B","body":"Secreto ficticio de aislamiento Boreal.","status":"bloqueado","priority":"alta","nextAction":"Verificar B"})

def get_state(port):
    with urllib.request.urlopen(f"http://127.0.0.1:{port}/api/state") as response:return json.load(response)

def start_server(data_dir,port):
    process=subprocess.Popen([sys.executable,str(ROOT/"app/server.py"),"--data-dir",str(data_dir),"--port",str(port)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    for _ in range(80):
        try:urllib.request.urlopen(f"http://127.0.0.1:{port}/api/projects",timeout=.2).close();return process
        except Exception:
            if process.poll() is not None:raise RuntimeError("Cerebro local terminó antes de estar listo")
            time.sleep(.1)
    raise RuntimeError("Cerebro local no respondió")

with tempfile.TemporaryDirectory() as data:
    seed_store(data); process=start_server(data,PORT)
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path="/usr/bin/chromium",headless=True,args=["--no-sandbox","--enable-unsafe-swiftshader"])
            page=browser.new_page(viewport={"width":1440,"height":1200}); page_errors=[]; requests=[]
            page.on("pageerror",lambda error:page_errors.append(str(error)))
            page.on("request",lambda req:requests.append(req.url))
            page.add_init_script("""(()=>{
              window.__mediaCalls=0;window.__recognitionCalls=0;window.__utterances=[];window.__cancelCalls=0;window.__voiceEvents={};
              function FakeUtterance(text){this.text=text;window.__utterances.push(this)}
              Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:FakeUtterance});
              window.__testVoices=[
                {name:'Española local sintética',lang:'es-ES',localService:true,voiceURI:'es-local-fixture'},
                {name:'Voz remota excluida',lang:'es-ES',localService:false,voiceURI:'es-remote-fixture'},
                {name:'English local excluded',lang:'en-US',localService:true,voiceURI:'en-local-fixture'}
              ];
              Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>window.__testVoices.slice(),speak:utterance=>window.__spoken=utterance,cancel:()=>{window.__cancelCalls++},addEventListener:(name,handler)=>window.__voiceEvents[name]=handler,removeEventListener:()=>{}}});
              const md=navigator.mediaDevices||{};try{Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{...md,getUserMedia:()=>{window.__mediaCalls++;return Promise.reject(Error('unexpected capture'))}}})}catch{}
              window.SpeechRecognition=function(){window.__recognitionCalls++;throw Error('recognition must remain off')};window.webkitSpeechRecognition=window.SpeechRecognition;
            })()""")
            page.goto(f"http://127.0.0.1:{PORT}/")
            page.get_by_role("link",name="Interfaz Jarvis").click()
            page.get_by_text("ALMACÉN LOCAL · 2 PROYECTOS",exact=True).wait_for()
            page.locator("#memory-title").wait_for()
            assert "Original sintético exclusivo del proyecto Alfa." in page.locator(".memory-records").inner_text()
            assert "Secreto ficticio de aislamiento Boreal." not in page.locator(".memory-records").inner_text()
            assert page.locator(".network-project").count()==2
            assert page.get_by_text("ALMACÉN REAL",exact=True).count()==1
            assert page.get_by_text("Qwen3 local · permiso por proyecto",exact=True).count()==1
            assert page.get_by_text("Entrada STT",exact=True).count()==1
            assert "Sin escucha activa" in page.locator(".speech-panel").inner_text()
            assert "estado y respuestas en el panel de IA" in page.locator(".speech-panel").inner_text()
            assert page.locator("#jarvis-local-voice option").count()==1
            assert "Voz remota excluida" not in page.locator("#jarvis-local-voice").inner_text()
            assert "English local excluded" not in page.locator("#jarvis-local-voice").inner_text()
            assert page.get_by_role("button",name="Leer selección").is_disabled()
            assert page.evaluate("window.__utterances.length===0"),"no debe empezar TTS automáticamente"
            assert "Siguiente acción: Revisar fixture A" in page.locator(".memory-panel").inner_text()
            page.evaluate("""()=>{const label=document.createElement('div');label.textContent='PRUEBA DE NAVEGADOR · DATOS FICTICIOS · TTS SIMULADO';label.setAttribute('aria-label',label.textContent);label.style.cssText='position:fixed;right:16px;bottom:16px;z-index:9999;padding:8px 12px;border:1px solid #a88239;border-radius:8px;background:#241f16;color:#f0d69c;font:700 12px system-ui;letter-spacing:.08em';document.body.append(label)}""")
            page.screenshot(path=str(ROOT/"docs/captura-jarvis-ui-fixture.png"),full_page=True)

            def select_text(selector):
                page.locator(selector).evaluate("""element=>{const range=document.createRange();range.selectNodeContents(element);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range)}""")
            read=page.get_by_role("button",name="Leer selección");stop=page.get_by_role("button",name="Detener lectura")
            page.evaluate("window.__testVoices=window.__testVoices.filter(v=>v.voiceURI!=='es-local-fixture');window.__voiceEvents.voiceschanged()")
            assert read.is_disabled() and "Bloqueado" in page.locator(".speech-output-status").inner_text()
            page.evaluate("window.__testVoices=[{name:'Española local sintética',lang:'es-ES',localService:true,voiceURI:'es-local-fixture'},{name:'Voz remota excluida',lang:'es-ES',localService:false,voiceURI:'es-remote-fixture'},{name:'English local excluded',lang:'en-US',localService:true,voiceURI:'en-local-fixture'}];window.__voiceEvents.voiceschanged()")
            select_text("[data-record-id='instruction-fixture-a'] .record-content")
            page.wait_for_function("document.querySelector('#jarvis-local-voice option')?.value === '0'")
            assert not read.is_disabled() and stop.is_disabled()
            read.focus();page.keyboard.press("Enter")
            assert page.evaluate("window.__spoken && window.__spoken.text==='Original sintético exclusivo del proyecto Alfa.'")
            assert page.evaluate("window.__spoken.voice.voiceURI==='es-local-fixture'")
            page.evaluate("window.__spoken.onstart()")
            assert page.locator(".speech-output-status").get_attribute("data-state")=="speaking"
            before_cancel=page.evaluate("window.__cancelCalls")
            stop.click()
            assert page.evaluate("n=>window.__cancelCalls===n+1",before_cancel)
            assert "Lectura detenida por la persona" in page.locator(".speech-output-status").inner_text()
            select_text("[data-record-id='instruction-fixture-a'] .record-content")
            read.click();page.evaluate("window.__spoken.onstart();window.__spoken.onend()")
            assert page.locator(".speech-output-status").get_attribute("data-state")=="ended"
            assert "No se ha verificado" in page.locator(".speech-output-status").inner_text()
            select_text("[data-record-id='instruction-fixture-a'] .record-content")
            read.click();page.evaluate("window.__spoken.onerror({error:'synthesis-failed'})")
            assert page.locator(".speech-output-status").get_attribute("data-state")=="error"
            select_text("#page-title")
            assert read.is_disabled(),"no se deben leer selecciones fuera de un registro del proyecto"
            select_text("[data-record-id='instruction-fixture-a'] .record-content")
            read.click();page.evaluate("window.__spoken.onstart()")
            before_cancel=page.evaluate("window.__cancelCalls")

            response=page.evaluate("async()=>await (await fetch('/api/projects/project-fixture-a/memory?limit=200')).json()")
            assert response["projectId"]=="project-fixture-a"
            assert all("Boreal" not in row["content"] and row["recordId"]!="decision-fixture-b" for row in response["records"])

            node=page.locator('[data-project-id="project-fixture-b"]');node.focus();node.press("Enter")
            assert page.evaluate("n=>window.__cancelCalls===n+1",before_cancel),"cambiar proyecto debe detener la lectura"
            assert node.get_attribute("aria-pressed")=="true"
            assert "Secreto ficticio de aislamiento Boreal." in page.locator(".memory-records").inner_text()
            assert "Original sintético exclusivo del proyecto Alfa." not in page.locator(".memory-records").inner_text()
            page.locator(".project-choice").filter(has_text="Aula ficticia Alfa").click()
            page.get_by_label("Buscar solo en Aula ficticia Alfa").fill("cafe privado")
            page.get_by_role("button",name="Buscar",exact=True).click()
            assert "Texto de búsqueda café privado A" in page.locator(".memory-records").inner_text()
            assert page.locator("[data-record-id='decision-fixture-b']").count()==0
            page.get_by_label("Buscar solo en Aula ficticia Alfa").fill("Boreal")
            page.get_by_role("button",name="Buscar",exact=True).click()
            assert "No hay registros que coincidan" in page.locator(".memory-records").inner_text()
            page.get_by_label("Buscar solo en Aula ficticia Alfa").fill("")
            page.get_by_role("button",name="Buscar",exact=True).click()

            message="Nota local tras ACK perdido, fixture Alfa."
            page.get_by_label("Mensaje nuevo para guardar en este proyecto").fill(message)
            def persist_then_drop(route):
                route.fetch(); route.abort()
            page.route("**/api/messages",persist_then_drop)
            page.get_by_role("button",name="Guardar mensaje nuevo").click()
            page.get_by_text("No se confirmó el guardado",exact=False).wait_for()
            attempts=page.evaluate("key=>JSON.parse(localStorage.getItem(key)||'[]')","cerebro.jarvis.messageAttempts.v1:project-fixture-a")
            assert len(attempts)==1 and attempts[0]["projectId"]=="project-fixture-a" and attempts[0]["text"]==message
            assert len([m for m in get_state(PORT)["document"]["messages"] if m["text"]==message])==1
            page.unroute("**/api/messages"); page.reload()
            page.get_by_text("El almacén confirmó tras recargar",exact=False).wait_for()
            assert page.locator(".stored-message").filter(has_text=message).count()==1
            assert page.locator(".pending-attempt").count()==0
            assert page.evaluate("key=>localStorage.getItem(key)","cerebro.jarvis.messageAttempts.v1:project-fixture-a") is None

            pre_save="Nota de recuperación local, fixture Alfa."
            page.get_by_label("Mensaje nuevo para guardar en este proyecto").fill(pre_save)
            def drop_before_save(route):route.abort()
            page.route("**/api/messages",drop_before_save)
            page.get_by_role("button",name="Guardar mensaje nuevo").click()
            page.get_by_text("El intento quedó guardado localmente",exact=False).wait_for()
            pending=page.evaluate("key=>JSON.parse(localStorage.getItem(key)||'[]')","cerebro.jarvis.messageAttempts.v1:project-fixture-a");pending_id=pending[0]["id"]
            page.unroute("**/api/messages");page.reload()
            retry=page.get_by_role("button",name="Comprobar y reintentar este intento");retry.wait_for();retry.click()
            page.get_by_text(pre_save,exact=True).wait_for()
            assert len([m for m in get_state(PORT)["document"]["messages"] if m["text"]==pre_save])==1
            assert get_state(PORT)["document"]["messages"][-1]["id"]==pending_id

            page.get_by_label("Mensaje nuevo para guardar en este proyecto").fill(pre_save)
            page.get_by_role("button",name="Guardar mensaje nuevo").click()
            page.get_by_text("Mensaje guardado en la memoria local",exact=False).wait_for()
            identical=[m for m in get_state(PORT)["document"]["messages"] if m["text"]==pre_save]
            assert len(identical)==2 and identical[0]["id"]!=identical[1]["id"]

            double_click="Nota de fixture con doble clic."
            page.get_by_label("Mensaje nuevo para guardar en este proyecto").fill(double_click)
            page.get_by_role("button",name="Guardar mensaje nuevo").dblclick()
            page.get_by_text("Mensaje guardado en la memoria local",exact=False).wait_for()
            assert len([m for m in get_state(PORT)["document"]["messages"] if m["text"]==double_click])==1

            process.terminate();process.wait(timeout=10);process=start_server(data,PORT)
            page.reload();page.get_by_text(pre_save,exact=True).first.wait_for()
            page.locator(".project-choice").filter(has_text="Boreal ficticio Beta").click()
            assert page.locator(".stored-message").filter(has_text=pre_save).count()==0
            assert "Secreto ficticio de aislamiento Boreal." in page.locator(".memory-records").inner_text()

            page.set_viewport_size({"width":390,"height":844})
            assert page.evaluate("document.documentElement.scrollWidth<=window.innerWidth")
            assert page.locator(".network-map").evaluate("e=>getComputedStyle(e).display")=="none"
            assert page.locator(".project-choice").first.evaluate("e=>e.getBoundingClientRect().height")>=44
            assert page.get_by_role("button",name="Leer selección").evaluate("e=>e.getBoundingClientRect().height")>=44
            page.emulate_media(reduced_motion="reduce")
            assert page.locator(".project-choice").first.evaluate("e=>parseFloat(getComputedStyle(e).transitionDuration)")<=0.00001
            assert page.evaluate("window.__mediaCalls")==0
            assert page.evaluate("window.__recognitionCalls")==0
            assert all(url.startswith(f"http://127.0.0.1:{PORT}/") for url in requests),requests
            assert not page_errors,page_errors

            # The documented Vite developer route proxies only local /api calls to the same store.
            dev_port=free_port(); env=os.environ.copy(); env["CEREBRO_API_ORIGIN"]=f"http://127.0.0.1:{PORT}"
            vite=subprocess.Popen(["npm","run","dev","--","--port",str(dev_port),"--strictPort"],cwd=UI,env=env,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            try:
                for _ in range(80):
                    try:urllib.request.urlopen(f"http://127.0.0.1:{dev_port}/jarvis/",timeout=.2).close();break
                    except Exception:
                        if vite.poll() is not None:raise RuntimeError("Vite local no respondió")
                        time.sleep(.1)
                dev_page=browser.new_page(viewport={"width":1280,"height":900});dev_errors=[]
                dev_page.on("pageerror",lambda error:dev_errors.append(str(error)))
                dev_page.goto(f"http://127.0.0.1:{dev_port}/jarvis/")
                dev_page.get_by_text("ALMACÉN LOCAL · 2 PROYECTOS",exact=True).wait_for()
                assert "Original sintético exclusivo del proyecto Alfa." in dev_page.locator(".memory-records").inner_text()
                dev_page.get_by_label("Mensaje nuevo para guardar en este proyecto").fill("Nota local desde Vite, fixture de desarrollo.")
                dev_page.get_by_role("button",name="Guardar mensaje nuevo").click()
                dev_page.get_by_text("Mensaje guardado en la memoria local",exact=False).wait_for()
                assert any(m["text"]=="Nota local desde Vite, fixture de desarrollo." for m in get_state(PORT)["document"]["messages"])
                assert not dev_errors,dev_errors
            finally:
                vite.terminate();vite.wait(timeout=10)
            browser.close()
    finally:
        process.terminate();process.wait(timeout=10)
print("PASS: Jarvis lee catálogo real y memoria por ID; búsqueda aislada; guardado explícito; ACK perdido + reload, deduplicación y reanudación; mensaje idéntico nuevo y doble clic; reinicio; teclado, móvil, reducción de movimiento y sin red externa/micrófono; Vite dev proxy al servidor local.")
