# Cerebro de proyectos

> Adaptación Mac local: esta rama añade Qwen3 4B mediante Ollama, optativo con `--local-model`, permisos persistidos por proyecto respuestas separadas de las notas y entrada de voz puntual o sesión conversacional con Whisper local, HUD central y ramas de proyectos. Consulta [instalación y límites de esta adaptación](docs/INSTALACION-MAC-LOCAL.md). Las descripciones de v15 que siguen documentan la base portable sin el adaptador habilitado.

Aplicación local con interfaz española, red interactiva de proyectos basada en el almacén local, memoria por proyecto, mensajes de texto durables, historial, diario de transcripciones, cola de acciones, búsqueda e intercambio JSON/Markdown. El backend requiere Python 3.10 o posterior y usa biblioteca estándar. Escucha exclusivamente en `127.0.0.1`. El ZIP incluye los assets Jarvis ya compilados; Node.js solo hace falta para reconstruirlos desde el código fuente.

## Inicio

```sh
python3 app/server.py
```

Abre `http://127.0.0.1:8765`. La entrada **Interfaz Jarvis** o `/jarvis/` conecta al almacén de este servidor por ID de proyecto. Los datos se guardan localmente en `~/.cerebro-portable`; usa `--data-dir PATH` para otro almacén. Cierra el proceso con Control-C. El servidor solo vive mientras corre el proceso. Esto no proporciona hosting 24/7 ni ejecución continua.

## Red, memoria y mensajes

La pantalla inicial pone primero el mapa radial interactivo: un núcleo propio con anillos y partículas enlaza a los proyectos reales del almacén mediante brazos curvos. Una lista accesible equivalente, teclado y diseño móvil mantienen la navegación. Al abrir un proyecto se muestra su conversación local y después su memoria, búsquedas, tareas y cronología. La consola usa métricas leídas del diario real, indica **Sin modelo conectado** y **Ejecución no integrada**, y no muestra estados de pensamiento fingidos. Los mensajes escritos se guardan como notas de texto locales por proyecto y sobreviven reinicios; no generan respuestas. Si se pierde una respuesta al guardar, la interfaz conserva localmente el ID y borrador del intento; al volver, comprueba si el almacén ya lo recibió antes de ofrecer reintentar con el mismo ID. La misma protección cubre la cola. No se deduplica por título o texto: una nueva tarea o mensaje intencional recibe otro ID.

La conversación no genera respuestas. Jarvis permite leer una selección acotada dentro de un mensaje o registro del proyecto activo con una voz española que el navegador declara `localService=true`; se bloquea si no hay voz compatible. Esa marca no equivale a una auditoría independiente del tráfico y no se comprobó audio real. La entrada por micrófono y la transcripción continúan deshabilitadas; Cerebro no solicita permiso ni captura audio. El [estado de voz](docs/VOZ.md) detalla límites. El runtime de tareas depende de activaciones verificadas de dot.

El puerto para un futuro asistente local está preparado pero desconectado. Parte sin modelo, endpoint o credencial, no tiene conexión a la memoria y deniega por defecto el acceso por proyecto. El contrato de voz `es-ES` solo valida una transcripción textual confirmada; no captura ni procesa audio. Únicamente las pruebas inyectan un proveedor sintético. Véase [ASISTENTE-LOCAL.md](docs/ASISTENTE-LOCAL.md).

El adaptador opcional de Codex App Server local aparece como **Desactivado · sesión aislada pendiente** en Herramientas y capacidades. Pruebas sintéticas cubren protocolo, sesiones separadas por proyecto, cancelación y bloqueo de reintentos inciertos. Esta implementación no inicia sesión ni hace inferencias reales. Consulta [CODEX-APP-SERVER.md](docs/CODEX-APP-SERVER.md) para los requisitos de aislamiento.

## Diario y cola

`POST /api/action` recibe eventos locales con IDs y conserva su contenido original. La cola registra intención antes de iniciar, historial fechado de estados, dependencias, checkpoint y evidencia. En un reinicio se recupera del diario; la interfaz recomienda la tarea pendiente más antigua con dependencias completadas. Si el resultado externo queda incierto, no se reintenta automáticamente y hace falta verificación humana. El reenvío manual de la misma intención local usa su mismo ID y la API devuelve el registro ya existente antes de aplicar la revisión; las transiciones posteriores conservan el historial. Los elementos de colas antiguas sin dependencias explícitas quedan marcados para revisión manual. La cola registra trabajo; no ejecuta agentes, código o envíos de correo. La captura automática de voz tampoco está conectada.

