import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
for(const [i,file] of ['index.html','components/index.html','components/review.html','components/builder.html'].entries()){
 const html=readFileSync(path.join(root,file),'utf8');
 const header=html.match(/<header class="ba-header"[\s\S]*?<\/header>/)?.[0];assert(header,file);
 const nav=header.match(/<nav class="ba-primary-nav"[\s\S]*?<\/nav>/)?.[0];assert(nav,file);
 const links=[...nav.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g)];
 assert.deepEqual(links.map(x=>x[2]),['Main','Components','Design your own']);
 assert.deepEqual(links.map(x=>path.relative(root,path.resolve(root,path.dirname(file),x[1])).split(path.sep).join('/')),['index.html','components/index.html','components/builder.html']);
 assert.equal((nav.match(/aria-current=/g)||[]).length,1);assert(links[i===0?0:i===3?2:1][0].includes('aria-current='));
 assert(header.includes('aria-expanded="false" aria-controls="ba-primary-nav" hidden'));
 for(const asset of ['site-header.css','site-header.js']){const url=[...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(x=>x[1]).find(x=>x.includes(asset+'?'));assert(url&&existsSync(path.resolve(root,path.dirname(file),url.split('?')[0])),file+' '+asset);}
}
console.log('PASS: four shared headers, valid routes, current states and assets.');
