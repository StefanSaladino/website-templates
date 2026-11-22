const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-menu');
const backdrop = document.querySelector('[data-menu-backdrop]');
const closeButton = document.querySelector('[data-menu-close]');
const pageMain=document.querySelector('main');
const pageFooter=document.querySelector('.site-footer');
const menuMotion=matchMedia('(prefers-reduced-motion: reduce)');
let hideMenuTimer;

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

function setMenu(open){
  if(!menuButton||!menu||!backdrop)return;
  clearTimeout(hideMenuTimer);
  menuButton.setAttribute('aria-expanded',String(open));
  menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');
  document.body.classList.toggle('menu-open',open);
  if(pageMain)pageMain.inert=open;
  if(pageFooter)pageFooter.inert=open;
  if(open){
    menu.inert=false;
    menu.hidden=false;
    backdrop.hidden=false;
    requestAnimationFrame(()=>{
      if(menuButton.getAttribute('aria-expanded')==='true'){
        menu.classList.add('is-open');
        backdrop.classList.add('is-open');
        closeButton?.focus();
      }
    });
  }else{
    // Keep the closing drawer non-focusable while its visual exit runs.
    if(menu.contains(document.activeElement))menuButton.focus();
    menu.inert=true;
    menu.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    const finish=()=>{
      if(menuButton.getAttribute('aria-expanded')!=='true'){
        menu.hidden=true;backdrop.hidden=true;
      }
    };
    if(menuMotion.matches)finish();
    else hideMenuTimer=window.setTimeout(finish,460);
  }
}
menuButton?.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
closeButton?.addEventListener('click',()=>{
  setMenu(false);
  menuButton?.focus();
});
backdrop?.addEventListener('click',()=>{
  setMenu(false);
  menuButton?.focus();
});
menu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  setMenu(false);
  if(!focusMenuDestination(link))menuButton?.focus();
}));
document.addEventListener('keydown',event=>{
  if(menuButton?.getAttribute('aria-expanded')!=='true')return;
  if(event.key==='Escape'){
    event.preventDefault();
    setMenu(false);
    menuButton.focus();
    return;
  }
  if(event.key!=='Tab')return;
  const focusable=[closeButton,...menu.querySelectorAll('a,button')].filter((item,i,all)=>item&&!item.hidden&&item.getClientRects().length&&all.indexOf(item)===i);
  if(!focusable.length)return;
  const first=focusable[0],last=focusable[focusable.length-1];
  if(event.shiftKey&&document.activeElement===first){
    event.preventDefault();last.focus();
  }else if(!event.shiftKey&&document.activeElement===last){
    event.preventDefault();first.focus();
  }
});
window.addEventListener('resize',()=>{
  if(window.innerWidth<=900)return;
  const wasOpen=menuButton?.getAttribute('aria-expanded')==='true';
  setMenu(false);
  if(wasOpen)requestAnimationFrame(()=>document.querySelector('.desktop-nav a')?.focus());
});
menuMotion.addEventListener?.('change',event=>{
  if(event.matches&&menuButton?.getAttribute('aria-expanded')==='true'){
    setMenu(false);
    menuButton.focus();
  }
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals = document.querySelectorAll('.reveal');
if (reducedMotion || !('IntersectionObserver' in window)) {
  reveals.forEach((el) => el.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: .12 });
  reveals.forEach((el) => observer.observe(el));
}

/* ANIM-14: details remain fully functional without scripts. */
const intakeList=document.querySelector('[data-motion-pattern="ANIM-14"]');
if(intakeList){const questions=[...intakeList.querySelectorAll('details')];questions.forEach(d=>d.addEventListener('toggle',()=>{if(d.open)questions.filter(x=>x!==d&&x.open).forEach(x=>x.open=false)}))}

/* Never collect, navigate with, or transmit demo legal intake details. */
const lawContactForm=document.querySelector('.contact-form');
lawContactForm?.addEventListener('submit',(event)=>{
  event.preventDefault();
  const status=lawContactForm.querySelector('[data-law-contact-status]');
  if(status)status.textContent='Preview only — no legal consultation was requested, and no information was sent or saved.';
});
