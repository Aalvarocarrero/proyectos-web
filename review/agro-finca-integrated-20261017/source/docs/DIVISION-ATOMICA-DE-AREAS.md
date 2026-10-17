# División segura de áreas

Revisión del 7 de octubre de 2026. Implementación verificada con 20 pruebas de endpoint/transacción y regresiones de IndexedDB e hidratación. Suite agregada: 118/118; publicación privada de esta revisión se verifica por separado.

## Dos modos explícitos

- Espacio solo de este dispositivo: las dos áreas y sus dos intenciones locales se guardan dentro de una única transacción IndexedDB. Una excepción o fallo de almacenamiento revierte toda la operación. Se comprueba que la selección no haya cambiado. No se asigna ni envía automáticamente a una cuenta.
- Espacio vinculado a cuenta: requiere conexión, finca y área ya sincronizadas. El navegador no realiza una división optimista ni encola dos envíos. Solicita una operación compuesta al servidor y después actualiza la copia local.

## Servidor

El endpoint privado valida identidad autenticada, origen, propietario del espacio, identificadores y revisiones de finca/área. Calcula ambas mitades desde la versión almacenada, conservando la superficie total. Un batch D1 actualiza el origen mediante condición de versión, inserta la segunda mitad y guarda un recibo. La inserción está condicionada a un marcador nuevo de esa misma operación. Si no coincide la versión no se crea una mitad suelta; si hay colisión o error, D1 revierte el lote completo. Los reintentos se contrastan con su recibo y nunca reactivan una mitad eliminada.

Referencia técnica: https://developers.cloudflare.com/d1/worker-api/d1-database/#batch

## Límites que siguen siendo importantes

- La división vinculada a una cuenta no está disponible sin conexión. Las demás operaciones locales conservan su flujo de pendientes.
- Una respuesta interrumpida exige reconectar y actualizar antes de intentar nuevamente; el servidor puede haber confirmado la transacción aunque el navegador no recibiera respuesta.
- El plano es una representación organizativa, no un levantamiento topográfico certificado.
- Las pruebas sintéticas comprueban transacciones y carreras; no certifican todas las versiones de Safari/Chrome ni condiciones físicas de almacenamiento.
