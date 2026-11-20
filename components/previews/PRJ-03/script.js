// The index uses regular links for keyboard and touch accessibility.

/* M-UTIL-05 is a contextual real anchor, suppressed at the start of the index and on wide screens. */
(()=>{
 if(new URLSearchParams(location.search).get('mobile')!=='M-UTIL-05')return;
 document.body.dataset.mobileTreatment='M-UTIL-05';
 const link=document.createElement('a');link.href='#projects-showcase';link.className='p3-back-top';link.textContent='Back to projects';link.hidden=true;
 link.setAttribute('aria-label','Return to the beginning of the project index');
 document.body.append(link);
 const small=matchMedia('(max-width:700px)');
 const sync=()=>{link.hidden=!(small.matches&&scrollY>400)};
 addEventListener('scroll',sync,{passive:true});small.addEventListener('change',sync);sync();
})();