## Importación y exportación

Importa exportaciones validadas con control de conflictos e IDs idempotentes. El JSON es la copia completa; el Markdown incorpora un bloque canónico para reimportarlo. Antes de importar una configuración divergente, crea un respaldo y resuelve los campos explícitamente. El adaptador `app/import_shared.py` acepta entradas estructuradas 1.0 proporcionadas localmente; no consulta fuentes remotas.

Dos almacenes pueden intercambiarse manualmente cuando ambos servidores están detenidos, con `python3 app/sync_local.py PATH_A PATH_B`. Es una fusión local con detección de conflictos; no comparte datos por Internet ni activa tareas externas.

## Pruebas

`python3 -m unittest discover -s tests -v`. Si Chromium/Playwright y, para Jarvis, Node con dependencias fijadas están disponibles, `python3 tests/browser_smoke.py` prueba interfaz, teclado, contraste, movimiento reducido, móvil, memoria y reinicio; `python3 tests/browser_retry_smoke.py` simula ACK perdido, errores, recarga y reintento; `python3 tests/browser_providers_smoke.py` prueba los estados y simulación sintética; `python3 tests/browser_memory_capabilities_smoke.py` comprueba la búsqueda aislada; `python3 tests/browser_command_console_smoke.py` valida el mapa radial; `python3 tests/browser_speech_output_smoke.py` verifica selección y cancelación TTS en el Cerebro principal; `python3 tests/browser_jarvis_ui_smoke.py` comprueba conexión al almacén local real con datos temporales sintéticos, aislamiento, persistencia, recuperación y lectura TTS simulada. Las pruebas no capturan audio ni usan proveedores.

Los datos locales, respaldos, claves y capturas están excluidos por `.gitignore`. Esta distribución no contiene contenido de proyectos ni datos reales.

El ZIP portable incluye capturas reales de la interfaz con proyectos ficticios, incluida una vista móvil; las imágenes se excluyen del repositorio.

La voz bidireccional y la transcripción están pendientes. La lectura de selección se limita a voces que el navegador reporta `localService=true`, sin auditoría independiente del tráfico y sin audio real verificado. Véase [docs/VOZ.md](docs/VOZ.md). El módulo opcional de proveedores está apagado y fuera de la conversación; requiere configurar selección y verificar modelos de forma explícita. Su transporte solo se prueba con fixtures falsos; no se han llamado proveedores ni enviado memoria. Véase [docs/PROVEEDORES.md](docs/PROVEEDORES.md).

La vista **Proveedores IA** lista Ollama, Workers AI y Groq, requisitos pendientes y la diferencia entre Desactivado, Preparado y Verificado realmente. Su único botón ejecuta una simulación local con un transporte falso y datos sintéticos; no prueba conexión ni modelo real. Antes de usar Cloudflare de forma real, falta confirmar el plan y saldo diario. La aplicación no consulta facturación.

La build candidata v15 conserva **Herramientas y capacidades** y la consulta estructurada de memoria por proyecto. El panel marca memoria, respaldos y cola como probados localmente, adaptadores preparados sin configurar, el puerto de asistente local como desconectado, simulación como simulada, conexiones reales desactivadas, voz condicional/pendiente y ejecución no integrada. Las áreas multidisciplinares indican qué información se puede organizar y los límites de lo que la app no hace. Véase [CAPACIDADES.md](docs/CAPACIDADES.md).

La carpeta `jarvis-ui-preview/` conecta la interfaz radial Jarvis al catálogo y memoria del servidor local por ID de proyecto. Las notas de texto se guardan tras acción explícita y con recuperación idempotente; TTS lee una selección con voz española reportada local cuando hay una disponible. El modelo, STT, la voz conversacional y la ejecución de agentes siguen desconectados. Consulta [JARVIS-UI.md](docs/JARVIS-UI.md) para arrancarla localmente; el almacén existente se conserva.
