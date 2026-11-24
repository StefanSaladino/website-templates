// Diagnostic ablations, never production settings or visual acceptance.
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,'components/shift-recovery-live-evidence');
const url='http://127.0.0.1:4306/templates/shift-card/index.html?motion-debug=1';
mkdirSync(out,{recursive:true});
const server=spawn('python3',['-m','http.server','4306','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
const results=[],errors=[];
let browser;
function percentile(values,p){const sorted=[...values].sort((a,b)=>a-b);return sorted[Math.max(0,Math.ceil(sorted.length*p)-1)]??null}
try{
 let ready=false;for(let i=0;i<50;i++){try{if((await fetch(url)).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,200))}
 assert(ready,'Static test server unavailable');
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
 // Bookend with normal baselines to reveal runner drift. Change one factor at a time.
 for(const mode of ['baseline-before','half-buffer-density','freeze-colour-paint','skip-gl-draw','baseline-after']){
  const ctx=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:'no-preference'});
  const result={mode,viewport:[1440,900],renderer:'Chromium SwiftShader',videoRecording:false,phases:[]};results.push(result);
  try{
   await ctx.addInitScript(mode=>{
    window.__shiftProfile={active:false,skippedDraws:0,skippedClears:0,skippedColours:0};
    if(mode==='half-buffer-density')Object.defineProperty(window,'devicePixelRatio',{get:()=>.5,configurable:true});
    if(mode==='freeze-colour-paint'){
     const original=CSSStyleDeclaration.prototype.setProperty;
     CSSStyleDeclaration.prototype.setProperty=function(k,v,...args){
      if(window.__shiftProfile.active&&['--bg','--type','--fg'].includes(k)){window.__shiftProfile.skippedColours++;return}
      return original.call(this,k,v,...args);
     };
    }
    if(mode==='skip-gl-draw'){
     const proto=WebGLRenderingContext.prototype;
     for(const [method,key] of [['drawArrays','skippedDraws'],['clear','skippedClears']]){
      const original=proto[method];proto[method]=function(...args){
       if(window.__shiftProfile.active&&this.canvas.id==='campaign-canvas'){window.__shiftProfile[key]++;return}
       return original.apply(this,args);
      };
     }
    }
   },mode);
   const p=await ctx.newPage(),pageErrors=[];p.on('pageerror',e=>pageErrors.push(e.message));
   await p.goto(url);await p.waitForFunction(()=>document.querySelector('#composition').dataset.renderer==='webgl');
   const travel=await p.evaluate(()=>document.querySelector('#story').offsetHeight-document.querySelector('#composition').offsetHeight);
   const settle=async q=>{const y=Math.round(travel*q);await p.evaluate(y=>scrollTo(0,y),y);await p.waitForFunction(({y,travel})=>{const s=document.querySelector('#composition');return s.dataset.motionSettled==='true'&&Math.abs(scrollY-y)<=1&&Math.abs(+s.dataset.progress-y/travel)<.000002},{y,travel})};
   // Warm up shader/compositor and return to the same starting pose.
   await settle(.5);await settle(0);
   result.buffer=await p.evaluate(()=>{const c=document.querySelector('#campaign-canvas');return {width:c.width,height:c.height,cssWidth:c.getBoundingClientRect().width,cssHeight:c.getBoundingClientRect().height,dpr:devicePixelRatio}});
   if(mode==='half-buffer-density')assert(result.buffer.width<=result.buffer.cssWidth*.51&&result.buffer.height<=result.buffer.cssHeight*.51,'Density intervention did not take effect');
   for(const [name,from,to] of [['forward',0,.85],['reverse',.85,.15]]){
    await settle(from);
    const initial=await p.evaluate(()=>{const s=document.querySelector('#composition');window.__shiftMotionTrace.frames.length=0;Object.assign(window.__shiftProfile,{active:true,skippedDraws:0,skippedClears:0,skippedColours:0});return {layouts:+s.dataset.layoutCount}});
    const inputs=await p.evaluate(({travel,from,to})=>new Promise(resolve=>{const start=performance.now();let count=0;function tick(){const q=Math.min(1,(performance.now()-start)/2500);scrollTo(0,Math.round(travel*(from+(to-from)*q)));count++;if(q<1)setTimeout(tick,34);else resolve(count)}tick()}),{travel,from,to});
    const target=Math.round(travel*to)/travel;
    await p.waitForFunction(target=>{const s=document.querySelector('#composition');return s.dataset.motionSettled==='true'&&Math.abs(+s.dataset.progress-target)<.000002},target);
    const data=await p.evaluate(()=>{const s=document.querySelector('#composition'),profile={...window.__shiftProfile};window.__shiftProfile.active=false;return {frames:window.__shiftMotionTrace.frames.slice(),layouts:+s.dataset.layoutCount,draws:+s.dataset.draws,profile}});
    const intervals=data.frames.slice(1).map((f,i)=>f.time-data.frames[i].time);
    const summary={name,inputs,samples:data.frames.length,p50:percentile(intervals,.5),p95:percentile(intervals,.95),slowFraction:intervals.filter(t=>t>34).length/Math.max(1,intervals.length),submitP95:percentile(data.frames.map(f=>f.submitMs),.95),pixels:result.buffer.width*result.buffer.height,profile:data.profile};
    result.phases.push({...summary,frames:data.frames});
    console.log('SHIFT ablation '+JSON.stringify({mode,...summary}));
    assert(data.frames.length>=10);assert.equal(data.layouts,initial.layouts,'Unexpected layout reset');
    if(mode==='freeze-colour-paint')assert(data.profile.skippedColours>0,'Colour intervention inactive');
    if(mode==='skip-gl-draw')assert(data.profile.skippedDraws>0&&data.profile.skippedClears>0,'WebGL intervention inactive');
    // No production gate for intentionally altered rendering. The isolated
    // acceptance test remains unchanged and must independently pass.
    await p.waitForTimeout(250);assert.equal(await p.evaluate(()=>+document.querySelector('#composition').dataset.draws),data.draws);
   }
   assert.deepEqual(pageErrors,[]);
  }catch(e){errors.push(mode+': '+e.message);result.error=e.message}
  finally{await ctx.close()}
 }
}finally{
 writeFileSync(path.join(out,'motion-cadence-ablation-report.json'),JSON.stringify({results,errors},null,2));
 await browser?.close();server.kill();
}
assert.deepEqual(errors,[],'Diagnostic run incomplete; inspect report');
