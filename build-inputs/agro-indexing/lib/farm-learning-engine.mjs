/** Original, deterministic educational state machine. No network or personal data. */
export const GAME_VERSION = 3;
export const SAVE_KEY = 'venezuela-agro-learning-v3';
export const PREVIOUS_SAVE_KEY = 'venezuela-agro-learning-v2';
export const LEGACY_SAVE_KEY = 'venezuela-agro-learning-v1';
export const STAGES = ['prepare', 'sow', 'water', 'observe', 'care', 'harvest', 'record', 'complete'];
export const EXPECTED_ACTIONS = ['prepare', 'sow', 'water-gently', 'choose-light', 'wait-for-soil', 'harvest', 'save-record'];

export function newGame() {
  return { version: GAME_VERSION, stage: 0, mode: 'explore', record: null, challenges: freshChallenges(), modules: freshModules(), cycles: freshCycles() };
}

export function restoreGame(value) {
  if (!value || ![1, 2, GAME_VERSION].includes(value.version) || !Number.isInteger(value.stage) || value.stage < 0 || value.stage > 7) return newGame();
  const mode = value.mode === 'deepen' ? 'deepen' : 'explore';
  const record = value.stage === 7 && value.record?.crop === 'Cilantro' && value.record?.quantity === 3 && value.record?.unit === 'manojos' && ['cocina', 'compartir'].includes(value.record?.destination)
    ? { crop: 'Cilantro', quantity: 3, unit: 'manojos', destination: value.record.destination, simulated: true }
    : null;
  return { version: GAME_VERSION, stage: value.stage === 7 && !record ? 6 : value.stage, mode, record, challenges: cleanChallenges(value.challenges), modules: cleanModules(value.modules), cycles: cleanCycles(value.cycles) };
}

export function transition(state, action, payload = {}) {
  const current = restoreGame(state);
  if (action === 'mode') return { state: { ...current, mode: payload.mode === 'deepen' ? 'deepen' : 'explore' }, ok: true, message: '' };
  if (action === 'reset') return { state: { ...newGame(), mode: current.mode, challenges: current.challenges, modules: current.modules, cycles: current.cycles }, ok: true, message: 'Una nueva semilla, una nueva oportunidad.' };
  if (current.stage === 7) return { state: current, ok: false, message: 'Ya completaste esta cosecha. Puedes mirar tu cuaderno o comenzar de nuevo.' };
  if (action !== EXPECTED_ACTIONS[current.stage]) {
    const feedback = {
      'flood': 'Más agua no siempre ayuda. Las raíces también necesitan aire. Prueba un riego suave, sin charcos.',
      'choose-dark': 'El agua es importante, pero las plantas también necesitan luz para crecer. Inténtalo otra vez.',
      'water-again': 'La tierra aún está húmeda. Observar antes de regar ayuda a evitar el exceso de agua.',
      'harvest': 'Todavía estamos aprendiendo a cuidar el cilantro. Cosecharemos cuando aparezcan hojas desarrolladas.',
    };
    return { state: current, ok: false, message: feedback[action] || 'Mira la misión de este paso. Cada herramienta tiene su momento.' };
  }
  if (action === 'save-record') {
    if (Number(payload.quantity) !== 3 || payload.unit !== 'manojos' || !['cocina', 'compartir'].includes(payload.destination)) {
      return { state: current, ok: false, message: 'La canasta tiene 3 manojos. Anota esa cantidad y usa la unidad “manojos”.' };
    }
    return { state: { ...current, stage: 7, record: { crop: 'Cilantro', quantity: 3, unit: 'manojos', destination: payload.destination, simulated: true } }, ok: true, message: '¡Cosecha registrada! Ahora sabes de dónde viene, cómo se cuidó y cuánto se recogió.' };
  }
  const messages = [
    '¡Buen comienzo! El suelo suelto y con buen drenaje deja respirar a las raíces.',
    'Semillas en su lugar. Una capa ligera de tierra las protege.',
    '¡Así sí! La tierra queda húmeda, sin encharcarse.',
    '¡Brotaron! Con luz, agua y tiempo, las semillas despiertan.',
    'Observar también es cuidar. El cilantro ya tiene hojas desarrolladas.',
    '¡Tu primera cosecha! Hay 3 manojos ficticios en la canasta.',
  ];
  return { state: { ...current, stage: current.stage + 1 }, ok: true, message: messages[current.stage] };
}

