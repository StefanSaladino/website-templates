import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import http from 'node:http';
import {mkdirSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,'components/atlas-evidence');mkdirSync(out,{recursive:true});
const url='http://127.0.0.1:4340/templates/_drafts/atlas-terrain/index.html';
const server=spawn('python3',['-m','http.server','4340','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
let browser;
try {
 const ready=()=>new Promise(resolve=>{const q=http.request(url,{method:'HEAD',agent:false},r=>{r.resume();resolve(r.statusCode===200)});q.on('error',()=>resolve(false));q.setTimeout(1000,()=>q.destroy());q.end()});
 let ok=false;for(let i=0;i<60;i++){if(await ready()){ok=true;break}await new Promise(r=>setTimeout(r,150))}assert(ok);
 browser=await chromium.launch({headless:true,executablePath:['/usr/bin/google-chrome','/usr/bin/chromium'].find(existsSync),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [width,height] of [[320,568],[390,844],[768,1024],[1440,900]]){
  const p=await browser.newPage({viewport:{width,height}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(k,o){return original.call(this,k,k==='webgl2'?{...o,preserveDrawingBuffer:true}:o)}});
  await p.goto(url,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>+document.querySelector('#atlas-stage').dataset.draws>0||document.querySelector('#atlas-stage').dataset.renderError,{},{timeout:25000});
  const stage=p.locator('#atlas-stage');assert.equal(await stage.getAttribute('data-renderer'),'webgl',await stage.getAttribute('data-render-error')||'WebGL initialization');
  assert.equal(await p.locator('html').getAttribute('data-atlas-release'),'A16');
  assert.equal(await p.locator('html').getAttribute('data-atlas-ready'),'true','scroll listeners must be installed after initialization');
  assert.equal(await p.locator('html').getAttribute('data-first-frame'),'true');assert(!await p.locator('html').evaluate(e=>e.classList.contains('atlas-booting')));
  const moduleUrls=await p.evaluate(()=>performance.getEntriesByType('resource').map(x=>x.name).filter(x=>/\/src\/[^/]+\.js(?:\?|$)/.test(x)));assert.equal(new Set(moduleUrls).size,6,'six modules');assert(moduleUrls.every(x=>new URL(x).searchParams.get('v')==='16'),'mixed module releases '+moduleUrls.join(' '));
  const invariant=await p.evaluate(async()=>{
    const m=await import('/templates/_drafts/atlas-terrain/src/terrain.js?v=16');
    const a=m.buildTerrainData(176),b=m.buildTerrainData(256);
    return {same:a===b,res:a.resolution,sameTexture:a.heightTexData===b.heightTexData,sameMesh:a.positions===b.positions,peak:a.sampleHeight(11.5,-18.5)};
  });assert(invariant.peak>20.5,'Kestrel crown lost');assert.deepEqual({...invariant,peak:undefined},{same:true,res:256,sameTexture:true,sameMesh:true,peak:undefined});
  const framing=await p.evaluate(async()=>{
    const {buildTerrainData,WATER_LEVEL}=await import('/templates/_drafts/atlas-terrain/src/terrain.js?v=16');
    const {evaluateWorldState}=await import('/templates/_drafts/atlas-terrain/src/camera.js?v=16');
    const td=buildTerrainData(),aspect=innerWidth/innerHeight;
    let last=null,speeds=[],clearance=Infinity,near=0,shots={};
    for(let i=0;i<=1000;i++){
      const s=evaluateWorldState(i/1000,aspect,td.sampleHeight);
      clearance=Math.min(clearance,s.pos[1]-td.sampleHeight(s.pos[0],s.pos[2])*s.relief);
      if(last)speeds.push(Math.hypot(...s.pos.map((v,k)=>v-last.pos[k]))*1000);
      last=s;
      for(let t=.5;t<=8;t+=.5)if(s.pos[1]+s.forward[1]*t<td.sampleHeight(s.pos[0]+s.forward[0]*t,s.pos[2]+s.forward[2]*t)*s.relief){near++;break}
      if(i===440||i===620){const project=(x,y,z)=>{const v=[x-s.pos[0],y-s.pos[1],z-s.pos[2]],dot=a=>v.reduce((q,x,j)=>q+x*a[j],0),k=Math.tan(s.fovDeg*Math.PI/360)*dot(s.forward);return [dot(s.right)/k/aspect,dot(s.up)/k]};shots[i]={lake:project(-2.5,WATER_LEVEL*s.relief,3.5),peak:project(11.5,td.sampleHeight(11.5,-18.5)*s.relief,-18.5)}}
    }
    const a=evaluateWorldState(0,aspect,td.sampleHeight),b=evaluateWorldState(1,aspect,td.sampleHeight);
    return {clearance,near,ratio:Math.max(...speeds)/speeds.sort((a,b)=>a-b)[500],shots,folio:a.pos.every((v,i)=>Math.abs(v-b.pos[i])<1e-8)&&a.look.every((v,i)=>Math.abs(v-b.look[i])<1e-8)&&b.relief===0&&b.mapMix===1};
  });assert(framing.clearance>=1.8);assert.equal(framing.near,0);assert(framing.ratio<=2.2);assert(Math.abs(framing.shots[440].peak[0])<.9);assert(Math.abs(framing.shots[620].lake[0])<.6);assert(Math.abs(framing.shots[620].peak[1])<.95);assert(framing.folio);console.log('ATLAS FRAMING',width,JSON.stringify(framing));
  const details=await p.evaluate(async()=>{
    const {buildTerrainData,buildLandscapeDetails,WATER_LEVEL}=await import('/templates/_drafts/atlas-terrain/src/terrain.js?v=16');
    const td=buildTerrainData(),b=buildLandscapeDetails(td);let triangles=0,wet=0,invalid=0;
    for(const m of b){triangles+=m.vertices.length/27*m.count;for(let i=0;i<m.instances.length;i+=8){const [x,y,z]=m.instances.subarray(i,i+3),h=td.sampleHeight(x,z);if(h<=WATER_LEVEL)wet++;if(Math.abs(y-h)>.0201)invalid++;}}
    return {triangles,wet,invalid,counts:b.map(m=>m.count),same:b===buildLandscapeDetails(td)};
  });assert(details.same);assert.equal(details.wet,0);assert.equal(details.invalid,0);assert(details.counts.every(n=>n>0));assert(details.triangles<=65000);console.log('ATLAS DETAILS',width,JSON.stringify(details));
  const shadows=await p.evaluate(async()=>{
    const {buildTerrainData,buildLandscapeDetails,buildDetailShadowField}=await import('/templates/_drafts/atlas-terrain/src/terrain.js?v=16');
    const td=buildTerrainData(),f=buildDetailShadowField(td);let different=0,total=0,anchored=0;
    for(let i=0;i<f.data.length;i+=2)if(f.data[i]!==f.data[i+1])different++;
    for(const b of buildLandscapeDetails(td))for(let i=0;i<b.instances.length;i+=8){total++;const [x,y,z]=b.instances.subarray(i,i+3),[bx,bz,sx,sz]=f.bounds;const j=(Math.floor((z-bz)/sz*f.size)*f.size+Math.floor((x-bx)/sx*f.size))*2;if(f.data[j]>0&&f.data[j+1]>0)anchored++;}
    return {bytes:f.data.length,same:f===buildDetailShadowField(td),different,total,anchored};
  });assert(shadows.same);assert.equal(shadows.bytes,2097152);assert(shadows.different>1000);assert.equal(shadows.total,shadows.anchored);
  const reflectionMath=await p.evaluate(async()=>{
    const {mirrorLakeView}=await import('/templates/_drafts/atlas-terrain/src/renderer.js?v=16');
    const {evaluateWorldState,buildViewProjMatrix}=await import('/templates/_drafts/atlas-terrain/src/camera.js?v=16');
    const {buildTerrainData,WATER_LEVEL}=await import('/templates/_drafts/atlas-terrain/src/terrain.js?v=16');
    const td=buildTerrainData(),aspect=innerWidth/innerHeight,s=evaluateWorldState(.62,aspect,td.sampleHeight);
    const m=buildViewProjMatrix(s.pos,s.look,[0,1,0],s.fovDeg,aspect).viewProj,plane=WATER_LEVEL*s.relief,r=mirrorLakeView(s,m,plane);
    const project=(m,v)=>Array.from({length:4},(_,i)=>v.reduce((sum,x,j)=>sum+m[j*4+i]*x,0));
    let err=0;for(const v of [[-4,plane,3,1],[4,plane,-3,1],[8,plane+11,-15,1]]){const a=project(r.matrix,v),b=project(m,[v[0],2*plane-v[1],v[2],1]);err=Math.max(err,...a.map((x,i)=>Math.abs(x-b[i])));}
    return {err,eye:r.state.pos[1]+s.pos[1]-2*plane};
  });assert(reflectionMath.err<.0001);assert(Math.abs(reflectionMath.eye)<1e-8);
  const mist=await p.evaluate(async()=>{
    const {buildTerrainData,buildMistVolume}=await import('/templates/_drafts/atlas-terrain/src/terrain.js?v=16');
    const td=buildTerrainData(),m=buildMistVolume(td),[nx,ny,nz]=m.dims;
    let occupied=0,buried=0,edge=0;
    for(let z=0;z<nz;z++)for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){
      if(!m.data[(z*ny+y)*nx+x])continue;occupied++;
      const wx=m.origin[0]+(x+.5)/nx*m.extent[0],wy=m.origin[1]+(y+.5)/ny*m.extent[1],wz=m.origin[2]+(z+.5)/nz*m.extent[2];
      if(wy<=td.sampleHeight(wx,wz))buried++;
      if(x===0||z===0||x===nx-1||z===nz-1||y===0||y===ny-1)edge++;
    }
    return {dims:m.dims,bytes:m.data.length,same:m===buildMistVolume(td),occupied,buried,edge};
  });assert.deepEqual(mist.dims,[96,32,96]);assert(mist.same);assert(mist.occupied>1000);assert.equal(mist.buried,0);assert.equal(mist.edge,0);console.log('ATLAS MIST',width,JSON.stringify(mist));
  const ambientChecks=await p.evaluate(async()=>{
    const {createMotionController}=await import('/templates/_drafts/atlas-terrain/src/motion.js?v=16');
    const simulate=function simulate(create){
  let now=1000,id=0,q=new Map(),frames=[],statuses=[];
  const add=(fn,ms)=>{q.set(++id,{fn,at:now+ms});return id;};
  const clock={now:()=>now,raf:fn=>add(()=>fn(now),16),cancelRaf:i=>q.delete(i),timer:add,cancelTimer:i=>q.delete(i)};
  const advance=ms=>{const end=now+ms;for(;;){const next=[...q.entries()].sort((a,b)=>a[1].at-b[1].at)[0];if(!next||next[1].at>end)break;now=next[1].at;q.delete(next[0]);next[1].fn();}now=end;};
  const m=create({clock,onFrame:(p,t,yaw,pitch,moving)=>{frames.push({p,t,yaw,pitch,moving});return {ambientEligible:p>=.52&&p<.86}},onAmbientChange:x=>statuses.push(x)});
  m.setMobileRate(true);m.setTargetProgress(.62,true);advance(1000);
  const scenic=frames.slice(),count=scenic.length;
  if(count<8||count>13||scenic.some(f=>f.p!==.62||f.yaw!==0||f.pitch!==0)||scenic.at(-1).t<=0||!m.getState().settled)throw Error("idle cadence");
  m.setVisible(false);advance(5000);if(frames.length!==count||q.size)throw Error("hidden redraw");
  m.setVisible(true);advance(300);if(frames.at(-1).t-scenic.at(-1).t>.35)throw Error("hidden catchup");
  m.setPaused(true);let n=frames.length;advance(1000);if(frames.length!==n||q.size)throw Error("paused redraw");
  m.setPaused(false);m.setReducedMotion(true);n=frames.length;advance(1000);if(frames.length!==n||q.size)throw Error("reduced redraw");
  m.setReducedMotion(false);m.setSoftwareThrottle(true);advance(1000);n=frames.length;advance(1000);if(frames.length!==n||q.size)throw Error("software redraw");
  m.setSoftwareThrottle(false);m.setTargetProgress(0,true);n=frames.length;advance(1000);if(frames.length!==n||q.size)throw Error("map redraw");
  m.setTargetProgress(.82);advance(3000);if(Math.abs(m.getState().currentProgress-.82)>1e-8||!m.getState().settled)throw Error("scroll not settled");
  m.dispose();if(q.size)throw Error("dispose leak");
  return {scenicFrames:count,scenicSeconds:scenic.at(-1).t,hiddenFrames:0,pausedFrames:0,softwareFrames:0,mapFrames:0,queuedAfterDispose:q.size};
};
    return simulate(createMotionController);
  });assert(ambientChecks.scenicFrames>=8&&ambientChecks.scenicFrames<=13);assert.equal(ambientChecks.queuedAfterDispose,0);console.log('ATLAS AMBIENT',width,JSON.stringify(ambientChecks));
  const hashes=[];let firstBuffer=null;
  for(const [i,f] of [0,.12,.24,.44,.62,.82,.96,.44,0].entries()){
   await p.evaluate(f=>{const t=document.querySelector('#expedition-track'),s=document.querySelector('#atlas-stage');scrollTo({top:t.getBoundingClientRect().top+scrollY+(t.offsetHeight-s.offsetHeight)*f,behavior:'instant'})},f);
   await p.waitForFunction(f=>Math.abs(+document.querySelector('#atlas-stage').dataset.renderedProgress-f)<.006&&document.querySelector('#atlas-stage').dataset.settled==='true',f,{timeout:30000});
   const stats=await p.locator('#atlas-canvas').evaluate(c=>{const gl=c.getContext('webgl2'),w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,a=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,a);let hash=2166136261,colors=new Set();for(let y=0;y<h;y+=7)for(let x=0;x<w;x+=7){const i=(y*w+x)*4;const rgb=a[i]*65536+a[i+1]*256+a[i+2];colors.add(rgb);hash=Math.imul(hash^rgb,16777619)}return {w,h,hash,colors:colors.size,error:gl.getError(),overflow:document.documentElement.scrollWidth>innerWidth+1}});
   console.log('ATLAS',width,f,JSON.stringify(stats));assert(stats.colors>25,'flat/blank render');assert.equal(stats.error,0);assert(!stats.overflow);hashes.push(stats.hash);if(!firstBuffer)firstBuffer=[stats.w,stats.h];else assert.deepEqual([stats.w,stats.h],firstBuffer,'resolution changed while scrolling');assert(+await stage.getAttribute('data-camera-clearance')>=1.8,'terrain collision');assert.equal(await p.locator('.chapter-card:not([inert])').count(),1);
   const instances=+await stage.getAttribute('data-detail-instances');if(f===0)assert.equal(instances,0);if(f===.44||f===.62||f===.82)assert.equal(instances,details.counts.reduce((a,b)=>a+b,0));
   const reflection=await stage.getAttribute('data-reflection-ready');if(f===0)assert.equal(reflection,'false');if(f===.44||f===.62){assert.equal(reflection,'true');const [rw,rh]=(await stage.getAttribute('data-reflection-size')).split('x').map(Number);assert(rw*rh<=231500&&Math.max(rw,rh)<=640);}
   const mistStrength=+await stage.getAttribute('data-mist-strength');assert.equal(await stage.getAttribute('data-mist-samples'),'12');if(f===0||f===.24||f===.44||f===.96)assert.equal(mistStrength,0);if(f===.82)assert(mistStrength>.65);
   if(f===.62){assert.notEqual(await stage.getAttribute('data-ambient-running'),'true','software reference must not animate at idle');}
   await p.screenshot({path:path.join(out,width+'-'+i+'.png'),timeout:30000});
  }
  assert(new Set(hashes).size>=6,'world does not change');assert.deepEqual(errors,[]);
  await p.locator('#map .chapter-cue').click();await p.waitForFunction(()=>Math.abs(+document.querySelector('#atlas-stage').dataset.renderedProgress-.24)<.006&&document.querySelector('#atlas-stage').dataset.settled==='true',{},{timeout:45000});
  assert.equal(await p.locator('#atlas-stage').getAttribute('data-rendered-chapter'),'ascent');
  const beforeQuality=await stage.getAttribute('data-rendered-quality');
  const beforeClearance=+await stage.getAttribute('data-camera-clearance');
  const beforeDraws=+await stage.getAttribute('data-draws');
  await p.locator('#quality-toggle').click();
  await p.waitForFunction(n=>+document.querySelector('#atlas-stage').dataset.draws>n,beforeDraws);
  assert.notEqual(await stage.getAttribute('data-rendered-quality'),beforeQuality);
  assert.equal(await stage.getAttribute('data-terrain-resolution'),'256');
  assert(Math.abs(+await stage.getAttribute('data-camera-clearance')-beforeClearance)<.002,'quality changed geographic clearance');
  await p.locator('#still-toggle').click();assert.equal(await p.locator('html').getAttribute('data-still'),'true');assert.equal(await p.locator('.static-plate:visible').count(),5);assert.equal(await p.locator('.chapter-card:visible').count(),6);
  await p.locator('#still-toggle').click();
  await p.waitForFunction(()=>document.querySelector('html').dataset.still==='false'&&document.querySelector('#atlas-stage').dataset.renderer==='webgl');
  await p.locator('#atlas-canvas').evaluate(c=>c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await p.waitForFunction(()=>document.querySelector('#atlas-stage').dataset.renderer==='static');
  assert.equal(await p.locator('.static-plate:visible').count(),5);
  await p.close();
 }
 const startup=await browser.newPage({viewport:{width:390,height:844}});
 await startup.route('**/src/main.js?v=16',async route=>{await new Promise(r=>setTimeout(r,1800));await route.continue()});
 await startup.goto(url,{waitUntil:'commit'});
 await startup.waitForFunction(()=>document.documentElement.classList.contains('atlas-booting')&&!!document.querySelector('.opening-plate'));
 assert(await startup.locator('.opening-plate').isVisible());assert.equal(await startup.locator('.static-plate:visible').count(),0);
 await startup.waitForFunction(()=>document.documentElement.dataset.firstFrame==='true',{},{timeout:45000});
 assert(!await startup.locator('html').evaluate(e=>e.classList.contains('atlas-booting')));await startup.close();
 const nojs=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});await nojs.goto(url);assert.equal(await nojs.locator('.static-plate:visible').count(),5);await nojs.close();
 const fallback=await browser.newPage({viewport:{width:390,height:844}});
 await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(k,o){return k==='webgl2'?null:original.call(this,k,o)}});
 await fallback.goto(url);await fallback.waitForFunction(()=>document.documentElement.classList.contains('atlas-no-webgl'));
 assert.equal(await fallback.locator('.static-plate:visible').count(),5);
 assert.equal(await fallback.locator('.chapter-card:not([inert])').count(),6);
 assert(await fallback.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await fallback.close();
 const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await p.goto(url);assert.equal(await p.locator('html').getAttribute('data-still'),'true');assert(await p.locator('.static-plate:visible').count()>=5);await p.close();
 console.log('PASS ATLAS: four-viewport terrain, settled scroll, stable buffers, clearance, pixel diversity, still layout, context-loss and no-WebGL alternatives.');
}finally{await browser?.close();server.kill()}
