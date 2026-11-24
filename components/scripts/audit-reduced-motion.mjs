/* Full-template reduced-motion audit for all in-review ANIM patterns.
 * This is a controlled Chromium preference-and-render check only: not a physical
 * device or screen-reader audit, nor a legal/production approval.
 */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const directory=path.join(root,'components/reduced-motion-evidence');
mkdirSync(directory,{recursive:true});
const records=JSON.parse(readFileSync(path.join(root,'components/data/components.json'),'utf8'))
  .filter(x=>x.category==='animations'&&x.status==='in-review');
const widths=[390,1440];
const base='http://127.0.0.1:4241/templates/';
const sleep=ms=>new Promise(done=>setTimeout(done,ms));
const results={checkedAt:new Date().toISOString(),branch:'feature/component-showroom',
  prefersReducedMotion:true,realDeviceApproval:false,accessibilityCertified:false,
  mediaRightsApproved:false,patterns:records.map(x=>x.id),cases:[],screenshots:[],warnings:[],errors:[]};
const server=spawn('python3',['-m','http.server','4241','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
let browser;
try{
 if(!records.length||new Set(records.map(x=>x.id)).size!==records.length)
  throw Error('Expected unique nonempty in-review ANIM entries, found '+records.length);
 let ready=false;
 for(let i=0;i<60;i++){try{if((await fetch(base+'quiet-saas/index.html')).ok){ready=true;break}}catch{}await sleep(200)}
 if(!ready)throw Error('Source-template HTTP server unavailable');
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 if(!executablePath)throw Error('System Chromium required for reduced-motion evidence');
 browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox']});
 for(const item of records){
  const match=/^\.\.\/templates\/([a-z-]+)\/index\.html#([a-z0-9-]+)$/.exec(item.fullTemplateRoute||'');
  if(!match){results.errors.push(item.id+' invalid connected fullTemplateRoute');continue}
  const [,template,fragment]=match;
  for(const width of widths){
   const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});
   const page=await context.newPage();
   const pageErrors=[],films=[];
   page.on('pageerror',e=>pageErrors.push(String(e)));
   page.on('request',r=>{if(/videos\.pexels\.com/.test(r.url()))films.push(r.url())});
   await page.route(/^https:\/\/(?:images\.unsplash\.com|images\.pexels\.com|videos\.pexels\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//,route=>route.abort('blockedbyclient'));
   try{
    const response=await page.goto(base+template+'/index.html',{waitUntil:'domcontentloaded',timeout:20000});
    if(response?.status()!==200)throw Error('Source template HTTP '+response?.status());
    const target=page.locator('[data-motion-pattern="'+item.id+'"]');
    if(await target.count()!==1)throw Error('Expected one integrated motion target, found '+await target.count());
    await target.evaluate(el=>el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'}));
    await page.waitForTimeout(350);
    const info=await page.evaluate((id)=>{
      const el=document.querySelector('[data-motion-pattern="'+id+'"]');
      const rect=el.getBoundingClientRect(),style=getComputedStyle(el);
      const animations=el.getAnimations({subtree:true}).filter(anim=>
        anim.playState==='running'&&Number(anim.effect?.getComputedTiming().duration)>250
      ).slice(0,8).map(anim=>({type:anim.constructor.name,
        duration:anim.effect?.getComputedTiming().duration||null,
        name:anim.animationName||'',playState:anim.playState}));
      const headings=[...el.querySelectorAll('h1,h2,h3')];
      if(el.matches('h1,h2,h3'))headings.unshift(el);
      const invisibleHeadings=headings.filter(h=>{
        // A tabbed/carousel panel intentionally hidden until selected is
        // not missing content. Verify it can be opened separately below.
        if(h.closest('[hidden],[inert],[aria-hidden="true"]'))return false;
        const c=getComputedStyle(h),b=h.getBoundingClientRect();
        return c.display==='none'||c.visibility==='hidden'||Number(c.opacity)===0||b.width<2||b.height<2;
      }).map(h=>h.textContent?.trim().slice(0,90)||'').slice(0,5);
      const subjectOffset=rect.top+rect.height/2;
      return {motionPreference:matchMedia('(prefers-reduced-motion: reduce)').matches,
        targetWidth:Math.round(rect.width),targetHeight:Math.round(rect.height),
        targetOpacity:style.opacity,targetVisibility:style.visibility,targetDisplay:style.display,
        scrollWidth:document.documentElement.scrollWidth,cssViewport:innerWidth,
        integratedHeadingCount:headings.length,invisibleHeadings,animations,
        subjectOffset:Math.round(subjectOffset)};
    },item.id);
    const anchorFound=await page.evaluate(anchor=>Boolean(document.getElementById(anchor)),fragment);
    const caseData={pattern:item.id,title:item.title,template,fragment,width,
      anchorFound,pageErrors,filmRequests:films,details:info};
    results.cases.push(caseData);
    if(!info.motionPreference)results.errors.push(item.id+' '+width+' failed to respect reduced-motion media emulation');
    if(!anchorFound)results.errors.push(item.id+' '+width+' missing required anchor #'+fragment);
    if(info.targetWidth<80||info.targetHeight<18||info.targetDisplay==='none'||info.targetVisibility==='hidden'||Number(info.targetOpacity)===0)
      results.errors.push(item.id+' '+width+' integrated target not visible: '+JSON.stringify(info));
    if(info.invisibleHeadings.length)results.errors.push(item.id+' '+width+' essential headings hidden: '+JSON.stringify(info.invisibleHeadings));
    if(info.animations.length)results.errors.push(item.id+' '+width+' long-running animation with reduce: '+JSON.stringify(info.animations));
    // ANIM-19 is a real two-state router. A hidden Tomorrow panel is correct
    // until selected; verify that both views are reachable without animation.
    if(item.id==='ANIM-19'){
      const readState=()=>page.evaluate(()=>{
        const today=document.querySelector('[data-tide-view="today"]');
        const tomorrow=document.querySelector('[data-tide-view="tomorrow"]');
        const status=document.querySelector('[data-tide-status]')?.textContent||'';
        const running=document.querySelector('[data-tide-root]')?.getAnimations({subtree:true})
          .filter(anim=>anim.playState==='running'&&Number(anim.effect?.getComputedTiming().duration)>250).length||0;
        return {hash:location.hash,todayHidden:today?.hidden,tomorrowHidden:tomorrow?.hidden,
          status,tomorrowTransition:tomorrow?.classList.contains('is-entering'),running,
          tomorrowCurrent:document.querySelector('[data-tide-link="tomorrow"]')?.getAttribute('aria-current')||null};
      });
      await page.locator('[data-tide-link="tomorrow"]').click();
      const tomorrow=await readState();
      caseData.tomorrowInteraction=tomorrow;
      if(tomorrow.hash!=='#tide-tomorrow'||tomorrow.todayHidden!==true||
        tomorrow.tomorrowHidden!==false||tomorrow.tomorrowCurrent!=='page'||
        tomorrow.tomorrowTransition||tomorrow.running)
        results.errors.push(item.id+' '+width+' Tomorrow reduced-motion view is broken: '+JSON.stringify(tomorrow));
      await page.locator('[data-tide-link="today"]').click();
      const today=await readState();
      caseData.todayInteraction=today;
      if(today.hash!=='#tide-today'||today.todayHidden!==false||
        today.tomorrowHidden!==true||today.tomorrowTransition||today.running)
        results.errors.push(item.id+' '+width+' Today reduced-motion view is broken: '+JSON.stringify(today));
    }
    if(info.scrollWidth>width+4)results.errors.push(item.id+' '+width+' root document overflows '+info.scrollWidth);
    if(films.length)results.errors.push(item.id+' '+width+' unexpected film network attempt');
    if(pageErrors.length)results.errors.push(item.id+' '+width+' page script errors: '+JSON.stringify(pageErrors));
    const filename=item.id+'-'+width+'.png';
    await page.screenshot({path:path.join(directory,filename),animations:'allow',timeout:15000});
    results.screenshots.push(filename);
    console.log('REDUCED-MOTION',item.id,template,width+'px','active long animations='+info.animations.length,
      'root='+info.scrollWidth,'warnings='+info.invisibleHeadings.length);
   }catch(error){results.errors.push(item.id+' '+width+' browser error '+String(error?.stack||error))}
   finally{await context.close()}
  }
 }
}catch(error){results.errors.push('Fatal reduced-motion audit '+String(error?.stack||error))}
finally{
 await browser?.close().catch(()=>{});
 server.kill('SIGTERM');
 writeFileSync(path.join(directory,'results.json'),JSON.stringify(results,null,2));
 console.log('Reduced-motion full-template review:',results.cases.length,'viewport cases,',
  results.screenshots.length,'screenshots,',results.errors.length,'hard errors');
 for(const err of results.errors)console.error('REDUCED-MOTION-FAIL:',err);
 if(results.errors.length)process.exitCode=1;
}
