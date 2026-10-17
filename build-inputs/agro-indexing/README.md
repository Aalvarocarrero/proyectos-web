> Esta rama prepara **staging standalone con Google**, sin despliegue. El acceso sigue limitado al propietario aprobado y **la administración/CMS standalone está deshabilitada**. Las referencias a ChatGPT y al administrador corporativo que siguen describen la variante Sites. Antes de usar este paquete, leer [la guía de release v127](docs/auth/RELEASE-V127-STAGING.md), especialmente la colisión histórica de migraciones y los pasos pendientes.

# Parcela Los Morochos

Sitio institucional, tienda por solicitud, marketplace agropecuario y aplicación **Mi Finca**. La experiencia es una PWA instalable, priorizada para iPhone/iPad y compatible con Android y ordenadores.

## Funciones incluidas

- Identidad pública y relato familiar de la marca.
- Tienda propia con catálogo, carrito local y solicitudes de disponibilidad.
- Marketplace multiusuario con categorías agropecuarias, imágenes optimizadas y moderación.
- Marketplace con campos sencillos que generan títulos SEO, descripciones semánticas y texto alternativo sin inventar datos.
- Mi Finca: configuración personalizada, animales, pesajes, terreno, ciclos, inventario, escenarios productivos, costos, ingresos y controles sanitarios.
- Directorio de profesionales, vitrina de proyectos, alianzas y sugerencias con moderación.
- Guía institucional enlazada a fuentes oficiales venezolanas.
- Mi Finca local con IndexedDB, shell sin identidad de cuenta y preparación verificable del código. Sincronización condicionada a conexión, sesión y validación de propietario.
- Inicio de sesión seguro con ChatGPT, consentimiento versionado, dispositivos revocables y contacto obligatorio por correo y celular.
- Persistencia central con Cloudflare D1 y archivos de publicaciones en R2.
- Panel administrativo privado en `/admin` para la cuenta corporativa.
- SEO técnico: metadata, datos estructurados, sitemap, robots y biblioteca de contenido.
- Páginas de privacidad, términos de uso y política comercial.

## Desarrollo

Requiere Node.js 22.13 o superior.

```bash
npm install
npm run dev
```

Comprobaciones:

```bash
npm run lint
npm test
npm run db:generate
```

## Datos y sincronización

Los registros se escriben primero en IndexedDB. Cada cambio genera una operación idempotente en una cola local. Cuando vuelve la conexión, el cliente envía lotes al endpoint `/api/sync`; el servidor valida propiedad y contenido, escribe en D1 y devuelve los identificadores aceptados.

El primer acceso y la autenticación inicial necesitan internet. En iOS, la sincronización se reintenta al recuperar señal, volver a la aplicación o abrirla nuevamente; el sistema no depende exclusivamente de Background Sync.

## Instalación como aplicación

- **iPhone/iPad:** Safari → Compartir → Añadir a pantalla de inicio.
- **Android/ordenador:** opción “Instalar aplicación” del navegador.

La PWA comparte el mismo código y datos con la web. Para distribución futura en App Store y Google Play puede empaquetarse esta base con Capacitor u otro contenedor nativo; esa etapa necesita cuentas de desarrollador, firma y revisión de cada tienda.

## Seguridad sin proveedores pagos

Los controles biométricos y de llaves de acceso se retiraron. Las rutas antiguas responden 410 y los registros históricos no se eliminan. Confirmación escrita del email de cuenta y celular obligatorio; no hay envío de códigos de correo ni SMS.

La verificación telefónica por SMS o WhatsApp no está activa porque necesitaría un proveedor externo. Google Maps usa el enlace oficial suministrado por la marca. El botón de WhatsApp se añadirá únicamente cuando se proporcione el número oficial.

## Imágenes demostrativas

Las fotografías `photo-cattle.webp`, `photo-cacao.webp` y `photo-digital-farm.webp` son muestras descargadas de Pexels bajo su licencia de uso gratuito y fueron comprimidas localmente a WebP. Fuentes: https://www.pexels.com/search/cow%20farm/, https://www.pexels.com/search/cocoa%20farm/ y https://www.pexels.com/search/digital%20farming/.

## Producción

La configuración de cada finca comienza vacía: el sistema no precarga medidas, animales ni inventarios de Parcela Los Morochos. La tienda diferencia disponibilidad por confirmar de líneas en desarrollo. Las publicaciones del marketplace pasan por el panel de moderación antes de hacerse públicas.

Antes de activar pagos o contratación automática deben completarse la integración del proveedor de pago, reglas fiscales, logística, inventario en tiempo real y revisión jurídica local.


## Revisión de preparación sin señal y dominio (6 octubre 2026)

Ver `docs/PREPARACION-OFFLINE-Y-DOMINIO-2026-10-06.md`. Mi Finca incluye preparación sin señal, copia JSON, solicitud de persistencia y recuperación explícita de datos antiguos solo en el dispositivo. Cada cuenta y el espacio local tienen una base separada. Los registros antiguos quedan intactos: no se asignan automáticamente a una cuenta ni se transmiten.

El dominio definitivo no está confirmado en esta revisión. Se conserva el origen Sites actual y el acceso privado. No usar antiguos valores de verificación DNS como instrucciones vigentes.
