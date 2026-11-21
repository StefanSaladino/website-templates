# Boomer Automation — Pass 4 accessibility audit

_Development branch `feature/component-showroom` · 20–21 November 2026 · **implementation in review, not accessibility certification**_

## Scope: first interactive navigation pass

This pass examines the primary **component catalogue** and the **responsive review viewer**, the shared interfaces used to choose and inspect all 157 examples. These changes apply to the entire browse/review workflow without modifying unrelated component designs.

### Confirmed issues and corrections

1. **Lost keyboard focus when filtering the catalogue.** The category click handler rebuilt every category button, including the activated button. Keyboard users lost their focused target after pressing Enter or Space. Fixed by rendering category buttons once, then updating `aria-pressed` on the existing buttons while filtering results.
2. **Excessive live announcements when searching.** The entire 157-item grid had `aria-live="polite"`, so updating search could enqueue the complete regenerated card content for screen readers. Removed the live region from the grid. Added a small `role="status" aria-live="polite" aria-atomic="true"` count so updates communicate the number of matching designs without reading every card.
3. **Ambiguous phone-layout change announcements.** The responsive review viewer announced only "Showing the phone version", even when switching between the standard design and an independent phone layout. The viewer's status text and embedded preview title now include the selected Style number and name when a mobile option exists.
4. **Unnecessary keyboard stop and no explicit panning affordance.** The preview viewport was always tabbable, even when fitted at its full visible width. It is now tabbable only for `Look closer` mode where horizontal scrolling is actually required. When it needs panning, keyboard users can press Left/Right arrows or Home/End; Move left/right buttons remain available.

### Automated evidence

Added Chromium regressions to `components/scripts/browser-smoke.mjs` for: category Enter and Space focus retention, pressed-state correctness, concise live-result region, zero results, resetting all 157 examples, selected mobile-style announcement, keyboard panning, and conditional viewport tab stop.

These new tests are **pending final CI verification**. The previous production-build and responsive browser baseline passed ([CI](https://github.com/StefanSaladino/website-templates/actions/runs/44859525421), [review QA](https://github.com/StefanSaladino/website-templates/actions/runs/44859525399)) but does not prove this new pass or cover screen-reader experience.

### Static ARIA and ID integrity

The component preview source check now rejects repeated DOM IDs and invalid static `aria-labelledby`, `aria-describedby` or `aria-controls` references for every non-draft component. A local scan of the existing 157 built preview files found no duplicates, invalid ARIA references, unlabelled inputs or unnamed buttons in that snapshot; the new CI gate specifically enforces duplicate-ID and ARIA-reference integrity. This is a source-only regression guard, not an automated screen-reader certification.

### Individual-component keyboard and form pass

- **NAV-04 default and M-NAV-06 drawer:** activating an in-page menu link previously closed the menu but could leave keyboard focus inside a hidden region. On activation the target section is now given a temporary programmatic focus target (removed on blur), while the native fragment link continues to navigate. The M-NAV-06 drawer clears inert background state before focusing the destination. Escape-to-trigger and existing focus containment remain intact.
- **BOOK-02:** date error text already used a live alert, but it was not linked to the date inputs and did not expose `aria-invalid`. Both date inputs now reference the error and set validity state on failed submission; changing a date clears stale error status. This remains an unsent local planning tool, not a booking.
- **GAL-06:** native modal already handled Escape and trigger restoration. Its image-position counter now uses a small atomic polite live status to announce keyboard Next/Previous updates.
- Added keyboard-driven Chromium regressions for the two NAV-04 modes, both date-error pathways, successful recovery and gallery status semantics. This pass remains **pending the newest CI workflow results** and is not a screen-reader certification.

### Contrast and focus-visible pass (targeted)

A source/CSS audit identified the following specific issues and fixes, with tests using computed styles in Chromium rather than only colour-token comparisons:

- **BOOK-02:** the small explanatory text (`#607366`), guest hint (`#617466`), and booking disclaimer (`#6a7d6a`) against `#ecede5` each fell below WCAG's **4.5:1** text threshold (approximately **4.30:1**, **4.24:1**, and **3.75:1**). All now use `#465a4c` (approximately **6.30:1** against that background). The original warm input focus outline (`#be8151`) measured only **2.76:1** against the booking page; changed to `#7b3d25` (approximately **7.02:1**). Links inside the dark guidance section get a distinct light focus ring.
- **FORM-01:** input and textarea `:focus` previously removed the 3px outline, leaving only a thin underline to indicate keyboard focus. That override was removed and an explicit 3px `:focus-visible` outline set for the default and optional mobile form.
- **GAL-06:** focus rings now use pale `#f5d682` against the dark gallery (over **10:1**) and `#7b3d25` against the pale `M-UTIL-02` reading sheet (over **7:1**). Visible links receive the same dark-gallery focus treatment.

Added Chromium computed-style regressions at phone and desktop breakpoints, with **4.5:1** for ordinary text and **3:1** for focus indicators. These specific measured pairings do not constitute a full-colour or WCAG 2.2 AA audit of all 157 examples, and the **latest CI results remain pending**.

### Still open for accessibility release

- Audit modal focus containment, form error announcements, language changes, menu controls and accessible naming across the 157 individual examples and 44 alternatives; check real assistive technologies.
- Verify WCAG 2.2 AA colour contrast for text and controls, focus visibility, target sizing and meaningful non-text content across loaded images and all breakpoints.
- Complete reduced-motion visual acceptance for all 20 full-template animations, physical iOS/Android testing, downloadable sample-document accessibility, and manual stakeholder approval.
- Keep all examples marked `in-review`; no implied accessibility signoff or `main` merge.
