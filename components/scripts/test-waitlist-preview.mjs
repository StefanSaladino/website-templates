/* STILL: proof a sample waitlist neither transmits data nor claims registration. */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdirSync,existsSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const evidence=path.join(root,'components','waitlist-preview-evidence');
mkdirSync(evidence,{recursive:true});
const base='http://127.0.0.1:4212/templates/waitlist/index.html';
const server=spawn('python3',['-m','http.server','4212','--bind','127.0.0.1'],{cwd:path.join(root,'dist'),stdio:'ignore'});
const report={scope:'STILL fictional beta preview and keyboard skip',pass:[],errors:[],realSignup:false};
const ensure=(value,message)=>{if(!value)throw Error(message)};
let browser;
try{
 for(let i=0;i<50;i++){
  try{if((await fetch(base)).ok)break;}catch{}
  await new Promise(r=>setTimeout(r,200));
 }
 const chrome=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 browser=await chromium.launch({headless:true,executablePath:chrome||undefined,args:['--no-sandbox']});
 for(const width of [320,390,768]){
  const context=await browser.newContext({viewport:{width,height:860},reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[],posts=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))posts.push({method:r.method(),url:r.url()});});
  try{
   const response=await page.goto(base,{waitUntil:'domcontentloaded',timeout:14000});
   ensure(response?.status()===200,'Preview must load');
   await page.keyboard.press('Tab');
   ensure(await page.locator('.skip-to-main').evaluate(e=>document.activeElement===e),'Skip link must be first focus stop');
   await page.keyboard.press('Enter');
   ensure(await page.evaluate(()=>document.activeElement?.id==='top'),'Skip link must focus main');
   ensure((await page.locator('#form-note').textContent()).includes('does not submit, store or register'),'Visible sample disclaimer is required');
   ensure((await page.locator('button[type="submit"]').textContent()).includes('Preview signup'),'Submit cannot claim genuine registration');
   await page.locator('button[type="submit"]').click();
   ensure((await page.locator('.form-status').textContent()).includes('valid example email'),'Empty input needs validation feedback');
   ensure(await page.locator('#email').evaluate(el=>document.activeElement===el),'Invalid email focuses field');
   await page.locator('#email').fill('sample@example.com');
   await page.locator('button[type="submit"]').click();
   ensure((await page.locator('.form-status').textContent()).includes('no waitlist entry was created'),'Valid example must not claim signup');
   ensure((await page.locator('.form-status').textContent()).includes('not sent or stored'),'No transfer or storage claim required');
   ensure(!posts.length,'Preview made unexpected network write: '+JSON.stringify(posts));
   ensure(!errors.length,'Uncaught script errors: '+errors.join('; '));
   report.pass.push({width,keyboardSkip:true,invalidFeedback:true,honestSuccess:true,noNetworkWrite:true});
   console.log('PASS: STILL',width+'px','skip, validation, honest preview, no outgoing writes');
  }catch(e){report.errors.push({width,error:String(e)});console.error('FAIL: STILL',width,String(e));}
  finally{await context.close();}
 }
}catch(e){report.errors.push({fatal:String(e?.stack||e)});}
finally{
 await browser?.close().catch(()=>{});
 server.kill('SIGTERM');
 writeFileSync(path.join(evidence,'results.json'),JSON.stringify(report,null,2));
 console.log('STILL preview QA:',report.pass.length+' passes',report.errors.length+' failures');
 if(report.errors.length)process.exitCode=1;
}
