# v41 · Encontrar idiomas y conservar la etapa elegida

Estado de esta entrega: revisión local probada; snapshot para actualizar el mismo sitio privado mediante el flujo oficial del padre. Este worker no ha desplegado v41 ni modificado accesos.

## Estado comprobado de v40

Se recuperó la referencia exacta `a88f3a0db40bfaad0dc3248c7f5ab9232cb1c34e`, rama `backup/education-v40-review-2026-11-01`. No se partió de main antiguo. El trabajo se aisló en `feat/education-discovery-v41-local`, en otro worktree.

Sites confirmó el 2 de noviembre de 2026 su versión 28, fuente `7f5df0f9627c92853e6b7f8cd328f597a257b80e`, en `https://aprendizaje-razonamiento-preview.aalvarocarrero.chatgpt.site`, con propietario actual, política de acceso revisión 1 y cero visitantes externos. La visita de navegador desde este executor falló con `ERR_TUNNEL_CONNECTION_FAILED`. Las capturas antes/después se obtuvieron con Chromium real contra fuentes locales exactas, no se presentan como capturas del sitio alojado.

v40 ya incluye seis idiomas: español, inglés, portugués de Brasil, chino mandarín, francés e italiano. Son cuatro rutinas originales por idioma: 24 versiones lingüísticas de rutinas guiadas, no 24 cursos diferentes. Hay tres franjas auditivas orientativas (4–6, 6–9 y 9–12 meses), once guías por etapas hasta 18+, las seis franjas principales previas y dos pilotos escritos de tres palabras por idioma para 6–8 años. Los juegos, la comparación A/B, el progreso y la vista opcional con profundidad de las fichas matemáticas permanecen.

Las propuestas del primer año son pantallas para quien acompaña: habla, canta o recita en persona, deja pausas y puede apartar la pantalla. No se exige al bebé leer, mirar, imitar o responder. Las voces locales son opcionales; no hay canciones sintéticas presentadas como grabaciones verificadas ni un currículo adulto completo.

## Problemas reproducidos y cambio concreto

1. **La etapa se perdía al entrar desde una guía.** En v40, seleccionar 9–12 meses en `#pathway-stage` y pulsar específicamente `#pathway-card [data-early-language]` abría la sesión en 4–6. La tarjeta no transportaba la selección y el controlador solo aceptaba `open()` sin parámetros. v41 pasa y valida la etapa real; se probó para las tres franjas.
2. **Los idiomas eran difíciles de descubrir.** En 390 px, el botón inicial del primer año quedaba aproximadamente a 975 px del comienzo y las seis lenguas estaban dentro de un selector. v41 añade «Idiomas» a la navegación visible, alrededor de 140 px del comienzo en esa ventana. Lleva a un panel con las seis lenguas, las tres franjas orientativas y el destino exacto antes de abrirlo.
3. **Cambiar un selector interrumpía el teclado.** v40 enviaba el foco al título de la actividad después de cada cambio. v41 conserva el foco en el control modificado. Los botones de idioma y etapa también conservan el foco después de actualizar su selección.
4. **Faltaba continuidad visible de contexto.** v41 muestra idioma, etapa y actividad durante el recorrido y al apartar la guía. Al volver, el panel refleja la última configuración en memoria de esta pestaña. Una recarga vuelve a los valores iniciales de navegación; no se crea un perfil infantil ni se toca el inicio recordado de las actividades previas.
5. **Texto ampliado.** Las pruebas detectaron desbordamientos en la primera disposición del panel. Se corrigieron permitiendo que la navegación, las etapas y el acceso a las once guías se distribuyan en más filas cuando haga falta. El texto de la portada al 200 % ya no produce desplazamiento horizontal en 320/390/768/1440.

El número de botones visibles del inicio pasa de 7 a 17 porque ahora expone seis idiomas y tres etapas, además de navegación y accesos. No se presenta como reducción global de decisiones. La acción principal de la portada sigue siendo una y el panel del primer año se dirige explícitamente al adulto.

## Alcance y privacidad

No hay nuevas rutinas, traducciones, evaluaciones, voces remotas ni cambios pedagógicos en los juegos. Se reutilizaron el catálogo, las guías por etapas, las rutinas y el motor de voz de v40. La nueva vista de elección usa los mismos datos de idioma/etapa y solo admite sus identificadores fijos. El motor conserva sus reglas de idioma, localidad, cancelación, ausencia de autoplay y aviso de detención fallida.

No cambian CSP, permisos, dominios, servicios, claves de progreso, reglas de persistencia, datos guardados ni protección entre pestañas. La selección nueva vive en memoria de la pestaña. No se introdujeron cuentas, grabaciones, micrófono, cámara, tracking, datos familiares o respuestas de menores. El cuerpo estático de la app sigue sin dependencias nuevas de ejecución.

