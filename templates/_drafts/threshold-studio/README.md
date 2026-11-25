# THRESHOLD — isolated draft
T04 / diagnostic 3D foundation only. Not a registered template or finished opening.
Design specification: [THRESHOLD roadmap](../../../docs/THRESHOLD-STUDIO-ROADMAP.md).
Baseline: bae30bc87bb96c64b7dacce3d67d1d057fc00b83.

## Stack decision
Native WebGL2, GLSL ES 3.00 and browser ES modules; native scroll mapping and requestAnimationFrame when implemented. Zero third-party runtime dependencies. Three.js offers useful scene graphs, material and reflection tooling but these fixed opaque architectural rooms need a small deterministic mesh/material graph, explicit reflection budget and direct control of GPU lifecycle. GSAP is valuable for complex independent timelines, but the shared scroll-owned camera requires a pure progress-to-pose mapping with reversible endpoints; direct native sampling avoids competing clocks. Neither library is necessary at this stage. Revisit only with evidence of a material benefit, pin and locally vendor or build a scoped dependency with license and reproducible version; no CDN runtime. Original code and system font placeholder only; final type art direction is T09.

## Actual files / boundaries
- index.html: truthful static semantic opening shell, no inactive controls or fake future links, relative library return.
- styles/base.css: palette, reset, focus and skip link. styles/shell.css: responsive scaffold only.
- src/config.js: release, identity and centralized architectural s-to-world-Z conversion.
- src/main.js: version-matched shell bootstrap; no GPU initialization or scroll/RAF.
- package.json: isolated module mode and no-install Node tests.
- tests/scaffold.test.js: release/local path and coordinate regression tests.

T04 will add renderer/camera/lifecycle modules with basic test geometry and a static fallback, not final portal artwork. Later modules for environment, materials, lighting, choreography and interactions are added only when needed, not empty stubs. Keep a single renderer, version all changed graph imports, bound resolution and reflection resources, suspend hidden rendering and dispose resources. Existing components postbuild copies the templates directory verbatim; this draft requires no shared build changes. Draft noindex, not gallery-listed. Test with npm test; serve repository root over HTTP and open /templates/_drafts/threshold-studio/.

## T03 evidence
Local Node v22.16.0: two scaffold tests passed; main syntax check passed. Local Chromium refused loopback URL with ERR_BLOCKED_BY_ADMINISTRATOR, not a site failure. Dedicated browser workflow checks actual static route, assets, keyboard skip, six target sizes plus landscape, reduced motion and JS-disabled static content. CI result and Pages deployment are separate pending checks at commit time; no visual or GPU claim. No changes to other templates, gallery, configurator or shared package files.

## T03 verified / T04 implementation
T03 exact browser 45685800817 and Pages 45685799566 passed. T04 adds camera, geometry, lifecycle and renderer ES modules; one WebGL2 canvas, 26 diagnostic triangles, depth test, single draw submission, 1.5M pixel / 1.75 DPR / device-limit bounds. Static SVG stays available until successful draw; reduced motion, no JS, no graphics and context loss use the fallback. Demand-driven invalidation only, visibility/offscreen suspension, pagehide cleanup and persisted-page resume. Context restoration rebuilds GPU objects. No final portal, reflection, lighting, animation or scroll path. Temporary in-flow diagnostic layout is not the final art direction. Five Node tests and dedicated browser pixel, resize, idle, preference, offscreen and context-loss/restoration checks are queued for exact revision; no new runtime verification claimed before CI. T05 after T04 evidence review.
