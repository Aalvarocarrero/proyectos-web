import {concepts,languageFor,freshLanguage,checkLanguage} from './languages.mjs';
export function renderLanguage(root,state,id,finish){
 const l=languageFor(id),s=state.language??=freshLanguage();
 const word=i=>`<span lang="${l.id}">${l.words[i]}</span>${l.pinyin?` <span lang="zh-Latn" class="quiet">${l.pinyin[i]}</span>`:''}`;
 const guide=`<div class="word-guide">${concepts.map((c,i)=>`<p><span aria-hidden="true">${c.icon}</span> ${c.label} → <strong>${word(i)}</strong></p>`).join('')}</div>`;
 const bind=(sel,fn)=>root.querySelector(sel)?.addEventListener('click',fn);
 const draw=()=>{renderLanguage(root,state,id,finish);root.querySelector('#language-title')?.focus();};
 if(s.page==='guide'){
 root.innerHTML=`<h4 id="language-title" tabindex="-1">Primero, observa con ayuda</h4><p>${l.note}</p>${guide}<p>Relacionaremos cada palabra con un significado. Puedes consultar esta guía, señalar o pedir que alguien pulse por ti. No hay audio ni evaluación de pronunciación.</p><button type="button" class="action primary" id="language-practice">Probar una palabra</button>`;
 bind('#language-practice',()=>{s.page='practice';draw();});return;
 }
 const result=s.checked&&s.choice?checkLanguage(id,s.step,s.choice):null;
 root.innerHTML=`<p class="eyebrow">PALABRA ${s.step+1} DE ${concepts.length} · ${l.name}</p><h4 id="language-title" tabindex="-1">¿Qué significa ${word(s.step)}?</h4><fieldset><legend>Elige un significado</legend><div class="answer-options">${[...concepts.slice(s.step+1),...concepts.slice(0,s.step+1)].map(c=>`<button type="button" class="answer-option" data-language-choice="${c.id}" aria-pressed="${s.choice===c.id}"><span aria-hidden="true">${c.icon}</span> ${c.label}</button>`).join('')}</div></fieldset><div class="controls"><button type="button" class="action primary" id="language-check">Revisar mi respuesta</button><button type="button" class="action secondary" id="language-retry">Volver a intentar</button></div><div id="language-feedback" class="feedback" role="status" aria-live="polite" aria-atomic="true">${result?.feedback||''}</div><details><summary>Consultar las tres palabras</summary>${guide}</details><div class="controls">${result?.correct?`<button type="button" class="action primary" id="language-next">${s.step<concepts.length-1?'Opcional: siguiente palabra':'Cerrar este pequeño recorrido'}</button>`:''}</div><p class="quiet">Puedes parar con «Terminar por hoy» en cualquier momento. Tres asociaciones no demuestran que domines un idioma.</p>`;
 root.querySelectorAll('[data-language-choice]').forEach(b=>b.addEventListener('click',()=>{s.choice=b.dataset.languageChoice;s.checked=false;renderLanguage(root,state,id,finish);root.querySelector(`[data-language-choice="${s.choice}"]`).focus();}));
 bind('#language-check',()=>{if(!s.choice){root.querySelector('#language-feedback').textContent='Elige un significado o consulta la guía.';return;}s.checked=true;renderLanguage(root,state,id,finish);root.querySelector('#language-check').focus();});
 bind('#language-retry',()=>{s.choice=null;s.checked=false;draw();});
 bind('#language-next',()=>{if(s.step===concepts.length-1){finish();return;}s.step++;s.choice=null;s.checked=false;draw();});
}
