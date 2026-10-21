"""Public, local-only inventory of features in the portable Cerebro build."""

BUILD_LABEL = "v12 · candidato local"

_AREAS = [
    {"id": "programacion", "label": "Programación e ingeniería", "supports": ["instrucciones originales", "tareas y checkpoints", "bloqueos, evidencia y cronología"], "limit": "No ejecuta comandos, tests ni agentes."},
    {"id": "diseno", "label": "Diseño y creación", "supports": ["decisiones", "referencias y enlaces", "siguientes pasos"], "limit": "No genera ni edita imágenes, vídeo o archivos de diseño."},
    {"id": "marketing", "label": "Marketing y negocio", "supports": ["prioridades", "campañas como tareas", "decisiones y resultados anotados"], "limit": "No publica campañas, compra anuncios ni consulta métricas."},
    {"id": "educacion", "label": "Educación e investigación", "supports": ["fuentes", "citas/evidencias", "seguimiento y checkpoints"], "limit": "No accede a fuentes externas ni produce tutoría con IA."},
    {"id": "operaciones", "label": "Producto y operaciones", "supports": ["estados", "bloqueos", "balance y próxima acción"], "limit": "La cola registra trabajo; no lo ejecuta."},
]

_TOOLS = [
    {"id": "project-memory", "name": "Consulta de memoria local por proyecto", "state": "probado_localmente", "label": "Probado localmente", "scope": "Solo almacén local", "evidence": "Endpoint filtrado por projectId; búsqueda por texto y categoría, con historial, acciones, mensajes y transcripciones vinculadas explícitamente."},
    {"id": "json-markdown-backup", "name": "JSON/Markdown y respaldos", "state": "probado_localmente", "label": "Probado localmente", "scope": "Solo almacén local", "evidence": "Intercambio manual y respaldo local; no es sincronización automática."},
    {"id": "work-queue", "name": "Cola, recuperación y checkpoints", "state": "probado_localmente", "label": "Probado localmente", "scope": "Registro local", "evidence": "Intención, estado incierto, evidencia y reanudación; no lanza agentes ni tareas."},
    {"id": "provider-adapters", "name": "Adaptadores Ollama / Workers AI / Groq", "state": "preparado_sin_configurar", "label": "Preparado · código desacoplado", "scope": "No conectado a conversación", "evidence": "Adaptadores estándar con llamadas reales deshabilitadas en la app; el panel actual solo admite transporte simulado."},
    {"id": "provider-simulation", "name": "Comprobación de proveedores", "state": "simulado", "label": "Simulado · no verificado", "scope": "Fixture local sintético", "evidence": "No comprueba conexión, disponibilidad, modelo, plan ni cuota."},
    {"id": "provider-live", "name": "Conexiones reales de modelos", "state": "desactivado", "label": "Desactivado", "scope": "Sin llamadas externas", "evidence": "No hay credenciales ni modelos verificados; Cloudflare requiere confirmar plan/cuota antes de cualquier conexión."},
    {"id": "voice", "name": "Voz conversacional y lectura seleccionada", "state": "pendiente", "label": "Entrada pendiente · salida condicional sin audio verificado", "scope": "Micrófono apagado · texto seleccionado · voces localService=true reportadas", "evidence": "La UI ofrece lectura explícita de selección con estados start/end/error y cancelación; prueba automatizada usa sintetizador falso. No se comprobó audio real, no se audita de forma independiente el tráfico, no hay micrófono, STT ni respuestas de IA."},
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
