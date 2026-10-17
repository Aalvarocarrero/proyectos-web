const $ = (id) => document.getElementById(id);
const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const lessons = [
  { title: 'Prepara un buen hogar.', icon: 'hoe', description: 'Antes de sembrar, vamos a soltar la tierra del bancal. Así las raíces tendrán espacio para crecer.', tip: 'Un buen suelo deja pasar el agua: húmedo sí, encharcado no.', detail: 'En un cultivo real, revisa el drenaje y las condiciones del suelo. La materia orgánica bien descompuesta puede ayudar. No usamos recetas de fertilización en este juego.', button: 'Preparar la tierra', scene: 'Todo empieza con la tierra', pointer: 'Toca el bancal para empezar' },
  { title: 'Una semilla, un comienzo.', icon: 'sprout', description: 'Elige semillas identificadas de cilantro para esta parcela virtual. Después las sembramos y cubrimos suavemente con tierra.', tip: 'Cada planta necesita espacio. Sigue las indicaciones de la variedad que siembres.', detail: 'El cilantro puede sembrarse directamente. La profundidad, separación y época deben ajustarse a la semilla y al clima local. Los surcos del dibujo son ilustrativos.', choices: [['sow','Elegir semillas identificadas de cilantro y sembrar'],['unknown-seed','Sembrar una mezcla sin identificar']], scene: 'La tierra está lista para sembrar', pointer: 'Siembra aquí tu cilantro' },
  { title: 'Agua, en su justa medida.', icon: 'water', description: 'Las semillas necesitan humedad para empezar. ¿Cómo regarías este bancal?', tip: 'Regar con cuidado evita mover las semillas y formar charcos.', detail: 'Observa la humedad del suelo antes de decidir. La frecuencia real cambia con la lluvia, el calor, el recipiente y el drenaje; el juego no establece una dosis de riego.', choices: [['water-gently','Dar un riego suave'], ['flood','Llenar el bancal de agua']], scene: 'Semillas bajo la tierra', pointer: 'Elige cómo vas a regar' },
  { title: '¡Mira lo que está pasando!', icon: 'eye', description: 'Ya tienen agua. Para que las plantas crezcan, ¿qué necesitan también?', tip: 'La vida en el huerto lleva tiempo. Aquí lo aceleramos para aprender.', detail: 'La luz participa en la fotosíntesis. El cilantro prefiere condiciones frescas; el calor puede adelantar la floración. Consulta qué variedad y manejo se adaptan a tu zona.', choices: [['choose-light','Luz y tiempo para crecer'], ['choose-dark','Mantenerlas siempre a oscuras']], scene: 'Un pequeño cambio bajo la tierra', pointer: 'Descubre qué necesitan' },
  { title: 'Observar también es cuidar.', icon: 'eye', description: '¡Aparecieron los brotes! Al revisar el suelo, todavía se siente húmedo. ¿Qué harías ahora?', tip: 'Antes de hacer algo, observa. Las plantas no necesitan lo mismo todos los días.', detail: 'El riego excesivo puede perjudicar las raíces. En la vida real se revisan suelo, clima y estado de la planta. Esta decisión representa una situación concreta, no una regla para todos los días.', choices: [['wait-for-soil','Esperar y revisar después'], ['water-again','Regar otra vez de inmediato']], scene: 'Los primeros brotes ya están aquí', pointer: 'Observa antes de actuar' },
  { title: 'Es hora de cosechar.', icon: 'cut', description: 'El cilantro ya tiene hojas desarrolladas. Corta con cuidado y reúne tu cosecha en la canasta.', tip: 'En un huerto real, el uso de herramientas requiere preparación y supervisión adecuada.', detail: 'Para usar las hojas se cosecha según el desarrollo de la planta. Obtener semillas requiere otra etapa. Esta práctica acelera el ciclo y no estima fechas ni rendimientos reales.', button: 'Cosechar con cuidado', scene: 'Hojas listas para la cosecha', pointer: 'Tu cilantro está listo' },
  { title: 'Anótalo para recordarlo.', icon: 'book', description: 'Cuenta la canasta: tienes 3 manojos de cilantro. Vamos a dejar un registro sencillo de esta cosecha ficticia.', tip: 'Anotar qué, cuánto y para qué ayuda a aprender de cada cosecha.', detail: 'En una finca real también se registran fecha, lote y observaciones. El peso se obtiene con una balanza: un manojo no equivale a una cantidad fija de kilos.', scene: '3 manojos en tu canasta', pointer: '¡Ahora vamos al cuaderno!' },
];

