// Progressive enhancement: without JS all navigation links remain visible.
for(const header of document.querySelectorAll('[data-site-header]')){
 const toggle=header.querySelector('.ba-menu-toggle'),nav=header.querySelector('.ba-primary-nav'),label=toggle?.querySelector('.ba-menu-label');
 if(!toggle||!nav||!label)continue;
 const mobile=matchMedia('(max-width: 800px)'),isOpen=()=>header.hasAttribute('data-open');
 function setOpen(open,restore=false){header.toggleAttribute('data-open',open);toggle.setAttribute('aria-expanded',String(open));label.textContent=open?'Close':'Menu';if(restore&&mobile.matches)toggle.focus();}
 toggle.addEventListener('click',()=>setOpen(!isOpen()));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isOpen()){e.preventDefault();setOpen(false,true);}});
 document.addEventListener('pointerdown',e=>{if(isOpen()&&!header.contains(e.target))setOpen(false,nav.contains(document.activeElement));});
 document.addEventListener('focusin',e=>{if(isOpen()&&!header.contains(e.target))setOpen(false);});
 nav.addEventListener('click',e=>{if(e.target.closest('a')&&isOpen())setOpen(false,true);});
 mobile.addEventListener('change',()=>{const active=document.activeElement;setOpen(false);if(mobile.matches&&nav.contains(active))toggle.focus();if(!mobile.matches&&active===toggle)nav.querySelector('[aria-current],a')?.focus();});
 window.addEventListener('pageshow',()=>setOpen(false));
 toggle.hidden=false;header.setAttribute('data-enhanced','');
}
