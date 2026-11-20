/* Development-only stock acquisition. Does not modify rights statuses or commit image bytes. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
const here=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.resolve(here,'../stock-candidates');
mkdirSync(output,{recursive:true});
const manifest=JSON.parse(readFileSync(path.join(here,'data/stock-manifest.json'),'utf8'));
const candidates=manifest.assets.filter(x=>x.reviewStatus==='needs-review');
const summary={createdAt:new Date().toISOString(),status:'development-only-not-rights-approved',count:candidates.length,assets:[],errors:[]};
const previews=[];
const TIMEOUT_MS=30000;
async function download(entry){
 const url=new URL(entry.temporaryPreviewUrl);
 if(url.protocol!=='https:'||url.hostname!=='images.unsplash.com')throw Error('Unexpected photo host for '+entry.id);
 url.searchParams.set('fm','jpg');url.searchParams.set('w','1800');url.searchParams.set('q','82');
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),TIMEOUT_MS);
 try{
  const response=await fetch(url,{signal:controller.signal,headers:{'User-Agent':'BoomerComponentPreviewReview/1.0','Accept':'image/jpeg,image/*;q=0.8'}});
  if(!response.ok)throw Error('HTTP '+response.status);
  const mime=response.headers.get('content-type')||'';
  if(!mime.includes('image/'))throw Error('Non-image response '+mime);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(bytes.length<10000||bytes.length>20000000)throw Error('Unexpected size '+bytes.length);
  const meta=await sharp(bytes).metadata();
  if((meta.width||0)<800||(meta.height||0)<600)throw Error('Resolution too small '+meta.width+'x'+meta.height);
  const sha256=createHash('sha256').update(bytes).digest('hex');
  const name=entry.id+'.jpg';writeFileSync(path.join(output,name),bytes);
  const cell=await sharp(bytes).resize(480,310,{fit:'cover',position:'attention'}).jpeg({quality:82}).toBuffer();
  const i=previews.length;
  previews.push({input:cell,left:i%3*480,top:Math.floor(i/3)*350});
  summary.assets.push({id:entry.id,sourceUrl:entry.sourceUrl,licenseUrl:entry.licenseUrl,photographer:entry.photographer,cdnUrl:url.toString(),file:name,bytes:bytes.length,width:meta.width,height:meta.height,sha256,reviewStatus:'needs-review',visualRightsReview:'not yet conducted'});
  console.log('DOWNLOADED '+entry.id+' '+bytes.length+'B '+meta.width+'x'+meta.height);
 }finally{clearTimeout(timer)}
}
for(const entry of candidates){
 try{await download(entry)}
 catch(err){const message=entry.id+': '+err.message;console.error('FAILED '+message);summary.errors.push(message)}
}
if(previews.length){
 const rows=Math.ceil(previews.length/3),height=rows*350;
 const captions=summary.assets.map((x,i)=>'<text x="'+(i%3*480+16)+'" y="'+(Math.floor(i/3)*350+332)+'" font-family="Arial" font-size="19" fill="white">'+x.id+' '+x.width+'x'+x.height+'</text>').join('');
 const svg=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="'+height+'"><rect width="1440" height="'+height+'" fill="#1d211f"/>'+captions+'</svg>');
 await sharp(svg).composite(previews).png().toFile(path.join(output,'CONTACT-SHEET.png'));
}
writeFileSync(path.join(output,'acquisition-report.json'),JSON.stringify(summary,null,2)+'\n');
if(summary.errors.length){console.error('Photo candidate acquisition incomplete: '+summary.errors.length+' failures.');process.exitCode=1}
