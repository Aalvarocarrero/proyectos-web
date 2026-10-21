# Capacidades verificables de la build v10

El panel **Herramientas y capacidades** lee el inventario local de `GET /api/capabilities`. Los estados describen exactamente esta build, no promesas de capacidad general.

| Estado | Significado |
|---|---|
| Probado localmente | La función del cerebro pasó pruebas locales; no implica publicación. |
| Preparado · código desacoplado | Hay un adaptador en el código, sin configuración, credenciales ni conexión a la conversación. |
| Simulado | La prueba usa fixtures sintéticas y un transporte simulado; no verifica un servicio real. |
| Desactivado | No hay conexión activa ni llamada externa. |
| Pendiente | No se comprobó el funcionamiento real en un dispositivo. |
| No integrado | El cerebro conserva el registro, pero la ejecución está fuera de la aplicación. |

## Funciones reales

- La consulta de memoria permite filtrar por texto y tipo de registro, con búsqueda insensible a mayúsculas y acentos. Devuelve historial append-only, decisiones, tareas, checkpoints, acciones, mensajes y transcripciones citadas. Cada consulta exige el ID exacto de proyecto; nunca agrega los registros de otro proyecto.
- Las áreas de programación, diseño, marketing, educación/investigación y operaciones son categorías para organizar registros. No son agentes expertos ni generan código, diseños, campañas o tutorías.
- JSON, Markdown y copias de respaldo siguen siendo operaciones locales manuales. No hay sincronización automática con Notion, GitHub u otros servicios.
- La cola conserva intención previa, estados, evidencia, bloqueos y reanudación. No ejecuta agentes o tareas. El runtime actual depende de activaciones verificadas de dot.
- Los adaptadores de Ollama, Cloudflare Workers AI y Groq no están conectados a la conversación y no se llaman desde este panel. La simulación de proveedor solo prueba el flujo local con datos sintéticos. Cloudflare exige confirmar plan y cuota antes de cualquier uso real; la confirmación sigue pendiente.
- Voz: entrada y salida siguen pendientes. La app no activa micrófono, no transcribe audio ni habla respuestas. Consulte [Estado de voz](VOZ.md).

## Referencia de investigación de proveedores

Se conserva la investigación existente, en su rama de referencia, sin copiar ni alterar su contenido: [free-llm-api-resources.md en research/free-llm-api-resources-2026-10-21](https://github.com/Aalvarocarrero/proyectos-web/blob/research/free-llm-api-resources-2026-10-21/docs/research/free-llm-api-resources.md). La evaluación de opciones gratuitas no equivale a una autorización para conectar, transmitir memoria o consumir cuotas. Las restricciones de plan, límites, privacidad y modelos deben verificarse antes de cada conexión real. No se rota automáticamente de proveedor ante un 429.

La build de esta mejora es candidata local en PR de borrador. No está fusionada ni desplegada; no se etiqueta como publicada.
