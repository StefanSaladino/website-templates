// PROC-01 uses native details/summary disclosures. No JavaScript is needed.


/* M-STORY-03: accessible vertical story timeline plus sticky section index. */
(()=>{
 if(new URLSearchParams(location.search).get('mobile')!=='M-STORY-03')return;
 document.body.dataset.mobileTreatment='M-STORY-03';
 const section=document.querySelector('#process-showcase'),track=section?.querySelector('.p1-track'),steps=[...track?.querySelectorAll('.p1-step')||[]];
 if(!section||steps.length!==4)return;
 const nav=document.createElement('nav');nav.className='p1-phone-index';nav.setAttribute('aria-label','Project process stages');
 const names=['Discover','Define','Build','Settle in'];
 const buttons=steps.map((step,i)=>{step.id='mobile-stage-'+(i+1);const b=document.createElement('button');b.type='button';b.dataset.mobileStage=String(i);b.textContent=String(i+1).padStart(2,'0')+' '+names[i];nav.append(b);return b});
 track.before(nav);
 const media=matchMedia('(max-width:760px)'),reduce=matchMedia('(prefers-reduced-motion:reduce)');let active=0,frame=0,navUntil=0;
 function selected(i){active=i;buttons.forEach((b,n)=>{if(n===active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')})}
 function sync(){frame=0;nav.hidden=!media.matches;if(!media.matches)return;if(performance.now()<navUntil)return;
 let idx=0;steps.forEach((step,i)=>{if(step.getBoundingClientRect().top<=Math.min(innerHeight*.55,330))idx=i});selected(idx)}
 function queue(){if(!frame)frame=requestAnimationFrame(sync)}
 buttons.forEach((button,i)=>button.addEventListener('click',()=>{if(!media.matches)return;selected(i);navUntil=performance.now()+(reduce.matches?0:1000);
 const y=steps[i].getBoundingClientRect().top+scrollY-86;scrollTo({top:y,behavior:reduce.matches?'instant':'smooth'});setTimeout(sync,1050)}));
 addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);media.addEventListener('change',queue);selected(0);sync();
})();

