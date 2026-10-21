# Vista aislada Jarvis

`jarvis-ui-preview/` es una exploración visual local, separada de la aplicación principal y del almacén de usuario. Combina un orbe de partículas, mapa radial de proyectos ficticios, lista accesible y panel de memoria sintética. Seleccionar un nodo solo cambia el fixture en memoria del navegador. La vista no lee ni escribe el diario de Cerebro, no guarda en `localStorage`, no llama APIs, no conecta un proveedor y no ejecuta tareas.

## Arranque local

Requiere Node.js 22.19 o posterior y npm. Desde la carpeta del Cerebro:

```sh
cd jarvis-ui-preview
npm install
npm run dev
```

Abre la dirección local que muestra Vite, normalmente `http://127.0.0.1:5173`. La primera instalación obtiene las dependencias del registro npm; después puede iniciarse sin contactar servicios de IA. Para validar una build estática usa `npm run build`. La prueba de navegador está en `tests/browser_jarvis_ui_smoke.py` y usa el Chromium/Playwright ya disponible en el entorno de desarrollo.

## Alcance técnico

La vista conserva la aplicación local existente sin reemplazarla. Se extrajeron los componentes visuales `Core.tsx` y `Particles.tsx` del repositorio MIT `adewaskar/jarvis`, fijado al commit `1c4016afdf86f7043efc6882ceffef84ad0d8783`; la licencia está en `jarvis-ui-preview/vendor/JARVIS-LICENSE-MIT.txt` y el inventario en `jarvis-ui-preview/UPSTREAM-NOTICE.md`. No se importaron su puente de Claude, MCP, cámara, manos, acceso a ficheros, archivos de audio CC BY ni scripts de setup. El chat, micrófono y botones de voz aparecen desconectados; la lectura TTS por selección disponible en la app principal no se presenta como voz bidireccional en esta vista.

La imagen `captura-jarvis-ui-fixture.png` es una captura real de Chromium con fixtures sintéticos y se excluye de Git por las reglas de capturas del repositorio. La verificación comprobó selección por teclado y lista, cambio de memoria de fixture, vista móvil sin desbordamiento, movimiento reducido y ausencia de almacenamiento, llamadas externas, petición de micrófono y errores de consola. La build funciona; Vite advierte que el paquete del orbe excede 500 kB minificado, lo que conviene optimizar antes de servirlo como parte integrada de la aplicación.

## Próximo paso de integración

Para convertir esta capa visual en la vista principal, el paso siguiente es adaptarla al contrato local de lectura del estado real y a los IDs de proyecto existentes, con pruebas de separación entre proyectos y reinicio. Eso aún no está hecho en esta vista. No hay enlace web publicado; se ejecuta localmente.
