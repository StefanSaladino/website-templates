# THRESHOLD® — Beyond the ordinary
## Independent immersive template development roadmap

Status: T01–T05 verified; T06 implemented, exact-revision verification pending. Adopted 2026-11-25. Planned template 41; not registered. Authoritative branch: main. Starting baseline: `16ba2690df595d741167f38b89be1ac995b949ef` (approved RELAY gallery publication). Baseline catalogue: 40 gallery previews, 35 configurator-selectable, 5 gallery-only. No runtime, dependency, gallery, configurator or shared-component changes in T01.

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
- [x] T02 — Author creative direction, spatial storyboard and architectural proportions. Define world axes, rooms, opening sightline, camera key poses, desktop/portrait framing and text safe zones; document reference sketches/targets, no renderer.
- [x] T03 — Isolated draft scaffold and stack decision. Justify native WebGL vs pinned local Three.js, native scroll vs GSAP; establish module graph/static Pages compatibility, dependency provenance and initial semantic shell. No elaborate visuals.
- [x] T04 — Persistent 3D scene, camera and render lifecycle. Basic geometry only; verify actual rendering/fallback, bounded buffer, resize, visibility and no duplicate scheduling.
Gate: clean extensible foundation; no elaborate visual or choreography work.

### Phase 2 — Opening experience (T05–T12)
- [x] T05 — Portal geometry/proportions and surrounding architecture; evaluate silhouette and depth, not effects.
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

## T02 — Architectural storyboard / design specification

Input baseline: `afc9462ebca509ce0c76c11ff7de3744fbbaab9f`. Status: authored spatial specification, not a rendered prototype or accepted visual result. All dimensions, camera positions, colours and screen allocations below are proposed design decisions, adjustable on actual evidence. No runtime, dependencies, renderer, catalogue or shared code created.

### The visual idea: a cut through a monolith

The opening is not a neon picture frame. A heavy, offset black architectural mass is cut by a deep rectangular vermilion passage. The red is concentrated on inward-facing jambs, soffit and far reveal, not an outline around a flat black rectangle. Let the near left black face absorb light, the right return disclose thickness, and the floor catch a softened, perspectivally aligned red reflection. A thin off-axis wall fin and a recessed black overhead plane establish scale; no repeated decorative portal array or random light beams. Through the cut, an ivory slit hints at the next room. The opening composition is an editorial poster with architectural depth; ambient motion should be a quiet change in illumination on the inner surfaces, not floating geometry, global pulsing or a swinging camera. The portal itself remains fixed.

### World plan and clearances

Use right-handed world coordinates: +X right, +Y up, +Z toward arrival camera. For readable architectural drawings use forward depth s = -Z. All tuples below are (x, y, s) in arbitrary meter-like world units; runtime conversion to (x,y,-s) must be centralized. Floor Y=0 is continuous. Main route progresses toward increasing s; room boundaries remain fixed regardless of chapter or screen size.

| Region | Depth s | Interior width / height | Construction / sightline |
| --- | --- | --- | --- |
| Arrival | -18 to 0 | 20 / 11 | Obsidian floor and enclosing side masses; hero portal is dominant, quiet offset ceiling/fin silhouettes outside route. |
| Vermilion cut | 0 to 2 | 4.8 clear / 6.0 clear | Outer portal 6.0 wide, 7.2 high, centered X=0; jamb thickness .6 each, soffit thickness 1.2, open floor (no threshold obstacle). Structural black face joins lateral walls so next room cannot be seen around the frame. |
| Transition throat | 2 to 6 | 4.8 / 6.0 | Fixed recessed red returns gradually reveal bone-white light; no opaque cap or second canvas. |
| Perspective | 6 to 20 | 18 / 10 | Bone-white gallery; two offset solid folded structures, left X=-5 and right X=+5, footprints outside central clearance lane. Asymmetrical masses, not a floating shape wall. Far cobalt reveal at s=20. |
| Exhibition connector | 20 to 23 | 5.6 / 6.5 | Continuous turn of material and light at real wall opening; straight camera route. |
| Exploration | 23 to 40 | 22 / 11 | Cobalt gallery with side-facing recessed bays: PARALLAX (left, s=26), FORM (right, s=31), SIGNAL (left, s=36). Preserve unobstructed center aisle and exit aperture at s=40. |
| Exit throat | 40 to 43 | 5.6 / 6.5 | Cobalt retreats behind a dark physical reveal. |
| Possibility | 43 to 55 | 18 / 10 | Obsidian closing room. White aperture centered X=0 at s=53, 4.4 clear width, 5.6 clear height; camera stops before it. White light chamber beyond, not a dead black wall. |

