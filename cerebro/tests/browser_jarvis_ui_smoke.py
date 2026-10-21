"""Browser smoke for the isolated Jarvis visual preview; requires Playwright + Chromium."""
import socket
import subprocess
import time
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
UI = ROOT / "jarvis-ui-preview"
probe = socket.socket()
probe.bind(("127.0.0.1", 0))
PORT = probe.getsockname()[1]
probe.close()
proc = subprocess.Popen(
    ["npm", "run", "preview", "--", "--host", "127.0.0.1", "--port", str(PORT), "--strictPort"],
    cwd=UI, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
)
try:
    for _ in range(100):
        try:
            import urllib.request
            urllib.request.urlopen(f"http://127.0.0.1:{PORT}/", timeout=.2).close()
            break
        except Exception:
            if proc.poll() is not None:
                raise RuntimeError("Vite preview exited before becoming ready")
            time.sleep(.1)
    else:
        raise RuntimeError("Vite preview did not become ready")

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/usr/bin/chromium", headless=True,
            args=["--no-sandbox", "--enable-unsafe-swiftshader"],
        )
        page = browser.new_page(viewport={"width": 1440, "height": 1200})
        page_errors, external_requests, media_calls = [], [], []
        page.on("pageerror", lambda error: page_errors.append(str(error)))
        page.on("request", lambda request: external_requests.append(request.url)
                if not request.url.startswith(f"http://127.0.0.1:{PORT}/") else None)
        page.add_init_script("""() => {
          Object.defineProperty(navigator, 'mediaDevices', {configurable:true, value:{
            getUserMedia: (...args) => { window.__mediaCalls=(window.__mediaCalls||0)+1; return Promise.reject(new Error('blocked in test')); }
          }});
        }""")
        page.goto(f"http://127.0.0.1:{PORT}/", wait_until="networkidle")
        page.get_by_text("DEMOSTRACIÓN · DATOS FICTICIOS.", exact=False).wait_for()
        assert page.get_by_text("Sin modelo conectado", exact=True).count() == 1
        assert page.get_by_text("Micrófono apagado", exact=True).count() == 1
        assert page.get_by_text("Ejecución no integrada", exact=True).count() == 1
        assert page.locator(".network-project").count() == 4
        assert page.locator(".project-choice").count() == 4
        assert page.locator(".voice-controls button:disabled").count() == 2
        assert page.locator(".memory-panel").inner_text().find("Proyecto Aurora") >= 0
        page.screenshot(path=str(ROOT / "docs/captura-jarvis-ui-fixture.png"), full_page=True)

        # Select through keyboard and confirm project-local fixture memory changes.
        node = page.locator('.network-project[data-project-id="atlas-demo"]')
        node.focus()
        assert node.evaluate("e=>e.matches(':focus')")
        node.press("Enter")
        assert node.get_attribute("aria-pressed") == "true"
        assert "Atlas de Muestra" in page.locator(".memory-panel").inner_text()
        assert "Observatorio" not in page.locator(".memory-panel").inner_text()
        # Explicitly create a fresh, intentional selection using the list control.
        page.locator(".project-choice").filter(has_text="Taller Boreal").click()
        assert "Taller Boreal" in page.locator(".memory-panel").inner_text()
        assert "bloqueado" in page.locator(".memory-panel").inner_text()

        # The client is a pure static fixture: no storage, audio permission, or external calls.
        assert page.evaluate("Object.keys(localStorage).length") == 0
        assert page.evaluate("window.__mediaCalls || 0") == 0
        assert not external_requests, external_requests
        assert not page_errors, page_errors
        assert not media_calls

        page.set_viewport_size({"width": 390, "height": 844})
        assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
        assert page.locator(".network-map").evaluate("e=>getComputedStyle(e).display") == "none"
        assert page.locator(".project-choice").count() == 4
        assert page.locator(".project-choice").first.evaluate("e=>e.getBoundingClientRect().height") >= 44
        page.emulate_media(reduced_motion="reduce")
        duration = page.locator(".project-choice").first.evaluate("e=>parseFloat(getComputedStyle(e).transitionDuration)")
        assert duration <= 0.00001, duration
        assert not page_errors, page_errors
        browser.close()
finally:
    proc.terminate()
    proc.wait(timeout=10)
print("PASS: vista radial y memoria sintética; selección teclado/lista; móvil; movimiento reducido; sin storage, micrófono, llamadas externas ni errores de consola.")
