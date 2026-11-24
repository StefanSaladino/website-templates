// All content is present in a single page. Native details work without JS.
// Enhance hash links from a collection to its corresponding case study.
const motion=matchMedia('(prefers-reduced-motion: reduce)');
function openHash(){const id=location.hash.slice(1);if(!/^(case|collection)-[a-z]+$/.test(id))return;const el=document.getElementById(id);if(el instanceof HTMLDetailsElement){el.open=true;requestAnimationFrame(()=>el.scrollIntoView({block:'start',behavior:motion.matches?'auto':'smooth'}))}}
addEventListener('hashchange',openHash);openHash();
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#case-"]');if(a&&a.hash===location.hash)openHash()});
