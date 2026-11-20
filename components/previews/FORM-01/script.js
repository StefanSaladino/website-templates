const form=document.querySelector('#f1-form'),panel=document.querySelector('#f1-preview'),output=document.querySelector('#f1-output'),copy=document.querySelector('#f1-copy'),status=document.querySelector('#f1-copy-status');const ids=['name','email','message'];
const validate=(input)=>{const value=input.value.trim();let error='';if(!value)error='This field is required.';else if(input.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))error='Enter a valid email address.';input.setAttribute('aria-invalid',String(!!error));input.setAttribute('aria-describedby',error?'f1-'+input.name+'-error':'');document.getElementById('f1-'+input.name+'-error').textContent=error;return !error;};
form.addEventListener('submit',event=>{event.preventDefault();let ok=true,first=null;for(const id of ids){const input=document.getElementById('f1-'+id);if(!validate(input)){if(!first)first=input;ok=false;}}if(!ok){panel.hidden=true;first?.focus();return;}const data=new FormData(form);output.textContent='Name: '+data.get('name').trim()+'\nEmail: '+data.get('email').trim()+'\n\nMessage:\n'+data.get('message').trim();panel.hidden=false;status.textContent='';panel.focus();});
ids.forEach(id=>{const i=document.getElementById('f1-'+id);i.addEventListener('input',()=>{if(i.getAttribute('aria-invalid')==='true')validate(i)});});
copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(output.textContent);status.textContent='Inquiry text copied.';}catch{status.textContent='Could not copy automatically. Please select the text above to copy it.';}});

/* M-FRM-04: optional, native date + time preference. This is not an appointment booking. */
(()=>{
 if(new URLSearchParams(location.search).get('mobile')!=='M-FRM-04')return;
 document.body.dataset.mobileTreatment='M-FRM-04';
 const form=document.querySelector('#f1-form'),action=form?.querySelector('.f1-action');
 if(!form||!action)return;
 const fieldset=document.createElement('fieldset');fieldset.className='f1-schedule';
 const legend=document.createElement('legend');legend.textContent='Preferred time to talk (optional)';fieldset.append(legend);
 const desc=document.createElement('p');desc.textContent='Choose a date and time for a possible follow-up. This example does not reserve an appointment.';fieldset.append(desc);
 const fields=document.createElement('div');fields.className='f1-schedule-fields';
 const dateLabel=document.createElement('label');dateLabel.textContent='Preferred date';
 const date=document.createElement('input');date.type='date';date.name='preferred-date';date.id='f1-date';dateLabel.htmlFor=date.id;dateLabel.append(date);
 const timeLabel=document.createElement('label');timeLabel.textContent='Preferred time';
 const time=document.createElement('input');time.type='time';time.name='preferred-time';time.id='f1-time';timeLabel.htmlFor=time.id;timeLabel.append(time);fields.append(dateLabel,timeLabel);fieldset.append(fields);
 const error=document.createElement('p');error.className='f1-schedule-error';error.id='f1-schedule-error';error.setAttribute('role','alert');fieldset.append(error);form.insertBefore(fieldset,action);
 const small=matchMedia('(max-width:650px)');function sync(){fieldset.hidden=!small.matches;error.textContent='';}
 const now=new Date(),pad=n=>String(n).padStart(2,'0');date.min=[now.getFullYear(),pad(now.getMonth()+1),pad(now.getDate())].join('-');
 function validate(){if(fieldset.hidden)return true;error.textContent='';if((date.value&&!time.value)||(!date.value&&time.value)){error.textContent='Choose both a date and a time, or leave both blank.';(date.value?time:date).focus();return false}
 if(date.value&&date.value<date.min){error.textContent='Choose today or a later date.';date.focus();return false}return true}
 form.addEventListener('submit',e=>{if(!validate()){e.preventDefault();e.stopImmediatePropagation()}},true);
 // Preserve existing form validation and summary; append optional preference only after a valid local draft.
 form.addEventListener('submit',()=>{if(fieldset.hidden||!date.value||!time.value)return;const output=document.querySelector('#f1-output'),panel=document.querySelector('#f1-preview');if(panel&&!panel.hidden&&output)output.textContent+='\n\nPreferred contact time (not booked): '+date.value+' at '+time.value});
 small.addEventListener('change',sync);sync();
})();