Main route schematic (not to scale):

```text
          X left       clear axis X=0       X right
s=-18    ┌────────────── ARRIVAL ──────────────┐
         │           camera approaches        │
s=0      ├──────────────┐     ┌───────────────┤
         │  black mass  │ RED │   black mass  │
s=2      └──────────────┤ CUT ├───────────────┘
                        │     │
s=6      ┌──────────────┘     └───────────────┐
         │ folded mass   PERSPECTIVE   mass  │
s=20     └──────────────┐     ┌───────────────┘
                        │     │
s=23     ┌──────────────┘     └───────────────┐
s=26     │ PARALLAX          │                │
s=31     │                   │          FORM  │
s=36     │ SIGNAL            │                │
s=40     └──────────────┐     ┌───────────────┘
                        │     │
s=43     ┌──────────────┘     └───────────────┐
         │              POSSIBILITY          │
s=53     │                WHITE              │
s=55     └───────────────────────────────────┘
```

Reserve X=-1.8..+1.8 as the continuous main aisle; within throat segments keep camera center X within ±1.2, Y=1.8..2.6. A provisional .35-unit clearance radius must fit the camera trajectory including interpolation and near plane; do not use these keyframes alone as proof of clearance. Arrival camera intentionally begins outside the aisle but inside its room. Keep movable sculpture and bay geometry outside X=±2.6 in every state. Floor never moves. All rooms use actual occluding architecture with openings; no global palette crossfade that turns the red structure into ivory. Emission and illumination respond to proximity and sightline; spatially distinct materials remain distinct.

### Opening editorial compositions

Desktop (1440x900 reference): full-bleed stage, portal slightly right of center by perspective, large wordmark extending almost the width at upper third behind the near architectural face. Target wordmark band x=4–96%, y=13–27%; allow deliberate partial occlusion only on its lower edge, retain an identifiable full wordmark in header or accessible visible text. Use a depth-aware typographic layer or masked compositing, not a solid opaque plate in the passage. Small brand at upper left, minimal navigation upper right; header y=0–8%. Tagline and short studio descriptor occupy left negative space x=5–30%, y=48–65%. Entry/scroll affordance at x=5–30%, y=82–93%, separate from reflection. Floor red reflection reads from portal base toward lower right, clipped by real surface and roughness; keep lower-left text legible. Full viewport, no canvas border or card. At 1024 desktop, reserve x=4–30% for copy, shorten lines if necessary; at 1920 do not widen portal just to fill empty space.

Portrait (390x844 reference): independently centered deep portal, stronger vertical symmetry, visible upper wordmark band x=5–95%, y=12–24% above the structure, no wordmark masking required. Header y=0–9%, portal approximately y=30–74%; image width deliberately dominant. Compact tagline and entry cue in lower band y=79–94%, with actual safe-area padding and local contrast; don't put text over the bright portal opening. Reflection is a short foreshortened red trail with negative space for text. Narrow 320 and tablet are distinct framing targets; landscape uses a bounded shorter composition and must not clip navigation. Tablet portrait: place header above the portal and short descriptor in lower/side negative space, avoid forcing 390 proportions onto 768. All percentages are normalized visual targets, not hard-coded absolute layout or proof of readable typography. Do not use future links before their targets exist; the T03 opening shell is truthful about draft scope.

Opening schematic, not a render:

```text
DESKTOP                                     PHONE
brand                          nav          brand       menu
  T H R E S H O L D                         T H R E S H O L D
               ┌─────────┐
               │ red cut │                    ┌─────────┐
 Beyond the    │   ivory │                    │ red cut │
 ordinary.     │    slit │                    │  depth  │
               └─────────┘                    │         │
 Enter              reflection                └─────────┘
                                               reflection
                                              Beyond the ordinary.
                                              Enter
```

