import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.resolve(root,'../dist');
const evidence=path.join(root,'component-browser-evidence');
mkdirSync(evidence,{recursive:true});
const components=JSON.parse((await import('node:fs')).readFileSync(path.join(root,'data/components.json'),'utf8')).filter(x=>x.status!=='draft');
const alternatives=JSON.parse((await import('node:fs')).readFileSync(path.join(root,'data/mobile-treatments.json'),'utf8')).filter(x=>x.status!=='draft');
const base='http://127.0.0.1:4199/components/';
const server=spawn('python3',['-m','http.server','4199','--bind','127.0.0.1'],{cwd:output,stdio:'ignore'});
const errors=[],checks=[],cases=[];
async function visiblePixelChanges(before,after){
 const a=await sharp(before).removeAlpha().raw().toBuffer({resolveWithObject:true});
 const b=await sharp(after).removeAlpha().raw().toBuffer({resolveWithObject:true});
 // Embedded responsive layouts can alter scrollbars while settling. Compare only
 // the overlapping image rectangle, rather than failing on a 1px size change.
 const width=Math.min(a.info.width,b.info.width);
 const height=Math.min(a.info.height,b.info.height);
 if(width<100||height<100)throw Error('Stage image too small to verify highlight');
 let changed=0;
 for(let y=0;y<height;y++){
  for(let x=0;x<width;x++){
   const i=(y*a.info.width+x)*3;
   const j=(y*b.info.width+x)*3;
   if(Math.abs(a.data[i]-b.data[j])+Math.abs(a.data[i+1]-b.data[j+1])+Math.abs(a.data[i+2]-b.data[j+2])>80)changed++;
  }
 }
 return changed;
}
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
  await page.locator('input[name=mobile][value='+alt.id+']').check({force:true});
  await page.waitForFunction(()=>document.querySelector('#review-highlight')?.disabled===false,{timeout:10000});
 }
 // Allow selected iframe width and responsive layout to settle for two frames.
 await page.waitForTimeout(220);
 const info=await page.locator('#review-iframe').evaluate((iframe,ref)=>{
  const doc=iframe.contentDocument,win=iframe.contentWindow;
  const target=doc?.getElementById(ref.anchor);
  const rect=target?.getBoundingClientRect();
  return {found:Boolean(target),tag:target?.tagName.toLowerCase(),id:target?.id||null,width:win.innerWidth,rect:rect?{top:rect.top,bottom:rect.bottom,height:rect.height,width:rect.width}:null,alt:doc?.body?.dataset?.mobileTreatment||null,scrollY:win.scrollY,src:iframe.getAttribute('src')};
 },{anchor:item.showcase.focusAnchor});
 const expectedWidth={desktop:1440,tablet:768,phone:390}[device];
 assert(info.found,item.id+' '+device+': target #'+item.showcase.focusAnchor+' exists');
 const expectedTag={headers:'header',heroes:'section',galleries:'section',services:'section','calls-to-action':'section',forms:'section',process:'section',introductions:'section',testimonials:'section',footers:'footer',animations:'section',announcements:'section',projects:'section',contact:'section','before-after':'section',about:'section',media:'section',trust:'section',teams:'section',locations:'section',careers:'section',newsletter:'section',interface:'section',legal:'section',products:'section',pricing:'section',menus:'section',booking:'section',articles:'section',events:'section'}[item.category];
 assert(info.tag===expectedTag,item.id+' '+device+': highlight targets '+expectedTag+' not page wrapper');
 assert(info.width===expectedWidth,item.id+' '+device+': real CSS viewport '+expectedWidth+'px');
 assert(info.rect?.width>100&&info.rect?.height>20&&info.rect.top>=-4&&info.rect.top<170&&info.rect.bottom>0,item.id+' '+device+': highlighted section starts visibly near top of preview');
 assert(!info.src.includes('#'),item.id+' '+device+': no fragment jump');
 if(alt)assert(info.alt===alt.id,item.id+' '+alt.id+': alternative phone treatment active');
 // Capture the preview area, rather than the review page header.
 const stage=page.locator('.review-stage');
 const unhighlighted=await stage.screenshot({animations:'disabled'});
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
 const overlay=await page.locator('#review-spotlight').evaluate(box=>{
   const r=box.getBoundingClientRect();
   const view=document.querySelector('#review-viewport').getBoundingClientRect();
   const stage=document.querySelector('.review-stage').getBoundingClientRect();
   const css=getComputedStyle(box);
   return {
     hidden:box.hidden,
     className:box.className,
     label:box.textContent.trim(),
     left:r.left,top:r.top,right:r.right,bottom:r.bottom,
     width:r.width,height:r.height,
     border:css.borderTopWidth,
     viewLeft:view.left,viewRight:view.right,viewTop:view.top,viewBottom:view.bottom,
     stageLeft:stage.left,stageRight:stage.right
   };
 });
 assert(!overlay.hidden && overlay.className.includes('review-spotlight--active'),item.id+' '+device+': unscaled spotlight overlay active');
 assert(overlay.width>=14 && overlay.height>=12,item.id+' '+device+': spotlight draws a real box in screen pixels');
 assert(overlay.left>=overlay.viewLeft-3 && overlay.right<=overlay.viewRight+3 && overlay.top>=overlay.viewTop-3 && overlay.bottom<=overlay.viewBottom+3,item.id+' '+device+': spotlight stays inside the visible preview');
 assert(overlay.border==='6px' && overlay.label==='THIS IS THE SECTION',item.id+' '+device+': thick visible outline and plain-language label');
 await page.waitForTimeout(500);
 const activeShot=await stage.screenshot();
 const changedPixels=await visiblePixelChanges(unhighlighted,activeShot);
 assert(changedPixels>=60,item.id+' '+device+': visible change from outline/highlight ('+changedPixels+' pixels)');
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
 if(shot)await stage.screenshot({path:path.join(evidence,item.id+'-'+device+(alt?'-'+alt.id:'')+'-spotlight.png')});
 cases.push({id:item.id,device,hostWidth,altId:alt?.id||null,target:info.id,tag:info.tag,width:info.width,targetRect:info.rect,innerScroll:info.scrollY,changedPixels,overlay,painted});
}
try{
 await waitForServer();
 browser=await chromium.launch({executablePath:chrome,headless:true,args:['--no-sandbox']});
 page=await browser.newPage({viewport:{width:390,height:900},deviceScaleFactor:1});
 page.on('pageerror',e=>{const entry=e?.stack||String(e);errors.push(entry);console.error('BROWSER PAGE ERROR:',entry);});
 await page.route(/^https:\/\/images\.unsplash\.com\//,route=>route.abort());
 // Integrated motion: the animated components must also be real and interactive
 // on complete existing templates, not only isolated showroom specimens.
 const templateBase='http://127.0.0.1:4199/templates/';
 const openTemplate=async folder=>{
   await page.goto(templateBase+folder+'/index.html',{waitUntil:'domcontentloaded'});
   await page.waitForTimeout(120);
 };
 await page.route(/^https:\/\/(?:videos\.pexels\.com|images\.pexels\.com)\//,route=>route.abort());
 await page.goto(base+'review.html?id=ANIM-01',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#review-template-example')?.hidden===false);
 const linked=await page.locator('#review-template-example').getAttribute('href');
 assert(linked==='../templates/quiet-saas/index.html#top','animation review links to the actual Arc template');
 await page.goto(base+'index.html',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(expected=>document.querySelectorAll('.cs-item--preview').length===expected,components.length);
 assert(await page.locator('.cs-item').filter({hasText:'ANIM-01'}).locator('a[href*="templates/quiet-saas"]').count()===1,'animation catalogue provides a genuine full-template link');
 await openTemplate('quiet-saas');
 await page.waitForSelector('.arc-motion-ready');
 await page.locator('[data-replay-motion="ANIM-01"]').click();
 assert(await page.locator('[data-motion-pattern="ANIM-01"]').evaluate(el=>el.classList.contains('arc-motion-playing')),'Arc ANIM-01 replays the real hero entrance');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('[data-replay-motion="ANIM-01"]').click();
 assert(!await page.locator('[data-motion-pattern="ANIM-01"]').evaluate(el=>el.classList.contains('arc-motion-playing')),'Arc motion stops for reduced-motion preference');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await openTemplate('creative-agency');
 await page.waitForSelector('.offcut-motion-ready');
 await page.locator('[data-replay-motion="ANIM-02"]').click();
 assert(await page.locator('[data-motion-pattern="ANIM-02"]').evaluate(el=>el.classList.contains('offcut-motion-playing')),'OFFCUT ANIM-02 replays a line-wise title');
 await openTemplate('architecture');
 await page.waitForSelector('.morrow-mask-ready');
 await page.locator('[data-replay-motion="ANIM-03"]').click();
 assert(await page.locator('[data-motion-pattern="ANIM-03"]').evaluate(el=>el.classList.contains('morrow-mask-playing')),'Morrow ANIM-03 reveals its actual hero image');
 await openTemplate('storefront');
 await page.locator('[data-product="Counter Wash"] .swatches button').nth(1).click();
 const finish=await page.locator('[data-product="Counter Wash"]').evaluate(el=>({
  text:el.querySelector('.finish-feedback')?.textContent,
  color:getComputedStyle(el.querySelector('.product-media')).backgroundColor,
  pressed:el.querySelectorAll('.swatches button')[1].getAttribute('aria-pressed')
 }));
 assert(finish.text.includes('Stone')&&finish.pressed==='true'&&finish.color.startsWith('rgb('),'MORA ANIM-05 actually changes the product finish and selected text');
 await openTemplate('interactive-playground');
 await page.waitForSelector('.ticker-motion-ready');
 await page.locator('[data-ticker-control]').click();
 assert(await page.locator('[data-motion-pattern="ANIM-06"]').evaluate(el=>el.classList.contains('is-paused')),'WOBBLEWORKS ANIM-06 ticker can be paused');
 await page.locator('[data-ticker-control]').click();
 assert(!await page.locator('[data-motion-pattern="ANIM-06"]').evaluate(el=>el.classList.contains('is-paused')),'WOBBLEWORKS ticker can resume');
 await openTemplate('contractor');
 await page.locator('[data-motion-stage="4"]').click();
 assert(await page.locator('#process-current-stage').textContent()==='Stage 4 of 4'
   && await page.locator('.process-motion-meter span').evaluate(el=>el.style.width==='100%'),'LINE + LEVEL ANIM-07 responds to a selected stage');
 await page.goto(base+'previews/ANIM-03/index.html',{waitUntil:'domcontentloaded'});
 await page.locator('#a3-play').click();
 assert(await page.locator('#a3-image').evaluate(el=>el.classList.contains('is-playing')),'ANIM-03 isolated image mask replays');
 await page.goto(base+'previews/ANIM-06/index.html',{waitUntil:'domcontentloaded'});
 await page.locator('#a6-next').click();
 assert((await page.locator('#a6-position').textContent()).includes('02'),'ANIM-06 finite ticker advances manually');
 await page.locator('#a6-play').click();
 assert(await page.locator('#a6-play').getAttribute('aria-pressed')==='true','ANIM-06 opt-in rotation starts');
 await page.locator('#a6-play').click();
 assert(await page.locator('#a6-play').getAttribute('aria-pressed')==='false','ANIM-06 rotation pauses');
 for(const folder of ['quiet-saas','creative-agency','architecture','storefront','interactive-playground','contractor']){
   await openTemplate(folder);
   const marked=await page.locator('[data-motion-pattern]').count();
   assert(marked>=1,folder+': full template contains a real integrated motion target');
   await page.screenshot({path:path.join(evidence,folder+'-integrated-phone.png'),fullPage:false,animations:'disabled'});
 }



 // Full-page animation tests for the six newly built patterns.
 await openTemplate('event-launch');
 await page.locator('[data-replay-motion="ANIM-08"]').click();
 assert(await page.locator('[data-motion-pattern="ANIM-08"]').evaluate(el=>el.classList.contains('event-line-playing')),'ANIM-08 headline wipe appears on AFTER DARK');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('[data-replay-motion="ANIM-08"]').click();
 assert(!await page.locator('[data-motion-pattern="ANIM-08"]').evaluate(el=>el.classList.contains('event-line-playing')),'ANIM-08 reduced-motion fallback');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await openTemplate('muskoka-retreat');
 await page.locator('[data-retreat-chapter="2"]').click();
 assert(await page.locator('[data-retreat-chapter="2"]').getAttribute('aria-current')==='step'&&
  await page.locator('.retreat-chapter-meter span').evaluate(el=>el.style.width==='100%'),'ANIM-10 retreat chapter navigation is interactive');
 await openTemplate('landscaping');
 await page.locator('[data-detail-zoom]').click();
 assert(await page.locator('[data-motion-pattern="ANIM-11"]').evaluate(el=>el.classList.contains('detail-is-zoomed')),'ANIM-11 garden photograph zooms on demand');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>!document.querySelector('[data-motion-pattern="ANIM-11"]')?.classList.contains('detail-is-zoomed'));
 assert(!await page.locator('[data-motion-pattern="ANIM-11"]').evaluate(el=>el.classList.contains('detail-is-zoomed')),'ANIM-11 zoom disabled for reduced motion');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await openTemplate('law-firm');
 await page.locator('#questions details').nth(1).locator('summary').click();
 assert(await page.locator('#questions details').nth(1).evaluate(el=>el.open),'ANIM-14 law firm FAQ opens natively');
 await page.locator('#questions details').nth(2).locator('summary').click();
 await page.waitForFunction(()=>!document.querySelectorAll('#questions details')[1].open);
 assert(await page.locator('#questions details').nth(2).evaluate(el=>el.open),'ANIM-14 native FAQ keeps current answer accessible');
 await openTemplate('fitness-launch');
 await page.locator('[data-yard-replay]').click();
 assert((await page.locator('[data-yard-status]').textContent()).includes('Demonstrating'),'ANIM-15 meaningful group count replays');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('[data-yard-replay]').click();
 assert((await page.locator('[data-yard-count="6"]').textContent())==='6'&&
  (await page.locator('[data-yard-status]').textContent()).includes('Reduced motion'),'ANIM-15 numbers remain intact for reduced motion');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await openTemplate('tattoo-studio');
 await page.locator('[data-rhythm-piece]').first().scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>document.querySelector('[data-motion-pattern="ANIM-18"]')?.classList.contains('is-rhythm-playing'));
 assert(await page.locator('[data-motion-pattern="ANIM-18"]').evaluate(el=>el.classList.contains('is-rhythm-playing')),'ANIM-18 starts when the first gallery photo becomes visible');
 await page.locator('[data-rhythm-replay]').click();
 assert(await page.locator('[data-motion-pattern="ANIM-18"]').evaluate(el=>el.classList.contains('is-rhythm-playing')),'ANIM-18 tattoo gallery entrance replays');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('[data-rhythm-replay]').click();
 assert(!await page.locator('[data-motion-pattern="ANIM-18"]').evaluate(el=>el.classList.contains('is-rhythm-playing')),'ANIM-18 respects reduced motion');
 await page.emulateMedia({reducedMotion:'no-preference'});
 for(const [id,control] of [['ANIM-08','#p8-replay'],['ANIM-10','[data-p10-go="2"]'],['ANIM-11','#p11-toggle'],['ANIM-14','.a14-questions details:nth-child(2) summary'],['ANIM-15','#a15-play'],['ANIM-18','#a18-replay']]){
  await page.goto(base+'previews/'+id+'/index.html',{waitUntil:'domcontentloaded'});
  await page.locator(control).click();
  assert(await page.locator('#motion-showcase').count()===1,id+' isolated motion preview has an operable control');
 }
 for(const folder of ['event-launch','muskoka-retreat','landscaping','law-firm','fitness-launch','tattoo-studio']){
  await openTemplate(folder);
  assert(await page.locator('[data-motion-pattern]').count()>0,folder+': original full-page template contains an integrated motion');
  await page.screenshot({path:path.join(evidence,folder+'-integrated-phone.png'),animations:'disabled'});
 }


 // Third motion integration batch: every new pattern runs inside a real, complete template.
 await openTemplate('editorial-commerce');
 await page.locator('[data-journal-replay]').click();
 assert(await page.locator('[data-motion-pattern="ANIM-09"]').evaluate(el=>el.classList.contains('journal-motion-playing')),'ANIM-09 diagonal panel reveal actually replays in RANGE/FOUND');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('[data-journal-replay]').click();
 assert(!await page.locator('[data-motion-pattern="ANIM-09"]').evaluate(el=>el.classList.contains('journal-motion-playing')),'ANIM-09 skips diagonal motion for reduced-motion users');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await openTemplate('frame-portfolio');
 await page.locator('[data-feature-select="2"]').click();
 assert(await page.locator('[data-feature-image="2"]').isVisible()&&await page.locator('[data-feature-image="0"]').isHidden()
   &&await page.locator('[data-feature-select="2"]').getAttribute('aria-pressed')==='true'
   &&(await page.locator('[data-feature-status]').textContent()).includes('Quiet object'),'ANIM-12 FRAME exchange changes a real photograph, its caption and selected state');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('[data-feature-select="1"]').click();
 assert(await page.locator('[data-feature-image="1"]').isVisible()&&
   !await page.locator('[data-feature-image="1"]').evaluate(el=>el.classList.contains('is-arriving')),'ANIM-12 remains selectable without motion');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await openTemplate('monolith-architecture');
 assert(await page.locator('[data-monolith-card]').count()===3,'ANIM-17 MONOLITH contains three real story chapters');
 assert(await page.locator('[data-monolith-card="0"]').evaluate(el=>getComputedStyle(el).position==='relative'),'ANIM-17 mobile chapters remain in normal document flow');
 await page.locator('[data-monolith-link="2"]').click();
 await page.waitForFunction(()=>document.querySelector('[data-monolith-link="2"]')?.getAttribute('aria-current')==='step');
 assert((await page.locator('#monolith-story-status').textContent()).includes('Light'),'ANIM-17 chapter link updates reading position');
 await page.setViewportSize({width:1280,height:900});
 await openTemplate('monolith-architecture');
 assert(await page.locator('[data-monolith-card="0"]').evaluate(el=>getComputedStyle(el).position==='sticky'),'ANIM-17 wide-screen narrative has actual sticky layering');
 await page.emulateMedia({reducedMotion:'reduce'});
 assert(await page.locator('[data-monolith-card="0"]').evaluate(el=>getComputedStyle(el).position==='relative'),'ANIM-17 reduced-motion removes sticky layer overlap');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:390,height:900});
 await openTemplate('woodworker');
 assert(await page.locator('[data-craft-prev]').isDisabled(),'ANIM-20 craft carousel cannot move before first image');
 await page.locator('[data-craft-next]').click();
 assert(await page.locator('[data-craft-slide="1"]').isVisible()&&
   await page.locator('[data-craft-jump="1"]').getAttribute('aria-pressed')==='true','ANIM-20 next moves the real craft photograph and selected step');
 await page.locator('[data-craft-next]').click();
 assert(await page.locator('[data-craft-next]').isDisabled()&&(await page.locator('[data-craft-status]').textContent()).includes('3 of 3'),'ANIM-20 finite carousel stops at the third slide');
 await page.locator('[data-craft-prev]').focus();
 await page.locator('[data-craft-prev]').press('Enter');
 assert((await page.locator('[data-craft-status]').textContent()).includes('2 of 3'),'ANIM-20 carousel responds to keyboard input');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('[data-craft-jump="0"]').click();
 assert(await page.locator('[data-craft-slide="0"]').isVisible()&&
   !await page.locator('[data-craft-slide="0"]').evaluate(el=>el.classList.contains('is-arriving')),'ANIM-20 reduced-motion still permits a slide change');
 await page.emulateMedia({reducedMotion:'no-preference'});
 // Verify isolated variants also have live controls, not only a spotlight marker.
 await page.goto(base+'previews/ANIM-09/index.html',{waitUntil:'domcontentloaded'});
 await page.locator('#a09-replay').click();
 assert(await page.locator('.a09-panel').evaluate(el=>el.classList.contains('is-playing')),'ANIM-09 isolated diagonal panel is replayable');
 await page.goto(base+'previews/ANIM-12/index.html',{waitUntil:'domcontentloaded'});
 await page.locator('[data-a12-select="2"]').click();
 assert(await page.locator('[data-a12-frame="2"]').isVisible()&&
   await page.locator('[data-a12-select="2"]').getAttribute('aria-pressed')==='true','ANIM-12 isolated project image exchange works');
 await page.goto(base+'previews/ANIM-17/index.html',{waitUntil:'domcontentloaded'});
 await page.locator('[data-a17-link="2"]').click();
 await page.waitForTimeout(960);
 await page.waitForFunction(()=>document.querySelector('[data-a17-link="2"]')?.getAttribute('aria-current')==='step'
  &&document.querySelector('#a17-status')?.textContent.includes('Light'));
 assert((await page.locator('#a17-status').textContent()).includes('Light'),'ANIM-17 isolated stacked chapters hold the chosen reading chapter through smooth scrolling');
 await page.goto(base+'previews/ANIM-20/index.html',{waitUntil:'domcontentloaded'});
 await page.locator('[data-a20-next]').click();
 assert(await page.locator('[data-a20-slide="1"]').isVisible(),'ANIM-20 isolated carousel advances by an explicit action');
 // Review links must point directly at the real full-page examples.
 for(const [id,route] of [['ANIM-09','../templates/editorial-commerce/index.html#journal'],['ANIM-12','../templates/frame-portfolio/index.html#frame-feature'],['ANIM-17','../templates/monolith-architecture/index.html#chapters'],['ANIM-20','../templates/woodworker/index.html#craft-showcase']]){
   await page.goto(base+'review.html?id='+id,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.querySelector('#review-template-example')?.hidden===false);
   assert(await page.locator('#review-template-example').getAttribute('href')===route,id+' links to its authentic integrated full-page treatment');
 }
 for(const folder of ['editorial-commerce','frame-portfolio','monolith-architecture','woodworker']){
   await openTemplate(folder);
   assert(await page.locator('[data-motion-pattern]').count()>0,folder+': full-page template includes the actual motion target');
   await page.screenshot({path:path.join(evidence,folder+'-integrated-phone.png'),animations:'disabled'});
 }


 // Final four motion patterns must work in full site templates and isolated previews.
 await page.setViewportSize({width:1280,height:900});
 await openTemplate('landscaping');
 await page.waitForSelector('[data-garden-depth]:visible');
 const depth0=await page.locator('[data-motion-pattern="ANIM-04"]').evaluate(el=>({active:el.classList.contains('garden-depth-on'),shift:parseFloat(el.style.getPropertyValue('--garden-depth-y'))}));
 assert(depth0.active&&Number.isFinite(depth0.shift)&&Math.abs(depth0.shift)<=24,'ANIM-04 garden parallax is active and bounded on desktop');
 await page.locator('[data-garden-depth]').click();
 await page.waitForFunction(()=>!document.querySelector('[data-motion-pattern="ANIM-04"]')?.classList.contains('garden-depth-on'));
 assert(!await page.locator('[data-motion-pattern="ANIM-04"]').evaluate(el=>el.classList.contains('garden-depth-on'))
  && await page.locator('[data-garden-depth]').getAttribute('aria-pressed')==='false','ANIM-04 pause control stops motion on the actual landscaping template');
 await page.locator('[data-garden-depth]').click();
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>!document.querySelector('[data-motion-pattern="ANIM-04"]')?.classList.contains('garden-depth-on'));
 assert(await page.locator('[data-garden-depth]').isHidden(),'ANIM-04 reduced motion hides the unavailable depth control');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:390,height:900});
 await openTemplate('landscaping');
 assert(await page.locator('[data-garden-depth]').isHidden()&&
   !await page.locator('[data-motion-pattern="ANIM-04"]').evaluate(el=>el.classList.contains('garden-depth-on')),'ANIM-04 phone layout uses the still photo');
 await openTemplate('real-estate');
 await page.waitForSelector('[data-shore-next]:visible');
 assert(await page.locator('[data-shore-prev]').isDisabled(),'ANIM-13 story rail begins at its first frame');
 await page.locator('[data-shore-next]').click();
 assert((await page.locator('[data-shore-status]').textContent()).includes('2 of 3'),'ANIM-13 next changes the active editorial frame');
 await page.waitForTimeout(750);
 assert(await page.locator('[data-shore-track]').evaluate(el=>el.scrollLeft>80),'ANIM-13 changes the native horizontal rail scroll position');
 await page.locator('[data-shore-next]').click();
 assert(await page.locator('[data-shore-next]').isDisabled()&&(await page.locator('[data-shore-status]').textContent()).includes('3 of 3'),'ANIM-13 story rail stops at its last frame');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('[data-shore-prev]').click();
 assert((await page.locator('[data-shore-status]').textContent()).includes('2 of 3'),'ANIM-13 reduced motion keeps direct navigation functional');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:1280,height:900});
 await openTemplate('dark-tech');
 const inspection=page.locator('[data-spot-card]');
 await inspection.scrollIntoViewIfNeeded();
 const rect=await inspection.boundingBox();
 await page.mouse.move(rect.x+rect.width*.3,rect.y+rect.height*.45);
 await page.waitForFunction(()=>Boolean(document.querySelector('[data-spot-card]')?.style.getPropertyValue('--spot-x')));
 assert(await inspection.evaluate(el=>el.classList.contains('spot-following')),'ANIM-16 fine-pointer spotlight follows the real release card');
 await page.locator('[data-spot-toggle]').click();
 assert(await page.locator('[data-spot-toggle]').getAttribute('aria-pressed')==='true'
   &&await inspection.evaluate(el=>el.classList.contains('spot-selected')),'ANIM-16 accessible emphasis control works independently of pointer');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>!document.querySelector('[data-spot-card]')?.classList.contains('spot-following'));
 assert(await inspection.evaluate(el=>el.classList.contains('spot-selected')),'ANIM-16 reduced motion stops pointer following while keeping accessible emphasis');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:390,height:900});
 await openTemplate('app-launch');
 assert(await page.locator('#tide-today').isVisible()&&await page.locator('#tide-tomorrow').isHidden(),'ANIM-19 Tide opens on its Today view');
 await page.locator('[data-tide-link="tomorrow"]').click();
 assert(await page.locator('#tide-tomorrow').isVisible()&&
   await page.locator('[data-tide-link="tomorrow"]').getAttribute('aria-current')==='page'
   &&await page.evaluate(()=>location.hash)==='#tide-tomorrow','ANIM-19 changes the visible view and URL together');
 await page.goBack({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>location.hash===''&&document.querySelector('#tide-today')?.hidden===false);
 assert(await page.locator('#tide-tomorrow').isHidden(),'ANIM-19 browser Back restores the Today view');
 await page.goForward({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>location.hash==='#tide-tomorrow'&&document.querySelector('#tide-tomorrow')?.hidden===false);
 assert(await page.locator('#tide-today').isHidden(),'ANIM-19 browser Forward restores the Tomorrow view');
 await openTemplate('app-launch');
 await page.goto(templateBase+'app-launch/index.html#tide-tomorrow',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#tide-tomorrow').isVisible(),'ANIM-19 deep link opens the correct internal view');
 const noJsContext=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});
 const noJsPage=await noJsContext.newPage();
 await noJsPage.goto(templateBase+'app-launch/index.html',{waitUntil:'domcontentloaded'});
 assert(await noJsPage.locator('#tide-today').isVisible()&&await noJsPage.locator('#tide-tomorrow').isVisible(),'ANIM-19 no-JavaScript fallback retains both accessible views');
 await noJsContext.close();
 // Isolated demonstrations must expose working, not decorative controls.
 await page.setViewportSize({width:1280,height:900});
 await page.goto(base+'previews/ANIM-04/index.html',{waitUntil:'domcontentloaded'});
 await page.locator('[data-a04-pause]').click();
 await page.waitForFunction(()=>document.querySelector('[data-a04-pause]')?.getAttribute('aria-pressed')==='false');
 assert(await page.locator('[data-a04-pause]').getAttribute('aria-pressed')==='false','ANIM-04 isolated scroll-depth preview can be paused');
 await page.setViewportSize({width:390,height:900});
 await page.goto(base+'previews/ANIM-13/index.html',{waitUntil:'domcontentloaded'});
 await page.locator('[data-a13-next]').click();
 assert((await page.locator('[data-a13-status]').textContent()).includes('2 of 3'),'ANIM-13 isolated rail has real previous/next behaviour');
 await page.goto(base+'previews/ANIM-16/index.html',{waitUntil:'domcontentloaded'});
 await page.locator('[data-spot-toggle]').click();
 assert(await page.locator('[data-spot-toggle]').getAttribute('aria-pressed')==='true','ANIM-16 isolated card has keyboard/touch emphasis');
 await page.goto(base+'previews/ANIM-19/index.html',{waitUntil:'domcontentloaded'});
 await page.locator('[data-a19-link="tomorrow"]').click();
 assert(await page.locator('#a19-tomorrow').isVisible()&&await page.evaluate(()=>location.hash)==='#a19-tomorrow','ANIM-19 isolated view changes real route state');
 // Verify all four review links resolve to genuine full-page examples.
 for(const [id,route] of [['ANIM-04','../templates/landscaping/index.html#top'],['ANIM-13','../templates/real-estate/index.html#shore-stories'],['ANIM-16','../templates/dark-tech/index.html#inspection'],['ANIM-19','../templates/app-launch/index.html#planner-views']]){
  await page.goto(base+'review.html?id='+id,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#review-template-example')?.hidden===false);
  assert(await page.locator('#review-template-example').getAttribute('href')===route,id+' review provides a link to its real website implementation');
 }
 for(const folder of ['landscaping','real-estate','dark-tech','app-launch']){
  await openTemplate(folder);
  assert(await page.locator('[data-motion-pattern]').count()>=1,folder+': integrated animation marker remains present');
  await page.screenshot({path:path.join(evidence,folder+'-final-motion-phone.png'),animations:'disabled'});
 }


 // Phase 4: genuinely distinct, selectable phone treatments in the existing review system.
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'previews/NAV-01/?mobile=M-NAV-01',{waitUntil:'domcontentloaded'});
 assert(await page.locator('body').getAttribute('data-mobile-treatment')==='M-NAV-01','M-NAV-01 mobile variant explicitly selected');
 await page.locator('.n1-toggle').click();
 assert(await page.locator('.n1-toggle').getAttribute('aria-expanded')==='true'
  &&await page.locator('.n1-menu').isVisible(),'M-NAV-01 opens a functional mobile menu');
 const menuWidth=await page.locator('.n1-menu').evaluate(el=>el.getBoundingClientRect().width);
 assert(menuWidth<=320&&menuWidth>200,'M-NAV-01 uses a compact anchored menu rather than a full-screen overlay');
 await page.keyboard.press('Escape');
 assert(await page.locator('.n1-menu').isHidden()&&await page.locator('.n1-toggle').getAttribute('aria-expanded')==='false','M-NAV-01 closes by Escape and restores menu state');
 assert(await page.locator('.n1-toggle').evaluate(el=>document.activeElement===el),'M-NAV-01 returns keyboard focus to menu toggle');

 await page.goto(base+'previews/HERO-03/?mobile=M-HERO-03',{waitUntil:'domcontentloaded'});
 assert(await page.locator('body').getAttribute('data-mobile-treatment')==='M-HERO-03','M-HERO-03 poster-first mobile variant selected');
 const poster=await page.locator('.h3-scene').evaluate(el=>{const a=el.querySelector('.h3-copy').getBoundingClientRect(),b=el.querySelector('.h3-collage').getBoundingClientRect();return {imageBelow:b.top>=a.bottom-2,columns:getComputedStyle(el.querySelector('.h3-collage')).gridTemplateColumns.split(' ').length}});
 assert(poster.imageBelow&&poster.columns===3,'M-HERO-03 renders typography first and a three-photo editorial strip underneath');

 await page.goto(base+'previews/GAL-03/?mobile=M-GAL-03',{waitUntil:'domcontentloaded'});
 const grid=await page.locator('.g3-chapters').evaluate(el=>({columns:getComputedStyle(el).gridTemplateColumns.split(' ').length,first:getComputedStyle(el.querySelector('.g3-chapter')).gridColumnEnd,third:el.querySelectorAll('.g3-chapter').length}));
 assert(grid.columns===2&&grid.first==='-1'&&grid.third===3,'M-GAL-03 creates a featured wide study and two narrow photographic chapters');

 await page.goto(base+'previews/SRV-02/?mobile=M-SRV-02',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.sv2-switcher-buttons button').count()===3
  &&await page.locator('.sv2-grid article:visible').count()===1,'M-SRV-02 exposes three category buttons and one selected service');
 await page.locator('.sv2-switcher-buttons button').nth(2).click();
 assert(await page.locator('.sv2-switcher-buttons button').nth(2).getAttribute('aria-pressed')==='true'
  &&await page.locator('.sv2-grid article').nth(2).isVisible()
  &&(await page.locator('.sv2-switcher-status').textContent()).includes('Lighting'),'M-SRV-02 actually switches the visible service and announced selection');
 await page.emulateMedia({reducedMotion:'reduce'});
 assert(await page.locator('.sv2-switcher-buttons button').nth(2).isVisible(),'M-SRV-02 remains usable under reduced-motion preference');
 await page.emulateMedia({reducedMotion:'no-preference'});

 await page.goto(base+'previews/FORM-02/?mobile=M-FRM-02',{waitUntil:'domcontentloaded'});
 assert((await page.locator('[data-f2-step-status]').textContent()).includes('Step 1 of 2')
  &&await page.locator('[data-f2-next]').isVisible()
  &&await page.locator('button[type=submit]').isHidden(),'M-FRM-02 starts on a real first step with no premature submit');
 await page.locator('[data-f2-next]').click();
 assert((await page.locator('[data-f2-step-status]').textContent()).includes('Step 1 of 2'),'M-FRM-02 does not advance past missing required project data');
 await page.locator('[name=type]').selectOption({label:'Renovation'});
 await page.locator('[name=timeline]').selectOption({label:'3–6 months'});
 await page.locator('[name=details]').fill('Kitchen and hallway renovation demonstration.');
 await page.locator('[data-f2-next]').click();
 assert((await page.locator('[data-f2-step-status]').textContent()).includes('Step 2 of 2')
  &&await page.locator('[name=email]').isVisible()
  &&await page.locator('button[type=submit]').isVisible(),'M-FRM-02 validates step one and advances to contact details');
 await page.locator('[data-f2-back]').click();
 assert(await page.locator('[name=details]').inputValue()==='Kitchen and hallway renovation demonstration.','M-FRM-02 back navigation preserves the entered project details');
 await page.locator('[data-f2-next]').click();
 await page.locator('[name=name]').fill('Demo Client');
 await page.locator('[name=email]').fill('client@example.com');
 await page.locator('button[type=submit]').click();
 assert(await page.locator('#f2-output-label').isVisible()
  &&(await page.locator('#f2-output').inputValue()).includes('Renovation')
  &&(await page.locator('#f2-message').textContent()).includes('Nothing was submitted'),'M-FRM-02 preserves the functional local enquiry summary without sending data');

 await page.goto(base+'previews/CTA-01/?mobile=M-CTA-01',{waitUntil:'domcontentloaded'});
 const dock=page.locator('.c1-mobile-dock');
 await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
 await page.waitForFunction(()=>document.querySelector('.c1-mobile-dock')?.hidden===false);
 assert(await dock.isVisible()&&(await dock.locator('a').getAttribute('href'))==='../../review.html?id=FORM-01','M-CTA-01 shows a working safe-area mobile enquiry action when the original action is out of view');
 assert(await dock.evaluate(el=>getComputedStyle(el).position)==='fixed','M-CTA-01 action is fixed to the phone viewport');
 await page.locator('.c1-action').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>document.querySelector('.c1-mobile-dock')?.hidden===true);
 assert(await dock.isHidden(),'M-CTA-01 suppresses duplicate sticky action when original button is visible');
 await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
 await page.waitForFunction(()=>document.querySelector('.c1-mobile-dock')?.hidden===false);
 assert(await dock.isVisible(),'M-CTA-01 sticky action returns when original action leaves the viewport');

 // Confirm all six mobile previews have no sideways page overflow at a phone width.
 for(const [parent,altId] of [['NAV-01','M-NAV-01'],['HERO-03','M-HERO-03'],['GAL-03','M-GAL-03'],['SRV-02','M-SRV-02'],['FORM-02','M-FRM-02'],['CTA-01','M-CTA-01']]){
  await page.goto(base+'previews/'+parent+'/?mobile='+altId,{waitUntil:'domcontentloaded'});
  assert(await page.locator('body').getAttribute('data-mobile-treatment')===altId,altId+' preview is routable by mobile treatment query');
  const bounds=await page.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth}));
  assert(bounds.scroll<=bounds.w+2,altId+' does not force horizontal page overflow at 390px (scroll width '+bounds.scroll+'px, viewport '+bounds.w+'px)');
 }


 // Mobile expansion: six new genuine interactions, including native modal and pointer/touch fallbacks.
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'previews/NAV-02/?mobile=M-NAV-05',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.v-anchor-rail a').count()===3
  &&await page.locator('.v-anchor-rail').isVisible()
  &&await page.locator('.v-mobile').isHidden(),'M-NAV-05 replaces the mobile dropdown with horizontal anchor tabs');
 await page.locator('[data-anchor-tab=story]').click();
 assert(await page.evaluate(()=>location.hash)==='#story'
  &&await page.locator('[data-anchor-tab=story]').getAttribute('aria-current')==='location','M-NAV-05 anchors to a real section and updates current-location state');

 await page.goto(base+'previews/NAV-04/?mobile=M-NAV-06',{waitUntil:'domcontentloaded'});
 await page.locator('#n4-toggle').click();
 assert(await page.locator('#n4-links').isVisible()
  &&await page.locator('#n4-toggle').getAttribute('aria-expanded')==='true'
  &&await page.locator('main').evaluate(el=>el.inert),'M-NAV-06 opens a drawer and makes background content inert');
 const drawer=await page.locator('#n4-links').evaluate(el=>el.getBoundingClientRect().width);
 assert(drawer>=260&&drawer<=375,'M-NAV-06 drawer has a bounded phone width');
 await page.locator('.n4-drawer-close').focus();
 await page.keyboard.press('Shift+Tab');
 assert(await page.locator('#n4-links a').last().evaluate(el=>document.activeElement===el),'M-NAV-06 focus remains contained in the open drawer');
 await page.keyboard.press('Escape');
 assert(await page.locator('#n4-links').isHidden()
  &&await page.locator('#n4-toggle').getAttribute('aria-expanded')==='false'
  &&await page.locator('#n4-toggle').evaluate(el=>document.activeElement===el),'M-NAV-06 Escape closes drawer and restores trigger focus');
 await page.locator('#n4-toggle').click();
 await page.locator('.n4-drawer-backdrop').click({position:{x:20,y:340}});
 assert(await page.locator('#n4-links').isHidden(),'M-NAV-06 backdrop click closes the drawer');

 await page.goto(base+'previews/GAL-06/?mobile=M-GAL-05',{waitUntil:'domcontentloaded'});
 const thumbs=await page.locator('.g6-photos').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
 assert(thumbs===3,'M-GAL-05 shows a three-track thumbnail gallery');
 await page.locator('[data-photo="1"]').click();
 assert(await page.locator('#g6-dialog').evaluate(el=>el.open)
  &&await page.locator('#g6-dialog').evaluate(el=>Math.abs(el.getBoundingClientRect().width-innerWidth)<3),'M-GAL-05 opens a true phone-width native lightbox');
 await page.locator('#g6-next').click();
 assert((await page.locator('#g6-position').textContent()).includes('03'),'M-GAL-05 original next control advances the full-screen image');
 const swiped=await page.locator('#g6-large').evaluate(el=>{const make=(x,y)=>new Touch({identifier:8,target:el,clientX:x,clientY:y});
 el.dispatchEvent(new TouchEvent('touchstart',{touches:[make(320,200)],changedTouches:[make(320,200)],bubbles:true}));
 el.dispatchEvent(new TouchEvent('touchend',{touches:[],changedTouches:[make(100,210)],bubbles:true}));
 return document.querySelector('#g6-position').textContent});
 assert(swiped.includes('04'),'M-GAL-05 touch swipe advances the native lightbox');
 await page.keyboard.press('Escape');
 assert(!await page.locator('#g6-dialog').evaluate(el=>el.open)
  &&await page.locator('[data-photo="1"]').evaluate(el=>document.activeElement===el),'M-GAL-05 Escape closes lightbox and restores thumbnail focus');

 await page.goto(base+'previews/FORM-01/?mobile=M-FRM-04',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#f1-date').isVisible()&&await page.locator('#f1-time').isVisible(),'M-FRM-04 exposes native date and time controls on phones');
 await page.locator('#f1-name').fill('Demo Client');
 await page.locator('#f1-email').fill('demo@example.com');
 await page.locator('#f1-message').fill('Consultation about a fictional studio website.');
 await page.locator('#f1-date').fill('2028-05-18');
 await page.locator('#f1-form button[type=submit]').click();
 assert((await page.locator('#f1-schedule-error').textContent()).includes('both a date and a time')
  &&await page.locator('#f1-preview').isHidden(),'M-FRM-04 rejects an incomplete date/time preference');
 await page.locator('#f1-time').fill('14:30');
 await page.locator('#f1-form button[type=submit]').click();
 assert(await page.locator('#f1-preview').isVisible()
  &&(await page.locator('#f1-output').textContent()).includes('2028-05-18 at 14:30')
  &&(await page.locator('#f1-output').textContent()).includes('not booked'),'M-FRM-04 includes preferred contact time in local draft without booking anything');

 await page.goto(base+'previews/COMP-01/?mobile=M-UTIL-03',{waitUntil:'domcontentloaded'});
 await page.locator('[data-comp-preset="75"]').click();
 assert(await page.locator('#comp-range').inputValue()==='75'
  &&await page.locator('#comp-stage').evaluate(el=>el.style.getPropertyValue('--reveal')==='75%')
  &&await page.locator('[data-comp-preset="75"]').getAttribute('aria-pressed')==='true','M-UTIL-03 preset changes actual comparison reveal and button state');
 await page.locator('#comp-stage').scrollIntoViewIfNeeded();
 const box=await page.locator('#comp-stage').boundingBox();
 await page.mouse.move(box.x+box.width*.2,box.y+box.height*.5);
 await page.mouse.down();await page.mouse.move(box.x+box.width*.62,box.y+box.height*.5,{steps:5});await page.mouse.up();
 const pct=Number(await page.locator('#comp-range').inputValue());
 assert(pct>=57&&pct<=67,'M-UTIL-03 direct pointer drag scrubs the comparison image (actual '+pct+'%; stage '+Math.round(box.width)+'px wide, top '+Math.round(box.y)+'px)');
 await page.locator('#comp-range').focus();
 const keyStart=Number(await page.locator('#comp-range').inputValue());
 await page.keyboard.press('ArrowLeft');
 assert(Number(await page.locator('#comp-range').inputValue())===keyStart-1,'M-UTIL-03 original range remains keyboard adjustable');

 await page.goto(base+'previews/GAL-05/?mobile=M-UTIL-04',{waitUntil:'domcontentloaded'});
 await page.locator('.g5-filter-open').click();
 assert(await page.locator('.g5-filter-drawer').evaluate(el=>el.open)
  &&await page.locator('.g5-filter-drawer [data-filter]').count()===3,'M-UTIL-04 opens a native modal filter drawer with actual category buttons');
 await page.locator('.g5-filter-drawer [data-filter="mono"]').click();
 assert(!await page.locator('.g5-filter-drawer').evaluate(el=>el.open)
  &&await page.locator('.g5-grid figure:visible').count()===1
  &&(await page.locator('.g5-filter-open').textContent()).includes('Monochrome'),'M-UTIL-04 applies the selection and closes the drawer');
 await page.locator('.g5-filter-open').click();
 await page.keyboard.press('Escape');
 assert(!await page.locator('.g5-filter-drawer').evaluate(el=>el.open),'M-UTIL-04 Escape closes the modal');
 await page.locator('.g5-filter-open').click();
 await page.locator('.g5-filter-drawer [data-filter="all"]').click();
 assert(await page.locator('.g5-grid figure:visible').count()===4,'M-UTIL-04 returning to All restores every photograph');

 // New phone compositions must be routable and free of horizontal document overflow.
 for(const [parent,altId] of [['NAV-02','M-NAV-05'],['NAV-04','M-NAV-06'],['GAL-06','M-GAL-05'],['FORM-01','M-FRM-04'],['COMP-01','M-UTIL-03'],['GAL-05','M-UTIL-04']]){
  await page.goto(base+'previews/'+parent+'/?mobile='+altId,{waitUntil:'domcontentloaded'});
  assert(await page.locator('body').getAttribute('data-mobile-treatment')===altId,altId+' route activates the intended phone composition');
  const overflow=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));
  assert(overflow.document<=overflow.viewport+2,altId+' has no sideways phone page overflow ('+overflow.document+' / '+overflow.viewport+')');
 }
 // Default previews must not acquire alternate mobile-only furniture.
 await page.goto(base+'previews/NAV-04/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.n4-drawer-backdrop').count()===0,'NAV-04 unchanged default omits off-canvas overlay');
 await page.goto(base+'previews/GAL-05/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.g5-filter-drawer').count()===0&&await page.locator('[data-filter]').count()===3,'GAL-05 standard inline filtering remains intact');
 await page.goto(base+'previews/FORM-01/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#f1-date').count()===0,'FORM-01 default does not show scheduling inputs');


 // Phase 4 next batch: original commerce/booking parents and six truly functional phone alternatives.
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'previews/PROD-01/',{waitUntil:'domcontentloaded'});
 await page.locator('[data-inspect=sand]').click();
 assert(await page.locator('#p1-detail').isVisible()
   &&(await page.locator('[data-detail-name]').textContent()).includes('Sandstone Vessel')
   &&await page.locator('[data-inspect=sand]').getAttribute('aria-pressed')==='true','PROD-01 parent has a functional, accessible product-material inspection');
 await page.locator('[data-detail-close]').click();
 assert(await page.locator('#p1-detail').isHidden()
   &&await page.locator('[data-inspect=sand]').evaluate(el=>el===document.activeElement),'PROD-01 detail close restores keyboard focus to source');
 await page.goto(base+'previews/PRICE-01/',{waitUntil:'domcontentloaded'});
 await page.locator('.price-card').first().locator('summary').click();
 assert(await page.locator('.price-card').first().locator('details').evaluate(el=>el.open),'PRICE-01 original pricing details open natively');
 await page.goto(base+'previews/MENU-01/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.menu-category').count()===3
   &&await page.locator('.menu-dishes article').count()===8,'MENU-01 parent displays the full, explicitly fictional food menu');
 await page.goto(base+'previews/BOOK-01/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#book-service').isVisible()
   &&await page.locator('#book-date').getAttribute('type')==='date'
   &&await page.locator('#book-confirmation').isHidden(),'BOOK-01 parent exposes real native request controls without claiming a booking');
 await page.locator('#book-service').selectOption('Studio introduction');
 await page.locator('#book-date').fill('2028-05-18');
 await page.locator('#book-window').selectOption('Afternoon');
 await page.locator('#book-form [type=submit]').click();
 assert(await page.locator('#book-confirmation').isVisible()
   &&(await page.locator('[data-book-details]').textContent()).includes('NOT submitted or booked'),'BOOK-01 prepares a valid local request with explicit non-booking disclosure');
 await page.locator('[data-book-edit]').click();
 assert(await page.locator('#book-confirmation').isHidden()
   &&await page.locator('#book-service').inputValue()==='Studio introduction','BOOK-01 local request can be edited without losing the form');

 await page.goto(base+'previews/PROD-01/?mobile=M-COM-01',{waitUntil:'domcontentloaded'});
 assert(await page.locator('[data-product-next]').isVisible()
   &&await page.locator('[data-product-previous]').isDisabled()
   &&(await page.locator('[data-product-status]').textContent()).includes('1 of 4'),'M-COM-01 enables a bounded product-rail controller');
 await page.locator('[data-product-next]').click();
 assert((await page.locator('[data-product-status]').textContent()).includes('2 of 4'),'M-COM-01 Next changes the selected object');
 await page.waitForTimeout(710);
 assert(await page.locator('[data-product-track]').evaluate(el=>el.scrollLeft>90),'M-COM-01 genuinely scrolls the horizontal native rail');
 await page.locator('[data-product-track] [data-inspect=oxide]').click();
 assert(await page.locator('[data-detail-name]').textContent()==='Oxide Pitcher','M-COM-01 retains working product inspection within the swipe rail');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('[data-product-next]').click();
 assert((await page.locator('[data-product-status]').textContent()).includes('3 of 4'),'M-COM-01 continues to work without smooth motion');
 await page.emulateMedia({reducedMotion:'no-preference'});

 await page.goto(base+'previews/MENU-01/?mobile=M-COM-03',{waitUntil:'domcontentloaded'});
 const menuPanels=page.locator('.menu-mobile-details');
 assert(await menuPanels.count()===3
   &&await menuPanels.nth(0).evaluate(el=>el.open)
   &&!await menuPanels.nth(1).evaluate(el=>el.open),'M-COM-03 opens the first compact menu category by default');
 await menuPanels.nth(1).locator('summary').click();
 assert(await menuPanels.nth(1).evaluate(el=>el.open)
   &&!await menuPanels.nth(0).evaluate(el=>el.open)
   &&await menuPanels.nth(1).locator('article').count()===3,'M-COM-03 native grouped accordions show the correct dishes');
 await page.keyboard.press('Enter');
 assert(!await menuPanels.nth(1).evaluate(el=>el.open),'M-COM-03 category summary is keyboard operable');

 await page.goto(base+'previews/PRICE-01/?mobile=M-COM-04',{waitUntil:'domcontentloaded'});
 assert(await page.locator('[data-price-tab]').count()===3
   &&await page.locator('.price-card:visible').count()===1
   &&await page.locator('[data-price-tab="1"]').getAttribute('aria-pressed')==='true','M-COM-04 presents one selected sample pricing plan at a time');
 await page.locator('[data-price-tab="2"]').click();
 assert(await page.locator('.price-card[data-plan=extended]').isVisible()
   &&await page.locator('[data-price-tab="2"]').getAttribute('aria-pressed')==='true'
   &&(await page.locator('.price-toggle-status').textContent()).includes('Extended'),'M-COM-04 tier selector changes real content and status');
 await page.locator('.price-card[data-plan=extended] summary').click();
 assert(await page.locator('.price-card[data-plan=extended] details').evaluate(el=>el.open),'M-COM-04 selected plan retains native inclusion details');

 await page.goto(base+'previews/BOOK-01/?mobile=M-FRM-03',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('.book-sticky-action')?.hidden===false);
 assert(await page.locator('.book-sticky-action').isVisible()
   &&await page.locator('.book-sticky-action').evaluate(el=>getComputedStyle(el).position==='fixed'),'M-FRM-03 safe-area action is available near the top of the demo');
 await page.locator('.book-sticky-action button').click();
 assert(await page.locator('#book-confirmation').isHidden()
   &&await page.locator('#book-service').evaluate(el=>!el.validity.valid),'M-FRM-03 incomplete preferences do not create a fake booking');
 await page.locator('#book-service').selectOption('Project discovery');
 await page.locator('#book-date').fill('2028-05-18');
 await page.locator('#book-window').selectOption('Morning');
 await page.evaluate(()=>scrollTo(0,0));
 await page.waitForFunction(()=>document.querySelector('.book-sticky-action')?.hidden===false);
 await page.locator('.book-sticky-action button').click();
 assert(await page.locator('#book-confirmation').isVisible()
   &&(await page.locator('[data-book-details]').textContent()).includes('NOT submitted or booked'),'M-FRM-03 sticky action submits only a local, explicitly unbooked preference');
 await page.waitForFunction(()=>document.querySelector('.book-sticky-action')?.hidden===true);
 assert(await page.locator('.book-sticky-action').isHidden(),'M-FRM-03 hides sticky request action after local summary appears');

 await page.goto(base+'previews/TEST-01/?mobile=M-STORY-02',{waitUntil:'domcontentloaded'});
 assert((await page.locator('[data-story-status]').textContent()).includes('1 of 3')
   &&await page.locator('[data-story-previous]').isDisabled(),'M-STORY-02 starts with one clearly marked fictional testimonial');
 const storyContrast=await page.locator('.t1-testimonial').evaluate(section=>{
  const rgb=value=>value.match(/[\d.]+/g).slice(0,3).map(Number);
  const luminance=value=>rgb(value).map(v=>{const s=v/255;return s<=0.04045?s/12.92:((s+0.055)/1.055)**2.4;}).reduce((n,v,i)=>n+v*[0.2126,0.7152,0.0722][i],0);
  const bg=luminance(getComputedStyle(section).backgroundColor);
  return ['.t1-meta','.t1-demo','.t1-body h2','.t1-body h2 em','.t1-body blockquote p','.t1-credit strong','.t1-credit span','.t1-mobile-controls>span'].map(selector=>{
   const el=section.querySelector(selector);if(!el)return {selector,ratio:0};
   const fg=luminance(getComputedStyle(el).color);
   return {selector,ratio:(Math.max(fg,bg)+0.05)/(Math.min(fg,bg)+0.05)};
  });
 });
 assert(storyContrast.every(x=>x.ratio>=4.5),'M-STORY-02 light mobile treatment keeps quote, metadata, controls and attribution contrast at least 4.5:1 ('+JSON.stringify(storyContrast)+')');
 await page.locator('[data-story-next]').click();
 assert((await page.locator('[data-story-status]').textContent()).includes('2 of 3')
   &&(await page.locator('.t1-body h2').textContent()).includes('Every corner'),'M-STORY-02 manual next genuinely changes the quoted sample');
 const swipe=await page.locator('.t1-body').evaluate(el=>{const t=(x,y)=>new Touch({identifier:6,target:el,clientX:x,clientY:y});
 el.dispatchEvent(new TouchEvent('touchstart',{touches:[t(310,240)],changedTouches:[t(310,240)],bubbles:true}));
 el.dispatchEvent(new TouchEvent('touchend',{touches:[],changedTouches:[t(120,246)],bubbles:true}));
 return document.querySelector('[data-story-status]').textContent});
 assert(swipe.includes('3 of 3')&&await page.locator('[data-story-next]').isDisabled(),'M-STORY-02 touch swipe advances to bounded final sample without autoplay');

 await page.goto(base+'previews/PROC-01/?mobile=M-STORY-03',{waitUntil:'domcontentloaded'});
 assert(await page.locator('[data-mobile-stage]').count()===4
   &&await page.locator('[data-mobile-stage="0"]').getAttribute('aria-current')==='step','M-STORY-03 provides a live four-stage sticky jump index');
 await page.locator('[data-mobile-stage="2"]').click();
 assert(await page.locator('[data-mobile-stage="2"]').getAttribute('aria-current')==='step','M-STORY-03 Build navigation immediately selects the matching step');
 await page.waitForFunction(()=>{const el=document.querySelector('#mobile-stage-3');return el&&el.getBoundingClientRect().top<150},{timeout:4000});
 await page.locator('#mobile-stage-3 details summary').click();
 assert(await page.locator('#mobile-stage-3 details').evaluate(el=>el.open),'M-STORY-03 retains real readable stage details');

 // All new modes are linked from their parent and do not overflow the physical phone viewport.
 for(const [parent,id] of [['PROD-01','M-COM-01'],['MENU-01','M-COM-03'],['PRICE-01','M-COM-04'],['BOOK-01','M-FRM-03'],['TEST-01','M-STORY-02'],['PROC-01','M-STORY-03']]){
  await page.goto(base+'previews/'+parent+'/?mobile='+id,{waitUntil:'domcontentloaded'});
  assert(await page.locator('body').getAttribute('data-mobile-treatment')===id,id+' activated by its exact review route');
  const width=await page.evaluate(()=>({visible:innerWidth,total:document.documentElement.scrollWidth}));
  assert(width.total<=width.visible+2,id+' avoids document-level phone overflow ('+width.total+' / '+width.visible+')');
 }
 // Default mode must preserve the original, non-carousel and non-tabbed content.
 await page.goto(base+'previews/PROD-01/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('[data-product-next]').count()===0,'PROD-01 base retains the default unmodified product grid');
 await page.goto(base+'previews/PRICE-01/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.price-card:visible').count()===3,'PRICE-01 default displays every pricing tier');
 await page.goto(base+'previews/MENU-01/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.menu-mobile-details').count()===0,'MENU-01 default keeps the complete menu visible');


 // Multi-style component selection is intentional: default mobile is always usable; Style 2/3 are distinct alternatives.
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'review.html?id=NAV-04',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#review-highlight')?.disabled===false);
 const choices=page.locator('#review-mobile-choices input[name=mobile]');
 assert(await choices.count()===3,'NAV-04 exposes its default mobile layout and two independently selectable alternative styles');
 assert((await page.locator('#review-mobile-choices').textContent()).includes('Style 3'),'NAV-04 review shows a visible third phone style');
 await page.locator('input[name=mobile][value=M-NAV-02]').check({force:true});
 await page.waitForFunction(()=>document.querySelector('#review-iframe')?.contentDocument?.body?.dataset?.mobileTreatment==='M-NAV-02');
 assert((await page.locator('#review-iframe').getAttribute('src')).includes('M-NAV-02'),'Review selector loads the exact inquiry-layout variant');
 await page.locator('input[name=mobile][value=M-NAV-06]').check({force:true});
 await page.waitForFunction(()=>document.querySelector('#review-iframe')?.contentDocument?.body?.dataset?.mobileTreatment==='M-NAV-06');
 assert((await page.locator('#review-iframe').getAttribute('src')).includes('M-NAV-06'),'Review selector switches directly from one optional mobile style to another');
 await page.locator('input[name=device][value=tablet]').check({force:true});
 assert(await page.locator('#review-mobile-choices').isHidden()
  &&!(await page.locator('#review-iframe').getAttribute('src')).includes('?mobile='),'Tablet mode uses baseline responsiveness without adding phone variants');
 await page.locator('input[name=device][value=phone]').check({force:true});
 assert((await page.locator('#review-iframe').getAttribute('src')).includes('M-NAV-06'),'Return to phone restores chosen phone style');
 await page.goto(base+'review.html?id=PROD-01',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#review-highlight')?.disabled===false);
 assert(await page.locator('input[name=mobile]').count()===3,'PROD-01 shows default merchandise grid, swipe rail and compact adaptive grid');
 await page.goto(base+'review.html?id=GAL-02',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#review-highlight')?.disabled===false);
 assert(await page.locator('input[name=mobile]').count()===3,'GAL-02 exposes default grid, swipe rail and compact mosaic as three separate choices');

 await page.goto(base+'previews/NAV-04/?mobile=M-NAV-02',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.n4-phone-inquiry').isVisible()
  &&await page.locator('#n4-toggle').isVisible(),'M-NAV-02 displays a persistent enquiry action beside the original menu button');
 await page.locator('.n4-phone-inquiry').click();
 assert(await page.evaluate(()=>location.hash)==='#contact','M-NAV-02 enquiry link reaches a real section');
 await page.locator('#n4-toggle').click();
 assert(await page.locator('#n4-toggle').getAttribute('aria-expanded')==='true'
  &&await page.locator('#n4-links').isVisible(),'M-NAV-02 retains working original dropdown navigation');
 await page.keyboard.press('Escape');
 assert(await page.locator('#n4-toggle').getAttribute('aria-expanded')==='false','M-NAV-02 menu closes via Escape');

 await page.goto(base+'previews/GAL-02/?mobile=M-GAL-04',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.g2-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length===2)
  &&await page.locator('.g2-photo').first().evaluate(el=>getComputedStyle(el).gridColumnEnd==='-1'),'M-GAL-04 leads with a full-width editorial photograph then a compact mosaic');
 await page.locator('.g2-tabs [data-filter=mono]').click();
 assert(await page.locator('.g2-photo:visible').count()===2
  &&(await page.locator('.g2-count').textContent()).includes('2 images'),'M-GAL-04 preserves live photo filtering');
 await page.locator('.g2-photo:visible').first().click();
 assert(await page.locator('.g2-dialog').isVisible(),'M-GAL-04 preserves the keyboard-accessible full-size photo viewer');
 await page.keyboard.press('Escape');
 assert(await page.locator('.g2-dialog').isHidden(),'M-GAL-04 Escape closes original lightbox');

 await page.goto(base+'previews/PROD-01/?mobile=M-COM-02',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.p1-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length===2)
  &&await page.locator('.p1-item').first().evaluate(el=>getComputedStyle(el).gridColumnEnd==='-1'),'M-COM-02 features the first object above a two-column phone merchandise layout');
 assert(await page.locator('.p1-mobile-nav').count()===0,'M-COM-02 is a true grid alternative, not the existing swipe rail');
 await page.locator('[data-inspect=chalk]').click();
 assert(await page.locator('#p1-detail').isVisible()
  &&(await page.locator('[data-detail-name]').textContent())==='Chalk Bowl','M-COM-02 preserves usable, accurate object details');

 await page.goto(base+'previews/HERO-05/?mobile=M-HERO-05',{waitUntil:'domcontentloaded'});
 assert(await page.locator('[data-hero-dot]').count()===3
  &&await page.locator('[data-hero-dot="0"]').getAttribute('aria-pressed')==='true','M-HERO-05 exposes three labelled image selectors');
 await page.locator('[data-hero-dot="1"]').click();
 assert((await page.locator('#h5-count').textContent()).includes('02 / 03')
  &&await page.locator('[data-hero-dot="1"]').getAttribute('aria-pressed')==='true','M-HERO-05 direct dot selection updates actual slide and selected state');
 const swipeHero=await page.locator('.h5-visual').evaluate(el=>{
 const touch=(x,y)=>new Touch({identifier:3,target:el,clientX:x,clientY:y});
 el.dispatchEvent(new TouchEvent('touchstart',{touches:[touch(320,200)],changedTouches:[touch(320,200)],bubbles:true}));
 el.dispatchEvent(new TouchEvent('touchend',{touches:[],changedTouches:[touch(80,209)],bubbles:true}));
 return document.querySelector('#h5-count').textContent;
 });
 assert(swipeHero.includes('03 / 03'),'M-HERO-05 swipe moves to the next photo and updates the caption');
 await page.locator('#h5-prev').click();
 assert((await page.locator('#h5-count').textContent()).includes('02 / 03'),'M-HERO-05 preserves original previous/next keyboard controls');

 await page.goto(base+'previews/ABOUT-01/?mobile=M-STORY-01',{waitUntil:'domcontentloaded'});
 const ordering=await page.locator('.ab-scene').evaluate(el=>{const a=el.querySelector('.ab-portrait').getBoundingClientRect(),b=el.querySelector('.ab-copy').getBoundingClientRect();return {portraitFirst:b.top>=a.bottom-2,caption:el.querySelector('.ab-portrait span')?.textContent}});
 assert(ordering.portraitFirst&&ordering.caption.includes('NOT THE FOUNDER'),'M-STORY-01 displays a photo-first composition with transparent sample-photo labeling');
 assert(await page.locator('.ab-copy blockquote').isVisible(),'M-STORY-01 retains visible founder-introduction copy');

 await page.goto(base+'previews/CTA-03/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.c3-action').textContent()==='Start a conversation'
  &&await page.locator('.c3-action b').count()===0,'CTA-03 has the requested arrow glyph removed without breaking its action');
 await page.locator('.c3-action').click();
 assert(await page.evaluate(()=>location.hash)==='#brief','CTA-03 text-only call to action still navigates to its section');

 for(const [parent,id] of [['NAV-04','M-NAV-02'],['GAL-02','M-GAL-04'],['PROD-01','M-COM-02'],['HERO-05','M-HERO-05'],['ABOUT-01','M-STORY-01']]){
  await page.goto(base+'previews/'+parent+'/?mobile='+id,{waitUntil:'domcontentloaded'});
  assert(await page.locator('body').getAttribute('data-mobile-treatment')===id,id+' activates on its original working parent specimen');
  const width=await page.evaluate(()=>({screen:innerWidth,page:document.documentElement.scrollWidth}));
  assert(width.page<=width.screen+2,id+' has no page-level horizontal overflow at 390px ('+width.page+'/'+width.screen+')');
 }


 // Seven additional optional phone compositions must alter real structure or retain functional controls.
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'previews/HERO-01/?mobile=M-HERO-01',{waitUntil:'domcontentloaded'});
 assert(await page.locator('body').getAttribute('data-mobile-treatment')==='M-HERO-01','M-HERO-01 is recognized by the original lodge hero');
 const h1Mobile=await page.locator('.h1-copy a').evaluate(el=>({w:el.getBoundingClientRect().width,href:el.getAttribute('href')}));
 assert(h1Mobile.w>310&&h1Mobile.href==='#cabins','M-HERO-01 provides a real, full-width in-image CTA');

 await page.goto(base+'previews/GAL-03/?mobile=M-GAL-01',{waitUntil:'domcontentloaded'});
 const g1Composition=await page.locator('.g3-chapter').first().evaluate(el=>{
   const image=el.querySelector('.g3-image').getBoundingClientRect();
   const caption=el.querySelector('figcaption').getBoundingClientRect();
   return {absolute:getComputedStyle(el.querySelector('figcaption')).position==='absolute',top:caption.top,bottom:caption.bottom,imageBottom:image.bottom};
 });
 assert(g1Composition.absolute&&g1Composition.top<g1Composition.imageBottom-40&&g1Composition.bottom<=g1Composition.imageBottom+2,'M-GAL-01 captions are visibly integrated into edge-to-edge photo chapters');

 await page.goto(base+'previews/SRV-03/?mobile=M-SRV-01',{waitUntil:'domcontentloaded'});
 const srvPhotoCard=await page.locator('.s3-row').first().evaluate(el=>{
  const image=el.querySelector('.s3-media').getBoundingClientRect(),card=el.querySelector('.s3-detail').getBoundingClientRect();
  return {overlaps:card.top<image.bottom-30&&card.top>image.top,details:!!card.height};
 });
 assert(srvPhotoCard.overlaps&&srvPhotoCard.details&&await page.locator('.s3-row details').count()===3,'M-SRV-01 uses real overlapping image-story cards with intact service details');

 await page.goto(base+'previews/CTA-02/?mobile=M-CTA-02',{waitUntil:'domcontentloaded'});
 const ctaInline=await page.locator('.c2-scene').evaluate(el=>{
  const image=el.querySelector('img').getBoundingClientRect(),panel=el.querySelector('.c2-text').getBoundingClientRect(),button=el.querySelector('.c2-cta');
  return {stacked:panel.top>=image.bottom-3,width:button.getBoundingClientRect().width,href:button.getAttribute('href')};
 });
 assert(ctaInline.stacked&&ctaInline.width>310&&ctaInline.href==='#stays','M-CTA-02 places a real full-width action in its own text panel');

 await page.goto(base+'previews/FOOT-02/?mobile=M-CTA-04',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.f2-group').first().evaluate(el=>el.open)
  &&!await page.locator('.f2-group').nth(1).evaluate(el=>el.open),'M-CTA-04 starts with one compact native disclosure expanded');
 await page.locator('.f2-group').nth(1).locator('summary').click();
 await page.waitForFunction(()=>document.querySelectorAll('.f2-group')[1].open&&!document.querySelectorAll('.f2-group')[0].open);
 assert(await page.locator('.f2-group').nth(1).locator('nav a').count()===2,'M-CTA-04 retains actual contact links and allows one open group at a time');

 await page.goto(base+'previews/GAL-05/?mobile=M-UTIL-01',{waitUntil:'domcontentloaded'});
 const rail=await page.locator('.g5-filters').evaluate(el=>({scroll:el.scrollWidth,client:el.clientWidth}));
 assert(rail.scroll>rail.client+50,'M-UTIL-01 has a genuinely horizontally scrollable filter rail');
 await page.locator('[data-filter=mono]').click();
 assert(await page.locator('[data-category]:visible').count()===1
  &&await page.locator('[data-filter=mono]').getAttribute('aria-pressed')==='true','M-UTIL-01 scroll rail retains real category filtering');

 await page.goto(base+'previews/PRJ-03/?mobile=M-UTIL-05',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.p3-back-top').isHidden(),'M-UTIL-05 does not obscure the first screen');
 await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
 await page.waitForFunction(()=>document.querySelector('.p3-back-top')?.hidden===false);
 assert(await page.locator('.p3-back-top').isVisible(),'M-UTIL-05 appears only once the project index has been scrolled');
 await page.locator('.p3-back-top').click();
 assert(await page.evaluate(()=>location.hash)==='#projects-showcase','M-UTIL-05 returns to the real project index anchor');

 for(const [parent,phoneId] of [
  ['HERO-01','M-HERO-01'],['GAL-03','M-GAL-01'],['SRV-03','M-SRV-01'],
  ['CTA-02','M-CTA-02'],['FOOT-02','M-CTA-04'],['GAL-05','M-UTIL-01'],['PRJ-03','M-UTIL-05']
 ]){
  await page.goto(base+'previews/'+parent+'/?mobile='+phoneId,{waitUntil:'domcontentloaded'});
  const state=await page.evaluate(()=>({active:document.body.dataset.mobileTreatment,screen:innerWidth,width:document.documentElement.scrollWidth}));
  assert(state.active===phoneId&&state.width<=state.screen+2,phoneId+' is active and has no page-wide horizontal overflow');
 }


 // Final phone-design batch: these are real renderings or interactions, never metadata-only choices.
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'previews/NAV-02/?mobile=M-NAV-03',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.v-bottom-rail').isVisible()
  &&await page.locator('.v-bottom-rail a[href="#contact"]').count()===1
  &&await page.locator('.v-mobile').isHidden(),'M-NAV-03 is a real accessible bottom-nav alternative, not the old mobile menu');
 assert(await page.locator('.v-bottom-rail a').count()===3
  &&await page.locator('.v-bottom-rail a[aria-current="location"]').count()===1,'M-NAV-03 has three real destinations and one active location');

 await page.goto(base+'previews/HERO-04/?mobile=M-HERO-04',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.h4-mobile-caption').isVisible()
  &&await page.locator('.h4-bottom figure').evaluate(el=>el.getBoundingClientRect().width>250),'M-HERO-04 uses a large offset portrait with an accurate stock photo caption');

 await page.goto(base+'previews/SRV-01/?mobile=M-SRV-04',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.srv-feature').isVisible()
  &&await page.locator('.srv-row').count()===3
  &&await page.locator('.srv-feature figcaption').textContent()!=='','M-SRV-04 includes a real illustrative photo feature and all three service descriptions');

 await page.goto(base+'previews/FORM-01/?mobile=M-FRM-01',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#f1-name').getAttribute('autocomplete')==='name'
  &&await page.locator('#f1-email').getAttribute('type')==='email','M-FRM-01 maintains labeled native input types');
 await page.locator('#f1-form button[type=submit]').click();
 assert(await page.locator('#f1-name').getAttribute('aria-invalid')==='true'
  &&await page.locator('#f1-preview').isHidden(),'M-FRM-01 retains required-field validation instead of falsely sending an empty form');
 await page.locator('#f1-name').fill('Illustrative Client');
 await page.locator('#f1-email').fill('example@example.com');
 await page.locator('#f1-message').fill('Sample local inquiry only.');
 await page.locator('#f1-form button[type=submit]').click();
 assert(await page.locator('#f1-preview').isVisible()
  &&(await page.locator('#f1-output').textContent()).includes('Sample local inquiry only.'),'M-FRM-01 creates the same local-only honest inquiry summary');

 await page.goto(base+'previews/TRUST-02/?mobile=M-STORY-04',{waitUntil:'domcontentloaded'});
 const trustGrid=await page.locator('.t2-strip').evaluate(el=>{const items=[...el.querySelectorAll('li')].map(x=>x.getBoundingClientRect());return {length:items.length,firstTop:items[0].top,secondTop:items[1].top,thirdTop:items[2].top}});
 assert(trustGrid.length===4&&Math.abs(trustGrid.firstTop-trustGrid.secondTop)<4
  &&trustGrid.thirdTop>trustGrid.firstTop+60
  &&(await page.locator('.t2-footnote').textContent()).includes('genuine credentials'),'M-STORY-04 wraps explicitly fictional credential badges in two phone columns');

 await page.goto(base+'previews/CONTACT-01/?mobile=M-CTA-03',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.ct-quick a').count()===2
  &&await page.locator('.ct-quick a[href="tel:+14165550118"]').isVisible()
  &&await page.locator('.ct-quick a[href="mailto:hello@example.com"]').isVisible()
  &&(await page.locator('.ct-quick-caption').textContent()).includes('FICTIONAL'),'M-CTA-03 shows real contact URL schemes but never implies a live business number');

 await page.goto(base+'previews/GAL-06/?mobile=M-UTIL-02',{waitUntil:'domcontentloaded'});
 await page.locator('[data-photo="1"]').click();
 assert(await page.locator('#g6-dialog').evaluate(el=>el.open)
  &&await page.locator('.g6-detail-copy').isVisible()
  &&(await page.locator('.g6-detail-copy p').first().textContent()).includes('Editorial portrait'),'M-UTIL-02 opens a real full-height native information sheet');
 await page.locator('#g6-next').click();
 await page.waitForFunction(()=>document.querySelector('.g6-detail-copy h2')?.textContent==='Study 03');
 assert((await page.locator('#g6-position').textContent()).includes('03 / 04'),'M-UTIL-02 sheet updates description with original gallery navigation');
 await page.keyboard.press('Escape');
 await page.waitForFunction(()=>!document.querySelector('#g6-dialog').open
  &&document.activeElement===document.querySelector('[data-photo="1"]'));
 assert(await page.locator('#g6-dialog').isHidden(),'M-UTIL-02 Escape closes the native sheet and restores gallery focus');

 await page.goto(base+'previews/MEDIA-01/?mobile=M-MEDIA-01',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#m1-activate').isVisible()
  &&await page.locator('#m1-video').getAttribute('src')===null
  &&(await page.locator('#m1-status').textContent()).includes('Poster-first'),'M-MEDIA-01 keeps the video network request behind explicit user action');
 await page.locator('#m1-activate').click();
 assert((await page.locator('#m1-video').getAttribute('src')).includes('videos.pexels.com'),'M-MEDIA-01 loads the actual declared sample video only after play was requested');

 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(base+'previews/MEDIA-01/?mobile=M-MEDIA-02',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#m1-video').getAttribute('src')===null
  &&(await page.locator('#m1-status').textContent()).includes('Reduced motion'),'M-MEDIA-02 stays on the image poster when reduced motion is enabled');
 await page.emulateMedia({reducedMotion:'no-preference'});

 await page.goto(base+'previews/MEDIA-01/?mobile=M-MEDIA-03',{waitUntil:'domcontentloaded'});
 const portraitFilm=await page.locator('#m1-stage').evaluate(el=>{const r=el.getBoundingClientRect();return {height:r.height,width:r.width}});
 assert(portraitFilm.height>portraitFilm.width*1.2
  &&await page.locator('#m1-video').getAttribute('src')===null,'M-MEDIA-03 truly art-directs a portrait crop of a wide video without autoplay');

 for(const [parent,mode] of [
  ['NAV-02','M-NAV-03'],['HERO-04','M-HERO-04'],['SRV-01','M-SRV-04'],
  ['FORM-01','M-FRM-01'],['TRUST-02','M-STORY-04'],['CONTACT-01','M-CTA-03'],
  ['GAL-06','M-UTIL-02'],['MEDIA-01','M-MEDIA-01'],['MEDIA-01','M-MEDIA-02'],['MEDIA-01','M-MEDIA-03']
 ]){
  await page.goto(base+'previews/'+parent+'/?mobile='+mode,{waitUntil:'domcontentloaded'});
  const dimensions=await page.evaluate(()=>({mode:document.body.dataset.mobileTreatment,inner:innerWidth,document:document.documentElement.scrollWidth}));
  assert(dimensions.mode===mode&&dimensions.document<=dimensions.inner+2,mode+' is linked to its real parent without phone horizontal overflow');
 }


 // Seven distinct core catalogue families: actual previews, demo honesty and native interactions.
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'previews/TEAM-01/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.t1-person').count()===3
  &&await page.locator('.t1-person figcaption').count()===3
  &&(await page.locator('.t1-person figcaption').first().textContent()).includes('NOT STAFF'),
  'TEAM-01 has three real portrait images labeled as unrelated stock, not fictional employees');
 assert(await page.locator('.t1-person').first().evaluate(el=>getComputedStyle(el).display==='grid'),
  'TEAM-01 retains a deliberately featured first staff-role composition on phone');

 await page.goto(base+'previews/TEAM-02/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.t2-photo-note').isVisible()
  &&(await page.locator('.t2-photo-note').textContent()).includes('NOT THE FOUNDER')
  &&await page.locator('.t2-link').getAttribute('href')==='#philosophy',
  'TEAM-02 is a distinct founder-first composition without pretending the portrait is the real owner');

 await page.goto(base+'previews/TRUST-01/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.mark-list li').count()===5
  &&await page.locator('.mark-list small').count()===5
  &&(await page.locator('.mark-proofline').textContent()).includes('No implied client endorsements'),
  'TRUST-01 shows five fictional-only text marks and plainly denies real endorsements');

 await page.goto(base+'previews/TRUST-03/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.press-entry').count()===3
  &&(await page.locator('.press-footnote').textContent()).includes('No real publication'),
  'TRUST-03 press and awards examples are explicitly fictional');
 await page.locator('.press-entry').first().locator('summary').click();
 assert(await page.locator('.press-entry').first().evaluate(el=>el.open)
  &&await page.locator('.press-entry .press-body').first().isVisible(),
  'TRUST-03 native disclosure opens to explain evidence requirements');
 await page.locator('.press-entry').first().locator('summary').focus();
 await page.keyboard.press('Enter');
 assert(!await page.locator('.press-entry').first().evaluate(el=>el.open),
  'TRUST-03 keyboard Enter closes the same native disclosure');

 await page.goto(base+'previews/ABOUT-02/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.w-about img').count()===2
  &&await page.locator('.w-studies figcaption').isVisible()
  &&await page.locator('.w-method details').count()===2,
  'ABOUT-02 includes two genuine workshop image slots, credits and native method descriptions');
 await page.locator('.w-method details').first().locator('summary').click();
 assert(await page.locator('.w-method details').first().evaluate(el=>el.open),
  'ABOUT-02 process details open on demand without a fake interaction');

 await page.goto(base+'previews/CONTACT-02/',{waitUntil:'domcontentloaded'});
 assert((await page.locator('.c2-map').getAttribute('aria-label')).includes('not a geographic map')
  &&(await page.locator('.c2-location').textContent()).includes('NOT NAVIGABLE')
  &&await page.locator('a[href="../../review.html?id=FORM-01"]').count()===1,
  'CONTACT-02 never presents a fabricated address or abstract sketch as a live map');
 await page.locator('.c2-details details').first().locator('summary').click();
 assert(await page.locator('.c2-details details').first().evaluate(el=>el.open),
  'CONTACT-02 gives real accessible arrival-information disclosures');

 await page.goto(base+'previews/MEDIA-02/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#r-toggle').isVisible()
  &&await page.locator('#r-video').getAttribute('src')===null
  &&(await page.locator('#r-status').textContent()).includes('not loaded'),
  'MEDIA-02 loads no video until explicitly activated by the viewer');
 await page.locator('#r-toggle').click();
 assert((await page.locator('#r-video').getAttribute('src')).includes('videos.pexels.com'),
  'MEDIA-02 requests the declared sample video only after a real click');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(base+'previews/MEDIA-02/',{waitUntil:'domcontentloaded'});
 await page.locator('#r-toggle').click();
 assert(await page.locator('#r-video').getAttribute('src')===null
  &&(await page.locator('#r-status').textContent()).includes('Reduced motion'),
  'MEDIA-02 reduced-motion mode stays on the poster without starting video traffic');
 await page.emulateMedia({reducedMotion:'no-preference'});

 // Keep 320px as a separately checked composition, not just a scaled 390px screenshot.
 for(const id of ['TEAM-01','TEAM-02','TRUST-01','TRUST-03','ABOUT-02','CONTACT-02','MEDIA-02']){
  await page.setViewportSize({width:320,height:790});
  await page.goto(base+'previews/'+id+'/',{waitUntil:'domcontentloaded'});
  const viewport=await page.evaluate(()=>({width:innerWidth,body:document.documentElement.scrollWidth}));
  assert(viewport.body<=viewport.width+2,id+' core example avoids horizontal overflow at 320px ('+viewport.body+'/'+viewport.width+')');
 }
 await page.setViewportSize({width:390,height:844});


 // Seven more fully registered core components — interactions, fictional disclosures and mobile geometry.
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'previews/TEAM-03/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.a-card').count()===3
  &&await page.locator('.a-art-label').count()===3
  &&(await page.locator('.a-disclaimer').textContent()).includes('placeholders'),'TEAM-03 provides three clearly fictional artist panels, not invented authentic portfolios');
 await page.locator('[data-artist="Artist B"]').click();
 assert(await page.locator('[data-artist="Artist B"]').getAttribute('aria-pressed')==='true'
  &&(await page.locator('#a-selection').textContent()).includes('Artist B'),'TEAM-03 artist selection updates an actual accessible preference');
 await page.locator('#a-idea').fill('Geometric motif for a local-only demo.');
 await page.locator('#a-form button[type=submit]').click();
 assert(await page.locator('#a-note').isVisible()
  &&(await page.locator('#a-output').inputValue()).includes('Artist B')
  &&(await page.locator('#a-output').inputValue()).includes('NOT SENT'),'TEAM-03 generates a candid local-only note without booking or sending');

 await page.goto(base+'previews/TEAM-04/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.r4-person').count()===4
  &&(await page.locator('.r4-disclaimer').textContent()).includes('not a real employee'),'TEAM-04 is a full fictional team directory, not a headshot placeholder');
 await page.locator('.r4-filters button[data-filter=technical]').click();
 assert(await page.locator('.r4-person:visible').count()===1
  &&await page.locator('.r4-filters button[data-filter=technical]').getAttribute('aria-pressed')==='true'
  &&(await page.locator('#r4-count').textContent()).includes('1 fictional role'),'TEAM-04 filter actually narrows the directory and reports the correct count');
 await page.locator('.r4-person:visible summary').click();
 assert(await page.locator('.r4-person:visible').evaluate(el=>el.open),'TEAM-04 filtered profile opens through native details');
 await page.locator('.r4-filters button[data-filter=all]').click();
 assert(await page.locator('.r4-person:visible').count()===4,'TEAM-04 restores the full team without stale hidden rows');

 await page.goto(base+'previews/TRUST-04/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('[data-metric=projects]').textContent()==='12'
  &&(await page.locator('.s-disclaimer').textContent()).includes('No real records'),'TRUST-04 initializes wholly simulated metrics with candid sourcing disclaimer');
 await page.locator('[data-period=quarter]').click();
 assert(await page.locator('[data-metric=projects]').textContent()==='37'
  &&await page.locator('[data-metric=timely]').textContent()==='88%'
  &&await page.locator('[data-period=quarter]').getAttribute('aria-pressed')==='true','TRUST-04 quarter switch changes real rendered figures and accessible selection');
 await page.locator('.s-cards details').first().locator('summary').click();
 assert(await page.locator('.s-cards details').first().evaluate(el=>el.open),'TRUST-04 expands a native metric-definition disclosure');

 await page.goto(base+'previews/ABOUT-03/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.v-card').count()===3
  &&await page.locator('.v-card img').count()===3
  &&await page.locator('.v-card figcaption').count()===3
  &&(await page.locator('.v-disclosure').textContent()).includes('separate sources'),'ABOUT-03 shows three separately captioned unrelated real image references, not one fabricated venue');

 await page.goto(base+'previews/ABOUT-04/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.m-aside figcaption').isVisible()
  &&(await page.locator('.m-aside figcaption').textContent()).includes('NOT THE ACTUAL FOUNDER')
  &&await page.locator('.m-rows article').count()===3
  &&await page.locator('.m-title a').getAttribute('href')==='#commitments','ABOUT-04 contains mission, genuine anchor, labeled unrelated portrait and three actual commitments');

 await page.goto(base+'previews/MEDIA-03/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.v3-thumb').count()===3
  &&await page.locator('#v3-video').getAttribute('src')===null
  &&(await page.locator('.v3-legal').textContent()).includes('single Pexels demonstration video'),'MEDIA-03 is a three-card video interface with an honest single-source warning and no preloaded film');
 await page.locator('[data-cut="1"]').click();
 assert(await page.locator('#v3-dialog').evaluate(el=>el.open)
  &&(await page.locator('#v3-dialog-title').textContent())==='Middle study'
  &&(await page.locator('#v3-video').getAttribute('src')).includes('videos.pexels.com'),'MEDIA-03 opens a native modal and requests the one real sample film only after user activation');
 await page.keyboard.press('Escape');
 await page.waitForFunction(()=>!document.querySelector('#v3-dialog').open
  &&document.activeElement===document.querySelector('[data-cut="1"]'));
 assert(await page.locator('#v3-dialog').isHidden(),'MEDIA-03 supports Escape to close and returns focus to the selected thumbnail');

 await page.goto(base+'previews/MEDIA-04/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.p4-frame:visible').count()===1
  &&await page.locator('#p4-count').textContent()==='01 / 03'
  &&await page.locator('#p4-prev').isDisabled(),'MEDIA-04 begins with one real photo chapter and appropriately bounded navigation');
 await page.locator('[data-story-tab="2"]').click();
 assert(await page.locator('.p4-frame[data-frame="2"]').isVisible()
  &&await page.locator('.p4-frame[data-frame="0"]').isHidden()
  &&await page.locator('[data-story-tab="2"]').getAttribute('aria-pressed')==='true'
  &&(await page.locator('#p4-heading').textContent())==='Gather in good company.','MEDIA-04 changes image, headline and pressed state together');
 await page.locator('#p4-prev').click();
 assert(await page.locator('#p4-count').textContent()==='02 / 03','MEDIA-04 Previous button truly navigates to the preceding chapter');

 for(const id of ['TEAM-03','TEAM-04','TRUST-04','ABOUT-03','ABOUT-04','MEDIA-03','MEDIA-04']){
  await page.setViewportSize({width:320,height:790});
  await page.goto(base+'previews/'+id+'/',{waitUntil:'domcontentloaded'});
  const widths=await page.evaluate(()=>({screen:innerWidth,document:document.documentElement.scrollWidth}));
  assert(widths.document<=widths.screen+2,id+' avoids horizontal page overflow at 320px ('+widths.document+'/'+widths.screen+')');
 }
 await page.setViewportSize({width:390,height:844});


 // Eight additional source-built business and conversion specimens: real behavior, honest demo boundaries.
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'previews/LOC-01/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.l1-hours dl>div').count()===7
  &&(await page.locator('.l1-address').textContent()).includes('DEMO ADDRESS')
  &&(await page.locator('.l1-hours-heading').textContent()).includes('Not live hours'),'LOC-01 displays a fictional, explicitly non-live seven-day schedule');
 await page.locator('.l1-questions details').first().locator('summary').click();
 assert(await page.locator('.l1-questions details').first().evaluate(el=>el.open),'LOC-01 arrival details genuinely expand with native elements');

 await page.goto(base+'previews/LOC-02/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('[data-zone=central]').getAttribute('aria-pressed')==='true'
  &&(await page.locator('.l2-diagram').getAttribute('aria-label')).includes('not a geographic map'),'LOC-02 begins with a single selected zone and discloses non-geographic diagram');
 await page.locator('[data-zone=west]').click();
 assert(await page.locator('[data-zone=west]').getAttribute('aria-pressed')==='true'
  &&await page.locator('.l2-tile[data-zone-tile=west]').evaluate(el=>el.classList.contains('is-selected'))
  &&(await page.locator('#l2-selection').textContent())==='Western sample zone','LOC-02 actual selection updates both its map-like illustration and content');

 await page.goto(base+'previews/CAREER-01/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.c1-job').count()===3
  &&(await page.locator('.c1-disclaimer').textContent()).includes('sample data'),'CAREER-01 has three expandable fictional job rows, no false vacancies');
 await page.locator('[data-role-filter=office]').click();
 assert(await page.locator('.c1-job:visible').count()===1
  &&(await page.locator('#c1-status').textContent()).includes('1 fictional role'),'CAREER-01 department filter updates the actual visible job list');
 await page.locator('.c1-job:visible summary').click();
 await page.locator('.c1-job:visible [data-select-job]').click();
 assert((await page.locator('#c1-selected').textContent()).includes('Project administrator')
  &&(await page.locator('#c1-selected').textContent()).includes('not an application'),'CAREER-01 example selection never claims to apply');

 await page.goto(base+'previews/CAREER-03/',{waitUntil:'domcontentloaded'});
 await page.locator('#a3-form button[type=submit]').click();
 assert((await page.locator('#a3-name-error').textContent()).includes('required')
  &&await page.locator('#a3-summary').isHidden(),'CAREER-03 blank fields produce visible validation without generating an application');
 await page.locator('#a3-name').fill('Sample Candidate');
 await page.locator('#a3-email').fill('sample@example.com');
 await page.locator('#a3-role').selectOption({label:'Design'});
 await page.locator('#a3-message').fill('Example interest in a design role.');
 await page.locator('#a3-form button[type=submit]').click();
 assert(await page.locator('#a3-summary').isVisible()
  &&(await page.locator('#a3-output').textContent()).includes('NOT SENT')
  &&(await page.locator('#a3-output').textContent()).includes('Design'),'CAREER-03 validates and creates only a candid locally prepared draft');

 await page.goto(base+'previews/NEWS-01/',{waitUntil:'domcontentloaded'});
 await page.locator('#n1-email').fill('person@example.com');
 await page.locator('#n1-form button[type=submit]').click();
 assert(await page.locator('#n1-result').isHidden()
  &&(await page.locator('#n1-consent-error').textContent()).includes('acknowledge'),'NEWS-01 does not accept email without explicit sample consent');
 await page.locator('#n1-consent').check();
 await page.locator('#n1-form button[type=submit]').click();
 assert(await page.locator('#n1-result').isVisible()
  &&(await page.locator('#n1-result-copy').textContent()).includes('not added to a list'),'NEWS-01 produces honest non-subscription status after validation');
 await page.locator('#n1-reset').click();
 assert(await page.locator('#n1-result').isHidden()&&!await page.locator('#n1-consent').isChecked(),'NEWS-01 reset clears local demo state');

 await page.goto(base+'previews/NEWS-02/',{waitUntil:'domcontentloaded'});
 assert((await page.locator('.n2-credit').textContent()).includes('NOT STUDIO WORK')
  &&await page.locator('#n2-form [name=topic]:checked').count()===1,'NEWS-02 has attributed stock and an initialized topical preference');
 await page.locator('#n2-email').fill('reader@example.com');
 await page.locator('#n2-form button[type=submit]').click();
 assert(await page.locator('#n2-result').isHidden()
  &&(await page.locator('#n2-consent-error').textContent()).includes('non-sending'),'NEWS-02 requires sample consent before showing any preferences');
 await page.locator('[name=topic][value=Materials]').check();
 await page.locator('#n2-frequency').selectOption('Quarterly');
 await page.locator('#n2-consent').check();
 await page.locator('#n2-form button[type=submit]').click();
 assert(await page.locator('#n2-result').isVisible()
  &&(await page.locator('#n2-output').textContent()).includes('Materials')
  &&(await page.locator('#n2-output').textContent()).includes('Quarterly'),'NEWS-02 creates a truthful local-only topic and cadence preview');

 await page.goto(base+'previews/UI-01/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.u1-item:visible').count()===6,'UI-01 has six actual native FAQ rows');
 await page.locator('#u1-query').fill('permits');
 assert(await page.locator('.u1-item:visible').count()===1
  &&(await page.locator('#u1-status').textContent()).includes('1 matching'),'UI-01 actual search filters FAQ content and announces count');
 await page.locator('#u1-query').fill('no-matching-pretend-phrase');
 assert(await page.locator('#u1-empty').isVisible()&&await page.locator('.u1-item:visible').count()===0,'UI-01 shows a useful real no-results state');
 await page.locator('#u1-reset').click();
 assert(await page.locator('.u1-item:visible').count()===6,'UI-01 restores the real FAQ list via clear control');

 await page.goto(base+'previews/FORM-03/',{waitUntil:'domcontentloaded'});
 await page.locator('[data-next="1"]').click();
 assert(await page.locator('.f3-stage[data-step="1"]').isVisible()
  &&(await page.locator('#f3-step1-error').textContent()).includes('Choose'),'FORM-03 does not advance before the first required project choice');
 await page.locator('[name=project][value="Bathroom renovation"]').check();
 await page.locator('[data-next="1"]').click();
 assert(await page.locator('.f3-stage[data-step="2"]').isVisible()
  &&await page.locator('[data-progress="2"]').getAttribute('aria-current')==='step','FORM-03 truly advances to scope after selecting a project');
 await page.locator('#f3-budget').selectOption({label:'$30,000–$75,000 (example)'});
 await page.locator('#f3-timeline').selectOption({label:'6–12 months'});
 await page.locator('[data-next="2"]').click();
 assert(await page.locator('.f3-stage[data-step="3"]').isVisible(),'FORM-03 advances to contact only with sample budget and timing filled');
 await page.locator('[data-back="3"]').click();
 assert(await page.locator('#f3-budget').inputValue()!==''
  &&await page.locator('.f3-stage[data-step="2"]').isVisible(),'FORM-03 back navigation preserves prior answers');
 await page.locator('[data-next="2"]').click();
 await page.locator('#f3-name').fill('Example Project');
 await page.locator('#f3-email').fill('example@example.com');
 await page.locator('#f3-form button[type=submit]').click();
 assert(await page.locator('#f3-result').isVisible()
  &&(await page.locator('#f3-output').textContent()).includes('Bathroom renovation')
  &&(await page.locator('#f3-output').textContent()).includes('NOT SENT'),'FORM-03 finishes with a genuine local-only summary, not an invented builder quote');

 for(const id of ['LOC-01','LOC-02','CAREER-01','CAREER-03','NEWS-01','NEWS-02','UI-01','FORM-03']){
  await page.setViewportSize({width:320,height:790});
  await page.goto(base+'previews/'+id+'/',{waitUntil:'domcontentloaded'});
  const sizes=await page.evaluate(()=>({window:innerWidth,document:document.documentElement.scrollWidth}));
  assert(sizes.document<=sizes.window+2,id+' has no page-level horizontal overflow on a 320px phone ('+sizes.document+'/'+sizes.window+')');
 }
 await page.setViewportSize({width:390,height:844});


 // Eight additional responsive, genuinely interactive core components; assertions require actual browser behavior.
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'previews/UI-02/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('[role=tab]').count()===3
  &&await page.locator('[role=tabpanel]:visible').count()===1,'UI-02 exposes three semantic tabs and exactly one visible panel');
 await page.locator('#tab-architecture').focus();
 await page.keyboard.press('ArrowRight');
 assert(await page.locator('#tab-interiors').getAttribute('aria-selected')==='true'
  &&await page.locator('#panel-interiors').isVisible(),'UI-02 keyboard ArrowRight changes actual art/content and selected state');
 await page.keyboard.press('End');
 assert(await page.locator('#tab-research').getAttribute('aria-selected')==='true'
  &&await page.locator('#panel-research').isVisible(),'UI-02 keyboard End selects the final panel');

 await page.goto(base+'previews/UI-03/',{waitUntil:'domcontentloaded'});
 await page.locator('#open-dialog').click();
 assert(await page.locator('#inquiry-dialog').evaluate(el=>el.open)
  &&await page.locator('#close-dialog').evaluate(el=>document.activeElement===el),'UI-03 native dialog opens and focuses Close');
 await page.keyboard.press('Escape');
 assert(await page.locator('#inquiry-dialog').evaluate(el=>!el.open)
  &&await page.locator('#open-dialog').evaluate(el=>document.activeElement===el),'UI-03 Escape dismisses and restores opener focus');
 await page.locator('#open-dialog').click();
 await page.locator('#dialog-form button[type=submit]').click();
 assert((await page.locator('#form-error').textContent()).includes('Choose'),'UI-03 does not generate an empty fake inquiry');
 await page.locator('#idea-type').selectOption('Interior update');
 await page.locator('#idea-desc').fill('Illustrative kitchen design inquiry.');
 await page.locator('#dialog-form button[type=submit]').click();
 assert(await page.locator('#draft').isVisible()
  &&(await page.locator('#draft-output').textContent()).includes('NOT SENT'),'UI-03 dialog produces only an unsent local project note');
 await page.locator('#close-dialog').click();

 await page.goto(base+'previews/UI-06/',{waitUntil:'domcontentloaded'});
 await page.locator('#show-info').click();
 assert(await page.locator('#toast').isVisible()
  &&(await page.locator('#toast-text').textContent()).includes('reserved'),'UI-06 informational toast is real and discloses reserved sample contact');
 await page.locator('#toast-dismiss').click();
 assert(await page.locator('#toast').isHidden(),'UI-06 toast can be actively dismissed');
 await page.locator('#copy-button').click();
 // Clipboard writes can resolve asynchronously after the click event returns.
 // Verify the real final outcome rather than reading the stale initial status.
 await page.waitForFunction(()=>{
  const message=document.querySelector('#persistent-status')?.textContent.trim()||'';
  return message.startsWith('Copied the example email address') || message.startsWith('Clipboard copy failed or was blocked.');
 },null,{timeout:10000});
 assert(await page.locator('#toast').isVisible()
  &&(await page.locator('#toast-text').textContent())===(await page.locator('#persistent-status').textContent()),
  'UI-06 reports the actual clipboard outcome instead of leaving inert feedback');

 await page.goto(base+'previews/LOC-03/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('[data-branch=centre]').getAttribute('aria-pressed')==='true'
  &&(await page.locator('#branch-name').textContent())==='Centre Room','LOC-03 starts with one selected fictional salon branch');
 await page.locator('[data-branch=shore]').click();
 assert(await page.locator('[data-branch=shore]').getAttribute('aria-pressed')==='true'
  &&(await page.locator('#branch-name').textContent())==='Shore Room'
  &&(await page.locator('#branch-hours').textContent()).includes('Thu'),'LOC-03 branch selector changes actual visible details');

 await page.goto(base+'previews/LOC-04/',{waitUntil:'domcontentloaded'});
 assert((await page.locator('#directions-link').getAttribute('href')).includes('100%20Queen%20Street%20West')
  &&(await page.locator('.disclose').textContent()).includes('not affiliated'),'LOC-04 links a documented public landmark rather than fabricated coordinates');
 await page.locator('[data-mode=transit]').click();
 assert(await page.locator('[data-mode=transit]').getAttribute('aria-pressed')==='true'
  &&(await page.locator('#mode-heading').textContent())==='Public transit','LOC-04 travel-topic selector really updates its information');

 await page.goto(base+'previews/FORM-04/',{waitUntil:'domcontentloaded'});
 assert(Boolean(await page.locator('#date').getAttribute('min')),'FORM-04 applies browser-local minimum date');
 await page.locator('#service-form button[type=submit]').click();
 assert((await page.locator('#error').textContent()).includes('Choose an example service')
  &&await page.locator('#summary').isHidden(),'FORM-04 blocks an empty appointment preference');
 await page.locator('[name=service][value=Inspection]').check();
 const earliest=await page.locator('#date').getAttribute('min');
 await page.locator('#date').fill(earliest);
 await page.locator('#time').selectOption({label:'Morning preference'});
 await page.locator('#name').fill('Demo Driver');
 await page.locator('#email').fill('demo@example.com');
 await page.locator('#service-form button[type=submit]').click();
 assert(await page.locator('#summary').isVisible()
  &&(await page.locator('#draft').textContent()).includes('NOT SENT OR BOOKED'),'FORM-04 generates only an unsent service preference without availability claims');

 await page.goto(base+'previews/FORM-06/',{waitUntil:'domcontentloaded'});
 await page.locator('#file-name').fill('Concept boards');
 await page.locator('#file-form button[type=submit]').click();
 assert((await page.locator('#file-error').textContent()).includes('Choose one local')
  &&await page.locator('#file-summary').isHidden(),'FORM-06 attachment is a genuinely required input');
 await page.locator('#file').setInputFiles({name:'notes.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.7\nDemo local metadata only')});
 await page.locator('#file-form button[type=submit]').click();
 assert(await page.locator('#file-summary').isVisible()
  &&(await page.locator('#file-output').textContent()).includes('NOT UPLOADED')
  &&(await page.locator('#file-output').textContent()).includes('notes.pdf'),'FORM-06 accepts valid local metadata without reading or uploading file data');
 await page.locator('#clear-file').click();
 assert(await page.locator('#file-summary').isHidden()
  &&(await page.locator('#file-details').textContent()).includes('No file chosen'),'FORM-06 clears chosen local file metadata');

 await page.goto(base+'previews/LEGAL-01/',{waitUntil:'domcontentloaded'});
 await page.evaluate(()=>localStorage.removeItem('showroom-legal01-preferences-v1'));
 await page.reload({waitUntil:'domcontentloaded'});
 assert(await page.locator('#consent-banner').isVisible()
  &&!await page.locator('#analytics').isChecked()
  &&!await page.locator('#marketing').isChecked(),'LEGAL-01 initially offers visible neutral consent and unselected optional purposes');
 await page.locator('#reject-all').click();
 assert(await page.locator('#consent-banner').isHidden()
  &&(await page.locator('#current-state').textContent()).includes('analytics off'),'LEGAL-01 Reject optional actually stores disabled optional preferences');
 await page.locator('[data-open-preferences]').first().click();
 await page.locator('#analytics').check();
 await page.locator('#preference-form button[type=submit]').click();
 assert(await page.locator('#preference-dialog').evaluate(el=>!el.open)
  &&(await page.locator('#current-state').textContent()).includes('analytics on'),'LEGAL-01 consent toggles save independently and close native preferences dialog');
 await page.reload({waitUntil:'domcontentloaded'});
 assert(await page.locator('#consent-banner').isHidden()
  &&(await page.locator('#current-state').textContent()).includes('analytics on'),'LEGAL-01 optional preferences survive reload when localStorage is available');
 await page.locator('#reset-preferences').click();
 assert(await page.locator('#consent-banner').isVisible(),'LEGAL-01 demo preferences can be reset and banner reopened');

 for(const id of ['UI-02','UI-03','UI-06','LOC-03','LOC-04','FORM-04','FORM-06','LEGAL-01']){
  await page.setViewportSize({width:320,height:790});
  await page.goto(base+'previews/'+id+'/',{waitUntil:'domcontentloaded'});
  const widths=await page.evaluate(()=>({screen:innerWidth,document:document.documentElement.scrollWidth}));
  assert(widths.document<=widths.screen+2,id+' avoids horizontal page overflow at 320px ('+widths.document+'/'+widths.screen+')');
 }
 await page.setViewportSize({width:390,height:844});


 // Seven more real responsive core examples; verify operating controls, truthful boundaries, and small screens.
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'previews/UI-04/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.slide:visible').count()===1
  &&await page.locator('#counter').textContent()==='01 / 03'
  &&await page.locator('#prev').isDisabled(),'UI-04 starts on one real artwork with a bounded previous control');
 await page.locator('#next').click();
 assert(await page.locator('.slide[data-slide="1"]').isVisible()
  &&await page.locator('#counter').textContent()==='02 / 03'
  &&(await page.locator('#art-title').textContent()).includes('Contrast'),'UI-04 Next changes the actual illustration, title and count');
 await page.locator('.stage').focus();
 await page.keyboard.press('End');
 assert(await page.locator('.slide[data-slide="2"]').isVisible()
  &&await page.locator('#next').isDisabled(),'UI-04 focused gallery supports End navigation to last bounded slide');
 await page.keyboard.press('Home');
 assert(await page.locator('.slide[data-slide="0"]').isVisible(),'UI-04 Home keyboard navigation restores first slide');

 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(base+'previews/UI-05/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#mobile-bar').isVisible()
  &&await page.locator('#mobile-bar a').getAttribute('href')==='#request','UI-05 displays a meaningful safe-area sticky mobile action linked to the real form');
 await page.locator('#mobile-bar a').click();
 await page.waitForFunction(()=>document.querySelector('#mobile-bar').hidden);
 assert(await page.locator('#mobile-bar').isHidden(),'UI-05 sticky action hides when the actual contact form enters view');
 await page.locator('#request-form button[type=submit]').click();
 assert((await page.locator('#error').textContent()).includes('Choose'),'UI-05 rejects an empty fake enquiry');
 await page.locator('#type').selectOption('Finish work');
 await page.locator('#message').fill('An illustrative finishing job.');
 await page.locator('#request-form button[type=submit]').click();
 assert(await page.locator('#result').isVisible()
  &&(await page.locator('#output').textContent()).includes('NOT SENT'),'UI-05 produces a genuine unsent local scope draft');
 await page.emulateMedia({reducedMotion:'no-preference'});

 await page.goto(base+'previews/UI-07/',{waitUntil:'domcontentloaded'});
 await page.locator('#help-fab').click();
 assert(await page.locator('#help-sheet').evaluate(el=>el.open)
  &&await page.locator('#help-close').evaluate(el=>document.activeElement===el),'UI-07 floating help opens native modal with focus in sheet');
 await page.locator('#help-query').fill('pricing');
 assert(await page.locator('#help-topics details:visible').count()===1
  &&(await page.locator('#help-count').textContent()).includes('1 matching'),'UI-07 search filters actual FAQ disclosures');
 await page.locator('#help-query').fill('xyz-invalid-nomatch-test');
 assert(await page.locator('#help-empty').isVisible()
  &&await page.locator('#help-topics details:visible').count()===0,'UI-07 provides a real empty search state');
 await page.locator('#help-reset').click();
 assert(await page.locator('#help-topics details:visible').count()===3,'UI-07 Reset clears search and restores all help topics');
 await page.keyboard.press('Escape');
 assert(await page.locator('#help-sheet').evaluate(el=>!el.open)
  &&await page.locator('#help-fab').evaluate(el=>document.activeElement===el),'UI-07 Escape restores focus to its actual floating help trigger');

 await page.goto(base+'previews/FORM-05/',{waitUntil:'domcontentloaded'});
 await page.locator('#newsletter-form button[type=submit]').click();
 assert((await page.locator('#email-error').textContent()).includes('Enter')
  &&await page.locator('#outcome').isHidden(),'FORM-05 empty fields cannot produce newsletter confirmation');
 await page.locator('#email').fill('reader@example.com');
 await page.locator('[name=frequency][value=Monthly]').check();
 await page.locator('#newsletter-form button[type=submit]').click();
 assert((await page.locator('#consent-error').textContent()).includes('non-subscription')
  &&await page.locator('#outcome').isHidden(),'FORM-05 requires explicit unselected consent');
 await page.locator('#consent').check();
 await page.locator('#newsletter-form button[type=submit]').click();
 assert(await page.locator('#outcome').isVisible()
  &&(await page.locator('#outcome-title').textContent()).includes('NOT SUBSCRIBED')
  &&(await page.locator('#outcome-text').textContent()).includes('Monthly'),'FORM-05 validates frequency/consent and accurately reports no subscription');

 await page.goto(base+'previews/LEGAL-02/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.policy').count()===3
  &&await page.locator('footer nav a[href="#privacy"]').count()===1
  &&(await page.locator('#privacy .warning').textContent()).includes('NOT A PRIVACY POLICY'),'LEGAL-02 contains actual linked policy sections and labels its text as nonbinding');
 await page.locator('footer nav a[href="#terms"]').click();
 assert(await page.evaluate(()=>location.hash)==='#terms','LEGAL-02 footer policy navigation reaches the real terms section');
 await page.locator('[data-copy-section="terms"]').click();
 await page.waitForFunction(()=>{
  const status=document.querySelector('#copy-status')?.textContent.trim()||'';
  return status.startsWith('Link copied for ')||status.startsWith('Copy unavailable.');
 },null,{timeout:10000});
 assert((await page.locator('#copy-status').textContent())!=='No section link copied.'
  &&(await page.locator('[data-copy-section="terms"]').textContent())!=='Copy link to section','LEGAL-02 copy-link reports actual success or failure without fake confirmation');

 await page.goto(base+'previews/LEGAL-03/',{waitUntil:'domcontentloaded'});
 await page.locator('#large-text').click();
 assert(await page.locator('#large-text').getAttribute('aria-pressed')==='true'
  &&await page.locator('body').evaluate(el=>el.classList.contains('large')),'LEGAL-03 larger-text option truly changes local page rendering');
 await page.locator('#high-contrast').click();
 assert(await page.locator('body').evaluate(el=>el.classList.contains('contrast')),'LEGAL-03 higher-contrast option applies to sample');
 await page.locator('#reset-reading').click();
 assert(await page.locator('#large-text').getAttribute('aria-pressed')==='false'
  &&await page.locator('#high-contrast').getAttribute('aria-pressed')==='false','LEGAL-03 reset restores both reading preferences');
 await page.locator('#feedback-form button[type=submit]').click();
 assert((await page.locator('#error').textContent()).includes('Choose'),'LEGAL-03 empty accessibility feedback is rejected');
 await page.locator('#barrier').selectOption('Keyboard navigation');
 await page.locator('#details').fill('A sample navigation barrier.');
 await page.locator('#feedback-form button[type=submit]').click();
 assert(await page.locator('#result').isVisible()
  &&(await page.locator('#output').textContent()).includes('NOT SENT'),'LEGAL-03 generates a genuine local accessibility feedback draft rather than a support ticket');

 await page.goto(base+'previews/CAREER-02/',{waitUntil:'domcontentloaded'});
 assert((await page.locator('.portrait>span').textContent()).includes('NOT A TEAM MEMBER')
  &&await page.locator('.portrait img').count()===1,'CAREER-02 has a real portrait frame clearly labeled as non-staff');
 await page.locator('#interest-form button[type=submit]').click();
 assert((await page.locator('#error').textContent()).includes('Choose'),'CAREER-02 cannot accept empty fictional recruitment interest');
 await page.locator('#role').selectOption('Engineering');
 await page.locator('#note').fill('An illustrative candidate interest note.');
 await page.locator('#interest-form button[type=submit]').click();
 assert(await page.locator('#summary').isVisible()
  &&(await page.locator('#output').textContent()).includes('NOT SENT'),'CAREER-02 only prepares unsent role-interest draft');
 await page.locator('#copy-email').click();
 await page.waitForFunction(()=>{
  const status=document.querySelector('#copy-status')?.textContent.trim()||'';
  return status.startsWith('Example address copied.')||status.startsWith('Copy unavailable.');
 },null,{timeout:10000});
 assert((await page.locator('#copy-status').textContent())!=='No address copied.','CAREER-02 clipboard action reports its actual copy success or failure');

 for(const id of ['UI-04','UI-05','UI-07','FORM-05','LEGAL-02','LEGAL-03','CAREER-02']){
  await page.setViewportSize({width:320,height:790});
  await page.goto(base+'previews/'+id+'/',{waitUntil:'domcontentloaded'});
  const widths=await page.evaluate(()=>({screen:innerWidth,document:document.documentElement.scrollWidth}));
  assert(widths.document<=widths.screen+2,id+' avoids horizontal page overflow at 320px ('+widths.document+'/'+widths.screen+')');
 }
 await page.setViewportSize({width:390,height:844});


 // Nine completed footer, CTA and booking variants: actual controls and explicit non-transactional behavior.
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'previews/FOOT-03/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('footer#footer-showcase .foot-col').count()===3
  &&await page.locator('footer a[href="#approach"]').count()===1
  &&(await page.locator('#sample-address').textContent())==='hello@example.com','FOOT-03 has an actual giant-footer navigation and reserved sample contact');
 await page.locator('#copy-address').click();
 await page.waitForFunction(()=>{
  const status=document.querySelector('#copy-status')?.textContent.trim()||'';
  return status.startsWith('Reserved example address copied.')||status.startsWith('Clipboard unavailable;');
 },null,{timeout:10000});
 assert((await page.locator('#copy-status').textContent())!=='No address copied yet.','FOOT-03 reports a real clipboard outcome');

 await page.goto(base+'previews/FOOT-04/',{waitUntil:'domcontentloaded'});
 await page.locator('#project-form button[type=submit]').click();
 assert((await page.locator('#form-error').textContent()).includes('Choose an example service')
  &&await page.locator('#outcome').isHidden(),'FOOT-04 prevents an empty trade inquiry draft');
 await page.locator('#service').selectOption('Carpentry');
 await page.locator('#region').fill('An illustrative service region');
 await page.locator('#project-form button[type=submit]').click();
 assert(await page.locator('#outcome').isVisible()
  &&(await page.locator('#output').textContent()).includes('NOT SENT')
  &&(await page.locator('#output').textContent()).includes('Carpentry'),'FOOT-04 generates actual local scope output without claiming submission');
 await page.locator('#copy-contact').click();
 await page.waitForFunction(()=>{
  const status=document.querySelector('#copy-state')?.textContent.trim()||'';
  return status.startsWith('Reserved sample address copied;')||status.startsWith('Copy unavailable.');
 },null,{timeout:10000});
 assert((await page.locator('#copy-state').textContent())!=='Not copied.','FOOT-04 contact copy reports success or failure accurately');

 await page.goto(base+'previews/FOOT-05/',{waitUntil:'domcontentloaded'});
 await page.locator('#email').fill('reader@example.com');
 await page.locator('#newsletter-form button[type=submit]').click();
 assert(await page.locator('#result').isHidden()
  &&(await page.locator('#consent-error').textContent()).includes('Acknowledge'),'FOOT-05 newsletter cannot pass without consent');
 await page.locator('#consent').check();
 await page.locator('#newsletter-form button[type=submit]').click();
 assert(await page.locator('#result').isVisible()
  &&(await page.locator('#result strong').textContent()).includes('NOT SUBSCRIBED'),'FOOT-05 displays an honest local preview, never subscribed');
 await page.locator('#reset').click();
 assert(await page.locator('#result').isHidden()&&!await page.locator('#consent').isChecked(),'FOOT-05 demo preference reset really clears state');

 await page.goto(base+'previews/BOOK-02/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#guests').textContent()==='2'
  &&(await page.locator('.photo-label').textContent()).includes('NOT A REAL RETREAT'),'BOOK-02 starts with bounded guests and candid unrelated landscape photography');
 await page.locator('#plus').click();
 assert(await page.locator('#guests').textContent()==='3','BOOK-02 increment truly changes guest count');
 await page.locator('#stay-form button[type=submit]').click();
 assert((await page.locator('#error').textContent()).includes('arrival')
  &&await page.locator('#result').isHidden(),'BOOK-02 does not book without valid dates');
 const arrivalDate=await page.locator('#arrival').getAttribute('min');
 const departureDate=new Date(Date.parse(arrivalDate+'T00:00:00Z')+86400000).toISOString().slice(0,10);
 await page.locator('#arrival').fill(arrivalDate);
 await page.locator('#departure').fill(departureDate);
 await page.locator('#stay-form button[type=submit]').click();
 assert(await page.locator('#result').isVisible()
  &&(await page.locator('#output').textContent()).includes('NOT BOOKED')
  &&(await page.locator('#output').textContent()).includes('Guests: 3'),'BOOK-02 computes a local stay preference, not inventory or booking');

 await page.goto(base+'previews/BOOK-03/',{waitUntil:'domcontentloaded'});
 await page.locator('#quote-form button[type=submit]').click();
 assert((await page.locator('#error').textContent()).includes('project category'),'BOOK-03 requires a real selected job type');
 await page.locator('[name=kind][value=Renovation]').check();
 await page.locator('#timeline').selectOption('3–6 months');
 await page.locator('#range').selectOption('Not yet established');
 await page.locator('#quote-form button[type=submit]').click();
 assert(await page.locator('#result').isVisible()
  &&(await page.locator('#output').textContent()).includes('NOT A QUOTE OR SENT'),'BOOK-03 prepares an honest unsent, unpriced project brief');

 await page.goto(base+'previews/BOOK-04/',{waitUntil:'domcontentloaded'});
 assert((await page.locator('#date-a').textContent()).includes('example only'),'BOOK-04 labels dynamically generated sessions as fictitious examples');
 await page.locator('#plus').click();
 await page.locator('#plus').click();
 assert(await page.locator('#seats').textContent()==='3','BOOK-04 sample seats increment with actual state');
 await page.locator('#rsvp-form button[type=submit]').click();
 assert((await page.locator('#error').textContent()).includes('illustrative workshop session'),'BOOK-04 rejects an empty session choice');
 await page.locator('[name=session][value=b]').check();
 await page.locator('#contact').fill('Fictional Participant');
 await page.locator('#rsvp-form button[type=submit]').click();
 assert(await page.locator('#result').isVisible()
  &&(await page.locator('#output').textContent()).includes('NOT REGISTERED')
  &&(await page.locator('#output').textContent()).includes('Seats: 3'),'BOOK-04 creates a truthful local interest summary, not real tickets');

 await page.goto(base+'previews/BOOK-05/',{waitUntil:'domcontentloaded'});
 await page.locator('[name=provider][value=resy]').check();
 await page.locator('#provider-form button[type=submit]').click();
 assert(await page.locator('#destination').isHidden()
  &&(await page.locator('#error').textContent()).includes('not a restaurant booking page'),'BOOK-05 requires explicit acknowledgement before linking to another service');
 await page.locator('#ack').check();
 await page.locator('#provider-form button[type=submit]').click();
 assert(await page.locator('#destination').isVisible()
  &&await page.locator('#destination-link').getAttribute('href')==='https://resy.com/'
  &&(await page.locator('#destination-label').textContent()).includes('NO RESERVATION'),'BOOK-05 opens only a verified Resy homepage, not an invented reservation link');
 await page.locator('#change').click();
 await page.locator('[name=provider][value=opentable]').check();
 await page.locator('#provider-form button[type=submit]').click();
 assert(await page.locator('#destination-link').getAttribute('href')==='https://www.opentable.com/','BOOK-05 switches to the genuine OpenTable homepage link');

 await page.goto(base+'previews/CTA-04/',{waitUntil:'domcontentloaded'});
 assert((await page.locator('.image>span').textContent()).includes('NOT A VERIFIED PROJECT'),'CTA-04 architecture photography discloses unrelated stock');
 await page.locator('#open-inquiry').click();
 assert(await page.locator('#inquiry').evaluate(el=>el.open)
  &&await page.locator('#close-inquiry').evaluate(el=>document.activeElement===el),'CTA-04 opens a real native dialog and focuses its close control');
 await page.keyboard.press('Escape');
 assert(await page.locator('#inquiry').evaluate(el=>!el.open)
  &&await page.locator('#open-inquiry').evaluate(el=>document.activeElement===el),'CTA-04 Escape restores focus to the actual opener');
 await page.locator('#open-inquiry').click();
 await page.locator('#request-form button[type=submit]').click();
 assert((await page.locator('#error').textContent()).includes('Choose'),'CTA-04 prevents an empty local enquiry');
 await page.locator('#project').selectOption('Interior redesign');
 await page.locator('#details').fill('An illustrative architecture project idea.');
 await page.locator('#request-form button[type=submit]').click();
 assert(await page.locator('#result').isVisible()
  &&(await page.locator('#output').textContent()).includes('NOT SENT'),'CTA-04 produces only a local draft, without contacting an architect');
 await page.locator('#close-inquiry').click();

 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(base+'previews/CTA-05/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#mobile-rail').isVisible()
  &&await page.locator('#mobile-rail a').count()===2
  &&await page.locator('#mobile-rail a[href="#hours"]').count()===1
  &&await page.locator('#mobile-rail a[href="#quote"]').count()===1,'CTA-05 is a true dual-action phone rail with meaningful linked destinations');
 await page.locator('#mobile-rail a[href="#quote"]').click();
 await page.waitForFunction(()=>document.querySelector('#mobile-rail').hidden);
 assert(await page.locator('#mobile-rail').isHidden(),'CTA-05 sticky rail hides near its actual inquiry form');
 await page.locator('#quote-form button[type=submit]').click();
 assert((await page.locator('#error').textContent()).includes('Choose'),'CTA-05 enforces local service-type validation');
 await page.locator('#work').selectOption('Maintenance');
 await page.locator('#location').fill('Sample region');
 await page.locator('#quote-form button[type=submit]').click();
 assert(await page.locator('#outcome').isVisible()
  &&(await page.locator('#output').textContent()).includes('NOT SENT'),'CTA-05 local quote inquiry really generates a non-sending draft');
 await page.emulateMedia({reducedMotion:'no-preference'});

 for(const id of ['FOOT-03','FOOT-04','FOOT-05','BOOK-02','BOOK-03','BOOK-04','BOOK-05','CTA-04','CTA-05']){
  await page.setViewportSize({width:320,height:790});
  await page.goto(base+'previews/'+id+'/',{waitUntil:'domcontentloaded'});
  const widths=await page.evaluate(()=>({screen:innerWidth,document:document.documentElement.scrollWidth}));
  assert(widths.document<=widths.screen+2,id+' avoids horizontal page overflow at 320px ('+widths.document+'/'+widths.screen+')');
 }
 await page.setViewportSize({width:390,height:844});


 // Eight functional navigation, announcement, gallery, pricing additions.
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'previews/NAV-05/',{waitUntil:'domcontentloaded'});
 await page.locator('#open-menu').click();
 assert(await page.locator('#open-menu').getAttribute('aria-expanded')==='true'
  &&await page.locator('#mobile-panel').isVisible()
  &&await page.locator('body').evaluate(el=>el.classList.contains('menu-open')),'NAV-05 phone rail opens a real full-screen scroll-locked navigation');
 await page.keyboard.press('Escape');
 assert(await page.locator('#mobile-panel').isHidden()
  &&await page.locator('#open-menu').evaluate(el=>document.activeElement===el),'NAV-05 Escape restores focus to the real trigger');
 await page.locator('#open-menu').click();
 await page.locator('#mobile-panel a[href="#landscape"]').click();
 assert(await page.locator('#mobile-panel').isHidden()
  &&await page.evaluate(()=>location.hash)==='#landscape','NAV-05 chapter selection closes menu and navigates to genuine photo section');

 await page.goto(base+'previews/NAV-06/',{waitUntil:'domcontentloaded'});
 await page.locator('#open-menu').click();
 assert(await page.locator('#site-menu').evaluate(el=>el.open)
  &&await page.locator('#close-menu').evaluate(el=>document.activeElement===el),'NAV-06 opens full-screen native dialog and moves keyboard focus into it');
 await page.keyboard.press('Escape');
 assert(await page.locator('#site-menu').evaluate(el=>!el.open)
  &&await page.locator('#open-menu').evaluate(el=>document.activeElement===el),'NAV-06 Escape closes full screen menu and restores original focus');
 await page.locator('#hero-menu').click();
 assert(await page.locator('#site-menu').evaluate(el=>el.open),'NAV-06 secondary hero menu actually opens');
 await page.locator('#close-menu').click();
 assert(await page.locator('#hero-menu').evaluate(el=>document.activeElement===el),'NAV-06 secondary opener also receives focus on Close');

 await page.goto(base+'previews/NAV-07/',{waitUntil:'domcontentloaded'});
 await page.locator('#services-toggle').click();
 assert(await page.locator('#mega-menu').isVisible()
  &&await page.locator('#services-toggle').getAttribute('aria-expanded')==='true','NAV-07 service mega-menu opens with a real expanded state');
 await page.locator('[data-group=work]').click();
 assert(await page.locator('[data-menu-panel=work]').isVisible()
  &&await page.locator('[data-menu-panel=home]').isHidden()
  &&await page.locator('[data-group=work]').getAttribute('aria-pressed')==='true','NAV-07 group switch updates actual service copy and accessible pressed state');
 await page.keyboard.press('Escape');
 assert(await page.locator('#mega-menu').isHidden()
  &&await page.locator('#services-toggle').evaluate(el=>document.activeElement===el),'NAV-07 Escape closes and restores menu trigger focus');
 await page.locator('#services-toggle').click();
 await page.locator('[data-group=planning]').click();
 await page.locator('[data-menu-panel=planning] a[href="#method"]').click();
 assert(await page.locator('#mega-menu').isHidden()
  &&await page.evaluate(()=>location.hash)==='#method','NAV-07 real service link closes flyout and navigates to actual method section');

 await page.goto(base+'previews/BAR-02/',{waitUntil:'domcontentloaded'});
 await page.locator('#hours-disclosure summary').click();
 assert(await page.locator('#hours-disclosure').evaluate(el=>el.open)
  &&(await page.locator('.hours-content').textContent()).includes('Closed (sample)'),'BAR-02 native hours disclosure expands to actual example weekly schedule');
 await page.locator('#dismiss').click();
 assert(await page.locator('#bar-showcase').isHidden()
  &&await page.locator('#restore').isVisible(),'BAR-02 dismissal offers a real way to reopen the notice');
 await page.locator('#restore').click();
 assert(await page.locator('#bar-showcase').isVisible(),'BAR-02 restoration brings the actual location strip back');

 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(base+'previews/BAR-03/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#pause').getAttribute('aria-pressed')==='true','BAR-03 reduced-motion preference disables automatic rotation by default');
 await page.locator('#next').click();
 assert(await page.locator('#counter').textContent()==='02 / 03'
  &&await page.locator('#message-link').getAttribute('href')==='#care','BAR-03 Next changes actual message, count and destination link');
 await page.locator('#previous').click();
 assert(await page.locator('#counter').textContent()==='01 / 03'
  &&await page.locator('#message-link').getAttribute('href')==='#journal','BAR-03 Previous returns to original message and actual journal destination');
 await page.locator('#pause').click();
 assert(await page.locator('#pause').getAttribute('aria-pressed')==='false','BAR-03 explicitly resumes rotations only after user action');
 await page.locator('#pause').click();
 assert(await page.locator('#pause').getAttribute('aria-pressed')==='true','BAR-03 can pause again at any time');
 await page.emulateMedia({reducedMotion:'no-preference'});

 await page.goto(base+'previews/GAL-04/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.frame').count()===3
  &&await page.locator('#slide-count').textContent()==='01 / 03'
  &&await page.locator('#previous').isDisabled(),'GAL-04 filmstrip starts with three distinct real cards and bounded prev');
 await page.locator('#next').click();
 assert(await page.locator('#slide-count').textContent()==='02 / 03'
  &&(await page.locator('#selected-label').textContent()).includes('Afterglow'),'GAL-04 Next updates filmstrip position and the actual selected status');
 await page.locator('#filmstrip').focus();
 await page.keyboard.press('End');
 assert(await page.locator('#slide-count').textContent()==='03 / 03'
  &&await page.locator('#next').isDisabled(),'GAL-04 focused filmstrip responds to End and bounds the last selection');
 await page.locator('#back-first').click();
 assert(await page.locator('#slide-count').textContent()==='01 / 03','GAL-04 return-to-first control actually resets active selection');

 await page.goto(base+'previews/GAL-07/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.slide:visible').count()===1
  &&await page.locator('#counter').textContent()==='01 / 03','GAL-07 starts with a single immersive photograph');
 await page.locator('#next').click();
 assert(await page.locator('.slide[data-slide="1"]').isVisible()
  &&(await page.locator('#slide-line2').textContent()).includes('still moments'),'GAL-07 Next changes actual backdrop and caption while preserving art-directed typography');
 await page.locator('[data-index="2"]').click();
 assert(await page.locator('.slide[data-slide="2"]').isVisible()
  &&await page.locator('[data-index="2"]').getAttribute('aria-pressed')==='true','GAL-07 direct selection displays an original non-photo room study');
 await page.locator('.stage').focus();
 await page.keyboard.press('Home');
 assert(await page.locator('.slide[data-slide="0"]').isVisible(),'GAL-07 keyboard Home returns to the first image');

 await page.goto(base+'previews/PRICE-02/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#matrix [data-plan=core]:visible').count()>0
  &&await page.locator('#matrix [data-plan=studio]:visible').count()===0,'PRICE-02 390px layout defaults to one legible plan column');
 await page.locator('[data-pick=partner]').click();
 assert(await page.locator('#matrix').getAttribute('data-active')==='partner'
  &&await page.locator('#matrix [data-plan=core]:visible').count()===0
  &&await page.locator('#matrix [data-plan=partner]:visible').count()>0
  &&(await page.locator('#plan-details').textContent()).includes('$1,850'),'PRICE-02 phone plan buttons genuinely replace visible comparison column and summary');
 await page.setViewportSize({width:1200,height:850});
 assert(await page.locator('#matrix [data-plan=core]:visible').count()>0
  &&await page.locator('#matrix [data-plan=studio]:visible').count()>0
  &&await page.locator('#matrix [data-plan=partner]:visible').count()>0,'PRICE-02 wide layout shows all three plan feature columns together');

 for(const id of ['NAV-05','NAV-06','NAV-07','BAR-02','BAR-03','GAL-04','GAL-07','PRICE-02']){
  await page.setViewportSize({width:320,height:790});
  await page.goto(base+'previews/'+id+'/',{waitUntil:'domcontentloaded'});
  const dims=await page.evaluate(()=>({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
  assert(dims.scrollWidth<=dims.viewport+2,id+' has no page-level 320px horizontal overflow ('+dims.scrollWidth+'/'+dims.viewport+')');
 }
 await page.setViewportSize({width:390,height:844});


 // Eight final galleries/pricing/product family specimens: real state and truthful boundaries.
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'previews/GAL-08/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('[data-open]').count()===3
  &&(await page.locator('.disclosure').textContent()).includes('unapproved'),'GAL-08 mixed gallery has three distinct inputs and honest media provenance');
 await page.locator('[data-open=photo1]').click();
 assert(await page.locator('#viewer').evaluate(el=>el.open)
  &&await page.locator('#viewer-image').isVisible()
  &&await page.locator('#viewer-video').isHidden(),'GAL-08 first image opens the actual native image viewer, not the film');
 await page.keyboard.press('Escape');
 assert(await page.locator('#viewer').evaluate(el=>!el.open)
  &&await page.locator('[data-open=photo1]').evaluate(el=>document.activeElement===el),'GAL-08 image viewer closes on Escape with focus restored');
 await page.locator('[data-open=film]').click();
 assert(await page.locator('#viewer-video').isVisible()
  &&(await page.locator('#viewer-video').getAttribute('src')).includes('9489382-uhd_4096_2160_25fps.mp4'),'GAL-08 selecting film loads the actual one review-only source into native controls');
 await page.locator('#viewer-close').click();
 assert(await page.locator('#viewer').evaluate(el=>!el.open)
  &&await page.locator('[data-open=film]').evaluate(el=>document.activeElement===el),'GAL-08 film viewer closes and restores opener focus');

 await page.goto(base+'previews/PRICE-03/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('[data-item=portrait] button').getAttribute('aria-expanded')==='true'
  &&await page.locator('#detail-portrait').isVisible(),'PRICE-03 starts with actual first rate details');
 await page.locator('[data-item=editorial] button').click();
 assert(await page.locator('#detail-editorial').isVisible()
  &&await page.locator('#detail-portrait').isHidden()
  &&await page.locator('[data-item=editorial] button').getAttribute('aria-expanded')==='true','PRICE-03 expanded starting rate actually swaps details');
 await page.locator('[data-item=editorial] button').click();
 assert(await page.locator('#detail-editorial').isHidden(),'PRICE-03 active rate can be collapsed again');

 await page.goto(base+'previews/PRICE-04/',{waitUntil:'domcontentloaded'});
 assert((await page.locator('#price').textContent()).includes('$49'),'PRICE-04 single offer begins with example weekly pass');
 await page.locator('[name=pass][value=ten]').check();
 assert((await page.locator('#price').textContent()).includes('$160')
  &&(await page.locator('#pass-label').textContent()).includes('TEN-VISIT'),'PRICE-04 selection genuinely updates hypothetical price and pass label');
 await page.locator('#prepare').click();
 assert(await page.locator('#result').isVisible()
  &&(await page.locator('#result').textContent()).includes('NOT PURCHASED')
  &&(await page.locator('#result-text').textContent()).includes('$160'),'PRICE-04 prepared result is explicitly non-purchased and reflects chosen option');

 await page.goto(base+'previews/PRICE-05/',{waitUntil:'domcontentloaded'});
 assert((await page.locator('#total').textContent()).includes('$1,920')
  &&await page.locator('#pages').textContent()==='3','PRICE-05 starts with transparent correct sample arithmetic');
 await page.locator('#increase').click();
 await page.locator('#complexity').selectOption('1.25');
 await page.locator('#forms').check();
 await page.locator('#animation').check();
 assert(await page.locator('#pages').textContent()==='4'
  &&(await page.locator('#total').textContent()).includes('$3,450')
  &&(await page.locator('#breakdown').textContent()).includes('× 1.25'),'PRICE-05 bounded count, multiplier and toggles actually compute the correct total');
 await page.locator('#scope-form button[type=submit]').click();
 assert(await page.locator('#result').isVisible()
  &&(await page.locator('#note').textContent()).includes('NOT A QUOTE')
  &&(await page.locator('#note').textContent()).includes('$3,450'),'PRICE-05 produces a correct local unsent arithmetic worksheet');

 await page.goto(base+'previews/PROD-02/',{waitUntil:'domcontentloaded'});
 await page.locator('[name=finish][value=walnut]').check();
 assert(await page.locator('#chair-render').getAttribute('data-finish')==='walnut'
  &&(await page.locator('#selected-finish').textContent()).includes('Deep walnut'),'PROD-02 real CSS chair drawing and text update on finish selection');
 await page.locator('#save-study').click();
 assert(await page.locator('#save-study').getAttribute('aria-pressed')==='true'
  &&(await page.locator('#selected-finish').textContent()).includes('No wishlist or order'),'PROD-02 temporary study marker never falsely asserts a persisted cart');

 await page.goto(base+'previews/PROD-03/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('[data-panel]:visible').count()===1,'PROD-03 lookbook shows only one real stock portrait');
 await page.locator('[data-select="2"]').click();
 assert(await page.locator('[data-panel="2"]').isVisible()
  &&await page.locator('[data-select="2"]').getAttribute('aria-pressed')==='true'
  &&(await page.locator('#story-title').textContent()).includes('shadow'),'PROD-03 chapter selection swaps visible portrait and actual editorial copy');
 await page.locator('#prev').click();
 assert(await page.locator('[data-panel="1"]').isVisible(),'PROD-03 bounded previous control navigates to prior portrait');

 await page.goto(base+'previews/PROD-04/',{waitUntil:'domcontentloaded'});
 await page.locator('[name=finish][value=sage]').check();
 await page.locator('#size').selectOption('large');
 assert(await page.locator('#lamp-visual').getAttribute('data-finish')==='sage'
  &&await page.locator('#lamp-visual').getAttribute('data-size')==='large'
  &&(await page.locator('#selected-name').textContent()).includes('Tall study'),'PROD-04 selection changes real CSS lamp state, size and description');
 await page.locator('#save').click();
 assert(await page.locator('#save').getAttribute('aria-pressed')==='true'
  &&(await page.locator('#selected-description').textContent()).includes('no wishlist'),'PROD-04 local idea marker makes no order or storage claim');

 await page.goto(base+'previews/PROD-05/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.item:visible').count()===4
  &&await page.locator('#counter').textContent()==='01 / 04','PROD-05 has an actually browsable four-object rail');
 await page.locator('[data-filter=lighting]').click();
 assert(await page.locator('.item:visible').count()===2
  &&await page.locator('#counter').textContent()==='01 / 02'
  &&await page.locator('[data-filter=lighting]').getAttribute('aria-pressed')==='true','PROD-05 category filter changes real visible objects and bounds');
 await page.locator('.item[data-item=light] [data-inspect]').click();
 assert((await page.locator('#detail-title').textContent())==='Soft lamp'
  &&(await page.locator('#detail-copy').textContent()).includes('lighting'),'PROD-05 inspect reveals actual detail for selected illustration');
 await page.locator('#next').click();
 assert(await page.locator('#counter').textContent()==='02 / 02'
  &&await page.locator('#next').isDisabled(),'PROD-05 next advances within selected category and bounds final item');

 for(const id of ['GAL-08','PRICE-03','PRICE-04','PRICE-05','PROD-02','PROD-03','PROD-04','PROD-05']){
  await page.setViewportSize({width:320,height:790});
  await page.goto(base+'previews/'+id+'/',{waitUntil:'domcontentloaded'});
  const size=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
  assert(size.scroll<=size.width+2,id+' renders without page overflow at 320px ('+size.scroll+'/'+size.width+')');
 }
 await page.setViewportSize({width:390,height:844});


 // Eight completed responsive heroes, introductions and project concepts.
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'previews/HERO-06/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#poster').isVisible()
  &&!await page.locator('#motion').getAttribute('src')
  &&(await page.locator('#motion-status').textContent()).includes('not loaded'),'HERO-06 displays a poster without requesting large video until a visitor opts in');
 await page.route('**/9489382-uhd_4096_2160_25fps.mp4',route=>route.abort());
 await page.locator('#motion-toggle').click();
 await page.waitForFunction(()=>Boolean(document.querySelector('#motion').getAttribute('src')));
 assert((await page.locator('#motion').getAttribute('src')).includes('9489382-uhd')
  &&(await page.locator('.credit').textContent()).includes('RIGHTS'),'HERO-06 only installs unrelated review-video URL after explicit user action');
 await page.unroute('**/9489382-uhd_4096_2160_25fps.mp4');

 await page.goto(base+'previews/HERO-08/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#stage').getAttribute('data-finish')==='sand'
  &&await page.locator('button[data-finish=sand]').getAttribute('aria-pressed')==='true','HERO-08 starts in original Sand illustrated state');
 await page.locator('button[data-finish=oxide]').click();
 assert(await page.locator('#stage').getAttribute('data-finish')==='oxide'
  &&(await page.locator('#stage').getAttribute('aria-label')).includes('rust-toned')
  &&(await page.locator('#selected').textContent()).includes('Oxide'),'HERO-08 controls update the original ceramic illustration, accessible description and selection');
 assert(await page.locator('.cta').getAttribute('href')==='#collection','HERO-08 hero CTA reaches a real collection section');

 await page.goto(base+'previews/HERO-09/',{waitUntil:'domcontentloaded'});
 const sourceOne=await page.locator('#main-image').getAttribute('src');
 await page.locator('[data-study="1"]').click();
 const sourceTwo=await page.locator('#main-image').getAttribute('src');
 assert(sourceTwo!==sourceOne
  &&(await page.locator('#main-caption').textContent()).includes('SEPARATE STOCK')
  &&await page.locator('[data-study="1"]').getAttribute('aria-pressed')==='true','HERO-09 numbered index swaps actual separate stock photograph, caption and selected state');
 await page.locator('[data-study="2"]').click();
 assert((await page.locator('#main-image').getAttribute('alt')).includes('wood cabinetry'),'HERO-09 accessible image description updates with actual selected study');

 await page.goto(base+'previews/INTRO-02/',{waitUntil:'domcontentloaded'});
 await page.locator('[data-choice=objects]').click();
 assert(await page.locator('#selected-art').getAttribute('data-choice')==='objects'
  &&await page.locator('#selected-link').getAttribute('href')==='#objects'
  &&(await page.locator('#selected-title').textContent()).includes('Matter'),'INTRO-02 selected category changes illustration, text and real destination');
 await page.locator('#selected-link').click();
 assert(await page.evaluate(()=>location.hash)==='#objects','INTRO-02 category index links to an actual page chapter');

 await page.goto(base+'previews/INTRO-03/',{waitUntil:'domcontentloaded'});
 assert((await page.locator('.hero-photo>span').textContent()).includes('NOT OUR PEOPLE'),'INTRO-03 clearly disclaims unrelated workshop photograph');
 await page.locator('.accordions details').nth(0).locator('summary').click();
 assert(await page.locator('.accordions details').nth(0).evaluate(el=>el.open),'INTRO-03 native principle disclosure opens');
 await page.locator('.accordions details').nth(1).locator('summary').click();
 // Native details toggle events are queued: wait for the exclusive-close handler.
 await page.waitForFunction(()=>{
  const entries=[...document.querySelectorAll('.accordions details')];
  return entries[1]?.open&&!entries[0]?.open;
 },null,{timeout:10000});
 assert(await page.locator('.accordions details').nth(1).evaluate(el=>el.open)
  &&!await page.locator('.accordions details').nth(0).evaluate(el=>el.open),'INTRO-03 keeps just one original manifesto principle open');

 await page.goto(base+'previews/PRJ-04/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#scene').getAttribute('data-phase')==='before'
  &&await page.locator('button[data-phase=before]').getAttribute('aria-pressed')==='true','PRJ-04 starts with the actual conceptual room before state');
 await page.locator('button[data-phase=process]').click();
 assert(await page.locator('#scene').getAttribute('data-phase')==='process'
  &&(await page.locator('#step-title').textContent()).includes('thinking'),'PRJ-04 process control changes CSS conceptual room and narrative');
 await page.locator('button[data-phase=after]').click();
 assert(await page.locator('#scene').getAttribute('data-phase')==='after'
  &&(await page.locator('#scene').getAttribute('aria-label')).includes('not a real renovation'),'PRJ-04 after is a genuinely different illustrated room, without claiming a completed job');

 await page.goto(base+'previews/PRJ-05/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.index a[data-chapter]').count()===3
  &&await page.locator('#material .material-art').isVisible(),'PRJ-05 contains three real narrative chapters and original concept artwork');
 await page.locator('.index a[href="#material"]').click();
 assert(await page.evaluate(()=>location.hash)==='#material','PRJ-05 active case-study index links to real material chapter');
 await page.locator('#context summary').click();
 assert(await page.locator('#context details').evaluate(el=>el.open)
  &&(await page.locator('#context details').textContent()).includes('no site'),'PRJ-05 sample case-study detail explicitly discloses no real client or construction');

 await page.goto(base+'previews/PRJ-06/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('[role=tab]').count()===3
  &&await page.locator('#scene').getAttribute('data-scene')==='garden','PRJ-06 starts with three accessible concept tabs and original garden diagram');
 await page.locator('#tab-garden').focus();
 await page.keyboard.press('ArrowDown');
 assert(await page.locator('#tab-courtyard').getAttribute('aria-selected')==='true'
  &&await page.locator('#scene').getAttribute('data-scene')==='courtyard'
  &&(await page.locator('#title').textContent()).includes('Courtyard'),'PRJ-06 keyboard switches real landscape illustration and text');
 await page.keyboard.press('End');
 assert(await page.locator('#tab-passage').getAttribute('aria-selected')==='true'
  &&(await page.locator('#concept-panel').getAttribute('aria-labelledby'))==='tab-passage','PRJ-06 keyboard End updates the selected accessible project panel');

 for(const id of ['HERO-06','HERO-08','HERO-09','INTRO-02','INTRO-03','PRJ-04','PRJ-05','PRJ-06']){
  await page.setViewportSize({width:320,height:790});
  await page.goto(base+'previews/'+id+'/',{waitUntil:'domcontentloaded'});
  const widths=await page.evaluate(()=>({screen:innerWidth,document:document.documentElement.scrollWidth}));
  assert(widths.document<=widths.screen+2,id+' avoids horizontal page overflow at 320px ('+widths.document+'/'+widths.screen+')');
 }
 await page.setViewportSize({width:390,height:844});


 // Eight new complete comparison, service and process designs: verify genuine interactions.
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'previews/COMP-02/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.pair figure').count()===2
  &&await page.locator('#highlight').getAttribute('aria-pressed')==='false'
  &&(await page.locator('.scene.after').getAttribute('aria-label')).includes('same fictional garden'),'COMP-02 has two independent original matched garden scenes and an inactive real inspection control');
 await page.locator('#highlight').click();
 assert(await page.locator('.pair').evaluate(el=>el.classList.contains('is-highlighted'))
  &&await page.locator('#highlight').getAttribute('aria-pressed')==='true'
  &&(await page.locator('#inspection-copy').textContent()).includes('curved pathway'),'COMP-02 Highlight changes actual scene emphasis and live description');
 await page.locator('#highlight').click();
 assert(!await page.locator('.pair').evaluate(el=>el.classList.contains('is-highlighted')),'COMP-02 highlight can be genuinely reversed');

 await page.goto(base+'previews/COMP-03/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#panel-art').getAttribute('data-state')==='before','COMP-03 starts in original matte car-panel concept');
 await page.locator('button[data-state=after]').click();
 assert(await page.locator('#panel-art').getAttribute('data-state')==='after'
  &&(await page.locator('#panel-art').getAttribute('aria-label')).includes('glossy slate')
  &&await page.locator('button[data-state=after]').getAttribute('aria-pressed')==='true','COMP-03 genuinely changes CSS reflection, accessible surface description and selected state');
 await page.locator('button[data-state=before]').click();
 assert(await page.locator('#panel-art').getAttribute('data-state')==='before','COMP-03 can restore the original illustrated finish');

 await page.goto(base+'previews/SRV-04/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('[role=tab]').count()===3
  &&await page.locator('#visual').getAttribute('data-kind')==='exterior','SRV-04 has three genuine service tabs and a CSS exterior graphic');
 await page.locator('#tab-exterior').focus();
 await page.keyboard.press('ArrowDown');
 assert(await page.locator('#tab-interior').getAttribute('aria-selected')==='true'
  &&await page.locator('#visual').getAttribute('data-kind')==='interior'
  &&(await page.locator('#detail-title').textContent()).includes('cabin'),'SRV-04 arrow keyboard navigation updates actual visual and service content');
 await page.keyboard.press('End');
 assert(await page.locator('#tab-finish').getAttribute('aria-selected')==='true'
  &&(await page.locator('#detail-list').textContent()).includes('Paint history'),'SRV-04 End switches the ARIA tab and unique technical questions');

 await page.goto(base+'previews/SRV-05/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.accordion details').count()===3
  &&await page.locator('#collapse-all').isDisabled(),'SRV-05 technical services begin closed and Collapse All accurately disabled');
 await page.locator('#expand-all').click();
 await page.waitForFunction(()=>document.querySelectorAll('.accordion details[open]').length===3);
 assert((await page.locator('#open-count').textContent()).includes('3 of 3')
  &&await page.locator('#expand-all').isDisabled(),'SRV-05 Expand All genuinely opens three separate native details');
 await page.locator('#collapse-all').click();
 await page.waitForFunction(()=>document.querySelectorAll('.accordion details[open]').length===0);
 assert((await page.locator('#open-count').textContent()).includes('0 of 3'),'SRV-05 Collapse All really shuts the disclosures and updates the count');

 await page.goto(base+'previews/SRV-06/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#matrix').getAttribute('data-audience')==='founders'
  &&await page.locator('button[data-audience=founders]').getAttribute('aria-pressed')==='true'
  &&await page.locator('#matrix td[data-audience-col=teams]:visible').count()===0,
  'SRV-06 phone starts with a legible selected-audience table instead of clipping three columns');
 await page.locator('button[data-audience=teams]').click();
 assert(await page.locator('#matrix').getAttribute('data-audience')==='teams'
  &&await page.locator('button[data-audience=teams]').getAttribute('aria-pressed')==='true'
  &&(await page.locator('#audience-title').textContent()).includes('Operating teams'),'SRV-06 selecting a B2B audience changes table filters, active button and description');
 assert(await page.locator('#matrix td[data-audience-col=founders]:visible').count()===0
  &&await page.locator('#matrix td[data-audience-col=teams]:visible').count()>0,'SRV-06 audience selection genuinely hides unselected comparison columns');
 await page.locator('button[data-audience=all]').click();
 assert(await page.locator('#matrix td[data-audience-col=founders]:visible').count()>0,'SRV-06 Show All restores the matrix comparison');
 await page.setViewportSize({width:1280,height:850});
 await page.goto(base+'previews/SRV-06/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#matrix').getAttribute('data-audience')==='all'
  &&await page.locator('#matrix td[data-audience-col=teams]:visible').count()>0,
  'SRV-06 desktop starts with the full three-audience matrix');
 await page.setViewportSize({width:390,height:844});

 await page.goto(base+'previews/PROC-03/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.step').count()===3
  &&await page.locator('#assess .art').count()===1
  &&await page.locator('#plan .art').count()===1,'PROC-03 uses three distinct conceptual graphic steps');
 await page.locator('#assess summary').click();
 assert(await page.locator('#assess details').evaluate(el=>el.open),'PROC-03 first process detail opens genuinely');
 await page.locator('#plan summary').click();
 await page.waitForFunction(()=>document.querySelector('#plan details').open&&!document.querySelector('#assess details').open);
 assert(await page.locator('#plan details').evaluate(el=>el.open),'PROC-03 alternative chapter opens while former detail closes');
 await page.locator('#assess a[href="#plan"]').click();
 assert(await page.evaluate(()=>location.hash)==='#plan','PROC-03 next-step link points to a real chapter section');

 await page.goto(base+'previews/PROC-04/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('[role=tab]').count()===5
  &&await page.locator('#previous').isDisabled()
  &&await page.locator('#progress-fill').evaluate(el=>parseFloat(el.style.width)===0),'PROC-04 five-stage timeline starts on first bounded milestone');
 await page.locator('#next').click();
 assert(await page.locator('#number').textContent()==='02 OF 05'
  &&await page.locator('#art').getAttribute('data-milestone')==='scope'
  &&await page.locator('#progress-fill').evaluate(el=>parseFloat(el.style.width)===25),'PROC-04 Next updates actual stage art, title and 25 percent progress');
 await page.locator('#tab-scope').focus();
 await page.keyboard.press('End');
 assert(await page.locator('#tab-deliver').getAttribute('aria-selected')==='true'
  &&await page.locator('#next').isDisabled()
  &&await page.locator('#progress-fill').evaluate(el=>parseFloat(el.style.width)===100),'PROC-04 keyboard End selects final stage and bounds navigation at 100 percent');

 await page.goto(base+'previews/PROC-05/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('[data-reviewed]').count()===4
  &&await page.locator('#reviewed-count').textContent()==='0 / 4'
  &&await page.locator('#reset').isDisabled(),'PROC-05 starts with zero local reading marks and a disabled reset');
 await page.locator('#open-first').click();
 assert(await page.locator('.steps article').first().locator('details').evaluate(el=>el.open),'PROC-05 Open First actually expands and focuses its first disclosure');
 await page.locator('[data-reviewed="1"]').check();
 await page.locator('[data-reviewed="3"]').check();
 assert(await page.locator('#reviewed-count').textContent()==='2 / 4'
  &&await page.locator('#meter-fill').evaluate(el=>parseFloat(el.style.width)===50),'PROC-05 reading checkboxes genuinely update local counter and halfway meter');
 await page.locator('#reset').click();
 assert(await page.locator('#reviewed-count').textContent()==='0 / 4'
  &&await page.locator('[data-reviewed]:checked').count()===0
  &&await page.locator('.steps details[open]').count()===0,'PROC-05 Reset clears actual reading marks and disclosures without submitting data');

 for(const id of ['COMP-02','COMP-03','SRV-04','SRV-05','SRV-06','PROC-03','PROC-04','PROC-05']){
  await page.setViewportSize({width:320,height:790});
  await page.goto(base+'previews/'+id+'/',{waitUntil:'domcontentloaded'});
  const widths=await page.evaluate(()=>({screen:innerWidth,document:document.documentElement.scrollWidth}));
  assert(widths.document<=widths.screen+2,id+' avoids horizontal page overflow at 320px ('+widths.document+'/'+widths.screen+')');
 }
 await page.setViewportSize({width:390,height:844});


 // Seven new working testimonial and restaurant menu previews.
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'previews/TEST-02/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#count').textContent()==='01 / 03'
  &&await page.locator('#previous').isDisabled()
  &&(await page.locator('#quote-caption').textContent()).includes('invented'),'TEST-02 quote-carousel starts on an explicitly fictional example with bounded controls');
 await page.locator('#next').click();
 assert(await page.locator('#count').textContent()==='02 / 03'
  &&(await page.locator('#quote-caption').textContent()).includes('No real person')
  &&await page.locator('[data-slide="1"]').getAttribute('aria-pressed')==='true','TEST-02 actually advances the statement, description and active dot');
 await page.locator('[data-slide="2"]').click();
 assert(await page.locator('#next').isDisabled(),'TEST-02 numbered direct selection bounds the final fictional quote');

 await page.goto(base+'previews/TEST-03/',{waitUntil:'domcontentloaded'});
 assert((await page.locator('.aside>p').textContent()).includes('NOT A PERSON')
  &&(await page.locator('#quote').textContent()).includes('useful project story'),'TEST-03 uses original illustrated non-person art and clearly invented sample quote');
 await page.locator('[data-angle=collaboration]').click();
 assert((await page.locator('#quote').textContent()).includes('authentic collaborator')
  &&(await page.locator('#attribution').textContent()).includes('No client')
  &&await page.locator('[data-angle=collaboration]').getAttribute('aria-pressed')==='true','TEST-03 actually changes the hypothetical quote, non-attribution and selected state');

 await page.goto(base+'previews/TEST-04/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.feed article:visible').count()===5,'TEST-04 five fictional feedback examples render as real cards');
 await page.locator('[data-filter=communication]').click();
 assert(await page.locator('.feed article:visible').count()===2
  &&(await page.locator('#count').textContent()).includes('2 invented communication')
  &&await page.locator('[data-filter=communication]').getAttribute('aria-pressed')==='true','TEST-04 topic filter genuinely hides unselected rows and announces the result count');
 await page.locator('#reset').click();
 assert(await page.locator('.feed article:visible').count()===5
  &&await page.locator('#reset').isDisabled(),'TEST-04 reset restores all visible imaginary feedback');

 await page.goto(base+'previews/TEST-05/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#screen').isVisible()
  &&await page.locator('#clip').isHidden()
  &&(await page.locator('#status').textContent()).includes('Ready'),'TEST-05 has a real still canvas, no preloaded customer footage and a complete text transcript');
 assert(await page.locator('#transcript').evaluate(el=>el.open)
  &&(await page.locator('.transcript-body').textContent()).includes('no speaker'),'TEST-05 readable transcript explicitly discloses fictional silent clip');
 await page.locator('#play').click();
 await page.waitForFunction(()=>document.querySelector('#play').textContent.includes('Pause'),null,{timeout:10000});
 assert((await page.locator('#status').textContent()).includes('silent')
  &&await page.locator('#restart').isEnabled(),'TEST-05 play triggers an actual local canvas-or-video motion sequence, with restart enabled');
 await page.locator('#play').click();
 assert((await page.locator('#status').textContent()).includes('paused'),'TEST-05 playback can be genuinely paused');
 await page.locator('#restart').click();
 // The browser may take a moment to resume the generated MediaStream.
 await page.waitForFunction(()=>document.querySelector('#play')?.textContent==='Pause original motion study',null,{timeout:10000});
 assert(await page.locator('#play').textContent()==='Pause original motion study','TEST-05 Restart really resumes from the original frame');

 await page.goto(base+'previews/MENU-02/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.food article').count()===3
  &&await page.locator('.food .photo img[alt]').count()===3
  &&(await page.locator('.intro').textContent()).includes('unrelated fictional dishes'),'MENU-02 image-led menu includes three independent photographic sources and truthful sample-food disclaimer');
 await page.locator('button[data-category=sea]').click();
 assert(await page.locator('.food article:visible').count()===1
  &&(await page.locator('#count').textContent()).includes('1 fictional sea')
  &&await page.locator('button[data-category=sea]').getAttribute('aria-pressed')==='true','MENU-02 meal category filter displays only a matching fictional dish');
 await page.locator('#reset').click();
 assert(await page.locator('.food article:visible').count()===3,'MENU-02 Reset displays every photo menu card again');

 await page.goto(base+'previews/MENU-03/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('[role=tab]').count()===3
  &&await page.locator('#dishes article').count()===3,'MENU-03 has three actual meal-period tabs and three initial dishes');
 await page.locator('#tab-lunch').focus();
 await page.keyboard.press('ArrowRight');
 assert(await page.locator('#tab-dinner').getAttribute('aria-selected')==='true'
  &&(await page.locator('#meal-title').textContent()).includes('evening')
  &&(await page.locator('#dishes').textContent()).includes('risotto'),'MENU-03 keyboard changes actual evening dishes and ARIA tab selection');
 await page.keyboard.press('End');
 assert(await page.locator('#tab-late').getAttribute('aria-selected')==='true'
  &&await page.locator('#dishes article').count()===2
  &&(await page.locator('#meal-count').textContent()).includes('2 fictional late'),'MENU-03 End selects actual late-night items and updates count');

 await page.goto(base+'previews/MENU-04/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#printed-menu .dish').count()===3
  &&(await page.locator('.legal').textContent()).includes('not verified'),'MENU-04 menu HTML remains accessible alongside the real PDF download');
 const downloadPromise=page.waitForEvent('download',{timeout:10000});
 await page.locator('#download-pdf').click();
 const menuDownload=await downloadPromise;
 assert(menuDownload.suggestedFilename()==='atelier-table-fictional-sample-menu.pdf'
  &&(await page.locator('#download-status').textContent()).includes('Generated'),'MENU-04 Download produces a genuine PDF with an explicit fictional filename and local status');

 for(const id of ['TEST-02','TEST-03','TEST-04','TEST-05','MENU-02','MENU-03','MENU-04']){
  await page.setViewportSize({width:320,height:790});
  await page.goto(base+'previews/'+id+'/',{waitUntil:'domcontentloaded'});
  const sizes=await page.evaluate(()=>({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
  assert(sizes.scrollWidth<=sizes.viewport+2,id+' avoids horizontal page overflow at 320px ('+sizes.scrollWidth+'/'+sizes.viewport+')');
 }
 await page.setViewportSize({width:390,height:844});


 // Final ten core examples: article discovery, event flows, countdowns and contact drafts.
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'previews/POST-01/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.cards article:visible').count()===3,'POST-01 starts with three real editorial story cards');
 await page.locator('button[data-topic=materials]').click();
 assert(await page.locator('.cards article:visible').count()===1
  &&await page.locator('button[data-topic=materials]').getAttribute('aria-pressed')==='true'
  &&await page.locator('.cards article:visible a').getAttribute('href')==='#chapter-materials','POST-01 topic control really filters articles with real chapter links');
 await page.locator('.cards article:visible a').click();
 assert(await page.evaluate(()=>location.hash)==='#chapter-materials','POST-01 article link navigates to an existing editorial section');
 await page.locator('button[data-topic=all]').click();
 assert(await page.locator('.cards article:visible').count()===3,'POST-01 restores the full editorial index');

 await page.goto(base+'previews/POST-02/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.toc a').count()===3
  &&await page.locator('#premise').isVisible(),'POST-02 original featured essay has three real chapters');
 await page.locator('.toc a[href="#space"]').click();
 assert(await page.evaluate(()=>location.hash)==='#space','POST-02 table-of-contents reaches the actual story chapter');
 await page.evaluate(()=>{window.__testPrinted=false;window.print=()=>{window.__testPrinted=true;};});
 await page.locator('#print-story').click();
 assert(await page.evaluate(()=>window.__testPrinted===true)
  &&(await page.locator('#print-note').textContent()).includes('print dialog'),'POST-02 browser Print action is genuine and its status explains the action');

 await page.goto(base+'previews/POST-03/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#results article:visible').count()===5,'POST-03 displays five fictional business updates');
 await page.locator('#search').fill('scope');
 assert(await page.locator('#results article:visible').count()===1
  &&(await page.locator('#result-count').textContent()).includes('1 fictional update'),'POST-03 live search actually filters the update list');
 await page.locator('#clear').click();
 await page.locator('#order').selectOption('oldest');
 assert(await page.locator('#results article').first().getAttribute('data-issue')==='1','POST-03 issue-sort changes the actual document order');
 await page.locator('button[data-type=process]').click();
 assert(await page.locator('#results article:visible').count()===2
  &&await page.locator('button[data-type=process]').getAttribute('aria-pressed')==='true','POST-03 topic filtering respects the underlying issue dataset');

 await page.goto(base+'previews/POST-04/',{waitUntil:'domcontentloaded'});
 await page.locator('#wide').click();
 assert(await page.locator('#reading').getAttribute('data-width')==='wide'
  &&await page.locator('#wide').getAttribute('aria-pressed')==='true','POST-04 readable article width control actually switches the reading layout');
 await page.locator('#font-size').evaluate(el=>{el.value='22';el.dispatchEvent(new Event('input',{bubbles:true}));});
 assert(await page.locator('#size-output').textContent()==='22 px'
  &&(await page.locator('#article').getAttribute('style')).includes('22px'),'POST-04 text-size slider genuinely updates article typography');
 await page.locator('#chapter-three').scrollIntoViewIfNeeded();
 await page.waitForTimeout(130);
 assert((await page.locator('#progress-label').textContent()).includes('% through')
  &&await page.locator('#progress-fill').evaluate(el=>parseFloat(el.style.width)>0),'POST-04 real scrolling updates the article progress indicator');

 await page.goto(base+'previews/EVENT-01/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('.cards article:visible').count()===3,'EVENT-01 displays three honestly fictional cultural programmes');
 await page.locator('button[data-kind=workshop]').click();
 assert(await page.locator('.cards article:visible').count()===1
  &&(await page.locator('#count').textContent()).includes('1 imaginary workshop'),'EVENT-01 category selection genuinely filters exhibition listings');
 await page.locator('.cards article:visible summary').click();
 assert(await page.locator('.cards article:visible details').evaluate(el=>el.open),'EVENT-01 details expand genuine sample-programme information');
 await page.locator('button[data-kind=all]').click();
 assert(await page.locator('.cards article:visible').count()===3,'EVENT-01 can restore every sample exhibition');

 await page.goto(base+'previews/EVENT-02/',{waitUntil:'domcontentloaded'});
 assert(await page.locator('#class-list article:visible').count()===5
  &&await page.locator('#class-calendar').isHidden(),'EVENT-02 sample class schedule defaults to actual readable list');
 await page.locator('button[data-view=calendar]').click();
 assert(await page.locator('#class-calendar').isVisible()
  &&await page.locator('.calendar-col').count()===7,'EVENT-02 Calendar view generates seven real weekday columns');
 await page.locator('button[data-day=thu]').click();
 assert(await page.locator('.calendar-col[data-day=thu] .class-slot:visible').count()===2
  &&await page.locator('.calendar-col[data-day=mon] .class-slot:visible').count()===0
  &&(await page.locator('#results').textContent()).includes('2 fictional'),'EVENT-02 weekday filters apply to genuine calendar cells and status');
 await page.locator('button[data-view=list]').click();
 assert(await page.locator('#class-list article:visible').count()===2,'EVENT-02 same sample sessions power the filtered list representation');
 await page.locator('#reset').click();
 assert(await page.locator('#class-list article:visible').count()===5
  &&await page.locator('#reset').isDisabled(),'EVENT-02 Reset restores unfiltered default view');

 await page.goto(base+'previews/EVENT-03/',{waitUntil:'domcontentloaded'});
 assert((await page.locator('.facts').textContent()).includes('no physical address')
  &&await page.locator('#draft').isHidden(),'EVENT-03 does not imply a real venue or registered attendance');
 await page.locator('#guest').fill('Test Visitor');
 await page.locator('#email').fill('demo@example.com');
 await page.locator('#guests').selectOption('3');
 await page.locator('#ack').check();
 await page.locator('#rsvp-form button[type=submit]').click();
 assert(await page.locator('#draft').isVisible()
  &&(await page.locator('#draft-text').textContent()).includes('UNSENT DRAFT')
  &&(await page.locator('#draft-text').textContent()).includes('3'),'EVENT-03 validating sample RSVP creates a local draft rather than sending a reservation');
 await page.locator('#clear').click();
 assert(await page.locator('#draft').isHidden()
  &&await page.locator('#guest').inputValue()==='','EVENT-03 Clear removes the actual local preview and resets its form');

 await page.goto(base+'previews/EVENT-04/',{waitUntil:'domcontentloaded'});
 assert((await page.locator('#target-label').textContent()).includes('1 APRIL 2027')
  &&await page.locator('#days').evaluate(el=>/^\d+$/.test(el.textContent.trim())),'EVENT-04 computes real numeric countdown from an explicit fictional target');
 await page.locator('button[data-target=summer]').click();
 assert((await page.locator('#target-label').textContent()).includes('1 JULY 2027')
  &&await page.locator('button[data-target=summer]').getAttribute('aria-pressed')==='true','EVENT-04 switching sample targets updates real date arithmetic and active selection');
 await page.locator('#freeze').click();
 assert(await page.locator('#freeze').getAttribute('aria-pressed')==='true'
  &&(await page.locator('#timer-status').textContent()).includes('numbers are frozen'),'EVENT-04 freezes number updates without claiming time has stopped');
 await page.locator('#freeze').click();
 assert(await page.locator('#freeze').getAttribute('aria-pressed')==='false','EVENT-04 can resume current time display');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.reload({waitUntil:'domcontentloaded'});
 assert((await page.locator('#seconds').textContent()).trim()==='—','EVENT-04 reduced-motion users receive no changing seconds');
 await page.emulateMedia({reducedMotion:'no-preference'});

 await page.goto(base+'previews/CONTACT-03/',{waitUntil:'domcontentloaded'});
 assert((await page.locator('.service-info').textContent()).includes('None connected')
  &&await page.locator('#preview').isHidden(),'CONTACT-03 truthfully identifies no live service inbox or saved inquiry');
 await page.locator('#full-name').fill('Example Customer');
 await page.locator('#contact-email').fill('sample@example.com');
 await page.locator('#service').selectOption('Material study');
 await page.locator('#notes').fill('An illustrative request to explore a fictional office planning concept.');
 await page.locator('#ack').check();
 await page.locator('#inquiry button[type=submit]').click();
 assert(await page.locator('#preview').isVisible()
  &&(await page.locator('#preview-text').textContent()).includes('UNSENT'),'CONTACT-03 validated contact form creates only an honest local preview');
 await page.locator('#reset-preview').click();
 assert(await page.locator('#preview').isHidden()
  &&await page.locator('#full-name').inputValue()==='','CONTACT-03 reset clears the preview and actual form inputs');

 await page.goto(base+'previews/CONTACT-04/',{waitUntil:'domcontentloaded'});
 await page.locator('button[data-topic=identity]').click();
 assert(await page.locator('button[data-topic=identity]').getAttribute('aria-pressed')==='true'
  &&(await page.locator('#mail-link').getAttribute('href')).includes('Illustrative%20identity%20concept')
  &&(await page.locator('#draft-summary').textContent()).includes('Identity concept'),'CONTACT-04 topic picker changes actual mailto subject and brief');
 await page.locator('#copy').click();
 await page.waitForFunction(()=>{const value=document.querySelector('#copy-status').textContent;return value.includes('Copied the fictional')||value.includes('manual copying');});
 assert((await page.locator('#copy-status').textContent()).includes('Copied the fictional')
  ||await page.locator('#fallback').isVisible(),'CONTACT-04 performs real clipboard copy or gives a visible manual-copy fallback, never claiming to send an email');
 assert((await page.locator('.compose strong').textContent()).includes('hello@example.com'),'CONTACT-04 openly uses a reserved undeliverable demonstration address');

 for(const id of ['POST-01','POST-02','POST-03','POST-04','EVENT-01','EVENT-02','EVENT-03','EVENT-04','CONTACT-03','CONTACT-04']){
  await page.setViewportSize({width:320,height:790});
  await page.goto(base+'previews/'+id+'/',{waitUntil:'domcontentloaded'});
  const dims=await page.evaluate(()=>({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
  assert(dims.scrollWidth<=dims.viewport+2,id+' has no page-level horizontal overflow at 320px ('+dims.scrollWidth+'/'+dims.viewport+')');
 }
 await page.setViewportSize({width:390,height:844});

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
 await page.waitForFunction(count=>document.querySelectorAll('.cs-item--preview').length===count,components.length,{timeout:12000});
 const urls=await page.locator('.cs-preview-window iframe').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('src')));
 assert(urls.length===components.length&&urls.every(src=>src&&!src.includes('#')),'all '+components.length+' catalogue iframe URLs are fragment-free');
 await page.evaluate(()=>scrollTo(0,1200));
 await page.waitForTimeout(250);
 const before=await page.evaluate(()=>scrollY);
 await page.waitForTimeout(1200);
 const after=await page.evaluate(()=>scrollY);
 assert(Math.abs(after-before)<30,'catalogue scroll stays steady while previews initialize');

 // Real controls in newly built Phase 3 examples and optional motion specimens.
 // Images remain network-blocked here; this suite checks interaction truthfulness,
 // not photography rights or final client image crops.
 await page.setViewportSize({width:390,height:844});
 const openSpecimen=async id=>page.goto(base+'previews/'+id+'/index.html',{waitUntil:'domcontentloaded'});
 await openSpecimen('NAV-02');
 await page.locator('.v-mobile summary').click();
 assert(await page.locator('.v-mobile').evaluate(el=>el.open),'NAV-02 mobile menu opens using native details');
 await openSpecimen('BAR-01');
 await page.locator('#bar-dismiss').click();
 assert(await page.locator('#bar-showcase').isHidden(),'BAR-01 announcement dismisses without a dead action');
 await openSpecimen('HERO-05');
 await page.locator('#h5-next').click();
 assert((await page.locator('#h5-count').textContent()).includes('02')&&await page.locator('[data-slide="1"]').isVisible(),'HERO-05 slideshow advances via its own control');
 await openSpecimen('GAL-05');
 await page.locator('[data-filter="mono"]').click();
 assert(await page.locator('[data-category]:visible').count()===1&&await page.locator('[data-filter="mono"]').getAttribute('aria-pressed')==='true','GAL-05 category filter changes the displayed set and selection state');
 await openSpecimen('GAL-06');
 await page.locator('[data-photo="1"]').click();
 assert(await page.locator('#g6-dialog').evaluate(el=>el.open),'GAL-06 native dialog opens');
 await page.locator('#g6-next').click();
 assert((await page.locator('#g6-position').textContent()).includes('03'),'GAL-06 next image control updates position');
 await page.locator('#g6-close').click();
 await page.waitForFunction(()=>!document.querySelector('#g6-dialog').open && document.activeElement===document.querySelector('[data-photo="1"]'));
 assert(await page.locator('[data-photo="1"]').evaluate(el=>document.activeElement===el),'GAL-06 dialog closes and restores focus');
 await openSpecimen('COMP-01');
 await page.locator('#comp-range').focus();
 await page.locator('#comp-range').press('End');
 assert((await page.locator('#comp-stage').evaluate(el=>el.style.getPropertyValue('--reveal')))==='100%'&&(await page.locator('#comp-value').textContent())==='100%','COMP-01 keyboard slider updates both the image reveal and percentage');
 await openSpecimen('FORM-02');
 await page.locator('#f2-form button[type=submit]').click();
 assert(await page.locator('#f2-output-label').isHidden(),'FORM-02 required fields prevent generating an empty summary');
 await page.locator('select[name=type]').selectOption({label:'Renovation'});
 await page.locator('input[name=name]').fill('Demo Customer');
 await page.locator('input[name=email]').fill('demo@example.com');
 await page.locator('select[name=timeline]').selectOption({label:'3–6 months'});
 await page.locator('textarea[name=details]').fill('Renovation of an illustrative kitchen.');
 await page.locator('#f2-form button[type=submit]').click();
 assert(await page.locator('#f2-output-label').isVisible()&&(await page.locator('#f2-output').inputValue()).includes('NOT SENT'),'FORM-02 generates an honest local-only enquiry preview');
 // CDN photos are intentionally blocked during Chromium QA. The fallback must
 // be legible, explicit and leave each selector operational.
 await openSpecimen('ANIM-12');
 await page.locator('[data-a12-frame="0"] img').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>document.querySelector('[data-a12-frame="0"] .a12-photo-fallback')?.hidden===false);
 assert(await page.locator('[data-a12-frame="0"] img').evaluate(img=>img.hidden),
  'ANIM-12 presents an honest photo-unavailable state instead of broken image chrome');
 await page.locator('[data-a12-select="1"]').click();
 await page.locator('[data-a12-frame="1"] img').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>document.querySelector('[data-a12-frame="1"] .a12-photo-fallback')?.hidden===false);
 assert((await page.locator('#a12-status').textContent()).includes('Off duty'),
  'ANIM-12 photo selector remains operational with remote media unavailable');
 await openSpecimen('HERO-09');
 await page.locator('#main-image').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>document.querySelector('#main-image-fallback')?.hidden===false);
 assert(await page.locator('#main-image').evaluate(img=>img.hidden)
  &&(await page.locator('#selected-description').textContent()).includes('unavailable'),
  'HERO-09 explains failed media without exposing a broken image');
 await page.locator('[data-study="1"]').click();
 await page.waitForFunction(()=>document.querySelector('#main-image-fallback')?.hidden===false);
 assert((await page.locator('#main-caption').textContent()).includes('A PLACE TO GATHER'),
  'HERO-09 preserves live image-index captions when a photo fails');
 await openSpecimen('NAV-05');
 await page.locator('#landscape .image img').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>document.querySelector('#landscape .photo-fallback')?.hidden===false);
 assert(await page.locator('#landscape .image img').evaluate(img=>img.hidden)
  &&await page.locator('#landscape .image .photo-fallback').isVisible(),
  'NAV-05 landscape gracefully presents unavailable independent stock photography');
 await openSpecimen('ANIM-05');
 await page.locator('[data-material="stone"]').click();
 assert(await page.locator('#a5-stone').isVisible()&&await page.locator('#a5-oak').isHidden(),'ANIM-05 content selection changes the correct material panel');
 await openSpecimen('ANIM-07');
 await page.locator('[data-step="3"]').click();
 assert((await page.locator('#a7-progress').getAttribute('style')).includes('100%')&&(await page.locator('#a7-stage').textContent()).includes('04 OF 04'),'ANIM-07 fourth process step moves progress to 100%');
 await openSpecimen('ANIM-01');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('#a1-play').click();
 assert((await page.locator('#a1-status').textContent()).includes('Reduced motion'),'ANIM-01 honours reduced-motion playback preference');
 await page.emulateMedia({reducedMotion:'no-preference'});
 


 // True unscaled desktop captures, separate from the 390px review-host screenshots.
 // Remote third-party photos are blocked for deterministic CI: this is a layout
 // and fallback audit only, NOT a photographic crop or rights approval.
 const desktopDir=path.join(evidence,'desktop-native');
 mkdirSync(desktopDir,{recursive:true});
 const desktopMetrics=[];
 for(const id of ['NAV-05','HERO-09','GAL-07','GAL-08','PRICE-02','SRV-06','TEST-01','POST-02','EVENT-03','CONTACT-03','ANIM-12']){
  await page.setViewportSize({width:1440,height:900});
  await page.goto(base+'previews/'+id+'/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(80);
  const dimensions=await page.evaluate(()=>({
   width:innerWidth,
   documentWidth:document.documentElement.scrollWidth,
   headingCount:document.querySelectorAll('h1').length,
   visibleHeading:[...document.querySelectorAll('h1')].some(h=>{const r=h.getBoundingClientRect();return r.width>60&&r.height>20&&r.top<900&&r.bottom>0;})
  }));
  assert(dimensions.width===1440&&dimensions.documentWidth<=1442,
   id+' native 1440px desktop has no page-wide horizontal overflow');
  assert(dimensions.visibleHeading,id+' native 1440px desktop has a visible page heading');
  await page.screenshot({path:path.join(desktopDir,id+'-1440.png'),animations:'disabled'});
  desktopMetrics.push({id,...dimensions});
 }
 for(const id of ['NAV-05','SRV-06','POST-02','EVENT-03']){
  await page.setViewportSize({width:1280,height:800});
  await page.goto(base+'previews/'+id+'/',{waitUntil:'domcontentloaded'});
  const dimensions=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth}));
  assert(dimensions.width===1280&&dimensions.documentWidth<=1282,id+' native 1280px desktop has no page-wide overflow');
  await page.screenshot({path:path.join(desktopDir,id+'-1280.png'),animations:'disabled'});
  desktopMetrics.push({id,...dimensions});
 }
 writeFileSync(path.join(desktopDir,'measurements.json'),JSON.stringify(desktopMetrics,null,2));

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