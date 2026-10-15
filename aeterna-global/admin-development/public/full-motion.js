(() => {
  'use strict';
  const root=document.documentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const saver=navigator.connection?.saveData===true;
  let enabled=!reduced.matches&&!saver,frame=0;
  const progress=document.createElement('div');
  progress.className='studio-progress';progress.setAttribute('aria-hidden','true');
  const bar=document.createElement('i');progress.appendChild(bar);document.body.appendChild(progress);
  const toggle=document.createElement('button');toggle.type='button';toggle.className='studio-motion';
  toggle.setAttribute('aria-label','Cinematic page motion');document.body.appendChild(toggle);
  // Only artwork moves. The reading order, touch scrolling and controls remain native.
  const scenes=[...document.querySelectorAll('.editorial-feature img,.story-hero img')].map(img=>{
    img.classList.add('studio-scroll-image');return {img,container:img.closest('.editorial-feature,.story-hero')};
  });
  const panels=[...document.querySelectorAll('.ag-service,.ag-work article,.ae-campaign .grid article')];
  panels.forEach(el=>el.classList.add('studio-drift-card'));
  const hero=document.querySelector('.ag-hero');
  const front=document.querySelector('.studio-photo-frame');
  const back=document.querySelector('.studio-photo-companion');
  const clamp=(n,min=0,max=1)=>Math.min(max,Math.max(min,n));
  function paint(){
    frame=0;
    const vh=innerHeight;
    bar.style.transform=`scaleX(${clamp(scrollY/Math.max(1,root.scrollHeight-vh))})`;
    if(!enabled)return;
    if(hero&&front&&back){
      const r=hero.getBoundingClientRect();
      if(r.bottom>0&&r.top<vh){
        const p=clamp(-r.top/Math.max(1,r.height));
        front.style.transform=`translateY(${-p*22}px) rotate(${-7+p*4}deg) scale(${1+p*.035})`;
        back.style.transform=`translateY(${p*18}px) rotate(${8-p*4}deg)`;
      }
    }
    panels.forEach(el=>{
      const r=el.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;
      const p=clamp((vh-r.top)/Math.max(1,vh*.75));
      el.style.setProperty('--studio-drift',`${(1-p)*16}px`);
    });
    scenes.forEach(({img,container})=>{
      const r=container.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;
      const p=clamp((vh-r.top)/(vh+r.height));
      img.style.setProperty('--studio-y',`${(p-.5)*24}px`);
      img.style.setProperty('--studio-scale',String(1.055+p*.018));
    });
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(paint)}
  function setMotion(on){
    enabled=on;root.classList.toggle('studio-motion-disabled',!on);
    toggle.textContent=on?'Motion: on':'Motion: off';toggle.setAttribute('aria-pressed',String(on));
    [front,back].filter(Boolean).forEach(el=>el.style.removeProperty('transform'));
    panels.forEach(el=>el.style.removeProperty('--studio-drift'));
    scenes.forEach(({img})=>{img.style.removeProperty('--studio-y');img.style.removeProperty('--studio-scale')});
    schedule();
  }
  toggle.addEventListener('click',()=>setMotion(!enabled));
  reduced.addEventListener('change',()=>setMotion(!reduced.matches&&!saver));
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
  addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0});addEventListener('pageshow',schedule);
  setMotion(enabled);
})();
