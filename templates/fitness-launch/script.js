const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals = document.querySelectorAll('.reveal');

if (!reduceMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  reveals.forEach((item) => observer.observe(item));
} else {
  reveals.forEach((item) => item.classList.add('is-visible'));
}

if (!reduceMotion) {
  const parallaxItems = [...document.querySelectorAll('[data-parallax]')];
  let ticking = false;
  const updateParallax = () => {
    const viewport = window.innerHeight;
    parallaxItems.forEach((item) => {
      const rect = item.parentElement.getBoundingClientRect();
      if (rect.bottom < -120 || rect.top > viewport + 120) return;
      const speed = Number(item.dataset.parallax || 0.08);
      const offset = (rect.top + rect.height / 2 - viewport / 2) * -speed;
      item.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
  updateParallax();
}

const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.mobile-menu');
if (toggle && menu) {
  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
    document.body.classList.remove('menu-open');
  };
  toggle.addEventListener('click', () => {
    const opening = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(opening));
    menu.hidden = !opening;
    document.body.classList.toggle('menu-open', opening);
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });
}

const form = document.querySelector('.trial-form');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const status=form.querySelector('[data-yard-demo-status]');
    if(status)status.textContent='Preview only: no first session was booked, no class availability was checked and no personal information was sent or stored.';
  });
}


/* ANIM-15: replay the existing six-to-one illustrative format only. */
const yardSection=document.querySelector('[data-motion-pattern="ANIM-15"]');
if(yardSection){const fields=[...yardSection.querySelectorAll('[data-yard-count]')],button=yardSection.querySelector('[data-yard-replay]'),status=yardSection.querySelector('[data-yard-status]'),reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=null;
 const finish=()=>{if(frame!==null)cancelAnimationFrame(frame);frame=null;fields.forEach(el=>el.textContent=el.dataset.yardCount)};
 function play(){finish();if(reduced.matches){status.textContent='Reduced motion: six participants, one coach.';return}if(document.hidden)return;const started=performance.now(),duration=900;status.textContent='Demonstrating group size.';function draw(now){const t=Math.min(1,(now-started)/duration),ease=1-Math.pow(1-t,3);fields.forEach(el=>el.textContent=String(Math.round(Number(el.dataset.yardCount)*ease)));if(t<1)frame=requestAnimationFrame(draw);else{frame=null;status.textContent='Six participants, one coach.'}}frame=requestAnimationFrame(draw)}
 button.addEventListener('click',play);reduced.addEventListener('change',e=>{if(e.matches)finish()});document.addEventListener('visibilitychange',()=>{if(document.hidden)finish()});
}
