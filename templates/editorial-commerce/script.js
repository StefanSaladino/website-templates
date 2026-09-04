const body = document.body;
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');

function closeMenu() {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  mobileMenu.hidden = true;
  body.classList.remove('menu-open');
}

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    if (open) {
      closeMenu();
    } else {
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Close navigation');
      mobileMenu.hidden = false;
      body.classList.add('menu-open');
    }
  });

  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 980) closeMenu(); });
}

const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  reveals.forEach((element) => observer.observe(element));
} else {
  reveals.forEach((element) => element.classList.add('is-visible'));
}

const rail = document.querySelector('[data-product-rail]');
const previous = document.querySelector('[data-rail-prev]');
const next = document.querySelector('[data-rail-next]');
if (rail) {
  const move = (direction) => rail.scrollBy({ left: direction * Math.min(rail.clientWidth * 0.78, 620), behavior: 'smooth' });
  previous?.addEventListener('click', () => move(-1));
  next?.addEventListener('click', () => move(1));
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const heroImage = document.querySelector('.hero-media img');
if (heroImage && !reduceMotion.matches && window.innerWidth > 980) {
  const onScroll = () => {
    const shift = Math.min(window.scrollY * 0.035, 28);
    heroImage.style.setProperty('--hero-shift', `${shift}px`);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
