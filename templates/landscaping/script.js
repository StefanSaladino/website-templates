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


function focusMenuDestination(link){
 const href=link.getAttribute('href')||'';
 if(!href.startsWith('#'))return false;
 const target=document.getElementById(decodeURIComponent(href.slice(1)));
 if(!target)return false;
 const temporary=!target.hasAttribute('tabindex');
 if(temporary)target.tabIndex=-1;
 target.focus({preventScroll:true});
 if(temporary)target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true});
 return true;
}

mobileMenu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
 closeMenu();
 if(!focusMenuDestination(link))toggle?.focus();
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

/* ANIM-11: controlled detail zoom instead of hover-only interaction. */
const gardenFigure=document.querySelector('[data-motion-pattern="ANIM-11"]'),gardenZoom=gardenFigure?.querySelector('[data-detail-zoom]'),gardenReduced=matchMedia('(prefers-reduced-motion: reduce)');
if(gardenZoom){let selected=false;function render(){const active=selected&&!gardenReduced.matches;gardenFigure.classList.toggle('detail-is-zoomed',active);gardenZoom.setAttribute('aria-pressed',String(active));gardenZoom.textContent=gardenReduced.matches?'Detail zoom off (reduced motion)':active?'Return to full photograph':'Inspect the stonework';gardenZoom.disabled=gardenReduced.matches}gardenZoom.addEventListener('click',()=>{selected=!selected;render()});gardenReduced.addEventListener('change',render);render()}

/* ANIM-04: scroll depth is clamped to 24 px and disabled on phones or reduced motion. */
const gardenHero=document.querySelector('[data-motion-pattern="ANIM-04"]'),gardenDepthButton=gardenHero?.querySelector('[data-garden-depth]'),gardenDepthMedia=matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)');
if(gardenHero&&gardenDepthButton){let enabled=true,frame=null;function paint(){frame=null;const active=enabled&&gardenDepthMedia.matches&&!document.hidden;gardenHero.classList.toggle('garden-depth-on',active);const rect=gardenHero.getBoundingClientRect(),offset=active?Math.max(-24,Math.min(24,(innerHeight/2-(rect.top+rect.height/2))*.055)):0;gardenHero.style.setProperty('--garden-depth-y',offset.toFixed(1)+'px');gardenDepthButton.hidden=!gardenDepthMedia.matches;gardenDepthButton.setAttribute('aria-pressed',String(enabled));gardenDepthButton.textContent=enabled?'Pause image depth':'Resume image depth'}function requestPaint(){if(frame===null)frame=requestAnimationFrame(paint)}gardenDepthButton.addEventListener('click',()=>{enabled=!enabled;requestPaint()});addEventListener('scroll',requestPaint,{passive:true});addEventListener('resize',requestPaint);document.addEventListener('visibilitychange',requestPaint);gardenDepthMedia.addEventListener('change',requestPaint);requestPaint()}

/* Example-only form: provide feedback without retaining, sending or booking. */
const landscapeForm=document.querySelector('[data-landscape-form]');
landscapeForm?.addEventListener('submit',event=>{
  event.preventDefault();
  const status=landscapeForm.querySelector('[data-landscape-form-status]');
  if(status)status.textContent='Preview only: no site walk was booked, no message was sent and no personal information was stored.';
});
