const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('.mobile-menu');

function closeMenu() {
  if (!menuButton || !mobileMenu) return;
  menuButton.setAttribute('aria-expanded', 'false');
  mobileMenu.hidden = true;
  document.body.classList.remove('menu-open');
}

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mobileMenu.hidden = open;
    document.body.classList.toggle('menu-open', !open);
  });
  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 960) closeMenu(); });
}

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals = document.querySelectorAll('.reveal');
if (prefersReduced || !('IntersectionObserver' in window)) {
  reveals.forEach((el) => el.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach((el) => observer.observe(el));
}

const parallax = document.querySelector('[data-parallax] img');
if (parallax && !prefersReduced) {
  let ticking = false;
  const update = () => {
    const rect = parallax.parentElement.getBoundingClientRect();
    const viewport = window.innerHeight || 1;
    const progress = (viewport - rect.top) / (viewport + rect.height);
    const shift = Math.max(-18, Math.min(18, (progress - 0.5) * 36));
    parallax.style.setProperty('--parallax', `${shift}px`);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
}


/* ANIM-07: the stage buttons are progressively enhanced; static list works without JS. */
const contractorProcess=document.querySelector('[data-motion-pattern="ANIM-07"]');
if(contractorProcess){
  const processList=contractorProcess.querySelector('.process-list');
  const steps=[...processList.querySelectorAll(':scope > li')];
  const note=document.createElement('div');
  note.className='process-motion-note';
  note.innerHTML='<span>Select a stage to explore (illustrative sequence)</span><strong id="process-current-stage" role="status" aria-live="polite">Stage 1 of 4</strong>';
  const meter=document.createElement('div');
  meter.className='process-motion-meter';
  meter.setAttribute('aria-hidden','true');
  meter.innerHTML='<span></span>';
  processList.before(note,meter);
  function selectStage(i){
    steps.forEach((item,index)=>{
      const current=index===i;
      item.classList.toggle('motion-current',current);
      item.querySelector('.motion-step-button').setAttribute('aria-pressed',String(current));
    });
    note.querySelector('strong').textContent='Stage '+(i+1)+' of '+steps.length;
    meter.firstElementChild.style.width=((i+1)/steps.length*100)+'%';
  }
  steps.forEach((item,i)=>{
    const number=item.querySelector(':scope > span');
    if(!number)return;
    const button=document.createElement('button');
    button.type='button';button.className='motion-step-button';button.dataset.motionStage=String(i+1);
    button.textContent=number.textContent;
    button.setAttribute('aria-label','Explore stage '+(i+1)+' of '+steps.length);
    button.addEventListener('click',()=>selectStage(i));
    number.replaceWith(button);
  });
  selectStage(0);
}

/* A fictional template must never navigate with entered contact details or report a real booking. */
const contractorVisitForm=document.querySelector('.visit-form');
contractorVisitForm?.addEventListener('submit',(event)=>{
  event.preventDefault();
  const status=contractorVisitForm.querySelector('[data-visit-status]');
  if(status)status.textContent='Preview only — no site visit was requested, and no details were sent or saved.';
});
