const menuButton=document.querySelector('.menu-button');
const mobileNav=document.querySelector('.mobile-nav');
const pageMain=document.querySelector('main');
const pageFooter=document.querySelector('footer');
function closeMenu(restoreFocus=false){
  if(!menuButton||!mobileNav)return;
  const wasOpen=menuButton.getAttribute('aria-expanded')==='true';
  menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open menu');
  mobileNav.hidden=true;document.body.classList.remove('nav-open');
  if(pageMain)pageMain.inert=false;if(pageFooter)pageFooter.inert=false;
  if(restoreFocus&&wasOpen)menuButton.focus();
}
function openMenu(){
  if(!menuButton||!mobileNav)return;
  mobileNav.hidden=false;menuButton.setAttribute('aria-expanded','true');menuButton.setAttribute('aria-label','Close menu');
  document.body.classList.add('nav-open');if(pageMain)pageMain.inert=true;if(pageFooter)pageFooter.inert=true;
  mobileNav.querySelector('a')?.focus();
}
menuButton?.addEventListener('click',()=>menuButton.getAttribute('aria-expanded')==='true'?closeMenu(true):openMenu());
mobileNav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>closeMenu(false)));
window.addEventListener('keydown',event=>{
  if(menuButton?.getAttribute('aria-expanded')!=='true')return;
  if(event.key==='Escape'){event.preventDefault();closeMenu(true);return}
  if(event.key!=='Tab')return;
  const focusable=[menuButton,...mobileNav.querySelectorAll('a')];
  const index=focusable.indexOf(document.activeElement);
  if(event.shiftKey&&(index<=0)){event.preventDefault();focusable[focusable.length-1].focus()}
  else if(!event.shiftKey&&index===focusable.length-1){event.preventDefault();focusable[0].focus()}
});
window.addEventListener('resize',()=>{if(window.innerWidth>780)closeMenu(false)});
// Remote demo images may not load in offline previews. Keep the layout legible.
document.querySelectorAll('main img').forEach(img=>{
  const failed=()=>img.parentElement?.classList.add('media-failed');
  img.addEventListener('error',failed,{once:true});
  if(img.complete&&img.naturalWidth===0)failed();
});

/* ANIM-17: sticky editorial chapters with a real native-link active indicator. */
const monolithChapters=document.querySelector('[data-motion-pattern="ANIM-17"]');
if(monolithChapters){const cards=[...monolithChapters.querySelectorAll('[data-monolith-card]')],links=[...monolithChapters.querySelectorAll('[data-monolith-link]')],status=monolithChapters.querySelector('#monolith-story-status'),names=['Shape','Material','Light'];let active=-1,frame=null;function setActive(i){if(i===active)return;active=i;links.forEach((link,n)=>{if(i===n)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current')});status.textContent='Chapter '+(i+1)+' of '+cards.length+': '+names[i]}function sync(){frame=null;let index=0;cards.forEach((card,n)=>{if(card.getBoundingClientRect().top<=180)index=n});setActive(index)}function schedule(){if(frame!==null)return;frame=requestAnimationFrame(sync)}links.forEach((link,i)=>link.addEventListener('click',()=>{setActive(i);schedule()}));addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);schedule()}