const goals = ['Preparar un lugar para que crezcan las raíces','Sembrar cilantro en la tierra preparada','Elegir un riego suave, sin charcos','Descubrir qué necesita una planta para crecer','Decidir después de observar la humedad','Reconocer y recoger hojas desarrolladas','Registrar 3 manojos sin confundir las unidades','Conectar lo que observaste con lo que aprendiste'];
const stepNames = ['Preparar la tierra','Sembrar cilantro','Regar con cuidado','Descubrir cómo crece','Observar antes de actuar','Cosechar las hojas','Registrar lo aprendido'];
const hints = [
  ['Busca la herramienta que ayuda a soltar la tierra.','Toca “Preparar la tierra” o el bancal del dibujo.'],
  ['El suelo ya está listo. Ahora necesita semillas.','Elige las semillas identificadas de cilantro, no una mezcla desconocida.'],
  ['Las raíces también necesitan aire. Evita los charcos.','Elige “Dar un riego suave”.'],
  ['Imagina una planta que pasa todo el tiempo a oscuras.','Elige “Luz y tiempo para crecer”.'],
  ['La observación dice que la tierra todavía está húmeda.','Elige “Esperar y revisar después”.'],
  ['Las hojas ya se desarrollaron. Busca la herramienta de corte.','Toca “Cosechar con cuidado”. En la vida real, usa herramientas con preparación y supervisión adecuada.'],
  ['Cuenta lo que hay en la canasta. Un manojo no equivale a un kilo.','Escribe 3 y selecciona “Manojos”. Después guarda el registro.'],
];
let hintLevel = 0;
let embedded = null;
try { embedded = JSON.parse($('embedded-progress').textContent); } catch { /* A malformed embedded save starts clean. */ }
const embeddedId = typeof embedded?.id === 'string' && /^[a-z0-9-]{1,60}$/.test(embedded.id) ? embedded.id : null;
const storage = {
  getItem: (key) => localStorage.getItem(embeddedId ? `${key}:copy:${embeddedId}` : key),
  setItem: (key, value) => localStorage.setItem(embeddedId ? `${key}:copy:${embeddedId}` : key, value),
};
let state = readProgress(storage, embedded?.state);
let selectedTool = toolForStage(state.stage);
let lastInvoker = null;
let activePage = 'inicio';
let saveWorks = true;

