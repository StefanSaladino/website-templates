const header = document.querySelector('[data-header]');
const toggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function syncHeader(){ header?.classList.toggle('scrolled', window.scrollY > 28); }
function setMenu(open){
  if(!toggle || !mobileMenu) return;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mobileMenu.hidden = !open;
  document.body.classList.toggle('menu-open', open);
  header?.classList.toggle('menu-active', open);
}
toggle?.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
mobileMenu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
window.addEventListener('keydown',e=>{ if(e.key==='Escape') setMenu(false); });
window.addEventListener('resize',()=>{ if(window.innerWidth>980) setMenu(false); });
window.addEventListener('scroll',syncHeader,{passive:true});
syncHeader();

const reveals=document.querySelectorAll('.reveal');
if('IntersectionObserver' in window && !reduceMotion){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.12});
  reveals.forEach(item=>observer.observe(item));
}else{reveals.forEach(item=>item.classList.add('is-visible'));}

document.querySelectorAll('.media-frame img').forEach(img=>{
  img.addEventListener('error',()=>{
    const frame=img.closest('.media-frame');
    frame?.classList.add('media-failed');
    img.hidden=true;
  });
});

if(!reduceMotion){
  const items=[...document.querySelectorAll('[data-parallax]')];
  let ticking=false;
  const update=()=>{
    const viewport=window.innerHeight;
    items.forEach(item=>{
      const speed=Number(item.dataset.parallax || .02);
      const rect=item.getBoundingClientRect();
      const delta=(rect.top+rect.height/2)-viewport/2;
      const shift=Math.max(-24,Math.min(24,-delta*speed));
      item.style.transform=`translate3d(0,${shift}px,0) scale(1.025)`;
    });
    ticking=false;
  };
  const request=()=>{if(!ticking){requestAnimationFrame(update);ticking=true;}};
  window.addEventListener('scroll',request,{passive:true});
  window.addEventListener('resize',request);
  request();
}
