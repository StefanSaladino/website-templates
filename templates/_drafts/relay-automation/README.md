# RELAY — Immersive Workflow Automation Website (Pass 2)

Self-contained experimental product showcase created exclusively inside `templates/_drafts/relay-automation/`. Designed as a scroll-driven, motion-choreographed digital product experience where the RELAY software workspace remains continuously mounted as a single 3D-transformed HTML/CSS interface across six connected scenes.

## Pass 2 Overhaul Highlights

- **Monumental Composition & Surface Hierarchy**: Richer charcoal-slate palette (`#121412`, `#1D211C`, `#282E26`, `#3F473C`, `#F2F4EE`, `#B8BEB5`) with staggered display typography in Scene `01`, architectural top-scrim framing during Scene `03` zoom-in, and deliberate warm off-white observability transformation (`#EFECE4`) in Scene `05`.
- **Synchronous Shared-Geometry Connectors (`workflow.js` + `connectors.js`)**: Eliminated CSS `transform` transition lag on `.wf-node` elements. `WorkflowController.renderGraphBlend(...)` computes exact `(x, y, scale)` pixel bounding boxes per frame and passes them synchronously into `ConnectorEngine.updateFromBoxes(...)` so cubic Bézier connectors and live data signals stay locked to ports across scroll scrubbing, topology morphs, and manual scenario transitions.
- **Five Coordinated Motion Sequences**:
  1. `01` — Monumental angled product bleed composition with responsive typographic parallax.
  2. `02` — Exploded 3D deconstruction of Navigation Sidebar, Workflow Canvas, Step Inspector, and Execution Activity layers connected via dynamic SVG architectural guides (`#exploded-guides`).
  3. `03` — Deep zoom (`1.34×` desktop / `1.30×` mobile) into the workflow canvas with camera panning across steps `01 → 06` as live execution advances.
  4. `04` — Deterministic progress-driven topology morphing (`inbound → onboarding → approval → operations`) plus manual scenario lock overrides.
  5. `05` — Warm off-white environmental shift revealing the mirrored 6-step execution timeline (`Run #4820` HTTP 429 rate-limit error & interactive recovery) before reassembling cleanly in `06`.
- **Accessibility & Mobile Portrait Choreography**: Inactive `.scene` chapters receive `inert` and `aria-hidden="true"` during active motion mode (cleared automatically under `prefers-reduced-motion: reduce`), `#mobile-drawer` implements full keyboard focus trapping (`Tab`/`Shift+Tab`, `Escape`, background `inert`, and focus restoration), and mobile viewports (`390×844`, `768×1024`, `320×568`) prioritize a large foreground product rig without dead vertical voids.

## Architecture

- `index.html` — Semantic markup with skip link, three-zone header, accessible mobile drawer, persistent `#relay-shell` workspace + `#exploded-guides`, six scene chapters (`01`–`06`), interactive sandbox dock, and restrained footer.
- `styles.css` — Design tokens, compositor-friendly CSS 3D transforms, Scene `03` readability scrim, responsive portrait choreography (`<= 1023px`, `700–1023px`, `<= 374px`), and reduced-motion / static no-JS grid layouts.
- `src/scenes.js` — Normalized scroll progress (`0.0`–`1.0`) keyframes, zoomed node-to-node pan targets, deterministic scenario morph schedule, overlapping visibility windows, and warm palette interpolation.
- `src/motion.js` — Native `requestAnimationFrame` scroll driver, `#exploded-guides` line synchronization, `inert`/`aria-hidden` management, offscreen/hidden ambient pause via `IntersectionObserver` and `visibilitychange`, and reduced-motion restoration.
- `src/workflow.js` — Shared interpolated graph renderer (`renderGraphBlend` / `transitionToScenario`), node configuration inspector, Scene `03` execution trace readout, and Scene `05` 6-step execution monitor with recoverable HTTP 429 retry.
- `src/connectors.js` — Synchronous SVG Bézier path & moving signal dot engine driven directly by computed node boxes.
- `src/main.js` — Entry point wiring anchor navigation, mobile drawer focus trap + scroll lock, scenario tabs, and interactive sandbox controls.

## Dependencies

- **Runtime JavaScript**: Zero external JavaScript libraries or frameworks (vanilla ES Modules, native DOM/SVG APIs).
- **Typography**: Progressive Google Fonts (`Plus Jakarta Sans` and `IBM Plex Mono`) with crisp local system sans and monospace fallback stacks.

## Verified Checks (Pass 2)

- Syntax verification (`node --check`) across all five files in `src/*.js` and HTTP `200` delivery check on `/templates/_drafts/relay-automation/`.
- Headless Chromium Playwright inspection across 14 normalized scroll stops (`0.00` to `1.00`) on `1440×900` plus multi-viewport checks on `390×844`, `768×1024`, `1024×768`, `1920×1080`, and `320×568` (zero console/page errors, zero horizontal overflow).
- Verified mid-morph SVG connector port alignment (`dyMid: 0`), forward/reverse scroll reversibility, Scene `04` scenario morphing, Scene `05` HTTP `429` retry updating Steps `05` and `06`, mobile drawer keyboard focus trap + restoration, `prefers-reduced-motion: reduce`, and `javaScriptEnabled: false` static fallback.

## Known Limitations & Potential Next Steps

- Workflow node drag-and-drop authoring is intentionally omitted (nodes are selectable for inspection and driven deterministically across scenarios).
- Header/hero typography loads from Google Fonts when online and falls back gracefully to system sans/monospace stacks offline.
- Gallery thumbnail capture and `components/data/builder-templates.json` registration remain omitted while isolated in `templates/_drafts/`.

## R2 — Independent creative direction and deterministic editorial motion

Imported only the exact RELAY folder from the second Gemini export dated 2026-11-25 10:31. R2 introduces the large RELAY brand plane behind the persistent workspace, one restrained progress-linked editorial signal route with separate portrait geometry, brighter interface surfaces, centered Adaptability product composition and a bottom-aligned Resolution composition. The editorial route is not a workflow connector; actual graph geometry remains owned by the existing connector engine. No extra dependencies or continuous animation loop were introduced.

R2 normalizes the existing copy windows to avoid near-blank handoffs and uses the dominant chapter for the interactive state and rail. The scene now resolves to inbound before showing its inbound monitoring log. The mobile execution zoom and pan have been reduced to preserve more of the active workflow. Palette interpolation uses luminance-aware foreground selection rather than blending light and dark ink through the same mid-gray. Versioned assets and an isolated noindex draft; gallery return link included.

Independent verification (offline Chromium using inlined CSS and equivalent data-URL ES module imports, with local fallback fonts because normal browser navigation was blocked): 14 sampled states, including a return to the opening, at each of 320x568, 390x844, 768x1024, 1024x768, 1440x900 and 1920x1080. 84 total states, zero page exceptions, zero horizontal document overflow, no active copy bounding rectangles outside the viewport, all six return rig transforms and editorial signal offsets matched opening, inbound title at .80 in all widths. Sampled dominant copy opacity >= .921; a dense source check separately covers all progress values. Syntax checks passed for five ES modules. Actual screenshots at 390 and 1440 were visually inspected. Not a physical-device FPS or deployed integration test.

Remaining: eliminate midpoint edge topology replacement, resolve manual execution/scroll ownership and selected inspector drift, audit monitoring history consistency, refine gray palette handoff and desktop/mobile component-level close-ups, measure actual connector port alignment and browser cadence, and test reduced-motion, sandbox and keyboard focus interactions independently. No gallery registration until stakeholder approval.
