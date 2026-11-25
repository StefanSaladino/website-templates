/**
 * RELAY — Master Scroll Timeline & Reversible Choreography Controller
 * Maps native browser scroll position into [0..1] normalized progress,
 * updates persistent CSS 3D rig variables, coordinates shared-geometry workflow
 * morphing, manages Scene 02 architectural depth guides, enforces inert/aria-hidden
 * on inactive chapters, and restores static accessibility under reduced motion.
 */

import { evaluateSceneState, mixRgb, SCENE_ANCHORS } from './scenes.js?v=3';

const DARK_PAGE = [18, 20, 18]; // #121412
const LIGHT_PAGE = [239, 236, 228]; // #EFECE4

const DARK_SHELL = [37, 42, 36]; // #1D211C
const LIGHT_SHELL = [248, 246, 240]; // #F8F6F0

const DARK_ELEVATED = [50, 57, 48]; // #282E26
const LIGHT_ELEVATED = [239, 236, 228]; // #EFECE4

const DARK_INK = [242, 244, 238]; // #F2F4EE
const LIGHT_INK = [22, 24, 21]; // #161815

const DARK_MUTED = [184, 190, 181]; // #B8BEB5
const LIGHT_MUTED = [89, 95, 85]; // #595F55

const DARK_BORDER = [77, 86, 73]; // #3F473C
const LIGHT_BORDER = [212, 208, 197]; // #D4D0C5

function luminance(rgb) {
  return rgb.map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0);
}
function legibleInk(bg, muted=false) {
  const y=luminance(bg);
  // Preserve normal endpoint colours where they meet a 4.5:1 contrast ratio;
  // choose absolute dark/light ink at the midpoint instead of muddy gray.
  const dark=[22,24,21], white=[242,244,238];
  const candidate=y>.179?(muted?LIGHT_MUTED:dark):(muted?DARK_MUTED:white);
  const ratio=(Math.max(y,luminance(candidate))+.05)/(Math.min(y,luminance(candidate))+.05);
  if(ratio>=4.5)return candidate;
  return y>.179?[0,0,0]:[255,255,255];
}
const rgbString=rgb=>`rgb(${rgb.map(Math.round).join(', ')})`;
const SVG_NS = 'http://www.w3.org/2000/svg';

export class MotionController {
  constructor(workflow, connectors) {
    this.workflow = workflow;
    this.connectors = connectors;

    this.root = document.documentElement;
    this.trackEl = document.getElementById('experience-track');
    this.stageEl = document.getElementById('stage-viewport');
    this.rigEl = document.getElementById('workspace-rig');
    this.shellEl = document.getElementById('relay-shell');
    this.guidesSvg = document.getElementById('exploded-guides');
    this.sceneEls = Array.from(document.querySelectorAll('.scene'));
    this.railLinks = Array.from(document.querySelectorAll('[data-scene-link]'));
    this.themeMeta = document.querySelector('meta[name="theme-color"]');

    this.signalRoute = document.getElementById('relay-signal-route');
    this.signalBase = document.getElementById('signal-base');
    this.signalPacket = document.getElementById('signal-packet');
    this.signalMobile = null;
    this.manualScenario = null;
    this.sandboxOpen = false;
    this.reducedMotion = false;
    this.isOffscreen = false;
    this.pendingRaf = null;
    this.lastSidebarMode = 'workflows';
    this.guideLines = null;

    this._onScroll = this._onScroll.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onVisibility = this._onVisibility.bind(this);
    this._frame = this._frame.bind(this);
  }

