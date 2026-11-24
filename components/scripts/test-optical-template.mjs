import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {discoverTemplates} from './template-catalogue.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),origin='http://127.0.0.1:4290',id='essence-fragrance',dir=path.join(root,'components/cinematic-evidence');
const marked=discoverTemplates(root).filter(n=>/data-optical-template/.test(readFileSync(path.join(root,'templates',n,'index.html'),'utf8')));assert.deepEqual(marked,[id]);mkdirSync(dir,{recursive:true});
const server=spawn('python3',['-m','http.server','4290','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});let browser;const engine=process.env.OPTICAL_BROWSER==='webkit'?'webkit':'chromium',report={engine,cases:[],errors:[],visualAcceptance:false};
const allowed=new Set(["https://images.pexels.com/photos/7796322/pexels-photo-7796322.jpeg","https://images.pexels.com/photos/20009566/pexels-photo-20009566.jpeg"]);
try{
 for(let i=0;i<50;i++){try{if((await fetch(origin+'/')).ok)break}catch{}await new Promise(r=>setTimeout(r,200))}
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 browser=engine==='webkit'?await webkit.launch({headless:true}):await chromium.launch({headless:true,executablePath,args:['--no-sandbox']});
 for(const width of [320,390,768,1440])for(const mode of ['motion','reduce','nojs']){
  const context=await browser.newContext({viewport:{width,height:850},reducedMotion:mode==='reduce'?'reduce':'no-preference',javaScriptEnabled:mode!=='nojs'}),page=await context.newPage(),errors=[],unexpected=[];
  await page.route('**/*',r=>{const u=r.request().url();if(u.startsWith(origin+'/'))return r.continue();if(allowed.has(u.split('?')[0])&&r.request().resourceType()==='image')return r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900"><defs><pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#be9760"/><rect width="20" height="20" fill="#4b2711"/><rect x="20" y="20" width="20" height="20" fill="#e1cfa8"/></pattern></defs><rect width="600" height="900" fill="url(#p)"/></svg>'});unexpected.push(u);return r.abort()});page.on('pageerror',e=>errors.push(String(e)));
  try{
   await page.goto(origin+'/templates/'+id+'/',{waitUntil:'domcontentloaded'});assert.equal(await page.locator('canvas,object,embed').count(),0);
   const scene=page.locator('#light-scene'),slider=page.locator('#strength'),motion=page.locator('#motion'),reflection=page.locator('.reflection'),photo=page.locator('.light-photo');
   await page.locator('#light').evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY,behavior:'instant'}));await photo.locator('img').first().evaluate(img=>img.decode());await reflection.locator('img').evaluate(img=>img.decode());
   assert.equal(await page.locator('.shot img, .opening-photo img,.notes-photo img,.light-photo img').count(),4);
   if(mode==='nojs'){assert(await slider.isDisabled());assert.equal(await reflection.evaluate(e=>getComputedStyle(e).opacity),'1');assert.equal(await scene.getAttribute('data-strength'),'50');assert.equal(await page.locator('#wave-displacement').getAttribute('scale'),'18');}
   else{
    assert.equal(await scene.getAttribute('data-strength'),'50');assert.equal(await slider.inputValue(),'50');assert.equal(await page.locator('#wave-displacement').getAttribute('scale'),'18.00');assert.equal(await reflection.evaluate(e=>getComputedStyle(e).opacity),'1');assert.equal(await scene.getAttribute('data-motion'),mode==='motion'?'running':'still');if(mode==='motion'){const phase=await scene.getAttribute('data-phase');await page.waitForFunction(p=>Number(document.querySelector('#light-scene').dataset.phase)>Number(p)+.1,phase);
     // Verify the actual automatic motion, not merely a timer or changing SVG attribute.
     const transformBefore=await reflection.locator('img').evaluate(el=>getComputedStyle(el).transform),frameBefore=await photo.screenshot();
     const sampleTime=Number(await scene.getAttribute('data-phase'));
     await page.waitForFunction(p=>Number(document.querySelector('#light-scene').dataset.phase)>p+.55,sampleTime);
     const transformAfter=await reflection.locator('img').evaluate(el=>getComputedStyle(el).transform),frameAfter=await photo.screenshot();
     assert.notEqual(transformBefore,transformAfter,'Reflection transform must move at default 50%');
     assert(!frameBefore.equals(frameAfter),'Visible reflection pixels must animate at default 50%');
     await motion.click();assert.equal(await scene.getAttribute('data-motion'),'still');}await slider.fill('100');assert.equal(await page.locator('#wave-displacement').getAttribute('scale'),'36.00');assert.equal(await scene.getAttribute('data-strength'),'100');assert.equal(await reflection.evaluate(e=>getComputedStyle(e).opacity),'1');
    // Capture the underlying image area with UI excluded. Compare only photos,
    // after toggling reflection opacity; deterministic fixture, not real-media evidence.
    const changed=await photo.screenshot();await slider.fill('0');assert.equal(await page.locator('#wave-displacement').getAttribute('scale'),'0.00');const original=await photo.screenshot();assert(!changed.equals(original),'Optical pixels must change');await page.locator('#reset').click();assert.equal(await slider.inputValue(),'50');assert.equal(await scene.getAttribute('data-strength'),'50');assert.equal(await scene.getAttribute('data-motion'),mode==='motion'?'running':'still');
    if(mode==='reduce'){assert(await motion.isDisabled());}else{
     assert.equal(await scene.getAttribute('data-motion'),'running');await page.locator('#light').evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY,behavior:'instant'}));const phase=await scene.getAttribute('data-phase');await page.waitForFunction(p=>document.querySelector('#light-scene').dataset.phase!==p,phase);
     await motion.click();assert.equal(await scene.getAttribute('data-motion'),'still');const stopped=await scene.getAttribute('data-phase');await page.waitForTimeout(180);assert.equal(await scene.getAttribute('data-phase'),stopped);
     await motion.click();await page.locator('#opening').evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY,behavior:'instant'}));await page.waitForTimeout(150);const off=await scene.getAttribute('data-phase');await page.waitForTimeout(150);assert.equal(await scene.getAttribute('data-phase'),off,'Offscreen rendering must suspend');
     await page.locator('#light').evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY,behavior:'instant'}));await page.locator('#reset').click();
    }
   }
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);await page.screenshot({path:path.join(dir,id+'-'+engine+'-'+width+'-'+mode+'.png')});report.cases.push({width,mode,sourceImagesMocked:true});
  }catch(e){report.errors.push(width+' '+mode+': '+String(e))}finally{await context.close()}
 }
}finally{await browser?.close();server.kill('SIGTERM');writeFileSync(path.join(dir,'optical-results-'+engine+'.json'),JSON.stringify(report,null,2));for(const err of report.errors)console.error('OPTICAL-FAIL',err);console.log('Optical QA:',report.cases.length,'passed,',report.errors.length,'failed');if(report.errors.length||report.cases.length!==12)process.exitCode=1}
