// TEST-01 contains explicitly fictional testimonial copy. No stars, reviews, rotating carousel, or fabricated customer identities are presented as real.


/* M-STORY-02: reader-controlled mobile quote focus. All additional voices are explicitly fictional samples. */
(()=>{
 if(new URLSearchParams(location.search).get('mobile')!=='M-STORY-02')return;
 document.body.dataset.mobileTreatment='M-STORY-02';
 const section=document.querySelector('#testimonial-showcase'),body=section?.querySelector('.t1-body'),heading=body?.querySelector('h2'),copy=body?.querySelector('blockquote p'),credit=section?.querySelector('.t1-credit strong'),count=section?.querySelector('.t1-dots');
 if(!section||!heading||!copy||!count)return;
 const original={heading:heading.innerHTML,copy:copy.textContent,credit:credit.textContent};
 const samples=[
 {title:'The house finally works for the way we live.',body:original.copy,person:'Sample homeowner'},
 {title:'Every corner has a reason to be there.',body:'This is an explicitly invented demonstration quote illustrating how a short project reflection might read.',person:'Fictional resident'},
 {title:'The small choices changed the whole room.',body:'This is sample copy only, not feedback from a real customer or a verified construction project.',person:'Imagined homeowner'}
 ];
 const controls=document.createElement('div');controls.className='t1-mobile-controls';
 const previous=document.createElement('button');previous.type='button';previous.textContent='Previous sample';previous.dataset.storyPrevious='';
 const next=document.createElement('button');next.type='button';next.textContent='Next sample';next.dataset.storyNext='';
 const status=document.createElement('span');status.dataset.storyStatus='';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 controls.append(previous,status,next);section.querySelector('.t1-credit').before(controls);
 let index=0,begin=null;const small=matchMedia('(max-width:620px)');
 function render(){if(!small.matches){index=0;heading.innerHTML=original.heading;copy.textContent=original.copy;credit.textContent=original.credit;count.textContent='01 / 01';controls.hidden=true;return}
 const item=samples[index];heading.innerHTML=index===0?original.heading:'';if(index!==0)heading.textContent=item.title;
 copy.textContent=item.body;credit.textContent=item.person;count.textContent=String(index+1).padStart(2,'0')+' / 03';
 status.textContent='Fictional example '+(index+1)+' of 3';controls.hidden=false;previous.disabled=index===0;next.disabled=index===samples.length-1;
 }
 const go=i=>{index=Math.max(0,Math.min(samples.length-1,i));render()};
 previous.addEventListener('click',()=>go(index-1));next.addEventListener('click',()=>go(index+1));
 body.addEventListener('touchstart',e=>{if(!small.matches||e.touches.length!==1)return;begin={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});
 body.addEventListener('touchend',e=>{if(!begin||e.changedTouches.length!==1)return;const dx=e.changedTouches[0].clientX-begin.x,dy=e.changedTouches[0].clientY-begin.y;begin=null;
 if(Math.abs(dx)>=60&&Math.abs(dx)>Math.abs(dy)*1.5)go(index+(dx<0?1:-1))
 },{passive:true});
 body.addEventListener('touchcancel',()=>{begin=null},{passive:true});
 small.addEventListener('change',render);render();
})();

