/**
 * RELAY — Master Scroll Timeline & Reversible Choreography Controller
 * Maps native browser scroll position into [0..1] normalized progress,
 * updates persistent CSS 3D rig variables, coordinates shared-geometry workflow
 * morphing, manages Scene 02 architectural depth guides, enforces inert/aria-hidden
 * on inactive chapters, and restores static accessibility under reduced motion.
 */

import { evaluateSceneState, SCENE_ANCHORS } from './scenes.js?v=10';

const setVar=(el,key,value)=>{if(el&&el.style.getPropertyValue(key)!==value)el.style.setProperty(key,value);};
const SVG_NS = 'http://www.w3.org/2000/svg';

export class MotionController {
  constructor(workflow, connectors) {
    this.workflow = workflow;
    this.connectors = connectors;

    this.root = document.documentElement;
    this.trackEl = document.getElementById('experience-track');
    this.stageEl = document.getElementById('stage-viewport');
    this.stickyEl = document.getElementById('stage-sticky');
    this.monitorPanel=document.getElementById('ws-monitor-panel');
    this.graphPanel=document.querySelector('.ws-body-grid');
    this.historyPanel=document.getElementById('layer-history');
    this.lastMonitor=0;
    this.rigEl = document.getElementById('workspace-rig');
    this.shellEl = document.getElementById('relay-shell');
    this.guidesSvg = document.getElementById('exploded-guides');
    this.sceneEls = Array.from(document.querySelectorAll('.scene'));

    this.signalRoute = document.getElementById('relay-signal-route');
    this.signalBase = document.getElementById('signal-base');
    this.signalPacket = document.getElementById('signal-packet');
    this.signalMobile = null;
    this.manualScenario = null;
    this.scrollHandoff=null;
    this.lastProgress=null;
    this.sandboxOpen = false;
    this.sandboxModule='workflows';
    this.workflow.onModuleChange=module=>{
      if(module!=='workflows'&&module!=='activity')return;
      if(this.sandboxOpen||this.reducedMotion)this.showSandboxModule(module);
      else this.scrollToSceneIndex(module==='activity'?4:2);
    };
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
        this.workflow.cancelManualWork();this.manualScenario=null;this.scrollHandoff=null;
        this._applyMotionPreference();
      });
    }

    if ('IntersectionObserver' in window && this.trackEl) {
      this.observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          this.isOffscreen = entry ? !entry.isIntersecting : false;
          this._syncAmbient();
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

    const sidebarW = document.getElementById('layer-sidebar')?.offsetWidth || 204;
    const inspectorW = document.getElementById('layer-inspector')?.offsetWidth || 232;
    const historyH = document.getElementById('layer-history')?.offsetHeight || 92;
    const coords = isMobile
      ? [
          // Vertical guides between top bar and canvas, and canvas to history
          [w * 0.18, 44, w * 0.18, 44 - sep * 14],
          [w * 0.82, 44, w * 0.82, 44 - sep * 14],
          [w * 0.25, h - historyH, w * 0.25, h - historyH + sep * 20],
          [w * 0.75, h - historyH, w * 0.75, h - historyH + sep * 20],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ]
      : [
          // Sidebar right edge <-> canvas left edge
          [sidebarW - sep * 42, 72 - sep * 10, sidebarW, 72 - sep * 10],
          [sidebarW - sep * 42, h - 72 - sep * 10, sidebarW, h - 72 - sep * 10],
          // Canvas right edge <-> Inspector left edge
          [w - inspectorW, 92 - sep * 10, w - inspectorW + sep * 62, 92 + sep * 14],
          [w - inspectorW, h - 130 - sep * 10, w - inspectorW + sep * 62, h - 130 + sep * 14],
          // Canvas bottom <-> History top
          [sidebarW + 52, h - historyH - sep * 10, sidebarW + 52 + sep * 18, h - historyH + sep * 38],
          [w - inspectorW - 48, h - historyH - sep * 10, w - inspectorW - 48 + sep * 18, h - historyH + sep * 38],
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
    this.scrollHandoff=null;
    this.manualScenario=scenarioId;
    this.workflow.transitionToScenario(scenarioId,this.reducedMotion);
  }

  showSandboxModule(module) {
    this.sandboxModule=module;
    this.workflow.setSidebarModule(module);
    if(this.reducedMotion&&!this.sandboxOpen)return;
    this.updateNow();
  }

  setSandboxMode(active) {
    this.workflow.cancelManualWork();this.manualScenario=null;this.scrollHandoff=null;
    this.sandboxOpen=Boolean(active);
    this.sandboxModule='workflows';this.lastSidebarMode=null;this.workflow.setSidebarModule('workflows');
    this.root.classList.toggle('is-sandbox-open',this.sandboxOpen);
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
    const scrollable = Math.max(1, this.trackEl.offsetHeight - (this.stickyEl?.offsetHeight || window.innerHeight));
    return Math.max(0, Math.round(trackTop + progress * scrollable));
  }

  readNormalizedProgress() {
    if (!this.trackEl) return 0;
    const rect = this.trackEl.getBoundingClientRect();
    const scrollable = Math.max(1, this.trackEl.offsetHeight - (this.stickyEl?.offsetHeight || window.innerHeight));
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
    // Coalesce resize and scroll bursts into one render, including orientation changes.
    if(!this.pendingRaf)this.pendingRaf=requestAnimationFrame(this._frame);
  }

  _syncAmbient() {
    this.connectors.setAmbientPaused(document.hidden || (!this.sandboxOpen && this.isOffscreen) || this.lastMonitor>=.995);
  }

  _onVisibility() {
    this._syncAmbient();
  }

  _frame() {
    this.pendingRaf = null;
    this.updateNow();
  }

  updateNow() {
    if (this.reducedMotion&&!this.sandboxOpen) {
      this._resetReducedStyles();
      if(this.workflow.manualRunOwned)this.workflow.renderGraphBlend(this.workflow.activeScenarioId,this.workflow.activeScenarioId,1,this.workflow.manualExecutionStep,1);
      else this.workflow.renderGraphBlend(this.workflow.activeScenarioId,this.workflow.activeScenarioId,1);
      return;
    }

    const isMobile = window.innerWidth < 1024;
    const progress = this.readNormalizedProgress();
    const moved=this.lastProgress!==null&&Math.abs(progress-this.lastProgress)>1e-6;
    if(!this.sandboxOpen&&moved&&(this.manualScenario||this.workflow.manualRunOwned||this.workflow.tweenRaf!==null)){
      this.scrollHandoff={snapshot:this.workflow.graphSnapshot,origin:this.lastProgress,distance:0};
      this.manualScenario=null;this.workflow.cancelManualWork();
    }
    if(this.scrollHandoff&&moved)this.scrollHandoff.distance+=Math.abs(progress-this.lastProgress);
    this.lastProgress=progress;
    const state = this.sandboxOpen
      ? {
          ...evaluateSceneState(0.365, isMobile),
          xPct: 0,
          yPct: 0,
          scale: isMobile ? 0.99 : 0.96,
          rotX: 0,
          rotY: 0,
          sep: 0,
          monitor: this.sandboxModule==='activity'?1:0,
          light: 0,
          edgeDraw: 1,
          execStep: -1,
          focus: { amount: 0, cursor: 0 },
          scenarioFrom: this.workflow.activeScenarioId,
          scenarioTo: this.workflow.activeScenarioId,
          scenarioBlend: 1,
          activeScene: 2,
          copyWeights: [0, 0, 0, 0, 0, 0],
          copyShift: 0,
          portraitRoom: 0,
          heroSplit: 1,
        }
      : evaluateSceneState(progress, isMobile);

    // 1. Update persistent 3D rig variables cleanly (GPU transform-only updates)
    if (this.rigEl) {
      setVar(this.rigEl,'--rig-x', `${state.xPct.toFixed(2)}%`);
      setVar(this.rigEl,'--rig-y', `${state.yPct.toFixed(2)}%`);
      setVar(this.rigEl,'--rig-scale', state.scale.toFixed(4));
      setVar(this.rigEl,'--rig-rx', `${state.rotX.toFixed(2)}deg`);
      setVar(this.rigEl,'--rig-ry', `${state.rotY.toFixed(2)}deg`);
      setVar(this.rigEl,'--sep', state.sep.toFixed(4));
      setVar(this.rigEl,'--monitor', state.monitor.toFixed(4));
      setVar(this.rigEl,'--execution-focus', state.focus.amount.toFixed(4));
      setVar(this.rigEl,'--portrait-room', state.portraitRoom.toFixed(4));
    }

    // Readability scrim blend during Scene 03 close-up zoom
    if (this.stageEl) {
      const zoomScrim = Math.max(0, Math.min(1, (state.scale - 1.12) / 0.2));
      setVar(this.stageEl,'--zoom-scrim', zoomScrim.toFixed(3));
      setVar(this.stageEl,'--hero-split', state.heroSplit.toFixed(3));
      setVar(this.stageEl,'--brand-alpha', this.sandboxOpen ? '0' : (1-state.heroSplit).toFixed(3));
      setVar(this.stageEl,'--brand-rise', `${(-state.heroSplit*110).toFixed(1)}px`);
      this.stageEl.dataset.progress = progress.toFixed(4);
      if(this.stageEl.dataset.scene!==String(state.activeScene+1))this.stageEl.dataset.scene=String(state.activeScene+1);
      this._updateSignal(progress, isMobile, state.light);
    }

    // 2. Reveal a solid light backdrop behind the stable product plane.
    setVar(this.stageEl,'--monitor-light',state.light.toFixed(4));

    // 3. Exploded Scene 02 architectural guide connectors
    this._updateExplodedGuides(state.sep, isMobile);

    // 4. Exactly one graph owner: manual tween/run, sandbox, or timeline.
    if(this.workflow.tweenRaf!==null){
      // The existing manual RAF owns the graph until input explicitly releases it.
    }else if(this.workflow.manualRunOwned){
      this.workflow.renderGraphBlend(this.workflow.activeScenarioId,this.workflow.activeScenarioId,1,this.workflow.manualExecutionStep,1);
    }else if(this.sandboxOpen||this.manualScenario){
      const id=this.manualScenario||this.workflow.activeScenarioId;
      this.workflow.renderGraphBlend(id,id,1);
    }else{
      const handoff=this.scrollHandoff&&{snapshot:this.scrollHandoff.snapshot,amount:Math.min(1,this.scrollHandoff.distance/.025)};
      this.workflow.renderGraphBlend(state.scenarioFrom,state.scenarioTo,state.scenarioBlend,state.execStep,state.edgeDraw,state.focus,handoff);
      if(handoff?.amount>=1)this.scrollHandoff=null;
    }

    const interactive = state.monitor >= .95;
    if(this.monitorPanel){if(this.monitorPanel.inert===interactive)this.monitorPanel.inert=!interactive;if(this.monitorPanel.getAttribute('aria-hidden')!==String(!interactive))this.monitorPanel.setAttribute('aria-hidden',String(!interactive));}
    // The opaque monitor covers these controls, so they must not remain tabbable.
    for(const panel of [this.graphPanel,this.historyPanel])if(panel)panel.inert=interactive;
    this.lastMonitor=state.monitor;
    this._syncAmbient();
    // 5. Switch active sidebar item coherently for Scene 05 monitoring
    const desiredSidebar = this.sandboxOpen?this.sandboxModule:state.monitor > 0.5 ? 'activity' : 'workflows';
    if (desiredSidebar !== this.lastSidebarMode) {
      this.lastSidebarMode = desiredSidebar;
      this.workflow.setSidebarModule(desiredSidebar);
    }

    // 6. Sequential narrative handoff and isolate inactive chapters via inert + aria-hidden
    this.sceneEls.forEach((secEl, idx) => {
      const w = state.copyWeights[idx] ?? 0;
      const isActive = idx === state.activeScene && !this.sandboxOpen;
      const isInteractive = isActive && w >= 0.35;
      secEl.classList.toggle('is-active', isActive);
      setVar(secEl,'--scene-alpha', w.toFixed(3));
      const shift = isActive ? state.copyShift : 0;
      setVar(secEl,'--scene-shift-y', `${shift.toFixed(1)}px`);
      if(secEl.dataset.interactive!==String(isInteractive))secEl.dataset.interactive=String(isInteractive);

      // Keyboard & screen-reader isolation on hidden chapters
      if(secEl.inert===isInteractive)secEl.inert=!isInteractive;
      if(isInteractive){if(secEl.hasAttribute('aria-hidden'))secEl.removeAttribute('aria-hidden');}
      else if(secEl.getAttribute('aria-hidden')!=='true')secEl.setAttribute('aria-hidden','true');
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
    this.signalRoute.style.opacity = this.sandboxOpen ? '0' : String(0.95*(1-light));
  }

  _resetReducedStyles() {
    if (this.stageEl) {
      this.stageEl.style.removeProperty('--zoom-scrim');
      this.stageEl.style.removeProperty('--hero-split');
      this.stageEl.style.removeProperty('--monitor-light');
    }
    if (this.rigEl) {
      this.rigEl.style.removeProperty('--rig-x');
      this.rigEl.style.removeProperty('--rig-y');
      this.rigEl.style.removeProperty('--rig-scale');
      this.rigEl.style.removeProperty('--rig-rx');
      this.rigEl.style.removeProperty('--rig-ry');
      this.rigEl.style.removeProperty('--sep');
      this.rigEl.style.removeProperty('--monitor');
      this.rigEl.style.removeProperty('--execution-focus');
      this.rigEl.style.removeProperty('--portrait-room');
    }
    const activity=this.sandboxModule==='activity';
    if(this.monitorPanel){this.monitorPanel.inert=!activity;this.monitorPanel.setAttribute('aria-hidden',String(!activity));}
    for(const panel of [this.graphPanel,this.historyPanel])if(panel)panel.inert=activity;
    this.lastMonitor=activity?1:0;
    this._syncAmbient();
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