function toolForStage(stage) { return ['prepare','sow','water-gently','observe','observe','harvest','notebook','notebook'][stage]; }
function save() {
  captureSessionDrafts();
  try { writeProgress(storage, state); saveWorks = true; }
  catch { saveWorks = false; }
  $('save-status').innerHTML = icon(saveWorks ? 'shield' : 'info') + (saveWorks ? 'Progreso guardado en este navegador' : 'No se pudo guardar. Descarga una copia.');
}
function showFeedback(message, retry = false) {
  const el = $('feedback'); el.hidden = !message; el.classList.toggle('retry', retry);
  el.replaceChildren();
  if (message) { const symbol = document.createElement('span'); symbol.innerHTML = icon(retry ? 'info' : 'check'); const text = document.createElement('span'); text.textContent = message; el.append(symbol, text); }
}
function sceneResponse(container, message) {
  container.classList.remove('responding'); void container.offsetWidth; container.classList.add('responding');
  const surface=container.matches('.scene')?container.parentElement:container;
  let note=surface.querySelector('.scene-event');
  if(!note){note=document.createElement('div');note.className='scene-event';note.setAttribute('role','status');note.setAttribute('aria-live','polite');if(surface!==container)container.after(note);else container.append(note);}
  note.textContent=message;
}
function doAction(action, payload = {}) {
  if(action !== 'reset' && sessionIsWaiting('cilantro')) { focusSession('cilantro'); return; }
  const result = transition(state, action, payload);
  state = result.state;
  if (result.ok) { hintLevel = 0; selectedTool = toolForStage(state.stage); save(); render(); $('mission-content').classList.remove('flash'); void $('mission-content').offsetWidth; $('mission-content').classList.add('flash'); }
  if(result.ok) sceneResponse(document.querySelector('.scene'), result.message);
  showFeedback(result.message, !result.ok);
  if (result.ok) { $('mission').scrollTop=0; $('mission').focus({ preventScroll: true }); focusSession('cilantro'); }
}
function render() {
  renderMode();
  $('mode-explore').setAttribute('aria-pressed', String(state.mode === 'explore'));
  $('mode-deepen').setAttribute('aria-pressed', String(state.mode === 'deepen'));
  $('step-count').textContent = state.stage === 7 ? '¡Completado!' : `${state.stage + 1} de 7`;
  $('progress').setAttribute('aria-valuenow', String(state.stage));
  $('progress-bar').style.width = `${state.stage / 7 * 100}%`;
  $('current-goal').textContent = goals[state.stage];
  $('coach-step').textContent = state.stage === 7 ? 'Cosecha completada' : `Paso ${state.stage + 1} de 7`;
  renderRoad();
  const mission = $('mission-content');
  if (state.stage < 7) {
    const lesson = lessons[state.stage];
    $('mission').setAttribute('aria-label', 'Misión actual: ' + lesson.title);
    let action = lesson.choices ? `<div class="choices">${lesson.choices.map(([id,label]) => `<button class="choice" data-action="${id}">${label}${icon('arrow')}</button>`).join('')}</div>`
      : lesson.button ? `<button class="primary" data-action="${EXPECTED_ACTIONS[state.stage]}">${lesson.button}${icon('arrow')}</button><p class="action-hint">También puedes tocar el bancal del dibujo</p>` : '';
    if (state.stage === 6) action = `<form id="record-form"><div class="form-grid"><label for="quantity">Cantidad<input id="quantity" name="quantity" type="number" min="0" max="99" step="1" inputmode="numeric" placeholder="¿Cuántos?" required autocomplete="off"></label><label for="unit">Unidad<select id="unit" name="unit"><option value="manojos">Manojos</option><option value="kilogramos">Kilogramos</option></select></label></div><label class="destination-label" for="destination">Destino de esta cosecha<select id="destination" name="destination"><option value="cocina">La cocina</option><option value="compartir">Compartir</option></select></label><button class="primary" type="submit">Guardar en mi cuaderno${icon('book')}</button></form>`;
    mission.innerHTML = `${playModeMarkup()}<span class="stage-mode">${state.mode === 'deepen' ? '🔎 Profundizar · observa y explica' : '🌱 Explorar · tu siguiente paso'}</span><div class="goal-line">AHORA: ${stepNames[state.stage]}</div><div class="mission-icon">${icon(lesson.icon)}</div><h2 tabindex="-1">${lesson.title}</h2><p class="mission-description">${lesson.description}</p><div class="mission-tip">${icon('bulb')}<span>${lesson.tip}</span></div>${action}${depthMarkup('cilantro',state.stage,lesson.detail)}<button class="hint-button" id="hint-button" aria-expanded="${hintLevel > 0}" aria-controls="hint-copy">${icon('bulb')}${hintLevel === 0 ? 'Necesito una pista' : hintLevel === 1 ? 'Dame otra pista' : 'Ocultar pistas'}</button><div class="hint-copy" id="hint-copy" ${hintLevel === 0 ? 'hidden' : ''}>${hintLevel > 0 ? hints[state.stage].slice(0,hintLevel).join(' ') : ''}</div>`;
    $('scene-state').textContent = lesson.scene;
    $('garden-pointer').textContent = lesson.pointer;
    $('garden-pointer').hidden = false;
    $('garden-action').setAttribute('aria-label', lesson.button ? lesson.button + ' en el bancal de cilantro' : 'Ver la misión: ' + lesson.title);
  } else {
    $('mission').setAttribute('aria-label', 'Misión completada: de semilla a cosecha');
    mission.innerHTML = `${playModeMarkup()}<div class="complete-medal">${icon('medal')}</div><h2>¡De semilla a cosecha!</h2><p class="mission-description">Cuidaste tu huerto, tomaste buenas decisiones y guardaste lo aprendido. Eso también es ser parte del campo.</p>${recordMarkup()}${depthMarkup('cilantro',7,'Compara el registro con las observaciones que hiciste durante el recorrido.')}<button class="primary" data-page="cuaderno">Ver mi cuaderno${icon('book')}</button><div class="secondary-row"><button class="secondary" data-page="retos">Explorar los retos</button><button class="secondary" data-reset>Sembrar otra vez</button></div>`;
    $('scene-state').textContent = 'Una cosecha, muchos aprendizajes';
    $('garden-pointer').textContent = '¡Misión cumplida!';
    $('garden-action').setAttribute('aria-label', 'Ver el cuaderno de la cosecha completada');
  }
  document.querySelectorAll('.tool').forEach((button) => { button.setAttribute('aria-pressed', String(button.dataset.tool === selectedTool)); button.classList.toggle('recommended', button.dataset.tool === toolForStage(state.stage)); });
  const milestone = state.stage < 2 ? 0 : state.stage < 5 ? 1 : state.stage < 6 ? 2 : 3;
  document.querySelectorAll('[data-milestone]').forEach((el, i) => { const done = i < milestone || state.stage === 7; el.classList.toggle('done', done); el.classList.toggle('active', i === milestone && state.stage < 7); el.querySelector('.journey-number').innerHTML = done ? icon('check') : '0' + (i+1); });
  renderPlants(); renderNotebook(); renderChallenges(); renderSpeciesHub(); renderModule();
  if(typeof renderSession==='function')renderSession('cilantro');
  if(typeof restoreSessionDrafts==='function')restoreSessionDrafts();
}
function recordMarkup() {
  if (!state.record) return '';
  return `<div class="record-summary"><dl><dt>Cultivo</dt><dd>Cilantro</dd><dt>Cosecha de práctica</dt><dd>3 manojos</dd><dt>Destino</dt><dd>${state.record.destination === 'cocina' ? 'La cocina' : 'Compartir'}</dd></dl><p class="record-disclaimer">Registro ficticio · ciclo de aprendizaje completado<br>No es una cosecha real ni una estimación de producción.</p></div>`;
}
function renderNotebook() {
  $('notebook-content').innerHTML = state.record ? `<div class="notebook-record"><h3>Mi primera cosecha de cilantro</h3>${recordMarkup()}<p class="saved-note">${saveWorks ? 'Guardado solo en este navegador.' : 'Guardado automático no disponible. Descarga una copia para conservarlo.'}</p><button class="secondary" id="export-record" style="margin-top:18px">${icon('download')}Descargar este registro</button></div>` : `<div class="notebook-empty">${icon('book')}<h3>Tu cosecha de cilantro está por registrar.</h3><p>Completa el huerto y registra la cosecha para verla aquí.</p></div>`;
  $('notebook-content').insertAdjacentHTML('beforeend', speciesNotebook() + recapMarkup() + transferNotebook());
}
function renderPlants() {
  $('soil-grass').setAttribute('visibility', state.stage === 0 ? 'visible' : 'hidden');
  $('seed-layer').style.display = state.stage >= 2 && state.stage < 4 ? 'block' : 'none';
  $('water-layer').style.display = state.stage === 3 ? 'block' : 'none';
  // SVG presentation does not consistently honor the HTML hidden attribute.
  for (const id of ['seed-layer','water-layer','basket-harvest','harvest-sparkles']) $(id).removeAttribute('hidden');
  const points = [[312,269],[359,259],[406,249],[453,239],[500,229],[338,292],[385,282],[432,272],[479,262],[526,252],[364,315],[411,305],[458,295],[505,285],[552,275]];
  $('plant-layer').innerHTML = state.stage === 4 || state.stage === 5 ? `<g class="growth">${points.map(([x,y])=>`<use href="#${state.stage === 4 ? 'tiny-plant' : 'cilantro'}" x="${x}" y="${y}"/>`).join('')}</g>` : '';
  $('basket-harvest').style.display = state.stage >= 6 ? 'block' : 'none';
  $('harvest-sparkles').style.display = state.stage >= 6 ? 'block' : 'none';
}
function navigate(page, updateHash = true) {
  captureSessionDrafts();
  const parts=page.split('/');
  if(parts[0]==='retos'&&['moisture','spacing','cattle'].includes(parts[1]))activeChallenge=parts[1];
  if(parts[0]==='module'&&MODULE_IDS.includes(parts[1]))activeModule=parts[1];
  if(parts[0]==='ganaderia')parts[0]='animales';
  const pages=['inicio','cultivos','animales','huerto','retos','cuaderno','module'];
  activePage=pages.includes(parts[0])?parts[0]:'inicio';
  if(['huerto','module'].includes(activePage))document.body.dataset.play=activePage;else delete document.body.dataset.play;
  for(const name of pages)$(name+'-page').hidden=name!==activePage;
  const navPage=activePage==='huerto'?'cultivos':activePage==='module'?species[activeModule].family:activePage;
  document.querySelectorAll('.nav-button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.page===navPage)));
  if(activePage==='retos')renderChallenges();
  if(activePage==='module'){renderModule();$('module-feedback').hidden=true;}
  if(activePage==='huerto')render();
  restoreSessionDrafts();
  renderSpeciesHub();
  const targetHash=activePage==='retos'?'retos/'+activeChallenge:activePage==='module'?'module/'+activeModule:activePage;
  if(updateHash&&location.hash!=='#'+targetHash)location.hash=targetHash;
  if(updateHash){ const pageNode=$(activePage+'-page'); pageNode.scrollIntoView({behavior:'auto',block:'start'}); const heading=pageNode.querySelector('h1,h2'); if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});} }
}

