import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn,execFileSync} from 'node:child_process';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),out=path.join(root,'components/relay-registration-evidence');
const url='http://127.0.0.1:4351/templates/relay-automation/';
mkdirSync(out,{recursive:true});
for(const test of ['execution-focus','connector-topology','scene-continuity','curve-metrics','monitor-reveal'])execFileSync(process.execPath,[path.join(root,'templates/relay-automation/tests',test+'.mjs')],{stdio:'inherit'});
const server=spawn('python3',['-m','http.server','4351','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
let browser;const report=[];
try{
 let ready=false;for(let i=0;i<60;i++){try{if((await fetch(url)).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,150))}assert(ready);
 browser=await chromium.launch({headless:true,executablePath:['/usr/bin/google-chrome','/usr/bin/chromium'].find(existsSync),args:['--no-sandbox']});
 for(const [width,height] of [[320,568],[390,844],[768,1024],[1024,768],[1440,900],[1920,1080]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'no-preference'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));assert.equal((await page.goto(url,{waitUntil:'domcontentloaded'})).status(),200);
  await page.waitForFunction(()=>document.documentElement.classList.contains('has-motion')&&document.querySelector('#stage-viewport')?.dataset.progress==='0.0000');
  await page.evaluate(()=>document.fonts.ready);
  const transforms=()=>page.locator('.wf-node').evaluateAll(es=>es.map(e=>e.style.transform));
  const opening=await transforms();assert.equal(opening.length,6);
  for(const p of [0,.112,.185,.223,.275,.365,.435,.565,.668,.684,.705,.73,.76,.825,.854,.96,1,.76,.365,0]){
   await page.evaluate(p=>{const t=document.querySelector('#experience-track'),s=document.querySelector('#stage-sticky');window.scrollTo({top:t.getBoundingClientRect().top+scrollY+p*(t.offsetHeight-s.offsetHeight),behavior:'instant'})},p);
   await page.waitForFunction(p=>Math.abs(Number(document.querySelector('#stage-viewport').dataset.progress)-p)<.003,p);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   assert.equal(await page.locator('.wf-node').count(),6);
   assert(await page.evaluate(()=>[...document.querySelectorAll('.scene')].filter(e=>Number(getComputedStyle(e).getPropertyValue('--scene-alpha'))>.01).length<=1));
  }
  assert.deepEqual(await transforms(),opening);assert.deepEqual(errors,[]);
  await page.screenshot({path:path.join(out,'opening-'+width+'.png')});
  report.push({width,height,states:20,errors});await page.close();
 }
 const page=await browser.newPage({viewport:{width:1440,height:900}});await page.goto(url);await page.waitForFunction(()=>document.documentElement.classList.contains('has-motion'));
 await page.locator('#site-header [data-action="open-sandbox"]').click();
 await page.waitForFunction(()=>document.documentElement.classList.contains('is-sandbox-open'));
 await page.locator('[data-sandbox-scenario="onboarding"]').click();await page.waitForFunction(()=>document.querySelector('#ws-workflow-title').textContent.includes('onboarding'));
 await page.locator('#sandbox-close-btn').click();await page.waitForFunction(()=>!document.documentElement.classList.contains('is-sandbox-open'));
 await page.close();
 const redirect=await browser.newPage();await redirect.goto(url.replace('/templates/','/templates/_drafts/')+'?review=10#scene-01');await redirect.waitForURL('**/templates/relay-automation/?review=10#scene-01');await redirect.close();
 const reduced=await browser.newPage({reducedMotion:'reduce'});await reduced.goto(url);await reduced.waitForFunction(()=>document.documentElement.classList.contains('is-reduced-motion'));assert(await reduced.locator('h1').isVisible());await reduced.close();
 const staticPage=await browser.newPage({javaScriptEnabled:false});await staticPage.goto(url);assert(await staticPage.locator('h1').isVisible());await staticPage.close();
 console.log('PASS RELAY real-route browser registration:',JSON.stringify(report));
}finally{writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser?.close();server.kill()}
