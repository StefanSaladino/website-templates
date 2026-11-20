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
let inReview=0,live=0,remote=0;
for(const component of components){
  if(!['in-review','approved','live'].includes(component.status))continue;
  if(component.status==='live')live++;
  else inReview++;
  const file=path.join(here,'previews',component.id,'index.html');
  const html=existsSync(file)?readFileSync(file,'utf8'):'';
  const remoteUrls=[...html.matchAll(/<(?:img|video|source)\b[^>]*\bsrc=["'](https?:\/\/[^"']+)/gi)].map(m=>m[1]);
  const remoteSources=remoteUrls.filter(url=>/^(?:https?:)?\/\/(?:images\.unsplash\.com|images\.pexels\.com|videos\.pexels\.com)/.test(url));
  remote+=remoteSources.length;
  if(component.status==='live'&&remoteUrls.length) addError(component.id+' live preview still loads external media');
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
for(const w of warnings)console.warn('REVIEW:',w);
console.log('Media QA: '+manifest.assets.length+' registered, '+warnings.length+' awaiting review, '+remote+' remote image refs across '+inReview+' in-review and '+live+' live components.');
if(errors.length){errors.forEach(x=>console.error('FAIL:',x));process.exit(1)}
console.log('PASS: draft/in-review assets remain blocked from publication and metadata integrity is valid.');
