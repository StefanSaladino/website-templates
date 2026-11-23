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

function focusMenuDestination(link) {
  const href=link.getAttribute('href')||'';
  if (!href.startsWith('#')) return false;
  const target=document.getElementById(decodeURIComponent(href.slice(1)));
  if (!target) return false;
  const temporary=!target.hasAttribute('tabindex');
  if (temporary) target.tabIndex=-1;
  target.focus({preventScroll:true});
  if (temporary) target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true});
  return true;
}

menu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  setMenu(false);
  if(!focusMenuDestination(link))menuButton?.focus();
}));
window.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&menuButton?.getAttribute('aria-expanded')==='true'){
    setMenu(false);
    menuButton.focus();
  }
});
window.addEventListener('resize',()=>{
  if(window.innerWidth<=900)return;
  const wasOpen=menuButton?.getAttribute('aria-expanded')==='true';
  setMenu(false);
  // The browser can blur a disappearing mobile link before resize handlers run.
  // Move focus once desktop styles have settled, rather than reading a stale activeElement.
  if(wasOpen)requestAnimationFrame(()=>document.querySelector('.desktop-nav a')?.focus());
});

function updateHeader() {
  header?.classList.toggle('is-scrolled', window.scrollY > 24);
}
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

// Autoplay the muted loop for ordinary visitors. Keep the poster for reduced
// motion, Data Saver, playback rejection and no-JS; never load when offscreen.
const dataConnection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
const saveDataActive = () => dataConnection?.saveData === true;
let filmState = 'idle';
let filmTicket = 0;
let manuallyPaused = false;
let heroVisible = true;
let autoplayBlocked = false;
function showFilmState(state) {
  filmState = state;
  if (!filmToggle) return;
  filmToggle.setAttribute('aria-pressed', String(state === 'playing' || state === 'loading'));
  filmToggle.disabled = saveDataActive();
  const label = filmToggle.querySelector('span');
  if (label) label.textContent = state === 'playing' || state === 'loading' ? 'Pause film' : 'Play film';
}
function stopFilm() {
  ++filmTicket;
  showFilmState('idle');
  film?.pause();
  if (filmSource?.hasAttribute('src')) {
    filmSource.removeAttribute('src');
    film?.load();
  }
}
async function playFilm() {
  if (!film || !filmSource || !filmToggle || saveDataActive() || document.hidden || !heroVisible || filmState !== 'idle') return;
  const url = filmSource.dataset.src || '';
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'videos.pexels.com'
      || parsed.pathname !== '/video-files/7677235/7677235-hd_1920_1080_25fps.mp4'
      || parsed.search || parsed.hash) return;
  } catch { return; }
  const ticket = ++filmTicket;
  showFilmState('loading');
  try {
    film.muted = true;
    film.defaultMuted = true;
    if (filmSource.getAttribute('src') !== url) {
      filmSource.setAttribute('src', url);
      film.load();
    }
    await film.play();
    if (ticket === filmTicket) showFilmState('playing');
  } catch {
    if (ticket === filmTicket) {
      autoplayBlocked = true;
      stopFilm();
    }
  }
}
function maybeAutoplay() {
  if (!manuallyPaused && !autoplayBlocked && !reduceMotion.matches && !saveDataActive() && !document.hidden && heroVisible) void playFilm();
}
filmToggle?.addEventListener('click', () => {
  if (filmState === 'loading' || filmState === 'playing') {
    manuallyPaused = true;
    stopFilm();
  } else {
    manuallyPaused = false;
    autoplayBlocked = false;
    void playFilm();
  }
});
function onFilmError() {
  if (filmState === 'loading' || filmState === 'playing') {
    autoplayBlocked = true;
    stopFilm();
  }
}
film?.addEventListener('error', onFilmError);
filmSource?.addEventListener('error', onFilmError);
film?.addEventListener('pause', () => {
  if (filmState === 'playing') {
    autoplayBlocked = true;
    stopFilm();
  }
});
reduceMotion.addEventListener?.('change', event => {
  if (event.matches) stopFilm();
  else maybeAutoplay();
});
dataConnection?.addEventListener?.('change', () => {
  if (saveDataActive()) stopFilm();
  else { showFilmState(filmState); maybeAutoplay(); }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopFilm();
  else maybeAutoplay();
});
const heroForFilm = document.querySelector('.hero');
if (reduceMotion.matches || saveDataActive()) {
  stopFilm();
} else {
  // Source was already installed by the inline hero bootstrap; never force
  // the visitor to click the film button to initiate playback.
  maybeAutoplay();
}
if (heroForFilm && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    heroVisible = Boolean(entries[0]?.isIntersecting);
    if (!heroVisible) stopFilm();
    else maybeAutoplay();
  }, { threshold: 0 });
  observer.observe(heroForFilm);
} else {
  maybeAutoplay();
}

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
