import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {discoverTemplates} from './template-catalogue.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),id='apex-automotive',origin='http://127.0.0.1:4295',dir=path.join(root,'components/immersive-evidence');
assert.deepEqual(discoverTemplates(root).filter(n=>/data-airflow-template/.test(readFileSync(path.join(root,'templates',n,'index.html'),'utf8'))),[id]);mkdirSync(dir,{recursive:true});
const server=spawn('python3',['-m','http.server','4295','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});let browser;const report={cases:[],errors:[],visualAcceptance:false};const allowed=new Set(["https://images.pexels.com/photos/35101711/pexels-photo-35101711.jpeg","https://images.pexels.com/photos/30360249/pexels-photo-30360249.jpeg"]);
try{
 for(let i=0;i<50;i++){try{if((await fetch(origin+'/')).ok)break}catch{}await new Promise(r=>setTimeout(r,200))}
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox']});
 for(const width of [320,390,768,1440])for(const mode of ['motion','reduce','nojs']){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:mode==='reduce'?'reduce':'no-preference',javaScriptEnabled:mode!=='nojs'}),page=await context.newPage(),errors=[],unexpected=[];
 await page.route('**/*',r=>{const u=r.request().url();if(u.startsWith(origin+'/'))return r.continue();if(allowed.has(u.split('?')[0])&&r.request().resourceType()==='image')return r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 667"><rect width="1000" height="667" fill="#333b31"/></svg>'});unexpected.push(u);return r.abort()});page.on('pageerror',e=>errors.push(String(e)));
 try{
 await page.goto(origin+'/templates/'+id+'/',{waitUntil:'domcontentloaded'});const wind=page.locator('#wind'),speed=page.locator('#speed'),pause=page.locator('#motion'),overlay=page.locator('#flow-overlay');
 assert.equal(await page.locator('canvas,object,embed').count(),0);assert.equal(await page.locator('main img').count(),3);for(const im of await page.locator('main img').all())assert(allowed.has((await im.getAttribute('src')).split('?')[0]));
 await page.locator('#airflow').evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY,behavior:'instant'}));await wind.locator('img').evaluate(img=>img.decode());await overlay.scrollIntoViewIfNeeded();
 const align=await page.evaluate(()=>{const im=document.querySelector('.wind-image img').getBoundingClientRect(),svg=document.querySelector('#flow-overlay').getBoundingClientRect();return Math.max(Math.abs(im.x-svg.x),Math.abs(im.y-svg.y),Math.abs(im.width-svg.width),Math.abs(im.height-svg.height))});assert(align<1,'Flow overlay must exactly align to photograph');
 if(mode==='nojs'){assert(await speed.isDisabled());assert.equal(await wind.getAttribute('data-motion'),'still');}
 else{
 assert.equal(await speed.inputValue(),'50');
 if(mode==='motion'){
 const p=await wind.getAttribute('data-phase');await page.waitForFunction(p=>document.querySelector('#wind').dataset.phase!==p,p);const before=await overlay.screenshot();await page.waitForTimeout(300);const after=await overlay.screenshot();assert(!before.equals(after),'Visible tracer pixels must move');
 await pause.click();const frozen=await wind.getAttribute('data-phase');await page.waitForTimeout(180);assert.equal(await wind.getAttribute('data-phase'),frozen);
 }else assert(await pause.isDisabled());
 await speed.fill('85');assert.equal(await wind.getAttribute('data-speed'),'85');
 await page.locator('#wake').click();assert.equal(await wind.getAttribute('data-mode'),'wake');assert(await page.locator('.wake-group').isVisible());
 await page.locator('#stream').click();assert.equal(await wind.getAttribute('data-mode'),'stream');assert(!(await page.locator('.wake-group').isVisible()));
 await page.locator('#reset').click();assert.equal(await speed.inputValue(),'50');assert.equal(await wind.getAttribute('data-mode'),'stream');
 if(mode==='motion'){await speed.fill('0');const frozen=await wind.getAttribute('data-phase');await page.waitForTimeout(200);assert.equal(await wind.getAttribute('data-phase'),frozen);await speed.fill('50');await page.waitForFunction(p=>document.querySelector('#wind').dataset.phase!==p,frozen);await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(180);const off=await wind.getAttribute('data-phase');await page.waitForTimeout(180);assert.equal(await wind.getAttribute('data-phase'),off,'Offscreen animation must stop')}
 }
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);await overlay.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(dir,id+'-'+width+'-'+mode+'.png')});report.cases.push({width,mode,sourceImagesMocked:true});
 }catch(e){report.errors.push(width+' '+mode+': '+String(e))}finally{await context.close()}
 }
}finally{await browser?.close();server.kill('SIGTERM');writeFileSync(path.join(dir,'airflow-results.json'),JSON.stringify(report,null,2));for(const e of report.errors)console.error('AIRFLOW-FAIL',e);console.log('Airflow QA:',report.cases.length,'passed,',report.errors.length,'failed');if(report.errors.length||report.cases.length!==12)process.exitCode=1}
