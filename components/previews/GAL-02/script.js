const chips=[...document.querySelectorAll('.g2-tabs button')],cards=[...document.querySelectorAll('.g2-photo')],grid=document.querySelector('.g2-grid'),count=document.querySelector('.g2-count'),dialog=document.querySelector('.g2-dialog');const close=dialog.querySelector('.g2-close'),prev=dialog.querySelector('.g2-previous'),next=dialog.querySelector('.g2-next');let activeItems=cards.slice(),index=0,returnTo=null;const surrounding=[document.querySelector('header'),document.querySelector('main'),document.querySelector('footer'),document.querySelector('.skip')];const maskBackground=value=>surrounding.forEach(el=>el.inert=value);
const filter=value=>{chips.forEach(b=>{let hit=b.dataset.filter===value;b.classList.toggle('active',hit);b.setAttribute('aria-pressed',String(hit))});cards.forEach(c=>c.hidden=value!=='all'&&c.dataset.category!==value);activeItems=cards.filter(c=>!c.hidden);grid.classList.toggle('filtered',value!=='all');count.textContent='Showing '+activeItems.length+' images';};chips.forEach(c=>c.addEventListener('click',()=>filter(c.dataset.filter)));
function display(){const current=activeItems[index];if(!current)return;const image=current.querySelector('img');const large=dialog.querySelector('img');large.src=image.currentSrc||image.src;large.alt=image.alt;dialog.querySelector('figcaption').textContent=current.dataset.title+' / '+(index+1)+' of '+activeItems.length;}
function show(card){returnTo=card;index=activeItems.indexOf(card);if(index<0)return;display();dialog.hidden=false;document.body.classList.add('modal-open');maskBackground(true);close.focus();}
function dismiss(){dialog.hidden=true;document.body.classList.remove('modal-open');maskBackground(false);dialog.querySelector('img').removeAttribute('src');returnTo?.focus();}
function change(delta){index=(index+delta+activeItems.length)%activeItems.length;display();}
cards.forEach(c=>c.addEventListener('click',()=>show(c)));close.addEventListener('click',dismiss);prev.addEventListener('click',()=>change(-1));next.addEventListener('click',()=>change(1));dialog.addEventListener('click',e=>{if(e.target===dialog)dismiss()});
document.addEventListener('keydown',e=>{if(dialog.hidden)return;if(e.key==='Escape'){e.preventDefault();dismiss()}else if(e.key==='ArrowRight'){e.preventDefault();change(1)}else if(e.key==='ArrowLeft'){e.preventDefault();change(-1)}else if(e.key==='Tab'){const focus=[close,prev,next];let i=focus.indexOf(document.activeElement);if(i===-1){e.preventDefault();close.focus()}else{e.preventDefault();focus[(i+(e.shiftKey?-1:1)+focus.length)%focus.length].focus()}}});


/* Phase 2 preview-mode selection */
(() => {
 const option = new URLSearchParams(location.search).get('mobile');
 if (option === 'M-GAL-02') document.body.dataset.mobileTreatment = option;
})();


/* Phase 2 preview-mode selection */
(() => {
 const rail=document.querySelector('.g2-grid');
 const controls=document.querySelector('.g2-mobile-rail-controls');
 if(document.body.dataset.mobileTreatment!=='M-GAL-02')return;
 controls.hidden=false;
 const buttons=[...document.querySelectorAll('.g2-photo')];
 const prev=document.querySelector('.g2-rail-prev'),next=document.querySelector('.g2-rail-next'),status=document.querySelector('.g2-rail-status');
 const visible=()=>buttons.filter(b=>!b.hidden);
 const current=()=>{const items=visible();if(!items.length)return 0;const x=rail.scrollLeft;return items.reduce((best,item,i)=>Math.abs(item.offsetLeft-x)<Math.abs(items[best].offsetLeft-x)?i:best,0)};
 const update=()=>{const items=visible(),i=current();status.textContent=items.length?`${i+1} / ${items.length}`:'0 / 0';prev.disabled=items.length<2;next.disabled=items.length<2;};
 const move=delta=>{const items=visible();if(!items.length)return;const i=(current()+delta+items.length)%items.length;rail.scrollTo({left:items[i].offsetLeft-rail.offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});status.textContent=`${i+1} / ${items.length}`;};
 prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));rail.addEventListener('scroll',update,{passive:true});
 document.querySelectorAll('.g2-tabs button').forEach(button=>button.addEventListener('click',()=>{rail.scrollLeft=0;requestAnimationFrame(update)}));
 addEventListener('resize',update);update();
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

/* M-GAL-04: dense editorial mosaic; preserve original filtering and dialog. */
(()=>{
 if(new URLSearchParams(location.search).get('mobile')!=='M-GAL-04')return;
 document.body.dataset.mobileTreatment='M-GAL-04';
 const count=document.querySelector('.g2-count');
 if(count)count.insertAdjacentText('beforebegin','');
})();
