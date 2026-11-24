import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),out=path.join(root,'components/shift-storyboard-evidence'),origin='http://127.0.0.1:4298',url=origin+'/templates/shift-card/';
mkdirSync(out,{recursive:true});const server=spawn('python3',['-m','http.server','4298','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});let browser;const report=[];
try{for(let i=0;i<50;i++){try{if((await fetch(url)).ok)break}catch{}await new Promise(r=>setTimeout(r,200))}
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox']});
 for(const [w,h] of [[320,740],[390,844],[768,1024],[1440,900],[1920,1080],[844,390]]){
  const ctx=await browser.newContext({viewport:{width:w,height:h},reducedMotion:'reduce',javaScriptEnabled:false});const page=await ctx.newPage(),external=[];page.on('request',r=>{if(!r.url().startsWith(origin))external.push(r.url())});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());assert.equal((await page.goto(url))?.status(),200);assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('main .chapter').count(),5);
  for(const id of ['opening','object','finish','everyday','final']){const section=page.locator('#'+id);await section.scrollIntoViewIfNeeded();await section.locator('img').evaluate(img=>img.decode());const stats=await section.evaluate(n=>({width:n.clientWidth,scrollWidth:n.scrollWidth,documentWidth:document.documentElement.scrollWidth,viewport:innerWidth,heading:n.querySelector('h1,h2').getBoundingClientRect().width,image:n.querySelector('img').naturalWidth}));assert(stats.documentWidth<=w+1,JSON.stringify(stats));assert(stats.image===856);assert(stats.heading>0);await section.screenshot({path:path.join(out,w+'-'+h+'-'+id+'.png'),animations:'disabled'});report.push({w,h,id,...stats})}
  await page.locator('.concept summary').click();assert(await page.locator('.concept[open]').count()===1);assert.equal(external.length,0);await ctx.close()
 }
 console.log('PASS SHIFT static storyboard: '+report.length+' chapter captures; six viewports; native no-JS disclosure and zero external requests.');
}finally{writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser?.close();server.kill()}
