/**
 * ATLAS — Geological Terrain Synthesis Engine
 * Procedural alpine massif, glacial cirque, U-shaped valley trough,
 * Lake Vireo tarn basin, drainage gullies, horizon ambient occlusion,
 * and O(1) bilinear height sampling for spline collision avoidance.
 */

export const WORLD_SIZE = 136; // World span [-68, +68] in X and Z (~13.6 km across)
export const WATER_LEVEL = 1.68; // Glacial lake elevation (~1,890 m)
export const BASE_METERS = 1650;
export const METERS_PER_UNIT = 97.5; // Maps peak ~18.15 units -> ~3,420 m

export const LANDMARKS = Object.freeze([
  {
    id: 'kestrel',
    name: 'Kestrel Spire',
    elevationM: 3420,
    x: 13.5,
    z: -15.5,
  },
  {
    id: 'saddle',
    name: 'Meridian Saddle',
    elevationM: 2640,
    x: -17.0,
    z: -8.5,
  },
  {
    id: 'tarn',
    name: 'Lake Vireo',
    elevationM: 1890,
    x: -2.0,
    z: 4.5,
  },
]);

// Deterministic 2D hash & gradient value noise (zero external dependencies)
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

// Value noise + analytical spatial derivatives [value, dx, dz]
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

// Rotated multi-octave fBm with gradient accumulation (erosion suppression on steep slopes)
function fbmGeological(x, z, octaves = 6) {
  let sum = 0;
  let dxAcc = 0;
  let dzAcc = 0;
  let amp = 0.5;
  let freq = 1.0;

  // Orthonormal rotation matrix per octave to break grid alignment
  const cosR = 0.8;
  const sinR = 0.6;
  let px = x;
  let pz = z;

  for (let i = 0; i < octaves; i++) {
    const [n, gx, gz] = noise2DWithDeriv(px * freq, pz * freq);
    // Remap [0, 1] -> [-1, 1]
    const val = n * 2 - 1;
    dxAcc += gx * 2;
    dzAcc += gz * 2;
    // Swiss turbulence slope damping: steeper flanks retain sharp gullies, valleys fill softly
    const slopeMag = dxAcc * dxAcc + dzAcc * dzAcc;
    const damp = 1.0 / (1.0 + 0.35 * slopeMag);
    sum += amp * val * damp;

    const nx = px * cosR - pz * sinR;
    const nz = px * sinR + pz * cosR;
    px = nx + 13.7;
    pz = nz - 7.3;
    freq *= 2.07;
    amp *= 0.48;
  }
  return sum;
}

// Sharp ridged multifractal for alpine arêtes and cirque crests
function ridgedAlpine(x, z, octaves = 5) {
  let sum = 0;
  let amp = 0.52;
  let freq = 1.0;
  let weight = 1.0;

  const cosR = 0.866;
  const sinR = 0.5;
  let px = x;
  let pz = z;

  for (let i = 0; i < octaves; i++) {
    const [n] = noise2DWithDeriv(px * freq, pz * freq);
    let signal = 1.0 - Math.abs(n * 2 - 1);
    signal = signal * signal * weight;
    weight = clamp(signal * 1.85, 0.08, 1.0);
    sum += signal * amp;

    const nx = px * cosR - pz * sinR;
    const nz = px * sinR + pz * cosR;
    px = nx - 5.1;
    pz = nz + 11.9;
    freq *= 2.13;
    amp *= 0.49;
  }
  return sum;
}

// Evaluate distance to a line segment for curved mountain chains and valley troughs
function distToSegment(px, pz, ax, az, bx, bz) {
  const abx = bx - ax;
  const abz = bz - az;
  const apx = px - ax;
  const apz = pz - az;
  const denom = abx * abx + abz * abz || 1;
  const t = clamp((apx * abx + apz * abz) / denom, 0, 1);
  const cx = ax + abx * t;
  const cz = az + abz * t;
  const dx = px - cx;
  const dz = pz - cz;
  return [Math.hypot(dx, dz), t];
}

/**
 * Evaluates credible geological elevation at world coordinate (x, z).
 * Returns [heightUnits, drainageChannel, glacialMask]
 */
