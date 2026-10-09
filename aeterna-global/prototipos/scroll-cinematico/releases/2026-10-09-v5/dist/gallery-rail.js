/* Original maternity rail controls; full-screen exploration uses the shared cinematic viewer. */
(()=>{
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const rail=document.getElementById('story-rail'),slides=[...rail.querySelectorAll('.story-slide')],prev=document.getElementById('rail-prev'),next=document.getElementById('rail-next'),count=document.getElementById('rail-count'),progress=document.getElementById('rail-progress');let current=0,frame;
function update(){const left=rail.getBoundingClientRect().left+parseFloat(getComputedStyle(rail).paddingLeft);let best=Infinity;slides.forEach((s,i)=>{const delta=Math.abs(s.getBoundingClientRect().left-left);if(delta<best){best=delta;current=i}});const max=rail.scrollWidth-rail.clientWidth;prev.disabled=rail.scrollLeft<2;next.disabled=rail.scrollLeft>=max-2;count.textContent=String(current+1).padStart(2,'0')+' / 22';progress.style.width=Math.max(100/22,Math.min(100,(rail.scrollLeft+rail.clientWidth)/rail.scrollWidth*100))+'%'}
function go(delta){const i=Math.max(0,Math.min(slides.length-1,current+delta));const padding=parseFloat(getComputedStyle(rail).paddingLeft);rail.scrollTo({left:slides[i].offsetLeft-rail.offsetLeft-padding,behavior:reduced?'instant':'smooth'})}
prev.addEventListener('click',()=>go(-1));next.addEventListener('click',()=>go(1));rail.addEventListener('scroll',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update)},{passive:true});rail.addEventListener('keydown',e=>{if(e.target!==rail)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(e.key==='ArrowRight'?1:-1)}});window.addEventListener('resize',update);update();

})();
