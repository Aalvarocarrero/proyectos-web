# Aviso de origen de la interfaz Jarvis

Esta vista aislada adapta los componentes visuales `Core.tsx` y `Particles.tsx`
de `adewaskar/jarvis`, fijados al commit `1c4016afdf86f7043efc6882ceffef84ad0d8783`.
La lectura TTS adapta su enfoque de selección explícita de motor y cancelación;
la implementación de Cerebro es una capa pequeña propia sobre la voz del
navegador, limitada a texto seleccionado y voces `es-*` que el navegador marca
`localService=true`. Se conserva la licencia MIT en `vendor/JARVIS-LICENSE-MIT.txt`.
El resto de la pantalla, el mapa de proyectos ficticios, los textos y los estilos
se han creado para esta aplicación.

No se incluyen los bucles `voice.ts`/`vad.ts` que abren el micrófono y graban,
los servicios ElevenLabs/Kokoro, archivos de audio CC BY, puente de Claude, MCP,
cámara, manos, acceso al sistema de archivos, servicios ni configuración del
repositorio upstream. La esfera es solo una visualización; no representa
inferencia ni actividad de un agente. STT permanece apagado.
