/**
 * ATLAS — Continuous Spatial Camera Spline & Environmental Choreography
 * Catmull-Rom 3D camera path, collision avoidance above terrain & glacial lake,
 * responsive mobile/desktop framing, optional viewpoint inspection offset,
 * and continuous chapter/lighting parameters.
 */

import { WATER_LEVEL, elevationToMeters } from './terrain.js';

export const CHAPTERS = Object.freeze([
  {
    id: 'map',
    number: '01',
    title: 'The Map',
    start: 0.00,
    end: 0.14,
    anchor: 0.00,
    inspectable: false,
    polarity: 'light',
    coords: '46°34′N · 07°58′E',
  },
  {
    id: 'ascent',
    number: '02',
    title: 'The Ascent',
    start: 0.14,
    end: 0.34,
    anchor: 0.24,
    inspectable: false,
    polarity: 'light-to-dark',
    coords: '2,180 m – 2,940 m',
  },
  {
    id: 'descent',
    number: '03',
    title: 'The Descent',
    start: 0.34,
    end: 0.52,
    anchor: 0.44,
    inspectable: true,
    polarity: 'dark',
    coords: 'Meridian Gorge · 2,410 m',
  },
  {
    id: 'valley',
    number: '04',
    title: 'The Valley',
    start: 0.52,
    end: 0.70,
    anchor: 0.62,
    inspectable: true,
    polarity: 'dark',
    coords: 'Lake Vireo · 1,890 m',
  },
  {
    id: 'summit',
    number: '05',
    title: 'The Summit',
    start: 0.70,
    end: 0.86,
    anchor: 0.82,
    inspectable: true,
    polarity: 'dark',
    coords: 'Kestrel Spire · 3,420 m',
  },
  {
    id: 'archive',
    number: '06',
    title: 'The Archive',
    start: 0.86,
    end: 1.00,
    anchor: 0.96,
    inspectable: true,
    polarity: 'light',
    coords: 'Survey Folio · VII',
  },
]);

export const VIEWPOINTS = Object.freeze([
  {
    id: 'tarn-overlook',
    index: 'I',
    title: 'Tarn Overlook',
    subtitle: 'Lake Vireo Basin · 1,890 m',
    description: 'Glacial meltwater reflecting the northern cirque wall beneath lingering valley mist.',
    progress: 0.62,
    chapter: 'valley',
  },
  {
    id: 'meridian-pass',
    index: 'II',
    title: 'Meridian Gorge',
    subtitle: 'North Ridge Approach · 2,410 m',
    description: 'Steep moraine shoulders and granite strata descending toward the subalpine basin.',
    progress: 0.44,
    chapter: 'descent',
  },
  {
    id: 'kestrel-crest',
    index: 'III',
    title: 'Kestrel Crest',
    subtitle: 'Golden Hour Panorama · 3,420 m',
    description: 'Above the stratus cloud deck in warm raking light across the full horseshoe massif.',
    progress: 0.82,
    chapter: 'summit',
  },
]);

// Keyframes carefully spaced across progress [0, 1] for Catmull-Rom spatial continuity
const SPLINE_KEYS = [
  { t: 0.00, pos: [0.0,  58.0,  11.0], look: [0.0,   0.0,  -3.0], fov: 39 }, // I. Flat overhead map
  { t: 0.07, pos: [7.5,  50.5,  26.5], look: [0.0,   1.0,  -3.5], fov: 41 }, // I->II. Smooth tilt-down arc
  { t: 0.14, pos: [17.0, 40.0,  42.0], look: [0.0,   2.4,  -4.0], fov: 43 }, // II. Map tilts & begins rising
  { t: 0.30, pos: [26.0, 21.5,  33.0], look: [0.5,   6.5,  -7.0], fov: 45 }, // II. Full alpine massifs revealed
  { t: 0.44, pos: [11.5, 11.2,  21.5], look: [-1.5,  4.5,  -8.0], fov: 47 }, // III. Descending into gorge pass
  { t: 0.56, pos: [-2.5,  4.4,  15.5], look: [0.5,   4.6, -12.0], fov: 46 }, // IV. Valley entry
  { t: 0.64, pos: [-3.2,  3.85, 13.0], look: [2.2,   4.9, -13.5], fov: 46 }, // IV. Lake Vireo shoreline reflections
  { t: 0.72, pos: [4.0,   9.6,   6.5], look: [7.5,   9.5, -13.5], fov: 46 }, // V. Climbing through lower cloud deck
  { t: 0.78, pos: [14.5, 22.8,   0.5], look: [6.5,  13.0, -11.0], fov: 45 }, // V. Rising above eastern ridge shoulder
  { t: 0.84, pos: [24.5, 26.2,  -4.8], look: [-3.5,  8.5,  -5.5], fov: 44 }, // V. Golden hour summit panorama
  { t: 0.92, pos: [12.5, 40.5,   9.5], look: [-1.5,  3.6,  -4.0], fov: 42 }, // V->VI. Smooth ascent to archive plate
  { t: 1.00, pos: [0.0,  53.0,  21.0], look: [0.0,   0.8,  -3.0], fov: 40 }, // VI. Cartographic exhibition archive
];

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

