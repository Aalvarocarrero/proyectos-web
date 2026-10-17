# Inicio VenezuelaAgro: jerarquía centrada en Mi Finca

## Diagnóstico y decisión

La portada anterior daba prioridad comercial al primer CTA y presentaba Mi Finca después de varias entradas, producción e historia. Tres bloques consecutivos pedían elegir destino con textos parecidos. El visitante debía entender la arquitectura antes de ver la herramienta principal.

La nueva secuencia parte de una tarea reconocible: organizar animales, cultivos y cuentas. La demostración aparece inmediatamente después del hero. Explorar el modelo es la acción visual principal; crear la finca queda disponible como acción secundaria. No se exige una decisión de registro para conocer el producto.

## Recorrido completo

1. Promesa concreta, destinatario y origen real: productor venezolano y Parcela Los Morochos, Apure. Fotografía original, tipografía existente y logo verde sin alterar.
2. Mi Finca: plano ilustrativo y tres utilidades comprensibles. En móvil la vista aparece después de la introducción y antes del detalle, para no esconderla detrás de todo el texto.
3. Guía de comienzo: definir la finca, primer registro, preparación sin señal. Son instrucciones, no indicadores ficticios de progreso.
4. Cinco caminos secundarios con igual lenguaje: Mercado Agro, Comunidad, Aprende, Profesionales y Empresas.
5. Funcionamiento offline con ejemplo y condiciones reales. El estado de red se muestra aquí, junto a su significado, sin equipararlo a una sincronización confirmada.
6. Tienda, mercado y gestión; categorías comerciales originales; aprendizaje y primera visita; comunidad, profesionales, empresas, instituciones y proyectos.
7. Producción, fotografías documentales y créditos, historia familiar y contacto. Se conserva la procedencia y no se convierte una muestra en disponibilidad real.
8. Cierre con creación de finca y contacto.

## Criterios de persuasión y usabilidad

- Reconocimiento antes que interpretación: tareas y objetos cotidianos en lugar de una promesa abstracta.
- Demostración antes que compromiso: el modelo permite entender la propuesta sin aportar datos propios.
- Jerarquía estable: un CTA principal con el mismo nombre, opciones secundarias accesibles y menú completo.
- Información progresiva: primero qué ofrece; después cómo se usa y qué necesita para funcionar sin conexión.
- Confianza verificable: origen, personas e imágenes existentes; ejemplo de 10 ha claramente ficticio; sin contadores, testimonios, urgencia o resultados inventados.
- No se atribuyen conversiones ni efectos cerebrales a estos cambios. Son hipótesis de diseño basadas en claridad y carga de decisión; no una prueba experimental ni una afirmación de neuromarketing.

## Límites preservados

La preparación inicial necesita internet en cada dispositivo. Los registros se guardan en el navegador. Red detectada no implica servidor disponible, sincronización o copia confirmada. Las transacciones, publicaciones y novedades tienen sus condiciones de conexión. Las herramientas actuales no requieren suscripción; los productos se cotizan aparte.

No se modifican cámaras, escenas, offline, formularios, datos, rutas ni servicios. La demostración mantiene carga diferida, poster ligero, pausa fuera de pantalla y respeto por conexión lenta/movimiento reducido. No se añaden fuentes, imágenes, video ni dependencias.

## Verificación

- Seis nuevas pruebas de jerarquía, orden móvil/foco, navegación, origen, conservación de módulos y espaciado.
- `npm run build`: correcto. `node --test tests/*.test.mjs`: 1.011/1.011 correctas. `npx tsc --noEmit`: correcto. Lint global: 0 errores, 48 advertencias existentes. `git diff --check`: correcto.
- Controlador de la vista: 2.122 bytes gzip; poster: 2.225 bytes gzip. Sin cambios en estos archivos, motor, escena ni assets.
- La QA visual se realiza sobre la versión alojada privada con el integrador; ningún servidor de preview local ni navegador alternativo se utiliza en esta tarea.
- Pendiente de QA visual: 320/390/768/1440 px, zoom/texto grande, foco/contraste, navegación, banners existentes y pausa del modelo al salir de pantalla. El orden de lectura y de foco sigue la disposición móvil: introducción, vista, beneficios y acciones. Los controles de la vista siguen en el componente original.
