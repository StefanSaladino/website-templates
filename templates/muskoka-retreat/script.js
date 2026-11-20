const header=document.querySelector('[data-header]');
const toggle=document.querySelector('.menu-toggle');
const mobileMenu=document.querySelector('.mobile-menu');
const hero=document.querySelector('[data-hero]');
const heroImage=hero?.querySelector('.hero-media img');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function syncHeader(){
  if(!header)return;
  header.classList.toggle('is-scrolled',window.scrollY>12||document.body.classList.contains('menu-open'));
}
function closeMenu(){
  if(!toggle||!mobileMenu)return;
  toggle.setAttribute('aria-expanded','false');
  toggle.setAttribute('aria-label','Open navigation');
  mobileMenu.hidden=true;
  document.body.classList.remove('menu-open');
  syncHeader();
}
toggle?.addEventListener('click',()=>{
  const open=toggle.getAttribute('aria-expanded')==='true';
  toggle.setAttribute('aria-expanded',String(!open));
  toggle.setAttribute('aria-label',open?'Open navigation':'Close navigation');
  mobileMenu.hidden=open;
  document.body.classList.toggle('menu-open',!open);
  syncHeader();
});
mobileMenu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
window.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu()});
window.addEventListener('resize',()=>{if(window.innerWidth>980)closeMenu()});
window.addEventListener('scroll',syncHeader,{passive:true});
syncHeader();

if(hero&&heroImage&&!reducedMotion){
  let frame=null;
  const updateParallax=()=>{
    frame=null;
    const rect=hero.getBoundingClientRect();
    const progress=Math.max(0,Math.min(1,-rect.top/Math.max(rect.height,1)));
    const travel=window.innerWidth<=620?44:window.innerWidth<=980?72:180;
    heroImage.style.transform=`translate3d(0, ${progress*travel}px, 0) scale(${window.innerWidth>980?1.06:1.025})`;
  };
  const requestParallax=()=>{
    if(frame!==null)return;
    frame=requestAnimationFrame(updateParallax);
  };
  window.addEventListener('scroll',requestParallax,{passive:true});
  window.addEventListener('resize',requestParallax);
  updateParallax();
}

const reveals=document.querySelectorAll('.reveal');
if('IntersectionObserver'in window&&!reducedMotion){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  },{threshold:.12});
  reveals.forEach(item=>observer.observe(item));
}else{
  reveals.forEach(item=>item.classList.add('is-visible'));
}

/* ANIM-10: an active story index with no scroll hijack. */
const retreatNav=document.querySelector('[data-motion-pattern="ANIM-10"]');
if(retreatNav){
 const links=[...retreatNav.querySelectorAll('[data-retreat-chapter]')],ids=['house','stay','guide'],meter=retreatNav.querySelector('.retreat-chapter-meter span');
 function current(i){links.forEach((a,n)=>{if(i===n)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current')});meter.style.width=((i+1)/ids.length*100)+'%'}
 links.forEach((a,i)=>a.addEventListener('click',()=>current(i)));
 if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)current(ids.indexOf(e.target.id))})},{rootMargin:'-20% 0px -60% 0px'});ids.map(id=>document.getElementById(id)).filter(Boolean).forEach(x=>observer.observe(x))}
 current(0);
}