export function writeProgress(storage, state) {
  const serialized = JSON.stringify(restoreGame(state));
  storage.setItem(SAVE_KEY, serialized);
  if (storage.getItem(SAVE_KEY) !== serialized) throw new Error('No se pudo verificar el guardado local.');
}

export function readProgress(storage) {
  for (const key of [SAVE_KEY, PREVIOUS_SAVE_KEY, LEGACY_SAVE_KEY]) {
    try {
      const parsed = JSON.parse(storage.getItem(key));
      if (parsed && [1,2,GAME_VERSION].includes(parsed.version) && Number.isInteger(parsed.stage) && parsed.stage >= 0 && parsed.stage <= 7) return restoreGame(parsed);
    } catch { /* Try the untouched earlier save. */ }
  }
  return newGame();
}


export function freshChallenges() {
  return { moisture: { round: 0, inspected: false, done: false }, spacing: { seeds: [], done: false }, cattle: { observed: [], done: false, recorded: false } };
}
function cleanChallenges(value) {
  const fresh = freshChallenges();
  if (!value || typeof value !== 'object') return fresh;
  const round = Number.isInteger(value.moisture?.round) && value.moisture.round >= 0 && value.moisture.round <= 2 ? value.moisture.round : 0;
  return {
    moisture: { round, inspected: round < 2 && value.moisture?.inspected === true, done: value.moisture?.done === true || round === 2 },
    spacing: { seeds: Array.isArray(value.spacing?.seeds) ? [...new Set(value.spacing.seeds.filter(n => Number.isInteger(n) && n >= 0 && n < 7))].slice(0,3).sort((a,b) => a-b) : [], done: value.spacing?.done === true },
    cattle: { observed: Array.isArray(value.cattle?.observed) ? [...new Set(value.cattle.observed.filter(n => ['water','shade','gate'].includes(n)))].sort() : [], done: value.cattle?.done === true, recorded: value.cattle?.recorded === true },
  };
}
export function challengeTransition(state, action, payload = {}) {
  const current = restoreGame(state);
  const challenges = cleanChallenges(current.challenges);
  const result = (ok, message) => ({ state: ok ? { ...current, challenges } : current, ok, message });
  if (action === 'moisture-inspect') {
    if (challenges.moisture.round >= 2) return result(false, 'Ya observaste las dos muestras. Puedes volver a practicar.');
    challenges.moisture.inspected = true;
    return result(true, challenges.moisture.round === 0 ? 'Observación: al comprobar bajo la superficie, esta muestra se siente seca. Ahora decide qué harías.' : 'Observación: la tierra conserva humedad. ¿Necesita más agua ahora?');
  }
  if (action === 'moisture-decide') {
    const soil = challenges.moisture;
    if (soil.round >= 2) return result(false, 'Reto completado. Puedes volver a practicar.');
    if (!soil.inspected) return result(false, 'Primero toca la muestra para observar su humedad. Decidir empieza por mirar.');
    const expected = soil.round === 0 ? 'water' : 'wait';
    if (payload.choice !== expected) return result(false, soil.round === 0 ? 'En este ejemplo de cilantro joven y suelo seco bajo la superficie, elegimos recuperar humedad con un riego cuidadoso. Prueba de nuevo.' : 'Esta muestra aún está húmeda. Esperar y volver a observar evita añadir agua innecesaria.');
    soil.round++; soil.inspected = false; if (soil.round === 2) soil.done = true;
    return result(true, soil.round === 1 ? 'Buena decisión para esta muestra. Ahora observa una tierra diferente.' : '¡Dos muestras, dos decisiones! La humedad observada importa más que repetir un riego por costumbre.');
  }
  if (action === 'spacing-toggle') {
    const index = payload.index;
    if (!Number.isInteger(index) || index < 0 || index > 6) return result(false, 'Elige uno de los siete espacios del dibujo.');
    const seeds = challenges.spacing.seeds;
    if (seeds.includes(index)) challenges.spacing.seeds = seeds.filter(n => n !== index);
    else if (seeds.length === 3) return result(false, 'Ya tienes tres semillas. Toca una para retirarla y cambiarla de lugar.');
    else challenges.spacing.seeds = [...seeds,index].sort((a,b) => a-b);
    return result(true, challenges.spacing.seeds.length === 3 ? 'Tres semillas colocadas. Comprueba si dejaste un espacio libre entre ellas.' : `${challenges.spacing.seeds.length} de 3 semillas colocadas. Puedes tocar una semilla para moverla.`);
  }
  if (action === 'spacing-check') {
    const seeds = challenges.spacing.seeds;
    if (seeds.length !== 3) return result(false, 'Coloca tres semillas antes de comprobar.');
    if (seeds.some((n,i) => i > 0 && n - seeds[i-1] < 2)) return result(false, 'Hay semillas muy juntas. Retira una y deja al menos un espacio vacío entre cada par en este dibujo.');
    challenges.spacing.done = true;
    return result(true, '¡Hay espacio para crecer! Es un esquema de aprendizaje, no una distancia real de siembra. Cada cultivo y variedad tiene su separación.');
  }
  if (action === 'cattle-observe') {
    if (!['water','shade','gate'].includes(payload.zone)) return result(false, 'Elige un punto del potrero ilustrado.');
    challenges.cattle.observed = [...new Set([...challenges.cattle.observed,payload.zone])].sort();
    const observations = {water:'El bebedero de este ejemplo está vacío. No sabemos cuánto tiempo lleva así.',shade:'Hay sombra disponible. Los animales necesitan protección adecuada frente al clima.',gate:'La puerta está cerrada. Observa desde fuera; los niños deben estar acompañados.'};
    return result(true, observations[payload.zone]);
  }
  if (action === 'cattle-decide') {
    if (challenges.cattle.observed.length !== 3) return result(false, 'Observa primero los tres puntos: agua, sombra y puerta.');
    if (payload.choice !== 'tell-adult') return result(false, 'Entrar al potrero sin acompañamiento no es seguro. Avisa a la persona responsable para que revise el bebedero.');
    challenges.cattle.done = true; challenges.cattle.recorded = true;
    return result(true, 'Registraste una observación concreta: “Bebedero vacío”. Avisar a la persona responsable es el siguiente paso seguro; no es un diagnóstico.');
  }
  if (action === 'challenge-replay') {
    const name = payload.name;
    if (!['moisture','spacing','cattle'].includes(name)) return result(false, 'Elige un reto.');
    const done = challenges[name].done;
    challenges[name] = { ...freshChallenges()[name], done };
    return result(true, 'Puedes probar de nuevo. Conservamos el registro de lo que ya exploraste.');
  }
  return result(false, 'Esta acción no pertenece a un reto disponible.');
}

