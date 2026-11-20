import {readFileSync,existsSync} from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {execFileSync} from 'node:child_process';
const here=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ids=['NAV-03','HERO-01','GAL-02','SRV-03','CTA-02','FORM-01'];
const errors=[];
const components=JSON.parse(readFileSync(path.join(here,'data/components.json'),'utf8'));
const stock=JSON.parse(readFileSync(path.join(here,'data/stock-manifest.json'),'utf8'));
for(const id of ids){
 const dir=path.join(here,'previews',id),record=components.find(c=>c.id===id);
 if(!record||record.status!=='in-review'&&record.status!=='approved'&&record.status!=='live'){errors.push(id+' missing or bad status');continue;}
 for(const file of ['index.html','styles.css','script.js'])if(!existsSync(path.join(dir,file)))errors.push(id+'/'+file+' missing');
 if(!existsSync(path.join(dir,'index.html')))continue;
 const html=readFileSync(path.join(dir,'index.html'),'utf8');
 const idsInPage=new Set([...html.matchAll(/\\bid="([^"]+)"/g)].map(m=>m[1]));
 for(const match of html.matchAll(/href="#([^"]+)"/g))if(!idsInPage.has(match[1]))errors.push(id+' dead anchor: #'+match[1]);
 if(!html.includes('<main')||!html.includes('<h1'))errors.push(id+' missing main/h1');
 for(const img of html.matchAll(/<img\\b[^>]*>/g))if(!/\\balt="[^"]*"/.test(img[0]))errors.push(id+' image missing alt');
 if(record.previewRoute!=='./previews/'+id+'/')errors.push(id+' wrong preview route');
 try{execFileSync(process.execPath,['--check',path.join(dir,'script.js')],{stdio:'pipe'})}catch{errors.push(id+' JavaScript syntax failure')}
 for(const asset of record.stockAssetIds||[])if(!stock.assets.some(x=>x.id===asset))errors.push(id+' unregistered stock asset: '+asset);
}
if(errors.length){errors.forEach(e=>console.error('FAIL',e));process.exit(1)}
console.log('Six in-review examples passed source-level checks. Runtime visual and image QA still required.');
