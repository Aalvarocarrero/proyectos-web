# Venezuela Agro + Finca Escuela: respaldo de revisión

Respaldo privado autorizado, preparado el 2026-10-17. No es un despliegue.

- Fuente integrada exacta: `b4ce89ca2806c095f0b9e3c8f3f261efa4f1cbf0`.
- Base vigente: `dfa61a8ab17a86a1397ba1f923d08bf24113c18f`, rama `build/agro-indexing-f6b3b5e-20261017`.
- Candidato Finca: `aa264375a9d6628340714b8a24af6e0af17fed95`.
- `source/`: copia exacta de los archivos versionados de `build-inputs/agro-indexing` en el commit integrado. Incluye configuración técnica e identificadores previamente autorizados; no contiene dependencias, cachés ni credenciales de ejecución.
- `review/`: paquete completo, diff reproducible, informes, hashes y logs originales de la validación final.
- `TRANSFER-MANIFEST.json`: tamaño y SHA-256 de todos los archivos respaldados, excepto el propio manifiesto y su archivo de hash.
- `INDEPENDENT-REVIEW.md`: revisión independiente de solo lectura.

El artefacto es `review/agro-review-build.tar.gz`, 54.765.457 bytes, SHA-256 `1e5e6cc25bed5b77740173dddac7479249a5db1e27dd87f468be9f2eb7a31007`. Se comprobaron los 933 archivos incluidos. Pruebas: 63/63 enfocadas, 33/33 seguridad y 1344/1344 globales. Build y tipos correctos; lint sin errores, con 50 avisos.

La rama de respaldo es independiente, sin workflows, y su commit contiene `[skip ci]`. No modifica `main`, ramas anteriores, Cloudflare o producción. La fuente conserva el SEO de producción f6b3b5e y la autenticación vigente. El paquete continúa marcado `ready_for_deployment: false`: revisión y promoción posterior deben coordinarse, nunca inferirse de este respaldo.

La carpeta original del proyecto cambió de ubicación en este respaldo; los scripts usan rutas relativas al proyecto. Para revisar, trabajar dentro de `source/`. Consultar `review/INTEGRATION-REPORT.md` para comandos y variables de build de producción, y no ejecutar scripts de promoción durante la revisión.
