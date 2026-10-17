# Integración local de Finca Escuela sobre producción

Fecha: 2026-10-17. Repositorio Aalvarocarrero/proyectos-web. Sin push, despliegue ni cambios remotos.

## Procedencia

- Fuente de producción verificada por rama remota: build/agro-indexing-f6b3b5e-20261017, commit dfa61a8ab17a86a1397ba1f923d08bf24113c18f.
- Carpeta fuente localizada en el árbol: build-inputs/agro-indexing. No se utilizó main como base.
- Candidato Finca portado: aa264375a9d6628340714b8a24af6e0af17fed95, carpeta preview/finca-escuela del checkout anterior.
- Rama local de integración: local/agro-finca-integration-dfa61a8.
- Commit final integrado: b4ce89ca2806c095f0b9e3c8f3f261efa4f1cbf0.
- Directorio local: /workspace/agro-finca-integration/build-inputs/agro-indexing.
- Referencias de despliegue aportadas por la tarea, sin consultar ni modificar Cloudflare: promoción release/venezuelaagro-indexing-20261017, d754ab7959b94a000bb5f1eb486fff082ce7460d; Worker 1856c457-d30d-4217-8c63-c08d8a32fb3f.

## Alcance y conservación

Se portaron únicamente el motor y la interfaz de Finca Escuela, sesiones y misiones, los 18 casos de transferencia, borradores/decisiones, recuperación offline protegida y sus pruebas. Se actualizó el generador oficial para incluir sesiones y minificar sintaxis. El HTML se regeneró por node scripts/build-farm-learning.mjs; no se editó a mano.

Se verificaron 1329 archivos del manifiesto de producción sin cambios. El diff comprende exactamente 22 archivos y está enumerado con hashes en INTEGRATION-DIFF.json; integration.patch contiene el diff completo reproducible contra dfa61a8ab17a86a1397ba1f923d08bf24113c18f.

