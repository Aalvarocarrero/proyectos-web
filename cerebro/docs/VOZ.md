# Estado de voz y conversación

La conversación conserva mensajes de texto bajo el proyecto seleccionado. No hay un asistente conectado, respuestas generadas, entrada por micrófono, reconocimiento de voz ni transcripción de audio. El micrófono permanece apagado.

El [contrato del asistente local](ASISTENTE-LOCAL.md) prepara un futuro turno de voz en español (`es-ES`) con pulsar para hablar, consentimiento puntual, permiso del dispositivo y confirmación visible de transcripción, aislado por proyecto. Es solo un validador de contrato: no activa el micrófono, no reconoce audio, no transmite ni persiste la transcripción. El asistente local sigue desconectado y no produce respuestas.

## Lectura explícita de selección

La interfaz permite leer en voz alta solo el texto que la persona seleccione dentro de un mensaje guardado de la conversación del proyecto abierto y después pulse **Leer selección**. No se leen mensajes completos, instrucciones u otras partes de la memoria automáticamente. La selección está limitada a 6.000 caracteres. **Detener lectura** cancela la reproducción; cambiar de proyecto, cambiar de vista o cerrar la página también cancela cualquier lectura activa.

El control ofrece únicamente voces que el navegador devuelve en `speechSynthesis.getVoices()` con `SpeechSynthesisVoice.localService === true`. La app muestra las voces disponibles en ese dispositivo, su estado de inicio, fin o error y bloquea la función si el navegador no ofrece ese tipo de voz. `localService` es una declaración del navegador, no una auditoría independiente del tráfico del sistema operativo o del motor de voz; por eso no afirmamos confidencialidad verificada ni funcionamiento offline. La persona puede optar por no usar la lectura.

La prueba automatizada usa un sintetizador falso para verificar selección, voz permitida, estados de ciclo de vida, cancelación y bloqueo. No se escuchó ni se grabó audio real, por lo que la reproducción en un dispositivo sigue pendiente de verificación práctica.

## Entrada bidireccional pendiente

Los controles **Pulsar para hablar** y **Detener** para entrada siguen deshabilitados. No se solicita permiso, no se abre el micrófono ni se llama `SpeechRecognition`. La transcripción está marcada como no disponible. Esta lectura de texto seleccionado es salida local condicional; no es conversación por voz, no genera respuesta y no activa tareas.

La Web Speech API no ofrece una garantía universal de procesamiento local: `SpeechRecognition.processLocally` es experimental y el valor predeterminado `false` permite que el navegador elija procesamiento local o remoto. El modo local requiere soporte del navegador y un paquete de idioma local instalado. No se habilitó reconocimiento porque no hay un motor local comprobado en el dispositivo ni una elección explícita de proveedor conectado. No instalamos paquetes de idioma.

La ruta siguiente para voz conversacional requiere elegir dispositivo/navegador, probar entrada local de una sola pulsación con indicador y parada explícita, guardar únicamente la transcripción confirmada bajo el proyecto actual y después aprobar un motor de texto. La verificación debe cubrir entrada, salida, cancelación y si el audio permanece en el dispositivo antes de describir la función como operativa.

En el clip de referencia se observaron una esfera de partículas, una pregunta escrita y respuesta contextual hablada. Eso demuestra escritura y salida hablada en aquel producto, no micrófono, memoria, herramientas o interrupciones. Cerebro usa una interfaz propia y no copia marca, assets o mecánicas de terceros.

Referencias primarias:

- [SpeechSynthesis.getVoices](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices)
- [SpeechSynthesisVoice.localService](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService)
- [SpeechRecognition.processLocally](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/processLocally)
- [Using the Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API)
- [SpeechRecognition.available()](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/available_static)
