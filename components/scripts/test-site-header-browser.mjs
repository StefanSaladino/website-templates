import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const here=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dist=path.resolve(here,'../dist'),evidence=path.join(here,'component-browser-evidence','site-header');
mkdirSync(evidence,{recursive:true});
const base='http://127.0.0.1:4201/',server=spawn('python3',['-m','http.server','4201','--bind','127.0.0.1'],{cwd:dist,stdio:'ignore'});
let browser;
const routes=['index.html','components/index.html','components/review.html?id=NAV-03','components/builder.html'];
try{
 for(let i=0;i<50;i++){try{if((await fetch(base+'index.html')).ok)break;}catch{}await new Promise(r=>setTimeout(r,200));}
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/opt/google/chrome/chrome','/usr/bin/chromium'].find(existsSync);
 browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({reducedMotion:'reduce'});await context.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
 const page=await context.newPage();
 for(const [index,route] of routes.entries())for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:850});await page.goto(base+route,{waitUntil:'domcontentloaded'});
  const header=page.locator('[data-site-header]'),toggle=header.locator('.ba-menu-toggle'),nav=header.locator('nav');
  await page.waitForFunction(()=>document.querySelector('[data-site-header]')?.hasAttribute('data-enhanced'));
  assert.equal(await nav.locator('a[aria-current]').textContent(),['Main','Components','Components','Design your own'][index]);
  assert.deepEqual(await nav.locator('a').evaluateAll(a=>a.map(x=>new URL(x.href).pathname)),['/index.html','/components/index.html','/components/builder.html']);
  assert(await header.evaluate(el=>el.getBoundingClientRect().right<=innerWidth+1&&el.scrollWidth<=innerWidth+1),'header overflow');
  if(width<=800){
   assert(await toggle.isVisible()&&await nav.isHidden());await toggle.focus();await toggle.press('Enter');assert(await nav.isVisible());assert.equal(await toggle.getAttribute('aria-expanded'),'true');
   assert(await nav.locator('a').evaluateAll(a=>a.every(x=>x.getBoundingClientRect().height>=44&&x.getBoundingClientRect().right<=innerWidth)));
   await toggle.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement?.textContent.trim()),'Main');
   await page.keyboard.press('Escape');assert(await nav.isHidden());assert(await toggle.evaluate(el=>el===document.activeElement));
   await toggle.click();await page.locator('main').evaluate(el=>el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})));assert(await nav.isHidden());
   if(width===390){await toggle.click();await page.screenshot({path:path.join(evidence,index+'-mobile-open.png')});await page.keyboard.press('Escape');await header.screenshot({path:path.join(evidence,index+'-mobile.png')});}
  }else{assert(await nav.isVisible()&&await toggle.isHidden());if(width===1440)await header.screenshot({path:path.join(evidence,index+'-desktop.png')});}
  await page.evaluate(()=>window.scrollTo({top:Math.min(200,Math.max(0,document.documentElement.scrollHeight-innerHeight)),behavior:'instant'}));assert(Math.abs((await header.boundingBox()).y)<2,'sticky header');
 }
 await page.setViewportSize({width:390,height:850});await page.goto(base+'index.html',{waitUntil:'domcontentloaded'});
 for(const [name,route] of [['Components','components/index.html'],['Design your own','components/builder.html'],['Main','index.html']]){await page.locator('.ba-menu-toggle').click();await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('link',{name,exact:true}).click();await page.waitForURL(base+route);}
 const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:850}});await noJS.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());const fallback=await noJS.newPage();
 for(const route of routes){await fallback.goto(base+route,{waitUntil:'domcontentloaded'});assert(await fallback.locator('.ba-primary-nav').isVisible());assert(await fallback.locator('.ba-menu-toggle').isHidden());}
 await noJS.close();console.log('PASS: 20 responsive header cases, keyboard/menu interactions, navigation and no-JS fallback.');
}finally{if(browser)await browser.close();server.kill();}
