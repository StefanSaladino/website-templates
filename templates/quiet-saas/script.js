const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('#mobile-nav');

if (menuButton && mobileNav) {
  const setMenu = (open) => {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileNav.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  };

  menuButton.addEventListener('click', () => {
    setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) setMenu(false);
  });
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealTargets = document.querySelectorAll('.logo-strip, .section-intro, .feature-card, .quote-section blockquote, .quote-person, .final-cta');
revealTargets.forEach((node) => node.classList.add('arc-reveal'));

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealTargets.forEach((node) => node.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  revealTargets.forEach((node) => revealObserver.observe(node));
}

if (!reduceMotion) {
  const visual = document.querySelector('.hero-visual');
  let ticking = false;

  const updateProductDepth = () => {
    if (visual && window.innerWidth > 760) {
      const offset = Math.min(window.scrollY * 0.055, 34);
      visual.style.transform = `translate3d(0, ${offset}px, 0)`;
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateProductDepth);
  }, { passive: true });
}


/* ANIM-01 applies the showroom's staged reveal to a real template. */
const arcMotionTarget=document.querySelector('[data-motion-pattern="ANIM-01"]');
const arcMotionControl=document.querySelector('[data-replay-motion="ANIM-01"]');
const arcReduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
let arcMotionTimer;
function stopArcMotion(){clearTimeout(arcMotionTimer);arcMotionTarget?.classList.remove('arc-motion-playing')}
function replayArcMotion(){
  stopArcMotion();
  if(!arcMotionTarget||arcReduceMotion.matches||document.hidden)return;
  void arcMotionTarget.offsetWidth;
  arcMotionTarget.classList.add('arc-motion-playing');
  arcMotionTimer=setTimeout(stopArcMotion,1650);
}
if(arcMotionTarget&&arcMotionControl){
  document.body.classList.add('arc-motion-ready');
  arcMotionControl.addEventListener('click',replayArcMotion);
  requestAnimationFrame(()=>requestAnimationFrame(replayArcMotion));
  arcReduceMotion.addEventListener('change',event=>{if(event.matches)stopArcMotion()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopArcMotion()});
}
