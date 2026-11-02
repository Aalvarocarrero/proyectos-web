# Prueba de audio en dispositivo · solo para adultos

Realizar sin el bebé presente. Esta prueba comprueba uso y audio del dispositivo; no evalúa al bebé, no valida desarrollo y no certifica pronunciación. No hacen falta cuentas nuevas ni compras.

Anota por tu cuenta **dispositivo, versión del sistema, navegador e idioma**. La app no tiene un formulario para recoger estas notas. Si comunicas un resultado, basta configuración y lo observado: sin grabaciones, nombres, respuestas ni datos personales de menores.

## Recorrido breve

1. Abre la misma previsualización privada y elige Idiomas, una lengua y una franja orientativa. Comprueba que coinciden con el encabezado de la sesión. No debe sonar nada al abrir, iniciar, detectar voces o retomar.
2. Antes de iniciar, lee el estado: «Voz compatible detectada», «Ninguna voz compatible detectada por ahora» o «API de voz no disponible». Una detección solo describe lo que declara el navegador. Si aparecen voces más tarde, usa «Revisar voces disponibles». Si no hay compatible, la guía sigue con tu voz; no se cambia de idioma ni se activa un servicio externo.
3. Con volumen suave, pulsa Escuchar una vez. Comprueba que se oye una sola frase. Repetir debe requerir otra pulsación. La app no canta la rutina: son referencias habladas para el adulto.
4. Mientras suena, prueba detener, cambiar de idioma, cambiar de actividad y volver al inicio. No debe haber voces superpuestas, cola de frases ni reinicio automático. Si sigue sonando tras pedir detenerlo, cierra la página y comunica el fallo antes de seguir reproduciendo.
5. Prueba cambiar de pestaña y bloquear/desbloquear. Al regresar no debe empezar a hablar. No se ofrece reproducción en segundo plano. Una recarga tampoco debe iniciar audio.
6. Revisa «Escuchar y responder»: invitación, respuesta opcional solo si hubo sonido espontáneo y silencio deben ser distinguibles. No se pide comprobar ni registrar una respuesta del bebé.

## Seis idiomas

Se puede empezar con una frase de cada idioma; repetir en las demás rutinas si se observa una diferencia. Una escucha básica no sustituye la revisión de todas las frases por personas competentes en cada lengua.

| Idioma | Variante declarada por el navegador | Se oye / no se oye | Detener / cambiar / volver | Resultado |
| --- | --- | --- | --- | --- |
| Español | Pendiente | Pendiente | Pendiente | Pendiente |
| Inglés | Pendiente | Pendiente | Pendiente | Pendiente |
| Portugués de Brasil | Debe corresponder a pt-BR | Pendiente | Pendiente | Pendiente |
| Chino mandarín | Variante explícita CN/TW admitida | Pendiente | Pendiente | Pendiente |
| Francés | Pendiente | Pendiente | Pendiente | Pendiente |
| Italiano | Pendiente | Pendiente | Pendiente | Pendiente |

La disponibilidad depende del dispositivo y navegador. No fuerces cambios de configuración para simular todos los estados: anota «no aplicable» si un caso no aparece. Las ausencias de API, cero voces y aparición tardía también tienen pruebas automatizadas con mocks identificados como tales.

## VoiceOver / TalkBack · pendiente de prueba real

- Comprueba que se pueden encontrar los seis idiomas, la etapa, el estado del audio y todos los controles.
- Al cambiar idioma o etapa, el foco debe seguir en el control. Revisar voces debe llevar al título del resultado, sin reproducir.
- Comprueba nombres, estado expandido de las ayudas y acceso a pausa, salida y la opción de seguir con tu voz.
- Escucha si los avisos del lector y la referencia hablada se solapan, se interrumpen o resultan repetitivos. Anota la secuencia que lo provoca. El solapamiento es una hipótesis: no se ha confirmado ni resuelto con pruebas de Chromium.

Los roles y atributos de la región de estado y la advertencia de detención se conservan en v42. No se presenta una inspección DOM como validación con lector de pantalla.

## Alcance de la evidencia

`getVoices()` y la etiqueta de voz describen capacidades declaradas, no calidad nativa o pronunciación correcta. `cancel()` solicita el comportamiento definido por la API; las pruebas de software no sustituyen comprobar qué se oye físicamente en el dispositivo.

Fuentes técnicas: [Web Speech API · voces](https://webaudio.github.io/web-speech-api/#speechsynthesisvoice), [MDN · cancel](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/cancel), [W3C · mensajes de estado](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

Esta hoja está sin completar: no contiene resultados de pruebas en dispositivos de una familia.
