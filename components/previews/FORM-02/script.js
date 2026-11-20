const form=document.querySelector('#f2-form'),out=document.querySelector('#f2-output'),row=document.querySelector('#f2-output-label'),copy=document.querySelector('#f2-copy'),status=document.querySelector('#f2-message');form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const v=new FormData(form);out.value=['DEMO ENQUIRY — NOT SENT','Project: '+v.get('type'),'Name: '+v.get('name'),'Email: '+v.get('email'),'Timeline: '+v.get('timeline'),'Details: '+v.get('details')].join('\n');row.hidden=false;copy.hidden=false;status.textContent='Your local summary is ready below. Nothing was submitted.';});copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(out.value);status.textContent='Summary copied. Nothing was submitted.';}catch{out.focus();out.select();status.textContent='Select the summary above to copy it. Nothing was submitted.';}});


/* M-FRM-02: progressive two-step phone form. Desktop and no-script layout stays intact. */
(()=>{
 if(new URLSearchParams(location.search).get('mobile')!=='M-FRM-02')return;
 document.body.dataset.mobileTreatment='M-FRM-02';
 const form=document.querySelector('#f2-form');
 const label=name=>form.querySelector('[name="'+name+'"]')?.closest('label');
 const type=label('type'),name=label('name'),email=label('email'),timeline=label('timeline'),details=label('details');
 if(![type,name,email,timeline,details].every(Boolean))return;
 const a=document.createElement('fieldset'),b=document.createElement('fieldset');a.className='f2-mobile-step';b.className='f2-mobile-step';
 const la=document.createElement('legend'),lb=document.createElement('legend');la.textContent='Step 1 / Your project';lb.textContent='Step 2 / Your contact';a.append(la);b.append(lb);
 form.insertBefore(a,type);[type,timeline,details].forEach(el=>a.append(el));[name,email].forEach(el=>b.append(el));
 const submit=form.querySelector('button[type="submit"]');form.insertBefore(b,submit);
 const next=document.createElement('button'),back=document.createElement('button');next.type='button';next.dataset.f2Next='';next.textContent='Next: your contact';back.type='button';back.dataset.f2Back='';back.textContent='Back to project';a.append(next);b.append(back);
 const progress=document.createElement('p');progress.className='f2-step-progress';progress.dataset.f2StepStatus='';progress.setAttribute('role','status');progress.setAttribute('aria-live','polite');form.insertBefore(progress,a);
 let current=1;const small=matchMedia('(max-width:520px)');
 function render(){const stepping=small.matches;progress.hidden=!stepping;a.hidden=stepping&&current!==1;b.hidden=stepping&&current!==2;submit.hidden=stepping&&current!==2;next.hidden=!stepping;back.hidden=!stepping;progress.textContent=stepping?('Step '+current+' of 2 · '+(current===1?'Project details':'Contact details')):''}
 next.addEventListener('click',()=>{for(const field of [type,timeline,details].flatMap(x=>[...x.querySelectorAll('input,select,textarea')])){if(!field.checkValidity()){field.reportValidity();field.focus();return}}current=2;render();name.querySelector('input')?.focus()});
 back.addEventListener('click',()=>{current=1;render();type.querySelector('select')?.focus()});
 small.addEventListener('change',()=>{if(!small.matches)current=1;render()});render();
})();

