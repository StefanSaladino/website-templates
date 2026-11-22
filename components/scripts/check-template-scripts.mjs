/* Parse every full website template's classic scripts before build/deployment.
 * Syntax only; this does not execute remote media, interact with demo forms, or
 * certify behaviour. Interaction checks are separately covered by Playwright.
 */
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const root=path.join(repo,'templates');
let inspected=0;
const errors=[];
for(const entry of readdirSync(root,{withFileTypes:true}).filter(x=>x.isDirectory()).sort((a,b)=>a.name.localeCompare(b.name))){
 const scriptPath=path.join(root,entry.name,'script.js');
 if(!existsSync(scriptPath))continue;
 inspected++;
 const contents=readFileSync(scriptPath,'utf8');
 try{
  new vm.Script(contents,{filename:path.relative(repo,scriptPath),displayErrors:true});
 }catch(e){
  errors.push(entry.name+': '+String(e.stack||e));
 }
}
if(!inspected)errors.push('No original template scripts were inspected');
if(errors.length){
 for(const error of errors)console.error('TEMPLATE-SYNTAX-ERROR:',error);
 console.error('FAIL:',errors.length+' invalid full template scripts');
 process.exitCode=1;
}else console.log('PASS:',inspected+' original full-site template scripts parse as valid JavaScript');
