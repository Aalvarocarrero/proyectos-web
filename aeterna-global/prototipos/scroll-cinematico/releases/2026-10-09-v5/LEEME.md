# Aeterna Global · Entrega web v5

**Versión para revisión y actualización manual.** Fecha de preparación: 9 de octubre de 2026, UTC.

Esta carpeta contiene el sitio completo con la estética y la navegación cinematográfica revisadas: servicios, información de Aeterna, fotografía, campaña, redes sociales y colección de menús. Las fotografías y los menús se abren en un visor continuo, centrado y con la imagen completa.

## Qué utilizar

- **`dist/`**: sitio estático completo. Contiene el código HTML/CSS/JavaScript y todos los archivos necesarios para servirlo. No requiere compilación ni dependencias de Node.
- **`documentacion/`**: guía de actualización, contenido incluido, comprobaciones y procedencia de los materiales.
- **`licencias/`**: avisos de bibliotecas y fuentes utilizadas, con sus límites de redistribución.
- **`configuracion/`**: referencias para configurar el alojamiento. No se aplican automáticamente.
- **`MANIFIESTO.json` y `SHA256SUMS.txt`**: inventario y huellas de integridad.
- **`verificar_integridad.py`**: comprobación local opcional de los archivos.

## Revisión antes de actualizar la web

La previsualización privada está en:
https://aeterna-cinematic-preview.aalvarocarrero.chatgpt.site

Para revisarla localmente desde esta carpeta, se puede servir `dist/` con un servidor estático. Por ejemplo, si Python 3 ya está instalado:

```sh
python3 -m http.server 8080 --directory dist
```

Después, abrir `http://localhost:8080`. No basta con abrir `index.html` como archivo: varias rutas de recursos son absolutas desde la raíz del sitio.

## Antes de publicar

1. Revisar en ordenador y móvil la portada, las seis rutas y los visores.
2. Guardar una copia recuperable del sitio actual y confirmar el destino exacto.
3. Seguir `documentacion/ACTUALIZACION-WEB.md`. Este paquete es para un alojamiento estático en la raíz de un dominio; no es un tema ni un complemento de WordPress.
4. Revisar los derechos comerciales y de incrustación de las fuentes originales de los menús; consultar `licencias/LEEME-FUENTES.md`. No se incluye una verificación completa de licencias comerciales.
5. Confirmar si la publicación debe ser pública y si corresponde retirar `noindex` y el bloqueo de `robots.txt`.

**Los formularios siguen siendo demostraciones sin envío. No hay pagos, reservas confirmadas ni backend activado. La analítica permanece desactivada.** No se ha actualizado el sitio de producción al preparar esta entrega.

Los precios de los menús son ejemplos ilustrativos en AUD para una muestra australiana. No son una conversión de divisas ni precios vigentes de un restaurante.

## Identidad de la versión

- Previsualización completa: v5
- Código publicado: `ca00cd21198fcd724b9a5e9b4234a4c10ce251e9`
- Publicación privada verificada: 9 de octubre de 2026, 22:59:56 UTC
- Más detalle: `documentacion/VERSION.json`
