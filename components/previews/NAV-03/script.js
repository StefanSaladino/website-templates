const toggle=document.querySelector('.n3-toggle'),menu=document.getElementById('n3-menu'),head=document.getElementById('head'),main=document.querySelector('main'),footer=document.querySelector('footer'),brand=document.querySelector('.n3-brand'),skip=document.querySelector('.sr-skip');let previousFocus=null;const disableOutside=value=>{for(const el of [main,footer,brand,skip])el.inert=value;};
const close=()=>{toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open menu');menu.hidden=true;document.body.classList.remove('menu-open');head.classList.remove('menu-open');disableOutside(false);};
const open=()=>{previousFocus=document.activeElement;toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label','Close menu');menu.hidden=false;document.body.classList.add('menu-open');head.classList.add('menu-open');disableOutside(true);menu.querySelector('a')?.focus();};
toggle.addEventListener('click',()=>{if(menu.hidden)open();else{close();toggle.focus();}});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{close();const target=document.getElementById(a.hash.slice(1));if(!target)return;if(!target.hasAttribute('tabindex')){target.setAttribute('tabindex','-1');target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true})}target.focus({preventScroll:true})}));
document.addEventListener('keydown',event=>{
 if(menu.hidden)return;
 if(event.key==='Escape'){event.preventDefault();close();(previousFocus||toggle).focus();return;}
 if(event.key!=='Tab')return;
 const links=[...menu.querySelectorAll('a')],first=links[0],last=links.at(-1),active=document.activeElement;
 if(event.shiftKey && active===first){event.preventDefault();toggle.focus();}
 else if(event.shiftKey && active===toggle){event.preventDefault();last.focus();}
 else if(!event.shiftKey && active===last){event.preventDefault();toggle.focus();}
 else if(!event.shiftKey && active===toggle){event.preventDefault();first.focus();}
});
const sync=()=>{head.classList.toggle('scrolled',window.scrollY>45);if(window.innerWidth>850&&!menu.hidden){const wasInside=menu.contains(document.activeElement);close();if(wasInside)(document.querySelector('.n3-nav a')||brand)?.focus();}};addEventListener('scroll',sync,{passive:true});addEventListener('resize',sync);sync();


/* Phase 2 preview-mode selection */
(() => {
 const option = new URLSearchParams(location.search).get('mobile');
 if (option === 'M-NAV-04') document.body.dataset.mobileTreatment = option;
})();


/* Phase 2 preview-mode selection */
document.querySelectorAll('img').forEach(image=>{
 image.addEventListener('error',()=>{
   image.classList.add('pending-image');
   image.setAttribute('alt','');
   const wrapper=image.closest('.n3-scene,.h1-scene,.g2-photo,.s3-media,.c2-scene');
   if(wrapper)wrapper.classList.add('image-pending');
 },{once:true});
});
