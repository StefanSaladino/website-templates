const header = document.querySelector('[data-header]');
const toggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function syncMobileMenuPosition() {
  if (!header || !mobileMenu || window.innerWidth > 980) return;

  const headerBottom = Math.max(0, Math.round(header.getBoundingClientRect().bottom));

  // The mobile menu is a child of the sticky header. Anchor it to the
  // header itself so the announcement bar is not counted twice at page top.
  mobileMenu.style.position = 'absolute';
  mobileMenu.style.top = '100%';
  mobileMenu.style.height = `calc(100dvh - ${headerBottom}px)`;
}

function closeMenu() {
  if (!toggle || !mobileMenu) return;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation');
  mobileMenu.hidden = true;
  mobileMenu.style.removeProperty('position');
  mobileMenu.style.removeProperty('top');
  mobileMenu.style.removeProperty('height');
  document.body.classList.remove('menu-open');
}

toggle?.addEventListener('click', () => {
  const isOpen = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!isOpen));
  toggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  mobileMenu.hidden = isOpen;
  document.body.classList.toggle('menu-open', !isOpen);

  if (!isOpen) syncMobileMenuPosition();
});

mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 980) {
    closeMenu();
  } else if (toggle?.getAttribute('aria-expanded') === 'true') {
    syncMobileMenuPosition();
  }
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
