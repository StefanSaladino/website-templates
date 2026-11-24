// Preview-only semantic recolouring. Source files and media are never modified.
import {contrast,ink,hex} from './builder-model.js';
const clamp=n=>Math.max(0,Math.min(255,Math.round(n)));
const toHex=a=>'#'+a.slice(0,3).map(n=>clamp(n).toString(16).padStart(2,'0')).join('').toUpperCase();
export function rgba(s){if(typeof s!=='string')return null;if(hex(s))return [1,3,5].map(i=>parseInt(s.slice(i,i+2),16)).concat(1);if(s==='transparent')return [0,0,0,0];const m=s.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/);return m?[+m[1],+m[2],+m[3],m[4]===undefined?1:+m[4]]:null}
export function mix(a,b,t){const x=rgba(a),y=rgba(b);return toHex(x.map((v,i)=>v+(y[i]-v)*t))}
const value=a=>.2126*a[0]+.7152*a[1]+.0722*a[2];
const chroma=a=>Math.max(...a.slice(0,3))-Math.min(...a.slice(0,3));
export function readable(preferred,bg,min=4.5){if(contrast(preferred,bg)>=min)return preferred;const end=ink(bg);for(let i=1;i<=20;i++){const c=mix(preferred,end,i/20);if(contrast(c,bg)>=min)return c}return end}
export function paletteRoles(p){const trim=p.trim||p.primary;return {primary:p.primary,secondary:p.secondary,trim,onPrimary:ink(p.primary),onSecondary:ink(p.secondary),onTrim:ink(trim),soft:distinctTint(p.secondary,p.primary,.09),muted:distinctTint(p.secondary,p.primary,.2)}}
export function distinctTint(bg,brand,t){return contrast(bg,brand)<1.3?mix(bg,ink(bg),t*.65):mix(bg,brand,t)}
export function surface(original,p,{control=false,footer=false,canvas=false,input=false,parent=p.secondary}={}){const v=value(original);if(canvas)return p.secondary;if(control||footer)return p.primary;if(input)return contrast(parent,p.secondary)>1.3?p.secondary:distinctTint(parent,p.primary,.09);if(v<110)return p.primary;if(v>218)return p.secondary;if(v>170)return distinctTint(p.secondary,p.primary,.09);if(v>135)return distinctTint(p.secondary,p.primary,.20);return distinctTint(p.secondary,p.primary,.38)}
export function controlEdge(bg,parent,p){return readable(p.trim||p.primary,parent,3)}
export function bodyText(bg,p){return contrast(p.primary,bg)>=4.5?p.primary:ink(bg)}
export function foreground(original,bg,p,{accent=false,control=false}={}){const base=bodyText(bg,p);if(control)return ink(bg);if(accent)return readable(p.trim||p.primary,bg);if(chroma(original)>26&&value(original)>65&&value(original)<205)return readable(p.trim||p.primary,bg);return readable(base,bg)}
export function edge(original,bg,p,interactive=false){return interactive?readable(p.trim||p.primary,bg,3):mix(bg,p.trim||p.primary,.35)}
const records=new WeakMap();
const MEDIA='img,picture,video,audio,canvas,svg,[role="img"],[data-preserve-colour],[data-preserve-color]';
const ART=/(?:^|[-_\s])(?:art|artwork|illustration|sculpture|vessel|object-stage|product-visual|product-art|collage|diagram|map-art|photo-fallback|image-pending|stage-art|visual|graphic|swatch|swatches|image|photo|portrait|media|poster|beam|halo)(?:$|[-_\s])/i;
const PHOTO=/(?:^|[-_\s])(?:overlay|shade|gradient|scrim|caption|figcaption)(?:$|[-_\s])/i;
const CTA=/(?:^|[-_\s])(?:cta|action|button|book|submit|primary)(?:$|[-_\s])/i;
const ACCENT=/(?:^|[-_\s])(?:accent|eyebrow|kicker|badge|tag|mark|label|index|number|num)(?:$|[-_\s])/i;
const cssName=n=>typeof n.className==='string'?n.className:'';
const hasImage=n=>!!n.querySelector('img,picture,video,canvas,svg,[role="img"]');
const properties=['background-color','background-image','color','border-top-color','border-right-color','border-bottom-color','border-left-color','outline-color','text-decoration-color','accent-color','box-shadow','caret-color'];
function capture(root){
 const win=root.ownerDocument.defaultView,all=[root,...root.querySelectorAll('*')],map=new Map();
 for(const n of all){
  if(!n.style||['STYLE','SCRIPT','LINK','META','TITLE'].includes(n.tagName))continue;
  const parent=map.get(n.parentElement),cs=win.getComputedStyle(n),cls=cssName(n),isMedia=n.matches(MEDIA)||ART.test(cls)&&!n.matches('section,header,footer,main,nav,form')&&!n.querySelector('h1,h2,h3,h4,p,form,nav,button,a');
  const photoLayer=PHOTO.test(cls)||n.matches('figcaption');
  const media=!!(parent?.media||isMedia);
  const bg=rgba(cs.backgroundColor),fg=rgba(cs.color),image=cs.backgroundImage||'none',urlImage=/url\(/i.test(image),gradient=image!=='none'&&!urlImage;
  const isControl=n.matches('button,input[type=submit],input[type=button],a[role=button]')||n.matches('a')&&CTA.test(cls);
  const original=Object.fromEntries(properties.map(k=>[k,[n.style.getPropertyValue(k),n.style.getPropertyPriority(k)]]));
  const r={n,parent,media,photoLayer,bg,fg,image,urlImage,gradient,isControl,cls,original,input:n.matches('input:not([type=submit]):not([type=button]):not([type=checkbox]):not([type=radio]),textarea,select'),borders:['Top','Right','Bottom','Left'].map(k=>({width:parseFloat(cs['border'+k+'Width']),style:cs['border'+k+'Style'],color:rgba(cs['border'+k+'Color'])})),outline:rgba(cs.outlineColor),shadow:cs.boxShadow,decoration:cs.textDecorationLine,visible:cs.display!=='none'};
  // A photograph directly behind text is an authored contrast treatment. Preserve it, not all text adjacent to photos.
  r.photoSurface=urlImage||((gradient||n.matches('figure')||n.hasAttribute('data-source-target'))&&!!n.querySelector(':scope > img,:scope > picture,:scope > video,:scope > [class*="overlay"],:scope > [class*="shade"]'));
  map.set(n,r);
 }
 return [...map.values()];
}
function clear(r){for(const [k,[v,priority]] of Object.entries(r.original)){if(v)r.n.style.setProperty(k,v,priority);else r.n.style.removeProperty(k)}}
const put=(r,k,v)=>r.n.style.setProperty(k,v,'important');
const colorTokens=/rgba?\([^)]*\)|#[0-9a-f]{8}\b|#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi;
function tokenColor(v){if(/^#[0-9a-f]{3}$/i.test(v))v='#'+v.slice(1).split('').map(x=>x+x).join('');if(/^#[0-9a-f]{8}$/i.test(v)){const a=rgba(v.slice(0,7));return [...a.slice(0,3),parseInt(v.slice(7),16)/255]}return rgba(v)}
function tintGradient(str,p){return str.replace(colorTokens,t=>{const a=tokenColor(t);if(!a)return t;const c=rgba(surface(a,p));return 'rgba('+c.slice(0,3).join(',')+','+a[3]+')'})}
export function themeTree(root,p,{original=false}={}){
 if(!root)return {surfaces:0,text:0,media:0};
 let rows=records.get(root);if(!rows){rows=capture(root);records.set(root,rows)}
 for(const r of rows)clear(r);
 if(original){root.removeAttribute('data-brand-themed');return {surfaces:0,text:0,media:0}}
 const roles=paletteRoles(p),counts={surfaces:0,text:0,media:0};
 for(const r of rows){
  const {n,bg,fg,media,photoLayer,isControl,cls,gradient,urlImage,input}=r;
  const parentBg=r.parent?.effective||p.secondary;
  const photo=!!(r.parent?.photoContext||r.photoSurface);
  r.photoContext=photo;
  r.effective=parentBg;
  if(media){counts.media++;continue}
  const filled=bg&&bg[3]>.05,overlay=photoLayer&&photo||r.photoSurface;
  if(filled&&!overlay&&!urlImage){
   const footer=n.matches('footer');
   const c=surface(bg,p,{control:isControl,footer,canvas:n===root,input,parent:parentBg});const a=bg[3];
   put(r,'background-color',a<1?'rgba('+rgba(c).slice(0,3).join(',')+','+a+')':c);
   r.effective=a<1?mix(parentBg,c,a):c;counts.surfaces++;
   if(a>.95)r.photoContext=false;
  }
  if(gradient&&!overlay&&!r.photoContext&&/gradient\(/i.test(r.image)){put(r,'background-image',tintGradient(r.image,p));counts.surfaces++}
  if(fg&&fg[3]>.05&&(!r.photoContext||isControl&&filled&&!overlay)){
   const accent=n.matches('em,i,strong[data-accent]')||ACCENT.test(cls);
   put(r,'color',foreground(fg,r.effective,p,{accent,control:isControl&&filled}));counts.text++;
  }
  if(!r.photoContext){
   const sides=['top','right','bottom','left'];
   r.borders.forEach((b,i)=>{if(b.color&&b.color[3]>.05&&b.width>0&&b.style!=='none')put(r,'border-'+sides[i]+'-color',isControl||input?controlEdge(r.effective,parentBg,p):edge(b.color,r.effective,p,false))});
   if((isControl||input)&&filled&&contrast(r.effective,parentBg)<3)put(r,'box-shadow','inset 0 0 0 1px '+controlEdge(r.effective,parentBg,p));
   if(n.matches('input,textarea,select,button,a,summary'))put(r,'outline-color',readable(p.trim||p.primary,r.effective,3));
   if(n.matches('input,textarea,select')){put(r,'accent-color',readable(p.primary,r.effective,3));put(r,'caret-color',ink(r.effective))}
   if(r.decoration&&r.decoration!=='none')put(r,'text-decoration-color',readable(p.trim||p.primary,r.effective,3));
  }
 }
 root.dataset.brandThemed='true';root.dataset.brandPalette=[p.primary,p.secondary,p.trim||'none'].join('/');return counts
}
export function themePreviewDocument(doc,p,original=false){
 if(!doc?.body)return;const hosts=[...doc.querySelectorAll('[data-source-status=mounted]')];if(hosts.length){doc.body.style.background=original?'':p.secondary;for(const h of hosts){const body=h.shadowRoot?.querySelector('[data-source-body]');if(body)themeTree(body,p,{original});h.dataset.palettePrimary=p.primary;h.dataset.paletteSecondary=p.secondary;h.dataset.paletteTrim=p.trim||''}}else themeTree(doc.body,p,{original});
}
