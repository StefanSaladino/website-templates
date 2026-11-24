import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const here=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dist=path.resolve(here,'../dist'),evidence=path.join(here,'component-browser-evidence','builder');
mkdirSync(evidence,{recursive:true});
const origin='http://127.0.0.1:4202/',url=origin+'components/builder.html',server=spawn('python3',['-m','http.server','4202','--bind','127.0.0.1'],{cwd:dist,stdio:'ignore'});
let browser;
try{
 for(let i=0;i<50;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,200));}
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/opt/google/chrome/chrome','/usr/bin/chromium'].find(existsSync);
 browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox']});
 for(const width of [320,390,768,1440]){
  const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});await ctx.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
  const page=await ctx.newPage();await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.locator('[data-mode=custom]').click();assert(await page.locator('#step-title').textContent()==='Choose your navigation');
  assert(await page.locator('[data-guide-skip]').count()===0);assert(await page.locator('#next').isDisabled());assert(await page.locator('.design-option').count()>1);
  const first=page.locator('.design-option').first();await first.scrollIntoViewIfNeeded();await first.locator('[data-loaded]').waitFor({timeout:15000});
  assert(await first.locator('iframe').evaluate(f=>!!f.contentDocument?.getElementById(f.closest('[data-thumb]').dataset.anchor)));
  await first.locator('[data-enlarge]').click();assert(await page.locator('#design-dialog').isVisible());await page.keyboard.press('Escape');assert(await page.locator('#design-dialog').isHidden());
  await page.screenshot({path:path.join(evidence,'guide-'+width+'.png')});
  for(const id of ['NAV-01','HERO-01','FOOT-01'])await page.locator('[data-pick='+id+']').click();
  assert(await page.locator('[data-guide-skip]').isVisible());await page.locator('[data-guide-skip]').click();
  assert.equal(await page.locator('#step-title').textContent(),'Introduce your business');
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('[data-guide-finish]').waitFor();assert.equal(await page.locator('#step-title').textContent(),'Introduce your business');
  await page.locator('[data-guide-finish]').click();assert.equal(await page.locator('#step-title').textContent(),'Review responsive layouts');
  await page.locator('#next').click();await page.locator('#next').click();await page.locator('#next').click();assert((await page.locator('#brief').inputValue()).includes('01. NAV-01'));
  assert((await page.locator('#brief').inputValue()).includes('03. FOOT-01'));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
  await ctx.close();
 }
 const ctx=await browser.newContext({viewport:{width:390,height:900}});await ctx.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());const p=await ctx.newPage();await p.goto(url,{waitUntil:'domcontentloaded'});await p.locator('[data-mode=template]').click();assert(await p.locator('.design-option').count()<=6);await p.locator('[data-pick=abyss-ocean]').click();assert.equal(await p.locator('#step-title').textContent(),'Review responsive layouts');await ctx.close();
 console.log('PASS guided builder: essential steps, real previews, optional skips, resume, ordered export and full template path at four widths.');
}finally{if(browser)await browser.close();server.kill();}
