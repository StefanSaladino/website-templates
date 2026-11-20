import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const staticRoot=path.resolve(dir,'../dist');
const evidence=path.join(dir,'component-browser-evidence');
mkdirSync(evidence,{recursive:true});
const base='http://127.0.0.1:4199/components/';
const server=spawn('python3',['-m','http.server','4199','--bind','127.0.0.1'],{cwd:staticRoot,stdio:'ignore'});
const checks=[],pageErrors=[];
let browser;
function assert(value,message){
  if(!value)throw new Error('FAIL: '+message);
  checks.push(message);
  console.log('PASS:',message);
}
async function ready(){
  for(let i=0;i<50;i++){
    try{if((await fetch(base+'review.html')).ok)return;}catch{}
    await new Promise(resolve=>setTimeout(resolve,200));
  }
  throw Error('Local production-site server failed');
}
async function focusIsActive(page){
  return page.locator('#review-iframe').evaluate(node=>Boolean(node.contentDocument?.getElementById('gallery')?.classList.contains('ba-showcase-pulse')));
}
try{
  await ready();
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  page.on('pageerror',error=>pageErrors.push(String(error)));
  await page.route(/^https:\/\/images\.unsplash\.com\//,route=>route.abort());
  await page.goto(base+'review.html?id=GAL-02',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#review-loading')?.hidden===true,{timeout:15000});
  assert(await page.locator('#review-error').isHidden(),'viewer loads, no blank-frame error');
  assert(await page.locator('#review-title').innerText()==='Asymmetric masonry gallery','design-specific heading appears');
  assert(await page.locator('input[name=device][value=phone]').isChecked(),'phone selected on a phone');
  assert(await page.locator('#review-highlight').isEnabled(),'replay highlight button enabled once iframe loads');
  assert(await page.locator('details.review-accordion').count()===3,'three design-specific accordions rendered');
  await page.locator('#review-best-for summary').click();
  assert(await page.locator('#review-best-for li').count()>=2,'appropriate website examples listed');
  const iframeSrc=await page.locator('#review-iframe').getAttribute('src');
  assert(iframeSrc&&!iframeSrc.includes('#'),'no fragment navigation in viewer iframe');
  const innerWidth=await page.locator('#review-iframe').evaluate(el=>el.contentWindow.innerWidth);
  assert(innerWidth===390,'phone viewport is genuinely 390px wide');
  const innerScroll=await page.locator('#review-iframe').evaluate(el=>el.contentWindow.scrollY);
  assert(innerScroll>0,'only iframe scrolls to showcased gallery');
  await page.locator('#review-highlight').click();
  assert(await focusIsActive(page),'replay button highlights the relevant gallery section');
  await page.waitForTimeout(2600);
  assert(!(await focusIsActive(page)),'highlight fades after around 2 seconds');
  await page.locator('#review-highlight').click();
  assert(await focusIsActive(page),'same button replays highlight a second time');
  await page.screenshot({path:path.join(evidence,'gallery-phone-highlight.png'),fullPage:true});
  await page.locator('input[name=device][value=desktop]').check({force:true});
  await page.waitForTimeout(160);
  const desktopWidth=await page.locator('#review-iframe').evaluate(el=>el.contentWindow.innerWidth);
  assert(desktopWidth===1440,'desktop layout remains 1440px on a phone');
  await page.locator('input[name=zoom][value=actual]').check({force:true});
  assert(await page.locator('#review-pan-controls').isVisible(),'zoom provides horizontal pan controls');
  const beforeJump=await page.evaluate(()=>scrollY);
  await page.waitForTimeout(1500);
  const afterJump=await page.evaluate(()=>scrollY);
  assert(Math.abs(afterJump-beforeJump)<36,'outer review page does not move without user input');
  await page.screenshot({path:path.join(evidence,'gallery-desktop-inspect.png'),fullPage:true});
  await page.goto(base+'index.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelectorAll('.cs-item--preview').length===10,{timeout:12000});
  const embedded=await page.locator('.cs-preview-window iframe').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('src')));
  assert(embedded.length===10&&embedded.every(src=>src&&!src.includes('#')),'all catalogue previews use fragment-free URLs');
  await page.evaluate(()=>scrollTo(0,1500));
  await page.waitForTimeout(400);
  const catalogueBefore=await page.evaluate(()=>scrollY);
  await page.waitForTimeout(1800);
  const catalogueAfter=await page.evaluate(()=>scrollY);
  assert(Math.abs(catalogueAfter-catalogueBefore)<36,'gallery page position stable as preview cards load');
  await page.screenshot({path:path.join(evidence,'catalogue-phone.png'),fullPage:true});
  assert(pageErrors.length===0,'no uncaught browser script errors');
  await page.close();
  writeFileSync(path.join(evidence,'result.json'),JSON.stringify({checks,errors:pageErrors},null,2));
  console.log('Browser checks:',checks.length,'passed');
}catch(error){
  console.error(error);
  writeFileSync(path.join(evidence,'failure.txt'),String(error)+'\n'+pageErrors.join('\n'));
  process.exitCode=1;
}finally{
  if(browser)await browser.close();
  server.kill();
}