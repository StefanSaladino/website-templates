const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-menu');
const film = document.querySelector('#hero-film');
const filmSource = film?.querySelector('source[data-src]');
const filmToggle = document.querySelector('[data-film-toggle]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function setMenu(open) {
  if (!menuButton || !menu) return;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menu.hidden = !open;
  document.documentElement.classList.toggle('menu-open', open);
  document.body.classList.toggle('menu-open', open);
}

menuButton?.addEventListener('click', () => {
  setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
});
menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
window.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });
window.addEventListener('resize', () => { if (window.innerWidth > 900) setMenu(false); });

function updateHeader() {
  header?.classList.toggle('is-scrolled', window.scrollY > 24);
}
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

// Fail closed: the remote 4K asset is never assigned to <source> on page entry.
// Poster and title animation work with JS disabled, reduced motion and Save-Data.
let filmState = 'idle';
let filmTicket = 0;
function showFilmState(state) {
  filmState = state;
  if (!filmToggle) return;
  filmToggle.setAttribute('aria-pressed', String(state === 'playing'));
  const label = filmToggle.querySelector('span');
  if (label) label.textContent = state === 'playing' ? 'Pause film' : state === 'loading' ? 'Cancel film' : 'Play film';
}
async function playFilm() {
  if (!film || !filmSource || !filmToggle) return;
  const url = filmSource.dataset.src || '';
  if (!url.startsWith('https://videos.pexels.com/')) return;
  const ticket = ++filmTicket;
  if (!filmSource.getAttribute('src')) {
    filmSource.setAttribute('src', url);
    film.load();
  }
  showFilmState('loading');
  try {
    await film.play();
    if (ticket === filmTicket) showFilmState('playing');
  } catch {
    if (ticket === filmTicket) pauseFilm();
  }
}
function pauseFilm() {
  const loading = filmState === 'loading';
  ++filmTicket;
  film?.pause();
  // Cancel a pending 4K request if the visitor changes their mind mid-load.
  if (loading && filmSource) {
    filmSource.removeAttribute('src');
    film?.load();
  }
  showFilmState('idle');
}
filmToggle?.addEventListener('click', () => {
  if (filmState === 'playing' || filmState === 'loading') pauseFilm();
  else void playFilm();
});
film?.addEventListener('pause', () => {
  if (filmState === 'playing') showFilmState('idle');
});
film?.addEventListener('error', () => {
  if (filmState === 'loading' || filmState === 'playing') pauseFilm();
});
reduceMotion.addEventListener?.('change', event => {
  if (event.matches) pauseFilm();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseFilm();
});

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}


/* ANIM-02: typography-only motion; existing film playback control stays independent. */
const offcutTitle=document.querySelector('[data-motion-pattern="ANIM-02"]');
const offcutReplay=document.querySelector('[data-replay-motion="ANIM-02"]');
let offcutMotionTimer;
function stopOffcutTitle(){clearTimeout(offcutMotionTimer);offcutTitle?.classList.remove('offcut-motion-playing')}
function replayOffcutTitle(){
  stopOffcutTitle();
  if(!offcutTitle||reduceMotion.matches||document.hidden)return;
  void offcutTitle.offsetWidth;
  offcutTitle.classList.add('offcut-motion-playing');
  offcutMotionTimer=setTimeout(stopOffcutTitle,1680);
}
if(offcutTitle&&offcutReplay){
  document.body.classList.add('offcut-motion-ready');
  offcutReplay.addEventListener('click',replayOffcutTitle);
  requestAnimationFrame(()=>requestAnimationFrame(replayOffcutTitle));
  reduceMotion.addEventListener('change',event=>{if(event.matches)stopOffcutTitle()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopOffcutTitle()});
}
