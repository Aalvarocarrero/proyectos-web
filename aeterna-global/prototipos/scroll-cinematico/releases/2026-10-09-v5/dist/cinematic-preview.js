(() => {
 'use strict';
 const root=document.documentElement;
 const site=document.querySelector('#aeterna-preview');
 if(!site)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const dataSaver=navigator.connection?.saveData===true;
 let enabled=!reduced.matches&&!dataSaver,frame=0;
 const bar=document.createElement('div');bar.className='preview-motion-bar';
 const label=document.createElement('span');label.textContent='PRIVATE PREVIEW · COMPLETE AETERNA SITE';
 const button=document.createElement('button');button.type='button';
 bar.append(label,button);site.before(bar);
 const track=document.createElement('div');track.className='cinematic-scroll-progress';track.setAttribute('aria-hidden','true');
 const line=document.createElement('i');track.append(line);document.body.append(track);
 const hero=document.querySelector('.ag-hero-image');
 const feature=document.querySelector('.editorial-feature');
 const cards=[...document.querySelectorAll('.ag-work img')];
 const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
 function animate(){
  frame=0;if(!enabled)return;
  const vh=innerHeight;
  if(hero){const r=hero.getBoundingClientRect();if(r.bottom>0&&r.top<vh){const p=clamp((vh-r.top)/(vh+r.height));hero.querySelector('img').style.transform=`scale(${1.04+p*.16}) translateY(${(p-.5)*-3}%)`;}}
  if(feature){const r=feature.getBoundingClientRect();if(r.bottom>0&&r.top<vh){const p=clamp((vh-r.top)/(vh+r.height));feature.querySelector('img').style.transform=`scale(${1.02+p*.22}) translateY(${(p-.5)*-4}%)`;}}
  cards.forEach(img=>{const r=img.getBoundingClientRect();if(r.bottom>0&&r.top<vh){const p=clamp((vh-r.top)/(vh+r.height));img.style.transform=`scale(${1+p*.035})`;}});
  line.style.transform=`scaleX(${clamp(scrollY/Math.max(1,document.documentElement.scrollHeight-vh))})`;
 }
 function schedule(){if(enabled&&!frame)frame=requestAnimationFrame(animate)}
 function setMode(on){enabled=on;root.classList.toggle('cinematic-enabled',on);root.classList.toggle('cinematic-disabled',!on);button.textContent=on?'Motion off':'Motion on';button.setAttribute('aria-label',on?'Turn off cinematic scroll motion':'Enable cinematic scroll motion');button.setAttribute('aria-pressed',String(!on));if(!on){cancelAnimationFrame(frame);frame=0;[hero?.querySelector('img'),feature?.querySelector('img'),...cards].filter(Boolean).forEach(img=>img.style.removeProperty('transform'));}schedule()}
 button.addEventListener('click',()=>setMode(!enabled));
 reduced.addEventListener('change',e=>setMode(!e.matches&&!dataSaver));
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
 addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0});addEventListener('pageshow',schedule);
 setMode(enabled);
})();
