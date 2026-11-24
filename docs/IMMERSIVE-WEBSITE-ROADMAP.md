# Immersive website templates — template-first phase
**Direction approved 23 November 2026.** Build complete websites first. Reusable showroom components are extracted only from functioning, integrated, reviewed website experiences. Do not add placeholder components or duplicate the existing ANIM family just to reach a count.

## Phase A — six distinct full-site experiences
| Order | Template | Real 3D / motion objective | Proposed extraction |
|---|---|---|---|
| A1 | FULCRUM — design-led lighting product | Procedural lamp, orbit/drag, material controls, exploded assembly, restrained scroll rotation | 3D-01, 02, 04, 05 |
| A2 | STRATA — architectural studio | Original building model, orthographic plan / perspective, camera path, floor or section reveal | 3D-06, 09, 11 |
| A3 | PRESSURE — experimental creative studio | Art-directed typographic relief, interactive sculptural identity, pointer response and material distortion | 3D-03, 07, 08 |
| A4 | APEX — automotive concept | Original non-branded vehicle geometry, changing body/interior finishes, exploded details and lighting views | 3D-01, 04, 05 (variant) |
| A5 | TERRAIN — outdoor expedition story | Original miniature landscape, restrained camera journey, scroll chapters and environment particles | 3D-02, 09, 10, 11 |
| A6 | OBJECT ROOM — collectible design gallery | Curated 3D objects, accessible selection and inspection, spatial transitions | 3D-12, 03, 05 |

A1 source is implemented as a standalone static website, integrated into the root library with its own card. Browser/human approval is still open. A2–A6 planned, not implemented.

## Phase B — components AFTER all template foundation passes
- 3D-01 Interactive rotating product; 3D-02 Scroll-controlled 3D hero; 3D-03 Pointer-responsive sculpture; 3D-04 Exploded assembly; 3D-05 Material/color configurator; 3D-06 Architectural model.
- 3D-07 Typography relief; 3D-08 Liquid or purposeful shader distortion; 3D-09 Cinematic camera journey; 3D-10 Interactive environmental particles; 3D-11 Scroll-driven object transformation; 3D-12 Interactive object gallery.
- Add dedicated category, isolated previews, links to exact live-in-review template sections, controls, documentation, desktop/tablet/phone behavior and independently meaningful mobile alternatives only where useful. Showroom IDs above are reserved proposals, not active catalogue entries.

## Engineering and visual gates
Native WebGL first where simple procedural meshes suffice; evaluate a pinned locally bundled Three.js/GLB pipeline for genuinely complex assets, GSAP only when a specific timeline benefits. No runtime CDN imports; no global impact on traditional templates. Original models/procedural meshes and locally licensed GLB/textures with recorded authorship/rights; avoid copying branded products. Validate true model dimensions, triangle count, compressed transfer size and rendering performance. Target initially <=300 KB of added runtime JS compressed and <=2 MB initial 3D transfer (targets, not achieved measurements), defer secondary models. Cap DPR and texture sizes; draw on demand, suspend hidden/offscreen scenes, dispose buffers, handle context loss, use a static illustration or still if GPU unavailable. No scroll hijacking or mandatory gesture for content. Accessible semantic HTML, keyboard-operable controls, reduced-motion manual inspection, touch vertical scroll, 320/390/768/1440 responsive checks. Test actual geometry rendered, material changes, rotation, assembly controls, no-WebGL fallback, text reflow, screenshots and native iOS/Android/desktop GPU performance. All design copy and conversion actions work without 3D; no fake sales/endorsement. Apply locked UI-DESIGN-RULES: every scene must serve the page, no arbitrary chrome orbs, excess particles, glassmorphism or gradient spectacle. No release without explicit stakeholder approval.

## Paused checkpoint
Original 24-template media remediation paused after FRAME commit 7e32171: 74/74 external source identities attributed, 9 high-priority risks remain; next RANGE/FOUND TM-103 and TM-105. No rights approval, no Step 18/19 final acceptance, no main merge. The new procedural template brings the gallery to 25; existing component inventory remains 157 core / 44 mobile alternatives / 20 integrated animations. No clearance claim for newly authored assets.