export const MODULE_IDS = ['maize','tomato','bovine','pig','poultry'];
export function freshModules() {
  return {
    maize:{step:0,done:false,plots:[],seen:[]},
    tomato:{step:0,done:false,supported:false,picked:[]},
    bovine:{step:0,done:false,seen:[]},
    pig:{step:0,done:false,resources:[]},
    poultry:{step:0,done:false,sequence:[],eggs:[]},
  };
}
function allowList(value, allowed, max=allowed.length) {
  return Array.isArray(value) ? [...new Set(value.filter(x=>allowed.includes(x)))].slice(0,max) : [];
}
export function cleanModules(value) {
  const result=freshModules();
  for(const id of MODULE_IDS) {
    const entry=value?.[id]; if(!entry || typeof entry!=='object') continue;
    result[id].step=Number.isInteger(entry.step)&&entry.step>=0&&entry.step<=3?entry.step:0;
    result[id].done=entry.done===true || result[id].step===3;
  }
  result.maize.plots=allowList(value?.maize?.plots,Array.from({length:12},(_,i)=>i),6).sort((a,b)=>a-b);
  result.maize.seen=allowList(value?.maize?.seen,['tassel','silk']);
  result.tomato.supported=value?.tomato?.supported===true;
  result.tomato.picked=allowList(value?.tomato?.picked,[1,4]).sort((a,b)=>a-b);
  result.bovine.seen=allowList(value?.bovine?.seen,['water','shade','gate']);
  result.pig.resources=allowList(value?.pig?.resources,['water','shelter','explore']);
  const expected=['rules','observe','leave','wash'];
  const seq=Array.isArray(value?.poultry?.sequence)?value.poultry.sequence:[];
  for(let i=0;i<expected.length&&seq[i]===expected[i];i++) result.poultry.sequence.push(seq[i]);
  result.poultry.eggs=allowList(value?.poultry?.eggs,[0,2,3,5]).sort((a,b)=>a-b);
  return result;
}
export function maizeIsBlock(plots) {
  if(plots.length!==6 || new Set(plots).size!==6 || plots.some(i=>!Number.isInteger(i)||i<0||i>11)) return false;
  const rows=[...new Set(plots.map(i=>Math.floor(i/4)))],cols=[...new Set(plots.map(i=>i%4))];
  return rows.length>1&&cols.length>1&&rows.length*cols.length===6&&Math.max(...rows)-Math.min(...rows)+1===rows.length&&Math.max(...cols)-Math.min(...cols)+1===cols.length;
}
export function moduleTransition(state, id, action, payload={}) {
  const current=restoreGame(state);
  if(!MODULE_IDS.includes(id)) return {state:current,ok:false,message:'Elige un módulo disponible.'};
  const modules=cleanModules(current.modules), m=modules[id];
  const result=(ok,message)=>({state:ok?{...current,modules}:current,ok,message});
  const advance=message=>{m.step++;if(m.step===3)m.done=true;return result(true,message);};
  if(action==='replay') {modules[id]={...freshModules()[id],done:m.done};return result(true,'Volvemos al primer paso. Conservamos lo que ya exploraste en tu cuaderno.');}
  if(m.step===3)return result(false,'Este recorrido está completo. Puedes repetirlo sin borrar los demás.');
  if(id==='maize') {
    if(m.step===0&&action==='plot') {
      if(!Number.isInteger(payload.index)||payload.index<0||payload.index>11)return result(false,'Elige una de las doce posiciones.');
      if(m.plots.includes(payload.index))m.plots=m.plots.filter(i=>i!==payload.index);
      else if(m.plots.length<6)m.plots.push(payload.index);
      else return result(false,'Ya hay seis plantas. Retira una para cambiarla de lugar.');
      m.plots.sort((a,b)=>a-b);return result(true,`${m.plots.length} de 6 plantas. Busca varias hileras cortas juntas en este esquema.`);
    }
    if(m.step===0&&action==='check')return maizeIsBlock(m.plots)?advance('¡Un bloque de plantas! Ahora descubre cómo viaja el polen con el viento.'):result(false,'Forma un bloque completo de 2 por 3 o de 3 por 2 posiciones. Es un dibujo para comparar agrupaciones, no una receta de siembra.');
    if(m.step===1&&action==='inspect'&&['tassel','silk'].includes(payload.choice)) {m.seen=allowList([...m.seen,payload.choice],['tassel','silk']);return result(true,payload.choice==='tassel'?'La panoja está arriba: sus flores producen el polen.':'Las barbas de la mazorca reciben el polen. No son raíces.');}
    if(m.step===1&&action==='decide') {
      if(m.seen.length!==2)return result(false,'Observa primero la panoja y las barbas.');
      return payload.choice==='wind'?advance('El viento transporta el polen. Las plantas agrupadas tienen más vecinas alrededor.'):result(false,'El polen del maíz viaja sobre todo con el viento, desde la panoja hasta las barbas. Vuelve a mirar.');
    }
    if(m.step===2&&action==='record')return payload.choice==='pollen'?advance('Guardaste: “Agrupar el maíz ayuda al encuentro del polen con las barbas”. Sin estimar cosechas reales.'):result(false,'Este recorrido trata de polinización: el dibujo no indica cuántos kilos producirá el cultivo.');
  }
  if(id==='tomato') {
    if(m.step===0&&action==='support') {
      if(payload.choice!=='fit')return result(false,'Este tomate de crecimiento continuo necesita un apoyo adecuado a su tamaño, sin apretar el tallo. No todos los tomates usan el mismo soporte.');
      m.supported=true;return advance('El apoyo acompaña el crecimiento y mantiene los frutos separados del suelo. En la vida real lo instala una persona responsable.');
    }
    if(m.step===1&&action==='pick') {
      if(![1,4].includes(payload.index))return result(false,'Este fruto está rotulado “aún no” en nuestra escena. Busca los dos marcados “listo”. El color y el momento real dependen de la variedad y el destino.');
      if(m.picked.includes(payload.index))return result(false,'Ese fruto ya está en la canasta. Cuenta cada uno una sola vez.');
      m.picked.push(payload.index);m.picked.sort((a,b)=>a-b);return result(true,`${m.picked.length} de 2 frutos listos en la canasta de práctica.`);
    }
    if(m.step===1&&action==='check')return m.picked.length===2?advance('Recogiste solo los dos frutos listos de esta escena. Ahora registra lo que contaste.'):result(false,'Observa las etiquetas y recoge los dos frutos listos antes de registrar.');
    if(m.step===2&&action==='record')return Number(payload.quantity)===2&&payload.unit==='frutos'?advance('Registro de práctica: 2 frutos de tomate. Contar frutos no permite inventar su peso.'):result(false,'Contamos 2 frutos. Para registrar kilos haría falta pesarlos.');
  }
  if(id==='bovine') {
    if(m.step===0&&action==='inspect'&&['water','shade','gate'].includes(payload.choice)) {
      m.seen=allowList([...m.seen,payload.choice],['water','shade','gate']);
      return result(true,({water:'El bebedero está vacío en esta escena.',shade:'Hay sombra, pero una barrera impide llegar a ella.',gate:'La puerta está cerrada. Observamos desde el sendero con la persona adulta.'})[payload.choice]);
    }
    if(m.step===0&&action==='check')return m.seen.length===3?advance('Viste tres puntos. ¿Qué debe revisar la persona cuidadora?'):result(false,'Observa agua, sombra y puerta antes de decidir.');
    if(m.step===1&&action==='decide')return payload.choice==='notify'?advance('Aviso virtual preparado: revisar el agua y el acceso a la sombra. Tú permaneces fuera de la cerca.'):result(false,'No entres ni empujes a los animales. La persona cuidadora debe revisar agua y acceso a la sombra.');
    if(m.step===2&&action==='record')return payload.choice==='facts'?advance('Registraste hechos: bebedero vacío y sombra inaccesible. No inventaste una enfermedad.'):result(false,'Una observación describe lo que viste. Un diagnóstico necesita evaluación profesional; aquí no sabemos si hay una enfermedad.');
  }
  if(id==='pig') {
    if(m.step===0&&action==='resource') {
      if(!['water','shelter','explore'].includes(payload.choice))return result(false,'Cerrar la ventilación u ofrecer objetos sin revisar no es una mejora segura. Elige recursos adecuados con la persona responsable.');
      m.resources=m.resources.includes(payload.choice)?m.resources.filter(x=>x!==payload.choice):[...m.resources,payload.choice];
      return result(true,`${m.resources.length} de 3 recursos en tu plano: agua, refugio ventilado y exploración segura.`);
    }
    if(m.step===0&&action==='check')return m.resources.length===3?advance('Tu plano reúne recursos para descanso y exploración. Es un esquema; no establece medidas de un corral.'):result(false,'Añade los tres recursos: agua, refugio ventilado y material de exploración elegido por el cuidador.');
    if(m.step===1&&action==='decide')return payload.choice==='exploration'?advance('Explorar y hozar forman parte del comportamiento de los cerdos. La persona cuidadora elige materiales apropiados y seguros.'):result(false,'No lo castigamos por explorar. Hozar es un comportamiento normal; los recursos deben ser seguros y apropiados.');
    if(m.step===2&&action==='record')return payload.choice==='resources'?advance('Guardaste tu plano: agua, protección frente al calor y oportunidades seguras para explorar.'):result(false,'El plano no diagnostica ni cura. Ante un cambio de salud o conducta, avisa al responsable para buscar atención veterinaria.');
  }
  if(id==='poultry') {
    if(m.step===0&&action==='visit') {
      const route=['rules','observe','leave','wash'];
      if(payload.choice!==route[m.sequence.length])return result(false,payload.choice==='kiss'?'No beses aves ni las acerques a la cara. Pueden portar gérmenes aunque parezcan sanas.':'Sigue la ruta: conocer las reglas, observar en la zona permitida, salir y lavarse las manos con agua y jabón.');
      m.sequence.push(payload.choice);return result(true,m.sequence.length===4?'Ruta lista. La higiene protege a las aves y a las personas.':'Bien. Elige el siguiente paso de la visita.');
    }
    if(m.step===0&&action==='check')return m.sequence.length===4?advance('Visita segura preparada. Ahora cuenta huevos en un dibujo, sin manipular aves ni huevos reales.'):result(false,'Completa los cuatro pasos de la visita antes de avanzar.');
    if(m.step===1&&action==='egg') {
      if(![0,2,3,5].includes(payload.index))return result(false,'Ese objeto es una piedra del dibujo, no un huevo. Mira la forma y la etiqueta.');
      if(m.eggs.includes(payload.index))return result(false,'Ya contaste ese huevo. Cada uno se cuenta una sola vez.');
      m.eggs.push(payload.index);m.eggs.sort((a,b)=>a-b);return result(true,`${m.eggs.length} huevos contados en la ilustración.`);
    }
    if(m.step===1&&action==='check')return m.eggs.length===4?advance('Cuatro huevos en el dibujo. Vamos a registrar el conteo ficticio.'):result(false,'Cuenta los cuatro huevos, sin incluir las piedras.');
    if(m.step===2&&action==='record')return Number(payload.quantity)===4&&payload.unit==='huevos'?advance('Registro de práctica: 4 huevos. No representa producción real ni indica que sean aptos para consumir.'):result(false,'El dibujo tiene 4 huevos. Usa esa cantidad y la unidad huevos, no kilos.');
  }
  return result(false,'Sigue el objetivo del paso actual. No hace falta correr: puedes observar y volver a intentar.');
}


