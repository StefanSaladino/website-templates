// Native interaction only.


/* M-CTA-01: safe-area sticky mobile enquiry shortcut, progressively enhanced. */
(()=>{
 if(new URLSearchParams(location.search).get('mobile')!=='M-CTA-01')return;
 document.body.dataset.mobileTreatment='M-CTA-01';
 const main=document.querySelector('.c1-action');if(!main)return;
 const dock=document.createElement('div');dock.className='c1-mobile-dock';dock.hidden=true;
 const link=document.createElement('a');link.href=main.getAttribute('href');link.textContent='Explore enquiry form';link.setAttribute('aria-label','Explore a demonstration enquiry form');dock.append(link);document.body.append(dock);
 let inView=false;const mq=matchMedia('(max-width:760px)');
 function render(){dock.hidden=!mq.matches||inView}
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{inView=entries[0]?.isIntersecting||false;render()},{threshold:0.12});observer.observe(main)}else{inView=false}
 mq.addEventListener('change',render);render();
})();

