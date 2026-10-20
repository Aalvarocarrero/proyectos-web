// Original bounded contextual-vocabulary pilot. No scores, timers or recorded speech/text.
export const wordActivity = {
  unit: 'La palabra escondida',
  title: 'Una palabra, dos significados',
  copy: 'Lee una escena, elige un significado y toca la parte de la frase que te ayudó. Puedes pedir una pista o salir cuando quieras.',
  goal: 'Reconocer el significado de una palabra en contexto y señalar una pista que lo explica.',
  duration: '5–10 min orientativos',
  age: 'Piloto inicial para 7–8 años, dentro de la franja 6–8',
  support: 'Un adulto puede leer la frase en voz alta; tú puedes señalar. La adaptación a seis años está pendiente de probar.',
  transfer: 'En papel, dibujad dos escenas distintas con la palabra copa y contad qué pista permite distinguirlas. También podéis representar beber y recibir un trofeo con las manos vacías. No hace falta usar cristal ni reunir objetos.',
  recall: 'Sin mirar las escenas, ¿qué dos cosas puede querer decir banco? Cuéntalo, haz gestos o dibújalo. Puedes decir «Todavía no lo sé». No se graba ni se guarda tu explicación.',
  recallAnswer: 'Banco puede ser un asiento o un lugar donde guardamos dinero. Mostrar esta ayuda no comprueba que lo recuerdes sin ayuda.',
  evidence: 'Diseño informado por investigación; esta actividad todavía no se ha evaluado en un estudio propio.'
};
const bank = [
  {id:'seat', label:'Un asiento', description:'Un lugar para sentarse.'},
  {id:'money', label:'Un lugar para guardar dinero', description:'Una entidad donde podemos abrir una cuenta.'}
];
const cup = [
  {id:'trophy', label:'Un trofeo', description:'Un premio que se entrega en una competición.'},
  {id:'vessel', label:'Un recipiente para beber', description:'Un recipiente que puede contener una bebida.'}
];
const plant = [
  {id:'vegetable', label:'Un vegetal', description:'Un ser vivo que puede tener raíces, tallo y hojas.'},
  {id:'floor', label:'Un piso de un edificio', description:'Uno de los niveles de un edificio.'}
];
export const wordScenes = [
  {
    id:'banco-paseo', word:'banco', title:'Después del paseo',
    fragments:[{id:'who',text:'Ana',clue:false},{id:'action',text:'se sentó',clue:true},{id:'place',text:'en el banco después del paseo.',clue:false}],
    meaning:'seat', options:bank,
    hints:['Busca qué hizo Ana. ¿Qué acción necesita un asiento?','«Se sentó» es la pista: aquí banco quiere decir asiento.'],
    coach:'Lee sin destacar la pista. Pregunta qué palabras le ayudaron y deja que señale. Una elección puede cambiarse.',
    feedback:{meaningCorrect:'Aquí banco significa asiento.',meaningIncorrect:'Banco también puede ser un lugar donde guardamos dinero, pero aquí significa asiento: Ana se sentó.',clueCorrect:'«Se sentó» explica por qué se trata de un asiento.',clueIncorrect:'Ese fragmento no distingue los dos significados. La pista es «se sentó»: esa acción necesita un asiento.'}
  },
  {
    id:'banco-cuenta', word:'banco', title:'Una visita en familia',
    fragments:[{id:'who',text:'La familia',clue:false},{id:'place',text:'entró en el banco',clue:false},{id:'purpose',text:'para abrir una cuenta de ahorro.',clue:true}],
    meaning:'money', options:bank,
    hints:['Busca para qué entró la familia. ¿Qué se hace con una cuenta de ahorro?','«Abrir una cuenta de ahorro» indica que este banco es un lugar para guardar dinero.'],
    coach:'Es una escena nueva. No señales la respuesta anterior. Ofrece leer y pregunta si banco quiere decir lo mismo aquí.',
    feedback:{meaningCorrect:'Aquí banco es un lugar para guardar dinero.',meaningIncorrect:'Banco puede ser un asiento, pero aquí es un lugar para guardar dinero: la familia va a abrir una cuenta de ahorro.',clueCorrect:'«Para abrir una cuenta de ahorro» permite distinguir este banco de un asiento.',clueIncorrect:'Ese fragmento no explica por qué banco tiene este significado. La pista es «para abrir una cuenta de ahorro»: se trata de guardar dinero.'}
  },
  {
    id:'copa-agua', word:'copa', title:'En la mesa',
    fragments:[{id:'who',text:'Leo',clue:false},{id:'action',text:'bebió agua',clue:true},{id:'place',text:'de una copa en la mesa.',clue:false}],
    meaning:'vessel', options:cup,
    hints:['Busca qué hizo Leo con la copa. ¿Qué puede contener agua para beber?','«Bebió agua» indica que copa es un recipiente para beber.'],
    coach:'Acepta que señale o explique con un gesto. No hacen falta vasos reales para representar la escena.',
    feedback:{meaningCorrect:'Aquí copa es un recipiente para beber.',meaningIncorrect:'Copa puede ser un trofeo, pero aquí es un recipiente para beber: Leo bebió agua de ella.',clueCorrect:'«Bebió agua» relaciona la copa con un recipiente para una bebida.',clueIncorrect:'Ese fragmento no distingue los significados. La pista es «bebió agua»: aquí la copa contiene una bebida.'}
  },
  {
    id:'copa-equipo', word:'copa', title:'El equipo se reúne',
    fragments:[{id:'who',text:'El equipo',clue:false},{id:'action',text:'recibió una copa',clue:false},{id:'reason',text:'como premio por ganar el torneo.',clue:true}],
    meaning:'trophy', options:cup,
    hints:['Busca por qué recibió el equipo la copa. ¿Qué se entrega por ganar un torneo?','«Como premio por ganar el torneo» indica que esta copa es un trofeo.'],
    coach:'Pregunta qué cambió entre las dos escenas de copa. Puedes leer ambas cuando lo pida, sin exigir una explicación oral.',
    feedback:{meaningCorrect:'Aquí copa significa trofeo.',meaningIncorrect:'Copa puede ser un recipiente para beber, pero aquí significa trofeo: el equipo la recibió como premio por ganar el torneo.',clueCorrect:'«Como premio por ganar el torneo» explica que la copa es un trofeo.',clueIncorrect:'Ese fragmento no permite decidir entre los dos significados. La pista es «como premio por ganar el torneo»: aquí copa es el premio.'}
  },
  {
    id:'planta-maceta', word:'planta', title:'Junto a la ventana',
    fragments:[{id:'who',text:'Mara',clue:false},{id:'place',text:'miró la planta junto a la ventana:',clue:false},{id:'detail',text:'le habían salido dos hojas nuevas.',clue:true}],
    meaning:'vegetable', options:plant,
    hints:['Busca qué le salió a la planta. ¿A qué tipo de planta le crecen hojas?','«Le habían salido dos hojas nuevas» indica que planta es un vegetal.'],
    coach:'No hace falta saber nombres de especies. Basta relacionar hojas que crecen con un vegetal.',
    feedback:{meaningCorrect:'Aquí planta significa vegetal.',meaningIncorrect:'Planta puede ser un piso de un edificio, pero aquí significa vegetal: le crecieron hojas nuevas.',clueCorrect:'«Le habían salido dos hojas nuevas» indica que la planta es un vegetal.',clueIncorrect:'Ese fragmento no distingue los significados. La pista es «le habían salido dos hojas nuevas»: a un vegetal le crecen hojas.'}
  },
  {
    id:'planta-edificio', word:'planta', title:'En la biblioteca',
    fragments:[{id:'who',text:'Iris',clue:false},{id:'action',text:'subió en el ascensor',clue:true},{id:'place',text:'para llegar a esa planta.',clue:false}],
    meaning:'floor', options:plant,
    hints:['Busca cómo llegó Iris. ¿Qué tipo de planta puede ser un destino del ascensor?','«Subió en el ascensor» indica que planta es un piso del edificio.'],
    coach:'Planta como piso puede ser menos familiar según la región. Explica esa variante si hace falta; esto no mide capacidad general.',
    feedback:{meaningCorrect:'Aquí planta significa piso de un edificio.',meaningIncorrect:'Planta puede ser un vegetal, pero aquí significa piso de un edificio: Iris subió en el ascensor hasta ese nivel.',clueCorrect:'«Subió en el ascensor» conecta planta con un nivel del edificio.',clueIncorrect:'Ese fragmento puede situar la escena, pero busca la acción que explica cómo llega Iris: «subió en el ascensor» nos ayuda a pensar en un piso del edificio.'}
  }
];
export const newWordGame = () => ({page:'scene',scene:0,answers:wordScenes.map(()=>({meaning:null,clue:null,checked:false,hint:0})),recallShown:false,offscreen:'untried'});
const current = game => {
  if (!game || !Number.isInteger(game.scene) || game.scene < 0 || game.scene >= wordScenes.length) return null;
  const scene=wordScenes[game.scene], answer=game.answers?.[game.scene];
  return answer && typeof answer==='object' ? {scene,answer} : null;
};
const validMeaning = (scene,id) => scene.options.some(option=>option.id===id);
const validClue = (scene,id) => scene.fragments.some(fragment=>fragment.id===id);
export function wordFeedback(game) {
  const active=current(game);
  if (!active || game.page!=='scene') return '';
  const {scene,answer}=active;
  if (answer.checked!==true) return 'Elige un significado y toca el fragmento de la frase que te ayudó. Después pulsa «Comprobar».';
  if (!validMeaning(scene,answer.meaning) || !validClue(scene,answer.clue)) return 'Falta elegir un significado y una pista de la frase. Puedes señalar ambos antes de comprobar.';
  const meaning=answer.meaning===scene.meaning ? scene.feedback.meaningCorrect : scene.feedback.meaningIncorrect;
  const clue=scene.fragments.find(fragment=>fragment.id===answer.clue).clue ? scene.feedback.clueCorrect : scene.feedback.clueIncorrect;
  return `${meaning} ${clue} Puedes cambiar tu elección, continuar o salir cuando quieras.`;
}
export function chooseMeaning(game,id) {
  const active=current(game);
  if (!active || game.page!=='scene' || !validMeaning(active.scene,id)) return false;
  active.answer.meaning=id; active.answer.checked=false; return true;
}
export function chooseClue(game,id) {
  const active=current(game);
  if (!active || game.page!=='scene' || !validClue(active.scene,id)) return false;
  active.answer.clue=id; active.answer.checked=false; return true;
}
export function checkWordAnswer(game) {
  const active=current(game);
  if (!active || game.page!=='scene') return false;
  if (!validMeaning(active.scene,active.answer.meaning) || !validClue(active.scene,active.answer.clue)) return false;
  active.answer.checked=true; return true;
}
export function showWordHint(game) {
  const active=current(game);
  if (!active || game.page!=='scene') return false;
  const hint=Number.isInteger(active.answer.hint) ? active.answer.hint : 0;
  active.answer.hint=Math.min(active.scene.hints.length,Math.max(0,hint)+1); return true;
}
export function selectWordScene(game,index) {
  if (!game || !Number.isInteger(index) || index<0 || index>=wordScenes.length) return false;
  game.scene=index; game.page='scene'; return true;
}
export function selectWordPage(game,page) {
  if (!game || !['scene','recall','offscreen'].includes(page)) return false;
  game.page=page; return true;
}
export function resetWordGame(game) { Object.assign(game,newWordGame()); return game; }
