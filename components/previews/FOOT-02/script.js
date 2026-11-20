/* The default phone footer shows all closed groups. M-CTA-04 keeps one compact disclosure open at a time. */
(()=>{
 const small=matchMedia('(max-width:680px)');
 const alternate=new URLSearchParams(location.search).get('mobile')==='M-CTA-04';
 if(alternate)document.body.dataset.mobileTreatment='M-CTA-04';
 const groups=[...document.querySelectorAll('.f2-group')];
 const align=()=>groups.forEach((group,index)=>{group.open=small.matches?(alternate&&index===0):true});
 groups.forEach((group,index)=>group.addEventListener('toggle',()=>{
   if(!alternate||!small.matches||!group.open)return;
   groups.forEach((other,otherIndex)=>{if(otherIndex!==index)other.open=false});
 }));
 align();small.addEventListener?.('change',align);
})();