// A separate allowlisted ledger preserves v1–v3 short activities without claiming
// they completed the longer cycles introduced here. No earlier save is erased.
const lesson = (title, text, right, wrong, hint) => ({title,text,right,wrong,hint});
const practice = (step,title) => ({practice:step,title});
export const CYCLE_PLANS = {
 maize:[
 lesson('Selecciona la semilla','Comenzamos un maíz de grano ficticio. Antes de sembrar, revisa identidad y destino del material.','Semilla identificada y adecuada al plan local','Granos sin identificar para cualquier terreno','La variedad, el destino y el ambiente importan; no basta con que parezca maíz.'),
 lesson('Prepara suelo y agua','La parcela virtual necesita un suelo que permita crecer a las raíces.','Revisar drenaje y condiciones antes de sembrar','Sembrar sobre un suelo permanentemente encharcado','Preparar empieza por observar suelo y disponibilidad de agua.'),
 practice(0,'Siembra un bloque de maíz'),
 lesson('Acompaña la emergencia','En el tiempo acelerado aparecen brotes; todavía no hay mazorcas.','Observar humedad y emergencia antes de ajustar el cuidado','Cosechar los brotes como si fueran mazorcas','Brotar, crecer y producir grano son etapas diferentes.'),
 lesson('Cuida el crecimiento','Las plantas desarrollan hojas. Encuentras una hoja diferente en la escena.','Registrar el cambio y pedir revisión técnica','Aplicar un producto sin identificar el problema','Una observación no indica por sí sola un tratamiento.'),
 practice(1,'Reconoce floración y polinización'),
 lesson('Espera el desarrollo del grano','Después de la polinización, los granos se desarrollan. Este lote está marcado “aún no listo”.','Continuar observando hasta la madurez prevista','Cosechar porque ya se vieron las primeras flores','Floración no significa cosecha. El destino del maíz cambia el momento de recolección.'),
 lesson('Cosecha y conserva el lote','La ficha ficticia ahora indica madurez evaluada para grano y humedad revisada.','Separar e identificar el lote para manejo y almacenamiento adecuados','Guardar grano húmedo sin comprobar condiciones','Madurez, humedad y almacenamiento se revisan; el juego no prescribe valores.'),
 practice(2,'Registra lo aprendido del ciclo')],
 tomato:[
 lesson('Selecciona tu tomate','Nuestro ejemplo usa una variedad de crecimiento continuo y fruto rojo.','Elegir semilla identificada según variedad y destino','Suponer que todos los tomates son iguales','La variedad condiciona crecimiento, soporte y cosecha.'),
 lesson('Prepara y siembra el semillero','El recipiente virtual permite salida del exceso de agua.','Sembrar y mantener condiciones apropiadas sin encharcar','Tapar el drenaje y dejar la semilla bajo agua','La semilla necesita condiciones de germinación; más agua no siempre es mejor.'),
 lesson('Acompaña la plántula','El tiempo avanza: hay hojas verdaderas y se prepara el traslado al lugar de cultivo.','Adaptar la plántula y revisar el sitio antes del trasplante','Cambiarla bruscamente sin revisar las condiciones','El trasplante debe considerar desarrollo y adaptación, no solo el reloj.'),
 practice(0,'Acompaña el crecimiento con soporte'),
 lesson('Observa agua, hojas y flores','En la escena la tierra conserva humedad y aparecen flores.','Revisar humedad y desarrollo; esperar frutos','Regar de nuevo por costumbre y cosechar flores como tomates','Las flores preceden a los frutos. Observar ayuda a decidir el riego.'),
 lesson('Deja desarrollar los frutos','Los frutos crecen. El destino y la variedad orientan la madurez de cosecha.','Comparar las señales de la ficha de este lote','Usar siempre el color rojo para cualquier variedad','Existen tomates de distintos colores: sigue el caso, no una regla universal.'),
 practice(1,'Cosecha de forma selectiva'),practice(2,'Cuenta y registra tu cosecha')],
 bovine:[
 lesson('Define el ciclo bovino','Seguimos un ejemplo lechero desde nacimiento y crianza hasta registro de leche.','Identificar el animal y su etapa con el equipo responsable','Usar un único manejo para todas las edades','Un ternero y una vaca en producción tienen necesidades diferentes.'),
 lesson('Observa el nacimiento y la crianza','La persona responsable atiende a la cría y comprueba alimentación y bienestar.','Registrar nacimiento y observaciones para el equipo','Dar medicamentos por cuenta propia','La atención de la cría corresponde a personal competente; aquí solo simulamos observación.'),
 lesson('Acompaña el crecimiento','La cría crece y cambia de etapa. Alimentación y manejo se ajustan con supervisión.','Revisar crecimiento y recursos con el responsable','Cambiar toda la alimentación de golpe','Las transiciones necesitan planificación; no damos dietas ni edades universales.'),
 practice(0,'Revisa el entorno del bovino'),practice(1,'Actúa de forma segura ante lo observado'),
 lesson('Comprende la producción lechera','El tiempo simulado salta a una vaca adulta después del parto. La leche requiere manejo e higiene.','Dejar el ordeño y la evaluación al personal capacitado','Suponer que todo bovino produce leche en cualquier etapa','La lactación pertenece a un ciclo biológico; no empieza al terminar un juego.'),
 lesson('Registra la producción sin inventar','La ficha virtual dice “volumen sin medir”.','Anotar que falta medir, sin inventar litros','Convertir el número de animales en litros','Un conteo de animales no mide producción ni garantiza inocuidad de leche.'),
 practice(2,'Cierra el ciclo con hechos y seguimiento')],
 pig:[
 lesson('Planifica el ciclo porcino','Seguimos nacimiento, crianza, crecimiento y salida registrada de un lote ficticio.','Identificar etapa, responsables y condiciones de alojamiento','Mezclar animales sin conocer procedencia ni etapa','La planificación incluye bienestar, identificación y bioseguridad.'),
 lesson('Nacimiento y cuidado temprano','Las crías permanecen bajo atención de la persona responsable.','Observar y registrar necesidades de la madre y las crías','Manipular crías y medicar sin evaluación','Esta escena enseña a observar; no indica procedimientos ni tratamientos.'),
 lesson('Acompaña la transición de crianza','El lote pasa a otra etapa en el tiempo simulado.','Planificar alimentación y adaptación con el equipo','Cambiar de ambiente y alimento sin seguimiento','Las transiciones requieren atención al bienestar y al desarrollo.'),
 practice(0,'Prepara recursos para el crecimiento'),practice(1,'Comprende la exploración y el bienestar'),
 lesson('Sigue el crecimiento del lote','La ficha muestra observaciones de consumo y conducta, pero no un peso medido.','Registrar observaciones y solicitar medición adecuada','Inventar un peso por el tamaño del dibujo','El dibujo no es una balanza ni una evaluación veterinaria.'),
 lesson('Prepara una salida responsable','La etapa de producción termina con revisión por personal competente.','Revisar identificación, bienestar y destino autorizado','Despachar sin registros ni revisión','La salida real exige requisitos locales y personal capacitado; no simulamos sacrificio.'),
 practice(2,'Guarda el registro del ciclo')],
 poultry:[
 lesson('Elige un ciclo de postura','Seguimos una gallina de postura: origen, crianza, crecimiento y registro de huevos.','Identificar origen y finalidad de postura','Suponer que todas las aves producen igual','Postura y producción de carne son recorridos distintos.'),
 practice(0,'Prepara una visita con bioseguridad'),
 lesson('Nacimiento y crianza','En el dibujo llega un pollito. El ambiente y los recursos se revisan según su etapa.','Pedir al responsable que revise abrigo, agua y alimento','Usar el mismo ambiente sin revisar su desarrollo','Un pollito necesita cuidados propios de su etapa; no indicamos temperaturas universales.'),
 lesson('Acompaña el crecimiento','El tiempo avanza hasta una pollita en desarrollo. Aún no hay huevos en esta escena.','Observar crecimiento y conducta sin forzar producción','Exigir huevos desde el nacimiento','La puesta llega tras el desarrollo y depende de múltiples condiciones.'),
 lesson('Observa la fase de postura','La escena cambia a gallinas adultas con nidos.','Revisar agua, alimento y condiciones de bienestar con el responsable','Ignorar recursos porque ya hay huevos','La producción no elimina las necesidades de bienestar.'),
 practice(1,'Cuenta la recolección simulada'),
 lesson('Distingue conteo e inocuidad','Contaste huevos en un dibujo. Su aptitud para consumo no se puede ver aquí.','Dejar selección, higiene y conservación al personal responsable','Afirmar que todos son seguros solo por contarlos','Contar no certifica inocuidad; esta actividad no invita a manipular huevos reales.'),
 practice(2,'Registra la producción ficticia')]
};
export function freshCycles(){return Object.fromEntries(MODULE_IDS.map(id=>[id,{step:0,done:false}]));}
export function cleanCycles(value){
 const clean=freshCycles();
 for(const id of MODULE_IDS){const m=value?.[id],max=CYCLE_PLANS[id].length;
 if(m&&Number.isInteger(m.step)&&m.step>=0&&m.step<=max)clean[id]={step:m.step,done:m.done===true||m.step===max};}
 return clean;
}
export function cycleTransition(state,id,action,payload={}){
 const current=restoreGame(state),plan=CYCLE_PLANS[id];
 if(!plan)return {state:current,ok:false,message:'Elige un ciclo disponible.'};
 const cycle=current.cycles[id];
 if(action==='replay'){current.cycles[id]={step:0,done:cycle.done};return {state:current,ok:true,message:'Nuevo ciclo de práctica. Conservamos los demás recorridos y tus logros anteriores.'};}
 const phase=plan[cycle.step];
 if(!phase)return {state:current,ok:false,message:'Ciclo completado. Puedes volver a practicar.'};
 let next=current,message='';
 if(phase.practice!==undefined){
 const work={...current,modules:{...current.modules,[id]:{...current.modules[id],step:phase.practice}}};
 const result=moduleTransition(work,id,action,payload);
 if(!result.ok)return {...result,state:current};
 next=result.state;message=result.message;
 if(next.modules[id].step===phase.practice)return {state:next,ok:true,message};
 }else{
 if(action!=='cycle-choice'||payload.choice!=='careful')return {state:current,ok:false,message:phase.hint+' Puedes intentarlo de nuevo.'};
 message=phase.hint;
 }
 next.cycles[id]={step:cycle.step+1,done:cycle.done||cycle.step+1===plan.length};
 // Reset only the next interactive exercise on entry, leaving earlier saves intact until used.
 const following=plan[cycle.step+1];
 if(following?.practice!==undefined)next.modules[id]={...freshModules()[id],done:next.modules[id].done,step:following.practice};
 return {state:next,ok:true,message};
}
