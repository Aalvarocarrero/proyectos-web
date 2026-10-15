(() => {
  'use strict';
  const dialog=document.getElementById('menu-world');
  if(!dialog||!window.MenuScrollWorld)return;
  const collections=[...(window.MENU_COLLECTION?.menus||[]),...(window.GALLERY_COLLECTION?.galleries||[])];
  const world=new window.MenuScrollWorld(dialog,collections);
  document.addEventListener('click',event=>{
    const link=event.target.closest('[data-open-menu],[data-open-gallery]');
    if(!link||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const id=link.dataset.openGallery||link.dataset.openMenu;
    const collection=collections.find(item=>item.id===id);if(!collection)return;
    const requested=Number(link.dataset.galleryIndex||0);
    const index=Number.isFinite(requested)?Math.max(0,Math.min(collection.pages.length-1,Math.floor(requested))):0;
    event.preventDefault();world.open(id,index,link);
  });
})();