  init() {
    this.root.classList.add('has-motion');
    this.mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = this.mql.matches;
    this._setupExplodedGuides();
    this._applyMotionPreference();

    if (this.mql.addEventListener) {
      this.mql.addEventListener('change', () => {
        this.reducedMotion = this.mql.matches;
        this._applyMotionPreference();
      });
    }

    if ('IntersectionObserver' in window && this.trackEl) {
      this.observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          this.isOffscreen = entry ? !entry.isIntersecting : false;
          this.connectors.setAmbientPaused(this.isOffscreen || document.hidden);
        },
        { threshold: 0 }
      );
      this.observer.observe(this.trackEl);
    }

    window.addEventListener('scroll', this._onScroll, { passive: true });
    window.addEventListener('resize', this._onResize, { passive: true });
    document.addEventListener('visibilitychange', this._onVisibility);

    this.updateNow();
  }

  _setupExplodedGuides() {
    if (!this.guidesSvg) return;
    const specs = [
      { id: 'guide-sidebar-top' },
      { id: 'guide-sidebar-bot' },
      { id: 'guide-insp-top' },
      { id: 'guide-insp-bot' },
      { id: 'guide-hist-left' },
      { id: 'guide-hist-right' },
    ];
    const frag = document.createDocumentFragment();
    this.guideLines = specs.map((spec) => {
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('class', 'exploded-guide-line');
      line.setAttribute('id', spec.id);
      frag.appendChild(line);
      return line;
    });
    this.guidesSvg.replaceChildren(frag);
  }

  _updateExplodedGuides(sep, isMobile) {
    if (!this.guidesSvg || !this.guideLines || !this.shellEl) return;
    const vis = Math.max(0, Math.min(1, (sep - 0.14) / 0.5));
    this.guidesSvg.style.opacity = vis.toFixed(3);
    if (vis <= 0.01) return;

    const w = this.shellEl.clientWidth || 1040;
    const h = this.shellEl.clientHeight || 560;
    this.guidesSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    const coords = isMobile
      ? [
          // Vertical guides between top bar and canvas, and canvas to history
          [w * 0.18, 44, w * 0.18, 44 - sep * 14],
          [w * 0.82, 44, w * 0.82, 44 - sep * 14],
          [w * 0.25, h - 76, w * 0.25, h - 76 + sep * 20],
          [w * 0.75, h - 76, w * 0.75, h - 76 + sep * 20],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ]
      : [
          // Sidebar right edge <-> canvas left edge
          [204 - sep * 42, 72 - sep * 10, 204, 72 - sep * 10],
          [204 - sep * 42, h - 72 - sep * 10, 204, h - 72 - sep * 10],
          // Canvas right edge <-> Inspector left edge
          [w - 232, 92 - sep * 10, w - 232 + sep * 62, 92 + sep * 14],
          [w - 232, h - 130 - sep * 10, w - 232 + sep * 62, h - 130 + sep * 14],
          // Canvas bottom <-> History top
          [256, h - 92 - sep * 10, 256 + sep * 18, h - 92 + sep * 38],
          [w - 280, h - 92 - sep * 10, w - 280 + sep * 18, h - 92 + sep * 38],
        ];

    this.guideLines.forEach((line, i) => {
      const [x1, y1, x2, y2] = coords[i];
      line.setAttribute('x1', x1.toFixed(1));
      line.setAttribute('y1', y1.toFixed(1));
      line.setAttribute('x2', x2.toFixed(1));
      line.setAttribute('y2', y2.toFixed(1));
    });
  }

  _applyMotionPreference() {
    this.root.classList.toggle('is-reduced-motion', this.reducedMotion);
    this.connectors.setReducedMotion(this.reducedMotion);
    this.updateNow();
  }

  setManualScenario(scenarioId) {
    this.manualScenario = scenarioId;
    this.workflow.transitionToScenario(scenarioId, false);
  }

  setSandboxMode(active) {
    this.sandboxOpen = Boolean(active);
    this.root.classList.toggle('is-sandbox-open', this.sandboxOpen);
    if (!this.sandboxOpen) {
      this.manualScenario = null;
    }
    this.updateNow();
  }

  scrollToSceneIndex(index) {
    const anchor = SCENE_ANCHORS[index];
    if (!anchor) return;

    if (this.reducedMotion) {
      const targetEl = document.getElementById(anchor.id);
      if (targetEl) targetEl.scrollIntoView({ behavior: 'auto', block: 'start' });
      return;
    }

    const scrollTop = this._progressToScrollY(anchor.progress);
    window.scrollTo({
      top: scrollTop,
      behavior: 'smooth',
    });
  }

  _progressToScrollY(progress) {
    if (!this.trackEl) return 0;
    const trackTop = this.trackEl.getBoundingClientRect().top + window.scrollY;
    const scrollable = Math.max(1, this.trackEl.offsetHeight - window.innerHeight);
    return Math.max(0, Math.round(trackTop + progress * scrollable));
  }

  readNormalizedProgress() {
    if (!this.trackEl) return 0;
    const rect = this.trackEl.getBoundingClientRect();
    const scrollable = Math.max(1, this.trackEl.offsetHeight - window.innerHeight);
    const passed = -rect.top;
    return Math.max(0, Math.min(1, passed / scrollable));
  }

  _onScroll() {
    if (this.reducedMotion) return;
    if (!this.pendingRaf) {
      this.pendingRaf = requestAnimationFrame(this._frame);
    }
  }

  _onResize() {
    this.updateNow();
  }

  _onVisibility() {
    this.connectors.setAmbientPaused(document.hidden || this.isOffscreen);
  }

  _frame() {
    this.pendingRaf = null;
    this.updateNow();
  }

  updateNow() {
    if (this.reducedMotion) {
      this._resetReducedStyles();
      this.workflow.transitionToScenario(this.workflow.activeScenarioId, true);
      return;
    }

    const isMobile = window.innerWidth < 1024;
    const progress = this.readNormalizedProgress();
    const state = this.sandboxOpen
      ? {
          ...evaluateSceneState(0.365, isMobile),
          xPct: 0,
          yPct: isMobile ? 2 : 3,
          scale: isMobile ? 0.99 : 0.96,
          rotX: 0,
          rotY: 0,
          sep: 0,
          monitor: 0,
          light: 0,
          edgeDraw: 1,
          execStep: -1,
          focus: { amount: 0, cursor: 0 },
          scenarioFrom: this.workflow.activeScenarioId,
          scenarioTo: this.workflow.activeScenarioId,
          scenarioBlend: 1,
          activeScene: 2,
          copyWeights: [0, 0, 0, 0, 0, 0],
          heroSplit: 1,
        }
      : evaluateSceneState(progress, isMobile);

    // 1. Update persistent 3D rig variables cleanly (GPU transform-only updates)
    if (this.rigEl) {
      this.rigEl.style.setProperty('--rig-x', `${state.xPct.toFixed(2)}%`);
      this.rigEl.style.setProperty('--rig-y', `${state.yPct.toFixed(2)}%`);
      this.rigEl.style.setProperty('--rig-scale', state.scale.toFixed(4));
      this.rigEl.style.setProperty('--rig-rx', `${state.rotX.toFixed(2)}deg`);
      this.rigEl.style.setProperty('--rig-ry', `${state.rotY.toFixed(2)}deg`);
      this.rigEl.style.setProperty('--sep', state.sep.toFixed(4));
      this.rigEl.style.setProperty('--monitor', state.monitor.toFixed(4));
      this.rigEl.style.setProperty('--execution-focus', state.focus.amount.toFixed(4));
    }

    // Readability scrim blend during Scene 03 close-up zoom
    if (this.stageEl) {
      const zoomScrim = Math.max(0, Math.min(1, (state.scale - 1.12) / 0.2));
      this.stageEl.style.setProperty('--zoom-scrim', zoomScrim.toFixed(3));
      this.stageEl.style.setProperty('--hero-split', state.heroSplit.toFixed(3));
      this.stageEl.style.setProperty('--brand-alpha', this.sandboxOpen ? '0' : (1-state.heroSplit).toFixed(3));
      this.stageEl.style.setProperty('--brand-rise', `${(-state.heroSplit*110).toFixed(1)}px`);
      this.stageEl.dataset.progress = progress.toFixed(4);
      this.stageEl.dataset.scene = String(state.activeScene+1);
      this._updateSignal(progress, isMobile, state.light);
    }

    // 2. Smooth background & shell surface palette transition for Scene 05
    this.root.style.setProperty('--theme-light-mix', state.light.toFixed(4));
    this.root.style.setProperty('--page-bg', mixRgb(DARK_PAGE, LIGHT_PAGE, state.light));
    const pageRgb=DARK_PAGE.map((v,i)=>v+(LIGHT_PAGE[i]-v)*state.light);
    const shellRgb=DARK_SHELL.map((v,i)=>v+(LIGHT_SHELL[i]-v)*state.light);
    this.root.style.setProperty('--page-ink',rgbString(legibleInk(pageRgb)));
    this.root.style.setProperty('--page-muted',rgbString(legibleInk(pageRgb,true)));
    this.shellEl?.style.setProperty('--page-ink',rgbString(legibleInk(shellRgb)));
    this.shellEl?.style.setProperty('--page-muted',rgbString(legibleInk(shellRgb,true)));
    this.root.style.setProperty('--shell-surface', mixRgb(DARK_SHELL, LIGHT_SHELL, state.light));
    this.root.style.setProperty('--shell-elevated', mixRgb(DARK_ELEVATED, LIGHT_ELEVATED, state.light));
    this.root.style.setProperty('--shell-border', mixRgb(DARK_BORDER, LIGHT_BORDER, state.light));

    if (this.shellEl) {
      this.shellEl.setAttribute('data-theme-surface', state.light > 0.5 ? 'light' : 'dark');
    }
    if (this.themeMeta) {
      this.themeMeta.setAttribute('content', state.light > 0.5 ? '#EFECE4' : '#121412');
    }

    // 3. Exploded Scene 02 architectural guide connectors
    this._updateExplodedGuides(state.sep, isMobile);

    // 4. Synchronous shared-geometry workflow morph & execution rendering
    if (this.sandboxOpen) {
      if (!this.workflow.tweenRaf) {
        this.workflow.renderGraphBlend(
          this.workflow.activeScenarioId,
          this.workflow.activeScenarioId,
          1,
          -1,
          1
        );
      }
    } else {
      if (state.activeScene !== 3 && (progress < 0.45 || progress > 0.68)) {
        this.manualScenario = null;
      }

      if (state.activeScene === 3 && this.manualScenario) {
        if (!this.workflow.tweenRaf) {
          this.workflow.renderGraphBlend(
            this.manualScenario,
            this.manualScenario,
            1,
            state.execStep,
            state.edgeDraw
          );
        }
      } else {
        this.workflow.renderGraphBlend(
          state.scenarioFrom,
          state.scenarioTo,
          state.scenarioBlend,
          state.execStep,
          state.edgeDraw,
          state.focus
        );
      }
    }

    // 5. Switch active sidebar item coherently for Scene 05 monitoring
    const desiredSidebar = state.monitor > 0.5 ? 'activity' : 'workflows';
    if (desiredSidebar !== this.lastSidebarMode) {
      this.lastSidebarMode = desiredSidebar;
      this.workflow.setSidebarModule(desiredSidebar);
    }

    // 6. Crossfade Scene narrative layers and isolate inactive chapters via inert + aria-hidden
    this.sceneEls.forEach((secEl, idx) => {
      const w = state.copyWeights[idx] ?? 0;
      const isActive = idx === state.activeScene && !this.sandboxOpen;
      const isInteractive = isActive && w >= 0.35;
      secEl.classList.toggle('is-active', isActive);
      secEl.style.setProperty('--scene-alpha', w.toFixed(3));
      const shift = (1 - w) * (idx === 0 ? -24 : 20);
      secEl.style.setProperty('--scene-shift-y', `${shift.toFixed(1)}px`);
      secEl.dataset.interactive = isInteractive ? 'true' : 'false';

      // Keyboard & screen-reader isolation on hidden chapters
      secEl.inert = !isInteractive;
      if (isInteractive) {
        secEl.removeAttribute('aria-hidden');
      } else {
        secEl.setAttribute('aria-hidden', 'true');
      }
    });

    // 7. Update discreet side story rail
    this.railLinks.forEach((link, idx) => {
      link.classList.toggle('is-active', idx === state.activeScene);
    });
  }

  _updateSignal(progress, isMobile, light) {
    if (!this.signalRoute || !this.signalBase || !this.signalPacket) return;
    if (this.signalMobile !== isMobile) {
      this.signalMobile = isMobile;
      const d = isMobile
        ? 'M-10 355 H22 Q32 355 32 365 V680 Q32 696 48 696 H333 Q350 696 350 679 V470 Q350 454 366 454 H410'
        : 'M-20 735 H244 Q280 735 280 699 V515 Q280 479 316 479 H475 Q511 479 511 515 V733 Q511 769 547 769 H1085 Q1121 769 1121 733 V420 Q1121 384 1157 384 H1460';
      this.signalRoute.setAttribute('viewBox', isMobile ? '0 0 390 844' : '0 0 1440 900');
      this.signalBase.setAttribute('d',d);
      this.signalPacket.setAttribute('d',d);
    }
    // One scroll-driven editorial route, no extra loop or layout reads.
    this.signalPacket.style.strokeDashoffset = String(-progress*860-24);
    this.signalRoute.style.opacity = this.sandboxOpen ? '0' : String(0.95-light*0.5);
  }

  _resetReducedStyles() {
    this.root.style.removeProperty('--page-bg');
    this.root.style.removeProperty('--page-ink');
    this.root.style.removeProperty('--page-muted');
    this.root.style.removeProperty('--shell-surface');
    this.root.style.removeProperty('--shell-elevated');
    this.root.style.removeProperty('--shell-border');
    if (this.stageEl) {
      this.stageEl.style.removeProperty('--zoom-scrim');
      this.stageEl.style.removeProperty('--hero-split');
    }
    if (this.shellEl) { this.shellEl.setAttribute('data-theme-surface', 'dark'); this.shellEl.style.removeProperty('--page-ink'); this.shellEl.style.removeProperty('--page-muted'); }
    if (this.rigEl) {
      this.rigEl.style.removeProperty('--rig-x');
      this.rigEl.style.removeProperty('--rig-y');
      this.rigEl.style.removeProperty('--rig-scale');
      this.rigEl.style.removeProperty('--rig-rx');
      this.rigEl.style.removeProperty('--rig-ry');
      this.rigEl.style.removeProperty('--sep');
      this.rigEl.style.removeProperty('--monitor');
      this.rigEl.style.removeProperty('--execution-focus');
    }
    if (this.guidesSvg) this.guidesSvg.style.opacity = '0';
    this.sceneEls.forEach((secEl) => {
      secEl.style.removeProperty('--scene-alpha');
      secEl.style.removeProperty('--scene-shift-y');
      secEl.dataset.interactive = 'true';
      secEl.inert = false;
      secEl.removeAttribute('aria-hidden');
    });
  }
}
