/* Actual remote still-image layout evidence, not a media licensing or accessibility approval.
 * Never assign a video src, issue a video request or download the 4K Pexels MP4.
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.resolve(here,'../dist');
const origin='http://127.0.0.1:4198/templates/';
const sizes=[320,390,768,1440];
// These counts are *third-party HTML img elements* after replacing unsupported
// product/unsafe-work images with original local illustrations. Local images
// are decoded separately; they are NOT external stock assets.
const batches=JSON.parse(readFileSync(new URL('../data/loaded-media-review-batches.json',import.meta.url),'utf8'));
const batch=process.env.MEDIA_BATCH||'baseline';
if(!Object.hasOwn(batches,batch))throw Error('Unknown still-media QA batch '+JSON.stringify(batch));
const templates=batches[batch],evidence=path.join(here,'loaded-media-evidence',batch);
const report={mode:'review-only',batch,date:new Date().toISOString(),videoDownloadedBytes:0,
  licenseApproval:false,physicalDeviceTest:false,accessibilityCertification:false,
  screenshots:[],cases:[],cropReviewCandidates:[],errors:[]};
mkdirSync(evidence,{recursive:true});
const server=spawn('python3',['-m','http.server','4198','--bind','127.0.0.1'],{cwd:dist,stdio:'ignore'});
let browser;
const timeout=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));
async function ready(){
  for(let i=0;i<50;i++){
    try{if((await fetch(origin+'creative-agency/index.html')).ok)return;}catch{}
    await timeout(200);
  }
  throw Error('Local built template server failed to respond');
}
async function loadImageMedia(page){
  return page.evaluate(async ()=>{
    const decode=async img=>{
      if(img.loading==='lazy')img.loading='eager';
      const result=await Promise.race([
        img.decode().then(()=>({ok:true}),error=>({ok:false,error:String(error)})),
        new Promise(resolve=>setTimeout(()=>resolve({ok:false,error:'image decode timeout'}),12000))
      ]);
      const bounds=img.getBoundingClientRect();
      const css=getComputedStyle(img);
      const canMeasure=img.naturalWidth>0&&img.naturalHeight>0&&bounds.width>0&&bounds.height>0&&css.objectFit==='cover';
      const scale=canMeasure?Math.max(bounds.width/img.naturalWidth,bounds.height/img.naturalHeight):null;
      const cropFraction=canMeasure
        ?Math.min(1,Math.max(0,((bounds.width/scale)*(bounds.height/scale))/(img.naturalWidth*img.naturalHeight)))
        :null;
      return {src:img.currentSrc||img.src,alt:img.alt,
        naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,
        renderedWidth:Math.round(bounds.width),renderedHeight:Math.round(bounds.height),
        objectFit:css.objectFit,objectPosition:css.objectPosition,
        visibleSourceFraction:cropFraction===null?null:Number(cropFraction.toFixed(3)),...result};
    };
    const images=[...document.images];
    const loaded=await Promise.all(images.map(decode));
    const film=document.querySelector('#hero-film');
    let poster=null;
    if(film){
      const posterUrl=film.poster;
      const image=new Image();
      image.src=posterUrl;
      const result=await Promise.race([
        image.decode().then(()=>({ok:true}),error=>({ok:false,error:String(error)})),
        new Promise(resolve=>setTimeout(()=>resolve({ok:false,error:'poster decode timeout'}),12000))
      ]);
      poster={url:posterUrl,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,...result};
    }
    return {images:loaded,poster};
  });
}
const sectionsToCapture=async(page,entry,width)=>{
  for(const selector of entry.sections){
    const locator=page.locator(selector).first();
    if(await locator.count()===0){report.errors.push(entry.name+' missing screenshot section '+selector);continue;}
    try{
      // An element taller than the viewport can be screenshot before its
      // children intersect the viewport. Exercise the normal user scroll
      // sequence first so all one-way reveal animations have entered.
      const reveals=locator.locator('.reveal');
      for(const reveal of await reveals.all()){
        await reveal.scrollIntoViewIfNeeded({timeout:8000});
        await timeout(140);
      }
      const hiddenCount=await reveals.evaluateAll(elements=>elements.filter(el=>getComputedStyle(el).opacity==='0').length);
      if(hiddenCount>0)report.errors.push(entry.name+' '+width+' '+selector+' has '+hiddenCount+' unrevealed children in captured evidence');
      await locator.scrollIntoViewIfNeeded({timeout:8000});
      await timeout(140);
      const name=entry.name+'-'+width+'-'+selector.replace(/[^a-z0-9]/gi,'')+'.png';
      await locator.screenshot({path:path.join(evidence,name),animations:'disabled',timeout:15000});
      report.screenshots.push(name);
    }catch(error){report.errors.push(entry.name+' '+width+' screenshot '+selector+': '+String(error));}
  }
};
try{
  await ready();
  const executable=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
  browser=await chromium.launch({headless:true,executablePath:executable||undefined,args:['--no-sandbox']});
  for(const entry of templates){
    for(const width of sizes){
      const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1,
        reducedMotion:width===320?'reduce':'no-preference'});
      const page=await context.newPage();
      let videoRequests=0;
      page.on('request',request=>{
        if(/^https:\/\/videos\.pexels\.com\//.test(request.url()))videoRequests++;
      });
      page.on('pageerror',error=>report.errors.push(entry.name+' '+width+' browser: '+String(error)));
      // No 4K body or video headers are fetched, even if future code accidentally
      // attaches the source. A request attempt itself fails the QA ledger.
      await page.route(/^https:\/\/videos\.pexels\.com\//,route=>route.abort('blockedbyclient'));
      const response=await page.goto(origin+entry.name+'/index.html',{waitUntil:'domcontentloaded',timeout:18000});
      await page.evaluate(()=>document.fonts.ready);
      const media=await loadImageMedia(page);
      const layout=await page.evaluate(()=>({
        viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
        bodyWidth:document.body.scrollWidth,
        heroTitle:document.querySelector('h1')?.textContent?.trim()?.replace(/\s+/g,' ')||'',
        sourceAttached:!!document.querySelector('#hero-film source[src]'),
        autoplay:document.querySelector('#hero-film')?.autoplay||false,
        activeElement:document.activeElement?.tagName||null
      }));
      const remoteImages=media.images.filter(x=>/^https:\/\/(?:images\.unsplash\.com|images\.pexels\.com)\//.test(x.src));
      const localImages=media.images.filter(x=>!remoteImages.includes(x));
      const result={template:entry.name,width,httpStatus:response?.status()??null,
        rendered:layout,remoteImages,localImages,poster:media.poster,videoRequests};
      for(const img of media.images){
        // Only a review flag: 60%+ of the source cropped may be intentional.
        if(img.ok&&img.visibleSourceFraction!==null&&img.visibleSourceFraction<0.4){
          report.cropReviewCandidates.push({
            template:entry.name,width,src:img.src,alt:img.alt,
            visibleSourceFraction:img.visibleSourceFraction,objectPosition:img.objectPosition
          });
        }
      }
      if(entry.name==='creative-agency'&&width<=390){
        const regions=await page.evaluate(()=>{
          const bounds=selector=>{
            const rect=document.querySelector(selector)?.getBoundingClientRect();
            return rect?{left:rect.left,top:rect.top,right:rect.right,bottom:rect.bottom,width:rect.width,height:rect.height}:null;
          };
          return {warning:bounds('.film-detail'),cta:bounds('.hero-bottom .primary-action'),
            controls:bounds('.offcut-motion-actions'),hero:bounds('.hero')};
        });
        result.filmWarningLayout=regions;
        const warning=regions.warning,cta=regions.cta;
        if(!warning||!cta||warning.left<-2||warning.right>width+2||warning.top<cta.bottom+8)
          report.errors.push('OFFCUT '+width+' warning is clipped or overlaps the primary CTA');
      }
      report.cases.push(result);
      if(response?.status()!==200)report.errors.push(entry.name+' '+width+' HTTP '+response?.status());
      if(layout.scrollWidth>width+4)report.errors.push(entry.name+' '+width+' horizontal overflow '+layout.scrollWidth+'px');
      if(result.remoteImages.length!==entry.required)report.errors.push(entry.name+' '+width+' expected '+entry.required+' remote img elements, saw '+result.remoteImages.length);
      for(const img of media.images)if(!img.ok||img.naturalWidth<1)report.errors.push(entry.name+' '+width+' image failed: '+img.src+' '+(img.error||''));
      if(entry.poster&&(!media.poster?.ok||media.poster.naturalWidth<1))report.errors.push(entry.name+' '+width+' poster did not decode: '+(media.poster?.error||'unknown'));
      if(videoRequests>0||layout.sourceAttached||layout.autoplay)report.errors.push(entry.name+' '+width+' unexpected 4K video network/activation');
      await sectionsToCapture(page,entry,width);
      await context.close();
      console.log('MEDIA-REVIEW',entry.name,width+'px',result.remoteImages.length+' loaded images',media.poster?'poster '+media.poster.ok:'',videoRequests+' video requests');
    }
  }
}catch(error){
  report.errors.push('Fatal review failure: '+(error?.stack||String(error)));
}finally{
  await browser?.close().catch(()=>{});
  server.kill('SIGTERM');
  writeFileSync(path.join(evidence,'results.json'),JSON.stringify(report,null,2));
  console.log('Loaded image review ('+batch+'): '+report.cases.length+' viewport cases, '+report.screenshots.length+' screenshots, '+report.cropReviewCandidates.length+' manual crop flags, '+report.errors.length+' hard errors.');
  if(report.errors.length){for(const issue of report.errors)console.error('REVIEW-FAIL:',issue);process.exitCode=1;}
  else console.log('PASS: '+batch+' decoded remote and local stills at 320/390/768/1440, without 4K requests. Crop flags are manual review prompts, not verified defects. Licensing and human crop/contrast sign-off remain open.');
}