# ATLAS — Beyond the Contour

An isolated experimental expedition template (`templates/_drafts/atlas-terrain/`) built around a continuous procedural 3D alpine terrain rendered natively in WebGL2.

## Architecture & Modules

- `index.html` — Semantic six-chapter expedition document (`Map`, `Ascent`, `Descent`, `Valley`, `Summit`, `Archive`), editorial SVG static plates for reduced-motion/no-WebGL/no-JS fallbacks, and accessible viewpoint navigation.
- `styles.css` — Archival paper (`#f3efe7`), alpine stone (`#161b20`), glacial blue (`#5a879c`), deep forest green (`#233a31`), and golden-hour ochre (`#d7a36b`) editorial styling with responsive framing from `320px` up to `1920px+` and zero horizontal overflow.
- `src/terrain.js` — Geological terrain synthesizer:
  - Tectonic domain-warped horseshoe massif (`Kestrel Spire`, `Meridian Saddle`, `Vireo Cirque`), carved glacial U-shaped corridor, and sunken `Lake Vireo` tarn basin.
  - Central-difference terrain normals, 8-ray horizon ambient occlusion, drainage channel attribution, and a packed `256×256` 16-bit RG heightmap texture (`uHeightTex`) plus `O(1)` bilinear height sampler (`sampleHeight`).
  - Glacial lake mesh and dual atmospheric stratus cloud deck meshes.
- `src/shaders.js` — Self-contained GLSL ES 3.00 shaders:
  - **Sky**: Continuous Rayleigh/Mie atmosphere shifting from archival vellum to crisp alpine daylight and golden-hour alpenglow.
  - **Terrain**: Morphable elevation (`uRelief`), derivative anti-aliased multi-tier topographic contours + coordinate graticule (`uMapMix`), elevation/slope geological material blending (wet stone, subalpine forest, stratified granite, alpine snow), 5-step heightfield cast shadows, and height-aware aerial perspective fog.
  - **Water**: Animated multi-octave capillary ripple normals, Schlick Fresnel, depth-based glacial melt absorption, shoreline foam, and **18-step heightfield raymarched mountain reflections**.
  - **Clouds**: Dual stratus layers with soft terrain-clearance fade and camera-altitude proximity parting as the camera ascends to the summit.
- `src/camera.js` — Continuous Catmull-Rom 3D spline with strict terrain/water collision avoidance, mobile portrait FOV/pullback compensation, and smooth non-blocking viewpoint inspection offset (`yaw` / `pitch`).
- `src/motion.js` — Demand-driven `followValue` smoothing, mobile `30fps` ambient cap, automatic offscreen/hidden suspension, and idle RAF termination in still/settled states.
- `src/renderer.js` — WebGL2 pipeline with adaptive DPR/mesh resolution (`192×192` high / `128×128` mobile & low detail / software rasterizer detection), `webglcontextlost`/`webglcontextrestored` handling, and clean disposal.
- `src/main.js` — Native scroll mapping, three curated Archive viewpoints (`Tarn Overlook`, `Meridian Gorge`, `Kestrel Crest`), `touch-action: pan-y` non-blocking horizontal/mouse drag inspection, keyboard shortcuts (`ArrowLeft`/`ArrowRight`/`A`/`D`/`R`), `Still view`, and `High detail` / `Standard detail` toggles.

## Self-Contained ZIP Export

All source files, shaders, and geometry generators live strictly inside `templates/_drafts/atlas-terrain/` with zero modifications to shared files, `package.json`, `components/`, or `index.html`. External Google Fonts are optional progressive enhancements with native system serif/sans/mono fallback stacks so the folder works offline when served over any static HTTP server.

To package `atlas-terrain` cleanly for standalone export:

```bash
cd templates/_drafts && zip -r atlas-terrain.zip atlas-terrain
```