// Nonuniform-time cubic Hermite interpolation: shared velocity at each key.
function sampleSpline(progress) {
  const p=clamp(progress,0,1);
  let i=0;while(i<SPLINE_KEYS.length-2&&p>SPLINE_KEYS[i+1].t)i++;
  const k=SPLINE_KEYS[i],n=SPLINE_KEYS[i+1],span=n.t-k.t,u=clamp((p-k.t)/span,0,1),u2=u*u,u3=u2*u;
  const tangent=(j,field,axis)=>{
    const a=SPLINE_KEYS[Math.max(0,j-1)],b=SPLINE_KEYS[Math.min(SPLINE_KEYS.length-1,j+1)];
    const v=x=>axis===null?x[field]:x[field][axis];return (v(b)-v(a))/(b.t-a.t);
  };
  const interpolate=(field,axis)=>{
    const v=x=>axis===null?x[field]:x[field][axis];
    return (2*u3-3*u2+1)*v(k)+(u3-2*u2+u)*span*tangent(i,field,axis)+(-2*u3+3*u2)*v(n)+(u3-u2)*span*tangent(i+1,field,axis);
  };
  return {pos:[0,1,2].map(j=>interpolate('pos',j)),look:[0,1,2].map(j=>interpolate('look',j)),fov:interpolate('fov',null)};
}
export function getChapterForProgress(progress) {
  const p = clamp(progress, 0, 1);
  for (let i = CHAPTERS.length - 1; i >= 0; i--) {
    if (p >= CHAPTERS[i].start - 0.001) return CHAPTERS[i];
  }
  return CHAPTERS[0];
}

/**
 * Evaluates full world-state parameters (terrain morph, map ink mix,
 * golden hour, fog, sky palette, camera pose, and terrain collision clamping)
 * at scroll progress p in [0, 1].
 */
