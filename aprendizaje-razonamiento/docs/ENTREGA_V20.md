# Entrega local v20 · Un inicio para acompañar

Base fuente exacta: `984b611a6e3d93934450054d9cb7c1b091a5fc4f`, v19 corregida. Referencia Sites facilitada por el hilo principal: `82c47c7a7e5bddb6adca756832593faefa9656f8` (no modificada). Rama local: `feat/education-welcome-v20-local`.

## Qué cambia

La primera pantalla ofrece un próximo paso, no el catálogo completo. Una bienvenida opcional guía tres elecciones:

1. **Compañía:** adulto que acompaña o estudiante que puede leer y pedir ayuda.
2. **Franja orientativa:** 18–23 meses, 24–35 meses, 3–5, 6–8, 9–12 o 13–18 años. Sin fecha de nacimiento, nombre, foto, cuenta ni perfil. En las cuatro primeras franjas se indica adulto acompañante, aunque antes se eligiera estudiante.
3. **Actividad real:** tarjetas de la franja seleccionada, con área, nombre y disponibilidad. Hasta tres visibles inicialmente; las demás están en un desplegable. No se crean juegos, mundos, puntuaciones ni niveles ficticios. El piloto de vocabulario contextual conserva su advertencia específica de 7–8 años.

Para **18–35 meses**, el adulto consulta una demostración breve y optativa (pelota o muñeco), abre la guía existente y aparta la pantalla. No se ofrece juego autónomo al pequeño. Para **3–5 años**, se propone señalar y probar con un adulto. Desde **9 años**, se puede elegir la vía del estudiante, con apoyo disponible. No se infieren capacidades individuales.

Una ilustración SVG original, ligera y decorativa acompaña cada elección. Representa un brote, un camino y objetos; no sustituye al avatar Luma ni reaparece como personaje si el usuario lo ocultó. No hay animaciones nuevas, audio, voz ni captura de datos.

## Volver y cambiar sin perder partidas

- **Continuar** aparece cuando hay una actividad activa o pausada válida, con título y franja explícitos. Recupera los datos v19. Las historias pausadas conservan su aviso de decisiones descartadas antes de reanudarse.
- **Elegir otra actividad**, **Atrás**, **Cambiar franja**, **Omitir guía** y **Volver al inicio** permiten cambiar de camino libremente.
- **Todas las áreas y propuestas** mantiene el catálogo existente en un desplegable. También funcionan los accesos a catálogo desde el jardín y desde una pausa.
- El inicio no exige guardar preferencias. **Recordar este inicio** guarda únicamente `{version:1,role,stage}` bajo una clave nueva, separada. No guarda la actividad elegida en esa preferencia ni identifica a un menor.
- **Olvidar preferencias del inicio** elimina solo esa clave. Conserva partidas y preferencias de Luma.
- Cambiar de franja en la bienvenida no altera la etapa ni las respuestas de una partida; solo abrir una actividad activa su selección habitual.

## Persistencia y privacidad

`local-progress.mjs`, `progress-session.mjs` y `companion.mjs` no cambian. El codec sigue en v4, sin migración, sin tocar las claves de juegos o Luma y conservando Web Locks y la detección de pestañas obsoletas. Los identificadores históricos de etapa se conservan; únicamente se aclaran los rótulos de las dos franjas pequeñas para eliminar el solapamiento de los 24 meses.

La preferencia nueva valida versión, campos, longitud, franja y acompañamiento. Comprueba el valor previo antes de escribir o borrar; ante datos corruptos o cambios de otra pestaña no los sustituye. Esta comprobación de preferencias es optimista, no una transacción entre pestañas. Los juegos conservan su coordinación existente. Un fallo de almacenamiento se comunica y permite explorar sin guardado.

No se añadieron autenticación, backend, chat, cámara, micrófono, servicios, costes, permisos, dependencias de producción ni llamadas de red de la aplicación.

## Evidencia de validación

- **142 pruebas de lógica**: incluye tres nuevas de preferencias estrictas y disponibilidad real por franja.
- **72 pruebas DOM**: incluye siete nuevas del inicio, conservación exacta de juegos/Luma, retorno de v19, almacenamiento fallido, conflicto de preferencias, rutas adultas, catálogo y pausa narrativa honesta.
- **32 comprobaciones estáticas**.
- **920 comprobaciones de navegador de regresión**: general 227, navegación 219, rutas 77, ciencias 110, narrativa/acompañante 118, correcciones 110 y ayuda/rutas ejecutables 59. Estas suites abren explícitamente el catálogo opcional para recorrer las actividades existentes.
- **196 comprobaciones** de la suite nueva `test:welcome`: resultado exacto en `docs/evidence-v20/welcome-browser.json`. Comprueba el inicio real por defecto, teclado, tacto nativo de Chromium, seis franjas, modo estudiante, anchos 320/375/768/1440, tamaños de botones, ausencia de desbordamiento, recuerdo optativo, recarga, retorno v19 y fallos de almacenamiento.

Los informes JSON y registros finales están en `docs/evidence-v20`. Capturas de inicio general y de cada una de las seis franjas en 375 y 1440 px: `welcome-home-*`, `welcome-18m-*`, `welcome-2y-*`, `welcome-3y-*`, `welcome-5y-*`, `welcome-7y-*`, `welcome-12y-*`.

## Qué significa esta revisión

Las decisiones de limitar las opciones visibles, usar pasos cortos y ofrecer acompañamiento son **hipótesis de diseño UX**, no resultados de un estudio educativo. No se han realizado pruebas con menores, tutores, docentes o usuarios de lectores de pantalla. Chromium en nube no certifica Safari, iPad físico ni conformidad WCAG completa. El recorrido no representa un currículo progresivo validado de 18 meses a 18 años, ni adaptación psicológica o resultados garantizados. La orientación contextual de la interfaz lo aclara.

Se conserva el alcance de los contenidos existentes. Esta entrega termina en el inicio guiado: no incorpora más juegos ni cursos.

## Reproducción y entrega

`npm test`; `NODE_PATH=/tmp/education-test-deps/node_modules npm run test:dom`; `npm run test:static`; y `npm run test:welcome`, `test:browser`, `test:navigation`, `test:routes`, `test:science`, `test:story`, `test:corrections`, `test:guidance`. jsdom sigue instalado temporalmente fuera del repositorio. `npm run serve` abre el servidor local del puerto 4186.

Manifiesto `DELIVERY-V20-SHA256.json`, ZIP `/workspace/entrega-educativa-v20.zip` y parche `/workspace/education-v20.patch`. Entrega exclusivamente local: no se crea ni actualiza rama remota, no se despliega Sites ni se ejecutan Actions. No hay bloqueo técnico pendiente.
