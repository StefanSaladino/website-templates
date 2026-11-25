/**
 * ATLAS — Beyond the Contour
 * Main expedition orchestrator:
 * - Native scroll progress mapping across #expedition-track
 * - Viewpoint navigation (Tarn Overlook, Meridian Gorge, Kestrel Crest)
 * - Non-blocking horizontal/mouse drag inspection + keyboard & button alternatives
 * - Still view, reduced-motion, visibility suspension, and WebGL2 fallback handling
 */

import { AtlasRenderer } from './renderer.js?v=32';
import { createMotionController } from './motion.js?v=32';
import { CHAPTERS, VIEWPOINTS, getChapterForProgress } from './camera.js?v=32';

const rootEl = document.documentElement;
rootEl.classList.remove('atlas-no-js');

const trackEl = document.getElementById('expedition-track');
const stageEl = document.getElementById('atlas-stage');
const canvasEl = document.getElementById('atlas-canvas');

const chapterCards = [...document.querySelectorAll('.chapter-card[data-chapter]')];
const navLinks = [...document.querySelectorAll('[data-jump-progress]')];
const viewpointButtons = [...document.querySelectorAll('[data-viewpoint]')];

const stillToggle = document.getElementById('still-toggle');
const qualityToggle = document.getElementById('quality-toggle');
const inspectBar = document.getElementById('inspect-bar');
const inspectToggle=document.getElementById('inspect-toggle');
const inspectOptions=document.getElementById('inspect-options');
const inspectLeftBtn = document.getElementById('inspect-left');
const inspectRightBtn = document.getElementById('inspect-right');
const inspectResetBtn = document.getElementById('inspect-reset');
const returnArchiveBtn = document.getElementById('return-archive');

const chapterReadout = document.getElementById('chapter-readout');
const elevationReadout = document.getElementById('elevation-readout');
const progressBarFill = document.getElementById('progress-fill');

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let isStillMode = reducedMotionQuery.matches;
let currentQuality = window.innerWidth <= 820 ? 'low' : 'high';
let inspectYaw = 0;
let inspectPitch = 0;
let lastInspectChapter = '';
let activeViewpoint = '';
let pendingViewFocus=null;
let inspectExpanded=false;
function selectViewpoint(id){activeViewpoint=id;for(const b of viewpointButtons){if(b.dataset.viewpoint===id)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');}}
function setInspectExpanded(expanded){inspectExpanded=Boolean(expanded);inspectToggle?.setAttribute('aria-expanded',String(inspectExpanded));if(inspectOptions)inspectOptions.hidden=!inspectExpanded;}
function focusWithoutScroll(el){if(el&&!el.hidden)el.focus({preventScroll:true});}

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function getTrackScrollMetrics() {
  if (!trackEl || !stageEl) return { top: 0, travel: 1 };
  const rect = trackEl.getBoundingClientRect();
  const top = rect.top + window.scrollY;
  const stageH = stageEl.offsetHeight || window.innerHeight;
  const travel = Math.max(1, trackEl.offsetHeight - stageH);
  return { top, travel };
}

function isStaticLayoutMode() {
  return (
    isStillMode ||
    reducedMotionQuery.matches ||
    stageEl.getAttribute('data-renderer') !== 'webgl'
  );
}

function getVisibleStaticChapter() {
  let active = CHAPTERS[0];
  let bestTop = -Infinity;
  const threshold = 180;
  for (const card of chapterCards) {
    const rect = card.getBoundingClientRect();
    if (rect.top <= threshold && rect.top > bestTop) {
      bestTop = rect.top;
      const found = CHAPTERS.find((c) => c.id === card.getAttribute('data-chapter'));
      if (found) active = found;
    }
  }
  return active;
}

function scrollToChapterOrProgress(chapterId, progress, instant = false) {
  if (isStaticLayoutMode() && chapterId) {
    const el = document.getElementById(chapterId);
    if (el) {
      const y = Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - 64));
      window.scrollTo({ top: y, behavior: 'instant' });
      return;
    }
  }
  scrollToProgress(progress, instant);
}

function getScrollProgress() {
  const { top, travel } = getTrackScrollMetrics();
  return clamp((window.scrollY - top) / travel, 0, 1);
}

