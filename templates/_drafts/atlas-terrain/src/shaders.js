/**
 * ATLAS — WebGL2 GLSL ES 3.00 Shader Suite
 * 1. Procedural Sky & Golden-Hour Atmospheric Scattering
 * 2. Continuous Contour-to-Geology Terrain Shader with Heightmap Self-Shadowing
 * 3. Glacial Lake Shader with Heightfield Raymarched Mountain Reflections
 * 4. Layered Atmospheric Cloud Deck Shader
 */

export const SKY_VERT = `#version 300 es
precision highp float;
out vec2 vNdc;

void main() {
  vec2 verts[3] = vec2[3](
    vec2(-1.0, -1.0),
    vec2( 3.0, -1.0),
    vec2(-1.0,  3.0)
  );
  vNdc = verts[gl_VertexID];
  gl_Position = vec4(vNdc, 0.9999, 1.0);
}
`;

export const SKY_FRAG = `#version 300 es
precision highp float;

in vec2 vNdc;
out vec4 fragColor;

uniform vec3 uCamRight;
uniform vec3 uCamUp;
uniform vec3 uCamForward;
uniform float uTanHalfFov;
uniform float uAspect;

uniform vec3 uSunDir;
uniform float uMapMix;
uniform float uGolden;
uniform float uValley;
uniform vec3 uSkyZenith;
uniform vec3 uSkyHorizon;

void main() {
  vec3 rd = normalize(
    uCamForward +
    vNdc.x * uAspect * uTanHalfFov * uCamRight +
    vNdc.y * uTanHalfFov * uCamUp
  );

  float h = clamp(rd.y, -0.25, 1.0);
  float horizonBand = pow(1.0 - clamp(abs(h), 0.0, 1.0), 3.6);
  float upperGrad = smoothstep(-0.04, 0.58, h);

  vec3 sky = mix(uSkyHorizon, uSkyZenith, upperGrad);

  // Subtle Rayleigh + Mie solar corona and golden-hour alpenglow wash
  float sunDot = max(dot(rd, normalize(uSunDir)), 0.0);
  vec3 sunWarm = mix(vec3(0.95, 0.96, 0.98), vec3(0.96, 0.71, 0.44), uGolden);
  float mieGlow = pow(sunDot, mix(14.0, 5.5, uGolden)) * mix(0.22, 0.58, uGolden);
  float sunDisc = smoothstep(0.9978, 0.9995, sunDot) * mix(0.45, 0.95, uGolden);
  sky += sunWarm * (mieGlow + sunDisc) * (1.0 - uMapMix * 0.85);

  // Horizon scatter glow toward sun azimuth during golden hour
  float sunHorizon = pow(max(dot(normalize(vec3(rd.x, 0.0, rd.z)), normalize(vec3(uSunDir.x, 0.0, uSunDir.z))), 0.0), 2.5);
  sky = mix(sky, vec3(0.89, 0.68, 0.48), horizonBand * sunHorizon * uGolden * 0.52 * (1.0 - uMapMix));

  // Soft misty valley brightness
  sky = mix(sky, vec3(0.84, 0.89, 0.92), horizonBand * uValley * 0.25 * (1.0 - uMapMix));

  // Blend cleanly to archival parchment paper in Map & Archive phases
  vec3 parchment = vec3(0.953, 0.937, 0.906);
  vec3 parchmentEdge = vec3(0.914, 0.894, 0.855);
  vec3 paperCol = mix(parchment, parchmentEdge, clamp(length(vNdc) * 0.48, 0.0, 1.0));
  sky = mix(sky, paperCol, clamp(uMapMix * 1.06, 0.0, 1.0));

  fragColor = vec4(sky, 1.0);
}
`;

