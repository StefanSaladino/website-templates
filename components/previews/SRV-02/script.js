// This preview works entirely through native semantic HTML.


/* M-SRV-02: mobile category switcher with all tiles readable without JS. */
(()=>{
 if(new URLSearchParams(location.search).get('mobile')!=='M-SRV-02')return;
 document.body.dataset.mobileTreatment='M-SRV-02';
 const stage=document.querySelector('.sv2-scene'),grid=stage?.querySelector('.sv2-grid'),cards=[...grid?.querySelectorAll('article')||[]];
 if(!grid||cards.length!==3)return;
 const bar=document.createElement('div');bar.className='sv2-switcher';
 const controls=document.createElement('div');controls.className='sv2-switcher-buttons';controls.setAttribute('role','group');controls.setAttribute('aria-label','Choose a landscaping service');
 const message=document.createElement('p');message.className='sv2-switcher-status';message.setAttribute('role','status');message.setAttribute('aria-live','polite');
 const names=['Stonework','Planting','Lighting'];let selected=0;
 function show(i){selected=i;cards.forEach((el,n)=>{el.hidden=n!==i});[...controls.children].forEach((btn,n)=>btn.setAttribute('aria-pressed',String(i===n)));message.textContent='Showing '+names[i]+' · '+(i+1)+' of 3';}
 names.forEach((name,i)=>{const b=document.createElement('button');b.type='button';b.textContent=name;b.setAttribute('aria-pressed',String(i===selected));b.addEventListener('click',()=>show(i));controls.append(b)});
 bar.append(controls,message);stage.insertBefore(bar,grid);
 const mq=matchMedia('(max-width: 850px)');
 function sync(){const mobile=mq.matches;bar.hidden=!mobile;cards.forEach((c,i)=>c.hidden=mobile&&i!==selected);if(mobile)show(selected);else message.textContent='All services visible'}
 mq.addEventListener('change',sync);sync();
})();

