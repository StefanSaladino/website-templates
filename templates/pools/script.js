const toggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const hero = document.querySelector('[data-water-hero]');
const heroImage = hero?.querySelector('.hero-image img');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const refinementStyles = document.createElement('style');
refinementStyles.textContent = `
  .hero {
    min-height: clamp(900px, 115svh, 1180px);
  }

  .hero-image img {
    height: 118%;
    margin-top: -9%;
    will-change: transform;
  }

  .process {
    padding-top: 270px;
  }

  @media (max-width: 980px) {
    .hero {
      min-height: 108svh;
    }

    .hero-image img {
      height: 114%;
      margin-top: -7%;
    }

    .process {
      padding-top: 235px;
    }
  }

  @media (max-width: 620px) {
    .hero {
      min-height: 104svh;
    }

    .process {
      padding-top: 220px;
    }
  }
`;
document.head.appendChild(refinementStyles);

const poolShell = document.querySelector('.pool-shell');
const poolWater = document.querySelector('.pool-water');
const depthLine = document.querySelector('.depth-line');

if (poolShell && poolWater && depthLine) {
  poolShell.setAttribute(
    'd',
    'M0 83 H1400 V398 H1110 C1010 398 941 363 842 343 H585 C393 343 301 300 0 284 Z'
  );
  poolWater.setAttribute(
    'd',
    'M0 83 H1400 V372 H1110 C1011 372 940 337 842 317 H585 C394 317 302 274 0 258 Z'
  );
  depthLine.setAttribute(
    'd',
    'M370 50 V294 M760 50 V332 M1210 50 V386'
  );
}

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

if (hero && !reduceMotion && window.matchMedia('(pointer:fine)').matches) {
  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const ripple = hero.querySelector('.cursor-ripple');
    if (!ripple) return;
    ripple.style.setProperty('--x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    ripple.style.setProperty('--y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  });
}

if (hero && heroImage && !reduceMotion) {
  let parallaxFrame = null;

  const updateHeroParallax = () => {
    parallaxFrame = null;
    const rect = hero.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height)));
    const travel = window.innerWidth <= 620 ? 26 : window.innerWidth <= 980 ? 42 : 70;
    heroImage.style.transform = `translate3d(0, ${progress * travel}px, 0) scale(1.035)`;
  };

  const requestHeroParallax = () => {
    if (parallaxFrame !== null) return;
    parallaxFrame = requestAnimationFrame(updateHeroParallax);
  };

  window.addEventListener('scroll', requestHeroParallax, { passive: true });
  window.addEventListener('resize', requestHeroParallax);
  updateHeroParallax();
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
} else {
  reveals.forEach((item) => item.classList.add('is-visible'));
}
