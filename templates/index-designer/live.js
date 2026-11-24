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

// Native sticky studies: real rectangular links, no scroll hijacking.
const studySection=document.querySelector('.study-cases');
if(studySection){
 const cards=[...studySection.querySelectorAll('.study-panel')],markers=[...studySection.querySelectorAll('.study-marker')],links=[...studySection.querySelectorAll('[data-study-link]')],heightGate=matchMedia('(min-height:690px)');
 let pending=0,active=-1;
 function layout(){studySection.dataset.stack=heightGate.matches&&!motion.matches?'enabled':'static';schedule()}
 function paint(){pending=0;const style=getComputedStyle(studySection),top=parseFloat(style.getPropertyValue('--study-top'))||20,step=parseFloat(style.getPropertyValue('--study-step'))||76;let i=-1;markers.forEach((m,n)=>{if(m.getBoundingClientRect().top<=top+n*step+4)i=n});if(i!==active){active=i;links.forEach((link,n)=>{if(n===i)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current')})}}
 function schedule(){if(!pending&&!document.hidden)pending=requestAnimationFrame(paint)}
 cards.forEach((card,i)=>card.addEventListener('focus',()=>{if(card.matches(':focus-visible')&&studySection.dataset.stack==='enabled'){markers[i].scrollIntoView({block:'start',behavior:'instant'});schedule()}}));
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});motion.addEventListener('change',layout);heightGate.addEventListener('change',layout);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(pending);pending=0}else schedule()});layout();
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

// CALIBRE-inspired scroll edit, scoped to the studio's own sticky stage.
// No global fixed overlay or perpetual animation loop.
const studio=document.querySelector('.luxury-studio');
if(studio){
 const chapters=[...studio.querySelectorAll('[data-studio-chapter]')],shots=[...studio.querySelectorAll('[data-studio-shot]')],button=document.querySelector('#studio-motion'),heightGate=matchMedia('(min-height:621px)');
 const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>n*n*(3-2*n),mix=(a,b,t)=>a+(b-a)*t;
 const poses=[{z:[1.07,1.23],x:[0,-.015],y:[.018,-.024]},{z:[1.12,1.28],x:[0,.017],y:[.012,-.025]},{z:[1.08,1.24],x:[-.01,.012],y:[.018,-.02]}];
 let still=false,raf=0;
 function paintStudio(){
  raf=0;if(document.hidden)return;
  const rects=chapters.map(c=>c.getBoundingClientRect()),vh=innerHeight;
  let i=0;while(i<rects.length-1&&rects[i+1].top<=0)i++;
  const span=Math.max(1,rects[i].height),t=clamp(-rects[i].top/span),blend=i<rects.length-1?ease(clamp((t-.58)/.42)):0;
  const live=studio.dataset.studioMode==='motion',scale=innerWidth<741?.65:1;
  // The following frame is composited over a fully opaque outgoing image.
  // This avoids a dark flash between photos and is reversible on scroll.
  shots.forEach((shot,j)=>{const pose=poses[j],e=j===i?ease(t):0;
   shot.style.setProperty('--shot-opacity',String(j===i?1:j===i+1?blend:0));
   shot.style.setProperty('--shot-zoom',String(1+(mix(...pose.z,e)-1)*scale));
   shot.style.setProperty('--shot-x',mix(...pose.x,e)*innerWidth*scale+'px');
   shot.style.setProperty('--shot-y',mix(...pose.y,e)*vh*scale+'px');
  });
  chapters.forEach((c,j)=>{const distance=rects[j].top+rects[j].height*.5-vh*.5;c.style.setProperty('--studio-type-y',live?Math.max(-24,Math.min(24,distance*.065))+'px':'0px')});
  studio.dataset.studioChapter=String(i);studio.dataset.studioBlend=blend.toFixed(4);studio.dataset.studioProgress=((i+t)/chapters.length).toFixed(4);
 }
 function scheduleStudio(){if(!raf&&!document.hidden)raf=requestAnimationFrame(paintStudio)}
 function modeStudio(){const live=!still&&!motion.matches&&heightGate.matches;studio.dataset.studioMode=live?'motion':'static';button.hidden=motion.matches||!heightGate.matches;button.textContent=live?'Still view':'Motion view';button.setAttribute('aria-pressed',String(!live));scheduleStudio()}
 button.addEventListener('click',()=>{still=!still;modeStudio()});motion.addEventListener('change',modeStudio);heightGate.addEventListener('change',modeStudio);
 addEventListener('scroll',scheduleStudio,{passive:true});addEventListener('resize',scheduleStudio,{passive:true});addEventListener('pageshow',scheduleStudio);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else scheduleStudio()});
 modeStudio();paintStudio();
}
