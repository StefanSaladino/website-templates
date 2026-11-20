(()=>{
 const form=document.querySelector('#book-form'),confirmation=document.querySelector('#book-confirmation'),message=confirmation.querySelector('[data-book-details]'),edit=confirmation.querySelector('[data-book-edit]'),date=form.elements.date;const pad=n=>String(n).padStart(2,'0');
 function today(){const now=new Date();return [now.getFullYear(),pad(now.getMonth()+1),pad(now.getDate())].join('-')}
 date.min=today();
 form.addEventListener('submit',event=>{event.preventDefault();date.min=today();if(!form.reportValidity())return;const data=new FormData(form);if(String(data.get('date'))<date.min){date.setCustomValidity('Choose today or a later day.');date.reportValidity();date.setCustomValidity('');return}
 message.textContent='Preferred '+data.get('service')+' on '+data.get('date')+' in the '+data.get('window').toLowerCase()+'. This example request is NOT submitted or booked.';confirmation.hidden=false;confirmation.focus({preventScroll:true})});
 edit.addEventListener('click',()=>{confirmation.hidden=true;form.elements.service.focus()});
})();

/* M-FRM-03: useful bottom inquiry shortcut, never a live reservation button. */
(()=>{
 if(new URLSearchParams(location.search).get('mobile')!=='M-FRM-03')return;
 document.body.dataset.mobileTreatment='M-FRM-03';
 const form=document.querySelector('#book-form'),submit=form?.querySelector('.book-submit'),confirmation=document.querySelector('#book-confirmation');
 if(!submit||!confirmation)return;
 const dock=document.createElement('div');dock.className='book-sticky-action';dock.hidden=true;
 const button=document.createElement('button');button.type='button';button.textContent='Review appointment preference';dock.append(button);
 const hint=document.createElement('span');hint.textContent='LOCAL DEMO · NO BOOKING';dock.append(hint);document.body.append(dock);
 const small=matchMedia('(max-width:760px)');let sourceVisible=false;
 function sync(){dock.hidden=!small.matches||sourceVisible||!confirmation.hidden}
 const observer=new IntersectionObserver(entries=>{sourceVisible=entries[0]?.isIntersecting||false;sync()},{threshold:0.12});observer.observe(submit);
 button.addEventListener('click',()=>{if(!form.checkValidity()){form.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'center'});form.reportValidity();return}form.requestSubmit();sync()});
 submit.addEventListener('click',()=>requestAnimationFrame(sync));confirmation.querySelector('[data-book-edit]').addEventListener('click',()=>requestAnimationFrame(sync));
 small.addEventListener('change',sync);sync();
})();

