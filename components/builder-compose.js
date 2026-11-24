// The catalogue specimen is the source of truth. No second implementation of a design.
import {ink,variants} from './builder-model.js';
import {themeTree} from './builder-theme.js';
export const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cache=new Map(),revisions=new WeakMap();
const root=new URL('./previews/',document.baseURI);
const contextOnly=new Set(['CTA-05','UI-05','LEGAL-01','LEGAL-02','LEGAL-03']);
export const isContextReference=c=>c&&(['interface','legal'].includes(c.category)||contextOnly.has(c.id));
function sourceURL(c){
 const url=new URL(c.previewRoute,document.baseURI);
 if(url.origin!==root.origin||url.pathname!==root.pathname+c.id+'/'||!/^([A-Z]+)-[0-9]+$/.test(c.id))throw Error('Invalid source route');
 return new URL('index.html',url);
}
function assetURL(value,base){
 if(!value||value.startsWith('#'))return value;
 try{const u=new URL(value,base);return u.protocol==='https:'||u.origin===location.origin&&['http:','https:'].includes(u.protocol)||u.protocol==='data:'&&/^data:image\//i.test(value)?u.href:''}catch{return ''}
}
function cssAssets(css,base){return css.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi,(_,q,v)=>'url("'+assetURL(v.trim(),base).replace(/["\\\n\r]/g,'')+'")')}
function mapSelector(sel){return sel.replace(/:root\b/g,'[data-source-html]').replace(/(^|[\s>+~,(])html(?=$|[\s.#:[>+~,)])/g,'$1[data-source-html]').replace(/(^|[\s>+~,(])body(?=$|[\s.#:[>+~,)])/g,'$1[data-source-body]')}
function mappedRules(rules){return Array.from(rules,r=>{
 if(r.type===1)return mapSelector(r.selectorText)+'{'+r.style.cssText+'}';
 if(r.type===4||r.type===12||r.cssRules&&/^@(layer|container|scope)\b/.test(r.cssText)){return r.cssText.slice(0,r.cssText.indexOf('{'))+'{'+mappedRules(r.cssRules)+'}'}
 if(r.type===3)return ''; // No imports or network-discovered styles.
 return r.cssText;
 }).join('\n')}
async function readSource(c){
 const url=sourceURL(c),key=url.href;if(cache.has(key))return cache.get(key);
 const pending=(async()=>{const res=await fetch(url,{credentials:'same-origin'});if(!res.ok)throw Error('Source unavailable: '+c.id);
 const doc=new DOMParser().parseFromString(await res.text(),'text/html'),target=doc.getElementById(c.showcase?.focusAnchor);
 if(!target||!doc.body.contains(target))throw Error('Source anchor unavailable: '+c.id);
 const css=await Promise.all([...doc.querySelectorAll('head link[rel~="stylesheet"],head style')].map(async node=>{
  if(node.tagName==='STYLE')return cssAssets(node.textContent,url);
  const href=new URL(node.getAttribute('href'),url);if(href.origin!==url.origin||!href.pathname.startsWith(root.pathname))throw Error('Unapproved stylesheet');
  const r=await fetch(href,{credentials:'same-origin'});if(!r.ok)throw Error('Styles unavailable: '+c.id);return cssAssets(await r.text(),href);
 }));
 if(!css.length)throw Error('No source styling: '+c.id);
 const sheet=new CSSStyleSheet();sheet.replaceSync(css.join('\n'));return {doc,target,url,css:mappedRules(sheet.cssRules)};
 })();cache.set(key,pending);pending.catch(()=>cache.delete(key));return pending;
}
const forbidden='script,iframe,object,embed,base,meta,link,portal';
function scrub(el,base){
 el.querySelectorAll(forbidden).forEach(n=>n.remove());
 for(const n of [el,...el.querySelectorAll('*')]){
  for(const a of [...n.attributes]){
   const k=a.name.toLowerCase(),v=a.value;
   if(k.startsWith('on')||['srcdoc','action','formaction','target','ping','download','autoplay','autofocus','contenteditable'].includes(k)){n.removeAttribute(a.name);continue}
   if(k==='srcset'){n.removeAttribute(a.name);continue}
   if(['src','poster','href','xlink:href'].includes(k)){
    if(n.localName==='a'||n.localName==='area'){n.setAttribute(a.name,'#');continue}
    const u=assetURL(v,base);if(u)n.setAttribute(a.name,u);else n.removeAttribute(a.name);
   }
   if(k==='style')n.setAttribute('style',cssAssets(v,base));
  }
  if(n.localName==='video'||n.localName==='audio'){n.removeAttribute('autoplay');n.setAttribute('preload','none');}
  if(n.localName==='input'||n.localName==='textarea'||n.localName==='select'){n.removeAttribute('name');n.setAttribute('autocomplete','off');}
 }
}
function copyAttributes(from,to){for(const a of from.attributes)if(!a.name.startsWith('on')&&!['id','style'].includes(a.name))to.setAttribute(a.name,a.value)}
const neutral={
 business:{hero:['Built around','your needs.'],lead:'Discover what we can do for you.',action:'Explore our services'},
 work:{hero:['Work worth','discovering.'],lead:'Explore a selection of creative work.',action:'View our work'},
 products:{hero:['Find something','you love.'],lead:'Explore our collection of products.',action:'Explore the collection'},
 booking:{hero:['Make time','for something good.'],lead:'Discover what we offer and plan your visit.',action:'Explore booking options'},
 other:{hero:['Welcome to','our website.'],lead:'Find out more about what we do.',action:'Discover more'}
};
function setText(root,sel,text){const n=root.querySelector(sel);if(n)n.textContent=text}
function splitHeading(root,sel,parts){
 const n=root.querySelector(sel);if(!n)return;const em=n.querySelector('em,i');
 if(em){const copy=em.cloneNode(false);copy.textContent=parts[1];n.replaceChildren(parts[0],n.ownerDocument.createElement('br'),copy)}
 else n.replaceChildren(parts[0],n.ownerDocument.createElement('br'),parts[1]);
}
// Only explicitly reviewed copy bindings; don't guess at arbitrary demo text or remove evidence disclosures.
function bindContent(target,c,spec){
 const p=neutral[spec.purpose]||neutral.other;
 if(c.id==='NAV-01'){setText(target,'.n1-logo','YOUR BUSINESS');setText(target,'.n1-action','Get in touch')}
 if(c.id==='NAV-02')setText(target,'.v-logo','YOUR BUSINESS');
 if(c.id==='NAV-03'){setText(target,'.n3-brand','YOUR BUSINESS');setText(target,'.n3-book','Get in touch')}
 if(c.id==='NAV-04'){setText(target,'.n4-wordmark>span:last-child','YOUR BUSINESS');const words=target.querySelectorAll('.n4-utility span');['YOUR BUSINESS','SERVICES & ENQUIRIES','SAMPLE WEBSITE'].forEach((v,i)=>{if(words[i])words[i].textContent=v})}
 if(c.id==='NAV-05')setText(target,'.brand','YB');
 if(c.id==='NAV-06'||c.id==='NAV-07')setText(target,'.brand','YOUR BUSINESS');
 if(c.category==='headers'){
  const titles=spec.pageTitles||['Home','About','Contact'];const navs=[...target.querySelectorAll('nav')];
  for(const nav of navs){const links=[...nav.querySelectorAll('a')].filter(a=>!a.closest('[hidden]')&&!a.classList.contains('v-logo'));links.forEach((a,i)=>{a.textContent=titles[i%titles.length]||'Home'})}
 }
 if(c.id==='HERO-02'){splitHeading(target,'.h2-copy h1',p.hero);setText(target,'.h2-copy p',p.lead);setText(target,'.h2-copy a',p.action);setText(target,'.h2-copy small','YOUR BUSINESS / INTRODUCTION');const notes=target.querySelectorAll('.h2-copy small');if(notes[1])notes[1].textContent='WELCOME / 01'}
 if(c.id==='HERO-01'){splitHeading(target,'.h1-copy h1',p.hero);setText(target,'.h1-copy p','YOUR BUSINESS');setText(target,'.h1-copy a',p.action);setText(target,'.h1-mark','YOUR WEBSITE / 01');setText(target,'.h1-side','WELCOME')}
 if(c.id==='HERO-08'){splitHeading(target,'.type h1',p.hero);setText(target,'.type a',p.action)}
 if(c.id==='SRV-02'){splitHeading(target,'.sv2-intro h1',['What we','offer.']);setText(target,'.sv2-intro span','OUR SERVICES / SAMPLE');setText(target,'.sv2-intro p','Introduce the services your business offers. Illustrations show the image placement; final photography will be supplied for your business.');target.querySelectorAll('.sv2-grid article').forEach((n,i)=>{setText(n,'h2','Service '+(i+1));setText(n,'p','A short description of this service.');setText(n,'article>span',String(i+1).padStart(2,'0')+' / SERVICE')})}
 if(c.id==='ABOUT-01'){splitHeading(target,'.ab-copy h1',['The people','behind the work.']);setText(target,'.ab-copy p','Introduce your business, your experience and the people behind it. This is example copy; the portrait is illustrative stock.');setText(target,'.ab-copy a','More about us')}
 if(c.id==='CTA-02'){splitHeading(target,'.c2-text h1',['Let’s take','the next step.']);setText(target,'.c2-text>span','GET IN TOUCH');setText(target,'.c2-cta','Contact us');setText(target,'.c2-date','YOUR BUSINESS')}
 if(c.id==='FOOT-01'){setText(target,'.ft-logo','YOUR BUSINESS');setText(target,'.ft-footer p','Your business information');setText(target,'.ft-footer>span','© YOUR BUSINESS / SAMPLE WEBSITE')}
 if(c.id==='FOOT-02')setText(target,'.f2-bottom strong','YOUR BUSINESS');
 if(c.id==='CONTACT-03')setText(target,'.service-info>div:first-child span','Your business · sample details');
}
function installLocalControls(shadow,body,target,c,entry,width){
 // No source scripts are executed. Only small, local preview interactions with known targets.
 shadow.addEventListener('submit',e=>{e.preventDefault();e.stopPropagation()});
 shadow.addEventListener('click',e=>{
  const a=e.target.closest?.('a,area');if(a){e.preventDefault();return}
  const b=e.target.closest?.('button[aria-controls][aria-expanded]');if(!b)return;
  const panel=shadow.getElementById(b.getAttribute('aria-controls'));
  if(!panel||!panel.hasAttribute('hidden')&&b.getAttribute('aria-expanded')!=='true')return;
  const open=b.getAttribute('aria-expanded')!=='true';panel.hidden=!open;b.setAttribute('aria-expanded',String(open));body.classList.toggle('menu-open',open);
 });
 shadow.addEventListener('keydown',e=>{if(e.key!=='Escape')return;shadow.querySelectorAll('button[aria-expanded=true][aria-controls]').forEach(b=>{const panel=shadow.getElementById(b.getAttribute('aria-controls'));if(panel){panel.hidden=true;b.setAttribute('aria-expanded','false');b.focus()}});body.classList.remove('menu-open')});
 if(entry.mobileId==='M-SRV-02'&&width<=430&&c.id==='SRV-02'){
  const grid=target.querySelector('.sv2-grid'),cards=[...grid?.querySelectorAll('article')||[]];if(!grid||!cards.length)return;
  const doc=target.ownerDocument,bar=doc.createElement('div'),controls=doc.createElement('div'),status=doc.createElement('p');bar.className='sv2-switcher';controls.className='sv2-switcher-buttons';status.className='sv2-switcher-status';controls.setAttribute('role','group');controls.setAttribute('aria-label','Choose a sample service');status.setAttribute('role','status');
  const show=i=>{cards.forEach((n,j)=>n.hidden=j!==i);[...controls.children].forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));status.textContent='Showing service '+(i+1)+' of '+cards.length};
  cards.forEach((n,i)=>{const b=doc.createElement('button');b.type='button';b.textContent=n.querySelector('h2')?.textContent||'Service '+(i+1);b.addEventListener('click',()=>show(i));controls.append(b)});bar.append(controls,status);target.insertBefore(bar,grid);show(0);
 }
}
function mountSection(doc,parent,src,c,entry,spec){
 const host=doc.createElement('div');host.dataset.id=c.id;host.dataset.slot=entry.slotId||String(entry.key);host.dataset.sourceAnchor=c.showcase.focusAnchor;host.dataset.sourceStatus='preparing';host.dataset.mobile=spec.width<=430&&entry.mobileId||'default';host.setAttribute('role','group');host.setAttribute('aria-label',c.title);parent.append(host);
 const shadow=host.attachShadow({mode:'open'}),style=doc.createElement('style');style.textContent=src.css+'\n'+
 ':host{display:block;position:relative;min-width:0;contain:layout;isolation:isolate} [data-source-html],[data-source-body]{display:block!important;margin:0!important;padding:0!important;min-height:0!important;height:auto!important;overflow:visible!important;max-width:none!important;width:auto!important} [data-source-target]{position:relative!important;inset:auto!important;min-width:0;max-width:100%} [hidden]{display:none!important} @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}'+
 (c.id==='NAV-05'?'@media(min-width:851px){:host{contain:none;position:sticky;top:0;align-self:start}[data-source-target]{height:100vh;width:110px;position:relative!important}}':'')+
 '';
 const html=doc.createElement('div'),body=doc.createElement('div');copyAttributes(src.doc.documentElement,html);copyAttributes(src.doc.body,body);html.dataset.sourceHtml='';body.dataset.sourceBody='';
 if(spec.width<=430&&variants(spec.cat,c.id).some(x=>x.id===entry.mobileId))body.dataset.mobileTreatment=entry.mobileId;else body.removeAttribute('data-mobile-treatment');
 const chain=[];let n=src.target.parentElement;while(n&&n!==src.doc.body){chain.unshift(n);n=n.parentElement}
 let mount=body;for(const ancestor of chain){const a=doc.createElement(ancestor.localName);copyAttributes(ancestor,a);if(ancestor.id)a.id=ancestor.id;mount.append(a);mount=a}
 const target=doc.importNode(src.target,true);target.dataset.sourceTarget='';scrub(target,src.url);bindContent(target,c,spec);mount.append(target);
 // Include only explicitly referenced sibling navigation panels, not demo page content.
 if(c.category==='headers'){for(const btn of target.querySelectorAll('[aria-controls]')){const id=btn.getAttribute('aria-controls');if(target.querySelector('[id="'+CSS.escape(id)+'"]'))continue;const panel=src.doc.getElementById(id);if(panel&&['nav','dialog'].includes(panel.localName)){const clone=doc.importNode(panel,true);scrub(clone,src.url);if(clone.localName==='dialog')continue;clone.hidden=true;mount.append(clone)}}}
 html.append(body);shadow.append(style,html);
 // Source image failures keep the original authored background/geometry and honest alt text.
 target.querySelectorAll('img').forEach(img=>{img.addEventListener('error',()=>{img.style.visibility='hidden';img.closest('.n3-scene,.h1-scene,.g2-photo,.s3-media,.c2-scene')?.classList.add('image-pending')},{once:true})});
 installLocalControls(shadow,body,target,c,entry,spec.width);themeTree(body,spec.palette);host.dataset.palettePrimary=spec.palette.primary;host.dataset.paletteSecondary=spec.palette.secondary;host.dataset.paletteTrim=spec.palette.trim||'';host.dataset.sourceStatus='mounted';return host;
}
const skeleton='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src \'self\' https: data:; media-src \'self\' https:; font-src \'self\' https: data:; form-action \'none\'; frame-src \'none\'; base-uri \'none\'"><title>Selected website designs</title><style>html,body{margin:0;min-height:100%;font:16px Arial,sans-serif}*,*::before,*::after{box-sizing:border-box}body{overflow-x:clip}#page{min-width:0}#page[data-rail]{display:grid;grid-template-columns:110px minmax(0,1fr)}#sections{min-width:0}#sections>div{min-width:0}.preview-error{padding:35px 5vw;border:1px dashed #a25a3a;background:#f8f3e8;color:#282828}.loading{padding:24px}@media(max-width:850px){#page[data-rail]{display:block}}</style></head><body><main id="page"><div id="sections"><p class="loading">Preparing your selected designs…</p></div></main></body></html>';
export async function renderSourcePage(frame,spec,cat,onResult=()=>{}){
 const revision=(revisions.get(frame)||0)+1;revisions.set(frame,revision);const scroll=spec.preserveScroll?frame.contentWindow?.scrollY||0:0;if(frame.contentDocument?.body)delete frame.contentDocument.body.dataset.previewReady;
 const active=()=>frame.isConnected&&revisions.get(frame)===revision;
 const entries=spec.sections.map(entry=>({entry,c:cat.core.get(entry.coreId)}));
 const sources=await Promise.allSettled(entries.map(({c})=>c&&!isContextReference(c)?readSource(c):Promise.resolve(null)));
 if(!active())return;
 const mounted=await new Promise(resolve=>{
  const loaded=()=>{if(!active()){frame.removeEventListener('load',loaded);resolve(null);return}const doc=frame.contentDocument,page=doc?.getElementById('page'),container=doc?.getElementById('sections');if(!page||!container||doc.body.dataset.revision!==String(revision))return;frame.removeEventListener('load',loaded);
   container.replaceChildren();doc.body.style.background=spec.palette.secondary;let errors=0,shown=0,context=0;
   entries.forEach(({entry,c},i)=>{if(c&&isContextReference(c)){context++;return}const source=sources[i];if(c&&source.status==='fulfilled'&&source.value){try{const rail=c.id==='NAV-05'&&spec.width>850;const host=mountSection(doc,rail?page:container,source.value,c,entry,{...spec,cat});if(rail){page.dataset.rail='';page.prepend(host)}shown++;return}catch(err){page.querySelectorAll('[data-source-status=preparing]').forEach(n=>n.remove());console.warn('Could not mount',c.id,err)}}
    errors++;const box=doc.createElement('section');box.className='preview-error';box.dataset.sourceStatus='error';box.dataset.id=c?.id||entry.coreId;box.textContent=(c?.title||entry.coreId)+' could not be loaded. Your original selection is still saved.';container.append(box)});
   if(!shown&&!errors){const p=doc.createElement('p');p.className='loading';p.textContent='Choose a design to begin.';container.append(p)}
   doc.body.dataset.previewPalette=[spec.palette.primary,spec.palette.secondary,spec.palette.trim||'none'].join('/');doc.body.dataset.previewReady='true';if(scroll)frame.contentWindow.scrollTo(0,scroll);resolve({shown,errors,context});
  };frame.addEventListener('load',loaded);frame.setAttribute('sandbox','allow-same-origin');frame.removeAttribute('src');frame.srcdoc=skeleton.replace('<body>','<body data-revision="'+revision+'">');
 });
 if(active()&&mounted)onResult(mounted);return mounted;
}
