const toggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
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
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 980) closeMenu();
});

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

/* ANIM-11: controlled detail zoom instead of hover-only interaction. */
const gardenFigure=document.querySelector('[data-motion-pattern="ANIM-11"]'),gardenZoom=gardenFigure?.querySelector('[data-detail-zoom]'),gardenReduced=matchMedia('(prefers-reduced-motion: reduce)');
if(gardenZoom){let selected=false;function render(){const active=selected&&!gardenReduced.matches;gardenFigure.classList.toggle('detail-is-zoomed',active);gardenZoom.setAttribute('aria-pressed',String(active));gardenZoom.textContent=gardenReduced.matches?'Detail zoom off (reduced motion)':active?'Return to full photograph':'Inspect the stonework';gardenZoom.disabled=gardenReduced.matches}gardenZoom.addEventListener('click',()=>{selected=!selected;render()});gardenReduced.addEventListener('change',render);render()}
