import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,renameSync,existsSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const id='atlas-terrain',src='templates/_drafts/'+id,dest='templates/'+id;
const read=p=>readFileSync(path.join(root,p),'utf8'),write=(p,s)=>writeFileSync(path.join(root,p),s);
function edit(p,a,b){const s=read(p);assert(s.includes(a),'Missing '+p+' '+a.slice(0,100));write(p,s.replace(a,b))}
function json(p,fn){const x=JSON.parse(read(p));fn(x);write(p,JSON.stringify(x,null,2)+'\n')}
assert(existsSync(path.join(root,src,'index.html'))&&!existsSync(path.join(root,dest)));
assert(read(src+'/index.html').includes('data-atlas-release="A40"'),'Unexpected runtime release');
renameSync(path.join(root,src),path.join(root,dest));
edit(dest+'/index.html','<html data-atlas-release="A40"','<html data-immersive-template data-atlas-release="A40"');
edit(dest+'/index.html','href="../../../index.html">Template gallery','href="../../index.html">Template gallery');
// Keep all existing draft review URLs usable after the route move.
mkdirSync(path.join(root,src),{recursive:true});
write(src+'/index.html','<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>ATLAS has moved</title><script>location.replace("../../atlas-terrain/"+location.search+location.hash)</script></head><body><main><h1>ATLAS has moved</h1><p><a href="../../atlas-terrain/">Open the ATLAS expedition</a></p></main></body></html>\n');
const card='<article class="template-card is-live" data-category="creative experimental immersive" data-template="atlas-terrain"><a aria-label="Open ATLAS alpine expedition" class="thumb-link" href="templates/atlas-terrain/"><div class="thumb" style="position:relative;background:#f4f0e8"><img alt="" src="templates/atlas-terrain/gallery-opening.webp" width="960" height="600" loading="lazy" decoding="async" style="display:block;width:100%;height:100%;object-fit:contain"/><span class="live-badge">Preview</span></div></a><div class="card-copy"><div><h3>ATLAS / Beyond the Contour</h3></div><p>Creative · Immersive alpine expedition</p><a class="card-live-link" href="templates/atlas-terrain/">View template</a></div></article>\n';
edit('index.html','<article class="template-card is-live" data-category="creative experimental immersive" data-template="matter-exhibition">',card+'<article class="template-card is-live" data-category="creative experimental immersive" data-template="matter-exhibition">');
json('components/data/builder-templates.json',a=>{assert.equal(a.length,38);assert(!a.some(x=>x.slug===id));a.push({slug:id,title:'ATLAS / Beyond the Contour',route:'../templates/'+id+'/',configuratorStatus:'gallery-only',configuratorBlocker:'Custom continuous WebGL terrain, palette adaptation and expanded iframe compatibility require a dedicated configurator review'});a.sort((x,y)=>x.slug.localeCompare(y.slug))});
json('components/data/immersive-tests.json',a=>{assert(!a[id]);a[id]={dedicated:true,workflow:'.github/workflows/register-atlas.yml',scripts:['test-atlas-draft.mjs','test-atlas-summit.mjs'],reason:'Dedicated four-viewport browser regression and 34-pose summit review cover terrain, reflection, motion, context recovery, static alternatives and accessibility.'}});
const contract='components/scripts/check-immersive-contract.mjs';
const old="{'shift-card':5,'fold-paper-studio':1,'index-designer':1,'matter-exhibition':1}";
const source=read(contract);assert.equal(source.split(old).length-1,2);write(contract,source.replaceAll(old,"{'shift-card':5,'fold-paper-studio':1,'index-designer':1,'matter-exhibition':1,'atlas-terrain':2}"));
for(const name of ['test-atlas-draft.mjs','test-atlas-summit.mjs']){const p='components/scripts/'+name,s=read(p);assert(s.includes('templates/_drafts/atlas-terrain'));write(p,s.replaceAll('templates/_drafts/atlas-terrain','templates/atlas-terrain'))}
const capture='components/scripts/capture-gallery-openings.mjs';
edit(capture,'"index-designer","matter-exhibition"];','"index-designer","matter-exhibition","atlas-terrain"];');
edit(capture,"  if(id==='index-designer')","  if(id==='atlas-terrain')await page.waitForFunction(()=>{const s=document.querySelector('#atlas-stage');return document.documentElement.dataset.firstFrame==='true'&&s?.dataset.renderer==='webgl'&&s.dataset.settled==='true'&&Number(s.dataset.renderedProgress)===0&&Number(s.dataset.draws)>0},{},{timeout:30000});\n  if(id==='index-designer')");
write(dest+'/README.md',read(dest+'/README.md')+'\n## Gallery registration candidate\nStakeholder approved gallery-only registration of A40. Runtime remains unchanged except the permanent route, immersive contract marker and gallery return link. Old draft entry redirects to the permanent preview. Dedicated tests and actual opening thumbnail are required before promotion. No configurator enablement.\n');
write('PROJECT-ROADMAP.md',read('PROJECT-ROADMAP.md')+'\n\n## ATLAS — gallery registration candidate\nStakeholder approved A40 gallery-only registration. Candidate moves the complete expedition to templates/atlas-terrain, preserves old review links via redirect, captures its genuine opening, adds dedicated test coverage, and validates 39 gallery / 35 configurator templates. This remains a review preview, not a production or configurator approval.\n');
console.log('Prepared ATLAS gallery-only candidate.');
