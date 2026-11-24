// Capture the actual opening viewport; no redrawn artwork, overlays, or video streams.
import {chromium} from 'playwright';
import sharp from 'sharp';
import {spawn,execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const allIds=["apex-automotive","resonance-sound","event-horizon","essence-fragrance","calibre-watch","shift-card","prism-optics","orbit-cinema","abyss-ocean","strata-architecture","fulcrum-light","selvedge-outerwear"];
const only=process.argv.find(a=>a.startsWith('--only='))?.slice(7);
if(only&&!allIds.includes(only))throw Error('Unknown capture id '+only);
const ids=only?[only]:allIds;
const viewport={width:1440,height:900},origin='http://127.0.0.1:4318/';
const output=path.join(root,'components/gallery-opening-evidence');mkdirSync(output,{recursive:true});
const server=spawn('python3',['-m','http.server','4318','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
const specs=JSON.parse(readFileSync(path.join(root,'components/data/immersive-tests.json'),'utf8'));
const inventory=JSON.parse(readFileSync(path.join(root,'components/data/template-media-inventory.json'),'utf8'));
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const report={sourceCommit,viewport,output:{width:960,height:600,format:'webp'},reviewOnly:true,captures:[]};
let browser;
try{
 for(let i=0;i<60;i++){try{if((await fetch(origin+'index.html')).ok)break}catch{}await new Promise(r=>setTimeout(r,200))}
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
 for(const id of ids){
  const ctx=await browser.newContext({viewport,deviceScaleFactor:1,reducedMotion:'no-preference'});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>r.request().resourceType()==='media'?r.abort('blockedbyclient'):r.continue());
  const response=await page.goto(origin+'templates/'+id+'/',{waitUntil:'domcontentloaded',timeout:30000});
  assert.equal(response.status(),200,id+' route');
  await page.evaluate(()=>document.fonts.ready);
  // Decode original in-viewport photos, and all eager photos (the optical
  // scenes may sample them into their rendered artwork).
  const loaded=await page.evaluate(async()=>Promise.all([...document.images].filter(i=>{const b=i.getBoundingClientRect();return (i.loading!=='lazy'||(b.bottom>0&&b.top<innerHeight))&&(i.getAttribute('src')||i.getAttribute('srcset'))}).map(async i=>{await Promise.race([i.decode(),new Promise((_,reject)=>setTimeout(()=>reject(Error('Image decode timeout '+i.src)),18000))]);return {src:i.currentSrc||i.src,width:i.naturalWidth,height:i.naturalHeight}})));
  assert(loaded.every(i=>i.width>0&&i.height>0),id+' unloaded image');
  const spec=specs[id];
  if(id==='shift-card')await page.waitForFunction(()=>{const s=document.querySelector('#composition');return s?.dataset.renderer==='webgl'&&s.dataset.motionSettled==='true'&&+s.dataset.progress===0},{},{timeout:15000});
  else if(id==='selvedge-outerwear')await page.waitForFunction(()=>{const s=document.querySelector('#stage');return s?.dataset.mode==='live'&&s.dataset.settled==='true'&&+s.dataset.progress===0},{},{timeout:15000});
  else if(spec?.stage&&id!=='strata-architecture')await page.waitForFunction(({sel,initial})=>{const s=document.querySelector(sel);return s&&Object.entries(initial).filter(([k])=>k!=='data-rendered-paused').every(([k,v])=>s.getAttribute(k)===v)},{sel:spec.stage,initial:spec.initial},{timeout:15000});
  const opening=await page.evaluate(()=>{const h=document.querySelector('h1'),r=h?.getBoundingClientRect(),cs=h&&getComputedStyle(h);return {title:h?.textContent?.trim().replace(/\s+/g,' '),scrollY,overflow:document.documentElement.scrollWidth>innerWidth+2,headingVisible:!!r&&r.width>0&&r.height>0&&r.top<innerHeight&&r.bottom>0&&cs.visibility!=='hidden'&&cs.display!=='none',canvases:[...document.querySelectorAll('canvas')].filter(c=>{const r=c.getBoundingClientRect();return r.width>0&&r.height>0&&r.top<innerHeight&&r.bottom>0}).length}});
  assert(opening.headingVisible&&!opening.overflow&&opening.scrollY===0,id+' opening viewport '+JSON.stringify(opening));
  // Take the actual viewport at the original opening, never scroll into a
  // later chapter. Wait two paints after decoded media and renderer readiness.
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const png=await page.screenshot({type:'png',fullPage:false,timeout:20000});
  assert.deepEqual(errors,[],id+' browser errors');
  const image=await sharp(png).resize(960,600,{fit:'fill'}).webp({quality:89,effort:5}).toBuffer();
  assert(image.length>2000&&image.length<300000,id+' invalid or oversized thumbnail');
  const meta=await sharp(image).metadata();assert.equal(meta.width,960);assert.equal(meta.height,600);
  const remote=loaded.filter(i=>/^https:\/\/(?:images\.pexels\.com|images\.unsplash\.com)\//.test(i.src)).map(i=>i.src.split('?')[0]);
  const assetIds=[...new Set(remote)].map(url=>{const item=inventory.assets.find(a=>a.urlIdentity===url&&a.usages.some(u=>u.templateId===id));assert(item,id+' untracked remote image '+url);return item.id});
  if(['apex-automotive','calibre-watch','essence-fragrance','orbit-cinema','strata-architecture','selvedge-outerwear'].includes(id))assert(assetIds.length,id+' missing decoded source photograph');
  writeFileSync(path.join(output,id+'.png'),png);writeFileSync(path.join(output,id+'.webp'),image);
  report.captures.push({id,sourceCommit,opening,bytes:image.length,sha256:createHash('sha256').update(image).digest('hex'),sourceAssetIds:assetIds,reviewStatus:'needs-review'});
  console.log('CAPTURE',id,opening.title,image.length+' bytes',assetIds.join(','));
  await ctx.close();
 }
 assert.equal(report.captures.length,ids.length);
 // Only modify the gallery once the complete capture set has passed.
 if(process.argv.includes('--apply')){
  let html=readFileSync(path.join(root,'index.html'),'utf8');
  for(const id of ids){
   const pattern=new RegExp('(<article\\b[^>]*data-template="'+id+'"[^>]*>[\\s\\S]*?<div class="thumb"[^>]*>)<img\\b[^>]*>(<span class="live-badge">Preview<\\/span>)','g');
   let count=0;html=html.replace(pattern,(_,start,badge)=>{count++;return start+'<img alt="" src="templates/'+id+'/gallery-opening.webp" width="960" height="600" loading="lazy" decoding="async" style="display:block;width:100%;height:100%;object-fit:contain"/>'+badge});
   assert.equal(count,1,id+' must have exactly one matching gallery card');
  }
  for(const id of ids)writeFileSync(path.join(root,'templates',id,'gallery-opening.webp'),readFileSync(path.join(output,id+'.webp')));
  writeFileSync(path.join(root,'index.html'),html);
  const ledgerPath=path.join(root,'components/data/gallery-opening-captures.json');
  if(only&&existsSync(ledgerPath)){const previous=JSON.parse(readFileSync(ledgerPath,'utf8'));report.captures=[...previous.captures.filter(x=>x.id!==only).map(x=>({...x,sourceCommit:x.sourceCommit||previous.sourceCommit})),...report.captures]}
  writeFileSync(ledgerPath,JSON.stringify(report,null,2)+'\n');
 }
}finally{writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');await browser?.close();server.kill()}
