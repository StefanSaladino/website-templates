# ATLAS — Beyond the Contour (A3)

An isolated experimental expedition template (`templates/_drafts/atlas-terrain/`) built around a continuous procedural 3D alpine terrain rendered natively in WebGL2.

## Architecture & Modules

- `index.html` — Semantic six-chapter expedition document (`Map`, `Ascent`, `Descent`, `Valley`, `Summit`, `Archive`), editorial SVG static plates for reduced-motion/no-WebGL/no-JS fallbacks, and accessible viewpoint navigation.
- `styles.css` — Cotton-rag archival paper (`#f4f0e8`), alpine stone (`#161b20`), glacial blue (`#4c7c92`), deep forest green (`#233a31`), and golden-hour ochre (`#d7a36b`) editorial styling with edge-free folio washes, cardless Archive integration, collision-free mobile portrait layout (`320px`–`1920px+`), and zero horizontal overflow.
- `src/terrain.js` — Geological terrain synthesis & erosion engine (`220×220` multi-range world):
  - Domain-warped tectonic horseshoe massif (`Kestrel Spire`, `Meridian Saddle`, `North Buttress`), asymmetric glaciated horns, and layered distant mountain chains.
  - S-curved `Lake Vireo` tarn basin and U-shaped approach valley.
  - 14-pass vectorized hydraulic gully incision and thermal talus slippage (`applyGeologicalErosion`).
  - Central-difference terrain normals, 8-ray horizon ambient occlusion, Laplacian ridge curvature, and a packed `512×512` 16-bit RG height + drainage/curvature texture (`uHeightTex`) plus `O(1)` bilinear height sampler (`sampleHeight`).
  - Undulating subdivided cloud deck mesh (`buildCloudDeckMesh`) and glacial water mesh (`buildWaterMesh`).
- `src/shaders.js` — Self-contained GLSL ES 3.00 shaders:
  - **Sky**: Continuous Rayleigh/Mie atmosphere shifting from cotton-rag paper to crisp SE morning alpine sky and low SW-W golden-hour alpenglow.
  - **Terrain**: Morphable elevation (`uRelief`), 4-tap bicubic height reconstruction (`sampleSmoothHeight`) for razor-clean printed Swiss contour hierarchy & NW Imhof oblique relief wash (`uMapMix`), sub-pixel rock strata/fissure micro-normal mapping (`rockMicroHeight`), shore/forest/granite/talus/snow blending, 7-step heightfield cast shadows, and aerial perspective fog.
  - **Water**: Bright glacial turquoise-to-slate meltwater absorption, animated capillary ripple normals, Schlick Fresnel, shoreline rim highlights, and **24-step heightfield raymarched mountain reflections**.
  - **Clouds**: Domain-warped FBM stratus clouds rendered across 5 staggered altitude offsets (`-0.4, 1.1, 2.5, 4.0, 5.4`) with terrain-clearance parting, camera proximity fade, and golden-hour rim scattering.
- `src/camera.js` — Continuous Catmull-Rom 3D spline with deliberate foreground/midground/distance sightlines, terrain/water collision avoidance, mobile portrait FOV & framing compensation, and non-blocking viewpoint inspection offset (`yaw` / `pitch`).
- `src/motion.js` — Demand-driven `followValue` smoothing, mobile `30fps` ambient cap, automatic offscreen/hidden suspension, and idle RAF termination in still/settled states.
- `src/renderer.js` — WebGL2 pipeline with adaptive DPR/mesh resolution (`256×256` high / `176×176` mobile, standard detail & software rasterizer), `webglcontextlost`/`webglcontextrestored` recovery, and clean disposal.
- `src/main.js` — Native scroll mapping, three curated Archive viewpoints (`Tarn Overlook`, `Meridian Gorge`, `Kestrel Crest`), `touch-action: pan-y` non-blocking horizontal/mouse drag inspection, keyboard shortcuts (`ArrowLeft`/`ArrowRight`/`A`/`D`/`R`), `Still view`, and `High detail` / `Standard detail` toggles.

## Self-Contained ZIP Export

All source files, shaders, and geometry generators live strictly inside `templates/_drafts/atlas-terrain/` with zero modifications to shared files, `package.json`, `components/`, or the showroom gallery. External Google Fonts are optional progressive enhancements with native system serif/sans/mono fallback stacks so the folder runs standalone over any static HTTP server.

## A4 — engineering recovery and visual polish
A2 bcf6173 passed browser 45543397722 and Pages 45543396816 but was visually rejected. A3 AI Studio export 2026-11-24 23:25 contains substantive multi-range/erosion, map, lake, lighting, mobile and archive revisions; four formal audit screenshots and 24 recovered temporary screenshots were inspected. A4 selectively imports only the draft source, restores frame/depth clearing, nonuniform-time continuous camera spline, fixed per-viewport pixel budget, soft collision clearance, inert inactive panels, deterministic scroll time, static mode and gallery link. Correct reversed GLSL smoothstep, reduce snow clipping and high-frequency rock noise, balance ambient/sunlight, lake reflections and cloud opacity, refine opening type and reduce overlay clutter. Preserve A3 geometry and cardless archive. Current A4 rendered browser evidence and physical-device acceptance pending; no showroom registration. A3 screenshots are not evidence of A4. See docs/IMMERSIVE-AI-STUDIO-WORKFLOW.md.