function openDialog(id, invoker = document.activeElement) {
  lastInvoker = invoker;
  const dialog = $(id);
  dialog.returnFocus = invoker;
  if (typeof dialog.showModal === 'function') dialog.showModal(); else { dialog.setAttribute('open', ''); dialog.scrollIntoView(); }
}
function closeDialog(dialog) {
  if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open');
}
function downloadBlob(content, type, filename) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename;
  document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
document.addEventListener('click', (event) => {
  const button = event.target.closest('button'); if (!button) return;
  if (button.dataset.transferId) { handleTransfer(button); return; }
  if (sessionClick(button)) return;
  if (button.dataset.playMode) {
    $('mode-'+button.dataset.playMode).click();
    const panel=$(activePage+'-page');
    panel.querySelector('.play-mode-status').textContent=$('mode-status').textContent;
    panel.querySelector(`[data-play-mode="${button.dataset.playMode}"]`)?.focus({preventScroll:true});
    return;
  }
  if (button.dataset.page) navigate(button.dataset.page);
  if (button.dataset.species && species[button.dataset.species]) { if(button.dataset.species==='cilantro') navigate('huerto'); else navigate('module/'+button.dataset.species); }
  if (button.dataset.moduleAction) runModule(button.dataset.module,button.dataset.moduleAction,button.dataset);
  if (button.dataset.challenge) { activeChallenge = button.dataset.challenge; navigate('retos'); renderChallenges(); $('challenge-feedback').hidden = true; }
  if (button.hasAttribute('data-open-cattle')) { activeChallenge = 'cattle'; navigate('retos'); renderChallenges(); }
  if (button.dataset.labAction) runChallenge(button.dataset.labAction, button.dataset);
  if (button.id === 'hint-button') {
    hintLevel = (hintLevel + 1) % 3;
    const values = recordFormValues(); render(); restoreFormValues(values); $('hint-button')?.focus({preventScroll:true});
  }
  if (button.dataset.action) doAction(button.dataset.action);
  if (button.dataset.tool) {
    selectedTool = button.dataset.tool;
    document.querySelectorAll('.tool').forEach((el) => el.setAttribute('aria-pressed', String(el.dataset.tool === selectedTool)));
    if (selectedTool === 'notebook') { if (state.stage === 6) { $('mission').focus(); $('quantity')?.focus(); } else navigate('cuaderno'); }
    else if (selectedTool === toolForStage(state.stage)) {
      if ([0,5].includes(state.stage)) doAction(selectedTool);
      else { showFeedback('Observa la misión y elige una respuesta.'); focusMission(); }
    } else { showFeedback('Esta herramienta tendrá su momento. La misión indica el siguiente paso.', true); focusMission(); }
  }
  if (button.hasAttribute('data-close')) closeDialog(button.closest('dialog'));
  if (button.hasAttribute('data-reset')) openDialog('reset-dialog', button);
  if (button.id === 'export-record' && state.record) {
    const content = `VenezuelaAgro · Finca Escuela\nREGISTRO FICTICIO DE APRENDIZAJE\n\nCultivo: Cilantro\nCantidad: 3\nUnidad: manojos\nDestino: ${state.record.destination === 'cocina' ? 'La cocina' : 'Compartir'}\nCiclo: aprendizaje completado (tiempo acelerado)\n\nNo representa una cosecha real ni una estimación de producción.\nAprendí a preparar, sembrar, observar, cuidar, cosechar y registrar.\n`;
    downloadBlob(content, 'text/plain;charset=utf-8', 'mi-cosecha-de-practica.txt');
  }
});
document.addEventListener('submit', (event) => {
  if (event.target.id === 'module-record-form') { event.preventDefault(); const form=event.target; runModule(form.dataset.module,'record',{quantity:form.elements.quantity.value,unit:form.elements.unit.value}); return; }
  if (event.target.id !== 'record-form') return;
  event.preventDefault();
  doAction('save-record', { quantity: $('quantity').value, unit: $('unit').value, destination: $('destination').value });
});
$('garden-action').addEventListener('click', () => {
  if(sessionIsWaiting('cilantro')){focusSession('cilantro');return;}
  if (state.stage === 7) { navigate('cuaderno'); return; }
  if (state.stage === 6 && selectedTool === 'notebook') { $('quantity').focus(); return; }
  if ([1,2,3,4].includes(state.stage) && selectedTool === toolForStage(state.stage)) {
    showFeedback('Mira la misión y elige una respuesta para cuidar tu cilantro.');
    $('mission-content').querySelector('.choice')?.focus(); return;
  }
  doAction(selectedTool);
});
for (const mode of ['explore','deepen']) $('mode-' + mode).addEventListener('click', () => {
  const values = recordFormValues();
  const moduleValues = moduleFormValues();
  state = transition(state, 'mode', { mode }).state; save(); render();
  restoreFormValues(values); restoreModuleFormValues(moduleValues);
  $('mode-status').textContent = mode === 'deepen' ? '🔎 Modo cambiado: explicaciones y preguntas activadas. Tu avance se conserva.' : '🌱 Modo cambiado: pasos breves activados. Tu avance se conserva.';
});
$('skip-content').addEventListener('click', () => { const section=$(activePage+'-page'); section.tabIndex=-1; section.focus(); section.scrollIntoView({behavior:'auto',block:'start'}); });
$('road-button').addEventListener('click', () => openDialog('road-dialog'));
$('glossary-button').addEventListener('click', () => openDialog('glossary-dialog'));
$('mobile-next').addEventListener('click', focusMission);
$('continue-mission').addEventListener('click', () => { closeDialog($('road-dialog')); focusMission(); });
$('about-button').addEventListener('click', () => openDialog('about-dialog'));
$('session-guidance-button').addEventListener('click', () => openDialog('session-guidance-dialog'));
$('offline-button').addEventListener('click', () => openDialog('offline-dialog'));
$('reset-button').addEventListener('click', () => { closeDialog($('about-dialog')); openDialog('reset-dialog', $('about-button')); });
$('confirm-reset').addEventListener('click', () => { closeDialog($('reset-dialog')); doAction('reset'); navigate('huerto'); });
for (const dialog of document.querySelectorAll('dialog')) {
  dialog.addEventListener('close', () => { const target=dialog.returnFocus||lastInvoker; if(target?.isConnected&&target.getClientRects().length)target.focus({preventScroll:true}); });
  dialog.addEventListener('click', (event) => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeDialog(dialog); } });
}
$('download-game').addEventListener('click', () => {
  try {
    const copy = document.documentElement.cloneNode(true);
    for (const dialog of copy.querySelectorAll('dialog')) dialog.removeAttribute('open');
    copy.querySelector('#embedded-progress').textContent = JSON.stringify({ id: 'export-' + Math.random().toString(36).slice(2) + Date.now().toString(36), state: restoreGame(state) });
    downloadBlob('<!doctype html>\n' + copy.outerHTML, 'text/html;charset=utf-8', 'finca-escuela-sin-internet.html');
    $('download-status').textContent = 'Archivo preparado. Confirma que el navegador lo haya guardado y pruébalo sin conexión.';
  } catch { $('download-status').textContent = 'No se pudo preparar el archivo en este navegador. Puedes volver a intentarlo desde un navegador de escritorio.'; }
});
function updateConnection() {
  const isFile = location.protocol === 'file:';
  $('offline-banner').hidden = !isFile && navigator.onLine;
  $('offline-banner').textContent = isFile ? 'Copia descargada: el juego incluye todo lo necesario para jugar sin internet. Guarda otra copia si quieres conservar el progreso fuera de este navegador.' : 'Estás sin conexión. Puedes seguir jugando mientras esta página permanezca abierta. Para volver a abrirla sin señal, usa una copia descargada y comprobada.';
}
window.addEventListener('pagehide',save);
document.addEventListener('input',event=>{if(event.target.closest('#record-form,#module-record-form'))save();});
document.addEventListener('change',event=>{if(event.target.closest('#record-form,#module-record-form'))save();});
window.addEventListener('online', updateConnection); window.addEventListener('offline', updateConnection);
window.addEventListener('hashchange', () => navigate(location.hash.slice(1), false));
window.addEventListener('storage', (event) => {
  const key = embeddedId ? `${SAVE_KEY}:copy:${embeddedId}` : SAVE_KEY;
  if (event.key === key) { state = readProgress(storage); selectedTool = toolForStage(state.stage); render(); showFeedback('El progreso cambió en otra pestaña de este navegador.'); }
});
function moduleFormValues() { const form=$('module-record-form'); return form ? {quantity:form.elements.quantity.value,unit:form.elements.unit.value} : null; }
function restoreModuleFormValues(values) { const form=$('module-record-form'); if(form && values) for(const [key,value] of Object.entries(values)) form.elements[key].value=value; }
function recordFormValues() { return state.stage === 6 ? {quantity:$('quantity')?.value,unit:$('unit')?.value,destination:$('destination')?.value} : null; }
function restoreFormValues(values) { if(values) for(const [key,value] of Object.entries(values)) if($(key)) $(key).value = value ?? ''; }
function focusMission() { navigate('huerto'); $('mission').scrollIntoView({behavior:'auto',block:'center'}); $('mission').focus({preventScroll:true}); }
function renderRoad() { $('mission-road').innerHTML = stepNames.map((name,index) => `<li class="${index === state.stage ? 'current' : ''}"><span class="road-dot">${index < state.stage ? icon('check') : index+1}</span><span>${name}<small>${index < state.stage ? 'Explorado' : index === state.stage ? 'Estás aquí' : 'Próximo paso'}</small></span></li>`).join(''); }
render(); save(); updateConnection(); navigate(location.hash.slice(1), false);
