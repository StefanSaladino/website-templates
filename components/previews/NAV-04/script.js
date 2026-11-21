(()=>{const trigger=document.querySelector('#n4-toggle'),menu=document.querySelector('#n4-links');if(!trigger||!menu)return;const links=[...menu.querySelectorAll('a')];const focusDestination=link=>{const target=document.getElementById(link.hash.slice(1));if(!target)return;const hadTabindex=target.hasAttribute('tabindex');if(!hadTabindex){target.setAttribute('tabindex','-1');target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true})}target.focus({preventScroll:true})};const setOpen=(open,focus=false)=>{trigger.setAttribute('aria-expanded',String(open));trigger.setAttribute('aria-label',open?'Close menu':'Open menu');menu.classList.toggle('is-open',open);if(focus)(open?links[0]:trigger)?.focus()};trigger.addEventListener('click',()=>setOpen(trigger.getAttribute('aria-expanded')!=='true',true));links.forEach(a=>a.addEventListener('click',()=>{setOpen(false);if(document.body.dataset.mobileTreatment!=='M-NAV-06')focusDestination(a)}));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&trigger.getAttribute('aria-expanded')==='true')setOpen(false,true)});document.addEventListener('pointerdown',e=>{if(!e.target.closest('.n4-header'))setOpen(false)});window.addEventListener('resize',()=>{if(innerWidth>790)setOpen(false)})})();
/* M-NAV-06: modal-like off-canvas mobile navigation with Escape, overlay and focus containment. */
(()=>{
 if(new URLSearchParams(location.search).get('mobile')!=='M-NAV-06')return;
 document.body.dataset.mobileTreatment='M-NAV-06';
 const trigger=document.querySelector('#n4-toggle'),menu=document.querySelector('#n4-links'),header=document.querySelector('.n4-header'),main=document.querySelector('main'),footer=document.querySelector('footer'),logo=document.querySelector('.n4-wordmark'),cta=document.querySelector('.n4-cta');
 if(!trigger||!menu||!header)return;
 const overlay=document.createElement('button');overlay.className='n4-drawer-backdrop';overlay.type='button';overlay.setAttribute('aria-label','Close navigation drawer');overlay.hidden=true;
 const closeButton=document.createElement('button');closeButton.type='button';closeButton.className='n4-drawer-close';closeButton.textContent='Close menu';menu.prepend(closeButton);header.append(overlay);
 let lastFocus=null;
 function set(open,restore=true){menu.classList.toggle('is-open',open);document.body.classList.toggle('n4-drawer-open',open);trigger.setAttribute('aria-expanded',String(open));trigger.setAttribute('aria-label',open?'Close menu':'Open menu');overlay.hidden=!open;[main,footer,logo,cta].forEach(x=>{if(x)x.inert=open});if(open){lastFocus=document.activeElement;closeButton.focus()}else if(restore)trigger.focus()}
 // Capture the default NAV-04 click before its dropdown handler runs.
 trigger.addEventListener('click',e=>{if(innerWidth>790)return;e.stopImmediatePropagation();set(trigger.getAttribute('aria-expanded')!=='true')},true);
 closeButton.addEventListener('click',()=>set(false));overlay.addEventListener('click',()=>set(false));
 menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{set(false,false);const target=document.getElementById(a.hash.slice(1));if(!target)return;const hadTabindex=target.hasAttribute('tabindex');if(!hadTabindex){target.setAttribute('tabindex','-1');target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true})}target.focus({preventScroll:true})}));
 document.addEventListener('keydown',e=>{if(!document.body.classList.contains('n4-drawer-open'))return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();set(false);return}if(e.key!=='Tab')return;
  const focusable=[closeButton,...menu.querySelectorAll('a')],first=focusable[0],last=focusable.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
 },true);
 addEventListener('resize',()=>{if(innerWidth>790&&document.body.classList.contains('n4-drawer-open'))set(false,false)});
})();


/* M-NAV-02: compact visible inquiry link with the original functional menu. */
(()=>{
 if(new URLSearchParams(location.search).get('mobile')!=='M-NAV-02')return;
 document.body.dataset.mobileTreatment='M-NAV-02';
 const bar=document.querySelector('.n4-mainbar'),toggle=document.querySelector('#n4-toggle');
 if(!bar||!toggle)return;
 const link=document.createElement('a');link.className='n4-phone-inquiry';link.href='#contact';link.textContent='Enquire';link.setAttribute('aria-label','Go to project enquiry section');
 bar.insertBefore(link,toggle);
})();
