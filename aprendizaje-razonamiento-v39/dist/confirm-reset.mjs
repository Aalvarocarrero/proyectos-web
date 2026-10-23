// Transient confirmation belongs to the current view, never to saved progress.
export function confirmReset(button,{message,onConfirm}){
 if(!button||button.hidden)return;
 const document=button.ownerDocument,box=document.createElement('div');
 box.className='reset-confirmation';box.setAttribute('role','group');box.setAttribute('aria-label','Confirmar reinicio');
 const text=document.createElement('p');text.textContent=message;
 const yes=document.createElement('button'),no=document.createElement('button');
 for(const b of [yes,no]){b.type='button';b.className='action secondary';}
 yes.textContent='Sí, empezar de nuevo';yes.dataset.confirmReset='yes';
 no.textContent='Conservar mis elecciones';no.dataset.confirmReset='no';
 box.append(text,yes,no);button.after(box);button.hidden=true;
 no.onclick=()=>{box.remove();button.hidden=false;button.focus();};
 yes.onclick=()=>{box.remove();button.hidden=false;onConfirm();};
 no.focus();
}
