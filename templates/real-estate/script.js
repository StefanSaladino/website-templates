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

/* ANIM-13: native horizontal storytelling with accessible finite controls. */
const shoreRail=document.querySelector('[data-shore-root]');if(shoreRail){const rail=shoreRail.querySelector('[data-shore-track]'),slides=[...shoreRail.querySelectorAll('[data-shore-slide]')],previous=shoreRail.querySelector('[data-shore-prev]'),next=shoreRail.querySelector('[data-shore-next]'),status=shoreRail.querySelector('[data-shore-status]'),reduce=matchMedia('(prefers-reduced-motion: reduce)');let active=0,frame=null,pendingUntil=0;function showActive(i){active=Math.max(0,Math.min(slides.length-1,i));previous.disabled=active===0;next.disabled=active===slides.length-1;status.textContent='Frame '+(active+1)+' of '+slides.length+': '+['Drift House','Glass Point','North Window'][active]}function nearest(){frame=null;if(performance.now()<pendingUntil)return;const origin=slides[0].offsetLeft;const target=rail.scrollLeft;let best=0,delta=Infinity;slides.forEach((slide,i)=>{const d=Math.abs(slide.offsetLeft-origin-target);if(d<delta){delta=d;best=i}});showActive(best)}function scrollToFrame(i){const n=Math.max(0,Math.min(slides.length-1,i));showActive(n);pendingUntil=performance.now()+(reduce.matches?0:620);rail.scrollTo({left:slides[n].offsetLeft-slides[0].offsetLeft,behavior:reduce.matches?'instant':'smooth'});setTimeout(nearest,660)}previous.addEventListener('click',()=>scrollToFrame(active-1));next.addEventListener('click',()=>scrollToFrame(active+1));rail.addEventListener('scroll',()=>{if(frame===null)frame=requestAnimationFrame(nearest)},{passive:true});addEventListener('resize',nearest);previous.hidden=false;next.hidden=false;shoreRail.classList.add('shore-ready');nearest();}

/* Demo contact: no real agent, backend, message transport or collected leads. */
const sampleContact=document.querySelector('[data-sample-contact]');
sampleContact?.addEventListener('submit',event=>{
  event.preventDefault();
  const status=sampleContact.querySelector('[data-sample-response]');
  if(status)status.textContent='Preview only: no brief was sent or stored. This fictional real-estate concept has no receiving agent.';
});