### Authored camera and narrative beats

Normalized progress p maps to measured reachable native scroll distance only in T13. Opening has no scroll-driven camera before its approval. Initial candidate journey distance allocation: arrival/approach 0–.20; crossing .20–.34; perspective .34–.56; exhibition .56–.82; possibility .82–1. These are editorial timing targets, not runtime constants yet. Use monotone depth progression with continuous tangent/aim/FOV interpolation, no hard chapter thresholds. Aim points are explicit world targets; interpolate orientation robustly (no look-at flip or zero-length view direction). Desktop/portrait tracks differ by authored keyframes but share room coordinates and timing. Blend aspect targets continuously; do not hard-switch pose mid-journey. Preserve endpoint poses and deterministic reverse progression. FOV is vertical degrees.

| p | Beat | Desktop eye / aim / FOV | Portrait eye / aim / FOV |
| --- | --- | --- | --- |
| 0 | Arrival poster | (-2.4,2.4,-12) / (-.65,2.9,0) / 47 | (.6,2.2,-15) / (0,3.9,0) / 57 |
| .10 | Approach | (-1.2,2.35,-8) / (0,2.9,1) / 49 | (.3,2.2,-9) / (0,3.2,1) / 60 |
| .20 | At red cut | (-.25,2.25,-2) / (0,2.8,5) / 53 | (.1,2.15,-2.2) / (0,2.8,5) / 62 |
| .27 | Through cut | (0,2.2,1) / (0,2.9,9) / 54 | (0,2.15,1) / (0,2.9,9) / 62 |
| .34 | Ivory arrival | (0,2.3,7) / (0,3.2,15) / 50 | (0,2.2,7) / (0,3.5,15) / 61 |
| .45 | Perspective | (-1.0,2.5,12) / (.5,3.6,19) / 48 | (.1,2.3,11.5) / (0,3.6,19) / 60 |
| .56 | Cobalt entrance | (0,2.3,21) / (0,3.1,30) / 50 | (0,2.2,21) / (0,3.4,30) / 61 |
| .65 | PARALLAX | (-.7,2.35,26) / (-3.2,3.0,30) / 50 | (-.3,2.2,26) / (-1.8,3.1,30) / 62 |
| .72 | FORM | (.7,2.35,31) / (3.2,3.0,35) / 50 | (.3,2.2,31) / (1.8,3.1,35) / 62 |
| .78 | SIGNAL | (-.5,2.3,35.5) / (-2.6,3.0,39) / 50 | (-.25,2.2,35.5) / (-1.6,3.1,39) / 62 |
| .82 | Dark exit | (0,2.25,41) / (0,3.0,48) / 51 | (0,2.2,41) / (0,3.1,48) / 61 |
| 1 | Possibility | (-1.1,2.3,46) / (0,2.8,53) / 50 | (0,2.15,45.5) / (0,3.5,53) / 60 |

Tablet opening candidate: eye (.3,2.4,-12.8), aim (-.15,3.65,0), vertical FOV 49. Later tablet keyframes require visual authoring rather than a blind constant multiplier. Camera values define direction, not a locked implementation; dense path sampling, near/far clip, actual occlusion and passage clearance remain later gates. Initial near-plane design target .05–.1 world units, choose far plane sufficient for contiguous visible rooms without needlessly reducing depth precision. Never hide clipping by fading the scene.

### Project interaction sketches (later scope)

PARALLAX: nested offset architectural planes align with a local reversible control, producing optical depth; no arbitrary particles. FORM: a folded typographic relief rotates about a fixed hinge to reveal a second brand composition. SIGNAL: a restrained luminous line installation routes a pulse through selected architectural channels; user changes the route, not random decorative animation. Each bay has a semantic name and selection affordance with keyboard/touch equivalent. A selected project opens a bounded view from the current journey state, remembers progress, and returns focus/pose to the original selection. T29 must choose explicit scroll ownership and avoid simultaneous scroll and interaction camera controllers. No runtime or exact interaction claims at T02.

