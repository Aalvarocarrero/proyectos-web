# Entrega local v19 · Ayuda contextual y mensajes ejecutables

Base exacta: `8d30a3d7e70afe4f009eb70aad4b93599ab8d2b7` (v18 respaldada). Rama local: `feat/education-guidance-v19-local`. No se ha publicado ni subido esta rama.

## Cambios revisables

- **Luma · ayuda**: acceso compacto durante la actividad, panel en el flujo del documento, cierre explícito y Escape con devolución del foco. Conserva la personalización y su clave separada. Ocultar elimina tanto figura como miniatura; la ayuda textual sigue disponible.
- Gesto de 250 ms únicamente al pulsar «Reconocer una estrategia que probé». Nunca se activa al fallar, pedir una pista o elegir una emoción. Con movimiento reducido no se crea animación. Mensaje sobre observar, comparar o pedir ayuda; no premia inteligencia ni rachas.
- Pistas: la palabra del idioma sigue el paso actual; las actividades complementarias usan la explicación de la elección equivocada si existe. Se mantienen las pistas por misión científica. Dani mantiene posibilidades, sin veredicto emocional ni moral.
- Idiomas: tres palabras por cada una de las seis rutas. Retroalimentación breve en el idioma de la actividad, apoyo explicativo en español, guía consultable, reintento voluntario y «Pasar esta palabra» sin exigir acierto. No audio ni micrófono.
- **Un mensaje que se entiende, 6–8 años**: ejecutor paso a paso de los mensajes existentes, casilla actual identificada por texto y contorno, trayectoria textual y comparación de la versión anterior. Distingue ambigüedad, destino equivocado, bloqueo y llegada. Puede pasarse cada idea. No se altera otra actividad antigua.

## Alcance del contenido lingüístico

No se amplía el vocabulario de los pilotos. Se añade una sola expresión de reconocimiento por idioma, ligada a una asociación concreta y acompañada por la palabra y explicación española. En el error se repite la palabra objetivo con interrogación, sin inventar nuevas frases traducidas.

| Idioma | Expresión | Fuente consultada, 17 octubre 2026 |
|---|---|---|
| Español | ¡Bien! | [RAE, bien](https://dle.rae.es/bien) |
| Inglés | Well done! | [Collins, well done](https://www.collinsdictionary.com/dictionary/english-french/well-done_1) |
| Portugués | Muito bem! | [Collins, well](https://www.collinsdictionary.com/dictionary/english-portuguese/well) |
| Mandarín simplificado | 棒极了！ | [Collins, well done](https://www.collinsdictionary.com/dictionary/english-chinese/well-done_1) |
| Italiano | Ben fatto! | [Collins, well](https://www.collinsdictionary.com/dictionary/english-italian/well_1) |
| Francés | Bravo ! | [Collins, well done](https://www.collinsdictionary.com/dictionary/english-french/well-done_1) |

La comprobación es lexicográfica, no una certificación docente, dialectal ni de pronunciación. Las fuentes de las 18 asociaciones originales siguen documentadas en las entregas anteriores. El carácter mínimo del piloto se conserva.

## Persistencia y privacidad

No cambia el esquema v4 del progreso, sus claves, Web Locks, protección de pestañas ni migraciones. La apariencia sigue en su clave v1. Las trayectorias/comparaciones son transitorias y vuelven al inicio al recargar (aviso visible); la selección anterior sigue guardada como antes. No se guardan estrategias personales, gestos ni decisiones de Dani. Sin red de aplicación, chat, audio, nuevos permisos, servicios, Actions o cambios de seguridad.

## Validación

- 139 pruebas de lógica (137 anteriores + 2 del ejecutor).
- 63 pruebas DOM y 32 comprobaciones estáticas.
- 861 comprobaciones de navegador anteriores: general 227, navegación 219, rutas 77, ciencias 110, narrativa/acompañante 118 y correcciones 110.
- 40 comprobaciones específicas v19: ejecución real, comparación, bloqueo, pista del error, Escape/foco, textos de seis idiomas, pistas de palabra actual, paso sin acierto, movimiento reducido y ocultación. Resultado exacto en `evidence-v19/guidance-browser.json`.
- Chromium en nube, tamaños 320, 375, 768 y 1440 px. Sin errores JavaScript en los recorridos. No certifica WCAG ni sustituye prueba con lector de pantalla, Safari o iPad físico.

Capturas: `evidence-v19/guidance-route-1440.png`, `guidance-route-768.png`, `guidance-route-375.png`, `guidance-route-320.png` y `guidance-language-help-mobile.png`. Los informes JSON conservan el alcance de cada suite. Las capturas históricas permanecen intactas.

## Entrega y reproducción

`npm test`; `NODE_PATH=/tmp/education-test-deps/node_modules npm run test:dom`; `npm run test:static`; y scripts `test:browser`, `test:navigation`, `test:routes`, `test:science`, `test:story`, `test:corrections`, `test:guidance`. La dependencia jsdom se utilizó temporalmente fuera del repositorio. `npm run serve` ofrece la vista local en el puerto 4186.

ZIP y parche binario en `/workspace/entrega-educativa-v19.zip` y `/workspace/education-v19.patch`. Manifiesto `DELIVERY-V19-SHA256.json` de los archivos distribuibles. No hay bloqueo técnico. La publicación y cualquier subida remota quedan fuera de esta entrega local y requieren la autorización correspondiente.
