# Instalación local de Cerebro con conversación y voz

Requiere Python 3.10+, Ollama local con qwen3:4b y, opcionalmente, whisper.cpp con modelo base multilingüe. Todos los servicios escuchan sólo loopback. No configura arranque automático. Los modelos, datos y credenciales no forman parte del código.

El servidor admite --local-model, --whisper-cli y --whisper-model. En macOS, --tts-voice 'Reed (Español (España))' habilita síntesis mediante la voz instalada, sin modificar tono ni velocidad. La calidad perceptual y disponibilidad deben validarse en cada dispositivo.

Conversar requiere un clic y permisos por proyecto. La sesión termina al detener, ocultar la página, cambiar de proyecto o alcanzar una hora. VAD local segmenta el audio, Whisper transcribe y Ollama responde. La sesión conserva hasta tres turnos anteriores propios; consultar documentos requiere selección explícita. No ejecuta herramientas ni tareas.

La salida NDJSON sólo expone el campo answer del JSON del modelo. Los fragmentos son provisionales; sólo la respuesta validada se guarda y se lee. Detener cancela solicitudes y reproducción. Los eventos tardíos no reinician audio. La interrupción se confirma tras transcribir una frase distinta para evitar que el eco corte la respuesta. El filtro cubre ecos cortos y la repetición rápida detiene la sesión. Estas heurísticas requieren validación acústica real, no sustituyen separación de voz profesional.

La voz se sintetiza a WAV temporal con ejecutable y voz fijos, sin shell. El archivo se elimina tras entregarlo; el reproductor local tiene cancelación y límite de duración. No se envía audio a proveedores.

El HUD enlaza proyectos reales por ID; conversación, memoria, notas y estado de agentes comparten almacén. La documentación de la base portable describe su comportamiento sin estas opciones habilitadas.

Validación: python -m unittest discover -s tests; node tests/session_vad_test.mjs; node tests/native_speech_test.mjs; npm run build en jarvis-ui-preview. Pruebas sintéticas cubren aislamiento, consentimiento, cancelación, eco corto, repetición y eventos tardíos. La prueba acústica humana sigue siendo necesaria.

Mantener respaldos locales antes de actualizar. El diario de assistant-local es independiente de la exportación JSON original: respaldar la carpeta de datos completa. No subir diarios, capturas privadas, modelos ni claves al repositorio.
