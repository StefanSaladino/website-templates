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

## Verified responsive geometry and loaded stills — 22 November 2026

**Targeted responsive geometry:** [run 45080948999](https://github.com/StefanSaladino/website-templates/actions/runs/45080948999) passed **120/120 browser viewport cases** across 24 full templates at 320, 390, 768, 1280, and 1440px. It produced 24 first-viewport captures and **105 manual-review flag entries**, principally possible small hitboxes and related display checks. These flags include repeated viewport instances and inline-text exceptions; they are **not 105 verified WCAG defects**. The initial YARD overflow at 320/390/1280/1440 and KERN overflow at 768 were traced to specific grid content/decorative positioning and corrected. A hard regression now checks both designs at all five widths; the latest run recorded **no page-wide overflow in either design**.

**Loaded-photo browser evidence:** [run 45080095721](https://github.com/StefanSaladino/website-templates/actions/runs/45080095721) passed **36/36 cases**, with **104 loaded-image screenshots** over nine high-priority original templates at 320/390/768/1440. The three evidence ZIPs contain the actual decoded-photo captures and JSON ledger. There were **14 crop-review flags counted across image/viewport occurrences** (11 baseline, two portfolio, one services) and zero hard errors. A photo can pass decode with poor framing or unsupported rights, so crop/contrast and exact attribution remain human gates.

The dedicated [78-case keyboard check at the latest implementation commit](https://github.com/StefanSaladino/website-templates/actions/runs/45080948995) and [Pages build](https://github.com/StefanSaladino/website-templates/actions/runs/45080948277) also passed. The broad showroom Chromium and design-review workflows have separate outcomes and must not be inferred from these narrower passes. No stock-media item is rights-approved; no source template has production acceptance.

## Expanded image-dependent template coverage — 22 November 2026

The loaded-media test inventory now enumerates **all 19 original templates with external image or film identities**. This expands from 9 templates / 3 screenshot batches to 19 templates / 7 batches, adding architecture, contractor, law firm, event launch, fitness launch, tattoo studio, MONOLITH, landscaping, pools and storefront. Each added template has exact source `<img>` placement counts and three real page screenshot regions. The existing OFFCUT poster remains checked without activating its 4K movie. The offline manifest gate now rejects missing/duplicated template entries, stale source counts and nonexistent screenshot sections across all 19.

The loaded-media runner now prints **each specific crop candidate** (template, width, image alt, DOM context, cover-visible fraction, object position and screenshot prefix). The touch geometry runner also groups repeated small-target flags across viewport widths and includes a hard check for undersized MORA colour swatches.

**Evidence status:** configuration and regression gates updated on the review branch; **the seven new remote-media jobs, actual crops and responsive appearance still require successful GitHub Actions runs and human inspection**. A pass means decoded images and screenshots, not that crops are aesthetically acceptable, source identities are truthful, legal rights are cleared, or assistive-technology/real-device testing passed. Keep every component `in-review`, and Step 19 open.

## MORA brand-integrity fix and 18-template photo scope (22 November 2026)

The expanded seven-batch image-review suite initially covered 19 third-party-media templates. MORA subsequently retired its **three** brand-mismatched external photos in favour of original labelled illustrations, so the active source inventory is now **62 original-template remote media identities across 18 remaining third-party-media templates** (including the unapproved OFFCUT film). The offline batch synchronizer now expects 18. The original three-product stock entries TM-034/TM-038/TM-067 must never be re-added.

The initial 19-template image-capture run is historical evidence; after this replacement the seven-batch suite and full showroom/browser checks need a fresh successful result on the final SHA. This change removes three attribution risks but does **not** clear remaining photo rights, approve the new visual design, verify assistive technologies, or close release Step 19.

## Tablet touch-only storefront correction — 22 November 2026

A direct Chromium render of the new MORA artwork and interactive controls at 320/390/768/1440px found no root horizontal overflow or script error. The 32px swatch hitboxes rendered at all four widths and the original illustrated hero read clearly in desktop and phone capture. These are controlled-browser checks, **not** stakeholder or physical-device visual approval. A separate 768px touch-pointer emulation exposed MORA's hover-only product Quick add overlay: its transform hid controls on hoverless tablets. The source now reveals Quick add by default for `(hover:none)`, and a dedicated Chromium regression verifies a tablet can see and use the control. Final browser CI on the updated SHA and native iOS/Android interaction remain separate outstanding gates.

## Observed image-layout remediation — follow-up after the 19-template evidence pass

Review of the rendered captures from the expanded [seven-batch image run](https://github.com/StefanSaladino/website-templates/actions/runs/45082643331) separated automatic object-fit candidate flags from demonstrable defects. In MORROW, the **320px** screenshot showed the fictional-architecture disclosure visually colliding with the small hero index; the narrow-width overlay spacing was corrected. In GRAIN & GABLE, the **1440px** screenshot showed too little of the portrait planter to communicate its subject; the desktop study figure is now taller. The loaded-media runner includes targeted layout assertions for those exact cases. Screenshots and fresh CI on the correcting SHA are required before claiming the issues resolved.

An under-40% source-visible-area reading alone is **not** a failure: the editorial-commerce hiker, YARD weightlifter, AFTER DARK concert and TIDEFORM pool hero use deliberate vertical/wide crops. These remain subject to loaded-text-contrast, mobile subject-framing, media rights and human signoff. Do not automatically approve other flags or substitute these two fixes for the full screenshot matrix.

## Footer touch-target remediation and whole-site overflow regression — 22 November 2026

A local, CSS-inlined Chromium geometry probe confirmed **BED & BORDER** had undersized source-credit and return-link hitboxes: the Hero/Patio/Stone wall links and `Back to templates` were only 10px high, with 6px separating the next row. Original HTML, CSS and breakpoints were used; the probe excluded remote images and scripts, so it is layout evidence only. New footer styling provides 32px-high source-credit hitboxes and a 40px-high return-link hitbox without introducing root overflow at 320, 390, 768 or 1440px in that local probe.

The full-template browser geometry suite now **hard-fails page-wide horizontal overflow for every one of 24 original designs** at each 320/390/768/1280/1440 CSS-pixel width, rather than only YARD and KERN. It explicitly checks BED & BORDER footer links alongside the earlier swatch/booking/action controls and excludes disabled inputs from potential touch warnings. Existing small-target counts and CSS-inline probes do **not** equal real-device, screen-reader or WCAG acceptance. Re-run the 120-case workflow on the updated branch SHA and inspect its evidence before signoff.
