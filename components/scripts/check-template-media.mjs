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
  if(source.includes('photo-1760939858984-5dc76f0ea34a'))fail('Retired unsafe saw photo is forbidden in '+templateId+'/'+filename);
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
 if(['TM-048','TM-005','TM-044','TM-065','TM-021','TM-031','TM-034','TM-038','TM-067'].includes(item.id))fail('Retired unsuitable image record must not be reintroduced: '+item.id);
 if(!normalize(item.urlIdentity)||normalize(item.urlIdentity)!==item.urlIdentity)fail('Noncanonical tracked remote media '+item.id);
 if(registered.has(item.urlIdentity))fail('Duplicate original-template URL record: '+item.urlIdentity);
 registered.set(item.urlIdentity,item);
 if(!['needs-review','rejected','approved'].includes(item.reviewStatus))fail('Invalid media review status '+item.id);
 if(['TM-001','TM-071'].includes(item.id) && (item.sourcePageUrl!=='https://www.pexels.com/video/woman-in-a-studio-posing-at-the-camera-9489382/' || item.creator!=='cottonbro studio' || item.reviewStatus!=='needs-review')){
  fail('OFFCUT media must retain verified Pexels origin while release approval remains open: '+item.id);
 }
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
