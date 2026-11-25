/**
 * ATLAS — A3 Continuous Spatial Camera Spline & Environmental Choreography
 * Deliberate foreground / middle-ground / distant compositions across all 6 chapters,
 * bright alpine morning lighting in Valley, glowing golden hour in Summit,
 * responsive desktop & portrait mobile framing, and terrain collision safety.
 */

import { WATER_LEVEL, FOLIO_HALF, terrainUnitsToMeters } from './terrain.js?v=17';

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
    displayMeters: 3420,
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
    coords: '2,180 m – 3,120 m',
    displayMeters: 2890,
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
    coords: 'Meridian Gorge · North Pass',
    displayMeters: 2410,
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
    coords: 'Lake Vireo Cirque',
    displayMeters: 1890,
  },
  {
    id: 'summit',
    number: '05',
    title: 'The Summit',
    start: 0.70,
    end: 0.91,
    anchor: 0.82,
    inspectable: true,
    polarity: 'dark',
    coords: 'Kestrel Spire Massif',
    displayMeters: 3420,
  },
  {
    id: 'archive',
    number: '06',
    title: 'The Archive',
    start: 0.91,
    end: 1.00,
    anchor: 0.96,
    inspectable: false,
    polarity: 'light',
    coords: 'Survey Folio · VII',
    displayMeters: 3420,
  },
]);

export const VIEWPOINTS = Object.freeze([
  {
    id: 'tarn-overlook',
    index: 'I',
    title: 'Tarn Overlook',
    subtitle: 'Lake Vireo Basin · 1,890 m',
    description: 'Turquoise glacial meltwater mirroring Kestrel Spire and sunlit snow ridges.',
    progress: 0.62,
    chapter: 'valley',
  },
  {
    id: 'meridian-pass',
    index: 'II',
    title: 'Meridian Gorge',
    subtitle: 'North Ridge Approach · 2,410 m',
    description: 'Aerial corridor descending past pine-lined spurs toward the gleaming cirque floor.',
    progress: 0.44,
    chapter: 'descent',
  },
  {
    id: 'kestrel-crest',
    index: 'III',
    title: 'Kestrel Crest',
    subtitle: 'Golden Hour Panorama · 3,420 m',
    description: 'Elevated above the valley cloud sea in warm amber light across three mountain ranges.',
    progress: 0.82,
    chapter: 'summit',
  },
]);

