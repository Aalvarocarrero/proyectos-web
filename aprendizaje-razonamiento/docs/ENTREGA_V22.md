# v22 · Inicio con todas las áreas y accesos

Entrega local sobre la versión corregida v21, commit exacto `d4933c5fae7955cb64adc917f553f2696670a529` de `feat/education-local-speech-v21-source`. Rama de trabajo: `feat/education-dashboard-v22-local`. No se ha subido ninguna rama ni publicado Sites.

## Resultado

El inicio presenta las ocho áreas del catálogo, seis materias y los seis idiomas, con accesos directos a juegos, Luma, progreso/privacidad y orientación familiar. No requiere completar la bienvenida ni desplegar «Más propuestas». Mantiene el estilo verde y crema, iconos originales decorativos, textos de disponibilidad y edades orientativas.

La selección de franja ofrece una actividad real de esa etapa; si existe una partida, «Continuar» recupera sus respuestas. La selección del dashboard solo afecta a la presentación durante la sesión, sin alterar partidas ni las preferencias guardadas por la bienvenida. Las preferencias continúan siendo voluntarias. Para 18–35 meses se ofrece la guía del adulto y juego fuera de pantalla; los retos de otras edades permanecen identificados.

Las áreas abren listas procedentes del catálogo existente, priorizando la franja elegida y señalando cuando no hay contenido para ella. Las materias llevan a sus secciones reales, con su alcance actual. Los seis botones de idiomas abren directamente los pilotos existentes de tres palabras para 6–8 años con adulto. Se informa de que la voz es sintética y depende de disponer de una voz local del idioma.

Los destinos reciben foco y se desplazan a la vista. Volver al inicio cierra el catálogo ampliado y restaura el dashboard sin borrar progreso. La bienvenida guiada y el catálogo completo siguen disponibles.

## Implementación y preservación

- Nuevo `dist/dashboard.mjs`: composición y navegación desde los datos del catálogo, idiomas y materias.
- `dist/welcome.mjs`: integración en el paso inicial y destinos reutilizados.
- `dist/styles.css`: cuadrículas adaptables, controles de al menos 44 px, ajuste del selector nativo con texto al 200 %.
- `package.json`: versión 0.16.0 y comando `test:dashboard`.
- Dos pruebas DOM nuevas y suite específica de navegador; los informes de regresión se dirigen a `evidence-v22` para no sobrescribir evidencia histórica.

Se verificó igualdad byte por byte frente a la base para `app.mjs`, catálogo, idiomas, materias, acompañante, progreso y los dos módulos de voz. Las correcciones de cancelación y eventos tardíos de v21 están conservadas. No hay cambios de contenido pedagógico, almacenamiento, protección entre pestañas, permisos, CSP, servicios, analítica ni datos personales. Ver `evidence-v22/base-preservation.json` y el manifiesto raíz `DELIVERY-V22-SHA256.json` (32 archivos de distribución).

## Validación ejecutada

| Suite | Resultado |
| --- | ---: |
| Lógica | 155/155 |
| DOM | 79/79 |
| Estática | 32/32 |
| Dashboard | 245 comprobaciones |
| Bienvenida | 196 comprobaciones |
| Correcciones de bienvenida | 145 comprobaciones |
| Navegación | 219 comprobaciones |
| Rutas | 77 comprobaciones |
| Voz local y ciclo de vida | 186 comprobaciones |

Total de las seis suites de navegador ejecutadas: **1.068 comprobaciones**, sin errores. No se presentan como ejecutadas las otras suites históricas que no se repitieron en esta entrega. Evidencia JSON y logs en `docs/evidence-v22/`.

Se cubren anchos 320, 375, 768 y 1440, interacción táctil emulada y teclado, foco, destinos, guías para adultos, controles de idiomas, continuidad y recarga. Dashboard y catálogo pasan texto al 200 % sin desbordamiento horizontal. Se corrigió un desbordamiento del selector de franja detectado por la regresión; las suites finales de navegación y dashboard pasaron después del ajuste. Revisión visual de las capturas finales móvil y escritorio.

## Vista y ejecución

- `docs/evidence-v22/dashboard-home-375.png`
- `docs/evidence-v22/dashboard-home-1440.png`
- Servir con `npm run serve` y abrir `http://127.0.0.1:4186`.
- DOM requiere jsdom; en este entorno se ejecutó con `NODE_PATH=/tmp/education-test-deps/node_modules npm run test:dom`.
- Navegador usa Playwright y `/usr/bin/chromium`. Dependencias de pruebas fuera de la entrega; no se añadieron paquetes a la app.

## Límites y siguientes decisiones

El dashboard reúne accesos; no amplía cursos ni garantiza resultados educativos. En móvil requiere desplazamiento vertical, con accesos superiores para saltar a secciones. No se ha certificado WCAG ni probado con lectores de pantalla reales, Safari/iOS o hardware físico. Chromium no dispone de voces instaladas: las pruebas de voz usan dobles explícitos de la API y detección nativa; no hubo escucha ni validación acústica.

No quedan bloqueos técnicos locales. Subir una rama remota o publicar requiere una instrucción posterior; esas acciones no forman parte de esta entrega.
