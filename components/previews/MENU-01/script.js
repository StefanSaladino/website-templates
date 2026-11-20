// Native, accessible restaurant menu content; mobile enhancements are opt-in.

/* M-COM-03: compact restaurant categories with native disclosure and desktop restoration. */
(()=>{
 if(new URLSearchParams(location.search).get('mobile')!=='M-COM-03')return;
 document.body.dataset.mobileTreatment='M-COM-03';
 const categories=[...document.querySelectorAll('.menu-category')];
 if(categories.length<2)return;
 const native=categories.map((category,i)=>{const body=category.querySelector('.menu-dishes');const details=document.createElement('details');details.className='menu-mobile-details';
 const summary=document.createElement('summary');summary.textContent='View '+category.querySelector('h3').textContent+' · '+body.querySelectorAll('article').length+' dishes';
 details.append(summary);body.before(details);details.append(body);
 return details});
 const media=matchMedia('(max-width:820px)');
 function sync(){if(media.matches){native.forEach((detail,i)=>{detail.name='table17-menu';detail.open=i===0})}
 else{native.forEach(detail=>{detail.removeAttribute('name');detail.open=true})}}
 media.addEventListener('change',sync);sync();
})();

