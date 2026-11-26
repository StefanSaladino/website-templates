import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),out=path.join(root,'components/threshold-registration-evidence');
const url='http://127.0.0.1:4351/templates/threshold-studio/';
mkdirSync(out,{recursive:true});
execFileSync('npm',['test'],{cwd:path.join(root,'templates/threshold-studio'),stdio:'inherit'});
const server=spawn('python3',['-m','http.server','4351','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
let browser;const report=[];
try{
 let ready=false;for(let i=0;i<60;i++){try{if((await fetch(url)).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,150))}assert(ready);
 browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [width,height] of [[320,568],[390,844],[768,1024],[1440,900],[844,390]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  assert.equal((await page.goto(url+'?ambient=off')).status(),200);
  await page.waitForFunction(()=>document.documentElement.dataset.closing==='on'&&document.querySelector('#scene-study').dataset.renderer==='webgl');
  const canvas=await page.locator('#scene-canvas').elementHandle(),states=[];
  for(const p of [0,.36,.64,.70,.79,.90,.94,1,.94,.70,0]){
   await page.evaluate(p=>{const s=document.scrollingElement;s.scrollTop=Math.round(p*(s.scrollHeight-s.clientHeight))},p);
   await page.waitForFunction(p=>Math.abs(+document.querySelector('#scene-study').dataset.progress-p)<.002,p);
   assert(await canvas.evaluate(e=>e===document.querySelector('#scene-canvas')));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&document.querySelector('#scene-study').dataset.quality==='full'&&Number(document.querySelector('#scene-study').dataset.samples)>=2));
   if(p===1){assert(await page.locator('.possibility-cta').isVisible());await page.locator('.possibility-cta').click();await page.locator('[data-possibility-create]').click();assert.match(await page.locator('#possibility-output').textContent(),/Nothing has been submitted/);await page.keyboard.press('Escape');}
   states.push(p);
  }
  assert.equal(await page.locator('.gallery-link').getAttribute('href'),'../../index.html');
  assert.deepEqual(errors,[]);await page.screenshot({path:path.join(out,'opening-'+width+'x'+height+'.png')});report.push({width,height,states,errors});await page.close();
 }
 const redirect=await browser.newPage();await redirect.goto(url.replace('/templates/threshold-studio/','/templates/_drafts/threshold-studio/')+'?ambient=off#main');await redirect.waitForURL(url+'?ambient=off#main');await redirect.close();
 const staticPage=await browser.newPage({javaScriptEnabled:false});await staticPage.goto(url);assert(await staticPage.locator('.possibility').isVisible());assert(await staticPage.locator('.possibility-cta').isHidden());await staticPage.close();
}finally{writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser?.close();server.kill()}
