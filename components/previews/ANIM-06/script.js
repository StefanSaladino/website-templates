const stories=[{date:'12 DEC / 2026',title:'Open studio weekend.',description:'An evening of objects, talk and late coffee.'},{date:'16 JAN / 2027',title:'A workshop on colour.',description:'Three hands-on experiments with print and paper.'},{date:'06 FEB / 2027',title:'The makers market.',description:'Small studios and their useful objects under one roof.'}];
const message=document.querySelector('#a6-message'),reduce=matchMedia('(prefers-reduced-motion: reduce)'),play=document.querySelector('#a6-play'),status=document.querySelector('#a6-status');let index=0,timer=null,playing=false;
function stopRotation(){if(timer)clearInterval(timer);timer=null;playing=false;play.setAttribute('aria-pressed','false');play.textContent='Play rotation'}
function show(i,manual=false){
 index=(i+stories.length)%stories.length;const story=stories[index];
 document.querySelector('#a6-date').textContent=story.date;
 document.querySelector('#a6-title').textContent=story.title;
 document.querySelector('#a6-description').textContent=story.description;
 document.querySelector('#a6-position').textContent=String(index+1).padStart(2,'0')+' / 03';
 message.classList.remove('is-changing');
 if(!reduce.matches&&!document.hidden){void message.offsetWidth;message.classList.add('is-changing')}
 if(manual)status.textContent='Showing event '+(index+1)+' of '+stories.length+'.';
}
function startRotation(){
 if(reduce.matches){status.textContent='Reduced motion is enabled. Use Previous or Next.';return}
 if(document.hidden)return;
 timer=setInterval(()=>show(index+1),4800);playing=true;play.setAttribute('aria-pressed','true');play.textContent='Pause rotation';status.textContent='Event rotation playing. You can pause at any time.';
}
document.querySelector('#a6-prev').addEventListener('click',()=>show(index-1,true));
document.querySelector('#a6-next').addEventListener('click',()=>show(index+1,true));
play.addEventListener('click',()=>{if(playing){stopRotation();status.textContent='Event rotation paused.'}else startRotation()});
reduce.addEventListener('change',event=>{if(event.matches){stopRotation();message.classList.remove('is-changing');status.textContent='Reduced motion enabled. Rotation stopped.'}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopRotation()});
