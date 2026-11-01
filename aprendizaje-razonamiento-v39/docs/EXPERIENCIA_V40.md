# v40 · Idiomas acompañados y continuidad por etapas

Estado: implementación local probada, lista para revisión. Sin despliegue ni merge. Es un hito funcional de la app existente; no completa una plataforma educativa de todas las edades y materias.

## Fuente y continuidad

Base exacta: respaldo v39 `c418b1e169e9bd1a108159aedc85f9b410c9ded4`, rama `backup/education-experience-v39-review-2026-10-23`. Se recuperó en un worktree separado; no se usó main/v25. Rama de trabajo `feat/education-infant-languages-v40-local`. Se conservan los identificadores de actividades y los esquemas de progreso, inicio y acompañante. No se cambiaron permisos, CSP, servicios ni almacenamiento.

La fuente mantiene el nombre histórico `aprendizaje-razonamiento-v39`, con package 0.40.0. Su nombre de carpeta no indica otra app ni la versión servida por Sites. Los documentos v38/v39 se conservan como antecedentes.

## Resultado revisable

- Inicio: una acción principal para elegir etapa y dos accesos secundarios explícitos: primer año y guía por etapas/continuidad 18+. La entrada al modo acompañado requiere una pulsación desde el inicio. El inicio pasó de cinco a siete botones visibles por estas dos entradas; no se presenta como reducción global del número de decisiones.
- Primer año: pantalla para la persona adulta, con franjas orientativas 4–6, 6–9 y 9–12 meses. Español, inglés, portugués de Brasil, chino mandarín, italiano y francés en igualdad como experiencias; español también se usa para las explicaciones.
- Cuatro rutinas por idioma: saludo, manos, escuchar/responder y libro. Dos frases fijas por rutina: 48 apoyos hablados posibles. Caracteres y pinyin tonal en mandarín; traducción española visible en todos. No hay audio grabado nuevo. El adulto puede cantar o recitar el texto original en persona; el TTS no se presenta como canción.
- Sesión finita con preparación, escucha opcional, voz del adulto, silencio y cierre. Iniciar/retomar no hablan. Cada escucha o repetición es manual, de una frase. Pausa, detener, cambio de actividad/idioma/franja, navegación y pérdida de visibilidad solicitan cancelar. Apartar la guía detiene la voz y permite seguir sin pantalla, sin prometer reproducción al bloquearla.
- La configuración y el apoyo hablado se pliegan durante la acción; la ayuda, la pausa y la salida no dependen de un avatar. El acompañante anterior sigue siendo opcional y los juegos conservan sus controles.
- Guía por etapas: once tarjetas con una propuesta presencial de tres pasos, materiales, papel del acompañante, señales para parar, adaptaciones, seguridad y procedencia/revisión. Incluye 12–17 meses y distingue 13–15, 16–17 y 18+. Donde hay un módulo relacionado se enlaza; donde no lo hay, se entrega una guía real, sin fingir un juego disponible. La continuidad 18+ explica que no es un itinerario adulto completo y rotula el taller reutilizado 13–18.
- Matemáticas 6–8: vista opcional de la colección activa con perspectiva CSS, frontal 2D y botones accesibles. Se carga por importación dinámica a petición; no tiene giro automático, WebGL, imágenes externas o SDK. Las bandejas originales siempre siguen operativas. No dibuja el registro previo como nuevas fichas ni adelanta el resultado de comparar. Editar, trasladar y deshacer actualizan la vista sin cambiar las reglas.

## Estado del audio y privacidad

Solo se aceptan voces con `localService === true` y etiqueta de idioma compatible. Mandarín acepta etiquetas explícitas CN/TW, incluidas sus formas con script; rechaza chino genérico, Hong Kong y cantonés. El texto de portugués de Brasil exige pt-BR; no sustituye silenciosamente pt-PT. Las demás variantes se muestran al adulto por su etiqueta. No se certifica que los metadatos del navegador equivalgan a pronunciación nativa correcta.

Sin voz compatible los botones de escucha se deshabilitan y la actividad continúa con la voz del adulto. Si el motor no confirma cancelación, se mantiene una advertencia global incluso al salir y no se permiten nuevas solicitudes hasta resolverla. No hay cola infinita, descarga automática de voces ni proveedor remoto. No se escuchó audio real en este entorno: Chromium declaró cero voces locales.

