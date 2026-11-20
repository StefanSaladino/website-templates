const stage=document.querySelector('#comp-stage'),range=document.querySelector('#comp-range'),value=document.querySelector('#comp-value');range.addEventListener('input',()=>{stage.style.setProperty('--reveal',range.value+'%');value.textContent=range.value+'%';});
/* M-UTIL-03: direct horizontal touch scrubbing with native keyboard range retained. */
(()=>{
 if(new URLSearchParams(location.search).get('mobile')!=='M-UTIL-03')return;
 document.body.dataset.mobileTreatment='M-UTIL-03';
 const stage=document.querySelector('#comp-stage'),range=document.querySelector('#comp-range'),description=document.querySelector('.comp-slider-label');
 if(!stage||!range)return;
 const controls=document.createElement('div');controls.className='comp-presets';controls.setAttribute('role','group');controls.setAttribute('aria-label','Image reveal presets');
 const status=document.createElement('p');status.className='comp-touch-hint';status.textContent='Drag left or right across the image, use the slider, or choose a preset.';
 stage.after(status);
 const options=[25,50,75];const buttons=options.map(n=>{const b=document.createElement('button');b.type='button';b.textContent=n+'%';b.dataset.compPreset=String(n);b.setAttribute('aria-pressed',String(n===50));controls.append(b);return b});
 range.after(controls);let dragging=false;const media=matchMedia('(max-width:760px)');
 const set=n=>{range.value=String(Math.min(100,Math.max(0,Math.round(n))));range.dispatchEvent(new Event('input',{bubbles:true}));buttons.forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.compPreset)===Number(range.value))))};
 range.addEventListener('input',()=>buttons.forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.compPreset)===Number(range.value)))));
 buttons.forEach(b=>b.addEventListener('click',()=>set(Number(b.dataset.compPreset))));
 function position(e){const r=stage.getBoundingClientRect();set((e.clientX-r.left)/r.width*100)}
 stage.addEventListener('pointerdown',e=>{if(!media.matches||e.button!==0)return;dragging=true;stage.setPointerCapture?.(e.pointerId);position(e)});
 stage.addEventListener('pointermove',e=>{if(dragging&&media.matches)position(e)});
 function end(e){if(!dragging)return;dragging=false;try{stage.releasePointerCapture?.(e.pointerId)}catch{}}
 stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
 function sync(){controls.hidden=!media.matches;status.hidden=!media.matches;if(!media.matches)dragging=false}
 media.addEventListener('change',sync);sync();
})();

