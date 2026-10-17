/* Short, deliberate sessions. No timers, streaks, profiles or automatic next mission. */
const missionLessons = {
 cilantro:[
  ['Dar un buen comienzo','Relaciona suelo y semilla antes de sembrar.','El suelo necesita drenaje y las semillas deben estar identificadas.','¿Qué revisarías antes de sembrar otra planta?','El drenaje del lugar y las indicaciones de la variedad. No basta con copiar el dibujo.'],
  ['Observar antes de regar','Decide con la humedad observada, la luz y el desarrollo.','Agua, luz y tiempo cumplen funciones distintas. Una tierra húmeda no pide otro riego por costumbre.','¿Regarías igual si mañana la tierra sigue húmeda?','Primero volvería a observar. La decisión depende de la humedad y las condiciones, no de repetir una rutina.'],
  ['Cosechar y contar con sentido','Distingue una cantidad contada de un peso medido.','El registro dice 3 manojos ficticios. No sabemos su peso ni cuánto tardaría una cosecha real.','¿Puedes convertir 3 manojos en 3 kilos?','No. Para conocer kilos hace falta medir el peso; un manojo no tiene un peso fijo.']
 ],
 maize:[
  ['Planificar una siembra','Relaciona semilla, suelo y disposición de las plantas.','Identificaste la semilla y preparaste un bloque de plantas. El esquema no fija distancias reales.','¿Copiarías estas posiciones como una distancia de siembra real?','No. El bloque representa una agrupación; las distancias dependen de variedad y condiciones locales.'],
  ['Comprender la polinización','Conecta panoja, viento y barbas de la mazorca.','El viento lleva el polen de la panoja hacia las barbas. Una hoja distinta es una observación, no un diagnóstico.','¿Cómo llega el polen a las barbas?','El viento lo transporta. Las raíces no cumplen esa función.'],
  ['Cerrar un ciclo con evidencia','Distingue floración, madurez y registro.','Florecer no significa que el grano esté listo. El dibujo tampoco permite deducir kilos producidos.','¿Qué dato falta para saber el peso de la cosecha?','Una medición del peso. El número de plantas o el tamaño del dibujo no lo reemplazan.']
 ],
 tomato:[
  ['Preparar una plántula','Relaciona variedad, drenaje y adaptación al sitio.','La variedad importa. El semillero necesita drenaje y el traslado considera desarrollo y adaptación.','¿El reloj basta para decidir un trasplante?','No. Hay que considerar el desarrollo de la plántula y las condiciones del lugar.'],
  ['Leer el desarrollo del tomate','Distingue apoyo, flores y frutos en desarrollo.','El soporte acompaña el crecimiento. Las flores preceden a los frutos; el rojo no define la madurez de todas las variedades.','¿Un tomate debe ser rojo para estar listo siempre?','No. Hay variedades de distintos colores; se considera la variedad y el destino.'],
  ['Elegir y registrar la cosecha','Cuenta solo los frutos listos en este ejemplo.','Seleccionaste 2 frutos listos de la escena. Contar frutos no mide su peso.','¿Qué sabes con certeza de esta canasta?','Hay 2 frutos ficticios. Para saber los kilos faltaría una balanza.']
 ],
 bovine:[
  ['Reconocer las etapas','Relaciona identidad, crianza y necesidades cambiantes.','Una cría y un adulto tienen necesidades distintas. El cuidado real corresponde a personas capacitadas.','¿Se aplica el mismo manejo a todas las etapas?','No. El equipo responsable considera la etapa, el desarrollo y las condiciones.'],
  ['Observar y avisar con seguridad','Distingue hechos observables y una acción segura.','Viste un bebedero vacío y sombra inaccesible. El aviso se hace desde fuera de la cerca.','¿Qué puedes afirmar sin inventar?','Que el bebedero está vacío y una barrera impide llegar a la sombra. No sabemos desde cuándo ni si hay una enfermedad.'],
  ['Registrar sin diagnosticar','Separa observación, medición y evaluación profesional.','Contar bovinos no mide litros de leche. Un registro útil conserva hechos y señala qué falta comprobar.','Si no hay volumen medido, ¿qué anotarías?','“Sin medir”. Los litros necesitan medición; una enfermedad necesita evaluación profesional.']
 ],
 pig:[
  ['Planificar según la etapa','Reconoce origen, crianza y transiciones del lote.','Identidad y etapa ayudan a planificar. Las transiciones necesitan seguimiento del equipo responsable.','¿Por qué importa conocer la etapa?','Porque cambian necesidades y adaptación; no corresponde aplicar un único manejo sin revisar.'],
  ['Diseñar para el bienestar','Relaciona agua, refugio y exploración segura.','El plano combina recursos diferentes. Explorar y hozar son comportamientos normales.','¿Un refugio reemplaza al agua o a la exploración?','No. Son necesidades distintas. Los recursos reales los revisa la persona responsable.'],
  ['Separar registros y suposiciones','Identifica lo observado y lo que falta medir.','El tamaño del dibujo no mide peso. El plano no certifica salud ni sustituye revisión profesional.','¿Puedes saber el peso mirando el dibujo?','No. Hace falta una medición adecuada, identificada con su unidad.']
 ],
 poultry:[
  ['Planear una visita segura','Ordena reglas, observación, salida e higiene.','Conocer las reglas, observar en la zona permitida, salir y lavarse las manos forman una secuencia segura.','¿Parecer sana significa que un ave no porta gérmenes?','No. La observación no descarta gérmenes. Esta actividad no invita a tocar aves.'],
  ['Distinguir crecimiento y postura','Relaciona etapa y necesidades de las aves.','Un pollito no produce huevos. Los recursos de bienestar siguen importando cuando la gallina es adulta.','¿La presencia de huevos basta para confirmar bienestar?','No. El responsable sigue revisando recursos, condiciones y conducta.'],
  ['Contar con su unidad','Distingue conteo, peso e inocuidad.','Contaste 4 huevos en el dibujo. Ese conteo no indica kilos ni seguridad para consumir.','¿Qué demuestra el número 4 de tu registro?','Solo el conteo de huevos ficticios. No demuestra peso, producción real ni aptitud para consumo.']
 ]
};
function missionInfo(id) {
 const m=learningMission(state,id);
 return {...m,lesson:missionLessons[id][m.index],name:species[id].name};
}
function sessionDuration(){return state.mode==='deepen'?'10–20 min':'5–10 min';}
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Called by the bundled main UI.
function missionLabel(id) {
 const m=missionInfo(id);
 return m.finished?'Recorrido completo':m.pending?`Misión ${m.index+1} lista · repasar y pausar`:`Misión ${m.index+1} de 3 · ${m.completed}/${m.total} etapas`;
}
function sessionBar(id){
 const m=missionInfo(id);
 return `<div class="session-guide"><span>MISIÓN ${m.index+1} DE 3 · ${m.completed}/${m.total} ETAPAS</span><strong>${m.lesson[0]}</strong><p>${m.lesson[1]}</p><small>Estimación: ${sessionDuration()}. Puedes parar antes.</small></div>`;
}
function offscreenTask(id){
 return ['bovine','pig','poultry'].includes(id)?'Fuera de pantalla, dibuja dos columnas: “lo que vi” y “lo que falta saber”. Usa una ilustración impresa de un animal y escribe o di un ejemplo en cada columna. Los menores lo hacen con una persona adulta. No hace falta visitar, tocar ni alimentar animales.':'Fuera de pantalla, observa una planta desde un lugar seguro o usa una ilustración impresa. Dibuja una hoja y explica una cosa que ves y otra que todavía no sabes. Los menores lo hacen con una persona adulta; sin recoger, tocar ni probar plantas.';
}
function checkpointMarkup(id){
 const m=missionInfo(id);
 const replay=id==='cilantro'?'<button class="text-button" data-reset>Sembrar otra vez</button>':`<button class="text-button" data-module="${id}" data-module-action="replay">Volver a practicar este recorrido</button>`;
 const nextActions=m.finished?`<button class="text-button" data-page="cuaderno">Ver lo aprendido en mi cuaderno →</button>${replay}`:`<button class="text-button" data-session-action="continue" data-session-id="${id}">Elegir seguir con la misión ${m.index+2} →</button>`;
 return `${playModeMarkup()}<section class="session-recap" aria-label="Cierre de misión"><span class="session-eyebrow">MISIÓN ${m.index+1} DE 3 · ${m.total} ETAPAS COMPLETADAS</span><h3 tabindex="-1">Un buen momento para parar.</h3><h4>${m.lesson[0]}</h4><p>${m.lesson[2]}</p><p class="session-save" role="status">${saveWorks?'Tu avance está guardado en este navegador.':'No se pudo guardar aquí. Descarga una copia antes de cerrar.'}</p><button class="primary" data-session-action="finish" data-session-id="${id}">Terminar por ahora${icon('check')}</button>${nextActions}<div class="recall-check"><strong>Sin mirar la respuesta</strong><p>${m.lesson[3]}</p><details><summary>Comparar mi explicación</summary><p>${m.lesson[4]}</p><small>Autoevaluación sin nota. No necesitas responder en voz alta ni escribir aquí.</small></details></div>${state.mode==='deepen'?transferMarkup(id,m.index):''}<details class="offscreen-task"><summary>Una observación fuera de pantalla</summary><p>${offscreenTask(id)}</p><small>Opcional. No se entrega ni se califica.</small></details></section>`;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Called by the bundled main UI.
function renderSession(id){
 const m=missionInfo(id),panel=id==='cilantro'?$('mission-content'):$('module-task');
 if(m.pending){panel.innerHTML=checkpointMarkup(id);if(id!=='cilantro')$('module-scene').innerHTML=speciesArt(id)+`<p class="scene-instruction">Punto de pausa · misión ${m.index+1} completada</p>`;}
 else if(!m.finished)panel.insertAdjacentHTML('afterbegin',sessionBar(id));
 if(id==='cilantro'){
  $('garden-action').disabled=m.pending;
  document.querySelectorAll('.tool').forEach(button=>{button.disabled=m.pending;});
  $('step-count').textContent=m.pending?`Misión ${m.index+1} lista`:`${Math.min(m.step+1,7)} de 7`;
 }
 const page=id==='cilantro'?$('huerto-page'):$('module-page');
 page.dataset.checkpoint=String(m.pending);
}
function sessionIsWaiting(id){return learningMission(state,id)?.pending===true;}
function focusSession(id){
 const panel=id==='cilantro'?$('mission'):$('module-task');
 panel.scrollTop=0;
 if(sessionIsWaiting(id))panel.querySelector('.session-recap h3')?.focus({preventScroll:true});
}
function showSessionPause(id){
 save();
 const m=missionInfo(id);
 $('pause-copy').innerHTML=`<span class="session-eyebrow">${m.name} · MISIÓN ${m.index+1} DE 3</span><p>${m.pending?'Ya completaste esta misión.':`Llevas ${m.completed} de ${m.total} etapas de esta misión. Puedes dejarla aquí.`}</p><p>${saveWorks?'El avance se verificó en este navegador. Volverás al mismo punto aunque cierres la página.':'Este navegador no confirmó el guardado. Descarga una copia para conservar el avance antes de cerrar.'}</p><details><summary>Algo sencillo fuera de pantalla</summary><p>${offscreenTask(id)}</p></details>`;
 $('pause-finish').dataset.sessionId=id;
 openDialog('pause-dialog');
}
function finishSession(id){
 const dialog=$('pause-dialog');if(dialog.open)closeDialog(dialog);
 save();navigate('inicio');
 const notice=$('session-notice');notice.hidden=false;
 $('session-notice-copy').textContent=saveWorks?`${species[id].name}: pausa lista. Puedes cerrar la página; tu avance queda en este navegador.`:'El guardado no está disponible. Descarga una copia antes de cerrar para conservar el avance.';
 $('session-resume').dataset.species=id;
 $('session-download').hidden=saveWorks;
 notice.focus({preventScroll:true});notice.scrollIntoView({block:'center'});
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Called by the bundled main UI.
function sessionClick(button){
 const action=button.dataset.sessionAction;
 if(!action)return false;
 const id=button.dataset.sessionId||(activePage==='huerto'?'cilantro':activeModule);
 if(!MISSION_ENDS[id])return true;
 if(action==='pause')showSessionPause(id);
 if(action==='finish')finishSession(id);
 if(action==='continue'){
  const result=acknowledgeMission(state,id);if(result.ok){state=result.state;save();render();focusSession(id);const panel=id==='cilantro'?$('mission'):$('module-task');(panel.querySelector('h2,h3')||panel).focus({preventScroll:true});}
 }
 if(action==='download'){if($('pause-dialog').open)closeDialog($('pause-dialog'));openDialog('offline-dialog',button);}
 return true;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Called by the bundled main UI.
function captureSessionDrafts(){
 const drafts={...state.drafts};
 const cilantro=recordFormValues();if(cilantro)drafts.cilantro=cilantro;
 const form=$('module-record-form');if(form&&['tomato','poultry'].includes(form.dataset.module))drafts[form.dataset.module]=moduleFormValues();
 state={...state,drafts:cleanLearningDrafts({...state,drafts})};
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Called by the bundled main UI.
function restoreSessionDrafts(){
 if(state.stage===6)restoreFormValues(state.drafts.cilantro);
 const form=$('module-record-form');if(form)restoreModuleFormValues(state.drafts[form.dataset.module]);
}