export const TERRAIN_VERT = `#version 300 es
precision highp float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec4 aGeo;

uniform mat4 uViewProj;
uniform float uRelief;

out vec3 vWorldPos;
out vec3 vNormal;
out vec4 vGeo;
out float vRawElev;

void main() {
  float morphedY = mix(0.0, aPosition.y, uRelief);
  vec3 worldPos = vec3(aPosition.x, morphedY, aPosition.z);

  vec3 flatN = vec3(0.0, 1.0, 0.0);
  vec3 morphedN = normalize(mix(flatN, aNormal, smoothstep(0.0, 0.42, uRelief)));

  vWorldPos = worldPos;
  vNormal = morphedN;
  vGeo = aGeo;
  vRawElev = aPosition.y;

  gl_Position = uViewProj * vec4(worldPos, 1.0);
}
`;

export const TERRAIN_FRAG = `#version 300 es
precision highp float;

in vec3 vWorldPos;
in vec3 vNormal;
in vec4 vGeo;
in float vRawElev;

out vec4 fragColor;

uniform vec3 uCamPos;
uniform vec3 uSunDir;
uniform sampler2D uHeightTex;
uniform float uWorldSize;
uniform float uMaxTexHeight;
uniform float uWaterLevel;

uniform float uRelief;
uniform float uMapMix;
uniform float uGolden;
uniform float uFogDensity;
uniform vec3 uSkyZenith;
uniform vec3 uSkyHorizon;

// Lightweight procedural 2D hash & fBm for rock strata, forest texture, and snow drift
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbmDetail(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * noise2(p);
    p = rot * p * 2.07 + 11.3;
    a *= 0.5;
  }
  return v;
}

float sampleTexHeight(vec2 xz) {
  vec2 uv = xz / uWorldSize + 0.5;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
  vec4 enc = texture(uHeightTex, uv);
  float normH = (enc.r * 255.0 * 256.0 + enc.g * 255.0) / 65535.0;
  return normH * uMaxTexHeight;
}

// Anti-aliased topographic contour line helper
float contourMask(float h, float interval, float widthPx) {
  float scaled = h / interval;
  float fw = max(fwidth(scaled), 0.0008);
  float dist = abs(fract(scaled - 0.5) - 0.5) / fw;
  return 1.0 - smoothstep(0.0, widthPx, dist);
}

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(uCamPos - vWorldPos);
  vec3 L = normalize(uSunDir);

  float rawH = vRawElev;
  float ao = vGeo.y;
  float drainage = vGeo.z;
  float slope = clamp(1.0 - N.y, 0.0, 1.0);

  // Micro-geological detail Perturbation
  float rockNoise = fbmDetail(vWorldPos.xz * 0.42);
  float microGrain = fbmDetail(vWorldPos.xz * 1.95);
  float strata = sin(rawH * 3.8 + rockNoise * 3.2) * 0.5 + 0.5;

  // Slightly perturb shading normal for sharp alpine rock crags when 3D relief rises
  vec3 microN = normalize(N + vec3(
    (microGrain - 0.5) * 0.24,
    0.0,
    (rockNoise - 0.5) * 0.24
  ) * smoothstep(0.15, 0.85, uRelief) * smoothstep(0.12, 0.55, slope));

  // --- 1. CARTOGRAPHIC TOPOGRAPHIC APPEARANCE ---
  vec3 paperBase = vec3(0.953, 0.937, 0.906); // Archival vellum #f3efe7
  vec3 hypsoLow = vec3(0.865, 0.882, 0.860);  // Subalpine pale sage tint
  vec3 hypsoMid = vec3(0.768, 0.815, 0.840);  // Glacial slate wash
  vec3 hypsoHigh = vec3(0.968, 0.960, 0.945); // Snow crest ivory

  vec3 mapTint = mix(paperBase, hypsoLow, smoothstep(1.8, 5.5, rawH));
  mapTint = mix(mapTint, hypsoMid, smoothstep(5.5, 11.0, rawH) * 0.72);
  mapTint = mix(mapTint, hypsoHigh, smoothstep(11.5, 16.5, rawH));

  // Lake Vireo bathymetry in Map & Archive views
  float lakeMask = smoothstep(uWaterLevel + 0.12, uWaterLevel - 0.35, rawH);
  vec3 lakeBathymetry = mix(vec3(0.675, 0.775, 0.820), vec3(0.365, 0.525, 0.608), smoothstep(uWaterLevel, 0.4, rawH));
  mapTint = mix(mapTint, lakeBathymetry, lakeMask);

  // Subtle Swiss shaded-relief hillshade on cartographic sheet
  float cartoShade = clamp(dot(normalize(mix(vec3(0.0, 1.0, 0.0), vNormal, 0.55)), normalize(vec3(-0.65, 0.72, -0.45))), 0.0, 1.0);
  mapTint *= mix(0.91, 1.04, cartoShade);

  // Multi-tier anti-aliased contours (skip submerged basin interior except shoreline contour)
  float landMask = smoothstep(uWaterLevel - 0.05, uWaterLevel + 0.12, rawH);
  float minorContour = contourMask(rawH, 0.55, 1.2) * landMask;
  float indexContour = contourMask(rawH, 2.75, 1.65) * landMask;
  float shoreContour = contourMask(rawH - uWaterLevel + 0.01, 0.45, 1.35) * (1.0 - landMask) * smoothstep(0.35, 1.4, rawH);

  // Architectural coordinate graticule grid (every 16 units)
  vec2 gridCoord = vWorldPos.xz / 16.0;
  vec2 gridDist = abs(fract(gridCoord - 0.5) - 0.5) / max(fwidth(gridCoord), 0.0008);
  float gridLine = 1.0 - smoothstep(0.0, 1.15, min(gridDist.x, gridDist.y));

  vec3 inkMinor = vec3(0.24, 0.28, 0.31);
  vec3 inkMajor = vec3(0.10, 0.13, 0.16);
  vec3 inkLake = vec3(0.25, 0.43, 0.52);

  vec3 cartoColor = mapTint;
  cartoColor = mix(cartoColor, inkMajor, gridLine * 0.11);
  cartoColor = mix(cartoColor, inkMinor, minorContour * 0.36);
  cartoColor = mix(cartoColor, inkMajor, indexContour * 0.74);
  cartoColor = mix(cartoColor, inkLake, shoreContour * 0.48);

  // Crisp subtle border around archival sheet
  float edgeBorder = smoothstep(uWorldSize * 0.482, uWorldSize * 0.492, max(abs(vWorldPos.x), abs(vWorldPos.z)));
  cartoColor = mix(cartoColor, paperBase, edgeBorder);

  // --- 2. PHYSICAL GEOLOGICAL SURFACE MATERIALS ---
  // Material A: Glacial shore & wet siltstone
  vec3 wetStone = mix(vec3(0.16, 0.20, 0.23), vec3(0.32, 0.38, 0.42), microGrain);
  // Material B: Deep subalpine pine forest & alpine meadow
  vec3 forestCol = mix(vec3(0.095, 0.185, 0.145), vec3(0.175, 0.265, 0.195), rockNoise * 0.7 + microGrain * 0.3);
  forestCol = mix(forestCol, vec3(0.24, 0.27, 0.19), drainage * 0.35);
  // Material C: Stratified alpine granite & talus scree
  vec3 graniteDark = vec3(0.21, 0.235, 0.265);
  vec3 graniteLight = vec3(0.47, 0.495, 0.52);
  vec3 rockCol = mix(graniteDark, graniteLight, strata * 0.55 + microGrain * 0.45);
  rockCol = mix(rockCol, vec3(0.30, 0.33, 0.35), drainage * 0.38);

  // Material D: Firn & crisp alpine snowpack
  vec3 snowCol = mix(vec3(0.84, 0.89, 0.93), vec3(0.97, 0.98, 0.995), rockNoise);

  // Elevation & slope biome masks
  float shoreWet = 1.0 - smoothstep(uWaterLevel - 0.2, uWaterLevel + 0.55, rawH);
  float timberBand = smoothstep(uWaterLevel + 0.25, uWaterLevel + 1.35, rawH) * (1.0 - smoothstep(6.2, 9.2, rawH));
  float forestSlopeMask = 1.0 - smoothstep(0.24, 0.48, slope + (rockNoise - 0.5) * 0.12);
  float forestMask = timberBand * forestSlopeMask;

  float snowAltitude = smoothstep(8.2, 12.6, rawH + (rockNoise - 0.5) * 2.2);
  float snowSlope = 1.0 - smoothstep(0.26, 0.52, slope + (microGrain - 0.5) * 0.14);
  float snowMask = snowAltitude * snowSlope;

  vec3 albedo = rockCol;
  albedo = mix(albedo, forestCol, forestMask);
  albedo = mix(albedo, wetStone, shoreWet);
  albedo = mix(albedo, snowCol, snowMask);

  // Roughness per material (snow slightly crisp glinting, wet stone lower roughness)
  float roughness = mix(0.86, 0.94, forestMask);
  roughness = mix(roughness, 0.42, shoreWet);
  roughness = mix(roughness, 0.56, snowMask);

  // --- 3. DIRECTIONAL SHADOWS & PHYSICALLY INFORMED LIGHTING ---
  // Fast 5-step heightfield shadow march along sun direction when terrain is raised
  float shadow = 1.0;
  if (uRelief > 0.22) {
    float stepDist = 1.85;
    float rayBias = 0.16;
    float occ = 0.0;
    for (int s = 1; s <= 5; s++) {
      float t = float(s) * stepDist;
      vec3 sp = vWorldPos + L * t;
      float th = sampleTexHeight(sp.xz) * uRelief;
      float diff = th - (sp.y + rayBias);
      occ = max(occ, clamp(diff / (0.65 + t * 0.18), 0.0, 1.0));
    }
    shadow = 1.0 - occ * 0.78 * smoothstep(0.22, 0.65, uRelief);
  }

  float NdotL = max(dot(microN, L), 0.0);
  // Subtle wrap light for soft snow scattering
  float snowWrap = max((dot(microN, L) + 0.28) / 1.28, 0.0) * snowMask;
  float diffuse = mix(NdotL, max(NdotL, snowWrap * 0.78), snowMask);

  vec3 sunColor = mix(vec3(1.02, 0.99, 0.94), vec3(1.18, 0.76, 0.43), uGolden);
  vec3 skyFill = mix(vec3(0.32, 0.46, 0.58), vec3(0.35, 0.41, 0.52), uGolden);
  vec3 groundBounce = mix(vec3(0.14, 0.17, 0.18), vec3(0.20, 0.16, 0.13), uGolden);

  float hemi = microN.y * 0.5 + 0.5;
  vec3 ambient = mix(groundBounce, skyFill, hemi) * ao * mix(0.62, 0.48, uGolden);

  // Blinn-Phong / GGX approximation specular highlight for wet rock & snow crust
  vec3 H = normalize(L + V);
  float specPow = mix(18.0, 72.0, 1.0 - roughness);
  float spec = pow(max(dot(microN, H), 0.0), specPow) * mix(0.05, 0.34, 1.0 - roughness);

  vec3 litGeology = albedo * (ambient + sunColor * diffuse * shadow) + sunColor * spec * shadow;

  // Fade remaining faint contour traces along cliffs during ascent before vanishing completely
  float residualContour = (indexContour * 0.52 + minorContour * 0.22) * smoothstep(0.0, 0.55, uMapMix);
  litGeology = mix(litGeology, inkMajor, residualContour * 0.45);

  // Aerial perspective / height-dependent atmospheric fog
  float camDist = length(uCamPos - vWorldPos);
  float heightFactor = exp(-max(0.0, vWorldPos.y - 2.0) * 0.075);
  float fogAmount = 1.0 - exp(-camDist * uFogDensity * mix(0.45, 1.15, heightFactor));
  fogAmount = clamp(fogAmount * (1.0 - uMapMix * 0.92), 0.0, 0.88);

  vec3 viewDir = normalize(vWorldPos - uCamPos);
  float sunAlign = pow(max(dot(viewDir, L), 0.0), 4.0);
  vec3 fogColor = mix(uSkyHorizon, mix(uSkyHorizon, vec3(0.93, 0.72, 0.49), sunAlign * uGolden * 0.65), 0.7);
  litGeology = mix(litGeology, fogColor, fogAmount);

  // Blend smoothly between flat/raised Cartography and physical Geology
  vec3 finalCol = mix(litGeology, cartoColor, clamp(uMapMix, 0.0, 1.0));
  fragColor = vec4(finalCol, 1.0);
}
`;

