# Estado de voz y conversación

La conversación conserva mensajes de texto bajo el proyecto seleccionado. No hay un asistente conectado, respuestas generadas, entrada por micrófono, reconocimiento de voz ni transcripción de audio. El micrófono permanece apagado. La interfaz muestra por separado entrada STT, salida TTS, modelo e interrupción.

El [contrato del asistente local](ASISTENTE-LOCAL.md) prepara un futuro turno de voz en español (`es-ES`) con pulsar para hablar, consentimiento puntual, permiso del dispositivo y confirmación visible de transcripción, aislado por proyecto. Es solo un validador de contrato: no activa el micrófono, no reconoce audio, no transmite ni persiste la transcripción. El asistente local sigue desconectado y no produce respuestas.

## Lectura explícita de selección

La interfaz Jarvis permite leer en voz alta solo el fragmento que la persona seleccione dentro de un registro de memoria o mensaje guardado del proyecto abierto y después pulse **Leer selección**. No se leen mensajes completos, instrucciones u otras partes de la memoria automáticamente. La selección debe permanecer dentro de un solo registro y está limitada a 6.000 caracteres. **Detener lectura** cancela la reproducción; cambiar de proyecto o cerrar la vista también cancela cualquier lectura activa. Esta función no genera respuestas: no hay modelo conectado.

El control ofrece únicamente voces en español que el navegador devuelve en `speechSynthesis.getVoices()` con `SpeechSynthesisVoice.localService === true`. La app muestra estados de preparación, lectura, fin, cancelación o error y bloquea la función si falta una voz compatible. `localService` es una declaración del navegador, no una auditoría independiente del tráfico del sistema operativo o del motor de voz; por eso no afirmamos confidencialidad verificada ni funcionamiento offline. La persona puede optar por no usar la lectura. La aplicación no realiza solicitudes HTTP para sintetizar voz; el comportamiento del sintetizador del sistema no se ha auditado.

La prueba automatizada usa un sintetizador falso para verificar selección, voz permitida, estados de ciclo de vida, cancelación y bloqueo. No se escuchó ni se grabó audio real, por lo que la reproducción en un dispositivo sigue pendiente de verificación práctica.

## Entrada bidireccional pendiente

La entrada de voz sigue sin estar disponible. No se solicita permiso, no se abre el micrófono, no se llama `SpeechRecognition`, `getUserMedia` ni `MediaRecorder`. La transcripción está marcada como no disponible. La lectura seleccionada es salida de voz condicional; no es conversación bidireccional, no genera respuesta y no activa tareas. **Detener lectura** interrumpe TTS con el botón; no se usa el micrófono para detectar interrupciones.

La Web Speech API no ofrece una garantía universal de procesamiento local: `SpeechRecognition.processLocally` es experimental y el valor predeterminado `false` permite que el navegador elija procesamiento local o remoto. El modo local requiere soporte del navegador y un paquete de idioma local instalado. No se habilitó reconocimiento porque no hay un motor local comprobado en el dispositivo ni una elección explícita de proveedor conectado. No instalamos paquetes de idioma.

La ruta siguiente para voz conversacional requiere autorización específica para el micrófono del dispositivo, elegir navegador, comprobar un motor STT que garantice procesamiento local, y probar captura de una pulsación con indicador y parada explícita. Después se guardaría únicamente la transcripción confirmada bajo el proyecto actual y se conectaría un modelo elegido. La API Web Speech no ofrece una garantía universal de procesamiento local: `SpeechRecognition.processLocally` es experimental y `false` por defecto permite al navegador decidir si procesa local o remotamente. No se habilitó. La verificación debe cubrir entrada, salida, cancelación y si el audio permanece en el dispositivo antes de describir la función como operativa.

## Adaptación revisada de adewaskar/jarvis

Revisamos `src/lib/voice.ts`, `src/lib/audio.ts`, `src/lib/tts.ts`, `src/lib/vad.ts` y `src/lib/capabilities.ts` en el commit fijado `1c4016afdf86f7043efc6882ceffef84ad0d8783`. Su estado por fases y cancelación explícita informa los estados visibles de esta interfaz; se adaptó la salida simple de `speechSynthesis` a selección acotada, voces españolas declaradas locales y cancelación al cambiar de proyecto. No se importaron sus módulos de audio porque `getMic()` abre el micrófono mediante `getUserMedia`, VAD graba `MediaRecorder` y el turno de voz puede transcribir por el puente; el módulo TTS upstream también integra ElevenLabs/Kokoro. Esas rutas no cumplen la configuración autorizada de este incremento. Se conserva la licencia MIT y su aviso de origen en `jarvis-ui-preview/`.

En el clip de referencia se observaron una esfera de partículas, una pregunta escrita y respuesta contextual hablada. Eso demuestra escritura y salida hablada en aquel producto, no micrófono, memoria, herramientas o interrupciones. Cerebro usa una interfaz propia y no copia marca, assets o mecánicas de terceros.

Referencias primarias:

- [SpeechSynthesis.getVoices](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices)
- [SpeechSynthesisVoice.localService](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService)
- [SpeechRecognition.processLocally](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/processLocally)
- [Using the Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API)
- [SpeechRecognition.available()](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/available_static)
