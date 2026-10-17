# Expedientes individuales de animales

## Alcance

Una misma interfaz local se utiliza en Mi Finca y en la demostración aislada:

- Identidad: código/arete, nombre, especie, raza, sexo, nacimiento, propósito y estado registrado. El nacimiento desconocido se muestra como edad desconocida.
- Pesajes: fecha de medición, kg y notas; gráfica SVG sin biblioteca adicional. Solo se grafican valores positivos con una fecha de calendario válida. El peso inicial sin fecha y los registros antiguos sin fecha permanecen visibles, sin inventar una medición.
- Sanidad: vacunación, desparasitación, enfermedad, revisión u otro evento; descripción, fecha, próxima fecha indicada opcional, producto/lote, responsable y observaciones.
- Reproducción: monta, inseminación, diagnóstico de gestación, parto u otro evento; fecha, resultado observado, responsable y notas.
- Correcciones locales con control de versión del registro y de cuenta, guardado primero en IndexedDB y cola de sincronización existente.

No incluye diagnóstico veterinario, prescripción, dosis, puntaje automático de salud, predicción de gestación/parto, pedigree, vínculo automático madre/cría ni creación de tareas o avisos a partir de una próxima fecha. La reproducción es un historial explícito, no un motor de recomendaciones.

## Contrato de vínculo

`farm-record` conserva los tipos existentes y añade `reproduction`. Los registros `weight`, `health` y `reproduction` pueden usar `data.animalId`; los nuevos eventos reproductivos lo requieren. La relación siempre usa el ID exacto del animal y la misma finca. No se resuelven nombres, títulos ni grupos por coincidencia.

La cola local usa la base del propietario resuelto y `expectedOwner`; el servidor valida el propietario autenticado. Los vínculos nuevos o cambiados requieren un animal disponible de esa misma finca. Los vínculos históricos sin animal disponible conservan su ID; no se reasignan. Los registros con referencia a un animal conocido de otra finca o propietario no son válidos.

Las copias antiguas conservan sus campos y los controles sanitarios sin vínculo. La importación puede conservar referencias históricas cuyo animal ya no aparece en la copia: un archivo de respaldo no demuestra por sí solo si el animal fue eliminado. Eso no hace que esa referencia sea válida para crear un vínculo nuevo por sincronización.

## Mapa

`FarmMapEditor` entrega al masterplan:

- `animalRecords?: ReadonlyArray<{ id: string; title: string; category: string; areaId: string | null }>`: animales reales de la finca elegida, incluidos los que tienen recinto pero no posición dibujada.
- `onOpenAnimal?: (animalId: string) => void`: abre el expediente del ID exacto, previa comprobación de la finca actual.

La ubicación en el croquis es indicada por el usuario. Una asociación al área no equivale a GPS ni a una posición física medida. El acceso desde fichas de área y desde la lista de animales usa el mismo expediente.

## Demostración

Fixture 10 añade seis eventos enteramente ficticios a Alba: cuatro sanitarios y dos reproductivos. Conserva los dos controles antiguos de grupo, los 101 animales, los 10 pesajes y la geometría de la finca de 10 ha. Las prácticas anteriores no se reemplazan al cargar; se ofrece un restablecimiento explícito.

Los cambios permanecen en `venezuela-agro-demonstration-v1`, sin propietario, cola ni envío. Borrar un animal de práctica, tras confirmación, elimina solo su historial ficticio dependiente. El modo real conserva el historial; no se añade una eliminación de animal a esta interfaz.

## Comprobaciones

- `node --test tests/animal-dossier.test.mjs`: renderizado, separación por animal/finca, campos desconocidos, formularios sanitarios/reproductivos, fechas/pesos inválidos y contrato del mapa.
- `node --test tests/farm-demo*.test.mjs`: fixture, interfaz, persistencia, interrupciones, revisiones, reinicio explícito y aislamiento de bases/cola/red.
- Pruebas de `animal-records`, importación, cola offline y ruta de sincronización cubren los límites del vínculo.
- Ejecutar typecheck, lint, compilación y suite agregada sobre la revisión integrada antes de desplegar.

Comprobación visual recomendada: en móvil, abrir recinto, abrir animal, cerrar y elegir otro; registrar y corregir un pesaje/sanidad/reproducción sin red; cancelar un borrador; verificar que el ejemplo no aparece en Mi Finca y que el dato real solo se anuncia respaldado tras un recibo válido de sincronización.
