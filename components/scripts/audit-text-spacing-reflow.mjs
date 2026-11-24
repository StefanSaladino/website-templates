/* Responsive effective-viewport and WCAG 1.4.12 text-spacing stress check.
 * 320/640 CSS-pixel viewport widths approximate the RE-FLOW content area at
 * 400% / 200% of a 1280px browser window. This is NOT a real zoom interaction,
 * human visual certification, native screen-reader or physical-device check.
 */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,readdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {discoverTemplates} from './template-catalogue.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,'components/reflow-text-spacing-evidence');
mkdirSync(out,{recursive:true});
const templates=discoverTemplates(root);
const widths=[320,640],modes=['baseline','spacing'];
const origin='http://127.0.0.1:4263/templates/';
const result={checkedAt:new Date().toISOString(),scope:templates.length+' complete full-page templates',
 widths,conditions:['baseline effective CSS width','WCAG 1.4.12 enlarged text spacing'],
 trueBrowserZoomTest:false,nativeDeviceAcceptance:false,
 realScreenReaderTest:false,loadedPhotoContrast:false,mediaRightsApproved:false,
 cases:[],warnings:[],errors:[],screenshots:[]};
const server=spawn('python3',['-m','http.server','4263','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let browser;
try{
 let ok=false;for(let i=0;i<60;i++){try{if((await fetch(origin+templates[0]+'/index.html')).ok){ok=true;break}}catch{}await sleep(200)}
 if(!ok)throw Error('Original template HTTP server unavailable');
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 if(!executablePath)throw Error('System Chrome required');
 browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox']});
 for(const template of templates)for(const width of widths)for(const mode of modes){
  const context=await browser.newContext({viewport:{width,height:880},deviceScaleFactor:1,reducedMotion:'reduce'});
  const page=await context.newPage(),pageErrors=[],film=[];
  page.on('pageerror',e=>pageErrors.push(String(e)));
  page.on('request',r=>{if(/videos\.pexels\.com/.test(r.url()))film.push(r.url())});
  // CDN media is excluded to keep typography/layout evidence repeatable;
  // loaded-media crops, focus contrast and license are separate release gates.
  await page.route(/^https:\/\/(?:images\.unsplash\.com|images\.pexels\.com|videos\.pexels\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//,r=>r.abort('blockedbyclient'));
  try{
   const response=await page.goto(origin+template+'/index.html',{waitUntil:'domcontentloaded',timeout:20000});
   if(response?.status()!==200)throw Error('HTTP '+response?.status());
   if(mode==='spacing'){
    // WCAG text-spacing challenge: line height 1.5x, paragraph gap 2x,
    // letter spacing .12x and word spacing .16x, without changing layout overflow.
    await page.addStyleTag({content:`body *{letter-spacing:.12em!important;word-spacing:.16em!important}
      p,li,blockquote,dd,dt,figcaption{line-height:1.5!important}
      p{margin-bottom:2em!important}`});
   }
   await page.waitForTimeout(80);
   const detail=await page.evaluate(()=>{
     const rootWidth=document.documentElement.scrollWidth;
     const visible=el=>{const cs=getComputedStyle(el),r=el.getBoundingClientRect();
       return !el.closest('[inert],[hidden],[aria-hidden="true"]')&&cs.display!=='none'&&
        cs.visibility!=='hidden'&&r.width>0&&r.height>0};
     const headings=[...document.querySelectorAll('main h1,main h2,main h3')].filter(visible);
     const clippedHeadings=headings.filter(el=>{
       const c=getComputedStyle(el);
       return ['hidden','clip','scroll','auto'].includes(c.overflowX)&&el.scrollWidth>el.clientWidth+4;
     }).slice(0,10).map(el=>({text:el.textContent.trim().replace(/\s+/g,' ').slice(0,70),overflow:el.scrollWidth-el.clientWidth}));
     const buttons=[...document.querySelectorAll('button,a[href],input,select,textarea')].filter(visible);
     const textTargets=buttons.filter(el=>{
       const c=getComputedStyle(el);
       return c.overflowX!=='visible'&&el.scrollWidth>el.clientWidth+4;
     }).slice(0,10).map(el=>({text:(el.getAttribute('aria-label')||el.textContent||el.value||'').trim().replace(/\s+/g,' ').slice(0,80),
       overflow:el.scrollWidth-el.clientWidth}));
     const candidates=[...document.querySelectorAll('main h1,main h2,main h3, main p,main a,main button')].filter(visible)
      .filter(el=>{const r=el.getBoundingClientRect(),c=getComputedStyle(el);
       return r.right>innerWidth+5&&c.position!=='fixed'&&c.position!=='absolute';
      }).slice(0,10).map(el=>({tag:el.tagName.toLowerCase(),text:el.textContent.trim().slice(0,50),
       right:Math.round(el.getBoundingClientRect().right)}));
     return {width:innerWidth,documentWidth:rootWidth,
       main:!!document.querySelector('main'),h1:!!document.querySelector('main h1'),
       visibleHeadingCount:headings.length,controls:buttons.length,
       clippedHeadings,textTargets,candidates,
       reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches};
   });
   const row={template,width,mode,...detail,scriptErrors:pageErrors,videoRequests:film.length};
   // Pure scroll-width checks can pass while a headline breaks a single word
   // into two letter fragments. Lock the visual correction to an actual text
   // range in the 320px enlarged-spacing contractor hero.
   if(template==='contractor'&&width===320&&mode==='spacing'){
     const wordLines=await page.locator('#hero-title').evaluate(el=>{
       const node=[...el.childNodes].find(n=>n.nodeType===Node.TEXT_NODE&&
         n.textContent.includes('renovation'));
       if(!node)return -1;
       const start=node.textContent.indexOf('renovation'),range=document.createRange();
       range.setStart(node,start);range.setEnd(node,start+'renovation'.length);
       return range.getClientRects().length;
     });
     row.renovationWordLines=wordLines;
     if(wordLines!==1)result.errors.push('contractor 320 spacing hero splits "renovation" across lines: '+wordLines+' fragments');
   }
   result.cases.push(row);
   if(detail.documentWidth>width+4)
    result.errors.push(template+' '+width+' '+mode+' page-wide horizontal overflow '+detail.documentWidth);
   if(!detail.main||!detail.h1||!detail.reducedMotion)
    result.errors.push(template+' '+width+' '+mode+' missing basic semantic/reduced-motion state');
   if(pageErrors.length)result.errors.push(template+' '+width+' '+mode+' JS errors '+JSON.stringify(pageErrors));
   if(film.length)result.errors.push(template+' '+width+' '+mode+' unexpected film transfer');
   if(detail.clippedHeadings.length||detail.textTargets.length)
    result.warnings.push({template,width,mode,clippedHeadings:detail.clippedHeadings,
      clippedInteractiveTargets:detail.textTargets});
   if(mode==='spacing'){
    const file=template+'-'+width+'-spacing.png';
    await page.screenshot({path:path.join(out,file),animations:'disabled',timeout:15000});
    result.screenshots.push(file);
   }
   console.log('REFLOW',template,width+'px',mode,'root='+detail.documentWidth,
     'clipped='+detail.clippedHeadings.length,'targets='+detail.textTargets.length);
  }catch(e){result.errors.push(template+' '+width+' '+mode+' browser exception '+String(e?.stack||e))}
  finally{await context.close()}
 }
}catch(e){result.errors.push('Fatal text-spacing/reflow runner '+String(e?.stack||e))}
finally{
 await browser?.close().catch(()=>{});
 server.kill('SIGTERM');
 writeFileSync(path.join(out,'results.json'),JSON.stringify(result,null,2));
 console.log('Original template reflow/text-spacing review:',result.cases.length,
  'cases,',result.screenshots.length,'screenshots,',result.warnings.length,
  'clipping-review entries,',result.errors.length,'hard errors');
 for(const e of result.errors)console.error('REFLOW-FAIL',e);
 if(result.errors.length)process.exitCode=1;
}
