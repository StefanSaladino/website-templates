// Prepare the 36th review template atomically in a CI checkout. Never expose
// an incomplete gallery card: capture and build gates run before branch promotion.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,renameSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const id='selvedge-outerwear',base='templates/'+id,draft='templates/_drafts/'+id;
const read=p=>readFileSync(path.join(root,p),'utf8'),write=(p,s)=>writeFileSync(path.join(root,p),s);
function edit(p,from,to){const text=read(p);assert(text.includes(from),'Missing registration anchor '+p+' '+from.slice(0,100));write(p,text.replace(from,to))}
function json(p,fn){const data=JSON.parse(read(p));fn(data);write(p,JSON.stringify(data,null,2)+'\n')}
assert(existsSync(path.join(root,draft,'index.html'))&&!existsSync(path.join(root,base)),'Expected one unregistered draft');
renameSync(path.join(root,draft),path.join(root,base));
edit(base+'/index.html','href="../../../index.html"','href="../../index.html"');
edit(base+'/index.html','data-native-preview-palette="selvedge"','data-native-preview-palette="selvedge" data-immersive-template');
const card='<article class="template-card is-live" data-category="product creative experimental immersive" data-template="selvedge-outerwear"><a aria-label="Open SELVEDGE outerwear photographic campaign" class="thumb-link" href="templates/selvedge-outerwear/"><div class="thumb" style="position:relative;background:#efeee9"><img alt="" src="templates/selvedge-outerwear/gallery-opening.webp" width="960" height="600" loading="lazy" decoding="async" style="display:block;width:100%;height:100%;object-fit:contain"/><span class="live-badge">Preview</span></div></a><div class="card-copy"><div><h3>SELVEDGE / Outside the ordinary</h3></div><p>Product · Scroll-driven fashion editorial</p><a class="card-live-link" href="templates/selvedge-outerwear/">View template</a></div></article>\n';
const anchor='<article class="template-card is-live" data-category="creative experimental immersive" data-template="shift-card">';
edit('index.html',anchor,card+anchor);
json('components/data/builder-templates.json',a=>{assert(!a.some(x=>x.slug===id));a.push({slug:id,title:'SELVEDGE / Outside the ordinary',route:'../templates/'+id+'/'});a.sort((a,b)=>a.slug.localeCompare(b.slug))});
edit('components/builder-journey.js',"'storefront','editorial-commerce','custom-bakes','calibre-watch','shift-card'","'storefront','editorial-commerce','custom-bakes','calibre-watch','shift-card','selvedge-outerwear'");
edit('components/builder.js','./builder-journey.js','./builder-journey.js'); // verify module exists; cache-bust below
const builder=read('components/builder.js').replace(/(\.\/builder-journey\.js)(?:\?[^'"]*)?(?=['"])/g,'$1?v20261124-selvedge');
write('components/builder.js',builder);
edit('components/builder.html','builder.js?v20261124-preview-overlay','builder.js?v20261124-selvedge');
const source='https://images.pexels.com/photos/6044143/pexels-photo-6044143.jpeg',page='https://www.pexels.com/photo/modern-black-leather-jacket-on-white-background-6044143/';
let count;
json('components/data/template-media-inventory.json',m=>{assert(!m.assets.some(a=>a.id==='TM-157'||a.urlIdentity===source));m.assets.push({id:'TM-157',urlIdentity:source,kind:'image',usages:[{templateId:id,files:['index.html']}],linkedComponentStockId:null,sourcePageUrl:page,creator:'Skylar Kang',rightsReviewedAt:null,reviewStatus:'needs-review',localDerivative:null,sourcePageVerifiedAt:'2026-11-24',sourceVerificationNote:'Original Pexels publisher reference recorded 2026-11-24 in SELVEDGE draft; real folded black jacket photograph, source identity confirmed by actual browser image decoding and visual evidence. Same original reused for authentic detail crop, not a SELVEDGE product. No endorsement or rights approval. Final contextual/template redistribution and crop review remain open.'});count=m.assets.length});
const queue='docs/TEMPLATE-MEDIA-CLEARANCE-QUEUE.md';
const old=read(queue);assert(old.includes('**'+(count-1)+' active external media identities:'));write(queue,old.replace('**'+(count-1)+' active external media identities:** '+(count-2)+' still/poster images','**'+count+' active external media identities:** '+(count-1)+' still/poster images').replace('All '+(count-1)+' remain','All '+count+' remain').replace((count-10)+' follow-on records',(count-9)+' follow-on records').replace('## Follow-on queue — '+(count-10)+' active records','## Follow-on queue — '+(count-9)+' active records').replace('| TM-155 |','| TM-157 | selvedge-outerwear | Pexels publisher page; Skylar Kang | Independent real black jacket photograph, same-source detail crop; contextual and template redistribution rights open |\n| TM-155 |'));
json('components/data/loaded-media-review-batches.json',m=>{assert(!m['selvedge']);m.selvedge=[{name:id,sections:['.stage','.construction','.edition'],required:2,poster:false}]});
json('components/data/immersive-tests.json',m=>{assert(!m[id]);m[id]={dedicated:true,workflow:'.github/workflows/selvedge-storyboard.yml',scripts:['test-selvedge-storyboard.mjs'],reason:'Specialist verifies real photographic crop, native wheel, reversible continuous motion, cadence, responsive recovery and native embedded palette.'}});
edit('components/scripts/check-immersive-contract.mjs',"if(id!=='shift-card'||!Array.isArray(s.scripts)||s.scripts.length!==5||!s.workflow)","if(!Object.hasOwn({'shift-card':5,'selvedge-outerwear':1},id)||!Array.isArray(s.scripts)||s.scripts.length!==({'shift-card':5,'selvedge-outerwear':1}[id])||!s.workflow)");
const test='components/scripts/test-selvedge-storyboard.mjs';write(test,read(test).replaceAll('templates/_drafts/selvedge-outerwear/','templates/selvedge-outerwear/'));
edit('.github/workflows/selvedge-storyboard.yml',"'templates/_drafts/selvedge-outerwear/**'","'templates/selvedge-outerwear/**'");
const capture='components/scripts/capture-gallery-openings.mjs';
edit(capture,'const ids=[','const allIds=[');
edit(capture,'"fulcrum-light"];','"fulcrum-light","selvedge-outerwear"];\nconst only=process.argv.find(a=>a.startsWith(\'--only=\'))?.slice(7);\nif(only&&!allIds.includes(only))throw Error(\'Unknown capture id \'+only);\nconst ids=only?[only]:allIds;');
edit(capture,"else if(spec?.stage&&id!=='strata-architecture')","else if(id==='selvedge-outerwear')await page.waitForFunction(()=>{const s=document.querySelector('#stage');return s?.dataset.mode==='live'&&s.dataset.settled==='true'&&+s.dataset.progress===0},{},{timeout:15000});\n  else if(spec?.stage&&id!=='strata-architecture')");
edit(capture,"'orbit-cinema','strata-architecture'].includes(id)","'orbit-cinema','strata-architecture','selvedge-outerwear'].includes(id)");
edit(capture,"report.captures.push({id,opening,bytes:","report.captures.push({id,sourceCommit,opening,bytes:");
edit(capture,"writeFileSync(path.join(root,'components/data/gallery-opening-captures.json'),JSON.stringify(report,null,2)+'\\n');","const ledgerPath=path.join(root,'components/data/gallery-opening-captures.json');\n  if(only&&existsSync(ledgerPath)){const previous=JSON.parse(readFileSync(ledgerPath,'utf8'));report.captures=[...previous.captures.filter(x=>x.id!==only).map(x=>({...x,sourceCommit:x.sourceCommit||previous.sourceCommit})),...report.captures]}\n  writeFileSync(ledgerPath,JSON.stringify(report,null,2)+'\\n');");
write('docs/SELVEDGE-OUTERWEAR-ROADMAP.md',read('docs/SELVEDGE-OUTERWEAR-ROADMAP.md')+'\n\n## S5 — registration candidate\nS4 native palette specialist test completed successfully on fb842fe. Candidate moves the unchanged photographic template to the registered route, adds product recommendation, dedicated immersive coverage and exact-source still-media/provenance records, and generates the opening image from the registered page. All existing screenshot bytes remain unchanged. Registration is review-only, not rights, physical-device or production acceptance. Candidate must pass full build, specialist tests and actual configurator journey before promotion.\n');
console.log('Prepared '+id+' registration; exact browser capture required before promotion.');
