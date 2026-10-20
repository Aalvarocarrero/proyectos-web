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
