const toggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const hero = document.querySelector('[data-water-hero]');
const heroImage = hero?.querySelector('.hero-image img');
const header = document.querySelector('[data-header]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const refinementStyles = document.createElement('style');
refinementStyles.textContent = `
  .site-header {
    position: fixed;
    left: 0;
    right: 0;
    background: transparent;
    border-bottom-color: transparent;
    backdrop-filter: blur(0);
    -webkit-backdrop-filter: blur(0);
    transition:
      background-color .28s ease,
      border-color .28s ease,
      backdrop-filter .28s ease;
  }

  .site-header.header-scrolled {
    background: rgba(7,60,70,.93);
    border-bottom-color: rgba(246,251,248,.22);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .hero {
    min-height: clamp(900px, 115svh, 1180px);
  }

  .hero-image img {
    height: 132%;
    margin-top: -16%;
    will-change: transform;
  }

  .process {
    padding-top: 270px;
  }

  .infinity-edge {
    min-height: 880px;
    position: relative;
    overflow: hidden;
    isolation: isolate;
    display: grid;
    grid-template-columns: minmax(0, .82fr) minmax(340px, .48fr);
    align-items: end;
    background: var(--abyss);
    color: #fff;
  }

  .infinity-edge__image {
    position: absolute;
    inset: 0;
    z-index: -3;
  }

  .infinity-edge__image img {
    width: 100%;
    height: 112%;
    object-fit: cover;
    object-position: center 45%;
    filter: saturate(.9) contrast(1.03) brightness(.86);
  }

  .infinity-edge__image::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, rgba(3,45,53,.76) 0%, rgba(3,45,53,.34) 48%, rgba(3,45,53,.08) 76%),
      linear-gradient(0deg, rgba(3,45,53,.72) 0%, transparent 42%);
  }

  .infinity-edge__horizon {
    position: absolute;
    left: 0;
    right: 0;
    top: 53%;
    height: 2px;
    z-index: 1;
    background: linear-gradient(90deg, transparent, #bff7f4 15%, #fff 54%, #91e7e3 83%, transparent);
    box-shadow: 0 0 18px rgba(196,255,250,.55);
  }

  .infinity-edge__horizon::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 2px;
    height: 80px;
    background: linear-gradient(rgba(112,222,220,.18), transparent);
    transform-origin: top;
    animation: infinitySpill 4.8s ease-in-out infinite alternate;
  }

  .infinity-edge__copy {
    padding: 90px clamp(24px, 6vw, 92px);
    max-width: 780px;
  }

  .infinity-edge .section-label {
    color: #a8ebea;
  }

  .infinity-edge h2 {
    margin: 0;
    font: 400 clamp(70px, 8vw, 128px)/.82 Georgia, 'Times New Roman', serif;
    letter-spacing: -.065em;
  }

  .infinity-edge h2 em {
    color: #a8ebea;
    font-weight: 400;
  }

  .infinity-edge__copy > p:not(.section-label) {
    max-width: 570px;
    margin: 28px 0 0;
    color: #d7efed;
    font: 400 16px/1.65 Georgia, 'Times New Roman', serif;
  }

  .infinity-edge__note {
    margin: 0 7vw 76px 0;
    padding: 24px 0 0;
    border-top: 1px solid rgba(255,255,255,.36);
    align-self: end;
  }

  .infinity-edge__note small {
    color: #8ddbd8;
    font-size: 8px;
    font-weight: 850;
    letter-spacing: .14em;
  }

  .infinity-edge__note strong {
    display: block;
    margin-top: 10px;
    font: 400 26px/1.08 Georgia, 'Times New Roman', serif;
  }

  .infinity-edge__note p {
    margin: 15px 0 0;
    color: #c5dddd;
    font: 400 13px/1.55 Georgia, 'Times New Roman', serif;
  }

  .edge-detail {
    position: absolute;
    right: 5%;
    top: 7%;
    z-index: 2;
    width: 190px;
    height: 190px;
    border: 1px solid rgba(255,255,255,.35);
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: rgba(5,55,64,.24);
    backdrop-filter: blur(5px);
  }

  .edge-detail::before {
    content: '';
    width: 120px;
    height: 52px;
    border-top: 2px solid #bff7f4;
    border-right: 2px solid rgba(255,255,255,.28);
    transform: skewY(-8deg);
  }

  .edge-detail span {
    position: absolute;
    bottom: 26px;
    color: #c7efed;
    font-size: 7px;
    font-weight: 850;
    letter-spacing: .14em;
  }

  @keyframes infinitySpill {
    from { opacity: .25; transform: scaleY(.55); }
    to { opacity: .55; transform: scaleY(1.05); }
  }

  @media (max-width: 980px) {
    .hero {
      min-height: 108svh;
    }

    .hero-image img {
      height: 124%;
      margin-top: -12%;
    }

    .process {
      padding-top: 235px;
    }

    .infinity-edge {
      min-height: 840px;
      grid-template-columns: 1fr;
      align-content: end;
    }

    .infinity-edge__image img {
      height: 108%;
    }

    .infinity-edge__copy {
      padding: 150px 20px 38px;
    }

    .infinity-edge__note {
      margin: 0 20px 72px;
      padding-top: 18px;
    }

    .edge-detail {
      width: 125px;
      height: 125px;
      right: 18px;
      top: 24px;
    }

    .edge-detail::before {
      width: 75px;
      height: 36px;
    }

    .edge-detail span {
      bottom: 16px;
    }

    .infinity-edge__horizon {
      top: 48%;
    }
  }

  @media (max-width: 620px) {
    .hero {
      min-height: 104svh;
    }

    .process {
      padding-top: 220px;
    }

    .infinity-edge {
      min-height: 780px;
    }

    .infinity-edge h2 {
      font-size: clamp(54px, 15vw, 78px);
    }

    .infinity-edge__copy > p:not(.section-label) {
      font-size: 14px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .site-header {
      transition: none;
    }

    .infinity-edge__horizon::after {
      animation: none;
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

function syncHeaderState() {
  if (!header) return;
  const shouldBeOpaque =
    window.scrollY > 2 || document.body.classList.contains('menu-open');

  header.classList.toggle('header-scrolled', shouldBeOpaque);
}

function closeMenu() {
  if (!toggle || !mobileMenu) return;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation');
  mobileMenu.hidden = true;
  document.body.classList.remove('menu-open');
  syncHeaderState();
}

toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  toggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
  mobileMenu.hidden = open;
  document.body.classList.toggle('menu-open', !open);
  syncHeaderState();
});

mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 980) closeMenu();
});

window.addEventListener('scroll', syncHeaderState, { passive: true });
syncHeaderState();

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
    const travel = window.innerWidth <= 620 ? 48 : window.innerWidth <= 980 ? 78 : 128;
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
