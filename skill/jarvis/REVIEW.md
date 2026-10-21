# Revisión estática del snapshot JARVIS

## Alcance y límites

Revisión del commit 1c4016afdf86f7043efc6882ceffef84ad0d8783 de adewaskar/jarvis, 2026-10-21. Se inventarió todo el árbol y se inspeccionaron rutas críticas de voz, red, permisos y conexión; componentes visuales se revisaron selectivamente. No es auditoría exhaustiva línea por línea ni análisis de todas las dependencias. No se instalaron dependencias, ejecutó código, compiló, ni probaron voz, cámara, servicios o dispositivos durante esta revisión. Las funciones descritas están presentes en código, no certificadas por ejecución.

## Componentes

- `src/scene/{Scene,Core,Orbits,Particles}.tsx`: núcleo Three.js, órbitas, partículas y postprocesado.
- `src/App.tsx`, `store.ts`, `config.ts`: ciclo de interacción y estados; React, Zustand y configuración.
- `src/ui/`: HUD, ventanas, paneles, puntero, diagnósticos, arranque; `sanitise.ts` filtra contenido con DOMPurify.
- `src/lib/audio.ts`, `voice.ts`, `vad.ts`: captura compartida, reconocimiento, nombre de activación, segmentos y filtro de eco. Navegador configurado en inglés británico; alternativa ElevenLabs Scribe a través del servidor.
- `src/lib/tts.ts`, `kokoro.ts`: cola de voz, cancelación, sistema/ElevenLabs/Kokoro opcionales. WebGPU y descarga de pesos para Kokoro; no implica reconocimiento local ni modelo de razonamiento local.
- `src/lib/brain.ts`, `bridge.ts`, `anthropic.ts`: conexión al motor Claude mediante puente o ruta directa alternativa a Anthropic.
- `bridge/server.mjs`: servidor Node, Claude Agent SDK, sesión Claude Code y herramientas MCP. Requiere Node >=20.
- `bridge/ui.mjs`, `panels.mjs`, `page.mjs`: configuración visual, contenido y lectura de páginas.
- `bridge/net.mjs`: controles de destino/DNS, redirecciones, límites y tiempos de solicitudes remotas.
- `bridge/chrome.mjs`: integración específica con socket local de la extensión Claude Chrome, no un navegador universal.
- `src/lib/camera.ts`, `hands.ts`, `oneEuro.ts`, `clap.ts`, `bridge/vision.mjs`: cámara, fotogramas, MediaPipe, gestos y palmadas. La interpretación visual por Claude es remota.
- `src/lib/music.ts`, `sfx.ts`, `fillers.ts`: ambiente, efectos sintetizados y frases de espera.
- `scripts/start.mjs`: inicia frontend Vite y servidor Node. No es un comando de previsualización exclusivamente visual.

## Límites funcionales relevantes

No proporcionar clave API puede significar reutilizar una sesión Claude Code, no trabajar sin red o sin coste. El razonamiento predeterminado es remoto. SpeechRecognition puede depender de servicios remotos del navegador; no garantiza uso offline: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition .

Porcupine figura como dependencia/configuración pero no se encontró conectado al flujo efectivo de voz. La sesión del puente se recrea tras reconexión WebSocket: no constituye memoria durable ni sincronización local-nube. Interrumpir una respuesta no revierte una herramienta externa ya ejecutada. El código predetermina esfuerzo `high` aunque la documentación indica `medium`; la disponibilidad comercial de los identificadores de modelo no se verificó. No hay script de tests ni suite automatizada incluida localizada.

## Revisión antes de desplegar

1. Añadir autenticación real y autorización por operación. Origin no es autenticación. `server.listen(PORT)` no fija explícitamente loopback. HTTP permite solicitudes sin Origin; no exponer el puente como está.
2. Restringir acceso a archivos, carpetas y MCP. No importar indiscriminadamente todos los MCP personales ni utilizar escritura global como modelo de permisos.
3. Las listas basadas en nombres de herramientas no garantizan ausencia de efectos, transmisiones o costes.
4. No publicar claves VITE ni tokens en frontend. La ruta directa `anthropic.ts` merece especial atención.
5. Añadir cierre real de pistas del micrófono; detener reconocimiento no implica liberar la captura compartida de `audio.ts`.
6. Exigir consentimiento y estado visible de cámara/micrófono, destino de audio e imágenes y ausencia de fallback externo silencioso.
7. Preservar y probar controles SSRF y sanitización. No asumir que sustituyen una auditoría.
8. Guardar intención y comprobante, reconciliar resultados inciertos y proteger contra tareas duplicadas tras desconexión.
9. `/health` señala configuración de claves para STT/TTS, no demuestra disponibilidad real del proveedor ni saldo.

## Adaptación recomendada

Separar contratos de reconocimiento, síntesis, razonamiento y ejecución. Diseñar contexto por proyecto/agente y diario persistente independiente del WebSocket. Empezar por una vista aislada con shell propio y componentes `src/scene/`, sin importar App original, voz, cámara, puente o instaladores. Introducir salida de voz probada; después entrada española con pulsar-para-hablar y parada de pistas; después proveedor local autorizado, aislado de herramientas con efectos.

Usar un orquestador de voz para varios avatares, no capturas simultáneas por personaje. Estado visual debe reflejar trabajo real, espera de aprobación y resultados por verificar. Un servidor local y una interfaz web son piezas distintas: localhost en el teléfono no apunta al ordenador. La publicación HTTPS requiere una ruta autenticada/cifrada apropiada.

Un frontend compilado puede alojarse estáticamente; el servidor Node/Claude Code/MCP no es directamente un Cloudflare Worker. Se necesita adaptar backend/proveedor y revisar recursos y límites de la plataforma antes de prometer despliegue gratuito.

## Licencias

Conservar MIT y copyright de Aditya Dewaskar. Mantener el crédito CC BY 4.0 de los tres MP3; excluirlos de despliegues que no puedan cumplir la atribución. Verificar aparte licencias de dependencias, pesos y marcas antes de distribuir una adaptación. Este archivo no autoriza uso de voces o material cinematográfico.
