# THRESHOLD® — Beyond the ordinary
## Independent immersive template development roadmap

Status: T01 complete on publication of this documentation; T02 next. Adopted 2026-11-25. Planned template 41; not registered. Authoritative branch: main. Starting baseline: `16ba2690df595d741167f38b89be1ac995b949ef` (approved RELAY gallery publication). Baseline catalogue: 40 gallery previews, 35 configurator-selectable, 5 gallery-only. No runtime, dependency, gallery, configurator or shared-component changes in T01.

## Governing brief

Act as creative director and senior creative frontend engineer. Build an immersive architectural environment that functions as a website, not a conventional landing page decorated with animations. This is the first full independent ChatGPT-led creative and engineering cycle after the AI Studio collaboration. No AI Studio handoff is needed; retain the exact-revision evidence and stakeholder approval gates of [the existing workflow](IMMERSIVE-AI-STUDIO-WORKFLOW.md). Follow the locked [UI design contract](../UI-DESIGN-RULES.md). The stakeholder owns creative acceptance. Green CI alone is never visual acceptance.

- Brand: THRESHOLD® / Beyond the ordinary. Fictional independent studio for digital experience design, creative technology and immersive environments.
- Audience: creative directors, brands and organizations commissioning distinctive digital experiences. Primary action: start a project conversation; a truthful local demo interaction, no real submissions or fake backend.
- Length: long-form spatial journey; each chapter has a purpose. Concept: move through a continuous architectural installation whose openings reveal different creative perspectives.
- Art direction: monumental architectural scale, clean edges, controlled light, deep shadows, deliberately stylized reflective ground, architectural negative space, tightly spaced oversized editorial typography and independent portrait framing. Initial art-direction palette: obsidian #090909, vermilion #FF3823, bone #EEECE5, cobalt #2448FF. Typography direction: bold editorial grotesk; final font and licensing decision deferred.
- Arrival: luminous vermilion portal in an obsidian space, oversized integrated THRESHOLD wordmark, quiet ambient movement, full viewport without a framed viewer. Crossing: advance through the same portal, naturally revealing depth and the next room. Perspective: bone-white architectural space, geometric transformations and studio philosophy. Exploration: cobalt exhibition and three original fictional projects (PARALLAX / digital environments, FORM / interactive brand experiences, SIGNAL / creative technology), each with a distinct meaningful interaction and return. Possibility: dark closing space, white doorway, “What's on the other side?” and a clear CTA.
- Photorealism is not required. Prioritize light, composition, atmosphere and choreography over complexity. If the opening is merely a glowing rectangle on a generic black plane, redesign rather than polish it indefinitely.
- Prohibited: card walls, glassmorphism, decorative gradients, generic floating shapes, cartoon-like illustration, gratuitous particles/glows, generic hero split, obstructive timeline, fake client logos/testimonials, emoji arrows, and disconnected scenes disguised by opacity fades. Emissive architecture and physically motivated optical effects are intentional exceptions, not decoration.

## T01 repository orientation and lessons

Inspected current PROJECT-ROADMAP.md, UI-DESIGN-RULES.md (including mobile baseline), IMMERSIVE-AI-STUDIO-WORKFLOW.md, RELAY README/entry, MATTER REVIEW/standalone HTML, ATLAS README/main/renderer, SHIFT entry/live module, components/package.json and builder registry on the baseline.

| Prior experience | Baseline evidence | THRESHOLD consequence |
| --- | --- | --- |
| RELAY | Modular versioned ES entry; persistent DOM/SVG topology, stable small viewport, sequential reveal; R8 gallery-only; intermittent long frames and physical Safari not certified. | One owner of scene state, no obstructive timeline or competing transitions; assess actual motion and contrast separately. |
| MATTER | Standalone HTML exception, native WebGL sculpture and full-screen dissolution; earlier pixel bounds passed while intended visual scale suffered. Modular restoration remains open. | Keep modular originals; preserve intentional subject scale, inspect composition not just numerical bounds. |
| ATLAS | Native WebGL2 renderer, versioned camera/motion modules, context recovery, real planar reflection work; camera/terrain continuity and separate evidence gates. | Keep coherent world coordinates, bounded reflections, static fallback and context recovery; no terrain/photorealism detour. |
| SHIFT | Modular native WebGL product stage with explicit framing, motion clock and native palette; history of hard slot changes and expanded iframe scrolling problems. | One continuous world and camera, no nearest-slot switching, independently authored aspect tracks with continuity; gallery-only until separate configurator validation. |

