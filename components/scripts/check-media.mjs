import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const parse=name=>JSON.parse(readFileSync(path.join(here,'data',name),'utf8'));
const components=parse('components.json');
const manifest=parse('stock-manifest.json');
const errors=[],warnings=[];
const addError=message=>errors.push(message);
const stockById=new Map();
for(const asset of manifest.assets){
  if(stockById.has(asset.id))addError('Duplicate stock ID '+asset.id);
  stockById.set(asset.id,asset);
  if(!/^STOCK-\d{3}$/.test(asset.id))addError('Invalid stock ID '+asset.id);
  if(['STOCK-013','STOCK-019','STOCK-020','STOCK-021','STOCK-022','STOCK-023'].includes(asset.id))addError('Retired image may not be reintroduced: '+asset.id);
  if(!asset.sourceUrl?.startsWith('https://')||!asset.licenseUrl?.startsWith('https://')||!asset.photographer||!asset.platform) addError('Missing source/rights metadata '+asset.id);
  if(!Array.isArray(asset.usageIds))addError('Missing usage IDs '+asset.id);
  if(!['approved','needs-review','rejected'].includes(asset.reviewStatus))addError('Bad stock review status '+asset.id);
  if(asset.reviewStatus==='approved'){
    if(!asset.licenseReviewedAt||!asset.fileHashSHA256||!/^[0-9a-f]{64}$/.test(asset.fileHashSHA256)||!Array.isArray(asset.derived)||asset.derived.length===0) addError('Approved stock missing verified local derivatives/hash '+asset.id);
    for(const item of asset.derived||[]){
      if(!item.path?.startsWith('assets/photography/')||item.path.includes('..')||!existsSync(path.join(here,item.path)))addError('Missing local derivative '+asset.id+': '+item.path);
    }
  }else warnings.push(asset.id+' requires manual asset/crop/release review');
}
// Require every externally hosted stock image/poster shown in a built preview to
// have a traceable asset entry and a reciprocal component association.
// This is a provenance inventory check, NOT a license or visual approval.
const normaliseMediaUrl=value=>{
  if(!value)return null;
  try{
    const url=new URL(String(value).replace(/&amp;/g,'&'));
    return (url.protocol==='https:'||url.protocol==='http:')?url.origin+url.pathname:null;
  }catch{return null;}
};
const mediaByUrl=new Map();
for(const asset of manifest.assets){
  for(const field of ['temporaryPreviewUrl','temporaryVideoUrl','productionUrl']){
    const key=normaliseMediaUrl(asset[field]);
    if(!key)continue;
    if(mediaByUrl.has(key)&&mediaByUrl.get(key)!==asset.id)addError('Multiple assets claim remote media '+key);
    mediaByUrl.set(key,asset.id);
  }
}
let inReview=0,live=0,remote=0;
for(const component of components){
  if(!['in-review','approved','live'].includes(component.status))continue;
  if(component.status==='live')live++;
  else inReview++;
  const file=path.join(here,'previews',component.id,'index.html');
  const html=existsSync(file)?readFileSync(file,'utf8'):'';
  if(html.includes('photo-1760939858984-5dc76f0ea34a'))addError(component.id+' has forbidden saw photo');
  if(component.id==='ANIM-13' && /photo-1503686982867-43fb1b9fb691|photo-1774516534119-7324f9948176/.test(html))addError('ANIM-13 must not restore unrelated geographically misleading photos');
  if(component.id==='ANIM-12'&&/photo-1481349518771-20055b2a7b24|photo-1483985988355-763728e1935b|photo-1494438639946-1ebd1d20bf85|photo-1496747611176-843222e1e57c|photo-1531123897727-8f129e1688ce|photo-1534528741775-53994a69daeb/.test(html))addError('ANIM-12 may not restore old FRAME stock');
  if(component.id==='ANIM-13'&&/drift-house-concept\.svg|glass-point-concept\.svg/.test(html))addError('ANIM-13 cannot restore generated synthetic property SVGs');
  // Include poster images as well as src. Scan in-review previews, not just live ones:
  // otherwise remote assets could silently bypass review metadata until launch.
  for(const tag of html.match(/<(?:img|video|source)\b[^>]*>/gi)||[]){
    for(const match of tag.matchAll(/\b(?:src|poster)\s*=\s*(["'])(.*?)\1/gi)){
      const mediaUrl=match[2];
      if(!/^https?:\/\//i.test(mediaUrl))continue;
      const key=normaliseMediaUrl(mediaUrl), assetId=mediaByUrl.get(key);
      if(!assetId)addError(component.id+' uses unregistered external preview media '+key);
      else if(!component.stockAssetIds?.includes(assetId))addError(component.id+' uses '+assetId+' without component stockAssetIds link');
    }
  }
  const remoteUrls=[...html.matchAll(/<(?:img|video|source)\b[^>]*\bsrc=["'](https?:\/\/[^"']+)/gi)].map(m=>m[1]);
  const remoteSources=remoteUrls.filter(url=>/^(?:https?:)?\/\/(?:images\.unsplash\.com|images\.pexels\.com|videos\.pexels\.com)/.test(url));
  remote+=remoteSources.length;
  if(component.status==='live'&&remoteUrls.length){
  const declared=new Set((component.stockAssetIds||[]).map(id=>stockById.get(id)?.productionUrl).filter(Boolean));
  for(const remote of remoteUrls){
    const url=remote.replace(/&amp;/g,'&');
    if(!declared.has(url))addError(component.id+' has unapproved remote media '+url);
    if(!['images.unsplash.com','images.pexels.com','videos.pexels.com'].includes(new URL(url).hostname))addError(component.id+' has untrusted remote media host');
  }
}
  if(component.status==='live'&&component.stockAssetIds?.length===0&&!['forms','interface','footers'].includes(component.category))warnings.push(component.id+' live media-free component requires editorial check');
  for(const stockId of component.stockAssetIds||[]){
    const asset=stockById.get(stockId);
    if(!asset) {addError(component.id+' references nonexistent stock '+stockId);continue;}
    if(!asset.usageIds?.includes(component.id))addError('Missing reciprocal stock usage '+stockId+' / '+component.id);
    if(component.status==='live'&&asset.reviewStatus!=='approved')addError('Unapproved image on live component '+component.id+' / '+stockId);
  }
  if(component.status==='live'&&!component.thumbnail) addError('Live component missing actual thumbnail '+component.id);
  if(component.status==='live'&&!component.hasMobileLayout) addError('Live component missing mobile version '+component.id);
}
for(const asset of manifest.assets){
  for(const id of asset.usageIds||[]){
    const match=components.find(x=>x.id===id);
    if(!match||!match.stockAssetIds?.includes(asset.id))addError('Stock usage points to unlinked component '+asset.id+' / '+id);
  }
}
for(const id of ['ABOUT-02','INTRO-03','ANIM-20']){
 const html=readFileSync(path.join(here,'previews',id,'index.html'),'utf8');
 for(const retired of ['photo-1769353086138-19ee65291a04','photo-1756666915060-c4dbf6a03aad','photo-1771818385091-ba8c4d3164b8'])if(html.includes(retired))addError('Retired GRAIN & GABLE media in '+id+': '+retired);
}
// Shared stock references must retain exact verified source and photographer.
const originals=parse('template-media-inventory.json');
for(const original of originals.assets||[]){
 const counterpart=original.linkedComponentStockId&&stockById.get(original.linkedComponentStockId);
 if(!counterpart||!original.sourcePageUrl||!original.creator)continue;
 if(counterpart.sourceUrl!==original.sourcePageUrl||counterpart.photographer!==original.creator)
  addError('Shared photo source/creator mismatch: '+original.id+' / '+counterpart.id);
 if(original.reviewStatus!=='needs-review'||counterpart.reviewStatus!=='needs-review')
  addError('Shared remote image lacks required release review: '+original.id+' / '+counterpart.id);
}
for(const w of warnings)console.warn('REVIEW:',w);
console.log('Media QA: '+manifest.assets.length+' registered, '+warnings.length+' awaiting review, '+remote+' remote image refs across '+inReview+' in-review and '+live+' live components.');
if(errors.length){errors.forEach(x=>console.error('FAIL:',x));process.exit(1)}
console.log('PASS: draft/in-review assets remain blocked from publication and metadata integrity is valid.');
