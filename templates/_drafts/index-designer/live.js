// Native cross-document view transitions are progressive enhancement.
// Avoid duplicate shared-element names on collection pages (next cover may
// have a distinct name); disable transitions under the live motion preference.
const motion=matchMedia('(prefers-reduced-motion: reduce)');
function update(){document.documentElement.dataset.motion=motion.matches?'reduced':'normal'}
motion.addEventListener('change',update);update();
window.addEventListener('pageswap',e=>{if(motion.matches)e.viewTransition?.skipTransition()});
window.addEventListener('pagereveal',e=>{if(motion.matches)e.viewTransition?.skipTransition()});
