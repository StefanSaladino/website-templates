(()=>{
 const form=document.querySelector('#book-form'),confirmation=document.querySelector('#book-confirmation'),message=confirmation.querySelector('[data-book-details]'),edit=confirmation.querySelector('[data-book-edit]'),date=form.elements.date;const pad=n=>String(n).padStart(2,'0');
 function today(){const now=new Date();return [now.getFullYear(),pad(now.getMonth()+1),pad(now.getDate())].join('-')}
 date.min=today();
 form.addEventListener('submit',event=>{event.preventDefault();date.min=today();if(!form.reportValidity())return;const data=new FormData(form);if(String(data.get('date'))<date.min){date.setCustomValidity('Choose today or a later day.');date.reportValidity();date.setCustomValidity('');return}
 message.textContent='Preferred '+data.get('service')+' on '+data.get('date')+' in the '+data.get('window').toLowerCase()+'. This example request is NOT submitted or booked.';confirmation.hidden=false;confirmation.focus({preventScroll:true})});
 edit.addEventListener('click',()=>{confirmation.hidden=true;form.elements.service.focus()});
})();