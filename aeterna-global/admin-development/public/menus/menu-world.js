/* Shared menu and photographic image adaptation of scroll-world's scene timeline and dwell pattern.
 * Reference: https://github.com/oso95/scroll-world (MIT, Copyright 2026 cyw).
 * This is a collection-specific still-image renderer, not the original video engine.
 * See THIRD-PARTY-NOTICES.txt. No generated clips, paid services or dependencies.
 */
(() => {
  'use strict';
  const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));
  const smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
  // A long reading plateau, followed by one continuous corridor transition.
  function timeline(position,count){
    const p=clamp(position,0,Math.max(0,count-1));
    const index=Math.min(count-1,Math.floor(p));
    const local=p-index;
    return {index,local,travel:smooth((local-.55)/.45),dwell:smooth(local/.55)};
  }
  // A centered foreground never travels or grows outside its fitted rectangle.
  function frame(index,state,count){
    const outgoing=index===state.index,incoming=index===state.index+1;
    if(!outgoing&&!incoming)return {visible:false,opacity:0,x:0,y:0,scale:1,rotate:0,turn:0};
    const t=state.travel;
    if(outgoing)return {visible:true,opacity:1-t,x:0,y:0,scale:(.99+.01*state.dwell)*(1-.04*t),rotate:0,turn:0};
    return {visible:t>0,opacity:t,x:0,y:0,scale:.96+.04*t,rotate:0,turn:0};
  }
  function fit(width,height,ratio,inset=16){
    const w=Math.max(1,Number(width)||1),h=Math.max(1,Number(height)||1),r=Math.max(.001,Number(ratio)||1);
    const padX=Math.min(32,w*.05),padY=Math.min(Math.max(0,Number(inset)||0),h*.45);
    const availableW=Math.max(.1,w-padX*2),availableH=Math.max(.1,h-padY*2);
    const fittedW=Math.min(availableW,availableH*r),fittedH=fittedW/r;
    return {width:fittedW,height:fittedH,left:(w-fittedW)/2,top:(h-fittedH)/2,containerWidth:w,containerHeight:h};
  }
  window.MenuScrollMath={clamp,smooth,timeline,frame,fit};
  class MenuScrollWorld{
    constructor(dialog,menus){
      this.dialog=dialog;this.menus=menus;this.menu=null;this.current=0;this.frameId=0;this.opener=null;this.savedY=0;this.savedBody=null;
      this.reduce=matchMedia('(prefers-reduced-motion: reduce)');this.coarse=matchMedia('(hover: none) and (pointer: coarse)').matches;
      this.enabled=!this.reduce.matches&&navigator.connection?.saveData!==true;this.width=innerWidth;
      const get=id=>document.getElementById(id);
      this.scroller=get('world-scroll');this.track=get('world-track');this.stage=get('world-stage');this.route=get('world-route');this.title=get('world-title');this.label=get('world-page-label');this.announce=get('world-announcement');this.meter=get('world-meter-fill');this.motion=get('world-motion');this.pdf=get('world-pdf');this.closeButton=get('world-close');this.continueButton=get('world-continue');this.inspectButton=get('world-inspect');this.detail=get('world-detail');this.detailCanvas=get('world-detail-canvas');this.detailImage=get('world-detail-image');this.detailTitle=get('world-detail-title');this.detailClose=get('world-detail-close');
      this.scroller.addEventListener('scroll',()=>this.schedule(),{passive:true});
      this.closeButton.addEventListener('click',()=>this.dialog.close());
      this.dialog.addEventListener('close',()=>this.restore());
      this.dialog.addEventListener('cancel',event=>{if(!this.detail.hidden){event.preventDefault();this.closeDetail()}});
      this.motion.addEventListener('click',()=>this.setMotion(!this.enabled));
      this.continueButton.addEventListener('click',()=>{if(this.current===this.menu.pages.length-1)this.dialog.close();else this.jump(this.current+1)});
      this.inspectButton.addEventListener('click',()=>this.openDetail());
      this.detailClose.addEventListener('click',()=>this.closeDetail());
      this.dialog.addEventListener('keydown',event=>{
        if(!this.detail.hidden)return;
        if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();this.jump(this.current+(event.key==='ArrowRight'?1:-1))}
        if(event.key==='Home'){event.preventDefault();this.jump(0)}
        if(event.key==='End'){event.preventDefault();this.jump(this.menu.pages.length-1)}
      });
      this.reduce.addEventListener('change',event=>this.setMotion(!event.matches&&navigator.connection?.saveData!==true));
      const resize=()=>{if(!this.dialog.open)return;const current=this.current;this.layout();this.jump(current,false)};
      addEventListener('resize',resize,{passive:true});
      if(window.visualViewport)window.visualViewport.addEventListener('resize',resize,{passive:true});
      if(typeof ResizeObserver!=='undefined'){this.resizeObserver=new ResizeObserver(()=>{if(this.dialog.open&&(this.scroller.clientWidth!==this.viewportWidth||this.scroller.clientHeight!==this.height))resize()});this.resizeObserver.observe(this.scroller)}
      addEventListener('orientationchange',()=>{if(this.dialog.open){const current=this.current;this.layout();this.jump(current,false)}});
      addEventListener('pagehide',()=>{cancelAnimationFrame(this.frameId);this.frameId=0});
    }
    element(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text)el.textContent=text;return el}
    build(menu){
      this.stage.replaceChildren();this.route.replaceChildren();this.scenes=[];this.dots=[];
      menu.pages.forEach((page,index)=>{
        const noun=menu.noun||'page';
        const scene=this.element('article','world-scene');scene.setAttribute('aria-label',`${page.title}, ${noun} ${index+1} of ${menu.pages.length}`);
        const background=this.element('div','world-atmosphere');background.setAttribute('aria-hidden','true');
        const poster=this.element('div','world-poster');poster.style.setProperty('--photo-ratio',String((page.width||1600)/(page.height||2134)));
        const image=this.element('img');image.alt=page.alt||`${menu.title}: ${page.title}, ${noun} ${index+1}`;image.width=page.width||1600;image.height=page.height||2134;image.decoding='async';image.loading=index<2?'eager':'lazy';poster.append(image);
        const copy=this.element('div','world-scene-copy');copy.append(this.element('span','world-scene-number',`${String(index+1).padStart(2,'0')} / ${String(menu.pages.length).padStart(2,'0')}`),this.element('h3','',page.title));
        if(page.caption)copy.append(this.element('p','world-image-credit',page.caption));
        const inspect=this.element('button','world-inline-read',menu.type==='gallery'?'View this image +':'Read this page +');inspect.type='button';inspect.addEventListener('click',()=>{this.updateUI(index);this.openDetail()});copy.append(inspect);
        scene.append(background,poster,copy);this.stage.append(scene);this.scenes.push({scene,poster,background,copy,image,page});
        const dot=this.element('button','world-dot',String(index+1).padStart(2,'0'));dot.type='button';dot.setAttribute('aria-label',`Go to ${page.title}, ${noun} ${index+1}`);dot.addEventListener('click',()=>this.jump(index));this.route.append(dot);this.dots.push(dot);
      });
    }
    open(menuId,index=0,opener=null){
      const menu=this.menus.find(m=>m.id===menuId);if(!menu||!menu.pages.length)return false;
      const wasOpen=this.dialog.open;
      if(!wasOpen){
        this.savedY=window.scrollY;
        this.savedBody={position:document.body.style.position,top:document.body.style.top,width:document.body.style.width};
        document.body.style.position='fixed';document.body.style.top=`-${this.savedY}px`;document.body.style.width='100%';document.body.classList.add('viewer-open');
      }else this.closeDetail();
      this.menu=menu;this.opener=opener;
      const gallery=menu.type==='gallery';
      this.title.textContent=menu.title;this.pdf.hidden=gallery||!menu.pdf;
      if(menu.pdf&&!gallery){this.pdf.href=menu.pdf;this.pdf.download=menu.pdf.split('/').at(-1)}
      else{this.pdf.removeAttribute('href');this.pdf.removeAttribute('download')}
      const kicker=this.dialog.querySelector('.world-bar .eyebrow');if(kicker)kicker.textContent=gallery?menu.notice:'Aeterna / AUD illustrative prices';
      this.closeButton.textContent=gallery?'Close gallery':'Close menu';
      this.inspectButton.textContent=gallery?'View in detail +':'Read in detail +';
      this.motion.setAttribute('aria-label',gallery?'Cinematic gallery motion':'Cinematic menu motion');
      this.scroller.setAttribute('aria-label',gallery?'Cinematic gallery journey. Scroll down to travel through the images.':'Cinematic menu journey. Scroll down to travel through the pages.');
      this.detail.setAttribute('aria-label',gallery?'Full-size photograph or artwork':'Full-size menu page');
      this.dialog.dataset.menu=menuId;this.dialog.dataset.kind=gallery?'gallery':'menu';
      this.build(menu);if(!wasOpen)this.dialog.showModal();this.layout();this.jump(index,false);this.scroller.focus({preventScroll:true});return true;
    }
    layout(){
      this.width=innerWidth;this.viewportWidth=Math.max(1,Math.min(this.scroller.clientWidth||innerWidth,innerWidth));
      this.height=Math.max(1,this.scroller.clientHeight||innerHeight-150);this.step=this.height*(innerWidth<=760?1.35:1.55);
      this.dialog.classList.toggle('world-compact',this.height<280);
      this.dialog.classList.toggle('world-reduced',!this.enabled);this.motion.textContent=this.enabled?'Motion: on':'Motion: off';this.motion.setAttribute('aria-pressed',String(this.enabled));
      this.dialog.style.setProperty('--world-height',`${this.height}px`);
      this.detail.style.top=`${this.scroller.offsetTop}px`;
      this.scenes.forEach(item=>{
        const ratio=(item.page.width||1600)/(item.page.height||2134);
        const inset=this.height<280?12:Math.max(74,(item.copy.offsetHeight||56)+32);
        const box=fit(this.viewportWidth,this.height,ratio,inset);item.fit=box;
        item.poster.style.width=`${box.width}px`;item.poster.style.height=`${box.height}px`;
        item.poster.style.left='50%';item.poster.style.top='50%';
      });
      this.track.style.height=this.enabled?`${Math.max(0,this.menu.pages.length-1)*this.step+this.height}px`:'auto';
      this.schedule();
    }
    setMotion(value){const current=this.current;this.enabled=value;if(!this.dialog.open)return;this.layout();this.jump(current,false)}
    jump(index,animate=true){
      if(!this.menu)return;
      const target=clamp(index,0,this.menu.pages.length-1);
      const top=this.enabled?target*this.step:this.scenes[target].scene.offsetTop;
      this.scroller.scrollTo({top,behavior:animate&&this.enabled?'smooth':'auto'});this.current=target;this.updateUI(target);this.schedule();
    }
    updateUI(index){
      this.current=index;const page=this.menu.pages[index];
      this.label.textContent=`${String(index+1).padStart(2,'0')} / ${String(this.menu.pages.length).padStart(2,'0')} · ${page.title}`;
      const announcement=`${this.menu.title}, ${page.title}, ${this.menu.noun||'page'} ${index+1} of ${this.menu.pages.length}`;
      if(this.announce.textContent!==announcement)this.announce.textContent=announcement;
      this.dots.forEach((dot,i)=>{dot.setAttribute('aria-current',i===index?'step':'false');dot.classList.toggle('is-active',i===index)});
      this.continueButton.textContent=index===this.menu.pages.length-1?(this.menu.type==='gallery'?'Back to the site':'Back to collection'):'Continue';
      const active=this.dots[index],ar=active.getBoundingClientRect(),rr=this.route.getBoundingClientRect();
      if(ar.left<rr.left||ar.right>rr.right){const offset=ar.left<rr.left?ar.left-rr.left-8:ar.right-rr.right+8;this.route.scrollTo({left:Math.max(0,this.route.scrollLeft+offset),behavior:this.enabled?'smooth':'auto'})}
      // Adjacent images are decoded before their transition, while far scenes stay lazy.
      this.scenes.forEach((item,i)=>{if(Math.abs(i-index)<=1){item.image.src=item.page.src;item.image.loading='eager';item.background.style.backgroundImage=`url("${item.page.src}")`}});
    }
    schedule(){if(this.dialog.open&&!this.frameId)this.frameId=requestAnimationFrame(()=>this.paint())}
    paint(){
      this.frameId=0;if(!this.dialog.open||!this.menu)return;
      const count=this.menu.pages.length,y=this.scroller.scrollTop;
      let index=0;
      if(this.enabled){
        const state=timeline(y/this.step,count);index=Math.min(count-1,state.index+(state.travel>.5?1:0));
        this.scenes.forEach((item,i)=>{
          const f=frame(i,state,count);item.scene.style.opacity=String(f.opacity);item.scene.style.visibility=f.visible?'visible':'hidden';item.scene.style.zIndex=String(10+i);
          item.scene.setAttribute('aria-hidden',String(i!==index));item.scene.inert=i!==index;
          item.poster.style.transform=`scale(${f.scale})`;
          const backgroundOpacity=i===state.index?1-state.travel:state.travel;
          item.background.style.opacity=String(backgroundOpacity);item.background.style.transform=`scale(${1.1+state.dwell*.10}) translateY(${-state.dwell*2}%)`;
          item.copy.style.opacity=String(i===index?1:0);
        });
        this.meter.style.transform=`scaleX(${count>1?clamp((state.index+state.travel)/(count-1)):1})`;
      }else{
        this.scenes.forEach((item,i)=>{
          item.scene.style.opacity='1';item.scene.style.visibility='visible';item.scene.style.zIndex='auto';item.scene.setAttribute('aria-hidden','false');item.scene.inert=false;item.poster.style.transform='none';item.copy.style.opacity='1';item.background.style.transform='none';
          if(item.scene.offsetTop<=y+this.height*.45)index=i;
        });
        this.meter.style.transform=`scaleX(${count>1?index/(count-1):1})`;
      }
      if(index!==this.current)this.updateUI(index);
    }
    openDetail(){
      const page=this.menu.pages[this.current];this.detailImage.src=page.src;this.detailImage.alt=page.alt||`${this.menu.title}, ${page.title}`;this.detailTitle.textContent=page.title;this.detail.hidden=false;this.scroller.inert=true;this.route.inert=true;this.continueButton.inert=true;this.inspectButton.inert=true;this.detailCanvas.scrollTo(0,0);this.detailClose.focus();
    }
    closeDetail(){this.detail.hidden=true;this.scroller.inert=false;this.route.inert=false;this.continueButton.inert=false;this.inspectButton.inert=false;this.scroller.focus({preventScroll:true})}
    restore(){
      cancelAnimationFrame(this.frameId);this.frameId=0;this.closeDetail();document.body.classList.remove('viewer-open');
      if(this.savedBody)Object.assign(document.body.style,this.savedBody);
      window.scrollTo({top:this.savedY,behavior:'instant'});this.opener?.focus({preventScroll:true});
    }
  }
  window.MenuScrollWorld=MenuScrollWorld;
  window.CinematicScrollWorld=MenuScrollWorld;
})();
