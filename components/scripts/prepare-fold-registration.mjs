// One-time, review-only registration in a clean CI checkout. No existing
// artwork or gallery image may change. Actual browser captures precede promotion.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,renameSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),id='fold-paper-studio',dest='templates/'+id,src='templates/_drafts/'+id;
const read=p=>readFileSync(path.join(root,p),'utf8'),write=(p,s)=>writeFileSync(path.join(root,p),s);
function edit(p,a,b){const s=read(p);assert(s.includes(a),'Missing registration anchor '+p+' '+a.slice(0,100));write(p,s.replace(a,b))}
function json(p,fn){const x=JSON.parse(read(p));fn(x);write(p,JSON.stringify(x,null,2)+'\n')}
assert(existsSync(path.join(root,src,'index.html'))&&!existsSync(path.join(root,dest)),'Expected one unregistered FOLD draft');
renameSync(path.join(root,src),path.join(root,dest));
edit(dest+'/index.html','href="../../../index.html"','href="../../index.html"');
edit(dest+'/index.html','<html lang="en">','<html lang="en" data-immersive-template>');
const card='<article class="template-card is-live" data-category="creative experimental immersive" data-template="fold-paper-studio"><a aria-label="Open FOLD paper engineering study" class="thumb-link" href="templates/fold-paper-studio/"><div class="thumb" style="position:relative;background:#eeeae0"><img alt="" src="templates/fold-paper-studio/gallery-opening.webp" width="960" height="600" loading="lazy" decoding="async" style="display:block;width:100%;height:100%;object-fit:contain"/><span class="live-badge">Preview</span></div></a><div class="card-copy"><div><h3>FOLD / Paper has depth</h3></div><p>Creative · Interactive 3D typography studio</p><a class="card-live-link" href="templates/fold-paper-studio/">View template</a></div></article>\n';
edit('index.html','<article class="template-card is-live" data-category="creative experimental immersive" data-template="shift-card">',card+'<article class="template-card is-live" data-category="creative experimental immersive" data-template="shift-card">');
json('components/data/builder-templates.json',a=>{assert.equal(a.length,35);assert(!a.some(x=>x.slug===id));a.push({slug:id,title:'FOLD / Paper has depth',route:'../templates/'+id+'/',configuratorStatus:'gallery-only',configuratorBlocker:'Actual ready-made configurator palette and preview interaction verification pending'});a.sort((a,b)=>a.slug.localeCompare(b.slug))});
json('components/data/immersive-tests.json',m=>{assert(!m[id]);m[id]={dedicated:true,workflow:'.github/workflows/fold-study.yml',scripts:['test-fold-study.mjs'],reason:'Dedicated suite verifies connected CSS 3D hinge geometry, printed plane separation, motion cadence, native touch, keyboard, reflow and preference recovery.'}});
edit('components/scripts/check-immersive-contract.mjs',"id!=='shift-card'||!Array.isArray(s.scripts)||s.scripts.length!==5","!Object.hasOwn({'shift-card':5,'fold-paper-studio':1},id)||!Array.isArray(s.scripts)||s.scripts.length!==({'shift-card':5,'fold-paper-studio':1}[id])");
const test='components/scripts/test-fold-study.mjs';write(test,read(test).replaceAll('templates/_drafts/fold-paper-studio/','templates/fold-paper-studio/'));
assert(read('.github/workflows/fold-study.yml').includes("'templates/fold-paper-studio/**'"),'Registered specialist workflow coverage required');
const capture='components/scripts/capture-gallery-openings.mjs';
edit(capture,'"fulcrum-light"];','"fulcrum-light","fold-paper-studio"];');
edit(capture,"  else if(spec?.stage&&id!=='strata-architecture')","  else if(id==='fold-paper-studio')await page.waitForFunction(()=>{const s=document.querySelector('#scene');return s?.dataset.mode==='3d'&&s.dataset.settled==='true'&&s.dataset.openness==='0.450000'&&document.querySelectorAll('.panel').length===8},{},{timeout:15000});\n  else if(spec?.stage&&id!=='strata-architecture')");
write('docs/FOLD-PAPER-STUDIO-ROADMAP.md',read('docs/FOLD-PAPER-STUDIO-ROADMAP.md')+'\n\n## F4 — gallery-only registration candidate\nStandalone FOLD direction is independent from SHIFT and retired SELVEDGE. Register the exact geometric artwork, no external stock assets, maintain the existing 35 gallery cards/thumbnail bytes. Actual registered-route specialist, full offline build, exact opening capture and 36-gallery/35-selectable membership all required before promotion. Configurator status is explicitly gallery-only until actual native palette/expanded preview checks pass; no production or physical device sign-off, no main merge.\n');
console.log('Prepared FOLD gallery-only registration candidate; exact capture and full specialist verification required.');
