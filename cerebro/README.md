# Cerebro de proyectos

Aplicación local con interfaz española, red interactiva de proyectos basada en el almacén local, memoria por proyecto, mensajes de texto durables, historial, diario de transcripciones, cola de acciones, búsqueda e intercambio JSON/Markdown. Requiere Python 3.10 o posterior y usa biblioteca estándar. Escucha exclusivamente en `127.0.0.1`.

## Inicio

```sh
python3 app/server.py
```

Abre `http://127.0.0.1:8765`. Los datos se guardan localmente en `~/.cerebro-portable`; usa `--data-dir PATH` para otro almacén. Cierra el proceso con Control-C. El servidor solo vive mientras corre el proceso. En un entorno de desarrollo, usa un directorio persistente y la vista previa local cuando esté disponible. Esto no proporciona hosting 24/7 ni ejecución continua.

## Red, memoria y mensajes

La pantalla inicial pone primero el mapa radial interactivo: un núcleo propio con anillos y partículas enlaza a los proyectos reales del almacén mediante brazos curvos. Una lista accesible equivalente, teclado y diseño móvil mantienen la navegación. Al abrir un proyecto se muestra su conversación local y después su memoria, búsquedas, tareas y cronología. La consola usa métricas leídas del diario real, indica **Sin modelo conectado** y **Ejecución no integrada**, y no muestra estados de pensamiento fingidos. Los mensajes escritos se guardan como notas de texto locales por proyecto y sobreviven reinicios; no generan respuestas. Si se pierde una respuesta al guardar, la interfaz conserva localmente el ID y borrador del intento; al volver, comprueba si el almacén ya lo recibió antes de ofrecer reintentar con el mismo ID. La misma protección cubre la cola. No se deduplica por título o texto: una nueva tarea o mensaje intencional recibe otro ID.

La conversación no genera respuestas. **Leer selección** usa únicamente texto seleccionado dentro de un mensaje guardado y voces que el navegador reporta `localService=true`; se bloquea si no hay una voz así. Esa marca no equivale a una auditoría independiente del tráfico y no se comprobó audio real. La entrada por micrófono y la transcripción continúan deshabilitadas; Cerebro no solicita permiso ni captura audio. El [estado de voz](docs/VOZ.md) detalla límites. El runtime de tareas depende de activaciones verificadas de dot.

## Diario y cola

`POST /api/action` recibe eventos locales con IDs y conserva su contenido original. La cola registra intención antes de iniciar, historial fechado de estados, dependencias, checkpoint y evidencia. En un reinicio se recupera del diario; la interfaz recomienda la tarea pendiente más antigua con dependencias completadas. Si el resultado externo queda incierto, no se reintenta automáticamente y hace falta verificación humana. El reenvío manual de la misma intención local usa su mismo ID y la API devuelve el registro ya existente antes de aplicar la revisión; las transiciones posteriores conservan el historial. Los elementos de colas antiguas sin dependencias explícitas quedan marcados para revisión manual. La cola registra trabajo; no ejecuta agentes, código o envíos de correo. La captura automática de voz tampoco está conectada.

## Importación y exportación

Importa exportaciones validadas con control de conflictos e IDs idempotentes. El JSON es la copia completa; el Markdown incorpora un bloque canónico para reimportarlo. Antes de importar una configuración divergente, crea un respaldo y resuelve los campos explícitamente. El adaptador `app/import_shared.py` acepta entradas estructuradas 1.0 proporcionadas localmente; no consulta fuentes remotas.

Dos almacenes pueden intercambiarse manualmente cuando ambos servidores están detenidos, con `python3 app/sync_local.py PATH_A PATH_B`. Es una fusión local con detección de conflictos; no comparte datos por Internet ni activa tareas externas.

## Pruebas

`python3 -m unittest discover -s tests -v`. Si Chromium y Playwright ya están instalados, `python3 tests/browser_smoke.py` prueba interfaz, teclado, contraste, movimiento reducido, móvil, memoria y reinicio; `python3 tests/browser_retry_smoke.py` simula ACK perdido, errores, recarga y reintento; `python3 tests/browser_providers_smoke.py` prueba los estados y simulación sintética; `python3 tests/browser_memory_capabilities_smoke.py` comprueba la búsqueda aislada; `python3 tests/browser_command_console_smoke.py` valida el mapa radial; `python3 tests/browser_speech_output_smoke.py` verifica selección, voces localService, estados y cancelación con un sintetizador simulado, sin audición real. Las pruebas usan únicamente fixtures sintéticos.

Los datos locales, respaldos, claves y capturas están excluidos por `.gitignore`. Esta distribución no contiene contenido de proyectos ni datos reales.

El ZIP portable incluye capturas reales de la interfaz con proyectos ficticios, incluida una vista móvil; las imágenes se excluyen del repositorio.

La voz bidireccional y la transcripción están pendientes. La lectura de selección se limita a voces que el navegador reporta `localService=true`, sin auditoría independiente del tráfico y sin audio real verificado. Véase [docs/VOZ.md](docs/VOZ.md). El módulo opcional de proveedores está apagado y fuera de la conversación; requiere configurar selección y verificar modelos de forma explícita. Su transporte solo se prueba con fixtures falsos; no se han llamado proveedores ni enviado memoria. Véase [docs/PROVEEDORES.md](docs/PROVEEDORES.md).

La vista **Proveedores IA** lista Ollama, Workers AI y Groq, requisitos pendientes y la diferencia entre Desactivado, Preparado y Verificado realmente. Su único botón ejecuta una simulación local con un transporte falso y datos sintéticos; no prueba conexión ni modelo real. Antes de usar Cloudflare de forma real, falta confirmar el plan y saldo diario. La aplicación no consulta facturación.

La build candidata v12 conserva **Herramientas y capacidades** y la consulta estructurada de memoria por proyecto. El panel marca memoria, respaldos y cola como probados localmente, adaptadores preparados sin configurar, simulación como simulada, conexiones reales desactivadas, voz pendiente y ejecución no integrada. Las áreas multidisciplinares indican qué información se puede organizar y los límites de lo que la app no hace. Véase [CAPACIDADES.md](docs/CAPACIDADES.md).
