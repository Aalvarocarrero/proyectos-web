# Adaptadores de modelos (pendientes y apagados)

El paquete contiene un módulo desacoplado `app/providers.py` para Ollama local, Cloudflare Workers AI y Groq y un panel accesible **Proveedores IA**. No se conecta a la conversación ni lee el almacén de memoria. La interfaz sigue indicando que no hay motor conversacional activo.

Los adaptadores usan exclusivamente la biblioteca estándar de Python. Codifican los formatos oficiales de chat: Ollama `POST /api/chat`; Workers AI OpenAI-compatible `/ai/v1/chat/completions`; y Groq `/openai/v1/chat/completions`. Ollama se fija a `127.0.0.1:11434`; los destinos cloud están fijados a sus dominios oficiales. Las redirecciones están bloqueadas.

El estado operativo de cada proveedor es **Desactivado**. **Preparado** significa que selección y configuración están listas, pero sin una respuesta real; **Verificado realmente** exige una petición explícita autorizada y una respuesta real comprobada. Ningún proveedor está preparado ni verificado en esta instalación. No hay controles de conexión ni campos para credenciales en la interfaz. La versión actual no descubre ni certifica modelos reales.

El botón **Ejecutar simulación con datos sintéticos** hace una sola petición local al endpoint de simulación, enviando únicamente el identificador del proveedor. El servidor ejecuta `simulate_provider`, que pasa una pregunta fija ficticia a `chat_completion` con transporte falso y recibe una respuesta fixture. El transporte valida que modelo y contenido sean fixtures; no abre conexiones ni puede devolver una verificación real. El resultado se rotula **SIMULACIÓN COMPLETADA · NO VERIFICADO**, mantiene el estado en Desactivado, no altera el diario y no se conserva en `localStorage`.

Contrato de simulación: `POST /api/providers/simulate`, protegido por el token local de Cerebro, recibe exactamente `{"provider":"ollama|cloudflare|groq"}`. Rechaza mensajes, contenido adicional o proveedor desconocido. La respuesta sintética declara `simulation: true`, `realConnectionVerified: false` y `providerStatus: "desactivado"`. No es un endpoint de chat y no acepta instrucciones ni historial.

Para cualquier petición real futura se requeriría seleccionar proveedor y modelo, habilitarlo explícitamente y entregar un registro de capacidad comprobado que incluya `chat`. Sin ese registro, la función de chat falla antes de invocar el transporte. `ProviderConfig` empieza con `enabled=False`; no hay conexión automática, selección alternativa ni guardado de claves.

Las llamadas reciben solo una lista explícita de mensajes de texto; ningún código extrae instrucciones, tareas, mensajes o historial del almacén. El límite conjunto de entrada es 12.000 caracteres, con 16 mensajes como máximo. El timeout por defecto es 12 segundos (límite de 60), el máximo de salida se limita a 1.024 tokens y las respuestas a 256 KB. La respuesta no se transmite en streaming. Los errores son códigos breves sin URL, cuerpo, prompt ni secreto. Ante HTTP 429 se informa el límite y se detiene: no hay reintento ni rotación de proveedor.

`tests/test_providers.py`, `tests/test_http.py` y `tests/browser_providers_smoke.py` prueban selección, límites, 429, bloqueo de conexión, endpoint local sin mutación, navegación por teclado/móvil y separación entre simulación y verificación. Todas las respuestas son fixtures sintéticos. No se han creado credenciales, instalado modelos, iniciado Ollama, llamado proveedores, configurado gasto ni transmitido memoria. Antes de cualquier uso real de Cloudflare, queda pendiente confirmar el plan y saldo diario. Esta aplicación no consulta datos de facturación.

Referencias primarias consultadas:

- [Ollama: Chat API](https://docs.ollama.com/api/chat) y [lista de modelos](https://docs.ollama.com/api/tags).
- [Cloudflare Workers AI: endpoints compatibles con OpenAI](https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/), [REST API](https://developers.cloudflare.com/workers-ai/get-started/rest-api/) y [precios/límites](https://developers.cloudflare.com/workers-ai/platform/pricing/).
- [Groq: API Reference](https://console.groq.com/docs/api-reference) y [rate limits](https://console.groq.com/docs/rate-limits).

Workers AI puede cobrar por uso, con asignación gratuita condicionada según sus precios vigentes; Groq aplica límites por organización y devuelve 429 al superarlos. El adaptador no asume cuotas, plan ni coste cero. Deben revisarse términos, privacidad, políticas de edad y precio antes de elegir un proveedor para datos reales. Gemini no se incorpora a esta selección.
