import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>JSON.parse(readFileSync(path.join(here,'data',name),'utf8'));
const categories=read('categories.json'),components=read('components.json'),stock=read('stock-manifest.json'),mobile=read('mobile-treatments.json');
const errors=[];
const fail=message=>errors.push(message);
const categoryIds=new Set(), componentIds=new Set();
for(const cat of categories){
  if(categoryIds.has(cat.id))fail('Duplicate category '+cat.id);
  categoryIds.add(cat.id);
  if(!cat.title||!cat.prefix||!Number.isInteger(cat.plannedCount))fail('Invalid category '+cat.id);
}
for(const item of components){
  if(componentIds.has(item.id))fail('Duplicate component ID '+item.id);
  componentIds.add(item.id);
  if(!/^[A-Z]+-\d{2}$/.test(item.id))fail('Bad component ID '+item.id);
  if(!categoryIds.has(item.category))fail('Unknown category for '+item.id);
  if(!item.title||!item.exampleContext)fail('Missing example details '+item.id);
  if(!['draft','in-review','approved','live'].includes(item.status))fail('Bad status '+item.id);
  if(['in-review','approved','live'].includes(item.status)){
    if(!item.previewRoute)fail('Missing in-review preview route '+item.id);
    if(item.previewRoute&&!existsSync(path.join(here,item.previewRoute.replace(/^\.\/|^\/components\//,''),'index.html')))fail('Missing in-review preview folder '+item.id);
  }
  if(item.status==='live'){
    if(!item.previewRoute||!item.thumbnail||item.hasMobileLayout!==true)fail('Live item missing preview/thumbnail/mobile '+item.id);
    if(item.previewRoute&&!existsSync(path.join(here,item.previewRoute.replace(/^\.\/|^\/components\//,''),'index.html')))fail('Missing preview folder '+item.id);
    if(item.thumbnail&&!existsSync(path.join(here,item.thumbnail.replace(/^\.\/|^\/components\//,''))))fail('Missing thumbnail '+item.id);
    for(const id of item.stockAssetIds||[]){
      const match=stock.assets.find(x=>x.id===id);
      if(!match||match.reviewStatus!=='approved'||!match.licenseReviewedAt||!match.sourceUrl||!(match.derived?.length||match.productionUrl))fail('Unapproved stock asset '+id+' on '+item.id);
    }
  }
}
for(const cat of categories){
  const count=components.filter(x=>x.category===cat.id).length;
  if(count!==cat.plannedCount)fail('Category count '+cat.id+' expected '+cat.plannedCount+' got '+count);
}
if(categories.length!==30||components.length!==157)fail('Catalog must contain 30 families and 144 options with seven animation patterns');
if(!Array.isArray(stock.assets))fail('Stock manifest must contain assets[]');
if(mobile.length!==44)fail('Mobile treatment baseline must include 44 options');
const mobileIds=new Set();for(const m of mobile){if(mobileIds.has(m.id))fail('Duplicate mobile treatment '+m.id);mobileIds.add(m.id);if(!/^M-[A-Z]+-\d{2}$/.test(m.id))fail('Bad mobile ID '+m.id);for(const parent of m.compatibleComponentIds||[])if(!componentIds.has(parent))fail('Invalid parent '+parent+' for '+m.id);if(m.status==='in-review'&&(!m.previewRoute||!m.compatibleComponentIds.length))fail('Incomplete mobile preview '+m.id)}
if(errors.length){for(const error of errors)console.error('FAIL:',error);process.exit(1);}
console.log('Catalogue valid: '+categories.length+' categories, '+components.length+' options, '+components.filter(x=>x.status==='live').length+' live, '+stock.assets.length+' stock assets recorded.');
