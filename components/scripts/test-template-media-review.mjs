import {mkdtempSync,readFileSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const script=path.join(path.dirname(fileURLToPath(import.meta.url)),'prepare-template-media-review.mjs');
const directory=mkdtempSync(path.join(tmpdir(),'boomer-template-review-'));
try{
 const result=spawnSync(process.execPath,[script,'--offline','--limit=3','--output='+directory],{encoding:'utf8',timeout:20000});
 if(result.status!==0)throw Error('Offline review generation failed: '+result.stderr+'\n'+result.stdout);
 const report=JSON.parse(readFileSync(path.join(directory,'results.json'),'utf8'));
 const html=readFileSync(path.join(directory,'index.html'),'utf8');
 const css=readFileSync(path.join(directory,'review.css'),'utf8');
 assert.equal(report.mode,'offline');
 assert.equal(report.total,3);
 assert.equal(report.downloaded,0);
 assert.equal(report.errors,0);
 assert.equal(report.assets.length,3);
 assert(report.assets.every(item=>item.reviewStatus==='needs-review'&&!item.sourceSHA256&&item.candidateStatus!=='downloaded-for-review'));
 assert(report.assets.every(item=>item.candidateStatus.startsWith('offline')||item.candidateStatus==='video-manual-review'));
 assert(html.includes('No creator, model/property, licensing or commercial-use approval granted.'));
 assert(!html.includes('<img src='));
 assert(css.includes('@media(max-width:760px)'));
 assert(css.includes('grid-template-columns:repeat(4,minmax(0,1fr))'));
 assert(!report.assets.some(item=>item.desktopPortrait||item.phoneTall));
 assert(existsSync(path.join(directory,'index.html')));
 // Ensure the follow-up batch reviews all six remaining FRAME photographs,
 // rather than accidentally re-running the original first-five pilot.
 const frameIds=['TM-012','TM-013','TM-014','TM-015','TM-016','TM-017'];
 const remaining=spawnSync(process.execPath,[script,'--offline','--ids='+frameIds.join(','),'--limit=6','--output='+path.join(directory,'frame-remainder')],{encoding:'utf8',timeout:20000});
 if(remaining.status!==0)throw Error('FRAME remainder review failed: '+remaining.stderr+'\\n'+remaining.stdout);
 const rest=JSON.parse(readFileSync(path.join(directory,'frame-remainder/results.json'),'utf8'));
 assert.deepEqual(rest.assets.map(item=>item.id),frameIds);
 assert.equal(rest.total,6);
 assert.equal(rest.downloaded,0);
 assert.equal(rest.errors,0);
 assert(rest.assets.every(item=>item.reviewStatus==='needs-review'&&item.candidateStatus==='offline-no-image-inspection'));
 console.log('PASS: six remaining FRAME IDs selected without fetching or approving assets.');
 console.log('PASS: offline template media preview generation isolates evidence, keeps all candidate rights unapproved, and does not download or display unknown images.');
}finally{rmSync(directory,{recursive:true,force:true});}
