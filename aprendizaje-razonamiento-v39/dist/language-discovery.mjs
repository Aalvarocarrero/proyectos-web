import {earlyLanguages,earlyStages} from './early-language-data.mjs';
// Session-only navigation choices. Never merge these with saved age/progress keys.
export function discoverySelection(value={}){
 return {language:earlyLanguages.some(l=>l.id===value?.language)?value.language:'es',stage:earlyStages.some(s=>s.id===value?.stage)?value.stage:'4-6'};
}
export const discoveryLanguageName=id=>id==='pt'?'Portugués de Brasil':earlyLanguages.find(l=>l.id===id)?.name||'Español';
export function discoveryMarkup(selection){
 const current=discoverySelection(selection),name=discoveryLanguageName(current.language),stage=earlyStages.find(s=>s.id===current.stage);
 return `<section id="home-language-discovery" class="language-discovery" aria-labelledby="discovery-title"><header><p class="eyebrow">IDIOMAS · PRIMER AÑO · ADULTO PRESENTE</p><h2 id="discovery-title" tabindex="-1">Seis lenguas. Un momento contigo.</h2><p>Elige idioma y etapa para compartir palabras, tu voz y una pausa. La pantalla es para el adulto.</p></header><div class="discovery-choices"><fieldset><legend>1 · Idioma</legend><div class="discovery-languages">${earlyLanguages.map(l=>`<button type="button" data-discovery-language="${l.id}" aria-pressed="${l.id===current.language}"><strong>${discoveryLanguageName(l.id)}</strong><span lang="${l.id}">${l.native}</span></button>`).join('')}</div></fieldset><fieldset><legend>2 · Etapa orientativa</legend><div class="discovery-stages">${earlyStages.map(s=>`<button type="button" data-discovery-stage="${s.id}" aria-pressed="${s.id===current.stage}">${s.label.split(' · ')[0]}</button>`).join('')}</div></fieldset><div class="discovery-selected"><p>Vas a preparar <strong>${name} · ${stage.label.split(' · ')[0]}</strong></p><p class="quiet">Cuatro rutinas por idioma. Esta elección dura solo en esta pestaña. Voz opcional del dispositivo, sin reproducción automática.</p><button type="button" class="action secondary" id="discovery-start" data-early-language="${current.language}" data-early-stage="${current.stage}">Preparar ${name} <span aria-hidden="true">→</span></button></div></div></section>`;
}
export function bindDiscovery(root,selection){
 const section=root.querySelector('#home-language-discovery');if(!section)return;
 function select(kind,value){Object.assign(selection,discoverySelection({...selection,[kind]:value}));const active=`[data-discovery-${kind}="${value}"]`;section.outerHTML=discoveryMarkup(selection);bindDiscovery(root,selection);root.querySelector('#home-language-discovery '+active)?.focus();}
 section.querySelectorAll('[data-discovery-language]').forEach(b=>b.onclick=()=>select('language',b.dataset.discoveryLanguage));
 section.querySelectorAll('[data-discovery-stage]').forEach(b=>b.onclick=()=>select('stage',b.dataset.discoveryStage));
}
