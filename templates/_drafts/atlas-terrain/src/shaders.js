/**
 * ATLAS — A3 WebGL2 Shader Suite
 * - Atmospheric Rayleigh/Mie Sky Dome + Archival Paper Blend
 * - Bicubic Smooth Swiss Contours + Eroded Micro-Normal Rock/Forest/Snow Terrain
 * - Bright Glacial Lake with Raymarched Mountain Reflections & Shorelines
 * - Bounded terrain-aware 3D mist with depth-terminated transmittance
 */

// A bounded, shared world-space volume. Surface distance terminates the ray,
// so opaque ridges occlude mist naturally. Twelve fixed samples; no temporal jitter.
const MIST_GLSL = `
uniform highp sampler3D uMistVolume;
uniform vec3 uMistOrigin;
uniform vec3 uMistExtent;
uniform float uMistStrength;
uniform float uMistTime;
uniform highp sampler3D uSummitInversion;
uniform vec3 uInversionOrigin;
uniform vec3 uInversionExtent;
uniform float uInversionMix;
vec3 applyMist(vec3 scene,vec3 eye,vec3 ray,float surfaceDistance,vec3 sun,float golden){
  if(uMistStrength<.005||surfaceDistance<.1)return scene;
  vec3 safeRay=vec3(ray.x<0.?min(ray.x,-.00001):max(ray.x,.00001),
                    ray.y<0.?min(ray.y,-.00001):max(ray.y,.00001),
                    ray.z<0.?min(ray.z,-.00001):max(ray.z,.00001));
  bool inversion=uInversionMix>.005;
  vec3 origin=inversion?uInversionOrigin:uMistOrigin;
  vec3 extent=inversion?uInversionExtent:uMistExtent;
  vec3 a=(origin-eye)/safeRay;
  vec3 b=(origin+extent-eye)/safeRay;
  vec3 lo=min(a,b),hi=max(a,b);
  float enter=max(0.,max(lo.x,max(lo.y,lo.z)));
  float exit=min(surfaceDistance,min(hi.x,min(hi.y,hi.z)));
  exit=min(exit,enter+105.);
  if(exit<=enter)return scene;
  int steps=inversion?16:12;
  float dt=(exit-enter)/float(steps);
  float transmission=1.;
  vec3 scatter=vec3(0.);
  float sunward=pow(max(dot(ray,sun),0.),3.);
  vec3 underside=mix(vec3(.60,.70,.77),vec3(.49,.56,.66),golden);
  vec3 lit=mix(vec3(.90,.93,.95),vec3(1.,.94,.84),golden);
  for(int i=0;i<16;i++){
    if(i>=steps)break;
    vec3 point=eye+ray*(enter+(float(i)+.5)*dt);
    vec3 uv=(point-origin)/extent;
    float low=0.;
    // The lower volume has exactly zero weight at full inversion.
    // At partial inversion retain the original coordinate and boundary checks.
    if(!inversion||uInversionMix<1.){
      vec3 lowUV=(point-uMistOrigin)/uMistExtent;
      if(all(greaterThanEqual(lowUV,vec3(0.)))&&all(lessThanEqual(lowUV,vec3(1.))))low=texture(uMistVolume,lowUV).r;
    }
    float density=low;
    float upper=smoothstep(.18,.84,uv.y);
    float illumination=clamp(upper*.72+sunward*.28,0.,1.);
    if(inversion){
      float high=texture(uSummitInversion,uv).r;
      density=mix(low,high,uInversionMix);
      if(high>.012){
        // Directional density integration: an exposed lobe is bright, a sheltered
        // lobe cool and darker. Probes use real world-unit offsets and the same volume.
        float ahead=texture(uSummitInversion,clamp(uv+sun*1.6/extent,0.,1.)).r;
        float farther=texture(uSummitInversion,clamp(uv+sun*4.2/extent,0.,1.)).r;
        float lightTrans=exp(-1.35*ahead-.95*farther);
        float rim=clamp((high-ahead)*2.8,0.,1.);
        float cloudLight=clamp(.18+lightTrans*.69+rim*.23+sunward*.10,0.,1.);
        illumination=mix(illumination,cloudLight,uInversionMix);
      }
    }
    // A zero-density sample contributes neither opacity nor scattering.
    if(density<=0.)continue;
    // Gentle internal billow, anchored to world coordinates, no drifting through rock.
    density*=.96+.04*sin(point.x*.12+point.z*.08+point.y*.32+uMistTime*.23);
    float opacity=1.-exp(-density*uMistStrength*mix(.30,.34,uInversionMix)*dt);
    vec3 light=mix(underside,lit,illumination);
    scatter+=transmission*opacity*light;
    transmission*=1.-opacity;
    if(transmission<.018)break;
  }
  return scene*transmission+scatter;
}
`;

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
  // Depth 1: background only, drawn after opaque terrain with LEQUAL.
  gl_Position = vec4(vNdc, 1.0, 1.0);
}
`;

export const SKY_FRAG = `#version 300 es
precision highp float;

