const gallery=document.querySelector('#motion-showcase'),replay=document.querySelector('#a18-replay'),status=document.querySelector('#a18-status'),reduce=matchMedia('(prefers-reduced-motion: reduce)');let timer;function stop(){clearTimeout(timer);gallery.classList.remove('is-replaying')}
function play(){stop();if(reduce.matches){status.textContent='Reduced motion: the full gallery is visible.';return}if(document.hidden)return;void gallery.offsetWidth;gallery.classList.add('is-replaying');status.textContent='Showing the three-part editorial sequence.';timer=setTimeout(()=>{stop();status.textContent='Gallery sequence complete.'},1650)}
replay.addEventListener('click',play);reduce.addEventListener('change',e=>{if(e.matches)stop()});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
// Run this rhythm once when the actual illustrated work first becomes visible,
// not while the preceding introduction occupies the viewport.
const firstStudy=gallery.querySelector('[data-a18-piece]');
if(firstStudy && 'IntersectionObserver' in window && !reduce.matches){
 const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){play();observer.disconnect()}},{threshold:.12});
 observer.observe(firstStudy);
}