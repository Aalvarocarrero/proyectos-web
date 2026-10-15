(() => {
 'use strict';
 const header=document.querySelector('[data-navigation]');if(!header)return;
 const button=header.querySelector('[data-nav-toggle]'),nav=header.querySelector('[data-site-nav]');if(!button||!nav)return;
 const english=document.documentElement.lang==='en';
 const mobile=matchMedia('(max-width: 760px)');
 function close(restoreFocus=false){nav.classList.remove('open');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label',english?'Open menu':'Abrir menú');if(restoreFocus)button.focus()}
 function open(){if(!mobile.matches)return;nav.classList.add('open');button.setAttribute('aria-expanded','true');button.setAttribute('aria-label',english?'Close menu':'Cerrar menú')}
 button.addEventListener('click',()=>button.getAttribute('aria-expanded')==='true'?close():open());
 nav.querySelectorAll('a[href]').forEach(link=>{const target=new URL(link.href,location.href);if(target.origin===location.origin&&target.pathname===location.pathname&&!target.hash){link.setAttribute('aria-current','page');if(!link.hasAttribute('lang'))link.setAttribute('data-current-page','')}});
 nav.addEventListener('click',event=>{
  const link=event.target.closest('a');if(!link)return;
  const target=new URL(link.href,location.href),samePage=target.origin===location.origin&&target.pathname===location.pathname&&!target.hash;
  close();
  if(samePage){event.preventDefault();const heading=document.querySelector('main h1')||document.querySelector('main');if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});heading.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}}
 });
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){event.preventDefault();close(true)}});
 document.addEventListener('pointerdown',event=>{if(!header.contains(event.target))close()});
 document.addEventListener('focusin',event=>{if(!header.contains(event.target))close()});
 window.addEventListener('pageshow',()=>close());
 window.addEventListener('pagehide',()=>close());
 window.addEventListener('popstate',()=>close());
 window.addEventListener('hashchange',()=>close());
 if(mobile.addEventListener)mobile.addEventListener('change',()=>close());else mobile.addListener(()=>close());
 close();
})();
