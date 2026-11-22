# Boomer Automation showroom — manual release acceptance

**Branch:** `feature/component-showroom`  
**Status:** **NOT APPROVED** · 22 November 2026  
**Scope:** 24 original full website templates; 157 review-only components; 44 independent mobile alternatives and 20 integrated animation patterns.

## Automated evidence, separate from human approval

- Focused keyboard test: **78/78** on all 24 templates at [GitHub Actions 45077876064](https://github.com/StefanSaladino/website-templates/actions/runs/45077876064). Its scope is skip links, navigation focus, dialogs, mock form feedback and selected interactions.
- Offline static reference check: 24/24 template HTML pages were preflighted with no duplicate IDs, missing main landmark or skip destination, invalid static ARIA references, broken label targets or fragment URLs. **An independent `npm run check` gate now enforces this.**
- Tagged MENU-04 PDF: one-page text extraction/render QA passed, but no PDF/UA certification.
- Full interactive gallery and Chromium review runs on **the final release SHA** are separately required and should not be inferred from older passes.

## Human and device acceptance — all items still pending

Record reviewer initials, device/OS/browser version, date, exact commit and pass/fail evidence. Do not check off by assuming a browser automation pass covers assistive technology.

| Review | Exact acceptance action | Status |
|---|---|---|
| iPhone Safari / VoiceOver | At 320 and 390 CSS px, swipe through the skip link, hero headings, menus, and conversion controls; open and close drawers, activate anchors, check announcements and restored focus | **Not tested** |
| Android Chrome / TalkBack | Repeat phone keyboard and touch flows; check gesture and focus order, drag alternatives, form labels and live-region feedback | **Not tested** |
| Windows NVDA / Chrome and Firefox | Traverse landmarks/headings, role/name/state for menus, native lightbox, form errors, mobile switch at browser zoom, and interactive showcase controls | **Not tested** |
| macOS Safari / VoiceOver | Repeat with keyboard only and full keyboard access enabled, checking native dialog Escape and dismiss focus | **Not tested** |
| Zoom and text spacing | Reflow at 200%/400%; increased font and spacing; inspect truncated text, lost controls and fixed-position overlays | **Not tested** |
| Responsive visuals | Verify actual **320, 390, 768, 1280 and 1440px** screenshots for all 24 full templates; screenshot with images loaded and any failed-image fallback separately | **Not signed off** |
| Interaction targets | Use real touch to check menu/button hitboxes, forms, swatches, carousel/rail controls and links close to viewport edges | **Not tested** |
| Reduced motion | Test each of 20 integrated animation patterns under `prefers-reduced-motion: reduce`; essential content remains readable and no autoplay/nonconsensual 4K video | **Not approved** |
| Component mobile alternatives | Inspect **all 44 independent layout alternatives**, verify correct style selection, names, touch/keyboard navigation and responsive overflow | **Not signed off** |
| Visual contrast | Measure text and focus cues over **actual loaded photographs**, overlays, light/dark variants, states and disabled controls; remediate deficits | **Not approved** |
| Sample documents | Open the MENU-04 tagged PDF and HTML version in a real screen reader, check headings/reading order and independent PDF accessibility; update metadata if necessary | **Not certified** |
| Real-world claims | Ensure fictional dates, service locations, staff, pricing, booking and signup controls never imply real availability or a completed transaction | **Not signed off** |

## Media provenance and rights — release blocker

Track each exact image/poster and video by source URL, creator, license terms and suitability for redistribution in a publicly shared template. A screenshot or successful remote image response does **not** authorize reuse. No media licenses have been marked approved. The retired barefoot-saw stock image must remain excluded from active media; original joinery illustrations replaced it, but all surviving third-party assets still require rights approval. **OFFCUT's opt-in 4K video remains unapproved** until source/license, footage content, duration, bitrate, device download cost, and fallback performance have been independently assessed. Do not flip the consent gate or autoplay flags for convenience.

## Per-template log

The following design families are included in the 78-case **automated** milestone, not in a manual acceptance result:

- App launch / Tide; architecture / MORROW; contractor / LINE + LEVEL; creative agency / OFFCUT; custom bakes / DOT + CRUMB; dark tech / KERN; editorial commerce / RANGE/FOUND; event launch / AFTER DARK.
- Fitness launch / YARD; frame portfolio / FRAME; garage detailing / GARAGE; interactive playground / WOBBLEWORKS; landscaping / BED & BORDER; law firm / NORTHLINE LAW; monolith architecture / MONOLITH; Muskoka retreat / Morrow House.
- Pools / TIDEFORM; quiet SaaS / Arc; real estate / CURRENT; restaurant / SERA; storefront / MORA; tattoo studio / BLACKLINE SOCIAL CLUB; waitlist / STILL; woodworker / GRAIN & GABLE.

Record failed screens, reproduction steps, accessibility tree/contrast observations, and fixes against each template family separately. Do not mark a family accepted on the strength of a different family's tests.

## Publication decision

No branch merge, `live` metadata promotion, rights approval, commercial form connection or removal of sample disclaimers happens automatically. Require the **final SHA** to pass all CI, manual accessible-device/visual checks, media rights review and named stakeholder approval. **Step 19 of the project roadmap stays open** until then.


## Loaded-image capture expansion — 22 November 2026

The existing opt-in/triggered still-media workflow used pre-replacement expectations (7 editorial-commerce and 5 Muskoka images) and incorrectly identified local illustrations as “remote” because browser URLs start with `http://127.0.0.1`. The capture script now distinguishes **actual third-party Unsplash/Pexels stills** from **local original illustrations**, and checks both decoded sources. It runs three independent evidence batches: baseline (OFFCUT poster, RANGE/FOUND, Morrow House), portfolio (GRAIN & GABLE, GARAGE, FRAME), and services (SERA, CURRENT, DOT + CRUMB), each at **320/390/768/1440px**.

For each rendered image the evidence ledger retains dimensions, `object-fit`, `object-position` and an estimated fraction of the original frame visible with `object-fit: cover`. Images with under 40% source area visible are **flagged for human crop review**, not automatically rejected. Screenshots remain downloadable for inspection only, and the browser blocks any attempt to request OFFCUT's 4K movie. A decoded photo is **not proof of color contrast, subject-safe crop, or license**. The workflow should be considered a technical evidence batch, with every run's result checked before acceptance.


## Offline image-review batch synchronization gate

`components/data/loaded-media-review-batches.json` now holds the three still-image evidence batches and their screenshot sections. Before `npm run build`, `check-loaded-media-batches.mjs` verifies that each of nine unique template pages exists, its actual `<img>` third-party source count matches the configured expectation, the required sections exist and OFFCUT still has its video-poster declaration. This **offline check cannot establish that a CDN returns a usable photo**, that a photograph is appropriately cropped or that any rights are cleared. Its purpose is preventing stale capture scripts after image-source replacements.

**Source synchronization note:** The browser validates each rendered third-party `<img>` placement, including repeated appearances of one underlying Unsplash identity. This is different from counting normalized media IDs (TM-###), so batch counts must use HTML image elements. Empty inactive dialog images are excluded from initial decode rather than treated as failed photos.

## Full-template touch geometry evidence (new screening, not signoff)

The `components/scripts/audit-template-touch-geometry.mjs` browser pass opens **all 24 full templates** at 320/390/768/1280px (96 responsive cases), records `a`/`button`/form-target dimensions, flags activators under 24×24 CSS px, potential heading clipping and document overflow, and captures **24 real 390px viewport screenshots**. It blocks all third-party media and OFFCUT video requests, so this is a source/layout test rather than loaded-photo crop review. Unusually small targets (including WCAG inline-text spacing exceptions) are listed as **manual-review candidates** rather than automatically classified as accessibility failures. Real-device touch, loaded imagery, human contrast checks and screen-reader tests remain unapproved. The results are in `components/touch-geometry-evidence/results.json` and an optional GitHub Actions artifact.


## Responsive overflow corrections following touch audit

The initial 96-viewport geometry batch reported page-wide overflow in YARD at **320/390/1280px** and in KERN at **768px**. The YARD adjustment reduces overly large mobile display type and uses a genuine `minmax(0,1fr)` single-column grid, rather than merely applying `overflow:hidden`. It also narrows the large, intentionally unbroken trial heading at mid-width desktops. KERN moves its decorative plan index inside the tablet grid. The audit now includes **1440px** as a fifth viewport and records intrinsic-scroll offenders when a CSS element's box is inside the viewport but its content is not. These are **implementation changes pending fresh geometry evidence**; do not mark them visually accepted solely because a style rule was added.


**Follow-up desktop overflow fix:** The 120-viewport audit confirmed the first YARD mobile and KERN tablet changes removed those overflows, but YARD's 1280/1440px `.image-band` and method headings still exceeded the intrinsic grid widths. The desktop image/copy split has been rebalanced, with a one-column crossover at 901–1000px and responsive type sizing inside the copy/method columns. A new **hard regression gate** now rejects page-wide overflow in YARD and KERN at each of the five audited widths. Acceptance depends on the next passing run rather than this source edit.
