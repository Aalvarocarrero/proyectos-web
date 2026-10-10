# Recordly para los tutoriales de Venezuela Agro

Revisión documental y de código: 10 de octubre de 2026. No se instaló ni se ejecutó Recordly; no se accedió a Venezuela Agro ni se grabó ningún tutorial.

## Conclusión

Recordly encaja para grabar una navegación real y convertirla en tutoriales paso a paso con zooms, cursor visible, anotaciones y voz. La captura adjunta corresponde al repositorio oficial [webadderallorg/Recordly](https://github.com/webadderallorg/Recordly). Es una aplicación de escritorio; no es un modelo generativo ni una skill oficial lista para instalar.

La propuesta es conservar una guía de uso reutilizable y las referencias comprobadas para cuando se decida producir los tutoriales.

## Versiones comprobadas

- Commit de main analizado: [535d1cfafa87cc318db6f2b57b70b6c1c1079862](https://github.com/webadderallorg/Recordly/commit/535d1cfafa87cc318db6f2b57b70b6c1c1079862), del 7 de octubre de 2026.
- Última versión estable devuelta por GitHub durante la revisión: [v1.4.0](https://github.com/webadderallorg/Recordly/releases/tag/v1.4.0), publicada el 8 de septiembre de 2026.
- Commit del tag v1.4.0: 4b20a1a76ed3564bd70aee7a0cc7167ea2e5e9c1.
- La captura aportada mostraba v1.3.3 y un estado anterior. No se presupone que una versión de la captura y main actual tengan las mismas funciones.
- Para una instalación futura, empezar por una versión estable oficial y comprobar sus notas, sistema operativo y archivos SHA256SUMS antes de instalar. No recomendar desactivar avisos de seguridad o retirar cuarentenas automáticamente.

## Qué hace de verdad

El [README fijado](https://github.com/webadderallorg/Recordly/blob/535d1cfafa87cc318db6f2b57b70b6c1c1079862/README.md) describe grabación de monitor o ventana, micrófono y audio del sistema; edición mediante recortes, cambios de velocidad, zooms y anotaciones; webcam superpuesta; exportación MP4/GIF y proyectos .recordly.

El [código de captura](https://github.com/webadderallorg/Recordly/blob/535d1cfafa87cc318db6f2b57b70b6c1c1079862/src/hooks/useScreenRecorder.ts) utiliza captura multimedia y MediaRecorder, con rutas nativas según plataforma. Por tanto, puede registrar clics, formularios, cambios de página y resultados reales. Las sugerencias de zoom dependen de actividad del cursor. No navega por sí mismo ni verifica que un procedimiento explicado sea correcto.

Las imágenes se pueden usar como anotaciones o fondos. Una imagen aislada no permite reconstruir acciones reales, estados posteriores, animaciones o resultados de un sitio web. Tampoco se encontró una interfaz de automatización de tutoriales de punta a punta que permita prometer producción desatendida. El flujo comprobado es el de una aplicación de escritorio.

## Precio y dependencias

- La [web oficial](https://recordly.dev/) declara que la aplicación es gratuita, sin barreras de pago ni límites ocultos. La revisión de las rutas locales no encontró una API de pago necesaria para grabar, editar o exportar.
- Esto no equivale a garantizar costo cero en cualquier despliegue: equipo, almacenamiento, conectividad y cualquier servicio externo elegido siguen teniendo sus condiciones.
- No aparece un requisito general de GPU NVIDIA ni de CUDA. El [control de CUDA](https://github.com/webadderallorg/Recordly/blob/535d1cfafa87cc318db6f2b57b70b6c1c1079862/src/components/video-editor/useNvidiaCudaExportOptIn.ts) es experimental, voluntario y se habilita únicamente si hay capacidad compatible. El [enrutamiento de exportación](https://github.com/webadderallorg/Recordly/blob/535d1cfafa87cc318db6f2b57b70b6c1c1079862/src/lib/exporter/backendPolicy.ts) contempla rutas nativas y WebCodecs. No se midió rendimiento ni consumo de RAM en hardware real.
- macOS: mínimo declarado 14.0 para el flujo ScreenCaptureKit y audio.
- Windows: mínimo recomendado declarado Windows 10, build 19041. Versiones anteriores pueden usar captura alternativa con peor ocultación del cursor.
- Linux: distribución moderna; el audio del sistema suele necesitar PipeWire. El README advierte que no se oculta el cursor original, por lo que activar también la capa estilizada puede producir dos cursores.
- Compilar desde fuente requiere Node/npm y herramientas nativas. El CI usa Node 22; el README pide Xcode Command Line Tools en macOS, herramientas C++ y CMake en Windows, y build-essential/CMake/bibliotecas X11 en Linux. El package.json no declara una versión mínima de Node mediante engines.
- npm install ejecuta postinstall y construye/reconstruye componentes nativos. No se ejecutó. Para el uso previsto, un instalador oficial estable evita convertir esta tarea en un proyecto de compilación.
- Paquetes relevantes: Electron, React, PixiJS, FFmpeg/FFprobe y uiohook-napi. No se necesita Python para el uso normal descrito.

### Subtítulos

La ruta de [generación de subtítulos](https://github.com/webadderallorg/Recordly/blob/535d1cfafa87cc318db6f2b57b70b6c1c1079862/electron/ipc/captions/generate.ts) extrae audio con FFmpeg y ejecuta whisper.cpp localmente. El código ofrece descargar ggml-small.bin desde Hugging Face. Ese uso necesita descarga inicial, espacio y cómputo local, pero no se encontró una clave de API de transcripción pagada. El tamaño real y la velocidad no se verificaron. En Windows se contempla una dependencia del Visual C++ Redistributable. Los subtítulos se deben revisar, especialmente nombres, términos agrícolas y regionalismos.

### Conexión, cuentas y nube

Main incorpora funciones opcionales de cuenta y compartir. El diálogo contiene “Continue without signing in”. La exportación local debe ser la opción inicial para materiales privados.

Hay código Supabase Auth y un servicio de compartir basado en Cloudflare Worker, R2 y D1. Activarlo requeriría cuentas, configuración, condiciones y posibles costos propios. La documentación de compartir dice que se usa localhost, pero el [código del endpoint](https://github.com/webadderallorg/Recordly/blob/535d1cfafa87cc318db6f2b57b70b6c1c1079862/src/components/video-editor/cloud/endpoint.ts) ya distingue localhost en desarrollo y un endpoint explícito en una compilación empaquetada. Se registra esa diferencia y no se da por disponible un servicio alojado de producción.

No se hizo una auditoría exhaustiva de tráfico, actualizaciones, telemetría o extensiones. No debe describirse toda la aplicación como completamente desconectada ni garantizarse ausencia absoluta de transmisión. Para este proyecto no es necesario iniciar sesión, habilitar nube ni instalar extensiones.

## Licencia y archivo privado

El [LICENSE.md fijado](https://github.com/webadderallorg/Recordly/blob/535d1cfafa87cc318db6f2b57b70b6c1c1079862/LICENSE.md) contiene AGPLv3, avisos iniciales de marca y atribución, y atribución MIT del proyecto OpenScreen. Debe conservarse íntegro junto con [THIRD_PARTY_NOTICES.md](https://github.com/webadderallorg/Recordly/blob/535d1cfafa87cc318db6f2b57b70b6c1c1079862/THIRD_PARTY_NOTICES.md).

La licencia permite ejecutar la aplicación y su sección 2 distingue el programa de su salida. Grabar una web propia no incorpora automáticamente código de Recordly en Venezuela Agro ni hace que la web tenga que publicarse bajo AGPL. Si en el futuro se modifica/distribuye Recordly o se integra su código como servicio, se deben revisar separadamente las obligaciones de código fuente, avisos y marca. El resumen inicial del repositorio usa una formulación más amplia que algunas cláusulas del texto; no se debe tratar como asesoramiento jurídico para una integración comercial.

El archivo privado debe identificar origen, commit, fecha y alcance. La skill de trabajo es una guía propia de uso de la herramienta, no una afirmación de que el usuario sea autor de Recordly ni una autorización para reutilizar su marca. No incluir claves, contraseñas, sesiones, datos de clientes o grabaciones reales en el archivo técnico.

## Privacidad para las futuras demostraciones

1. Preferir un entorno de prueba o cuenta de demostración con el rol mínimo necesario.
2. Usar nombres, teléfonos, direcciones, productos y operaciones ficticios. Verificar que la cuenta no dispara cobros, mensajes, pedidos ni cambios de producción.
3. Grabar solo la ventana necesaria. Cerrar correo, mensajería, gestor de contraseñas y pestañas ajenas; ocultar notificaciones.
4. No capturar autenticación, contraseñas, códigos de un solo uso, tokens en URLs, datos de clientes, cuentas bancarias ni paneles internos que el público no deba ver.
5. Para enseñar login, empezar después de autenticar o usar una toma separada preparada con datos ficticios.
6. Revisar cuadro por cuadro las transiciones y pantallas de confirmación antes de compartir. Es preferible repetir una toma limpia a confiar únicamente en un difuminado.
7. Exportar localmente; compartir el resultado únicamente con la audiencia aprobada. Un enlace de nube y una carpeta Git privada son destinos diferentes.

## Resultado y límites de esta revisión

Se inspeccionó la captura original y se leyeron archivos del repositorio fijados a commit. No se ejecutaron binarios, dependencias, compilaciones, grabaciones o pruebas de exportación. Las capacidades se sustentan en documentación y código; no se presentan como una prueba práctica superada. El flujo de Venezuela Agro está preparado en WORKFLOW.md sin inventar módulos que aún no se han revisado.

