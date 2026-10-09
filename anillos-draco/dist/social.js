(()=>{'use strict';
const root=document.querySelector('.contact-float'),launch=document.getElementById('contact-launch'),panel=document.getElementById('contact-panel'),hint=document.getElementById('contact-hint');
if(!root||!launch||!panel)return;
const key='draco-contact-hint-dismissed';let timer;
function remember(){try{sessionStorage.setItem(key,'1')}catch{}}
function hideHint(){hint.hidden=true;clearTimeout(timer);remember()}
function setOpen(open,focus=false){panel.hidden=!open;launch.setAttribute('aria-expanded',String(open));launch.setAttribute('aria-label',open?'Minimizar contacto por WhatsApp':'Abrir contacto por WhatsApp');hideHint();if(open)document.getElementById('contact-close').focus();else if(focus)launch.focus()}
launch.addEventListener('click',()=>setOpen(panel.hidden));
document.getElementById('contact-close').addEventListener('click',()=>setOpen(false,true));
document.getElementById('contact-hint-close').addEventListener('click',hideHint);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)setOpen(false,true)});
document.addEventListener('pointerdown',e=>{if(!panel.hidden&&!root.contains(e.target))setOpen(false)});
document.getElementById('contact-cart').addEventListener('click',e=>{e.preventDefault();setOpen(false);document.getElementById('bag').click()});
const send=document.getElementById('contact-send');const product=document.querySelector('.product-copy h1');if(product){send.href='https://wa.me/573215587953?text='+encodeURIComponent('Hola, me interesa '+product.textContent+'. '+location.origin+location.pathname+' Quiero consultar disponibilidad y talla.');}
let dismissed=false;try{dismissed=sessionStorage.getItem(key)==='1'}catch{}
if(!dismissed)timer=setTimeout(()=>{if(document.visibilityState==='visible'&&panel.hidden&&!document.querySelector('dialog[open]')&&!root.classList.contains('is-typing')){hint.hidden=false;remember();timer=setTimeout(()=>{hint.hidden=true},6500)}},12000);
window.addEventListener('scroll',()=>{if(!hint.hidden)hideHint()},{passive:true});
document.addEventListener('focusin',e=>{if(e.target.matches('input,textarea,select,[contenteditable="true"]')){root.classList.add('is-typing');hideHint()}});
document.addEventListener('focusout',()=>{setTimeout(()=>{if(!document.activeElement.matches('input,textarea,select,[contenteditable="true"]'))root.classList.remove('is-typing')},0)});
window.addEventListener('pagehide',()=>clearTimeout(timer));
})();