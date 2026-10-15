(() => {
  'use strict';
  // Only the two existing menu identifiers are accepted. URLs never supply content.
  window.AeternaMenuLinks=(world,menus)=>{
    if(!window.location?.href||!window.history?.pushState||typeof URL==='undefined')return null;
    const history=window.history,dialog=world.dialog;
    const known=new Set(menus.map(menu=>menu.id));
    let pendingBack=false,queuedOpen=null,queuedSync=false;
    const currentURL=()=>new URL(window.location.href);
    const relative=url=>url.pathname+url.search+url.hash;
    const selected=url=>url.searchParams.getAll('menu').length===1&&known.has(url.searchParams.get('menu'))?url.searchParams.get('menu'):null;
    const baseURL=url=>{const base=new URL(url.href);base.searchParams.delete('menu');return base};
    const cleanState=()=>{const state=history.state&&typeof history.state==='object'?{...history.state}:{};delete state.aeternaMenu;return state};
    const menuState=base=>({...cleanState(),aeternaMenu:{base:relative(base)}});
    const openerFor=id=>document.querySelector(`[data-open-menu="${id}"]`);
    function replaceBase(){const url=baseURL(currentURL());history.replaceState(cleanState(),'',relative(url))}
    function open(id,index=0,opener=null){
      if(!known.has(id))return false;
      if(pendingBack||(!dialog.open&&document.body.classList.contains('viewer-open'))){queuedOpen={id,index,opener};return true}
      const url=currentURL(),base=baseURL(url);url.searchParams.set('menu',id);
      // Switching within the modal replaces its entry; each opening adds only one.
      if(dialog.open&&selected(currentURL()))history.replaceState(menuState(base),'',relative(url));
      else history.pushState(menuState(base),'',relative(url));
      return world.open(id,index,opener||openerFor(id));
    }
    function sync(){
      const id=selected(currentURL());
      if(id){
        if(!dialog.open&&document.body.classList.contains('viewer-open')){queuedSync=true;return}
        if(!dialog.open||world.menu?.id!==id)world.open(id,0,openerFor(id));
      }
      else if(dialog.open)dialog.close();
    }
    function flushQueuedOpen(){if(queuedOpen){const request=queuedOpen;queuedOpen=null;open(request.id,request.index,request.opener)}}
    dialog.addEventListener('close',()=>{
      if(queuedSync){queuedSync=false;sync();flushQueuedOpen();return}
      const url=currentURL();if(!selected(url)){flushQueuedOpen();return}
      if(history.state?.aeternaMenu?.base===relative(baseURL(url))){pendingBack=true;history.back()}
      else replaceBase();
    });
    window.addEventListener('popstate',()=>{
      pendingBack=false;sync();
      flushQueuedOpen();
    });
    window.addEventListener('pageshow',()=>sync());
    const initial=currentURL(),id=selected(initial);
    if(id){
      const base=baseURL(initial);
      // A direct email visit gets a same-page collection entry behind the modal.
      // Back closes it, Forward reopens it, and the next Back follows normal history.
      if(history.state?.aeternaMenu?.base!==relative(base)){
        history.replaceState(cleanState(),'',relative(base));
        history.pushState(menuState(base),'',relative(initial));
      }
      sync();
    }
    return {open};
  };
})();
