(() => {
  'use strict';
  const form = document.getElementById('feedback-form');
  if (!form) return;
  const language = document.documentElement.lang === 'en' ? 'en' : 'es';
  const words = {
    es: {
      question: n => `Pregunta ${n} de 3`, review: 'Revisar y enviar', next: 'Continuar', reviewNext: 'Volver al resumen',
      blank: 'Sin respuesta', sending: 'Enviando…', send: 'Enviar mi opinión', sent: 'Tu opinión se ha recibido.',
      one: 'Escribe una respuesta en al menos una de las tres preguntas antes de enviar.',
      long: 'Cada respuesta puede tener un máximo de 800 caracteres. Acorta esta respuesta para continuar.',
      name: 'El nombre puede tener un máximo de 100 caracteres.',
      email: 'Introduce un correo válido para recibir una respuesta, o desactiva esa opción.',
      contact: 'Puedes dejar tu nombre y correo para recibir una respuesta.',
      noContact: 'El envío no incluirá nombre ni correo.',
      network: 'No hemos podido confirmar el envío. Tus respuestas siguen aquí. Comprueba la conexión y vuelve a intentarlo; el reintento utilizará la misma referencia para evitar duplicados.',
      server: 'No hemos podido confirmar el envío. Conservamos tus respuestas en esta página. Inténtalo de nuevo en unos momentos.',
      limited: 'Hay demasiados intentos en este momento. Espera un poco antes de volver a enviar. Tus respuestas siguen aquí.',
      unavailable: 'El envío no está disponible ahora. Tus respuestas siguen en esta página; no cierres ni recargues si quieres conservarlas.',
      conflict: 'Ya hay un envío con esta referencia y respuestas diferentes. Revisa un nuevo envío antes de volver a enviarlo.',
      freshReview: 'Revisar un nuevo envío', reviewed: 'Revisa las respuestas antes de enviar un nuevo mensaje.',
      identity: 'Este navegador no ha podido preparar un envío seguro. Actualízalo o prueba con otro navegador. No se ha enviado nada.'
    },
    en: {
      question: n => `Question ${n} of 3`, review: 'Review and send', next: 'Continue', reviewNext: 'Back to review',
      blank: 'No answer', sending: 'Sending…', send: 'Send my feedback', sent: 'Your feedback has been received.',
      one: 'Please answer at least one of the three questions before sending.',
      long: 'Each answer can be up to 800 characters. Shorten this answer to continue.',
      name: 'Your name can be up to 100 characters.',
      email: 'Enter a valid email address to receive a reply, or turn that option off.',
      contact: 'You can leave your name and email address to receive a reply.',
      noContact: 'Your submission will not include a name or email address.',
      network: 'We could not confirm your submission. Your answers are still here. Check your connection and try again; your retry will use the same reference to avoid duplicates.',
      server: 'We could not confirm your submission. Your answers are still on this page. Please try again in a moment.',
      limited: 'There have been too many attempts just now. Please wait a little before trying again. Your answers are still here.',
      unavailable: 'Sending is not available right now. Your answers are still on this page; do not close or reload it if you want to keep them.',
      conflict: 'This reference already belongs to a submission with different answers. Review a new submission before sending again.',
      freshReview: 'Review a new submission', reviewed: 'Review your answers before sending a new message.',
      identity: 'This browser could not prepare a secure submission. Update it or try another browser. Nothing has been sent.'
    }
  }[language];
  const fields = ['useful', 'improve', 'support'];
  const inputs = fields.map(key => document.getElementById(key));
  const steps = [...form.querySelectorAll('[data-step]')];
  const backButton = document.getElementById('back-button');
  const nextButton = document.getElementById('next-button');
  const submitButton = document.getElementById('submit-button');
  const progress = document.getElementById('feedback-progress');
  const progressLabel = document.getElementById('progress-label');
  const progressCount = document.getElementById('progress-count');
  const replyToggle = document.getElementById('replyRequested');
  const contactFields = document.getElementById('contact-fields');
  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const errorBox = document.getElementById('feedback-error');
  const status = document.getElementById('feedback-status');
  let currentStep = 0;
  let editingReview = false;
  let busy = false;
  let completed = false;
  let requestId = null;
  let requestConflict = false;

  function clearError() {
    errorBox.hidden = true;
    errorBox.textContent = '';
    form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
  }

  function showError(message, input) {
    errorBox.textContent = message;
    errorBox.hidden = false;
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      input.focus({ preventScroll: true });
      input.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    } else {
      errorBox.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    }
  }

  function showConflict() {
    showError(words.conflict);
    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'fb-restart';
    restartButton.textContent = words.freshReview;
    restartButton.addEventListener('click', () => {
      // A conflict is not retried. A deliberate review starts a new submission ID.
      requestConflict = false;
      requestId = null;
      editingReview = false;
      showStep(3);
      status.textContent = words.reviewed;
    });
    errorBox.appendChild(restartButton);
  }

  function fillReview() {
    fields.forEach((key, index) => {
      document.getElementById(`review-${key}`).textContent = inputs[index].value.trim() || words.blank;
    });
  }

  function showStep(index, focus = true) {
    if (busy || completed) return;
    currentStep = Math.max(0, Math.min(3, index));
    clearError();
    steps.forEach((step, i) => { step.hidden = i !== currentStep; });
    backButton.hidden = currentStep === 0 && !editingReview;
    nextButton.hidden = currentStep === 3;
    submitButton.hidden = currentStep !== 3;
    nextButton.querySelector('span').textContent = editingReview ? words.reviewNext : words.next;
    const label = currentStep < 3 ? words.question(currentStep + 1) : words.review;
    progressLabel.textContent = label;
    progressCount.textContent = `${String(currentStep + 1).padStart(2, '0')} / 04`;
    progress.setAttribute('aria-valuenow', String(currentStep + 1));
    progress.setAttribute('aria-label', label);
    progress.setAttribute('aria-valuetext', label);
    [...progress.children].forEach((bar, i) => {
      bar.classList.toggle('is-complete', i < currentStep);
      bar.classList.toggle('is-current', i === currentStep);
    });
    if (currentStep === 3) { fillReview(); if (requestConflict) showConflict(); }
    if (focus) {
      const heading = steps[currentStep].querySelector('h2');
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    }
  }

  function updateContact(announce = false) {
    const wantsReply = replyToggle.checked;
    contactFields.hidden = !wantsReply;
    replyToggle.setAttribute('aria-expanded', String(wantsReply));
    nameInput.disabled = busy || !wantsReply;
    emailInput.disabled = busy || !wantsReply;
    emailInput.required = wantsReply;
    if (announce) status.textContent = wantsReply ? words.contact : words.noContact;
  }

  function setBusy(value) {
    busy = value;
    form.setAttribute('aria-busy', String(value));
    form.querySelectorAll('button, input, textarea').forEach(control => { control.disabled = value; });
    updateContact();
    submitButton.querySelector('span').textContent = value ? words.sending : words.send;
    if (value) status.textContent = words.sending;
  }

  function validateCurrentAnswer() {
    const input = inputs[currentStep];
    if (input && input.value.trim().length > 800) {
      showError(words.long, input);
      return false;
    }
    return true;
  }

  function advance() {
    if (busy || completed || !validateCurrentAnswer()) return;
    if (editingReview) {
      editingReview = false;
      showStep(3);
    } else {
      showStep(currentStep + 1);
    }
  }

  function makeId() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    if (!globalThis.crypto?.getRandomValues) throw new Error('secure-random-unavailable');
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  async function submitFeedback(event) {
    event.preventDefault();
    if (busy || completed) return;
    if (currentStep !== 3) { advance(); return; }
    if (requestConflict) { showConflict(); return; }
    clearError();
    const answers = inputs.map(input => input.value.trim());
    const tooLong = answers.findIndex(answer => answer.length > 800);
    if (tooLong !== -1) {
      editingReview = true;
      showStep(tooLong);
      showError(words.long, inputs[tooLong]);
      return;
    }
    if (!answers.some(Boolean)) {
      editingReview = true;
      showStep(0);
      showError(words.one, inputs[0]);
      return;
    }
    const wantsReply = replyToggle.checked;
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    if (wantsReply && name.length > 100) { showError(words.name, nameInput); return; }
    if (wantsReply && (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      showError(words.email, emailInput);
      return;
    }
    try { requestId ||= makeId(); }
    catch (_) { showError(words.identity); return; }
    // The ID belongs to this in-memory submission and is deliberately reused on retries.
    // Contact keys are omitted completely unless a reply is requested.
    const payload = {
      id: requestId,
      language,
      useful: answers[0], improve: answers[1], support: answers[2],
      replyRequested: wantsReply,
      ...(wantsReply ? { name, email } : {}),
      website: document.getElementById('website').value
    };
    setBusy(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload), signal: controller.signal
      });
      let receipt;
      try { receipt = await response.json(); } catch (_) { receipt = null; }
      // A receipt is shown only after an HTTP-success response explicitly confirms this UUID.
      if (!response.ok || receipt?.ok !== true || receipt?.id !== requestId) {
        setBusy(false);
        status.textContent = '';
        if (response.status === 409) { requestConflict = true; showConflict(); return; }
        const message = response.status === 429 ? words.limited
          : [404, 405, 501, 503].includes(response.status) ? words.unavailable : words.server;
        showError(message);
        return;
      }
      completed = true;
      document.getElementById('feedback-receipt').textContent = receipt.id;
      document.getElementById('success-reply').hidden = !wantsReply;
      document.getElementById('success-anonymous').hidden = wantsReply;
      form.hidden = true;
      document.getElementById('progress-wrap').hidden = true;
      document.getElementById('feedback-success').hidden = false;
      status.textContent = words.sent;
      const heading = document.getElementById('success-heading');
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: 'nearest', behavior: 'auto' });
      // No persistent browser storage is used. Clear contact and answers from hidden controls.
      form.reset();
    } catch (_) {
      setBusy(false);
      status.textContent = '';
      showError(words.network);
    } finally {
      clearTimeout(timer);
    }
  }

  inputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      document.getElementById(`count-${fields[index]}`).textContent = `${input.value.length} / 800`;
      if (input.hasAttribute('aria-invalid')) clearError();
    });
  });
  [nameInput, emailInput].forEach(input => input.addEventListener('input', () => {
    if (input.hasAttribute('aria-invalid')) clearError();
  }));
  nextButton.addEventListener('click', advance);
  backButton.addEventListener('click', () => {
    if (editingReview) { editingReview = false; showStep(3); }
    else showStep(currentStep - 1);
  });
  form.querySelectorAll('[data-edit]').forEach(button => button.addEventListener('click', () => {
    editingReview = true;
    showStep(Number(button.dataset.edit));
  }));
  replyToggle.addEventListener('change', () => { clearError(); updateContact(true); });
  form.addEventListener('submit', submitFeedback);
  form.addEventListener('keydown', event => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.isComposing) {
      event.preventDefault();
      if (busy || completed) return;
      if (currentStep < 3) advance();
      else form.requestSubmit();
    }
  });
  updateContact();
  showStep(0, false);
  // A usable database and owner-acknowledged retention job are required before intake.
  fetch('/api/feedback/status',{credentials:'same-origin',cache:'no-store'}).then(async response=>{
    const state=await response.json();if(!response.ok||state.ready!==true)throw Error(state.reason==='domain_required'?'domain':'setup');
    form.hidden=false;document.getElementById('progress-wrap').hidden=false;
  }).catch(error=>{errorBox.hidden=false;errorBox.textContent=error.message==='domain'?(language==='en'?'Feedback is available only on the configured website domain.':'Los comentarios solo están disponibles en el dominio configurado del sitio.'):(language==='en'?'Feedback is not available yet: its storage and retention setup must be completed. No answers have been sent.':'Los comentarios aún no están disponibles: falta completar el almacenamiento y la eliminación programada. No se ha enviado ninguna respuesta.');document.getElementById('feedback-panel').append(errorBox);});
})();
