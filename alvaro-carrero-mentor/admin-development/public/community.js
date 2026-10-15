let printState=null;
function expandDays(){document.querySelectorAll('.day-card').forEach(d=>d.open=true)}
function beforePrint(){if(printState===null)printState=[...document.querySelectorAll('.day-card')].map(d=>[d,d.open]);expandDays()}
function afterPrint(){if(printState){printState.forEach(([d,open])=>d.open=open);printState=null}}
document.querySelectorAll('[data-expand]').forEach(b=>b.addEventListener('click',expandDays));
document.querySelectorAll('[data-print]').forEach(b=>b.addEventListener('click',()=>{beforePrint();window.print()}));
window.addEventListener('beforeprint',beforePrint);window.addEventListener('afterprint',afterPrint);
