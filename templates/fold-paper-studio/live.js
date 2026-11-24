import {geometry,advance,clamp,PANELS} from './geometry.js?v=1';
const root=document.documentElement,scene=document.querySelector('#scene'),sheet=document.querySelector('#sheet'),controls=document.querySelector('#controls'),range=document.querySelector('#openness'),output=document.querySelector('#amount'),status=document.querySelector('#status'),reduce=matchMedia('(prefers-reduced-motion: reduce)'),forced=matchMedia('(forced-colors: active)');
let target=.45,current=.45,pw=0,ph=0,raf=0,last=0,draws=0,drag=null,enabled=false;
const trace=new URLSearchParams(location.search).has('motion-debug')?{frames:[]}:null;if(trace)window.__foldTrace=trace;
const paperShadow=document.querySelector("#paper-shadow");
const panels=Array.from({length:PANELS},(_,i)=>{const n=document.createElement('div');n.className='panel';n.style.setProperty('--offset',i);n.innerHTML='<div class="panel-content"><div class="printed"><strong>FOLD</strong><small>F/01<br>THE SPACE BETWEEN</small><b></b><i class="print-stripe"></i></div></div>';sheet.append(n);return n});
function paint(){
 const planes=geometry(current,pw);
 for(let i=0;i<planes.length;i++){const p=planes[i],n=panels[i];n.style.transform='translate3d('+p.x.toFixed(5)+'px,0,'+p.z.toFixed(5)+'px) rotateY('+(p.angle*180/Math.PI).toFixed(5)+'deg)';n.style.setProperty('--shade',p.shade.toFixed(5))}
 paperShadow.style.transform='translate(-50%,-50%) scaleX('+(.38+.62*Math.cos((1-current)*Math.PI*.385)).toFixed(4)+')';
 scene.dataset.openness=current.toFixed(6);scene.dataset.target=target.toFixed(6);scene.dataset.draws=String(++draws);scene.dataset.settled=String(current===target);
}
function queue(){if(enabled&&!raf&&!document.hidden)raf=requestAnimationFrame(tick)}
function tick(now){raf=0;if(!enabled||document.hidden)return;current=reduce.matches?target:advance(current,target,last?now-last:16.667);last=now;paint();if(trace&&trace.frames.length<12000)trace.frames.push({time:now,openness:current,target,draws});if(current!==target)queue();else last=0}
function measure(){if(!enabled)return;const w=scene.clientWidth,h=scene.clientHeight;// Reserve the rolled sheet's full vertical footprint, not only its unrotated height.
 const compact=innerWidth<=740,roll=8*Math.PI/180,tilt=18*Math.PI/180;
 const verticalEnvelope=(3.1*Math.cos(roll)+8*Math.sin(roll))*Math.cos(tilt)+Math.sin(tilt);
 const next=Math.max(12,Math.min(w*(compact?.88:.82)/8,h*(compact?.88:.84)/verticalEnvelope));if(Math.abs(pw-next)<.01)return;pw=next;ph=pw*3.1;sheet.style.setProperty('--pw',pw+'px');sheet.style.setProperty('--ph',ph+'px');paint()}