in vec2 vNdc;
out vec4 fragColor;

uniform vec3 uMistEye;
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
${MIST_GLSL}

void main() {
  vec3 rd = normalize(
    uCamForward +
    vNdc.x * uAspect * uTanHalfFov * uCamRight +
    vNdc.y * uTanHalfFov * uCamUp
  );

  float h = clamp(rd.y, -0.25, 1.0);
  float horizonBand = pow(1.0 - clamp(abs(h), 0.0, 1.0), 3.4);
  float upperGrad = mix(smoothstep(-0.04,0.55,h),smoothstep(-.055,.23,h),uGolden);

  vec3 sky = mix(uSkyHorizon, uSkyZenith, upperGrad);

  // Crisp solar disc + Mie golden-hour / morning scattering
  vec3 L = normalize(uSunDir);
  float sunDot = max(dot(rd, L), 0.0);
  vec3 sunWarm = mix(vec3(1.0, 0.98, 0.94), vec3(1.0, 0.82, 0.60), uGolden);
  float mieGlow = pow(sunDot, mix(12.0, 7.0, uGolden)) * mix(0.24, 0.48, uGolden);
  float sunDisc = smoothstep(0.9982, 0.9996, sunDot) * mix(0.55, 1.0, uGolden);
  sky += sunWarm * (mieGlow + sunDisc) * (1.0 - uMapMix * 0.9);

  // Warm apricot horizon wash around sun azimuth during Summit golden hour
  float sunAzimuth = pow(max(dot(normalize(vec3(rd.x, 0.0, rd.z)), normalize(vec3(L.x, 0.0, L.z))), 0.0), 2.0);
  sky = mix(sky, vec3(0.94, 0.76, 0.58), horizonBand * sunAzimuth * uGolden * 0.34 * (1.0 - uMapMix));

  // Crisp luminous valley mist glow
  sky = mix(sky, vec3(0.86, 0.91, 0.94), horizonBand * uValley * 0.28 * (1.0 - uMapMix));

  // Clean cotton-rag archival paper in Map & Archive views
  vec3 paperCenter = vec3(0.957, 0.941, 0.910); // #f4f0e8
  vec3 paperMargin = vec3(0.933, 0.914, 0.878);
  vec3 paperCol = mix(paperCenter, paperMargin, clamp(length(vNdc) * 0.45, 0.0, 1.0));
  sky = mix(sky, paperCol, clamp(uMapMix * 1.08, 0.0, 1.0));

  sky=applyMist(sky,uMistEye,rd,340.,L,uGolden);
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
uniform sampler2D uDetailShadows;
uniform vec4 uDetailShadowBounds;
uniform float uDetailGrowth;
uniform float uClipBelow;
uniform float uMaxTexHeight;
uniform float uWaterLevel;

uniform float uRelief;
uniform float uMapMix;
uniform float uGolden;
uniform float uFogDensity;
uniform vec3 uSkyZenith;
uniform vec3 uSkyHorizon;
${MIST_GLSL}

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
  return decodeHeight(texture(uHeightTex, (uv*(vec2(textureSize(uHeightTex,0))-1.0)+0.5)/vec2(textureSize(uHeightTex,0))));
}

