# Estado de voz y conversación

La vista de conversación guarda únicamente los mensajes de texto que la persona envía y los vincula al ID del proyecto seleccionado. No produce respuestas de asistente, no ejecuta tareas y no captura audio. El micrófono permanece apagado y no hay transcripción disponible.

La Web Speech API no ofrece una garantía universal de procesamiento local: `SpeechRecognition.processLocally` es experimental y el valor predeterminado `false` permite que el navegador elija procesamiento local o remoto. El modo local requiere soporte del navegador y un paquete de idioma local instalado; `available()` e `install()` gestionan disponibilidad y descarga del paquete. No se habilitó reconocimiento porque no hay un motor local comprobado en el dispositivo de la persona ni una elección explícita de proveedor conectado.

Para lectura en voz alta, `speechSynthesis.getVoices()` informa las voces disponibles en ese dispositivo y `SpeechSynthesisVoice.localService` indica si una voz se sirve localmente. La lista y su propiedad dependen del dispositivo; no se comprobó una voz local concreta en el dispositivo de destino, por lo que la app no afirma que la lectura sea local u offline y no la activa.

## Interfaz preparada y ruta de habilitación

La interfaz muestra controles **Pulsar para hablar** y **Detener**, una zona de transcripción y un aviso de micrófono apagado; los botones permanecen deshabilitados. Esta vista es solo una preparación visual: el código no solicita permiso, no abre el micrófono, no llama `SpeechRecognition` y no produce transcripciones. No se marca «Analizando» ni «Respondiendo» porque no existe procesamiento de voz o modelo conectado.

La ruta recomendada es incremental: (1) confirmar el dispositivo y navegador objetivo; (2) comprobar si el navegador soporta `SpeechRecognition.processLocally=true` y `available({langs:['es-ES'],processLocally:true})`; no instalar paquetes de idioma sin autorización; (3) tras aprobación explícita, hacer una prueba local de una sola pulsación con indicador visible, botón de parada, cancelación y transcripción visible, y comprobar que el micrófono cesa al parar; (4) guardar el texto transcrito como mensaje local bajo el proyecto seleccionado, conservando su identidad de intento; (5) solo después integrar un modelo de texto aprobado y una lectura en voz alta que se compruebe realmente. La prueba debe demostrar entrada de audio, texto transcrito, salida de voz y tratamiento de interrupción; el clip de referencia demuestra chat escrito con respuesta hablada, pero no micrófono, memoria, herramientas o interrupciones.

En el clip compartido se observaron una esfera de partículas y anillos cian, estados de análisis/respuesta, una pregunta escrita y respuesta contextual hablada. El cerebro usa un orb propio dibujado con CSS, estados reales del almacenamiento y controles originales. No copia marca, assets ni mecánicas de regalos o pagos.

Referencias oficiales consultadas:

- [SpeechRecognition.processLocally](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/processLocally)
- [Using the Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API)
- [SpeechSynthesisVoice.localService](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService)
- [SpeechSynthesis.getVoices](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices)
- [SpeechRecognition.available()](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/available_static)