function select(value,announce=false){target=Math.round(clamp(value,0,1)*100)/100;scene.dataset.target=target.toFixed(6);scene.dataset.settled=String(current===target);range.value=String(Math.round(target*100));output.value=range.value+'%';for(const b of controls.querySelectorAll('[data-open]'))b.setAttribute('aria-pressed',String(+b.dataset.open===+range.value));if(reduce.matches){cancelAnimationFrame(raf);raf=0;last=0;if(current!==target){current=target;paint()}}else if(current!==target)queue();if(announce)status.textContent='Sheet '+range.value+' percent open.'}
function configure(){const focused=controls.contains(document.activeElement);enabled=CSS.supports('transform-style','preserve-3d')&&!forced.matches;if(!enabled&&focused)document.querySelector('#title').focus({preventScroll:true});root.classList.toggle('interactive',enabled);controls.hidden=!enabled;scene.dataset.mode=enabled?'3d':'static';cancelAnimationFrame(raf);raf=0;last=0;if(!enabled){drag=null;scene.dataset.settled='true';return}measure();if(reduce.matches)current=target;select(target);paint()}
range.addEventListener('input',()=>select(+range.value/100));range.addEventListener('change',()=>select(+range.value/100,true));controls.addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(b)select(+b.dataset.open/100,true)});
// Horizontal drag is optional. Native vertical touch scrolling remains enabled.
scene.addEventListener('pointerdown',e=>{if(!enabled||e.button!==0||!e.isPrimary||drag)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,start:target,active:false}});
scene.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.active){if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){drag=null;return}if(Math.abs(dx)<8)return;drag.active=true;scene.setPointerCapture(e.pointerId)}select(drag.start+dx/Math.max(150,scene.clientWidth*.7))});
function release(e){if(drag?.id!==e.pointerId)return;if(drag.active)select(target,true);drag=null}scene.addEventListener('pointerup',release);scene.addEventListener('pointercancel',release);scene.addEventListener('lostpointercapture',release);window.addEventListener('pointerup',release);window.addEventListener('pointercancel',release);
new ResizeObserver(measure).observe(scene);reduce.addEventListener('change',configure);forced.addEventListener('change',configure);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0}else if(current!==target)queue()});configure();

const registration=document.querySelector('#registration'),registrationToggle=document.querySelector('#registration-toggle'),registrationScene=document.querySelector('#registration-scene'),registrationLabel=document.querySelector('#registration-label'),registrationStatus=document.querySelector('#registration-status');
let separated=false;
function registrationState(announce=false){registration.dataset.separated=String(separated);registrationToggle.setAttribute('aria-pressed',String(separated));registrationToggle.textContent=separated?'Align ink layers':'Separate ink layers';registrationLabel.textContent=separated?'SEPARATED / TWO INKS + PAPER':'REGISTERED / TWO INKS';registrationScene.setAttribute('aria-label',separated?'Separated print: paper substrate, graphite F R M impression, and vermilion O impression':'Registered print: dark F, R and M, a red O, and paper substrate');if(announce)registrationStatus.textContent=registrationLabel.textContent}
registrationToggle.addEventListener('click',()=>{separated=!separated;registrationState(true)});
function registrationPreference(){const available=CSS.supports('transform-style','preserve-3d')&&!forced.matches,focused=document.activeElement===registrationToggle;if(!available&&focused)document.querySelector('#registration-heading').focus({preventScroll:true});registrationToggle.hidden=!available;if(!available){separated=false;registrationState()}}
forced.addEventListener('change',registrationPreference);registrationPreference();registrationState();

// One original vector sculpture per visible section. CSS compositor
// animation only; no canvas, JS animation loop or continuous rasterization.
const spaces=[...document.querySelectorAll('.spatial-set')],ambientToggle=document.querySelector('#ambient-toggle'),visibleSpaces=new Set();
let ambientPaused=false;
function ambientState(){
 const allowed=!reduce.matches&&!forced.matches&&'IntersectionObserver' in window;
 if(!allowed&&document.activeElement===ambientToggle)document.querySelector('#title').focus({preventScroll:true});
 ambientToggle.hidden=!allowed;ambientToggle.setAttribute('aria-pressed',String(ambientPaused));ambientToggle.textContent=ambientPaused?'Resume atmosphere':'Pause atmosphere';
 for(const node of spaces)node.dataset.running=String(allowed&&!ambientPaused&&!document.hidden&&visibleSpaces.has(node));
}
ambientToggle.addEventListener('click',()=>{ambientPaused=!ambientPaused;ambientState()});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting)visibleSpaces.add(e.target);else visibleSpaces.delete(e.target)}ambientState()},{threshold:.01});for(const node of spaces)observer.observe(node)}
reduce.addEventListener('change',ambientState);forced.addEventListener('change',ambientState);document.addEventListener('visibilitychange',ambientState);ambientState();
