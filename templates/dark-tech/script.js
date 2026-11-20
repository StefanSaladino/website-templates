(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealTargets = document.querySelectorAll('.statement, .section-intro, .method-rows article, .release-index-head, .release-table-row, .final-cta > *');
  revealTargets.forEach((node) => node.classList.add('kern-reveal'));

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((node) => node.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach((node) => observer.observe(node));
  }

  if (reduceMotion) return;

  const plan = document.querySelector('.plan-wrap');
  let ticking = false;
  const updateDepth = () => {
    if (plan && window.innerWidth > 820) {
      const offset = Math.min(window.scrollY * 0.035, 26);
      plan.style.transform = `translate3d(0, ${offset}px, 0)`;
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateDepth);
  }, { passive: true });
})();

/* ANIM-16: pointer spotlight stays decorative; keyboard/touch toggle exposes a simple focus state. */
const root=document.querySelector('[data-spot-root]');if(root){const card=root.querySelector('[data-spot-card]'),button=root.querySelector('[data-spot-toggle]'),status=root.querySelector('[data-spot-status]'),fine=matchMedia('(hover:hover) and (pointer:fine)'),reduce=matchMedia('(prefers-reduced-motion: reduce)');let pressed=false,frame=null,x=0,y=0;function paint(){frame=null;const active=fine.matches&&!reduce.matches;card.classList.toggle('spot-following',active&&card.matches(':hover'));if(active){card.style.setProperty('--spot-x',x+'px');card.style.setProperty('--spot-y',y+'px')}else{card.classList.remove('spot-following');card.style.removeProperty('--spot-x');card.style.removeProperty('--spot-y')}}function request(){if(frame===null)frame=requestAnimationFrame(paint)}function render(){card.classList.toggle('spot-selected',pressed);button.setAttribute('aria-pressed',String(pressed));button.textContent=pressed?'Clear detail emphasis':'Emphasize this review';status.textContent=pressed?'Review details emphasized with a visible outline.':'All review details remain visible.';request()}card.addEventListener('pointermove',e=>{if(!fine.matches||reduce.matches||e.pointerType==='touch')return;const rect=card.getBoundingClientRect();x=Math.max(0,Math.min(rect.width,e.clientX-rect.left));y=Math.max(0,Math.min(rect.height,e.clientY-rect.top));request()});card.addEventListener('pointerleave',()=>{card.classList.remove('spot-following')});button.hidden=false;button.addEventListener('click',()=>{pressed=!pressed;render()});fine.addEventListener('change',request);reduce.addEventListener('change',request);render()}
