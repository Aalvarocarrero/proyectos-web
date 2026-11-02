# v42 · Estado de la voz y turnos de la rutina

Estado: revisión local probada, preparada para validación y publicación por el responsable del sitio por el mismo flujo privado. Este worker no ha desplegado v42 ni modificado accesos.

## Continuidad

Base exacta: v41 `2b92f95115fbafc7075046ed3c178aff1ab7d4f8`, rama de respaldo `backup/education-v41-review-2026-11-02`. Rama local aislada: `feat/education-audio-v42-local`. La carpeta conserva el nombre histórico `aprendizaje-razonamiento-v39`, con package 0.42.0; no es otra aplicación.

La publicación vigente confirmada es v41 en el mismo sitio privado, Sites 29, fuente `726db3c4c38c231c7bfcef4eb14cfcd9b6e6f619`, runtime idéntico a la base indicada. Política de acceso revisión 1, cero visitantes externos. La URL sigue siendo `https://aprendizaje-razonamiento-preview.aalvarocarrero.chatgpt.site`. Esta entrega no altera esa publicación. Antes de una publicación posterior debe reconciliarse el estado actual para evitar sobrescribir avances.

## Cambios acotados

- **Estado antes de iniciar.** El controlador expone una clasificación que no reproduce: «Voz compatible detectada», «Ninguna voz compatible detectada por ahora» o «API de voz no disponible». La tarjeta se muestra antes de los controles de preparación en móvil y sobre la actividad en escritorio. Distingue la ausencia de API de la falta actual de una voz local compatible.
- **Detección no equivale a validación.** El mensaje muestra variante/nombre declarados por el navegador y advierte que no verifica pronunciación ni calidad. La alternativa con la voz del adulto sigue disponible en los tres casos. La ausencia se describe como actual, no como ausencia permanente de voces instaladas.
- **Revisión manual y aparición tardía.** Revisar vuelve a consultar y lleva el foco al resultado, sin hablar. Un cambio tardío de voces actualiza el estado conservando los controles y el foco de preparación. Si ocurre durante audio activo, se conserva la pausa/cancelación existente. No hay descarga ni activación automática de servicios.
- **Texto de reproducción.** «Reproduciendo la palabra» pasa a «Reproduciendo la referencia hablada», válido tanto para palabras como para frases existentes. No se han añadido grabaciones ni canciones sintéticas.
- **Invitación, respuesta y silencio.** Las frases no condicionadas y la respuesta opcional de «Escuchar y responder» se muestran en grupos distintos; el silencio tiene una tarjeta propia. La respuesta se rotula «Solo si hubo un sonido espontáneo» y puede omitirse. No se pregunta ni registra si el bebé respondió. En mandarín se presenta primero la invitación y después la frase condicionada, conservando sus índices originales de audio, caracteres, pinyin y traducción.
- **Guía de dispositivo.** Hay una ayuda opcional dentro de la sesión y una [hoja breve](PRUEBA_AUDIO_DISPOSITIVO.md), para un adulto sin el bebé presente. Incluye dispositivo/SO/navegador/idioma anotados fuera de la app, escucha manual, detener, cambiar, volver, pestaña, bloqueo y lectores de pantalla. No introduce formularios, grabaciones, telemetría ni perfiles.

Se mantienen los seis idiomas, las tres franjas auditivas orientativas, las cuatro rutinas por idioma, las once guías por etapas y todos los módulos anteriores. Las 48 referencias fijas de voz son las mismas: no se modificó el archivo de vocabulario/rutinas. No hay nuevas afirmaciones sobre desarrollo, inteligencia, personalidad o resultados educativos.

## Accesibilidad y límites

Se conservan `role="status"`, `aria-live="polite"` y `aria-atomic="true"` de la región de reproducción, y la advertencia global de fallo de detención. No se silencian ni cambian anuncios por suponer un conflicto con lectores de pantalla. La posible interacción entre VoiceOver/TalkBack y la referencia hablada es una hipótesis pendiente de prueba real.

La consulta manual tiene un destino de foco explícito, con título y descripción del estado. El estado se distingue por texto además del color. Los metadatos de voz se insertan como texto, nunca como HTML. La nueva agrupación mantiene títulos, traducciones, pinyin y controles de teclado/táctiles, con alternativa fuera de pantalla y movimiento reducido.

