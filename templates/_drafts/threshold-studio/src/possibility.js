// Truthful local-only contact concept; no network request or personal data.
export function mountPossibility(section){
 const cta=section.querySelector('.possibility-cta'),contact=section.querySelector('.possibility-contact');
 const create=section.querySelector('[data-possibility-create]'),back=section.querySelector('[data-possibility-return]'),out=section.querySelector('output');
 let enabled=false,previous='';
 function open(){section.dataset.contact='on';section.setAttribute('aria-labelledby','possibility-contact-heading');contact.hidden=false;cta.setAttribute('aria-expanded','true');contact.querySelector('input:checked').focus({preventScroll:true})}
 function close(restoreFocus=true){delete section.dataset.contact;section.setAttribute('aria-labelledby','possibility-heading');contact.hidden=true;cta.setAttribute('aria-expanded','false');if(restoreFocus)cta.focus({preventScroll:true})}
 function changed(){out.value='';delete section.dataset.prepared}
 function returnToClosing(){close()}
 function prepare(){out.value='Local brief: '+contact.querySelector('input:checked').value+'. Nothing has been submitted.';section.dataset.prepared='true'}
 function key(e){if(e.key==='Escape'&&!contact.hidden){e.preventDefault();close()}}
 cta.addEventListener('click',open);back.addEventListener('click',returnToClosing);create.addEventListener('click',prepare);contact.addEventListener('change',changed);section.addEventListener('keydown',key);
 return {enable(on){enabled=on},show(amount,staticMode=false){
   const next=enabled&&(staticMode||amount>0),active=enabled&&(staticMode||amount>=1);
   const opacity=String(staticMode?1:amount),state=[next,active,opacity].join('|');
   if(state===previous)return;
   if(!active&&section.contains(document.activeElement))document.querySelector('.masthead .wordmark').focus({preventScroll:true});
   if(!active&&!contact.hidden)close(false);
   section.hidden=!next;section.inert=!active;section.style.setProperty('--possibility-opacity',opacity);previous=state;
 },dispose(){cta.removeEventListener('click',open);back.removeEventListener('click',returnToClosing);create.removeEventListener('click',prepare);contact.removeEventListener('change',changed);section.removeEventListener('keydown',key)}};
}
