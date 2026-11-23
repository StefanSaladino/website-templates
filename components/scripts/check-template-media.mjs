import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Original full-site templates are a distinct media surface from the 157
// component specimens; this check inventories CDN identities, NOT image rights.
const here=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const templatesRoot=path.resolve(here,'../templates');
const inventory=JSON.parse(readFileSync(path.join(here,'data/template-media-inventory.json'),'utf8'));
const stock=JSON.parse(readFileSync(path.join(here,'data/stock-manifest.json'),'utf8'));
const errors=[];
const fail=message=>errors.push(message);
const cdnHosts=new Set(['images.unsplash.com','images.pexels.com','videos.pexels.com']);
const normalize=value=>{
 if(!value)return null;
 try{const url=new URL(String(value).replace(/&amp;/g,'&'));
  return cdnHosts.has(url.hostname)?url.origin+url.pathname:null;
 }catch{return null;}
};
const knownStock=new Map();
for(const asset of stock.assets){
 for(const field of ['temporaryPreviewUrl','temporaryVideoUrl','productionUrl']){
  const key=normalize(asset[field]);
  if(key){
   if(knownStock.has(key)&&knownStock.get(key)!==asset.id)fail('Multiple component assets claim '+key);
   knownStock.set(key,asset.id);
  }
 }
}
const found=new Map();
const add=(url,templateId,filename)=>{
 const key=normalize(url);
 if(!key)return;
 if(!found.has(key))found.set(key,new Map());
 const templates=found.get(key);
 if(!templates.has(templateId))templates.set(templateId,new Set());
 templates.get(templateId).add(filename);
};
const templates=readdirSync(templatesRoot,{withFileTypes:true})
 .filter(entry=>entry.isDirectory()&&existsSync(path.join(templatesRoot,entry.name,'index.html')))
 .map(entry=>entry.name).sort();
