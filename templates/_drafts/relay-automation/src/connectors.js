/**
 * RELAY — Synchronous Shared-Geometry SVG Connector & Signal Engine
 * Receives exact interpolated node bounding boxes from WorkflowController
 * on every frame so curves and moving data signals stay locked to ports across
 * forward/reverse scrolling, rapid scrubbing, and dynamic workflow morphs.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

export class ConnectorEngine {
  constructor(svgEl, boardEl) {
    this.svgEl = svgEl;
    this.boardEl = boardEl;
    this.edges = [];
    this.edgeKey = '';
    this.edgePaths = [];
    this.signalDots = [];
    this.drawProgress = 1;
    this.activeNodeIdx = -1;
    this.reducedMotion = false;
    this.isAmbientPaused = false;
    this.rafId = null;
    this.lastTime = 0;
    this.signalPhase = 0;
  }

  setReducedMotion(flag) {
    this.reducedMotion = Boolean(flag);
    this._syncAmbientLoop();
    this.signalDots.forEach((dot) => {
      dot.style.display = this.reducedMotion ? 'none' : '';
    });
  }

  setAmbientPaused(paused) {
    this.isAmbientPaused = Boolean(paused);
    this._syncAmbientLoop();
  }

  setEdges(edges) {
    const next = edges || [];
    const key = next.map((e) => `${e.from}-${e.to}-${e.dashed ? 1 : 0}`).join('|');
    if (key === this.edgeKey) return;
    this.edgeKey = key;
    this.edges = next;
    this._rebuildSvg();
  }

  _rebuildSvg() {
    if (!this.svgEl) return;
    this.edgePaths = [];
    this.signalDots = [];

    const frag = document.createDocumentFragment();
    this.edges.forEach((edge, idx) => {
      const basePath = document.createElementNS(SVG_NS, 'path');
      basePath.setAttribute(
        'class',
        edge.dashed ? 'connector-path is-secondary' : 'connector-path'
      );

      const activePath = document.createElementNS(SVG_NS, 'path');
      activePath.setAttribute('class', 'connector-path-active');

      const signal = document.createElementNS(SVG_NS, 'circle');
      signal.setAttribute('class', 'connector-signal');
      signal.setAttribute('r', edge.primary ? '3.4' : '2.2');
      signal.dataset.edgeIndex = String(idx);
      if (this.reducedMotion) signal.style.display = 'none';

      frag.append(basePath, activePath, signal);
      this.edgePaths.push({
        edge,
        basePath,
        activePath,
        signal,
        length: 140,
      });
      this.signalDots.push(signal);
    });

    this.svgEl.replaceChildren(frag);
  }

  /**
   * Synchronously recomputes SVG Bezier paths from live interpolated boxes.
   * Zero DOM layout reads of node transforms!
   */
  updateFromBoxes(boxes, opts = {}) {
    if (!this.svgEl || !boxes || !boxes.length) return;
    const bw = opts.boardW || this.boardEl?.clientWidth || 720;
    const bh = opts.boardH || this.boardEl?.clientHeight || 380;
    const isMobile = Boolean(opts.isMobile);
    this.drawProgress = Math.max(0.1, Math.min(1, opts.drawProgress ?? 1));
    this.activeNodeIdx = opts.activeNodeIdx ?? -1;

    this.svgEl.setAttribute('viewBox', `0 0 ${bw} ${bh}`);

    this.edgePaths.forEach((entry) => {
      const a = boxes[entry.edge.from];
      const b = boxes[entry.edge.to];
      if (!a || !b) return;

      let x1, y1, x2, y2, cx1, cy1, cx2, cy2;

      if (isMobile) {
        const horizontalGap = b.x - (a.x + a.w);
        if (horizontalGap > 10) {
          x1 = a.x + a.w;
          y1 = a.y + a.h * 0.5;
          x2 = b.x;
          y2 = b.y + b.h * 0.5;
          const dx = Math.max(18, (x2 - x1) * 0.55);
          cx1 = x1 + dx;
          cy1 = y1;
          cx2 = x2 - dx;
          cy2 = y2;
        } else {
          const goingDown = b.y >= a.y;
          x1 = a.x + a.w * 0.5;
          y1 = goingDown ? a.y + a.h : a.y;
          x2 = b.x + b.w * 0.5;
          y2 = goingDown ? b.y : b.y + b.h;
          const dy = Math.max(16, Math.abs(y2 - y1) * 0.52);
          cx1 = x1;
          cy1 = y1 + (goingDown ? dy : -dy);
          cx2 = x2;
          cy2 = y2 - (goingDown ? dy : -dy);
        }
      } else {
        const dxRaw = b.x - (a.x + a.w);
        if (dxRaw >= -14) {
          x1 = a.x + a.w;
          y1 = a.y + a.h * 0.5;
          x2 = b.x;
          y2 = b.y + b.h * 0.5;
          const curve = Math.max(34, Math.abs(x2 - x1) * 0.52);
          cx1 = x1 + curve;
          cy1 = y1;
          cx2 = x2 - curve;
          cy2 = y2;
        } else {
          const goingDown = b.y >= a.y;
          x1 = a.x + a.w * 0.5;
          y1 = goingDown ? a.y + a.h : a.y;
          x2 = b.x + b.w * 0.5;
          y2 = goingDown ? b.y : b.y + b.h;
          const dy = Math.max(26, Math.abs(y2 - y1) * 0.48);
          cx1 = x1;
          cy1 = y1 + (goingDown ? dy : -dy);
          cx2 = x2;
          cy2 = y2 - (goingDown ? dy : -dy);
        }
      }

      const d = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${cx2.toFixed(1)} ${cy2.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
      entry.basePath.setAttribute('d', d);
      entry.activePath.setAttribute('d', d);
      entry.length = entry.basePath.getTotalLength ? entry.basePath.getTotalLength() : 140;

      const len = entry.length || 140;
      if (entry.edge.dashed) {
        entry.basePath.style.strokeDasharray = '4 4';
        entry.basePath.style.strokeDashoffset = '0';
      } else {
        const vis = len * this.drawProgress;
        entry.basePath.style.strokeDasharray = `${vis.toFixed(1)} ${len.toFixed(1)}`;
        entry.basePath.style.strokeDashoffset = '0';
      }

      const active =
        this.activeNodeIdx >= 0 &&
        entry.edge.primary &&
        (entry.edge.to <= this.activeNodeIdx || entry.edge.from === this.activeNodeIdx - 1);
      entry.activePath.classList.toggle('is-active', active);
      if (active) {
        const vis = len * this.drawProgress;
        entry.activePath.style.strokeDasharray = `${vis.toFixed(1)} ${len.toFixed(1)}`;
      }
    });

    this._updateSignals();
    this._syncAmbientLoop();
  }

  _updateSignals() {
    if (this.reducedMotion) return;
    this.edgePaths.forEach((entry, idx) => {
      const dot = entry.signal;
      if (!entry.basePath.getPointAtLength || !entry.length) return;

      const isActive =
        this.activeNodeIdx < 0 ||
        (entry.edge.primary && entry.edge.to <= Math.max(1, this.activeNodeIdx + 1));

      if (!isActive && entry.edge.dashed) {
        dot.style.opacity = '0.2';
      } else {
        dot.style.opacity = entry.edge.primary ? '0.96' : '0.42';
      }

      const speed = this.activeNodeIdx >= 0 ? 0.65 : 0.40;
      const t = (this.signalPhase * speed + idx * 0.21) % 1;
      const dist = t * entry.length * Math.min(1, this.drawProgress);
      const pt = entry.basePath.getPointAtLength(dist);
      dot.setAttribute('cx', pt.x.toFixed(1));
      dot.setAttribute('cy', pt.y.toFixed(1));
    });
  }

  _syncAmbientLoop() {
    const shouldRun = !this.reducedMotion && !this.isAmbientPaused;
    if (shouldRun && !this.rafId) {
      this.lastTime = performance.now();
      const tick = (now) => {
        const dt = Math.min(0.05, (now - this.lastTime) / 1000);
        this.lastTime = now;
        this.signalPhase += dt;
        this._updateSignals();
        if (!this.reducedMotion && !this.isAmbientPaused) {
          this.rafId = requestAnimationFrame(tick);
        } else {
          this.rafId = null;
        }
      };
      this.rafId = requestAnimationFrame(tick);
    } else if (!shouldRun && this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