Existing showroom toolchain: Vite ^6.3.0, Playwright 1.56.1, Sharp ^0.34.0 (components dev dependencies). Existing immersive examples demonstrate native browser rendering without requiring a global Three.js or GSAP dependency. No stack choice is made in T01: T03 will explicitly choose and justify locally managed version-pinned Three.js vs native WebGL, and whether GSAP adds enough value compared with native scroll sampling; avoid adding global dependencies or CDN-only runtime. Use semantic HTML/CSS and modular ES source, portable static Pages delivery, and procedural original artwork. Do not copy proprietary generation internals or introduce external imagery without provenance.

## Scope and engineering contract

Runtime only under `templates/_drafts/threshold-studio/` until stakeholder-authorized registration. T01 documentation only; T02 storyboard only. No registered gallery or builder entry, no shared runtime edits, no new dependency until T03. Any dedicated workflow must be scoped to this draft; keep existing gates intact. Proposed module responsibilities (not yet files): main/lifecycle, renderer, environment/geometry, materials/lighting, camera/choreography, interactions, performance, accessibility; styles, assets, tests, README. T02 defines coordinate system, room adjacency, portal proportions, camera path and portrait composition; T03 decides actual module/dependency layout; T04 establishes one persistent context.

Native scroll, deterministic progress and continuous reversible poses; no hijacking, camera jumps, teleporting, scene resets or conflicting CSS transitions. Keep a stable viewport and measured reachable scroll range. Interpolate scene state with continuous paths, no hard aspect break during movement. Ambient animation is independent, bounded, suspendable, and must not change scroll-owned pose. Use bounded framebuffer/DPR/reflection budgets, resource reuse, no unnecessary per-frame allocations, and hidden/offscreen suspension. No invented performance numbers; distinguish CPU submission/RAF intervals from displayed GPU/compositor cadence. Design semantic content, keyboard/touch, accessible sticky navigation, focus, contrast, no overflow, reduced-motion/no-JS/no-graphics alternatives and context-loss recovery from the start, even where full audits occur later. No fake links or live backend. Mobile is independently composed, not desktop squeezed. Check 320, 390, 768, 1024, 1440, 1920 CSS px; short landscape and device DPR as appropriate.

## Pass ledger — one primary objective per pass

Only proceed when preceding evidence is reviewed and blockers resolved. A failed gate introduces a named corrective pass, not speculative changes across future phases. Each pass records SHA, exact scope, tests, evidence, limitations, decision and next action in draft README/roadmap. Actual screenshots for visual changes; continuous forward/reverse recordings or sampled sequences for motion; physical-device feedback is distinct. Where a test or capture cannot be run, record it as unverified rather than claim a pass. Do not advance beyond the opening approval gate without explicit stakeholder visual acceptance.

### Phase 1 — Foundation (T01–T04)
- [x] T01 — Repository orientation, roadmap, baseline SHA. Documentation only; confirmed 40/35 membership from registry. Completion requires committed roadmap and main index entry.
- [ ] T02 — Author creative direction, spatial storyboard and architectural proportions. Define world axes, rooms, opening sightline, camera key poses, desktop/portrait framing and text safe zones; document reference sketches/targets, no renderer.
- [ ] T03 — Isolated draft scaffold and stack decision. Justify native WebGL vs pinned local Three.js, native scroll vs GSAP; establish module graph/static Pages compatibility, dependency provenance and initial semantic shell. No elaborate visuals.
- [ ] T04 — Persistent 3D scene, camera and render lifecycle. Basic geometry only; verify actual rendering/fallback, bounded buffer, resize, visibility and no duplicate scheduling.
Gate: clean extensible foundation; no elaborate visual or choreography work.

### Phase 2 — Opening experience (T05–T12)
- [ ] T05 — Portal geometry/proportions and surrounding architecture; evaluate silhouette and depth, not effects.
- [ ] T06 — Ground materials and environmental reflections; verify reflection alignment, allocation bound and no detached mirror art.
- [ ] T07 — Portal illumination, lighting and atmospheric depth; control exposure/contrast, preserve geometry.
- [ ] T08 — Desktop camera composition and architectural framing; inspect full viewport and wide aspect.
- [ ] T09 — Typography, brand identity and minimal navigation; one semantic heading and meaningful links, no generic split hero.
- [ ] T10 — Subtle ambient animation; no scroll dependency, no pointless pulse; verify pause and stable pose.
- [ ] T11 — Independent portrait opening; check 320/390/tablet, mobile chrome and text safe zones.
- [ ] T12 — Rendered visual audit and bounded corrections; actual contact sheets, opening motion evidence and stakeholder review.
HARD GATE: opening must be exceptional on desktop and portrait and explicitly accepted. A generic glowing rectangle fails even with passing tests. No crossing work before approval.