La selección de idioma/franja y los pasos se mantienen solo en memoria. No se guardan respuestas, nombres, preferencias ni hitos del bebé. Sin micrófono, cámara, grabación, tracking ni cuestionarios infantiles. Los juegos previos siguen guardando su progreso local; un navegador compartido no ofrece cuentas privadas. No se transmite audio ni datos infantiles.

Precauciones visibles: volumen suave, dispositivo lejos del oído y evitar auriculares para el bebé; ningún porcentaje o ajuste de la app se declara seguro. Seguir el interés y parar ante incomodidad, cansancio o inquietud. No se exige mirada, sonrisa, imitación o palabra. «Te he oído» se etiqueta como respuesta solo si hubo un sonido; el silencio no es fallo. No se recomienda forzar postura, cubrir la cara del bebé ni usar materiales pequeños, cuerdas, pilas o imanes accesibles.

## Pruebas de software

Linux, Node 24.19, Python 3 y Chromium instalado; navegador real automatizado, con mocks explícitos únicamente para la síntesis de voz.

| Comprobación | Resultado |
| --- | --- |
| `npm test` | 271/271; incluye seis nuevas pruebas de contenido, voces y esquema |
| `npm run test:dom` | 114/114; incluye ocho nuevas pruebas del ciclo de sesión |
| `npm run test:static` | 32/32; inspección estática, no certificación WCAG |
| Sintaxis `node --check` | 125 archivos JS/MJS/CJS; cero fallos |
| `test:experience-v40` | 651 comprobaciones; 320/390/768/1440; cero excepciones y cero solicitudes externas de ejecución |
| `test:experience-v39` | 302 comprobaciones de regresión; las seis franjas y módulos previos conservados |
| `test:number-parts` | 88 comprobaciones; reparto desigual, cero, reserva, traslado, registro, comparación diferida y ocho fichas |
| `test:plan-comparison` | 19 comprobaciones; A conservado, B inválido/válido, saldos/diferencia y teclado |
| `test:speech` | 186 comprobaciones; pilotos previos y ciclo de audio, con voces simuladas |
| `test:queued-writes` | Dos invariantes entre pestañas; borrado/carga no resucitan escrituras pendientes |

Las comprobaciones v40 recorren los seis idiomas por cuatro rutinas a cuatro anchuras, petición única/repetición/pausa/retomar silencioso, cierre finito, salida, guía apartada y limpieza de listeners. Verifican igualdad byte a byte del progreso previo tras usar el modo bebé, recarga y reanudación del juego; carga diferida de profundidad, colección activa y reversión, alternativa frontal y fallo de descarga con 2D operativo.

Además se comprobó teclado real en Chromium y texto al 200 % en móvil sin desbordamiento. La acción principal tras iniciar quedó visible en la ventana de 390 px. Movimiento reducido simulado sin animación de la vista con profundidad. El modo sin voz se comprobó con las capacidades nativas reales, no solo con mocks. Las interacciones ya cargadas funcionan al desconectar la red; no existe garantía de arranque offline, instalación PWA o síntesis offline del dispositivo.

No hay pipeline de build o lint configurado en esta app buildless. Se ejecutaron sintaxis y los comandos de pruebas disponibles pertinentes. No confundir automatización con revisión pedagógica, conformidad completa de accesibilidad, escucha nativa, Safari/iOS, lector de pantalla o prueba con niños/cuidadores.

## Fuentes y alcance educativo

Las actividades son adaptaciones originales, informadas por fuentes y no evaluadas como intervención. Las edades organizan invitaciones flexibles, no hitos ni exigencias. No se sostiene que a los seis meses se absorba más que en cualquier etapa, que cuatro/seis idiomas aceleren la inteligencia ni que la app prediga personalidad o vocación. La lengua familiar se mantiene; idioma y cultura no son equivalentes, ni se jerarquizan.

