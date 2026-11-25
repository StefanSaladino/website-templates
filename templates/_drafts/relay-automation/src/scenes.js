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

// Portrait framing keeps both node columns visible throughout the execution.
const MOBILE_PAN_TARGETS = [
  { xPct: 1.1, yPct: 0.0 },
  { xPct: -1.1, yPct: 0.0 },
  { xPct: -1.1, yPct: -0.5 },
  { xPct: 1.1, yPct: -0.5 },
  { xPct: 1.1, yPct: -1.0 },
  { xPct: -1.1, yPct: -1.0 },
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
  { p: 0.0,   xPct: 0, yPct: 0, scale: 0.97, rotX: 3, rotY: -3, sep: 0 },
  { p: 0.08,  xPct: 0, yPct: 0, scale: 0.97, rotX: 4, rotY: -3, sep: 0.30 },
  { p: 0.185, xPct: 0, yPct: -0.8, scale: 0.94, rotX: 5, rotY: -2, sep: 0.74 },
  { p: 0.275, xPct: 1.1, yPct: 0, scale: 0.99, rotX: 0, rotY: 0, sep: 0 },
  { p: 0.435, xPct: -1.1, yPct: -1, scale: 0.99, rotX: 0, rotY: 0, sep: 0 },
  { p: 0.48,  xPct: 0, yPct: 0, scale: 0.98, rotX: 1, rotY: -1, sep: 0 },
  { p: 0.635, xPct: 0, yPct: 0, scale: 0.98, rotX: 1, rotY: -1, sep: 0 },
  { p: 0.72,  xPct: 0, yPct: 0, scale: 1, rotX: 0, rotY: 0, sep: 0 },
  { p: 0.82,  xPct: 0, yPct: 0, scale: 1, rotX: 0, rotY: 0, sep: 0 },
  { p: 0.88,  xPct: 0, yPct: 0, scale: 0.98, rotX: 2, rotY: -2, sep: 0 },
  { p: 1.0,   xPct: 0, yPct: 0, scale: 0.98, rotX: 2, rotY: -2, sep: 0 },
];

// Short sequential fades: only one narrative can occupy a shared text region.
// At the exact handoff the persistent product is intentionally the sole subject.
const COPY_HANDOFFS = [0.112, 0.223, 0.458, 0.668, 0.854];
const COPY_HALF_WINDOW = 0.014;

export function evaluateNarrative(progress) {
  const p = clamp01(progress);
  let activeScene = COPY_HANDOFFS.filter(c => p >= c).length;
  const left = activeScene === 4 ? 0.688 : activeScene > 0 ? COPY_HANDOFFS[activeScene - 1] : -1;
  const right = activeScene === 4 ? 0.834 : activeScene < COPY_HANDOFFS.length ? COPY_HANDOFFS[activeScene] : 2;
  const w = smoothstep((p-left)/COPY_HALF_WINDOW) * smoothstep((right-p)/COPY_HALF_WINDOW);
  const copyWeights = Array.from({length:6}, (_,i) => i===activeScene?w:0);
  const direction = p-left < COPY_HALF_WINDOW ? 1 : -1;
  return { activeScene, copyWeights, copyShift: direction * (1-w) * 12 };
}

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

export function evaluateExecutionFocus(progress) {
  const p = clamp01(progress);
  const amount = smoothstep((p - 0.245) / 0.03) * (1 - smoothstep((p - 0.435) / 0.03));
  const cursor = clamp01((p - 0.275) / 0.16) * 5;
  return { amount, cursor };
}

// Same continuous focus weights are used for the node and its connector boxes.
export function executionNodeWeight(index, focus) {
  if (!focus) return 0;
  return focus.amount * (1 - smoothstep(Math.abs(index - focus.cursor)));
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
  const sep = lerp(a.sep, b.sep, e) * (1 - smoothstep((p - .65) / .04));

  // Scene 03 deterministic step execution trace + zoomed camera node tracking
  let execStep = -1;
  if (p >= 0.27 && p <= 0.455) {
    const local = clamp01((p - 0.275) / 0.16);
    execStep = local * 5.65;
    if (p >= 0.275 && p <= 0.435) {
      const targets = isMobile ? MOBILE_PAN_TARGETS : DESKTOP_PAN_TARGETS;
      const pan = samplePanTargets(targets, evaluateExecutionFocus(p).cursor);
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

  // Two opaque scene planes; the backdrop moves only while narrative is absent.
  // No foreground or product colour interpolation through the middle of a theme.
  const lightBlend = smoothstep((p - .668) / .020) * (1 - smoothstep((p - .834) / .020));

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

  const { activeScene, copyWeights, copyShift } = evaluateNarrative(p);
  // Extra portrait canvas height where the narrative is intentionally concise.
  // Ease back to the base height before the larger scenario-control block.
  const portraitRoom = Math.max(
    smoothstep((p-.119)/.065)*(1-smoothstep((p-.43)/.035)),
    smoothstep((p-.675)/.045)*(1-smoothstep((p-.84)/.03)),
    smoothstep((p-.861)/.06)*.55
  );

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
    focus: evaluateExecutionFocus(p),
    scenarioFrom,
    scenarioTo,
    scenarioBlend,
    activeScene,
    copyWeights,
    copyShift,
    portraitRoom,
    heroSplit,
  };
}
