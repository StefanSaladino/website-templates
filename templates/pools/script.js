const toggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const hero = document.querySelector('[data-water-hero]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function closeMenu() {
  if (!toggle || !mobileMenu) return;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation');
  mobileMenu.hidden = true;
  document.body.classList.remove('menu-open');
}

toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  toggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
  mobileMenu.hidden = open;
  document.body.classList.toggle('menu-open', !open);
});
mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
window.addEventListener('resize', () => { if (window.innerWidth > 980) closeMenu(); });

if (hero && !reduceMotion && window.matchMedia('(pointer:fine)').matches) {
  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const ripple = hero.querySelector('.cursor-ripple');
    if (!ripple) return;
    ripple.style.setProperty('--x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    ripple.style.setProperty('--y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  });
}

const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  reveals.forEach((item) => observer.observe(item));
} else reveals.forEach((item) => item.classList.add('is-visible'));
