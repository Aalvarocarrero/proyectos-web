// Content schema: stable IDs, written form, optional transliteration, explicit scope.
export const concepts=[{id:'cat',label:'gato',icon:'🐈'},{id:'dog',label:'perro',icon:'🐕'},{id:'water',label:'agua',icon:'💧'}];
export const languages=[
 {id:'es',name:'Español',native:'Español',words:['gato','perro','agua'],note:'Reconocer palabras escritas en español.'},
 {id:'en',name:'Inglés',native:'English',words:['cat','dog','water'],note:'Tres sustantivos para un primer encuentro escrito.'},
 {id:'pt',name:'Portugués',native:'Português',words:['gato','cão','água'],note:'Estas formas se usan en Portugal y Brasil. «Cachorro» también es habitual para perro en Brasil.'},
 {id:'zh',name:'Chino mandarín',native:'中文',words:['猫','狗','水'],pinyin:['māo','gǒu','shuǐ'],note:'Caracteres simplificados y pinyin con tonos. El pinyin es un apoyo escrito; aquí no se enseña ni evalúa pronunciación.'},
 {id:'it',name:'Italiano',native:'Italiano',words:['gatto','cane','acqua'],note:'Tres sustantivos para un primer encuentro escrito.'},
 {id:'fr',name:'Francés',native:'Français',words:['chat','chien','eau'],note:'Tres sustantivos para un primer encuentro escrito.'}
];
export const languageIds=languages.map(l=>'language-'+l.id);
export const languageFor=id=>languages.find(l=>'language-'+l.id===id);
export const languageActivities=languages.map(l=>({id:'language-'+l.id,stage:'5y',key:'5y:language-'+l.id,area:'Idiomas',type:'digital',label:'6–8 años · iniciación acompañada',kind:'interactive',title:l.name+' · Palabras cercanas',copy:'Un piloto escrito de tres palabras: observa, relaciona y vuelve a probar.',unit:'Tres palabras, una pequeña conversación',goal:'Relacionar tres palabras escritas con sus significados. No es un curso completo ni una prueba de dominio.',duration:'Una ronda breve, sin tiempo obligatorio',support:'Un adulto acompaña y ayuda con la lectura',transfer:'Aparta la pantalla. Dibuja un gato, un perro o un vaso de agua y señala su dibujo al recordar una palabra. No hace falta acercarse a animales ni repetir pronunciaciones.'}));
export const freshLanguage=()=>({page:'guide',step:0,choice:null,checked:false});
export function checkLanguage(id,step,choice){
 const l=languageFor(id);if(!l||!Number.isInteger(step)||step<0||step>=concepts.length||!concepts.some(c=>c.id===choice))throw new Error('Respuesta de idioma desconocida');
 const correct=concepts[step].id===choice;
 return {correct,feedback:(correct?'Sí. ':'Puedes volver a probar. ')+l.words[step]+' significa «'+concepts[step].label+'». '+(correct?'Relacionaste la palabra con su significado.':'Mira la guía y busca ese significado; no cuenta como un fallo ni hay puntuación.')};
}
