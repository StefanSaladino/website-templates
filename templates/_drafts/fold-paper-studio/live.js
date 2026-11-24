import {geometry,advance,clamp,PANELS} from './geometry.js?v=1';
const root=document.documentElement,scene=document.querySelector('#scene'),sheet=document.querySelector('#sheet'),controls=document.querySelector('#controls'),range=document.querySelector('#openness'),output=document.querySelector('#amount'),status=document.querySelector('#status'),reduce=matchMedia('(prefers-reduced-motion: reduce)'),forced=matchMedia('(forced-colors: active)');
let target=.45,current=.45,pw=0,ph=0,raf=0,last=0,draws=0,drag=null,enabled=false;
const panels=Array.from({length:PANELS},(_,i)=>{const n=document.createElement('div');n.className='panel';n.style.setProperty('--offset',i);n.innerHTML='<div class="panel-content"><div class="printed"><strong>FOLD</strong><small>FORM / 001<br>SPACE BETWEEN</small><b></b></div></div>';sheet.append(n);return n});
function paint(){
 const planes=geometry(current,pw);
 for(let i=0;i<planes.length;i++){const p=planes[i],n=panels[i];n.style.transform='translate3d('+p.x.toFixed(5)+'px,0,'+p.z.toFixed(5)+'px) rotateY('+(p.angle*180/Math.PI).toFixed(5)+'deg)';n.style.setProperty('--shade',p.shade.toFixed(5))}
 scene.dataset.openness=current.toFixed(6);scene.dataset.target=target.toFixed(6);scene.dataset.draws=String(++draws);scene.dataset.settled=String(current===target);
}
function queue(){if(enabled&&!raf&&!document.hidden)raf=requestAnimationFrame(tick)}
function tick(now){raf=0;if(!enabled||document.hidden)return;current=reduce.matches?target:advance(current,target,last?now-last:16.667);last=now;paint();if(current!==target)queue();else last=0}
function measure(){if(!enabled)return;const w=scene.clientWidth,h=scene.clientHeight;const next=Math.max(12,Math.min(w*(innerWidth<=740?.88:.82)/8,h*.79/3.1));if(Math.abs(pw-next)<.01)return;pw=next;ph=pw*3.1;sheet.style.setProperty('--pw',pw+'px');sheet.style.setProperty('--ph',ph+'px');paint()}
function select(value,announce=false){target=clamp(value,0,1);range.value=String(Math.round(target*100));output.value=range.value+'%';for(const b of controls.querySelectorAll('[data-open]'))b.setAttribute('aria-pressed',String(+b.dataset.open===+range.value));if(reduce.matches){current=target;paint()}else queue();if(announce)status.textContent='Sheet '+range.value+' percent open.'}
function configure(){enabled=CSS.supports('transform-style','preserve-3d')&&!forced.matches;root.classList.toggle('interactive',enabled);controls.hidden=!enabled;scene.dataset.mode=enabled?'3d':'static';if(!enabled){cancelAnimationFrame(raf);raf=0;drag=null;return}measure();if(reduce.matches)current=target;select(target);paint()}
range.addEventListener('input',()=>select(+range.value/100));range.addEventListener('change',()=>select(+range.value/100,true));controls.addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(b)select(+b.dataset.open/100,true)});
// Horizontal drag is optional. Native vertical touch scrolling remains enabled.
scene.addEventListener('pointerdown',e=>{if(!enabled||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,start:target,active:false}});
scene.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.active){if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){drag=null;return}if(Math.abs(dx)<8)return;drag.active=true;scene.setPointerCapture(e.pointerId)}select(drag.start+dx/Math.max(150,scene.clientWidth*.7))});
function release(e){if(drag?.id!==e.pointerId)return;if(drag.active)select(target,true);drag=null}scene.addEventListener('pointerup',release);scene.addEventListener('pointercancel',release);scene.addEventListener('lostpointercapture',release);
new ResizeObserver(measure).observe(scene);reduce.addEventListener('change',configure);forced.addEventListener('change',configure);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0}else if(current!==target)queue()});configure();

const registration=document.querySelector('#registration'),registrationToggle=document.querySelector('#registration-toggle'),registrationScene=document.querySelector('#registration-scene'),registrationLabel=document.querySelector('#registration-label'),registrationStatus=document.querySelector('#registration-status');
let separated=false;
function registrationState(announce=false){registration.dataset.separated=String(separated);registrationToggle.setAttribute('aria-pressed',String(separated));registrationToggle.textContent=separated?'Align ink layers':'Separate ink layers';registrationLabel.textContent=separated?'SEPARATED / TWO INKS + PAPER':'REGISTERED / TWO INKS';registrationScene.setAttribute('aria-label',separated?'Separated print: paper substrate, indigo F R M impression, and vermilion O impression':'Registered print: dark F, R and M, a red O, and paper substrate');if(announce)registrationStatus.textContent=registrationLabel.textContent}
registrationToggle.addEventListener('click',()=>{separated=!separated;registrationState(true)});
function registrationPreference(){const available=CSS.supports('transform-style','preserve-3d')&&!forced.matches;registrationToggle.hidden=!available;if(!available){separated=false;registrationState()}}
forced.addEventListener('change',registrationPreference);registrationPreference();registrationState();
