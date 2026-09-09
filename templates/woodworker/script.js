const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.mobile-menu');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function closeMenu() {
  if (!toggle || !menu) return;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation');
  menu.hidden = true;
  document.body.classList.remove('menu-open');
}

toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  toggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
  menu.hidden = open;
  document.body.classList.toggle('menu-open', !open);
});

menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
window.addEventListener('resize', () => { if (window.innerWidth > 980) closeMenu(); });

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
} else {
  reveals.forEach((item) => item.classList.add('is-visible'));
}

if (!reduceMotion && window.matchMedia('(min-width: 981px)').matches) {
  const items = [...document.querySelectorAll('[data-parallax]')];
  let ticking = false;
  const update = () => {
    const vh = window.innerHeight;
    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const speed = Number(item.dataset.parallax || 0.02);
      const delta = (rect.top + rect.height / 2) - vh / 2;
      const shift = Math.max(-20, Math.min(20, -delta * speed));
      item.style.transform = `translate3d(0, ${shift}px, 0)`;
    });
    ticking = false;
  };
  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  requestUpdate();
}
