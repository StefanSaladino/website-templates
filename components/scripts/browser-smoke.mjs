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
  await page.locator('input[name=mobile][value=alternate]').check({force:true});
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
 const expectedTag={headers:'header',heroes:'section',galleries:'section',services:'section','calls-to-action':'section',forms:'section',process:'section',introductions:'section',testimonials:'section',footers:'footer',animations:'section',announcements:'section',projects:'section',contact:'section','before-after':'section',about:'section'}[item.category];
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