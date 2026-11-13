const menuTrigger=document.querySelector('.menu-trigger');
const mobileNav=document.querySelector('.mobile-nav');
const pageMain=document.querySelector('main');
const pageFooter=document.querySelector('footer');
const serviceChoice=document.querySelector('#service-choice');
const bookingForm=document.querySelector('#booking-form');
function closeMenu(restoreFocus=false){
  if(!mobileNav||!menuTrigger)return;
  const wasOpen=menuTrigger.getAttribute('aria-expanded')==='true';
  mobileNav.hidden=true;menuTrigger.setAttribute('aria-expanded','false');menuTrigger.setAttribute('aria-label','Open navigation');
  document.body.classList.remove('menu-open');if(pageMain)pageMain.inert=false;if(pageFooter)pageFooter.inert=false;
  if(restoreFocus&&wasOpen)menuTrigger.focus();
}
function openMenu(){
  if(!mobileNav||!menuTrigger)return;
  mobileNav.hidden=false;menuTrigger.setAttribute('aria-expanded','true');menuTrigger.setAttribute('aria-label','Close navigation');
  document.body.classList.add('menu-open');if(pageMain)pageMain.inert=true;if(pageFooter)pageFooter.inert=true;
  mobileNav.querySelector('a')?.focus();
}
menuTrigger?.addEventListener('click',()=>menuTrigger.getAttribute('aria-expanded')==='true'?closeMenu(true):openMenu());
mobileNav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>closeMenu(false)));
window.addEventListener('resize',()=>{if(window.innerWidth>980)closeMenu(false)});
window.addEventListener('keydown',event=>{
  if(menuTrigger?.getAttribute('aria-expanded')!=='true')return;
  if(event.key==='Escape'){event.preventDefault();closeMenu(true);return}
  if(event.key!=='Tab')return;
  const focusable=[menuTrigger,...mobileNav.querySelectorAll('a')];
  const index=focusable.indexOf(document.activeElement);
  if(event.shiftKey&&index<=0){event.preventDefault();focusable[focusable.length-1].focus()}
  else if(!event.shiftKey&&index===focusable.length-1){event.preventDefault();focusable[0].focus()}
});
document.querySelectorAll('[data-service]').forEach(link=>link.addEventListener('click',()=>{if(serviceChoice)serviceChoice.value=link.dataset.service}));
const preferredDate=document.querySelector('#preferred-date');
if(preferredDate)preferredDate.min=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
const DEMO_EMAIL='hello@example.com'; // Replace with real inbox. No request is transmitted by this demo.
const preview=document.querySelector('#email-preview');
const emailDraft=document.querySelector('#email-draft');
const emailLink=document.querySelector('#email-link');
const emailStatus=document.querySelector('#email-status');
bookingForm?.addEventListener('submit',event=>{
  event.preventDefault();
  if(!bookingForm.reportValidity())return;
  const fd=new FormData(bookingForm);
  const fields={name:String(fd.get('name')||'').trim(),email:String(fd.get('email')||'').trim(),vehicle:String(fd.get('vehicle')||'').trim(),service:String(fd.get('service')||'').trim(),date:String(fd.get('preferred_date')||'').trim(),notes:String(fd.get('notes')||'').trim()};
  const subject=`GARAGE detail enquiry — ${fields.service}`;
  const body=`Hello GARAGE,\n\nI'd like to enquire about a detail.\n\nName: ${fields.name}\nEmail: ${fields.email}\nVehicle: ${fields.vehicle}\nService: ${fields.service}\nPreferred date: ${fields.date}\nNotes: ${fields.notes||'None'}\n\nPlease let me know about availability.\n`;
  const url=`mailto:${DEMO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  if(emailLink)emailLink.href=url;
  if(emailDraft)emailDraft.value=`To: ${DEMO_EMAIL}\nSubject: ${subject}\n\n${body}`;
  if(emailStatus)emailStatus.textContent='Your request is ready to send. No booking has been made. Choose “Open email draft” or copy the details below.';
  if(preview){preview.hidden=false;preview.scrollIntoView({block:'nearest',behavior:'smooth'})}
});
document.querySelector('#copy-request')?.addEventListener('click',async event=>{
  if(!emailDraft)return;
  try{await navigator.clipboard.writeText(emailDraft.value);event.currentTarget.textContent='Copied'}
  catch(error){emailDraft.focus();emailDraft.select();event.currentTarget.textContent='Select and copy the text'}
});
// A failed external demo image should never leave an empty black rectangle.
document.querySelectorAll('main img').forEach(img=>{
  const failed=()=>img.parentElement?.classList.add('media-failed');
  img.addEventListener('error',failed,{once:true});if(img.complete&&img.naturalWidth===0)failed();
});
