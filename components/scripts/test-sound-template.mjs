import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {discoverTemplates} from './template-catalogue.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),origin='http://127.0.0.1:4293',id='resonance-sound',dir=path.join(root,'components/immersive-evidence');
const marked=discoverTemplates(root).filter(n=>/data-sound-template/.test(readFileSync(path.join(root,'templates',n,'index.html'),'utf8')));assert.deepEqual(marked,[id]);mkdirSync(dir,{recursive:true});
const server=spawn('python3',['-m','http.server','4293','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});let browser;const report={cases:[],errors:[],physicalDeviceAcceptance:false};
try{
 for(let i=0;i<50;i++){try{if((await fetch(origin+'/')).ok)break}catch{}await new Promise(r=>setTimeout(r,200))}
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox','--mute-audio']});
 for(const width of [320,390,768,1440])for(const mode of ['motion','reduce','nojs','fallback']){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:mode==='reduce'?'reduce':'no-preference',javaScriptEnabled:mode!=='nojs'}),page=await context.newPage(),errors=[],remote=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(!r.url().startsWith(origin+'/'))remote.push(r.url())});
 if(mode==='fallback')await page.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=()=>null});
 await page.addInitScript(()=>{window.__audioStarts=0;window.__audioCloses=0;const Native=window.AudioContext||window.webkitAudioContext;if(Native){window.AudioContext=class extends Native{constructor(...args){super(...args);window.__audioStarts++}close(){window.__audioCloses++;return super.close()}}}});
 try{
 await page.goto(origin+'/templates/'+id+'/',{waitUntil:'domcontentloaded'});const field=page.locator('#field'),canvas=page.locator('#sculpture'),audio=page.locator('#audio'),frequency=page.locator('#frequency'),intensity=page.locator('#intensity');
 assert.equal(await field.getAttribute('data-audio'),'off');
 if(mode==='nojs'||mode==='fallback'){assert(await page.locator('.still').isVisible());assert(await frequency.isDisabled());}
 else{
 await page.waitForFunction(()=>document.querySelector('#field').dataset.renderedFrequency==='220');
 assert.equal(await page.evaluate(()=>window.__audioStarts),0,'Audio must not initialize before user activation');
 const capture=()=>canvas.evaluate(c=>c.toDataURL());
 if(mode==='motion'){const first=await capture(),t=Number(await field.getAttribute('data-frame-time'));await page.waitForFunction(t=>Number(document.querySelector('#field').dataset.frameTime)>t+.2,t);assert.notEqual(await capture(),first);await page.locator('#motion').click();await page.waitForFunction(()=>document.querySelector('#field').dataset.renderedPaused==='true');}
 else assert(await page.locator('#motion').isDisabled());
 const prior=await capture();await frequency.fill('440');await page.waitForFunction(()=>document.querySelector('#field').dataset.renderedFrequency==='440');assert.notEqual(await capture(),prior,'Frequency must change actual particle pixels');assert.notEqual(await field.getAttribute('data-rendered-mode'),'3:4');
 const preIntensity=await capture();await intensity.fill('80');await page.waitForFunction(()=>document.querySelector('#field').dataset.renderedIntensity==='80');assert.notEqual(await capture(),preIntensity);
 await audio.click();await page.waitForFunction(()=>document.querySelector('#field').dataset.audio==='on');assert.equal(await page.evaluate(()=>window.__audioStarts),1);await page.waitForFunction(()=>Number(document.querySelector('#field').dataset.energy)>.02);await audio.click();await page.waitForFunction(()=>document.querySelector('#field').dataset.audio==='off');assert.equal(await page.evaluate(()=>window.__audioCloses),1);assert.equal(await field.getAttribute('data-energy'),'0');
 await page.locator('#reset').click();await page.waitForFunction(()=>document.querySelector('#field').dataset.renderedFrequency==='220');assert.equal(await frequency.inputValue(),'220');assert.equal(await intensity.inputValue(),'40');
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:path.join(dir,id+'-'+width+'-'+mode+'.png')});
 }
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);report.cases.push({width,mode})
 }catch(e){report.errors.push(width+' '+mode+': '+String(e))}finally{await context.close()}
 }
 // Denied or unsupported Web Audio must remain usable and silent.
 const p=await browser.newPage();try{await p.addInitScript(()=>{window.AudioContext=class{constructor(){throw Error('Unavailable')}};window.webkitAudioContext=undefined});await p.goto(origin+'/templates/'+id+'/');await p.locator('#audio').click();assert.equal(await p.locator('#field').getAttribute('data-audio'),'off');assert(await p.locator('#frequency').isEnabled());report.cases.push({audioUnavailable:true})}finally{await p.close()}
}finally{await browser?.close();server.kill('SIGTERM');writeFileSync(path.join(dir,'sound-results.json'),JSON.stringify(report,null,2));for(const e of report.errors)console.error('SOUND-FAIL',e);console.log('Sound QA:',report.cases.length,'passed,',report.errors.length,'failed');if(report.errors.length||report.cases.length!==17)process.exitCode=1}
