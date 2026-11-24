import {frame,ink,clamp} from './track.js?v=4';
const root=document.documentElement,stage=document.querySelector('#stage'),story=document.querySelector('#story'),art=document.querySelector('#art'),button=document.querySelector('#still'),status=document.querySelector('#status'),reduce=matchMedia('(prefers-reduced-motion: reduce)'),forced=matchMedia('(forced-colors: active)');
const probe=document.createElement('div');probe.className='height-probe';probe.setAttribute('aria-hidden','true');document.body.append(probe);
let enabled=false,manual=false,raf=0,layout=0,w=0,h=0,travel=1,top=0,small=false,progress=NaN,lastTime=0,last=-1,signature='',resume=null,draws=0,layouts=0;
const trace=new URLSearchParams(location.search).has('motion-debug')?{frames:[]}:null;if(trace)window.__selvedgeMotionTrace=trace;
const cache=new Map(),set=(k,v)=>{v=String(v);if(cache.get(k)!==v){stage.style.setProperty(k,v);cache.set(k,v)}};
const viewport=()=>Math.floor(probe.offsetHeight||innerHeight);
const key=()=>[innerWidth,viewport(),visualViewport?.scale||1,reduce.matches,forced.matches,manual,stage.querySelector('.mast').offsetHeight,stage.querySelector('.lead').offsetHeight,stage.querySelector('.intro').offsetHeight].join(':');
function render(p){const f=frame(p,small,w,h);set('--bg',`rgb(${f.r},${f.g},${f.b})`);set('--fg',ink(f.r,f.g,f.b));set('--type',`rgb(${[f.r,f.g,f.b].map(v=>Math.round(v*.8+18)).join(',')})`);set('--gx',f.x+'px');set('--gy',f.y+'px');set('--garment-base',w+'px');set('--garment-scale',(f.width/w).toFixed(6));set('--rot',f.angle+'deg');set('--detail-scale',f.detail.toFixed(5));set('--a',f.a);set('--b',f.m);set('--c',f.c);set('--ta',(-p*innerWidth*.12)+'px');set('--tb',((.5-p)*innerWidth*.15)+'px');set('--tc',((1-p)*innerWidth*.1)+'px');stage.dataset.progress=p.toFixed(6);stage.dataset.pose=[f.x,f.y,f.width,f.angle,f.detail].map(v=>v.toFixed(3)).join(',');stage.dataset.bounds=JSON.stringify({left:f.x-f.rx,right:f.x+f.rx,top:f.y-f.ry,bottom:f.y+f.ry});stage.dataset.detailScale=f.detail.toFixed(5);stage.dataset.draws=String(++draws);last=p}
function tick(now){raf=0;if(!enabled||document.hidden||layout)return;const y=scrollY;if(y+innerHeight<=top||y>=top+travel+viewport()){progress=NaN;lastTime=0;return}const target=clamp((y-top)/travel,0,1),dt=lastTime?clamp(now-lastTime,1,48):16.667;lastTime=now;if(!Number.isFinite(progress))progress=target;else{progress+= (target-progress)*(-Math.expm1(-dt/42));if(Math.abs(progress-target)<.00018)progress=target}if(last!==progress){render(progress);if(trace&&trace.frames.length<12000)trace.frames.push({time:now,progress,target,layout:layouts})}const settled=progress===target;if(stage.dataset.settled!==String(settled))stage.dataset.settled=String(settled);if(!settled)queue();else lastTime=0}
function queue(){if(enabled&&!raf&&!document.hidden)raf=requestAnimationFrame(tick)}
// One layout transaction. Distinguish a reader in the campaign from someone
// in ordinary content; preserve the latter's reading anchor instead of
// resurrecting a previously saved motion progress.
function setup(){
 if(layout)cancelAnimationFrame(layout);layout=0;cancelAnimationFrame(raf);raf=0;
 const y=scrollY,was=enabled,lower=document.querySelector('#construction'),oldLower=lower.getBoundingClientRect().top,oldStage=stage.getBoundingClientRect(),focused=document.activeElement;
 const lowerFocus=!!focused?.closest('#construction,#edition,footer'),inside=was?y<=top+travel+1&&oldStage.bottom>0&&!lowerFocus:oldStage.bottom>0&&oldStage.top<innerHeight&&oldLower>0&&!lowerFocus;
 const below=lowerFocus||oldLower<=0||was&&!inside;
 if(was&&inside)resume=clamp((y-top)/travel,0,1);else if(below)resume=null;
 const height=viewport();let reason=reduce.matches?'reduced motion':forced.matches?'forced colours':height<510?'short viewport':(visualViewport?.scale||1)>1.05?'zoom':manual?'manual still':'';
 enabled=!reason;root.classList.toggle('motion',enabled);cache.clear();stage.removeAttribute('style');small=innerWidth<1000;
 // Set control geometry before measuring the grid; the manual control remains
 // visible in both states but must not offer animation when system policy forbids it.
 button.hidden=!!reason&&reason!=='manual still';button.setAttribute('aria-pressed',String(!enabled));
 if(enabled){
  travel=Math.round(height*(small?1.45:1.6));root.style.setProperty('--stage-h',height+'px');root.style.setProperty('--travel',travel+'px');
  top=story.getBoundingClientRect().top+scrollY;const r=art.getBoundingClientRect(),s=stage.getBoundingClientRect();w=r.width;h=r.height;
  const fits=['.mast','.lead','.intro'].every(sel=>{const b=stage.querySelector(sel).getBoundingClientRect();return b.top>=s.top-1&&b.bottom<=s.bottom+1&&b.left>=s.left-1&&b.right<=s.right+1});
  if(h<120||w<140||!fits||stage.scrollHeight>stage.clientHeight+2){enabled=false;reason='insufficient space';root.classList.remove('motion');button.hidden=true;button.setAttribute('aria-pressed','true')}
 }
 if(focused===button&&button.hidden)stage.querySelector('.intro .text-link').focus({preventScroll:true});
 stage.dataset.mode=enabled?'live':'static';stage.dataset.reason=reason;stage.dataset.layout=String(++layouts);stage.dataset.layoutWidth=String(innerWidth);stage.dataset.layoutHeight=String(height);
 status.textContent=enabled?'Scroll-driven photographic editorial.':'Static photographic editorial.';progress=NaN;lastTime=0;last=-1;
 if(enabled){
  stage.dataset.settled='false';
  if(inside&&resume!==null)scrollTo(0,Math.round(top+resume*travel));else if(below)scrollTo(0,scrollY+lower.getBoundingClientRect().top-oldLower);
  stage.dataset.travel=String(travel);stage.dataset.top=String(top);queue();
 }else{
  if(was&&inside)scrollTo(0,top);else if(below)scrollTo(0,scrollY+lower.getBoundingClientRect().top-oldLower);
  stage.dataset.settled='true';stage.dataset.detailScale='1';stage.dataset.progress='0.000000';stage.dataset.pose='static';delete stage.dataset.bounds;
 }
 signature=key();
}
function schedule(){if(key()!==signature&&!layout)layout=requestAnimationFrame(setup)}
button.addEventListener('click',()=>{manual=!manual;setup()});addEventListener('scroll',()=>{if(!enabled&&document.querySelector('#construction').getBoundingClientRect().top<=0)resume=null;queue()},{passive:true});addEventListener('resize',schedule,{passive:true});visualViewport?.addEventListener('resize',schedule,{passive:true});reduce.addEventListener('change',schedule);forced.addEventListener('change',schedule);const observer=new ResizeObserver(schedule);for(const n of [probe,stage.querySelector('.mast'),stage.querySelector('.lead'),stage.querySelector('.intro')])observer.observe(n);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;lastTime=0}else queue()});setup();
