import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,renameSync,existsSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const id='relay-automation',src='templates/_drafts/'+id,dest='templates/'+id;
const read=p=>readFileSync(path.join(root,p),'utf8'),write=(p,s)=>writeFileSync(path.join(root,p),s);
function edit(p,a,b){const s=read(p);assert(s.includes(a),'Missing '+p+' '+a.slice(0,100));write(p,s.replace(a,b))}
function json(p,fn){const x=JSON.parse(read(p));fn(x);write(p,JSON.stringify(x,null,2)+'\n')}
assert(existsSync(path.join(root,src,'index.html'))&&!existsSync(path.join(root,dest)));
assert(read(src+'/index.html').includes('data-relay-release="R7d"'),'Unexpected release');
renameSync(path.join(root,src),path.join(root,dest));
edit(dest+'/index.html','<html lang="en" data-relay-release="R7d">','<html lang="en" data-immersive-template data-relay-release="R7d">');
edit(dest+'/index.html','href="../../../index.html">Template gallery','href="../../index.html">Template gallery');
mkdirSync(path.join(root,src),{recursive:true});
write(src+'/index.html','<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>RELAY has moved</title><script>location.replace("../../relay-automation/"+location.search+location.hash)</script></head><body><main><h1>RELAY has moved</h1><p><a href="../../relay-automation/">Open RELAY</a></p></main></body></html>\n');
const card='<article class="template-card is-live" data-category="saas tech experimental immersive" data-template="relay-automation"><a aria-label="Open RELAY workflow orchestration" class="thumb-link" href="templates/relay-automation/"><div class="thumb" style="position:relative;background:#121412"><img alt="" src="templates/relay-automation/gallery-opening.webp" width="960" height="600" loading="lazy" decoding="async" style="display:block;width:100%;height:100%;object-fit:contain"/><span class="live-badge">Preview</span></div></a><div class="card-copy"><div><h3>RELAY / Workflow Orchestration</h3></div><p>Technology · Immersive workflow automation</p><a class="card-live-link" href="templates/relay-automation/">View template</a></div></article>\n';
edit('index.html','<article class="template-card is-live" data-category="creative experimental immersive" data-template="atlas-terrain">',card+'<article class="template-card is-live" data-category="creative experimental immersive" data-template="atlas-terrain">');
json('components/data/builder-templates.json',a=>{assert.equal(a.length,39);assert(!a.some(x=>x.slug===id));a.push({slug:id,title:'RELAY / Workflow Orchestration',route:'../templates/'+id+'/',configuratorStatus:'gallery-only',configuratorBlocker:'Custom scroll-controlled product interface, palette choreography and sandbox preview compatibility require dedicated configurator review'});a.sort((x,y)=>x.slug.localeCompare(y.slug))});
json('components/data/immersive-tests.json',a=>{assert(!a[id]);a[id]={dedicated:true,workflow:'.github/workflows/register-relay.yml',scripts:['test-relay-registration.mjs'],reason:'Five deterministic motion and connector suites plus real-route responsive browser and interaction checks.'}});
const contract='components/scripts/check-immersive-contract.mjs',old="'atlas-terrain':2}",s=read(contract);assert.equal(s.split(old).length-1,2);write(contract,s.replaceAll(old,"'atlas-terrain':2,'relay-automation':1}"));
edit('components/scripts/capture-gallery-openings.mjs','"matter-exhibition","atlas-terrain"];','"matter-exhibition","atlas-terrain","relay-automation"];');
edit('components/scripts/capture-gallery-openings.mjs',"  if(id==='index-designer')","  if(id==='relay-automation')await page.waitForFunction(()=>document.documentElement.classList.contains('has-motion')&&document.querySelector('#stage-viewport')?.dataset.progress==='0.0000'&&document.querySelectorAll('.wf-node').length===6);\n  if(id==='index-designer')");
write(dest+'/README.md',read(dest+'/README.md')+'\n## R8 — Approved gallery registration\nStakeholder approved R7d for gallery-only publication. Runtime source and choreography unchanged except route, immersive marker and gallery return link. Preserve draft review links with a query/hash redirect. Real opening capture, dedicated browser/algorithm checks and full build required before publishing. Physical Safari cadence remains unverified; not enabled in configurator.\n');
write('PROJECT-ROADMAP.md',read('PROJECT-ROADMAP.md')+'\n\n## RELAY — R8 approved gallery-only registration\nApproved R7d moves to templates/relay-automation, with original draft URLs redirected, actual opening capture and dedicated regression coverage. 40 gallery previews, 35 configurator templates. No configurator enablement or claim of physical-device acceptance.\n');
console.log('Prepared RELAY gallery candidate');
