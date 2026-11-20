// Native details provides a mobile menu without a JavaScript dependency.

/* M-NAV-05: real horizontal location tabs, no scripted page hijacking. */
(()=>{
 if(new URLSearchParams(location.search).get('mobile')!=='M-NAV-05')return;
 document.body.dataset.mobileTreatment='M-NAV-05';
 const header=document.querySelector('#nav-showcase'),main=document.querySelector('#collection');
 if(!header||!main)return;
 const nav=document.createElement('nav');nav.className='v-anchor-rail';nav.setAttribute('aria-label','Quick section navigation');
 const items=[['collection','Collection'],['story','Journal'],['contact','Contact']];
 const links=items.map(([id,title])=>{const a=document.createElement('a');a.href='#'+id;a.textContent=title;a.dataset.anchorTab=id;nav.append(a);return a});
 header.insertAdjacentElement('afterend',nav);
 const media=matchMedia('(max-width:760px)');let frame=null;
 function sync(){frame=null;let current='collection';for(const [id] of items){const target=document.getElementById(id);if(target&&target.getBoundingClientRect().top<145)current=id}
   links.forEach(a=>{if(a.dataset.anchorTab===current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
 }
 function schedule(){if(frame===null)frame=requestAnimationFrame(sync)}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
 links.forEach(a=>a.addEventListener('click',()=>{links.forEach(x=>x.removeAttribute('aria-current'));a.setAttribute('aria-current','location')}));
 media.addEventListener('change',schedule);sync();
})();


/* M-NAV-03: accessible bottom destinations on the actual three-section sample. */
(()=>{
 if(new URLSearchParams(location.search).get('mobile')!=='M-NAV-03')return;
 document.body.dataset.mobileTreatment='M-NAV-03';
 const rail=document.createElement('nav');rail.className='v-bottom-rail';rail.setAttribute('aria-label','Primary phone sections');
 const items=[['collection','Collection'],['story','Journal'],['contact','Contact']];
 const anchors=items.map(([id,label])=>{const link=document.createElement('a');link.href='#'+id;link.textContent=label;link.dataset.bottomTarget=id;rail.append(link);return link;});
 document.body.append(rail);
 const small=matchMedia('(max-width:760px)');
 let queued=false;
 function sync(){queued=false;let current='collection';
  if(small.matches){for(const [id] of items){const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<innerHeight*.55)current=id}}
  rail.hidden=!small.matches;anchors.forEach(link=>{if(small.matches&&link.dataset.bottomTarget===current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});}
 const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(sync)}};
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
 small.addEventListener('change',schedule);sync();
})();
