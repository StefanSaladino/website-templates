// Pricing is illustrative; native details controls remain usable without JavaScript.

/* M-COM-04: one clearly selected pricing tier on phones, full list remains on desktop. */
(()=>{
 if(new URLSearchParams(location.search).get('mobile')!=='M-COM-04')return;
 document.body.dataset.mobileTreatment='M-COM-04';
 const grid=document.querySelector('.price-grid'),cards=[...grid?.querySelectorAll('.price-card')||[]];
 if(!grid||cards.length!==3)return;
 const box=document.createElement('div');box.className='price-toggle';box.setAttribute('role','group');box.setAttribute('aria-label','Compare illustrated pricing tiers');
 const labels=['Foundation','Studio','Extended'],tabs=labels.map((label,i)=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.priceTab=String(i);button.setAttribute('aria-pressed','false');box.append(button);return button});
 const status=document.createElement('p');status.className='price-toggle-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 grid.before(box);box.after(status);
 const small=matchMedia('(max-width:850px)');let active=1;
 function render(){box.hidden=!small.matches;status.hidden=!small.matches;
 cards.forEach((card,i)=>{card.hidden=small.matches&&i!==active});tabs.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===active)));status.textContent='Viewing '+labels[active]+' · '+(active+1)+' of 3 sample plans'}
 tabs.forEach((b,i)=>b.addEventListener('click',()=>{active=i;render()}));
 small.addEventListener('change',render);render();
})();

