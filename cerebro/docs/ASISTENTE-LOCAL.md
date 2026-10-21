# Puerto de asistente local · estado preparado

`app/local_assistant.py` define un puerto pequeño e inyectable entre Cerebro y un posible modelo local. La configuración del producto parte de `provider=local`, con `enabled=false`, sin modelo, endpoint o nombre de variable de credencial. No instala modelos, no abre sockets y no hace llamadas por sí sola. El backend es opcional; la única implementación ejercitada en esta build es `SyntheticLocalProvider` dentro de las pruebas, que devuelve texto fijo marcado `simulation=true` y `real_connection_verified=false`.

El puerto no está conectado a la conversación, a la memoria, a la cola de tareas ni al panel. Solo recibe texto explícito para un proyecto y una respuesta del adaptador inyectado. No recupera memoria, no registra prompts/respuestas, no persiste respuestas, no reintenta y no cambia el diario. La respuesta sintética de las pruebas no es una respuesta de IA ni una actividad real.

## Permisos por proyecto

`resolve_project_permissions()` toma un mapa de concesiones del llamador, asociado por ID exacto de proyecto. Si falta el proyecto o una concesión, el permiso es `false`. Se rechazan claves desconocidas y valores que no sean booleanos. Las capacidades separadas son `local_model`, `voice_input`, `voice_output`, `external_provider` y `audio_transmission`; conceder una en un proyecto no la extiende a otro. El mapa es solo una entrada de política en memoria de esta prueba: todavía no tiene editor ni persistencia, y al reiniciar no se recuperan concesiones. No se ha modificado la configuración o memoria persistida existente.

Antes de cualquier uso real hará falta una pantalla explícita de concesión por proyecto, un almacén local para esos permisos, revocación visible y pruebas de reinicio. Las opciones de proveedor externo continúan separadas y bloqueadas en este adaptador.

## Contrato de voz en español

El contrato preparado acepta únicamente un turno de texto con `project_id`, `locale="es-ES"`, `input_method="push_to_talk"`, `transcript`, `capture_consent`, `device_permission_granted` y `transcript_confirmed`. Requiere permiso `voice_input` para el proyecto exacto, consentimiento puntual, permiso de dispositivo, y confirmación humana de la transcripción. Solo contempla un turno de hasta 6.000 caracteres; rechaza audio binario, campos extra, otros idiomas/modos y referencias de otro proyecto.

Es validación de contrato, no captura: no existe código de micrófono, STT, envío o almacenamiento de transcripciones en este módulo. Además, `AssistantGateway` rechaza `source="confirmed_transcript"` mientras no haya runtime de voz. Los controles de voz actuales y la lectura de selección no se alteran. No se ha oído audio real.

Verificación: `python3 tests/test_local_assistant.py -v` (desde la raíz `cerebro`) y el conjunto general. Las respuestas de proveedor de esta prueba deben seguir claramente marcadas como sintéticas; un transporte de prueba no puede cambiar estado a conexión verificada.
