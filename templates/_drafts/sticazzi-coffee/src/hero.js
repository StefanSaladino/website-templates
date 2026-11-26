'use strict';
// S08b3: camera parallax on the intact photograph. Never deform pixels,
// isolate the bag, or simulate a rotation. Native touch scroll stays intact.
const hero=document.querySelector('.hero'),hit=hero.querySelector('.product-hit');
const still=hero.querySelector('.still img'),scene=hero.querySelector('.scene');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const fine=matchMedia('(hover: hover) and (pointer: fine)');
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
let ready=false,frame=0,x=0,y=0,tx=0,ty=0,drag=null,pulse=0,moved=false,loadId=0;
function paint(){
 hero.style.setProperty('--x',x.toFixed(3)+'px');
 hero.style.setProperty('--y',y.toFixed(3)+'px');
}
function render(){
 frame=0;
 x+=(tx-x)*.18;y+=(ty-y)*.18;
 if(Math.abs(tx-x)<.04)x=tx;if(Math.abs(ty-y)<.04)y=ty;
 paint();
 if((x!==tx||y!==ty)&&!document.hidden)frame=requestAnimationFrame(render);
}
function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(render)}
function bounds(){
 const b=scene.getBoundingClientRect();
 return [Math.min(18,b.width*.014),Math.min(12,b.height*.017)];
}
function aim(nx,ny){
 if(hit.hidden||reduced.matches||!ready)return;
 const [mx,my]=bounds();tx=clamp(nx,-1,1)*mx;ty=clamp(ny,-1,1)*my;schedule();
}
function settle(){clearTimeout(pulse);tx=ty=0;schedule()}
function resetAll(){
 const id=drag?.id;drag=null;delete hit.dataset.dragging;
 if(id!==undefined&&hit.hasPointerCapture(id))hit.releasePointerCapture(id);
 clearTimeout(pulse);cancelAnimationFrame(frame);frame=0;x=y=tx=ty=0;paint();
}
function setAvailability(){
 hit.hidden=!ready||reduced.matches;resetAll();configureJourney();
}
async function loadLayers(){
 const id=++loadId;
 try{await still.decode();if(id!==loadId)return;ready=still.naturalWidth>0;}
 catch{if(id!==loadId)return;ready=false;}
 setAvailability();
}
// Mouse follows the scene even without clicking. Horizontal touch drag
// is optional; pan-y allows the browser to cancel it for native scrolling.
hero.addEventListener('pointermove',e=>{
 if(!fine.matches||e.pointerType!=='mouse'||drag||hit.hidden)return;
 const b=hero.getBoundingClientRect();
 aim((e.clientX-b.left)/b.width*2-1,(e.clientY-b.top)/b.height*2-1);
},{passive:true});
hero.addEventListener('pointerleave',()=>{if(!drag)settle()});
hit.addEventListener('pointerdown',e=>{
 if(hit.hidden||!e.isPrimary||e.button!==0||e.pointerType==='mouse'||drag)return;
 clearTimeout(pulse);moved=false;drag={id:e.pointerId,start:e.clientX};
 hit.setPointerCapture(e.pointerId);hit.dataset.dragging='true';
});
hit.addEventListener('pointermove',e=>{
 if(drag?.id!==e.pointerId)return;
 const dx=e.clientX-drag.start;if(Math.abs(dx)>5)moved=true;
 aim(dx/55,0);
});
function endDrag(e){
 if(!drag||drag.id!==e.pointerId)return;
 drag=null;delete hit.dataset.dragging;settle();
 if(hit.hasPointerCapture(e.pointerId))hit.releasePointerCapture(e.pointerId);
}
for(const type of ['pointerup','pointercancel','lostpointercapture'])hit.addEventListener(type,endDrag);
hit.addEventListener('click',e=>{
 if(e.detail===0||(!fine.matches&&!moved)){
  clearTimeout(pulse);aim(.8,-.35);pulse=setTimeout(settle,260);
 }
 moved=false;
});
fine.addEventListener('change',resetAll);
reduced.addEventListener('change',setAvailability);
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetAll()});
still.addEventListener('load',loadLayers);
// The same artwork and copy nodes persist during the native scroll journey.
const root=document.documentElement,journey=document.querySelector('.journey'),roast=document.querySelector('.espresso'),copy=hero.querySelector('.hero-copy'),header=document.querySelector('.masthead');
// Two intact campaign photographs. Pointer motion is limited to opening.
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
 const values={'--photo-layer-alpha':handoff,'--opening-alpha':out,'--opening-rise':(-18*(1-out))+'px','--roast-alpha':into,'--roast-rise':(16*(1-into))+'px','--roast-visible':into>0?'visible':'hidden','--scene-scale':1.06+.01*movement,'--scene-x':(-8*movement)+'px','--travel-x':'0px','--travel-y':'0px','--travel-angle':'0deg'};
 for(const [k,val] of Object.entries(values))hero.style.setProperty(k,String(val));
 const chapter=p<.41?'opening':p>=.70?'roast':'transition';
 if(chapter!==lastChapter){
  const old=lastChapter;lastChapter=chapter;hero.dataset.chapter=chapter;
  if(old==='opening'){if(copy.contains(document.activeElement)||document.activeElement===hit)header.querySelector('.brand').focus({preventScroll:true});resetAll()}
  if(old==='roast'&&roast.contains(document.activeElement))header.querySelector('.brand').focus({preventScroll:true});
 }
 storyLink.hidden=chapter!=='roast';
 copy.inert=chapter!=='opening';roast.inert=chapter!=='roast';const active=ready&&!reduced.matches&&chapter==='opening'&&p<.08;if(!active&&!hit.hidden){if(document.activeElement===hit)header.querySelector('.brand').focus({preventScroll:true});resetAll()}hit.hidden=!active;
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
 if(!ready||reduced.matches||hero.getBoundingClientRect().height>window.innerHeight+2){hero.style.removeProperty('--photo-layer-alpha');hit.hidden=!ready||reduced.matches;updateRoastAvailability();return}
 travel=Math.round(window.innerHeight*.92);journey.style.setProperty('--travel',travel+'px');hero.append(roast);root.dataset.journey='on';journeyActive=true;
 if(prior&&oldProgress>0&&oldProgress<1)window.scrollTo({top:journey.offsetTop+travel*oldProgress,behavior:'instant'});
 if(!prior&&location.hash==='#espresso')window.scrollTo({top:journey.offsetTop+travel,behavior:'instant'});
 updateRoastAvailability();renderJourney();
}
for(const h of [copy.querySelector('h1'),roast.querySelector('h2')])h.tabIndex=-1;
document.addEventListener('click',e=>{const a=e.target.closest('a');if(!journeyActive||!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const href=a.getAttribute('href');if(href!=='#espresso'&&href!=='#main')return;e.preventDefault();pendingFocus=href==='#espresso'?'roast':'opening';window.scrollTo({top:journey.offsetTop+(href==='#espresso'?travel:0),behavior:'smooth'});queueJourney()});
window.addEventListener('scroll',queueJourney,{passive:true});window.addEventListener('resize',()=>{resetAll();configureJourney()},{passive:true});
// Wait for the intact photograph before enabling motion.
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
