const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-menu');
const backdrop = document.querySelector('[data-menu-backdrop]');
const closeButton = document.querySelector('[data-menu-close]');

function setMenu(open) {
  if (!menuButton || !menu || !backdrop) return;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  if (open) {
    menu.hidden = false;
    backdrop.hidden = false;
    requestAnimationFrame(() => { menu.classList.add('is-open'); backdrop.classList.add('is-open'); });
  } else {
    menu.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    window.setTimeout(() => { if (menuButton.getAttribute('aria-expanded') !== 'true') { menu.hidden = true; backdrop.hidden = true; } }, 460);
  }
  document.body.classList.toggle('menu-open', open);
}
menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
closeButton?.addEventListener('click', () => setMenu(false));
backdrop?.addEventListener('click', () => setMenu(false));
menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });
window.addEventListener('resize', () => { if (window.innerWidth > 900) setMenu(false); });

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals = document.querySelectorAll('.reveal');
if (reducedMotion || !('IntersectionObserver' in window)) {
  reveals.forEach((el) => el.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: .12 });
  reveals.forEach((el) => observer.observe(el));
}