function evaluateGeology(x, z) {
  // Tectonic domain warp (alpine folding)
  const wx = x + fbmGeological(x * 0.024 + 4.2, z * 0.024 - 1.7, 3) * 8.5;
  const wz = z + fbmGeological(x * 0.024 - 6.1, z * 0.024 + 3.4, 3) * 8.5;

  // 1. Primary horseshoe massif spine wrapping the north, east, and west of the cirque
  const [dEast, tEast] = distToSegment(wx, wz, 22, 16, 13.5, -16.5);
  const [dNorth] = distToSegment(wx, wz, 13.5, -16.5, -18.0, -19.5);
  const [dWest] = distToSegment(wx, wz, -18.0, -19.5, -31.0, 14.0);
  const [dFarNorth] = distToSegment(wx, wz, -44.0, -40.0, 44.0, -38.0);

  const spineDist = Math.min(dEast, dNorth * 1.04, dWest * 1.08);
  const spineEnvelope = Math.exp(-(spineDist * spineDist) / (2 * 14.5 * 14.5));
  const farRangeEnvelope = Math.exp(-(dFarNorth * dFarNorth) / (2 * 18.0 * 18.0)) * 0.72;

  // Kestrel Spire hero massif around (13.5, -15.5)
  const dk = Math.hypot(x - 13.5, z + 15.5);
  const kestrelMass = Math.exp(-(dk * dk) / (2 * 11.5 * 11.5)) * 7.4;

  // Meridian Saddle western spur around (-17, -8.5)
  const dm = Math.hypot(x + 17.5, z + 8.5);
  const meridianMass = Math.exp(-(dm * dm) / (2 * 12.0 * 12.0)) * 5.6;

  // South-west & south-east portal shoulders framing the Descent corridor
  const dsw = Math.hypot(x + 21.0, z - 22.0);
  const dse = Math.hypot(x - 26.0, z - 20.0);
  const portalShoulders =
    Math.exp(-(dsw * dsw) / (2 * 11.0 * 11.0)) * 4.9 +
    Math.exp(-(dse * dse) / (2 * 12.5 * 12.5)) * 5.2 +
    tEast * 0.15;

  // Multi-scale ridged arêtes + dendritic valleys
  const ridges = ridgedAlpine(wx * 0.044 + 2.3, wz * 0.044 - 1.4, 5);
  const macroFbm = fbmGeological(wx * 0.032 - 3.1, wz * 0.032 + 5.7, 5);
  const strataDetail = fbmGeological(x * 0.14, z * 0.14, 3);

  // Subtle sedimentary/metamorphic terrace banding along high flanks
  const baseMass =
    spineEnvelope * (8.6 + ridges * 8.4) +
    farRangeEnvelope * (7.2 + ridges * 7.8) +
    kestrelMass * (0.76 + ridges * 0.52) +
    meridianMass * (0.72 + ridges * 0.48) +
    portalShoulders * (0.75 + ridges * 0.42) +
    Math.max(0, macroFbm) * 2.4;

  // 2. Glacial Valley & U-Shaped Approach Trough
  // Curves gently from southern approach pass (4, 40) -> corridor (2, 20) -> Lake Vireo (-2, 4.5)
  const [dCorridor, tCorridor] = distToSegment(x + macroFbm * 1.4, z, 5.5, 48.0, -2.0, 5.0);
  const corridorWidth = lerp(7.8, 12.0, tCorridor);
  const corridorCarve = Math.exp(-Math.pow(dCorridor / corridorWidth, 2.4));

  // Lake Vireo glacial tarn basin centered at (-2.0, 4.5)
  const lx = (x + 2.0 + macroFbm * 1.25) / 11.4;
  const lz = (z - 4.5 + strataDetail * 0.85) / 8.8;
  const tarnR = Math.hypot(lx, lz);
  const tarnBasin = smoothstep(1.38, 0.12, tarnR);

  // Subtle moraine sill along the south outlet of the lake so water sits naturally inside a bowl
  const moraineLip = Math.exp(-Math.pow((z - 15.8) / 3.8, 2)) * Math.exp(-Math.pow((x - 0.5) / 9.5, 2)) * 1.05;

  // Combine elevation and carve glacial basin
  let elevation = baseMass + moraineLip + 1.9;
  // Carve valley corridor smoothly down toward valley floor (~2.45 units)
  elevation = lerp(elevation, 2.25 + Math.abs(strataDetail) * 0.42, corridorCarve * 0.84);
  // Carve tarn lake bed below WATER_LEVEL (1.68 -> ~0.35 at center)
  elevation = lerp(elevation, 0.32 + strataDetail * 0.18, tarnBasin * 0.94);

  // Soft outer border apron so the cartographic sheet sits neatly framed in Map & Archive views
  const edgeR = Math.max(Math.abs(x), Math.abs(z)) / (WORLD_SIZE * 0.5);
  const apron = 1.0 - smoothstep(0.76, 0.99, edgeR);
  elevation = lerp(1.55, elevation, apron);

  // Subtle rock shelf strata modulation at high elevations
  const shelf = Math.sin(elevation * 2.15 + strataDetail * 1.8) * 0.11 * smoothstep(4.5, 11.0, elevation);
  elevation += shelf + strataDetail * 0.18 * smoothstep(2.0, 8.0, elevation);

  // Dendritic gully / drainage cue for sediment shading
  const drainage = clamp(1.0 - Math.abs(fbmGeological(x * 0.095, z * 0.095, 3)) * 2.2, 0, 1);

  return [Math.max(0.15, elevation), drainage, tarnBasin];
}

export function elevationToMeters(y) {
  return Math.round(BASE_METERS + Math.max(0, y) * METERS_PER_UNIT);
}

/**
 * Generates high-resolution terrain geometry, vertex attributes,
 * analytical normals, horizon ambient occlusion, and 256x256 height texture.
 */