// Authored nonuniform Hermite shots: slower tilt, deliberate lake framing, distant summit and exact folio return.
const SPLINE_KEYS = [
  { t: 0.00, pos: [-9.0,  76.0,   6.0], look: [-9.0,  0.0,  -2.0], fov: 39 }, // I. Overhead archival folio (left negative space)
  { t: 0.08, pos: [-4.0, 67.0, 18.0], look: [-5.0, 1.0, -3.0], fov: 40 }, // I->II. Smooth oblique tilt
  { t: 0.16, pos: [12.0, 51.0, 35.0], look: [1.0, 5.0, -8.0], fov: 43 }, // II. Map lifts cleanly into peaks
  { t: 0.28, pos: [24.0, 33.0, 46.0], look: [3.0, 10.0, -10.0], fov: 46 }, // II. Sweeping sunlit massif
  { t: 0.44, pos: [9.0, 15.5, 34.0], look: [4.0, 9.0, -11.0], fov: 46 }, // III. Aerial glide over pass toward lake & peaks
  { t: 0.56, pos: [-6.0, 8.4, 25.0], look: [2.0, 6.3, -7.0], fov: 48 }, // IV. Entering Lake Vireo amphitheater
  { t: 0.64, pos: [-8.0, 6.5, 23.0], look: [1.5, 7.4, -6.0], fov: 49 }, // IV. Glacial lake reflections & Kestrel Spire framing
  { t: 0.72, pos: [-1.0, 15.0, 20.0], look: [4.0, 12.0, -20.0], fov: 47 }, // V. Climbing up through sunlit stratus deck
  { t: 0.78, pos: [11.0, 27.0, 16.0], look: [2.0, 17.0, -37.0], fov: 47 }, // V. Breaking above clouds over eastern ridge
  { t: 0.84, pos: [20.0, 38.0, 14.0], look: [3.0, 13.0, -49.0], fov: 46 }, // V. Golden hour panorama above sea of clouds
  { t: 0.92, pos: [9.0, 55.0, 12.0], look: [-2.0, 4.0, -10.0], fov: 43 }, // V->VI. Ascending smoothly to archive folio
  { t: 1.00, pos: [-9.0, 76.0, 6.0], look: [-9.0, 0.0, -2.0], fov: 39 }, // VI. Cartographic exhibition archive
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

// Nonuniform-time cubic Hermite spline with a shared derivative at each key.
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

export function evaluateWorldState(progress, aspect, sampleHeight, inspectYaw = 0, inspectPitch = 0) {
  const p = clamp(progress, 0, 1);

  // 1. Relief & cartography envelope
  const rise = smoothstep(0.06, 0.28, p);
  const archiveReturn = smoothstep(0.86, 0.985, p);

  const relief = lerp(rise, 0.0, archiveReturn);
  const mapFadeOut = 1.0 - smoothstep(0.09, 0.27, p);
  const mapMix = clamp(Math.max(mapFadeOut, archiveReturn), 0, 1);

  // 2. Environmental lighting & cloud envelope
  const valleyWeight = smoothstep(0.46, 0.56, p) * (1.0 - smoothstep(0.68, 0.78, p));
  const goldenWeight = smoothstep(0.70, 0.81, p) * (1.0 - smoothstep(0.86, 0.95, p));
  const cloudAlpha = smoothstep(0.56, 0.71, p) * (1.0 - smoothstep(0.85, 0.94, p)) * 0.57;

  // Sun sweeps from bright SE alpine morning (illuminating northern cirque & lake!)
  // to raking WNW golden hour alpenglow in Summit
  const sunElev = lerp(0.69, 0.30, goldenWeight);
  const sunAz = lerp(0.72, -0.48, goldenWeight);
  const sunDir = normalizeVec3([
    Math.cos(sunElev) * Math.cos(sunAz),
    Math.sin(sunElev),
    Math.cos(sunElev) * Math.sin(sunAz),
  ]);

  const morningZenith = [0.19, 0.36, 0.51];
  const morningHorizon = [0.65, 0.76, 0.83];
  const valleyZenith = [0.17, 0.34, 0.49];
  const valleyHorizon = [0.68, 0.78, 0.84];
  const summitZenith = [0.12, 0.20, 0.31];
  const summitHorizon = [0.86, 0.70, 0.55];

  let skyZenith = lerpVec3(morningZenith, valleyZenith, valleyWeight);
  let skyHorizon = lerpVec3(morningHorizon, valleyHorizon, valleyWeight);
  skyZenith = lerpVec3(skyZenith, summitZenith, goldenWeight);
  skyHorizon = lerpVec3(skyHorizon, summitHorizon, goldenWeight);

  const fogDensity = lerp(0.0027, 0.0035, valleyWeight) * (1.0 - goldenWeight * 0.12);

  // 3. Camera spline + deliberate portrait mobile framing
  const spline = sampleSpline(p);
  const pos = [...spline.pos];
  const look = [...spline.look];

  let fovDeg = spline.fov;
  if (aspect < 0.86) {
    const portrait = clamp((0.86 - aspect) / 0.48, 0, 1);
    const descentFraming=smoothstep(0.20,0.39,p)*(1-smoothstep(0.47,0.56,p));
    fovDeg += portrait * (16.0 + 6.0*valleyWeight + 5.0*descentFraming);

    // On portrait mobile in Map & Archive, center on the massif & Lake Vireo cleanly
    // while pulling back slightly so peaks sit in upper frame above lower editorial type
    const mapOrArchive = Math.max(1.0 - smoothstep(0.04, 0.22, p), smoothstep(0.86, 0.98, p));
    pos[0] = lerp(pos[0], 0.0, mapOrArchive * 0.85 * portrait);
    look[0] = lerp(look[0], 0.0, mapOrArchive * 0.85 * portrait);
    pos[2] += mapOrArchive * 8.0 * portrait;
    look[2] += mapOrArchive * 8.0 * portrait;

    // In Valley on mobile, nudge sightline slightly toward Lake Vireo & Kestrel Spire center
    pos[0] = lerp(pos[0], -6.0, valleyWeight * portrait * 0.55);
    look[0]-=2.0*descentFraming*portrait;
    look[2]+=3.0*valleyWeight*portrait;
    look[1]-=1.4*valleyWeight*portrait;
  }

  // 4. Optional Viewpoint Inspection Offset
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

  // 5. Terrain & Water Collision Avoidance Safety Net
  if (typeof sampleHeight === 'function') {
    const groundY=Math.max(...[[0,0],[-1.4,0],[1.4,0],[0,-1.4],[0,1.4]].map(([dx,dz])=>sampleHeight(pos[0]+dx,pos[2]+dz)))*relief;
    const delta=Math.max(groundY+2.0,WATER_LEVEL*relief+1.35)-pos[1],soft=.65;
    const lift=delta<=-soft?0:delta>=soft?delta:(delta+soft)**2/(4*soft);
    pos[1]+=lift;look[1]+=lift*.32;
  }

  const forward = normalizeVec3([look[0] - pos[0], look[1] - pos[1], look[2] - pos[2]]);
  const worldUp = [0, 1, 0];
  const right = normalizeVec3(crossVec3(forward, worldUp));
  const up = normalizeVec3(crossVec3(right, forward));

  const chapter = getChapterForProgress(p);
  const targetGround = typeof sampleHeight === 'function' ? sampleHeight(look[0], look[2]) : WATER_LEVEL;
  const focusAltMeters = mapMix > 0.5 ? chapter.displayMeters : terrainUnitsToMeters(Math.max(targetGround, WATER_LEVEL));

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
    focusAltMeters,
    folioHalf: FOLIO_HALF,
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

export function buildViewProjMatrix(pos, look, worldUpRef, fovDeg, aspect, near = 0.4, far = 340.0) {
  const f = normalizeVec3([look[0] - pos[0], look[1] - pos[1], look[2] - pos[2]]);
  const upHint = worldUpRef;
  const s = normalizeVec3(crossVec3(f, upHint));
  const u = crossVec3(s, f);

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
