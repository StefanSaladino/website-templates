// Continuous programmatic native-scroll input, one update per requestAnimationFrame.
// Report submitted frames and RAF cadence, not hardware display FPS or GPU completion.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const out='/tmp/threshold-performance';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const base='http://127.0.0.1:4381/templates/threshold-studio/';
const quantile=(a,q)=>{const sorted=a.slice().sort((x,y)=>x-y);return sorted.length?sorted[Math.min(sorted.length-1,Math.floor((sorted.length-1)*q))]:null};
const stats=a=>({median:quantile(a,.5),p95:quantile(a,.95),max:a.length?Math.max(...a):null});
const report={commit:process.env.GITHUB_SHA,method:'Chromium software WebGL (SwiftShader); frame submissions, not physical display FPS. Continuous rAF-driven native scroll for 4 seconds; no screenshot/video in timed section.',profiles:[]};
try{
 for(const [width,height,dpr] of [[390,844,3],[1440,900,2],[844,390,3]]){
  for(const quality of ['full','balanced']){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'?track=possibility&ambient=off&fps=collect&quality='+quality);
   await page.waitForFunction(()=>document.documentElement.dataset.journey==='on'&&document.querySelector('#scene-study').dataset.renderer==='webgl');
   const result=await page.evaluate(async()=>{
    const el=document.querySelector('#scene-study'),s=document.scrollingElement,range=s.scrollHeight-s.clientHeight;
    // Warm-up shader execution and both directions before timing.
    s.scrollTop=Math.round(range*.5);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    s.scrollTop=0;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    window.__thresholdPerf.reset();
    const inputs=[];let t0=null;
    await new Promise(resolve=>{
      function step(t){
        if(t0===null)t0=t;
        const elapsed=Math.min(4000,t-t0),p=elapsed<=2000?elapsed/2000:2-elapsed/2000;
        s.scrollTop=Math.round(range*p);inputs.push({t,progress:s.scrollTop/range});
        if(elapsed<4000)requestAnimationFrame(step);else resolve();
      }
      requestAnimationFrame(step);
    });
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    return {inputs,frames:window.__thresholdPerf.read(),buffer:el.dataset.buffer,reflection:el.dataset.reflectionBuffer,quality:el.dataset.quality,renderer:el.dataset.renderer,finalProgress:+el.dataset.progress};
   });
   assert.equal(result.renderer,'webgl');assert.equal(result.quality,quality);assert.equal(result.finalProgress,0);assert.deepEqual(errors,[]);
   const start=result.inputs[0].t,end=result.inputs.at(-1).t,duration=end-start;
   const frames=result.frames.filter(f=>f.time>=start&&f.time<=end),gaps=frames.slice(1).map((f,i)=>f.time-frames[i].time);
   const raf=result.inputs.slice(1).map((x,i)=>x.t-result.inputs[i].t);
   const inputLag=frames.map(f=>{const input=result.inputs.filter(i=>i.t<=f.time&&Math.abs(i.progress-f.progress)<.000002).at(-1);return input?f.time-input.t:null}).filter(x=>x!==null);
   const metrics={submittedFps:frames.length*1000/duration,rafFps:result.inputs.length*1000/duration,frameGapMs:stats(gaps),cpuSubmissionMs:stats(frames.map(f=>f.cpuMs)),matchingInputToSubmissionMs:stats(inputLag),over33ms:gaps.filter(x=>x>33.4).length,over50ms:gaps.filter(x=>x>50).length,buffer:result.buffer,reflection:result.reflection,frames:frames.length,durationMs:duration};
   report.profiles.push({width,height,dpr,quality,metrics,raw:result});
   writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({width,height,dpr,quality,metrics}));
   await page.close();
  }
 }
}finally{writeFileSync(out+'/report.json',JSON.stringify(report,null,2));await browser.close()}
