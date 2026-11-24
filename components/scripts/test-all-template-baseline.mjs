/* Automatic baseline for every discovered complete website. Specialist tests remain separate. */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {discoverTemplates,compareMembership} from './template-catalogue.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),ids=discoverTemplates(root),out=path.join(root,'components/all-template-baseline-evidence');
mkdirSync(out,{recursive:true});
const port=4286,origin='http://127.0.0.1:'+port;
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:path.join(root,'dist'),stdio:'ignore'});
const report={templates:ids,viewportWidths:[320,390,768,1440],cases:[],errors:[],physicalDeviceAcceptance:false};
let browser;
try{
 let ready=false;for(let i=0;i<50;i++){try{if((await fetch(origin+'/templates/'+ids[0]+'/index.html')).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,200))}
 if(!ready)throw Error('Built template server unavailable');
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox']});
 for(const id of ids)for(const width of report.viewportWidths){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[],videoRequests=[];
  page.on('pageerror',err=>errors.push(String(err)));
  page.on('request',r=>{if(r.resourceType()==='media'||/videos\.pexels\.com/.test(r.url()))videoRequests.push(r.url())});
  await page.route(/^https?:\/\//,r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
  try{
   const response=await page.goto(origin+'/templates/'+id+'/index.html',{waitUntil:'domcontentloaded',timeout:18000});
   assert.equal(response?.status(),200);assert.equal(await page.locator('main').count(),1);
   const skip=page.locator('a.skip-link,a.skip-to-main,a.skip').first();
   assert.equal(await skip.count(),1,'Skip link missing');
   await page.keyboard.press('Tab');
   assert(await skip.evaluate(el=>el===document.activeElement&&el.getBoundingClientRect().top>=0),'Skip link must be first and visible');
   const href=await skip.getAttribute('href');
   await page.keyboard.press('Enter');
   assert.equal(await page.evaluate(()=>document.activeElement?.id),href.slice(1),'Skip link did not move focus');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+4),'Horizontal overflow');
   assert.deepEqual(errors,[],'Uncaught page errors');assert.deepEqual(videoRequests,[],'Unexpected media request in reduced motion');
   report.cases.push({id,width,skip:true,main:true,noOverflow:true,scriptErrors:0});
  }catch(e){report.errors.push(id+' '+width+'px '+String(e));}finally{await context.close()}
 }
 for(const width of report.viewportWidths){
   const covered=report.cases.filter(x=>x.width===width).map(x=>x.id),diff=compareMembership(ids,covered);
   if(Object.values(diff).some(x=>x.length))report.errors.push('Incomplete baseline coverage '+width+'px '+JSON.stringify(diff));
 }
}catch(e){report.errors.push(String(e?.stack||e))}
finally{await browser?.close().catch(()=>{});server.kill('SIGTERM');writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));for(const e of report.errors)console.error('BASELINE-FAIL',e);console.log('Complete-site baseline: '+report.cases.length+' passing cases / '+ids.length+' websites × '+report.viewportWidths.length+' widths');if(report.errors.length)process.exitCode=1}
