# Matemáticas v34: cobertura, fuentes y criterios

Consulta directa y revisión editorial independiente: 17 de octubre de 2026. Base solicitada: v33, commit que comienza por `362f13c`. Este documento sustenta principios del diseño; no constituye certificación curricular ni validación de eficacia o edades.

## Hueco real en el catálogo

La inspección de `dist/catalog.mjs` y de sus entradas importadas encontró tres propuestas clasificadas como Matemáticas, todas en la franja editorial 3–5 años: `3y:original` (clasificar formas), `3y:extra` (patrones y construcción de una regla) y `3y:quantity` (correspondencia entre fichas y cuencos). No había una ruta explícita de composición/descomposición numérica para 6–8 años. Otras propuestas, como recorridos o balanza física, pueden implicar relaciones matemáticas, pero su presencia no equivale a un taller específico de descomposición de cantidades.

## Referencias primarias oficiales consultadas

**España: Real Decreto 157/2022, anexo II, Matemáticas, primer ciclo, saberes básicos A.2 y D.3.** [Texto oficial consolidado en BOE](https://www.boe.es/buscar/act.php?id=BOE-A-2022-3296).

El primer ciclo incluye composición, descomposición y recomposición de números naturales y distintas representaciones de una misma cantidad. Presenta la igualdad como equivalencia entre expresiones, no como una instrucción unilateral para producir una respuesta. Es pertinente usar objetos representados, números y sumas para describir el mismo total. El currículo cubre un ámbito mucho mayor que los totales 6 y 8; este piloto no pretende cubrirlo. Consulta directa del apartado de Matemáticas; no se infieren requisitos autonómicos ni se ofrece asesoramiento jurídico.

**Inglaterra: Department for Education, National curriculum in England: mathematics programmes of study, Year 1, Number—addition and subtraction; Year 2, mismo apartado.** [Publicación oficial](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study).

Year 1 vincula representaciones concretas y gráficas con relaciones aditivas, signos de suma, resta e igualdad, e incluye el cero. Year 2 incorpora que intercambiar los sumandos conserva la suma, y diferencia esto de la resta. La página distingue contenidos obligatorios de notas orientativas. Esta referencia aporta un contraste curricular; sus cursos no se equiparan automáticamente a franjas españolas ni demuestran adecuación individual.

Ambas fuentes se abrieron y leyeron directamente. Son documentos originales de sus organismos; no ensayos de esta aplicación. No se atribuye a esos organismos el diseño, una aprobación o resultados del producto.

## Diseño original y límites del modelo

La propuesta de dos grupos A/B, un total inicial de 6, otro de 8, una representación guardada para comparar, controles de mover y deshacer, textos y ayudas es diseño propio. La franja 6–8 años es una decisión editorial, pendiente de validación con familias y profesionales. Los documentos curriculares respaldan conceptos generales, no esas cantidades, interfaz ni secuencia exactas.

Criterios para implementación y revisión:

- Cada ficha representa una unidad; mismo tamaño y apariencia independientemente del grupo. El tamaño del recipiente, espacio ocupado o número de grupos no determina la cantidad.
- Para total `N`, son válidos todos los pares enteros no negativos `(a, N−a)`, incluidos `(0,N)` y `(N,0)`. Cero significa ninguna ficha en ese grupo. No obligar a que ambos grupos estén ocupados ni a repartir por igual.
- Mover una ficha resta una del origen y añade una al destino. El total permanece constante. Un grupo vacío no puede ceder fichas; esta limitación debe tener explicación perceptible.
- `2 + 4 = 1 + 5` expresa la misma cantidad total en dos repartos. La igualdad no exige grupos visualmente idénticos ni el mismo orden de sumandos. `2 + 4` y `4 + 2` cambian qué grupo contiene cada cantidad, pero solo intercambian las dos cantidades: no cuentan como una pareja numérica nueva. No comunicar un intercambio o una reorganización del dibujo como otra descomposición.
- La versión guardada es otra representación del mismo conjunto, no fichas extra disponibles. Ver dos tableros de seis no debe convertirse en una consigna para contar doce. Etiquetar claramente antes/ahora o guardado/actual.
- La ayuda nombra el tamaño de las fichas dentro de cada bandeja; el resumen visual del puente a ocho puede usar tokens menores y no afirma que todos los dibujos tengan idéntica escala. Pasar de 6 a 8 exige introducir dos unidades nuevas de forma explícita. Redistribuir las seis existentes no produce ocho. La transferencia independiente a ocho comienza sin un reparto resuelto visible. Una comparación entre totales distintos debe indicarlo y nunca dibujar una igualdad falsa.
- Guardar o deshacer no cambia cantidades sin explicación. Deshacer restituye una operación concreta; las versiones guardadas no deberían modificarse por alias al editar la actual.
- Si se propone encontrar otro reparto, admitir cualquiera que satisfaga la condición, explicar si se repite el mismo y ofrecer revisión sin bloqueo. No deducir capacidad a partir de clics ni exigir completar todas las posibilidades.
- Las ayudas deben describir el estado actual, también con grupos vacíos, reparto simétrico y total cambiado. La explicación oral, señalada o dibujada puede quedar fuera de pantalla; no requiere registro de respuestas personales.

No se pretende enseñar con este piloto todo el cálculo del primer ciclo, valor posicional, fracciones, multiplicación ni particiones generales. No hay promesa de dominio, rapidez, puntuación o diagnóstico. Revisión de código y pruebas matemáticas son distintas de observar comprensión infantil real, que sigue pendiente.
