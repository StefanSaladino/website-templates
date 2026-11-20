const entries=[...document.querySelectorAll('[data-photo]')],dialog=document.querySelector('#g6-dialog'),large=document.querySelector('#g6-large');let active=0,lastTrigger;function show(i){active=(i+entries.length)%entries.length;const img=entries[active].querySelector('img');large.src=img.src;large.alt=img.alt;document.querySelector('#g6-position').textContent=String(active+1).padStart(2,'0')+' / 04';}entries.forEach((button,i)=>button.addEventListener('click',()=>{lastTrigger=button;show(i);dialog.showModal();document.querySelector('#g6-close').focus();}));function close(){dialog.close();}document.querySelector('#g6-close').addEventListener('click',close);document.querySelector('#g6-prev').addEventListener('click',()=>show(active-1));document.querySelector('#g6-next').addEventListener('click',()=>show(active+1));dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();show(active-1);}if(event.key==='ArrowRight'){event.preventDefault();show(active+1);}});dialog.addEventListener('close',()=>lastTrigger?.focus());
/* M-GAL-05: thumbnail-oriented image room with full-screen native dialog and optional touch swipe. */
(()=>{
 if(new URLSearchParams(location.search).get('mobile')!=='M-GAL-05')return;
 document.body.dataset.mobileTreatment='M-GAL-05';
 const viewer=document.querySelector('#g6-dialog'),img=viewer?.querySelector('#g6-large');
 if(!viewer||!img)return;let start=null;
 img.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;start={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});
 img.addEventListener('touchend',e=>{if(!start||e.changedTouches.length!==1)return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;start=null;
 if(Math.abs(dx)<55||Math.abs(dx)<Math.abs(dy)*1.35)return;document.querySelector(dx<0?'#g6-next':'#g6-prev')?.click()
 },{passive:true});
 img.addEventListener('touchcancel',()=>{start=null},{passive:true});
})();


/* M-UTIL-02: full-height information sheet inside the original native dialog;
   arrow navigation, Escape and opener focus restoration remain the parent behaviour. */
(()=>{
 if(new URLSearchParams(location.search).get('mobile')!=='M-UTIL-02')return;
 document.body.dataset.mobileTreatment='M-UTIL-02';
 const viewer=document.querySelector('#g6-dialog'),large=document.querySelector('#g6-large');
 if(!viewer||!large)return;
 const caption=document.createElement('div');caption.className='g6-detail-copy';
 const label=document.createElement('span');label.textContent='IMAGE NOTES / FICTIONAL PORTRAIT COLLECTION';
 const heading=document.createElement('h2');heading.textContent='Portrait study';
 const detail=document.createElement('p');detail.setAttribute('aria-live','polite');
 const notice=document.createElement('p');notice.textContent='Illustrative stock photography; this is not a portfolio client or endorsement.';
 caption.append(label,heading,detail,notice);large.insertAdjacentElement('afterend',caption);
 const sync=()=>{detail.textContent=large.alt||'Photograph detail';heading.textContent='Study '+(document.querySelector('#g6-position')?.textContent.split(' / ')[0]||'01');};
 new MutationObserver(sync).observe(large,{attributes:true,attributeFilter:['alt']});sync();
})();
