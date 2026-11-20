import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>readFileSync(path.join(here,name),'utf8');
const markup=read('review.html'),source=read('review.js'),style=read('review.css');
const version=/review\.js\?(v\d+\w+)/.exec(markup)?.[1];
const errors=[];
if(!version)errors.push('Review JS must include a cache-busting version');
if(!markup.includes('review.css?'+version))errors.push('Review CSS version must match');
if(!source.includes("components.json?"+version)||!source.includes("mobile-treatments.json?"+version))errors.push('Metadata fetches must be versioned');
if(!markup.includes('id="review-loading"')||!markup.includes('id="review-error"'))errors.push('Review must provide loading and fallback states');
const matchIds=[...source.matchAll(/querySelector\('#([^']+)'\)/g)].map(x=>x[1].split(/\s|[>+~]/)[0]);
for(const id of new Set(matchIds))if(!markup.includes('id="'+id+'"'))errors.push('Broken review selector #'+id);
if(!source.includes("iframe.addEventListener('load'"))errors.push('No iframe load listener');
if(!style.includes('.review-loading')||!style.includes('.review-error'))errors.push('Missing loading/error styles');
if(source.includes('localStorage')||markup.includes('review-shortlist'))errors.push('Removed shortlist returned');
if(errors.length){errors.forEach(x=>console.error('FAIL: '+x));process.exit(1)}
console.log('Review DOM contract: '+matchIds.length+' JS references, version '+version+', loading and fallback verified');
