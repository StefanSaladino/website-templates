/* Browser touch-geometry evidence for all complete sites, not a WCAG/device audit. */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,readdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {discoverTemplates} from './template-catalogue.mjs';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const directory=path.join(root,'components','touch-geometry-evidence');
mkdirSync(directory,{recursive:true});
const templates=discoverTemplates(root);
const sizes=[320,390,768,1280,1440],origin='http://127.0.0.1:4221/templates/';
const server=spawn('python3',['-m','http.server','4221','--bind','127.0.0.1'],{cwd:path.join(root,'dist'),stdio:'ignore'});
const report={date:new Date().toISOString(),automatedTouchAcceptance:false,physicalDeviceTest:false,mediaRightsApproved:false,cases:[],warnings:[],errors:[],screenshots:[]};
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let browser;
try{
 for(let i=0;i<50;i++){try{if((await fetch(origin+templates[0]+'/index.html')).ok)break;}catch{}await delay(200);}
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox']});
 for(const template of templates)for(const width of sizes){
  const context=await browser.newContext({viewport:{width,height:860},reducedMotion:'reduce',deviceScaleFactor:1});
  const page=await context.newPage(),errors=[],film=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('request',r=>{if(/videos\.pexels\.com/.test(r.url()))film.push(r.url());});
  await page.route(/^https:\/\/(?:images\.unsplash\.com|images\.pexels\.com|videos\.pexels\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//,r=>r.abort());
  try{
   const response=await page.goto(origin+template+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
   if(response?.status()!==200)throw Error('HTTP '+response?.status());
   const geometry=await page.evaluate(()=>{
    const visible=el=>{
     if(el.closest('[inert],[hidden],[aria-hidden="true"]')||el.matches('input[type="hidden"]'))return false;
     const css=getComputedStyle(el),r=el.getBoundingClientRect();
     return css.display!=='none'&&css.visibility==='visible'&&Number(css.opacity)>0&&r.width>0&&r.height>0;
    };
    const interactive=[...document.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),summary,[role="button"]:not([aria-disabled="true"]),[role="link"]')].filter(visible);
    const dimensions=interactive.map(el=>{
     const r=el.getBoundingClientRect();
     const tag=el.tagName.toLowerCase();
     const scope=el.closest('main,section,header,footer,nav,[role="dialog"]');
     const scopeName=scope?(scope.id?'#'+scope.id:scope.tagName.toLowerCase()+'.'+String(scope.className||'').trim().split(/\s+/)[0]):'body';
     const selector=(el.id?'#'+el.id:tag+(typeof el.className==='string'&&el.className.trim()?'.'+el.className.trim().split(/\s+/).slice(0,2).join('.'):''));
     return {tag,label:(el.getAttribute('aria-label')||el.innerText||el.textContent||'').trim().replace(/\s+/g,' ').slice(0,72),
      selector,scope:scopeName,width:Math.round(r.width),height:Math.round(r.height),
      top:Math.round(r.top),left:Math.round(r.left),
      inline:el.matches('a')&&getComputedStyle(el).display==='inline'};
    });
    const small=dimensions.filter(x=>x.width<24||x.height<24);
    const clipped=[...document.querySelectorAll('h1,h2')].filter(visible).filter(el=>{
     const css=getComputedStyle(el);return css.overflowX!=='visible'&&el.scrollWidth>el.clientWidth+3;
    }).map(el=>(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,85));
    // Invisible-on-entry reveal elements still contribute to intrinsic widths.
    // Include opacity:0 nodes here; only actual display:none/hidden nodes are skipped.
    const overflowing=[...document.querySelectorAll('body *')].filter(el=>{
      const css=getComputedStyle(el),r=el.getBoundingClientRect();
      return css.display!=='none'&&css.visibility!=='hidden'&&r.width>0&&r.height>0
        &&!el.closest('[hidden],[inert]');
    }).map(el=>{
      const rect=el.getBoundingClientRect();
      const chain=[];for(let parent=el.parentElement;parent&&parent!==document.body;parent=parent.parentElement){
        const overflow=getComputedStyle(parent).overflowX;
        if(['hidden','clip','auto','scroll'].includes(overflow))chain.push(parent.tagName.toLowerCase()+'.'+String(parent.className||'').split(' ')[0]);
      }
      return {tag:el.tagName.toLowerCase(),className:typeof el.className==='string'?el.className.slice(0,65):'',
        right:Math.round(rect.right),left:Math.round(rect.left),width:Math.round(rect.width),
        text:(el.textContent||'').trim().replace(/\\s+/g,' ').slice(0,45),clippedBy:chain.slice(0,3)};
     }).filter(x=>x.right>innerWidth+4&&x.width>0)
      .sort((a,b)=>(a.clippedBy.length-b.clippedBy.length)||(b.right-a.right)).slice(0,15);
    const intrinsicOverflow=[...document.querySelectorAll('body *')].filter(el=>{
      const css=getComputedStyle(el);
      return css.display!=='none'&&css.visibility!=='hidden'
        &&el.clientWidth>0&&el.scrollWidth>el.clientWidth+8;
    }).map(el=>({tag:el.tagName.toLowerCase(),
      cls:typeof el.className==='string'?el.className.slice(0,70):'',
      client:el.clientWidth,scroll:el.scrollWidth,excess:el.scrollWidth-el.clientWidth}))
      .sort((a,b)=>b.excess-a.excess).slice(0,12);
    return {documentWidth:document.documentElement.scrollWidth,controls:dimensions.length,
      smallControls:small.length,examples:small,clippedHeadings:clipped,
      unnamedButtons:dimensions.filter(x=>x.tag==='button'&&!x.label).slice(0,8),
      overflowCandidates:overflowing,intrinsicOverflow};
   });
   report.cases.push({template,width,...geometry});
   if(geometry.documentWidth>width+4){
      report.warnings.push({template,width,type:'horizontal-overflow',actual:geometry.documentWidth,offenders:geometry.overflowCandidates});
      console.log('OVERFLOW-DIAG',template,width+'px',JSON.stringify({rect:geometry.overflowCandidates.slice(0,7),intrinsic:geometry.intrinsicOverflow.slice(0,8)}));
    }
   if(geometry.smallControls)report.warnings.push({template,width,type:'target-size-review',count:geometry.smallControls});
   // Keep CSS hitbox regressions for confirmed isolated controls separate from
   // general 24px candidate warnings (inline-link spacing exceptions need human review).
   const targetedHitboxes={
     storefront:['.swatches button','.cart-action','.under-add','.cart-line button'],
     'muskoka-retreat':['.availability-form input[type="date"]','.availability-form select'],
     'interactive-playground':['.lab-bottom button','.type-lab input[type="range"]'],
     landscaping:['.site-footer .credits a']
   };
   for(const selector of targetedHitboxes[template]||[]){
     const small=await page.locator(selector).evaluateAll(elements=>elements.filter(el=>{
       const css=getComputedStyle(el),r=el.getBoundingClientRect();
       return css.display!=='none'&&css.visibility!=='hidden'&&r.width>0&&r.height>0&&(r.width<24||r.height<24);
     }).map(el=>({label:el.getAttribute('aria-label')||el.textContent?.trim().slice(0,50)||'',
       width:Math.round(el.getBoundingClientRect().width),height:Math.round(el.getBoundingClientRect().height)})));
     if(small.length)report.errors.push({template,width,type:'small-targeted-hitbox-regression',selector,controls:small});
   }
   if(geometry.clippedHeadings.length)report.warnings.push({template,width,type:'possible-clipping',headings:geometry.clippedHeadings});
   if(geometry.unnamedButtons.length)report.warnings.push({template,width,type:'unnamed-buttons',controls:geometry.unnamedButtons});
   // Every template now has a hard root-overflow gate at all five audited
   // widths. Previous 120-case browser evidence showed zero root overflows;
   // preserve that invariant across all current designs, not only YARD/KERN.
   if(geometry.documentWidth>width+4){
      report.errors.push({template,width,type:'responsive-overflow-regression',
        viewport:width,scrollWidth:geometry.documentWidth,offenders:geometry.overflowCandidates,
        intrinsic:geometry.intrinsicOverflow});
    }
    if(errors.length)report.errors.push({template,width,type:'browser-errors',errors});
   if(film.length)report.errors.push({template,width,type:'unexpected-video-attempt',urls:film});
   if(width===390){const file=template+'-390.png';await page.screenshot({path:path.join(directory,file),animations:'disabled',timeout:12000});report.screenshots.push(file);}
   console.log('GEOMETRY',template,width+'px',geometry.controls+' controls',geometry.smallControls+' size candidates',geometry.documentWidth+'px scroll width');
  }catch(e){report.errors.push({template,width,error:String(e)});console.error('GEOMETRY-FAIL',template,width,String(e));}
  finally{await context.close();}
 }
}catch(e){report.errors.push({fatal:String(e?.stack||e)});}
finally{
 await browser?.close().catch(()=>{});
 server.kill('SIGTERM');
 // Group identical target-size candidates across viewport widths rather than
 // asking a reviewer to chase the same element five times. This is a triage
 // index, NOT an accessibility pass or exemption determination.
 const groups=new Map();
 for(const item of report.cases)for(const control of item.examples){
   const key=[item.template,control.scope,control.selector,control.label].join('|');
   const group=groups.get(key)||{template:item.template,scope:control.scope,selector:control.selector,
     label:control.label,inline:control.inline,widths:[],minWidth:Infinity,minHeight:Infinity};
   group.widths.push(item.width);
   group.minWidth=Math.min(group.minWidth,control.width);
   group.minHeight=Math.min(group.minHeight,control.height);
   groups.set(key,group);
 }
 const triage=[...groups.values()].sort((a,b)=>Number(a.inline)-Number(b.inline)||
   a.template.localeCompare(b.template)||a.scope.localeCompare(b.scope)||a.label.localeCompare(b.label));
 report.targetTriage={unique:triage.length,standalone:triage.filter(x=>!x.inline).length,
   inlineCandidates:triage.filter(x=>x.inline).length,notes:'Geometry only. Spacing exceptions, obscured items, and real touch accessibility need human/device verification.',items:triage};
 console.log('TARGET-TRIAGE:',triage.length+' unique element candidates; '+
   report.targetTriage.standalone+' standalone and '+report.targetTriage.inlineCandidates+' inline link candidates.');
 for(const item of triage)console.log('TARGET-REVIEW',JSON.stringify(item));
 writeFileSync(path.join(directory,'results.json'),JSON.stringify(report,null,2));
 console.log('Template geometry:',report.cases.length+' cases',report.screenshots.length+' screenshots',report.warnings.length+' manual flags',report.errors.length+' hard errors');
 if(report.errors.length)process.exitCode=1;
}