function scrollToProgress(progress, instant = false) {
  const { top, travel } = getTrackScrollMetrics();
  const y = Math.round(top + travel * clamp(progress, 0, 1));
  const behavior = instant || isStillMode || reducedMotionQuery.matches ? 'instant' : 'smooth';
  window.scrollTo({ top: y, behavior });
}

export function editorialEnvelope(chapter,progress){
  const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
  // No overlapping text at chapter boundaries; progress, not time, determines opacity.
  const inAlpha=chapter.start===0?1:smooth(chapter.start,chapter.start+.025,progress);
  const outAlpha=chapter.end===1?1:1-smooth(chapter.end-.025,chapter.end,progress);
  return Math.max(.12,inAlpha*outAlpha);
}
function updateDomForState(state, progress) {
  const chapter = state
    ? state.chapter
    : isStaticLayoutMode()
      ? getVisibleStaticChapter()
      : getChapterForProgress(progress);

  // Determine foreground polarity so editorial typography remains crisp & legible
  const isLightPolar =
    isStaticLayoutMode() ||
    chapter.id === 'map' ||
    chapter.id === 'archive' ||
    progress < 0.13 ||
    progress > 0.91;
  rootEl.setAttribute('data-polarity', isLightPolar ? 'light' : 'dark');
  rootEl.setAttribute('data-active-chapter', chapter.id);
  rootEl.style.setProperty('--atlas-progress', progress.toFixed(4));
  const sm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
  rootEl.style.setProperty('--atlas-darkness',(sm(.10,.24,progress)*(1-sm(.86,.96,progress))).toFixed(4));

  if (progressBarFill) {
    progressBarFill.style.transform = `scaleX(${progress.toFixed(4)})`;
  }

  if (chapterReadout) {
    chapterReadout.textContent = `${chapter.number} / ${chapter.title}`;
  }

  if (elevationReadout) {
    elevationReadout.textContent = 'Fictional alpine survey';
  }

  // Activate the closest chapter overlay smoothly in live WebGL mode
  for (const card of chapterCards) {
    const id = card.getAttribute('data-chapter');
    const isActive = id === chapter.id;
    card.classList.toggle('is-active', isActive);
    const alpha=isActive?editorialEnvelope(chapter,progress):0;
    card.style.setProperty('--chapter-alpha',alpha.toFixed(4));
    card.style.setProperty('--chapter-rise',((1-alpha)*7).toFixed(2)+'px');
    const accessible=isActive||isStaticLayoutMode();
    if(!accessible&&card.contains(document.activeElement))focusWithoutScroll(stageEl);
    card.setAttribute('aria-hidden',String(!accessible));card.inert=!accessible;
  }

  for (const link of navLinks) {
    const targetChapter = link.getAttribute('data-chapter-link');
    if (targetChapter === chapter.id) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  }

  // Show subtle inspection bar on inspectable phases (Descent, Valley, Summit) when WebGL is live
  const webglActive = stageEl.getAttribute('data-renderer') === 'webgl' && !isStillMode;
  const showInspect = webglActive && (chapter.id === 'descent' || chapter.id === 'valley' || chapter.id === 'summit');
  if (inspectBar) {
    if(!showInspect&&inspectBar.contains(document.activeElement))focusWithoutScroll(stageEl);
    inspectBar.hidden = !showInspect;
    if(!showInspect)setInspectExpanded(false);
  }

  if (returnArchiveBtn) {
    returnArchiveBtn.hidden = !activeViewpoint || chapter.id === 'archive';
  }

  if (inspectResetBtn) {
    const hasOffset = Math.abs(inspectYaw) > 0.015 || Math.abs(inspectPitch) > 0.015;
    inspectResetBtn.disabled = !hasOffset;
  }
}

const renderer = new AtlasRenderer(canvasEl, stageEl, {
  initialQuality: currentQuality,
  onRendererChange(mode, reason) {
    // Static cards and the sticky live track have different scroll coordinates.
    // Capture the meaningful chapter BEFORE changing layout, not the old scrollY.
    const alreadyStill=isStillMode||reducedMotionQuery.matches;
    const lost=reason==='context-lost';
    const restored=reason==='context-restored';
    const chapter=lost?getChapterForProgress(motion.getState().currentProgress):
      restored?getVisibleStaticChapter():null;
    rootEl.classList.toggle('atlas-no-webgl', mode !== 'webgl');
    if(mode!=='webgl')rootEl.classList.remove('atlas-booting');
    updateControlStates();
    if(lost&&!alreadyStill){
      pendingViewFocus=null;setInspectExpanded(false);
      inspectYaw=0;inspectPitch=0;motion.resetInspect(true);
      scrollToChapterOrProgress(chapter.id,chapter.anchor,true);
    }
    if(restored&&!alreadyStill){
      inspectYaw=0;inspectPitch=0;motion.resetInspect(true);
      scrollToProgress(chapter.anchor,true);
      syncMotionVisibility();
      motion.setTargetProgress(getScrollProgress(),true);
    }
    updateDomForState(null, getScrollProgress());
    if (mode === 'webgl'&&!alreadyStill) {
      motion.forceRedraw();
    }
  },
});

