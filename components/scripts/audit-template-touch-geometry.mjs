/* Browser touch-geometry evidence for 24 original sites, not a WCAG/device audit. */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,readdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const directory=path.join(root,'components','touch-geometry-evidence');
mkdirSync(directory,{recursive:true});
const templates=readdirSync(path.join(root,'templates'),{withFileTypes:true}).filter(e=>e.isDirectory()&&existsSync(path.join(root,'templates',e.name,'index.html'))).map(e=>e.name).sort();
const sizes=[320,390,768,1280],origin='http://127.0.0.1:4221/templates/';
const server=spawn('python3',['-m','http.server','4221','--bind','127.0.0.1'],{cwd:path.join(root,'dist'),stdio:'ignore'});
const report={date:new Date().toISOString(),automatedTouchAcceptance:false,physicalDeviceTest:false,mediaRightsApproved:false,cases:[],warnings:[],errors:[],screenshots:[]};
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let browser;
try{
 if(templates.length!==24)throw Error('Expected 24 original templates, found '+templates.length);
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
    const interactive=[...document.querySelectorAll('a[href],button,input,select,textarea,summary,[role="button"],[role="link"]')].filter(visible);
    const dimensions=interactive.map(el=>{
     const r=el.getBoundingClientRect();
     return {tag:el.tagName.toLowerCase(),label:(el.getAttribute('aria-label')||el.innerText||el.textContent||'').trim().replace(/\s+/g,' ').slice(0,72),
      width:Math.round(r.width),height:Math.round(r.height),top:Math.round(r.top),left:Math.round(r.left),
      inline:el.matches('a')&&getComputedStyle(el).display==='inline'};
    });
    const small=dimensions.filter(x=>x.width<24||x.height<24);
    const clipped=[...document.querySelectorAll('h1,h2')].filter(visible).filter(el=>{
     const css=getComputedStyle(el);return css.overflowX!=='visible'&&el.scrollWidth>el.clientWidth+3;
    }).map(el=>(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,85));
    return {documentWidth:document.documentElement.scrollWidth,controls:dimensions.length,
      smallControls:small.length,examples:small.slice(0,30),clippedHeadings:clipped,
      unnamedButtons:dimensions.filter(x=>x.tag==='button'&&!x.label).slice(0,8)};
   });
   report.cases.push({template,width,...geometry});
   if(geometry.documentWidth>width+4)report.warnings.push({template,width,type:'horizontal-overflow',actual:geometry.documentWidth});
   if(geometry.smallControls)report.warnings.push({template,width,type:'target-size-review',count:geometry.smallControls});
   if(geometry.clippedHeadings.length)report.warnings.push({template,width,type:'possible-clipping',headings:geometry.clippedHeadings});
   if(geometry.unnamedButtons.length)report.warnings.push({template,width,type:'unnamed-buttons',controls:geometry.unnamedButtons});
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
 writeFileSync(path.join(directory,'results.json'),JSON.stringify(report,null,2));
 console.log('Template geometry:',report.cases.length+' cases',report.screenshots.length+' screenshots',report.warnings.length+' manual flags',report.errors.length+' hard errors');
 if(report.errors.length)process.exitCode=1;
}
