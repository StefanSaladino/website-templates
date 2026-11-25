/**
 * RELAY — Normalized Scene Keyframes, Zoom-Pan Camera & Deterministic Morph Schedule
 * Maps scroll progress [0..1] into continuous 3D transforms, layer separation,
 * zoomed node-to-node execution camera tracking, workflow topology blends,
 * Scene 05 warm off-white observability transition, and non-gapped scene weights.
 */

export const SCENE_ANCHORS = [
  { id: 'scene-01', name: 'Opening', progress: 0.0 },
  { id: 'scene-02', name: 'Architecture', progress: 0.185 },
  { id: 'scene-03', name: 'Execution', progress: 0.365 },
  { id: 'scene-04', name: 'Adaptability', progress: 0.565 },
  { id: 'scene-05', name: 'Observability', progress: 0.76 },
  { id: 'scene-06', name: 'Resolution', progress: 0.96 },
];

// Coordinates used for Scene 03 zoomed workflow canvas tracking (nodes 0..5)
const DESKTOP_PAN_TARGETS = [
  { xPct: 16.0, yPct: 11.5 }, // 01 Receive enquiry
  { xPct: 5.5,  yPct: 11.5 }, // 02 Validate contact
  { xPct: -6.5, yPct: 11.5 }, // 03 Existing customer?
  { xPct: 5.5,  yPct: 0.5 },  // 04 Route qualified leads
  { xPct: -6.5, yPct: 0.5 },  // 05 Create CRM record
  { xPct: -15.0,yPct: 5.5 },  // 06 Notify assigned team
];

const MOBILE_PAN_TARGETS = [
  { xPct: 5.5, yPct: 2.0 },   // 01 top-left
  { xPct: -5.5, yPct: 2.0 },  // 02 top-right
  { xPct: -5.5, yPct: -2.5 }, // 03 mid-right
  { xPct: 5.5, yPct: -2.5 },  // 04 mid-left
  { xPct: 5.5, yPct: -6.5 }, // 05 bottom-left
  { xPct: -5.5, yPct: -6.5 },// 06 bottom-right
];

const DESKTOP_KEYS = [
  { p: 0.0,   xPct: 20.0, yPct: 15.0, scale: 0.96, rotX: 8, rotY: -12, sep: 0.00 },
  { p: 0.08,  xPct: 17.0, yPct: 8.0, scale: 0.91, rotX: 11, rotY: -15, sep: 0.35 },
  { p: 0.185, xPct: 15.5, yPct: 3.5,  scale: 0.80, rotX: 15,  rotY: -16, sep: 1.00 },
  { p: 0.275, xPct: 16.0, yPct: 11.5, scale: 1.34, rotX: 0,   rotY: 0,   sep: 0.00 },
  { p: 0.435, xPct: -15.0,yPct: 5.5,  scale: 1.34, rotX: 0,   rotY: 0,   sep: 0.00 },
  { p: 0.48,  xPct: 0.0, yPct: 13.0, scale: 0.90, rotX: 3, rotY: -3,  sep: 0.14 },
  { p: 0.635, xPct: 0.0, yPct: 13.0, scale: 0.90, rotX: 3, rotY: -3,  sep: 0.14 },
  { p: 0.72,  xPct: 0.0,  yPct: 7.5,  scale: 0.92, rotX: 0,   rotY: 0,   sep: 0.00 },
  { p: 0.82,  xPct: 0.0,  yPct: 7.5,  scale: 0.92, rotX: 0,   rotY: 0,   sep: 0.00 },
  { p: 0.88,  xPct: 0.0, yPct: -13.0, scale: 0.82, rotX: 5, rotY: -6, sep: 0.00 },
  { p: 1.0,   xPct: 0.0, yPct: -13.0, scale: 0.82, rotX: 5, rotY: -6, sep: 0.00 },
];

