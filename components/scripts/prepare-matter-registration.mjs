import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,renameSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),id='matter-exhibition',src='templates/_drafts/'+id,dest='templates/'+id;
const read=p=>readFileSync(path.join(root,p),'utf8'),write=(p,s)=>writeFileSync(path.join(root,p),s);
function edit(p,a,b){const s=read(p);assert(s.includes(a),'Missing '+p+' '+a.slice(0,100));write(p,s.replace(a,b))}
function json(p,fn){const x=JSON.parse(read(p));fn(x);write(p,JSON.stringify(x,null,2)+'\n')}
assert(existsSync(path.join(root,src,'index.html'))&&!existsSync(path.join(root,dest)));
renameSync(path.join(root,src),path.join(root,dest));
edit(dest+'/index.html','<html lang="en" data-room="ivory"','<html lang="en" data-immersive-template data-room="ivory"');
const card='<article class="template-card is-live" data-category="creative experimental immersive" data-template="matter-exhibition"><a aria-label="Open MATTER digital exhibition" class="thumb-link" href="templates/matter-exhibition/"><div class="thumb" style="position:relative;background:#f2ece2"><img alt="" src="templates/matter-exhibition/gallery-opening.webp" width="960" height="600" loading="lazy" decoding="async" style="display:block;width:100%;height:100%;object-fit:contain"/><span class="live-badge">Preview</span></div></a><div class="card-copy"><div><h3>MATTER / Studies in Transformation</h3></div><p>Creative · Immersive digital exhibition</p><a class="card-live-link" href="templates/matter-exhibition/">View template</a></div></article>\n';
const anchor='<article class="template-card is-live" data-category="creative experimental immersive" data-template="index-designer">';
edit('index.html',anchor,card+anchor);
json('components/data/builder-templates.json',a=>{assert.equal(a.length,37);assert(!a.some(x=>x.slug===id));a.push({slug:id,title:'MATTER / Studies in Transformation',route:'../templates/'+id+'/',configuratorStatus:'gallery-only',configuratorBlocker:'Full-screen WebGL particle composition requires separate native palette and expanded iframe review'});a.sort((x,y)=>x.slug.localeCompare(y.slug))});
json('components/data/immersive-tests.json',a=>{assert(!a[id]);a[id]={dedicated:true,workflow:'.github/workflows/matter-draft-review.yml',scripts:['test-matter-draft.mjs'],reason:'Dedicated four-viewport pixel/scroll tests cover solid framing, full-screen particle field, mobile overlay, still mode, context loss and static alternatives.'}});
const contract='components/scripts/check-immersive-contract.mjs';
const old="{'shift-card':5,'fold-paper-studio':1,'index-designer':1}";
const source=read(contract);assert.equal(source.split(old).length-1,2);write(contract,source.replaceAll(old,"{'shift-card':5,'fold-paper-studio':1,'index-designer':1,'matter-exhibition':1}"));
const capture='components/scripts/capture-gallery-openings.mjs';
edit(capture,'"fold-paper-studio","index-designer"];','"fold-paper-studio","index-designer","matter-exhibition"];');
edit(capture,"  if(id==='index-designer')","  if(id==='matter-exhibition')await page.waitForFunction(()=>!document.documentElement.classList.contains('no-webgl')&&document.documentElement.style.getPropertyValue('--progress')==='0.0000'&&document.querySelector('#matter-canvas')?.getContext('webgl2'));\n  if(id==='index-designer')");
write(dest+'/REVIEW.md',read(dest+'/REVIEW.md')+'\nM6: Stakeholder approved M5 for gallery-only registration. M5 deployment passed; browser run 45538982627 stopped in Node Undici readiness parser before Chromium. Replace readiness GET with native HEAD and retain all rendering checks. Move to registered route, capture actual opening, add dedicated coverage, and verify full build. No production approval or builder enablement.\n');
write('PROJECT-ROADMAP.md',read('PROJECT-ROADMAP.md')+'\n\n## MATTER — gallery review\nAI Studio prototype refined in M1–M5, stakeholder approved M5. M6 prepares the 38th gallery preview, with 35 configurator-selectable templates unchanged. Original procedural sculpture, full-screen particle field, dedicated browser QA and actual opening thumbnail. See templates/matter-exhibition/REVIEW.md.\n');
console.log('Prepared MATTER catalogue candidate.');
