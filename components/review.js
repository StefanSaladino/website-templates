const [items,mobile] = await Promise.all([
 fetch('./data/components.json').then(r=>{if(!r.ok)throw Error('Component records unavailable');return r.json()}),
 fetch('./data/mobile-treatments.json').then(r=>{if(!r.ok)throw Error('Mobile records unavailable');return r.json()})
]);
const mobileById=new Map(mobile.map(x=>[x.id,x]));
const entries=Object.fromEntries(items.filter(x=>x.status!=='draft').map(x=>{
 const alternative=(x.mobileTreatmentIds||[]).find(id=>mobileById.has(id)&&mobileById.get(id).status!=='draft')||null;
 return [x.id,{name:x.title,alternative,label:alternative?mobileById.get(alternative).title:''}];
}));
const params=new URLSearchParams(location.search),requested=params.get('id')||'NAV-03',id=Object.hasOwn(entries,requested)?requested:Object.keys(entries)[0],spec=entries[id];
const iframe=document.querySelector('#review-iframe'),frame=document.querySelector('#review-frame'),open=document.querySelector('#review-open'),alternate=document.querySelector('#review-alt-choice');
document.querySelector('#review-title').textContent=id+' / '+spec.name;
document.querySelector('#review-meta').textContent='In-review specimen · stock assets and device QA incomplete';
if(spec.alternative){alternate.hidden=false;document.querySelector('#review-alt-name').textContent=spec.alternative+' · '+spec.label;}
const render=()=>{
const device=document.querySelector('input[name=device]:checked').value;
let mobile=document.querySelector('input[name=mobile]:checked').value;
if(device!=='phone')mobile='default';
frame.dataset.device=device;
const url='./previews/'+id+'/index.html'+(mobile==='alternate'&&spec.alternative?'?mobile='+encodeURIComponent(spec.alternative):'');
if(iframe.getAttribute('src')!==url)iframe.src=url;
open.href=url;
document.querySelector('#review-mobile-choices').hidden=device!=='phone';
};
document.querySelectorAll('input[name=device],input[name=mobile]').forEach(el=>el.addEventListener('change',render));
render();
// Small internal shortlist proof. Never equate an in-review reference with an approved selection.
const shortKey='boomer-showroom-dev-shortlist-v1';
let saved=[];
try{const raw=JSON.parse(localStorage.getItem(shortKey)||'[]');if(Array.isArray(raw))saved=raw.filter(x=>x&&Object.hasOwn(entries,x.id)).slice(0,40)}catch(error){saved=[]}
const store=()=>{try{localStorage.setItem(shortKey,JSON.stringify(saved))}catch(error){document.querySelector('#review-save-status').textContent='Saved for this session only.'}};
const list=document.querySelector('#review-saved-items'),save=document.querySelector('#review-save'),copy=document.querySelector('#review-copy'),feedback=document.querySelector('#review-save-status');
const renderList=()=>{
 list.replaceChildren();
 if(!saved.length){const li=document.createElement('li');li.textContent='No examples saved yet.';list.append(li)}
 else for(const item of saved){
  const li=document.createElement('li'),label=document.createElement('span'),remove=document.createElement('button');
  label.textContent=item.id+(item.mobile?' · Mobile '+item.mobile:' · Default mobile');
  remove.type='button';remove.textContent='Remove';remove.setAttribute('aria-label','Remove '+item.id+' from shortlist');
  remove.addEventListener('click',()=>{saved=saved.filter(x=>x.id!==item.id);store();renderList();feedback.textContent='Removed '+item.id;});
  li.append(label,remove);list.append(li);
 }
 const current=saved.find(x=>x.id===id);save.textContent=current?'Update saved example':'Save this example';
 copy.disabled=!saved.length;
};
save.addEventListener('click',()=>{
 const alt=document.querySelector('input[name=mobile]:checked').value==='alternate'&&document.querySelector('input[name=device]:checked').value==='phone';
 const mobile=alt&&spec.alternative?spec.alternative:null;
 saved=saved.filter(x=>x.id!==id);saved.push({id,mobile});store();renderList();feedback.textContent='Saved '+id+(mobile?' with '+mobile:' with default mobile layout')+' (development reference).';
});
copy.addEventListener('click',async()=>{
 const message=saved.map(x=>x.id+(x.mobile?' [phone: '+x.mobile+']':'')).join(' + ');
 try{await navigator.clipboard.writeText(message);feedback.textContent='Reference IDs copied.'}
 catch(error){feedback.textContent='Copy unavailable here: '+message}
});
renderList();
