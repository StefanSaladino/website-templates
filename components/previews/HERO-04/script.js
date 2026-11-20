// Static editorial preview; no JavaScript behavior is necessary.

/* M-HERO-04: edit one existing image as an offset portrait crop, retaining real editorial copy. */
if(new URLSearchParams(location.search).get('mobile')==='M-HERO-04'){
 document.body.dataset.mobileTreatment='M-HERO-04';
 const portrait=document.querySelector('.h4-bottom figure');
 if(portrait){const caption=document.createElement('figcaption');caption.className='h4-mobile-caption';caption.textContent='01 / Editorial stock portrait · illustrative only';portrait.append(caption);}
}