No se reemplazaron worker/index.ts, app/chatgpt-auth.ts, lib/auth/*, las rutas auth/API, las políticas SEO, sitemap, metadatos generales, configuración Vite/Wrangler, package.json/lockfile, migraciones, administración, componentes generales o activos generales. El SEO f6b3b5e queda conservado. Los builds se generaron desde esta fuente en su propio dist; no se copiaron artefactos de la preview.

La base anterior y el paquete de recuperación offline siguen en /workspace/finca-validation-91b4352/preview/finca-escuela, directorios .ci-output-base-91b4352 y .ci-output. El primer intento integrado se conserva separadamente en .ci-output-initial-fixture.

## Adaptaciones de tests, sin cambios de seguridad del producto

1. admin-navigation contempla MobilePublicActions dentro de PublicWorkspaceControls. Conserva las aserciones existentes de aislamiento, conexión y cuenta, incluida la protección de cierre de sesión propia de producción.
2. auth-fetch espera un turno real del event loop con setImmediate para que se consuma la respuesta sintética. Conserva las aserciones de timeout, abort, limpieza de timers y concurrencia; lib/auth-fetch.ts no cambia.
3. Los tests que invocan el Worker compilado usan origen y bindings sintéticos de producción. globalThis.fetch queda bloqueado para impedir solicitudes externas.
4. Node carece del módulo cloudflare:workers. Un hook exclusivamente de tests proporciona los bindings sintéticos a los lectores de sesión del servidor, sin sustituir ni desactivar validación de autenticación. Un primer run detectó tres errores de renderizado por ese módulo ausente; las 18 pruebas afectadas pasaron con el fixture completo antes de repetir la secuencia final.
5. /app se comprueba como 302 hacia login y noindex; /app-local como 200 local y noindex. Robots/sitemap y guías públicas se verifican con expectativas de producción, mientras aliases/preview siguen excluidos. Se conserva la comprobación de que cabeceras de identidad suplantadas no aparecen en el HTML.
6. ci/check-production-build.mjs amplía comprobaciones locales de estados HTTP y aliases y bloquea fetch externo. El empaquetador añade commits de base, candidato e integración al informe. El manifiesto de fuentes se actualizó, sin saltarse su verificación.

## Comandos

```bash
npm run install:ci
node scripts/build-farm-learning.mjs
node --test --test-concurrency=1 tests/farm-learning*.test.mjs tests/admin-navigation.test.mjs tests/auth-fetch.test.mjs
CI=true NODE_OPTIONS=--max-old-space-size=4096 RAYON_NUM_THREADS=2 \
SITES_BUILD_TIMEOUT=8m AUTH_DEPLOYMENT_TARGET=standalone AUTH_RELEASE_MODE=production \
PUBLIC_SITE_ORIGIN=https://venezuelaagro.com PUBLIC_INDEXING_ENABLED=true \
CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV=false WRANGLER_SEND_METRICS=false \
bash ci/build-only.sh
```

El comando oficial ejecuta lint, tipos, seguridad, npm run build, stage-production-config.mjs (solo copia configuración local), verificación HTTP sintética, suite global y empaquetado. La medición se hizo con /workspace/measure-agro-integration.py, sin alterar el flujo oficial. No se ejecutó deployment/promotion.sh ni ningún comando de despliegue.

## Límites

Esto es un paquete revisable, no una promoción. ready_for_deployment continúa false. No se consultaron cuentas ni datos privados ni se hicieron solicitudes externas de autenticación. No hubo QA visual de navegador ni autenticación real con Google. La coordinación de promoción posterior corresponde al hilo principal.

## Resultado final verificable

- Dependencias oficiales: 751 paquetes instalados correctamente. Node 24.19.0, npm 11.9.0.
- Enfocadas: 63/63 (53 Finca, 4 administración y 6 auth-fetch).
- Seguridad previa al build: 33/33.
- Lint: salida 0, 0 errores y 50 avisos. TypeScript --noEmit --incremental false: salida 0.
- Suite global final: 1344/1344 aprobadas, 0 fallos, omisiones o cancelaciones; 112.48 segundos.
- Secuencia oficial final: salida 0, 171.11 segundos. Build completo generado de nuevo desde la fuente integrada.
- HTTP local: /, /tienda, /plataforma, /rubros, /nosotros 200 e index,follow; /admin y /app 302/noindex; /app-local 200/noindex; /api/bootstrap 401/noindex; /auth/signin, /finca-modelo y /juego-finca 200/noindex. Los tres aliases probados devuelven 403/noindex. Robots y sitemap canónicos 200; rutas privadas y personalizadas excluidas del sitemap.
- Recursos: límite 16 GiB RAM, 4 CPU efectivos, sin swap. Pico del contenedor muestreado 7,248,814,080 bytes (~6.75 GiB, incluye cachés y otros procesos); RSS máximo de un hijo 2,291,668 KiB. Ningún evento OOM/OOM kill.
- 933 archivos empaquetados comprobados por longitud y SHA-256. HTML autónomo: 209,930 bytes e igualdad exacta entre fuente generada y paquete. Configuración de promoción empaquetada igual a la fuente vigente; ningún valor sintético del fixture incluido en el artefacto.
- Presupuesto oficial de salida: correcto, ~55.7 MB frente al máximo 900 MiB. git diff --exit-code y verificación final del manifiesto correctos.
- Primer intento conservado: 1341/1344, tres errores por módulo Workers ausente en Node; todos resueltos únicamente en el fixture de test. Ningún fallo se omitió o dio por válido.

## Paquete y hashes

- agro-review-build.tar.gz: 54,765,457 bytes; SHA-256 `1e5e6cc25bed5b77740173dddac7479249a5db1e27dd87f468be9f2eb7a31007`.
- integration.patch: 403,662 bytes; SHA-256 `ca73e7eb1e6c722311b05e92f87b913a2070fd92df0bd5caea3bad600209d4a2`.
- INTEGRATION-DIFF.json: 3,949 bytes; SHA-256 `a1b0225073c18ad8beb19b3d8bfec1eb45c01c3af47b82267e5cd93ed3777a8a`.
- HTML: SHA-256 `ea0ae1b24d9dc49536635128ea3d4de2b303ca5865e556f2087059c4cc9113fb`.

Evidencias en este directorio: focused.log, security.log, lint.log, typecheck.log, build.log, stage-config.log, production-html.log, production-http-results.json, global-tests.log, cloud-resources.json, BUILD-REVIEW.json, INTEGRATION-DIFF.json y ARTIFACT-VERIFICATION.json. El parche y el informe permiten revisar los cambios sin publicar.

No quedan bloqueos de compilación, seguridad comprobada o pruebas automatizadas. La publicación no se ha realizado; la revisión y promoción posterior siguen coordinadas por el hilo principal.
