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


function focusMenuDestination(link){
 const href=link.getAttribute('href')||'';
 if(!href.startsWith('#'))return false;
 const target=document.getElementById(decodeURIComponent(href.slice(1)));
 if(!target)return false;
 const temp=!target.hasAttribute('tabindex');
 if(temp)target.tabIndex=-1;
 target.focus({preventScroll:true});
 if(temp)target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true});
 return true;
}

menu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
 closeMenu();if(!focusMenuDestination(link))toggle?.focus();
}));
window.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&toggle?.getAttribute('aria-expanded')==='true'){
  closeMenu();toggle.focus();
 }
});
window.addEventListener('resize',()=>{
 if(window.innerWidth<=980)return;
 const wasOpen=toggle?.getAttribute('aria-expanded')==='true';
 closeMenu();
 if(wasOpen)requestAnimationFrame(()=>document.querySelector('.desktop-nav a')?.focus());
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

/* ANIM-20: real finite, keyboard/touch-friendly carousel without autoplay. */
const craftGallery=document.querySelector('[data-motion-pattern="ANIM-20"]');
if(craftGallery){const slides=[...craftGallery.querySelectorAll('[data-craft-slide]')],dots=[...craftGallery.querySelectorAll('[data-craft-jump]')],previous=craftGallery.querySelector('[data-craft-prev]'),next=craftGallery.querySelector('[data-craft-next]'),status=craftGallery.querySelector('[data-craft-status]'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),names=['Tiered planter reference','Display ledge reference','Original joinery illustration'];let current=0;function show(i){current=Math.max(0,Math.min(slides.length-1,i));slides.forEach((slide,n)=>{slide.hidden=n!==current;slide.classList.remove('is-arriving')});dots.forEach((dot,n)=>dot.setAttribute('aria-pressed',String(n===current)));previous.disabled=current===0;next.disabled=current===slides.length-1;status.textContent='Study '+(current+1)+' of '+slides.length+': '+names[current];if(!reduced.matches){void slides[current].offsetWidth;slides[current].classList.add('is-arriving')}}previous.addEventListener('click',()=>show(current-1));next.addEventListener('click',()=>show(current+1));dots.forEach((dot,n)=>dot.addEventListener('click',()=>show(n)));reduced.addEventListener('change',e=>{if(e.matches)slides.forEach(s=>s.classList.remove('is-arriving'))});craftGallery.classList.add('craft-carousel-ready');show(0)}

/* Demo-only submission feedback: no network, backend or local persistence. */
const demoRequest=document.querySelector('[data-demo-request]');
demoRequest?.addEventListener('submit',event=>{
  event.preventDefault();
  const status=demoRequest.querySelector('[data-demo-request-status]');
  if(status)status.textContent='No request was sent or stored. GRAIN & GABLE is fictional; this form is a design preview only.';
});
