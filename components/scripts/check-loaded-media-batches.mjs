/* Deterministic offline gate: review-batch expectations must follow template HTML.
 * No downloads, screenshots or video playback. Not a media/license approval.
 */
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const data=JSON.parse(readFileSync(new URL('../data/loaded-media-review-batches.json',import.meta.url),'utf8'));
const errors=[],reports=[],seen=new Set();
const names=Object.keys(data);
if(names.join('|')!=='baseline|portfolio|services')errors.push('Unexpected review batch configuration: '+names);
for(const [batch,entries] of Object.entries(data)){
 if(!Array.isArray(entries)||!entries.length){errors.push(batch+': empty batch');continue;}
 for(const entry of entries){
  const id=entry.name;
  if(seen.has(id))errors.push('Duplicate batch assignment: '+id);
  seen.add(id);
  const file=path.join(repo,'templates',id,'index.html');
  if(!existsSync(file)){errors.push(id+': missing HTML template');continue;}
  const html=readFileSync(file,'utf8');
  const tags=[...html.matchAll(/<img\b[^>]*>/gi)].map(x=>x[0]);
  const urls=tags.map(tag=>tag.match(/\bsrc\s*=\s*(["'])(.*?)\1/i)?.[2]||'');
  const thirdParty=urls.filter(url=>/^https:\/\/(?:images\.unsplash\.com|images\.pexels\.com)\//i.test(url));
  if(thirdParty.length!==entry.required){
   errors.push(id+': configured '+entry.required+' remote img tags, HTML has '+thirdParty.length);
  }
  if(entry.poster){
   if(!/<video\b[^>]*\bposter\s*=/.test(html))errors.push(id+': configured poster, but no video poster attribute in HTML');
  }
  if(!Array.isArray(entry.sections)||!entry.sections.length){errors.push(id+': no screenshot sections');continue;}
  const classes=new Set([...html.matchAll(/\bclass\s*=\s*(["'])(.*?)\1/g)].flatMap(m=>m[2].split(/\s+/).filter(Boolean)));
  for(const selector of entry.sections){
   if(!selector.startsWith('.')||!/^[-a-z0-9_.]+$/i.test(selector)){
    errors.push(id+': unsupported screenshot selector '+JSON.stringify(selector));continue;
   }
   const tokens=selector.slice(1).split('.');
   if(tokens.some(token=>!classes.has(token)))errors.push(id+': screenshot selector missing in HTML: '+selector);
  }
  reports.push({batch,template:id,remoteImageTags:thirdParty.length,localImageTags:tags.length-thirdParty.length,sections:entry.sections});
  console.log('PASS:',id,thirdParty.length+' remote img tags, '+entry.sections.length+' screenshot sections');
 }
}
if(seen.size!==9)errors.push('Expected nine unique loaded-photo templates, found '+seen.size);
if(errors.length){
 for(const error of errors)console.error('MEDIA-BATCH-ERROR:',error);
 console.error('FAIL:',errors.length+' still-media batch source errors');
 process.exitCode=1;
}else console.log('PASS:',reports.length+' loaded-media batch definitions match current source HTML (offline; no licensing or image decode claims)');
