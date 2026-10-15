// Keep the existing editorial collection in step with the server-published records.
(() => {
 const catalog=globalThis.RohoCatalog; const currency=new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0});
 document.querySelectorAll('.product-card,.hero-product').forEach(card=>{
  const id=card.querySelector('[data-product]')?.dataset.product, p=catalog.products[id];
  card.hidden=!p;if(!p)return;
  const image=card.querySelector('img'); if(image){image.src=p.image;image.removeAttribute('srcset');image.alt=(p.conceptImage?'Imagen conceptual de ':'')+p.name;}
  const name=card.querySelector('h3');if(name)name.textContent=p.name;
  const heroName=card.querySelector('.hero-product-info h2');if(heroName)heroName.textContent=p.name;
  const origin=card.querySelector('.hero-product-info p,.showcase-copy > .product-origin');if(origin)origin.textContent=p.origin;
  const specifications=card.querySelectorAll('.product-specs dd');[p.category,p.origin,p.presentation,p.includes.join(' · ')].forEach((value,index)=>{if(specifications[index])specifications[index].textContent=value;});
  const planned=card.querySelector('.showcase-status p');if(planned)planned.textContent='Prelanzamiento · '+catalog.harvests[p.edition].plannedUnits+' previstas.';
  const amount=card.querySelector('.product-buy strong,.showcase-buy strong');if(amount)amount.textContent=currency.format(p.price)+' COP';
  const detail=card.querySelector('.product-copy > p:not(.product-origin),.showcase-lead');if(detail)detail.textContent=card.classList.contains('product-showcase')?p.description:p.detail;
  const tags=card.querySelector('.coffee-tags');if(tags){tags.replaceChildren();for(const value of [p.variety,p.process,p.presentation]){const item=document.createElement('li');item.textContent=value;tags.append(item);}}
 });
 const count=document.querySelectorAll('.product-card:not([hidden])').length;
 document.getElementById('collectionCount').textContent=`${count} ${count===1?'presentación':'presentaciones'} · Colección publicada`;
 document.querySelectorAll('script[type="application/ld+json"]').forEach(script=>{
  try{const data=JSON.parse(script.textContent);if(data['@graph']){data['@graph']=data['@graph'].filter(node=>node['@type']!=='Product');script.textContent=JSON.stringify(data);}}catch{}
 });
})();