### T02 numerical planning check

Computed pinhole camera projection of the eight outer portal bounding-box corners X=±3, Y=0/7.2, s=0/2 using the opening poses above, world up +Y, normalized camera basis, vertical FOV and viewport aspect. Coordinates below are percentages of viewport from top-left, rounded to .1. Formula for a point relative to eye: u=.5+.5*dot(v,right)/(dot(v,forward)*tan(FOV/2)*aspect); v_screen=.5-.5*dot(v,up)/(dot(v,forward)*tan(FOV/2)). All corner depths positive. These are design-level projected bounds of a box, not screenshots, actual geometry, reflection bounds, typography or occlusion validation.

| Viewport | X extent % | Y extent % |
| --- | --- | --- |
| 320×568 | 16.9–83.7 | 30.3–74.4 |
| 390×844 | 9.6–91.1 | 30.3–74.4 |
| 768×1024 | 17.0–87.1 | 20.3–82.0 |
| 1024×768 | 32.8–74.8 | 8.6–78.4 |
| 1440×900 | 35.7–70.7 | 8.6–78.4 |
| 1920×1080 | 37.1–68.6 | 8.6–78.4 |

All six modeled bounds fit the viewport. The tablet leaves a tighter lower copy/reflection zone and desktop top edge nearly touches header; specifically inspect these at T08/T09/T11 rather than claim resolved visual composition. Actual wall occlusion, shader/lighting, font measurements, clipping and continuous path motion have not been tested. No visual acceptance claimed. The opening remains the first hard artistic gate at T12.

### T03 handoff

Select local, pinned rendering stack based on actual requirements: simple opaque architecture, depth-aware masking, directional/emissive materials, bounded planar reflection and responsive camera. Compare Three.js against native WebGL and GSAP against direct native scroll. Establish isolated semantic draft and versioned module/dependency graph only; T04 basic renderer later. No building the portal, lighting or camera choreography prematurely.

## T03 — Native rendering stack and isolated shell
Input baseline `bae30bc87bb96c64b7dacce3d67d1d057fc00b83`. Choose native WebGL2/GLSL, modular ES source and native scroll/RAF when implemented; no Three.js, GSAP or other runtime dependency. Fixed architectural geometry and bounded reflections favor explicit renderer control; native deterministic progress avoids multiple clocks. The existing static postbuild copies all templates; no shared build change. Created isolated draft semantic shell, base/shell styles, release and coordinate helper, bootstrap and dependency-free tests. System font is temporary; no canvas, renderer, lighting or scroll motion yet. Two local Node tests and entry syntax check passed; local Chromium loopback blocked by administrator, so dedicated real-route GitHub browser workflow added; its result and Pages deployment pending at commit time. T03 implementation recorded; verify exact-revision browser gate before T04. See draft README. No gallery or builder registration.

## T04 — Persistent rendering foundation
T03 commit 4475f4e6615c00bf7176df419f110e4cd41b6e16 passed dedicated browser run 45685800817 and Pages run 45685799566. T04 introduces one persistent WebGL2 canvas, static fallback, perspective camera matrices, diagnostic 26-triangle mesh, depth testing, coalesced demand-driven scheduling, bounded framebuffer (1.5M pixels, DPR <=1.75 and hardware limits), visibility/offscreen suspension, resource disposal and context restoration. No final portal, materials, reflections, scroll or animation. Temporary neutral study camera and in-flow test surface are not opening compositions. Extended pure tests and dedicated real-route browser checks for visible pixels, seven sizes, resize, idle, offscreen, reduced motion, disabled graphics/JS and actual context loss/recovery; actual results pending. T04 remains unchecked until exact revision verification. Next T05 only after review. No shared runtime, catalogue or dependencies changed.