export function buildTerrainData(resolution = 192) {
  const N = resolution;
  const vertCount = N * N;
  const half = WORLD_SIZE * 0.5;
  const step = WORLD_SIZE / (N - 1);

  const heights = new Float32Array(vertCount);
  const drainage = new Float32Array(vertCount);
  const positions = new Float32Array(vertCount * 3);
  const normals = new Float32Array(vertCount * 3);
  const geoAttr = new Float32Array(vertCount * 4); // [normElev, horizonAO, drainage, slope]

  let maxH = 0;
  for (let gz = 0; gz < N; gz++) {
    const z = -half + gz * step;
    for (let gx = 0; gx < N; gx++) {
      const x = -half + gx * step;
      const idx = gz * N + gx;
      const [h, dr] = evaluateGeology(x, z);
      heights[idx] = h;
      drainage[idx] = dr;
      if (h > maxH) maxH = h;
      positions[idx * 3] = x;
      positions[idx * 3 + 1] = h;
      positions[idx * 3 + 2] = z;
    }
  }

  // Compute exact central-difference normals, slope, and multi-direction horizon AO
  const inv2Step = 1 / (2 * step);
  const aoDirs = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [0.707, 0.707], [-0.707, 0.707], [0.707, -0.707], [-0.707, -0.707],
  ];

  for (let gz = 0; gz < N; gz++) {
    const z0 = Math.max(0, gz - 1);
    const z1 = Math.min(N - 1, gz + 1);
    for (let gx = 0; gx < N; gx++) {
      const x0 = Math.max(0, gx - 1);
      const x1 = Math.min(N - 1, gx + 1);
      const idx = gz * N + gx;

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

      // Horizon AO: sample 8 compass rays at 2 radii to find valley enclosure
      const hC = heights[idx];
      let occ = 0;
      for (let d = 0; d < aoDirs.length; d++) {
        const dx = aoDirs[d][0];
        const dz = aoDirs[d][1];
        let maxSin = 0;
        for (let r = 3; r <= 9; r += 3) {
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
      const ao = clamp(1.0 - (occ / aoDirs.length) * 0.92, 0.24, 1.0);
      const slope = clamp(1.0 - ny, 0, 1);

      geoAttr[idx * 4] = clamp(hC / Math.max(maxH, 1), 0, 1);
      geoAttr[idx * 4 + 1] = ao;
      geoAttr[idx * 4 + 2] = drainage[idx];
      geoAttr[idx * 4 + 3] = slope;
    }
  }

  // Build triangle index buffer (Uint32 for >65k vertices)
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

  // Pack 256x256 16-bit RG height + B horizon AO texture for GPU raymarched water reflections & terrain shadows
  const texSize = 256;
  const heightTexData = new Uint8Array(texSize * texSize * 4);
  const maxTexH = Math.max(24.0, Math.ceil(maxH + 1.5));
  const sampleAt = createHeightSampler(heights, N);

  for (let tz = 0; tz < texSize; tz++) {
    const z = -half + (tz / (texSize - 1)) * WORLD_SIZE;
    for (let tx = 0; tx < texSize; tx++) {
      const x = -half + (tx / (texSize - 1)) * WORLD_SIZE;
      const h = sampleAt(x, z);
      const q = clamp(Math.round((h / maxTexH) * 65535), 0, 65535);
      const pIdx = (tz * texSize + tx) * 4;
      heightTexData[pIdx] = (q >>> 8) & 255; // High byte
      heightTexData[pIdx + 1] = q & 255;     // Low byte
      heightTexData[pIdx + 2] = clamp(Math.round((h > WATER_LEVEL ? 1.0 : 0.0) * 255), 0, 255);
      heightTexData[pIdx + 3] = 255;
    }
  }

  return {
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
    const i10 = i00 + 1;
    const i01 = i00 + N;
    const i11 = i01 + 1;

    const a = heights[i00] + (heights[i10] - heights[i00]) * fx;
    const b = heights[i01] + (heights[i11] - heights[i01]) * fx;
    return a + (b - a) * fz;
  };
}

/**
 * Generates glacial water plane mesh sized strictly over Lake Vireo's carved basin.
 */
export function buildWaterMesh() {
  const nx = 48;
  const nz = 48;
  const minX = -20;
  const maxX = 16;
  const minZ = -10;
  const maxZ = 20;

  const positions = new Float32Array(nx * nz * 3);
  const indices = new Uint16Array((nx - 1) * (nz - 1) * 6);

  for (let iz = 0; iz < nz; iz++) {
    const tz = iz / (nz - 1);
    const z = lerp(minZ, maxZ, tz);
    for (let ix = 0; ix < nx; ix++) {
      const tx = ix / (nx - 1);
      const x = lerp(minX, maxX, tx);
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
 * Generates dual atmospheric cloud stratus decks spanning the alpine basin.
 */
export function buildCloudDeckMesh(altitude = 9.4, span = 132) {
  const half = span * 0.5;
  const positions = new Float32Array([
    -half, altitude, -half,
     half, altitude, -half,
    -half, altitude,  half,
     half, altitude,  half,
  ]);
  const indices = new Uint16Array([0, 2, 1, 1, 2, 3]);
  return { positions, indices, altitude };
}