const MOBILE_KEYS = [
  { p: 0.0,   xPct: 0.0,  yPct: 0.0, scale: 0.96, rotX: 5.5, rotY: -4.5, sep: 0.00 },
  { p: 0.08,  xPct: 0.5,  yPct: 0.5,  scale: 0.99, rotX: 6.5, rotY: -4.5, sep: 0.35 },
  { p: 0.185, xPct: 0.0,  yPct: -1.5, scale: 0.93, rotX: 7.5, rotY: -4.0, sep: 1.00 },
  { p: 0.275, xPct: 5.5, yPct: 2.0, scale: 1.12, rotX: 0,   rotY: 0,    sep: 0.00 },
  { p: 0.435, xPct: -5.5,yPct: -6.5,scale: 1.12, rotX: 0,   rotY: 0,    sep: 0.00 },
  { p: 0.48,  xPct: 0.0,  yPct: 0.0,  scale: 0.98, rotX: 2.5, rotY: -2.0, sep: 0.08 },
  { p: 0.635, xPct: 0.0,  yPct: 0.0,  scale: 0.98, rotX: 2.5, rotY: -2.0, sep: 0.08 },
  { p: 0.72,  xPct: 0.0,  yPct: 0.0,  scale: 1.00, rotX: 0,   rotY: 0,    sep: 0.00 },
  { p: 0.82,  xPct: 0.0,  yPct: 0.0,  scale: 1.00, rotX: 0,   rotY: 0,    sep: 0.00 },
  { p: 0.88,  xPct: 0.0,  yPct: 0.5,  scale: 1.00, rotX: 4.0, rotY: -3.5, sep: 0.00 },
  { p: 1.0,   xPct: 0.0,  yPct: 0.5,  scale: 1.00, rotX: 4.0, rotY: -3.5, sep: 0.00 },
];

