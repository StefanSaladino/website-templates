import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const specs=JSON.parse(readFileSync(path.join(root,'components/data/immersive-tests.json'),'utf8'));
const ids=Object.keys(specs),widths=[320,390,768,1440];
const dir=path.join(root,'components/immersive-evidence');mkdirSync(dir,{recursive:true});
const port=4283,origin='http://127.0.0.1:'+port,base=origin+'/templates/';
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
const report={templates:ids,widths,cases:[],errors:[],physicalDeviceAcceptance:false};let browser;
const checkState=async(page,s,state)=>{
 const stage=page.locator(s.stage);
 await stage.scrollIntoViewIfNeeded();
 await page.waitForFunction(({sel,state})=>{const el=document.querySelector(sel);return el&&(el.dataset.renderError||Object.entries(state).every(([k,v])=>el.getAttribute(k)===v))},{sel:s.stage,state});
 if(Object.keys(state).some(k=>k.startsWith('data-rendered-'))){const err=await stage.getAttribute('data-render-error');assert(!err,'WebGL initialization failed: '+err);}
};
const act=async(page,s,step)=>{
 const control=page.locator(step.selector);
 if(step.action==='fill')await control.fill(step.value);else await control.click();
 await checkState(page,s,step.state);
 for(const [key,value] of Object.entries(step.controlState||{}))assert.equal(await control.getAttribute(key),value);
};
const pixels=async(canvas,bottomFraction=.34)=>canvas.evaluate(async (el,bottomFraction)=>{
 const gl=el.getContext('webgl')||el.getContext('webgl2');
 if(!gl)throw Error('No actual WebGL context');
 const raw=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);
 gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,raw);
 let opaque=0, minX=gl.drawingBufferWidth,minY=gl.drawingBufferHeight,maxX=-1,maxY=-1;
 for(let i=3;i<raw.length;i+=4){if(raw[i]>0)opaque++;if(raw[i]>200){const index=(i-3)/4,x=index%gl.drawingBufferWidth,y=Math.floor(index/gl.drawingBufferWidth);minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}}
 const hex=async data=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',data))].map(x=>x.toString(16).padStart(2,'0')).join('');
 const solidMask=new Uint8Array(raw.length/4);for(let i=3;i<raw.length;i+=4)solidMask[(i-3)/4]=raw[i]===255?1:0;
 const bottom=raw.subarray(0,Math.floor(gl.drawingBufferHeight*bottomFraction)*gl.drawingBufferWidth*4);
 let bottomOpaque=0;for(let i=3;i<bottom.length;i+=4)if(bottom[i]>200)bottomOpaque++;
 return {opaque,hash:await hex(raw),geometryHash:await hex(solidMask),bottomOpaque,bottomHash:await hex(bottom),framed:minX>2&&minY>2&&maxX<gl.drawingBufferWidth-3&&maxY<gl.drawingBufferHeight-3};
},bottomFraction);
try{
 let ready=false;for(let i=0;i<50;i++){try{if((await fetch(base+ids[0]+'/')).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,200))}
 if(!ready)throw Error('Immersive HTTP server unavailable');
 const chrome=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 browser=await chromium.launch({headless:true,executablePath:chrome||undefined,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [id,s] of Object.entries(specs)){
  const url=base+id+'/';
  for(const width of widths){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce',deviceScaleFactor:1});
   const errors=[],remote=[],allowedImages=new Set(s.allowedImageIdentities||[]);page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(!r.url().startsWith(origin+'/')&&!(r.resourceType()==='image'&&allowedImages.has(r.url().split('?')[0])))remote.push(r.url())});
   // Keep geometry QA deterministic; separately verify photo decode/crops in loaded-media review.
   if(allowedImages.size)await page.route('**/*',r=>{const url=r.request().url();return allowedImages.has(url.split('?')[0])?r.abort():r.continue()});
   // Keep the test drawing buffer readable; production remains demand-rendered.
   await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,opts,...rest){return get.call(this,type,/^webgl2?$/.test(type)?{...opts,preserveDrawingBuffer:true}:opts,...rest)}});
   try{
    await page.goto(url,{waitUntil:'domcontentloaded'});
    const stage=page.locator(s.stage),canvas=page.locator(s.canvas);
    await checkState(page,s,s.initial);assert.equal(await stage.getAttribute('data-renderer'),'webgl');
    let prior=await pixels(canvas);assert(prior.opaque>100,'Model must render actual visible pixels');if(s.requireFraming)assert(prior.framed,'Assembled model clipped by canvas');
    for(const step of s.steps){
     const before=step.stableBottomFraction?await pixels(canvas,step.stableBottomFraction):prior;
     await act(page,s,step);
     const current=await pixels(canvas,step.stableBottomFraction||.34);
     assert(current.opaque>100&&current.hash!==prior.hash,'Rendered pixels must change: '+step.selector);
     if(s.requireFraming)assert(current.framed,'Model clipped after '+step.selector);
     if(step.stableGeometry)assert.equal(current.geometryHash,prior.geometryHash,'Dimming must preserve the opaque geometry silhouette');
     if(step.stableBottomFraction){
       assert(before.bottomOpaque>100,'Grounded base must be visible in the tested region');
       assert.equal(current.bottomHash,before.bottomHash,'Assembly must not move or redraw grounded base/support pixels');
     }
     prior=current;
    }
    await stage.screenshot({path:path.join(dir,id+'-'+width+'-interaction.png')});
    await page.locator(s.reset.selector).click();await checkState(page,s,s.reset.state);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
    assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);
    await page.screenshot({path:path.join(dir,id+'-'+width+'.png'),fullPage:true});
    report.cases.push({id,width,webgl:true,pixelChanges:s.steps.length,noUnexpectedRemoteRequests:true,referenceImagesExcluded:allowedImages.size});
   }catch(e){report.errors.push(id+' '+width+': '+String(e));}finally{await page.close()}
  }
  const page=await browser.newPage({viewport:{width:390,height:900},reducedMotion:'reduce'});
  try{
   await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl2?$/.test(type)?null:original.call(this,type,...args)}});
   await page.goto(url,{waitUntil:'domcontentloaded'});
   assert.equal(await page.locator(s.stage).getAttribute('data-renderer'),'static');assert(await page.locator(s.fallback).isVisible());
   for(const selector of s.fallbackDisabled||[])assert(await page.locator(selector).isDisabled());
   const relative=async sel=>page.locator(sel).evaluate(el=>{const b=el.getBoundingClientRect(),p=el.closest('.stage').getBoundingClientRect();return [b.x-p.x,b.y-p.y,b.width,b.height].map(v=>Math.round(v*100)/100)});
   for(const step of s.fallbackSteps){
    const fixed=await Promise.all((step.fixedSelectors||[]).map(relative));
    await act(page,s,step);
    assert.deepEqual(await Promise.all((step.fixedSelectors||[]).map(relative)),fixed,'Fallback grounded base/support must stay fixed');
   }
   await page.screenshot({path:path.join(dir,id+'-static-fallback.png'),fullPage:true});
   report.cases.push({id,fallback:true,controls:true});
  }catch(e){report.errors.push(id+' fallback: '+String(e))}finally{await page.close()}
  const noJS=await browser.newContext({viewport:{width:390,height:900},javaScriptEnabled:false});
  try{const page=await noJS.newPage();await page.goto(url);assert(await page.locator(s.fallback).isVisible());assert(await page.locator('main').isVisible());report.cases.push({id,noJavaScript:true})}
  catch(e){report.errors.push(id+' no JS: '+String(e))}finally{await noJS.close()}
 }
 if(report.cases.length!==ids.length*(widths.length+2))report.errors.push('Incomplete immersive case coverage');
}catch(e){report.errors.push(String(e?.stack||e))}
finally{await browser?.close();server.kill('SIGTERM');writeFileSync(path.join(dir,'results.json'),JSON.stringify(report,null,2));for(const e of report.errors)console.error('IMMERSIVE-FAIL',e);console.log('Immersive template QA:',report.cases.length,'passed,',report.errors.length,'failed');if(report.errors.length)process.exitCode=1}
