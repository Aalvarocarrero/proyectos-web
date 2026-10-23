import {partsActivity} from './number-parts.mjs';
import {quantityActivity} from './quantity-workshop.mjs';
import {biologyLabActivity} from './biology-lab.mjs';
import {chemistryLabActivity} from './chemistry-lab.mjs';
import {balanceActivity} from './balance.mjs';
import {contextActivities} from './language-context-data.mjs';
import {argumentActivity} from './arguments.mjs';
import {compositionActivity} from './composition.mjs';
import {scienceActivities} from './science-games.mjs';
import {reflectionActivity} from './reflection.mjs';
// Editorial classification only; legacy IDs are persistence keys, not ages.
import {languageActivities,languageFor} from './languages.mjs';
import {stages} from './logic.mjs';
import {extraActivities} from './activities.mjs';
import {gardenActivity} from './garden-game.mjs';
import {wordActivity} from './word-game.mjs';
import {comparisonUnit} from './comparison-unit.mjs';
export const areas=['Lenguaje','Matemáticas','Ciencia','Creatividad','Pensamiento crítico','Convivir y emociones','Desarrollo personal','Idiomas'];
const rows=[
 ['18m','original',5,'guide'],['2y','original',3,'guide'],
 ['3y','original',1,'digital'],['3y','extra',1,'digital'],
 ['5y','garden',4,'digital'],['5y','words',0,'digital'],['5y','original',0,'digital'],['5y','extra',0,'digital'],
 ['7y','original',6,'digital'],['7y','extra',2,'digital'],['7y','unit',2,'unit'],
 ['12y','original',4,'digital'],['12y','extra',4,'digital']
];
export const catalog=rows.map(([stage,id,area,type])=>{
 const base=stages.find(s=>s.id===stage);
 const activity=id==='original'?base:id==='extra'?extraActivities[stage]:id==='garden'?gardenActivity:id==='words'?wordActivity:comparisonUnit;
 const preview=stage==='7y'&&id==='original'?{cardPreview:'Elige qué llevar con 8 fichas y explica qué priorizaste.',cardMeta:'9–12 años orientativos · apoyo disponible · puedes parar cuando quieras.'}:{};
 return Object.freeze({...base,...activity,...preview,stage,id,key:`${stage}:${id}`,area:areas[area],type});
});
catalog.push(partsActivity,quantityActivity,biologyLabActivity,chemistryLabActivity,balanceActivity,...contextActivities,argumentActivity,compositionActivity,reflectionActivity,...languageActivities,...scienceActivities);
export const entriesFor=(stage,area='all')=>catalog.filter(a=>a.stage===stage&&(area==='all'||a.area===area));
export const statusLabel=phase=>({active:'En curso',paused:'En pausa',finished:'Cerrada por hoy'}[phase]||'Sin empezar');
export const typeLabel=type=>({guide:'Guía de adulto · fuera de pantalla',digital:'Reto digital',unit:'Unidad familiar'}[type]);
export function stageCount(stage){const rows=entriesFor(stage);return ['digital','guide','unit'].map(type=>{const n=rows.filter(a=>a.type===type).length;return n?`${n} ${type==='digital'?(n===1?'reto digital':'retos digitales'):type==='guide'?'guía de adulto':'unidad familiar'}`:'';}).filter(Boolean).join(' · ');}

export function activityTitle(activity){const language=languageFor(activity.id);return (language?language.name+' · ':'')+activity.unit;}
