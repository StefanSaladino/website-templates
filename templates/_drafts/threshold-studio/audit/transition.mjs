// Run from components: node --input-type=module < ../templates/_drafts/threshold-studio/audit/transition.mjs
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import sharp from 'sharp';
import {mkdirSync,writeFileSync,copyFileSync} from 'node:fs';
const out='/tmp/threshold-transition';
mkdirSync(out,{recursive:true});
const base='http://127.0.0.1:4381/templates/_drafts/threshold-studio/';
const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report={commit:process.env.GITHUB_SHA,run:process.env.GITHUB_RUN_ID,release:'P08j',verification:'P08j',viewports:[]};
function save(){writeFileSync(out+'/report.json',JSON.stringify(report,null,2))}
async function sample(page,offset){
  await page.evaluate(y=>{document.scrollingElement.scrollTop=y},offset);
  await page.waitForFunction(y=>{const s=document.scrollingElement,d=document.querySelector('#scene-study').dataset;return Math.abs(s.scrollTop-y)<=.5&&Math.abs(+d.progress-s.scrollTop/(s.scrollHeight-s.clientHeight))<.000002},offset);
  return page.evaluate(()=>{const s=document.scrollingElement,d=document.querySelector('#scene-study').dataset;return {offset:s.scrollTop,range:s.scrollHeight-s.clientHeight,p:+d.progress,eye:d.eye,fov:d.fov,shiftX:d.shiftX,folds:d.folds,graphic:d.graphic,graphicAmount:d.graphicAmount,triangles:+d.triangles,editorial:d.editorial,editorialTransform:getComputedStyle(document.querySelector('.perspective-editorial')).transform,editorialOpacity:getComputedStyle(document.querySelector('.perspective-editorial')).opacity,editorialBounds:JSON.stringify(document.querySelector('.perspective-editorial').getBoundingClientRect().toJSON()),room:document.querySelector('.journey-stage').dataset.room,exploration:d.exploration,frames:+d.frames,renderer:d.renderer,mark:getComputedStyle(document.querySelector('.display-wordmark')).opacity,copy:getComputedStyle(document.querySelector('.opening-copy')).opacity,mask:document.querySelector('#wordmark-occluder').getAttribute('points'),width:s.scrollWidth,clientWidth:s.clientWidth,stageTop:document.querySelector('.journey-stage').getBoundingClientRect().top}});
}
try{
  for(const [width,height] of [[320,568],[390,844],[1440,900],[844,390]]){
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'?ambient=off&track=exhibition');
    await page.waitForFunction(()=>document.documentElement.dataset.journey==='on'&&document.querySelector('#scene-study').dataset.renderer==='webgl');
    const range=await page.evaluate(()=>document.scrollingElement.scrollHeight-document.scrollingElement.clientHeight);
    const offsets=Array.from(new Set([...Array.from({length:21},(_,i)=>Math.round(range*i/20)),...([.147744,.1944,.315,.3294,.432,.45,.46335,.51,.558,.594,.6,.68,.792,.84,.90].flatMap(p=>[-2,0,2].map(d=>Math.max(0,Math.min(range,Math.round(range*p)+d)))))] )).sort((a,b)=>a-b);
    const canvas=await page.locator('#scene-canvas').elementHandle(),forward=new Map();
    const states=[];let priorDepth=Infinity,maxReverseDelta=0;
    const entry={width,height,range,offsetCount:offsets.length,states,status:'sampling'};report.viewports.push(entry);save();
    for(const offset of offsets){
      const state=await sample(page,offset);
      assert(state.graphic==='on'&&state.triangles===472&&state.renderer==='webgl'&&state.width<=state.clientWidth+1&&Math.abs(state.stageTop)<2&&state.range===range);
      assert(await canvas.evaluate(el=>el===document.querySelector('#scene-canvas')));
      const depth=Number(state.eye.split(',')[2]);assert(depth<=priorDepth+1e-6);priorDepth=depth;
      const image=await page.screenshot();
      forward.set(offset,{state,image});states.push(state);
      writeFileSync(out+'/dense-'+width+'-'+String(offset).padStart(5,'0')+'.png',image);
    }
    entry.status='reverse';save();
    for(const offset of offsets.slice().reverse()){
      const state=await sample(page,offset),prior=forward.get(offset);
      for(const key of ['p','eye','fov','shiftX','folds','graphic','graphicAmount','triangles','editorial','editorialTransform','editorialOpacity','editorialBounds','room','exploration','mark','copy','mask','range'])assert.equal(state[key],prior.state[key],'reverse '+key+' at '+offset);
      const screenshot=await page.screenshot();
      const pixels=await sharp(screenshot).removeAlpha().raw().toBuffer(),priorPixels=await sharp(prior.image).removeAlpha().raw().toBuffer();
      assert.equal(pixels.length,priorPixels.length);
      let changed=0;for(let i=0;i<pixels.length;i++)if(Math.abs(pixels[i]-priorPixels[i])>3)changed++;
      const fraction=changed/pixels.length;maxReverseDelta=Math.max(maxReverseDelta,fraction);
      if(fraction>=.001){
        writeFileSync(out+'/reverse-failure-'+width+'-'+offset+'.png',screenshot);
        entry.failure={offset,fraction,forward:prior.state,reverse:state};save();
        console.error('Reverse comparison diagnostic',JSON.stringify(entry.failure));
      }
      assert(fraction<.001,'reverse pixels at '+offset);
    }
    entry.maxReverseDelta=maxReverseDelta;entry.status='recording';save();
    assert.deepEqual(errors,[]);await canvas.dispose();await page.close();
    // Native input recording: actual browser video, not reconstructed animation.
    const motion=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,recordVideo:{dir:out,size:{width:Math.min(width,1280),height:Math.round(height*Math.min(width,1280)/width)}}});
    const motionErrors=[];motion.on('pageerror',e=>motionErrors.push(e.message));
    await motion.goto(base+'?ambient=off&track=exhibition');
    await motion.waitForFunction(()=>document.documentElement.dataset.journey==='on'&&document.querySelector('#scene-study').dataset.renderer==='webgl');
    await motion.evaluate(()=>{
      const el=document.querySelector('#scene-study'),trace=[];
      const observer=new MutationObserver(()=>{const s=document.scrollingElement,d=el.dataset;trace.push({time:performance.now(),offset:s.scrollTop,p:+d.progress,eye:d.eye,frame:+d.frames})});
      observer.observe(el,{attributes:true,attributeFilter:['data-frames']});window.__transitionTrace={trace,observer};
    });
    await motion.mouse.move(width*.5,height*.5);
    const delta=Math.ceil(range/16);
    try{
      for(const direction of [1,-1]){
        for(let i=0;i<17;i++){
          await motion.mouse.wheel(0,direction*delta);await motion.waitForTimeout(160);
        }
        await motion.waitForFunction(end=>{const s=document.scrollingElement,d=document.querySelector('#scene-study').dataset;return +d.progress===end&&Math.abs(s.scrollTop-end*(s.scrollHeight-s.clientHeight))<=.5},direction===1?1:0);
        await motion.waitForTimeout(400);
      }
      const trace=await motion.evaluate(()=>{window.__transitionTrace.observer.disconnect();return window.__transitionTrace.trace});
      entry.trace=trace;save();
      assert(trace.length>=20,'recorded actual scroll-triggered render updates');
      assert(trace.some(s=>s.p===1)&&trace.at(-1).p===0);assert.deepEqual(motionErrors,[]);
    }finally{
      const video=motion.video();await motion.close();
      if(video)copyFileSync(await video.path(),out+'/native-scroll-'+width+'.webm');
    }
    entry.status='passed';save();
    console.log('P08j viewport passed',width,height,offsets.length,maxReverseDelta,entry.trace.length);
  }
  // Full default-route late chapters: compare actual pixels and semantic
  // visibility on both directions, not just the shorter legacy route.
  report.completeJourney=[];
  for(const [width,height] of [[320,568],[390,844],[768,1024],[1440,900],[844,390]]){
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'?ambient=off');
    await page.waitForFunction(()=>document.documentElement.dataset.closing==='on'&&document.documentElement.dataset.journey==='on'&&document.querySelector('#scene-study').dataset.renderer==='webgl');
    const range=await page.evaluate(()=>document.scrollingElement.scrollHeight-document.scrollingElement.clientHeight);
    const offsets=[.58,.60,.62,.64,.70,.75,.77,.79,.82,.85,.88,.90,.92,.94,.96,.98,1].map(p=>Math.round(p*range));
    const canvas=await page.locator('#scene-canvas').elementHandle(),forward=new Map();
    const result={width,height,range,states:[],maxReverseDelta:0,status:'sampling'};
    report.completeJourney.push(result);save();
    async function stateAt(offset){
      const state=await sample(page,offset);
      const extra=await page.evaluate(()=>{const el=document.querySelector('.possibility'),e=document.querySelector('.exploration'),d=document.querySelector('#scene-study').dataset;return {closingHidden:el.hidden,closingInert:el.inert,closingOpacity:el.style.getPropertyValue('--possibility-opacity'),explorationInert:e.inert,quality:d.quality,samples:+d.samples};});
      assert.equal(state.triangles,592);assert.equal(extra.quality,'full');assert(extra.samples>=2);assert(state.width<=state.clientWidth+1);assert(Math.abs(state.stageTop)<2);
      assert(await canvas.evaluate(e=>e===document.querySelector('#scene-canvas')));
      return {...state,...extra};
    }
    for(const offset of offsets){
      const state=await stateAt(offset),image=await page.screenshot();
      forward.set(offset,{state,image});result.states.push(state);
      writeFileSync(out+'/complete-'+width+'x'+height+'-'+Math.round(state.p*100)+'.png',image);
    }
    assert.equal(result.states.at(-1).room,'possibility');assert.equal(result.states.at(-1).closingOpacity,'1');assert.equal(result.states.at(-1).closingInert,false);
    for(const offset of offsets.slice().reverse()){
      const state=await stateAt(offset),prior=forward.get(offset);
      for(const key of ['p','eye','fov','shiftX','room','exploration','explorationInert','closingHidden','closingInert','closingOpacity','quality','samples'])assert.equal(state[key],prior.state[key],'full reverse '+key+' at '+offset);
      const current=await sharp(await page.screenshot()).removeAlpha().raw().toBuffer(),before=await sharp(prior.image).removeAlpha().raw().toBuffer();
      assert.equal(current.length,before.length);let delta=0;
      for(let i=0;i<current.length;i++)if(Math.abs(current[i]-before[i])>3)delta++;
      result.maxReverseDelta=Math.max(result.maxReverseDelta,delta/current.length);save();
      assert(delta/current.length<.001,'full journey reverse pixels '+width+' '+offset);
    }
    assert.deepEqual(errors,[]);result.status='passed';save();await canvas.dispose();await page.close();
  }
}finally{save();await browser.close()}
