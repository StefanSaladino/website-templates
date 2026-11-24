# SHIFT / the moving card — flagship template roadmap

Status: **P1–P6 verified; P7 registered as review preview, integration QA pending.** One additional complete, single-page website. Target catalogue total: 35, after all acceptance gates. Working slug: `shift-card`. Fictional payment-card brand; no actual financial service or application processing.

## 1. Reference and creative thesis

Reference: stakeholder's uploaded screen recording, 24 November 2026, approximately 32 seconds. Opening and closing examples show a vivid violet rectangular product changing orientation in front of oversized typography on a pale background. Near the end, a payment-card landing-page example shows a central upright object in a violet-lit spatial composition, strong left-aligned headline and small supporting copy. Other shots show blue atmospheric art and green-on-dark editorial sites. The recording does not establish how any particular scene was implemented or whether it was genuinely rendered in 3D. Do not reuse the original brands, footage, designs, source code or third-party assets.

Our interpretation: **one physical card moving through a continuous editorial composition, with typography and light choreographed around its motion.** Unlike PRISM's mechanical exploration, SHIFT is a brand launch, where every camera change supports a short proposition. No separate boxed product viewer or generic bank dashboard.

## 2. Art direction

- Original fictional name SHIFT, original geometric wordmark. Oversized condensed or tightly set sans-serif display type; readable secondary type. Use locally available system fonts or properly licensed local fonts; never require a remote font service.
- Ink-black text and warm chalk canvas (#F0EFEA), intense ultramarine material (#302CC9), controlled acid-yellow detail (#D8F54B), deep ink (#15151C). A dark stage appears only in the material chapter. Exact values subject to contrast and visual review.
- Real-time procedural rounded rectangular card with thickness, bevel, metallic edge, satin face, small geometric chip, original abstract marking and fictional brand lettering. No usable card number, payment-network trademark, claim of certification or imitation of an existing card brand.
- Use actual perspective, occlusion, cast/contact-shadow approximation and physically inspired highlights, not a floating flat rectangle with a CSS drop shadow. No random glow, glass UI, stock financial icons, decorative statistics, fake rates or card-wall sections.
- Treat typography as part of the stage: large DOM text behind the card, selected foreground captions outside its silhouette, explicit front/back layering. The readable HTML heading remains available even if visual duplicates are aria-hidden.

## 3. Page storyboard and motion contract

| Beat | Scroll range | Composition and purposeful action |
|---|---|---|
| 01 / Introduction | 0–18% | Chalk full-viewport stage, large “Move on your terms.” behind angled card. Card enters from controlled tilt, settles into recognizable front view. Header and one primary action are readable immediately. |
| 02 / The object | 18–40% | Card grows toward camera and rotates to expose its edge and chip; typography slides into an editorial margin. Short captions describe the fictional design, not invented product performance. |
| 03 / The finish | 40–62% | Stage transitions from chalk to deep ink. Grazing light travels over satin/metal surfaces as camera moves to a close three-quarter view. One compact material or finish control genuinely changes the model. |
| 04 / Everyday use | 62–82% | Return to pale editorial space; card moves aside to reveal a simple typographic sequence about viewing activity, organizing spending and keeping control (fictional feature copy, no fabricated metrics). Card turns back toward front, not an arbitrary explosion. |
| 05 / Final reveal | 82–100% | Card settles upright in a strong, centered composition; restrained end title and “Explore this concept” or “Get in touch” action, clearly demo-only. End with compact footer and asset/demo notice. |

Percentages are normalized across the native scroll narrative, not forced viewport jumps. Set explicit keyframes for position, quaternion rotation, camera distance, focal point, light direction, stage colour and text visibility. Interpolate reversibly from actual scroll position with bounded smoothing, jump directly on reduced motion and respect chapter links. No scroll-jacking, automatic audio or mandatory loading gate. Use scene transitions, not five disconnected hero sections. The final CTA is a real local demonstration action (e.g. opens a clear sample enquiry panel that does not transmit data); no real card application.

## 4. Implementation architecture

```
templates/shift-card/
  index.html             semantic copy, navigation, chapters, controls, fallback
  styles.css             responsive typography, stage layering, focus and still mode
  script.js              lifecycle, scroll timeline, chapter state, control wiring
  scene.js               local WebGL renderer, mesh/shader/material and resource lifecycle
  thumbnail.svg          original gallery art
  fallback.svg           original matching static artwork
  favicon.svg
  ASSET-PROVENANCE.md    code/art origins, licence notes, fictional-brand disclosure
```

Reuse verified patterns from PRISM, FULCRUM and ABYSS where sensible, not their exact composition. Prefer the existing native WebGL / static HTML-CSS-JS stack, no framework or CDN dependency. Keep code split by responsibility. Choose WebGL implementation based on existing project conventions; only adopt a pinned locally bundled library if justified and documented. No pre-rendered video masquerading as interactive 3D.

### Scene
- Parametric bevelled card mesh; correct normals and UV mapping, face/edge materials and front/back artwork.
- Procedural texture or locally generated vector texture for chip and lettering; avoid aliasing and unreadable micro-detail.
- Original vertex/fragment shaders with directional key, fill and rim light, roughness/specular response and a bounded shadow approximation. Clearly illustrative, not ray-traced unless actually implemented.
- Perspective projection and camera framing computed from card bounds and safe text regions at each viewport. Reserve deliberate occlusion only for nonessential display-type duplicates.
- Deterministic timeline state with easing and explicit boundaries. User finish selection stays independent of scrolling; motion toggle and chapter controls have keyboard-accessible equivalents.
- Render only while visible/dirty or converging toward target; pause on visibility loss; cap pixel ratio and canvas resolution; handle resize, failed GPU initialization and context loss; dispose listeners/resources.

### Responsive alternative
Desktop: full-bleed persistent scene with large layered text; mobile: art-directed portrait camera, shorter chapter distances, protected headline/CTA regions, no clipped controls or desktop squeeze. Preserve native touch scrolling. Tablet and landscape mobile are explicit layouts. Use a static chapter sequence with original fallback image for no WebGL/no JS/reduced motion or constrained graphics; all narrative content and CTA stay available.

## 5. Phased execution checklist

- [ ] **P1 — Storyboard + composition prototype.** Build five static HTML chapter compositions, actual desktop and mobile screen captures, typography, palette and layout before shader work. Approve the opening still and visual rhythm; don't advance a generic layout.
- [ ] **P2 — Standalone original product scene.** Create recognizably physical rounded card and artwork, camera, material response and correct aspect; verify front/back/edge and highlight tests. Capture desktop and mobile stills. No catalogue registration yet.
- [ ] **P3 — Continuous scroll sequence.** Integrate renderer behind/among chapter text, keyframes, reverse scrolling, chapter links and responsive camera. Verify real pixel/pose changes, not only data attributes.
- [ ] **P4 — Functional controls + finish.** Wire finish choices, pause/still, reset or chapter navigation and local demo CTA; refine lighting, occlusion, typography, layout transitions. Keep the scene connected and cohesive.
- [ ] **P5 — Fallback, performance and accessibility.** Implement static/reduced-motion/no-GPU/no-JS experiences, focus and touch, resource cleanup, resize and context recovery. Audit budgets.
- [ ] **P6 — Full visual and browser review.** Capture actual first/mid/end frames at 320, 390, 768, 1440 and wide desktop, plus portrait/landscape and long scrolling. Inspect screenshots rather than counting tests alone; revise the visual direction against reference principles. Test Safari/iOS and Android device behavior where accessible; explicitly mark unavailable device coverage.
- [ ] **P7 — Catalogue integration.** Add thumbnail, metadata, purpose/preset registration, main gallery entry, full-site reference and appropriate immersive flags, provenance and specialist CI test specification using repository conventions. Confirm template opens in normal and expanded builder previews; preserve all existing 34 templates and page presets. Template brand recolouring must distinguish interface colours from original card artwork; only expose supported product material controls. Run existing configurator/QA suites and new specialist tests.
- [ ] **P8 — Reusable technique extraction (after approved complete site).** Document/offer the demonstrated native-scroll object choreography, layered headline reveal, material finish selector and static alternative as candidate reusable components. No speculative new component IDs or fake previews. Require independent source specimens and actual mobile behavior before adding to the selectable library.

## 6. Acceptance and release gates

- One unmistakable product narrative; compare at least five chapter stills and continuous forward/reverse motion. Product, typography and lighting must look designed together; no boxed scene or repetitive grids. Manual stakeholder visual acceptance remains separate.
- True scene changes: actual visible pixel differences plus expected orientation/material state after scroll, chapter jumps, finish, pause, reverse and resize. Check geometry bounds and valid transforms (no NaN, clipping or detached parts).
- No scroll capture or forced interaction. Keyboard/touch controls, visible focus, meaningful labels, functional local CTA, sensible headings/landmarks, contrast and 200% text zoom. WCAG 2.2 AA target, including reduced-motion alternative; no automated-only compliance claim.
- Performance targets: <=300 KB added compressed JS, <=2 MB initial transfer, no required external runtime/imagery, <=2 DPR, <=~2.5M drawing-buffer pixels on constrained devices. Measure actual transfer/scene resources and frame time; aim 60fps desktop and >=30fps representative mobile, not guaranteed. Offscreen/hidden scene should not run perpetual animation. No mandatory splash screen. Verify local static-host deployment under GitHub Pages subpath.
- Fail safely: no GPU, context loss, JavaScript disabled, reduced motion, rapid scrolling and viewport changes. Text and CTA remain accessible; no blank scene or stale UI.
- Run specialist immersive, baseline, gallery, keyboard, reflow, touch, reduced-motion and configurator checks against exact head. Do not claim physical device or visual approval from CI alone. Record failures, evidence and remaining limitations in this roadmap.
- Preserve the existing design contract, media-review gates, main branch and 34-site catalogue until registration. No new external media necessary. No main merge or production release without authorization.

## Original implementation starting point (historical)

P1: establish the chalk-stage opening and deep-ink material chapter as actual responsive HTML compositions, with an original card silhouette placeholder only for the storyboard. Review the static compositions before advancing to the real-time mesh. This is a roadmap commit only; no template source, published catalogue entry or completed visual design yet.

## Checkpoints
- 2026-11-24: video reference inspected; direction selected; implementation roadmap written. Prior configurator hotfix 9c77176 passed all three GitHub workflows. SHIFT planned only.

### SHIFT P1 source checkpoint
Five responsive static editorial chapter compositions and original local SVG card artwork implemented in `templates/_drafts/shift-card/`. Deliberately outside discovered catalogue; no WebGL, motion engine or finish selector claim. Native chapter links and final local disclosure work without JS. Dedicated browser review workflow captures 30 chapter screenshots at six portrait/desktop/landscape viewports, checks decoded artwork, document overflow and no external requests. P1 visual review pending; next P2 only after actual visual inspection. 34 registered templates remain unchanged; no main merge.

### P1 evidence and P2 model checkpoint
Storyboard workflow 45384079163 passed all 30 chapter screenshots across six viewport configurations. Downloaded evidence and inspected all five desktop (1440) and mobile (390) chapters: desktop hero/final oversized artwork masked too much text; mobile object heading lost whitespace. Reduced/offset hero and final art, protected headline layout, fixed mobile heading, and removed decorative arrow characters. P2 standalone model at `templates/_drafts/shift-card/model.html`: closed procedural rounded card mesh with bevel and edge, generated front/back artwork, native WebGL directional/specular studio lighting, explicit views, rotation and light controls, demand-driven drawing and static fallback. Scene is not yet connected to scroll; next P2 actual render QA and P3 integration. Dedicated geometry and pixel-difference browser checks added, evidence pending. No catalogue registration or main merge.

### P2 evidence and P3 scroll integration
Workflow 45384518250: all 30 static chapter captures and all 20 WebGL view/light captures at 320/390/768/1440 produced; inspected desktop/mobile front, three-quarter, edge, back and altered-light images. Geometry report 1,632 vertices, genuine perspective and distinct rear art. Overall job failed only on Playwright `isDisabled()` for fieldset itself; now assert fieldset DOM disabled property and actual descendant button/range states. Enlarged standalone framing and added power-of-two mipmapped textures to reduce line aliasing. Implemented full-page single fixed transparent canvas, deterministic native scroll pose/light/scale/camera interpolation, desktop editorial positioning and mobile clipped art-region layout; foreground copy stays above canvas. Still view, reduced-motion, context-loss and no-JS static SVG fallbacks, on-demand frames and DPR/pixel budget. Added full-page scroll visual tests at four viewports, visible pixel comparisons, reverse pose, no perpetual RAF, still and reduced motion. P3 source implemented, current revision browser/visual verification pending; P4 material selection and cinematic polish next only after evidence. Catalogue still 34; no main merge.

### P3 verification and P4 material/visual polish
SHIFT workflow 45384932411 passed storyboard (30 captures), standalone model (20 captures), and full scroll sequence (24 chapter/reverse captures at four widths), including visible pixel differences, identical reverse pose, idle frame count, and static alternatives. Downloaded and inspected actual desktop/mobile sequence; opening text was still obscured and dark product close-up overly cropped. Rebalanced opening and ending typography/card position, reduced object and material framing, added light sweep that follows the key light plus chapter-dependent studio ambience. Three real finish choices (Ultramarine, Graphite, Frost) now update both original texture faces and shader roughness, specular, strip and edge parameters; matching original SVG stills also update, preserving choice across scrolling. Integrated keyboard/touch-friendly controls and mobile placement after product art; no GPU or external assets needed for static choice. P4 source implemented; material screenshots, contrast and device QA pending. P5 performance/accessibility and broader lifecycle checks next. 34 registered templates remain, no main merge.

### P4 verification and P5 performance/accessibility checkpoint
Workflow 45385361122 passed storyboard, standalone model, journey, all material pixel changes and static finish alternatives. Inspected actual five desktop chapter frames and desktop/mobile Ultramarine, Graphite and Frost captures; headline and composition improved, material chapter remains intentionally cropped. P5 bounds desktop/compact drawing buffers (2.5M/1.25M pixels), avoids repeated identical frame submissions, keeps original art until the first successful draw, handles draw failures and genuine context loss/restoration, preserves material during still/reduced-motion/unavailable-graphics paths, adds stable-label accessible motion controls at material chapter and footer, live status and focus/forced-colour rules. New specialist budget/lifecycle suite covers five viewport/DPR combinations, transfer and gzip targets, keyboard activation, text-spacing/reflow and no-GPU behavior. CPU submission timing is not GPU frame rate. Current revision test execution, device/Safari QA and manual accessibility/visual acceptance pending. P6 final polish next; catalogue remains 34. No main merge.

### P5 verification and P6 visual refinement
SHIFT workflow 45385995315 passed all four specialist suites, including actual WebGL context loss/restoration, five viewport/DPR cases, keyboard, text spacing, static/reduced-motion/graphics-disabled alternatives. Initial transfer 48,477 bytes and gzip JS 7,753 bytes (prior revision); buffer maxima within limits. Inspected five desktop and five mobile chapter captures: readable but opening too much like a split hero, portrait tablet requires dedicated layout, and composition needs more deliberate transitions. Added original giant outlined SHIFT wordmark behind opening/final card and restrained finish chapter art, rebalanced opening camera and typography, authored four intermediate camera/light/scale poses with exact chapter endpoints and deterministic reversible interpolation, portrait tablet art-region layout, and desktop chapter index with current chapter indication. Extended browser sequence QA to wide desktop, landscape and intermediate captures; exact endpoint and midpoint numeric assertions. Current revision source implemented, actual new captures and broader QA pending before P7. No catalogue registration, main merge, physical-device or manual acceptance claim.

### P6 verified; P7 catalogue registration (review only)
Workflow 45386440340 passed all four SHIFT suites including six viewports, wide intermediate poses, keyboard, materials, lifecycle and fallback. Reviewed 25 actual chapter/bridge screenshots (1440/1920/768/390/844); opening and final tablet titles overlapped the card, landscape card neared mast, so P7 reserves distinct in-flow tablet art areas and clips the live layer to the story boundary. P6 transfer 54,076 bytes, gzip JS 8,231 bytes. Move draft to `templates/shift-card/` with corrected gallery return link, original thumbnail and gallery Preview card, catalogue total 35; register ready-made configurator option in product recommendation list after existing first four, preserve prior presets. Dedicated immersive manifest entry enforces all four specialist suites (generic suite excludes only this explicitly dedicated entry, since SHIFT deliberately uses SVG under reduced motion). Added browser coverage for selecting SHIFT, original/custom colours, expanded phone preview, material interaction and return. Preserve original product artwork and swatch colours. Source registered, current-SHA tests/deployment and manual/Safari/device acceptance pending. No main merge. P8 next only after integration verification.
