const filterButtons=[...document.querySelectorAll('[data-filter]')];
const gallery=document.querySelector('.gallery-grid');
const frames=[...document.querySelectorAll('.frame')];
const status=document.querySelector('.filter-status');
const dialog=document.querySelector('.lightbox');
const dialogImage=dialog?.querySelector('.lightbox-media img');
const dialogCaption=dialog?.querySelector('.lightbox-caption>span');
const imageFallback=dialog?.querySelector('.lightbox-fallback');
let activeFrame=0;
let lastTrigger=null;
function visibleFrames(){return frames.filter(frame=>!frame.classList.contains('is-hidden'))}
filterButtons.forEach(button=>button.addEventListener('click',()=>{
  const chosen=button.dataset.filter;
  filterButtons.forEach(item=>{const selected=item===button;item.classList.toggle('is-active',selected);item.setAttribute('aria-pressed',String(selected))});
  frames.forEach(frame=>{frame.classList.toggle('is-hidden',chosen!=='all'&&frame.dataset.category!==chosen);frame.classList.remove('is-first-visible')});
  gallery?.classList.toggle('is-filtered',chosen!=='all');
  const available=visibleFrames();available[0]?.classList.add('is-first-visible');
  if(status)status.textContent=`Showing ${available.length} ${chosen==='all'?'photographs':chosen==='still'?'still life photographs':chosen+' photographs'}`;
}));
function showFrame(index){
  const visible=visibleFrames();if(!visible.length||!dialogImage)return;
  activeFrame=(index+visible.length)%visible.length;
  const frame=visible[activeFrame];const source=frame.querySelector('img');
  if(imageFallback)imageFallback.hidden=true;
  dialogImage.classList.remove('is-failed');
  dialogImage.src=source.currentSrc||source.src;
  dialogImage.alt=source.alt;
  if(source.srcset)dialogImage.srcset=source.srcset;else dialogImage.removeAttribute('srcset');
  dialogImage.sizes='95vw';
  if(dialogCaption)dialogCaption.textContent=`${frame.dataset.no} / ${frame.dataset.title.toUpperCase()}`;
}
frames.forEach(frame=>frame.addEventListener('click',()=>{
  if(!dialog)return;
  lastTrigger=frame;showFrame(visibleFrames().indexOf(frame));dialog.showModal();
  dialog.querySelector('.lightbox-close')?.focus();
}));
dialog?.querySelector('.lightbox-close')?.addEventListener('click',()=>dialog.close());
dialog?.querySelector('.lightbox-prev')?.addEventListener('click',()=>showFrame(activeFrame-1));
dialog?.querySelector('.lightbox-next')?.addEventListener('click',()=>showFrame(activeFrame+1));
dialog?.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
dialog?.addEventListener('close',()=>{dialogImage.removeAttribute('src');dialogImage.removeAttribute('srcset');lastTrigger?.focus()});
dialog?.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'){event.preventDefault();showFrame(activeFrame-1)}
  if(event.key==='ArrowRight'){event.preventDefault();showFrame(activeFrame+1)}
});
dialogImage?.addEventListener('error',()=>{dialogImage.classList.add('is-failed');if(imageFallback)imageFallback.hidden=false});
// Gallery thumbnails remain usable even if a sample photo cannot be retrieved.
document.querySelectorAll('.frame img,.opening-images img').forEach(img=>{
  const failed=()=>img.parentElement?.classList.add('media-failed');
  img.addEventListener('error',failed,{once:true});if(img.complete&&img.naturalWidth===0)failed();
});

/* ANIM-12: selected image and label change together; full image is available without JS. */
const featurePanel=document.querySelector('[data-motion-pattern="ANIM-12"]');
if(featurePanel){const controls=[...featurePanel.querySelectorAll('[data-feature-select]')],images=[...featurePanel.querySelectorAll('[data-feature-image]')],status=featurePanel.querySelector('[data-feature-status]'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),names=['Early light','Off duty','Quiet object'];function show(i){images.forEach((figure,n)=>{figure.hidden=n!==i;figure.classList.remove('is-arriving')});controls.forEach((control,n)=>control.setAttribute('aria-pressed',String(n===i)));if(!reduced.matches){void images[i].offsetWidth;images[i].classList.add('is-arriving')}status.textContent='Showing '+String(i+1).padStart(2,'0')+' / '+names[i]}controls.forEach((control,i)=>control.addEventListener('click',()=>show(i)));reduced.addEventListener('change',e=>{if(e.matches)images.forEach(x=>x.classList.remove('is-arriving'))})}
