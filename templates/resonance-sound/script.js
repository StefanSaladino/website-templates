(()=>{'use strict';
const field=document.querySelector('#field'),canvas=document.querySelector('#sculpture'),still=document.querySelector('.still'),frequency=document.querySelector('#frequency'),intensity=document.querySelector('#intensity'),audioButton=document.querySelector('#audio'),motionButton=document.querySelector('#motion'),reset=document.querySelector('#reset'),params=document.querySelector('#parameters'),status=document.querySelector('#audio-status'),media=matchMedia('(prefers-reduced-motion: reduce)'),bars=[...document.querySelectorAll('#spectrum i')],presets=[...document.querySelectorAll('[data-frequency]')].filter(el=>el.tagName==='BUTTON');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
let ctx=null,audio=null,osc=null,gain=null,analyser=null,spectrum=null,frequencyHz=220,level=.4,paused=media.matches,frame=0,last=0,time=0,energy=0,disposed=false,starting=false,token=0,visible=true,dirty=true,seed=4281;
const count=innerWidth<700?6200:12500,px=new Float32Array(count),py=new Float32Array(count),speck=new Float32Array(count);
function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
function modes(hz){const t=clamp((hz-110)/550),m=2+Math.floor(t*6.999),n=m+1;return [m,n]}
function wave(x,y,m,n){return Math.cos(m*Math.PI*x)*Math.cos(n*Math.PI*y)-Math.cos(n*Math.PI*x)*Math.cos(m*Math.PI*y)}
function initialize(){seed=4281;const [m,n]=modes(frequencyHz);for(let i=0;i<count;i++){let x=0,y=0;for(let k=0;k<18;k++){x=random()*2-1;y=random()*2-1;if(x*x+y*y<.93&&Math.abs(wave(x,y,m,n))<.12)break}if(x*x+y*y>.94){const d=Math.hypot(x,y);x*=.94/d;y*=.94/d}px[i]=x;py[i]=y;speck[i]=random()}}
function layout(){if(!ctx)return;const r=field.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,1.5,1100/Math.max(1,r.width,r.height));const w=Math.max(1,Math.round(r.width*ratio)),h=Math.max(1,Math.round(r.height*ratio));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}dirty=true;requestDraw()}
function syncControls(){const [m,n]=modes(frequencyHz);frequency.value=String(frequencyHz);intensity.value=String(Math.round(level*100));frequency.setAttribute('aria-valuetext',frequencyHz+' hertz');intensity.setAttribute('aria-valuetext',Math.round(level*100)+' percent');document.querySelector('#frequency-value').value=frequencyHz+' Hz';document.querySelector('#intensity-value').value=Math.round(level*100)+'%';document.querySelector('#mode-value').value=m+':'+n;field.dataset.frequency=String(frequencyHz);field.dataset.mode=m+':'+n;field.dataset.intensity=String(Math.round(level*100));field.dataset.motion=paused?'still':'running';motionButton.textContent=paused?'Play visuals':'Pause visuals';motionButton.setAttribute('aria-pressed',String(paused));motionButton.disabled=media.matches||!ctx;presets.forEach(p=>p.setAttribute('aria-pressed',String(Number(p.dataset.frequency)===frequencyHz)));if(audio&&osc&&gain){osc.frequency.setTargetAtTime(frequencyHz,audio.currentTime,.06);gain.gain.setTargetAtTime(level*.035,audio.currentTime,.05)}dirty=true;requestDraw()}
function setFrequency(v){frequencyHz=clamp(Number(v),110,660);if(paused||!visible)initialize();syncControls()}
function setIntensity(v){level=clamp(Number(v)/100);syncControls()}
function syncAudio(on,message){field.dataset.audio=on?'on':'off';audioButton.textContent=on?'Mute sound':'Enable sound';audioButton.setAttribute('aria-pressed',String(on));document.querySelector('#field-status').textContent=on?'LIVE AUDIO ANALYSIS':'SILENT STUDY';document.querySelector('#signal-label').textContent=on?'Live frequency spectrum':'Silent frequency preview';status.textContent=message;dirty=true;requestDraw()}
async function stopAudio(message='Sound off.'){token++;starting=false;const current=audio,o=osc,g=gain;audio=null;osc=null;gain=null;analyser=null;spectrum=null;energy=0;field.dataset.energy='0';syncAudio(false,message);if(current){try{if(g)g.gain.setValueAtTime(0,current.currentTime);o?.stop();o?.disconnect();g?.disconnect();await current.close()}catch{}}}
async function startAudio(){
 if(starting||audio||disposed||document.hidden||!ctx)return;
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC){syncAudio(false,'Audio is unavailable in this browser. Silent study remains available.');return}
 starting=true;const id=++token;let next;
 try{
  next=new AC();await next.resume();if(id!==token||disposed||document.hidden){await next.close();return}
  audio=next;osc=audio.createOscillator();gain=audio.createGain();analyser=audio.createAnalyser();analyser.fftSize=2048;analyser.smoothingTimeConstant=.78;spectrum=new Uint8Array(analyser.frequencyBinCount);
  osc.type='sine';osc.frequency.value=frequencyHz;gain.gain.value=0;osc.connect(gain);gain.connect(analyser);analyser.connect(audio.destination);osc.start();gain.gain.setTargetAtTime(level*.035,audio.currentTime,.09);starting=false;syncAudio(true,'Sound on. Mute at any time.');
 }catch{try{await next?.close()}catch{}if(id===token){starting=false;audio=null;osc=null;gain=null;analyser=null;spectrum=null;syncAudio(false,'Sound could not start. Silent study remains available.')}}
}
function analysis(){
 if(analyser&&spectrum){analyser.getByteFrequencyData(spectrum);const hzPerBin=audio.sampleRate/analyser.fftSize;const b=Math.round(frequencyHz/hzPerBin);energy=0;for(let i=Math.max(0,b-2);i<=Math.min(spectrum.length-1,b+2);i++)energy=Math.max(energy,spectrum[i]/255);for(let i=0;i<bars.length;i++){let sum=0;const start=Math.floor(i*1000/32/hzPerBin),end=Math.max(start+1,Math.floor((i+1)*1000/32/hzPerBin));for(let j=start;j<Math.min(end,spectrum.length);j++)sum=Math.max(sum,spectrum[j]/255);bars[i].style.setProperty('--level',Math.max(2,sum*100)+'%')}}else{energy=0;for(let i=0;i<bars.length;i++){const center=frequencyHz/1000*32;bars[i].style.setProperty('--level',(2+level*48*Math.exp(-Math.pow((i-center)/1.15,2)))+'%')}}
 field.dataset.energy=energy.toFixed(3);
}
function requestDraw(){if(!frame&&!disposed&&!document.hidden&&ctx&&(dirty||(!paused&&visible)||audio))frame=requestAnimationFrame(draw)}
function draw(now){
 frame=0;if(!ctx||document.hidden||disposed)return;const dt=last?Math.min(.04,(now-last)/1000):1/60;last=now;if(audio||dirty)analysis();
 if(!dirty&&(!visible||paused)){if(audio)requestDraw();return}
 const w=canvas.width,h=canvas.height,r=Math.min(w,h)*.45,cx=w/2,cy=h/2-8;const [m,n]=modes(frequencyHz);
 ctx.fillStyle='#101110';ctx.fillRect(0,0,w,h);
 ctx.save();ctx.translate(cx,cy);ctx.scale(r,r);
 ctx.beginPath();ctx.arc(0,0,1.01,0,Math.PI*2);ctx.strokeStyle='#40463e';ctx.lineWidth=1/r;ctx.stroke();
 ctx.beginPath();ctx.arc(0,0,1.035,0,Math.PI*2);ctx.strokeStyle='#242a24';ctx.stroke();
 for(let j=0;j<72;j++){const a=j*Math.PI/36;const outer=1.045,inner=j%6===0?1.015:1.031;ctx.beginPath();ctx.moveTo(Math.cos(a)*inner,Math.sin(a)*inner);ctx.lineTo(Math.cos(a)*outer,Math.sin(a)*outer);ctx.strokeStyle=j%6===0?'#737a70':'#41473f';ctx.stroke()}
 if(!paused&&visible){time+=dt;const force=.022+level*.065,shake=.0008+level*.002+energy*.0035,step=.006;
 for(let i=0;i<count;i++){let x=px[i],y=py[i],v=wave(x,y,m,n),gx=(wave(x+step,y,m,n)-wave(x-step,y,m,n))/(2*step),gy=(wave(x,y+step,m,n)-wave(x,y-step,m,n))/(2*step),len=Math.hypot(gx,gy)+.1;const move=clamp(v,-1,1)*force*dt*8;x-=gx/len*move;y-=gy/len*move;x+=(random()-.5)*shake;y+=(random()-.5)*shake;const rad=Math.hypot(x,y);if(rad>.97){x*=.97/rad;y*=.97/rad}px[i]=x;py[i]=y}}
 // Batch particles into three material tones. Each particle follows the field;
 // signal energy changes luminance and agitation, not a decorative equalizer.
 for(let band=0;band<3;band++){ctx.beginPath();const baseSize=(band===2?1.6:band===1?1.15:.75)/r;for(let i=band;i<count;i+=3){const x=px[i],y=py[i],size=baseSize*(.8+.45*speck[i]);ctx.rect(x,y,size,size)}const alpha=clamp([.36,.58,.86][band]*(.78+.35*level+.3*energy));ctx.fillStyle=['rgba(119,139,121,','rgba(192,202,187,','rgba(241,245,235,'][band]+alpha+')';ctx.fill()}
 ctx.restore();field.dataset.renderedFrequency=String(frequencyHz);field.dataset.renderedMode=m+':'+n;field.dataset.renderedIntensity=String(Math.round(level*100));field.dataset.frameTime=time.toFixed(3);field.dataset.renderedPaused=String(paused);dirty=false;requestDraw()
}
function resetStudy(){frequencyHz=220;level=.4;time=0;initialize();syncControls()}
function startVisuals(){try{ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw Error('Canvas unavailable');field.dataset.renderer='canvas';canvas.hidden=false;still.hidden=true;params.disabled=false;initialize();layout();syncControls()}catch{ctx=null;field.dataset.renderer='static';canvas.hidden=true;still.hidden=false;params.disabled=true;audioButton.disabled=true;status.textContent='Interactive audio and particles are unavailable in this browser.'}}
frequency.addEventListener('input',()=>setFrequency(frequency.value));intensity.addEventListener('input',()=>setIntensity(intensity.value));presets.forEach(p=>p.addEventListener('click',()=>setFrequency(p.dataset.frequency)));motionButton.addEventListener('click',()=>{paused=!paused;last=0;syncControls()});reset.addEventListener('click',resetStudy);
audioButton.disabled=false;audioButton.addEventListener('click',()=>{if(audio||starting)void stopAudio();else void startAudio()});
media.addEventListener?.('change',()=>{paused=media.matches;last=0;syncControls()});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=0;if(visible){dirty=true;requestDraw()}},{threshold:0}).observe(field);
window.addEventListener('resize',layout,{passive:true});document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;void stopAudio('Sound paused while the page was hidden. Enable it to listen again.')}else{dirty=true;requestDraw()}});window.addEventListener('pagehide',e=>{cancelAnimationFrame(frame);frame=0;void stopAudio();if(!e.persisted)disposed=true});window.addEventListener('pageshow',()=>{dirty=true;requestDraw()});startVisuals();
})();