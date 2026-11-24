import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {discoverTemplates,compareMembership} from './template-catalogue.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const specs=JSON.parse(readFileSync(path.join(root,'components/data/immersive-tests.json'),'utf8'));
const immersive=discoverTemplates(root).filter(id=>/<html\b[^>]*\bdata-immersive-template\b/i.test(readFileSync(path.join(root,'templates',id,'index.html'),'utf8')));
const diff=compareMembership(immersive,Object.keys(specs));
if(Object.values(diff).some(x=>x.length))throw Error('Immersive template/test coverage mismatch '+JSON.stringify(diff));
for(const [id,s] of Object.entries(specs)){
 if(s.dedicated){if(!Object.hasOwn({'shift-card':5,'fold-paper-studio':1,'index-designer':1},id)||!Array.isArray(s.scripts)||s.scripts.length!==({'shift-card':5,'fold-paper-studio':1,'index-designer':1}[id])||!s.workflow)throw Error('Invalid dedicated immersive coverage '+id);const workflow=readFileSync(path.join(root,s.workflow),'utf8');for(const script of s.scripts){const source=readFileSync(path.join(root,'components/scripts',script),'utf8');if(!workflow.includes('node scripts/'+script)||!source.includes('/templates/'+id+'/'))throw Error('Dedicated suite not linked '+id+' '+script)}continue;}
 if(!s.stage||!s.canvas||!s.fallback||!Object.keys(s.initial||{}).length||!s.steps?.length||!s.reset?.selector||!s.fallbackSteps?.length)throw Error('Incomplete immersive feature test '+id);
 for(const step of [...s.steps,...s.fallbackSteps])if(!step.selector||!['click','fill'].includes(step.action)||!Object.keys(step.state||{}).length)throw Error('Incomplete immersive action '+id);
}
console.log('PASS: '+immersive.length+' immersive website(s), one interaction/fallback test specification per website.');
