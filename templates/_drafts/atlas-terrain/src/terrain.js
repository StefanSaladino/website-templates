/**
 * ATLAS — A3 Geological Terrain Synthesis & Erosion Engine
 * Builds an expansive multi-range alpine world (220x220 units):
 * - Domain-warped tectonic horseshoe massif + asymmetric glaciated peaks
 * - Secondary & tertiary distant mountain chains for atmospheric horizon depth
 * - S-curved Lake Vireo glacial tarn & U-shaped approach valley
 * - Vectorized thermal slippage + hydraulic gully erosion passes
 * - 512x512 16-bit height + drainage/curvature map for bicubic contours,
 *   self-shadowing, and raymarched glacial water reflections
 */

export const WORLD_SIZE = 220;
export const FOLIO_HALF = 56; // Printed cartographic survey sheet extent [-56, +56]
export const WATER_LEVEL = 2.05; // Lake Vireo surface (1,890 m)
export const PEAK_TARGET_METERS = 3420;
export const LAKE_METERS = 1890;

export const LANDMARKS = Object.freeze([
  { id: 'kestrel', name: 'Kestrel Spire', elevationM: 3420, x: 11.5, z: -18.5 },
  { id: 'saddle', name: 'Meridian Saddle', elevationM: 2640, x: -20.0, z: -10.0 },
  { id: 'tarn', name: 'Lake Vireo', elevationM: 1890, x: -2.5, z: 3.5 },
]);

