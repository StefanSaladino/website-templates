import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const here=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dist=path.resolve(here,'../dist'),dir=path.join(here,'component-browser-evidence','palette-audit'),origin='http://127.0.0.1:4206/',url=origin+'components/builder.html';
mkdirSync(dir,{recursive:true});const server=spawn('python3',['-m','http.server','4206','--bind','127.0.0.1'],{cwd:dist,stdio:'ignore'});let browser;
const palettes=[['professional','#1B3556','#EDF1F6','#C69B54'],['dark','#252A31','#111318','#D5AF72'],['inverted','#E6E3DC','#182B3B','#E9825B'],['bold','#4A116E','#F5F1FC','#F5BD28'],['near-equal','#252525','#292929',null],['no-trim','#A02032','#FFF7EE',null]];
const scenarios=[['business','multiple'],['work','single'],['products','single'],['booking','multiple']];
const rgb=s=>s.match(/[\d.]+/g)?.slice(0,3).map(Number),hexRGB=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)),close=(a,b)=>a&&b&&a.every((v,i)=>Math.abs(v-b[i])<=1);
const report={cases:[],scope:'Chromium; external network blocked; media identity/crop/filter checked, not licensed media delivery. Solid-background contrast is heuristic; gradients and photographs need human review.'};
try{
 for(let i=0;i<50;i++){try{if((await fetch(url)).ok)break}catch{}await new Promise(r=>setTimeout(r,200))}
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/opt/google/chrome/chrome','/usr/bin/chromium'].find(existsSync);
 browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox']});
 for(const [purpose,size] of scenarios){
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});await context.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
  const page=await context.newPage();await page.goto(url,{waitUntil:'domcontentloaded'});await page.locator('[data-purpose='+purpose+']').click();await page.locator('[data-size='+size+']').click();await page.locator('[data-mode=custom]').click();await page.locator('[data-delegate-all]').click();await page.locator('summary').filter({hasText:'I have my own brand colours'}).click();const mediaByPage=new Map();
  for(const [name,primary,secondary,trim] of palettes){
   for(const [k,v] of Object.entries({primary,secondary,trim:trim||'#000000'}))await page.locator('[data-hex='+k+']').fill(v);
   if(!trim&&await page.locator('#trim').isChecked())await page.locator('#trim').uncheck();
   const key=[primary,secondary,trim||'none'].join('/');
   await page.waitForFunction(k=>{const d=document.querySelector('#palette-preview')?.contentDocument;return d?.body?.dataset.previewReady==='true'&&d.body.dataset.previewPalette===k},key);
   await page.locator('#palette-preview').scrollIntoViewIfNeeded();await page.locator('#next').click();await page.waitForFunction(k=>{const d=document.querySelector('#preview')?.contentDocument;return d?.body?.dataset.previewReady==='true'&&d.body.dataset.previewPalette===k},key);
   const tabs=await page.locator('[data-page]').count(),pages=tabs?await page.locator('[data-page]').evaluateAll(a=>a.map(x=>x.dataset.page)):['home'];
   for(const pg of pages){if(tabs)await page.locator('[data-page='+pg+']').click();
    for(const w of [390,768,1440]){
     await page.locator('[data-width="'+w+'"]').click();
     await page.waitForFunction(({k,w})=>{const f=document.querySelector('#preview'),d=f?.contentDocument;return d?.body?.dataset.previewReady==='true'&&d.body.dataset.previewPalette===k&&f.contentWindow.innerWidth===w},{k:key,w});
     await page.locator('#preview').scrollIntoViewIfNeeded();await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));const result=await page.locator('#preview').evaluate(frame=>{
      const d=frame.contentDocument,win=frame.contentWindow,hosts=[...d.querySelectorAll('[data-source-status=mounted]')],rows=[],media=[],issues=[];
      const parse=s=>{const m=s.match(/^rgba?\(([^)]+)\)$/);return m?m[1].split(',').map(Number):null};
      const lum=c=>c.slice(0,3).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((a,x,i)=>a+x*[.2126,.7152,.0722][i],0);
      for(const host of hosts){const target=host.shadowRoot.querySelector('[data-source-target]'),style=win.getComputedStyle(target);
       rows.push({id:host.dataset.id,palette:host.dataset.palettePrimary,background:style.backgroundColor,display:style.display,width:Math.round(target.getBoundingClientRect().width),height:Math.round(target.getBoundingClientRect().height)});
       for(const n of target.querySelectorAll('img,video')){const cs=win.getComputedStyle(n);media.push({id:host.dataset.id,src:n.getAttribute('src'),fit:cs.objectFit,position:cs.objectPosition,filter:cs.filter})}
       for(const n of target.querySelectorAll('h1,h2,h3,p,a,button,label,summary')){if(!n.getClientRects().length||!n.textContent.trim()||n.closest('[role=img],svg,figure,[class*="photo"],[class*="art"],[class*="visual"]'))continue;const fg=parse(win.getComputedStyle(n).color);if(!fg||fg[3]!==undefined&&fg[3]<.99)continue;let bg=null,unknown=false;for(let a=n;a;a=a.parentElement){const st=win.getComputedStyle(a);if(st.backgroundImage!=='none'||a.querySelector(':scope > img,:scope > video,:scope > [class*="overlay"],:scope > [class*="shade"]')){unknown=true;break}const c=parse(st.backgroundColor);if(c&&(c.length===3||c[3]>.99)){bg=c;break}if(c&&c[3]>.01){unknown=true;break}}if(unknown||!bg)continue;const ratio=(Math.max(lum(fg),lum(bg))+.05)/(Math.min(lum(fg),lum(bg))+.05);if(ratio<4.45)issues.push({id:host.dataset.id,text:n.textContent.trim().slice(0,50),ratio:+ratio.toFixed(2)})}
      }return {rows,media,issues,errors:d.querySelectorAll('[data-source-status=error]').length,body:win.getComputedStyle(d.body).backgroundColor,overflow:d.documentElement.scrollWidth>win.innerWidth+2};
     });
     const record={purpose,size,page:pg,palette:name,width:w,...result};report.cases.push(record);writeFileSync(path.join(dir,'report.json'),JSON.stringify(report,null,2));
     assert.equal(result.errors,0,JSON.stringify(record));assert(result.rows.length>1&&result.rows.every(x=>x.palette===primary&&x.width>0&&x.height>0),JSON.stringify(record));assert(close(rgb(result.body),hexRGB(secondary)),JSON.stringify(record));
     const footer=result.rows.find(x=>x.id==='FOOT-01');if(footer)assert(close(rgb(footer.background),hexRGB(primary)),JSON.stringify(record));
     const mediaKey=pg+'/'+w,prior=mediaByPage.get(mediaKey);if(prior)assert.deepEqual(result.media,prior,'Media changed '+purpose+'/'+pg+'/'+w);else mediaByPage.set(mediaKey,result.media);
     if(['professional','dark','bold'].includes(name)&&[390,1440].includes(w)&&pg==='home')await page.locator('#preview').screenshot({path:path.join(dir,purpose+'-'+name+'-'+w+'.png'),timeout:15000,animations:'disabled'});
    }
   }
   await page.locator('[data-edit-colours]').click();await page.locator('summary').filter({hasText:'I have my own brand colours'}).click();
  }await context.close();
 }
 console.log('PASS palette audit '+report.cases.length+' page/viewport/palette combinations; '+report.cases.reduce((n,c)=>n+c.issues.length,0)+' heuristic contrast flags and '+report.cases.filter(c=>c.overflow).length+' overflow flags recorded.');
}finally{writeFileSync(path.join(dir,'report.json'),JSON.stringify(report,null,2));if(browser)await browser.close();server.kill()}
