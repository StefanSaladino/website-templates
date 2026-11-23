/* Source/clearance queue contract: every verified identity must have
 * documented original-publisher evidence, never implicit release approval.
 * This is offline integrity validation, not a legal rights opinion.
 */
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(readFileSync(path.join(here,'data/template-media-inventory.json'),'utf8'));
const queue=readFileSync(path.join(here,'../docs/TEMPLATE-MEDIA-CLEARANCE-QUEUE.md'),'utf8');
const assets=manifest.assets||[];
const errors=[];
if(assets.length!==62)errors.push('Expected 62 active source identities, got '+assets.length+'. Update all release checks when identities are added/retired.');
const ids=assets.map(x=>x.id);
if(new Set(ids).size!==ids.length)errors.push('Duplicate original media ID');
const needs=assets.filter(x=>x.reviewStatus==='needs-review');
const source=assets.filter(x=>x.sourcePageUrl);
const noSource=assets.length-source.length;
const noCreator=assets.filter(x=>!x.creator).length;
for(const asset of assets){
 const tag=asset.id;
 if(asset.reviewStatus!=='needs-review'||asset.rightsReviewedAt||asset.localDerivative)
  errors.push(tag+' external source prematurely rights-approved or contains unverified local derivative');
 if(Boolean(asset.sourcePageUrl)!==Boolean(asset.creator))
  errors.push(tag+' has source URL and creator incompletely paired');
 if(!asset.sourcePageUrl){
  if(asset.sourcePageVerifiedAt||asset.sourceVerificationNote)
   errors.push(tag+' has unsupported exact-source verification metadata');
  continue;
 }
 const hostname=(()=>{try{return new URL(asset.sourcePageUrl).hostname}catch{return ''}})();
 if(!['unsplash.com','www.unsplash.com','pexels.com','www.pexels.com'].includes(hostname))
  errors.push(tag+' original source page must be a publisher URL, not third-party guesses');
 if(!asset.sourcePageVerifiedAt||!/^\d{4}-\d{2}-\d{2}$/.test(asset.sourcePageVerifiedAt))
  errors.push(tag+' recorded source lacks dated official-site verification');
 if(!asset.sourceVerificationNote||asset.sourceVerificationNote.length<60)
  errors.push(tag+' lacks method/boundaries for publisher evidence');
 if(asset.creator.startsWith('Unverified'))
  errors.push(tag+' published source has unspecified creator');
}
const tableIds=[...queue.matchAll(/^\| (TM-\d{3})(?: \(film\))? \|/gm)].map(x=>x[1]);
if(tableIds.length!==ids.length||new Set(tableIds).size!==ids.length||
 tableIds.some(id=>!ids.includes(id))||ids.some(id=>!tableIds.includes(id)))
 errors.push('Clearance queue table must contain exactly one entry for every active media ID');
const counts=[
 [assets.length,/\*\*(\d+) active external media identities\*\*/,'active identities'],
 [noSource,/\*\*(\d+) without verified\/recorded source-page links\*\*/,'missing source pages'],
 [noCreator,/\*\*(\d+) without recorded creator credits\*\*/,'missing creator credits']
];
for(const [actual,re,label] of counts){
 const declared=Number(queue.match(re)?.[1]);
 if(declared!==actual)errors.push('Clearance queue '+label+': '+declared+' vs authoritative '+actual);
}
for(const asset of assets){
 const line=queue.split('\n').find(x=>x.startsWith('| '+asset.id+' |')||x.startsWith('| '+asset.id+' (film) |'));
 if(!line)continue;
 if(asset.sourcePageUrl&&!line.includes(asset.creator))
  errors.push('Queue table does not credit newly verified creator for '+asset.id);
 if(!asset.sourcePageUrl&&!line.includes('Source page missing; Creator missing'))
  errors.push('Queue wrongly implies confirmed creator/source for '+asset.id);
}
if(!queue.includes('0 rights-approved assets')||needs.length!==assets.length)
 errors.push('Media clearance queue and manifest must not claim rights approval');
console.log('Media provenance queue:',assets.length+' active identities, '+source.length+
 ' with publisher-source records, '+noSource+' without source page, '+noCreator+
 ' without creator, 0 rights-cleared.');
if(errors.length){for(const e of errors)console.error('PROVENANCE-FAIL:',e);process.exit(1)}
console.log('PASS: original stock clearance queue and evidence metadata are in sync; every remote identity remains needs-review.');
