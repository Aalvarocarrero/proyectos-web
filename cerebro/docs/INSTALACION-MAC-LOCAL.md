# Adaptación local de la instalación Mac

Base: ZIP portable v15, Library versión 14, SHA-256 verificado. El ZIP original y un respaldo anterior a la integración se conservan fuera de esta carpeta, en `artifacts/` y `backups/`.

El servidor acepta `--local-model` para conectar el adaptador fijo de Ollama en `127.0.0.1:11434`. Sin esa bandera la ruta de inferencia devuelve 503. Ollama se inicia con `OLLAMA_NO_CLOUD=1`, modelos bajo `OllamaModelos` y escucha exclusivamente loopback. No se instala arranque automático.

La interfaz Jarvis incorpora un panel Qwen3 4B por proyecto. Los permisos parten desactivados y se conceden o revocan explícitamente por ID. El chat recibe solamente el texto enviado, salvo que se marque la consulta de memoria local. Esa consulta recupera como máximo ocho referencias del proyecto seleccionado, con fragmentos limitados; no representa toda la memoria ni garantiza recuperación exhaustiva. Las referencias son datos históricos, no autorización de acciones. El modelo no recibe herramientas, comandos ejecutables ni proveedores externos.

Cada turno se registra antes de inferir en `CerebroDatos/assistant-local/journal.jsonl`, junto con proyecto, ID, rol de usuario, modelo, referencias de contexto y resultado. Las respuestas conservan el rol `assistant`. Este diario se respalda junto a la carpeta de datos, pero no está incluido en la exportación JSON antigua del menú principal. La recuperación conserva la identidad del intento; no reintenta automáticamente. Un intento interrumpido queda pendiente de revisión. No se debe borrar para forzar una nueva inferencia.

La copia privada Library v5 se importó con el importador nativo después de comprobar el hash y efectuar dry-run. Contiene 129 eventos y 80 transcripciones, con 11 proyectos. Una repetición añadió cero elementos. El grupo `cerebro-contexto-general` presenta las instrucciones históricas sin proyecto y sus transcripciones originales sin modificar sus IDs ni atribuirlas a otro proyecto. No transmite ese contexto a otras áreas. Se añadió un proyecto independiente de prueba sintética.

Ollama generó automáticamente su identidad local estándar en `~/.ollama` durante el primer inicio. No se creó una cuenta cloud ni se utilizó esa identidad para habilitar servicios externos.

La voz existente mantiene el filtro español `localService=true` y lectura por selección. Esa marca no demuestra funcionamiento offline. La suscripción ChatGPT no se usa como API. Groq permanece sin conectar en esta instalación.

## Entrada de voz local

El servidor admite `--whisper-cli` y `--whisper-model` junto a `--local-model`. Se compiló whisper.cpp v1.9.5 oficial y se verificó el modelo multilingüe base: SHA-256 `60ed5bc3dd14eea856493d334349b405782ddcaf0028d4b5df4088345fba2efe`. Motor y modelo permanecen fuera del repositorio.

Autoriza voz para el proyecto, pulsa Hablar y concede el permiso del navegador si aparece. Terminar y transcribir libera el micrófono antes de procesar audio. Captura máxima de 30 segundos, mono PCM 16 kHz; cambio de proyecto, cancelación y salida liberan las pistas. El backend usa un directorio temporal privado que elimina al terminar, sin guardar audio en memoria ni enviarlo a proveedores. Revisa la transcripción antes de pulsar Preguntar a Jarvis. El diario conserva texto confirmado y origen confirmed_transcript. Leer esta respuesta utiliza una voz española marcada localService.

Validación Mac: 68 pruebas Python; compilación UI y sintaxis del procesador AudioWorklet. Audio sintético español transcrito por Whisper. La prueba de micrófono humano y su permiso en Chrome queda pendiente del usuario; no se afirma escucha humana ni funcionamiento offline demostrado de TTS.
