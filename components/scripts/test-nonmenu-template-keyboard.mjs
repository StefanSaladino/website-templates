/* Keyboard access pilot for three original templates without mobile drawers:
 * Morrow architecture, KERN tech and FRAME gallery with native dialog.
 */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdirSync,existsSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const evidence=path.join(root,'components','nonmenu-keyboard-evidence');
mkdirSync(evidence,{recursive:true});
const origin='http://127.0.0.1:4218/templates/';
const server=spawn('python3',['-m','http.server','4218','--bind','127.0.0.1'],{cwd:path.join(root,'dist'),stdio:'ignore'});
const examples=[
 {name:'architecture',target:'main'},
 {name:'dark-tech',target:'main'},
 {name:'frame-portfolio',target:'images'}
];
const report={scope:'Non-drawer template keyboard landmarks and specialty controls',cases:[],errors:[],a11yCertified:false};
const ensure=(ok,message)=>{if(!ok)throw Error(message)};
let browser;
try{
 for(let i=0;i<50;i++){
  try{if((await fetch(origin+'architecture/index.html')).ok)break;}catch{}
  await new Promise(r=>setTimeout(r,200));
 }
 const chrome=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 browser=await chromium.launch({headless:true,executablePath:chrome||undefined,args:['--no-sandbox']});
 for(const example of examples)for(const width of [320,390,768]){
  const context=await browser.newContext({viewport:{width,height:860},reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.route(/^https:\/\/(?:images\.unsplash\.com|images\.pexels\.com|videos\.pexels\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//,r=>r.abort());
  try{
   const response=await page.goto(origin+example.name+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
   ensure(response?.status()===200,'Built full-site template loads');
   await page.keyboard.press('Tab');
   const skip=page.locator('.skip-link').first();
   ensure(await skip.evaluate(el=>document.activeElement===el),'Skip link is first keyboard stop');
   ensure(await skip.evaluate(el=>el.getBoundingClientRect().top>=0),'Focused skip link must be visible');
   await page.keyboard.press('Enter');
   ensure(await page.evaluate(id=>document.activeElement?.id===id,example.target),'Skip link focuses target');
   if(example.name==='architecture'){
    const reply=page.locator('[data-morrow-contact-preview]');
    await reply.focus();await page.keyboard.press('Enter');
    ensure((await page.locator('[data-morrow-contact-status]').textContent()).includes('no architectural commission was requested'),'Preview must not suggest a real enquiry');
    const replay=page.locator('[data-replay-motion="ANIM-03"]');
    ensure(await replay.isVisible(),'Animation replay should be keyboard available');
    await replay.focus();await page.keyboard.press('Enter');
   }else if(example.name==='dark-tech'){
    const spotlight=page.locator('[data-spot-toggle]');
    await spotlight.waitFor({state:'visible'});
    ensure(await spotlight.getAttribute('aria-pressed')==='false','Spotlight starts unpressed');
    await spotlight.focus();await page.keyboard.press('Enter');
    ensure(await spotlight.getAttribute('aria-pressed')==='true','Enter emphasizes spotlight card');
    ensure((await page.locator('[data-spot-status]').textContent()).includes('emphasized'),'Status must announce emphasized state');
    await page.keyboard.press('Enter');
    ensure(await spotlight.getAttribute('aria-pressed')==='false','Second Enter resets spotlight');
   }else{
    const portrait=page.locator('[data-filter="portrait"]');
    await portrait.focus();await page.keyboard.press('Enter');
    ensure(await portrait.getAttribute('aria-pressed')==='true','Gallery portrait filter keyboard operation');
    ensure((await page.locator('.filter-status').textContent()).includes('3 portrait'),'Status announces portrait count');
    const trigger=page.locator('.frame:not(.is-hidden)').first();
    await trigger.focus();await page.keyboard.press('Enter');
    const dialog=page.locator('dialog.lightbox');
    ensure(await dialog.evaluate(el=>el.open),'Native photograph modal opens');
    ensure(await page.locator('.lightbox-close').evaluate(el=>document.activeElement===el),'Close receives focus');
    const originalCaption=await page.locator('.lightbox-caption>span').textContent();
    await page.keyboard.press('ArrowRight');
    const nextCaption=await page.locator('.lightbox-caption>span').textContent();
    ensure(originalCaption!==nextCaption,'ArrowRight moves to next filtered photograph');
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!document.querySelector('dialog.lightbox')?.open,undefined,{timeout:1500});
    ensure(await trigger.evaluate(el=>document.activeElement===el),'Closing dialog restores focus to selected gallery thumbnail');
   }
   ensure(!errors.length,'No JavaScript page errors '+errors.join('; '));
   report.cases.push({template:example.name,width,skip:true,keyboardSpecialty:true,noScriptErrors:true});
   console.log('PASS:',example.name,width+'px','skip link and keyboard interaction');
  }catch(e){report.errors.push({template:example.name,width,error:String(e)});console.error('FAIL:',example.name,width+'px',String(e));}
  finally{await context.close();}
 }
}catch(e){report.errors.push({fatal:String(e?.stack||e)});}
finally{
 await browser?.close().catch(()=>{});
 server.kill('SIGTERM');
 writeFileSync(path.join(evidence,'results.json'),JSON.stringify(report,null,2));
 console.log('Non-drawer keyboard QA:',report.cases.length+' passed, '+report.errors.length+' failed');
 if(report.errors.length)process.exitCode=1;
}
