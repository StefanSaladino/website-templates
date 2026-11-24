// Progressive enhancement: real links and complete visible sections without
// JavaScript. With JS, open one collection below the stable photo grid.
const panels=[...document.querySelectorAll('.project-subsection')],covers=[...document.querySelectorAll('.project-cover')],motion=matchMedia('(prefers-reduced-motion: reduce)');
function update(id,focus=false){for(const panel of panels){const active=panel.id===id;panel.hidden=!active;if(active){panel.removeAttribute('data-opening');if(!motion.matches){void panel.offsetWidth;panel.setAttribute('data-opening','')}if(focus){panel.querySelector('h2').focus({preventScroll:true});panel.scrollIntoView({block:'start',behavior:motion.matches?'auto':'smooth'})}}}for(const cover of covers)cover.setAttribute('aria-expanded',String(cover.hash==='#'+id))}
function sync(focus=false){const id=location.hash.slice(1);if(panels.some(p=>p.id===id))update(id,focus);else if(!id||id==='work')update('')}
for(const p of panels){const close=p.querySelector('.close-collection');close.hidden=false;close.addEventListener('click',()=>{history.replaceState(null,'','#work');update('');covers.find(c=>c.hash==='#'+p.id)?.focus({preventScroll:true});document.querySelector('#work').scrollIntoView({behavior:motion.matches?'auto':'smooth'})})}
for(const cover of covers)cover.addEventListener('click',e=>{e.preventDefault();if(location.hash!==cover.hash)history.pushState(null,'',cover.hash);update(cover.hash.slice(1),true)});
addEventListener('hashchange',()=>sync());addEventListener('popstate',()=>sync());update('');sync();
