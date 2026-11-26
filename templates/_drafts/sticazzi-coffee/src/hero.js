'use strict';
// S08b2: direct manipulation of a real, rigid mesh. Photograph fallback.
const hero=document.querySelector('.hero'),hit=hero.querySelector('.product-hit');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const still=hero.querySelector('.still img'),camera=hero.querySelector('.scene-camera');
const stage=document.createElement('div');stage.className='model-stage';stage.hidden=true;stage.setAttribute('aria-hidden','true');
const canvas=document.createElement('canvas');canvas.className='product-motion-canvas';stage.append(canvas);
camera.insertBefore(stage,camera.querySelector('.filter-still'));
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const rest=-22;
let model=null,ready=false,frame=0,v=0,tv=0,drag=null,pulse=0,moved=false;
function drawMotion(){
 if(!model||reduced.matches||stage.hidden)return;
 model.draw(rest+v);
 hero.dataset.turnAngle=v.toFixed(2);hero.dataset.modelYaw=(rest+v).toFixed(2);
 hero.dataset.visibleFace=Math.cos((rest+v)*Math.PI/180)<-.42?'back':Math.abs(Math.sin((rest+v)*Math.PI/180))>.70?'side':'front';
}
function render(){frame=0;v+=(tv-v)*.28;if(Math.abs(tv-v)<.15)v=tv;drawMotion();if(v!==tv&&!document.hidden)frame=requestAnimationFrame(render)}
function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(render)}
function nudge(){if(!model||reduced.matches||hit.hidden)return;clearTimeout(pulse);tv=95;schedule();pulse=setTimeout(()=>{tv=0;schedule()},420)}
function resetAll(){
 const id=drag?.id;drag=null;delete hit.dataset.dragging;
 if(id!==undefined&&hit.hasPointerCapture(id))hit.releasePointerCapture(id);
 clearTimeout(pulse);cancelAnimationFrame(frame);frame=0;tv=v=0;drawMotion();
}
function endDrag(e){
 if(!drag||e.pointerId!==drag.id)return;
 drag=null;delete hit.dataset.dragging;tv=0;schedule();
 if(hit.hasPointerCapture(e.pointerId))hit.releasePointerCapture(e.pointerId);
}
function setAvailability(){
 const enabled=!!model&&!reduced.matches;
 stage.hidden=!enabled;hero.dataset.model=enabled?'ready':'static';hit.hidden=!enabled;resetAll();configureJourney();
}
async function loadLayers(){
 try{await still.decode();ready=still.naturalWidth>0;}catch{ready=false;}
 if(ready&&!reduced.matches&&!model){
  try{const photo=new Image();photo.src='assets/hero.webp';await photo.decode();if(reduced.matches)return setAvailability();
   model=window.createSticazziBag(canvas,photo);hero.dataset.meshTriangles=String(model.triangles);hero.dataset.meshDepth=String(model.depth);
  }catch{model=null;}
 }
 setAvailability();
}
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();model=null;setAvailability();});
hit.addEventListener('pointerdown',e=>{
 if(!model||reduced.matches||e.button!==0||!e.isPrimary||drag)return;
 clearTimeout(pulse);moved=false;drag={id:e.pointerId,start:e.clientX,angle:v};
 hit.setPointerCapture(e.pointerId);hit.dataset.dragging='true';
});
hit.addEventListener('pointermove',e=>{
 if(drag?.id!==e.pointerId)return;const dx=e.clientX-drag.start;
 if(Math.abs(dx)>5)moved=true;
 tv=clamp(drag.angle+dx*1.85,-180,180);schedule();
});
for(const event of ['pointerup','pointercancel','lostpointercapture'])hit.addEventListener(event,endDrag);
hit.addEventListener('click',e=>{if(e.detail===0||!moved)nudge();moved=false});
reduced.addEventListener('change',()=>{if(!reduced.matches&&!model)loadLayers();else setAvailability()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetAll();else drawMotion()});
// The same artwork and copy nodes persist during the native scroll journey.
const root=document.documentElement,journey=document.querySelector('.journey'),roast=document.querySelector('.espresso'),copy=hero.querySelector('.hero-copy'),header=document.querySelector('.masthead');
// Espresso retains the rigid model through the scroll journey; Filter uses its matched plate.
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
 copy.inert=chapter!=='opening';roast.inert=chapter!=='roast';const active=ready&&!!model&&!reduced.matches&&chapter==='opening'&&p<.08;if(!active&&!hit.hidden){if(document.activeElement===hit)header.querySelector('.brand').focus({preventScroll:true});resetAll()}hit.hidden=!active;
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
 if(!ready||reduced.matches||hero.getBoundingClientRect().height>window.innerHeight+2){hero.style.removeProperty('--photo-layer-alpha');hit.hidden=!ready||!model||reduced.matches;updateRoastAvailability();return}
 travel=Math.round(window.innerHeight*.92);journey.style.setProperty('--travel',travel+'px');hero.append(roast);root.dataset.journey='on';journeyActive=true;
 if(prior&&oldProgress>0&&oldProgress<1)window.scrollTo({top:journey.offsetTop+travel*oldProgress,behavior:'instant'});
 if(!prior&&location.hash==='#espresso')window.scrollTo({top:journey.offsetTop+travel,behavior:'instant'});
 updateRoastAvailability();renderJourney();
}
for(const h of [copy.querySelector('h1'),roast.querySelector('h2')])h.tabIndex=-1;
document.addEventListener('click',e=>{const a=e.target.closest('a');if(!journeyActive||!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const href=a.getAttribute('href');if(href!=='#espresso'&&href!=='#main')return;e.preventDefault();pendingFocus=href==='#espresso'?'roast':'opening';window.scrollTo({top:journey.offsetTop+(href==='#espresso'?travel:0),behavior:'smooth'});queueJourney()});
window.addEventListener('scroll',queueJourney,{passive:true});window.addEventListener('resize',()=>{resetAll();configureJourney();drawMotion()},{passive:true});
// Retain the intact photograph until the model is ready.
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
