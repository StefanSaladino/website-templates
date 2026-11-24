import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const dir=path.join(root,'components/immersive-evidence');mkdirSync(dir,{recursive:true});
const port=4283,base='http://127.0.0.1:'+port+'/templates/fulcrum-light/';
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
const report={cases:[],errors:[],physicalDeviceAcceptance:false};let browser;
try{
 for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break}catch{}await new Promise(r=>setTimeout(r,200))}
 const chrome=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 browser=await chromium.launch({headless:true,executablePath:chrome||undefined,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const width of [320,390,768,1440]){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce',deviceScaleFactor:1});
   const errors=[],remote=[];page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:'))remote.push(r.url())});
   try{
    await page.goto(base,{waitUntil:'domcontentloaded'});
    const stage=page.locator('.stage');await stage.scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.querySelector('.stage')?.dataset.renderedFinish==='ochre');
    assert.equal(await stage.getAttribute('data-renderer'),'webgl');
    const canvas=page.locator('#lamp-canvas'), hash=async()=>createHash('sha256').update(await canvas.screenshot()).digest('hex');
    const initial=await hash();await page.locator('[data-finish=chalk]').click();
    await page.waitForFunction(()=>document.querySelector('.stage')?.dataset.renderedFinish==='chalk');
    assert.notEqual(await hash(),initial,'Material selection changes rendered pixels');
    await page.locator('#rotation').fill('80');await page.waitForFunction(()=>document.querySelector('.stage')?.dataset.renderedAngle==='80');
    const rotated=await hash();
    await page.locator('#assembly').fill('100');await page.waitForFunction(()=>document.querySelector('.stage')?.dataset.renderedAssembly==='100');
    assert.notEqual(await hash(),rotated,'Exploded assembly changes rendered pixels');
    assert.equal(await page.locator('#assembly').getAttribute('aria-valuetext'),'Fully separated');
    await stage.screenshot({path:path.join(dir,'fulcrum-'+width+'-assembly.png')});
    await page.locator('#reset').click();await page.waitForFunction(()=>document.querySelector('.stage')?.dataset.renderedFinish==='ochre'&&document.querySelector('.stage')?.dataset.renderedAssembly==='0');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
    assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);
    await page.screenshot({path:path.join(dir,'fulcrum-'+width+'.png'),fullPage:true});
    report.cases.push({width,webgl:true,materialPixels:true,assemblyPixels:true,noRemoteRequests:true});
   }catch(e){report.errors.push(width+': '+String(e));}finally{await page.close()}
 }
 const page=await browser.newPage({viewport:{width:390,height:900},reducedMotion:'reduce'});
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'?null:original.call(this,type,...args)}});
 await page.goto(base,{waitUntil:'domcontentloaded'});
 assert.equal(await page.locator('.stage').getAttribute('data-renderer'),'static');
 assert(await page.locator('.fallback').isVisible());assert(await page.locator('#rotation').isDisabled());
 await page.locator('[data-finish=graphite]').click();await page.locator('#assembly').fill('100');
 assert.equal(await page.locator('.stage').getAttribute('data-finish'),'graphite');
 assert.equal(await page.locator('.stage').getAttribute('data-assembly'),'100');
 await page.screenshot({path:path.join(dir,'fulcrum-static-fallback.png'),fullPage:true});
 report.cases.push({fallback:true,finish:true,assembly:true});
 await page.close();
}catch(e){report.errors.push(String(e?.stack||e))}
finally{await browser?.close();server.kill('SIGTERM');writeFileSync(path.join(dir,'results.json'),JSON.stringify(report,null,2));for(const e of report.errors)console.error('IMMERSIVE-FAIL',e);console.log('Immersive template QA:',report.cases.length,'passed,',report.errors.length,'failed');if(report.errors.length)process.exitCode=1}
