(() => {
  'use strict';
  const data=window.MENU_COLLECTION;
  if(!data)return;
  const pages=data.menus.flatMap(menu=>menu.pages.map((page,index)=>({...page,menuId:menu.id,menuTitle:menu.title,number:index+1,count:menu.pages.length})));
  document.querySelectorAll('[data-open-menu]').forEach(link=>{
    const menu=data.menus.find(m=>m.id===link.dataset.openMenu);
    if(menu)link.href=menu.pdf;
  });
  const world=new window.MenuScrollWorld(document.getElementById('menu-world'),data.menus);
  document.addEventListener('click',event=>{
    const a=event.target.closest('[data-open],[data-open-menu]');
    if(!a||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const page=pages.find(p=>p.id===a.dataset.open);
    const menuId=a.dataset.openMenu||page?.menuId;
    if(!menuId)return;
    event.preventDefault();world.open(menuId,page? page.number-1:0,a);
  });

  const root=document.documentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const saver=navigator.connection?.saveData===true;
  const motionButton=document.getElementById('motion-toggle');
  const progress=document.querySelector('.scroll-progress i');
  const hero=document.querySelector('.hero');
  const covers=[...document.querySelectorAll('.cover')];
  const scenes=[...document.querySelectorAll('[data-scene]')];
  const animated=[...document.querySelectorAll('.cover,.scene-page,.scene-atmosphere')];
  let motion=!reduced.matches&&!saver,frame=0;
  const clamp=(n,min=0,max=1)=>Math.min(max,Math.max(min,n));
  function paint(){
    frame=0;const vh=innerHeight;
    progress.style.transform=`scaleX(${clamp(scrollY/Math.max(1,root.scrollHeight-vh))})`;
    if(!motion)return;
    const hr=hero.getBoundingClientRect();
    if(hr.bottom>0&&hr.top<vh){const p=clamp(-hr.top/hr.height);covers.forEach((el,i)=>{el.style.transform=`translateY(${(i===0?-2:2)-p*9}%) rotate(${i===0?9-p*5:-8+p*6}deg) scale(${1+p*.06})`})}
    scenes.forEach((section,sceneIndex)=>{
      const r=section.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;
      const p=clamp((vh-r.top)/(r.height+vh)),entered=clamp(-r.top/Math.max(1,r.height-vh));
      const main=section.querySelector('.primary-page'),back=section.querySelector('.secondary-page');
      const base=sceneIndex===0?3:-4;
      main.style.transform=`translateY(${-44-entered*7}%) rotate(${base+(sceneIndex===0?-4:5)*entered}deg) scale(${.97+p*.07})`;
      back.style.transform=`translateY(${-55+entered*8}%) translateX(${-entered*5}%) rotate(${sceneIndex===0?-8+entered*4:6-entered*4}deg) scale(${.97+p*.06})`;
      section.querySelector('.scene-atmosphere').style.transform=`scale(${1.08+entered*.1}) translateY(${-entered*3}%)`;
    });
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(paint)}
  function setMotion(on){motion=on;root.classList.toggle('motion-disabled',!on);motionButton.lastElementChild.textContent=on?'Motion: on':'Motion: off';motionButton.setAttribute('aria-pressed',String(on));motionButton.setAttribute('aria-label','Cinematic motion');animated.forEach(el=>el.style.removeProperty('transform'));schedule()}
  motionButton.addEventListener('click',()=>setMotion(!motion));
  reduced.addEventListener('change',e=>setMotion(!e.matches&&!saver));
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
  addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0});addEventListener('pageshow',schedule);
  setMotion(motion);
})();
