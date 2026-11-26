'use strict';
// S08b4: translation-only desktop camera. No zoom, deformation, touch
// manipulation, or independent packaging layers. Mobile stays photographic.
const hero=document.querySelector('.hero'),still=hero.querySelector('.still img');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const fine=matchMedia('(hover: hover) and (pointer: fine)');
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
let ready=false,frame=0,x=0,y=0,tx=0,ty=0,loadId=0,opening=true;
function paint(){
 hero.style.setProperty('--x',x.toFixed(3)+'px');
 hero.style.setProperty('--y',y.toFixed(3)+'px');
}
function render(){
 frame=0;x+=(tx-x)*.18;y+=(ty-y)*.18;
 if(Math.abs(tx-x)<.04)x=tx;if(Math.abs(ty-y)<.04)y=ty;paint();
 if((x!==tx||y!==ty)&&!document.hidden)frame=requestAnimationFrame(render);
}
function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(render)}
function settle(){tx=ty=0;schedule()}
function resetAll(){cancelAnimationFrame(frame);frame=0;x=y=tx=ty=0;paint()}
function setAvailability(){resetAll();configureJourney()}
async function loadLayers(){
 const id=++loadId;
 try{await still.decode();if(id!==loadId)return;ready=still.naturalWidth>0;}
 catch{if(id!==loadId)return;ready=false;}
 setAvailability();
}
hero.addEventListener('pointermove',e=>{
 if(!fine.matches||reduced.matches||e.pointerType!=='mouse'||!ready||!opening)return;
 const b=hero.getBoundingClientRect();if(!journeyActive&&b.top< -24)return;
 tx=clamp((e.clientX-b.left)/b.width*2-1,-1,1)*12;
 ty=clamp((e.clientY-b.top)/b.height*2-1,-1,1)*8;
 schedule();
},{passive:true});
hero.addEventListener('pointerleave',settle);
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
 const p=clamp(-top/travel,0,1),out=1-smooth((p-.16)/.25),into=smooth((p-.42)/.28);
 const values={'--opening-alpha':out,'--opening-rise':(-18*(1-out))+'px','--roast-alpha':into,'--roast-rise':(16*(1-into))+'px','--roast-visible':into>0?'visible':'hidden'};
 for(const [k,val] of Object.entries(values))hero.style.setProperty(k,String(val));
 const chapter=p<.41?'opening':p>=.70?'roast':'transition';
 if(chapter!==lastChapter){
  const old=lastChapter;lastChapter=chapter;hero.dataset.chapter=chapter;
  if(old==='opening'){if(copy.contains(document.activeElement))header.querySelector('.brand').focus({preventScroll:true});resetAll()}
  if(old==='roast'&&roast.contains(document.activeElement))header.querySelector('.brand').focus({preventScroll:true});
 }
 storyLink.hidden=chapter!=='roast';
 copy.inert=chapter!=='opening';roast.inert=chapter!=='roast';const active=ready&&!reduced.matches&&chapter==='opening'&&p<.08;if(!active&&opening)resetAll();opening=active;
 hero.style.setProperty('--filter-alpha',String(filterReady&&selected==='filter'?into:0));hero.dataset.roast=chapter==='roast'&&filterReady?selected:'espresso';productMeta.textContent=hero.dataset.roast==='filter'?filterMeta:espressoMeta;hero.dataset.progress=p.toFixed(5);header.dataset.end=String(top<-travel-4);
 if(pendingFocus==='roast'&&p>=.999){pendingFocus='';roast.querySelector('h2').focus({preventScroll:true})}
 if(pendingFocus==='opening'&&p<=.001){pendingFocus='';copy.querySelector('h1').focus({preventScroll:true})}
}
function queueJourney(){delete hero.dataset.selecting;clearTimeout(selectionTimer);if(journeyActive&&!journeyFrame)journeyFrame=requestAnimationFrame(renderJourney)}
function stableHeight(){return parseFloat(getComputedStyle(hero).minHeight)||window.innerHeight}
function configureJourney(){
 // Do not pin a stage whose opening content is taller than the viewport.
 // Return to document flow before measuring the unenhanced layout.
 const prior=journeyActive,oldProgress=prior?clamp(-journey.getBoundingClientRect().top/travel,0,1):0;
 if(prior){root.removeAttribute('data-journey');journey.append(roast);copy.inert=roast.inert=false;lastChapter='opening';hero.dataset.chapter='opening';header.removeAttribute('data-end');hero.removeAttribute('data-progress');}
 journeyActive=false;storyLink.hidden=true;cancelAnimationFrame(journeyFrame);journeyFrame=0;
 if(!ready||reduced.matches||hero.getBoundingClientRect().height>stableHeight()+2){opening=ready&&!reduced.matches;updateRoastAvailability();return}
 travel=Math.round(stableHeight()*.92);journey.style.setProperty('--travel',travel+'px');hero.append(roast);root.dataset.journey='on';journeyActive=true;
 if(prior&&oldProgress>0&&oldProgress<1)window.scrollTo({top:journey.offsetTop+travel*oldProgress,behavior:'instant'});
 if(!prior&&location.hash==='#espresso')window.scrollTo({top:journey.offsetTop+travel,behavior:'instant'});
 updateRoastAvailability();renderJourney();
}
for(const h of [copy.querySelector('h1'),roast.querySelector('h2')])h.tabIndex=-1;
document.addEventListener('click',e=>{const a=e.target.closest('a');if(!journeyActive||!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const href=a.getAttribute('href');if(href!=='#espresso'&&href!=='#main')return;e.preventDefault();pendingFocus=href==='#espresso'?'roast':'opening';window.scrollTo({top:journey.offsetTop+(href==='#espresso'?travel:0),behavior:'smooth'});queueJourney()});
window.addEventListener('scroll',()=>{if(!journeyActive&&hero.getBoundingClientRect().top< -24)resetAll();queueJourney()},{passive:true});
let layoutWidth=document.documentElement.clientWidth,layoutHeight=stableHeight();
window.addEventListener('resize',()=>{const w=document.documentElement.clientWidth,h=stableHeight();if(w===layoutWidth&&Math.abs(h-layoutHeight)<1)return;layoutWidth=w;layoutHeight=h;resetAll();configureJourney()},{passive:true});
// Wait for the intact photograph before enabling motion.
loadLayers();

// Decode the alternate artwork only after the initial opening has loaded.
if(document.readyState==='complete')loadFilter();else window.addEventListener('load',loadFilter,{once:true});

// S08d: one-shot editorial text entrance, never a photo transform.
const lastWord=document.querySelector('.last-word');
if('IntersectionObserver' in window&&!reduced.matches){
 const closingObserver=new IntersectionObserver(entries=>{
  if(entries.some(entry=>entry.isIntersecting)){
   lastWord.dataset.revealed='true';closingObserver.disconnect();
  }
 },{threshold:.18});
 closingObserver.observe(lastWord);
}
