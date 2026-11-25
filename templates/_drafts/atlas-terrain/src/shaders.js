/**
 * ATLAS — A3 WebGL2 Shader Suite
 * - Atmospheric Rayleigh/Mie Sky Dome + Archival Paper Blend
 * - Bicubic Smooth Swiss Contours + Eroded Micro-Normal Rock/Forest/Snow Terrain
 * - Bright Glacial Lake with Raymarched Mountain Reflections & Shorelines
 * - 5-Layer Volumetric-Look Sea of Clouds with Golden-Hour Rim Scattering
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
  float horizonBand = pow(1.0 - clamp(abs(h), 0.0, 1.0), 3.4);
  float upperGrad = smoothstep(-0.04, 0.55, h);

  vec3 sky = mix(uSkyHorizon, uSkyZenith, upperGrad);

  // Crisp solar disc + Mie golden-hour / morning scattering
  vec3 L = normalize(uSunDir);
  float sunDot = max(dot(rd, L), 0.0);
  vec3 sunWarm = mix(vec3(1.0, 0.98, 0.94), vec3(1.0, 0.72, 0.42), uGolden);
  float mieGlow = pow(sunDot, mix(12.0, 4.5, uGolden)) * mix(0.24, 0.68, uGolden);
  float sunDisc = smoothstep(0.9982, 0.9996, sunDot) * mix(0.55, 1.0, uGolden);
  sky += sunWarm * (mieGlow + sunDisc) * (1.0 - uMapMix * 0.9);

  // Warm apricot horizon wash around sun azimuth during Summit golden hour
  float sunAzimuth = pow(max(dot(normalize(vec3(rd.x, 0.0, rd.z)), normalize(vec3(L.x, 0.0, L.z))), 0.0), 2.0);
  sky = mix(sky, vec3(0.95, 0.72, 0.48), horizonBand * sunAzimuth * uGolden * 0.58 * (1.0 - uMapMix));

  // Crisp luminous valley mist glow
  sky = mix(sky, vec3(0.86, 0.91, 0.94), horizonBand * uValley * 0.28 * (1.0 - uMapMix));

  // Clean cotton-rag archival paper in Map & Archive views
  vec3 paperCenter = vec3(0.957, 0.941, 0.910); // #f4f0e8
  vec3 paperMargin = vec3(0.933, 0.914, 0.878);
  vec3 paperCol = mix(paperCenter, paperMargin, clamp(length(vNdc) * 0.45, 0.0, 1.0));
  sky = mix(sky, paperCol, clamp(uMapMix * 1.08, 0.0, 1.0));

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
  vec3 morphedN = normalize(vec3(aNormal.x*uRelief,aNormal.y,aNormal.z*uRelief));

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
uniform float uFolioHalf;
uniform float uMaxTexHeight;
uniform float uWaterLevel;

uniform float uRelief;
uniform float uMapMix;
uniform float uGolden;
uniform float uFogDensity;
uniform vec3 uSkyZenith;
uniform vec3 uSkyHorizon;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
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

float fbmRock(vec2 p) {
  float v = 0.0;
  float a = 0.52;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 3; i++) {
    v += a * noise2(p);
    p = rot * p * 2.11 + 13.7;
    a *= 0.48;
  }
  return v;
}

float ridgedRock(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  mat2 rot = mat2(0.866, 0.5, -0.5, 0.866);
  for (int i = 0; i < 2; i++) {
    float n = 1.0 - abs(noise2(p) * 2.0 - 1.0);
    v += a * n * n;
    p = rot * p * 2.17 + 7.3;
    a *= 0.48;
  }
  return v;
}

float decodeHeight(vec4 enc) {
  return ((enc.r * 255.0 * 256.0 + enc.g * 255.0) / 65535.0) * uMaxTexHeight;
}

float sampleTexHeight(vec2 xz) {
  vec2 uv = xz / uWorldSize + 0.5;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
  return decodeHeight(texture(uHeightTex, uv));
}

// Smooth bicubic-like height reconstruction so cartographic contour lines are razor-clean vector curves
float sampleSmoothHeight(vec2 xz) {
  vec2 uv = xz / uWorldSize + 0.5;
  float texRes = 512.0;
  vec2 st = uv * texRes - 0.5;
  vec2 i = floor(st);
  vec2 f = fract(st);
  vec2 w = f * f * (3.0 - 2.0 * f);

  vec2 uv00 = (i + vec2(0.5, 0.5)) / texRes;
  vec2 uv10 = (i + vec2(1.5, 0.5)) / texRes;
  vec2 uv01 = (i + vec2(0.5, 1.5)) / texRes;
  vec2 uv11 = (i + vec2(1.5, 1.5)) / texRes;

  float h00 = decodeHeight(texture(uHeightTex, uv00));
  float h10 = decodeHeight(texture(uHeightTex, uv10));
  float h01 = decodeHeight(texture(uHeightTex, uv01));
  float h11 = decodeHeight(texture(uHeightTex, uv11));
  return mix(mix(h00, h10, w.x), mix(h01, h11, w.x), w.y);
}

// Stratified granite ledges + vertical fracture seams for crisp rock cliffs without blobby artifacts
float rockMicroHeight(vec2 xz, float rawH, float slope) {
  float beds = sin(rawH * 3.8 + fbmRock(xz * 0.38) * 3.2) * 0.5 + 0.5;
  float verticalSeam = 1.0 - abs(noise2(vec2(xz.x * 1.45 + xz.y * 0.55, xz.y * 1.45 - xz.x * 0.55)) * 2.0 - 1.0);
  float fineGrit = noise2(xz * 3.4);
  return (beds * 0.48 + verticalSeam * verticalSeam * 0.36 + fineGrit * 0.16) * smoothstep(0.14, 0.62, slope);
}

float contourMask(float h, float interval, float widthPx) {
  float scaled = h / interval;
  float fw = max(fwidth(scaled), 0.0005);
  float dist = abs(fract(scaled - 0.5) - 0.5) / fw;
  return 1.0 - smoothstep(0.0, widthPx, dist);
}

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(uCamPos - vWorldPos);
  vec3 L = normalize(uSunDir);

  // Use bicubically smoothed height for razor-clean printed contours
  float smoothH = sampleSmoothHeight(vWorldPos.xz);
  float rawH = mix(smoothH, vRawElev, 0.35);

  vec4 texMeta = texture(uHeightTex, vWorldPos.xz / uWorldSize + 0.5);
  float ao = vGeo.y;
  float drainage = max(vGeo.z, texMeta.b);
  float ridgeCurv = mix(vGeo.w, texMeta.a, 0.5);
  float slope = clamp(1.0 - N.y, 0.0, 1.0);

  // --- 1. SWISS PRINTED CARTOGRAPHIC ATLAS (Map & Archive) ---
  vec3 paper = vec3(0.957, 0.941, 0.910); // #f4f0e8 cotton rag paper
  vec3 hypsoMeadow = vec3(0.892, 0.905, 0.878);
  vec3 hypsoRock = vec3(0.818, 0.846, 0.862);
  vec3 hypsoPeak = vec3(0.976, 0.972, 0.962);

  vec3 mapTint = mix(paper, hypsoMeadow, smoothstep(2.4, 6.8, smoothH) * 0.85);
  mapTint = mix(mapTint, hypsoRock, smoothstep(6.8, 12.8, smoothH) * 0.72);
  mapTint = mix(mapTint, hypsoPeak, smoothstep(13.2, 18.5, smoothH));

  // Eduard Imhof NW oblique Swiss hillshade wash
  vec3 cartoN = normalize(mix(vec3(0.0, 1.0, 0.0), N, 0.65));
  float imhofLight = dot(cartoN, normalize(vec3(-0.68, 0.72, -0.45))) * 0.5 + 0.5;
  mapTint *= mix(0.94, 1.015, imhofLight);

  // Refined glacial Lake Vireo bathymetry with multi-ring depth tint
  float lakeFill = (1.0-smoothstep(uWaterLevel - 0.18,uWaterLevel + 0.08,smoothH));
  vec3 shallowTint = vec3(0.60, 0.75, 0.81);
  vec3 deepTint = vec3(0.35, 0.54, 0.64);
  vec3 lakeCarto = mix(shallowTint, deepTint, (1.0-smoothstep(0.45,uWaterLevel,smoothH)));
  mapTint = mix(mapTint, lakeCarto, lakeFill);

  // Clean vector-grade contour hierarchy (minor + index + lake shoreline)
  float landMask = smoothstep(uWaterLevel - 0.02, uWaterLevel + 0.10, smoothH);
  float minorContour = contourMask(smoothH, 0.72, 1.05) * landMask;
  float indexContour = contourMask(smoothH, 3.60, 1.45) * landMask;
  float shoreContour = contourMask(smoothH - uWaterLevel, 0.55, 1.2) * (1.0 - landMask) * smoothstep(0.45, 1.9, smoothH);
  float shoreEdge = 1.0 - smoothstep(0.0, 0.16, abs(smoothH - uWaterLevel));

  // Subtle folio survey graticule inside printed sheet
  vec2 gridCoord = vWorldPos.xz / 24.0;
  vec2 gridDist = abs(fract(gridCoord - 0.5) - 0.5) / max(fwidth(gridCoord), 0.0005);
  float gridLine = 1.0 - smoothstep(0.0, 0.95, min(gridDist.x, gridDist.y));

  vec3 inkSoft = vec3(0.31, 0.35, 0.38);
  vec3 inkIndex = vec3(0.13, 0.16, 0.19);
  vec3 inkShore = vec3(0.18, 0.36, 0.46);

  vec3 cartoColor = mapTint;
  cartoColor = mix(cartoColor, inkIndex, gridLine * 0.042);
  cartoColor = mix(cartoColor, inkSoft, minorContour * 0.19);
  cartoColor = mix(cartoColor, inkIndex, indexContour * 0.48);
  cartoColor = mix(cartoColor, inkShore, max(shoreContour * 0.38, shoreEdge * 0.68));

  // Print sheet border & deliberate negative-space margin fade outside [-uFolioHalf, +uFolioHalf]
  float sheetDist = max(abs(vWorldPos.x), abs(vWorldPos.z));
  float sheetFrame = 1.0 - smoothstep(0.0, 0.38, abs(sheetDist - uFolioHalf));
  float outsideSheet = smoothstep(uFolioHalf, uFolioHalf + 4.0, sheetDist);
  cartoColor = mix(cartoColor, inkIndex, sheetFrame * 0.42);
  cartoColor = mix(cartoColor, paper, outsideSheet * 0.96);

  if(uMapMix>=0.999){fragColor=vec4(cartoColor,1.0);return;}
  // --- 2. PHYSICAL ALPINE GEOLOGICAL MATERIALS ---
  // Compute stratified granite cliff micro-normal
  float eps = 0.28;
  float mh0 = rockMicroHeight(vWorldPos.xz, rawH, slope);
  float mhx = rockMicroHeight(vWorldPos.xz + vec2(eps, 0.0), rawH, slope);
  float mhz = rockMicroHeight(vWorldPos.xz + vec2(0.0, eps), rawH, slope);
  float bumpAmp = 0.25 * smoothstep(0.14, 0.85, uRelief);
  vec3 rockN = normalize(N + vec3((mh0 - mhx) / eps, 0.0, (mh0 - mhz) / eps) * bumpAmp);

  float detailN = fbmRock(vWorldPos.xz * 0.34);
  float fineN = noise2(vWorldPos.xz * 2.1);
  float crownStipple = noise2(vWorldPos.xz * 6.8);
  float crag = ridgedRock(vWorldPos.xz * 0.52);

  // Material A: Glacial shore pebbles & pale moraine granite cobble
  vec3 shoreStone = mix(vec3(0.28, 0.31, 0.34), vec3(0.50, 0.52, 0.53), fineN * 0.65 + crownStipple * 0.35);

  // Material B: Subalpine conifer forest & alpine meadow breaks
  vec3 meadowTurf = mix(vec3(0.20, 0.27, 0.17), vec3(0.29, 0.34, 0.20), fineN);
  vec3 spruceDeep = vec3(0.055, 0.135, 0.095);
  vec3 spruceLit = vec3(0.135, 0.235, 0.155);
  vec3 coniferCanopy = mix(spruceDeep, spruceLit, crownStipple * 0.72 + crag * 0.28);
  float forestPatch = smoothstep(0.32, 0.58, detailN + (crownStipple - 0.5) * 0.24);
  vec3 vegCol = mix(meadowTurf, coniferCanopy, forestPatch);

  // Material C: Stratified alpine granite, dark gneiss crevices & talus scree
  float strataBand = sin(rawH * 2.9 + detailN * 3.1) * 0.5 + 0.5;
  vec3 graniteDark = vec3(0.20, 0.23, 0.26);
  vec3 graniteLight = vec3(0.45, 0.47, 0.50);
  vec3 graniteBase = mix(graniteDark, graniteLight, crag * 0.45 + strataBand * 0.30 + fineN * 0.25);
  graniteBase = mix(graniteBase, vec3(0.36, 0.35, 0.33), drainage * 0.48); // Talus fans in gullies
  graniteBase = mix(graniteBase, vec3(0.46, 0.40, 0.35), smoothstep(8.5, 16.0, rawH) * (1.0 - crag) * 0.28);

  // Material D: Crisp alpine firn & snowfields (kept well below clip so shadows & ridges stay sculpted)
  vec3 snowCol = mix(vec3(0.58, 0.65, 0.71), vec3(0.83, 0.85, 0.85), fineN * 0.7 + 0.25);

  // Natural elevation + slope + drainage biome blending
  float wetShore = 1.0 - smoothstep(uWaterLevel - 0.06, uWaterLevel + 0.46, rawH);
  float timberBand = smoothstep(uWaterLevel + 0.12, uWaterLevel + 0.95, rawH) * (1.0 - smoothstep(6.2, 9.6, rawH));
  float vegSlope = 1.0 - smoothstep(0.20, 0.42, slope + (detailN - 0.5) * 0.16);
  float vegMask = timberBand * vegSlope * (1.0 - drainage * 0.58) * (1.0 - smoothstep(0.58, 0.78, crag));

  float snowAlt = smoothstep(10.0, 15.8, rawH + (detailN - 0.5) * 3.4 + ridgeCurv * 0.7);
  float snowSlope = 1.0 - smoothstep(0.18, 0.46, slope + (fineN - 0.5) * 0.16);
  float snowMask = snowAlt * snowSlope;

  vec3 albedo = graniteBase;
  albedo = mix(albedo, vegCol, vegMask);
  albedo = mix(albedo, shoreStone, wetShore);
  albedo = mix(albedo, snowCol, snowMask);

  float roughness = mix(0.84, 0.94, vegMask);
  roughness = mix(roughness, 0.48, wetShore);
  roughness = mix(roughness, 0.56, snowMask);

  // --- 3. 7-STEP CAST RIDGE SHADOWS + BALANCED FILMIC ALPINE LIGHTING ---
  float shadow = 1.0;
  if (uRelief > 0.25) {
    float occ = 0.0;
    float t = 1.6;
    for (int s = 0; s < 7; s++) {
      vec3 sp = vWorldPos + L * t;
      float th = sampleTexHeight(sp.xz) * uRelief;
      float diff = th - (sp.y + 0.14);
      occ = max(occ, clamp(diff / (0.65 + t * 0.15), 0.0, 1.0));
      t += 2.4;
    }
    shadow = 1.0 - occ * 0.64 * smoothstep(0.25, 0.65, uRelief);
  }

  float NdotL = max(dot(rockN, L), 0.0);
  float snowWrap = max((dot(rockN, L) + 0.22) / 1.22, 0.0) * snowMask;
  float diffuse = mix(NdotL, max(NdotL, snowWrap * 0.78), snowMask);

  vec3 sunColor = mix(vec3(0.84, 0.82, 0.78), vec3(0.98, 0.73, 0.49), uGolden);
  vec3 skyFill = mix(vec3(0.42, 0.48, 0.54), vec3(0.36, 0.39, 0.46), uGolden);
  vec3 groundFill = mix(vec3(0.15, 0.19, 0.21), vec3(0.19, 0.15, 0.14), uGolden);

  float hemi = rockN.y * 0.5 + 0.5;
  vec3 ambient = mix(groundFill, skyFill, hemi) * mix(0.38,1.0,ao) * mix(0.80, 0.74, uGolden);

  vec3 H = normalize(L + V);
  float specPow = mix(16.0, 72.0, 1.0 - roughness);
  float spec = pow(max(dot(rockN, H), 0.0), specPow) * mix(0.04, 0.24, 1.0 - roughness);

  vec3 litGeology = albedo * (ambient + sunColor * diffuse * shadow) + sunColor * spec * shadow;

  // Residual contour dissolve during Ascent
  float residualInk = (indexContour * 0.48 + minorContour * 0.18) * smoothstep(0.0, 0.52, uMapMix);
  litGeology = mix(litGeology, inkIndex, residualInk * 0.36);

  // Aerial perspective: distant ranges fade gracefully into horizon & golden alpenglow
  float camDist = length(uCamPos - vWorldPos);
  float heightFalloff = exp(-max(0.0, vWorldPos.y - 1.5) * 0.062);
  float fogAmount = 1.0 - exp(-camDist * uFogDensity * mix(0.55, 1.15, heightFalloff));
  fogAmount = clamp(fogAmount * (1.0 - uMapMix * 0.94), 0.0, 0.88);

  vec3 viewDir = normalize(vWorldPos - uCamPos);
  float sunForward = pow(max(dot(viewDir, L), 0.0), 3.0);
  vec3 fogColor = mix(uSkyHorizon, vec3(0.94, 0.72, 0.48), sunForward * uGolden * 0.55);
  litGeology = mix(litGeology, fogColor, fogAmount);

  // ACES Filmic Tone Mapping preserves crisp snow ridge shadows without blowing out white
  vec3 exposed=litGeology*0.84;
  vec3 mapped=(exposed*(2.51*exposed+0.03))/(exposed*(2.43*exposed+0.59)+0.14);
  mapped=pow(clamp(mapped,0.0,1.0),vec3(0.87));
  mapped = clamp(mapped, 0.0, 1.0);

  vec3 finalCol = mix(mapped, cartoColor, clamp(uMapMix, 0.0, 1.0));
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
  vec3 pos = vec3(aPosition.x, aPosition.y * uRelief, aPosition.z);
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
  return ((enc.r * 255.0 * 256.0 + enc.g * 255.0) / 65535.0) * uMaxTexHeight;
}

float waveHeight(vec2 p, float t) {
  float w = 0.0;
  w += sin(p.x * 2.2 + p.y * 1.5 + t * 1.15) * 0.36;
  w += sin(p.x * -3.1 + p.y * 2.6 - t * 0.90) * 0.24;
  w += noise2(p * 3.8 + vec2(t * 0.34, -t * 0.22)) * 0.48;
  w += noise2(p * 8.6 - vec2(t * 0.45, t * 0.30)) * 0.20;
  return w;
}

vec3 sampleSkyRefl(vec3 rd, vec3 L) {
  float grad = smoothstep(-0.02, 0.55, clamp(rd.y, 0.0, 1.0));
  vec3 sky = mix(uSkyHorizon, uSkyZenith, grad);
  float sunDot = max(dot(rd, L), 0.0);
  vec3 sunTint = mix(vec3(1.0, 0.98, 0.94), vec3(1.0, 0.72, 0.44), uGolden);
  sky += sunTint * pow(sunDot, 20.0) * 0.62;
  return sky;
}

void main() {
  float waterVis = smoothstep(0.32, 0.68, uRelief) * (1.0 - smoothstep(0.32, 0.72, uMapMix));
  if (waterVis <= 0.01) discard;

  float bedH = sampleTexHeight(vWorldPos.xz);
  float depth = (uWaterLevel - bedH) * uRelief;
  if (depth <= 0.004) discard;

  // Calm alpine lake micro-ripples so mirrored snow peaks & cliffs read clearly
  float eps = 0.09;
  float h0 = waveHeight(vWorldPos.xz, uTime);
  float hx = waveHeight(vWorldPos.xz + vec2(eps, 0.0), uTime);
  float hz = waveHeight(vWorldPos.xz + vec2(0.0, eps), uTime);
  float rippleAmp = mix(0.0025, 0.0085, smoothstep(0.0, 0.65, depth));
  vec3 N = normalize(vec3((h0 - hx) * rippleAmp / eps, 1.0, (h0 - hz) * rippleAmp / eps));

  vec3 V = normalize(uCamPos - vWorldPos);
  vec3 L = normalize(uSunDir);
  vec3 R = reflect(-V, N);
  if (R.y < 0.01) R.y = 0.01;
  R = normalize(R);

  float NdotV = max(dot(N, V), 0.0);
  float fresnel = 0.14 + 0.86 * pow(1.0 - NdotV, 3.0);

  // 32-step tighter raymarch against uHeightTex to mirror Kestrel Spire, snow crests & evergreen cirque
  vec3 reflColor = sampleSkyRefl(R, L);
  float dt = 0.68;
  float maxDist = 72.0;
  float t = 0.45;
  bool hit = false;
  vec3 hitPos = vWorldPos;

  for (int i = 0; i < 32; i++) {
    vec3 p = vWorldPos + R * t;
    float th = sampleTexHeight(p.xz) * uRelief;
    if (p.y < th) {
      hit = true;
      hitPos = p;
      break;
    }
    t += dt;
    dt *= 1.068;
    if (t > maxDist) break;
  }

  if (hit) {
    float e = 0.65;
    float hL = sampleTexHeight(hitPos.xz - vec2(e, 0.0)) * uRelief;
    float hR = sampleTexHeight(hitPos.xz + vec2(e, 0.0)) * uRelief;
    float hD = sampleTexHeight(hitPos.xz - vec2(0.0, e)) * uRelief;
    float hU = sampleTexHeight(hitPos.xz + vec2(0.0, e)) * uRelief;
    vec3 rN = normalize(vec3(hL - hR, 2.0 * e, hD - hU));

    float slope = 1.0 - rN.y;
    vec3 rForest = vec3(0.085, 0.18, 0.125);
    vec3 rRock = vec3(0.32, 0.35, 0.39);
    vec3 rSnow = vec3(0.72, 0.76, 0.80);

    float rForMask = smoothstep(2.1, 3.1, hitPos.y) * (1.0 - smoothstep(6.4, 9.6, hitPos.y)) * (1.0 - smoothstep(0.22, 0.44, slope));
    float rSnowMask = smoothstep(10.0, 15.8, hitPos.y) * (1.0 - smoothstep(0.25, 0.52, slope));

    vec3 rAlb = mix(rRock, rForest, rForMask);
    rAlb = mix(rAlb, rSnow, rSnowMask);

    float rDiff = max(dot(rN, L), 0.0);
    vec3 sunCol = mix(vec3(0.84, 0.82, 0.78), vec3(0.98, 0.73, 0.49), uGolden);
    vec3 mCol = rAlb * (uSkyHorizon * 0.48 + sunCol * rDiff * 0.95);

    float reflFog = 1.0 - exp(-t * 0.011);
    reflColor = mix(mCol, uSkyHorizon, clamp(reflFog, 0.0, 0.62));
  }

  // Luminous glacial meltwater color: turquoise-emerald shallows -> deep alpine teal
  vec3 shallowTurq = vec3(0.18, 0.52, 0.57);
  vec3 midGlacial = vec3(0.10, 0.34, 0.42);
  vec3 deepTarn = vec3(0.048, 0.165, 0.225);
  vec3 waterBody = mix(shallowTurq, midGlacial, smoothstep(0.04, 0.55, depth));
  waterBody = mix(waterBody, deepTarn, smoothstep(0.55, 1.45, depth));

  // Sunlit sparkle
  vec3 H = normalize(L + V);
  vec3 sunSpecCol = mix(vec3(1.0, 0.98, 0.92), vec3(1.0, 0.78, 0.48), uGolden);
  float spec = pow(max(dot(N, H), 0.0), 180.0) * 0.38;

  // Blend natural glacial meltwater depth with mirrored mountain reflections
  float reflMix = clamp(fresnel * 0.67 + 0.21, 0.21, 0.84);
  vec3 col = mix(waterBody, reflColor, reflMix) + sunSpecCol * spec;

  // Subtle wet granite shore transition
  float shoreRim = (1.0 - smoothstep(0.005, 0.10, depth)) * 0.34;
  col = mix(col, vec3(0.56, 0.72, 0.76), shoreRim);

  float camDist = length(uCamPos - vWorldPos);
  float fogAmt = 1.0 - exp(-camDist * uFogDensity * 0.72);
  col = mix(col, uSkyHorizon, clamp(fogAmt, 0.0, 0.76));

  col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
  col = clamp(col, 0.0, 1.0);

  float edgeAlpha = smoothstep(0.004, 0.08, depth) * waterVis;
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
  float a = 0.54;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 3; i++) {
    v += a * noise2(p);
    p = rot * p * 2.04 + vec2(9.1, 4.3);
    a *= 0.48;
  }
  return v;
}

float sampleTexHeight(vec2 xz) {
  vec2 uv = xz / uWorldSize + 0.5;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
  vec4 enc = texture(uHeightTex, uv);
  return ((enc.r * 255.0 * 256.0 + enc.g * 255.0) / 65535.0) * uMaxTexHeight;
}

void main() {
  float visibility = uCloudAlpha * smoothstep(0.45, 0.9, uRelief) * (1.0 - smoothstep(0.22, 0.62, uMapMix));
  if (visibility <= 0.01) discard;

  float radial = length(vWorldPos.xz) / (uWorldSize * 0.46);
  float edgeMask = 1.0 - smoothstep(0.68, 1.0, radial);

  // Clouds gather thickly inside valleys & saddle troughs, parting cleanly against steep peaks
  float terrH = sampleTexHeight(vWorldPos.xz) * uRelief;
  float terrainClearance = smoothstep(-0.15, 2.2, vWorldPos.y - terrH);

  // Soft camera altitude fade when passing straight through the cloud layer
  float camAltDist = abs(uCamPos.y - vWorldPos.y);
  float camProximity = smoothstep(0.4, 3.0, camAltDist);

  // Domain-warped billowy stratus clouds blanket the valley trough during Summit
  vec2 baseUv = vWorldPos.xz * 0.046 + vec2(uTime * 0.018 + uLayerSeed * 11.7, -uTime * 0.010);
  vec2 warp = vec2(cloudFbm(baseUv), cloudFbm(baseUv + vec2(4.2, 8.7))) * 0.92;
  float f = cloudFbm(baseUv + warp);

  float valleyBlanket = mix(0.23, 0.78, uGolden);
  float density = smoothstep(0.34, 0.74, f) * edgeMask * terrainClearance * mix(0.18, 1.0, camProximity);
  float alpha = clamp(density * mix(0.68, 0.92, uGolden) * visibility, 0.0, 0.88) * valleyBlanket;
  if (alpha <= 0.005) discard;

  vec3 viewDir = normalize(vWorldPos - uCamPos);
  vec3 L = normalize(uSunDir);
  float sunForward = pow(max(dot(viewDir, L), 0.0), 3.0);

  vec3 coolUnder = mix(vec3(0.58, 0.68, 0.78), vec3(0.38, 0.42, 0.54), uGolden);
  vec3 sunlitTop = mix(vec3(0.95, 0.97, 0.99), vec3(1.0, 0.78, 0.54), uGolden);

  float illumination = smoothstep(0.34, 0.76, f) * 0.75 + sunForward * 0.45;
  vec3 cloudCol = mix(coolUnder, sunlitTop, clamp(illumination, 0.0, 1.0));
  fragColor = vec4(cloudCol, alpha);
}
`;
