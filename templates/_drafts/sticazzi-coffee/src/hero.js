'use strict';
// S08a: direct manipulation of the intact photo, with a bounded 2D local
// warp. No defective extraction plates, no fake rotation, no slider.
const hero=document.querySelector('.hero'),hit=hero.querySelector('.product-hit');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const still=hero.querySelector('.still img'),camera=hero.querySelector('.scene-camera');
const canvas=document.createElement('canvas');
canvas.className='product-motion-canvas';canvas.setAttribute('aria-hidden','true');canvas.hidden=true;
camera.insertBefore(canvas,camera.querySelector('.filter-still'));
const ctx=canvas.getContext('2d',{alpha:false});
let ready=false,frame=0,v=0,tv=0,drag=null,pulse=0,moved=false,source='';
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
// Artwork-specific envelope, normalized to the original image. The bag
// translates rigidly within each horizontal band; the nearby background
// absorbs the displacement. Everything outside that envelope stays fixed.
const contours={
 wide:[[.713,.062,.747],[.706,.119,.941],[.647,.30,.935],[.610,.50,.918],[.571,.795,.892],[.684,.857,.868],[.841,.918,.856]],
 portrait:[[.458,.066,.497],[.438,.115,.895],[.357,.30,.877],[.294,.50,.834],[.207,.79,.772],[.319,.857,.751],[.697,.918,.746]]
};
function limits(y,profile){
 if(y<=profile[0][1])return [profile[0][0],profile[0][2]];
 for(let i=1;i<profile.length;i++){const a=profile[i-1],b=profile[i];if(y<=b[1]){const f=(y-a[1])/(b[1]-a[1]);return [a[0]+(b[0]-a[0])*f,a[2]+(b[2]-a[2])*f]}}
 return [profile.at(-1)[0],profile.at(-1)[2]];
}
function drawMotion(){
 if(!ready||!ctx||Math.abs(v)<.003||still.currentSrc!==source||!still.complete||!still.naturalWidth){canvas.hidden=true;return}
 const w=still.naturalWidth,h=still.naturalHeight;
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
 ctx.drawImage(still,0,0,w,h);
 const profile=w/h<1.2?contours.portrait:contours.wide;
 const maxShift=Math.min(w*.018,24),base=v*maxShift;
 const start=Math.max(0,Math.floor(h*.015)),end=Math.min(h,Math.ceil(h*.978));
 const band=6,margin=Math.max(12,Math.round(w*.012)),buffer=Math.max(60,Math.round(w*.065));
 for(let y=start;y<end;y+=band){
  const bh=Math.min(band,end-y),t=(y+bh*.5)/h;
  const edge=clamp(Math.min((t-.015)/.045,(.978-t)/.055),0,1);
  const d=base*edge*edge*(3-2*edge);
  if(Math.abs(d)<.05)continue;
  const a=limits(y/h,profile),b=limits((y+bh)/h,profile);
  const l=clamp(Math.floor(Math.min(a[0],b[0])*w)-margin,1,w-2);
  const r=clamp(Math.ceil(Math.max(a[1],b[1])*w)+margin,l+1,w-1);
  const lo=Math.max(0,l-buffer),hi=Math.min(w,r+buffer);
  const shift=clamp(d,-(l-lo)*.45,(hi-r)*.45);
  // Integer destinations prevent subpixel seams between adjacent strips.
  const q=Math.round(shift);
  if(!q)continue;
  ctx.drawImage(still,lo,y,l-lo,bh,lo,y,l-lo+q,bh);
  ctx.drawImage(still,l,y,r-l,bh,l+q,y,r-l,bh);
  ctx.drawImage(still,r,y,hi-r,bh,r+q,y,hi-r-q,bh);
 }
 canvas.hidden=false;
}
function render(){frame=0;v+=(tv-v)*.25;if(Math.abs(tv-v)<.003)v=tv;drawMotion();if(v!==tv&&!document.hidden)frame=requestAnimationFrame(render)}
function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(render)}
function nudge(){if(!ready||reduced.matches||hit.hidden)return;clearTimeout(pulse);tv=.8;schedule();pulse=setTimeout(()=>{tv=0;schedule()},180)}
function resetAll(){
 const id=drag?.id;drag=null;delete hit.dataset.dragging;
 if(id!==undefined&&hit.hasPointerCapture(id))hit.releasePointerCapture(id);
 clearTimeout(pulse);cancelAnimationFrame(frame);frame=0;tv=v=0;canvas.hidden=true;
}
function endDrag(e){
 if(!drag||e.pointerId!==drag.id)return;
 drag=null;delete hit.dataset.dragging;tv=0;schedule();
 if(hit.hasPointerCapture(e.pointerId))hit.releasePointerCapture(e.pointerId);
}
function setAvailability(){
 hero.dataset.layers='static';
 hit.hidden=!ready||!ctx||reduced.matches;resetAll();configureJourney();
}
let loadId=0;
async function loadLayers(){
 const id=++loadId;
 try{await still.decode();if(id!==loadId)return;source=still.currentSrc;ready=still.naturalWidth>0;}
 catch{if(id!==loadId)return;ready=false;}
 setAvailability();
}
hit.addEventListener('pointerdown',e=>{
 if(!ready||reduced.matches||e.button!==0||!e.isPrimary||drag)return;
 clearTimeout(pulse);moved=false;drag={id:e.pointerId,start:e.clientX};
 hit.setPointerCapture(e.pointerId);hit.dataset.dragging='true';
});
hit.addEventListener('pointermove',e=>{
 if(drag?.id!==e.pointerId)return;
 const dx=e.clientX-drag.start;if(Math.abs(dx)>5)moved=true;
 tv=clamp(dx/65,-1,1);schedule();
});
for(const event of ['pointerup','pointercancel','lostpointercapture'])hit.addEventListener(event,endDrag);
hit.addEventListener('click',e=>{if(e.detail===0||!moved)nudge();moved=false});
reduced.addEventListener('change',setAvailability);
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetAll()});
still.addEventListener('load',loadLayers);
// The same artwork and copy nodes persist during the native scroll journey.
const root=document.documentElement,journey=document.querySelector('.journey'),roast=document.querySelector('.espresso'),copy=hero.querySelector('.hero-copy'),header=document.querySelector('.masthead');
// Two matched campaign plates, not 3D models. The opening retains its
// original independently draggable espresso bag. Selection is in the roast chapter.
const storyLink=hero.querySelector('.story-link');
const filterFallback=document.querySelector('.filter-fallback'),selector=roast.querySelector('.roast-selector'),filterImage=hero.querySelector('.filter-still img'),productMeta=hero.querySelector('[data-product-meta]');
const roastFields=['.eyebrow','h2','.roast-description','.roast-notes'];
const readFields=section=>roastFields.map(q=>section.querySelector(q).innerHTML);
const roastContent={espresso:readFields(roast),filter:readFields(filterFallback)};
const espressoMeta=productMeta.textContent,filterMeta=espressoMeta.replace('ESPRESSO',root.lang==='it'?'FILTRO':'FILTER');
let filterReady=false,selected='espresso',selectionTimer=0;
function updateRoastContent(){
 const type=journeyActive&&filterReady?selected:'espresso';
 roastFields.forEach((q,i)=>{const el=roast.querySelector(q),html=roastContent[type][i];if(el.innerHTML!==html)el.innerHTML=html});
 selector.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.roast===type)));
}
function updateRoastAvailability(){
 const available=journeyActive&&filterReady;
 selector.hidden=!available;filterFallback.hidden=available;
 updateRoastContent();
 if(!available){hero.style.setProperty('--filter-alpha','0');productMeta.textContent=espressoMeta;delete hero.dataset.roast;}
}
function chooseRoast(type){
 if(!journeyActive||!filterReady||hero.dataset.chapter!=='roast'||!Object.hasOwn(roastContent,type)||selected===type)return;
 selected=type;hero.dataset.selecting='true';clearTimeout(selectionTimer);
 updateRoastContent();renderJourney();
 selectionTimer=setTimeout(()=>{delete hero.dataset.selecting},450);
}
selector.addEventListener('click',e=>{const b=e.target.closest('button[data-roast]');if(b)chooseRoast(b.dataset.roast)});
async function loadFilter(){try{const source=filterImage.parentElement.querySelector('source');source.srcset=source.dataset.srcset;filterImage.src=filterImage.dataset.src;await filterImage.decode();filterReady=filterImage.naturalWidth>0;}catch{filterReady=false}updateRoastAvailability();if(journeyActive)renderJourney()}
const portrait=matchMedia('(max-aspect-ratio: 5/6)');
let travel=0,journeyFrame=0,journeyActive=false,pendingFocus='',lastChapter='opening';
hero.dataset.chapter='opening';
const smooth=t=>{const n=clamp(t,0,1);return n*n*(3-2*n)};
function renderJourney(){
 journeyFrame=0;if(!journeyActive)return;
 const top=journey.getBoundingClientRect().top;
 const p=clamp(-top/travel,0,1),movement=smooth((p-.10)/.78),out=1-smooth((p-.16)/.25),into=smooth((p-.42)/.28),handoff=1-smooth((p-.08)/.27);
 const values={'--photo-layer-alpha':handoff,'--opening-alpha':out,'--opening-rise':(-18*(1-out))+'px','--roast-alpha':into,'--roast-rise':(16*(1-into))+'px','--roast-visible':into>0?'visible':'hidden','--scene-scale':1.035+.035*movement,'--scene-x':(-8*movement)+'px','--travel-x':'0px','--travel-y':'0px','--travel-angle':'0deg'};
 for(const [k,val] of Object.entries(values))hero.style.setProperty(k,String(val));
 const chapter=p<.41?'opening':p>=.70?'roast':'transition';
 if(chapter!==lastChapter){
  const old=lastChapter;lastChapter=chapter;hero.dataset.chapter=chapter;
  if(old==='opening'){if(copy.contains(document.activeElement)||document.activeElement===hit)header.querySelector('.brand').focus({preventScroll:true});resetAll()}
  if(old==='roast'&&roast.contains(document.activeElement))header.querySelector('.brand').focus({preventScroll:true});
 }
 storyLink.hidden=chapter!=='roast';
 copy.inert=chapter!=='opening';roast.inert=chapter!=='roast';const active=ready&&!!ctx&&!reduced.matches&&chapter==='opening'&&p<.08;if(!active&&!hit.hidden){if(document.activeElement===hit)header.querySelector('.brand').focus({preventScroll:true});resetAll()}hit.hidden=!active;
 hero.style.setProperty('--filter-alpha',String(filterReady&&selected==='filter'?into:0));hero.dataset.roast=chapter==='roast'&&filterReady?selected:'espresso';productMeta.textContent=hero.dataset.roast==='filter'?filterMeta:espressoMeta;hero.dataset.progress=p.toFixed(5);header.dataset.end=String(top<-travel-4);
 if(pendingFocus==='roast'&&p>=.999){pendingFocus='';roast.querySelector('h2').focus({preventScroll:true})}
 if(pendingFocus==='opening'&&p<=.001){pendingFocus='';copy.querySelector('h1').focus({preventScroll:true})}
}
function queueJourney(){delete hero.dataset.selecting;clearTimeout(selectionTimer);if(journeyActive&&!journeyFrame)journeyFrame=requestAnimationFrame(renderJourney)}
function configureJourney(){
 // Do not pin a stage whose opening content is taller than the viewport.
 // Return to document flow before measuring the unenhanced layout.
 const prior=journeyActive,oldProgress=prior?clamp(-journey.getBoundingClientRect().top/travel,0,1):0;
 if(prior){root.removeAttribute('data-journey');journey.append(roast);copy.inert=roast.inert=false;lastChapter='opening';hero.dataset.chapter='opening';header.removeAttribute('data-end');hero.removeAttribute('data-progress');}
 journeyActive=false;storyLink.hidden=true;cancelAnimationFrame(journeyFrame);journeyFrame=0;
 if(!ready||reduced.matches||hero.getBoundingClientRect().height>window.innerHeight+2){hero.style.removeProperty('--photo-layer-alpha');hit.hidden=!ready||!ctx||reduced.matches;updateRoastAvailability();return}
 travel=Math.round(window.innerHeight*.92);journey.style.setProperty('--travel',travel+'px');hero.append(roast);root.dataset.journey='on';journeyActive=true;
 if(prior&&oldProgress>0&&oldProgress<1)window.scrollTo({top:journey.offsetTop+travel*oldProgress,behavior:'instant'});
 if(!prior&&location.hash==='#espresso')window.scrollTo({top:journey.offsetTop+travel,behavior:'instant'});
 updateRoastAvailability();renderJourney();
}
for(const h of [copy.querySelector('h1'),roast.querySelector('h2')])h.tabIndex=-1;
document.addEventListener('click',e=>{const a=e.target.closest('a');if(!journeyActive||!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const href=a.getAttribute('href');if(href!=='#espresso'&&href!=='#main')return;e.preventDefault();pendingFocus=href==='#espresso'?'roast':'opening';window.scrollTo({top:journey.offsetTop+(href==='#espresso'?travel:0),behavior:'smooth'});queueJourney()});
window.addEventListener('scroll',queueJourney,{passive:true});window.addEventListener('resize',()=>{resetAll();configureJourney()},{passive:true});
// Do not replace the initial photograph until both independent layers decode.
loadLayers();

// Decode the alternate artwork only after the initial opening has loaded.
if(document.readyState==='complete')loadFilter();else window.addEventListener('load',loadFilter,{once:true});

// S05a: restrained camera movement on the intact close-up, tied to native
// scroll. No autonomous animation or synthetic steam.
const ritual=document.querySelector('.ritual'),lastWord=document.querySelector('.last-word');
let ritualFrame=0;
function drawRitual(){
 ritualFrame=0;
 if(reduced.matches){ritual.style.removeProperty('--ritual-scale');lastWord.style.removeProperty('--last-word-scale');return;}
 const b=ritual.getBoundingClientRect(),h=innerHeight;
 if(b.top<h&&b.bottom>0){const t=clamp((h-b.top)/(h+b.height),0,1);ritual.style.setProperty('--ritual-scale',(1+.055*smooth(t)).toFixed(5));}
 const c=lastWord.getBoundingClientRect();
 if(c.top<h&&c.bottom>0){const t=clamp((h-c.top)/(h+c.height),0,1);lastWord.style.setProperty('--last-word-scale',(1+.035*smooth(t)).toFixed(5));}
}
function queueRitual(){if(!ritualFrame&&!document.hidden)ritualFrame=requestAnimationFrame(drawRitual)}
window.addEventListener('scroll',queueRitual,{passive:true});
window.addEventListener('resize',queueRitual,{passive:true});
reduced.addEventListener('change',queueRitual);
queueRitual();
