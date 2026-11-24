/* Browser evidence for all complete websites in the root gallery.
 * This is screenshot/asset QA, not source/creator license, model release,
 * full accessibility signoff, or a claim the concepts are production ready.
 */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {galleryMembership,compareMembership} from './template-catalogue.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const {ids:expectedIds,source,missing,unexpected,duplicates}=galleryMembership(root);
if(missing.length||unexpected.length||duplicates.length)throw Error('Source gallery membership mismatch '+JSON.stringify({missing,unexpected,duplicates}));
const expectedCount=expectedIds.length;
const expectedMedia=source.media.map(x=>new URL(x).origin+new URL(x).pathname).sort();
const output=path.join(root,'components/gallery-thumbnail-evidence');
mkdirSync(output,{recursive:true});
const base='http://127.0.0.1:4238/';
const widths=[320,390,768,1440];
const report={date:new Date().toISOString(),mode:'review-only',productionAccepted:false,
  licensingAccepted:false,physicalDeviceTest:false,accessibilityCertified:false,
  videoDownloadedBytes:0,cases:[],screenshots:[],errors:[]};
const server=spawn('python3',['-m','http.server','4238','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let browser;
try{
 let listening=false;
 for(let i=0;i<60;i++){
   try{if((await fetch(base+'index.html')).ok){listening=true;break}}catch{}
   await sleep(200);
 }
 if(!listening)throw Error('Gallery local HTTP server not ready');
 const chrome=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox']});
 for(const width of widths){
  const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});
  const page=await context.newPage();
  const pageErrors=[],videoRequests=[];
  page.on('pageerror',error=>pageErrors.push(String(error)));
  page.on('request',request=>{if(request.url().startsWith('https://videos.pexels.com/'))videoRequests.push(request.url())});
  await page.route(/^https:\/\/videos\.pexels\.com\//,r=>r.abort('blockedbyclient'));
  try{
   const response=await page.goto(base+'index.html',{waitUntil:'domcontentloaded',timeout:20000});
   await page.waitForFunction(count=>document.querySelectorAll('.featured-pick,.template-card').length===count,expectedCount,{timeout:15000});
   await page.evaluate(()=>document.fonts.ready);
   const localThumbs=await page.locator('.featured-pick .thumb img,.template-card .thumb img').evaluateAll(async imgs=>Promise.all(imgs.filter(img=>new URL(img.src,location.href).origin===location.origin).map(async img=>{try{await img.decode();return {src:img.src,ok:img.naturalWidth>0}}catch{return {src:img.src,ok:false}}})));
   for(const img of localThumbs)if(!img.ok)report.errors.push(width+' local thumbnail failed: '+img.src);
   const media=await page.evaluate(async()=>{
    const imgs=[...document.querySelectorAll('img[src]')].filter(img=>
     /^https:\/\/(?:images\.unsplash\.com|images\.pexels\.com)\//.test(img.currentSrc||img.src));
    return Promise.all(imgs.map(async img=>{
     img.loading='eager';
     const loaded=await Promise.race([
       img.decode().then(()=>({ok:true}),e=>({ok:false,error:String(e)})),
       new Promise(resolve=>setTimeout(()=>resolve({ok:false,error:'image decode timeout'}),16000))
     ]);
     return {alt:img.alt,url:img.currentSrc||img.src,naturalWidth:img.naturalWidth,
       naturalHeight:img.naturalHeight,...loaded};
    }));
   });
   const meta=await page.evaluate(()=>({
     viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,
     count:document.querySelectorAll('.featured-pick,.template-card').length,
     previewBadges:[...document.querySelectorAll('.featured-pick .live-badge,.template-card .live-badge')].map(x=>x.textContent.trim()),
     disclosure:document.querySelector('.intro .lede')?.textContent?.trim()||''
   }));
   const entry={width,status:response?.status()||null,...meta,remoteImages:media,
     thumbnailBounds:[],badgeBounds:[],videoRequests:videoRequests.length,pageErrors};
   report.cases.push(entry);
   if(entry.status!==200)report.errors.push(width+' gallery HTTP status '+entry.status);
   if(meta.count!==expectedCount)report.errors.push(width+' gallery card count '+meta.count);
   if(meta.documentWidth>width+4)report.errors.push(width+' page-wide overflow '+meta.documentWidth);
   if(meta.previewBadges.length!==expectedCount||meta.previewBadges.some(x=>x!=='Preview'))
    report.errors.push(width+' missing/unapproved gallery preview labels: '+JSON.stringify(meta.previewBadges));
   if(!meta.disclosure.includes('fictional design previews under review'))
    report.errors.push(width+' missing transparent gallery review disclosure');
   const actualMedia=media.map(x=>new URL(x.url).origin+new URL(x.url).pathname).sort();
   if(JSON.stringify(actualMedia)!==JSON.stringify(expectedMedia))report.errors.push(width+' source/rendered CDN thumbnail identity mismatch: expected '+expectedMedia.length+' placements, found '+actualMedia.length);
   for(const img of media)if(!img.ok||!img.naturalWidth)
    report.errors.push(width+' gallery image decode failed: '+img.url+' '+(img.error||''));
   const cards=page.locator('.featured-pick,.template-card');
   for(let i=0;i<await cards.count();i++){
    const card=cards.nth(i);
    const href=await card.locator('a[href^="templates/"]').first().getAttribute('href');
    const id=/^templates\/([a-z0-9-]+)\/$/.exec(href||'')?.[1];
    if(!id){report.errors.push(width+' card '+i+' has an invalid preview route '+href);continue}
    const thumb=card.locator('.thumb').first();
    if(await thumb.count()!==1){report.errors.push(width+' '+id+' has no unique thumbnail');continue}
    await thumb.scrollIntoViewIfNeeded({timeout:10000});
    const bounds=await thumb.evaluate(el=>{
      const b=el.getBoundingClientRect(),css=getComputedStyle(el);
      return {left:Math.round(b.left),right:Math.round(b.right),width:Math.round(b.width),
        height:Math.round(b.height),visible:css.display!=='none'&&css.visibility==='visible'};
    });
    entry.thumbnailBounds.push({id,...bounds});
    const badge=await thumb.locator('.live-badge').evaluate(el=>{
      const b=el.getBoundingClientRect(),p=el.closest('.thumb').getBoundingClientRect(),css=getComputedStyle(el);
      return {label:(el.textContent||'').trim(),
        x:Math.round(b.x),y:Math.round(b.y),width:Math.round(b.width),height:Math.round(b.height),
        visible:css.display!=='none'&&css.visibility!=='hidden'&&Number(css.opacity)>0,
        contained:b.left>=p.left-2&&b.top>=p.top-2&&b.right<=p.right+2&&b.bottom<=p.bottom+2};
    });
    entry.badgeBounds.push({id,...badge});
    if(badge.label!=='Preview'||!badge.visible||!badge.contained||badge.width<30||badge.height<12)
      report.errors.push(width+' '+id+' Preview badge is not legible/contained '+JSON.stringify(badge));
    if(!bounds.visible||bounds.width<60||bounds.height<50||
       bounds.left< -4||bounds.right>width+4)
      report.errors.push(width+' '+id+' thumbnail clipped or hidden '+JSON.stringify(bounds));
    const filename=width+'-'+id+'.png';
    try{
      await thumb.screenshot({path:path.join(output,filename),animations:'disabled',timeout:16000});
      report.screenshots.push(filename);
    }catch(e){report.errors.push(width+' '+id+' screenshot: '+String(e))}
   }
   const membership=compareMembership(expectedIds,entry.thumbnailBounds.map(x=>x.id));
   if(Object.values(membership).some(x=>x.length))report.errors.push(width+' gallery route membership '+JSON.stringify(membership));
   if(pageErrors.length)report.errors.push(width+' JS errors: '+JSON.stringify(pageErrors));
   if(videoRequests.length)report.errors.push(width+' unexpected remote film request '+JSON.stringify(videoRequests));
   console.log('GALLERY-REVIEW',width+'px',meta.count+' cards',media.length+' decoded-source candidates',
     entry.thumbnailBounds.length+' geometries',entry.badgeBounds.length+' verified badges',report.errors.length+' cumulative hard errors');
  }catch(error){
   report.errors.push(width+' gallery browser failure: '+(error?.stack||String(error)));
  }finally{await context.close()}
 }
}catch(error){report.errors.push('Fatal gallery audit '+(error?.stack||String(error)))}
finally{
 await browser?.close().catch(()=>{});
 server.kill('SIGTERM');
 writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));
 console.log('Gallery thumbnail QA:',report.cases.length+' viewport cases, '+report.screenshots.length+
  ' screenshots, '+report.errors.length+' hard errors. No media rights or human visual approval.');
 for(const error of report.errors)console.error('GALLERY-FAIL:',error);
 if(report.errors.length)process.exitCode=1;
}