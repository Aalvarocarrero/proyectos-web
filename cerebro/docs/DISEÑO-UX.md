# Criterios de interfaz y accesibilidad

Esta pasada de diseño mantiene Cerebro como aplicación web local. La skill [apple-design de Emil Kowalski](https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md) es una traducción independiente de ideas de charlas WWDC al desarrollo web; no es documentación ni código oficial de Apple. Leí su licencia MIT (Copyright 2026 Emil Kowalski) en el [LICENSE del repositorio](https://github.com/emilkowalski/skills/blob/main/LICENSE). No se copiaron scripts, componentes, fuentes ni imágenes del repositorio.

La interfaz adapta respuesta inmediata, señalización de estado, jerarquía tipográfica, consistencia espacial y movimiento discreto. La legibilidad prima sobre efectos: paneles opacos, contraste explícito y transiciones cortas solo para hover/foco; `prefers-reduced-motion` las reduce prácticamente a cero. No se añaden librerías ni recursos remotos.

Los controles tienen un objetivo de al menos 44 píxeles CSS, una indicación de foco visible, navegación semántica y una alternativa de lista a la red SVG. Las flechas recorren nodos; Tab, Enter y Espacio conservan los patrones de teclado. Los estados llevan texto además de color. En pantallas pequeñas, navegación, grafo, listas y paneles cambian a una columna y permiten desplazamiento sin ancho horizontal de página.

Criterios contrastados con estas guías oficiales de Apple:

- [Accesibilidad](https://developer.apple.com/design/human-interface-guidelines/accessibility): texto legible, contraste y compatibilidad con los ajustes de accesibilidad.
- [Botones](https://developer.apple.com/design/human-interface-guidelines/buttons): áreas de interacción amplias; Apple indica un hit region mínimo de 44 × 44 pt.
- [Focus and selection](https://developer.apple.com/design/human-interface-guidelines/focus-and-selection): foco visible y navegación por teclado.
- [Motion](https://developer.apple.com/design/human-interface-guidelines/motion): evitar movimiento gratuito y atender Reduce Motion.
- [Typography](https://developer.apple.com/design/human-interface-guidelines/typography) y [Layout](https://developer.apple.com/design/human-interface-guidelines/layout): jerarquía, escala adaptable y espacio alrededor de controles.

En web se implementan tamaños CSS y `prefers-reduced-motion`, sin afirmar equivalencia física exacta con puntos de UIKit ni una certificación formal de accesibilidad.

## Herramientas auxiliares de observación

El repositorio [REA: Reverse Engineer Anything](https://github.com/morluto/rea) es una posible referencia para inspección de DOM, árbol de accesibilidad, scripts y red en un navegador bajo control. Su guía de [observación web](https://github.com/morluto/rea/blob/main/docs/browser-observation.md) puede ayudar a comparar las pantallas propias de Cerebro con fixtures sintéticas. Se revisó su [aviso de seguridad](https://github.com/morluto/rea/blob/main/SECURITY.md), que advierte sobre ejecución fuera de un sandbox. No se instaló, ejecutó, configuró ni incorporó como dependencia; su integración queda fuera de esta build.

La navegación radial de Cerebro mantiene los proyectos del usuario como primera capa. Al abrir uno se entra a su memoria local, instrucciones, decisiones, tareas, estados y cronología. Esta jerarquía se implementa aquí mismo y no depende de REA ni intenta copiar contenido o posts de terceros.
