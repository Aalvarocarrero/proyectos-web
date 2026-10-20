# Cerebro de proyectos

Aplicación local con interfaz española, historial durable, diario de transcripciones, cola de acciones, búsqueda e intercambio de datos JSON/Markdown. Requiere Python 3.10 o posterior y usa biblioteca estándar. Escucha exclusivamente en `127.0.0.1`.

## Inicio

```sh
python3 app/server.py
```

Abre `http://127.0.0.1:8765`. Los datos se guardan localmente en `~/.cerebro-portable`; usa `--data-dir PATH` para otro almacén. Cierra el proceso con Control-C. El servidor solo vive mientras corre el proceso. En un entorno de desarrollo, usa un directorio persistente y la vista previa local cuando esté disponible. Esto no proporciona hosting 24/7 ni ejecución continua.

## Diario y cola

`POST /api/action` recibe eventos locales con IDs y conserva su contenido original. La cola registra intención antes de iniciar, historial fechado de estados, dependencias, checkpoint y evidencia. En un reinicio se recupera del diario; la interfaz recomienda la tarea pendiente más antigua con dependencias completadas. Si el resultado externo queda incierto, no se reintenta automáticamente y hace falta verificación humana. Los elementos de colas antiguas sin dependencias explícitas quedan marcados para revisión manual. La cola registra trabajo; no ejecuta agentes, código o envíos de correo. La captura automática de voz tampoco está conectada.

## Importación y exportación

Importa exportaciones validadas con control de conflictos e IDs idempotentes. El JSON es la copia completa; el Markdown incorpora un bloque canónico para reimportarlo. Antes de importar una configuración divergente, crea un respaldo y resuelve los campos explícitamente. El adaptador `app/import_shared.py` acepta entradas estructuradas 1.0 proporcionadas localmente; no consulta fuentes remotas.

Dos almacenes pueden intercambiarse manualmente cuando ambos servidores están detenidos, con `python3 app/sync_local.py PATH_A PATH_B`. Es una fusión local con detección de conflictos; no comparte datos por Internet ni activa tareas externas.

## Pruebas

`python3 -m unittest discover -s tests -v`. Si Chromium y Playwright ya están instalados, `python3 tests/browser_smoke.py` añade una comprobación visual. Las pruebas usan únicamente fixtures sintéticos.

Los datos locales, respaldos, claves y capturas están excluidos por `.gitignore`. Esta distribución no contiene contenido de proyectos ni datos reales.

Vista de recuperación con tareas ficticias: [captura-recuperacion-fixture.png](docs/captura-recuperacion-fixture.png).
