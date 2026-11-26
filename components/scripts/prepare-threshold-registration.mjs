import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,renameSync,existsSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const id='threshold-studio',src='templates/_drafts/'+id,dest='templates/'+id;
const read=p=>readFileSync(path.join(root,p),'utf8'),write=(p,s)=>writeFileSync(path.join(root,p),s);
function edit(p,a,b){const s=read(p);assert(s.includes(a),'Missing '+p+' '+a);write(p,s.replaceAll(a,b))}
function json(p,fn){const x=JSON.parse(read(p));fn(x);write(p,JSON.stringify(x,null,2)+'\n')}
assert(existsSync(path.join(root,src,'index.html'))&&!existsSync(path.join(root,dest)));
assert(read(src+'/index.html').includes('data-release="P08j"'));
renameSync(path.join(root,src),path.join(root,dest));
edit(dest+'/index.html','<html lang="en" data-release="P08j">','<html lang="en" data-immersive-template data-release="P08j">');
edit(dest+'/index.html','href="../../../index.html"','href="../../index.html"');
for(const p of [dest+'/audit/transition.mjs',dest+'/audit/performance.mjs','.github/workflows/threshold-draft-review.yml'])edit(p,src,dest);
mkdirSync(path.join(root,src),{recursive:true});
write(src+'/index.html','<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>THRESHOLD has moved</title><script>location.replace("../../threshold-studio/"+location.search+location.hash)</script></head><body><main><h1>THRESHOLD has moved</h1><p><a href="../../threshold-studio/">Open THRESHOLD</a></p></main></body></html>\n');
const card='<article class="template-card is-live" data-category="creative experimental immersive" data-template="threshold-studio"><a aria-label="Open THRESHOLD architectural studio experience" class="thumb-link" href="templates/threshold-studio/"><div class="thumb" style="position:relative;background:#090909"><img alt="" src="templates/threshold-studio/gallery-opening.webp" width="960" height="600" loading="lazy" decoding="async" style="display:block;width:100%;height:100%;object-fit:contain"/><span class="live-badge">Preview</span></div></a><div class="card-copy"><div><h3>THRESHOLD / Beyond the ordinary</h3></div><p>Creative · Immersive architectural studio</p><a class="card-live-link" href="templates/threshold-studio/">View template</a></div></article>\n';
const anchor='<article class="template-card is-live" data-category="creative experimental immersive" data-template="atlas-terrain">';
edit('index.html',anchor,card+anchor);
json('components/data/builder-templates.json',a=>{assert.equal(a.length,40);assert(!a.some(x=>x.slug===id));a.push({slug:id,title:'THRESHOLD / Beyond the ordinary',route:'../templates/'+id+'/',configuratorStatus:'gallery-only',configuratorBlocker:'Persistent native-scroll WebGL world and custom interactive experiments require dedicated configurator review'});a.sort((x,y)=>x.slug.localeCompare(y.slug))});
json('components/data/immersive-tests.json',a=>{assert(!a[id]);a[id]={dedicated:true,workflow:'.github/workflows/register-threshold.yml',scripts:['test-threshold-registration.mjs'],reason:'Full draft foundation, reversible transition and performance gates plus permanent-route responsive browser checks.'}});
edit('components/scripts/check-immersive-contract.mjs',"'relay-automation':1}","'relay-automation':1,'threshold-studio':1}");
edit('components/scripts/capture-gallery-openings.mjs','"atlas-terrain","relay-automation"];','"atlas-terrain","relay-automation","threshold-studio"];');
edit('components/scripts/capture-gallery-openings.mjs',"  if(id==='index-designer')","  if(id==='threshold-studio')await page.waitForFunction(()=>document.querySelector('#scene-study')?.dataset.renderer==='webgl'&&document.querySelector('#scene-study').dataset.progress==='0.000000'&&document.documentElement.dataset.closing==='on');\n  if(id==='index-designer')");
for(const p of ['PROJECT-ROADMAP.md','docs/THRESHOLD-STUDIO-ROADMAP.md'])write(p,read(p)+'\n## P09 — Approved gallery registration\nStakeholder authorized gallery-only registration of P08j. Exact draft review run 45739615406 must pass before candidate publication; real-route checks, actual opening capture and complete showroom build required. 41 gallery previews, 35 configurator templates. No runtime design changes; original draft route preserves query/hash. Physical-device FPS and full WCAG conformance not certified.\n');
console.log('Prepared THRESHOLD candidate');
