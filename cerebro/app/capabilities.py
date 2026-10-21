"""Public, local-only inventory of features in the portable Cerebro build."""

BUILD_LABEL = "v15 · voz TTS seleccionada"

_AREAS = [
    {"id": "programacion", "label": "Programación e ingeniería", "supports": ["instrucciones originales", "tareas y checkpoints", "bloqueos, evidencia y cronología"], "limit": "No ejecuta comandos, tests ni agentes."},
    {"id": "diseno", "label": "Diseño y creación", "supports": ["decisiones", "referencias y enlaces", "siguientes pasos"], "limit": "No genera ni edita imágenes, vídeo o archivos de diseño."},
    {"id": "marketing", "label": "Marketing y negocio", "supports": ["prioridades", "campañas como tareas", "decisiones y resultados anotados"], "limit": "No publica campañas, compra anuncios ni consulta métricas."},
    {"id": "educacion", "label": "Educación e investigación", "supports": ["fuentes", "citas/evidencias", "seguimiento y checkpoints"], "limit": "No accede a fuentes externas ni produce tutoría con IA."},
    {"id": "operaciones", "label": "Producto y operaciones", "supports": ["estados", "bloqueos", "balance y próxima acción"], "limit": "La cola registra trabajo; no lo ejecuta."},
]

_TOOLS = [
    {"id": "jarvis-local-interface", "name": "Interfaz Jarvis conectada al almacén", "state": "probado_localmente", "label": "Probado localmente", "scope": "Lectura y escritura local por ID de proyecto", "evidence": "Catálogo reducido, memoria exacta por proyecto, búsqueda y notas de texto explícitas; IDs idempotentes con comprobación tras reinicio. Verificado con almacenes temporales sintéticos."},
    {"id": "project-memory", "name": "Consulta de memoria local por proyecto", "state": "probado_localmente", "label": "Probado localmente", "scope": "Solo almacén local", "evidence": "Endpoint filtrado por projectId; búsqueda por texto y categoría, con historial, acciones, mensajes y transcripciones vinculadas explícitamente."},
    {"id": "json-markdown-backup", "name": "JSON/Markdown y respaldos", "state": "probado_localmente", "label": "Probado localmente", "scope": "Solo almacén local", "evidence": "Intercambio manual y respaldo local; no es sincronización automática."},
    {"id": "work-queue", "name": "Cola, recuperación y checkpoints", "state": "probado_localmente", "label": "Probado localmente", "scope": "Registro local", "evidence": "Intención, estado incierto, evidencia y reanudación; no lanza agentes ni tareas."},
    {"id": "provider-adapters", "name": "Adaptadores Ollama / Workers AI / Groq", "state": "preparado_sin_configurar", "label": "Preparado · código desacoplado", "scope": "No conectado a conversación", "evidence": "Adaptadores estándar con llamadas reales deshabilitadas en la app; el panel actual solo admite transporte simulado."},
    {"id": "local-assistant-port", "name": "Puerto para modelo local", "state": "preparado_sin_configurar", "label": "Preparado · desconectado", "scope": "Local · permisos por proyecto · sin endpoint ni credenciales", "evidence": "Contrato inyectable y pruebas con proveedor sintético; config apagada por defecto. No está conectado a conversación, voz, memoria ni ejecución."},
    {"id": "provider-simulation", "name": "Comprobación de proveedores", "state": "simulado", "label": "Simulado · no verificado", "scope": "Fixture local sintético", "evidence": "No comprueba conexión, disponibilidad, modelo, plan ni cuota."},
    {"id": "provider-live", "name": "Conexiones reales de modelos", "state": "desactivado", "label": "Desactivado", "scope": "Sin llamadas externas", "evidence": "No hay credenciales ni modelos verificados; Cloudflare requiere confirmar plan/cuota antes de cualquier conexión."},
    {"id": "voice", "name": "Voz conversacional y lectura seleccionada", "state": "pendiente", "label": "STT pendiente · TTS condicional sin audio verificado", "scope": "Micrófono apagado · texto seleccionado por ID de proyecto · voces es-* con localService=true reportadas", "evidence": "Jarvis lee explícitamente una selección de un solo registro con una voz española declarada local por el navegador; estados de inicio/fin/error y cancelación, incluso al cambiar proyecto. Pruebas usan sintetizador falso. No se comprobó audio real ni offline, no hay micrófono, STT o respuestas de IA."},
    {"id": "task-execution", "name": "Ejecución de agentes y acciones", "state": "no_integrado", "label": "No integrado", "scope": "Fuera del runner", "evidence": "Cerebro registra el trabajo; el runtime de ejecución depende de activaciones verificadas de dot."},
]


def catalog():
    """Return a fresh JSON-safe description; no secrets or account metadata are read."""
    return {
        "build": BUILD_LABEL,
        "release": {"state": "draft", "label": "Probado localmente · PR en borrador · sin merge ni despliegue"},
        "areas": [dict(area, supports=list(area["supports"])) for area in _AREAS],
        "tools": [dict(tool) for tool in _TOOLS],
    }
