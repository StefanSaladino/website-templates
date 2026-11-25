import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import http from 'node:http';
import {mkdirSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,'components/matter-evidence');mkdirSync(out,{recursive:true});
const registered=existsSync(path.join(root,'templates/matter-exhibition/index.html'));
const url='http://127.0.0.1:4339'+(registered?'/templates/matter-exhibition/':'/templates/_drafts/matter-exhibition/')+'index.html';
const server=spawn('python3',['-m','http.server','4339','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
let browser;
try{
 const ready=()=>new Promise(resolve=>{const req=http.request(url,{method:'HEAD',agent:false},res=>{res.resume();resolve(res.statusCode===200)});req.on('error',()=>resolve(false));req.setTimeout(1000,()=>req.destroy());req.end()});
 let listening=false;for(let i=0;i<60;i++){if(await ready()){listening=true;break}await new Promise(r=>setTimeout(r,150))}assert(listening,'MATTER server failed readiness');
 browser=await chromium.launch({headless:true,executablePath:['/usr/bin/google-chrome','/usr/bin/chromium'].find(existsSync),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const width of [320,390,768,1440]){
 const height=width===320?568:width===1440?900:844;
 const p=await browser.newPage({viewport:{width,height}});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&/shader|program link|WebGL/i.test(m.text()))errors.push(m.text())});
 await p.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,opts){return original.call(this,kind,kind==='webgl2'?{...opts,preserveDrawingBuffer:true}:opts)}});
 await p.goto(url,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>document.documentElement.style.getPropertyValue('--progress')!=='');
 assert(!await p.locator('html').evaluate(n=>n.classList.contains('no-webgl')),'WebGL init failed '+JSON.stringify(errors));
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow');
 const frames=[];
 for(const f of [0,.12,.24,.36,.48,.60,.69,.76,.85,.92,.96,.48,0]){
 await p.evaluate(f=>{const t=document.querySelector('#exhibition-track'),s=document.querySelector('#exhibition-sticky');scrollTo({top:t.offsetTop+(t.offsetHeight-s.offsetHeight)*f,behavior:'instant'})},f);
 await p.waitForFunction(f=>Math.abs(Number(document.documentElement.style.getPropertyValue('--progress'))-f)<.005,f,{timeout:20000});
 const stats=await p.locator('#matter-canvas').evaluate(c=>{const gl=c.getContext('webgl2'),w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,pixels=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);let count=0,hash=2166136261,minX=w,maxX=0,minY=h,maxY=0;for(let y=0;y<h;y+=3)for(let x=0;x<w;x+=3){let i=(y*w+x)*4;if(pixels[i+3]>48){count++;minX=Math.min(x,minX);maxX=Math.max(x,maxX);minY=Math.min(y,minY);maxY=Math.max(y,maxY);hash=Math.imul(hash^pixels[i]^pixels[i+1]<<8^pixels[i+2]<<16,16777619)}}return {count,hash,minX,maxX,minY,maxY,w,h,error:gl.getError(),bounds:c.getBoundingClientRect().toJSON()}});
 console.log('MATTER',width,f,JSON.stringify(stats));assert(stats.count>30,'blank frame '+f);assert.equal(stats.error,0,'GL error');
 assert(stats.bounds.width<=width+1&&stats.bounds.height<=height+1,'canvas exceeds stage');
 // The airborne field intentionally spans the viewport. Solid phases
 // must still stay framed; enforce the visual goal rather than shrinking
 // everything to satisfy a single silhouette limit.
 if(f<=.48||f>=.92){
   assert(stats.minX>=stats.w*.025&&stats.maxX<=stats.w*.975&&stats.minY>=stats.h*.025&&stats.maxY<=stats.h*.975,'solid sculpture clipped at '+width+' / '+f+' '+JSON.stringify(stats));
   if(width<=820)assert(stats.minY>=stats.h*.23&&stats.maxY<=stats.h*.92,'solid sculpture overlaps protected mobile margin '+width+' / '+f);
 }
 if(width<=820&&(f===0||f===.76||f===.96)){
   const opacity=await p.locator('.foreground-layer').evaluate(n=>Number(getComputedStyle(n,'::before').opacity));
   assert(f===.76?opacity<=.03:opacity>=.97,'mobile overlay did not release/restore '+width+' / '+f+' opacity '+opacity);
 }
 if(f===.76){
   assert(stats.maxX-stats.minX>=stats.w*.84,'dissolution does not fill width '+width+' '+JSON.stringify(stats));
   assert(stats.maxY-stats.minY>=stats.h*.80,'dissolution does not fill height '+width+' '+JSON.stringify(stats));
 }
 if(f===.60){
   const before=frames.at(-1);
   assert(stats.maxX-stats.minX>=(before.maxX-before.minX)*.90,'premature sculpture shrink '+width+' '+JSON.stringify(stats));
 }
 frames.push(stats);await p.screenshot({path:path.join(out,width+'-'+frames.length+'.png')});
 }
 assert(new Set(frames.map(x=>x.hash)).size>=5,'scenes fail to change');
 await p.locator('#still-toggle').click();assert.equal(await p.locator('#still-toggle').getAttribute('aria-pressed'),'true');
 await p.locator('#matter-canvas').evaluate(c=>c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
 await p.waitForFunction(()=>document.documentElement.classList.contains('no-webgl'));
 assert(await p.locator('.webgl-fallback').isVisible(),'missing context-loss fallback');
 await p.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));assert(await p.locator('footer').isVisible());
 assert.deepEqual(errors,[]);await p.close();
 }
 for(const width of [320,390,1440]){
 const p=await browser.newPage({viewport:{width,height:844}});
 await p.addInitScript(()=>{const orig=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(k,...a){return k==='webgl2'?null:orig.call(this,k,...a)}});
 await p.goto(url);await p.waitForFunction(()=>document.documentElement.classList.contains('no-webgl'));
 for(const f of [0,.24,.48,.69,.85]){
 await p.evaluate(f=>{const t=document.querySelector('#exhibition-track'),s=document.querySelector('#exhibition-sticky');scrollTo({top:t.offsetTop+(t.offsetHeight-s.offsetHeight)*f,behavior:'instant'})},f);
 await p.waitForFunction(f=>Math.abs(Number(document.documentElement.style.getPropertyValue('--progress'))-f)<.01,f);
 assert.equal(await p.locator('.fallback-plate:visible').count(),1);
 }assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.screenshot({path:path.join(out,width+'-fallback.png')});await p.close();
 }
 const reduced=await browser.newPage({viewport:{width:320,height:568},reducedMotion:'reduce'});
 await reduced.goto(url);assert.equal(await reduced.locator('.chapter-card:visible').count(),5);assert(await reduced.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await reduced.close();
 console.log('PASS MATTER: WebGL pixels, changing scenes, still mode, context loss, fallback plates, responsive bounds and reduced motion.');
}finally{await browser?.close();server.kill()}
