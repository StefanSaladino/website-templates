# Bounded product campaign architecture — reuse contract

Status: **candidate architecture; do not interpret as SHIFT release approval**. Based on review branch runtime at 121a87f. Recovery acceptance remains governed by SHIFT-VISUAL-RECOVERY-ROADMAP.md. No catalogue registration or next flagship implementation until the remaining recovery gates are met.

## 1. What the design is

One authored product composition, not a sticky product viewer above independent content. The campaign begins in normal flow, temporarily pins one stage containing product, editorial typography, real copy, and controls, then releases into normal editorial content. Product coordinates, camera, lighting, scale, shadow, decorative typography and colour all derive from the same continuous presentation progress. Native scroll remains the only scroll authority. Reverse motion must retrace the same positions, without chapter-index changes, product handoffs, scroll interception or hard coordinate thresholds.

## 2. Module boundaries

| Source | Reuse decision | Required adaptation |
|---|---|---|
| templates/shift-card/motion-clock.js | Pure progress follower, reusable | Validate tau, exact endpoint, lag and rapid reversals for the next design; no independent animation clock for other layers |
| templates/shift-card/campaign-track.js | Shape-preserving interpolation and colour contrast helpers reusable as algorithms | Replace authored keyframes, copy, typography, poses and palette endpoints; never copy card-specific camera paths into a different object |
| templates/shift-card/projection.js | Exact mesh projection and fit approach reusable | Current unique vertex set, dimensions and rotation convention are card-specific; parameterize the geometry before general extraction |
| templates/shift-card/studio-scene.js | WebGL resource lifetime, pixel budgets, draw lifecycle and comparison methodology reusable | Mesh, UVs, textures, materials, shader and culling safety are card-specific. New geometry needs its own winding/visibility and equal-density pixel validation |
| templates/shift-card/live.js | Reference controller for bounded stage, resize anchoring, one clock, visibility, preference handling, quality restoration and native palette | Current selectors, scroll travel, safe area, finish controls, palette contract and metadata are specific to SHIFT. Do not load unchanged on unrelated markup |
| templates/shift-card/live.css | Reference for layout reservations, stage clipping, transformed shadow, static alternative | Re-author composition for new object and breakpoints; do not stack an opaque sticky viewer over separate sections |
| ANIM-21 | Real shared SHIFT live campaign specimen | Reference original interaction; do not claim a universal drop-in animation for arbitrary builder sections |
| ANIM-22 | Independent material/light study using scene.js and shared materials | Keep its separate lifecycle and static fallback; not evidence that studio-scene.js changes have been applied to this renderer |

Do not introduce a generic abstraction before a second accepted campaign demonstrates common requirements. Prefer pure modules and small explicit product adapters; extract only proven common logic. Retain source-specific artwork and asset provenance.

## 3. Runtime contract

- Layout transaction: measure stage, actual readable content, art slot, scroll origin/travel and CSS viewport together. Use the actual mesh projection to fit the product inside the reserved slot. Changing width, height, zoom or preferences must preserve reading position without overriding a later scroll request.
- Presentation: one time-based progress follower and one animation frame scheduler. All visible layers derive from the same sampled progress; exact settle, no repeated layout reads inside paint, no offscreen or perpetual idle work.
- Rendering: original high-quality still state; motion buffer budget is separate from CSS geometry. SHIFT currently caps moving pixels at 130000 wide / 200000 compact, with original 2.5M / 1.25M maximum settled buffers, respectively. Restore full detail after 100ms quiet dwell. These are validated candidate SHIFT budgets, not universal quality requirements for all products.
- Quality: never reduce output resolution blindly to satisfy a test. Measure CPU submission separately from browser cadence and actual presented GPU frames. Back-face culling and uniform lighting math only where verified safe; grazing-angle fallback and full-quality renderer retain original appearance.
- Accessibility: no script/GPU, reduced motion, forced colours, manual still, short viewport, zoom, context loss and restoration must leave a meaningful readable original composition. Preserve focus, material selection and reading position; no scroll trap.
- Builder: source composition preview is not the same as an interactive ready-made page. For live native palette previews use explicit opt-in, validated colour inputs, contrast-safe continuous mapping, original product artwork, and original-colour reset. Do not freeze dynamic stage colours through blanket inline styling. Device switching, modal expansion, parent/child scroll and restore must work on actual built output.

## 4. Acceptance sequence for a new campaign

1. **Storyboard before engine:** original object and editorial concept; opening/intermediate/final desktop and compact compositions, reserve readable copy, no visual section walls. Obtain visual direction review before investing in a renderer.
2. **Continuous animatic:** sample forward and reverse, real lateral travel, rotation, scale, material reveal and stage release. Check full trajectory, not just keyframes. Reject jumps or object-only sticky overlay.
3. **Rendering pilot:** original assets, explicit geometry, one bounded art slot, no external runtime required. Compare captured actual pixels; ensure fallback is not a blank canvas.
4. **Motion and quality:** strict isolated software cadence test (p50/p95 <=34ms, <=5% >34ms, lag <=.12 for current SHIFT reference), raw traces, no idle draws, exact endpoints, abrupt reversals, high-DPR restore, same-pose visual equivalence, actual video evidence. Recorded and unrecorded runs serve distinct purposes. Repeat strict gate on separate runs; no threshold relaxation to mask failure. Actual physical GPU/phone and Safari review separate from software-runner results.
5. **Integration:** native full-site and component routes, gallery thumbnail, catalogue, builder device/modal/colour and original reset, no-script, keyboard, touch, reflow, reduced-motion and built Pages path. Animation references remain requirements, not a promise of automatic script composition.
6. **Release:** exact SHA evidence and stakeholder visual signoff, note cancellations and missing hardware checks. No main merge without explicit approval. Preserve previous approved mobile design unless a documented defect requires change.

## 5. Current release decision

49cb768 passed complete specialist suite 45432905923; 1a3c3bb reopened desktop cadence and live configurator integration. 121a87f corrects candidate resize race and paint overhead; its projection, accessibility, metadata/build/subpath and shared navigation checks passed at this checkpoint; final live/configurator/cadence results are still pending. Positive stakeholder mobile feedback is retained. Desktop physical GPU review, gallery loaded thumbnail completion and native preview acceptance are open. This document is preparation, not completion or authorization to start another flagship.

Next concept direction (planning only): use the original reference's editorial apparel/product storytelling as inspiration; choose a new original garment silhouette, distinct typography and material, and storyboard a continuous spatial reveal before writing a 3D renderer. No exact reference branding, assets or section copy. Start only once recovery is closed.


### Stakeholder-authorized SELVEDGE start
Exact 11 gallery captures promoted at 01756f4; Pages 45452212390 passed. Stakeholder explicitly deferred SHIFT desktop review and authorized the next site. This supersedes the previous sequencing hold only; SHIFT cadence, native configurator and physical review remain unresolved. SELVEDGE S1 is an unregistered review draft at `templates/_drafts/selvedge-outerwear/`, with original illustrated garment, continuous bounded-stage animatic and specialist checks. See `docs/SELVEDGE-OUTERWEAR-ROADMAP.md`. No production approval or main merge.
