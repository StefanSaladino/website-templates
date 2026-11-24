/* Parse every complete template's local JavaScript, including linked scripts
 * and inline executable scripts, without executing site code or CDN assets. */
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {discoverTemplates} from './template-catalogue.mjs';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const root=path.join(repo,'templates'),ids=discoverTemplates(repo),errors=[];
let inspected=0;
const visited=new Set();
function parse(code,file,kind){
 const key=file+'|'+kind;if(visited.has(key))return;visited.add(key);inspected++;
 try{
  if(kind==='module'){
   const result=spawnSync(process.execPath,['--input-type=module','--check'],{input:code,encoding:'utf8',timeout:15000});
   if(result.error||result.status!==0)throw Error(result.error||result.stderr||'Module parse failed');
  }else new vm.Script(code,{filename:file,displayErrors:true});
 }catch(e){errors.push(file+': '+String(e.message||e))}
}
function attr(tag,name){
 const m=new RegExp('(?:^|\\s)'+name+'\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))','i').exec(tag);
 return m?.[1]??m?.[2]??m?.[3]??'';
}
for(const id of ids){
 const dir=path.join(root,id),html=readFileSync(path.join(dir,'index.html'),'utf8');
 const linked=new Set();
 for(const [_,tag,body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
  const type=attr(tag,'type').toLowerCase().trim();
  if(type&&!['module','text/javascript','application/javascript','text/ecmascript','application/ecmascript'].includes(type))continue;
  const kind=type==='module'?'module':'classic',src=attr(tag,'src');
  if(src){
   if(/^(?:https?:|\/\/)/i.test(src))continue;
   const local=src.split(/[?#]/)[0],file=path.resolve(dir,local);
   if(!file.startsWith(repo+path.sep)||!existsSync(file)){errors.push(id+': invalid/missing script '+src);continue}
   linked.add(file);parse(readFileSync(file,'utf8'),file,kind);
  }else if(body.trim())parse(body,id+'/inline-script-'+inspected,kind);
 }
 // Also inspect unlinked conventional scripts and additional local source modules.
 for(const entry of readdirSync(dir,{withFileTypes:true})){
  if(!entry.isFile()||!/\.(?:m?js)$/i.test(entry.name))continue;
  const file=path.join(dir,entry.name);if(linked.has(file))continue;
  const code=readFileSync(file,'utf8');
  const kind=entry.name.endsWith('.mjs')||/^\s*(?:import\s|export\s)/m.test(code)?'module':'classic';
  parse(code,file,kind);
 }
}
if(!inspected)errors.push('No complete-template scripts inspected');
if(errors.length){for(const error of errors)console.error('TEMPLATE-SYNTAX-ERROR:',error);process.exitCode=1;}
else console.log('PASS: '+inspected+' executable JavaScript sources across '+ids.length+' complete websites parse successfully.');
