const header = document.querySelector('[data-header]');
const toggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function syncHeader() {
  header?.classList.toggle('scrolled', window.scrollY > 28);
}

function closeMenu() {
  if (!toggle || !mobileMenu) return;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label','Open navigation');
  mobileMenu.hidden = true;
  document.body.classList.remove('menu-open');
}

toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  toggle.setAttribute('aria-label',open?'Open navigation':'Close navigation');
  mobileMenu.hidden = open;
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

mobileMenu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
 closeMenu();if(!focusMenuDestination(link))toggle?.focus();
}));
window.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&toggle?.getAttribute('aria-expanded')==='true'){
  closeMenu();toggle.focus();
 }
});
window.addEventListener('resize',()=>{
 if(window.innerWidth<=820)return;
 const wasOpen=toggle?.getAttribute('aria-expanded')==='true';
 closeMenu();
 if(wasOpen)requestAnimationFrame(()=>document.querySelector('.desktop-nav a')?.focus());
});
window.addEventListener('scroll', syncHeader, { passive: true });
syncHeader();

const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
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
      const speed = Number(item.dataset.parallax || 0.08);
      const rect = item.getBoundingClientRect();
      const centreDelta = (rect.top + rect.height / 2) - viewport / 2;
      const shift = Math.max(-48, Math.min(48, -centreDelta * speed));
      item.style.transform = `translate3d(0, ${shift}px, 0) scale(1.05)`;
    });
    ticking = false;
  };
  const requestTick = () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  };
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);
  requestTick();
}


/* A fictional venue must not imply real reservation availability or collect data. */
const seraDemoForm=document.querySelector('[data-sera-demo-form]');
seraDemoForm?.addEventListener('submit',event=>{
  event.preventDefault();
  const note=seraDemoForm.querySelector('[data-sera-form-note]');
  if(note)note.textContent='Preview only: no table was reserved, no booking availability was checked and no personal information was sent or stored.';
});
