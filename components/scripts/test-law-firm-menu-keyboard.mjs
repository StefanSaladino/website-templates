/* NORTHLINE LAW: focus containment and lifecycle checks for its animated navigation.
 * Browser regression only; not a screen-reader or accessibility certification.
 */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const evidence=path.join(root,'components','law-firm-keyboard-evidence');
mkdirSync(evidence,{recursive:true});
const base='http://127.0.0.1:4204/templates/law-firm/index.html';
const server=spawn('python3',['-m','http.server','4204','--bind','127.0.0.1'],{cwd:path.join(root,'dist'),stdio:'ignore'});
const report={scope:'NORTHLINE LAW animated drawer',pass:[],errors:[],screenReaderCertified:false,releaseApproved:false};
const assert=(condition,message)=>{if(!condition)throw Error(message)};
async function ready(){
 for(let i=0;i<50;i++){
  try{if((await fetch(base)).ok)return;}catch{}
  await new Promise(resolve=>setTimeout(resolve,200));
 }
 throw Error('Built legal demo route unavailable');
}
let browser;
try{
 await ready();
 const chrome=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 browser=await chromium.launch({headless:true,executablePath:chrome||undefined,args:['--no-sandbox']});
 for(const [width,reduced] of [[320,true],[390,true],[768,true],[390,false]]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:reduced?'reduce':'no-preference'});
  const page=await context.newPage(),exceptions=[];
  page.on('pageerror',e=>exceptions.push(String(e)));
  await page.route(/^https:\/\/(?:images\.unsplash\.com|images\.pexels\.com|videos\.pexels\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//,r=>r.abort());
  const opener=page.locator('.menu-toggle'),nav=page.locator('#mobile-menu'),close=page.locator('[data-menu-close]'),
    backdrop=page.locator('[data-menu-backdrop]'),first=page.locator('.mobile-menu-links a').first(),
    last=page.locator('.mobile-menu-foot a').last();
  const open=async()=>{
    await opener.focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(()=>document.querySelector('#mobile-menu')?.classList.contains('is-open'));
    assert(await opener.getAttribute('aria-expanded')==='true','Open state not announced');
    assert(await page.locator('main').evaluate(el=>el.inert),'Page main must be inert while overlay is open');
    assert(await close.evaluate(el=>document.activeElement===el),'Close button must receive first drawer focus');
  };
  const closed=async()=>{
    // At a CSS breakpoint the drawer can become display:none before the
    // resize handler's state update. Observe the final JS ARIA state too.
    await page.waitForFunction(
      ()=>document.querySelector('.menu-toggle')?.getAttribute('aria-expanded')==='false',
      undefined,{timeout:2400}
    );
    await nav.waitFor({state:'hidden',timeout:2400});
    assert(await opener.getAttribute('aria-expanded')==='false','Close state not announced');
    assert(!(await page.locator('main').evaluate(el=>el.inert)),'Page main must return to keyboard access');
    assert(!(await backdrop.isVisible()),'Backdrop must close');
  };
  try{
    await page.goto(base,{waitUntil:'domcontentloaded',timeout:16000});
    await page.keyboard.press('Tab');
    assert(await page.locator('.skip-link').evaluate(el=>document.activeElement===el),'Skip link must be first keyboard stop');
    await page.keyboard.press('Enter');
    assert(await page.evaluate(()=>document.activeElement?.id==='main'),'Skip link must focus main');
    await open();
    await page.keyboard.press('Shift+Tab');
    assert(await last.evaluate(el=>document.activeElement===el),'Shift+Tab wraps to last link');
    await page.keyboard.press('Tab');
    assert(await close.evaluate(el=>document.activeElement===el),'Tab wraps to close control');
    await first.focus();
    await page.keyboard.press('Enter');
    assert(await page.evaluate(()=>document.activeElement?.id==='practice'),'Menu link focus must transfer to destination');
    assert(!(await nav.evaluate(el=>el.contains(document.activeElement))),'No focus left inside closing drawer');
    assert(await nav.evaluate(el=>el.inert),'Animated closing drawer must become inert immediately');
    await closed();
    await open();
    await page.keyboard.press('Escape');
    await closed();
    assert(await opener.evaluate(el=>document.activeElement===el),'Escape returns focus to menu button');
    await open();
    await close.click();
    await closed();
    assert(await opener.evaluate(el=>document.activeElement===el),'Close button returns focus to opener');
    await open();
    // The backdrop is behind the drawer; programmatic click isolates its handler
    // without an artificial pointer position obscured by the drawer itself.
    await backdrop.evaluate(el=>el.click());
    await closed();
    assert(await opener.evaluate(el=>document.activeElement===el),'Backdrop close returns focus to opener');
    await open();
    await first.focus();
    await page.setViewportSize({width:1280,height:900});
    await closed();
    assert(await page.locator('.desktop-nav a').first().evaluate(el=>document.activeElement===el),
      'Desktop resize moves focus to a visible desktop navigation link');
    assert(!exceptions.length,'No browser exceptions: '+exceptions.join(' / '));
    report.pass.push({width,reducedMotion:reduced,skip:true,focusTrap:true,inert:true,escape:true,close:true,backdrop:true,resize:true});
    console.log('PASS: NORTHLINE',width+'px',reduced?'reduced motion':'normal motion','focus trap and drawer transitions');
  }catch(error){
    report.errors.push({width,reducedMotion:reduced,error:String(error)});
    console.error('FAIL: NORTHLINE',width,reduced,String(error));
  }finally{await context.close();}
 }
}catch(error){report.errors.push({fatal:String(error?.stack||error)});}
finally{
 await browser?.close().catch(()=>{});
 server.kill('SIGTERM');
 writeFileSync(path.join(evidence,'results.json'),JSON.stringify(report,null,2));
 console.log('Legal drawer keyboard QA',report.pass.length+' passes',report.errors.length+' failures');
 if(report.errors.length)process.exitCode=1;
}
