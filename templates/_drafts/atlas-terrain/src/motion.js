/**
 * ATLAS — Demand-Driven Motion & Timeline Controller
 * Smoothly follows native window scroll with bounded followValue convergence,
 * handles optional viewpoint inspection damping, suspends offscreen/hidden RAF,
 * and ensures zero CPU/GPU churn once settled in static-atmosphere chapters.
 */

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function createMotionController(options) {
  const {
    onFrame,
    onSettleChange = () => {},
  } = options;

  let targetProgress = 0;
  let currentProgress = 0;
  let targetYaw = 0;
  let currentYaw = 0;
  let targetPitch = 0;
  let currentPitch = 0;

  let ambientTime = 0;
  let lastTickMs = 0;
  let lastAmbientDrawMs = 0;
  let rafId = 0;
  let settled = true;
  let dirty = true;

  let paused = false;
  let reducedMotion = false;
  let visible = true;
  let ambientActive = false; // True only when water/clouds are visible and not still
  let mobileCap30 = typeof window !== 'undefined' && window.innerWidth <= 820;

  function setSettled(next) {
    if (settled === next) return;
    settled = next;
    onSettleChange(settled);
  }

  function schedule() {
    if (rafId || !visible) return;
    lastTickMs = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function stepFollow(cur, tgt, dtSec, rate) {
    const diff = tgt - cur;
    if (Math.abs(diff) < 1e-5) return tgt;
    const alpha = 1 - Math.exp(-rate * dtSec);
    return cur + diff * alpha;
  }

  function loop(now) {
    rafId = 0;
    if (!visible) return;

    const rawDt = (now - lastTickMs) * 0.001;
    lastTickMs = now;
    const dt = clamp(rawDt, 0.001, 0.05);

    const prevP = currentProgress;
    const prevY = currentYaw;
    const prevX = currentPitch;

    if (reducedMotion) {
      currentProgress = targetProgress;
      currentYaw = targetYaw;
      currentPitch = targetPitch;
    } else {
      // Smooth responsive follow without overshoot
      currentProgress = stepFollow(currentProgress, targetProgress, dt, 12.5);
      currentYaw = stepFollow(currentYaw, targetYaw, dt, 10.0);
      currentPitch = stepFollow(currentPitch, targetPitch, dt, 10.0);
    }

    const motionPending =
      Math.abs(targetProgress - currentProgress) >= 1e-5 ||
      Math.abs(targetYaw - currentYaw) >= 1e-4 ||
      Math.abs(targetPitch - currentPitch) >= 1e-4;

    const moved =
      dirty ||
      Math.abs(currentProgress - prevP) > 1e-7 ||
      Math.abs(currentYaw - prevY) > 1e-6 ||
      Math.abs(currentPitch - prevX) > 1e-6;

    // Gentle ambient water ripples & cloud drift only when visible, unpaused, and active in middle chapters
    const shouldAnimateAmbient = false; // deterministic scroll choreography
    let ambientTick = false;

    if (shouldAnimateAmbient) {
      const interval = mobileCap30 ? 32 : 16;
      if (moved || now - lastAmbientDrawMs >= interval) {
        ambientTime += dt;
        lastAmbientDrawMs = now;
        ambientTick = true;
      }
    }

    if (moved || ambientTick) {
      dirty = false;
      const state = onFrame(currentProgress, ambientTime, currentYaw, currentPitch, motionPending);
      if (state) {
        ambientActive = state.relief > 0.28 && state.mapMix < 0.78;
      }
    }

    if (motionPending) {
      setSettled(false);
      rafId = requestAnimationFrame(loop);
    } else if (shouldAnimateAmbient && visible) {
      setSettled(true);
      rafId = requestAnimationFrame(loop);
    } else {
      setSettled(true);
    }
  }

  return {
    setTargetProgress(p, immediate = false) {
      const next = clamp(p, 0, 1);
      if (immediate || reducedMotion) {
        targetProgress = next;
        currentProgress = next;
        dirty = true;
        setSettled(false);
        const state = onFrame(currentProgress, ambientTime, currentYaw, currentPitch, false);
        if (state) {
          ambientActive = state.relief > 0.28 && state.mapMix < 0.78;
        }
        setSettled(true);
        if (!paused && !reducedMotion && ambientActive && visible) schedule();
        return;
      }
      if (Math.abs(next - targetProgress) > 1e-6) {
        targetProgress = next;
        setSettled(false);
        schedule();
      }
    },

    setInspectOffset(yaw, pitch) {
      const clampedYaw = clamp(yaw, -0.78, 0.78);
      const clampedPitch = clamp(pitch, -0.34, 0.34);
      if (Math.abs(clampedYaw - targetYaw) > 1e-4 || Math.abs(clampedPitch - targetPitch) > 1e-4) {
        targetYaw = clampedYaw;
        targetPitch = clampedPitch;
        setSettled(false);
        schedule();
      }
    },

    resetInspect(immediate = false) {
      targetYaw = 0;
      targetPitch = 0;
      if (immediate) {
        currentYaw = 0;
        currentPitch = 0;
        dirty = true;
      }
      schedule();
    },

    setPaused(nextPaused) {
      paused = Boolean(nextPaused);
      dirty = true;
      if (!paused && visible) {
        schedule();
      } else {
        onFrame(currentProgress, ambientTime, currentYaw, currentPitch, false);
        setSettled(true);
      }
    },

    setReducedMotion(nextReduced) {
      reducedMotion = Boolean(nextReduced);
      if (reducedMotion) {
        currentProgress = targetProgress;
        currentYaw = targetYaw;
        currentPitch = targetPitch;
        dirty = true;
        onFrame(currentProgress, ambientTime, currentYaw, currentPitch, false);
        setSettled(true);
      } else if (visible) {
        schedule();
      }
    },

    setVisible(nextVisible) {
      visible = Boolean(nextVisible);
      if (!visible && rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      } else if (visible) {
        dirty = true;
        schedule();
      }
    },

    setMobileRate(isMobile) {
      mobileCap30 = Boolean(isMobile);
    },

    forceRedraw() {
      dirty = true;
      schedule();
    },

    getState() {
      return {
        currentProgress,
        targetProgress,
        currentYaw,
        currentPitch,
        settled,
      };
    },

    dispose() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    },
  };
}
