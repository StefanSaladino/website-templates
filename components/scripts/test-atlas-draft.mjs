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
  await p.addInitScript(()=>{
   const original=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(k,o){return original.call(this,k,k==='webgl2'?{...o,preserveDrawingBuffer:true}:o)};
   // Observe just the fullscreen background draw; no runtime telemetry overhead.
   window.__atlasSkyAudit={draws:0,invalid:0,afterTerrain:0,reflection:0,main:0,lastWater:0};
   const proto=WebGL2RenderingContext.prototype,drawArrays=proto.drawArrays,drawElements=proto.drawElements,terrainByTarget=new Map();
   proto.drawElements=function(mode,count,type,offset){
     if(type===this.UNSIGNED_INT){const target=this.getParameter(this.FRAMEBUFFER_BINDING);terrainByTarget.set(target,true);if(!target)window.__atlasSkyAudit.lastWater=0;}
     else if(type===this.UNSIGNED_SHORT&&!this.getParameter(this.FRAMEBUFFER_BINDING))window.__atlasSkyAudit.lastWater++;
     return drawElements.call(this,mode,count,type,offset);
   };
   proto.drawArrays=function(mode,first,count){
    if(mode===this.TRIANGLES&&first===0&&count===3){
     const target=this.getParameter(this.FRAMEBUFFER_BINDING),a=window.__atlasSkyAudit;a.draws++;
     if(target)a.reflection++;else a.main++;
     if(terrainByTarget.get(target))a.afterTerrain++;
     terrainByTarget.set(target,false);
     if(!this.isEnabled(this.DEPTH_TEST)||this.getParameter(this.DEPTH_FUNC)!==this.LEQUAL||this.getParameter(this.DEPTH_WRITEMASK)!==false||this.getParameter(this.FRONT_FACE)!==this.CCW)a.invalid++;
    }
    return drawArrays.call(this,mode,first,count);
   };
  });
  await p.goto(url,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>+document.querySelector('#atlas-stage').dataset.draws>0||document.querySelector('#atlas-stage').dataset.renderError,{},{timeout:25000});
  const stage=p.locator('#atlas-stage');assert.equal(await stage.getAttribute('data-renderer'),'webgl',await stage.getAttribute('data-render-error')||'WebGL initialization');
  assert.equal(await p.locator('html').getAttribute('data-atlas-release'),'A35');
  assert.equal(await p.locator('html').getAttribute('data-atlas-ready'),'true','scroll listeners must be installed after initialization');
  assert.equal(await p.locator('html').getAttribute('data-first-frame'),'true');assert(!await p.locator('html').evaluate(e=>e.classList.contains('atlas-booting')));
  const moduleUrls=await p.evaluate(()=>performance.getEntriesByType('resource').map(x=>x.name).filter(x=>/\/src\/[^/]+\.js(?:\?|$)/.test(x)));assert.equal(new Set(moduleUrls).size,6,'six modules');assert(moduleUrls.every(x=>new URL(x).searchParams.get('v')==='35'),'mixed module releases '+moduleUrls.join(' '));
  const invariant=await p.evaluate(async()=>{
    const m=await import('/templates/_drafts/atlas-terrain/src/terrain.js?v=35');
    const a=m.buildTerrainData(176),b=m.buildTerrainData(256);
    return {same:a===b,res:a.resolution,sameTexture:a.heightTexData===b.heightTexData,sameMesh:a.positions===b.positions,peak:a.sampleHeight(11.5,-18.5)};
  });assert(invariant.peak>20.5,'Kestrel crown lost');assert.deepEqual({...invariant,peak:undefined},{same:true,res:256,sameTexture:true,sameMesh:true,peak:undefined});
  const framing=await p.evaluate(async()=>{
    const {buildTerrainData,WATER_LEVEL}=await import('/templates/_drafts/atlas-terrain/src/terrain.js?v=35');
    const {evaluateWorldState}=await import('/templates/_drafts/atlas-terrain/src/camera.js?v=35');
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
    const {buildTerrainData,buildLandscapeDetails,WATER_LEVEL}=await import('/templates/_drafts/atlas-terrain/src/terrain.js?v=35');
    const td=buildTerrainData(),b=buildLandscapeDetails(td);let triangles=0,wet=0,invalid=0;
    for(const m of b){triangles+=m.vertices.length/27*m.count;for(let i=0;i<m.instances.length;i+=8){const [x,y,z]=m.instances.subarray(i,i+3),h=td.sampleHeight(x,z);if(h<=WATER_LEVEL)wet++;if(Math.abs(y-h)>.0201)invalid++;}}
    return {triangles,wet,invalid,counts:b.map(m=>m.count),same:b===buildLandscapeDetails(td)};
  });assert(details.same);assert.equal(details.wet,0);assert.equal(details.invalid,0);assert(details.counts.every(n=>n>0));assert(details.triangles<=65000);console.log('ATLAS DETAILS',width,JSON.stringify(details));
  const shadows=await p.evaluate(async()=>{
    const {buildTerrainData,buildLandscapeDetails,buildDetailShadowField}=await import('/templates/_drafts/atlas-terrain/src/terrain.js?v=35');
    const td=buildTerrainData(),f=buildDetailShadowField(td);let different=0,total=0,anchored=0;
    for(let i=0;i<f.data.length;i+=2)if(f.data[i]!==f.data[i+1])different++;
    for(const b of buildLandscapeDetails(td))for(let i=0;i<b.instances.length;i+=8){total++;const [x,y,z]=b.instances.subarray(i,i+3),[bx,bz,sx,sz]=f.bounds;const j=(Math.floor((z-bz)/sz*f.size)*f.size+Math.floor((x-bx)/sx*f.size))*2;if(f.data[j]>0&&f.data[j+1]>0)anchored++;}
    return {bytes:f.data.length,same:f===buildDetailShadowField(td),different,total,anchored};
  });assert(shadows.same);assert.equal(shadows.bytes,2097152);assert(shadows.different>1000);assert.equal(shadows.total,shadows.anchored);
  const reflectionMath=await p.evaluate(async()=>{
    const {mirrorLakeView}=await import('/templates/_drafts/atlas-terrain/src/renderer.js?v=35');
    const {evaluateWorldState,buildViewProjMatrix}=await import('/templates/_drafts/atlas-terrain/src/camera.js?v=35');
    const {buildTerrainData,WATER_LEVEL}=await import('/templates/_drafts/atlas-terrain/src/terrain.js?v=35');
    const td=buildTerrainData(),aspect=innerWidth/innerHeight,s=evaluateWorldState(.62,aspect,td.sampleHeight);
    const m=buildViewProjMatrix(s.pos,s.look,[0,1,0],s.fovDeg,aspect).viewProj,plane=WATER_LEVEL*s.relief,r=mirrorLakeView(s,m,plane);
    const project=(m,v)=>Array.from({length:4},(_,i)=>v.reduce((sum,x,j)=>sum+m[j*4+i]*x,0));
    let err=0;for(const v of [[-4,plane,3,1],[4,plane,-3,1],[8,plane+11,-15,1]]){const a=project(r.matrix,v),b=project(m,[v[0],2*plane-v[1],v[2],1]);err=Math.max(err,...a.map((x,i)=>Math.abs(x-b[i])));}
    return {err,eye:r.state.pos[1]+s.pos[1]-2*plane};
  });assert(reflectionMath.err<.0001);assert(Math.abs(reflectionMath.eye)<1e-8);
  const mist=await p.evaluate(async()=>{
    const {buildTerrainData,buildMistVolume}=await import('/templates/_drafts/atlas-terrain/src/terrain.js?v=35');
    const td=buildTerrainData(),m=buildMistVolume(td),[nx,ny,nz]=m.dims;
    let occupied=0,buried=0,edge=0,top=0;
    for(let z=0;z<nz;z++)for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){
      if(!m.data[(z*ny+y)*nx+x])continue;occupied++;
      const wx=m.origin[0]+(x+.5)/nx*m.extent[0],wy=m.origin[1]+(y+.5)/ny*m.extent[1],wz=m.origin[2]+(z+.5)/nz*m.extent[2];
      top=Math.max(top,wy);
      if(wy<=td.sampleHeight(wx,wz))buried++;
      if(x===0||z===0||x===nx-1||z===nz-1||y===0||y===ny-1)edge++;
    }
    return {dims:m.dims,bytes:m.data.length,same:m===buildMistVolume(td),occupied,buried,edge,top};
  });assert.deepEqual(mist.dims,[96,32,96]);assert(mist.same);assert(mist.occupied>1000);assert.equal(mist.buried,0);assert.equal(mist.edge,0);assert(mist.top<10.0);console.log('ATLAS MIST',width,JSON.stringify(mist));
  const ambientChecks=await p.evaluate(async()=>{
    const {createMotionController}=await import('/templates/_drafts/atlas-terrain/src/motion.js?v=35');
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
  // Reproduce the idle timer -> queued ambient rAF window on a 12Hz mobile clock.
  // Scroll must cancel that ambient rAF and schedule actual camera motion.
  const race=create({clock,onFrame:(p,t,yaw,pitch,moving)=>{frames.push({p,t,yaw,pitch,moving});return {ambientEligible:p>=.52&&p<.86}}});
  race.setMobileRate(true);race.setTargetProgress(.62,true);advance(84);
  if(q.size!==1)throw Error("expected one queued ambient frame");
  const raceStart=now;race.setTargetProgress(.82);advance(32);
  if(!(race.getState().currentProgress>.62&&race.getState().currentProgress<.82))throw Error("ambient frame blocked scroll");
  while(!race.getState().settled&&now-raceStart<1000)advance(16);
  const forwardMs=now-raceStart;
  if(forwardMs>680||race.getState().currentProgress!==.82)throw Error("slow or inexact forward settle "+forwardMs);
  const reverseStart=now;race.setTargetProgress(.62);
  while(!race.getState().settled&&now-reverseStart<1000)advance(16);
  const reverseMs=now-reverseStart;
  if(reverseMs>680||race.getState().currentProgress!==.62)throw Error("slow or inexact reverse settle "+reverseMs);
  race.dispose();if(q.size)throw Error("ambient rAF dispose leak");
  // Delayed/coalesced native events: the active frame must consume the newest
  // position, without requiring another event, snapping, or polling at rest.
  let native=.64,reads=0;
  const input=create({clock,readNativeProgress:()=>{reads++;return native;},onFrame:()=>({ambientEligible:false})});
  input.setTargetProgress(.64,true);
  native=.66;input.setTargetProgress(native);advance(16);
  if(!(input.getState().currentProgress>.64&&input.getState().currentProgress<.66))throw Error("initial native motion");
  native=.76;advance(16);
  if(input.getState().targetProgress!==.76||!(input.getState().currentProgress<.76))throw Error("coalesced native forward sample");
  native=.60;advance(16);
  if(input.getState().targetProgress!==.60)throw Error("coalesced native reverse sample");
  advance(1000);
  if(input.getState().currentProgress!==.60||!input.getState().settled)throw Error("native exact settle");
  const beforeIdleReads=reads;advance(1000);
  if(reads!==beforeIdleReads||q.size)throw Error("native poll while idle");
  input.setTargetProgress(.82,true);input.forceRedraw();advance(32);
  if(input.getState().currentProgress!==.82||reads!==beforeIdleReads)throw Error("native poll overrode immediate pose");
  input.dispose();if(q.size)throw Error("native follow dispose leak");
  return {forwardMs,reverseMs,scenicFrames:count,scenicSeconds:scenic.at(-1).t,hiddenFrames:0,pausedFrames:0,softwareFrames:0,mapFrames:0,queuedAfterDispose:q.size};
};
    return simulate(createMotionController);
  });assert(ambientChecks.scenicFrames>=8&&ambientChecks.scenicFrames<=13);assert.equal(ambientChecks.queuedAfterDispose,0);console.log('ATLAS AMBIENT',width,JSON.stringify(ambientChecks));
  const inversion=await p.evaluate(async()=>{
    const {buildTerrainData,buildSummitInversion}=await import('/templates/_drafts/atlas-terrain/src/terrain.js?v=35');
    const td=buildTerrainData(),v=buildSummitInversion(td);let occupied=0,buried=0;const [nx,ny,nz]=v.dims;
    for(let z=0;z<nz;z++)for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){if(!v.data[(z*ny+y)*nx+x])continue;occupied++;const a=[x,y,z].map((k,i)=>v.origin[i]+(k+.5)/v.dims[i]*v.extent[i]);if(a[1]<=td.sampleHeight(a[0],a[2]))buried++;}
    return {dims:v.dims,occupied,buried,same:v===buildSummitInversion(td)};
  });assert.deepEqual(inversion.dims,[128,48,128]);assert(inversion.occupied>10000);assert.equal(inversion.buried,0);assert(inversion.same);
  const refinement=await p.evaluate(async()=>{
    const {buildTerrainData}=await import('/templates/_drafts/atlas-terrain/src/terrain.js?v=35');
    const td=buildTerrainData();let maxError=0,invalid=0;
    for(let i=0;i<td.indices.length;i+=3){const a=td.indices[i]*3,b=td.indices[i+1]*3,c=td.indices[i+2]*3,P=td.positions;
      const x=(P[a]+P[b]+P[c])/3,y=(P[a+1]+P[b+1]+P[c+1])/3,z=(P[a+2]+P[b+2]+P[c+2])/3;
      maxError=Math.max(maxError,Math.abs(td.sampleHeight(x,z)-y));
      if((P[b+2]-P[a+2])*(P[c]-P[a])-(P[b]-P[a])*(P[c+2]-P[a+2])<=0)invalid++;
    }
    return {...td.refinement,maxError,invalid};
  });assert(refinement.triangles>refinement.baseTriangles&&refinement.triangles<185000);assert(refinement.maxError<.003);assert.equal(refinement.invalid,0);console.log('ATLAS REFINEMENT',width,JSON.stringify(refinement));
  const hashes=[];let firstBuffer=null;
  for(const [i,f] of [0,.12,.24,.44,.62,.82,.96,.44,0].entries()){
   await p.evaluate(f=>{const t=document.querySelector('#expedition-track'),s=document.querySelector('#atlas-stage');scrollTo({top:t.getBoundingClientRect().top+scrollY+(t.offsetHeight-s.offsetHeight)*f,behavior:'instant'})},f);
   await p.waitForFunction(f=>Math.abs(+document.querySelector('#atlas-stage').dataset.renderedProgress-f)<.006&&document.querySelector('#atlas-stage').dataset.settled==='true',f,{timeout:30000});
   const stats=await p.locator('#atlas-canvas').evaluate(c=>{const gl=c.getContext('webgl2'),w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,a=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,a);let hash=2166136261,colors=new Set();for(let y=0;y<h;y+=7)for(let x=0;x<w;x+=7){const i=(y*w+x)*4;const rgb=a[i]*65536+a[i+1]*256+a[i+2];colors.add(rgb);hash=Math.imul(hash^rgb,16777619)}return {w,h,hash,colors:colors.size,error:gl.getError(),overflow:document.documentElement.scrollWidth>innerWidth+1}});
   console.log('ATLAS',width,f,JSON.stringify(stats));assert(stats.colors>25,'flat/blank render');assert.equal(stats.error,0);assert(!stats.overflow);hashes.push(stats.hash);if(!firstBuffer)firstBuffer=[stats.w,stats.h];else assert.deepEqual([stats.w,stats.h],firstBuffer,'resolution changed while scrolling');assert(+await stage.getAttribute('data-camera-clearance')>=1.8,'terrain collision');assert.equal(await p.locator('.chapter-card:not([inert])').count(),1);
   const instances=+await stage.getAttribute('data-detail-instances');if(f===0)assert.equal(instances,0);if(f===.44||f===.62||f===.82)assert.equal(instances,details.counts.reduce((a,b)=>a+b,0));
   const lakeInFrame=await stage.getAttribute('data-lake-in-frame');
   const waterDraws=await p.evaluate(()=>window.__atlasSkyAudit.lastWater);
   assert.equal(waterDraws,lakeInFrame==='true'?1:0,'water pass must follow conservative visibility');
   if(f===0||f===.96)assert.equal(lakeInFrame,'false');
   if(f===.44||f===.62)assert.equal(lakeInFrame,'true');
   const reflection=await stage.getAttribute('data-reflection-ready');if(f===0)assert.equal(reflection,'false');if(f===.44||f===.62){assert.equal(reflection,'true');const [rw,rh]=(await stage.getAttribute('data-reflection-size')).split('x').map(Number);assert(rw*rh<=231500&&Math.max(rw,rh)<=640);}
   const mistStrength=+await stage.getAttribute('data-mist-strength');assert.equal(await stage.getAttribute('data-mist-samples'),f===.82?'16':'12');if(f===0||f===.24||f===.44||f===.96)assert.equal(mistStrength,0);if(f===.82){assert(mistStrength>.65);assert(+await stage.getAttribute('data-inversion-mix')>.99);}
   if(f===.62){assert.notEqual(await stage.getAttribute('data-ambient-running'),'true','software reference must not animate at idle');}
   if(f===.96){
     const fit=await p.locator('#archive .chapter-inner').evaluate(e=>({scroll:e.scrollHeight,client:e.clientHeight}));
     assert(fit.scroll<=fit.client+2,'archive requires nested scrolling at '+width+' '+JSON.stringify(fit));
     assert.equal(await p.locator('#archive [data-viewpoint]:visible').count(),3);
   }
   if(f===.62){assert(await p.locator('#inspect-toggle').isVisible());assert(!await p.locator('#inspect-options').isVisible());}
   await p.screenshot({path:path.join(out,width+'-'+i+'.png'),timeout:30000});
  }
  const skyAudit=await p.evaluate(()=>window.__atlasSkyAudit);
  assert(skyAudit.main>0&&skyAudit.reflection>0,'both background passes must run');
  assert.equal(skyAudit.invalid,0,'background must depth-test at far plane without writes');
  assert.equal(skyAudit.afterTerrain,skyAudit.draws,'background ran before terrain');
  console.log('ATLAS SKY DEPTH',width,JSON.stringify(skyAudit));
  assert(new Set(hashes).size>=6,'world does not change');assert.equal(hashes[0],hashes[8],'map reverse pose is not deterministic');assert.equal(hashes[3],hashes[7],'descent reverse pose is not deterministic');assert.deepEqual(errors,[]);
  if(width===390){
    for(const [i,f] of [.06,.10,.14,.18,.30,.34,.39,.49,.52,.56,.68,.72,.76,.86,.90,.93,.985,1].entries()){
      await p.evaluate(f=>{const t=document.querySelector('#expedition-track'),s=document.querySelector('#atlas-stage');scrollTo({top:t.getBoundingClientRect().top+scrollY+(t.offsetHeight-s.offsetHeight)*f,behavior:'instant'})},f);
      await p.waitForFunction(f=>Math.abs(+document.querySelector('#atlas-stage').dataset.renderedProgress-f)<.006&&document.querySelector('#atlas-stage').dataset.settled==='true',f,{timeout:30000});
      await p.screenshot({path:path.join(out,'390-bridge-'+i+'.png'),timeout:30000});
    }
    await p.locator('.atlas-brand').click();await p.waitForFunction(()=>+document.querySelector('#atlas-stage').dataset.renderedProgress<.006&&document.querySelector('#atlas-stage').dataset.settled==='true',{},{timeout:45000});
  }
  await p.locator('#map .chapter-cue').click();await p.waitForFunction(()=>Math.abs(+document.querySelector('#atlas-stage').dataset.renderedProgress-.24)<.006&&document.querySelector('#atlas-stage').dataset.settled==='true',{},{timeout:45000});
  assert.equal(await p.locator('#atlas-stage').getAttribute('data-rendered-chapter'),'ascent');
  if(width===390){
    await p.locator('.mast-archive-link').click();await p.waitForFunction(()=>document.querySelector('html').dataset.activeChapter==='archive'&&document.querySelector('#atlas-stage').dataset.settled==='true',{},{timeout:45000});
    await p.locator('[data-viewpoint="tarn-overlook"]').click();await p.waitForFunction(()=>document.querySelector('html').dataset.activeChapter==='valley'&&document.querySelector('#atlas-stage').dataset.settled==='true',{},{timeout:45000});
    assert(await p.locator('#return-archive').isVisible());assert.equal(await p.locator('[data-viewpoint="tarn-overlook"]').getAttribute('aria-current'),'true');
    await p.locator('#inspect-toggle').click();assert(await p.locator('#inspect-options').isVisible());await p.keyboard.press('Escape');assert(!await p.locator('#inspect-options').isVisible());
    await p.locator('#return-archive').click();await p.waitForFunction(()=>document.querySelector('html').dataset.activeChapter==='archive'&&document.querySelector('#atlas-stage').dataset.settled==='true',{},{timeout:45000});
    assert.equal(await p.evaluate(()=>document.activeElement.dataset.viewpoint),'tarn-overlook');
    await p.locator('.atlas-brand').click();await p.waitForFunction(()=>document.querySelector('html').dataset.activeChapter==='map'&&document.querySelector('#atlas-stage').dataset.settled==='true',{},{timeout:45000});
    await p.locator('#map .chapter-cue').click();await p.waitForFunction(()=>Math.abs(+document.querySelector('#atlas-stage').dataset.renderedProgress-.24)<.006&&document.querySelector('#atlas-stage').dataset.settled==='true',{},{timeout:45000});
  }
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
  // Start at an exact summit anchor on portrait; navigate to a different
  // static chapter before recovery to catch stale live-scroll coordinates.
  if(width===390){
    await p.evaluate(()=>{const t=document.querySelector('#expedition-track'),s=document.querySelector('#atlas-stage');scrollTo({top:t.getBoundingClientRect().top+scrollY+(t.offsetHeight-s.offsetHeight)*.82,behavior:'instant'});});
    await p.waitForFunction(()=>Math.abs(+document.querySelector('#atlas-stage').dataset.renderedProgress-.82)<.006&&document.querySelector('#atlas-stage').dataset.settled==='true',{},{timeout:45000});
  }
  const beforeLossChapter=await stage.getAttribute('data-rendered-chapter');
  await p.locator('#atlas-canvas').evaluate(c=>{const ext=c.getContext('webgl2').getExtension('WEBGL_lose_context');if(!ext)throw Error('Missing context-loss extension');window.__atlasLoseContext=ext;ext.loseContext();});
  await p.waitForFunction(()=>document.querySelector('#atlas-stage').dataset.renderer==='static');
  assert.equal(await p.locator('.static-plate:visible').count(),5);
  assert.equal(await p.locator('.chapter-card:not([inert])').count(),6);
  assert.equal(await p.locator('html').getAttribute('data-active-chapter'),beforeLossChapter);
  if(width===390||width===1440){
    const target=width===390?'valley':beforeLossChapter;
    if(width===390){
      await p.evaluate(()=>{const e=document.getElementById('valley');window.scrollTo({top:e.getBoundingClientRect().top+scrollY-64,behavior:'instant'});});
      await p.waitForFunction(()=>document.documentElement.dataset.activeChapter==='valley');
    }
    const lostDraws=+await stage.getAttribute('data-draws');
    await p.evaluate(()=>window.__atlasLoseContext.restoreContext());
    await p.waitForFunction(({n,chapter})=>{const d=document.querySelector('#atlas-stage').dataset;return d.renderer==='webgl'&&+d.draws>n&&d.renderedChapter===chapter&&d.settled==='true';},{n:lostDraws,chapter:target},{timeout:45000});
    assert.equal(await p.locator('.static-plate:visible').count(),0);
    assert.equal(await p.locator('.chapter-card:not([inert])').count(),1);
    const recovery=await p.locator('#atlas-canvas').evaluate(c=>{const gl=c.getContext('webgl2'),a=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,a);const colors=new Set();for(let i=0;i<a.length;i+=124)colors.add(a[i]*65536+a[i+1]*256+a[i+2]);return {colors:colors.size,error:gl.getError()};});
    assert(recovery.colors>25,'restored WebGL is blank');assert.equal(recovery.error,0);
    await p.evaluate(()=>{const t=document.querySelector('#expedition-track'),s=document.querySelector('#atlas-stage');scrollTo({top:t.getBoundingClientRect().top+scrollY+(t.offsetHeight-s.offsetHeight)*.44,behavior:'instant'});});
    await p.waitForFunction(()=>Math.abs(+document.querySelector('#atlas-stage').dataset.renderedProgress-.44)<.006&&document.querySelector('#atlas-stage').dataset.settled==='true',{},{timeout:45000});
    console.log('ATLAS CONTEXT RESTORE',width,target,JSON.stringify(recovery));
  }
  assert.deepEqual(errors,[]);
  await p.close();
 }
 const startup=await browser.newPage({viewport:{width:390,height:844}});
 await startup.route('**/src/main.js?v=35',async route=>{await new Promise(r=>setTimeout(r,1800));await route.continue()});
 await startup.goto(url,{waitUntil:'commit'});
 await startup.waitForFunction(()=>document.documentElement.classList.contains('atlas-booting')&&!!document.querySelector('.opening-plate'));
 assert(await startup.locator('.opening-plate').isVisible());assert.equal(await startup.locator('.static-plate:visible').count(),0);
 await startup.waitForFunction(()=>document.documentElement.dataset.firstFrame==='true',{},{timeout:45000});
 assert(!await startup.locator('html').evaluate(e=>e.classList.contains('atlas-booting')));await startup.close();
 const nojs=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});await nojs.goto(url);assert.equal(await nojs.locator('.static-plate:visible').count(),5);await nojs.close();
 const fallback=await browser.newPage({viewport:{width:390,height:844}});
 await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(k,o){return k==='webgl2'?null:original.call(this,k,o)}});
 await fallback.goto(url+'?device-review=1');await fallback.waitForFunction(()=>document.documentElement.classList.contains('atlas-no-webgl'));
 const review=fallback.locator('#atlas-device-review');await review.waitFor();
 assert(await review.getByRole('button',{name:'Run sweep'}).isDisabled());
 assert(await review.getByRole('button',{name:'Record scroll'}).isDisabled());
 assert(await review.getByRole('button',{name:'Save JSON'}).isDisabled());
 await review.getByRole('button',{name:'Close'}).click();assert.equal(await review.count(),0);
 assert.equal(await fallback.locator('.static-plate:visible').count(),5);
 assert.equal(await fallback.locator('.chapter-card:not([inert])').count(),6);
 assert(await fallback.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await fallback.close();
 const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await p.goto(url);assert.equal(await p.locator('html').getAttribute('data-still'),'true');assert(await p.locator('.static-plate:visible').count()>=5);await p.close();
 console.log('PASS ATLAS: four-viewport terrain, settled scroll, stable buffers, clearance, pixel diversity, still layout, context-loss/restoration and no-WebGL alternatives.');
}finally{await browser?.close();server.kill()}
