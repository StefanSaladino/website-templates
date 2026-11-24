# Experiential website templates — code-only, template-first roadmap
Updated 23 November 2026. This is the controlling plan for the immersive expansion; it supersedes the earlier six-concept plan. The stakeholder explicitly requested complete websites before extracting showroom components, designs beyond conventional rotating-product heroes, and a workflow that does not require Blender or manual video editing.

## Production contract
- Every planned website must be buildable, reproducible and maintainable through repository code alone. HTML/CSS/JS/SVG, procedural meshes, generated materials and textures, shaders, programmatic camera paths, vector artwork and offline scripted asset generation are preferred. No required Blender project, hand-authored external 3D file, manual video editing, video subscription, paid design tool or unavailable asset.
- A locally bundled, pinned open-source rendering/animation/physics library is acceptable when justified. Native WebGL where sufficient; evaluate Three.js, GSAP and Rapier selectively. No global runtime bloat for conventional sites; no CDN runtime dependency. WebGPU is an optional progressive enhancement, never a prerequisite.
- Complex objects should be designed as original, stylized concepts rather than promising photorealistic replicas. APEX is an original faceted vehicle concept, CALIBRE a conceptual mechanical movement, ESSENCE stylized optical glass. Do not copy branded designs or imply manufacturing accuracy.
- Third-party models, footage and textures are not required for this phase. If a later design needs one, document the blocker and propose a code-generated substitute first. Any exception requires stakeholder approval and independently recorded redistribution rights. Existing traditional-template stock review is unaffected.
- If a cinematic effect benefits from prerecorded media, generate frames and encode via a reproducible optional script, not manual editing. Prefer real-time rendering with deterministic forward/reverse timeline states and static fallbacks.

## A — complete website build sequence
11 experiential designs including FULCRUM, aiming at 35 total websites from the original 24. These numbers are planning targets, never CI count constraints. Each concept must have its own visual language, business/story structure, usable navigation, coherent HTML copy, responsive experience, and accurate review-only gallery entry. Do not reuse the same page composition with a different 3D object.

| Order | Template / level | Integrated concept and code-only production | Status |
|---|---|---|---|
| A1 | FULCRUM / II | Procedural lathe-and-rod lamp, orbit, finish controls, exploded assembly and restrained scroll response | Implemented; 6 immersive browser cases passed, visual/native review open; specialist keyboard selector correction in this checkpoint |
| A2 | STRATA / III | Procedural courtyard residence built from slabs, walls, glazing, interior geometry and plants; arrival, camera approach, roof separation/plan, cutaway, interior journey, reconstruction and evening lighting. Native scroll timeline, manual chapter controls, static diagrams | Next; planned |
| A3 | PRESSURE / II–III | Creative agency with original extruded vector letterforms, material deformation, pointer response, typographic fracture/reassembly and scene-linked portfolio compositions; no external font geometry required | Planned |
| A4 | TERRAIN / III | Seeded heightfield, procedural rock, forest, water and sky; continuous valley-to-summit journey, changing elevation, lighting, weather and environmental particles; reduced-motion chapter stills | Planned |
| A5 | ABYSS / III | Original underwater terrain, caustics, depth fog, particles and procedural bioluminescent organisms; depth-driven narrative, gradual light transitions and optional manually activated synthesized sound | Planned |
| A6 | TYPEFORM / I | Living editorial publication; native CSS/SVG masks, folds, image displacement using original vector compositions, animated typesetting, layouts that rearrange and transitions between chapters/pages; no heavy GPU requirement | Planned |
| A7 | ESSENCE / II–III | Original lathe glass fragrance bottle, cap assembly, procedural liquid/ink effects, optical shader studies and botanical vector/mesh ingredients; distinct fragrance atmospheres | Planned |
| A8 | OBJECT ROOM / III | Original generated chairs, vessels and sculptural objects; gallery spatial navigation, camera approach and inspection, material changes, accessible conventional catalogue | Planned |
| A9 | CALIBRE / III | Parametric gears, shafts, plates and case; conceptual exploded watch movement, coordinated mechanical animation and macro camera views; illustrative not mechanically certified | Planned |
| A10 | APEX / III | Stylized non-branded vehicle from parametric profiles and mesh surfaces; wind-tunnel reveal, material/body choices, lights and separated mechanical studies. No imported car model requirement | Planned |
| A11 | ORBIT / III | Procedural planet, terrain, atmosphere and stylized spacecraft; surface-to-orbit camera sequence, celestial lighting and explanatory chapters; no externally sourced space footage | Planned |

Level I: enhanced CSS/SVG/DOM motion; Level II: interactive real-time models and shaders; Level III: continuous cinematic environments and spatial choreography. STRATA, PRESSURE, TERRAIN and ABYSS are the initial flagship experiences. Order prioritizes feasible code-only visual results; complex later models may be simplified in art direction but not replaced with unrelated footage. New designs can be added without count changes. All A2–A11 are planned, not implemented.