export function evaluateWorldState(progress, aspect, sampleHeight, inspectYaw = 0, inspectPitch = 0) {
  const p = clamp(progress, 0, 1);

  // 1. Continuous relief morph & cartographic ink mix:
  //    Map (0.00-0.08): flat parchment (relief 0, mapMix 1)
  //    Ascent (0.08-0.34): smoothly rises to 1.0, ink dissolves to 0.0
  //    Archive (0.86-1.00): eases gracefully into a raised relief folio plate (relief ~0.26, mapMix ~0.86)
  const rise = smoothstep(0.06, 0.30, p);
  const archiveReturn = smoothstep(0.85, 0.985, p);

  const relief = lerp(rise, 0.26, archiveReturn);
  const mapFadeOut = 1.0 - smoothstep(0.09, 0.29, p);
  const mapMix = clamp(Math.max(mapFadeOut, archiveReturn * 0.88), 0, 1);

  // 2. Environmental phases (Valley mist, Golden hour summit, Cloud layers)
  const valleyWeight = smoothstep(0.46, 0.56, p) * (1.0 - smoothstep(0.68, 0.78, p));
  const goldenWeight = smoothstep(0.69, 0.82, p) * (1.0 - smoothstep(0.86, 0.96, p));
  const cloudAlpha = smoothstep(0.50, 0.65, p) * (1.0 - smoothstep(0.84, 0.95, p)) * 0.72;

  // Sun sweeps smoothly from crisp morning azimuth toward warm low golden-hour elevation
  const sunElev = lerp(0.56, 0.20, goldenWeight);
  const sunAz = lerp(-0.92, -1.78, goldenWeight);
  const sunDir = normalizeVec3([
    Math.cos(sunElev) * Math.cos(sunAz),
    Math.sin(sunElev),
    Math.cos(sunElev) * Math.sin(sunAz),
  ]);

  // Sky zenith & horizon colors smoothly interpolate across phases
  const morningZenith = [0.22, 0.37, 0.49];
  const morningHorizon = [0.76, 0.83, 0.87];
  const valleyZenith = [0.18, 0.32, 0.44];
  const valleyHorizon = [0.74, 0.82, 0.85];
  const summitZenith = [0.14, 0.21, 0.31];
  const summitHorizon = [0.85, 0.62, 0.41];

  let skyZenith = lerpVec3(morningZenith, valleyZenith, valleyWeight);
  let skyHorizon = lerpVec3(morningHorizon, valleyHorizon, valleyWeight);
  skyZenith = lerpVec3(skyZenith, summitZenith, goldenWeight);
  skyHorizon = lerpVec3(skyHorizon, summitHorizon, goldenWeight);

  const fogDensity = lerp(0.0065, 0.0105, valleyWeight) * (1.0 - goldenWeight * 0.26);

  // 3. Camera spline + responsive mobile FOV/pullback compensation
  const spline = sampleSpline(p);
  const pos = [...spline.pos];
  const look = [...spline.look];

  // On portrait mobile (aspect < 0.82), widen vertical FOV gracefully & add subtle pullback
  // so hero ridges and the cartographic sheet remain unclipped horizontally.
  let fovDeg = spline.fov;
  if (aspect < 0.88) {
    const portraitFactor = clamp((0.88 - aspect) / 0.50, 0, 1);
    fovDeg += portraitFactor * 16.5;
    const dx = pos[0] - look[0];
    const dy = pos[1] - look[1];
    const dz = pos[2] - look[2];
    const pull = 1.0 + portraitFactor * 0.055 * (1.0 - valleyWeight * 0.75);
    pos[0] = look[0] + dx * pull;
    pos[1] = look[1] + dy * pull;
    pos[2] = look[2] + dz * pull;
  }

  // The opening is a designed survey plate, not an arbitrary camera crop.
  // Move the entire camera rig, preserving perspective and geographic scale.
  const opening=1-smoothstep(.015,.18,p);
  const shiftX=-12*opening*smoothstep(.85,1.45,aspect);
  const shiftZ=8*opening*(1-smoothstep(.55,1.05,aspect));
  pos[0]+=shiftX;look[0]+=shiftX;pos[2]+=shiftZ;look[2]+=shiftZ;

  // 4. Optional Viewpoint Drag/Keyboard Inspection Offset (applied smoothly to look direction)
  if (Math.abs(inspectYaw) > 0.0005 || Math.abs(inspectPitch) > 0.0005) {
    const vx = look[0] - pos[0];
    const vy = look[1] - pos[1];
    const vz = look[2] - pos[2];
    const dist = Math.hypot(vx, vy, vz) || 1;
    const baseYaw = Math.atan2(vz, vx);
    const basePitch = Math.asin(clamp(vy / dist, -0.96, 0.96));

    const yaw = baseYaw + inspectYaw;
    const pitch = clamp(basePitch + inspectPitch, -1.35, 0.72);

    look[0] = pos[0] + Math.cos(pitch) * Math.cos(yaw) * dist;
    look[1] = pos[1] + Math.sin(pitch) * dist;
    look[2] = pos[2] + Math.cos(pitch) * Math.sin(yaw) * dist;
  }

  // 5. Strict Terrain & Water Collision Avoidance
  if (typeof sampleHeight === 'function') {
    const groundY=Math.max(...[[0,0],[-1.4,0],[1.4,0],[0,-1.4],[0,1.4]].map(([dx,dz])=>sampleHeight(pos[0]+dx,pos[2]+dz)))*relief;
    const delta=Math.max(groundY+2,WATER_LEVEL*relief+1.35)-pos[1],soft=.65;
    const lift=delta<=-soft?0:delta>=soft?delta:(delta+soft)**2/(4*soft);
    pos[1]+=lift;look[1]+=lift*.32;
  }

  // Camera basis vectors (useful for both View matrix and Sky ray shader)
  const forward = normalizeVec3([look[0] - pos[0], look[1] - pos[1], look[2] - pos[2]]);
  const worldUp = [0, 1, 0];
  const right = normalizeVec3(crossVec3(forward, worldUp));
  const up = normalizeVec3(crossVec3(right, forward));

  const chapter = getChapterForProgress(p);
  const cameraAltMeters = elevationToMeters(pos[1]);

  return {
    progress: p,
    chapter,
    relief,
    mapMix,
    valleyWeight,
    goldenWeight,
    cloudAlpha,
    fogDensity,
    sunDir,
    skyZenith,
    skyHorizon,
    pos,
    look,
    fovDeg,
    forward,
    right,
    up,
    cameraAltMeters,
  };
}

function lerpVec3(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function crossVec3(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function normalizeVec3(v) {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

export function buildViewProjMatrix(pos, look, worldUpRef, fovDeg, aspect, near = 0.35, far = 240.0) {
  const f = normalizeVec3([look[0] - pos[0], look[1] - pos[1], look[2] - pos[2]]);
  const upHint = worldUpRef;
  const s = normalizeVec3(crossVec3(f, upHint));
  const u = crossVec3(s, f);

  // View matrix (column-major Float32Array)
  const view = new Float32Array([
    s[0], u[0], -f[0], 0,
    s[1], u[1], -f[1], 0,
    s[2], u[2], -f[2], 0,
    -(s[0] * pos[0] + s[1] * pos[1] + s[2] * pos[2]),
    -(u[0] * pos[0] + u[1] * pos[1] + u[2] * pos[2]),
     (f[0] * pos[0] + f[1] * pos[1] + f[2] * pos[2]),
    1,
  ]);

  const rad = (fovDeg * Math.PI) / 180;
  const tanHalf = Math.tan(rad * 0.5);
  const fy = 1.0 / tanHalf;
  const fx = fy / Math.max(aspect, 0.2);
  const nf = 1.0 / (near - far);

  const proj = new Float32Array([
    fx, 0, 0, 0,
    0, fy, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]);

  // Multiply proj * view (column-major)
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      out[col * 4 + row] =
        proj[0 * 4 + row] * view[col * 4 + 0] +
        proj[1 * 4 + row] * view[col * 4 + 1] +
        proj[2 * 4 + row] * view[col * 4 + 2] +
        proj[3 * 4 + row] * view[col * 4 + 3];
    }
  }
  return { viewProj: out, tanHalfFov: tanHalf };
}
