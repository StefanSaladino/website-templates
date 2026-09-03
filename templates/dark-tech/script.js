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