La guía para 18+ sigue indicando que todavía no hay un itinerario adulto completo; el taller reutilizado conserva su rótulo 13–18. No se puntúan personalidad, autonomía o inteligencia, ni se prometen resultados cognitivos. Las rutinas continúan pendientes de revisión lingüística/pedagógica y pruebas con familias. No se ha efectuado una validación humana por añadir estos controles.

## Diseño y procedencia

Se revisaron las referencias comunitarias existentes `skill/apple-design` y `skill/emil-design-eng`, procedentes del [repositorio de Emil Kowalski](https://github.com/emilkowalski/skills), con licencia MIT conservada allí. Son guías comunitarias; no son software oficial ni certificación de Apple. Se aplicaron jerarquía, respuesta inmediata de selección, controles amplios, foco visible y movimiento reducido, con CSS propio. No se copiaron activos ni marcas.

La ilustración original del inicio y la vista con perspectiva CSS de Matemáticas se conservan. No se añadió 3D decorativo a un selector ni a la pantalla del primer año: la funcionalidad existente sigue disponible y se cubre en la regresión v40. No se instala SDK gráfico o servicio audiovisual.

Los colores nuevos comprobados por cálculo tienen contraste de texto de 11,79:1 (texto principal), 6,01:1 (secundario), 8,34:1 (selección) y 7,61:1 (texto secundario sobre selección). Esto no constituye una certificación WCAG ni prueba con lectores de pantalla.

## Verificación

Linux, Node 24.19, Chromium `/usr/bin/chromium`; 320/390/768/1440 px, teclado y preferencia de movimiento reducido. La síntesis positiva usa mocks explícitos. El navegador nativo vuelve a declarar cero voces locales; se comprobó directamente que deshabilita escucha y ofrece la explicación, sin reproducir ni sustituir idioma.

| Comando / comprobación | Resultado |
| --- | --- |
| `npm test` | 273 pruebas lógicas |
| `npm run test:dom` | 117 pruebas DOM |
| `npm run test:static` | 32 comprobaciones estáticas |
| `npm run lint` | Diez archivos JS afectados; cero errores con ESLint 10.14.0 |
| `node --check` | 130 archivos JS/MJS/CJS; cero fallos |
| `test:discovery-v41` | 1.174 comprobaciones de navegador; cero excepciones y cero solicitudes externas de ejecución |
| `test:experience-v39` | 302 comprobaciones de regresión; todas las edades y actividades anteriores |
| `test:experience-v40` | 651 comprobaciones de regresión; audio, cierre, progreso, fichas y profundidad opcional |

La prueba v41 recorre las 18 combinaciones de seis idiomas y tres franjas en las cuatro anchuras, cambios repetidos con cancelación, foco de teclado, contexto visible, retorno, recarga y ausencia de almacenamiento infantil nuevo. Verifica el traspaso de las tres guías y la reanudación de un juego previo sin alterar un solo byte de su progreso guardado.

No existía un comando lint. Se añadió una configuración acotada de reglas de corrección de JavaScript y ESLint 10.14.0 fijado como dependencia solo de desarrollo. No es una auditoría de todo el repositorio. [Documentación oficial de su configuración](https://eslint.org/docs/latest/use/configure/configuration-files). No existe build: `dist` contiene la fuente ejecutable buildless.

No se ha escuchado audio real, probado hardware Safari/iOS, certificado conformidad de accesibilidad ni realizado pruebas con menores o cuidadores. La visita al alojamiento sigue bloqueada desde este executor; las comprobaciones visuales corresponden al servidor local de la fuente exacta.

## Entrega y publicación

La carpeta conserva el nombre histórico `aprendizaje-razonamiento-v39`; `package.json` indica 0.41.0. No se creó otra app. El ZIP portable se rotula v41 e incluye código, pruebas, documentación y configuración de desarrollo; excluye `node_modules`, datos guardados, secretos, capturas, logs y cachés. Las capturas antes/después se conservan como evidencias privadas separadas.

El padre dispone de la vía oficial de Sites y debe usar el snapshot exacto, integrar los archivos de `dist` conservando el manifiesto existente y comprobar igualdad de hashes antes de empaquetar/publicar. Este worker no repite la descarga de Sites denegada anteriormente por el proxy, no crea credenciales ni despliega por otra ruta. La previsualización conocida sigue siendo v40/Sites 28 hasta que se confirme una publicación posterior.

Los documentos v38/v39/v40 son antecedentes. Sus frases «sin despliegue» describen su checkpoint de escritura; no sustituyen la comprobación actual de v40 publicada. El informe v41 describe esta revisión, no certifica el currículo completo ni promete mejoras constantes autónomas fuera del encargo.
