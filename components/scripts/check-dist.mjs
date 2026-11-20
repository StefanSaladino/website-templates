import {readFileSync,existsSync,readdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.resolve(here,'../dist/components');
const components=JSON.parse(readFileSync(path.join(here,'data/components.json'),'utf8'));
const mobile=JSON.parse(readFileSync(path.join(here,'data/mobile-treatments.json'),'utf8'));
const missing=[];
const requireFile=(relative)=>{
 const full=path.resolve(output,relative);
 if(!full.startsWith(output+path.sep)||!existsSync(full))missing.push(relative);
};
for(const file of ['index.html','review.html','data/components.json','data/categories.json','data/mobile-treatments.json','data/stock-manifest.json'])requireFile(file);
for(const component of components.filter(x=>x.status!=='draft')){
 for(const name of ['index.html','styles.css','script.js'])requireFile('previews/'+component.id+'/'+name);
}
for(const treatment of mobile.filter(x=>x.status!=='draft')){
 if(!treatment.compatibleComponentIds?.length||!treatment.previewRoute)missing.push('Unlinked treatment '+treatment.id);
}
if(existsSync(path.join(output,'index.html'))){
 const html=readFileSync(path.join(output,'index.html'),'utf8');
 if(!html.includes('assets/')||/src="\/assets\//.test(html))missing.push('Catalogue assets are not relative to the Pages subpath');
}
if(existsSync(path.join(output,'review.html'))){
 const html=readFileSync(path.join(output,'review.html'),'utf8');
 if(!html.includes('assets/')||/src="\/assets\//.test(html))missing.push('Review assets are not relative to the Pages subpath');
}
if(existsSync(path.join(output,'assets'))){
 const names=readdirSync(path.join(output,'assets'));
 if(!names.some(name=>name.endsWith('.js')))missing.push('Bundled JavaScript assets absent');
}
// Every connected animation example must resolve to a real bundled template.
const rootOutput=path.resolve(here,'../dist');
for(const component of components.filter(x=>x.status!=='draft'&&x.category==='animations')){
 if(!component.fullTemplateRoute||!component.fullTemplateName)missing.push('Animation not integrated into a real template '+component.id);
}
for(const component of components.filter(x=>x.status!=='draft'&&x.category==='animations'&&x.fullTemplateRoute)){
 const route=component.fullTemplateRoute.split('#')[0];
 if(!/^\.\.\/templates\/[a-z-]+\/index\.html$/.test(route))missing.push('Invalid connected template route '+component.id);
 else {
  const file=path.resolve(output,route);
  if(!file.startsWith(rootOutput+path.sep)||!existsSync(file))missing.push('Missing connected full template '+component.id+' / '+route);
  else if(!readFileSync(file,'utf8').includes('data-motion-pattern="'+component.id+'"'))missing.push('Template lacks actual animation implementation marker '+component.id+' / '+route);
  else if(component.fullTemplateRoute.includes('#')&&!readFileSync(file,'utf8').includes('id="'+component.fullTemplateRoute.split('#')[1]+'"'))missing.push('Integrated animation link has missing fragment target '+component.id);
 }
}
if(missing.length){for(const file of missing)console.error('FAIL dist:',file);process.exit(1)}
console.log('PASS dist: catalogue, internal review page, '+components.filter(x=>x.status!=='draft').length+' prototypes, '+mobile.filter(x=>x.status!=='draft').length+' mobile alternatives, and source manifest are present.');
