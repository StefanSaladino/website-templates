/* Internal candidate review only; downloads/crops never confer media rights. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
const here=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.resolve(here,'..');
const inventory=JSON.parse(readFileSync(path.join(here,'data/template-media-inventory.json'),'utf8'));
const args=process.argv.slice(2);
const flag=name=>args.includes('--'+name);
const option=name=>args.find(arg=>arg.startsWith('--'+name+'='))?.slice(name.length+3);
const offline=flag('offline');
const templates=(option('templates')||'frame-portfolio,editorial-commerce,muskoka-retreat,creative-agency').split(',').map(x=>x.trim()).filter(Boolean);
const ids=(option('ids')||'').split(',').map(x=>x.trim()).filter(Boolean);
const limitRaw=option('limit'),limit=limitRaw===undefined?Infinity:Number(limitRaw);
if((!Number.isInteger(limit)&&limit!==Infinity)||limit<1)throw Error('--limit must be a positive integer');
const output=path.resolve(option('output')||path.join(root,'stock-candidates/template-review'));
const allowed=new Set(['images.unsplash.com','images.pexels.com']);
const esc=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const selected=inventory.assets.filter(asset=>flag('all')||ids.includes(asset.id)||(!ids.length&&asset.usages.some(u=>templates.includes(u.templateId)))).slice(0,limit);
if(!selected.length)throw Error('No matching original-template media records');
mkdirSync(output,{recursive:true});
const results=[];
async function acquire(asset){
 const url=new URL(asset.urlIdentity);
 if(url.protocol!=='https:'||!allowed.has(url.hostname))throw Error('Unexpected acquisition host');
 if(url.hostname==='images.unsplash.com'){url.searchParams.set('fm','jpg');url.searchParams.set('fit','max');url.searchParams.set('w','1800');url.searchParams.set('q','82');}
 else{url.searchParams.set('auto','compress');url.searchParams.set('w','1800');}
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),25000);
 try{
  const response=await fetch(url,{signal:controller.signal,headers:{Accept:'image/jpeg,image/png;q=0.9,image/webp;q=0.7','User-Agent':'BoomerTemplateReview/1.0'}});
  if(!response.ok)throw Error('HTTP '+response.status);
  const actual=new URL(response.url);
  if(actual.protocol!=='https:'||!allowed.has(actual.hostname))throw Error('External redirect not permitted');
  if(!/^image\/(?:jpeg|png|webp|avif)\b/i.test(response.headers.get('content-type')||''))throw Error('Unexpected media content type');
  const parts=[];let size=0;
  for await(const part of response.body){size+=part.byteLength;if(size>16*1024*1024)throw Error('Candidate exceeds 16 MB');parts.push(Buffer.from(part));}
  if(size<5000)throw Error('Image appears incomplete');
  const raw=Buffer.concat(parts,size);
  const metadata=await sharp(raw).metadata();
  if((metadata.width||0)<800||(metadata.height||0)<600)throw Error('Image smaller than 800×600 candidate floor');
  const ext={jpeg:'jpg',png:'png',webp:'webp',avif:'avif',heif:'avif'}[metadata.format];
  if(!ext)throw Error('Unsupported image format '+metadata.format);
  const original=asset.id+'-candidate.'+ext,wide=asset.id+'-desktop.webp',desktopPortrait=asset.id+'-desktop-portrait.webp',desktopLandscape=asset.id+'-desktop-landscape.webp',phoneCenter=asset.id+'-phone-center.webp',phoneAttention=asset.id+'-phone-attention.webp',phoneFull=asset.id+'-phone-full.webp',phoneTall=asset.id+'-phone-tall.webp';
  writeFileSync(path.join(output,original),raw);
  // Crop comparisons are human-review stress tests, not final template crops.
  // Include portrait/landscape desktop ratios and a tall phone hero ratio;
  // a single attention-based crop cannot choose for the reviewer.
  const background=(await sharp(raw).stats()).dominant;
  await Promise.all([
   sharp(raw).rotate().resize(640,360,{fit:'cover',position:'centre'}).webp({quality:80}).toFile(path.join(output,wide)),
   sharp(raw).rotate().resize(480,640,{fit:'cover',position:'centre'}).webp({quality:80}).toFile(path.join(output,desktopPortrait)),
   sharp(raw).rotate().resize(640,512,{fit:'cover',position:'centre'}).webp({quality:80}).toFile(path.join(output,desktopLandscape)),
   sharp(raw).rotate().resize(360,480,{fit:'cover',position:'centre'}).webp({quality:80}).toFile(path.join(output,phoneCenter)),
   sharp(raw).rotate().resize(360,480,{fit:'cover',position:'attention'}).webp({quality:80}).toFile(path.join(output,phoneAttention)),
   sharp(raw).rotate().resize(360,480,{fit:'contain',background:{r:background.r,g:background.g,b:background.b,alpha:1}}).webp({quality:80}).toFile(path.join(output,phoneFull)),
   sharp(raw).rotate().resize(360,600,{fit:'cover',position:'centre'}).webp({quality:80}).toFile(path.join(output,phoneTall))
  ]);
  return{candidateStatus:'downloaded-for-review',original,wide,desktopPortrait,desktopLandscape,phoneCenter,phoneAttention,phoneFull,phoneTall,width:metadata.width,height:metadata.height,bytes:size,sourceSHA256:createHash('sha256').update(raw).digest('hex')};
 }finally{clearTimeout(timer);}
}
for(const asset of selected){
 const item={id:asset.id,kind:asset.kind,urlIdentity:asset.urlIdentity,usages:asset.usages,
  sourcePageUrl:asset.sourcePageUrl||null,creator:asset.creator||null,
  rightsReviewedAt:asset.rightsReviewedAt||null,reviewStatus:'needs-review',
  componentStockId:asset.linkedComponentStockId||null,pilotVisualReview:asset.pilotVisualReview||null,candidateStatus:'not-downloaded'};
 if(asset.kind==='video')item.candidateStatus='video-manual-review';
 else if(offline)item.candidateStatus='offline-no-image-inspection';
 else try{Object.assign(item,await acquire(asset));console.log('CANDIDATE '+asset.id+' '+item.width+'×'+item.height);}
 catch(error){item.candidateStatus='download-failed';item.error=String(error?.message||error);console.error('FAIL CANDIDATE '+asset.id+': '+item.error);}
 results.push(item);
}
const report={generatedAt:new Date().toISOString(),mode:offline?'offline':'candidate-downloads',
 disclaimer:'NOT RIGHTS CLEARED. Desktop and phone crops are local review evidence only, not commercial publication assets.',
 total:results.length,downloaded:results.filter(x=>x.wide).length,errors:results.filter(x=>x.error).length,assets:results};
writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2)+'\n');
const rows=results.map(item=>{
 const preview=item.wide
  ?'<div class="previews">'+
   '<figure><img src="'+esc(item.wide)+'" alt="'+esc(item.id+' wide stress-test crop')+'"><figcaption>Desktop 16:9 stress test</figcaption></figure>'+
   '<figure><img src="'+esc(item.desktopPortrait)+'" alt="'+esc(item.id+' centered portrait crop')+'"><figcaption>Desktop 3:4 portrait</figcaption></figure>'+
   '<figure><img src="'+esc(item.desktopLandscape)+'" alt="'+esc(item.id+' centered landscape crop')+'"><figcaption>Desktop 5:4 landscape</figcaption></figure>'+
   '<figure class="phone"><img src="'+esc(item.phoneCenter)+'" alt="'+esc(item.id+' centered phone crop')+'"><figcaption>Phone 3:4 center</figcaption></figure>'+
   '<figure class="phone"><img src="'+esc(item.phoneAttention)+'" alt="'+esc(item.id+' attention phone crop')+'"><figcaption>Phone 3:4 attention</figcaption></figure>'+
   '<figure class="phone"><img src="'+esc(item.phoneFull)+'" alt="'+esc(item.id+' full-frame phone crop')+'"><figcaption>Phone 3:4 contain</figcaption></figure>'+
   '<figure class="phone"><img src="'+esc(item.phoneTall)+'" alt="'+esc(item.id+' tall centered phone crop')+'"><figcaption>Phone 3:5 tall</figcaption></figure></div>'
  :'<div class="empty">No local image crop · '+esc(item.candidateStatus)+'</div>';
 const uses=item.usages.map(u=>esc(u.templateId)+' <small>'+esc(u.files.join(', '))+'</small>').join(' · ');
 return '<article><h2>'+esc(item.id)+' <small>'+esc(item.candidateStatus)+'</small></h2>'+preview+
 '<div class="detail"><p><b>Usage:</b> '+uses+'</p><p><b>Dimensions:</b> '+esc(item.width?item.width+' × '+item.height:'Not measured')+'</p><p><b>Source:</b> <a href="'+esc(item.urlIdentity)+'" target="_blank" rel="noreferrer">CDN file identity</a> · '+(item.sourcePageUrl?'<a href="'+esc(item.sourcePageUrl)+'" target="_blank" rel="noreferrer">Creator source page</a>':'<em>Source page unverified</em>')+'</p>'+
 '<p><b>Creator:</b> '+esc(item.creator||'Unverified')+'</p><p><b>Source hash:</b> <code>'+esc(item.sourceSHA256||'Not captured')+'</code></p>'+ (item.pilotVisualReview?'<p><b>Prior visual QA — NOT APPROVED:</b> '+esc(item.pilotVisualReview.notes)+'</p>':'')+
 (item.error?'<p class="issue">Capture error: '+esc(item.error)+'</p>':'')+
 '<p class="review">Still required: rights, people/brands/property, image accuracy, desktop and phone crops, alt text, source licence.</p></div></article>';
}).join('\n');
const css='*{box-sizing:border-box}body{margin:0;background:#f1f0e8;color:#252b27;font:15px/1.55 Arial,sans-serif}header{padding:40px 5vw 28px;border-bottom:2px solid #252b27}h1{font:400 clamp(40px,5vw,70px)/1 Georgia,serif;letter-spacing:-.045em;margin:15px 0}.kicker{font-size:11px;font-weight:800;letter-spacing:.16em}.warning{font-weight:bold;color:#7b3d25}.inventory{max-width:1420px;margin:0 auto;padding:20px 5vw 80px}article{padding:24px 0;border-bottom:1px solid #a9b3a7;display:grid;grid-template-columns:1fr 1fr;gap:16px 35px}article h2{grid-column:1/-1;font-size:23px;margin:0}article h2 small{font-size:12px;font-weight:400;margin-left:20px;color:#59685e}.previews{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;align-items:start}.previews figure{min-width:0;margin:0}.previews figure.phone{max-width:none}.previews img{display:block;width:100%;height:auto}.previews figcaption{font-size:11px;padding:6px 0}.empty{border:1px dashed #859186;min-height:150px;display:grid;place-items:center;text-align:center}.detail p{margin:0 0 10px;overflow-wrap:anywhere}code{font-size:11px;word-break:break-all}.issue{color:#9b392c}.review{border-top:1px solid #bbc1b7;padding-top:12px;font-weight:700}a{color:#305e4c;text-underline-offset:3px}:focus-visible{outline:3px solid #824021;outline-offset:3px}@media(max-width:760px){article{grid-template-columns:1fr}article h2{grid-column:1}header{padding:30px 5vw}.previews{display:flex;overflow-x:auto;overscroll-behavior-inline:contain}.previews figure{flex:0 0 44%;min-width:135px}.previews figure.phone{max-width:none;flex:0 0 29%;min-width:100px}}';
const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Template media review candidates</title><link rel="stylesheet" href="review.css"></head><body><header><span class="kicker">BOOMER AUTOMATION / INTERNAL QA</span><h1>Original template media review</h1><p class="warning">Unapproved stock candidates only. No creator, model/property, licensing or commercial-use approval granted.</p><p>'+report.total+' records · '+report.downloaded+' downloaded · '+report.errors+' capture errors</p></header><main class="inventory">'+rows+'</main></body></html>';
writeFileSync(path.join(output,'index.html'),html+'\n');
writeFileSync(path.join(output,'review.css'),css+'\n');
console.log('Media review folder: '+output+' ('+results.length+' entries, '+report.downloaded+' candidate images)');
if(report.errors)process.exitCode=1;
