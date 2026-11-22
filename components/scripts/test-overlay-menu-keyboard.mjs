/* GARAGE and MONOLITH: focused native keyboard + overlay navigation regression.
 * Remote media blocked; this does not certify screen-reader or physical-device UX.
 */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const evidence=path.join(root,'components','overlay-menu-keyboard-evidence');
mkdirSync(evidence,{recursive:true});
const origin='http://127.0.0.1:4214/templates/';
const server=spawn('python3',['-m','http.server','4214','--bind','127.0.0.1'],{cwd:path.join(root,'dist'),stdio:'ignore'});
const templates=[
  {name:'garage-detailing',skip:'.skip-link',skipTarget:'finish',toggle:'.menu-trigger',menu:'.mobile-nav',target:'finish',breakpoint:980},
  {name:'monolith-architecture',skip:'.skip',skipTarget:'work',toggle:'.menu-button',menu:'.mobile-nav',target:'work',breakpoint:780}
];
const report={scope:'focus-contained auto and architecture mobile overlays',cases:[],errors:[],screenReaderApproved:false};
const check=(v,m)=>{if(!v)throw Error(m)};
let browser;
try{
 for(let i=0;i<50;i++){
   try{if((await fetch(origin+'garage-detailing/index.html')).ok)break;}catch{}
   await new Promise(r=>setTimeout(r,200));
 }
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox']});
 for(const t of templates)for(const width of [320,390,768]){
  const context=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.route(/^https:\/\/(?:images\.unsplash\.com|images\.pexels\.com|videos\.pexels\.com)\//,r=>r.abort());
  const toggle=page.locator(t.toggle),menu=page.locator(t.menu);
  const first=page.locator(t.menu+' a').first(),last=page.locator(t.menu+' a').last();
  const open=async()=>{
   await toggle.focus();await page.keyboard.press('Enter');
   check(await toggle.getAttribute('aria-expanded')==='true','Menu must open via Enter');
   check(await first.evaluate(el=>document.activeElement===el),'First mobile link should receive focus');
   check(await page.locator('main').evaluate(el=>el.inert),'Background main must be inert while menu is open');
  };
  const closed=async()=>{
   check(await toggle.getAttribute('aria-expanded')==='false','Menu must be announced closed');
   check(await menu.isHidden(),'Mobile overlay must be hidden');
   check(!(await page.locator('main').evaluate(el=>el.inert)),'Main must be keyboard-active after closing');
  };
  try{
   const response=await page.goto(origin+t.name+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
   check(response?.status()===200,'Built template HTTP 200');
   await page.keyboard.press('Tab');
   check(await page.locator(t.skip).evaluate(el=>document.activeElement===el),'Skip link is first focus stop');
   await page.keyboard.press('Enter');
   check(await page.evaluate(id=>document.activeElement?.id===id,t.skipTarget),'Skip link moves focus to work section');
   await open();
   // Shift+Tab on toggle must wrap to last link, then Tab must wrap back to toggle.
   await toggle.focus();await page.keyboard.press('Shift+Tab');
   check(await last.evaluate(el=>document.activeElement===el),'Shift+Tab loops from toggle to last menu link');
   await page.keyboard.press('Tab');
   check(await toggle.evaluate(el=>document.activeElement===el),'Tab loops from last menu link to opener');
   await first.focus();await page.keyboard.press('Enter');
   await closed();
   check(await page.evaluate(id=>document.activeElement?.id===id,t.target),'Following mobile link focuses visible destination');
   check(!(await menu.evaluate(el=>el.contains(document.activeElement))),'Focus cannot remain in hidden menu');
   await open();
   await page.keyboard.press('Escape');await closed();
   check(await toggle.evaluate(el=>document.activeElement===el),'Escape returns focus to opener');
   await open();await first.focus();
   await page.setViewportSize({width:1280,height:850});
   await page.waitForFunction(()=>document.querySelector(t.toggle)?.getAttribute('aria-expanded')==='false',undefined,{timeout:1800});
   await closed();
   check(await page.locator('.desktop-nav a').first().evaluate(el=>document.activeElement===el),'Breakpoint moves focus to visible desktop navigation');
   check(!errors.length,'No uncaught browser exceptions: '+errors.join(' / '));
   report.cases.push({template:t.name,width,skip:true,focusLoop:true,linkDestination:true,escape:true,breakpoint:true});
   console.log('PASS:',t.name,width+'px','skip, menu containment, destination, Escape and resize');
  }catch(e){
   report.errors.push({template:t.name,width,error:String(e)});
   console.error('FAIL:',t.name,width+'px',String(e));
  }finally{await context.close();}
 }
}catch(e){report.errors.push({fatal:String(e?.stack||e)});}
finally{
 await browser?.close().catch(()=>{});
 server.kill('SIGTERM');
 writeFileSync(path.join(evidence,'results.json'),JSON.stringify(report,null,2));
 console.log('Contained overlay keyboard QA:',report.cases.length+' passed, '+report.errors.length+' failed');
 if(report.errors.length)process.exitCode=1;
}
