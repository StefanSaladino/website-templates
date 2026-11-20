(()=>{
 const cards=[...document.querySelectorAll('.p1-item')],panel=document.querySelector('#p1-detail'),detail={name:panel.querySelector('[data-detail-name]'),material:panel.querySelector('[data-detail-material]'),description:panel.querySelector('[data-detail-description]')};
 const data=[{"id":"sand","name":"Sandstone Vessel","material":"Stoneware · matte glaze","desc":"Earth-coloured glaze over a subtly irregular silhouette."},{"id":"oxide","name":"Oxide Pitcher","material":"Stoneware · oxide slip","desc":"A considered everyday pitcher, expressed as a sculptural study."},{"id":"chalk","name":"Chalk Bowl","material":"Porcelain · satin surface","desc":"Simple round form inspired by soft-edged river stones."},{"id":"umber","name":"Umber Jar","material":"Stoneware · brown glaze","desc":"A lidded study in rich, warm brown tones."}];
 let active=null;
 function close(){active=null;panel.hidden=true;cards.forEach(card=>card.querySelector('[data-inspect]').setAttribute('aria-pressed','false'))}
 cards.forEach(card=>card.querySelector('[data-inspect]').addEventListener('click',()=>{const id=card.dataset.productId;if(active===id){close();return}const item=data.find(x=>x.id===id);active=id;detail.name.textContent=item.name;detail.material.textContent=item.material;detail.description.textContent=item.desc;panel.hidden=false;cards.forEach(c=>c.querySelector('[data-inspect]').setAttribute('aria-pressed',String(c.dataset.productId===id)));panel.focus({preventScroll:true})}));
 panel.querySelector('[data-detail-close]').addEventListener('click',()=>{const chosen=active;close();cards.find(c=>c.dataset.productId===chosen)?.querySelector('[data-inspect]')?.focus()});
})();

/* M-COM-01: finite native swipe rail; the base desktop merchandise grid remains intact. */
(()=>{
 if(new URLSearchParams(location.search).get('mobile')!=='M-COM-01')return;
 document.body.dataset.mobileTreatment='M-COM-01';
 const track=document.querySelector('[data-product-track]'),cards=[...track?.querySelectorAll('.p1-item')||[]],section=document.querySelector('#products-showcase');
 if(!track||cards.length<2||!section)return;
 const bar=document.createElement('div');bar.className='p1-mobile-nav';
 const previous=document.createElement('button');previous.type='button';previous.dataset.productPrevious='';previous.textContent='Previous object';
 const next=document.createElement('button');next.type='button';next.dataset.productNext='';next.textContent='Next object';
 const status=document.createElement('span');status.className='p1-mobile-position';status.dataset.productStatus='';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 bar.append(previous,status,next);track.after(bar);
 const media=matchMedia('(max-width:760px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');let index=0,frame=0,lock=0;
 function selected(i){index=Math.max(0,Math.min(cards.length-1,i));previous.disabled=index===0;next.disabled=index===cards.length-1;status.textContent='Object '+(index+1)+' of '+cards.length+': '+cards[index].querySelector('h3').textContent}
 function nearest(){frame=0;if(performance.now()<lock||!media.matches)return;const base=cards[0].offsetLeft;let best=0,diff=Infinity;cards.forEach((card,i)=>{const d=Math.abs(card.offsetLeft-base-track.scrollLeft);if(d<diff){diff=d;best=i}});selected(best)}
 function go(i){const n=Math.max(0,Math.min(cards.length-1,i));selected(n);lock=performance.now()+(reduced.matches?0:560);track.scrollTo({left:cards[n].offsetLeft-cards[0].offsetLeft,behavior:reduced.matches?'instant':'smooth'});setTimeout(nearest,610)}
 previous.addEventListener('click',()=>go(index-1));next.addEventListener('click',()=>go(index+1));
 track.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(nearest)},{passive:true});
 function sync(){bar.hidden=!media.matches;if(media.matches)requestAnimationFrame(nearest);else track.scrollLeft=0}
 addEventListener('resize',sync);media.addEventListener('change',sync);selected(0);sync();
})();