// Smooth bicubic-like height reconstruction so cartographic contour lines are razor-clean vector curves
float sampleSmoothHeight(vec2 xz) {
  vec2 uv = xz / uWorldSize + 0.5;
  float texRes = float(textureSize(uHeightTex,0).x);
  vec2 st = clamp(uv,0.0,1.0) * (texRes - 1.0);
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

// Aperiodic plan-view fractures; steep faces receive height-bearing detail below.
float rockMicroHeight(vec2 xz, float rawH, float slope) {
  float f1 = abs(noise2(xz * 2.2) - 0.5);
  float f2 = abs(noise2(vec2(xz.x * 4.8 - xz.y * 2.1, xz.y * 4.8 + xz.x * 2.1)) - 0.5);
  float strata = noise2(xz * vec2(.45,.82) + vec2(rawH*.21,-rawH*.17));
  return (f1 * 0.42 + f2 * 0.34 + strata * 0.24) * smoothstep(0.16, 0.65, slope);
}

float contourMask(float h, float interval, float widthPx) {
  float scaled = h / interval;
  float fw = max(fwidth(scaled), 0.0005);
  float dist = abs(fract(scaled - 0.5) - 0.5) / fw;
  return 1.0 - smoothstep(0.0, widthPx, dist);
}

void main() {
  if(vWorldPos.y<uClipBelow)discard;
  vec3 N = normalize(vNormal);
  vec3 V = normalize(uCamPos - vWorldPos);
  vec3 L = normalize(uSunDir);

  float rawH = vRawElev; // actual interpolated terrain triangle height
  float landMask = smoothstep(uWaterLevel - 0.02, uWaterLevel + 0.10, rawH);
  vec3 inkIndex = vec3(0.13, 0.16, 0.19);
  vec3 cartoColor = vec3(0.);
  float minorContour=0.,indexContour=0.;
  // uMapMix is uniform across the draw. Fully physical scenes have zero
  // cartographic contribution, including residual ink; skip all map work.
  // Derivatives remain in uniform control flow.
  if(uMapMix>0.){
    float smoothH = sampleSmoothHeight(vWorldPos.xz);
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
    float lakeFill = (1.0-smoothstep(uWaterLevel - 0.18,uWaterLevel + 0.08,rawH));
    vec3 shallowTint = vec3(0.60, 0.75, 0.81);
    vec3 deepTint = vec3(0.30, 0.52, 0.59);
    vec3 lakeCarto = mix(shallowTint, deepTint, (1.0-smoothstep(0.45,uWaterLevel,rawH)));
    mapTint = mix(mapTint, lakeCarto, lakeFill);

    // Clean vector-grade contour hierarchy (minor + index + lake shoreline)
    minorContour = contourMask(smoothH, 0.92, 0.78) * landMask;
    indexContour = contourMask(smoothH, 4.60, 1.10) * landMask;
    float shoreContour = contourMask(smoothH - uWaterLevel, 0.55, 1.2) * (1.0 - landMask) * smoothstep(0.45, 1.9, smoothH);
    float shoreEdge = 1.0 - smoothstep(0.0, 0.16, abs(rawH - uWaterLevel));

    // Subtle folio survey graticule inside printed sheet
    vec2 gridCoord = vWorldPos.xz / 24.0;
    vec2 gridDist = abs(fract(gridCoord - 0.5) - 0.5) / max(fwidth(gridCoord), 0.0005);
    float gridLine = 1.0 - smoothstep(0.0, 0.95, min(gridDist.x, gridDist.y));

    vec3 inkSoft = vec3(0.31, 0.35, 0.38);
    vec3 inkShore = vec3(0.18, 0.36, 0.46);

    cartoColor = mapTint;
    cartoColor = mix(cartoColor, inkIndex, gridLine * 0.042);
    cartoColor = mix(cartoColor, inkSoft, minorContour * 0.17);
    cartoColor = mix(cartoColor, inkIndex, indexContour * 0.48);
    cartoColor = mix(cartoColor, inkShore, max(shoreContour * 0.23, shoreEdge * 0.48));

    // Print sheet border & deliberate negative-space margin fade outside [-uFolioHalf, +uFolioHalf]
    float sheetDist = max(abs(vWorldPos.x), abs(vWorldPos.z));
    float sheetFrame = 1.0 - smoothstep(0.0, 0.38, abs(sheetDist - uFolioHalf));
    float outsideSheet = smoothstep(uFolioHalf, uFolioHalf + 4.0, sheetDist);
    cartoColor = mix(cartoColor, inkIndex, sheetFrame * 0.42);
    cartoColor = mix(cartoColor, paper, outsideSheet * 0.96);
    if(uMapMix>=0.999){fragColor=vec4(cartoColor,1.0);return;}
  }
  // Material metadata is not used by the fully cartographic return above.
  vec2 metaUV=vWorldPos.xz/uWorldSize+0.5;
  vec2 texSize=vec2(textureSize(uHeightTex,0));
  vec4 texMeta=texture(uHeightTex,(metaUV*(texSize-1.0)+0.5)/texSize);
  float ao = vGeo.y;
  float drainage = max(vGeo.z, texMeta.b);
  float ridgeCurv = mix(vGeo.w, texMeta.a, 0.5);
  float slope = clamp(1.0 - N.y, 0.0, 1.0);

  // --- 2. PHYSICAL ALPINE GEOLOGICAL MATERIALS ---
  // Compute stratified granite cliff micro-normal
  float eps = 0.18;
  float mh0 = rockMicroHeight(vWorldPos.xz, rawH, slope);
  float mhx = rockMicroHeight(vWorldPos.xz + vec2(eps, 0.0), rawH, slope);
  float mhz = rockMicroHeight(vWorldPos.xz + vec2(0.0, eps), rawH, slope);
  // Fade subpixel fracture detail at distance to avoid crawling textures in motion.
  float footprint = max(length(dFdx(vWorldPos.xz)),length(dFdy(vWorldPos.xz)));
  float bumpAmp = 0.15 * smoothstep(0.16, 0.85, uRelief) * (1.0-smoothstep(0.09,0.46,footprint));
  // Reduce plan-view bump on cliffs; supply height-bearing detail below.
  float cliffWeight=smoothstep(.18,.60,slope);
  vec3 rockN = normalize(N + vec3((mh0 - mhx) / eps, 0.0, (mh0 - mhz) / eps) * bumpAmp*(1.-.84*cliffWeight));

  float detailN = fbmRock(vWorldPos.xz * 0.34);
  float fineN = mix(noise2(vWorldPos.xz * 2.1),0.5,smoothstep(0.10,0.50,footprint));
  float crownStipple = mix(noise2(vWorldPos.xz * 6.8),0.5,smoothstep(0.035,0.17,footprint));
  float crag = ridgedRock(vWorldPos.xz * 0.52);

  // Material A: Glacial shore pebbles & pale moraine granite cobble
  vec3 shoreStone = mix(vec3(0.16, 0.18, 0.20), vec3(0.32, 0.33, 0.34), fineN * 0.65 + crownStipple * 0.35);

  // Material B: Subalpine conifer forest & alpine meadow breaks
  // Exposed alpine turf, damp gullies and darker woodland floor. Existing
  // noise fields supply filtered variation; no additional texture samples.
  float meadowMoisture=clamp(drainage*.52+detailN*.33+fineN*.15,0.,1.);
  vec3 meadowTurf = mix(vec3(.29,.30,.185),vec3(.135,.205,.126),smoothstep(.25,.70,meadowMoisture));
  vec3 spruceDeep = vec3(.045,.101,.068);
  vec3 spruceLit = vec3(.127,.195,.118);
  vec3 coniferCanopy = mix(spruceDeep, spruceLit, crownStipple*.58+crag*.42);
  float forestPatch = smoothstep(.31,.68, detailN + (crownStipple-.5)*.22 - drainage*.10);
  vec3 vegCol = mix(meadowTurf,coniferCanopy,forestPatch);

  // Material C: Stratified alpine granite, dark gneiss crevices & talus scree
  // Mineral facies vary with terrain rather than repeating at equal elevations.
  float bedVariation=smoothstep(.24,.78,detailN*.64+crag*.36);
  float facies=smoothstep(.28,.76,detailN*.45+ridgeCurv*.30+crag*.25);
  vec3 graniteDark=vec3(.115,.135,.151);
  vec3 graniteLight=vec3(.31,.315,.308);
  vec3 graniteBase=mix(graniteDark,graniteLight,bedVariation*.63+facies*.25+fineN*.12);
  graniteBase = mix(graniteBase, vec3(0.29, 0.28, 0.26), drainage * 0.34); // Talus fans in gullies
  graniteBase = mix(graniteBase, vec3(0.36, 0.32, 0.28), smoothstep(8.5, 16.0, rawH) * (1.0 - crag) * 0.24);

  // Material D: Crisp alpine firn & snowfields (kept well below clip so shadows & ridges stay sculpted)
  vec3 snowCol = mix(vec3(0.58, 0.65, 0.71), vec3(0.83, 0.85, 0.85), fineN * 0.7 + 0.25);

  // Natural elevation + slope + drainage biome blending
  // A narrow, uneven gravel shore grades into the vegetation; keep the
  // exact lake surface and depth boundary intact.
  float shoreRise=.22+.20*detailN+.11*drainage;
  float wetShore = 1.0 - smoothstep(uWaterLevel-.04,uWaterLevel+shoreRise,rawH);
  float timberBand = smoothstep(uWaterLevel + 0.06, uWaterLevel + 0.65, rawH) * (1.0 - smoothstep(6.2, 9.6, rawH));
  float vegSlope = 1.0 - smoothstep(0.20, 0.42, slope + (detailN - 0.5) * 0.16);
  float vegMask = timberBand * vegSlope * (1.0 - drainage * 0.58) * (1.0 - smoothstep(0.58, 0.78, crag));

  float sheltered=clamp(N.z*.8+(.5-ridgeCurv)*1.2+drainage*.55,-1.,1.);
  float snowAlt=smoothstep(12.8,17.6,rawH+(detailN-.5)*3.5+sheltered*2.2);
  float snowSlope=1.-smoothstep(.10,.32,slope+(fineN-.5)*.10-sheltered*.06);
  // Break broad continuous snow bands with terrain-anchored accumulation pockets.
  float snowPocket=smoothstep(.20,.61,detailN*.68+drainage*.20+(sheltered*.5+.5)*.12);
  float snowMask=snowAlt*snowSlope*mix(snowPocket,1.,smoothstep(17.0,22.0,rawH));
  // Height-bearing projections for cliff faces, blended by geometric normal.
  // No texture fetches or temporal noise; filter at the physical surface scale.
  vec3 P=vec3(vWorldPos.x,rawH,vWorldPos.z);
  float surfaceFootprint=max(length(dFdx(P)),length(dFdy(P)));
  float alpineDetail=smoothstep(10.,17.,rawH)*cliffWeight;
  // Irregular, folded bedding shared across face projections. A second,
  // steeper joint family crosses the beds; neither uses periodic wave contours.
  float bed=P.y+.28*P.x-.19*P.z+(detailN-.5)*4.2+(crag-.5)*1.3;
  vec2 faceX=vec2(P.z+P.y*.31,bed);
  vec2 faceZ=vec2(P.x-P.y*.24,bed);
  vec2 faceWeights=pow(abs(N.xz),vec2(4.));
  faceWeights/=max(faceWeights.x+faceWeights.y,.0001);
  // Anisotropy along the bedding plane; offsets keep both projections distinct.
  float blocksX=noise2(faceX*vec2(.83,1.65)+vec2(12.7,8.2));
  float blocksZ=noise2(faceZ*vec2(.83,1.65)+vec2(4.3,21.8));
  float chipsX=noise2(vec2(faceX.x+bed*.46,bed)*vec2(5.4,2.3)+vec2(8.4,3.7));
  float chipsZ=noise2(vec2(faceZ.x-bed*.39,bed)*vec2(5.4,2.3)+vec2(18.1,2.9));
  float blocks=dot(vec2(blocksX,blocksZ),faceWeights);
  float chips=dot(vec2(chipsX,chipsZ),faceWeights);
  float blockAA=1.-smoothstep(.10,.38,surfaceFootprint);
  float chipAA=1.-smoothstep(.035,.14,surfaceFootprint);
  float blockRelief=(blocks-.5)*blockAA;
  float chipRelief=(chips-.5)*chipAA;
  // Only the intersection of two independent low-frequency/high-frequency
  // noise families forms a dark recess. No repeated bands or closed outlines.
  float ledge=(1.-smoothstep(.20,.43,blocks))*(1.-smoothstep(.28,.58,chips))*blockAA*chipAA;
  float seam=ledge*alpineDetail;
  float mineralTone=clamp(.49+bedVariation*.17+blockRelief*.43+chipRelief*.23,0.,1.);
  vec3 cliffMineral=mix(vec3(.13,.15,.165),vec3(.37,.35,.32),mineralTone);
  graniteBase=mix(graniteBase,cliffMineral,.78*alpineDetail);
  graniteBase*=1.-seam*.17;
  // Retain firn in sheltered gullies/ledges, never on near-vertical walls.
  float firnCatch=smoothstep(.34,.75,drainage+max(0.,sheltered)*.18+(detailN-.5)*.12)*
                  (1.-smoothstep(.22,.45,slope))*snowAlt;
  snowMask=clamp(snowMask+firnCatch*.28*(1.-snowMask),0.,1.);
  snowMask*=1.-seam*.20;
  // Surface-gradient bump: differentiate raw noise before filtering.
  vec3 dpdx=dFdx(vWorldPos),dpdy=dFdy(vWorldPos);
  vec3 rx=cross(dpdy,N),ry=cross(N,dpdx);
  float determinant=dot(dpdx,rx);
  vec2 grad=vec2(dFdx(blocks),dFdy(blocks))*.039*blockAA+
            vec2(dFdx(chips),dFdy(chips))*.015*chipAA;
  vec3 perturb=sign(determinant)*(rx*grad.x+ry*grad.y)/max(abs(determinant),.000001);
  // Bound perturbation at silhouette/degenerate derivative quads.
  perturb*=min(1.,.24/max(length(perturb),.000001));
  rockN=normalize(rockN-perturb*alpineDetail*smoothstep(.60,.95,uRelief));

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

  vec2 detailUV=(vWorldPos.xz-uDetailShadowBounds.xy)/uDetailShadowBounds.zw;
  float detailOcc=0.0;
  if(uDetailGrowth>.001 && all(greaterThanEqual(detailUV,vec2(0.))) && all(lessThanEqual(detailUV,vec2(1.)))){
    vec2 detailShadow=texture(uDetailShadows,detailUV).rg;
    detailOcc=mix(detailShadow.r,detailShadow.g,uGolden)*uDetailGrowth*landMask;
  }
  shadow*=1.0-detailOcc*.65;

  float NdotL = max(dot(rockN, L), 0.0);
  float snowWrap = max((dot(rockN, L) + 0.22) / 1.22, 0.0) * snowMask;
  float diffuse = mix(NdotL, max(NdotL, snowWrap * 0.78), snowMask);

  vec3 sunColor = mix(vec3(1.08, 1.02, 0.92), vec3(1.22, 0.82, 0.47), uGolden);
  vec3 skyFill = mix(vec3(0.33, 0.40, 0.46), vec3(0.44, 0.46, 0.52), uGolden);
  vec3 groundFill = mix(vec3(0.16, 0.20, 0.22), vec3(0.30, 0.28, 0.30), uGolden);

  float hemi = rockN.y * 0.5 + 0.5;
  vec3 ambient = mix(groundFill, skyFill, hemi) * mix(mix(0.38,0.57,uGolden),1.0,ao) * mix(0.80,0.94,uGolden) * (1.0-detailOcc*.24);

  vec3 H = normalize(L + V);
  float specPow = mix(16.0, 72.0, 1.0 - roughness);
  float spec = pow(max(dot(rockN, H), 0.0), specPow) * mix(0.018, 0.16, 1.0 - roughness);

  // Bright cloud ocean supplies diffuse upward bounce on summit faces.
  // Preserve directional relief in shaded rock rather than flattening it with exposure.
  float cloudBounce=uGolden*uInversionMix*(.40+.60*(1.-rockN.y));
  vec3 reflectedCloud=vec3(.52,.55,.59)*cloudBounce*(.65+.35*ao);
  vec3 litGeology = albedo * (ambient + reflectedCloud + sunColor * diffuse * shadow) + sunColor * spec * shadow;
  float grain=clamp((fineN-.5)*.11+(crownStipple-.5)*.08,-.10,.10);
  litGeology*=1.+grain*uGolden*(1.-snowMask);

  // Residual contour dissolve during Ascent
  float residualInk = (indexContour * 0.48 + minorContour * 0.18) * smoothstep(0.0, 0.52, uMapMix);
  litGeology = mix(litGeology, inkIndex, residualInk * 0.36);

  // Aerial perspective: distant ranges fade gracefully into horizon & golden alpenglow
  float camDist = length(uCamPos - vWorldPos);
  float heightFalloff = exp(-max(0.0, vWorldPos.y - 1.5) * 0.062);
  float aerialDistance=max(0.,camDist-9.0);
  float fogAmount=1.0-exp(-aerialDistance*uFogDensity*mix(.43,1.0,heightFalloff)*(1.+uGolden*.55*smoothstep(28.,105.,camDist)));
  fogAmount = clamp(fogAmount * (1.0 - uMapMix * 0.94), 0.0, 0.88);

  vec3 viewDir = normalize(vWorldPos - uCamPos);
  float sunForward = pow(max(dot(viewDir, L), 0.0), 3.0);
  vec3 fogColor = mix(uSkyHorizon, vec3(0.94, 0.72, 0.48), sunForward * uGolden * 0.55);
  litGeology = mix(litGeology, fogColor, fogAmount);

  // ACES Filmic Tone Mapping preserves crisp snow ridge shadows without blowing out white
  vec3 exposed=litGeology*0.89;
  vec3 mapped=(exposed*(2.51*exposed+0.03))/(exposed*(2.43*exposed+0.59)+0.14);
  mapped=pow(clamp(mapped,0.0,1.0),vec3(0.96));
  mapped = clamp(mapped, 0.0, 1.0);

  vec3 finalCol = mix(mapped, cartoColor, clamp(uMapMix, 0.0, 1.0));
  finalCol=applyMist(finalCol,uCamPos,viewDir,camDist,L,uGolden);
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
uniform sampler2D uReflection;
uniform vec2 uScreenSize;
uniform float uReflectionReady;
${MIST_GLSL}

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
  vec4 enc = texture(uHeightTex, (uv*(vec2(textureSize(uHeightTex,0))-1.0)+0.5)/vec2(textureSize(uHeightTex,0)));
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
  float pixelFootprint=max(length(dFdx(vWorldPos.xz)),length(dFdy(vWorldPos.xz)));
  float rippleAmp = mix(0.0016,0.0048,smoothstep(0.02,0.65,depth))*(1.-smoothstep(.09,.55,pixelFootprint));
  vec3 N = normalize(vec3((h0 - hx) * rippleAmp / eps, 1.0, (h0 - hz) * rippleAmp / eps));

  vec3 V = normalize(uCamPos - vWorldPos);
  vec3 L = normalize(uSunDir);
  vec3 R = reflect(-V, N);
  if (R.y < 0.01) R.y = 0.01;
  R = normalize(R);

  float NdotV = max(dot(N, V), 0.0);
  // Dielectric water: approximately 2% normal-incidence reflectance,
  // rising smoothly towards a mirror at grazing angles.
  float fresnel = .0204+.9796*pow(1.-clamp(NdotV,0.,1.),5.);
  // The reflection attachment already contains the same display-mapped sky, terrain,
  // and physical landscape detail as the main scene, from the mirrored eye.
  vec3 skyRefl=sampleSkyRefl(R,L);
  vec2 uv=gl_FragCoord.xy/uScreenSize;
  // Subtle ripple displacement in screen space; prevent amplified
  // distortion of distant shoreline silhouettes at grazing angles.
  float warpScale=mix(.075,.23,smoothstep(.08,.65,NdotV));
  vec2 warped=uv+vec2(dot(N.xz,vec2(.8,.6)),dot(N.xz,vec2(-.6,.8)))*warpScale;
  vec2 edge=min(warped,1.-warped);
  float valid=smoothstep(0.,.035,min(edge.x,edge.y))*uReflectionReady;
  vec3 reflColor=skyRefl;
  if(valid>.001)reflColor=mix(skyRefl,texture(uReflection,clamp(warped,vec2(.002),vec2(.998))).rgb,valid);

  // Approximate depth-dependent absorption and mineral scattering.
  // The submerged gravel uses the existing height sample, not time-varying
  // wave noise. The sediment colour remains anchored as the surface moves.
  float opticalDepth=depth/max(.36,NdotV);
  float shelf=1.-smoothstep(.12,.95,depth);
  vec3 gravel=mix(vec3(.20,.235,.225),vec3(.30,.31,.26),shelf);
  gravel*=mix(1.,.58,uGolden);
  vec3 extinction=vec3(4.8,2.05,1.55);
  vec3 transmission=exp(-opticalDepth*extinction);
  vec3 shallowScatter=mix(vec3(.065,.285,.275),vec3(.11,.18,.22),uGolden*.88);
  vec3 deepScatter=mix(vec3(.030,.135,.175),vec3(.07,.115,.165),uGolden*.92);
  vec3 scattered=mix(shallowScatter,deepScatter,smoothstep(.30,1.65,depth));
  vec3 body=gravel*transmission+scattered*(1.-transmission);

  // Sunlit sparkle
  vec3 H = normalize(L + V);
  vec3 sunSpecCol = mix(vec3(1.0, 0.98, 0.92), vec3(1.0, 0.78, 0.48), uGolden);
  // Broader, subdued reflection lobe as tiny ripples become subpixel.
  float spec = pow(max(dot(N,H),0.),mix(140.,76.,smoothstep(.09,.55,pixelFootprint)))*.32;

  // Tone-map the transmitted body first. Reflected scene is already
  // display-mapped; blend in that space as in the existing planar pass.
  float camDist=length(uCamPos-vWorldPos);
  float fogAmt=1.-exp(-camDist*uFogDensity*.72);
  body*=.89;
  body=(body*(2.51*body+.03))/(body*(2.43*body+.59)+.14);
  body=pow(clamp(body,0.,1.),vec3(.96));
  body=mix(body,uSkyHorizon,clamp(fogAmt,0.,.76));
  // A small unresolved rough-surface contribution retains recognizable
  // reflected peaks at ordinary angles, without masking the gravel shelf.
  float reflMix=clamp(.065+fresnel*.865,.065,.93);
  vec3 col=mix(body,clamp(reflColor,0.,1.),reflMix)+sunSpecCol*spec*.30;
  // Tight anti-aliased shore; no decorative pale rim.
  float edgeWidth=clamp(fwidth(depth)*1.05,.008,.085);
  float edgeAlpha=smoothstep(.004,.004+edgeWidth,depth)*waterVis;
  col=clamp(col,0.,1.);
  col=applyMist(col,uCamPos,-V,camDist,L,uGolden);
  fragColor = vec4(col, edgeAlpha);
}
`;

// Actual opaque world-space details share the terrain's light direction and aerial perspective.
export const DETAIL_VERT = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPosition;
layout(location=1) in vec3 aNormal;
layout(location=2) in vec3 aColor;
layout(location=3) in vec4 aSite;
layout(location=4) in vec4 aShape;
uniform mat4 uViewProj;
uniform float uRelief;
uniform float uGrowth;
out vec3 vWorldPos;
out vec3 vNormal;
out vec3 vColor;
void main(){
  float c=cos(aShape.y),s=sin(aShape.y);
  mat2 rot=mat2(c,s,-s,c);
  vec3 q=aPosition*vec3(aShape.x,1.,aShape.x)*aSite.w*uGrowth;
  q.xz=rot*q.xz;
  vWorldPos=vec3(aSite.x,aSite.y*uRelief,aSite.z)+q;
  vec3 n=aNormal/vec3(aShape.x,1.,aShape.x);
  n.xz=rot*n.xz;
  vNormal=normalize(n);
  vColor=aColor*aShape.z;
  gl_Position=uViewProj*vec4(vWorldPos,1.);
}
`;
export const DETAIL_FRAG = `#version 300 es
precision highp float;
in vec3 vWorldPos;
in vec3 vNormal;
in vec3 vColor;
out vec4 fragColor;
uniform vec3 uCamPos;
uniform vec3 uSunDir;
uniform vec3 uSkyHorizon;
uniform float uGolden;
uniform float uFogDensity;
uniform float uRelief;
uniform float uClipBelow;
uniform float uWorldSize;
uniform float uMaxTexHeight;
uniform sampler2D uHeightTex;
${MIST_GLSL}
float ground(vec2 xz){
  vec2 uv=xz/uWorldSize+.5;
  vec2 sz=vec2(textureSize(uHeightTex,0));
  vec4 e=texture(uHeightTex,(uv*(sz-1.)+.5)/sz);
  return ((e.r*255.*256.+e.g*255.)/65535.)*uMaxTexHeight*uRelief;
}
void main(){
  if(vWorldPos.y<uClipBelow)discard;
  vec3 n=normalize(vNormal),l=normalize(uSunDir);
  vec3 sun=mix(vec3(1.08,1.02,.92),vec3(1.22,.82,.47),uGolden);
  vec3 fill=mix(mix(vec3(.16,.20,.22),vec3(.30,.28,.30),uGolden),mix(vec3(.33,.40,.46),vec3(.44,.46,.52),uGolden),n.y*.5+.5)*mix(.80,.94,uGolden);
  float occ=0.;
  for(int i=0;i<4;i++){
    float t=1.6+float(i)*3.5;
    vec3 p=vWorldPos+l*t;
    occ=max(occ,clamp((ground(p.xz)-p.y-.14)/(.65+t*.15),0.,1.));
  }
  vec3 col=vColor*(fill+sun*max(dot(n,l),0.)*(1.-occ*.64));
  float dist=length(vWorldPos-uCamPos);
  float hf=exp(-max(0.,vWorldPos.y-1.5)*.062);
  float fog=1.-exp(-max(0.,dist-9.)*uFogDensity*mix(.43,1.0,hf));
  vec3 viewDir=normalize(vWorldPos-uCamPos);
  vec3 fogCol=mix(uSkyHorizon,vec3(.94,.72,.48),pow(max(dot(viewDir,l),0.),3.)*uGolden*.55);
  col=mix(col,fogCol,clamp(fog,0.,.88))*.89;
  col=(col*(2.51*col+.03))/(col*(2.43*col+.59)+.14);
  col=pow(clamp(col,0.,1.),vec3(.96));
  col=applyMist(col,uCamPos,viewDir,dist,l,uGolden);
  fragColor=vec4(col,1.);
}
`;