La preferencia de voz sigue exigiendo `localService === true` y un idioma/variante admitidos. Portugués de Brasil exige pt-BR; mandarín usa variantes explícitas CN/TW admitidas, sin fallback silencioso a español, inglés o cantonés. Detectar una voz no demuestra que se oiga, que sea correcta ni que la síntesis del dispositivo funcione offline. No se añade proveedor remoto, SDK, cuenta, servicio de pago o secreto.

La app sigue sin micrófono, cámara, grabación ni datos personales infantiles nuevos. Configuración y avance de estas rutinas permanecen en memoria; no cambian claves/esquemas de progreso ni protección entre pestañas. CSP, permisos y dominio no se modifican. No se promete reproducción al bloquear la pantalla ni un ajuste numérico universal de volumen seguro.

## Pruebas

Linux, Node 24.19, Python 3 y Chromium `/usr/bin/chromium`. Dependencias de desarrollo fijadas, sin dependencias de ejecución nuevas. App buildless: no hay build que genere otro runtime.

| Comprobación | Resultado |
| --- | --- |
| `npm test` | 277 pruebas lógicas |
| `npm run test:dom` | 121 pruebas DOM |
| `npm run test:static` | 32 comprobaciones estáticas |
| `npm run lint` | 14 archivos JS del ámbito v41/v42; cero errores |
| `node --check` | 133 archivos JS/MJS/CJS; cero fallos |
| `test:audio-v42` | 928 comprobaciones de navegador |
| `test:discovery-v41` | 1.174 comprobaciones de regresión |
| `test:experience-v40` | 651 comprobaciones de regresión |
| `test:speech` | 186 comprobaciones de regresión de los pilotos previos |

Las comprobaciones nuevas cubren los tres estados antes de iniciar, las seis lenguas y edades existentes, falta de API, cero voces, voces tardías por evento y revisión manual, selección repetida, conservación de foco, pausa al perder una voz, ausencia de autoplay y de sustitución remota, referencias/índices intactos, separación de respuesta condicionada, ausencia de campos de respuesta y almacenamiento nuevo. Se comprueba que el metadata de voz no puede convertirse en markup y que los atributos live existentes siguen iguales.

Navegador real en 320/390/768/1440, teclado, controles de al menos 44 px, movimiento reducido y ampliación de texto simulada al 200 % sobre la rutina y la guía de dispositivo. Cero excepciones de la app y cero solicitudes externas de ejecución en las suites nuevas. La regresión v40 cubre también progreso, cierre, fichas y profundidad opcional.

**No se ha escuchado audio real:** Chromium declara cero voces locales. Se comprobó ese caso nativo; la detección positiva y la ausencia de API se simulan con mocks identificados. Tampoco se han probado físicamente bloqueo/desbloqueo, altavoz/Bluetooth, Safari/iOS, VoiceOver o TalkBack. Las simulaciones de visibilidad y eventos no sustituyen esas comprobaciones. No hay validación con menores, familias ni revisión lingüística profesional nueva.

## Capturas y entrega

Las capturas son de Chromium local sobre la fuente exacta. Hay comparación v41/v42 con igual idioma, franja y rutina en 390 y 1440: estado antes de iniciar y presentación del recitado. Las capturas nativas muestran cero voces. Los archivos marcados `simulated` muestran estados de API/voz mediante fixtures, no audio escuchado ni capacidades verificadas del usuario.

El snapshot portable y el inventario de hashes se generan desde el commit exacto, con código/pruebas/documentación y sin `node_modules`, cachés, logs, capturas, credenciales o progreso de usuarios. Las evidencias visuales quedan separadas y privadas; no se publican PNG en GitHub. No se abre PR, fusiona ni despliega desde este worker. El responsable del sitio coordina revisión y publicación por su helper oficial, conservando manifiesto, audiencia y origen.

## Fuentes técnicas de la revisión

- [Web Speech API · voces y servicio local](https://webaudio.github.io/web-speech-api/#speechsynthesisvoice): etiquetas y capacidad declarada; no certifica calidad de pronunciación.
- [MDN · getVoices](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices): descubrimiento de voces y actualización de su lista.
- [MDN · cancel](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/cancel): cancelación de la cola; no sustituye escuchar el resultado en hardware real.
- [W3C · mensajes de estado](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): avisos programáticamente identificables y necesidad de comprobar que el feedback sea adecuado.

Las fuentes pedagógicas y los límites de contenido de v40/v41 permanecen. Esta entrega cambia presentación y explicación de capacidades, no valida efectos del audio ni un currículo completo. Los documentos anteriores son checkpoints históricos, no sustituyen el estado de publicación vigente confirmado.
