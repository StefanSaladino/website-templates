/* MENU-04 real download QA: PDF structure, extracted text and rendered-page evidence.
 * This is NOT PDF/UA certification; tags and PDF extraction alone cannot prove it.
 */
import {chromium} from 'playwright';
import {spawn,spawnSync} from 'node:child_process';
import {mkdirSync,existsSync,readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const evidence=path.join(root,'components','menu-pdf-evidence');
mkdirSync(evidence,{recursive:true});
const server=spawn('python3',['-m','http.server','4202','--bind','127.0.0.1'],{cwd:path.join(root,'dist'),stdio:'ignore'});
const pageUrl='http://127.0.0.1:4202/components/previews/MENU-04/';
const report={type:'generated tagged sample PDF QA',page:pageUrl,success:false,
  legalApproval:false,pdfUaCertified:false,screenReaderCertified:false,errors:[]};
const insist=(v,label)=>{if(!v)throw Error(label)};
async function ready(){
 for(let i=0;i<50;i++){
  try{if((await fetch(pageUrl)).ok)return;}catch{}
  await new Promise(resolve=>setTimeout(resolve,200));
 }
 throw Error('Built sample menu route did not respond');
}
function invoke(name,args){
 const result=spawnSync(name,args,{encoding:'utf8',timeout:30000});
 if(result.status!==0)throw Error(name+' failed: '+(result.stderr||result.stdout||result.error));
 return result.stdout;
}
let browser;
try{
 await ready();
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
 browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox']});
 const context=await browser.newContext({acceptDownloads:true,viewport:{width:390,height:844},reducedMotion:'reduce'});
 const page=await context.newPage();
 const runtimeErrors=[];
 page.on('pageerror',e=>runtimeErrors.push(String(e)));
 await page.goto(pageUrl,{waitUntil:'domcontentloaded'});
 const download=page.waitForEvent('download',{timeout:12000});
 await page.locator('#download-pdf').click();
 const result=await download;
 insist(result.suggestedFilename()==='atelier-table-fictional-sample-menu.pdf','Sample PDF filename mismatch');
 const source=await result.path();
 const bytes=readFileSync(source);
 insist(bytes.length>1800&&bytes.slice(0,8).toString()==='%PDF-1.7','No valid PDF header or empty download');
 const text=bytes.toString('latin1');
 for(const token of ['/StructTreeRoot','/ParentTree','/StructParents 0','/Marked true','/Lang (en-CA)','/ToUnicode','/S /H1','/S /H2','/S /P']){
  insist(text.includes(token),'Missing expected tagged PDF marker '+token);
 }
 insist(!runtimeErrors.length,'Browser errors '+runtimeErrors.join('; '));
 const pdf=path.join(evidence,'atelier-table-tagged-sample.pdf');
 writeFileSync(pdf,bytes);
 const info=invoke('pdfinfo',[pdf]);
 insist(/Pages:\s+1\b/.test(info),'PDF should have exactly one page');
 const extracted=invoke('pdftotext',['-layout',pdf,'-']);
 for(const phrase of ['FICTIONAL SAMPLE MENU','Warm orchard vegetables','Garden grain selection','Little chocolate cake',
   'All dishes and prices are fictional','No ingredients, allergens, kitchen or venue are verified.']){
  insist(extracted.includes(phrase),'Missing extracted PDF text: '+phrase);
 }
 const render=path.join(evidence,'menu-pdf-render');
 invoke('pdftoppm',['-f','1','-singlefile','-png','-r','140',pdf,render]);
 insist(existsSync(render+'.png'),'PDF renderer did not create preview');
 report.success=true;
 report.pdfBytes=bytes.length;
 report.pageCount=1;
 report.extractedText=extracted;
 report.pdfInfo=info;
 report.renderPath='menu-pdf-render.png';
 report.samplePath='atelier-table-tagged-sample.pdf';
 report.browserErrors=runtimeErrors.length;
 console.log('PASS: downloadable PDF parses, extracts all example dishes, renders to PNG and includes structural tags');
 await context.close();
}catch(error){
 report.errors.push(error?.stack||String(error));
 console.error('FAIL:',error?.stack||String(error));
 process.exitCode=1;
}finally{
 await browser?.close().catch(()=>{});
 server.kill('SIGTERM');
 writeFileSync(path.join(evidence,'results.json'),JSON.stringify(report,null,2));
}
