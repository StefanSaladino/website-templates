import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import http from 'node:http';
import {mkdirSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,'components/atlas-evidence');mkdirSync(out,{recursive:true});
const url='http://127.0.0.1:4340/templates/_drafts/atlas-terrain/index.html';
const server=spawn('python3',['-m','http.server','4340','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
let browser;
try {
 const ready=()=>new Promise(resolve=>{const q=http.request(url,{method:'HEAD',agent:false},r=>{r.resume();resolve(r.statusCode===200)});q.on('error',()=>resolve(false));q.setTimeout(1000,()=>q.destroy());q.end()});
 let ok=false;for(let i=0;i<60;i++){if(await ready()){ok=true;break}await new Promise(r=>setTimeout(r,150))}assert(ok);
 browser=await chromium.launch({headless:true,executablePath:['/usr/bin/google-chrome','/usr/bin/chromium'].find(existsSync),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [width,height] of [[320,568],[390,844],[768,1024],[1440,900]]){
  const p=await browser.newPage({viewport:{width,height}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(k,o){return original.call(this,k,k==='webgl2'?{...o,preserveDrawingBuffer:true}:o)}});
  await p.goto(url,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>+document.querySelector('#atlas-stage').dataset.draws>0||document.querySelector('#atlas-stage').dataset.renderError,{},{timeout:25000});
  const stage=p.locator('#atlas-stage');assert.equal(await stage.getAttribute('data-renderer'),'webgl',await stage.getAttribute('data-render-error')||'WebGL initialization');
  assert.equal(await p.locator('html').getAttribute('data-atlas-release'),'A5');
  assert.equal(await p.locator('html').getAttribute('data-atlas-ready'),'true','scroll listeners must be installed after initialization');
  const moduleUrls=await p.evaluate(()=>performance.getEntriesByType('resource').map(x=>x.name).filter(x=>/\/src\/[^/]+\.js(?:\?|$)/.test(x)));assert.equal(new Set(moduleUrls).size,6,'six modules');assert(moduleUrls.every(x=>new URL(x).searchParams.get('v')==='5'),'mixed module releases '+moduleUrls.join(' '));
  const hashes=[];let firstBuffer=null;
  for(const [i,f] of [0,.12,.24,.44,.62,.82,.96,.44,0].entries()){
   await p.evaluate(f=>{const t=document.querySelector('#expedition-track'),s=document.querySelector('#atlas-stage');scrollTo({top:t.getBoundingClientRect().top+scrollY+(t.offsetHeight-s.offsetHeight)*f,behavior:'instant'})},f);
   await p.waitForFunction(f=>Math.abs(+document.querySelector('#atlas-stage').dataset.renderedProgress-f)<.006&&document.querySelector('#atlas-stage').dataset.settled==='true',f,{timeout:30000});
   const stats=await p.locator('#atlas-canvas').evaluate(c=>{const gl=c.getContext('webgl2'),w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,a=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,a);let hash=2166136261,colors=new Set();for(let y=0;y<h;y+=7)for(let x=0;x<w;x+=7){const i=(y*w+x)*4;const rgb=a[i]*65536+a[i+1]*256+a[i+2];colors.add(rgb);hash=Math.imul(hash^rgb,16777619)}return {w,h,hash,colors:colors.size,error:gl.getError(),overflow:document.documentElement.scrollWidth>innerWidth+1}});
   console.log('ATLAS',width,f,JSON.stringify(stats));assert(stats.colors>25,'flat/blank render');assert.equal(stats.error,0);assert(!stats.overflow);hashes.push(stats.hash);if(!firstBuffer)firstBuffer=[stats.w,stats.h];else assert.deepEqual([stats.w,stats.h],firstBuffer,'resolution changed while scrolling');assert(+await stage.getAttribute('data-camera-clearance')>=1.8,'terrain collision');assert.equal(await p.locator('.chapter-card:not([inert])').count(),1);
   await p.screenshot({path:path.join(out,width+'-'+i+'.png'),timeout:30000});
  }
  assert(new Set(hashes).size>=6,'world does not change');assert.deepEqual(errors,[]);
  await p.locator('#map .chapter-cue').click();await p.waitForFunction(()=>Math.abs(+document.querySelector('#atlas-stage').dataset.renderedProgress-.24)<.006&&document.querySelector('#atlas-stage').dataset.settled==='true',{},{timeout:45000});
  assert.equal(await p.locator('#atlas-stage').getAttribute('data-rendered-chapter'),'ascent');
  await p.locator('#still-toggle').click();assert.equal(await p.locator('html').getAttribute('data-still'),'true');assert.equal(await p.locator('.static-plate:visible').count(),5);assert.equal(await p.locator('.chapter-card:visible').count(),6);
  await p.locator('#still-toggle').click();
  await p.waitForFunction(()=>document.querySelector('html').dataset.still==='false'&&document.querySelector('#atlas-stage').dataset.renderer==='webgl');
  await p.locator('#atlas-canvas').evaluate(c=>c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await p.waitForFunction(()=>document.querySelector('#atlas-stage').dataset.renderer==='static');
  assert.equal(await p.locator('.static-plate:visible').count(),5);
  await p.close();
 }
 const fallback=await browser.newPage({viewport:{width:390,height:844}});
 await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(k,o){return k==='webgl2'?null:original.call(this,k,o)}});
 await fallback.goto(url);await fallback.waitForFunction(()=>document.documentElement.classList.contains('atlas-no-webgl'));
 assert.equal(await fallback.locator('.static-plate:visible').count(),5);
 assert.equal(await fallback.locator('.chapter-card:not([inert])').count(),6);
 assert(await fallback.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await fallback.close();
 const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await p.goto(url);assert.equal(await p.locator('html').getAttribute('data-still'),'true');assert(await p.locator('.static-plate:visible').count()>=5);await p.close();
 console.log('PASS ATLAS: four-viewport terrain, settled scroll, stable buffers, clearance, pixel diversity, still layout, context-loss and no-WebGL alternatives.');
}finally{await browser?.close();server.kill()}