export const WATER_VERT = `#version 300 es
precision highp float;

layout(location = 0) in vec3 aPosition;

uniform mat4 uViewProj;
uniform float uRelief;

out vec3 vWorldPos;

void main() {
  vec3 pos = vec3(aPosition.x, mix(0.02, aPosition.y, uRelief), aPosition.z);
  vWorldPos = pos;
  gl_Position = uViewProj * vec4(pos, 1.0);
}
`;

export const WATER_FRAG = `#version 300 es
precision highp float;

in vec3 vWorldPos;
out vec4 fragColor;

uniform vec3 uCamPos;
uniform vec3 uSunDir;
uniform sampler2D uHeightTex;
uniform float uWorldSize;
uniform float uMaxTexHeight;
uniform float uWaterLevel;
uniform float uRelief;
uniform float uMapMix;
uniform float uGolden;
uniform float uTime;
uniform float uFogDensity;
uniform vec3 uSkyZenith;
uniform vec3 uSkyHorizon;

float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float sampleTexHeight(vec2 xz) {
  vec2 uv = xz / uWorldSize + 0.5;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
  vec4 enc = texture(uHeightTex, uv);
  float normH = (enc.r * 255.0 * 256.0 + enc.g * 255.0) / 65535.0;
  return normH * uMaxTexHeight;
}

float waveHeight(vec2 p, float t) {
  float w = 0.0;
  w += sin(p.x * 2.1 + p.y * 1.4 + t * 1.15) * 0.42;
  w += sin(p.x * -3.2 + p.y * 2.7 - t * 0.92) * 0.28;
  w += noise2(p * 3.4 + vec2(t * 0.35, -t * 0.25)) * 0.55;
  w += noise2(p * 7.8 - vec2(t * 0.48, t * 0.31)) * 0.24;
  return w;
}

// Compute sky reflection color along reflected ray
vec3 sampleSkyRefl(vec3 rd, vec3 L) {
  float grad = smoothstep(-0.02, 0.55, clamp(rd.y, 0.0, 1.0));
  vec3 sky = mix(uSkyHorizon, uSkyZenith, grad);
  float sunDot = max(dot(rd, L), 0.0);
  vec3 sunTint = mix(vec3(0.98, 0.96, 0.92), vec3(0.98, 0.72, 0.44), uGolden);
  sky += sunTint * pow(sunDot, 22.0) * 0.55;
  return sky;
}

void main() {
  // Only render water once the 3D terrain emerges from flat cartography
  float waterVis = smoothstep(0.28, 0.65, uRelief) * (1.0 - smoothstep(0.35, 0.78, uMapMix));
  if (waterVis <= 0.01) discard;

  float bedH = sampleTexHeight(vWorldPos.xz);
  float depth = (uWaterLevel - bedH) * uRelief;
  if (depth <= 0.005) discard;

  // Multi-octave capillary wave normal
  float eps = 0.07;
  float h0 = waveHeight(vWorldPos.xz, uTime);
  float hx = waveHeight(vWorldPos.xz + vec2(eps, 0.0), uTime);
  float hz = waveHeight(vWorldPos.xz + vec2(0.0, eps), uTime);
  float rippleStrength = mix(0.012, 0.028, smoothstep(0.0, 0.6, depth));
  vec3 N = normalize(vec3((h0 - hx) * rippleStrength / eps, 1.0, (h0 - hz) * rippleStrength / eps));

  vec3 V = normalize(uCamPos - vWorldPos);
  vec3 L = normalize(uSunDir);
  vec3 R = reflect(-V, N);
  if (R.y < 0.02) R.y = 0.02;
  R = normalize(R);

  // Schlick Fresnel
  float NdotV = max(dot(N, V), 0.0);
  float fresnel = 0.03 + 0.97 * pow(1.0 - NdotV, 4.4);

  // Heightfield raymarched mountain reflection across Lake Vireo
  vec3 reflColor = sampleSkyRefl(R, L);
  float dt = 1.65;
  float maxDist = 42.0;
  float t = 0.6;
  bool hit = false;
  vec3 hitPos = vWorldPos;

  for (int i = 0; i < 18; i++) {
    vec3 p = vWorldPos + R * t;
    float th = sampleTexHeight(p.xz) * uRelief;
    if (p.y < th) {
      hit = true;
      hitPos = p;
      break;
    }
    t += dt;
    dt *= 1.09;
    if (t > maxDist) break;
  }

  if (hit) {
    // Approximate reflected slope normal for convincing reflected lighting
    float e = 0.65;
    float hL = sampleTexHeight(hitPos.xz - vec2(e, 0.0)) * uRelief;
    float hR = sampleTexHeight(hitPos.xz + vec2(e, 0.0)) * uRelief;
    float hD = sampleTexHeight(hitPos.xz - vec2(0.0, e)) * uRelief;
    float hU = sampleTexHeight(hitPos.xz + vec2(0.0, e)) * uRelief;
    vec3 rN = normalize(vec3(hL - hR, 2.0 * e, hD - hU));

    float slope = 1.0 - rN.y;
    vec3 rForest = vec3(0.08, 0.16, 0.13);
    vec3 rRock = vec3(0.24, 0.27, 0.30);
    vec3 rSnow = vec3(0.84, 0.89, 0.93);

    float rForMask = smoothstep(1.8, 3.0, hitPos.y) * (1.0 - smoothstep(6.2, 9.0, hitPos.y)) * (1.0 - smoothstep(0.25, 0.48, slope));
    float rSnowMask = smoothstep(8.4, 12.2, hitPos.y) * (1.0 - smoothstep(0.28, 0.52, slope));

    vec3 rAlb = mix(rRock, rForest, rForMask);
    rAlb = mix(rAlb, rSnow, rSnowMask);

    float rDiff = max(dot(rN, L), 0.0);
    vec3 sunCol = mix(vec3(0.98, 0.96, 0.92), vec3(1.12, 0.72, 0.42), uGolden);
    vec3 mCol = rAlb * (uSkyHorizon * 0.45 + sunCol * rDiff * 0.82);

    float reflFog = 1.0 - exp(-t * 0.022);
    reflColor = mix(mCol, uSkyHorizon, clamp(reflFog, 0.0, 0.78));
  }

  // Glacial meltwater absorption: turquoise shallows -> deep alpine slate-blue
  vec3 shallowCol = vec3(0.32, 0.52, 0.59);
  vec3 deepCol = vec3(0.065, 0.145, 0.195);
  vec3 waterBody = mix(shallowCol, deepCol, smoothstep(0.06, 1.05, depth));

  // Specular sun sparkle across ripples
  vec3 H = normalize(L + V);
  vec3 sunSpecCol = mix(vec3(1.0, 0.98, 0.92), vec3(1.0, 0.76, 0.46), uGolden);
  float spec = pow(max(dot(N, H), 0.0), 160.0) * 1.15;

  vec3 col = mix(waterBody, reflColor, clamp(fresnel * 0.88 + 0.14, 0.0, 0.95)) + sunSpecCol * spec;

  // Delicate glacial shoreline foam ripple
  float foam = (1.0 - smoothstep(0.01, 0.11, depth)) * 0.35;
  col = mix(col, vec3(0.84, 0.90, 0.93), foam);

  // Match terrain atmospheric fog
  float camDist = length(uCamPos - vWorldPos);
  float fogAmt = 1.0 - exp(-camDist * uFogDensity);
  col = mix(col, uSkyHorizon, clamp(fogAmt * 0.92, 0.0, 0.86));

  float edgeAlpha = smoothstep(0.005, 0.11, depth) * waterVis;
  fragColor = vec4(col, edgeAlpha);
}
`;

