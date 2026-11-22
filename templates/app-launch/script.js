const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

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
function setMenu(open){
 if(!menuToggle||!nav)return;
 const mobile=window.innerWidth<=900;
 const expanded=mobile&&open;
 if(!expanded&&nav.contains(document.activeElement))menuToggle.focus();
 menuToggle.setAttribute('aria-expanded',String(expanded));
 menuToggle.setAttribute('aria-label',expanded?'Close navigation':'Open navigation');
 nav.classList.toggle('is-open',expanded);
 // The navigation is the desktop primary nav, so it is only hidden from
 // keyboard and assistive technology while off-canvas on narrow screens.
 nav.inert=mobile&&!expanded;
 nav.setAttribute('aria-hidden',String(mobile&&!expanded));
 document.body.classList.toggle('menu-open',expanded);
 if(expanded)nav.querySelector('a')?.focus();
}
if(menuToggle&&nav){
 menuToggle.addEventListener('click',()=>setMenu(menuToggle.getAttribute('aria-expanded')!=='true'));
 nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  if(window.innerWidth>900)return;
  setMenu(false);
  if(!focusMenuDestination(link))menuToggle.focus();
 }));
 window.addEventListener('resize',()=>{
  const wasOpen=menuToggle.getAttribute('aria-expanded')==='true';
  setMenu(wasOpen);
  if(window.innerWidth>900&&wasOpen)requestAnimationFrame(()=>nav.querySelector('a')?.focus());
 });
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&menuToggle.getAttribute('aria-expanded')==='true'){
   event.preventDefault();setMenu(false);menuToggle.focus();
  }
 });
 // Initial state must be synchronized before the first keyboard Tab.
 setMenu(false);
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals = document.querySelectorAll('.reveal');

if (reducedMotion) {
  reveals.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  reveals.forEach((item) => observer.observe(item));

  const parallaxItems = document.querySelectorAll('[data-parallax]');
  let ticking = false;
  const updateParallax = () => {
    parallaxItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const strength = Number(item.dataset.parallax || 10);
      const centre = rect.top + rect.height / 2 - window.innerHeight / 2;
      const offset = Math.max(-strength, Math.min(strength, centre * -0.035));
      item.style.setProperty('--parallax-y', `${offset}px`);
    });
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
  updateParallax();
}


/* ANIM-19: hash-backed native-link views maintain browser history. */
const tideViews=document.querySelector('[data-tide-root]');if(tideViews){const panels=[...tideViews.querySelectorAll('[data-tide-view]')],links=[...tideViews.querySelectorAll('[data-tide-link]')],status=tideViews.querySelector('[data-tide-status]'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),ids=['today','tomorrow'];let active='';function render(slug){const value=ids.includes(slug)?slug:'today';active=value;panels.forEach(panel=>{const shown=panel.dataset.tideView===value;panel.hidden=!shown;panel.classList.remove('is-entering');if(shown&&!reduced.matches){void panel.offsetWidth;panel.classList.add('is-entering')}});links.forEach(link=>{if(link.dataset.tideLink===value)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')});status.textContent='Showing '+(value==='today'?'Today':'Tomorrow')+' view; link updates browser history.'}function fromLocation(){const match=location.hash.match(/^#tide-(today|tomorrow)$/);render(match?match[1]:'today')}links.forEach(link=>link.addEventListener('click',event=>{event.preventDefault();const slug=link.dataset.tideLink;if(slug!==active)history.pushState({view:slug},'',link.getAttribute('href'));render(slug);tideViews.scrollIntoView({behavior:'instant',block:'start'})}));addEventListener('popstate',fromLocation);addEventListener('hashchange',fromLocation);reduced.addEventListener('change',()=>panels.forEach(p=>p.classList.remove('is-entering')));tideViews.classList.add('is-enhanced');fromLocation()}
