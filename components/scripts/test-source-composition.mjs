import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),data=JSON.parse(readFileSync(path.join(root,'data/components.json'),'utf8'));
const rows=data.filter(c=>c.category!=='animations'&&c.status!=='draft');let count=0;
for(const c of rows){const route=path.join(root,c.previewRoute,'index.html');assert(existsSync(route),c.id+' source absent');const html=readFileSync(route,'utf8');const anchor=c.showcase?.focusAnchor;assert(anchor,c.id+' anchor absent');assert(html.includes('id="'+anchor+'"')||html.includes("id='"+anchor+"'"),c.id+' exact anchor absent');assert(/<link[^>]+rel=["']stylesheet["']|<style[\s>]/i.test(html),c.id+' source style missing');count++}
const js=readFileSync(path.join(root,'builder-compose.js'),'utf8');assert(js.includes('attachShadow'));assert(js.includes('doc.importNode(src.target,true)'));assert(js.includes('form-action'));assert(!js.includes('ASSEMBLED PREVIEW NOT YET MAPPED'));const builder=readFileSync(path.join(root,'builder.js'),'utf8');assert(builder.includes('renderSourcePage(fr,'));assert(!builder.includes('compose({'));
console.log('PASS source composition: '+count+' real section source anchors and stylesheet references; isolated source renderer wired to live and final preview.');
