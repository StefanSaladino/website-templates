(()=>{'use strict';
const wind=document.querySelector('#wind'),overlay=document.querySelector('#flow-overlay'),controls=document.querySelector('#flow-controls'),speed=document.querySelector('#speed'),value=document.querySelector('#speed-value'),motion=document.querySelector('#motion'),reset=document.querySelector('#reset'),modeButtons=[...controls.querySelectorAll('[data-mode]')],tracers=[...overlay.querySelectorAll('.tracer')],hero=document.querySelector('.hero-figure'),media=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
let amount=50,mode='stream',paused=media.matches,manualPause=false,phase=0,frame=0,scrollFrame=0,last=0,visible=false,disposed=false;
function paint(){for(const p of tracers){const base=Number(p.dataset.offset);p.style.strokeDashoffset=String(-((phase+base)%19));p.style.opacity=String(.38+amount*.0042)}wind.dataset.phase=phase.toFixed(3)}
function sync(){wind.dataset.speed=String(amount);wind.dataset.mode=mode;wind.dataset.motion=paused?'still':'running';speed.value=String(amount);value.value=amount+'%';speed.setAttribute('aria-valuetext',amount+' percent');motion.textContent=paused?'Play flow':'Pause flow';motion.setAttribute('aria-pressed',String(paused));motion.disabled=media.matches;modeButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));document.querySelector('#field-label').textContent=mode==='wake'?'02 / WAKE STUDY':'01 / STREAMLINES';paint();queue()}
function queue(){if(!frame&&!disposed&&!document.hidden&&visible&&!paused&&!media.matches&&amount>0)frame=requestAnimationFrame(tick)}
function tick(now){frame=0;if(disposed||document.hidden||paused||!visible||amount===0||media.matches)return;const dt=last?Math.min(.05,(now-last)/1000):0;last=now;phase=(phase+dt*amount*.58)%1900;paint();queue()}
function stop(){cancelAnimationFrame(frame);frame=0;last=0}
function scroll(){scrollFrame=0;const r=hero.getBoundingClientRect(),p=clamp(-r.top/Math.max(1,r.height));hero.style.setProperty('--hero-scale',String(media.matches?1:1+.065*p));const w=wind.getBoundingClientRect();visible=w.bottom>0&&w.top<innerHeight;if(!visible)stop();else queue()}
function requestScroll(){if(!scrollFrame&&!disposed&&!document.hidden)scrollFrame=requestAnimationFrame(scroll)}
speed.addEventListener('input',()=>{amount=clamp(Number(speed.value),0,100);if(!amount)stop();sync()});
modeButtons.forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;sync()}));
motion.addEventListener('click',()=>{manualPause=true;paused=!paused;if(paused)stop();sync()});
reset.addEventListener('click',()=>{stop();amount=50;mode='stream';phase=0;manualPause=false;paused=media.matches;sync()});
media.addEventListener?.('change',()=>{if(media.matches){paused=true;stop()}else if(!manualPause)paused=false;sync();requestScroll()});
window.addEventListener('scroll',requestScroll,{passive:true});window.addEventListener('resize',requestScroll,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();cancelAnimationFrame(scrollFrame);scrollFrame=0}else requestScroll()});window.addEventListener('pagehide',e=>{stop();cancelAnimationFrame(scrollFrame);scrollFrame=0;if(!e.persisted)disposed=true});window.addEventListener('pageshow',requestScroll);controls.disabled=false;sync();scroll();
})();