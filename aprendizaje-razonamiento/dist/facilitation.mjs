// Original facilitation examples, not a validated curriculum or assessment.
export const facilitation = {
 '7y:composition': {model:'Muestra dos posiciones posibles para la misma figura y describe qué cambia, sin presentar una como la mejor.',support:'Lee las etiquetas si hace falta. La persona puede señalar y otra pulsar; no hace falta arrastrar ni distinguir colores.',fade:'Deja que pruebe una alternativa y decida si la conserva. Evita completar el cartel por ella.',observe:'Pregunta qué quiso destacar o qué espacio dejó. La composición no permite deducir capacidades ni personalidad.'},
 '18m:original': {
  model:'El adulto hace rodar la pelota una vez y dice «va hacia ti». Después espera, sin pedir una respuesta concreta.',
  support:'Acerca la pelota si hace falta. Mirar, tocar o elegir otro objeto también puede formar parte del juego; no exijas hablar, moverse de una manera concreta ni mirar a los ojos.',
  fade:'Si propone un gesto o movimiento, síguelo en vez de dirigir el siguiente turno.',
  observe:'¿Qué iniciativa pudiste seguir? Esta pregunta es para el adulto, no una prueba para el niño.'
 },
 '2y:original': {
  model:'El adulto saluda al muñeco y narra una acción: «ahora descansa». Deja espacio para que la historia cambie.',
  support:'Presenta solo una acción si dos resultan confusas. Puedes acompañarla con un gesto y palabras de la lengua familiar.',
  fade:'Espera la propuesta del niño antes de añadir otra acción. Imitar exactamente no es el objetivo.',
  observe:'¿Qué eligió repetir o cambiar? Sigue esa idea sin exigir una secuencia completa.'
 },
 '3y:original': {
  model:'Con dos objetos grandes y seguros, muestra una regla distinta a la del reto: «estos son blandos; miro cómo son al tocarlos».',
  support:'Lee los nombres de las piezas y recuerda una sola regla. Puede señalar y el adulto pulsar; no hace falta nombrar colores ni manejar el dispositivo.',
  fade:'Invita a elegir sin indicar la respuesta. Si quiere, que muestre qué característica comparten sus piezas.',
  observe:'¿Agrupa según la regla elegida o está usando otra? Conversa sobre la regla antes de corregir la selección.'
 },
 '3y:extra': {
  model:'Haz una secuencia de gestos accesibles: tocar la mesa, saludar; tocar la mesa, saludar. Nombra la pareja que vuelve.',
  support:'Para empezar, mantén una pareja repetida. El segundo paso de la actividad cambia a un grupo de tres y es opcional; puedes repetir el primer tipo fuera de pantalla.',
  fade:'Deja que proponga el siguiente gesto o invente otra pareja. No es necesario hacer palmas ni levantar los brazos.',
  observe:'¿Puede mostrar qué grupo se repite? Predecir un gesto una vez no basta para afirmar que domina las secuencias.'
 },
 '5y:original': {
  model:'Cuenta un ejemplo cotidiano: «la torre cayó; cambié la base; volví a construir». Separa lo que ocurrió de la idea que probaste.',
  support:'Lee una tarjeta cada vez. Usa «primero», «después» y «al volver a probar»; el adulto puede mover lo que el niño señale.',
  fade:'Pide que explique por qué dos momentos van juntos sin darle su posición. Se puede contar, señalar o dibujar.',
  observe:'¿Distingue el cambio de la nueva prueba? Ordenar la historia no demuestra por sí solo que entienda una causa.'
 },
 '5y:extra': {
  model:'Dibuja dos casillas contiguas y explica «empiezo aquí y avanzo una casilla a la derecha». Muestra inicio y llegada.',
  support:'Recorre la cuadrícula de papel con un dedo o una marca. Aclara derecha y abajo según el dibujo; no hace falta caminar ni controlar un robot real.',
  fade:'Que otra persona siga las instrucciones sin adivinar. Invita a aclarar una indicación en vez de dar el recorrido completo.',
  observe:'¿Revisa el camino cuando aparece un bloqueo? Una instrucción útil dice desde dónde, hacia dónde y cuánto.'
 },
 '7y:original': {
  model:'Usa otro ejemplo ficticio: con 5 fichas, una opción necesaria de 2 y una opcional de 1 dejan 2. Explica por qué miras primero lo necesario.',
  support:'Lee las condiciones y anota sumas en papel. Se puede usar calculadora; el objetivo es justificar un plan, no hacer cuentas deprisa.',
  fade:'Invita a proponer dos planes que cumplan las condiciones y explicar cuál elegiría. No hay obligación de comprar nada.',
  observe:'¿Revisa tanto los requisitos como el total al cambiar las fichas? No se deducen habilidades financieras de este juego.'
 },
 '7y:extra': {
  model:'Para comparar dos modelos de avión de papel, pregunta qué pasaría si además cambiaras el papel y quién lo lanza. Hay varias explicaciones posibles.',
  support:'En papel, separa tres columnas: «cambio», «mantengo parecido» y «observo». Diseñar la comparación basta; no es necesario hacer el experimento.',
  fade:'Deja que detecte una diferencia que podría confundir la comparación antes de sugerirla tú.',
  observe:'¿Describe lo visto sin convertir una prueba en una regla universal? Repetir puede aportar información, pero no elimina todos los problemas de diseño.'
 },
 '12y:original': {
  model:'Ejemplo inventado: 6 objetos entre 10 personas y 3 entre 5 dan la misma media, 0,6. Un total menor puede acompañar a un grupo menor.',
  support:'Aclara «media por asistente»: dividir el total entre el número de asistentes. Usa papel o calculadora; esto no dice lo que hizo cada persona.',
  fade:'Antes de ver las opciones, formula una conclusión y una explicación alternativa. Después contrástalas con los datos del caso.',
  observe:'¿Distingue total, media y causa? Una conclusión prudente explica qué dato la sostiene y qué falta para ir más allá.'
 },
 '12y:extra': {
  model:'Ejemplo inventado: si 8 de 10 asistentes a un taller prefieren dibujar, ese resultado describe a quienes respondieron, no a todo el barrio.',
  support:'Distingue «población» (el grupo sobre el que quieres saber) y «muestra» (las personas de las que tienes datos). Pregunta quién quedó fuera.',
  fade:'Propón una forma de escuchar perspectivas ausentes y explica sus límites. No hace falta realizar encuestas ni recopilar datos personales.',
  observe:'¿Separa porcentaje, representatividad y decisión? Una muestra más variada aún puede tener sesgos y no resuelve por sí sola qué es justo.'
 }
};
export function getFacilitation(stage,activity='original') {
 const guide=facilitation[`${stage}:${activity}`];
 if(!guide)throw new Error('Guía desconocida');
 return guide;
}
