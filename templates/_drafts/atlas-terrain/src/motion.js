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
    readNativeProgress = null,
    onSettleChange = () => {},
    onAmbientChange = () => {},
    clock = { now:()=>performance.now(), raf:fn=>requestAnimationFrame(fn), cancelRaf:id=>cancelAnimationFrame(id), timer:(fn,ms)=>setTimeout(fn,ms), cancelTimer:id=>clearTimeout(id) },
  } = options;

  let targetProgress = 0;
  let currentProgress = 0;
  let followNative = false;
  let targetYaw = 0;
  let currentYaw = 0;
  let targetPitch = 0;
  let currentPitch = 0;

  let ambientTime = 0;
  let lastTickMs = 0;
  let lastAmbientDrawMs = 0;
  let idleTimer=0;
  let ambientRafId=0;
  let ambientReported=false;
  let rafId = 0;
  let settled = true;
  let dirty = true;

  let paused = false;
  let reducedMotion = false;
  let visible = true;
  let ambientActive = false; // True only when water/clouds are visible and not still
  let mobileCap30 = typeof window !== 'undefined' && window.innerWidth <= 820;
  let softwareThrottle = false;

  function setSettled(next) {
    if (settled === next) return;
    settled = next;
    onSettleChange(settled);
  }

  function canAnimate(){return visible&&!paused&&!reducedMotion&&!softwareThrottle&&ambientActive&&settled;}
  function reportAmbient(next){
    if(ambientReported!==next){ambientReported=next;onAmbientChange(next);}
  }
  function cancelIdle(){
    if(idleTimer){clock.cancelTimer(idleTimer);idleTimer=0;}
    if(ambientRafId){clock.cancelRaf(ambientRafId);ambientRafId=0;}
    lastAmbientDrawMs=0;reportAmbient(false);
  }
  function cancelFrame(){if(rafId){clock.cancelRaf(rafId);rafId=0;}}
  function schedule(){
    cancelIdle();
    if(rafId||!visible||paused)return;
    lastTickMs=clock.now();rafId=clock.raf(loop);
  }
  function scheduleAmbient(){
    if(!canAnimate()){cancelIdle();return;}
    if(idleTimer||rafId||ambientRafId)return;
    if(!lastAmbientDrawMs)lastAmbientDrawMs=clock.now();
    reportAmbient(true);
    const interval=mobileCap30?1000/12:1000/18;
    idleTimer=clock.timer(()=>{
      idleTimer=0;
      if(!canAnimate()){cancelIdle();return;}
      ambientRafId=clock.raf(now=>{
        ambientRafId=0;
        if(!canAnimate()){cancelIdle();return;}
        // Freeze elapsed time across suspension and bound long-frame catch-up.
        ambientTime+=clamp((now-lastAmbientDrawMs)*.001,0,.15);
        lastAmbientDrawMs=now;
        draw(false);
        scheduleAmbient();
      });
    },interval);
  }
  function draw(isMoving){
    const state=onFrame(currentProgress,ambientTime,currentYaw,currentPitch,isMoving);
    ambientActive=Boolean(state?.ambientEligible);
    return state;
  }

  function stepFollow(cur, tgt, dtSec, rate) {
    const diff = tgt - cur;
    if (Math.abs(diff) < 1e-5) return tgt;
    const alpha = 1 - Math.exp(-rate * dtSec);
    return cur + diff * alpha;
  }

  function loop(now) {
    rafId = 0;
    if (!visible||paused) return;

    const rawDt = (now - lastTickMs) * 0.001;
    lastTickMs = now;
    const dt = clamp(rawDt, 0.001, 0.05);

    // Read layout before any frame writes. Only poll during a native scroll
    // follow; never start an idle RAF or override explicit immediate poses.
    if(followNative&&!reducedMotion&&readNativeProgress){
      const native=readNativeProgress();
      if(Number.isFinite(native))targetProgress=clamp(native,0,1);
    }
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

    // Do not spend another ~14 frames chasing subpixel scroll differences.
    // At the last observed mobile track length this is less than one CSS px.
    // Keep the exact final pose, the active-motion rate and all angle thresholds.
    if(Math.abs(targetProgress-currentProgress)<.00015)currentProgress=targetProgress;
    if(Math.abs(targetYaw-currentYaw)<1e-4)currentYaw=targetYaw;
    if(Math.abs(targetPitch-currentPitch)<1e-4)currentPitch=targetPitch;
    const progressPending=currentProgress!==targetProgress;
    if(!progressPending)followNative=false;
    const motionPending=progressPending||currentYaw!==targetYaw||currentPitch!==targetPitch;

    const moved =
      dirty ||
      Math.abs(currentProgress - prevP) > 1e-7 ||
      Math.abs(currentYaw - prevY) > 1e-6 ||
      Math.abs(currentPitch - prevX) > 1e-6;

    if(moved){dirty=false;draw(motionPending);}
    if(motionPending){
      setSettled(false);
      if(visible&&!paused)rafId=clock.raf(loop);
    }else{
      setSettled(true);
      scheduleAmbient();
    }
  }

  return {
    setTargetProgress(p, immediate = false) {
      const next = clamp(p, 0, 1);
      if (immediate || reducedMotion) {
        followNative=false;
        targetProgress = next;
        currentProgress = next;
        dirty = true;
        setSettled(false);
        cancelIdle();cancelFrame();
        if(visible){draw(false);dirty=false;}
        setSettled(true);
        scheduleAmbient();
        return;
      }
      if (Math.abs(next - targetProgress) > 1e-6) {
        followNative=Boolean(readNativeProgress);
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
      dirty=true;
      cancelIdle();cancelFrame();
      if(!paused&&visible)schedule();
      else{ambientActive=false;setSettled(true);}
    },

    setReducedMotion(nextReduced) {
      reducedMotion = Boolean(nextReduced);
      cancelIdle();cancelFrame();
      if (reducedMotion) {
        followNative=false;
        currentProgress = targetProgress;
        currentYaw = targetYaw;
        currentPitch = targetPitch;
        dirty = true;
        if(visible&&!paused){draw(false);dirty=false;}
        setSettled(true);
      } else if (visible) {
        schedule();
      }
    },

    setVisible(nextVisible) {
      const next=Boolean(nextVisible);
      if(next===visible)return;
      visible=next;
      cancelIdle();cancelFrame();
      if(visible&&!paused){dirty=true;schedule();}
    },

    setMobileRate(isMobile) {
      mobileCap30 = Boolean(isMobile);
    },

    setSoftwareThrottle(enabled) {
      softwareThrottle=Boolean(enabled);
      if(softwareThrottle)cancelIdle();else if(settled)scheduleAmbient();
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
        settled,ambientTime,ambientRunning:ambientReported,
      };
    },

    dispose() {
      visible=false;paused=true;cancelIdle();cancelFrame();
    },
  };
}
