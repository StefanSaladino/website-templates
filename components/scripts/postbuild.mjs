import {cpSync,existsSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.resolve(here,'../dist/components');
mkdirSync(out,{recursive:true});
for(const folder of ['data','assets','previews']){
  const source=path.join(here,folder);
  if(existsSync(source))cpSync(source,path.join(out,folder),{recursive:true,force:true});
}
console.log('Copied catalogue metadata and local assets to '+out);

// A showroom animation links to the *actual* full-page templates. Include
// these static files in the isolated production preview artifact and browser QA.
const templateSource=path.resolve(here,'../templates');
const templateOutput=path.resolve(here,'../dist/templates');
if(existsSync(templateSource))cpSync(templateSource,templateOutput,{recursive:true,force:true});
console.log('Copied full website template examples for motion links to '+templateOutput);

// Root gallery and shared raw header assets for isolated production QA.
const rootSource=path.resolve(here,'..'),rootOutput=path.resolve(out,'..');
for(const file of ['index.html','styles.css','script.js','custom-bakes-gallery.css'])cpSync(path.join(rootSource,file),path.join(rootOutput,file),{force:true});
for(const file of ['site-header.css','site-header.js'])cpSync(path.join(here,file),path.join(out,file),{force:true});
