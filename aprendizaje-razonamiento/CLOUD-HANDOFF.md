# Respaldo vigente v14

Este respaldo conserva sin cambios los 40 archivos listados en BACKUP-V14.json del commit Sites 0135f4cda4c377bf210c898f26a3dcc91d607754 (interfaz 0.9.1). El encabezado histórico del README dice 0.8; package.json y este manifiesto identifican la fuente vigente.

Excluidos: .git, credenciales, configuración de despliegue .openai, dependencias, capturas, archivos de pruebas generados y datos locales de navegación. No se han copiado datos de usuarios. Esta rama no despliega nada.

## Comprobación

Desde aprendizaje-razonamiento:

```sh
npm test
npm run test:static
# Con jsdom disponible en el entorno:
npm run test:dom
npm run serve
```

Evidencia previa de v14: 104 pruebas de lógica, 43 DOM y 32 comprobaciones estáticas. La prueba de navegador tests/browser.cjs es histórica y contiene una aserción de almacenamiento vacío anterior al guardado local; no se presenta como suite v14 validada. Revisarla antes de usarla como puerta de publicación. La QA real v14 se hizo con Chrome, teclado y anchos móviles/escritorio; no constituye certificación WCAG ni evaluación pedagógica.

Usar esta rama como base explícita para la siguiente tarea; no tomar el contenido educativo antiguo de main. Mantener datos locales compatibles, guías de menores de 3 años dirigidas al adulto y las diez actividades digitales. La siguiente tarea define sus propios cambios y pruebas. No modificar workflows ni desplegar automáticamente.
