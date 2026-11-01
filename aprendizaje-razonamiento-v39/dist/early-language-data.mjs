// Original parent-facing routines. No baby responses, names or milestones are collected.
import {contextLanguages} from './language-context-data.mjs';
export const earlyStages=[
 {id:'4-6',label:'4–6 meses · orientativo',guide:'Acércate cara a cara cuando esté despierto y cómodo. Ofrece una frase suave y espera; no hace falta que imite ni que mire la pantalla.'},
 {id:'6-9',label:'6–9 meses · orientativo',guide:'Sigue lo que le interesa en ese momento. Puedes mostrar tu mano y nombrarla. Alterna tu voz con silencio; cualquier respuesta o ninguna están bien.'},
 {id:'9-12',label:'9–12 meses · orientativo',guide:'Puedes nombrar un objeto cotidiano seguro que sostengas tú o acompañar un gesto. No pidas una palabra ni conviertas el juego en una prueba.'}
];
export const earlyRoutines=[
 {id:'hello',name:'Un saludo contigo',action:'Ofrece un saludo con tu voz y deja un turno libre.',wait:'Espera sin pedir una respuesta. Puedes acompañar el silencio con una sonrisa y terminar aquí.'},
 {id:'hands',name:'Mis manos, tus manos',action:'Muestra tus propias manos despacio, sin sujetar ni mover las del bebé.',wait:'Sigue su interés. No hace falta que levante las manos, imite el gesto o repita sonidos.'},
 {id:'sounds',name:'Escuchar y responder',action:'Escucha primero. Puedes responder a un sonido espontáneo o simplemente estar presente.',wait:'Usa «te he oído» solo si hubo un sonido. Si está en silencio, acompaña ese silencio; no lo interpretes como un fallo.'},
 {id:'book',name:'Un libro cerca',action:'Sostén tú un libro adecuado y nómbralo si le interesa. El bebé no tiene que mirar ni tocarlo.',wait:'Puedes cerrar el libro o cambiar de juego. No hace falta pasar páginas, señalar ni reconocer la palabra.'}
];
const line=(text,translation,pinyin='',conditional=false)=>({text,translation,pinyin,conditional});
export const earlyLanguages=[
 {id:'es',name:'Español',native:'Español',lines:[
  [line('Hola, peque.','Hola, peque.'),line('Estoy aquí.','Estoy aquí.')],
  [line('¡Hola, manitas!','¡Hola, manitas!'),line('¡Aquí están mis manos!','¡Aquí están mis manos!')],
  [line('Te escucho.','Te escucho.'),line('¡Te he oído!','¡Te he oído!','',true)],
  [line('libro','Libro.'),line('Libro, libro.','Libro, libro.')]
 ]},
 {id:'pt',name:'Portugués',native:'Português · texto do Brasil',voiceLocales:['pt-BR'],lines:[
  [line('Olá, bebê.','Hola, bebé.'),line('Estou aqui.','Estoy aquí.')],
  [line('Olá, mãozinhas!','¡Hola, manitas!'),line('Aqui estão minhas mãos!','¡Aquí están mis manos!')],
  [line('Estou ouvindo.','Estoy escuchando.'),line('Eu ouvi você!','¡Te he oído!','',true)],
  [line('livro','Libro.'),line('Livro, livro.','Libro, libro.')]
 ]},
 {id:'zh',name:'Chino mandarín',native:'中文 · 普通话',lines:[
  [line('你好，宝宝。','Hola, bebé.','Nǐ hǎo, bǎobao.'),line('我在这里。','Estoy aquí.','Wǒ zài zhèlǐ.')],
  [line('小手，小手。','Manitas, manitas.','Xiǎo shǒu, xiǎo shǒu.'),line('你好，小手。','Hola, manitas.','Nǐ hǎo, xiǎo shǒu.')],
  [line('我听见你了。','Te he oído.','Wǒ tīngjiàn nǐ le.',true),line('我们一起说。','Hablemos juntos.','Wǒmen yìqǐ shuō.')],
  [line('书','Libro.','shū'),line('书，书。','Libro, libro.','Shū, shū.')]
 ]},
 {id:'fr',name:'Francés',native:'Français',lines:[
  [line('Bonjour, bébé.','Hola, bebé.'),line('Je suis là.','Estoy aquí.')],
  [line('Coucou, les petites mains !','¡Hola, manitas!'),line('Voilà mes mains !','¡Aquí están mis manos!')],
  [line("Je t’écoute.",'Te escucho.'),line("Je t’ai entendu !",'¡Te he oído!','',true)],
  [line('livre','Libro.'),line('Livre, livre.','Libro, libro.')]
 ]},
 {id:'it',name:'Italiano',native:'Italiano',lines:[
  [line('Ciao, tesoro.','Hola, cariño.'),line('Sono qui.','Estoy aquí.')],
  [line('Ciao, manine!','¡Hola, manitas!'),line('Ecco le mie mani!','¡Aquí están mis manos!')],
  [line('Ti ascolto.','Te escucho.'),line('Ti ho sentito!','¡Te he oído!','',true)],
  [line('libro','Libro.'),line('Libro, libro.','Libro, libro.')]
 ]},
 {id:'en',name:'Inglés',native:'English',lines:[
  [line('Hello, little one.','Hola, peque.'),line("I’m here.",'Estoy aquí.')],
  [line('Hello, little hands!','¡Hola, manitas!'),line('Here are my hands!','¡Aquí están mis manos!')],
  [line("I’m listening.",'Te escucho.'),line('I heard you!','¡Te he oído!','',true)],
  [line('book','Libro.'),line('Book, book.','Libro, libro.')]
 ]}
].sort((a,b)=>['es','en','pt','zh','it','fr'].indexOf(a.id)-['es','en','pt','zh','it','fr'].indexOf(b.id)).map(l=>Object.freeze({...l,words:l.lines.flat().map(x=>x.text),audioRate:.9,audioVolume:.5}));
export const earlyContentReview=Object.freeze({reviewStatus:'Textos originales pendientes de revisión lingüística y de uso con familias',evidenceType:'Adaptación educativa; no ensayo ni certificación de esta app',sourceURL:'https://www2.hse.ie/babies-children/checks-milestones/communication-development/0-12-months/',sourceDate:'2026-11-01',caregiverRole:'Presente, cara a cara; pantalla solo para el adulto',domains:['Lenguaje','Vínculo','Juego'],materials:'Tu voz; libro apropiado solo si lo sostiene un adulto',safety:'Sin objetos pequeños ni auriculares para el bebé; parar ante incomodidad',adaptations:'Silencio y gestos son válidos; no se exige imitación ni mirada'});
export const earlyLanguageFor=id=>earlyLanguages.find(l=>'early-'+l.id===id);
export const earlySelection=(language,activity,stage)=>({language:earlyLanguages.find(l=>l.id===language)||earlyLanguages[0],routine:earlyRoutines.find(r=>r.id===activity)||earlyRoutines[0],stage:earlyStages.find(s=>s.id===stage)||earlyStages[0]});
export function earlyLines(language,activity){const l=earlyLanguages.find(l=>l.id===language),index=earlyRoutines.findIndex(r=>r.id===activity);return l&&index>=0?l.lines[index]:null;}
export function earlyAudioIndex(activity,lineIndex){const index=earlyRoutines.findIndex(r=>r.id===activity);return index>=0&&[0,1].includes(lineIndex)?index*2+lineIndex:null;}
// The book vocabulary already exists in the reviewed 6–8 pilot; fail loudly if it drifts.
for(const l of earlyLanguages){if(l.lines[3][0].text!==contextLanguages.find(c=>c.id===l.id).words[1])throw Error('Early vocabulary mismatch');}
