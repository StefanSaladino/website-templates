import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.resolve(root,'../dist');
const evidence=path.join(root,'component-browser-evidence');
mkdirSync(evidence,{recursive:true});
const components=JSON.parse((await import('node:fs')).readFileSync(path.join(root,'data/components.json'),'utf8')).filter(x=>x.status!=='draft');
const alternatives=JSON.parse((await import('node:fs')).readFileSync(path.join(root,'data/mobile-treatments.json'),'utf8')).filter(x=>x.status!=='draft');
const base='http://127.0.0.1:4199/components/';
const server=spawn('python3',['-m','http.server','4199','--bind','127.0.0.1'],{cwd:output,stdio:'ignore'});
const errors=[],checks=[],cases=[];
let browser,page;
function assert(value,message){
 if(!value)throw Error('FAIL: '+message);
 checks.push(message);
 console.log('PASS:',message);
}
async function waitForServer(){
 for(let i=0;i<50;i++){
  try{if((await fetch(base+'review.html')).ok)return;}catch{}
  await new Promise(r=>setTimeout(r,200));
 }
 throw Error('Local production-site server unavailable');
}
const chrome=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/opt/google/chrome/chrome','/usr/bin/chromium'].find(existsSync);
if(!chrome)throw Error('A system Chrome/Chromium executable is required for browser QA');
async function runCase(item, device, hostWidth, alt=null, shot=false){
 await page.setViewportSize({width:hostWidth,height:900});
 await page.goto(base+'review.html?id='+encodeURIComponent(item.id),{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#review-highlight')?.disabled===false,{timeout:12000});
 assert(await page.locator('#review-error').isHidden(),item.id+' '+device+': review loaded without error');
 if(device!==(hostWidth<640?'phone':'desktop'))await page.locator('input[name=device][value='+device+']').check({force:true});
 if(alt){
  await page.locator('input[name=mobile][value=alternate]').check({force:true});
  await page.waitForFunction(()=>document.querySelector('#review-highlight')?.disabled===false,{timeout:10000});
 }
 const info=await page.locator('#review-iframe').evaluate((iframe,ref)=>{
  const doc=iframe.contentDocument,win=iframe.contentWindow;
  const target=doc?.getElementById(ref.anchor);
  const rect=target?.getBoundingClientRect();
  return {found:Boolean(target),tag:target?.tagName.toLowerCase(),id:target?.id||null,width:win.innerWidth,rect:rect?{top:rect.top,bottom:rect.bottom,height:rect.height,width:rect.width}:null,alt:doc?.body?.dataset?.mobileTreatment||null,scrollY:win.scrollY,src:iframe.getAttribute('src')};
 },{anchor:item.showcase.focusAnchor});
 const expectedWidth={desktop:1440,tablet:768,phone:390}[device];
 assert(info.found,item.id+' '+device+': target #'+item.showcase.focusAnchor+' exists');
 const expectedTag={headers:'header',heroes:'section',galleries:'section',services:'section','calls-to-action':'section',forms:'section'}[item.category];
 assert(info.tag===expectedTag,item.id+' '+device+': highlight targets '+expectedTag+' not page wrapper');
 assert(info.width===expectedWidth,item.id+' '+device+': real CSS viewport '+expectedWidth+'px');
 assert(info.rect?.width>100&&info.rect?.height>20&&info.rect.top<({desktop:900,tablet:900,phone:780}[device])&&info.rect.bottom>0,item.id+' '+device+': target visible inside selected preview');
 assert(!info.src.includes('#'),item.id+' '+device+': no fragment jump');
 if(alt)assert(info.alt===alt.id,item.id+' '+alt.id+': alternative phone treatment active');
 // First interaction is an ordinary pointer action inside the sample.
 await page.locator('#review-iframe').evaluate((iframe,id)=>{
  const t=iframe.contentDocument.getElementById(id);
  t.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
 },item.showcase.focusAnchor);
 let hasPulse=await page.locator('#review-iframe').evaluate((iframe,id)=>iframe.contentDocument.getElementById(id).classList.contains('ba-showcase-pulse'),item.showcase.focusAnchor);
 assert(hasPulse,item.id+' '+device+': first interaction highlights correct section');
 await page.locator('#review-highlight').click();
 hasPulse=await page.locator('#review-iframe').evaluate((iframe,id)=>iframe.contentDocument.getElementById(id).classList.contains('ba-showcase-pulse'),item.showcase.focusAnchor);
 assert(hasPulse,item.id+' '+device+': replay button highlights correct section');
 await page.waitForTimeout(500);
 const painted=await page.locator('#review-iframe').evaluate((iframe,id)=>{
  const target=iframe.contentDocument.getElementById(id);
  const css=iframe.contentWindow.getComputedStyle(target);
  return {animation:css.animationName,outline:css.outlineColor,shadow:css.boxShadow};
 },item.showcase.focusAnchor);
 assert(painted.animation.includes('baShowcasePulse')&&painted.shadow!=='none',item.id+' '+device+': visible highlight stroke is painted');
 const before=await page.evaluate(()=>scrollY);
 await page.waitForTimeout(850);
 const after=await page.evaluate(()=>scrollY);
 assert(Math.abs(after-before)<24,item.id+' '+device+': main page does not jump during highlight');
 if(shot)await page.screenshot({path:path.join(evidence,item.id+'-'+device+(alt?'-'+alt.id:'')+'.png'),fullPage:false});
 cases.push({id:item.id,device,hostWidth,altId:alt?.id||null,target:info.id,tag:info.tag,width:info.width,targetRect:info.rect,innerScroll:info.scrollY,painted});
}
try{
 await waitForServer();
 browser=await chromium.launch({executablePath:chrome,headless:true,args:['--no-sandbox']});
 page=await browser.newPage({viewport:{width:390,height:900},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(String(e)));
 await page.route(/^https:\/\/images\.unsplash\.com\//,route=>route.abort());
 // Test every built component on actual phone and desktop breakpoints, with host phone-sized.
 for(const item of components)await runCase(item,'phone',390,null,true);
 for(const item of components)await runCase(item,'desktop',390,null,true);
 for(const alt of alternatives){
  const item=components.find(x=>alt.compatibleComponentIds?.includes(x.id));
  if(!item)throw Error('Alternate '+alt.id+' missing compatible built component');
  await runCase(item,'phone',390,alt,true);
 }
 // Spot-check tablet and phone layouts when viewed from a desktop-size host.
 for(const id of ['NAV-01','HERO-02','GAL-01','SRV-03','FORM-01']){
  const item=components.find(x=>x.id===id);
  await runCase(item,'tablet',1280,null,false);
 }
 for(const id of ['NAV-03','HERO-01','GAL-02','CTA-01','FORM-01']){
  const item=components.find(x=>x.id===id);
  await runCase(item,'phone',1280,null,false);
 }
 // Confirm the preview catalogue doesn't load fragment URLs that scroll the parent.
 await page.setViewportSize({width:390,height:900});
 await page.goto(base+'index.html',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelectorAll('.cs-item--preview').length===10,{timeout:12000});
 const urls=await page.locator('.cs-preview-window iframe').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('src')));
 assert(urls.length===10&&urls.every(src=>src&&!src.includes('#')),'all 10 catalogue iframe URLs are fragment-free');
 await page.evaluate(()=>scrollTo(0,1200));
 await page.waitForTimeout(250);
 const before=await page.evaluate(()=>scrollY);
 await page.waitForTimeout(1200);
 const after=await page.evaluate(()=>scrollY);
 assert(Math.abs(after-before)<30,'catalogue scroll stays steady while previews initialize');
 assert(errors.length===0,'no uncaught browser script errors');
 console.log('RESULT: '+cases.length+' responsive highlight scenarios, '+checks.length+' checks passed');
 writeFileSync(path.join(evidence,'results.json'),JSON.stringify({caseCount:cases.length,checks:checks.length,cases,errors},null,2));
}catch(error){
 console.error(error);
 writeFileSync(path.join(evidence,'failure.txt'),String(error)+'\n'+errors.join('\n'));
 process.exitCode=1;
}finally{
 if(page)await page.close();
 if(browser)await browser.close();
 server.kill();
}