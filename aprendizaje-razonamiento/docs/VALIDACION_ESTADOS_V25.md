# Validación acotada de estados · v25

Se revisaron los casos solicitados de arrays dispersos y campos heredados en los validadores de construcción y exploración. Antes, `some` podía omitir huecos en un array y la comprobación de claves propias podía dejar pasar valores leídos del prototipo. La serialización de esas formas podía producir datos distintos o incompletos. No hay evidencia de registros personales ni de una explotación; son casos reproducibles de validación de estructuras en memoria.

## Cambio

`state-validation.mjs` introduce dos comprobaciones pequeñas:

- `ownRecord`: objeto plano o de prototipo nulo, conjunto exacto de campos propios de datos; rechaza campos heredados, claves desconocidas, símbolos y accesores sin invocarlos.
- `denseValues`: array de longitud acotada, con índice propio de datos en cada posición y valores enumerados; rechaza huecos, índices heredados, accesores y propiedades extra. Devuelve una copia independiente.

Se aplican al estado nuevo de composición y a los estados opcionales de construcción v23 y exploración v24. No se reescribe el codec general ni se cambian las garantías de coordinación entre pestañas. La composición tiene nueve casillas exactas y copias independientes para referencia y deshacer. Sus pasos de cierre requieren una composición no vacía y una intención enumerada; esa comprobación no evalúa calidad artística.

## Regresiones

Pruebas de rechazo: arrays dispersos actuales, de referencia y de deshacer; índice heredado; objeto con todos sus campos heredados; campo `hint` heredado; accessor que no llega a ejecutarse; nombres como `toString` y `__proto__` usados como opciones. Se comprueba que un guardado inválido deja intacto el registro anterior y que estados válidos v23/v24 siguen pasando el ciclo de guardado y lectura.

Las pruebas de composición verifican que deshacer restaure la última edición, que la referencia inicial no cambie, que editar invalide la intención anterior y que conservar la distribución sea una alternativa válida. Las suites completas de construcción y exploración vuelven a pasar con el validador estricto.

Los registros JSON válidos anteriores no precisan migración. Si existe un registro inválido, sigue protegido por la política anterior de no repararlo ni sobrescribirlo implícitamente. No se promete recuperar datos corruptos. La versión de formato permanece en 4 con campos opcionales; véase el riesgo de rollback en `ENTREGA_V25.md`.
