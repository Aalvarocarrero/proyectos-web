# Interfaz Jarvis conectada al cerebro local

La vista Jarvis ya consulta el almacén local del proyecto por medio de la misma aplicación Cerebro. Desde el menú **Interfaz Jarvis** o en `http://127.0.0.1:8765/jarvis/`, muestra el catálogo reducido de proyectos, abre la memoria del ID elegido, permite buscar dentro de ese proyecto y representa registros originales, decisiones, tareas, bloqueos, checkpoints, evidencia y mensajes.

La lista no descarga todos los cuerpos: `/api/projects` devuelve solo ID, título, estado, prioridad y siguiente acción; `/api/projects/{id}/memory` devuelve los registros del único ID indicado. La conversación ofrece guardado de notas de texto mediante una acción explícita del usuario. El servidor valida el token local, estado del proyecto y esquema; los mensajes se anexan al diario y sobreviven reinicios. La UI registra cada intento en el navegador antes del POST, conserva su ID tras error y, si se recarga, compara el ID con el almacén antes de permitir un reintento manual. No genera respuestas ni ejecuta tareas.

La salida de voz permite leer únicamente texto seleccionado dentro de un registro o mensaje del proyecto activo. Usa voces españolas que el navegador marca `localService=true`, con estados de lectura, finalización, error y cancelación; cambiar de proyecto o cerrar la vista cancela la lectura. Esta etiqueta del navegador no verifica procesamiento offline. El panel separa salida TTS, entrada STT, estado del modelo e interrupción: no hay modelo conectado y Jarvis no genera respuestas habladas. No se solicita permiso de micrófono y no se invoca reconocimiento/captura de audio.

## Arranque en Mac o entorno local

El ZIP portable incluye los assets compilados bajo `jarvis-ui-preview/dist`; inicia Cerebro con:

```sh
python3 app/server.py
```

Abre `http://127.0.0.1:8765` y entra por **Interfaz Jarvis**, o visita directamente `http://127.0.0.1:8765/jarvis/`. En una clonación de código que no contenga `dist`, prepara los assets desde la carpeta `jarvis-ui-preview` con Node.js 22.19 o posterior:

```sh
npm install
npm run build
```

Después inicia el servidor Python. Para desarrollo, inicia Python en otra terminal y luego ejecuta `npm run dev`; Vite reenvía únicamente `/api` a `127.0.0.1:8765`. No se instala nada en macOS en el proceso de desarrollo actual.

## Contrato local y seguridad

`GET /api/session` entrega una revisión y un token efímero para escrituras locales; no es una clave de proveedor. `POST /api/messages` exige token y origen local, y acepta únicamente `{id, projectId, text}`. Un envío nuevo siempre recibe un UUID nuevo, incluso si el texto coincide con uno anterior. Un reintento conserva el ID anterior y el servidor responde idempotentemente si ya lo guardó. La UI no reintenta en segundo plano. Las lecturas usan el ID exacto y se comprueba el aislamiento entre proyectos con fixtures sintéticos.

La captura `captura-jarvis-ui-fixture.png` es una captura real de Chromium con almacenamiento temporal de prueba y proyectos ficticios; se excluye de Git. Las pruebas de navegador cubren búsqueda, selección por teclado, móvil, movimiento reducido, guardado explícito, ACK perdido después de persistir, recarga, fallo previo al guardado, reanudación con el mismo ID, mensajes idénticos intencionales, reinicio del servidor y el ciclo de voz simulado con voces locales/remotas ficticias. No hay llamadas externas, micrófono, audio físico ni datos reales en esas pruebas.

## Límites

Los componentes visuales `Core.tsx` y `Particles.tsx` proceden del repositorio MIT `adewaskar/jarvis`, fijado al commit `1c4016afdf86f7043efc6882ceffef84ad0d8783`; la licencia está en `jarvis-ui-preview/vendor/JARVIS-LICENSE-MIT.txt` y el aviso de origen en `jarvis-ui-preview/UPSTREAM-NOTICE.md`. El resto de la interfaz y la conexión al almacén son código propio. No se importaron sus puentes de agente, MCP, cámara, manos ni audios CC BY.

Micrófono, transcripción, voz conversacional y modelos siguen desconectados. La lectura en voz alta requiere una voz española que el navegador declare local; no se ha verificado audio real ni operación offline. La esfera es una visualización, no señal de inferencia. La ejecución de agentes no está integrada: el runtime de tareas actual depende de activaciones verificadas de dot. La pantalla y el almacén funcionan localmente; no hay previsualización alojada ni sincronización web.
