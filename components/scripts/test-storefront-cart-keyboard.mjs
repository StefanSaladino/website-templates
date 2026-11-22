/* MORA storefront: real keyboard, modal focus and fiction-only commerce regression.
 * All remote imagery is aborted, and neither sales nor payments are performed.
 */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdirSync,existsSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const evidence=path.join(root,'components','storefront-cart-keyboard-evidence');
mkdirSync(evidence,{recursive:true});
const url='http://127.0.0.1:4207/templates/storefront/index.html';
const server=spawn('python3',['-m','http.server','4207','--bind','127.0.0.1'],{cwd:path.join(root,'dist'),stdio:'ignore'});
const report={scope:'MORA demo cart focus and no-purchase safeguards',cases:[],errors:[],licenseApproved:false,screenReaderCertified:false};
const ensure=(condition,message)=>{if(!condition)throw Error(message)};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function ready(){
 for(let i=0;i<50;i++){
  try{if((await fetch(url)).ok)return;}catch{}
  await wait(200);
 }
 throw Error('Built MORA route not available');
}
let browser;
try{
 await ready();
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox']});
 for(const [width,reduce] of [[320,true],[390,true],[768,true],[1280,false]]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:reduce?'reduce':'no-preference'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',err=>errors.push(String(err)));
  await page.route(/^https:\/\/(?:images\.unsplash\.com|images\.pexels\.com|videos\.pexels\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//,route=>route.abort());
  const drawer=page.locator('[data-cart]'),close=page.locator('[data-cart-close]'),openBag=page.locator('[data-cart-open]'),
    add=page.locator('[data-quick-add="Daily Set"]'),checkout=page.locator('[data-demo-checkout]');
  try{
   const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:16000});
   ensure(response?.status()===200,'MORA route must return HTTP 200');
   ensure(await drawer.getAttribute('role')==='dialog'&&await drawer.getAttribute('aria-modal')==='true','Demo bag must be a named modal dialog');
   ensure(await drawer.getAttribute('aria-labelledby')==='cart-heading','Dialog must have heading label');
   ensure(await drawer.evaluate(el=>el.inert)&&await drawer.getAttribute('aria-hidden')==='true','Closed drawer must be inert and hidden to assistive technology');
   await add.click();
   ensure(await drawer.getAttribute('aria-hidden')==='false'&&!await drawer.evaluate(el=>el.inert),'Adding example product opens interactive dialog');
   ensure(await close.evaluate(el=>document.activeElement===el),'Dialog opening must focus Close control');
   ensure(await page.locator('main').evaluate(el=>el.inert),'Main content should be inert under modal');
   ensure(await page.locator('.site-header').evaluate(el=>el.inert),'Header should be inert under modal');
   ensure((await page.locator('[data-cart-count]').textContent())==='1','Demo bag item count should be one');
   ensure((await page.locator('[data-cart-total]').textContent())==='$112','Demo bag should display fictional subtotal');
   await page.keyboard.press('Shift+Tab');
   ensure(await checkout.evaluate(el=>document.activeElement===el),'Shift+Tab from dialog Close should wrap to last bag action');
   await page.keyboard.press('Tab');
   ensure(await close.evaluate(el=>document.activeElement===el),'Tab from last bag action should wrap to Close');
   await page.locator('[data-remove]').click();
   ensure(await close.evaluate(el=>document.activeElement===el),'Removing last item should restore focus to Close');
   ensure((await page.locator('.cart-empty').textContent()).includes('empty'),'Removing last item must empty bag');
   await checkout.click();
   ensure((await page.locator('[data-checkout-note]').textContent()).includes('no payment was taken'),'Demo checkout must be explicitly non-transacting');
   await page.keyboard.press('Escape');
   ensure(await drawer.getAttribute('aria-hidden')==='true'&&await drawer.evaluate(el=>el.inert),'Escape must close and inert the bag');
   ensure(await add.evaluate(el=>document.activeElement===el),'Escape must restore focus to the Add control that opened the bag');
   ensure(!(await page.locator('main').evaluate(el=>el.inert)),'Main returns to keyboard access after Escape');
   await openBag.click();
   ensure(await close.evaluate(el=>document.activeElement===el),'Bag header button must focus modal Close');
   await close.click();
   ensure(await openBag.evaluate(el=>document.activeElement===el),'Close button restores focus to header Bag control');
   ensure(!errors.length,'Browser runtime errors: '+errors.join('; '));
   report.cases.push({width,reducedMotion:reduce,focusTrap:true,backgroundInert:true,keyboardEscape:true,restoreOpener:true,removeFocus:true,previewCheckout:true});
   console.log('PASS: MORA',width+'px',reduce?'reduced motion':'normal motion','modal bag focus and false-payment checks');
  }catch(e){
   report.errors.push({width,error:String(e)});
   console.error('FAIL: MORA',width,String(e));
  }finally{await context.close();}
 }
}catch(e){report.errors.push({fatal:String(e?.stack||e)});}
finally{
 await browser?.close().catch(()=>{});
 server.kill('SIGTERM');
 writeFileSync(path.join(evidence,'results.json'),JSON.stringify(report,null,2));
 console.log('MORA demo cart QA:',report.cases.length+' passes, '+report.errors.length+' failures');
 if(report.errors.length)process.exitCode=1;
}
