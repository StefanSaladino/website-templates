import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
const out='/tmp/david-review';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const report=[];
 for(const [width,height] of [[320,568],[390,844],[768,1024],[1440,900],[844,390]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4382/templates/_drafts/threshold-studio/?sculpture=david&track=perspective&ambient=off');
  await page.waitForFunction(()=>{const d=document.querySelector('#scene-study').dataset;return d.david==='ready'&&d.renderer==='webgl'&&document.documentElement.dataset.journey==='on'});
  const stage=page.locator('#scene-study');
  assert.equal(await stage.getAttribute('data-triangles'),'18422');
  for(const p of [0,.8,.9,1,.9,.8,0]){
   await page.evaluate(p=>{const s=document.scrollingElement;s.scrollTop=(s.scrollHeight-s.clientHeight)*p},p);
   await page.waitForFunction(p=>Math.abs(+document.querySelector('#scene-study').dataset.progress-p)<.002,p);
   if(p===1){await page.screenshot({path:out+'/david-'+width+'x'+height+'.png'});assert(await page.locator('.david-credit').isVisible())}
  }
  assert.deepEqual(errors,[]);report.push({width,height,triangles:18422,asset:'ready'});
  writeFileSync(out+'/report.json',JSON.stringify(report,null,2));await page.close();
 }
}finally{await browser.close()}
