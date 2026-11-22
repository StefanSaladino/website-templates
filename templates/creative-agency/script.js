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

// OFFCUT's unoptimized 4K review source is independent of the ANIM-02 title.
const filmStatus = document.querySelector('[data-film-status]');
const dataConnection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
let filmState = 'idle'; // idle | confirm | loading | playing
let filmTicket = 0;
const saveDataActive = () => dataConnection?.saveData === true;

function setFilmStatus(message) {
  if (filmStatus) filmStatus.textContent = message;
}
function showFilmState(state) {
  filmState = state;
  if (!filmToggle) return;
  filmToggle.setAttribute('aria-pressed', String(state === 'playing'));
  const label = filmToggle.querySelector('span');
  if (label) label.textContent = {
    idle: 'Preview film',
    confirm: 'Confirm 4K stream',
    loading: 'Cancel loading',
    playing: 'Stop film'
  }[state] || 'Preview film';
}
function stopFilm(message = 'Film stopped. The 4K source was detached; the still poster remains.') {
  ++filmTicket;
  showFilmState('idle');
  film?.pause();
  if (filmSource?.hasAttribute('src')) {
    filmSource.removeAttribute('src');
    film?.load();
  }
  setFilmStatus(message);
}
async function playFilm() {
  if (!film || !filmSource || !filmToggle) return;
  if (saveDataActive()) {
    stopFilm('Data Saver enabled. The 4K film was not loaded; the still poster remains.');
    return;
  }
  const url = filmSource.dataset.src || '';
  let exactApprovedPreviewIdentity = false;
  try {
    const parsed = new URL(url);
    exactApprovedPreviewIdentity = parsed.protocol === 'https:'
      && parsed.hostname === 'videos.pexels.com'
      && parsed.pathname === '/video-files/9489382/9489382-uhd_4096_2160_25fps.mp4'
      && !parsed.search && !parsed.hash;
  } catch {
    // An invalid URL must never be assigned to a media element.
  }
  if (!exactApprovedPreviewIdentity) {
    stopFilm('Sample film unavailable. The still poster remains.');
    return;
  }
  const ticket = ++filmTicket;
  showFilmState('loading');
  setFilmStatus('Loading the large 4K sample after your confirmation. Cancel at any time.');
  try {
    filmSource.setAttribute('src', url);
    film.load();
    await film.play();
    if (ticket !== filmTicket) return;
    showFilmState('playing');
    setFilmStatus('Review-only film playing. Stop to disconnect the stream and return to the poster.');
  } catch {
    if (ticket === filmTicket) stopFilm('The sample film could not play. The still poster remains.');
  }
}
filmToggle?.addEventListener('click', () => {
  if (filmState === 'loading' || filmState === 'playing') {
    stopFilm();
  } else if (saveDataActive()) {
    stopFilm('Data Saver is enabled. No large video will stream; the poster and headline remain.');
  } else if (filmState === 'idle') {
    showFilmState('confirm');
    setFilmStatus('The sample is an unoptimized 4K MP4 with unknown transfer size. Confirm 4K stream to use network data, or leave the poster in place.');
  } else if (filmState === 'confirm') {
    void playFilm();
  }
});
film?.addEventListener('pause', () => {
  if (filmState === 'playing') stopFilm();
});
film?.addEventListener('error', () => {
  if (filmState === 'loading' || filmState === 'playing') stopFilm('Video could not load. The poster remains.');
});
filmSource?.addEventListener('error', () => {
  if (filmState === 'loading' || filmState === 'playing') stopFilm('Video source unavailable. The poster remains.');
});
reduceMotion.addEventListener?.('change', event => {
  if (event.matches && (filmState === 'playing' || filmState === 'loading')) {
    stopFilm('Reduced motion enabled. Film disconnected and poster restored.');
  }
});
dataConnection?.addEventListener?.('change', () => {
  if (saveDataActive()) stopFilm('Data Saver activated. Film disconnected and poster restored.');
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && filmState !== 'idle') stopFilm('Film stopped when the tab was hidden. Poster restored.');
});
const heroForFilm = document.querySelector('.hero');
if (heroForFilm && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    if (!entries[0]?.isIntersecting && (filmState === 'playing' || filmState === 'loading')) {
      stopFilm('Film stopped after scrolling away from the hero. Poster restored.');
    }
  }, { threshold: 0 });
  observer.observe(heroForFilm);
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
