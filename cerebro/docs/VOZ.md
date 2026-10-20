# Estado de voz y conversación

La vista de conversación guarda únicamente los mensajes de texto que la persona envía y los vincula al ID del proyecto seleccionado. No produce respuestas de asistente, no ejecuta tareas y no captura audio. El micrófono permanece apagado y no hay transcripción disponible.

La Web Speech API no ofrece una garantía universal de procesamiento local: `SpeechRecognition.processLocally` es experimental y el valor predeterminado `false` permite que el navegador elija procesamiento local o remoto. El modo local requiere soporte del navegador y un paquete de idioma local instalado; `available()` e `install()` gestionan disponibilidad y descarga del paquete. No se habilitó reconocimiento porque no hay un motor local comprobado en el dispositivo de la persona ni una elección explícita de proveedor conectado.

Para lectura en voz alta, `speechSynthesis.getVoices()` informa las voces disponibles en ese dispositivo y `SpeechSynthesisVoice.localService` indica si una voz se sirve localmente. La lista y su propiedad dependen del dispositivo; no se comprobó una voz local concreta en el Mac/iPhone de Álvaro, por lo que la app no afirma que la lectura sea local u offline y no la activa.

Referencias oficiales consultadas:

- [SpeechRecognition.processLocally](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/processLocally)
- [Using the Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API)
- [SpeechSynthesisVoice.localService](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService)
- [SpeechSynthesis.getVoices](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices)