### Phase 3 — Crossing (T13–T18)
- [ ] T13 — Deterministic native-scroll engine and reachable progress endpoints; pure tests.
- [ ] T14 — Continuous camera approach toward portal; projected scale, path and clearance tests.
- [ ] T15 — Spatial typography exit; preserve legibility before intentional exit.
- [ ] T16 — Physical passage through portal; near-plane and geometry clearance checks.
- [ ] T17 — Reveal bone-white environment through opening; no unrelated scene swap.
- [ ] T18 — Forward/reverse/intermediate audit, actual motion and rendered evidence.
Gate: feels like traversing one actual space; no jumps, awkward clipped states or reset.

### Phase 4 — Perspective (T19–T23)
- [ ] T19 — Bone-white architectural environment.
- [ ] T20 — Abstract sculpture geometry and materials.
- [ ] T21 — Continuous architectural transformations.
- [ ] T22 — Integrate philosophy/capabilities with spatial typography; no service-card grid.
- [ ] T23 — Portrait composition and actual visual audit.
Gate: distinct room with shared world and coherent transition.

### Phase 5 — Exploration (T24–T30)
- [ ] T24 — Continuous transition into exhibition.
- [ ] T25 — Cobalt exhibition architecture.
- [ ] T26 — PARALLAX installation.
- [ ] T27 — FORM installation.
- [ ] T28 — SIGNAL installation.
- [ ] T29 — Meaningful project selection and return interactions; keyboard/touch and history/scroll ownership.
- [ ] T30 — Exhibition composition/interaction audit.
Gate: three distinct functional projects, no portfolio cards.

### Phase 6 — Possibility (T31–T34)
- [ ] T31 — Spatial transition out of exhibition.
- [ ] T32 — Final dark environment and illuminated white doorway.
- [ ] T33 — Closing typography and truthful local contact interaction.
- [ ] T34 — Opening-to-ending visual coherence audit.
Gate: memorable closing linked to the opening.

### Phase 7 — Consolidation (T35–T43)
- [ ] T35 — Complete desktop choreography audit.
- [ ] T36 — Complete mobile choreography audit.
- [ ] T37 — GPU performance/render optimization; measure bounded resources.
- [ ] T38 — Scroll cadence/transition stability; actual forward/reverse motion, independent device evidence where available.
- [ ] T39 — Keyboard, touch and interaction accessibility.
- [ ] T40 — Reduced-motion, no-JS and graphics-unavailable alternatives.
- [ ] T41 — Context recovery and lifecycle.
- [ ] T42 — Asset provenance, dependency, cache version and architecture audit.
- [ ] T43 — Full rendered visual/motion review at all six widths.
Gate: technical correctness AND visual quality, evidence recorded with limitations.

### Phase 8 — Publication (T44–T47)
- [ ] T44 — Explicit stakeholder final acceptance.
- [ ] T45 — Gallery registration candidate, actual opening thumbnail, old draft route redirect, catalogue and dedicated regression manifest.
- [ ] T46 — Full showroom build, regression and permanent-route tests; verify 41 gallery previews / 35 configurator-selectable assuming no intervening registrations; derive actual counts from fresh baseline.
- [ ] T47 — Publish approved exact candidate, verify deployment separately, verify gallery filters and route, close temporary branch only after ancestry/PR checks; record outstanding physical-device and configurator limitations.
Gate: gallery-only unless native palette and expanded preview compatibility are independently verified; no production, rights or physical-device certification implied.

## T01 handoff
Next: T02 only. Author a concrete architectural storyboard before choosing dependencies or building geometry. No runtime exists for THRESHOLD in this pass; no screenshot, performance or build result claimed. Existing RELAY publication closeout and other deferred tasks remain separate; do not silently mark them complete. The user's granular pacing supersedes the earlier broad T0–T8 labels for THRESHOLD only.
