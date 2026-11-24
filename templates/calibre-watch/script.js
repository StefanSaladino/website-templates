(() => {
'use strict';
const film=document.querySelector('#film'),sections=[...film.querySelectorAll('[data-shot]')],links=[...document.querySelectorAll('[data-jump]')],button=document.querySelector('#motion'),counter=document.querySelector('#film-counter'),bar=document.querySelector('#film-progress'),media=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t,ease=t=>t*t*(3-2*t);
const keyframes=[{zoom:[1.06,1.22],x:[0,-.016],y:[.015,-.025]},{zoom:[1.12,1.28],x:[0,.015],y:[0,-.022]},{zoom:[1.22,1.32],x:[0,-.01],y:[0,-.012]}];
let still=media.matches,override=false,frame=0,disposed=false;
function applyMode(){film.dataset.cinematic=still?'still':'motion';button.disabled=media.matches;button.textContent=still?'Motion mode':'Still mode';button.setAttribute('aria-pressed',String(still));queue();}
function render(){
 frame=0;if(disposed||document.hidden)return;
 const y=scrollY,offsets=sections.map(el=>el.getBoundingClientRect().top+y),last=sections.length-1;
 let i=0;while(i<last&&y>=offsets[i+1]-2)i++;
 const next=Math.min(i+1,last),t=i===last?clamp((y-offsets[i])/Math.max(1,sections[i].offsetHeight-innerHeight)):clamp((y-offsets[i])/Math.max(1,offsets[next]-offsets[i]));
 // Cross-dissolve only over the closing portion of each shot; the incoming
 // shot begins at its opening pose. No wall-clock state: scroll is the edit.
 const blend=i===last?0:ease(clamp((t-.58)/.42)),mobile=innerWidth<700,scale=mobile ? .65 : 1;
 sections.forEach((el,j)=>{
  const active=j===i,incoming=j===next&&next!==i;
  const p=active?t:0,k=keyframes[j],e=ease(p);
  const opacity=active?1:incoming?blend:0;
  const shot=el.querySelector('.shot');
  shot.style.setProperty('--opacity',String(opacity));
  shot.style.setProperty('--zoom',String(1+(mix(...k.zoom,e)-1)*scale));
  shot.style.setProperty('--pan-x',mix(...k.x,e)*innerWidth*scale+'px');
  shot.style.setProperty('--pan-y',mix(...k.y,e)*innerHeight*scale+'px');
  const r=el.getBoundingClientRect(),center=r.top+r.height*.5-innerHeight*.5;
  const fade=clamp(1-Math.max(0,Math.abs(center)-innerHeight*.34)/(innerHeight*.55));
  el.style.setProperty('--type-y',clamp(center,-innerHeight*.35,innerHeight*.35)*.12+'px');
  el.style.setProperty('--type-opacity',String(Math.max(.15,fade)));
 });
 const current=sections[i].id;film.dataset.chapter=current;film.dataset.progress=((i+t)/(last+1)).toFixed(4);film.dataset.blend=blend.toFixed(4);
 counter.textContent=String(i+1).padStart(2,'0')+' / '+String(sections.length).padStart(2,'0');
 bar.style.setProperty('--progress',Math.min(100,(i+t)/(last+1)*100)+'%');
 links.forEach(link=>{if(link.dataset.jump===current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});
}
function queue(){if(!frame&&!disposed&&!document.hidden)frame=requestAnimationFrame(render)}
window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue,{passive:true});
button.addEventListener('click',()=>{override=true;still=!still;applyMode()});
media.addEventListener?.('change',()=>{if(media.matches)still=true;else if(!override)still=false;applyMode()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else queue()});
window.addEventListener('pagehide',e=>{if(!e.persisted){disposed=true;cancelAnimationFrame(frame)}});
// Fixed off-screen shots would otherwise be considered visible for lazy loading.
// Keep native lazy loading in still mode; in motion mode decode the next shot
// on demand via the browser, retaining a solid fallback until it loads.
applyMode();render();
})();
