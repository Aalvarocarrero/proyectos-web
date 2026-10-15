(() => {
const toggle = document.querySelector('.floating-social-toggle');
const menu = document.getElementById('aeterna-social-menu');
if (!toggle || !menu) return;
function setOpen(open, restoreFocus = false) {
 menu.hidden = !open;
 toggle.setAttribute('aria-expanded', String(open));
 toggle.setAttribute('aria-label', open ? 'Close social media links' : 'Open social media links');
 if (restoreFocus) toggle.focus();
}
toggle.addEventListener('click', () => setOpen(menu.hidden));
document.addEventListener('keydown', event => {
 if (event.key === 'Escape' && !menu.hidden) setOpen(false, true);
});
document.addEventListener('click', event => {
 if (!menu.hidden && !event.target.closest('.floating-contact')) setOpen(false);
});
})();
