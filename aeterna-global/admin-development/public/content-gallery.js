(() => {
  const node=document.getElementById('content-gallery-data');
  const gallery=window.GALLERY_COLLECTION?.galleries?.find(g=>g.id==='creative-direction');
  if(!node||!gallery)return;
  try {const entries=JSON.parse(node.textContent);entries.forEach((entry,i)=>{if(gallery.pages[i]){Object.assign(gallery.pages[i],entry);const image=new Image();image.onload=()=>{gallery.pages[i].width=image.naturalWidth;gallery.pages[i].height=image.naturalHeight;};image.src=entry.src;}});}catch{}
})();
