/* AFTER DARK — native keyboard focus review of a full-screen animated demo nav.
 * All external images are blocked and fictional tickets are never purchased.
 */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdirSync,existsSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const evidence=path.join(root,'components','event-launch-keyboard-evidence');
mkdirSync(evidence,{recursive:true});
const url='http://127.0.0.1:4211/templates/event-launch/index.html';
const server=spawn('python3',['-m','http.server','4211','--bind','127.0.0.1'],{cwd:path.join(root,'dist'),stdio:'ignore'});
const report={scope:'AFTER DARK event full-screen nav',pass:[],errors:[],licensed:false,certified:false};
const assert=(x,msg)=>{if(!x)throw Error(msg)};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function ready(){
 for(let i=0;i<50;i++){
  try{if((await fetch(url)).ok)return;}catch{}
  await pause(200);
 }
 throw Error('Built event template not served');
}
let browser;
try{
 await ready();
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox']});
 for(const [width,reduced] of [[320,true],[390,true],[768,true],[390,false]]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:reduced?'reduce':'no-preference'});
  const page=await context.newPage(),pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(String(error)));
  await page.route(/^https:\/\/(?:images\.unsplash\.com|images\.pexels\.com|videos\.pexels\.com)\//,route=>route.abort());
  const toggle=page.locator('.menu-toggle'),menu=page.locator('.mobile-menu'),first=page.locator('.mobile-menu a').first(),last=page.locator('.mobile-menu a').last();
  const open=async()=>{
   await toggle.focus();await page.keyboard.press('Enter');
   await page.waitForFunction(()=>document.querySelector('#mobile-menu')?.classList.contains('is-open'),undefined,{timeout:1500});
   assert(await toggle.getAttribute('aria-expanded')==='true','Expanded status after keyboard open');
   assert(await first.evaluate(el=>document.activeElement===el),'First link receives focus');
   assert(await page.locator('main').evaluate(el=>el.inert),'Background main is inert');
   assert(await page.locator('.site-header').evaluate(el=>el.inert),'Background header is inert');
  };
  const closed=async()=>{
    await page.waitForFunction(()=>document.querySelector('.menu-toggle')?.getAttribute('aria-expanded')==='false',undefined,{timeout:2200});
    await menu.waitFor({state:'hidden',timeout:2200});
    assert(await menu.evaluate(el=>el.inert),'Closed menu remains inert');
    assert(!(await page.locator('main').evaluate(el=>el.inert)),'Main interactive after close');
    assert(!(await page.locator('.site-header').evaluate(el=>el.inert)),'Header interactive after close');
  };
  try{
   const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:14000});
   assert(response?.status()===200,'HTTP response 200');
   await page.keyboard.press('Tab');
   assert(await page.locator('.skip-to-main').evaluate(el=>document.activeElement===el),'Skip is first tab stop');
   await page.keyboard.press('Enter');
   assert(await page.evaluate(()=>document.activeElement?.id==='top'),'Skip focuses the main region');
   await open();
   await page.keyboard.press('Shift+Tab');
   assert(await last.evaluate(el=>document.activeElement===el),'Shift+Tab wraps to last event menu link');
   await page.keyboard.press('Tab');
   assert(await first.evaluate(el=>document.activeElement===el),'Tab wraps back to first event link');
   await first.focus();await page.keyboard.press('Enter');
   assert(await menu.evaluate(el=>el.inert),'Closing animated navigation becomes inert immediately');
   assert(await page.evaluate(()=>document.activeElement?.id==='lineup'),'Link selection focuses visible lineup');
   await closed();
   await open();await page.keyboard.press('Escape');
   await closed();
   assert(await toggle.evaluate(el=>document.activeElement===el),'Escape returns focus to menu toggle');
   await open();await first.focus();
   await page.setViewportSize({width:1280,height:900});
   await closed();
   assert(await page.locator('.desktop-nav a').first().evaluate(el=>document.activeElement===el),'Responsive transition focuses desktop nav');
   assert(!pageErrors.length,'No runtime exceptions: '+pageErrors.join(', '));
   report.pass.push({width,reducedMotion:reduced,skip:true,tabContainment:true,linkFocus:true,escape:true,desktopFocus:true});
   console.log('PASS: AFTER DARK',width+'px',reduced?'reduced motion':'normal motion','animated nav keyboard behaviour');
  }catch(e){report.errors.push({width,reducedMotion:reduced,error:String(e)});console.error('FAIL: AFTER DARK',width,String(e));}
  finally{await context.close();}
 }
}catch(e){report.errors.push({fatal:String(e?.stack||e)});}
finally{
 await browser?.close().catch(()=>{});
 server.kill('SIGTERM');
 writeFileSync(path.join(evidence,'results.json'),JSON.stringify(report,null,2));
 console.log('Event keyboard QA:',report.pass.length+' passes',report.errors.length+' failures');
 if(report.errors.length)process.exitCode=1;
}
