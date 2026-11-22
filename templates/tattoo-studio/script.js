const header=document.querySelector('[data-header]');const toggle=document.querySelector('.menu-toggle');const mobileMenu=document.querySelector('.mobile-menu');const hero=document.querySelector('[data-hero]');const heroImage=hero?.querySelector('.hero-media img');const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;function syncHeader(){header?.classList.toggle('is-scrolled',window.scrollY>10||document.body.classList.contains('menu-open'))}function closeMenu(){if(!toggle||!mobileMenu)return;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');mobileMenu.hidden=true;document.body.classList.remove('menu-open');syncHeader()}toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));toggle.setAttribute('aria-label',open?'Open navigation':'Close navigation');mobileMenu.hidden=open;document.body.classList.toggle('menu-open',!open);syncHeader()});
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
    closeMenu();
    toggle.focus();
  }
});
window.addEventListener('resize',()=>{
  if(innerWidth<=980)return;
  const wasOpen=toggle?.getAttribute('aria-expanded')==='true';
  closeMenu();
  if(wasOpen)requestAnimationFrame(()=>document.querySelector('.desktop-nav a')?.focus());
});window.addEventListener('scroll',syncHeader,{passive:true});syncHeader();if(hero&&heroImage&&!reducedMotion){let frame=null;const update=()=>{frame=null;const rect=hero.getBoundingClientRect();const progress=Math.max(0,Math.min(1,-rect.top/Math.max(rect.height,1)));const travel=innerWidth<=620?42:innerWidth<=980?70:150;heroImage.style.transform=`translate3d(0,${progress*travel}px,0) scale(${innerWidth>980?1.06:1.025})`};const request=()=>{if(frame!==null)return;frame=requestAnimationFrame(update)};addEventListener('scroll',request,{passive:true});addEventListener('resize',request);update()}const reveals=document.querySelectorAll('.reveal');if('IntersectionObserver'in window&&!reducedMotion){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.classList.add('is-visible');observer.unobserve(entry.target)})},{threshold:.12});reveals.forEach(item=>observer.observe(item))}else{reveals.forEach(item=>item.classList.add('is-visible'))}
/* ANIM-18: once-on-entry plus user replay, without hiding static work. */
const tattooGallery=document.querySelector('[data-motion-pattern="ANIM-18"]'),tattooReplay=tattooGallery?.querySelector('[data-rhythm-replay]'),tattooReduced=matchMedia('(prefers-reduced-motion: reduce)');let tattooTimer;
function stopTattooRhythm(){clearTimeout(tattooTimer);tattooGallery?.classList.remove('is-rhythm-playing')}
function playTattooRhythm(){stopTattooRhythm();if(!tattooGallery||tattooReduced.matches||document.hidden)return;void tattooGallery.offsetWidth;tattooGallery.classList.add('is-rhythm-playing');tattooTimer=setTimeout(stopTattooRhythm,1550)}
if(tattooGallery&&tattooReplay){document.body.classList.add('work-rhythm-ready');tattooReplay.addEventListener('click',playTattooRhythm);tattooReduced.addEventListener('change',e=>{if(e.matches)stopTattooRhythm()});document.addEventListener('visibilitychange',()=>{if(document.hidden)stopTattooRhythm()});if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){playTattooRhythm();observer.disconnect()}}},{threshold:.15});observer.observe(tattooGallery.querySelector('[data-rhythm-piece]')||tattooGallery)}}

/* Example inquiry only: no customer data is saved or sent and no appointment is created. */
const blacklineForm=document.querySelector('[data-blackline-demo-form]');
blacklineForm?.addEventListener('submit',event=>{
  event.preventDefault();
  const status=blacklineForm.querySelector('[data-blackline-demo-status]');
  if(status)status.textContent='Preview only: no tattoo appointment was booked, no deposit was taken and no personal information was sent or stored.';
});