export const CLOUD_VERT = `#version 300 es
precision highp float;

layout(location = 0) in vec3 aPosition;
uniform mat4 uViewProj;
uniform float uAltitudeOffset;

out vec3 vWorldPos;

void main() {
  vec3 pos = vec3(aPosition.x, aPosition.y + uAltitudeOffset, aPosition.z);
  vWorldPos = pos;
  gl_Position = uViewProj * vec4(pos, 1.0);
}
`;

export const CLOUD_FRAG = `#version 300 es
precision highp float;

in vec3 vWorldPos;
out vec4 fragColor;

uniform vec3 uCamPos;
uniform vec3 uSunDir;
uniform sampler2D uHeightTex;
uniform float uWorldSize;
uniform float uMaxTexHeight;
uniform float uRelief;
uniform float uMapMix;
uniform float uGolden;
uniform float uTime;
uniform float uCloudAlpha;
uniform float uLayerSeed;

float hash21(vec2 p) {
  p = fract(p * vec2(234.12, 567.89));
  p += dot(p, p + 41.7);
  return fract(p.x * p.y);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float cloudFbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise2(p);
    p = p * 2.05 + vec2(7.1, 3.9);
    a *= 0.5;
  }
  return v;
}

float sampleTexHeight(vec2 xz) {
  vec2 uv = xz / uWorldSize + 0.5;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
  vec4 enc = texture(uHeightTex, uv);
  float normH = (enc.r * 255.0 * 256.0 + enc.g * 255.0) / 65535.0;
  return normH * uMaxTexHeight;
}

void main() {
  float visibility = uCloudAlpha * smoothstep(0.45, 0.9, uRelief) * (1.0 - smoothstep(0.25, 0.65, uMapMix));
  if (visibility <= 0.01) discard;

  // Soft radial falloff near terrain edge
  float radial = length(vWorldPos.xz) / (uWorldSize * 0.48);
  float edgeMask = 1.0 - smoothstep(0.72, 1.0, radial);

  // Never cut sharply through mountain walls: fade softly within 1.8 units of terrain surface
  float terrH = sampleTexHeight(vWorldPos.xz) * uRelief;
  float terrainClearance = smoothstep(-0.3, 2.2, vWorldPos.y - terrH);

  // Camera altitude proximity fade: gently part clouds as camera ascends straight through this deck
  float camAltDist = abs(uCamPos.y - vWorldPos.y);
  float camProximity = smoothstep(0.35, 2.6, camAltDist);

  vec2 uv = vWorldPos.xz * 0.062 + vec2(uTime * 0.022 + uLayerSeed * 9.3, -uTime * 0.012);
  float f = cloudFbm(uv);
  float density = smoothstep(0.44, 0.78, f) * edgeMask * terrainClearance * mix(0.24, 1.0, camProximity);

  // Subtle translucent mist veil when camera actually slices through cloud height
  float passVeil = (1.0 - camProximity) * 0.18 * smoothstep(0.32, 0.65, f);
  float alpha = clamp((density * 0.68 + passVeil) * visibility, 0.0, 0.78);
  if (alpha <= 0.005) discard;

  // Directional forward scatter / golden-hour sunlit cloud edges
  vec3 viewDir = normalize(vWorldPos - uCamPos);
  float sunForward = pow(max(dot(viewDir, normalize(uSunDir)), 0.0), 4.0);
  vec3 coolShadow = mix(vec3(0.68, 0.76, 0.83), vec3(0.56, 0.58, 0.67), uGolden);
  vec3 brightEdge = mix(vec3(0.96, 0.98, 1.0), vec3(0.98, 0.80, 0.58), uGolden);

  vec3 cloudCol = mix(coolShadow, brightEdge, smoothstep(0.45, 0.78, f) * 0.75 + sunForward * 0.45);
  fragColor = vec4(cloudCol, alpha);
}
`;
