(() => {'use strict';const form=document.querySelector('form.kit-live');if(!form)return;
// Browser-level adult self-declaration, not proof of age or server identity verification.
form.addEventListener('submit',event=>{if(!form.checkValidity()){event.preventDefault();event.stopImmediatePropagation();form.reportValidity()}},true);
})();