if(templates.length!==24)fail('Expected 24 original complete-site templates; found '+templates.length);
const cdnRegex=/https?:\/\/(?:images\.unsplash\.com|images\.pexels\.com|videos\.pexels\.com)\/[^\s"'<>\x29\x60]+/gi;
for(const templateId of templates){
 const dir=path.join(templatesRoot,templateId);
 const files=readdirSync(dir).filter(filename=>/\.(html|css|js)$/i.test(filename)&&statSync(path.join(dir,filename)).isFile());
 for(const filename of files){
  const source=readFileSync(path.join(dir,filename),'utf8').replace(/&amp;/g,'&');
  if(templateId==='real-estate'&&/drift-house-concept\.svg|glass-point-concept\.svg/.test(source))fail('CURRENT must not restore synthetic SVG property images');
  if(templateId==='muskoka-retreat'&&filename==='index.html'&&/retreat-art--(?:house|suite|winter)/.test(source))fail('Morrow House may not restore synthetic photo stand-ins');
  if(filename==='index.html'&&templateId==='editorial-commerce'&&/range-art--(?:boot|route|repair)/.test(source))fail('RANGE/FOUND generated image stand-ins cannot return');
  if(filename==='index.html'&&templateId==='woodworker'&&/workshop-photo--illustrated/.test(source))fail('Woodworker generated workshop image cannot return');
  if(templateId==='storefront'&&filename==='index.html'&&/mora-art--(?:hero|sink|materials)/.test(source))fail('MORA synthetic scene illustration cannot return');
  for(const retired of ['photo-1679585651020-9ae0653c84ad','photo-1745777761096-081db6e036e7'])if(source.includes(retired))fail('Retired tattoo artist/client media returned in '+templateId+'/'+filename+': '+retired);
  for(const retired of ["photo-1481349518771-20055b2a7b24","photo-1483985988355-763728e1935b","photo-1494438639946-1ebd1d20bf85","photo-1496747611176-843222e1e57c","photo-1531123897727-8f129e1688ce","photo-1534528741775-53994a69daeb"])if(source.includes(retired))fail('Retired FRAME source cannot return in '+templateId+'/'+filename+': '+retired);
  for(const retired of ['photo-1524504388940-b1c1722653e1','photo-1529139574466-a303027c1d8b','photo-1506794778202-cad84cf45f1d','photo-1515886657613-9f3515b0c78f'])if(source.includes(retired))fail('Retired FRAME photo cannot return to '+templateId+'/'+filename+': '+retired);
  for(const retired of ['photo-1627328187791-bb98dfe09ace','photo-1622260614298-449a6f9f14fb','photo-1708105252198-4f5fbf2c0884','photo-1496080174650-637e3f22fa03','photo-1742799050770-8073eac5304a','photo-1619035226152-81e29823b8d9'])if(source.includes(retired))fail('Retired RANGE/FOUND stock must not return in '+templateId+'/'+filename+': '+retired);
  for(const retired of ['photo-1600210492486-724fe5c67fb0','photo-1600566753190-17f0baa2a6c3','photo-1600585154340-be6161a56a0c','photo-1613490493576-7fde63acd811'])if(source.includes(retired))fail('Retired MONOLITH original photo returned in '+templateId+'/'+filename+': '+retired);
  for(const retired of ['photo-1760965825135-e94f4e34494b','photo-1766471870102-dcb1fe88e8cc','photo-1771959453981-b5417268a034','photo-1760092189903-dce3e898dacf'])if(source.includes(retired))fail('Retired AFTER DARK concert stock returned in '+templateId+'/'+filename+': '+retired);
  for(const retired of ['photo-1727270921836-3d51d25d9e33','photo-1773423389979-b28b469967f8','photo-1783716149654-5f3e7012ef45'])if(source.includes(retired))fail('Retired Morrow House photograph in '+templateId+'/'+filename+': '+retired);
  for(const retired of ['photo-1769353086138-19ee65291a04','photo-1756666915060-c4dbf6a03aad','photo-1771818385091-ba8c4d3164b8'])if(source.includes(retired))fail('Retired GRAIN & GABLE source in '+templateId+'/'+filename+': '+retired);
  for(const retired of ['photo-1708805282706-f44730b7e527','photo-1552519507-da3b142c6e3d','photo-1580273916550-e323be2ae537','photo-1492144534655-ae79c964c9d7'])if(source.includes(retired))fail('Retired GARAGE photo cannot return in '+templateId+'/'+filename+': '+retired);
  if(source.includes('photo-1673874500167-17ca5ed1cf17'))fail('Retired Nutella-branded dessert stock must not return to '+templateId+'/'+filename);
  if(source.includes('photo-1760939858984-5dc76f0ea34a'))fail('Retired unsafe saw photo is forbidden in '+templateId+'/'+filename);
  for(const removed of ['photo-1503686982867-43fb1b9fb691','photo-1774516534119-7324f9948176'])if(source.includes(removed))fail('Retired misleading property photo '+removed+' in '+templateId+'/'+filename);
  for(const key of ['photo-1776725121337-48de2c501672','photo-1485809052957-5113b0ff51af','photo-1759304426524-382146fa97a7','photo-1702936425973-8ca360714a97','photo-1583509208810-f57bef92d0a0'])if(source.includes(key))fail('Retired branded product photo '+key+' in '+templateId+'/'+filename);
  for(const match of source.matchAll(cdnRegex))add(match[0],templateId,filename);
  // Unknown third-party media in HTML must not evade the tracked-CDN scanner.
  for(const tag of source.match(/<(?:img|video|source|audio)\b[^>]*>/gi)||[]){
   for(const match of tag.matchAll(/\b(?:src|poster)\s*=\s*(["'])(https?:\/\/[^"']+)\1/gi)){
    if(!normalize(match[2]))fail('Uninventoried external media hostname in '+templateId+'/'+filename+': '+match[2]);
   }
  }
 }
}
if(inventory.schemaVersion!==1)fail('Unsupported original-template media inventory schema');
if(!Array.isArray(inventory.assets))fail('Missing assets array in original-template inventory');
const registered=new Map();
for(const item of inventory.assets||[]){
 if(!/^TM-\d{3}$/.test(item.id))fail('Invalid original-template asset ID '+item.id);
 if(['TM-048','TM-005','TM-044','TM-065','TM-021','TM-031','TM-034','TM-038','TM-067','TM-011','TM-062','TM-029','TM-030','TM-040','TM-006','TM-019','TM-020','TM-033','TM-014','TM-015','TM-012','TM-013','TM-003','TM-004','TM-007','TM-009','TM-016','TM-017'].includes(item.id))fail('Retired unsuitable image record must not be reintroduced: '+item.id);
 if(!normalize(item.urlIdentity)||normalize(item.urlIdentity)!==item.urlIdentity)fail('Noncanonical tracked remote media '+item.id);
 if(registered.has(item.urlIdentity))fail('Duplicate original-template URL record: '+item.urlIdentity);
 registered.set(item.urlIdentity,item);
 if(!['needs-review','rejected','approved'].includes(item.reviewStatus))fail('Invalid media review status '+item.id);
 if(['TM-001','TM-071'].includes(item.id) && (item.sourcePageUrl!=='https://www.pexels.com/video/woman-in-a-studio-posing-at-the-camera-9489382/' || item.creator!=='cottonbro studio' || item.reviewStatus!=='needs-review')){
  fail('OFFCUT media must retain verified Pexels origin while release approval remains open: '+item.id);
 }
 // Keep researched exact-source matches pinned to the same CDN identity.
 // Never translate source-page discovery into media release approval.
 const verifiedSources={
  'TM-002':{identity:'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
    page:'https://unsplash.com/photos/clothes-store-interior-P3pI6xzovu0',creator:'Clark Street Mercantile'},
  'TM-018':{identity:'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5',
    page:'https://unsplash.com/photos/woman-doing-weight-lifting-h4i9G-de7Po',creator:'John Arano'},
  'TM-010':{identity:'https://images.unsplash.com/photo-1497366754035-f200968a6e72',
    page:'https://unsplash.com/photos/hallway-between-glass-panel-doors-yWwob8kwOCk',creator:'Nastuh Abootalebi'},
  'TM-035':{identity:'https://images.unsplash.com/photo-1722103155234-5e83b3effe03',
    page:'https://unsplash.com/photos/a-stone-patio-with-steps-and-plants-in-the-foreground-V99f_PhYzmM',creator:'Naoki Suzuki'},
  'TM-050':{identity:'https://images.unsplash.com/photo-1761637823276-7d714eb45cb1',
    page:'https://unsplash.com/photos/curved-stone-steps-lead-to-a-paved-patio-area-AqCTAOMJUVk',creator:'Sergej ***** (@skstrannik)'},
  'TM-051':{identity:'https://images.unsplash.com/photo-1761637823941-0ffae96ec487',
    page:'https://unsplash.com/photos/stone-wall-with-plants-in-the-foreground-f7poIvVWtfg',creator:'Sergej ***** (@skstrannik)'}
 };
 const src=verifiedSources[item.id];
 if(src&&(item.urlIdentity!==src.identity||item.sourcePageUrl!==src.page||
  item.creator!==src.creator||item.reviewStatus!=='needs-review'))
  fail('Verified original photo provenance drift or accidental rights approval: '+item.id);
 const kind=item.urlIdentity.startsWith('https://videos.pexels.com/')?'video':'image';
 if(item.kind!==kind)fail('Incorrect image/video kind '+item.id);
 const actualStock=knownStock.get(item.urlIdentity)||null;
 if(item.linkedComponentStockId!==actualStock)fail('Stale component cross-reference '+item.id+' (expected '+actualStock+')');
 if(item.pilotVisualReview){
  const v=item.pilotVisualReview;
  if(item.reviewStatus!=='needs-review'||v.status!=='preliminary-observations-only-not-approved')fail('Visual pilot may never imply media approval '+item.id);
  if(!/^[0-9a-f]{64}$/.test(v.downloadSHA256||'')||!v.notes||!Array.isArray(v.flags)||!v.flags.length)fail('Incomplete preliminary visual evidence '+item.id);
 }
 if(item.pilotVideoReview){
  const v=item.pilotVideoReview;
  if(item.kind!=='video'||item.reviewStatus!=='needs-review'||v.status!=='headers-only-not-approved')fail('Video HEAD report may not grant media approval '+item.id);
  if(v.probeMethod!=='HEAD'||v.downloadedMediaBytes!==0||v.httpStatus!==200||v.contentType!=='video/mp4'||!Array.isArray(v.flags)||!v.flags.length||!v.notes)fail('Invalid video-only technical evidence '+item.id);
  if(v.contentLengthBytes!==null && (!Number.isSafeInteger(v.contentLengthBytes)||v.contentLengthBytes<0))fail('Invalid video header length '+item.id);
  if(v.durationSeconds!==undefined || v.videoSHA256!==undefined)fail('Header-only evidence cannot claim decoded video facts '+item.id);
 }
 if(item.reviewStatus==='approved'){
  // A remote URL is never proof that its license or derivative was reviewed.
  // Production migration must replace the remote usage and retire this record.
  fail(item.id+' marked approved while its original template still loads remote CDN media');
 }
 const expected=found.get(item.urlIdentity);
 if(!expected){fail('Stale inventory record for unused remote media '+item.id);continue;}
 const usages=item.usages||[];
 if(!Array.isArray(item.usages)||!usages.length)fail('Missing template usages '+item.id);
 const seen=new Set();
 for(const usage of usages){
  const templateId=usage.templateId;
  if(seen.has(templateId))fail('Duplicate template usage '+item.id+'/'+templateId);
  seen.add(templateId);
  if(!expected.has(templateId)){fail('Stale template association '+item.id+'/'+templateId);continue;}
  const recorded=[...(usage.files||[])].sort().join(',');
  const actual=[...expected.get(templateId)].sort().join(',');
  if(recorded!==actual)fail('Wrong source files for '+item.id+'/'+templateId+': '+recorded+' vs '+actual);
 }
 for(const name of expected.keys())if(!seen.has(name))fail('Untracked template usage '+item.id+'/'+name);
}
for(const url of found.keys())if(!registered.has(url))fail('New external original-template media is not in the review inventory: '+url);
const mediaTemplateCount=new Set([...found.values()].flatMap(m=>[...m.keys()])).size;
const unmatched=[...registered.values()].filter(x=>!x.linkedComponentStockId).length;
console.log('Original template media QA: '+templates.length+' site templates, '+mediaTemplateCount+' using external media, '+found.size+' remote identities, '+unmatched+' without matching component inventory record.');
console.log('All original media remains independently review-gated; a matching component stock record is not permission for redistribution.');
if(errors.length){for(const message of errors)console.error('FAIL:',message);process.exit(1)}
console.log('PASS: original-template external CDN media identities and every usage/file relationship match the explicit needs-review inventory.');
