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