function hash2(ix, iz) {
  let n = Math.imul(ix, 374761393) + Math.imul(iz, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function smoothstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

function noise2DWithDeriv(x, z) {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;

  const u = fade(fx);
  const v = fade(fz);
  const du = 30 * fx * fx * (fx - 1) * (fx - 1);
  const dv = 30 * fz * fz * (fz - 1) * (fz - 1);

  const a = hash2(ix, iz);
  const b = hash2(ix + 1, iz);
  const c = hash2(ix, iz + 1);
  const d = hash2(ix + 1, iz + 1);

  const k0 = a;
  const k1 = b - a;
  const k2 = c - a;
  const k3 = a - b - c + d;

  return [
    k0 + k1 * u + k2 * v + k3 * u * v,
    (k1 + k3 * v) * du,
    (k2 + k3 * u) * dv,
  ];
}

function fbm(x, z, octaves = 5) {
  let sum = 0;
  let dxAcc = 0;
  let dzAcc = 0;
  let amp = 0.5;
  let freq = 1.0;
  const cosR = 0.8;
  const sinR = 0.6;
  let px = x;
  let pz = z;

  for (let i = 0; i < octaves; i++) {
    const [n, gx, gz] = noise2DWithDeriv(px * freq, pz * freq);
    const val = n * 2 - 1;
    dxAcc += gx * 2;
    dzAcc += gz * 2;
    const damp = 1.0 / (1.0 + 0.42 * (dxAcc * dxAcc + dzAcc * dzAcc));
    sum += amp * val * damp;

    const nx = px * cosR - pz * sinR;
    const nz = px * sinR + pz * cosR;
    px = nx + 17.3;
    pz = nz - 9.1;
    freq *= 2.08;
    amp *= 0.48;
  }
  return sum;
}

// Crisp asymmetric alpine ridge synthesis (sharp arêtes + glacial horns)
function sharpRidged(x, z, octaves = 6) {
  let sum = 0;
  let amp = 0.55;
  let freq = 1.0;
  let weight = 1.0;
  const cosR = 0.866;
  const sinR = 0.5;
  let px = x;
  let pz = z;

  for (let i = 0; i < octaves; i++) {
    const [n] = noise2DWithDeriv(px * freq, pz * freq);
    // Asymmetric folding creates steep north faces and sloped southern flanks
    const raw = n * 2 - 1;
    let sig = 1.0 - Math.abs(raw);
    sig = Math.pow(sig, 1.38) * weight;
    weight = clamp(sig * 1.9, 0.08, 1.0);
    sum += sig * amp;

    const nx = px * cosR - pz * sinR;
    const nz = px * sinR + pz * cosR;
    px = nx - 6.7;
    pz = nz + 13.4;
    freq *= 2.11;
    amp *= 0.49;
  }
  return sum;
}

function distToSegment(px, pz, ax, az, bx, bz) {
  const abx = bx - ax;
  const abz = bz - az;
  const apx = px - ax;
  const apz = pz - az;
  const denom = abx * abx + abz * abz || 1;
  const t = clamp((apx * abx + apz * abz) / denom, 0, 1);
  const cx = ax + abx * t;
  const cz = az + abz * t;
  return [Math.hypot(px - cx, pz - cz), t];
}

// Skewed ridge distance for sharp asymmetric alpine horns
function ridgePeak(x, z, cx, cz, rx, rz, angleRad, amp, sharp) {
  const dx = x - cx;
  const dz = z - cz;
  const ca = Math.cos(angleRad);
  const sa = Math.sin(angleRad);
  const u = (dx * ca - dz * sa) / rx;
  const v = (dx * sa + dz * ca) / rz;
  const r = Math.hypot(u, v);
  return amp * Math.exp(-Math.pow(r, sharp));
}

// A finite glacial arête: ridge width narrows toward its summit, flank slopes
// differ, and the crest height follows a non-uniform longitudinal profile.
function alpineArete(x,z,ax,az,bx,bz,width,amplitude,sideBias=0.35) {
  const dx=bx-ax,dz=bz-az,len=Math.hypot(dx,dz);
  const u=((x-ax)*dx+(z-az)*dz)/(len*len);
  const v=(-(x-ax)*dz+(z-az)*dx)/len;
  const t=clamp(u,0,1);
  const along=Math.sin(Math.PI*t);
  const shoulder=0.22+0.78*Math.pow(Math.max(0,along),0.8);
  const lateral=Math.abs(v)/(width*(v<0?1-sideBias:1+sideBias)*shoulder);
  const taper=smoothstep(0,0.10,t)*(1-smoothstep(0.80,1,t));
  return amplitude*taper*(0.45+0.55*t)*Math.pow(Math.max(0,1-lateral),1.45);
}

function sculptAlpineCrests(x,z) {
  // Kestrel's asymmetric crown and three supporting ribs are authored in world space.
  const dx=x-11.5,dz=z+18.5;
  const u=(dx*0.91+dz*0.41)/6.2, v=(-dx*0.41+dz*0.91)/4.5;
  const az=Math.atan2(v,u),r=Math.hypot(u,v);
  const crown=Math.pow(Math.max(0,1-r/(1+0.15*Math.cos(3*az+0.5))),1.15)*8.4;
  const primary=Math.max(
    alpineArete(x,z,-1,-32,13,-16,5.4,4.8,0.38),
    alpineArete(x,z,27,-34,11,-19,5.8,4.3,-0.30),
    alpineArete(x,z,32,-4,11,-18,5.0,4.6,0.36));
  const west=Math.max(
    alpineArete(x,z,-33,-30,-16,-13,5.2,4.9,-0.27),
    alpineArete(x,z,-38,5,-18,-15,6.0,4.2,0.38));
  const north=Math.max(
    alpineArete(x,z,-25,-37,-3,-24,5.4,3.8,0.32),
    alpineArete(x,z,5,-39,-4,-24,5.0,4.0,-0.30));
  // Curved, descending channels separate adjacent ribs rather than repeating cone silhouettes.
  const [g1,t1]=distToSegment(x,z,4,-23,-2,-8);
  const [g2,t2]=distToSegment(x,z,23,-14,15,-5);
  const [g3,t3]=distToSegment(x,z,-23,-15,-15,-5);
  const gouge=(d,t,w,a)=>a*Math.exp(-Math.pow(d/w,2))*Math.sin(Math.PI*t);
  return crown+primary+west+north-gouge(g1,t1,2.3,2.3)-gouge(g2,t2,2.0,2.0)-gouge(g3,t3,2.3,1.9);
}

function evaluateBaseGeology(x, z) {
  // Tectonic folding warp
  const warpX = fbm(x * 0.018 + 3.1, z * 0.018 - 2.4, 3) * 10.5;
  const warpZ = fbm(x * 0.018 - 5.2, z * 0.018 + 4.7, 3) * 10.5;
  const wx = x + warpX;
  const wz = z + warpZ;

  // 1. Primary Cirque Horseshoe Spine (sharp, sweeping alpine amphitheater)
  const [dNorth] = distToSegment(wx, wz, -26.0, -18.0, 13.0, -20.5);
  const [dEast] = distToSegment(wx, wz, 13.0, -20.5, 34.0, 11.0);
  const [dWest] = distToSegment(wx, wz, -26.0, -18.0, -35.0, 16.0);
  const horseDist = Math.min(dNorth, dEast * 1.02, dWest * 1.05);
  const horseEnv = Math.exp(-Math.pow(horseDist / 16.5, 1.75));

  // Hero Peaks with sharp asymmetric ridgelines (offset micro-spurs prevent flat contour rectangles)
  const kestrel = ridgePeak(wx, wz, 12.0, -19.0, 11.5, 7.6, -0.48, 13.0, 1.38);
  const westHorn = ridgePeak(wx, wz, -18.5, -15.5, 10.5, 7.0, 0.52, 10.2, 1.36);
  const northButtress = ridgePeak(wx, wz, -3.5, -24.5, 11.4, 6.4, 0.28, 10.6, 1.34);
  const eastShoulder = ridgePeak(wx, wz, 29.0, -3.0, 9.5, 12.0, -0.25, 8.8, 1.44);
  const westShoulder = ridgePeak(wx, wz, -31.0, 8.0, 9.0, 13.0, 0.3, 8.2, 1.44);

  // Foreground corridor portal hills framing Descent (chapter 3)
  const portalW = ridgePeak(wx, wz, -23.0, 30.0, 13.0, 9.5, 0.4, 5.8, 1.55);
  const portalE = ridgePeak(wx, wz, 28.0, 29.0, 13.5, 10.0, -0.35, 6.2, 1.55);

  // 2. Layered Distant Mountain Ranges (creates genuine 3-tier alpine horizon)
  // Offset the two distant spines independently, so the horizon reads as overlapping ranges,
  // not parallel walls with a uniform silhouette.
  const range2Z=wz+4.5*Math.sin(wx*0.063)+2.0*Math.sin(wx*0.13+0.8);
  const range3Z=wz+7.0*Math.sin(wx*0.039+1.7)+2.5*Math.sin(wx*0.097);
  const [dRange2] = distToSegment(wx, range2Z, -92.0, -48.0, 92.0, -46.0);
  const [dRange3] = distToSegment(wx, range3Z, -108.0, -84.0, 108.0, -80.0);
  const [dWingW] = distToSegment(wx, wz, -74.0, -55.0, -78.0, 58.0);
  const [dWingE] = distToSegment(wx, wz, 76.0, -52.0, 78.0, 62.0);
  const [dSouthHorizon] = distToSegment(wx, wz, -95.0, 82.0, 95.0, 86.0);

  const distantEnv =
    Math.exp(-Math.pow(dRange2 / 18.0, 1.7)) * 10.5 +
    Math.exp(-Math.pow(dRange3 / 21.0, 1.7)) * 13.2 +
    Math.exp(-Math.pow(dWingW / 20.0, 1.8)) * 9.8 +
    Math.exp(-Math.pow(dWingE / 20.0, 1.8)) * 10.2 +
    Math.exp(-Math.pow(dSouthHorizon / 22.0, 1.8)) * 7.5;

  // Multi-scale tectonic ridges & micro crags
  const ridges = sharpRidged(wx * 0.036 + 1.9, wz * 0.036 - 2.3, 6);
  const detailRidges = sharpRidged(x * 0.11 - 4.1, z * 0.11 + 2.8, 4);
  const macro = fbm(wx * 0.025, wz * 0.025, 4);

  let h =
    2.45 +
    horseEnv * (5.2 + ridges * 10.8) +
    (kestrel + westHorn + northButtress + eastShoulder + westShoulder) * (0.48 + ridges * 0.64) +
    (portalW + portalE) * (0.48 + ridges * 0.44) +
    distantEnv * (0.46 + ridges * 0.68) +
    detailRidges * 1.65 * smoothstep(3.0, 11.5, horseEnv * 10.0 + kestrel + distantEnv) +
    Math.max(0, macro) * 2.1;

  // Add authored crests only on established upland, before the valley/lake incision.
  h+=sculptAlpineCrests(x,z)*smoothstep(4.0,10.0,h);
  // Distant secondary ridges vary their crest height instead of forming a continuous shelf.
  const farMask=smoothstep(27.0,48.0,-z);
  h+=farMask*distantEnv*0.17*(sharpRidged(x*0.075,z*0.063,4)-0.38);

  // 3. Glacial Valley Trough & Organic Multi-Cove Lake Vireo Basin
  const [dTroughA] = distToSegment(x + macro * 2.4, z, 11.0, 66.0, -3.5, 11.5);
  const [dTroughB] = distToSegment(x + macro * 1.8, z, -3.5, 11.5, -11.5, 4.0);
  const [dTroughC] = distToSegment(x + macro * 1.8, z, -11.5, 4.0, 6.5, -5.5);

  const valleyDist = Math.min(dTroughA * 1.08, dTroughB * 0.92, dTroughC * 0.96);
  const valleyCarve = smoothstep(17.5, 2.2, valleyDist);
  h = lerp(h, 2.55 + Math.abs(macro) * 0.65, valleyCarve * 0.88);

  // Domain-warped natural shoreline so Lake Vireo has organic glacial bays, a rocky headland, and tapered outlets
  const coveWarpX = fbm(x * 0.11 + 4.2, z * 0.11 - 1.9, 3) * 3.4 + (detailRidges - 0.45) * 1.9;
  const coveWarpZ = fbm(x * 0.11 - 3.6, z * 0.11 + 5.1, 3) * 3.1 + (detailRidges - 0.45) * 1.7;
  const lx = x + coveWarpX;
  const lz = z + coveWarpZ;

  const [dLake1, t1] = distToSegment(lx, lz, -13.5, 8.5, -2.0, 2.0);
  const [dLake2, t2] = distToSegment(lx, lz, -2.0, 2.0, 8.6, -5.2);
  const [dLakeBay, tb] = distToSegment(lx, lz, -2.5, 2.0, -7.2, -3.8);
  const r1 = lerp(3.4, 7.2, t1);
  const r2 = lerp(7.2, 3.2, t2);
  const rBay = lerp(4.6, 2.4, tb);
  const lakeNorm = Math.min(dLake1 / r1, dLake2 / r2, dLakeBay / rBay);
  const lakeBasin = smoothstep(1.30, 0.24, lakeNorm);

  // Deepen lake center cleanly below WATER_LEVEL (2.05 -> ~0.35), leaving visible shore benches
  h = lerp(h, 0.34 + Math.abs(macro) * 0.22, lakeBasin * 0.94);

  // Subtle rocky moraine peninsula jutting from northern shore + southern outlet sill
  const peninsula = Math.exp(-Math.pow((x + 0.5) / 2.6, 2) - Math.pow((z + 1.8) / 2.2, 2)) * 1.45;
  const outletSill =
    Math.exp(-Math.pow((z - 16.5) / 4.2, 2)) *
    Math.exp(-Math.pow((x + 2.0) / 11.0, 2)) *
    0.85;
  h += outletSill + peninsula;

  return Math.max(0.2, h);
}

/**
 * Vectorized thermal slippage + hydraulic gully carving across the heightfield.
 * Produces crisp concave talus fans and natural erosion channels instead of rounded blobs.
 */
function applyGeologicalErosion(heights, N, step, iterations = 14) {
  const next = new Float32Array(heights.length);
  const flow = new Float32Array(heights.length);
  const talusAngle = 0.72; // Maximum stable rock slope threshold

  for (let it = 0; it < iterations; it++) {
    next.set(heights);
    const rainStrength = 0.018 * (1 - it / (iterations * 1.4));

    for (let z = 1; z < N - 1; z++) {
      for (let x = 1; x < N - 1; x++) {
        const idx = z * N + x;
        const hC = heights[idx];
        // Skip submerged lake interior
        if (hC < WATER_LEVEL - 0.15) continue;

        const nL = idx - 1;
        const nR = idx + 1;
        const nD = idx - N;
        const nU = idx + N;
        const nLD = idx - N - 1;
        const nRD = idx - N + 1;
        const nLU = idx + N - 1;
        const nRU = idx + N + 1;

        const nbrs = [nL, nR, nD, nU, nLD, nRD, nLU, nRU];
        const dists = [1, 1, 1, 1, 1.414, 1.414, 1.414, 1.414];

        let maxDrop = 0;
        let steepestIdx = -1;
        let avgH = 0;

        for (let k = 0; k < 8; k++) {
          const nh = heights[nbrs[k]];
          avgH += nh;
          const drop = (hC - nh) / (dists[k] * step);
          if (drop > maxDrop) {
            maxDrop = drop;
            steepestIdx = nbrs[k];
          }
        }

        // Hydraulic gully incision along active steep drainage
        if (steepestIdx !== -1 && maxDrop > 0.22) {
          const transfer = Math.min(0.16, (maxDrop - 0.22) * rainStrength);
          next[idx] -= transfer;
          next[steepestIdx] += transfer * 0.72;
          flow[steepestIdx] += transfer * 4.5;
        }

        // Thermal talus relaxation above critical angle of repose
        if (maxDrop > talusAngle && steepestIdx !== -1) {
          const slip = Math.min(0.12, (maxDrop - talusAngle) * 0.08);
          next[idx] -= slip;
          next[steepestIdx] += slip * 0.85;
        } else if (hC < WATER_LEVEL + 1.8) {
          // Gentle valley alluvium smoothing near lake shores
          next[idx] = lerp(next[idx], avgH * 0.125, 0.06);
        }
      }
    }
    heights.set(next);
  }
  return flow;
}

export const CANONICAL_RESOLUTION = 256;
let canonicalTerrain = null;

export function buildTerrainData() {
  if(canonicalTerrain)return canonicalTerrain;
  const N = CANONICAL_RESOLUTION;
  const vertCount = N * N;
  const half = WORLD_SIZE * 0.5;
  const step = WORLD_SIZE / (N - 1);

  const heights = new Float32Array(vertCount);
  for (let gz = 0; gz < N; gz++) {
    const z = -half + gz * step;
    for (let gx = 0; gx < N; gx++) {
      const x = -half + gx * step;
      heights[gz * N + gx] = evaluateBaseGeology(x, z);
    }
  }

  const flowRaw = applyGeologicalErosion(heights, N, step, 14);

  // Measure actual range inside folio & full world so elevation meters align cleanly
  let maxH = 0;
  for (let i = 0; i < vertCount; i++) {
    if (heights[i] > maxH) maxH = heights[i];
  }

  const positions = new Float32Array(vertCount * 3);
  const normals = new Float32Array(vertCount * 3);
  const geoAttr = new Float32Array(vertCount * 4); // [normElev, horizonAO, erosionFlow, curvature]

  const inv2Step = 1 / (2 * step);
  const aoDirs = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [0.707, 0.707], [-0.707, 0.707], [0.707, -0.707], [-0.707, -0.707],
  ];

  for (let gz = 0; gz < N; gz++) {
    const z = -half + gz * step;
    const z0 = Math.max(0, gz - 1);
    const z1 = Math.min(N - 1, gz + 1);
    for (let gx = 0; gx < N; gx++) {
      const x = -half + gx * step;
      const x0 = Math.max(0, gx - 1);
      const x1 = Math.min(N - 1, gx + 1);
      const idx = gz * N + gx;
      const hC = heights[idx];

      positions[idx * 3] = x;
      positions[idx * 3 + 1] = hC;
      positions[idx * 3 + 2] = z;

      const hL = heights[gz * N + x0];
      const hR = heights[gz * N + x1];
      const hD = heights[z0 * N + gx];
      const hU = heights[z1 * N + gx];

      const dhdx = (hR - hL) * inv2Step * ((x1 - x0) === 1 ? 2 : 1);
      const dhdz = (hU - hD) * inv2Step * ((z1 - z0) === 1 ? 2 : 1);

      let nx = -dhdx;
      let ny = 1.0;
      let nz = -dhdz;
      const invLen = 1 / Math.hypot(nx, ny, nz);
      nx *= invLen;
      ny *= invLen;
      nz *= invLen;

      normals[idx * 3] = nx;
      normals[idx * 3 + 1] = ny;
      normals[idx * 3 + 2] = nz;

      // Horizon ambient occlusion for deep cirques and couloirs
      let occ = 0;
      for (let d = 0; d < aoDirs.length; d++) {
        const dx = aoDirs[d][0];
        const dz = aoDirs[d][1];
        let maxSin = 0;
        for (let r = 3; r <= 12; r += 3) {
          const sx = clamp(Math.round(gx + dx * r), 0, N - 1);
          const sz = clamp(Math.round(gz + dz * r), 0, N - 1);
          const dist = Math.hypot((sx - gx) * step, (sz - gz) * step);
          if (dist > 0.01) {
            const dh = heights[sz * N + sx] - hC;
            const sinA = dh / Math.hypot(dh, dist);
            if (sinA > maxSin) maxSin = sinA;
          }
        }
        occ += clamp(maxSin, 0, 1);
      }
      const ao = clamp(1.0 - (occ / aoDirs.length) * 0.82, 0.30, 1.0);

      // Laplacian curvature: + ridges/arêtes, - eroded couloirs/valleys
      const lap = (hL + hR + hD + hU) * 0.25 - hC;
      const ridgeCurvature = clamp(0.5 - lap * 1.4, 0, 1);
      const flowNorm = clamp(flowRaw[idx] * 0.85, 0, 1);

      geoAttr[idx * 4] = clamp(hC / Math.max(maxH, 1), 0, 1);
      geoAttr[idx * 4 + 1] = ao;
      geoAttr[idx * 4 + 2] = flowNorm;
      geoAttr[idx * 4 + 3] = ridgeCurvature;
    }
  }

  const quadCount = (N - 1) * (N - 1);
  const indices = new Uint32Array(quadCount * 6);
  let ptr = 0;
  for (let gz = 0; gz < N - 1; gz++) {
    for (let gx = 0; gx < N - 1; gx++) {
      const a = gz * N + gx;
      const b = a + 1;
      const c = a + N;
      const d = c + 1;
      indices[ptr++] = a;
      indices[ptr++] = c;
      indices[ptr++] = b;
      indices[ptr++] = b;
      indices[ptr++] = c;
      indices[ptr++] = d;
    }
  }

  // 512x512 RGBA8 height + drainage/curvature texture for bicubic contours, cast shadows & lake reflections
  const texSize = 512;
  const heightTexData = new Uint8Array(texSize * texSize * 4);
  const maxTexH = Math.max(28.0, Math.ceil(maxH + 2.0));
  const sampleAt = createHeightSampler(heights, N);
  const sampleFlow = createAttrSampler(geoAttr, N, 2);
  const sampleCurv = createAttrSampler(geoAttr, N, 3);

  for (let tz = 0; tz < texSize; tz++) {
    const z = -half + (tz / (texSize - 1)) * WORLD_SIZE;
    for (let tx = 0; tx < texSize; tx++) {
      const x = -half + (tx / (texSize - 1)) * WORLD_SIZE;
      const h = sampleAt(x, z);
      const q = clamp(Math.round((h / maxTexH) * 65535), 0, 65535);
      const pIdx = (tz * texSize + tx) * 4;
      heightTexData[pIdx] = (q >>> 8) & 255;
      heightTexData[pIdx + 1] = q & 255;
      heightTexData[pIdx + 2] = clamp(Math.round(sampleFlow(x, z) * 255), 0, 255);
      heightTexData[pIdx + 3] = clamp(Math.round(sampleCurv(x, z) * 255), 0, 255);
    }
  }

  canonicalTerrain = {
    resolution: N,
    positions,
    normals,
    geoAttr,
    indices,
    heights,
    maxHeight: maxH,
    maxTexHeight: maxTexH,
    texSize,
    heightTexData,
    sampleHeight: sampleAt,
  };
  return canonicalTerrain;
}

function createHeightSampler(heights, N) {
  const half = WORLD_SIZE * 0.5;
  const invSize = (N - 1) / WORLD_SIZE;
  return function sampleHeight(x, z) {
    const gx = clamp((x + half) * invSize, 0, N - 1.0001);
    const gz = clamp((z + half) * invSize, 0, N - 1.0001);
    const ix = Math.floor(gx);
    const iz = Math.floor(gz);
    const fx = gx - ix;
    const fz = gz - iz;
    const i00 = iz * N + ix;
    const a=heights[i00],b=heights[i00+1],c=heights[i00+N],d=heights[i00+N+1];
    return fx+fz<=1 ? a+(b-a)*fx+(c-a)*fz : d+(c-d)*(1-fx)+(b-d)*(1-fz);
  };
}

function createAttrSampler(attr, N, offset) {
  const half = WORLD_SIZE * 0.5;
  const invSize = (N - 1) / WORLD_SIZE;
  return function sampleAttr(x, z) {
    const gx = clamp((x + half) * invSize, 0, N - 1.0001);
    const gz = clamp((z + half) * invSize, 0, N - 1.0001);
    const ix = Math.floor(gx);
    const iz = Math.floor(gz);
    const fx = gx - ix;
    const fz = gz - iz;
    const i00 = (iz * N + ix) * 4 + offset;
    const i10 = i00 + 4;
    const i01 = i00 + N * 4;
    const i11 = i01 + 4;
    const a = attr[i00] + (attr[i10] - attr[i00]) * fx;
    const b = attr[i01] + (attr[i11] - attr[i01]) * fx;
    return a + (b - a) * fz;
  };
}

export function buildWaterMesh() {
  const nx = 64;
  const nz = 64;
  const minX = -24;
  const maxX = 20;
  const minZ = -14;
  const maxZ = 18;

  const positions = new Float32Array(nx * nz * 3);
  const indices = new Uint16Array((nx - 1) * (nz - 1) * 6);

  for (let iz = 0; iz < nz; iz++) {
    const z = lerp(minZ, maxZ, iz / (nz - 1));
    for (let ix = 0; ix < nx; ix++) {
      const x = lerp(minX, maxX, ix / (nx - 1));
      const idx = iz * nx + ix;
      positions[idx * 3] = x;
      positions[idx * 3 + 1] = WATER_LEVEL;
      positions[idx * 3 + 2] = z;
    }
  }

  let ptr = 0;
  for (let iz = 0; iz < nz - 1; iz++) {
    for (let ix = 0; ix < nx - 1; ix++) {
      const a = iz * nx + ix;
      const b = a + 1;
      const c = a + nx;
      const d = c + 1;
      indices[ptr++] = a;
      indices[ptr++] = c;
      indices[ptr++] = b;
      indices[ptr++] = b;
      indices[ptr++] = c;
      indices[ptr++] = d;
    }
  }
  return { positions, indices };
}

/**
 * Generates subdivided undulating cloud deck mesh for soft volumetric-look sea of clouds.
 */
export function buildCloudDeckMesh(altitude = 8.4, span = 208, segs = 32) {
  const N = segs + 1;
  const half = span * 0.5;
  const positions = new Float32Array(N * N * 3);
  const indices = new Uint16Array(segs * segs * 6);

  for (let iz = 0; iz < N; iz++) {
    const z = lerp(-half, half, iz / segs);
    for (let ix = 0; ix < N; ix++) {
      const x = lerp(-half, half, ix / segs);
      const idx = iz * N + ix;
      // Subtle undulation so cloud sea never looks like a flat planar card
      const swell = Math.sin(x * 0.045) * Math.cos(z * 0.045) * 0.9;
      positions[idx * 3] = x;
      positions[idx * 3 + 1] = altitude + swell;
      positions[idx * 3 + 2] = z;
    }
  }

  let ptr = 0;
  for (let iz = 0; iz < segs; iz++) {
    for (let ix = 0; ix < segs; ix++) {
      const a = iz * N + ix;
      const b = a + 1;
      const c = a + N;
      const d = c + 1;
      indices[ptr++] = a;
      indices[ptr++] = c;
      indices[ptr++] = b;
      indices[ptr++] = b;
      indices[ptr++] = c;
      indices[ptr++] = d;
    }
  }
  return { positions, indices, altitude };
}

export function terrainUnitsToMeters(y) {
  const clamped = Math.max(0, y - WATER_LEVEL);
  // 0 above water -> 1,890 m; peak ~20 above water -> 3,420 m
  return Math.round(LAKE_METERS + clamped * ((PEAK_TARGET_METERS - LAKE_METERS) / 17.5));
}
