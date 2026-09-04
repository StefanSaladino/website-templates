const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
let closeTimer;

function openMenu() {
  clearTimeout(closeTimer);
  mobileMenu.hidden = false;
  document.body.classList.add('menu-open');
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Close navigation');
  requestAnimationFrame(() => mobileMenu.classList.add('is-open'));
}

function closeMenu({ immediate = false } = {}) {
  clearTimeout(closeTimer);
  mobileMenu.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  if (immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    mobileMenu.hidden = true;
    return;
  }
  closeTimer = window.setTimeout(() => { mobileMenu.hidden = true; }, 390);
}

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  isOpen ? closeMenu() : openMenu();
});

mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 820 && menuToggle?.getAttribute('aria-expanded') === 'true') closeMenu({ immediate: true });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const demoTicket = document.querySelector('[data-demo-ticket]');
const ticketNote = document.querySelector('[data-ticket-note]');
demoTicket?.addEventListener('click', () => {
  ticketNote.textContent = 'Demo template only — ticket checkout is not connected.';
});
