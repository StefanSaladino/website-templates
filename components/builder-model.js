export const KEY='boomer.design-brief.v1', DEFAULT={primary:'#183D37',secondary:'#F2F0E8',trim:'#B45B32'};
export const WIDTHS=[320,360,375,390,430,768,1024,1440,1920];
export const GROUPS=[['Navigation','announcements','headers'],['Opening','heroes','introductions'],['Content','services','about','teams','galleries','projects','before-after','media','process','trust','testimonials','pricing','products','menus','articles','events','careers','locations'],['Contact & conversion','calls-to-action','booking','forms','contact','newsletter'],['Footer & utilities','footers','interface','legal']];
export const hex=s=>typeof s==='string'&&/^#[0-9a-f]{6}$/i.test(s);
const working=c=>c&&['in-review','approved','live'].includes(c.status)&&typeof c.previewRoute==='string';
export function catalogue(c,m,t,g){return {core:new Map(c.filter(working).map(x=>[x.id,x])),mobile:new Map(m.filter(working).map(x=>[x.id,x])),templates:new Map(t.filter(x=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x.slug)&&x.route==='../templates/'+x.slug+'/').map(x=>[x.slug,x])),categories:new Map(g.map(x=>[x.id,x]))}}
export function variants(cat,id){const c=cat.core.get(id);return(c?.mobileTreatmentIds||[]).map(i=>cat.mobile.get(i)).filter(m=>m?.compatibleComponentIds?.includes(id)&&m.previewRoute.startsWith(c.previewRoute))}
export const ESSENTIALS=['headers','heroes','footers'];
const GUIDED_ORDER=[...ESSENTIALS,'services','about','galleries','projects','calls-to-action','contact','forms','trust','testimonials','process','introductions','teams','before-after','media','pricing','products','menus','booking','locations','announcements','articles','events','careers','newsletter','interface','legal'];
export function guideCategories(cat){const available=[...cat.categories.keys()].filter(k=>k!=='animations'&&[...cat.core.values()].some(c=>c.category===k));return [...GUIDED_ORDER.filter(k=>available.includes(k)),...available.filter(k=>!GUIDED_ORDER.includes(k))]}
export const selectedIn=(s,cat,k)=>s.sections.filter(x=>cat.core.get(x.coreId)?.category===k);
export const guideStatus=(s,cat,k)=>selectedIn(s,cat,k).length?'chosen':s.skipped.includes(k)&&!ESSENTIALS.includes(k)?'skipped':'unanswered';
export function nextGuide(s,cat,k,delta=1){const list=guideCategories(cat),i=list.indexOf(k);return list[i+delta]||null}
export function fresh(){return {version:1,mode:null,template:null,sections:[],nextKey:1,palette:{...DEFAULT},step:0,guideCategory:'headers',skipped:[],confirmed:null}}
const single=c=>['headers','heroes','footers','announcements'].includes(c.category);
const rank=c=>({announcements:0,headers:1,heroes:2,footers:4}[c.category]??3);
export const ready=(s,cat)=>s.mode==='template'?!!s.template:s.mode==='custom'&&ESSENTIALS.filter(k=>guideCategories(cat).includes(k)).every(k=>selectedIn(s,cat,k).length>0)&&s.sections.length>0;
export function restore(raw,cat){
 const s=fresh(),warnings=[];if(!raw||raw.version!==1)return {s,warnings:raw?['Saved draft was incompatible and reset.']:[]};
 s.mode=['custom','template'].includes(raw.mode)?raw.mode:null;s.template=cat.templates.has(raw.template)?raw.template:null;
 const keys=new Set(),singles=new Set();for(const e of Array.isArray(raw.sections)?raw.sections.slice(0,80):[]){const c=cat.core.get(e?.coreId);if(!c||c.category==='animations'||single(c)&&singles.has(c.category)){warnings.push('Removed unavailable selection.');continue}let key=Number.isSafeInteger(e.key)&&e.key>0&&e.key<1000000&&!keys.has(e.key)?e.key:s.nextKey;while(keys.has(key))key++;keys.add(key);s.nextKey=Math.max(s.nextKey,key+1);if(single(c))singles.add(c.category);
 const mobileId=variants(cat,c.id).some(m=>m.id===e.mobileId)?e.mobileId:null;if(e.mobileId&&!mobileId)warnings.push('Reset incompatible mobile option: '+c.id);
 s.sections.push({key,coreId:c.id,mobileId,animationIds:[...new Set((Array.isArray(e.animationIds)?e.animationIds:[]).filter(id=>cat.core.get(id)?.category==='animations'))]})}
 for(const k of Object.keys(DEFAULT)){const v=raw.palette?.[k];if(k==='trim'&&v===null)s.palette[k]=null;else if(hex(v))s.palette[k]=v.toUpperCase()}
 const guided=guideCategories(cat);s.guideCategory=guided.includes(raw.guideCategory)?raw.guideCategory:guided.find(k=>!selectedIn(s,cat,k).length)||guided[0]||null;s.skipped=[...new Set((Array.isArray(raw.skipped)?raw.skipped:[]).filter(k=>guided.includes(k)&&!ESSENTIALS.includes(k)&&!selectedIn(s,cat,k).length))];
 s.step=s.mode?Math.max(0,Math.min(ready(s,cat)?4:1,Number.isInteger(raw.step)?raw.step:0)):0;return {s,warnings}
}
export function update(s,a,cat){
 const edit=p=>({...s,...p,confirmed:null,step:Math.min(s.step,4)});
 switch(a.type){
 case 'mode':return ['custom','template'].includes(a.mode)?edit({mode:a.mode,step:1}):s;
 case 'guide':return guideCategories(cat).includes(a.category)?{...s,guideCategory:a.category}:s;
 case 'skip':{if(!guideCategories(cat).includes(a.category)||ESSENTIALS.includes(a.category)||selectedIn(s,cat,a.category).length)return s;return edit({skipped:[...new Set([...s.skipped,a.category])]})}
 case 'skip-remaining':return ready(s,cat)&&s.mode==='custom'?edit({skipped:guideCategories(cat).filter(k=>!ESSENTIALS.includes(k)&&!selectedIn(s,cat,k).length)}):s;
 case 'choose':{const c=cat.core.get(a.id);if(!c||c.category==='animations')return s;const old=selectedIn(s,cat,c.category)[0];if(!old)return update(s,{type:'add',id:a.id},cat);if(old.coreId===c.id)return s;return edit({sections:s.sections.map(x=>x.key===old.key?{key:x.key,coreId:c.id,mobileId:null,animationIds:[]}:x),skipped:s.skipped.filter(k=>k!==c.category)})}
 case 'template':return cat.templates.has(a.slug)?edit({mode:'template',template:a.slug}):s;
 case 'add':{const c=cat.core.get(a.id);if(!c||c.category==='animations'||s.sections.length>=80)return s;const sections=s.sections.slice(),entry={key:s.nextKey,coreId:c.id,mobileId:null,animationIds:[]};const i=single(c)?sections.findIndex(e=>cat.core.get(e.coreId).category===c.category):-1;if(i>=0){if(sections[i].coreId===c.id)return s;entry.key=sections[i].key;sections[i]=entry}else{const at=sections.findIndex(e=>rank(cat.core.get(e.coreId))>rank(c));sections.splice(at<0?sections.length:at,0,entry)}return edit({mode:'custom',sections,nextKey:s.nextKey+1,skipped:s.skipped.filter(k=>k!==c.category)})}
 case 'remove':{const k=cat.core.get(s.sections.find(e=>e.key===a.key)?.coreId)?.category;return edit({sections:s.sections.filter(e=>e.key!==a.key),skipped:s.skipped.filter(x=>x!==k)})}
 case 'move':{const i=s.sections.findIndex(e=>e.key===a.key),j=i+a.delta;if(i<0||j<0||j>=s.sections.length||Math.abs(a.delta)!==1)return s;const sections=s.sections.slice();[sections[i],sections[j]]=[sections[j],sections[i]];return edit({sections})}
 case 'mobile':{const e=s.sections.find(e=>e.key===a.key);return !e||a.id!==null&&!variants(cat,e.coreId).some(m=>m.id===a.id)?s:edit({sections:s.sections.map(e=>e.key===a.key?{...e,mobileId:a.id}:e)})}
 case 'animation':return cat.core.get(a.id)?.category!=='animations'?s:edit({sections:s.sections.map(e=>e.key===a.key?{...e,animationIds:e.animationIds.includes(a.id)?e.animationIds.filter(id=>id!==a.id):[...e.animationIds,a.id]}:e)});
 case 'colour':return !Object.hasOwn(DEFAULT,a.role)||!(hex(a.value)||a.role==='trim'&&a.value===null)?s:edit({palette:{...s.palette,[a.role]:a.value?.toUpperCase()??null}});
 case 'palette':return edit({palette:{...DEFAULT}});
 case 'step':return {...s,step:Math.max(0,Math.min(ready(s,cat)?4:1,Number.isInteger(a.step)?a.step:0))};
 case 'confirm':return ready(s,cat)?{...s,step:5,confirmed:brief(s,cat)}:s;
 case 'reset':return fresh();default:return s}
}
export function brief(s,cat){
 const t=s.mode==='template'?cat.templates.get(s.template):null;
 const data={version:1,mode:s.mode,template:t?.slug||null,sections:t?[]:s.sections.map((e,i)=>({position:i+1,coreId:e.coreId,mobileId:e.mobileId,animationIds:[...e.animationIds]})),palette:{...s.palette}};
 const out=['BOOMER AUTOMATION — WEBSITE DESIGN BRIEF','',t?'Layout: complete template':'Layout: custom components'];
 if(t)out.push('Template: '+t.slug,'Reference: '+t.route,'Component IDs: not mapped; use exact template as reference.','Colours are design preferences, not a recoloured template.');
 else for(const e of data.sections){out.push(String(e.position).padStart(2,'0')+'. '+e.coreId+' — '+cat.core.get(e.coreId).title,'    Mobile: '+(e.mobileId||'Default'));if(e.animationIds.length)out.push('    Motion: '+e.animationIds.join(', '))}
 out.push('','Primary: '+s.palette.primary,'Secondary: '+s.palette.secondary,'Trim: '+(s.palette.trim||'None'),'','Rough design brief only; final copy, imagery, layout, integration and accessibility require review.');return {data,text:out.join('\n')}
}
function lum(h){const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]}
export function contrast(a,b){return (Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05)}
export const ink=h=>contrast(h,'#FFFFFF')>=contrast(h,'#000000')?'#FFFFFF':'#000000';
