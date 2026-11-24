import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {discoverTemplates,compareMembership} from './template-catalogue.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),specs=JSON.parse(readFileSync(path.join(root,'components/data/cinematic-tests.json'),'utf8'));
const marked=discoverTemplates(root).filter(id=>/<html\b[^>]*\bdata-cinematic-template\b/.test(readFileSync(path.join(root,'templates',id,'index.html'),'utf8')));
assert(Object.values(compareMembership(marked,Object.keys(specs))).every(a=>!a.length),'Cinematic spec membership mismatch');
const origin='http://127.0.0.1:4289',dir=path.join(root,'components/cinematic-evidence');mkdirSync(dir,{recursive:true});
const server=spawn('python3',['-m','http.server','4289','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'}),report={cases:[],errors:[],visualAcceptance:false,physicalDeviceAcceptance:false};let browser;
try{
 for(let i=0;i<50;i++){try{if((await fetch(origin+'/')).ok)break}catch{}await new Promise(r=>setTimeout(r,200))}
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox']});
 for(const [id,s] of Object.entries(specs)){
  for(const width of [320,390,768,1440])for(const mode of ['motion','reduce','nojs']){
   const context=await browser.newContext({viewport:{width,height:850},reducedMotion:mode==='reduce'?'reduce':'no-preference',javaScriptEnabled:mode!=='nojs'}),page=await context.newPage(),errors=[],unexpected=[];
   // Remote photo delivery/decode is covered in separate loaded-media workflow.
   // A deterministic response isolates the actual timeline, not visual acceptance.
   await page.route('**/*',r=>{const url=r.request().url();if(url.startsWith(origin+'/'))return r.continue();if(s.imageIdentities.includes(url.split('?')[0])&&r.request().resourceType()==='image')return r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450"><rect width="800" height="450" fill="#213549"/><path d="M0 450 600 0H800V450Z" fill="#354559"/></svg>'});unexpected.push(url);return r.abort()});
   page.on('pageerror',e=>errors.push(String(e)));
   try{
    await page.goto(origin+'/templates/'+id+'/',{waitUntil:'domcontentloaded'});
    const film=page.locator(s.film);
    assert.equal(await film.getAttribute('data-cinematic'),mode==='motion'?'motion':mode==='reduce'?'still':'static');
    const go=async(chapter)=>{await page.locator('#'+chapter).evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY,behavior:'instant'}));if(mode!=='nojs')await page.waitForFunction(({sel,chapter})=>document.querySelector(sel).dataset.chapter===chapter,{sel:s.film,chapter});};
    for(const chapter of s.chapters){await go(chapter);assert(await page.locator('#'+chapter+' h1, #'+chapter+' h2').isVisible());if(mode!=='nojs')assert.equal(await page.locator('[data-jump="'+chapter+'"]').getAttribute('aria-current'),'location');}
    await go(s.chapters[0]);
    if(mode==='motion'){
     const sample=async()=>page.evaluate(sel=>{const f=document.querySelector(sel),shots=[...f.querySelectorAll('.shot')];return {progress:f.dataset.progress,blend:f.dataset.blend,opacity:shots.map(x=>getComputedStyle(x).opacity),transform:shots.map(x=>getComputedStyle(x.querySelector('img')).transform)}},s.film);
     const start=await sample();
     const scrub=()=>page.evaluate(sel=>{const f=document.querySelector(sel),c=f.querySelectorAll('[data-shot]');window.scrollTo({top:c[0].offsetHeight*.80,behavior:'instant'})},s.film);
     await scrub();await page.waitForFunction(sel=>+document.querySelector(sel).dataset.blend>.1,s.film);const mid=await sample();assert(+mid.blend<1);assert.notDeepEqual(mid.transform,start.transform);assert(+mid.opacity[1]>.1);
     await go(s.chapters[0]);const back=await sample();assert.equal(back.progress,start.progress);assert.deepEqual(back.transform,start.transform);
     await page.locator(s.mode).click();assert.equal(await film.getAttribute('data-cinematic'),'still');await page.locator(s.mode).click();assert.equal(await film.getAttribute('data-cinematic'),'motion');
     // Actual navigation clicks, not only scripted scroll.
     await page.locator('[data-jump="'+s.chapters[2]+'"]').click();await page.waitForFunction(({sel,c})=>document.querySelector(sel).dataset.chapter===c,{sel:s.film,c:s.chapters[2]});await go(s.chapters[0]);
    }
    if(mode==='reduce')assert(await page.locator(s.mode).isDisabled());
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Horizontal overflow');assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
    await page.screenshot({path:path.join(dir,id+'-'+width+'-'+mode+'.png')});report.cases.push({id,width,mode,sourceImagesMocked:true});
   }catch(e){report.errors.push(id+' '+width+' '+mode+': '+String(e));}finally{await context.close()}
  }
 }
 if(report.cases.length!==Object.keys(specs).length*12)report.errors.push('Incomplete cinematic test coverage');
}finally{await browser?.close();server.kill('SIGTERM');writeFileSync(path.join(dir,'results.json'),JSON.stringify(report,null,2));for(const err of report.errors)console.error('CINEMATIC-FAIL',err);console.log('Cinematic QA:',report.cases.length,'passed,',report.errors.length,'failed');if(report.errors.length)process.exitCode=1}
