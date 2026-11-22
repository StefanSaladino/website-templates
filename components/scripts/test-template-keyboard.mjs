/* Source-level keyboard navigation regression for three full-page development demos.
 * No third-party assets are loaded and no video content is requested.
 * Does not replace screen-reader, user research, or WCAG 2.2 AA certification.
 */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const evidence=path.join(root,'components','template-keyboard-evidence');
const base='http://127.0.0.1:4201/templates/';
const server=spawn('python3',['-m','http.server','4201','--bind','127.0.0.1'],{cwd:path.join(root,'dist'),stdio:'ignore'});
const entries=[
 {folder:'creative-agency',menuFirst:'#work',breakpoint:900},
 {folder:'editorial-commerce',menuFirst:'#field-kit',breakpoint:980},
 {folder:'muskoka-retreat',menuFirst:'#stay',breakpoint:980},
 {folder:'contractor',menuFirst:'#work',breakpoint:960,toggle:'.menu-button'},
 {folder:'woodworker',menuFirst:'#pieces',breakpoint:980},
 {folder:'restaurant',menuFirst:'#menu',breakpoint:820},
 {folder:'custom-bakes',menuFirst:'#bakes',breakpoint:980},
 {folder:'landscaping',menuFirst:'#work',breakpoint:980},
 {folder:'pools',menuFirst:'#shapes',breakpoint:980},
 {folder:'storefront',menuFirst:'#shop',breakpoint:900},
 {folder:'fitness-launch',menuFirst:'#training',breakpoint:900},
 {folder:'tattoo-studio',menuFirst:'#work',breakpoint:980},
 {folder:'real-estate',menuFirst:'#homes',breakpoint:980},
 {folder:'quiet-saas',menuFirst:'#product',breakpoint:760,toggle:'.menu-button',menu:'.mobile-nav',skip:'.skip-link',skipTarget:'main',widths:[320,390,720]},
 {folder:'interactive-playground',menuFirst:'#play',breakpoint:900}
];
const report={type:'full-site keyboard regression',timestamp:new Date().toISOString(),cases:[],errors:[],
 mediaRightsApproved:false,screenReaderCertified:false,physicalDeviceCertified:false};
mkdirSync(evidence,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function serverReady(){
 for(let i=0;i<50;i++){
  try{if((await fetch(base+'creative-agency/index.html')).ok)return;}catch{}
  await pause(200);
 }
 throw Error('Built original-template HTTP server unavailable');
}
function ok(condition,message){if(!condition)throw Error(message)}
let browser;
try{
 await serverReady();
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox']});
 for(const entry of entries){
  for(const width of (entry.widths||[320,390,768])){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',err=>errors.push(String(err)));
   let videoRequests=0;
   page.on('request',request=>{if(/^https:\/\/videos\.pexels\.com/.test(request.url()))videoRequests++;});
   await page.route(/^https:\/\/(?:images\.unsplash\.com|images\.pexels\.com|videos\.pexels\.com)\//,route=>route.abort());
   try{
    const response=await page.goto(base+entry.folder+'/index.html',{waitUntil:'domcontentloaded',timeout:16000});
    ok(response?.status()===200,entry.folder+': HTTP success');
    const toggleSelector=entry.toggle||'.menu-toggle';
    const menuSelector=entry.menu||'.mobile-menu';
   await page.keyboard.press('Tab');
    const skip=page.locator(entry.skip||'.skip-to-main');
    ok(await skip.evaluate(el=>document.activeElement===el),entry.folder+': skip link is first keyboard stop');
    ok(await skip.evaluate(el=>el.getBoundingClientRect().top>=0),entry.folder+': focused skip link is on-screen');
    await page.keyboard.press('Enter');
    ok(await page.evaluate(id=>document.activeElement?.id===id,entry.skipTarget||'top'),entry.folder+': skip link transfers focus to main');
    await page.locator(toggleSelector).focus();
    await page.keyboard.press('Enter');
    ok(await page.locator(toggleSelector).getAttribute('aria-expanded')==='true'
      &&await page.locator(menuSelector).isVisible(),entry.folder+': keyboard Enter opens menu');
    const first=page.locator(menuSelector+' a').first();
    ok(await first.getAttribute('href')===entry.menuFirst,entry.folder+': expected menu target');
    await first.focus();
    await page.keyboard.press('Enter');
    ok(await page.locator(toggleSelector).getAttribute('aria-expanded')==='false',entry.folder+': selecting destination closes menu');
    ok(await page.locator(menuSelector).isHidden(),entry.folder+': mobile menu hidden after link');
    ok(await page.evaluate(id=>document.activeElement?.id===id,entry.menuFirst.slice(1)),entry.folder+': focus handed to visible destination');
    ok(!(await page.evaluate(selector=>document.querySelector(selector)?.contains(document.activeElement),menuSelector)),entry.folder+': focus not stranded in hidden menu');
    await page.locator(toggleSelector).focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Escape');
    ok(await page.locator(toggleSelector).getAttribute('aria-expanded')==='false'
      &&await page.locator(toggleSelector).evaluate(el=>document.activeElement===el),entry.folder+': Escape closes menu and returns focus to opener');
    await page.keyboard.press('Enter');
    await page.locator(menuSelector+' a').first().focus();
    await page.setViewportSize({width:1280,height:900});
    await page.waitForTimeout(120);
    ok(await page.locator(menuSelector).isHidden(),entry.folder+': resize closes mobile navigation');
    ok(await page.locator('.desktop-nav a').first().evaluate(el=>document.activeElement===el),entry.folder+': breakpoint focus moved to visible desktop navigation');
    ok(!errors.length,entry.folder+': no uncaught script errors '+errors.join('; '));
    ok(videoRequests===0,entry.folder+': no 4K streaming requests while navigating');
    report.cases.push({template:entry.folder,width,skip:true,linkFocus:true,escape:true,resize:true,scriptErrors:errors.length,videoRequests});
    console.log('PASS:',entry.folder,width+'px', 'keyboard skip, menu links, Escape, responsive focus, no film fetch');
   }catch(e){report.errors.push(entry.folder+' '+width+'px: '+String(e));console.error('FAIL:',entry.folder,width+'px',String(e));}
   finally{await context.close();}
  }
 }
} catch(e){report.errors.push('Fatal: '+(e?.stack||String(e)));}
finally{
 await browser?.close().catch(()=>{});
 server.kill('SIGTERM');
 writeFileSync(path.join(evidence,'results.json'),JSON.stringify(report,null,2));
 console.log('Full-template keyboard QA:',report.cases.length+' cases passed, '+report.errors.length+' failures');
 if(report.errors.length)process.exitCode=1;
}
