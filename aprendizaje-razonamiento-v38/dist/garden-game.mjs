// Original local-only route-building game. No profiles, timing, scores or telemetry.
export const gardenActivity={unit:'El jardín de los caminos',title:'Construye, prueba y cambia',copy:'Un juego para crear instrucciones y ver qué ocurre. Tú decides cada movimiento.',goal:'Construir una secuencia de movimientos, probarla y revisarla cuando cambia el camino.',duration:'5–10 min orientativos',support:'Puedes señalar y un adulto pulsar',transfer:'Dibuja unas casillas en papel. Una persona señala un camino y otra mueve un dedo. Cambien una casilla y revisen las instrucciones; no hace falta caminar ni reunir objetos.'};
export const directions={up:{symbol:'↑',label:'Arriba',dx:0,dy:-1},left:{symbol:'←',label:'Izquierda',dx:-1,dy:0},down:{symbol:'↓',label:'Abajo',dx:0,dy:1},right:{symbol:'→',label:'Derecha',dx:1,dy:0}};
export const gardenLessons=[
 {id:'try',tab:'1 · Mueve',title:'Lleva a Nilo hasta la flor',instruction:'Toca una flecha. Luego pulsa «Mover un paso» y mira dónde llega Nilo.',goal:[2,3],walls:[],hints:['La flor está en la misma fila que Nilo. Señala hacia qué lado queda.','Una flecha mueve una casilla. Puedes probar dos flechas hacia la derecha.'],coach:'Si las flechas son nuevas, señala una dirección y deja que observe un movimiento. No hace falta conocer las letras: también puede señalar las casillas.',reflection:'¿Una flecha mueve una casilla o todo el camino? Puedes mostrarlo con el dedo.'},
 {id:'plan',tab:'2 · Construye',title:'Prepara un camino antes de mover',instruction:'La flor cambió de sitio. Añade varias flechas y prueba tu plan, un paso cada vez. Hay más de un camino.',goal:[3,1],walls:[[1,2]],hints:['Mira dónde están la flor y la piedra. Puedes rodear la piedra por distintos lados.','Prueba a dibujar un camino por la fila de abajo y después hacia arriba. También hay otras rutas.'],coach:'Antes de mover, pregunta «¿dónde crees que llegará?». Deja que pruebe su idea. Si se atasca, ofrece una pista sobre una sola casilla, no toda la solución.',reflection:'¿Qué flecha cambiarías para hacer otro camino hasta la misma flor?'},
 {id:'change',tab:'3 · Repara',title:'Una piedra cambia el camino',instruction:'Ahora hay una piedra nueva en C4. Prueba las flechas y cambia lo que haga falta. No has perdido nada.',goal:[3,1],walls:[[1,2],[2,3]],hints:['La nueva piedra corta la fila de abajo. Mira un primer paso que la evite.','Desde el inicio, prueba subir por la columna izquierda antes de cruzar hacia la flor.'],coach:'Pregunta qué cambió en el tablero y qué sigue igual. Puedes proponer probar una flecha y detenerte. Revisar una idea importa más que encontrar el camino enseguida.',reflection:'¿Por qué un camino que servía antes puede necesitar un cambio?'}
];
export const cellName=([x,y])=>`${'ABCD'[x]}${y+1}`;
export const newRoute=()=>({commands:[],cursor:0,position:[0,3],trail:[[0,3]],status:'editing',hint:0,guide:false,message:'',undo:null});
export const newGarden=()=>({page:'try',routes:Object.fromEntries(gardenLessons.map(l=>[l.id,newRoute()])),changeVisited:false});
const assertDirection=direction=>{if(typeof direction!=='string'||!Object.hasOwn(directions,direction))throw Error('Dirección desconocida');};
const assertIndex=(route,index)=>{if(!Number.isInteger(index)||index<0||index>=route.commands.length)throw Error('Paso desconocido');};
const copyRun=route=>({commands:[...route.commands],cursor:route.cursor,position:[...route.position],trail:route.trail.map(p=>[...p]),status:route.status,message:route.message});
// An edit replaces the previous snapshot. Execution and replay never change it.
const rememberEdit=route=>{route.undo=copyRun(route);};
export function resetRun(route){route.cursor=0;route.position=[0,3];route.trail=[[0,3]];route.status='editing';route.message='Camino listo para probar desde el inicio.';return route;}
export function addCommand(route,direction){assertDirection(direction);if(route.commands.length>=12){route.message='Este tablero admite hasta 12 flechas. Quita una o borra el camino para probar otra idea; no es una puntuación.';return false;}rememberEdit(route);route.commands.push(direction);resetRun(route);route.message=`Añadiste ${directions[direction].label.toLowerCase()}. Tu camino tiene ${route.commands.length} ${route.commands.length===1?'flecha':'flechas'}.`;return true;}
export function removeCommand(route,index){assertIndex(route,index);rememberEdit(route);route.commands.splice(index,1);resetRun(route);route.message='Quitaste una flecha. Volvemos al inicio para probar el nuevo camino.';}
export function replaceCommand(route,index,direction){assertIndex(route,index);assertDirection(direction);if(route.commands[index]===direction)return false;rememberEdit(route);route.commands[index]=direction;resetRun(route);route.message=`Cambiaste la flecha ${index+1} por ${directions[direction].label.toLowerCase()}. Volvemos al inicio para probar el nuevo camino.`;return true;}
export function clearCommands(route){if(!route.commands.length)return false;rememberEdit(route);route.commands=[];resetRun(route);route.message='Borraste las flechas. Puedes construir otro camino o deshacer el cambio.';return true;}
export function undoEdit(route){if(!route.undo)return false;Object.assign(route,copyRun(route.undo));route.undo=null;return true;}
export function previewNext(route,lesson){
 if(!gardenLessons.includes(lesson))throw Error('Tablero desconocido');
 if(route.status==='arrived'||route.cursor>=route.commands.length)return null;
 const direction=route.commands[route.cursor];assertDirection(direction);
 const dir=directions[direction],from=[...route.position],to=[from[0]+dir.dx,from[1]+dir.dy];
 const reason=to.some(v=>v<0||v>3)?'edge':lesson.walls.some(p=>p[0]===to[0]&&p[1]===to[1])?'wall':null;
 return {from,to,blocked:reason!==null,reason,direction,index:route.cursor};
}
export function moveOne(route,lesson){
 if(!gardenLessons.includes(lesson))throw Error('Tablero desconocido');
 if(route.status==='arrived'||route.status==='blocked')return route;
 if(route.cursor>=route.commands.length){route.status='editing';route.message=route.commands.length?'Se acabaron las flechas antes de llegar. Puedes añadir otra o cambiar el camino.':'Primero toca una flecha para indicar un movimiento.';return route;}
 const {to:next,reason}=previewNext(route,lesson);
 if(reason==='edge'){route.status='blocked';route.message=`Ese paso saldría del tablero. Nilo se queda en ${cellName(route.position)}. Quita o cambia la flecha ${route.cursor+1} y vuelve a probar.`;return route;}
 if(reason==='wall'){route.status='blocked';route.message=`Hay una piedra en ${cellName(next)}. Nilo se queda en ${cellName(route.position)}. Revisa la flecha ${route.cursor+1}: ¿por dónde puedes rodearla?`;return route;}
 route.position=next;route.trail.push([...next]);route.cursor++;
 if(next[0]===lesson.goal[0]&&next[1]===lesson.goal[1]){route.status='arrived';route.message=`Nilo llegó a la flor en ${cellName(next)}. Tu camino funciona.${route.cursor<route.commands.length?' Las flechas que quedan no hicieron falta.':''} Puedes parar aquí o probar otra idea.`;}
 else {route.status='moving';route.message=`Nilo está en ${cellName(next)}. ${route.cursor===route.commands.length?'Se acabaron las flechas; puedes añadir o revisar el camino.':'Pulsa «Mover un paso» cuando quieras continuar.'}`;}
 return route;
}
export function selectGardenPage(game,page){if(![...gardenLessons.map(l=>l.id),'offscreen'].includes(page))throw Error('Parte desconocida');if(page==='change'&&!game.changeVisited){game.routes.change.commands=game.routes.plan.commands.length?[...game.routes.plan.commands]:['right','right','right','up','up'];game.routes.change.message=game.routes.plan.commands.length?'Conservamos tu camino anterior. ¿Sigue funcionando con la piedra nueva?':'Este camino de ejemplo funcionaba sin la piedra nueva. Pruébalo y revísalo.';game.changeVisited=true;}game.page=page;}
