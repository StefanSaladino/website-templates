/* Offline source integrity gate for all 24 original full-site templates.
 * This deliberately checks deterministic static HTML semantics only: it is NOT
 * a screen-reader audit, contrast test, HTML parser, or WCAG certification.
 */
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const templates=path.join(repo,'templates');
const failures=[];
const results=[];
const byFolder=readdirSync(templates,{withFileTypes:true})
 .filter(entry=>entry.isDirectory()&&existsSync(path.join(templates,entry.name,'index.html')))
 .sort((a,b)=>a.name.localeCompare(b.name));

function attributes(tag){
 const attrs=new Map();
 for(const match of tag.matchAll(/([^\s=<>/"']+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)){
  attrs.set(match[1].toLowerCase(),match[2]??match[3]??'');
 }
 return attrs;
}
for(const entry of byFolder){
 const name=entry.name,markup=readFileSync(path.join(templates,name,'index.html'),'utf8');
 const errors=[];
 const idSet=new Set();
 for(const match of markup.matchAll(/\bid=(["'])(.*?)\1/g)){
  if(idSet.has(match[2]))errors.push('duplicate id "'+match[2]+'"');
  idSet.add(match[2]);
 }
 const mains=[...markup.matchAll(/<main\b[^>]*>/gi)];
 if(mains.length!==1)errors.push('expected exactly one main landmark; found '+mains.length);
 const lang=markup.match(/<html\b[^>]*\blang\s*=\s*(["'])(.*?)\1/i);
 if(!lang||!lang[2].trim())errors.push('root html language missing');
 let skipFound=false;
 for(const match of markup.matchAll(/<a\b[^>]*>/gi)){
  const attrs=attributes(match[0]);
  const classes=(attrs.get('class')||'').split(/\s+/);
  if(classes.some(c=>['skip-link','skip-to-main','skip'].includes(c))){
   skipFound=true;
   const href=attrs.get('href')||'';
   if(!href.startsWith('#')||!idSet.has(href.slice(1)))
    errors.push('skip link target '+JSON.stringify(href)+' does not exist');
  }
 }
 if(!skipFound)errors.push('no visible-on-focus skip-navigation anchor declared');
 for(const match of markup.matchAll(/\b(aria-labelledby|aria-describedby|aria-controls|for)=(["'])(.*?)\2/g)){
  const tokens=match[3].trim().split(/\s+/).filter(Boolean);
  for(const token of tokens){
   if(!idSet.has(token))errors.push(match[1]+' references nonexistent id "'+token+'"');
  }
 }
 for(const match of markup.matchAll(/href=(["'])#([^"'#\s]+)\1/g)){
  const token=match[2];
  if(!idSet.has(token))errors.push('fragment href #'+token+' has no target');
 }
 for(const match of markup.matchAll(/\baria-label=(["'])\s*\1/g)){
  errors.push('empty accessible name at '+match.index);
 }
 if(errors.length)failures.push({template:name,errors});
 else console.log('PASS: '+name+' ('+idSet.size+' unique IDs, main/skip, references and fragments)');
 results.push({template:name,idCount:idSet.size,errors});
}
if(byFolder.length!==24)failures.push({template:'catalogue',errors:['Expected 24 original full-site templates, found '+byFolder.length]});
console.log('Full-template static accessibility references: '+(results.length-failures.filter(x=>x.template!=='catalogue').length)+'/'+results.length+' templates without source-reference errors');
if(failures.length){
 for(const problem of failures){
  for(const error of problem.errors)console.error('FAIL: '+problem.template+': '+error);
 }
 process.exitCode=1;
}
