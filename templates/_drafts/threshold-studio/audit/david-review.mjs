import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import sharp from 'sharp';
import {mkdirSync,writeFileSync} from 'node:fs';
const out='/tmp/david-review';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const report=[];
 for(const [width,height] of [[320,568],[390,844],[768,1024],[1440,900],[844,390]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4382/templates/_drafts/threshold-studio/?track=perspective&ambient=off');
  await page.waitForFunction(()=>{const d=document.querySelector('#scene-study').dataset;return d.david==='ready'&&d.renderer==='webgl'&&document.documentElement.dataset.journey==='on'});
  const stage=page.locator('#scene-study');
  assert.equal(await stage.getAttribute('data-triangles'),'18422');
  const forward=new Map();let maxReverseDelta=0;
  const handle=await page.locator('#scene-canvas').elementHandle();
  for(const [i,p] of [0,.8,.9,1,.9,.8,0].entries()){
   await page.evaluate(p=>{const s=document.scrollingElement;s.scrollTop=(s.scrollHeight-s.clientHeight)*p},p);
   await page.waitForFunction(p=>Math.abs(+document.querySelector('#scene-study').dataset.progress-p)<.002,p);
   assert(await handle.evaluate(el=>el===document.querySelector('#scene-canvas')));
   assert.equal(await stage.getAttribute('data-sculpture-uploads'),'0');
   const image=await page.screenshot(p===1?{path:out+'/david-'+width+'x'+height+'.png'}:{});
   if(i<4)forward.set(p,image);
   else{
     const x=await sharp(forward.get(p)).removeAlpha().raw().toBuffer(),y=await sharp(image).removeAlpha().raw().toBuffer();
     assert.equal(x.length,y.length);let changed=0;for(let j=0;j<x.length;j++)if(Math.abs(x[j]-y[j])>3)changed++;
     maxReverseDelta=Math.max(maxReverseDelta,changed/x.length);assert(changed<x.length*.001);
   }
   if(p===1)assert(await page.locator('.david-credit').isVisible());
  }
  assert.deepEqual(errors,[]);report.push({width,height,triangles:18422,asset:'ready',maxReverseDelta});
  writeFileSync(out+'/report.json',JSON.stringify(report,null,2));await handle.dispose();await page.close();
 }
}finally{await browser.close()}