const motion = createMotionController({
  // Scroll events wake the loop; active camera frames sample the actual position
  // to avoid waiting for a coalesced/delayed Safari scroll event.
  readNativeProgress: getScrollProgress,
  onFrame(progress, timeSec, yaw, pitch, isMoving) {
    if(isStaticLayoutMode()){updateDomForState(null,progress);return null;}
    try {
      const state = renderer.render(progress, progress*14+timeSec, yaw, pitch, isMoving);
      if(state&&renderer.drawCount>0){rootEl.dataset.firstFrame='true';rootEl.classList.remove('atlas-booting');}
      stageEl.dataset.ambientTime=timeSec.toFixed(4);
      updateDomForState(state, progress);
      return state;
    } catch(error) {
      // A draw failure must never strand the user on a frozen canvas.
      stageEl.dataset.renderError=String(error?.message||error);
      stageEl.dataset.renderer='static';
      canvasEl.hidden=true;
      rootEl.classList.add('atlas-no-webgl');rootEl.classList.remove('atlas-booting');
      updateControlStates();
      updateDomForState(null,progress);
      return null;
    }
  },
  onAmbientChange(active){stageEl.dataset.ambientRunning=String(active);},
  onSettleChange(isSettled) {
    stageEl.setAttribute('data-settled', isSettled ? 'true' : 'false');
    if(isSettled&&pendingViewFocus&&!isStaticLayoutMode()){
      const pending=pendingViewFocus;
      if(rootEl.dataset.activeChapter===pending.chapter){pendingViewFocus=null;focusWithoutScroll(pending.element);}
    }
  },
});

function updateControlStates() {
  const hasWebgl = stageEl.getAttribute('data-renderer') === 'webgl';
  rootEl.setAttribute('data-still', isStillMode ? 'true' : 'false');
  if(isStillMode)rootEl.classList.remove('atlas-booting');

  if (stillToggle) {
    stillToggle.setAttribute('aria-pressed', String(isStillMode));
    stillToggle.textContent = isStillMode ? 'Live 3D' : 'Still view';
    stillToggle.disabled = reducedMotionQuery.matches || !hasWebgl;
  }

  if (qualityToggle) {
    qualityToggle.disabled = !hasWebgl || isStillMode;
    qualityToggle.setAttribute('aria-pressed', String(currentQuality === 'low'));
    qualityToggle.textContent = currentQuality === 'low' ? 'Standard detail' : 'High detail';
  }

  motion.setPaused(isStillMode||!hasWebgl||reducedMotionQuery.matches);
}

// Initialize renderer and prime initial frame
const webglReady = renderer.init();
if (!webglReady) {
  rootEl.classList.add('atlas-no-webgl');
}
motion.setSoftwareThrottle?.(renderer.isSoftwareRenderer);
motion.setReducedMotion(reducedMotionQuery.matches);
updateControlStates();

const initialP = getScrollProgress();
motion.setTargetProgress(initialP, true);
updateDomForState(null, initialP);

// Native scroll handler (passive, never intercepts scrolling)
let scrollLockCheck = 0;
function onNativeScroll() {
  const p = getScrollProgress();
  if(!isStaticLayoutMode())motion.setTargetProgress(p,false);

  const ch = getChapterForProgress(p);
  if (ch.id !== lastInspectChapter) {
    lastInspectChapter = ch.id;
    // Gently clear inspection offset when scrolling into a different chapter
    if (Math.abs(inspectYaw) > 0.001 || Math.abs(inspectPitch) > 0.001) {
      inspectYaw = 0;
      inspectPitch = 0;
      motion.resetInspect(false);
    }
  }
  // A viewpoint selection begins inside the archive; keep it until explicit navigation/return.
  if (isStaticLayoutMode()) {
    updateDomForState(null, p);
  }
}

