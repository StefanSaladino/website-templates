const slides=[...document.querySelectorAll('[data-slide]')],captions=['01 / Open shelving and natural finishes','02 / Stone surfaces and an open plan','03 / Timber grain and quiet detail'];let active=0;function display(i){active=(i+slides.length)%slides.length;slides.forEach((node,k)=>node.hidden=k!==active);document.querySelector('#h5-count').textContent=String(active+1).padStart(2,'0')+' / 03';document.querySelector('#h5-caption').textContent=captions[active];}document.querySelector('#h5-prev').addEventListener('click',()=>display(active-1));document.querySelector('#h5-next').addEventListener('click',()=>display(active+1));
/* M-HERO-05: touch selection plus the original working prev/next controls. */
(()=>{
 if(new URLSearchParams(location.search).get('mobile')!=='M-HERO-05')return;
 document.body.dataset.mobileTreatment='M-HERO-05';
 const visual=document.querySelector('.h5-visual'),previous=document.querySelector('#h5-prev'),next=document.querySelector('#h5-next');
 const dots=document.createElement('div');dots.className='h5-mobile-dots';dots.setAttribute('role','group');dots.setAttribute('aria-label','Choose a photo study');
 const slides=[...document.querySelectorAll('.h5-slide')];
 for(let i=0;i<slides.length;i++){const button=document.createElement('button');button.type='button';button.textContent=String(i+1);button.setAttribute('aria-label','Show image '+(i+1));button.dataset.heroDot=String(i);button.addEventListener('click',()=>{const active=slides.findIndex(x=>!x.hidden);const steps=(i-active+slides.length)%slides.length;for(let j=0;j<steps;j++)next.click();update()});dots.append(button)}
 visual.after(dots);
 const mobile=matchMedia('(max-width:760px)');
 function update(){dots.hidden=!mobile.matches;const index=slides.findIndex(x=>!x.hidden);[...dots.children].forEach((button,i)=>button.setAttribute('aria-pressed',String(index===i)))}
 previous.addEventListener('click',update);next.addEventListener('click',update);
 let start=null;
 visual.addEventListener('touchstart',e=>{if(!mobile.matches||e.touches.length!==1)return;start={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});
 visual.addEventListener('touchend',e=>{if(!start||e.changedTouches.length!==1)return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;start=null;if(Math.abs(dx)<55||Math.abs(dx)<Math.abs(dy)*1.4)return;(dx<0?next:previous).click()},{passive:true});
 visual.addEventListener('touchcancel',()=>{start=null},{passive:true});
 mobile.addEventListener('change',update);update();
})();

