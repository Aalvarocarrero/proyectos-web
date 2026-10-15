# Decisiones · 0.1

Fecha: 2026-10-15. Base canónica: [plan de Notion](https://app.notion.com/p/3fa30479a7368161b25df3732810491e?pvs=204).

## Solicitud y alcance

Crear una plataforma para autonomía, curiosidad, razonamiento y habilidades para la vida de 18 meses a 18 años, con decisiones en Notion e historial técnico en GitHub. Esta entrega inicia un prototipo local aislado. No cambia otros proyectos, no publica ni crea repositorios remotos.

El alcance general procede del plan documentado. La selección del primer piloto es una propuesta técnica concreta, todavía pendiente de revisión del usuario y de especialistas. Implementado no significa aprobado pedagógicamente.

## Registro

| Decisión | Motivo | Estado | Evidencia | Pendiente |
|---|---|---|---|---|
| HTML/CSS/JavaScript sin framework ni API | Demostración pequeña, portable y sin dependencias de producción | Implementado | `dist/` | Navegadores reales |
| Seis etapas del plan conservadas | Evitar una experiencia única desde bebés a adolescentes | Implementado | `logic.mjs`, pruebas | Revisar fronteras por habilidades |
| Menores de 3: orientación al adulto y juego fuera de pantalla | Propósito aprobado de acompañamiento y bienestar | Implementado | `renderCaregiver` | Revisión de desarrollo infantil |
| Dos pilotos funcionales, con etapas futuras marcadas | Entrega verificable sin simular currículo completo | Implementado y lógica probada | 16 pruebas | Revisión del recorrido visual |
| Agrupación por color y luego forma | Explorar flexibilidad, observación y explicación | Implementado | `checkGrouping` | Accesibilidad prelectora y revisión experta |
| Plan de salida con 8 y luego 5 fichas | Priorizar, comparar y revisar restricciones | Implementado | `evaluatePlan` | Variantes contextuales |
| Respuestas incorrectas reconocidas sin castigo | Ofrecer pistas, reintentos y explicación | Implementado | Código de feedback | Observar comprensión con usuarios |
| Estado en memoria, sin nombres ni perfiles | Evitar datos de menores en un piloto | Implementado, revisión estática | CSP y código | Diseño de privacidad antes de persistencia |
| Sin generación ni perfilado por IA | No prometer un tutor validado ni estilos fijos de aprendizaje | Implementado | Sin llamadas externas | Evaluación antes de adaptación real |
| Sin audio automático | Evitar dependencias y transmittal externo; mantener alcance | Limitación explícita | Interfaz textual con adulto | Lectura local accesible revisada |
| Contraste del número de paso oscurecido | Prueba estática detectó 4,15:1 inicial | Corregido y probado | Informe de contraste | Auditoría visual completa |
| No publicar ni crear repositorio | Alcance local de esta entrega | Conservado | No herramientas de publicación | Aprobación y coordinación del titular |

## Contenido y propiedad intelectual

Textos, mecánicas y elementos visuales de esta entrega se redactaron para el proyecto. No se copiaron ejercicios, personajes, ilustraciones ni contenido propietario de los recursos comparados. El plan de Notion informa objetivos y precauciones, no se usa como prueba de eficacia del nuevo prototipo.

## Diseño

Dirección editorial cálida: fondo crema, verde bosque, geometría original en CSS, tipografías de sistema. Sin imágenes remotas, animaciones de presión, puntos acumulativos, rachas o rankings. Botones nativos, etiquetas textuales además del color, foco visible, regiones de estado, disposición flexible, movimientos reducidos y alternativa conversada/física.