window.addEventListener('scroll', onNativeScroll, { passive: true });
rootEl.dataset.atlasReady='true';
function syncMotionVisibility(){const rect=stageEl.getBoundingClientRect();motion.setVisible(!document.hidden&&rect.bottom>0&&rect.top<window.innerHeight&&rect.right>0&&rect.left<window.innerWidth);}
window.addEventListener('pageshow',()=>{syncMotionVisibility();if(!isStaticLayoutMode())motion.setTargetProgress(getScrollProgress(),true);});
window.addEventListener('resize', () => {
  const isMobile = window.innerWidth <= 820;
  syncMotionVisibility();
  motion.setMobileRate(isMobile);
  motion.forceRedraw();
  updateDomForState(null, getScrollProgress());
}, { passive: true });

// Offscreen & visibility suspension
document.addEventListener('visibilitychange', () => {
  syncMotionVisibility();
});

if ('IntersectionObserver' in window && trackEl) {
  const obs = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        syncMotionVisibility();
      }
    },
    { threshold: 0.01 }
  );
  obs.observe(stageEl);
}

// Reduced-motion listener
reducedMotionQuery.addEventListener('change', (e) => {
  isStillMode = e.matches;
  motion.setReducedMotion(e.matches);
  updateControlStates();
  updateDomForState(null, getScrollProgress());
});

// Chapter jump navigation
for (const link of navLinks) {
  link.addEventListener('click', (e) => {
    const pStr = link.getAttribute('data-jump-progress');
    if (pStr === null) return;
    e.preventDefault();
    const href = link.getAttribute('href') || '';
    const chId = href.startsWith('#') ? href.slice(1) : link.getAttribute('data-chapter-link');
    selectViewpoint('');pendingViewFocus=null;setInspectExpanded(false);
    inspectYaw = 0;
    inspectPitch = 0;
    motion.resetInspect(false);
    scrollToChapterOrProgress(chId, Number(pStr));
  });
}

// Archive Viewpoint buttons
for (const btn of viewpointButtons) {
  btn.addEventListener('click', (event) => {
    event.preventDefault();
    const p = Number(btn.getAttribute('data-target-progress'));
    const vpId = btn.getAttribute('data-viewpoint') || '';
    const vpObj = VIEWPOINTS.find((v) => v.id === vpId);
    selectViewpoint(vpId);setInspectExpanded(false);
    inspectYaw = 0;
    inspectPitch = 0;
    motion.resetInspect(true);
    const chapter=vpObj?.chapter||'valley';
    if(isStaticLayoutMode()){
      scrollToChapterOrProgress(chapter,p);
      focusWithoutScroll(document.getElementById('title-'+chapter));
    }else{
      pendingViewFocus={chapter,element:returnArchiveBtn};
      scrollToChapterOrProgress(chapter,p);
    }
  });
}

if (returnArchiveBtn) {
  returnArchiveBtn.addEventListener('click', () => {
    const previous=viewpointButtons.find(b=>b.dataset.viewpoint===activeViewpoint);
    selectViewpoint('');setInspectExpanded(false);
    pendingViewFocus={chapter:'archive',element:previous||viewpointButtons[0]};
    focusWithoutScroll(stageEl);
    inspectYaw=0;inspectPitch=0;motion.resetInspect(false);
    scrollToProgress(0.96);
  });
}

// Still view toggle
if (stillToggle) {
  stillToggle.addEventListener('click', () => {
    if (reducedMotionQuery.matches) return;
    const chapter=CHAPTERS.find(c=>c.id===rootEl.dataset.activeChapter)||CHAPTERS[0];
    pendingViewFocus=null;setInspectExpanded(false);
    isStillMode = !isStillMode;
    updateControlStates();
    updateDomForState(null, getScrollProgress());
    if(isStillMode)scrollToChapterOrProgress(chapter.id,chapter.anchor,true);
    else{scrollToProgress(chapter.anchor,true);motion.setTargetProgress(chapter.anchor,true);motion.forceRedraw();}
  });
}

// Detail / quality toggle
if (qualityToggle) {
  qualityToggle.addEventListener('click', () => {
    currentQuality = currentQuality === 'high' ? 'low' : 'high';
    renderer.setQuality(currentQuality);
    updateControlStates();
    motion.forceRedraw();
  });
}