- [HSE · comunicación 0–12 meses](https://www2.hse.ie/babies-children/checks-milestones/communication-development/0-12-months/): conversación responsiva, pausas y voz familiar. La adaptación no prueba eficacia del TTS.
- [Raising Children Network · lenguaje 3–12 meses](https://raisingchildren.net.au/babies/development/language-development/language-3-12-months): acompañamiento cotidiano y variabilidad del desarrollo.
- [Raising Children Network · pantallas 0–2](https://raisingchildren.net.au/toddlers/play-learning/toddlers-healthy-screen-time-and-digital-technology-use/healthy-screen-time-0-2-years), [Departamento de Salud australiano · nacimiento–5 años](https://www.health.gov.au/topics/physical-activity-and-exercise/physical-activity-and-exercise-guidelines-for-all-australians/recommendations-for-infants-toddlers-and-preschoolers-birth-to-5-years): la pantalla del diseño es para el adulto y se aparta para la interacción presencial; no se prescribe una duración médica de sesión.
- [AAP · ruido y audición](https://www.healthychildren.org/English/safety-prevention/all-around/Pages/how-noise-affects-your-child.aspx): precauciones de volumen y escucha. No certifica un ajuste numérico seguro del dispositivo.
- [Harvard · guía de funciones ejecutivas](https://developingchild.harvard.edu/resources/handouts-tools/activities-guide-enhancing-and-practicing-executive-function-skills/): referencia para juegos acompañados por etapas. No certifica nuestras tarjetas.
- [AAP · The Power of Play](https://publications.aap.org/pediatrics/article/142/3/e20182058/37364/The-Power-of-Play-A-Pediatric-Role-in-Enhancing), [UCLA · valores, metas e identidad](https://developingadolescent.semel.ucla.edu/core-science-of-adolescence/developing-values-goals-and-identity): referencias primarias recuperadas en la investigación de continuidad. En esta ejecución la página AAP redirigió a acceso restringido y UCLA devolvió error de red; no se presentan como documentos descargados íntegros aquí. Las tarjetas son propuestas de diseño, no resultados de esos estudios.
- [Priberam · olá](https://dicionario.priberam.org/ol%C3%A1), [Priberam · ouvir](https://dicionario.priberam.org/ouvir): comprobación léxica parcial del portugués; no reemplaza revisar las frases completas con una persona competente.

Consulta/revisión documental de esta entrega: 1 de noviembre de 2026. Pendiente revisión lingüística humana de las seis rutinas y pronunciación, revisión pedagógica y pruebas de comprensión adulta y accesibilidad asistida. No se ha certificado la app ni validado su efecto con alumnado.

## Diseño y licencias

Se revisaron las copias existentes de `apple-design`, `emil-design-eng` y `scroll-world`. Las dos primeras son guías comunitarias de Emil Kowalski con licencia MIT, no código oficial ni endorsement de Apple: [repositorio de referencia](https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md). Se aplican jerarquía, respuesta clara, profundidad funcional y moderación. Se consultó también [la guía oficial de movimiento accesible de Apple](https://support.apple.com/guide/iphone/change-motion-settings-iph0b691d3ed/ios). No se añadieron materiales translúcidos que reduzcan la lectura.

`scroll-world` es una referencia MIT de [oso95](https://github.com/oso95/scroll-world), no un motor 3D educativo instalado. No se adoptaron sus secuencias, vídeos o servicios. La vista de fichas es CSS propio, sin copiar activos, marcas, librerías o código de esos repositorios. [Synthesis Tutor](https://www.synthesis.com/tutor) se revisó como referencia de enfoque guiado; no se copiaron activos ni afirmaciones de eficacia o superioridad. Las licencias se auditaron en las copias de referencia; no se redistribuyen sus materiales en este paquete.

## Publicación y siguientes pasos

La comprobación actual de Sites confirma el mismo enlace privado, propietario actual, política de acceso revisión 1 y cero visitantes externos: `https://aprendizaje-razonamiento-preview.aalvarocarrero.chatgpt.site`. Sites sigue en su versión 27, fuente `3dde361621524f7da9b2472dafd63ef1303bb5d6` (entrega v38). No confundir versión de Sites con la entrega v40 o con el respaldo v39.

La publicación v40 está preparada en código, pero no se intentó: falta el helper oficial `site-workflow.mjs`. La skill Sites exige usarlo para abrir/sincronizar/empaquetar la fuente exacta y dice: “The helper owns Git preparation, ordered commands, commit/push, and packaging.” No existe el paquete en las dos rutas oficiales comprobadas de este executor, y la lectura del recurso del helper en la skill devolvió `failed to read skill resource`. No se generó credencial ni se sustituyó el flujo por una API o empaquetador propio. Esto es un bloqueo de disponibilidad, no una denegación de despliegue ni una operación de resultado incierto. Hace falta disponer del paquete oficial en este mismo entorno; después podrá sincronizarse la fuente exacta, publicarse con los permisos privados preservados y comprobar la versión servida.

Pendiente fuera de este hito: itinerario adulto propio, profundidad educativa de todas las áreas/culturas, revisión profesional humana y evidencia de uso con familias. Las cuatro rutinas por idioma son un piloto revisable, no cursos completos ni pronunciación validada. La previsualización local y las capturas reales son los entregables de revisión mientras se resuelve la publicación soportada.
