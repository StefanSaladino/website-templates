const controls=[...document.querySelectorAll('[data-filter]')];const photos=[...document.querySelectorAll('[data-category]')];controls.forEach(button=>button.addEventListener('click',()=>{const selected=button.dataset.filter;controls.forEach(x=>x.setAttribute('aria-pressed',String(x===button)));photos.forEach(x=>x.hidden=selected!=='all'&&x.dataset.category!==selected);}));
/* M-UTIL-04: accessible native filter drawer with original filter behaviour intact. */
(()=>{
 if(new URLSearchParams(location.search).get('mobile')!=='M-UTIL-04')return;
 document.body.dataset.mobileTreatment='M-UTIL-04';
 const intro=document.querySelector('.g5-intro'),filters=document.querySelector('.g5-filters'),grid=document.querySelector('.g5-grid');
 if(!intro||!filters||!grid)return;
 const opener=document.createElement('button');opener.type='button';opener.className='g5-filter-open';opener.textContent='Filter portraits · All images';
 const state=document.createElement('p');state.className='g5-filter-count';state.setAttribute('aria-live','polite');state.setAttribute('role','status');
 filters.before(opener,state);
 const dialog=document.createElement('dialog');dialog.className='g5-filter-drawer';dialog.setAttribute('aria-label','Portrait filters');
 const header=document.createElement('div');header.className='g5-drawer-header';const heading=document.createElement('strong');heading.textContent='Select a collection';
 const close=document.createElement('button');close.type='button';close.textContent='Close filters';header.append(heading,close);dialog.append(header);document.body.append(dialog);
 const small=matchMedia('(max-width:760px)');
 const names={all:'All images',colour:'Colour',mono:'Monochrome'};
 function current(){return filters.querySelector('[aria-pressed=true]')?.dataset.filter||'all'}
 function update(){const choice=current(),shown=[...grid.querySelectorAll('[data-category]')].filter(x=>!x.hidden).length;
 opener.textContent='Filter portraits · '+names[choice];state.textContent=shown+' '+(shown===1?'photograph':'photographs')+' shown'}
 function closeDrawer(){if(dialog.open)dialog.close();}
 function sync(){if(small.matches){dialog.append(filters);opener.hidden=false;state.hidden=false}
 else{opener.before(filters);opener.hidden=true;state.hidden=true;closeDrawer()}update()}
 opener.addEventListener('click',()=>{if(!small.matches)return;dialog.showModal();close.focus()});
 close.addEventListener('click',closeDrawer);
 filters.querySelectorAll('button[data-filter]').forEach(b=>b.addEventListener('click',()=>{update();closeDrawer();opener.focus()}));
 dialog.addEventListener('click',e=>{if(e.target===dialog)closeDrawer()});
 small.addEventListener('change',sync);sync();
})();


/* M-UTIL-01 keeps the real filter controls in a native scroll-snap rail rather than a modal. */
if(new URLSearchParams(location.search).get('mobile')==='M-UTIL-01')document.body.dataset.mobileTreatment='M-UTIL-01';
