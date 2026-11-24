// Normal document navigation works without JavaScript. Native shared-element
// transitions are optional; respect the live motion preference.
const motion=matchMedia('(prefers-reduced-motion: reduce)');
addEventListener('pageswap',e=>{if(motion.matches)e.viewTransition?.skipTransition()});
addEventListener('pagereveal',e=>{if(motion.matches)e.viewTransition?.skipTransition()});
const film=document.querySelector('.case-film');
if(film){const button=document.querySelector('#film-still'),counter=document.querySelector('#film-counter'),links=[...document.querySelectorAll('.film-rail nav a')],chapters=links.map(a=>document.querySelector(a.hash));let still=false,raf=0;
function mode(){film.dataset.still=String(still||motion.matches);button.hidden=false;button.disabled=motion.matches;button.textContent=still||motion.matches?'Motion mode':'Still mode';button.setAttribute('aria-pressed',String(still||motion.matches))}
function paint(){raf=0;let i=0;for(let j=0;j<chapters.length;j++)if(chapters[j].getBoundingClientRect().top<=innerHeight*.42)i=j;const total=Math.max(1,film.offsetHeight-innerHeight),progress=Math.min(1,Math.max(0,(scrollY-film.offsetTop)/total));document.querySelector('.film-rail').style.setProperty('--film-progress',progress.toFixed(4));counter.textContent=String(i+1).padStart(2,'0')+' / 04';links.forEach((a,j)=>{if(j===i)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}
function queue(){if(!raf&&!document.hidden)raf=requestAnimationFrame(paint)}
button.addEventListener('click',()=>{still=!still;mode()});motion.addEventListener('change',mode);addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else queue()});mode();paint()}

// Native sticky folders. Geometry updates only on scroll/resize; no per-frame
// transforms and no hijacking. Keep keyboard-focused links unobscured by later
// stacked cards by jumping to their normal-flow marker.
const folderSection=document.querySelector('.folder-cases');
if(folderSection){
 const cards=[...folderSection.querySelectorAll('.case-folder')],markers=[...folderSection.querySelectorAll('.folder-marker')],links=[...folderSection.querySelectorAll('[data-folder-link]')],desktop=matchMedia('(min-width:901px) and (min-height:690px)');
 let pending=0,active=-1;
 function layout(){folderSection.dataset.stack=desktop.matches&&!motion.matches?'enabled':'static';schedule()}
 function paint(){pending=0;const top=Number.parseFloat(getComputedStyle(folderSection).getPropertyValue('--folder-top'))||22,step=Number.parseFloat(getComputedStyle(folderSection).getPropertyValue('--folder-offset'))||46;let i=-1;markers.forEach((m,n)=>{if(m.getBoundingClientRect().top<=top+n*step+3)i=n});if(i!==active){active=i;links.forEach((link,n)=>{if(n===i)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current')})}}
 function schedule(){if(!pending&&!document.hidden)pending=requestAnimationFrame(paint)}
 cards.forEach((card,i)=>card.addEventListener('focus',()=>{if(card.matches(':focus-visible')&&folderSection.dataset.stack==='enabled'){markers[i].scrollIntoView({block:'start',behavior:'instant'});schedule()}}));
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});motion.addEventListener('change',layout);desktop.addEventListener('change',layout);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(pending);pending=0}else schedule()});layout();
}

// Scroll-sampled physical pose; native links stay interactive, no input capture.
const track=document.querySelector('#proof-track'),stage=document.querySelector('#proof-stage'),grid=document.querySelector('#proof-grid'),index=document.querySelector('#work-index-live'),stillButton=document.querySelector('#proof-still');
if(track&&stage&&grid&&index&&stillButton){
 const cards=[...grid.querySelectorAll('.project-cover')],heightGate=matchMedia('(min-height:650px)'),clamp=n=>Math.max(0,Math.min(1,n));let still=false,raf=0,progress=-1;
 function render(){raf=0;const distance=track.offsetHeight-stage.offsetHeight;const raw=track.dataset.motion==='live'&&distance>1?clamp(-track.getBoundingClientRect().top/distance):1;const t=raw*raw*(3-2*raw);if(Math.abs(raw-progress)<.0001)return;progress=raw;track.style.setProperty('--pose',(1-t).toFixed(5));track.style.setProperty('--proof-progress',raw.toFixed(5));track.dataset.progress=raw.toFixed(5)}
 function schedule(){if(!raf&&!document.hidden)raf=requestAnimationFrame(render)}
 function mode(){const live=!still&&!motion.matches&&heightGate.matches;track.dataset.motion=live?'live':'still';stillButton.hidden=motion.matches||!heightGate.matches;stillButton.textContent=still?'Motion view':'Still view';stillButton.setAttribute('aria-pressed',String(still));progress=-1;render()}
 function select(card){index.textContent=String(card.dataset.collectionIndex).padStart(2,'0')+' / '+card.getAttribute('aria-label').replace(/^Explore /,'')}
 function reset(){index.textContent='Six collections / 24 marks'}
 cards.forEach(card=>{card.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')select(card)});card.addEventListener('pointerleave',()=>{if(document.activeElement!==card)reset()});card.addEventListener('focus',()=>select(card));card.addEventListener('blur',reset)});
 stillButton.addEventListener('click',()=>{still=!still;mode()});motion.addEventListener('change',mode);heightGate.addEventListener('change',mode);addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});addEventListener('pageshow',()=>{progress=-1;schedule()});document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else schedule()});mode();
}
