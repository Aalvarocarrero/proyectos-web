# Procedencia de Jarvis/Cerebro

Referencia upstream: `adewaskar/jarvis`, commit
`1c4016afdf86f7043efc6882ceffef84ad0d8783`.

Core.tsx y Particles.tsx proceden de ese código MIT. La composición del HUD
(header, rieles, señal, retículas, centro y panel lateral) adapta la estructura
de Hud.tsx/index.css. El segmentador propio sessionVad.js utiliza el enfoque
RMS, umbral adaptativo e histéresis documentado en lib/vad.ts, con PCM local,
liberación de pistas y límites propios. Licencia preservada en
vendor/JARVIS-LICENSE-MIT.txt, copyright 2026 Aditya Dewaskar.

CommandCenter integra los proyectos reales de Cerebro mediante brazos curvos y
subramas. El estado se alimenta del flujo real local: espera, escucha,
transcripción, inferencia y reproducción. No mide actividad de agentes externos.
La fuente Chakra Petch se distribuye localmente bajo OFL; licencia en
public/fonts/OFL.txt. No se distribuye música del repositorio.

No se ejecuta el App upstream, bridge de Claude, MCP, cámara, manos,
SpeechRecognition remoto ni ElevenLabs. Los servicios son el servidor Python,
Whisper.cpp y Ollama, todos locales. Conversar requiere un clic, permisos por
proyecto y sesión explícita; cambiar proyecto, ocultar página o Detener libera
el micrófono. Las referencias iCloud se usaron como guía visual de esfera y
ramas; sus miniaturas no se incluyen en esta distribución.

La salida actual usa la voz instalada Reed mediante macOS say y un reproductor
HTMLAudioElement acotado. Reemplaza la cola SpeechSynthesis en esta adaptación
para poder cancelar audio de forma unificada. No se clona ninguna persona.
