/* Filesystem source of truth for complete-site QA. Shared assets use _folders. */
import {existsSync,readdirSync,readFileSync} from 'node:fs';
import path from 'node:path';
export function discoverTemplates(root){
 const dir=path.join(root,'templates');
 const ids=readdirSync(dir,{withFileTypes:true}).filter(e=>e.isDirectory()&&!e.name.startsWith('_')).map(e=>e.name).sort();
 if(!ids.length)throw Error('No complete website templates discovered');
 for(const id of ids){
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))throw Error('Invalid template folder slug: '+id);
  if(!existsSync(path.join(dir,id,'index.html')))throw Error('Incomplete template folder: '+id+' (missing index.html)');
 }
 return ids;
}
export function compareMembership(expected,actual){
 const a=new Set(expected),b=new Set(actual);
 return {missing:[...a].filter(x=>!b.has(x)),unexpected:[...b].filter(x=>!a.has(x)),duplicates:actual.filter((x,i)=>actual.indexOf(x)!==i)};
}
export function gallerySources(root){
 const html=readFileSync(path.join(root,'index.html'),'utf8'),js=readFileSync(path.join(root,'script.js'),'utf8');
 const matches=(s,re)=>[...s.matchAll(re)].map(m=>m[1]);
 const ids=[...matches(html,/class="featured-preview-link" href="templates\/([a-z0-9-]+)\//g),...matches(html,/class="thumb-link" href="templates\/([a-z0-9-]+)\//g),...matches(js,/if \(templateGrid && !document\.querySelector\('\[data-template="([a-z0-9-]+)"\]'\)\)/g),...matches(js,/\{id:'([a-z0-9-]+)',cat:/g)];
 const media=[...html.matchAll(/https:\/\/(?:images\.unsplash\.com|images\.pexels\.com)\/[^\s"'<>]+/g),...js.matchAll(/https:\/\/(?:images\.unsplash\.com|images\.pexels\.com)\/[^\s"'<>]+/g)].map(m=>m[0].split('?')[0]);
 const badgeCount=[...html.matchAll(/class="live-badge">Preview<\/span>/g),...js.matchAll(/class="live-badge">Preview<\/span>/g)].length;
 return {ids,media,badgeCount};
}
export function galleryMembership(root){
 const source=gallerySources(root),ids=discoverTemplates(root);
 return {...compareMembership(ids,source.ids),ids,source};
}
