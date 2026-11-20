


/* Phase 2 preview-mode selection */
(() => {
 const option = new URLSearchParams(location.search).get('mobile');
 if (['M-SRV-03','M-SRV-01'].includes(option)) document.body.dataset.mobileTreatment = option;
})();


/* Phase 2 preview-mode selection */
document.querySelectorAll('img').forEach(image=>{
 image.addEventListener('error',()=>{
   image.classList.add('pending-image');
   image.setAttribute('alt','');
   const wrapper=image.closest('.n3-scene,.h1-scene,.g2-photo,.s3-media,.c2-scene');
   if(wrapper)wrapper.classList.add('image-pending');
 },{once:true});
});
