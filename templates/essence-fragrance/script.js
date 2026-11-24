(()=>{'use strict';
const scene=document.querySelector('#light-scene'),controls=document.querySelector('#optics'),strength=document.querySelector('#strength'),value=document.querySelector('#strength-value'),motion=document.querySelector('#motion'),reset=document.querySelector('#reset'),wave=document.querySelector('#wave-field'),displacement=document.querySelector('#wave-displacement'),media=matchMedia('(prefers-reduced-motion: reduce)');
const reflectedPhoto=scene.querySelector('.light-photo'),reflection=scene.querySelector('.reflection'),photos=[...document.querySelectorAll('.opening-photo,.notes-photo')],clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const DEFAULT_STRENGTH=50;
let amount=DEFAULT_STRENGTH,animated=!media.matches,visible=false,frame=0,scrollFrame=0,phase=0,last=0,disposed=false;
function apply(){const s=amount/100;displacement.setAttribute('scale',(s*36).toFixed(2));scene.style.setProperty('--reflection-opacity',String(s===0?0:1));scene.dataset.strength=String(amount);scene.dataset.motion=animated?'running':'still';value.value=amount+'%';strength.value=String(amount);strength.setAttribute('aria-valuetext',amount+' percent');motion.textContent=animated?'Pause ripples':'Animate ripples';motion.setAttribute('aria-pressed',String(animated));motion.disabled=media.matches;paintRipple();}
function queue(){if(!frame&&!disposed&&animated&&amount>0&&visible&&!document.hidden&&!media.matches)frame=requestAnimationFrame(tick)}
function paintRipple(){
 const s=amount/100;
 // Composite a real photo transform as well as the optical filter. Updating
 // feTurbulence alone may not repaint consistently in mobile WebKit.
 const x=s*(17*Math.sin(phase*2.7)+5*Math.sin(phase*4.1)),y=s*3.2*Math.sin(phase*2.2),skew=s*1.7*Math.sin(phase*2.7+.6);
 reflection.style.setProperty('--ripple-x',x.toFixed(3)+'px');
 reflection.style.setProperty('--ripple-y',y.toFixed(3)+'px');
 reflection.style.setProperty('--ripple-skew',skew.toFixed(3)+'deg');
}
function tick(now){frame=0;if(!animated||!visible||document.hidden||media.matches||amount===0)return;if(last)phase+=Math.min(.05,(now-last)/1000);last=now;paintRipple();scene.dataset.phase=phase.toFixed(3);queue()}
function stop(){cancelAnimationFrame(frame);frame=0;last=0}
function scroll(){scrollFrame=0;if(disposed||document.hidden)return;for(const p of photos){const r=p.parentElement.getBoundingClientRect(),t=clamp(-r.top/Math.max(1,r.height));p.style.setProperty('--zoom',String(media.matches?1:1+t*.12));}const r=reflectedPhoto.getBoundingClientRect();visible=r.bottom>0&&r.top<innerHeight;if(!visible)stop();else queue()}
function requestScroll(){if(!scrollFrame&&!disposed&&!document.hidden)scrollFrame=requestAnimationFrame(scroll)}
controls.disabled=false;strength.addEventListener('input',()=>{amount=Number(strength.value);if(amount===0){animated=false;stop()}apply();queue()});motion.addEventListener('click',()=>{animated=!animated;if(animated&&amount===0)amount=DEFAULT_STRENGTH;if(!animated)stop();apply();queue()});reset.addEventListener('click',()=>{amount=DEFAULT_STRENGTH;animated=!media.matches;phase=0;stop();wave.setAttribute('baseFrequency','.009 .046');scene.dataset.phase='0.000';apply();queue()});
window.addEventListener('scroll',requestScroll,{passive:true});window.addEventListener('resize',requestScroll,{passive:true});media.addEventListener?.('change',()=>{if(media.matches){animated=false;stop()}else if(amount>0){animated=true}apply();requestScroll()});document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();cancelAnimationFrame(scrollFrame);scrollFrame=0}else requestScroll()});window.addEventListener('pagehide',e=>{if(!e.persisted){disposed=true;stop();cancelAnimationFrame(scrollFrame)}});
scene.dataset.phase='0.000';apply();scroll();
})();