// Overlapping fade windows ensure zero accidental blank text frames and clean clearance during sweeps
const COPY_WINDOWS = [
  { inStart: -0.04, holdStart: 0.00, holdEnd: 0.075, outEnd: 0.12  }, // 01
  { inStart: 0.105, holdStart: 0.145,holdEnd: 0.195, outEnd: 0.228 }, // 02 (exits cleanly before zoom sweep)
  { inStart: 0.218, holdStart: 0.25, holdEnd: 0.425, outEnd: 0.465 }, // 03
  { inStart: 0.45,  holdStart: 0.485,holdEnd: 0.635, outEnd: 0.675 }, // 04
  { inStart: 0.66,  holdStart: 0.705,holdEnd: 0.815, outEnd: 0.858 }, // 05
  { inStart: 0.85,  holdStart: 0.89, holdEnd: 1.00,  outEnd: 1.05  }, // 06 (enters after rig swings right)
];

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function smoothstep(t) {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function mixRgb(c1, c2, t) {
  const f = clamp01(t);
  const r = Math.round(lerp(c1[0], c2[0], f));
  const g = Math.round(lerp(c1[1], c2[1], f));
  const b = Math.round(lerp(c1[2], c2[2], f));
  return `rgb(${r}, ${g}, ${b})`;
}

function samplePanTargets(targets, stepFloat) {
  const maxIdx = targets.length - 1;
  const clamped = Math.max(0, Math.min(maxIdx, stepFloat));
  const i0 = Math.floor(clamped);
  const i1 = Math.min(maxIdx, i0 + 1);
  const f = smoothstep(clamped - i0);
  return {
    xPct: lerp(targets[i0].xPct, targets[i1].xPct, f),
    yPct: lerp(targets[i0].yPct, targets[i1].yPct, f),
  };
}

export function evaluateSceneState(progress, isMobile) {
  const p = clamp01(progress);
  const keys = isMobile ? MOBILE_KEYS : DESKTOP_KEYS;

  let a = keys[0];
  let b = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (p >= keys[i].p && p <= keys[i + 1].p) {
      a = keys[i];
      b = keys[i + 1];
      break;
    }
  }

  const span = Math.max(0.0001, b.p - a.p);
  const e = smoothstep((p - a.p) / span);

  let xPct = lerp(a.xPct, b.xPct, e);
  let yPct = lerp(a.yPct, b.yPct, e);
  const scale = lerp(a.scale, b.scale, e);
  const rotX = lerp(a.rotX, b.rotX, e);
  const rotY = lerp(a.rotY, b.rotY, e);
  const sep = lerp(a.sep, b.sep, e);

  // Scene 03 deterministic step execution trace + zoomed camera node tracking
  let execStep = -1;
  if (p >= 0.27 && p <= 0.455) {
    const local = clamp01((p - 0.275) / 0.16);
    execStep = local * 5.65;
    if (p >= 0.275 && p <= 0.435) {
      const targets = isMobile ? MOBILE_PAN_TARGETS : DESKTOP_PAN_TARGETS;
      const pan = samplePanTargets(targets, execStep);
      xPct = pan.xPct;
      yPct = pan.yPct;
    }
  }

  // Scene 04 deterministic pure progress-driven topology morph schedule
  let scenarioFrom = 'inbound';
  let scenarioTo = 'inbound';
  let scenarioBlend = 1;
  if (p >= 0.47 && p < 0.53) {
    scenarioFrom = 'inbound';
    scenarioTo = 'onboarding';
    scenarioBlend = (p - 0.47) / 0.06;
  } else if (p >= 0.53 && p < 0.59) {
    scenarioFrom = 'onboarding';
    scenarioTo = 'approval';
    scenarioBlend = (p - 0.53) / 0.06;
  } else if (p >= 0.59 && p < 0.65) {
    scenarioFrom = 'approval';
    scenarioTo = 'operations';
    scenarioBlend = (p - 0.59) / 0.06;
  } else if (p >= 0.65 && p < 0.69) {
    // Return to the inbound example before showing its execution log.
    scenarioFrom = 'operations';
    scenarioTo = 'inbound';
    scenarioBlend = (p - 0.65) / 0.04;
  }

  // Scene 05 warm off-white palette transition
  let lightBlend = 0;
  if (p >= 0.66 && p <= 0.72) {
    lightBlend = smoothstep((p - 0.66) / 0.06);
  } else if (p > 0.72 && p < 0.825) {
    lightBlend = 1;
  } else if (p >= 0.825 && p <= 0.885) {
    lightBlend = 1 - smoothstep((p - 0.825) / 0.06);
  }

  // Scene 05 execution monitoring panel transition
  let monitorBlend = 0;
  if (p >= 0.69 && p <= 0.73) {
    monitorBlend = smoothstep((p - 0.69) / 0.04);
  } else if (p > 0.73 && p < 0.815) {
    monitorBlend = 1;
  } else if (p >= 0.815 && p <= 0.875) {
    monitorBlend = 1 - smoothstep((p - 0.815) / 0.06);
  }

  // Emphasize connector extension while layers separate into Scene 02
  let edgeDraw = 1;
  if (p >= 0.07 && p <= 0.21) {
    edgeDraw = 1 - 0.40 * Math.sin(Math.PI * (p - 0.07) / 0.14) ** 2;
  }

  // Active scene index (0..5)
  let activeScene = 0;
  let bestDist = Infinity;
  SCENE_ANCHORS.forEach((anc, idx) => {
    const d = Math.abs(p - anc.progress);
    if (d < bestDist) {
      bestDist = d;
      activeScene = idx;
    }
  });

  // Smooth coordinated per-scene visibility weights
  let copyWeights = COPY_WINDOWS.map((win) => {
    if (p <= win.inStart || p >= win.outEnd) return 0;
    if (p >= win.holdStart && p <= win.holdEnd) return 1;
    if (p < win.holdStart) {
      return smoothstep((p - win.inStart) / Math.max(0.0001, win.holdStart - win.inStart));
    }
    return 1 - smoothstep((p - win.holdEnd) / Math.max(0.0001, win.outEnd - win.holdEnd));
  });

  // Complementary copy weights preserve a visible narrative at handoffs.
  const sum = copyWeights.reduce((a,b) => a+b, 0);
  if (sum > 0) copyWeights = copyWeights.map(w => w / sum);
  activeScene = copyWeights.indexOf(Math.max(...copyWeights));

  // Hero monumental typographic parallax factor on Scene 01
  const heroSplit = clamp01(p / 0.12);

  return {
    progress: p,
    xPct,
    yPct,
    scale,
    rotX,
    rotY,
    sep,
    monitor: monitorBlend,
    light: lightBlend,
    edgeDraw,
    execStep,
    scenarioFrom,
    scenarioTo,
    scenarioBlend,
    activeScene,
    copyWeights,
    heroSplit,
  };
}
