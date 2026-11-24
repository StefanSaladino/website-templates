/* Isolated phone-layout alternative audit.
 * CSS/DOM and screenshot QA only; stock media is blocked and human/native
 * device visual or accessibility acceptance cannot be inferred from passing.
 */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,'components/mobile-alternative-evidence');
mkdirSync(out,{recursive:true});
const alternatives=JSON.parse(readFileSync(path.join(root,'components/data/mobile-treatments.json'),'utf8'))
 .filter(x=>x.status==='in-review');
const widths=[320,390],base='http://127.0.0.1:4250/components/';
const result={date:new Date().toISOString(),scope:alternatives.length+' independent in-review phone alternatives',
 widths,stockMediaLoaded:false,realDeviceTest:false,screenReaderApproved:false,
 stakeholderApproved:false,rightsApproved:false,cases:[],screenshots:[],warnings:[],errors:[]};
const server=spawn('python3',['-m','http.server','4250','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
let browser;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
try{
 if(new Set(alternatives.map(x=>x.id)).size!==alternatives.length)
  throw Error('Duplicate in-review alternatives');
 let ready=false;
 for(let i=0;i<60;i++){try{if((await fetch(base+'index.html')).ok){ready=true;break}}catch{}await sleep(200)}
 if(!ready)throw Error('Mobile alternative preview server did not start');
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 if(!executablePath)throw Error('System Chromium required');
 browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox']});
 for(const alt of alternatives){
  const parts=/^\.\/previews\/([A-Z0-9]+-\d+)\/\?mobile=(M-[A-Z0-9]+-\d+)$/.exec(alt.previewRoute||'');
  if(!parts){result.errors.push(alt.id+' malformed previewRoute '+alt.previewRoute);continue}
  const [,componentId,mobileId]=parts;
  if(mobileId!==alt.id||!alt.compatibleComponentIds?.includes(componentId))
   result.errors.push(alt.id+' route/compatibility mismatch: '+componentId);
  if(!existsSync(path.join(root,'components/previews',componentId,'index.html')))
   result.errors.push(alt.id+' missing preview document for '+componentId);
  for(const width of widths){
   const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1,
     hasTouch:true,isMobile:true,reducedMotion:'reduce'});
   const page=await context.newPage(),pageErrors=[],films=[];
   page.on('pageerror',e=>pageErrors.push(String(e)));
   page.on('request',request=>{if(/videos\.pexels\.com/.test(request.url()))films.push(request.url())});
   // Keep phone composition evidence deterministic, offline and free of
   // third-party photo/video downloads; rights and crop review is separate.
   await page.route(/^https:\/\/(?:images\.unsplash\.com|images\.pexels\.com|videos\.pexels\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//,r=>r.abort('blockedbyclient'));
   try{
    const response=await page.goto(new URL(alt.previewRoute,base).href,
      {waitUntil:'domcontentloaded',timeout:18000});
    if(response?.status()!==200)throw Error('Preview HTTP '+response?.status());
    await page.waitForFunction(id=>document.body.dataset.mobileTreatment===id,alt.id,{timeout:7000});
    await page.waitForTimeout(160);
    const info=await page.evaluate(()=>{
      const links=[...document.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),summary')]
       .filter(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();
         return !el.closest('[inert],[hidden],[aria-hidden="true"]')&&s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0});
      const small=links.map(el=>{
        const r=el.getBoundingClientRect();
        return {tag:el.tagName.toLowerCase(),label:(el.getAttribute('aria-label')||el.textContent||'').trim().replace(/\s+/g,' ').slice(0,55),
          width:Math.round(r.width),height:Math.round(r.height)};
      }).filter(el=>el.width<24||el.height<24).slice(0,14);
      const main=document.querySelector('main');
      const heading=document.querySelector('h1,h2,h3');
      const headingRect=heading?.getBoundingClientRect();
      return {selected:document.body.dataset.mobileTreatment||null,
        viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,
        reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,
        hasMain:Boolean(main),hasHeading:Boolean(heading)&&Boolean(headingRect?.height),
        visibleControls:links.length,smallTargetCandidates:small};
    });
    const entry={id:alt.id,componentId,width,...info,pageErrors,filmRequests:films};
    result.cases.push(entry);
    if(info.viewport!==width)result.errors.push(alt.id+' '+width+' CSS viewport mismatch: '+info.viewport);
    if(info.selected!==alt.id)result.errors.push(alt.id+' '+width+' alternative not selected');
    if(info.documentWidth>width+4)result.errors.push(alt.id+' '+width+' document overflow '+info.documentWidth);
    // Five source-confirmed footer review links previously had 12px hitbox
    // heights. The component CSS must restore standalone 36px targets.
    if(['CONTACT-01','FORM-02','NAV-02','SRV-01','PRJ-03'].includes(componentId)){
      const reviewer=page.locator('.ba-sample-end a[href*="review.html"]');
      const area=await reviewer.evaluateAll(anchors=>anchors.map(el=>{
        const r=el.getBoundingClientRect(),s=getComputedStyle(el);
        return {height:Math.round(r.height),width:Math.round(r.width),display:s.display};
      }));
      if(area.length!==1||area[0].height<32||area[0].width<24)
        result.errors.push(alt.id+' '+width+' undersized standalone footer review target: '+JSON.stringify(area));
    }
    if(!info.reduced||!info.hasMain||!info.hasHeading)result.errors.push(alt.id+' '+width+' missing base accessible content/reduced preference');
    if(pageErrors.length)result.errors.push(alt.id+' '+width+' JS errors '+JSON.stringify(pageErrors));
    if(films.length)result.errors.push(alt.id+' '+width+' unexpected video loading');
    if(info.smallTargetCandidates.length)
      result.warnings.push({id:alt.id,width,type:'size-review',controls:info.smallTargetCandidates});
    const file=alt.id+'-'+width+'.png';
    await page.screenshot({path:path.join(out,file),animations:'disabled',timeout:14000});
    result.screenshots.push(file);
    console.log('MOBILE-ALT',alt.id,width+'px','scroll='+info.documentWidth,
      'controls='+info.visibleControls,'size candidates='+info.smallTargetCandidates.length);
   }catch(error){result.errors.push(alt.id+' '+width+' browser error '+String(error?.stack||error))}
   finally{await context.close()}
  }
 }
}catch(error){result.errors.push('Fatal alternative audit '+String(error?.stack||error))}
finally{
 await browser?.close().catch(()=>{});
 server.kill('SIGTERM');
 writeFileSync(path.join(out,'results.json'),JSON.stringify(result,null,2));
 console.log('Mobile alternative review:',result.cases.length,'viewport cases,',
  result.screenshots.length,'screenshots,',result.warnings.length,'manual size flags,',
  result.errors.length,'hard errors');
 for(const e of result.errors)console.error('MOBILE-ALT-FAIL:',e);
 if(result.errors.length)process.exitCode=1;
}
