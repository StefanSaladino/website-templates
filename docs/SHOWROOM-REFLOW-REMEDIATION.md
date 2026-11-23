# Original-template text spacing and narrow-reflow audit

_22 November 2026 · feature/component-showroom · automated CSS-width emulation, not native zoom or human acceptance_

## Scope

24 original full-page templates at CSS effective widths 320 and 640, each in baseline and text-spacing challenge mode = **96 browser cases**. Text spacing challenge: line height 1.5, paragraph gap 2em, letter spacing .12em and word spacing .16em. Remote photos/fonts intentionally blocked, OFFCUT film must not download. Screenshots of text-spacing mode produced at each width (48 expected).

## Initial failures, before this correction

The first [run 45092655902](https://github.com/StefanSaladino/website-templates/actions/runs/45092655902) failed as designed: **10 document-wide horizontal overflows across nine templates**. No clipped-heading warnings were reported by the narrow predicate, but overflowing content was found by detailed browser instrumentation.

| Template | Width and condition | Before measured CSS px | Cause / scoped fix |
| --- | --- | ---: | --- |
| contractor | 320 spaced | 337 | Mobile grid content used an intrinsic minimum; collapse to minmax(0,1fr) and allow hero-copy wrapping |
| creative-agency | 320 spaced | 398 | Oversized approach and section display typography under .12em letter spacing; narrow-only heading reductions |
| fitness-launch | 320 spaced | 365 | Oversized hero, statement and photo-side section typography; constrain min-width grid items and narrow-only type |
| frame-portfolio | 640 spaced | 652 | Long word in large opening title; reduce title sizing in 621–720px crossover |
| monolith-architecture | 320 spaced | 348 | Unbroken hero title; lower its <=360px display size |
| pools | 320 spaced | 428 | Project grid min-content expansion and long study heading; minmax(0,1fr), min-width:0 and narrow-only typography |
| quiet-saas | 640 baseline **and** spaced | 646 | Halo decoration extends six pixels past parent; pull the decorative right edge inward at 441–760px |
| tattoo-studio | 320 spaced | 369 | Truth/manifesto min-content grids plus large display headings; minmax(0,1fr) and narrow-only typography |
| woodworker | 320 spaced | 364 | Process grid intrinsic width and long heading; minimum-safe grid and narrow-only process type |

An isolated Chromium inline-CSS source reproduction reduced **all ten** failing cases to no more than 324px at the 320px tests, or 644px at the 640px tests. The dedicated workflow rerun and updated screenshots are a separate evidence milestone and must not be inferred from this local measurement.

## Boundaries

CSS-pixel viewport reflow is a useful proxy for the **available content width** at high browser zoom, but it does not exercise actual Ctrl+/Ctrl- browser zoom or browser-specific text-only zoom and should never be labelled as certification. Crops/loading with real third-party assets, page-by-page visual assessment, screen readers, physical phone accessibility, and independent stakeholder acceptance remain open. No status promotions, media rights approvals, or main-branch merge are authorized by these results.

## Screenshot-driven improvement after green reflow matrix — 22 November 2026

[Run 45093222619](https://github.com/StefanSaladino/website-templates/actions/runs/45093222619) **passed all 96/96 cases** on `f9c0c03`, with 48 screenshots and zero automated clipping flags or hard errors. Inspection of the nine previously failing template captures found one non-overflow visual issue: LINE + LEVEL's 320px enlarged-spacing hero split the single word **"renovation"** across lines as "renovatio" + "n". That was caused by the temporary `overflow-wrap:break-word` fallback in the hero copy.

The hero now retains natural whole-word line breaks, with a narrower 39px headline only at <=380px and a minimum-safe grid. A direct Chromium DOM Range test confirmed the **ten letters of "renovation" occupy one single line box**, while root content width remains 321px at a 320px viewport. The 96-case runner now hard-fails if that word splits in the 320px spacing challenge. This is a screenshot-driven polish correction and **requires a fresh green run on the newest SHA** before marking it verified remotely; it does not alter media/real-device/assistive technology rights and approval gates.

## Verified corrected reflow and visual-word-break acceptance — 22 November 2026

The newest [full reflow run 45093501655](https://github.com/StefanSaladino/website-templates/actions/runs/45093501655), source commit `c9ac85e`, passed **96/96** isolated Chromium cases at 320/640 CSS px with/without increased text spacing: **48 screenshots, zero hard errors, zero detected hard-clipped headings or targets**. The new contractor hero DOM Range regression explicitly requires all ten letters of "renovation" to appear on one visual line at 320px. The earlier 10 overflow failures were fixed in nine source templates; the intermediate visually poor mid-word break was also removed.

The same correction commit has **green GitHub Pages deployment**, **green full-template keyboard navigation**, and **green 20-pattern reduced-motion regression**. The broad showroom browser CI and independent review QA are separate workflows with results to be checked; do not treat running jobs as passes.

These are **effective CSS viewport and text-spacing simulation** checks rather than real 200%/400% browser zoom, native-device accessibility or assistive-technology acceptance. Human screenshot review of actual loaded photos, 44 mobile alternative styles (their own prior green 88-case matrix), all 62 still-unapproved external media assets, PDF accessibility, legal/brand signoff, and final stakeholder approval remain release blockers. Keep Step 18 final approval and Step 19 open; no `live` status or main merge.