## B — experiential techniques to demonstrate in full websites
| Technique | Primary planned integrated demonstration |
|---|---|
| Seamless scene transitions and reversible timeline | STRATA, TERRAIN, ORBIT |
| Scroll-controlled camera, depth-aware parallax | STRATA, TERRAIN, ABYSS, ORBIT |
| Spatial navigation and portal-style transitions | OBJECT ROOM, ORBIT |
| Object morphing and scroll-driven assembly | FULCRUM, ESSENCE, CALIBRE |
| Interactive cutaway and reconstruction | STRATA, CALIBRE, APEX |
| Typography deformation and image displacement | PRESSURE, TYPEFORM |
| Fluid/ink/water simulation and refraction | ESSENCE, TERRAIN, ABYSS |
| Cloth-like deformation and bounded physics interactions | PRESSURE, OBJECT ROOM (only when art direction calls for them) |
| Dynamic lighting, shadows, atmospheric fog and volumetric-style beams | STRATA, APEX, ABYSS, ORBIT |
| Procedural environments and adaptive weather/time/depth atmosphere | TERRAIN, ABYSS, ORBIT |
| Cross-page continuity and page-fold/mask transitions | TYPEFORM, PRESSURE |
| Optional interactive soundscape | ABYSS (explicit user activation and mute; no autoplay audio) |

Prefer practical real-time approximations over expensive full fluid/cloth solvers or physically accurate volumetrics. Effects are candidates, not promises of a particular simulation fidelity. If an effect is unsuitable, document why and the alternative. Use scroll as an input, not a hijacked navigation mechanism. Forward and reverse travel must be consistent; chapter links and keyboard controls remain usable. Mobile may use a different composition/choreography rather than shrinking desktop.

## C — extraction AFTER complete website foundations
- Keep the existing component showroom unchanged during the full-site phase. Once integrated websites are working and reviewed, extract 3D-01 rotating product, 3D-02 scroll-controlled hero, 3D-03 pointer-responsive sculpture, 3D-04 exploded assembly, 3D-05 material configurator, 3D-06 architectural model, 3D-07 typographic relief, 3D-08 purposeful shader distortion, 3D-09 cinematic camera journey, 3D-10 environmental particles, 3D-11 object transformation, 3D-12 interactive object gallery.
- Then derive additional advanced effects/transitions from actual implementations in section B. Avoid speculative duplicate components or arbitrary component-count targets. Add appropriate independent mobile variants, documented controls and direct links to exact integrated template sections.
- Planned component IDs are reserved proposals, not active catalogue records. Do not create component placeholders or publish live status merely to populate the category.

## D — engineering, design and acceptance gates
- Every website needs original asset provenance, code-reproducible geometry/textures/art, original visual direction, semantic content, keyboard-operable controls and useful fallback without WebGL or JS. Maintain locked UI-DESIGN-RULES; no generic floating objects, meaningless animation, glassmorphism, neon spectacle, desktop-only layouts or arrow emojis.
- Budget initially <=300 KB added runtime JS compressed and <=2 MB initial 3D transfer (targets, not measurements). Document actual transfer, triangles/draw calls and rendering performance; adapt pixel ratio, detail and textures. Lazy-init secondary scenes, render on demand, suspend hidden/offscreen scenes, release GPU buffers/listeners, recover context loss. Do not introduce mandatory loading screens for content.
- General QA discovers all complete template folders automatically, verifies one unique review gallery route and built output, static references, script syntax, keyboard and overflow, touch geometry and text-spacing/reflow. No hardcoded website totals. See [TEMPLATE-QA-GROWTH-CONTRACT.md](TEMPLATE-QA-GROWTH-CONTRACT.md).
- For each real WebGL site register root data-immersive-template and the dedicated interaction/fallback spec in components/data/immersive-tests.json. Actual visible pixels and per-control pixel changes, reset, fallback and no-JS at 320/390/768/1440 where applicable. Add focused timeline tests (forward/reverse chapter changes, direct links, reduced motion, user override, resize), GPU context loss/recovery, touch scroll/gesture coexistence, and rendering budgets. A CSS/SVG-only experience gets a dedicated motion/interaction suite, not a false WebGL requirement.
- After each build check current-SHA CI, screenshots, real visual composition and physical mobile/desktop GPU behavior, then iterate. Physical devices, screen readers and legal approval remain separate manual gates; never imply passing automation certifies them. No main merge without explicit release authorization.

## Current checkpoint
FULCRUM is the sole new completed-source experiential site (25 full sites total); STRATA is next and has not been committed. FULCRUM immersive test run 45300540894: 6/6 passed, including four GPU-rendered viewports and no-GPU/no-JS fallbacks. General 25-site baseline: 100/100 cases passed in workflow 45300540905; specialist FULCRUM keyboard test hit an ambiguous data-finish selector, corrected to target buttons in this checkpoint, rerun pending. Other prior gallery, touch, reflow, media and reduced-motion audits passed on their respective source SHAs. Current-sha CI must be verified separately. Existing catalogue remains 157 core / 44 mobile alternatives / 20 integrated animations.

Original stock remediation is paused at FRAME 7e32171: 74/74 attributed external source identities, nine high-priority risks, next RANGE/FOUND TM-103 and TM-105. No stock rights approval, Step 18/19 acceptance, or main merge. This is independent of the code-only new builds.

### FULCRUM refinement checkpoint
User requested sleeker design and correction of assembly lifting the lamp off its base. Real prior CI screenshots reviewed: refine stage, scale, lighting and physical proportions, keep base and support anchored, separate only shade/diffuser. Actual rendered-pixel invariance tests and matching SVG fallback assertions added; verify current revision before moving to STRATA.
