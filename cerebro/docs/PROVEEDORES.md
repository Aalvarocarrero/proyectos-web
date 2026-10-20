# Adaptadores de modelos (pendientes y apagados)

El paquete contiene un módulo desacoplado `app/providers.py` para Ollama local, Cloudflare Workers AI y Groq. No se conecta a la conversación, no lee el almacén de memoria y no se llama desde el servidor de Cerebro. La interfaz sigue indicando que no hay motor conversacional activo.

Los adaptadores usan exclusivamente la biblioteca estándar de Python. Codifican los formatos oficiales de chat: Ollama `POST /api/chat`; Workers AI OpenAI-compatible `/ai/v1/chat/completions`; y Groq `/openai/v1/chat/completions`. Ollama se fija a `127.0.0.1:11434`; los destinos cloud están fijados a sus dominios oficiales. Las redirecciones están bloqueadas.

Para cualquier solicitud se requiere seleccionar expresamente proveedor y modelo, habilitarlo en memoria del proceso y entregar un registro de capacidad verificado que incluya `chat`. Este corte no descubre ni certifica modelos reales: esa comprobación sigue pendiente. Sin ese registro, una selección válida y credenciales por variable de entorno, la función falla antes de llamar al transporte. `ProviderConfig` empieza con `enabled=False`; no hay conexión automática, selección alternativa ni guardado de claves.

Las llamadas reciben solo una lista explícita de mensajes de texto; ningún código extrae instrucciones, tareas, mensajes o historial del almacén. El límite conjunto de entrada es 12.000 caracteres, con 16 mensajes como máximo. El timeout por defecto es 12 segundos (límite de 60), el máximo de salida se limita a 1.024 tokens y las respuestas a 256 KB. La respuesta no se transmite en streaming. Los errores son códigos breves sin URL, cuerpo, prompt ni secreto. Ante HTTP 429 se informa el límite y se detiene: no hay reintento ni rotación de proveedor.

`tests/test_providers.py` inyecta un transporte falso y datos sintéticos para revisar solicitudes, selección, límites, fallos y 429. El resultado de estas pruebas es **simulado**, no comprueba disponibilidad ni modelos reales. No se han creado credenciales, instalado modelos, iniciado Ollama, llamado proveedores, configurado gasto ni transmitido memoria. Por ahora esta infraestructura queda lista para revisión y conexión futura, no para uso desde la conversación.

Referencias primarias consultadas:

- [Ollama: Chat API](https://docs.ollama.com/api/chat) y [lista de modelos](https://docs.ollama.com/api/tags).
- [Cloudflare Workers AI: endpoints compatibles con OpenAI](https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/), [REST API](https://developers.cloudflare.com/workers-ai/get-started/rest-api/) y [precios/límites](https://developers.cloudflare.com/workers-ai/platform/pricing/).
- [Groq: API Reference](https://console.groq.com/docs/api-reference) y [rate limits](https://console.groq.com/docs/rate-limits).

Workers AI puede cobrar por uso, con asignación gratuita condicionada según sus precios vigentes; Groq aplica límites por organización y devuelve 429 al superarlos. El adaptador no asume cuotas, plan ni coste cero. Deben revisarse términos, privacidad, políticas de edad y precio antes de elegir un proveedor para datos reales. Gemini no se incorpora a esta selección.
