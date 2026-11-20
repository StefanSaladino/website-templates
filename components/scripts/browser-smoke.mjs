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
 const expectedTag={headers:'header',heroes:'section',galleries:'section',services:'section','calls-to-action':'section',forms:'section',process:'section',introductions:'section',testimonials:'section',footers:'footer',animations:'section',announcements:'section',projects:'section',contact:'section','before-after':'section',about:'section',products:'section',pricing:'section',menus:'section',booking:'section'}[item.category];
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
 page.on('pageerror',e=>errors.push(String(e)));
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