// Optional non-blocking drag inspection (never hijacks vertical touch scroll)
let dragActive = false;
let dragDecided = false;
let dragPointerId = null;
let dragStartX = 0;
let dragStartY = 0;
let dragBaseYaw = 0;
let dragBasePitch = 0;

function isInspectPermitted() {
  if (isStillMode || stageEl.getAttribute('data-renderer') !== 'webgl') return false;
  const ch = getChapterForProgress(getScrollProgress());
  return ch.inspectable;
}

stageEl.addEventListener('pointerdown', (e) => {
  if (!isInspectPermitted()) return;
  if (e.target.closest('a, button, input, summary, details')) return;
  if (e.pointerType === 'mouse' && e.button !== 0) return;

  dragActive = true;
  dragDecided = e.pointerType === 'mouse';
  dragPointerId = e.pointerId;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragBaseYaw = inspectYaw;
  dragBasePitch = inspectPitch;
}, { passive: true });

window.addEventListener('pointermove', (e) => {
  if (!dragActive || e.pointerId !== dragPointerId) return;
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;

  if (!dragDecided) {
    if (Math.hypot(dx, dy) < 8) return;
    // Yield immediately to vertical native scroll on touch devices
    if (Math.abs(dy) > Math.abs(dx) * 1.1) {
      dragActive = false;
      dragPointerId = null;
      return;
    }
    dragDecided = true;
  }

  inspectYaw = clamp(dragBaseYaw - dx * 0.0032, -0.78, 0.78);
  inspectPitch = clamp(dragBasePitch + dy * 0.0018, -0.34, 0.34);
  motion.setInspectOffset(inspectYaw, inspectPitch);
}, { passive: true });

function endDrag(e) {
  if (!dragActive || (e.pointerId !== undefined && e.pointerId !== dragPointerId)) return;
  dragActive = false;
  dragPointerId = null;
}
window.addEventListener('pointerup', endDrag, { passive: true });
window.addEventListener('pointercancel', endDrag, { passive: true });

// Keyboard & button inspection controls
inspectToggle?.addEventListener('click',()=>setInspectExpanded(!inspectExpanded));
function nudgeInspect(dyaw, dpitch = 0) {
  if (!isInspectPermitted()) return;
  inspectYaw = clamp(inspectYaw + dyaw, -0.78, 0.78);
  inspectPitch = clamp(inspectPitch + dpitch, -0.34, 0.34);
  motion.setInspectOffset(inspectYaw, inspectPitch);
}

if (inspectLeftBtn) {
  inspectLeftBtn.addEventListener('click', () => nudgeInspect(-0.18, 0));
}
if (inspectRightBtn) {
  inspectRightBtn.addEventListener('click', () => nudgeInspect(0.18, 0));
}
if (inspectResetBtn) {
  inspectResetBtn.addEventListener('click', () => {
    inspectYaw = 0;
    inspectPitch = 0;
    motion.resetInspect(false);
  });
}

window.addEventListener('keydown', (e) => {
  if (!isInspectPermitted()) return;
  // Shortcuts only while focus is intentionally inside the inspection controls.
  if(!inspectBar?.contains(document.activeElement)||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)return;
  if(e.key==='Escape'&&inspectExpanded){e.preventDefault();setInspectExpanded(false);focusWithoutScroll(inspectToggle);return;}
  if(!inspectExpanded)return;
  if(e.key==='ArrowLeft'){e.preventDefault();nudgeInspect(-.12,0);}
  else if(e.key==='ArrowRight'){e.preventDefault();nudgeInspect(.12,0);}
});

// Prevent unused lint warnings cleanly
void CHAPTERS;
void VIEWPOINTS;
void scrollLockCheck;

// Physical-device QA only; the ordinary expedition neither downloads nor runs this module.
if(new URLSearchParams(location.search).get('device-review')==='1'){
  import('./device-review.js?v=32').then(({mountDeviceReview})=>mountDeviceReview({stage:stageEl,canvas:canvasEl,getState:()=>motion.getState(),getNativeProgress:getScrollProgress,isSoftwareRenderer:()=>renderer.isSoftwareRenderer,scrollToProgress})).catch(error=>console.warn('ATLAS device review unavailable',error));
}
