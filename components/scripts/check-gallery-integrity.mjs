/* The root gallery is a public demo-selection surface. Its link/photo inventory
 * is distinct from the 157 component previews. This is offline integrity QA,
 * not a browser render, copyright approval or launch clearance. */
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const html=readFileSync(path.join(root,'index.html'),'utf8');
const js=readFileSync(path.join(root,'script.js'),'utf8');
const manifest=JSON.parse(readFileSync(path.join(root,'components/data/template-media-inventory.json'),'utf8'));
const issues=[];
const originalTemplates=readdirSync(path.join(root,'templates'),{withFileTypes:true})
  .filter(item=>item.isDirectory()&&existsSync(path.join(root,'templates',item.name,'index.html')))
  .map(item=>item.name).sort();
const matchGroup=(source,re)=>[...source.matchAll(re)].map(m=>m[1]);
const featured=matchGroup(html,/class="featured-preview-link" href="templates\/([a-z-]+)\//g);
const original=matchGroup(html,/class="thumb-link" href="templates\/([a-z-]+)\//g);
const appended=matchGroup(js,/if \(templateGrid && !document\.querySelector\('\[data-template="([a-z-]+)"\]'\)\)/g);
const imageFirst=matchGroup(js,/\{id:'([a-z-]+)',cat:/g);
const cards=[...featured,...original,...appended,...imageFirst];
if([featured.length,original.length,appended.length,imageFirst.length].join(',')!=='3,14,4,3')
  issues.push('Gallery source card groups changed; audit parser needs review: '+[featured.length,original.length,appended.length,imageFirst.length]);
if(cards.length!==24||new Set(cards).size!==24)issues.push('Expected 24 distinct preview links, found '+cards.length+' ('+new Set(cards).size+' unique)');
for(const id of cards)if(!originalTemplates.includes(id))issues.push('Broken original-template gallery href: '+id);
for(const id of originalTemplates)if(!cards.includes(id))issues.push('Original template missing a gallery card: '+id);
const badges=[...html.matchAll(/class="live-badge">Preview<\/span>/g),
  ...js.matchAll(/class="live-badge">Preview<\/span>/g)].length;
if(badges!==24)issues.push('Expected 24 clearly review-labelled thumbnail badges, found '+badges);
if(/class="live-badge">Live<\/span>|>Live now<\/span>/i.test(html+'\n'+js))
  issues.push('Unapproved original-template gallery must not claim live-release status');
if(!html.includes('fictional design previews under review'))
  issues.push('Gallery must disclose that these are not production-approved websites');
const identities=new Map(manifest.assets.map(item=>[item.urlIdentity,item]));
// A source removed from a full template must also disappear from its gallery thumbnail.
for(const retired of ["photo-1481349518771-20055b2a7b24","photo-1483985988355-763728e1935b","photo-1494438639946-1ebd1d20bf85","photo-1496747611176-843222e1e57c","photo-1531123897727-8f129e1688ce","photo-1534528741775-53994a69daeb"])if((html+'\n'+js).includes(retired))issues.push('Retired FRAME gallery media returned: '+retired);
for(const retired of ['photo-1524504388940-b1c1722653e1','photo-1529139574466-a303027c1d8b','photo-1679585651020-9ae0653c84ad','photo-1745777761096-081db6e036e7','photo-1673874500167-17ca5ed1cf17','photo-1708805282706-f44730b7e527','photo-1552519507-da3b142c6e3d','photo-1580273916550-e323be2ae537','photo-1492144534655-ae79c964c9d7']){
  if((html+'\n'+js).includes(retired))issues.push('Retired high-risk gallery photograph returned: '+retired);
}
if((html+'\n'+js).includes('photo-1627328187791-bb98dfe09ace'))issues.push('Retired RANGE/FOUND gallery photo returned');
for(const retired of ['photo-1600210492486-724fe5c67fb0','photo-1600585154340-be6161a56a0c','photo-1613490493576-7fde63acd811'])if((html+'\n'+js).includes(retired))issues.push('Retired MONOLITH gallery image returned: '+retired);
if((html+'\n'+js).includes('photo-1760965825135-e94f4e34494b'))issues.push('Retired AFTER DARK gallery photo returned');
let photoPlacements=0;
for(const [source,kind] of [[html,'html'],[js,'script']]){
  for(const found of source.matchAll(/https:\/\/(?:images\.unsplash\.com|images\.pexels\.com)\/[^\s"'<>]+/g)){
    const url=found[0].split('?')[0];
    const prefix=source.slice(0,found.index);
    let template;
    if(kind==='html'){
      template=matchGroup(prefix,/href="templates\/([a-z-]+)\//g).at(-1);
    }else if(found.index<source.indexOf('const imageFirstCatalog')){
      template=matchGroup(prefix,/data-template="([a-z-]+)"/g).at(-1);
    }else{
      template=matchGroup(prefix,/\{id:'([a-z-]+)',cat:/g).at(-1);
    }
    photoPlacements++;
    const item=identities.get(url);
    if(!item)issues.push('Gallery photo absent from source/rights inventory: '+url);
    else if(item.reviewStatus!=='needs-review')
      issues.push('Gallery thumbnail asset is not properly marked needs-review: '+item.id);
    else if(!item.usages?.some(use=>use.templateId===template))
      issues.push('Gallery photo '+item.id+' does not match its linked original template '+template);
  }
}
if(photoPlacements!==22)issues.push('Unexpected source-photo placement count in gallery: '+photoPlacements+' (expected 22)');
if(issues.length){for(const issue of issues)console.error('GALLERY-FAIL:',issue);process.exitCode=1;}
else console.log('PASS: 24 distinct working preview routes (3 featured, 14 static, 4 appended, 3 image-first), 24 honest Preview badges and '+photoPlacements+' matched in-review CDN thumbnail placements. Visual/copyright/human review still open.');
