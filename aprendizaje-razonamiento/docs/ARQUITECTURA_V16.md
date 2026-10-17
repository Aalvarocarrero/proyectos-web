# Extensión local v16

Base exacta: d673ead2dd9b5c9a279f83d3d9395b68fdebe604, rama de origen feat/education-multiarea-v15-source. La copia inicial de main no se utilizó. Rama local: feat/education-languages-v16-local.

- `dist/languages.mjs`: IDs estables language-es/en/pt/zh/it/fr, conceptos, palabras, transliteración opcional, alcance y evaluador. Las seis actividades usan la etapa heredada `5y`, cuyo rótulo real es 6–8 años. No cambiar claves históricas por su nombre.
- `dist/languages-ui.mjs`: guía → práctica, opciones rotadas, explicación, reintento y continuación voluntaria. Pausa, cierre y reinicio del contenedor original.
- `dist/reflection.mjs` y `reflection-ui.mjs`: escena y perspectivas. Elecciones en DOM, nunca en estados persistentes. No campos de texto. Al salir, pausar o recargar se limpian.
- `dist/disciplines.mjs`: rutas editoriales que apuntan a las claves del catálogo original. Física conecta puente/rampa; razonamiento conecta clasificación, caminos y evidencia. Filosofía/psicología comparten explícitamente la misma escena nueva. Biología/química indican preparación y no tienen botón de inicio.
- Catálogo: conserva siete áreas y añade Idiomas como octava. Las seis disciplinas no son seis categorías duplicadas. Total: 20 entradas = 17 digitales (10 anteriores + 6 idiomas + 1 escena), 2 guías adultas, 1 unidad familiar.
- Persistencia: misma clave, codec v3; admite v1/v2, conserva elecciones anteriores y migra solo al guardar. Un lector v15 preservará un registro v3 como versión no soportada. No hay migración destructiva ni modificación de localStorage de usuarios en producción.
- `progress-session.mjs` no cambia. Se reutilizan bloqueos Web Locks, detección de conflictos y confirmación para cargar otro guardado. Sin Web Locks permanece el límite documentado de coordinación optimista.
- No nuevas dependencias de la aplicación, peticiones de red de contenido, fuentes remotas ni activos pesados. Los únicos recursos de ejecución son HTML/CSS/JS locales y pictogramas del sistema. No se afirma funcionamiento offline: primera carga requiere alojamiento y no se ha añadido service worker.

## Extender con honestidad

Añadir idiomas requiere ID estable, vocabulario revisado, fuente editorial, etiquetas `lang`, guía, prueba y actualización del codec. Si cambia el número de conceptos o la forma de los estados, diseñar migración antes de publicar. No convertir una ruta vacía en disponible. No añadir respuestas emocionales al codec; su validación rechaza campos desconocidos.

## Comprobaciones

`npm test`, `NODE_PATH=/tmp/education-test-deps/node_modules npm run test:dom`, `npm run test:static`, `npm run test:browser`, `npm run test:navigation`, `npm run test:routes`.

Servidor de pruebas: `npm run serve` en 127.0.0.1:4186. Playwright disponible en el entorno, Chromium /usr/bin/chromium. jsdom 26 instalado solo en /tmp para las pruebas, sin lockfile ni dependencia añadida al proyecto. No hubo cambios de seguridad, permisos, Actions, servicios, suscripciones ni publicación.

## Acompañante visual opcional

`dist/companion.mjs`: tres formas CSS originales y tres colores. Se crea solo a petición; movimiento de giro breve al pedir una pista (se desactiva con preferencia de movimiento reducido). Sin fotos, nombres, chat, voz ni inferencia emocional. Mensajes fijos para idiomas, escena, jardín, palabras, comparación, actividades presenciales y estados de pausa/cierre; ayuda genérica explícita para el resto. No altera respuestas ni puntúa.

Clave separada `education-facilitation-guide:companion`, versión 1, solo forma/color/visibilidad. Nada se escribe por visitar la página. Lectura validada por enumeraciones y longitud máxima. Preferencias corruptas o modificadas desde otra pestaña se preservan; se puede usar apariencia solo en sesión. Las preferencias visuales usan comparación optimista, no transacción Web Locks: en cambios exactamente simultáneos de apariencia sigue existiendo una carrera. Esto no afecta la protección Web Locks del progreso educativo. «Olvidar apariencia» borra exclusivamente esa clave; borrar progreso no la borra. Al ocultar el personaje se ofrece mostrarlo o personalizarlo de nuevo. En el modo concentrado heredado del jardín se oculta el panel; se vuelve a ver al salir al catálogo.
