// Reviewed lexical forms; sources and selected senses: docs/FUENTES_IDIOMAS_V27.md.
export const contextConcepts=[{id:'apple',label:'manzana',hint:'Busca la fruta con tallo y hoja.'},{id:'book',label:'libro',hint:'Busca las páginas unidas por el lomo.'},{id:'bread',label:'pan',hint:'Busca la pieza de pan; sus marcas están en la corteza.'}];
export const contextLanguages=[
 {id:'es',name:'Español',words:['manzana','libro','pan']},
 {id:'en',name:'Inglés',words:['apple','book','bread']},
 {id:'pt',name:'Portugués',words:['maçã','livro','pão']},
 {id:'zh',name:'Chino mandarín',words:['苹果','书','面包'],pinyin:['píngguǒ','shū','miànbāo']},
 {id:'it',name:'Italiano',words:['mela','libro','pane']},
 {id:'fr',name:'Francés',words:['pomme','livre','pain']}
];
export const contextIds=contextLanguages.map(l=>'context-'+l.id);
export const contextFor=id=>contextLanguages.find(l=>'context-'+l.id===id);
export const contextActivities=contextLanguages.map(l=>({id:'context-'+l.id,stage:'5y',key:'5y:context-'+l.id,area:'Idiomas',type:'digital',label:'6–8 años · con adulto',kind:'interactive',title:l.name+' · Una cesta de palabras',unit:l.name+' · Una cesta de palabras',copy:'Segundo recorrido independiente: tres palabras nuevas, imágenes y situaciones ilustradas.',goal:'Relacionar manzana, libro y pan con imágenes y usarlos como etiquetas en escenas. No evalúa dominio ni pronunciación.',duration:'A tu ritmo · seis encuentros opcionales',support:'Un adulto puede leer, señalar o pulsar contigo',transfer:'Aparta la pantalla. Dibuja una cesta con una manzana, un libro y pan. Añade una etiqueta que quieras recordar; consulta la guía si hace falta. No necesitas comida real ni pronunciar las palabras.'}));
export const contextRounds=[{kind:'match',target:'apple'},{kind:'match',target:'book'},{kind:'match',target:'bread'},{kind:'scene',target:'book',scene:'Un rincón para leer',text:'En este rincón vamos a mirar páginas. ¿Qué palabra pondrías junto al libro abierto?'},{kind:'scene',target:'apple',scene:'La cesta de fruta',text:'En esta cesta buscamos la manzana entera. ¿Qué palabra etiqueta esa fruta?'},{kind:'scene',target:'bread',scene:'La mesa de merienda',text:'En esta mesa queremos etiquetar el pan. ¿Qué palabra colocarías junto a él?'}];

export function contextOptions(step){if(!Number.isInteger(step)||step<0||step>=contextRounds.length)throw Error('Invalid context step');const offset=[0,2,1,1,2,0][step];return [...contextConcepts.slice(offset),...contextConcepts.slice(0,offset)];}
