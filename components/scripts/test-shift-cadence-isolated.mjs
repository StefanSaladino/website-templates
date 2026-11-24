import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,'components/shift-recovery-live-evidence');
const origin='http://127.0.0.1:4305',url=origin+'/templates/shift-card/index.html?motion-debug=1';
mkdirSync(out,{recursive:true});
const server=spawn('python3',['-m','http.server','4305','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
const results=[],failures=[];
let browser;
const percentile=(values,p)=>{const sorted=[...values].sort((a,b)=>a-b);return sorted[Math.max(0,Math.ceil(sorted.length*p)-1)]??null};
const summarize=frames=>{
 const intervals=frames.slice(1).map((f,i)=>f.time-frames[i].time);
 const lag=frames.map(f=>Math.abs(f.target-f.progress));
 return {samples:frames.length,intervalP50:percentile(intervals,.5),intervalP95:percentile(intervals,.95),over33ms:intervals.filter(v=>v>34).length,over50ms:intervals.filter(v=>v>51).length,over33Fraction:intervals.filter(v=>v>34).length/Math.max(1,intervals.length),submitP95:percentile(frames.map(f=>f.submitMs),.95),maxLag:Math.max(0,...lag),pixels:Math.max(0,...frames.map(f=>f.pixels))};
};
try{
 let ready=false;for(let i=0;i<50;i++){try{if((await fetch(url)).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,200))}
 assert(ready,'Static test server did not start');
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
 for(const [width,height] of [[390,844],[1440,900]]){
  // No recordVideo, screenshots or DevTools tracing during measurement.
  // The separate live-composition suite retains the original video evidence.
  const ctx=await browser.newContext({viewport:{width,height},reducedMotion:'no-preference'});
  const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const result={width,height,videoRecording:false,renderer:'Chromium SwiftShader',phases:[]};results.push(result);
  try{
   await p.goto(url);
   await p.waitForFunction(()=>document.querySelector('#composition').dataset.renderer==='webgl');
   const travel=await p.evaluate(()=>document.querySelector('#story').offsetHeight-document.querySelector('#composition').offsetHeight);
   const settle=async target=>{const y=Math.round(travel*target);await p.evaluate(y=>scrollTo(0,y),y);await p.waitForFunction(({y,travel})=>{const s=document.querySelector('#composition');return s.dataset.motionSettled==='true'&&Math.abs(scrollY-y)<=1&&Math.abs(+s.dataset.progress-y/travel)<.000002},{y,travel})};
   await settle(0);
   // Measure idle callback scheduling separately. It is not presented GPU FPS.
   const idle=await p.evaluate(()=>new Promise(resolve=>{const times=[];let start;function tick(now){start??=now;times.push(now);if(now-start<1000)requestAnimationFrame(tick);else resolve(times.slice(1).map((t,i)=>t-times[i]))}requestAnimationFrame(tick)}));
   result.idle={samples:idle.length,p50:percentile(idle,.5),p95:percentile(idle,.95)};
   const phase=async (name,from,to,duration)=>{
    await settle(from);
    const baseline=await p.evaluate(()=>{const s=document.querySelector('#composition'),c=document.querySelector('#campaign-canvas');window.__shiftMotionTrace.frames.length=0;return {layouts:+s.dataset.layoutCount,draws:+s.dataset.draws,canvasPixels:c.width*c.height}});
    const inputs=await p.evaluate(({travel,from,to,duration})=>new Promise(resolve=>{const start=performance.now();let count=0;function tick(){const q=Math.min(1,(performance.now()-start)/duration);scrollTo(0,Math.round(travel*(from+(to-from)*q)));count++;if(q<1)setTimeout(tick,34);else resolve(count)}tick()}),{travel,from,to,duration});
    const target=Math.round(travel*to)/travel;
    await p.waitForFunction(target=>{const s=document.querySelector('#composition');return s.dataset.motionSettled==='true'&&Math.abs(+s.dataset.progress-target)<.000002},target);
    const measured=await p.evaluate(()=>{const s=document.querySelector('#composition');return {frames:window.__shiftMotionTrace.frames.slice(),layouts:+s.dataset.layoutCount,draws:+s.dataset.draws,progress:+s.dataset.progress}});
    const summary=summarize(measured.frames);
    const entry={name,from,to,duration,inputs,baseline,...summary,layouts:measured.layouts,frames:measured.frames};result.phases.push(entry);
    console.log('SHIFT isolated cadence '+JSON.stringify({width,height,name,inputs,...summary}));
    assert(summary.samples>=10,'Too few rendered samples');
    assert.equal(measured.layouts,baseline.layouts,'Scroll caused layout reinitialization');
    const sign=Math.sign(to-from);
    for(let i=1;i<measured.frames.length;i++){const a=measured.frames[i-1],b=measured.frames[i];assert(sign*(b.progress-a.progress)>=-1e-6&&sign*(b.target-b.progress)>=-1e-6,'Non-monotonic motion or overshoot: '+name)}
    await p.waitForTimeout(250);assert.equal(await p.evaluate(()=>+document.querySelector('#composition').dataset.draws),measured.draws,'Renderer did not go idle');
    // Provisional software-runner floor, not physical device acceptance:
    // median at least ~30Hz and 95% of callbacks within ~two 60Hz intervals.
    if(summary.intervalP50>34||summary.intervalP95>34||summary.over33Fraction>.05)failures.push(width+' '+name+': cadence floor missed (p50 '+summary.intervalP50+', p95 '+summary.intervalP95+', >34ms fraction '+summary.over33Fraction.toFixed(3)+')');
    if(summary.maxLag>.12)failures.push(width+' '+name+': normal-scroll normalized lag exceeds 0.12');
   };
   await phase('forward',0,.85,2500);
   await phase('reverse',.85,.15,2500);
   // Abrupt direction changes followed by a complete stop. Unlike monotonic
   // phases, no global direction assertion: targets are intentionally reversed.
   await settle(.15);
   const reversal=await p.evaluate(async travel=>{
    const s=document.querySelector('#composition');window.__shiftMotionTrace.frames.length=0;const layouts=+s.dataset.layoutCount;
    for(const q of [.8,.25,.95,.4]){scrollTo(0,Math.round(travel*q));await new Promise(r=>setTimeout(r,110))}
    return {layouts,target:Math.round(travel*.4)/travel};
   },travel);
   await p.waitForFunction(target=>{const s=document.querySelector('#composition');return s.dataset.motionSettled==='true'&&Math.abs(+s.dataset.progress-target)<.000002},reversal.target);
   result.reversal=await p.evaluate(()=>{const s=document.querySelector('#composition');return {layouts:+s.dataset.layoutCount,progress:+s.dataset.progress,draws:+s.dataset.draws,frames:window.__shiftMotionTrace.frames.slice()}});
   assert.equal(result.reversal.layouts,reversal.layouts);
   await p.waitForTimeout(250);assert.equal(await p.evaluate(()=>+document.querySelector('#composition').dataset.draws),result.reversal.draws);
   assert.deepEqual(errors,[]);
  }catch(e){failures.push(width+': '+e.message);result.error=e.message}
  finally{await ctx.close()}
 }
}finally{
 writeFileSync(path.join(out,'motion-cadence-isolated-report.json'),JSON.stringify({results,failures},null,2));
 await browser?.close();server.kill();
}
assert.deepEqual(failures,[],'Isolated cadence acceptance failed; inspect uploaded report');
