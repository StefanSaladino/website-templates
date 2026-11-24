// Normal document navigation works without JavaScript. Native shared-element
// transitions are optional; respect the live motion preference.
const motion=matchMedia('(prefers-reduced-motion: reduce)');
addEventListener('pageswap',e=>{if(motion.matches)e.viewTransition?.skipTransition()});
addEventListener('pagereveal',e=>{if(motion.matches)e.viewTransition?.skipTransition()});
const film=document.querySelector('.case-film');
if(film){const button=document.querySelector('#film-still'),counter=document.querySelector('#film-counter'),links=[...document.querySelectorAll('.film-rail nav a')],chapters=links.map(a=>document.querySelector(a.hash));let still=false,raf=0;
function mode(){film.dataset.still=String(still||motion.matches);button.hidden=false;button.disabled=motion.matches;button.textContent=still||motion.matches?'Motion mode':'Still mode';button.setAttribute('aria-pressed',String(still||motion.matches))}
function paint(){raf=0;let i=0;for(let j=0;j<chapters.length;j++)if(chapters[j].getBoundingClientRect().top<=innerHeight*.42)i=j;counter.textContent=String(i+1).padStart(2,'0')+' / 04';links.forEach((a,j)=>{if(j===i)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}
function queue(){if(!raf&&!document.hidden)raf=requestAnimationFrame(paint)}
button.addEventListener('click',()=>{still=!still;mode()});motion.addEventListener('change',mode);addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else queue()});mode();paint()}
