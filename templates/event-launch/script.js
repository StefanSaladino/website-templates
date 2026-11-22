const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
const siteHeader = document.querySelector('.site-header');
const siteMain = document.querySelector('main');
const siteFooter = document.querySelector('.site-footer');
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
let closeTimer;

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
function openMenu(){
  if(!menuToggle||!mobileMenu)return;
  clearTimeout(closeTimer);
  mobileMenu.hidden=false;
  mobileMenu.inert=false;
  mobileMenu.setAttribute('aria-hidden','false');
  document.body.classList.add('menu-open');
  menuToggle.setAttribute('aria-expanded','true');
  menuToggle.setAttribute('aria-label','Close navigation');
  if(siteHeader)siteHeader.inert=true;
  if(siteMain)siteMain.inert=true;
  if(siteFooter)siteFooter.inert=true;
  requestAnimationFrame(()=>{
    if(menuToggle.getAttribute('aria-expanded')!=='true')return;
    mobileMenu.classList.add('is-open');
    mobileMenu.querySelector('a')?.focus();
  });
}
function closeMenu({immediate=false}={}){
  if(!menuToggle||!mobileMenu)return;
  clearTimeout(closeTimer);
  // Focus must leave the drawer before it becomes inert, even while animating away.
  if(siteHeader)siteHeader.inert=false;
  if(siteMain)siteMain.inert=false;
  if(siteFooter)siteFooter.inert=false;
  if(mobileMenu.contains(document.activeElement))menuToggle.focus();
  mobileMenu.inert=true;
  mobileMenu.setAttribute('aria-hidden','true');
  mobileMenu.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded','false');
  menuToggle.setAttribute('aria-label','Open navigation');
  const hide=()=>{
    if(menuToggle.getAttribute('aria-expanded')!=='true')mobileMenu.hidden=true;
  };
  if(immediate||motionPreference.matches)hide();
  else closeTimer=window.setTimeout(hide,390);
}
menuToggle?.addEventListener('click',()=>{
  menuToggle.getAttribute('aria-expanded')==='true'?closeMenu():openMenu();
});
mobileMenu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  closeMenu();
  if(!focusMenuDestination(link))menuToggle?.focus();
}));
document.addEventListener('keydown',event=>{
  if(menuToggle?.getAttribute('aria-expanded')!=='true')return;
  if(event.key==='Escape'){
    event.preventDefault();
    closeMenu();
    menuToggle.focus();
    return;
  }
  if(event.key!=='Tab')return;
  const links=[...mobileMenu.querySelectorAll('a[href]')].filter(el=>el.getClientRects().length);
  if(!links.length)return;
  const first=links[0],last=links[links.length-1];
  if(event.shiftKey&&document.activeElement===first){
    event.preventDefault();last.focus();
  }else if(!event.shiftKey&&document.activeElement===last){
    event.preventDefault();first.focus();
  }
});
window.addEventListener('resize',()=>{
  if(window.innerWidth<=820)return;
  const wasOpen=menuToggle?.getAttribute('aria-expanded')==='true';
  if(wasOpen){
    closeMenu({immediate:true});
    requestAnimationFrame(()=>document.querySelector('.desktop-nav a')?.focus());
  }
});
motionPreference.addEventListener('change',event=>{
  if(event.matches&&menuToggle?.getAttribute('aria-expanded')==='true'){
    closeMenu({immediate:true});
    menuToggle.focus();
  }
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
  ticketNote.textContent = 'Fictional event preview: no tickets are for sale, no booking was made and no checkout is connected. October 17, 2026 is a past sample date.';
});

/* ANIM-08: replayable whole-line headline, no hidden text before JS. */
const eventHeadline=document.querySelector('[data-motion-pattern="ANIM-08"]'),eventReplay=document.querySelector('[data-replay-motion="ANIM-08"]'),eventReduced=matchMedia('(prefers-reduced-motion: reduce)');let eventTimer;
function stopEventLines(){clearTimeout(eventTimer);eventHeadline?.classList.remove('event-line-playing')}
function playEventLines(){stopEventLines();if(!eventHeadline||eventReduced.matches||document.hidden)return;void eventHeadline.offsetWidth;eventHeadline.classList.add('event-line-playing');eventTimer=setTimeout(stopEventLines,1300)}
if(eventHeadline&&eventReplay){document.body.classList.add('event-motion-ready');eventReplay.addEventListener('click',playEventLines);requestAnimationFrame(()=>requestAnimationFrame(playEventLines));eventReduced.addEventListener('change',e=>{if(e.matches)stopEventLines()});document.addEventListener('visibilitychange',()=>{if(document.hidden)stopEventLines()})}
