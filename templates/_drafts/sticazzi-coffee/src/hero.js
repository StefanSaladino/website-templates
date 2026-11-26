'use strict';
// S07: real photo layers. Limited translation/tilt, never a simulated 360-degree rotation.
const hero=document.querySelector('.hero'),control=hero.querySelector('.product-control'),hit=hero.querySelector('.product-hit'),slider=hero.querySelector('#product-motion'),resetButton=hero.querySelector('.motion-reset');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'), fine=matchMedia('(hover: hover) and (pointer: fine)');
const layers=[...hero.querySelectorAll('.layer img')];
let ready=false,frame=0,x=0,y=0,v=0,tx=0,ty=0,tv=0,drag=null;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function render(){frame=0;const ease=reduced.matches?1:.17;x+=(tx-x)*ease;y+=(ty-y)*ease;v+=(tv-v)*ease;hero.style.setProperty('--x',`${x.toFixed(2)}px`);hero.style.setProperty('--y',`${y.toFixed(2)}px`);hero.style.setProperty('--bag-x',`${(v*10).toFixed(2)}px`);hero.style.setProperty('--bag-y',`${(-Math.abs(v)*3).toFixed(2)}px`);hero.style.setProperty('--bag-angle',`${(v*.75).toFixed(3)}deg`);if(Math.abs(tx-x)+Math.abs(ty-y)+Math.abs(tv-v)>.025&&!document.hidden)frame=requestAnimationFrame(render)}
function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(render)}
function change(value){slider.value=String(clamp(Math.round(value/5)*5,-100,100));tv=Number(slider.value)/100;schedule()}
function endDrag(e){if(!drag||e.pointerId!==drag.id)return;drag=null;delete hit.dataset.dragging;if(hit.hasPointerCapture(e.pointerId))hit.releasePointerCapture(e.pointerId)}
function resetCamera(){tx=ty=0;schedule()}
function resetAll(){drag=null;delete hit.dataset.dragging;tx=ty=tv=x=y=v=0;slider.value='0';cancelAnimationFrame(frame);frame=0;render()}
function setAvailability(){const enabled=ready&&!reduced.matches;hero.dataset.layers=enabled?'ready':'static';control.hidden=hit.hidden=!enabled;resetAll();configureJourney()}
async function loadLayers(){try{for(const img of layers){const source=img.parentElement.querySelector('source');source.srcset=source.dataset.srcset;img.src=img.dataset.src}await Promise.all(layers.map(img=>img.decode()));ready=layers.every(img=>img.naturalWidth>0);setAvailability()}catch{ready=false;setAvailability()}}
slider.addEventListener('input',()=>change(Number(slider.value)));resetButton.addEventListener('click',()=>change(0));
hit.addEventListener('pointerdown',e=>{if(!ready||reduced.matches||e.button!==0)return;drag={id:e.pointerId,start:e.clientX,value:Number(slider.value)};hit.setPointerCapture(e.pointerId);hit.dataset.dragging='true'});
hit.addEventListener('pointermove',e=>{if(drag?.id===e.pointerId)change(drag.value+(e.clientX-drag.start)*.8)});for(const event of ['pointerup','pointercancel','lostpointercapture'])hit.addEventListener(event,endDrag);
hero.addEventListener('pointermove',e=>{if(reduced.matches||!fine.matches||e.pointerType!=='mouse'||drag||hero.dataset.chapter!=='opening')return;const b=hero.getBoundingClientRect();tx=(.5-(e.clientX-b.left)/b.width)*8;ty=(.5-(e.clientY-b.top)/b.height)*6;schedule()},{passive:true});hero.addEventListener('pointerleave',resetCamera);reduced.addEventListener('change',setAvailability);fine.addEventListener('change',resetCamera);document.addEventListener('visibilitychange',()=>{if(document.hidden)resetAll();else schedule()});
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
  if(old==='opening'){if(copy.contains(document.activeElement))header.querySelector('.brand').focus({preventScroll:true});resetAll()}
  if(old==='roast'&&roast.contains(document.activeElement))header.querySelector('.brand').focus({preventScroll:true});
 }
 storyLink.hidden=chapter!=='roast';
 copy.inert=chapter!=='opening';roast.inert=chapter!=='roast';hit.hidden=chapter!=='opening'||p>=.08;control.inert=chapter!=='opening'||p>=.08;
 hero.style.setProperty('--filter-alpha',String(filterReady&&selected==='filter'?into:0));hero.dataset.roast=chapter==='roast'&&filterReady?selected:'espresso';productMeta.textContent=hero.dataset.roast==='filter'?filterMeta:espressoMeta;hero.dataset.progress=p.toFixed(5);header.dataset.end=String(top<-travel-4);
 if(pendingFocus==='roast'&&p>=.999){pendingFocus='';roast.querySelector('h2').focus({preventScroll:true})}
 if(pendingFocus==='opening'&&p<=.001){pendingFocus='';copy.querySelector('h1').focus({preventScroll:true})}
}
function queueJourney(){delete hero.dataset.selecting;clearTimeout(selectionTimer);if(journeyActive&&!journeyFrame)journeyFrame=requestAnimationFrame(renderJourney)}
function configureJourney(){
 // Do not pin a stage whose opening content is taller than the viewport.
 // Return to document flow before measuring the unenhanced layout.
 const prior=journeyActive,oldProgress=prior?clamp(-journey.getBoundingClientRect().top/travel,0,1):0;
 if(prior){root.removeAttribute('data-journey');journey.append(roast);copy.inert=roast.inert=control.inert=false;lastChapter='opening';hero.dataset.chapter='opening';header.removeAttribute('data-end');hero.removeAttribute('data-progress');}
 journeyActive=false;control.inert=false;storyLink.hidden=true;cancelAnimationFrame(journeyFrame);journeyFrame=0;
 if(!ready||reduced.matches||hero.getBoundingClientRect().height>window.innerHeight+2){hero.style.removeProperty('--photo-layer-alpha');hit.hidden=!ready||reduced.matches;updateRoastAvailability();return}
 travel=Math.round(window.innerHeight*.92);journey.style.setProperty('--travel',travel+'px');hero.append(roast);root.dataset.journey='on';journeyActive=true;
 if(prior&&oldProgress>0&&oldProgress<1)window.scrollTo({top:journey.offsetTop+travel*oldProgress,behavior:'instant'});
 if(!prior&&location.hash==='#espresso')window.scrollTo({top:journey.offsetTop+travel,behavior:'instant'});
 updateRoastAvailability();renderJourney();
}
for(const h of [copy.querySelector('h1'),roast.querySelector('h2')])h.tabIndex=-1;
document.addEventListener('click',e=>{const a=e.target.closest('a');if(!journeyActive||!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const href=a.getAttribute('href');if(href!=='#espresso'&&href!=='#main')return;e.preventDefault();pendingFocus=href==='#espresso'?'roast':'opening';window.scrollTo({top:journey.offsetTop+(href==='#espresso'?travel:0),behavior:'smooth'});queueJourney()});
window.addEventListener('scroll',queueJourney,{passive:true});window.addEventListener('resize',configureJourney,{passive:true});
// Do not replace the initial photograph until both independent layers decode.
if(!reduced.matches)loadLayers();else reduced.addEventListener('change',()=>{if(!reduced.matches&&!ready)loadLayers()},{once:true});

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
