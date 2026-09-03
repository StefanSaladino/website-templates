(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = document.querySelectorAll('[data-reveal]');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

    revealItems.forEach((item) => observer.observe(item));
  }

  if (reduceMotion) return;

  const heroImage = document.querySelector('.hero-image');
  const projectImage = document.querySelector('[data-image-parallax] img');
  let ticking = false;

  const updateParallax = () => {
    const scrollY = window.scrollY;
    if (heroImage) {
      const offset = Math.min(scrollY * 0.13, 105);
      heroImage.style.transform = `translate3d(0, calc(-6% + ${offset}px), 0) scale(1.03)`;
    }

    if (projectImage) {
      const rect = projectImage.parentElement.getBoundingClientRect();
      const center = window.innerHeight / 2;
      const delta = rect.top + rect.height / 2 - center;
      const offset = Math.max(-56, Math.min(56, delta * -0.06));
      projectImage.style.transform = `translate3d(0, ${offset}px, 0) scale(1.04)`;
    }
    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateParallax);
  };

  updateParallax();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
})();
