const image=document.querySelector('#a3-image'),btn=document.querySelector('#a3-play'),status=document.querySelector('#a3-status'),reduce=matchMedia('(prefers-reduced-motion: reduce)');let timer;
function stop(){clearTimeout(timer);image.classList.remove('is-playing')}
function replay(){
  stop();
  if(reduce.matches){status.textContent='Reduced motion is enabled. The complete image remains visible.';return}
  if(document.hidden)return;
  void image.offsetWidth;image.classList.add('is-playing');status.textContent='Revealing the photograph.';
  timer=setTimeout(()=>{stop();status.textContent='Reveal complete. Press replay to see it again.'},1300);
}
btn.addEventListener('click',replay);
reduce.addEventListener('change',e=>{if(e.matches){stop();status.textContent='Reduced motion is enabled.'}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
requestAnimationFrame(()=>requestAnimationFrame(replay));