## T04a — Context-restoration verification correction
Exact T04 browser run 45686395150 failed at inline line 59 waiting for renderer=webgl after simulated restoration; setup, five Node tests, 320/390 screenshots and pixel checks, idle, resize, reduced-motion toggle, offscreen suspension/resume and observed context-loss fallback reached before failure. Two partial captures artifact 15056412384; remaining widths and final report not reached. Pages 45686394229 passed. The immediate restoreContext call may be too early for Chromium; this is a hypothesis, not a proven runtime root cause. Keep renderer and all runtime files byte-identical. Correct scoped test sequencing: independently observe actual lost/restored events, give Chromium a recovery interval, require post-restore draw count increase, visible canvas, live context and actual recovered mesh pixels; capture diagnostics distinguishing absent restore event from failed renderer rebuild. No assertions removed. T04 stays unverified; T05 remains gated. If actual restoration fires but redraw fails, fix runtime in a separate pass.

## T04b — Fix GPU object generation on context restoration
T04a browser 45686683301 reproduced the failure with definitive diagnostics: lost=1, restored=1, contextLost=false, renderer=static, reason=graphics-error. Chromium logged INVALID_OPERATION deleting buffer, vertex array and program objects from the lost generation; rebuild's final getError then failed. This is a renderer defect, not simply test timing. Add abandon() (clear stale CPU handles without GL calls) on loss, and restore() (discard handles defensively before rebuilding); normal disposal still deletes current-generation resources. Preserve static fallback, dirty scheduler, geometry, camera and framebuffer limits. Bump the complete runtime import graph to T04b. Keep the strengthened actual restoration and recovered pixel checks, add explicit no residual GL error. T04a Pages 45686682733 and Node checks passed; original 320/390 screenshots inspected and show both diagnostic solids and floor. T04b exact browser and deployment results pending; T05 gated. No final portal artwork or gallery changes.

## T05 — Architectural cut geometry study
T04b exact browser run 45686886741 completed its full browser step successfully, including actual restored context/new pixels/no residual GL error, seven viewport captures, idle/resize/offscreen and static alternatives. Node tests passed; Pages 45686886086 passed. T04 foundation gate verified. T05 replaces diagnostic blocks with 19 explicitly dimensioned solids plus continuous floor (230 triangles); real 6×7.2 outer portal, 4.8×6 clear aperture, 2-unit cut, recessed wing walls, overhead plane, offset fin, 4-unit throat and partial bone-white gallery with open far exit. Face colours identify inward surfaces and depth only; no emission, reflection, lighting, scroll motion, final typography or final full-viewport layout. Static SVG updated to match the architectural study. Camera samples T02 desktop/tablet/phone targets blended continuously by actual study surface aspect; final framing remains T08/T11. Pure tests verify clear aisle and projected outer corners; dedicated browser suite retains lifecycle/recovery checks, requires visible red and ivory pixels, captures exact revision. T05 rendered verification and visual inspection pending, no artistic acceptance claim. T06 only after gate. No shared runtime, gallery or configurator change.

## T06 — Graphite ground and bounded planar reflection
T05 exact revision 98e0a97e63cdb78c1050925c33031c42933341af: browser run 45687139012, Pages 45687138586, all six Node tests passed. Downloaded artifact 15056043725 and inspected all seven actual study captures: clear recessed red throat, ivory far reveal, continuous floor and no unexpected clipping of opening; desktop and tablet are still in-flow diagnostic aspect, not final compositions. T05 verified. T06 preserves 19 solids and existing camera geometry. Added reflection.js with a single RGBA8 texture/depth16 framebuffer within the same context, maximum half main dimensions / 375k pixels / 1024 edge / hardware limits. Reflect actual world vertices across Y=0 using the same VP (exclude floor), draw direct architecture with depth, then composite only visible floor fragments with a nine-tap distance-scaled roughness kernel and grazing-angle response. Artistic graphite color mix, not a calibrated BRDF. No glow/lighting, animation or layout changes. Reuse targets until size changes; abandon all handles on context loss, recreate during recovery. Diagnostic ?reflection=off uses same geometry/camera and matte floor for screenshot comparison. Pure tests validate mirror/floor intersection and target bounds; browser checks compare reflected vs matte pixels at 390 and 1440, bound framebuffer and retain recovery/previous checks. T06 exact results and actual capture review pending; T07 held. No gallery/shared dependency changes.
