# Entrega local v21 · Voz sintética local para las palabras

Base fuente exacta: `a0abaa966d13e9a7fa5ad9450c687f1f2b77cee6`, v20 corregida. Referencia Sites facilitada: `1d16c6899ffe8d3f1fa2b8c0243883d18928721c`, no modificada. Rama local: `feat/education-local-speech-v21-local`.

## Entrega acotada

Los seis pilotos ofrecen **Escuchar**, **Repetir la última palabra** y **Detener audio**. En la guía se pueden escuchar sus tres palabras; durante la práctica, el botón corresponde a la palabra actual. La síntesis recibe exclusivamente las 18 cadenas ya revisadas del banco `languages.mjs`; no se introduce texto libre ni se alteran vocabulario, respuestas, dificultad o actividades.

La interfaz dice **«Voz sintética del dispositivo»**, identifica el idioma y declara la etiqueta regional de la voz. No la presenta como grabación de un locutor, pronunciación certificada ni aprendizaje validado. Para mandarín se envían 猫, 狗 y 水; el pinyin continúa visible. Solo se aceptan voces etiquetadas `zh-CN` o `zh-TW`, con «mandarín de China continental» o «mandarín de Taiwán» explícitos. Se rechazan chino sin variante, `zh-HK` y cantonés.

## Investigación previa y decisiones

El [borrador Web Speech, sección de síntesis](https://webaudio.github.io/web-speech-api/#tts-section) define la lista de voces, `voiceschanged`, la cola de reproducción, cancelación y errores. Una voz explícita evita solicitar la voz predeterminada, que podría ser remota. `localService` declara si el sintetizador es local. Una lista vacía puede significar ausencia de voces o información aún no disponible. Estas son declaraciones de la API, no una auditoría del motor.

El [registro WebKit 223473](https://bugs.webkit.org/show_bug.cgi?id=223473) documenta la exigencia de gesto de usuario para síntesis en iOS. La llamada se mantiene síncrona dentro del clic o activación por teclado; no se pospone para reproducir tras cargar voces. El [registro WebKit 237584](https://bugs.webkit.org/show_bug.cgi?id=237584) documenta una regresión histórica de enumeración de voces en macOS y su corrección en Safari 15.5; demuestra que la disponibilidad necesita comprobarse, no que esa incidencia siga vigente ni que describa todos los iPhone actuales. Documentación consultada el 17 de octubre de 2026.

## Comportamiento técnico y límites

- Se exige `localService === true`, idioma válido coincidente y objeto de voz asignado explícitamente al enunciado. No se acepta `undefined`, cadenas como `"true"`, otra lengua ni una voz remota. Se comprueba de nuevo la disponibilidad al pulsar.
- No hay reproducción inicial ni al recibir voces tardías. `voiceschanged`, una comprobación única a los 2 segundos y «Revisar voces disponibles» actualizan la disponibilidad; nunca inician audio.
- Una nueva petición cancela la anterior. Los eventos tardíos de peticiones canceladas se descartan. No hay listas de reproducción ni reintentos automáticos.
- Se cancela al pausar, terminar, cambiar de actividad/idioma, volver al inicio, actuar fuera del panel de audio, ocultar la pestaña, abandonar la página o cambiar su fragmento. Los temporizadores y listeners de la interfaz anterior se retiran.
- Hay vigilancias técnicas de 4 segundos para inicio y 12 segundos para finalización. Detienen un intento atascado y explican el fallo. No son límites de tiempo educativos ni provocan progreso automático.
- Si falta la API, la lista permanece vacía, el acceso falla, solo existen voces remotas o el motor rechaza la reproducción, se mantiene la actividad íntegra sin audio. No se cambia de idioma, no se solicita una voz predeterminada y no se contrata otro servicio.
- El indicador de reproducción usa los eventos del motor, no confirma que el usuario haya oído sonido. No emite anuncios continuos ni eventos por cada fragmento de palabra; los fallos tienen un aviso accesible independiente.

**Límite real:** la página confía en `localService` y en que el navegador respete la voz y la cancelación solicitadas. No puede inspeccionar ni certificar el procesamiento o tráfico interno del sistema operativo. `connect-src 'none'` sigue protegiendo las conexiones de la página, pero no se presenta como control de red del motor del sistema. Si la identificación local no existe, no se habilita la voz. Aún se necesita escuchar cada combinación de voz, idioma y dispositivo y someterla a revisión humana, especialmente los tonos del mandarín y las variantes regionales.

## Privacidad y compatibilidad

No hay micrófono, grabación, reconocimiento de voz, cámara, backend, audio remoto, cuentas, nuevas dependencias, pagos ni permisos añadidos. No se transmiten textos personales: el controlador solo acepta un identificador de idioma y un índice de palabra fija. No se guardan voces, historial de escucha ni métricas. Los controles de audio no escriben progreso.

Codec v4, coordinación entre pestañas, preferencias del inicio y módulo de Luma permanecen intactos. La última palabra repetible es temporal y se reinicia al volver a renderizar o salir de la actividad. La interfaz conserva lectura, selección, guía, pasar, reintentar y pausa sin exigir audio.

## Pruebas realizadas

- **152 pruebas de lógica**, incluidas 10 nuevas de síntesis: selección estricta, las 18 cadenas, variantes de mandarín, ausencia/API fallida, remotas, entrada inválida, cancelación, eventos obsoletos, errores, fallos de asignación, motor pausado y ambos timeouts.
- **75 pruebas DOM** existentes aprobadas.
- **32 comprobaciones estáticas**. La regla anterior que prohibía cualquier temporizador se ajustó para permitir únicamente las vigilancias técnicas en los dos módulos de audio; las actividades siguen sin temporizadores ni avance automático.
- **692 comprobaciones de regresión de navegador**: general 227, navegación 219, rutas 77, correcciones de idiomas 110 y ayuda/rutas 59.
- **186 comprobaciones nuevas con API simulada**: controles de las 18 palabras, teclado/tacto, repetición, pausa, finalización, cambio de idioma, cierre del catálogo, salida/visibilidad, voces tardías/retiradas, falta de API, voces solo remotas y finalización sin audio. Verificación de progreso idéntico antes/después de escuchar. Tamaños 320, 375, 768 y 1440 px. Sin errores JavaScript.

**No se ha escuchado audio real.** Chromium nativo en nube expuso `speechSynthesis` pero devolvió **0 voces**, sin voz inglesa local. Se comprobó y capturó la indisponibilidad real. Las otras pruebas usan stubs explícitos de la API, no un sintetizador audible. No se ha probado Safari/iOS o iPad físico ni validado fonéticamente las voces.

Informes y capturas: `docs/evidence-v21/speech-browser.json`, `speech-native-capability.png` (navegador real sin voces) y `speech-mock-mandarin-375.png` / `speech-mock-mandarin-1440.png` (interfaz con API simulada). Los nombres de archivo distinguen ambos tipos de evidencia.

## Reproducción y archivos

`npm test`, `NODE_PATH=/tmp/education-test-deps/node_modules npm run test:dom`, `npm run test:static`, `npm run test:speech` y los scripts `test:browser`, `test:navigation`, `test:routes`, `test:corrections`, `test:guidance`. jsdom permanece instalado temporalmente fuera del repositorio.

Manifiesto `DELIVERY-V21-SHA256.json`, ZIP `/workspace/entrega-educativa-v21.zip` y parche `/workspace/education-v21.patch`. Entrega únicamente local, sin subida de rama ni despliegue Sites. La implementación no está bloqueada; la escucha y validación humana en dispositivos con voces locales quedan pendientes y son necesarias antes de presentar pronunciaciones como revisadas.
