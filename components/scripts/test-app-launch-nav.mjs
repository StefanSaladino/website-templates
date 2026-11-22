/* Tide's responsive navigation is shared between desktop and off-canvas mobile.
 * Assert closed links are inert on phones but accessible on desktop.
 */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const evidence=path.join(root,'components','app-launch-nav-evidence');
mkdirSync(evidence,{recursive:true});
const url='http://127.0.0.1:4216/templates/app-launch/index.html';
const server=spawn('python3',['-m','http.server','4216','--bind','127.0.0.1'],{cwd:path.join(root,'dist'),stdio:'ignore'});
const report={scope:'Tide responsive primary nav keyboard access',cases:[],errors:[],certified:false};
const check=(v,msg)=>{if(!v)throw Error(msg)};
let browser;
try{
 for(let i=0;i<50;i++){
  try{if((await fetch(url)).ok)break;}catch{}
  await new Promise(r=>setTimeout(r,200));
 }
 const chrome=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 browser=await chromium.launch({headless:true,executablePath:chrome||undefined,args:['--no-sandbox']});
 for(const width of [320,390,768]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.route(/^https:\/\/(?:fonts\.googleapis\.com|fonts\.gstatic\.com|images\.unsplash\.com|images\.pexels\.com)\//,r=>r.abort());
  const toggle=page.locator('.menu-toggle'),nav=page.locator('.site-nav'),first=nav.locator('a').first();
  try{
   const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:14000});
   check(response?.status()===200,'Built site loads');
   await page.keyboard.press('Tab');
   check(await page.locator('.skip-to-main').evaluate(el=>document.activeElement===el),'Skip is first tab stop');
   await page.keyboard.press('Enter');
   check(await page.evaluate(()=>document.activeElement?.id==='main'),'Skip focuses main');
   check(await nav.evaluate(el=>el.inert),'Closed off-canvas mobile links must be inert');
   check(await nav.getAttribute('aria-hidden')==='true','Closed menu hidden from accessibility tree');
   await toggle.focus();await page.keyboard.press('Enter');
   check(await toggle.getAttribute('aria-expanded')==='true','Menu opens via keyboard');
   check(!await nav.evaluate(el=>el.inert),'Opened mobile links become focusable');
   check(await first.evaluate(el=>document.activeElement===el),'First link receives focus on opening');
   await page.keyboard.press('Enter');
   check(await toggle.getAttribute('aria-expanded')==='false','Selecting section closes menu');
   check(await nav.evaluate(el=>el.inert),'Closed menu again becomes inert');
   check(await page.evaluate(()=>document.activeElement?.id==='day-view'),'Link transfers focus to selected section');
   await toggle.focus();await page.keyboard.press('Enter');
   await page.keyboard.press('Escape');
   check(await toggle.evaluate(el=>document.activeElement===el),'Escape returns to opener');
   check(await nav.evaluate(el=>el.inert),'Escape inerts menu');
   await toggle.focus();await page.keyboard.press('Enter');
   await page.setViewportSize({width:1280,height:900});
   await page.waitForFunction(()=>document.querySelector('.site-nav')?.inert===false,undefined,{timeout:1600});
   check(await toggle.getAttribute('aria-expanded')==='false','Desktop nav no longer marked expanded');
   check(await nav.getAttribute('aria-hidden')==='false','Desktop nav appears in accessibility tree');
   check(await first.evaluate(el=>document.activeElement===el),'Desktop focus remains on visible primary navigation');
   check(await first.isVisible(),'Desktop primary nav must remain visible');
   await page.setViewportSize({width,height:900});
   await page.waitForFunction(()=>document.querySelector('.site-nav')?.inert===true,undefined,{timeout:1600});
   check(!errors.length,'No browser page errors: '+errors.join('; '));
   report.cases.push({width,skip:true,inertMobile:true,aria:true,linkDestination:true,escape:true,desktopNavigation:true});
   console.log('PASS: Tide',width+'px','off-canvas inertness and desktop nav access');
  }catch(e){report.errors.push({width,error:String(e)});console.error('FAIL: Tide',width,String(e));}
  finally{await context.close();}
 }
}catch(e){report.errors.push({fatal:String(e?.stack||e)});}
finally{
 await browser?.close().catch(()=>{});
 server.kill('SIGTERM');
 writeFileSync(path.join(evidence,'results.json'),JSON.stringify(report,null,2));
 console.log('Tide responsive nav QA:',report.cases.length+' passed, '+report.errors.length+' failed');
 if(report.errors.length)process.exitCode=1;
}
