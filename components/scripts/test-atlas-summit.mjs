import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdirSync,existsSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import http from 'node:http';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,'components/atlas-summit-evidence');mkdirSync(out,{recursive:true});
const draft=path.join(root,'templates/_drafts/atlas-terrain');
const url='http://127.0.0.1:4341/templates/_drafts/atlas-terrain/index.html';
const server=spawn('python3',['-m','http.server','4341','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
function auditSummit(terrain,volume,state,aspect){
 const n=32, [nx,ny,nz]=volume.dims;
 const sample=point=>{
   const q=point.map((w,i)=>(w-volume.origin[i])/volume.extent[i]*volume.dims[i]-.5);
   if(q.some((w,i)=>w<-.5||w>volume.dims[i]-.5))return 0;
   const k=q.map(Math.floor),f=q.map((w,i)=>w-k[i]);let sum=0;
   for(let dz=0;dz<2;dz++)for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){
     const a=[dx,dy,dz].map((d,i)=>Math.max(0,Math.min(volume.dims[i]-1,k[i]+d)));
     sum+=volume.data[(a[2]*ny+a[1])*nx+a[0]]/255*(dx?f[0]:1-f[0])*(dy?f[1]:1-f[1])*(dz?f[2]:1-f[2]);
   }
   return sum;
 };
 const tan=Math.tan(state.fovDeg*Math.PI/360);
 const strength=state.cloudAlpha*(.42+1.20*state.goldenWeight+.65*state.inversionMix*(1-state.goldenWeight))*(1-state.mapMix);
 let visible=0,strong=0,moderate=0,sky=0,total=0,mean=0,upperStrong=0,lowerStrong=0;
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){
   const x=(i+.5)*2/n-1,y=1-(j+.5)*2/n;
   let ray=state.forward.map((v,k)=>v+x*aspect*tan*state.right[k]+y*tan*state.up[k]);const len=Math.hypot(...ray);ray=ray.map(v=>v/len);
   let surface=340;
   for(let t=.5;t<220;t+=.75){
     const q=state.pos.map((v,k)=>v+t*ray[k]);
     if(Math.abs(q[0])>110||Math.abs(q[2])>110)break;
     if(q[1]<terrain.sampleHeight(q[0],q[2])*state.relief){surface=t;break;}
   }
   if(surface===340)sky++;
   let lo=0,hi=surface;
   for(let k=0;k<3;k++){
     const d=ray[k]||1e-6,a=(volume.origin[k]-state.pos[k])/d,b=(volume.origin[k]+volume.extent[k]-state.pos[k])/d;
     lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));
   }
   hi=Math.min(hi,lo+105);
   let optical=0;
   if(hi>lo){const dt=(hi-lo)/16;for(let k=0;k<16;k++){const t=lo+(k+.5)*dt;optical+=sample(state.pos.map((v,i)=>v+t*ray[i]))*strength*.34*dt*.96;}}
   const opacity=1-Math.exp(-optical);
   visible+=opacity>.01;moderate+=opacity>.2;strong+=opacity>.6;mean+=opacity;total++;
   if(opacity>.6){if(j<n/2)upperStrong++;else lowerStrong++;}
 }
 return {visible:visible/total,moderate:moderate/total,strong:strong/total,sky:sky/total,mean:mean/total,upperStrong:upperStrong/(total/2),lowerStrong:lowerStrong/(total/2)};
}
const report={note:'Software-browser reference only. Draw-counter observations, not GPU completion or physical-device frame rate.',commit:process.env.GITHUB_SHA||null,run:process.env.GITHUB_RUN_ID||null,coverage:[],views:[]};
function summarizeSweep(samples,from,to){
 const deltas=[],gaps=[];let reversals=0,maxStep=0,unobservedDraws=0;
 const dir=Math.sign(to-from);
 for(let i=1;i<samples.length;i++){
   const a=samples[i-1],b=samples[i],delta=b.progress-a.progress;
   assert(Number.isFinite(b.progress)&&Number.isFinite(b.ms)&&Number.isFinite(b.target),'Invalid sweep observation');
   assert(b.draws>a.draws&&b.ms>=a.ms,'Non-monotonic draw observations');
   unobservedDraws+=Math.max(0,b.draws-a.draws-1);
   if(dir*delta<-.006)reversals++;
   maxStep=Math.max(maxStep,Math.abs(delta));deltas.push(Math.abs(delta));gaps.push(b.ms-a.ms);
 }
 const percentile=(xs,p)=>{const sorted=[...xs].sort((a,b)=>a-b);return sorted[Math.max(0,Math.ceil(p*sorted.length)-1)]??0;};
 return {durationMs:samples.at(-1).ms-samples[0].ms,observations:samples.length,unobservedDraws,maxStep,p95Step:percentile(deltas,.95),p50GapMs:percentile(gaps,.50),p95GapMs:percentile(gaps,.95),maxGapMs:Math.max(0,...gaps),maxTargetLag:Math.max(...samples.map(s=>Math.abs(s.target-s.progress))),reversals};
}
const anchors=[.64,.665,.69,.71,.73,.745,.76,.78,.80,.82,.84,.86,.88,.90,.92,.94,.96];
let browser;
try{
 const {summarizeDeviceSamples}=await import(pathToFileURL(path.join(draft,'src/device-review.js')));
 const diag=summarizeDeviceSamples([{phase:'forward',ms:0,progress:.64,target:.64,draws:5},{phase:'forward',ms:16,progress:.64,target:.75,draws:5},{phase:'forward',ms:33,progress:.72,target:.8,draws:7},{phase:'forward',ms:50,progress:.70,target:.8,draws:8}]);
 assert.equal(diag.callbacks,4);assert.equal(diag.missedDraws,1);assert.equal(diag.reversals,1);assert.equal(diag.drawGapMs.max,33);assert(diag.maxTargetLag>.10);
 const lag=summarizeDeviceSamples([{phase:'forward',ms:0,progress:.64,target:.64,nativeTarget:.64,draws:1},{phase:'forward',ms:16,progress:.64,target:.70,nativeTarget:.84,draws:1},{phase:'forward',ms:32,progress:.75,target:.84,nativeTarget:.84,draws:2}]);
 assert(Math.abs(lag.maxNativeTargetLag-.20)<1e-9);
 assert(Math.abs(lag.maxScrollInputLag-.14)<1e-9);
 assert(Math.abs(lag.maxTargetLag-.09)<1e-9);
 assert.equal(lag.reversals,0);assert.equal(lag.drawGapMs.max,32);
 const idle=summarizeDeviceSamples([]);assert.equal(idle.callbacks,0);assert.equal(idle.drawGapMs.max,null);
 const {buildTerrainData,buildSummitInversion}=await import(pathToFileURL(path.join(draft,'src/terrain.js')));
 const {evaluateWorldState}=await import(pathToFileURL(path.join(draft,'src/camera.js')));
 const td=buildTerrainData(),volume=buildSummitInversion(td);
 for(const [width,height] of [[320,568],[390,844],[768,1024],[1440,900]]){
   const state=evaluateWorldState(.82,width/height,td.sampleHeight),metrics=auditSummit(td,volume,state,width/height);
   report.coverage.push({width,height,...metrics});
   assert(metrics.visible>=.40,'Summit cloud coverage fell below 40%');assert(metrics.strong>=.20,'Summit lacks a strongly opaque cloud sea');
   assert(metrics.sky>=.12,'No clear sky/ridge separation');assert(metrics.lowerStrong>=metrics.upperStrong,'Cloud mass dominates the upper rather than lower frame');
 }
 const ready=()=>new Promise(resolve=>{const q=http.request(url,{method:'HEAD',agent:false},r=>{r.resume();resolve(r.statusCode===200)});q.on('error',()=>resolve(false));q.setTimeout(1000,()=>q.destroy());q.end();});
 let ok=false;for(let i=0;i<60;i++){if(await ready()){ok=true;break}await new Promise(r=>setTimeout(r,150));}assert(ok);
 browser=await chromium.launch({headless:true,executablePath:['/usr/bin/google-chrome','/usr/bin/chromium'].find(existsSync),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [width,height] of [[390,844],[1440,900]]){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,recordVideo:{dir:out,size:{width,height}}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(k,o){return original.call(this,k,k==='webgl2'?{...o,preserveDrawingBuffer:true}:o)}});
   await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>+document.querySelector('#atlas-stage').dataset.draws>0||document.querySelector('#atlas-stage').dataset.renderError,{},{timeout:45000});
   const stage=page.locator('#atlas-stage');assert.equal(await stage.getAttribute('data-renderer'),'webgl');
   const view={width,height,release:await page.locator('html').getAttribute('data-atlas-release'),frames:[],sweeps:[]};assert.equal(view.release,'A32');report.views.push(view);
   const scroll=async(f)=>{await page.evaluate(f=>{const t=document.querySelector('#expedition-track'),s=document.querySelector('#atlas-stage');scrollTo({top:t.getBoundingClientRect().top+scrollY+(t.offsetHeight-s.offsetHeight)*f,behavior:'instant'});},f);
     await page.waitForFunction(f=>Math.abs(+document.querySelector('#atlas-stage').dataset.renderedProgress-f)<.006&&document.querySelector('#atlas-stage').dataset.settled==='true',f,{timeout:45000});};
   const pixelState=()=>page.locator('#atlas-canvas').evaluate(c=>{
     const gl=c.getContext('webgl2'),w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,a=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,a);
     let hash=2166136261,colors=new Set();for(let y=0;y<h;y+=7)for(let x=0;x<w;x+=7){const i=(y*w+x)*4,rgb=a[i]*65536+a[i+1]*256+a[i+2];hash=Math.imul(hash^rgb,16777619);colors.add(rgb);}
     const d=document.querySelector('#atlas-stage').dataset;
     return {hash,colors:colors.size,glError:gl.getError(),progress:+d.renderedProgress,chapter:d.renderedChapter,mix:+d.inversionMix,samples:+d.mistSamples,clearance:+d.cameraClearance};
   });
   for(const [i,f] of anchors.entries()){
     await scroll(f);const m=await pixelState();assert(m.colors>25);assert.equal(m.glError,0);assert(m.clearance>=1.8);if(f===.82){assert(m.mix>.99);assert.equal(m.samples,16);}
     view.frames.push({requested:f,...m});
     await page.screenshot({path:path.join(out,width+'-summit-'+String(i).padStart(2,'0')+'.png'),timeout:45000});
   }
   // Smooth forward and reverse traversal with native scrolling. Track each completed
   // draw, not the requested scroll position. Software cadence is diagnostic only.
   for(const [from,to] of [[.64,.96],[.96,.64]]){
     await scroll(from);
     const samples=await page.evaluate(async({to})=>{
       const stage=document.querySelector('#atlas-stage'),track=document.querySelector('#expedition-track'),initial=performance.now(),samples=[];
       let last=-1;
       const trackTop=track.getBoundingClientRect().top+scrollY,travel=Math.max(1,track.offsetHeight-stage.offsetHeight);
       function collect(){const d=stage.dataset,n=+d.draws;if(n!==last){samples.push({ms:Math.round(performance.now()-initial),progress:+d.renderedProgress,draws:n,target:Math.max(0,Math.min(1,(scrollY-trackTop)/travel))});last=n;}}
       collect(); // include the actual start pose before native scrolling
       const top=trackTop+travel*to;
       scrollTo({top,behavior:'smooth'});
       await new Promise((resolve,reject)=>{function frame(){collect();if(Math.abs(+stage.dataset.renderedProgress-to)<.006&&stage.dataset.settled==='true'){resolve();return;}if(performance.now()-initial>45000){reject(new Error('sweep did not settle'));return;}requestAnimationFrame(frame);}requestAnimationFrame(frame);});
       return samples;
     },{to});
     assert(samples.length>1);assert(Math.abs(samples.at(-1).progress-to)<.006);
     assert(Math.abs(samples[0].progress-from)<.006,'Sweep did not record its start pose');
     const summary=summarizeSweep(samples,from,to);
     assert.equal(summary.reversals,0,'Unexpected reversal during native smooth sweep');
     view.sweeps.push({from,to,samples,...summary});
     console.log('ATLAS SWEEP',width,from,to,JSON.stringify(summary));
   }
   await scroll(.82);const repeated=await pixelState();assert.equal(repeated.hash,view.frames.find(x=>x.requested===.82).hash,'Settled summit differs on revisit in deterministic software renderer');
   assert.deepEqual(errors,[]);view.revisit=repeated;const video=page.video();await page.close();if(video)await video.saveAs(path.join(out,width+'-summit-traversal.webm'));
 }
 console.log('PASS summit inversion coverage, terrain clearance, two-viewport rendered progression and repeat pose');
}finally{
 writeFileSync(path.join(out,'summit-report.json'),JSON.stringify(report,null,2));
 await browser?.close();server.kill();
}
