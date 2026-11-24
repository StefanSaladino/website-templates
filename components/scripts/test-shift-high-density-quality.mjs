// High-density quality restoration and actual same-pose artwork review.
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,'components/shift-recovery-live-evidence');
const url='http://127.0.0.1:4307/templates/shift-card/index.html?motion-debug=1';
mkdirSync(out,{recursive:true});
const server=spawn('python3',['-m','http.server','4307','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
const results=[],failures=[];
let browser;
try{
 let ready=false;for(let i=0;i<50;i++){try{if((await fetch(url)).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,200))}
 assert(ready,'Static server unavailable');
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
 for(const [width,height,dpr,limit] of [[390,844,3,200000],[1440,900,2,130000],[1920,1080,2,130000]]){
  const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr,hasTouch:width===390,isMobile:width===390,reducedMotion:'no-preference'});
  const result={width,height,dpr,limit,renderer:'Chromium SwiftShader',checks:[]};results.push(result);
  const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  try{
   await p.goto(url);
   await p.waitForFunction(()=>{const s=document.querySelector('#composition');return s.dataset.renderer==='webgl'&&s.dataset.motionSettled==='true'});
   const get=()=>p.evaluate(()=>{const s=document.querySelector('#composition'),c=document.querySelector('#campaign-canvas'),r=c.getBoundingClientRect();return {quality:s.dataset.bufferQuality,pixels:c.width*c.height,dimensions:[c.width,c.height],css:[r.x,r.y,r.width,r.height],pose:s.dataset.pose,progress:+s.dataset.progress,draws:+s.dataset.draws,layouts:+s.dataset.layoutCount,finish:s.dataset.renderedFinish}});
   const travel=await p.evaluate(()=>document.querySelector('#story').offsetHeight-document.querySelector('#composition').offsetHeight);
   const start=await get();assert(start.pixels>limit,'Case must exercise adaptive resolution');result.start=start;
   const settle=async q=>{const y=Math.round(travel*q);await p.evaluate(y=>scrollTo(0,y),y);await p.waitForFunction(({y,travel})=>{const s=document.querySelector('#composition');return s.dataset.motionSettled==='true'&&Math.abs(+s.dataset.progress-y/travel)<.000002},{y,travel})};
   await settle(.1);
   // Capture the actual low-resolution WebGL output at its exact final pose,
   // and then the first full-resolution draw of that same pose. This single
   // capture intentionally reads pixels; it is NOT used for timing acceptance.
   const target=Math.round(travel*.55)/travel;
   await p.evaluate(target=>{
    const s=document.querySelector('#composition'),c=document.querySelector('#campaign-canvas');
    window.__qualityPair={};
    const observer=new MutationObserver(()=>{
     if(Math.abs(+s.dataset.progress-target)>.000002)return;
     const quality=s.dataset.bufferQuality;if(!['motion','full'].includes(quality)||window.__qualityPair[quality])return;
     window.__qualityPair[quality]={png:c.toDataURL('image/png'),pose:s.dataset.pose,progress:s.dataset.progress,bounds:s.dataset.bounds,dimensions:[c.width,c.height]};
     if(window.__qualityPair.motion&&window.__qualityPair.full)observer.disconnect();
    });
    observer.observe(s,{attributes:true,attributeFilter:['data-progress','data-buffer-quality']});
   },target);
   await settle(.55);
   await p.waitForFunction(()=>window.__qualityPair.motion&&window.__qualityPair.full);
   const pair=await p.evaluate(()=>window.__qualityPair);
   assert.equal(pair.motion.pose,pair.full.pose,'Quality switching must preserve the exact pose');
   assert.equal(pair.motion.bounds,pair.full.bounds,'Projected geometry changed across quality levels');
   assert(pair.motion.dimensions[0]*pair.motion.dimensions[1]<=limit);
   assert.deepEqual(pair.full.dimensions,start.dimensions);
   for(const [quality,capture] of Object.entries(pair)){
    const data=Buffer.from(capture.png.split(',')[1],'base64');
    assert(data.length>1000,'Canvas capture unexpectedly empty');
    writeFileSync(path.join(out,'density-'+width+'-dpr'+dpr+'-'+quality+'.png'),data);
    delete capture.png;
   }
   result.samePose=pair;
   if(width===1440){
    result.optimizedPixelReview=await p.evaluate(async()=>{
     const {createCardScene,useMotionOptimization}=await import('/templates/shift-card/studio-scene.js?v=14');
     const c=document.createElement('canvas'),scene=createCardScene(c),gl=scene.gl,viewport={width:640,height:300,dpr:.75,compact:false};
     const output=[];
     try{for(const [yaw,pitch,roll,light] of [[-28,13,-19,-35],[0,-10,35,28],[30,18,48,50],[42,8,50,50],[65,8,50,50],[105,-12,72,-25],[138,5,88,10],[175,5,88,10]]){
      for(const finish of ['ultramarine','graphite','silver']){
       const opts={yaw,pitch,roll,light,finish,studio:.7,cardWidth:270,viewport};
       scene.draw(opts);const before=new Uint8Array(c.width*c.height*4);gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,before);
       scene.draw({...opts,viewport:{...viewport,motionPass:true}});const after=new Uint8Array(before.length);gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,after);
       let total=0,changedAlpha=0,opaque=0,large=0;for(let i=0;i<before.length;i+=4){if(before[i+3]!==after[i+3])changedAlpha++;if(before[i+3]||after[i+3]){opaque++;for(let k=0;k<3;k++){const diff=Math.abs(before[i+k]-after[i+k]);total+=diff;if(diff>4)large++}}}
       output.push({yaw,pitch,roll,finish,fast:useMotionOptimization(yaw,pitch),opaque,changedAlpha,meanRgbDelta:total/Math.max(1,opaque*3),largeChannelFraction:large/Math.max(1,opaque*3),pixels:c.width*c.height});
      }
     }}finally{scene.dispose()}return output;
    });
    assert(result.optimizedPixelReview.some(q=>q.fast)&&result.optimizedPixelReview.some(q=>!q.fast),'Both angle paths must be tested');
    for(const q of result.optimizedPixelReview){if(!q.fast)assert.equal(q.meanRgbDelta,0,'Grazing fallback must match original pixels exactly');assert(q.opaque>1000,'Pixel comparison must contain real card artwork');assert(q.changedAlpha/q.pixels<.002,'Optimized renderer changed silhouette: '+JSON.stringify(q));assert(q.meanRgbDelta<=1&&q.largeChannelFraction<=.01,'Optimized renderer changed material appearance: '+JSON.stringify(q))}
   }
   await p.screenshot({path:path.join(out,'density-'+width+'-dpr'+dpr+'-settled.png')});
   const before=await get();assert.deepEqual(before.css,start.css);assert.deepEqual(before.dimensions,start.dimensions);
   // Frequent direction changes and short pauses must not repeatedly allocate
   // the full-size drawing buffer or reset layout. Only one final restoration.
   await p.evaluate(async travel=>{
    window.__shiftMotionTrace.frames.length=0;
    for(const q of [.78,.22,.69,.33,.55]){scrollTo(0,Math.round(travel*q));await new Promise(r=>setTimeout(r,75))}
   },travel);
   await p.waitForFunction(target=>{const s=document.querySelector('#composition');return s.dataset.motionSettled==='true'&&Math.abs(+s.dataset.progress-target)<.000002},target);
   const after=await get(),trace=await p.evaluate(()=>window.__shiftMotionTrace.frames.slice());
   assert.equal(after.layouts,before.layouts);assert.equal(after.pose,before.pose);assert.deepEqual(after.css,before.css);assert.deepEqual(after.dimensions,start.dimensions);assert.equal(after.finish,before.finish);
   assert(trace.some(f=>f.quality==='motion'));assert(trace.filter(f=>f.quality==='motion').every(f=>f.pixels<=limit));
   assert.equal(trace.filter(f=>f.restoring).length,1,'Repeated full-buffer restoration during a single interaction');
   await p.waitForTimeout(300);assert.equal((await get()).draws,after.draws,'Unexpected idle renders');
   result.reversal={after,trace};result.checks.push('same pose and bounds','motion buffer cap','full resolution restored','no layout reset','single restoration','idle renderer');
   assert.deepEqual(errors,[]);
   console.log('SHIFT high-density quality '+JSON.stringify({width,height,dpr,fullPixels:start.pixels,motionPixels:Math.max(...trace.filter(f=>f.quality==='motion').map(f=>f.pixels)),restores:trace.filter(f=>f.restoring).length}));
  }catch(e){result.error=e.message;failures.push(width+'@'+dpr+': '+e.message)}
  finally{await ctx.close()}
 }
}finally{
 writeFileSync(path.join(out,'motion-high-density-quality-report.json'),JSON.stringify({results,failures},null,2));
 await browser?.close();server.kill();
}
assert.deepEqual(failures,[],'High-density motion quality acceptance failed; inspect report');
